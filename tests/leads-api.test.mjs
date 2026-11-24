import assert from 'node:assert/strict';
import test from 'node:test';
import { GET, POST, handleLeadPost } from '../api/leads.mjs';

test('lead endpoint exposes only its disabled state before privacy approval', async () => {
  const response = await GET();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    enabled: false,
    privacyNoticeVersion: null,
  });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

test('approved intake only notifies after private, expiring storage and uses the same record on retry', async () => {
  const version = 'test-notice';
  const id = 'a5d718d6-b355-426b-8ac5-25d26a0b18c7';
  const expiresAt = new Date(Date.now() + 10 * 86400000);
  const env = {
    AUREUM_LEADS_ENABLED: 'true', AUREUM_LEADS_PRIVACY_APPROVED: 'true',
    AUREUM_LEADS_PRIVACY_NOTICE_VERSION: version, AUREUM_LEADS_RETENTION_DAYS: '10',
    BLOB_READ_WRITE_TOKEN: 'test', AUREUM_LEADS_NOTIFICATION_ENABLED: 'true',
    AUREUM_LEADS_NOTIFICATION_TO: 'inbox@example.test', AUREUM_LEADS_NOTIFICATION_FROM: 'sender@example.test',
    RESEND_API_KEY: 'test',
  };
  let stored;
  const notified = [];
  const blob = {
    async put(path, record, options) {
      assert.equal(path, `leads/${id}.json`);
      assert.equal(options.access, 'private');
      assert.equal(options.ttlDays, 10);
      assert.equal(options.allowOverwrite, false);
      if (stored) throw new Error('Already stored');
      stored = record;
      return { expiresAt };
    },
    async head() { return { expiresAt }; },
    async get(path, options) {
      assert.equal(path, `leads/${id}.json`);
      assert.equal(options.access, 'private');
      return { statusCode: 200, stream: new Response(stored).body };
    },
  };
  const options = {
    env, approvedNoticeVersion: version, blob, allowRequest: () => true,
    async notify(lead, requestId) {
      assert.ok(stored, 'notification must follow storage');
      notified.push({ email: lead.email, requestId });
    },
  };
  function request(email = 'visitor@example.test') {
    const body = { submissionId: id, name: 'Synthetic Visitor', email, consent: true, privacyNoticeVersion: version, elapsedMs: 2800 };
    return new Request('https://aureum.test/api/leads', {
      method: 'POST', headers: { origin: 'https://aureum.test', 'content-type': 'application/json' }, body: JSON.stringify(body),
    });
  }
  assert.equal((await handleLeadPost(request(), options)).status, 201);
  const retry = await handleLeadPost(request(), options);
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).duplicate, true);
  assert.equal((await handleLeadPost(request('updated@example.test'), options)).status, 409);
  assert.deepEqual(notified, Array(2).fill({ email: 'visitor@example.test', requestId: id }));
});

test('lead POST rejects before consuming personal data while intake is disabled', async () => {
  const request = {
    url: 'https://aureumassessoria.com.br/api/leads',
    headers: new Headers(),
    text() {
      throw new Error('Request body must not be read while intake is disabled.');
    },
  };
  const response = await POST(request);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.match((await response.json()).error, /não está habilitado/i);
});
