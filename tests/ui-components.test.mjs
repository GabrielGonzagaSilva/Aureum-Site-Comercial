import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../public/aureum-enhancements.css', import.meta.url), 'utf8');
const sprint2Start = css.lastIndexOf('/* Sprint 2 — buttons, cards and component states. */');
const sprint3Start = css.lastIndexOf('/* Sprint 3 — responsive editorial hierarchy and spacing. */');
const sprint = css.slice(sprint2Start, sprint3Start > sprint2Start ? sprint3Start : undefined);
const sprint3 = css.slice(sprint3Start);

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


test('editorial section headers stack descriptions below titles and release fixed heights', () => {
  assert.match(sprint3, /grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(sprint3, /row-gap:var\(--aureum-editorial-header-gap\)!important/);
  assert.match(sprint3, /height:auto!important;\s*min-height:0!important/);
  assert.match(sprint3, /\.aureum-refined \.page-title \{[^}]*height:auto!important;[^}]*min-height:0!important;/);
  assert.match(sprint3, /@media \(max-width:1023px\)[\s\S]*?\.aureum-refined \.page-title br \{\s*display:none;/);
});

test('five localized homepages keep all editorial descriptions below their headings', async () => {
  const locales = [
    ['PT', '../public/index.html'],
    ['EN', '../public/en/index.html'],
    ['ES', '../public/es/index.html'],
    ['FR', '../public/fr/index.html'],
    ['DE', '../public/de/index.html'],
  ];
  for (const [locale, path] of locales) {
    const html = await readFile(new URL(path, import.meta.url), 'utf8');
    const headers = [...html.matchAll(/<header\b(?=[^>]*class=["'][^"']*\bpage-header\b[^"']*["'])[^>]*>([\s\S]*?)<\/header>/gi)];
    assert.equal(headers.length, 5, locale + ' should contain five editorial section headers');
    for (const [, block] of headers) {
      assert.match(block, /<div\b(?=[^>]*class=["'][^"']*\bheading-group\b[^"']*["'])[^>]*>[\s\S]*?<\/div>\s*<p\b(?=[^>]*class=["'][^"']*\bpage-intro\b[^"']*["'])/i, locale + ' description should follow its heading');
    }
    const intros = [...html.matchAll(/<p\b(?=[^>]*class=["'][^"']*\bpage-intro\b[^"']*["'])[^>]*>([\s\S]*?)<\/p>/gi)];
    assert.equal(intros.length, 5, locale + ' should contain five editorial descriptions');
    assert.ok(intros.every(([, value]) => !/<br\s*\/?>/i.test(value)), locale + ' descriptions should not contain forced line breaks');
  }
});

test('Destinos description remains continuous and uses a readable responsive measure', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const section = html.match(/<section\b(?=[^>]*\bid=["']destinos["'])[^>]*>([\s\S]*?)<\/section>/i)?.[1] ?? '';
  const lead = section.match(/<p\b(?=[^>]*class=["'][^"']*\blead\b[^"']*["'])[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? '';
  assert.ok(lead.length > 0, 'Destinos section should keep its explanatory paragraph');
  assert.doesNotMatch(lead, /<br\s*\/?>/i);
  assert.match(sprint3, /#home #destinos \.sec-head \.lead \{[\s\S]*?max-width:min\(100%,74ch\)!important;/);
  assert.match(sprint3, /text-wrap:pretty/);
});

test('editorial spacing uses fluid desktop, tablet and mobile values', () => {
  assert.match(sprint3, /--aureum-editorial-header-gap:clamp/);
  assert.match(sprint3, /--aureum-editorial-section-gap:clamp/);
  assert.match(sprint3, /padding-block:clamp\(36px,7vw,48px\)!important/);
  assert.match(sprint3, /padding-inline:clamp\(20px,5\.5vw,28px\)!important/);
  assert.match(sprint3, /gap:var\(--aureum-editorial-section-gap\)!important/);
});
