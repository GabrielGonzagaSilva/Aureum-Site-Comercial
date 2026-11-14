import { readFile, writeFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { filesUnder } from './verify.mjs';

const DIAL_CODES = [
  ['+55', '🇧🇷 +55'], ['+351', '🇵🇹 +351'], ['+34', '🇪🇸 +34'], ['+44', '🇬🇧 +44'],
  ['+61', '🇦🇺 +61'], ['+49', '🇩🇪 +49'], ['+1', '🇺🇸 / 🇨🇦 +1'], ['+33', '🇫🇷 +33'],
  ['+353', '🇮🇪 +353'], ['+39', '🇮🇹 +39'], ['+31', '🇳🇱 +31'], ['+32', '🇧🇪 +32'],
  ['+41', '🇨🇭 +41'], ['+43', '🇦🇹 +43'], ['+46', '🇸🇪 +46'], ['+47', '🇳🇴 +47'],
  ['+45', '🇩🇰 +45'], ['+48', '🇵🇱 +48'], ['+52', '🇲🇽 +52'], ['+54', '🇦🇷 +54'],
  ['+56', '🇨🇱 +56'], ['+57', '🇨🇴 +57'], ['+51', '🇵🇪 +51'], ['+64', '🇳🇿 +64'],
  ['+91', '🇮🇳 +91'], ['+81', '🇯🇵 +81'], ['+82', '🇰🇷 +82'], ['+86', '🇨🇳 +86'],
  ['+971', '🇦🇪 +971'], ['+27', '🇿🇦 +27'], ['+20', '🇪🇬 +20'], ['+90', '🇹🇷 +90'],
  ['+7', '🇷🇺 / 🇰🇿 +7'], ['+65', '🇸🇬 +65'], ['+66', '🇹🇭 +66'], ['+62', '🇮🇩 +62'],
  ['+63', '🇵🇭 +63'], ['+60', '🇲🇾 +60'], ['+972', '🇮🇱 +972'], ['+212', '🇲🇦 +212'],
  ['+234', '🇳🇬 +234'], ['+254', '🇰🇪 +254'], ['+593', '🇪🇨 +593'], ['+598', '🇺🇾 +598'],
  ['+506', '🇨🇷 +506'], ['+507', '🇵🇦 +507'], ['+502', '🇬🇹 +502'], ['+380', '🇺🇦 +380'],
];

const COPY = {
  pt: {
    emailLabel: 'E-mail (opcional)', phoneLabel: 'Telefone / WhatsApp', codeLabel: 'Código do país',
    codePlaceholder: 'País + código', otherCode: 'Outro código…', otherPlaceholder: '+999',
    phonePlaceholder: 'DDD + número', phoneHint: 'Inclua DDD/código de área e número, sem o código do país.',
    phoneError: 'Confira o código do país, o DDD/código de área e o número.',
    contactNote: 'Informe pelo menos um meio de contato: e-mail ou telefone/WhatsApp.',
    contactError: 'Informe um e-mail válido ou um telefone com código do país.',
    honeypotLabel: 'Deixe este campo vazio', consentError: 'Marque a autorização para continuar.',
  },
  en: {
    emailLabel: 'Email (optional)', phoneLabel: 'Phone / WhatsApp', codeLabel: 'Country calling code',
    codePlaceholder: 'Country code', otherCode: 'Other code…', otherPlaceholder: '+999',
    phonePlaceholder: 'Area code + number', phoneHint: 'Include the area code and number, without the country calling code.',
    phoneError: 'Check the country code, area code and phone number.',
    contactNote: 'Provide at least one way to reach you: email or phone/WhatsApp.',
    contactError: 'Enter a valid email address or a phone number with its country code.',
    honeypotLabel: 'Leave this field empty', consentError: 'Please confirm your consent to continue.',
  },
  es: {
    emailLabel: 'Correo electrónico (opcional)', phoneLabel: 'Teléfono / WhatsApp', codeLabel: 'Código de país',
    codePlaceholder: 'País + código', otherCode: 'Otro código…', otherPlaceholder: '+999',
    phonePlaceholder: 'Prefijo de área + número', phoneHint: 'Incluye el prefijo de área y el número, sin el código del país.',
    phoneError: 'Comprueba el código del país, el prefijo de área y el número.',
    contactNote: 'Indica al menos un medio de contacto: correo electrónico o teléfono/WhatsApp.',
    contactError: 'Introduce un correo válido o un teléfono con el código del país.',
    honeypotLabel: 'Deja este campo vacío', consentError: 'Confirma la autorización para continuar.',
  },
  fr: {
    emailLabel: 'E-mail (facultatif)', phoneLabel: 'Téléphone / WhatsApp', codeLabel: 'Indicatif du pays',
    codePlaceholder: 'Pays + indicatif', otherCode: 'Autre indicatif…', otherPlaceholder: '+999',
    phonePlaceholder: 'Indicatif régional + numéro', phoneHint: 'Indiquez l’indicatif régional et le numéro, sans l’indicatif du pays.',
    phoneError: 'Vérifiez l’indicatif du pays, l’indicatif régional et le numéro.',
    contactNote: 'Indiquez au moins un moyen de contact : e-mail ou téléphone/WhatsApp.',
    contactError: 'Saisissez une adresse e-mail valide ou un numéro avec son indicatif pays.',
    honeypotLabel: 'Laissez ce champ vide', consentError: 'Confirmez votre autorisation pour continuer.',
  },
  de: {
    emailLabel: 'E-Mail (optional)', phoneLabel: 'Telefon / WhatsApp', codeLabel: 'Ländervorwahl',
    codePlaceholder: 'Land + Vorwahl', otherCode: 'Andere Vorwahl…', otherPlaceholder: '+999',
    phonePlaceholder: 'Vorwahl + Rufnummer', phoneHint: 'Geben Sie Vorwahl und Rufnummer ohne die internationale Ländervorwahl ein.',
    phoneError: 'Bitte prüfen Sie Ländervorwahl, Ortsvorwahl und Rufnummer.',
    contactNote: 'Geben Sie mindestens eine Kontaktmöglichkeit an: E-Mail oder Telefon/WhatsApp.',
    contactError: 'Geben Sie eine gültige E-Mail-Adresse oder eine Telefonnummer mit Ländervorwahl ein.',
    honeypotLabel: 'Lassen Sie dieses Feld leer', consentError: 'Bestätigen Sie Ihre Zustimmung, um fortzufahren.',
  },
};

function getAttribute(tag, name) {
  const match = tag.match(new RegExp("\\b" + name + "\\s*=\\s*([\"'])(.*?)\\1", 'i'));
  return match ? match[2] : '';
}

function setAttribute(tag, name, value) {
  const pattern = new RegExp("\\s+" + name + "\\s*=\\s*(?:\"[^\"]*\"|'[^']*'|[^\\s>]+)", 'i');
  const replacement = ' ' + name + '="' + String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"';
  return pattern.test(tag) ? tag.replace(pattern, replacement) : tag.replace(/(\/>|>)$/, replacement + '$1');
}

function removeAttribute(tag, name) {
  const pattern = new RegExp("\\s+" + name + "(?:\\s*=\\s*(?:\"[^\"]*\"|'[^']*'|[^\\s>]+))?", 'gi');
  return tag.replace(pattern, '');
}

function findFieldByInput(form, name) {
  const inputPattern = name === 'whatsapp'
    ? /<input\b(?=[^>]*\bname=["']whatsapp["'])[^>]*\/?\s*>/i
    : /<input\b(?=[^>]*\bname=["']email["'])[^>]*\/?\s*>/i;
  const inputMatch = inputPattern.exec(form);
  if (!inputMatch) return null;
  const start = form.lastIndexOf('<div', inputMatch.index);
  const close = form.indexOf('</div>', inputMatch.index);
  if (start < 0 || close < 0) return null;
  return { start, end: close + 6, markup: form.slice(start, close + 6), input: inputMatch[0] };
}

function transformForm(form, locale, index) {
  const open = form.match(/^<form\b[^>]*>/i)?.[0] || '';
  const classes = getAttribute(open, 'class').split(/\s+/);
  if (!classes.includes('lead')) return form;
  if (/\bdata-aureum-lead-form=["']v1["']/i.test(open)) return form;

  const copy = COPY[locale] || COPY.pt;
  const formId = getAttribute(open, 'id') || ('aureum-lead-' + index);
  const emailField = findFieldByInput(form, 'email');
  const phoneField = findFieldByInput(form, 'whatsapp');
  if (!emailField || !phoneField) {
    throw new Error('Lead form "' + formId + '" must contain email and whatsapp fields before transformation.');
  }

  const emailId = getAttribute(emailField.input, 'id');
  let emailInput = removeAttribute(emailField.input, 'required');
  const emailReplacement = emailField.markup
    .replace(emailField.input, emailInput)
    .replace(/<label\b[^>]*>[\s\S]*?<\/label>/i, '<label for="' + emailId + '">' + copy.emailLabel + '</label>');
  form = form.slice(0, emailField.start) + emailReplacement + form.slice(emailField.end);

  const adjustedPhoneField = findFieldByInput(form, 'whatsapp');
  const phoneId = getAttribute(adjustedPhoneField.input, 'id');
  if (!phoneId) throw new Error('Lead form "' + formId + '" has no stable phone input id.');
  const oldFieldOpen = adjustedPhoneField.markup.match(/^<div\b[^>]*>/i)?.[0] || '<div class="f">';
  const oldClasses = getAttribute(oldFieldOpen, 'class').split(/\s+/).filter(Boolean);
  if (!oldClasses.includes('phone-field')) oldClasses.push('phone-field');
  let phoneInput = setAttribute(adjustedPhoneField.input, 'type', 'text');
  phoneInput = setAttribute(phoneInput, 'inputmode', 'tel');
  phoneInput = setAttribute(phoneInput, 'autocomplete', 'tel-national');
  phoneInput = setAttribute(phoneInput, 'placeholder', copy.phonePlaceholder);
  phoneInput = setAttribute(phoneInput, 'aria-describedby', phoneId + '-hint ' + phoneId + '-error');
  phoneInput = removeAttribute(phoneInput, 'required');

  const options = DIAL_CODES.map(([code, label]) => '<option value="' + code + '">' + label + '</option>').join('');
  const phoneReplacement = [
    '<div class="' + oldClasses.join(' ') + '">',
    '<label for="' + phoneId + '">' + copy.phoneLabel + '</label>',
    '<div class="phone-input-group">',
    '<select id="' + phoneId + '-country-code" name="codigo_pais" aria-label="' + copy.codeLabel + '">',
    '<option value="" selected>' + copy.codePlaceholder + '</option>',
    options,
    '<option value="other">' + copy.otherCode + '</option>',
    '</select>',
    '<input id="' + phoneId + '-country-code-other" name="codigo_pais_outro" type="text" inputmode="numeric" maxlength="4" pattern="[+][1-9][0-9]{0,2}" placeholder="' + copy.otherPlaceholder + '" aria-label="' + copy.codeLabel + '" autocomplete="off" hidden>',
    phoneInput,
    '</div>',
    '<span class="field-hint" id="' + phoneId + '-hint">' + copy.phoneHint + '</span>',
    '<span class="err" id="' + phoneId + '-error" role="alert" hidden>' + copy.phoneError + '</span>',
    '</div>',
  ].join('');

  form = form.slice(0, adjustedPhoneField.start) + phoneReplacement + form.slice(adjustedPhoneField.end);
  form = form.replace(/(<\/div>\s*)(<label\b(?=[^>]*\bclass=["'][^"']*\bconsent\b)[^>]*>)/i, '$1<p class="contact-method-note">' + copy.contactNote + '</p>$2');

  const consentMatch = /<label\b(?=[^>]*\bclass=["'][^"']*\bconsent\b)[^>]*>/i.exec(form);
  if (consentMatch && !/name=["']website["']/i.test(form)) {
    const honeypot = '<div class="aureum-honeypot" aria-hidden="true"><label for="' + formId + '-website">' + copy.honeypotLabel + '</label><input id="' + formId + '-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>';
    form = form.slice(0, consentMatch.index) + honeypot + form.slice(consentMatch.index);
  }

  const consentBlock = /<label\b(?=[^>]*\bclass=["'][^"']*\bconsent\b)[^>]*>[\s\S]*?<\/label>/i;
  if (consentBlock.test(form) && !/class=["'][^"']*\bconsent-error\b/i.test(form)) {
    form = form.replace(consentBlock, (label) => label + '<span class="err consent-error" id="' + formId + '-consent-error" role="alert" hidden>' + copy.consentError + '</span>');
  }

  const consentInput = /<input\b(?=[^>]*\bname=["']consentimento["'])[^>]*\/?\s*>/i.exec(form);
  if (consentInput && /consent-error/.test(form)) {
    form = form.replace(consentInput[0], setAttribute(consentInput[0], 'aria-describedby', formId + '-consent-error'));
  }

  const updatedOpen = setAttribute(open, 'data-aureum-lead-form', 'v1');
  return updatedOpen + form.slice(open.length);
}

export function localeFromPath(path) {
  const first = String(path).replace(/\\/g, '/').split('/').filter(Boolean)[0];
  return ['en', 'es', 'fr', 'de'].includes(first) ? first : 'pt';
}

export function transformLeadFormsHtml(html, locale = 'pt') {
  let formIndex = 0;
  let forms = 0;
  let output = String(html).replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, (form) => {
    const open = form.match(/^<form\b[^>]*>/i)?.[0] || '';
    if (!getAttribute(open, 'class').split(/\s+/).includes('lead')) return form;
    forms += 1;
    formIndex += 1;
    return transformForm(form, locale, formIndex);
  });
  if (!forms) return output;

  const stylesheet = '<link rel="stylesheet" href="/assets/css/aureum-lead-form.css">';
  const script = '<script defer src="/assets/js/aureum-lead-form.js"></script>';
  if (!/href=["']\/assets\/css\/aureum-lead-form\.css(?:[?#][^"']*)?["']/i.test(output)) {
    if (!output.includes('</head>')) throw new Error('Cannot inject Aureum lead form stylesheet: missing </head>.');
    output = output.replace('</head>', stylesheet + '\n</head>');
  }
  if (!/src=["']\/assets\/js\/aureum-lead-form\.js(?:[?#][^"']*)?["']/i.test(output)) {
    if (!output.includes('</body>')) throw new Error('Cannot inject Aureum lead form script: missing </body>.');
    output = output.replace('</body>', script + '\n</body>');
  }
  return output;
}

export async function applyLeadForms(root = 'dist') {
  const rootFiles = await filesUnder(root);
  const htmlFiles = rootFiles.filter((file) => file.endsWith('.html'));
  let pages = 0;
  let forms = 0;
  for (const file of htmlFiles) {
    const original = await readFile(file, 'utf8');
    const relativePath = relative(root, file).replace(/\\/g, '/');
    const locale = localeFromPath(relativePath);
    const count = [...original.matchAll(/<form\b[^>]*>/gi)].filter((match) => getAttribute(match[0], 'class').split(/\s+/).includes('lead')).length;
    if (!count) continue;
    const transformed = transformLeadFormsHtml(original, locale);
    if (transformed !== original) {
      await writeFile(file, transformed);
      pages += 1;
    }
    forms += count;
  }
  return { pages, forms };
}
