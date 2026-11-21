import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildLeadNotificationPayload,
  sendLeadNotification,
} from '../server/lead-notifications.mjs';

const env = {
  RESEND_API_KEY: 're_test_key',
  AUREUM_LEADS_NOTIFICATION_ENABLED: 'true',
  AUREUM_LEADS_NOTIFICATION_TO: 'contato.aureum@outlook.com',
  AUREUM_LEADS_NOTIFICATION_FROM: 'Aureum <notificacoes@mail.aureumassessoria.com.br>',
};
const requestId = 'f8c7a7d4-6b5e-4f6b-9a1c-7d4f2a8b6c10';
const lead = {
  name: 'Ana Silva',
  email: 'ana@example.com',
  phone: '+351912345678',
  destination: 'Portugal',
  objective: 'Estudos',
  message: 'Gostaria de entender as opções.',
  locale: 'pt',
  sourcePath: '/destinos/portugal/',
  consent: { accepted: true, noticeVersion: 'aureum-leads-privacy-v1' },
};

test('builds a plain-text notification for the configured Aureum inbox', () => {
  const payload = buildLeadNotificationPayload(lead, requestId, env);
  assert.equal(payload.to[0], 'contato.aureum@outlook.com');
  assert.equal(payload.from, env.AUREUM_LEADS_NOTIFICATION_FROM);
  assert.equal(payload.reply_to, 'ana@example.com');
  assert.equal(payload.subject, 'Nova solicitação de contato | Aureum');
  assert.match(payload.text, /Ana Silva/);
  assert.match(payload.text, /Portugal/);
  assert.match(payload.text, /aureum-leads-privacy-v1/);
  assert.doesNotMatch(payload.text, /<html|<script/i);
});

test('omits reply_to when the visitor only provides a phone number', () => {
  const payload = buildLeadNotificationPayload({ ...lead, email: null }, requestId, env);
  assert.equal(Object.hasOwn(payload, 'reply_to'), false);
  assert.match(payload.text, /Telefone \/ WhatsApp: \+351912345678/);
});

test('sends through Resend with a stable idempotency key', async () => {
  let captured;
  const result = await sendLeadNotification(lead, requestId, env, async (url, options) => {
    captured = { url, options, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({ id: 'resend-email-id' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  assert.deepEqual(result, { id: 'resend-email-id' });
  assert.equal(captured.url, 'https://api.resend.com/emails');
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers.Authorization, 'Bearer re_test_key');
  assert.equal(captured.options.headers['Idempotency-Key'], 'aureum-lead/' + requestId);
  assert.equal(captured.body.to[0], 'contato.aureum@outlook.com');
});

test('refuses to call Resend when notification configuration is incomplete', async () => {
  let called = false;
  await assert.rejects(
    sendLeadNotification(lead, requestId, { ...env, RESEND_API_KEY: '' }, async () => {
      called = true;
      return new Response('{}', { status: 200 });
    }),
    /not configured/i,
  );
  assert.equal(called, false);
});

test('surfaces provider failures without returning provider response content', async () => {
  await assert.rejects(
    sendLeadNotification(lead, requestId, env, async () => new Response('provider detail', { status: 401 })),
    (error) => error.status === 401 && /rejected/i.test(error.message),
  );
});
