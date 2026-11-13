import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../public/aureum-enhancements.css', import.meta.url), 'utf8');
const sprint = css.slice(css.lastIndexOf('/* Sprint 2 — buttons, cards and component states. */'));

test('action buttons use a full pill radius, including the solid header CTA', () => {
  assert.match(sprint, /\.site-hdr\.solid \.btn-hdr/);
  assert.match(sprint, /\.ae-section a\.ae-button/);
  assert.match(sprint, /\.aureum-refined \.primary-button/);
  assert.match(sprint, /border-radius:9999px!important/);
  assert.match(sprint, /\.site-hdr\.solid \.menu-btn[\s\S]*?border-radius:50%!important/);
});

test('destination card titles stay white over photographs in both card systems', () => {
  assert.match(sprint, /\.dc \.dc__title,\s*\.dcard \.dcard-body h3\s*\{\s*color:#fff!important;/);
});

test('pressed feedback is subtle and disabled when reduced motion is requested', () => {
  assert.match(sprint, /:active:not\(:disabled\)/);
  assert.match(sprint, /transform:translateY\(1px\)/);
  assert.match(sprint, /@media \(prefers-reduced-motion:reduce\)/);
  assert.match(sprint, /transform:none!important/);
});
