import { randomUUID } from 'node:crypto';
import { put } from '@vercel/blob';
import {
  createRateLimiter,
  getLeadIntakeConfig,
  LeadValidationError,
  normalizeLeadPayload,
} from '../server/leads-core.mjs';

// Intentionally closed until the approved consent copy and privacy notice are versioned.
// Do not set the Vercel feature flags while this value is empty.
const APPROVED_PRIVACY_NOTICE_VERSION = '';
const rateLimit = createRateLimiter();
const RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

function json(body, status = 200) {
  return Response.json(body, { status, headers: RESPONSE_HEADERS });
}

function isSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function GET() {
  const config = getLeadIntakeConfig(process.env, APPROVED_PRIVACY_NOTICE_VERSION);
  return json({
    enabled: config.enabled,
    privacyNoticeVersion: config.privacyNoticeVersion,
  });
}

export async function POST(request) {
  const config = getLeadIntakeConfig(process.env, APPROVED_PRIVACY_NOTICE_VERSION);
  if (!config.enabled) {
    return json({ error: 'O recebimento online ainda não está habilitado.' }, 503);
  }
  if (!isSameOrigin(request)) return json({ error: 'Origem da solicitação não permitida.' }, 403);

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return json({ error: 'Formato de solicitação inválido.' }, 415);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 12000) return json({ error: 'A solicitação excede o tamanho permitido.' }, 413);

  const clientIp = request.headers.get('x-real-ip') ||
    (request.headers.get('x-forwarded-for') || '').split(',').map((part) => part.trim()).filter(Boolean).at(-1) ||
    'unknown';
  if (!rateLimit(clientIp)) return json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, 429);

  let raw;
  try {
    raw = await request.text();
  } catch {
    return json({ error: 'Não foi possível ler a solicitação.' }, 400);
  }
  if (Buffer.byteLength(raw, 'utf8') > 12000) return json({ error: 'A solicitação excede o tamanho permitido.' }, 413);

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'Confira os dados enviados.' }, 400);
  }

  if (typeof body?.website === 'string' && body.website.trim()) {
    return json({ error: 'Solicitação inválida.' }, 400);
  }
  if (!Number.isFinite(Number(body?.elapsedMs)) || Number(body.elapsedMs) < 2500) {
    return json({ error: 'Aguarde um instante e tente novamente.' }, 422);
  }

  let lead;
  try {
    lead = normalizeLeadPayload(body, config.privacyNoticeVersion);
  } catch (error) {
    if (error instanceof LeadValidationError) {
      return json({ error: error.message, field: error.field }, 422);
    }
    return json({ error: 'Confira os dados do formulário.' }, 400);
  }

  const requestId = lead.submissionId || randomUUID();
  const receivedAt = new Date();
  const datePath = receivedAt.toISOString().slice(0, 10);
  const record = {
    schemaVersion: 1,
    requestId,
    receivedAt: receivedAt.toISOString(),
    ...lead,
  };

  try {
    await put(
      'leads/' + datePath + '/' + requestId + '.json',
      JSON.stringify(record),
      {
        access: 'private',
        contentType: 'application/json',
        allowOverwrite: false,
        addRandomSuffix: false,
        ttlDays: config.retentionDays,
      },
    );
  } catch (error) {
    const status = Number(error?.statusCode || error?.status || 0);
    if (status === 409) return json({ ok: true, duplicate: true, requestId }, 200);
    console.error('Aureum lead storage failed:', error?.name || 'unknown');
    return json({ error: 'Não foi possível registrar a solicitação com segurança. Tente novamente.' }, 503);
  }

  return json({ ok: true, requestId }, 201);
}
