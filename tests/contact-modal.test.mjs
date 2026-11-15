import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';

test('modal preserves the existing form and the privacy gate instead of cloning or submitting data', async () => {
  const client = await readFile('public/assets/js/aureum-contact-modal.js', 'utf8');
  const css = await readFile('public/assets/css/aureum-contact-modal.css', 'utf8');
  new Script(client);
  assert.match(client, /document\.getElementById\('lead-main'\)/);
  assert.match(client, /container\.appendChild\(card\)/);
  assert.match(client, /marker\.parentNode\.replaceChild\(card, marker\)/);
  assert.match(client, /modal\.showModal\(\)/);
  assert.match(client, /modal\.addEventListener\('close'/);
  assert.match(client, /url\.hash !== '#contato'/);
  assert.match(client, /document\.addEventListener\('click',[\s\S]*?\}, true\);/);
  assert.match(client, /if \(openFrom\(link\)\) \{\s*event\.preventDefault\(\);/);
  assert.match(client, /document\.body\.style\.position = 'fixed'/);
  assert.match(client, /document\.body\.style\.top = \(-lockedScroll\.y\) \+ 'px'/);
  assert.match(client, /behavior: 'instant'/);
  assert.match(client, /restorePageScroll\(\)/);
  assert.match(client, /trigger\.dataset\.subject/);
  assert.doesNotMatch(client, /cloneNode|fetch\(|form\.submit\(/);
  assert.match(css, /\.aureum-lead-dialog::backdrop/);
  assert.match(css, /backdrop-filter:\s*blur\(4px\)/);
  assert.match(css, /prefers-reduced-motion/);
});
