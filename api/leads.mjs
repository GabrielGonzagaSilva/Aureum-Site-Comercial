import { randomUUID } from 'node:crypto';
import { del, get, head, put } from '@vercel/blob';
import {
  createRateLimiter,
  getLeadIntakeConfig,
  LeadValidationError,
  normalizeLeadPayload,
} from '../server/leads-core.mjs';
import { sendLeadNotification } from '../server/lead-notifications.mjs';

// Intentionally closed until the approved consent copy and privacy notice are versioned.
// Do not set the Vercel feature flags while this value is empty.
const APPROVED_PRIVACY_NOTICE_VERSION = '2026-11-25-v1';
const MAX_PAYLOAD_BYTES = 12000;
const rateLimit = createRateLimiter();
const storage = { del, get, head, put };
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

export async function handleLeadPost(request, {
  env = process.env,
  approvedNoticeVersion = APPROVED_PRIVACY_NOTICE_VERSION,
  blob = storage,
  notify = sendLeadNotification,
  allowRequest = rateLimit,
} = {}) {
  const config = getLeadIntakeConfig(env, approvedNoticeVersion);
  if (!config.enabled) {
    return json({ error: 'O recebimento online ainda não está habilitado.' }, 503);
  }
  if (!isSameOrigin(request)) return json({ error: 'Origem da solicitação não permitida.' }, 403);

  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return json({ error: 'Formato de solicitação inválido.' }, 415);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_PAYLOAD_BYTES) return json({ error: 'A solicitação excede o tamanho permitido.' }, 413);

  const clientIp = request.headers.get('x-real-ip') ||
    (request.headers.get('x-forwarded-for') || '').split(',').map((part) => part.trim()).filter(Boolean).at(-1) ||
    'unknown';
  if (!allowRequest(clientIp)) return json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, 429);

  let body;
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of request.body || []) {
      size += chunk.byteLength;
      if (size > MAX_PAYLOAD_BYTES) return json({ error: 'A solicitação excede o tamanho permitido.' }, 413);
      chunks.push(chunk);
    }
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
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
  const pathname = `leads/${requestId}.json`;
  const record = {
    schemaVersion: 1,
    requestId,
    receivedAt: new Date().toISOString(),
    ...lead,
  };

  let stored = true;
  try {
    const result = await blob.put(
      pathname,
      JSON.stringify(record),
      {
        access: 'private',
        contentType: 'application/json',
        allowOverwrite: false,
        addRandomSuffix: false,
        ttlDays: config.retentionDays,
      },
    );
    if (!Number.isFinite(result.expiresAt?.getTime()) || result.expiresAt <= new Date()) {
      // This record was just created and has not been accepted or notified.
      await blob.del(result.url);
      throw new Error('The private record did not receive an expiration date.');
    }
  } catch (error) {
    // A retry can follow a successful write whose response was lost. Only use an
    // existing private record when it has the same data and a valid expiration.
    try {
      const metadata = await blob.head(pathname);
      const existing = metadata.expiresAt > new Date()
        ? await blob.get(pathname, { access: 'private', useCache: false })
        : null;
      if (existing?.statusCode === 200) {
        const { schemaVersion, requestId: existingId, receivedAt, ...previousLead } = await new Response(existing.stream).json();
        if (schemaVersion !== record.schemaVersion || existingId !== requestId || JSON.stringify(previousLead) !== JSON.stringify(lead)) {
          return json({ error: 'Os dados mudaram. Inicie uma nova solicitação.' }, 409);
        }
        stored = false;
      }
    } catch (lookupError) {
      console.error('Aureum lead retry lookup failed:', lookupError?.name || 'unknown');
    }
    if (stored) {
      console.error('Aureum lead storage failed:', error?.name || 'unknown');
      return json({ error: 'Não foi possível registrar a solicitação com segurança. Tente novamente.' }, 503);
    }
  }

  try {
    await notify(lead, requestId, env);
  } catch (error) {
    console.error('Aureum lead notification failed:', Number(error?.status) || error?.name || 'unknown');
    return json({
      error: 'Sua solicitação foi registrada, mas a equipe ainda não foi notificada. Tente novamente em alguns minutos.',
      code: 'notification_failed',
    }, 503);
  }

  return json({ ok: true, requestId, duplicate: !stored }, stored ? 201 : 200);
}

export function POST(request) {
  return handleLeadPost(request);
}
