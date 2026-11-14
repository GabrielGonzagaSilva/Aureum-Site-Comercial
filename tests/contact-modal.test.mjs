import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';

test('runtime style no longer reveals both logo variants simultaneously', async () => {
  const runtime = await readFile('public/aureum-updates.js', 'utf8');
  const shared = await readFile('public/aureum-enhancements.css', 'utf8');
  assert.doesNotMatch(runtime, /#hdr \.logo-img,\.mmenu \.logo-img\{display:block!important/);
  for (const rule of [
    '#hdr .navbar .logo .logo-img--white{display:block!important}',
    '#hdr .navbar .logo .logo-img--ink{display:none!important}',
    '#hdr.solid .navbar .logo .logo-img--white{display:none!important}',
    '#hdr.solid .navbar .logo .logo-img--ink{display:block!important}',
    '#mmenu .mmenu-top .logo .logo-img--white{display:none!important}',
    '#mmenu .mmenu-top .logo .logo-img--ink{display:block!important}',
  ]) assert.ok(runtime.includes(rule), 'runtime must preserve logo visibility: ' + rule);
  assert.match(shared, /#hdr \.logo-img--ink \{ display:none!important; \}/);
  assert.match(shared, /#hdr\.solid \.logo-img--ink \{ display:block!important; \}/);
});

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
  assert.match(client, /window\.scrollTo\(position\.x, position\.y\)/);
  assert.match(client, /restorePageScroll\(\)/);
  assert.match(client, /trigger\.dataset\.subject/);
  assert.doesNotMatch(client, /cloneNode|fetch\(|form\.submit\(/);
  assert.match(css, /\.aureum-lead-dialog::backdrop/);
  assert.match(css, /backdrop-filter:\s*blur\(8px\)/);
  assert.match(css, /prefers-reduced-motion/);
});
