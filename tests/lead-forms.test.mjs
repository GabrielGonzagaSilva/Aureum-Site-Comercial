import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { filesUnder } from '../scripts/verify.mjs';
import { localeFromPath, transformLeadFormsHtml } from '../scripts/lead-forms.mjs';

test('all public lead forms receive the same international contact controls in five locales', async () => {
  const files = (await filesUnder('public')).filter((file) => file.endsWith('.html'));
  let pagesWithForms = 0;
  let totalForms = 0;

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const locale = localeFromPath(relative('public', file));
    const originalForms = [...source.matchAll(/<form\b[^>]*>/gi)].filter((match) => /\bclass=["'][^"']*\blead\b[^"']*["']/i.test(match[0]));
    if (!originalForms.length) continue;

    pagesWithForms += 1;
    totalForms += originalForms.length;
    const output = transformLeadFormsHtml(source, locale);
    const transformedForms = [...output.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)]
      .filter((match) => /\bclass=["'][^"']*\blead\b[^"']*["']/i.test(match[0].slice(0, match[0].indexOf('>') + 1)));

    assert.equal(transformedForms.length, originalForms.length, file + ': form count must be preserved');
    for (const [index, match] of transformedForms.entries()) {
      const form = match[0];
      const label = {
        pt: 'Telefone / WhatsApp',
        en: 'Phone / WhatsApp',
        es: 'Teléfono / WhatsApp',
        fr: 'Téléphone / WhatsApp',
        de: 'Telefon / WhatsApp',
      }[locale] || 'Telefone / WhatsApp';
      assert.match(form, /data-aureum-lead-form=["']v1["']/i, file + ': form ' + index + ' must be marked');
      assert.match(form, /<select\b[^>]*name=["']codigo_pais["']/i, file + ': country code selector missing');
      assert.match(form, /<input\b(?=[^>]*name=["']whatsapp["'])(?=[^>]*type=["']text["'])/i, file + ': phone input must accept international text');
      assert.match(form, /<input\b(?=[^>]*name=["']email["'])/i, file + ': email input missing');
      assert.doesNotMatch(form, /<input\b(?=[^>]*name=["']email["'])(?=[^>]*\brequired\b)/i, file + ': email must be optional');
      assert.ok(form.includes(label), file + ': phone label must be localized');
      assert.match(form, /contact-method-note/, file + ': at-least-one-contact guidance missing');
      assert.match(form, /name=["']website["']/, file + ': honeypot missing');
      assert.match(form, /name=["']consentimento["']|data-rule=["']consent["']/i, file + ': consent control must be preserved');
      assert.match(form, /name=["']codigo_pais["'][^>]*aria-describedby=/i, file + ': country code selector needs an accessible description');
      assert.match(form, /name=["']codigo_pais_outro["'][^>]*aria-label=/i, file + ': custom country code needs an accessible name');
      assert.match(form, /consent-error["'][^>]*role=["']alert["']/i, file + ': consent error must be announced');
    }
    assert.match(output, /href=["']\/assets\/css\/aureum-lead-form\.css["']/i);
    assert.match(output, /src=["']\/assets\/js\/aureum-lead-form\.js["']/i);
    assert.equal(transformLeadFormsHtml(output, locale), output, file + ': transformation must be idempotent');
  }

  assert.equal(pagesWithForms, 50, 'all 50 marketing pages should expose contact forms');
  assert.equal(totalForms, 500, 'the 10 existing contact forms per page must be preserved');
});

test('localized contact guidance is available in all supported languages', () => {
  const samples = {
    pt: ['E-mail (opcional)', 'Informe pelo menos um meio de contato'],
    en: ['Email (optional)', 'Provide at least one way to reach you'],
    es: ['Correo electrónico (opcional)', 'Indica al menos un medio de contacto'],
    fr: ['E-mail (facultatif)', 'Indiquez au moins un moyen de contact'],
    de: ['E-Mail (optional)', 'Geben Sie mindestens eine Kontaktmöglichkeit an'],
  };
  for (const [locale, phrases] of Object.entries(samples)) {
    const source = '<html><head></head><body><form id="lead-test" class="form lead"><div class="f"><label for="lead-email">E-mail</label><input id="lead-email" name="email" type="email" required></div><div class="f"><label for="lead-phone">WhatsApp</label><input id="lead-phone" name="whatsapp" data-rule="phone" type="tel"><span class="err">Invalid</span></div><label class="consent"><input name="consentimento" type="checkbox"></label></form></body></html>';
    const output = transformLeadFormsHtml(source, locale);
    for (const phrase of phrases) assert.ok(output.includes(phrase), locale + ': missing ' + phrase);
  }
});
