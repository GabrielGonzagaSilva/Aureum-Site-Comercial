const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getEmailAddress(value) {
  if (typeof value !== 'string') return '';
  const candidate = value.trim();
  const match = candidate.match(/<([^<>]+)>/);
  return (match ? match[1] : candidate).trim();
}

export function buildLeadNotificationPayload(lead, requestId, env = process.env) {
  const apiKey = typeof env.RESEND_API_KEY === 'string' ? env.RESEND_API_KEY.trim() : '';
  const recipient = typeof env.AUREUM_LEADS_NOTIFICATION_TO === 'string'
    ? env.AUREUM_LEADS_NOTIFICATION_TO.trim()
    : '';
  const sender = typeof env.AUREUM_LEADS_NOTIFICATION_FROM === 'string'
    ? env.AUREUM_LEADS_NOTIFICATION_FROM.trim()
    : '';
  const senderAddress = getEmailAddress(sender);

  if (
    env.AUREUM_LEADS_NOTIFICATION_ENABLED !== 'true' ||
    !apiKey ||
    !EMAIL_PATTERN.test(recipient) ||
    !EMAIL_PATTERN.test(senderAddress)
  ) {
    throw new Error('Aureum lead email notifications are not configured.');
  }

  const replyTo = typeof lead.email === 'string' && EMAIL_PATTERN.test(lead.email)
    ? lead.email
    : '';
  const lines = [
    'Nova solicitação recebida pelo site da Aureum',
    '',
    `Nome: ${lead.name || 'Não informado'}`,
    `E-mail: ${lead.email || 'Não informado'}`,
    `Telefone / WhatsApp: ${lead.phone || 'Não informado'}`,
    `Destino: ${lead.destination || 'Não informado'}`,
    `Objetivo: ${lead.objective || 'Não informado'}`,
    '',
    'Mensagem:',
    lead.message || 'Não informada',
    '',
    `Idioma: ${lead.locale || 'pt'}`,
    `Página de origem: ${lead.sourcePath || 'Não informada'}`,
    `Consentimento: confirmado (versão ${lead.consent?.noticeVersion || 'não informada'})`,
    `ID da solicitação: ${requestId}`,
  ];

  return {
    from: sender,
    to: [recipient],
    subject: 'Nova solicitação de contato | Aureum',
    ...(replyTo ? { reply_to: replyTo } : {}),
    text: lines.join('\n'),
  };
}

export async function sendLeadNotification(lead, requestId, env = process.env, fetchImpl = globalThis.fetch) {
  const payload = buildLeadNotificationPayload(lead, requestId, env);
  if (typeof fetchImpl !== 'function') {
    throw new Error('Fetch is not available for the email provider request.');
  }

  const response = await fetchImpl(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY.trim()}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `aureum-lead/${requestId}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || typeof result?.id !== 'string') {
    const error = new Error('Resend rejected the Aureum lead notification.');
    error.status = Number(response.status) || 0;
    throw error;
  }

  return { id: result.id };
}
