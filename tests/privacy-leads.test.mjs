import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const pages = [
  ['public/privacidade-atendimento.html', 'pt-BR'],
  ['public/en/contact-privacy.html', 'en'],
  ['public/es/privacidad-contacto.html', 'es'],
  ['public/fr/confidentialite-contact.html', 'fr'],
  ['public/de/datenschutzhinweis-kontakt.html', 'de'],
];

test('all five lead privacy notices remain clearly marked as unapproved drafts', async () => {
  for (const [path, locale] of pages) {
    const html = await readFile(path, 'utf8');
    assert.match(html, /name="robots" content="noindex,nofollow"/i, path + ': draft must not be indexed');
    assert.match(html, /class="draft-banner"/i, path + ': draft warning must be visible');
    assert.match(html, /\[[^\]]*(?:CNPJ|TAX ID|IDENTIFICACIÓN FISCAL|IDENTIFIANT FISCAL|STEUERLICHE IDENTIFIKATIONSNUMMER)[^\]]*\]/i, path + ': controller identity placeholder must remain visible');
    assert.match(html, /\[[^\]]*(?:DIAS|DÍAS|DAYS|JOURS|TAGEN)[^\]]*\]/i, path + ': retention placeholder must remain visible');
    assert.match(html, /contato\.aureum@outlook\.com/i, path + ': privacy contact must be present');
    assert.match(html, /Vercel Blob/i, path + ': private storage provider must be disclosed');
    assert.match(html, /Resend/i, path + ': email notification provider must be disclosed');
    assert.ok(html.includes('lang="' + locale + '"'), path + ': document language must match route');
  }
});
