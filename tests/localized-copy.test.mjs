import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { filesUnder } from '../scripts/verify.mjs';
import {
  localeFromPath,
  transformLocalizedHtml,
  localizedCopyReplacements,
  localizedIntentSources,
  localizedIntentTranslations,
} from '../scripts/localized-copy.mjs';

const allFiles = await filesUnder('public');
const htmlFiles = allFiles.filter((file) => file.endsWith('.html'));
const localizedPages = [];

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  if (/\sid=["']hdr["']/i.test(html)) localizedPages.push(file);
}

test('localized copy covers all 50 public pages in five locales', async () => {
  assert.equal(htmlFiles.length, 51);
  assert.equal(localizedPages.length, 50);

  for (const file of localizedPages) {
    const relativePath = relative('public', file).replace(/\\/g, '/');
    const locale = localeFromPath(relativePath);
    const original = await readFile(file, 'utf8');
    const localized = transformLocalizedHtml(original, locale);

    assert.equal([...localized.matchAll(/\bdata-intent=(["']).*?\1/g)].length, 48, file + ': intent count must be preserved');

    for (const [source, replacement] of localizedCopyReplacements[locale]) {
      if (source === replacement) continue;
      assert.ok(!localized.includes(source), file + ': unresolved copy: ' + source);
      assert.ok(localized.includes(replacement), file + ': missing corrected copy: ' + replacement);
    }

    if (locale !== 'pt') {
      const values = [...localized.matchAll(/\bdata-intent=(["'])(.*?)\1/g)].map((match) => match[2]);
      const translatedValues = new Set(Object.values(localizedIntentTranslations[locale]));
      assert.ok(values.every((value) => translatedValues.has(value)), file + ': every intent must be localized');
      assert.ok(values.every((value) => !localizedIntentSources.includes(value)), file + ': Portuguese intent leaked into localized page');
    }
  }
});

test('Portuguese editorial title and contact copy are corrected without changing form behaviour', async () => {
  const source = await readFile('public/index.html', 'utf8');
  const output = transformLocalizedHtml(source, 'pt');
  assert.ok(output.includes('Destinos, projetos e contextos diferentes.'));
  assert.ok(!output.includes('Destinos. Projetos e contextos diferentes.'));
  assert.ok(output.includes('Fale com a nossa equipe.'));
  assert.equal([...output.matchAll(/\bdata-intent=(["']).*?\1/g)].length, 48);
});

test('all non-Portuguese intent labels have complete, one-to-one translations', () => {
  assert.equal(localizedIntentSources.length, 32);
  for (const locale of ['en', 'es', 'fr', 'de']) {
    assert.equal(Object.keys(localizedIntentTranslations[locale]).length, 32);
    assert.equal(new Set(Object.values(localizedIntentTranslations[locale])).size, 32, locale + ': intent translations must be unique');
  }
});

test('localized home pages use the corrected language-specific editorial and accessibility labels', async () => {
  const expected = {
    en: ['Residence, work, studies and family.', 'How we can support you in Portugal', 'aria-label="Legal"', 'You are here'],
    es: ['Residencia, trabajo, estudios y familia.', 'Cómo podemos acompañarte en Portugal', 'aria-label="Aviso legal"', 'Estás aquí'],
    fr: ['Résidence, travail, études et famille.', 'Comment Aureum peut vous accompagner au Portugal', 'aria-label="Mentions légales"', 'Vous êtes ici'],
    de: ['Aufenthalt, Arbeit, Studium und Familie.', 'Wie Aureum Sie in Portugal unterstützen kann', 'aria-label="Rechtliche Hinweise"', 'Sie sind hier'],
  };
  for (const [locale, phrases] of Object.entries(expected)) {
    const path = locale === 'en' ? 'public/en/index.html' : 'public/' + locale + '/index.html';
    const source = await readFile(path, 'utf8');
    const output = transformLocalizedHtml(source, locale);
    for (const phrase of phrases) assert.ok(output.includes(phrase), locale + ': missing ' + phrase);
  }
});
