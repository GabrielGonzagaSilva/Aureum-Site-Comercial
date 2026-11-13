import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptNavigationMarkup } from '../scripts/shared-header.mjs';

const template = [
  '<header class="site-hdr" id="hdr">',
  '<a aria-label="Aureum" class="logo" href="#top">Logo</a>',
  '<nav class="nav"><a href="#servicos">Services</a><a href="#sobre">About</a><a href="#como-funciona">How</a><a href="#contato">Contact</a></nav>',
  '<nav class="aureum-locale__panel"><a href="/">PT</a><a href="/en/">EN</a><a href="/es/">ES</a><a href="/fr/">FR</a><a href="/de/">DE</a></nav>',
  '</header>',
  '<div class="mmenu" id="mmenu">',
  '<a class="logo" href="#top">Logo</a>',
  '<nav class="aureum-locale__panel"><a href="/">PT</a><a href="/en/">EN</a><a href="/es/">ES</a><a href="/fr/">FR</a><a href="/de/">DE</a></nav>',
  '<a href="#contato">Contact</a>',
  '</div>',
].join('\n');

test('homepage navigation keeps local section anchors unchanged', () => {
  assert.equal(adaptNavigationMarkup(template, 'pt', null), template);
});

test('destination navigation keeps the locale home and the same destination across languages', () => {
  const output = adaptNavigationMarkup(template, 'en', 'destinos/portugal/');
  assert.match(output, /class="logo" href="\/en\/"/);
  assert.match(output, /href="\/en\/#servicos"/);
  assert.match(output, /href="\/en\/#sobre"/);
  assert.match(output, /href="\/en\/#como-funciona"/);
  assert.match(output, /href="\/en\/#contato"/);
  assert.match(output, /href="\/destinos\/portugal\/"/);
  assert.match(output, /href="\/en\/destinos\/portugal\/"/);
  assert.match(output, /href="\/es\/destinos\/portugal\/"/);
  assert.match(output, /href="\/fr\/destinos\/portugal\/"/);
  assert.match(output, /href="\/de\/destinos\/portugal\/"/);
});

test('destination navigation rejects paths outside the public destination routes', () => {
  assert.throws(
    () => adaptNavigationMarkup(template, 'en', '../private/'),
    /Invalid destination route/
  );
});
