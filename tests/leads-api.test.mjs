import assert from 'node:assert/strict';
import test from 'node:test';
import { GET, POST } from '../api/leads.mjs';

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
