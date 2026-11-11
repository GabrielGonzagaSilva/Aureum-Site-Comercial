import test from 'node:test';
import assert from 'node:assert/strict';
import { GET, POST } from '../server/chat-core.mjs';

test('Mia reports missing configuration without leaking secrets', async () => {
  const previous = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    const response = GET();
    assert.equal(response.status, 503);
    assert.equal((await response.json()).status, 'unconfigured');
  } finally { if (previous !== undefined) process.env.GEMINI_API_KEY = previous; }
});

test('Mia rejects a different origin before calling the provider', async () => {
  process.env.GEMINI_API_KEY = 'local-test-value';
  const response = await POST(new Request('https://aureum.test/api/chat', { method: 'POST', headers: { host: 'aureum.test', origin: 'https://other.test', 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{role:'user',content:'teste'}] }) }));
  assert.equal(response.status, 403);
  delete process.env.GEMINI_API_KEY;
});

test('Mia rejects an empty conversation before calling the provider', async () => {
  process.env.GEMINI_API_KEY = 'local-test-value';
  const response = await POST(new Request('https://aureum.test/api/chat', { method: 'POST', headers: { host: 'aureum.test', 'content-type': 'application/json' }, body: JSON.stringify({messages:[]}) }));
  assert.equal(response.status, 400);
  delete process.env.GEMINI_API_KEY;
});

test('Mia keeps a localized conversation in the current page language', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'local-test-value';
  let sent;
  globalThis.fetch = async (_url, options) => {
    sent = JSON.parse(options.body);
    return Response.json({candidates:[{content:{parts:[{text:'You can contact the Aureum team using the website form.'}]}}]});
  };
  try {
    const response = await POST(new Request('https://aureum.test/api/chat', {method:'POST', headers:{host:'aureum.test',origin:'https://aureum.test',referer:'https://aureum.test/en/','content-type':'application/json'}, body:JSON.stringify({messages:[{role:'user',content:'How can I contact Aureum?'}]})}));
    assert.equal(response.status, 200);
    assert.match(sent.systemInstruction.parts[0].text, /Idioma desta página: inglês/);
    assert.match((await response.json()).reply, /Aureum team/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

