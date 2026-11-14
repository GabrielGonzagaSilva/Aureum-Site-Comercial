const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const E164_PATTERN = /^\+[1-9]\d{6,14}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class LeadValidationError extends Error {
  constructor(message, field = 'form') {
    super(message);
    this.name = 'LeadValidationError';
    this.field = field;
  }
}

function cleanText(value, maxLength, multiline = false) {
  if (typeof value !== 'string') return '';
  let text = value.normalize('NFKC').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ');
  if (multiline) text = text.replace(/\r\n?/g, '\n').replace(/[\t ]+/g, ' ');
  else text = text.replace(/[\r\n\t ]+/g, ' ');
  return text.trim().slice(0, maxLength);
}

export function getLeadIntakeConfig(env = process.env, approvedPrivacyNoticeVersion = '') {
  const retentionDays = Number(env.AUREUM_LEADS_RETENTION_DAYS);
  const retentionConfigured = Number.isInteger(retentionDays) && retentionDays >= 1 && retentionDays <= 730;
  const enabled = Boolean(
    approvedPrivacyNoticeVersion &&
    env.AUREUM_LEADS_ENABLED === 'true' &&
    env.AUREUM_LEADS_PRIVACY_APPROVED === 'true' &&
    env.AUREUM_LEADS_PRIVACY_NOTICE_VERSION === approvedPrivacyNoticeVersion &&
    retentionConfigured &&
    env.BLOB_READ_WRITE_TOKEN
  );
  return {
    enabled,
    retentionDays: retentionConfigured ? retentionDays : null,
    privacyNoticeVersion: enabled ? approvedPrivacyNoticeVersion : null,
  };
}

export function normalizeLeadPayload(body, expectedPrivacyNoticeVersion) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new LeadValidationError('Confira os dados do formulário.');
  }

  const name = cleanText(body.name, 100);
  const email = cleanText(body.email, 254).toLowerCase();
  const phone = cleanText(body.phone, 16);
  const destination = cleanText(body.destination, 80);
  const objective = cleanText(body.objective, 120);
  const message = cleanText(body.message, 2000, true);
  const locale = ['pt', 'en', 'es', 'fr', 'de'].includes(body.locale) ? body.locale : 'pt';
  const sourcePath = cleanText(body.sourcePath, 160);
  const submissionId = UUID_PATTERN.test(String(body.submissionId || '')) ? String(body.submissionId) : '';

  if (name.length < 2) throw new LeadValidationError('Informe seu nome.', 'name');
  if (!email && !phone) throw new LeadValidationError('Informe pelo menos um meio de contato.', 'contact');
  if (email && !EMAIL_PATTERN.test(email)) throw new LeadValidationError('Confira o e-mail informado.', 'email');
  if (phone && !E164_PATTERN.test(phone)) throw new LeadValidationError('Confira o telefone e o código do país.', 'phone');
  if (body.consent !== true) throw new LeadValidationError('É necessário confirmar a autorização de contato.', 'consent');
  if (!expectedPrivacyNoticeVersion || body.privacyNoticeVersion !== expectedPrivacyNoticeVersion) {
    throw new LeadValidationError('A versão do aviso de privacidade precisa ser confirmada.', 'privacy');
  }

  return {
    submissionId,
    name,
    email: email || null,
    phone: phone || null,
    destination: destination || null,
    objective: objective || null,
    message: message || null,
    locale,
    sourcePath: sourcePath.startsWith('/') && !sourcePath.startsWith('//') ? sourcePath : null,
    consent: { accepted: true, noticeVersion: expectedPrivacyNoticeVersion },
  };
}

export function createRateLimiter(limit = 5, windowMs = 15 * 60 * 1000, now = () => Date.now()) {
  const buckets = new Map();
  return function isAllowed(key) {
    const current = now();
    const recent = (buckets.get(key) || []).filter((timestamp) => current - timestamp < windowMs);
    if (recent.length >= limit) {
      buckets.set(key, recent);
      return false;
    }
    recent.push(current);
    buckets.set(key, recent);
    if (buckets.size > 2000) {
      for (const [bucket, timestamps] of buckets) {
        if (!timestamps.some((timestamp) => current - timestamp < windowMs)) buckets.delete(bucket);
      }
    }
    return true;
  };
}
