import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { filesUnder } from './verify.mjs';
import { localizedIntentTranslations } from './localized-copy.mjs';
import { siteOrigin } from './search-metadata.mjs';

// Approved category order and localized navigation. Service content comes later.
const COPY = {
  pt: {
    lang: 'pt-BR', cta: 'Conhecer serviço', home: 'Página inicial', languages: 'Idioma',
    pending: 'Estamos preparando o conteúdo desta página.', back: 'Voltar aos serviços',
    cards: ['Vistos', 'Cidadania', 'Passaporte e documentos', 'Intercâmbio', 'Viagens internacionais'],
    guidance: ['Não sabe qual serviço escolher?', 'Conte seu objetivo à nossa equipe.', 'Falar com a equipe'],
  },
  en: {
    lang: 'en', cta: 'Explore service', home: 'Home', languages: 'Language',
    pending: 'We are preparing the content for this page.', back: 'Back to services',
    cards: ['Visas', 'Citizenship', 'Passports and documents', 'Study abroad', 'International travel'],
    guidance: ['Not sure which service to choose?', 'Tell our team about your goals.', 'Talk to our team'],
  },
  es: {
    lang: 'es', cta: 'Conocer el servicio', home: 'Inicio', languages: 'Idioma',
    pending: 'Estamos preparando el contenido de esta página.', back: 'Volver a los servicios',
    cards: ['Visados', 'Ciudadanía', 'Pasaportes y documentos', 'Intercambio', 'Viajes internacionales'],
    guidance: ['¿No sabes qué servicio elegir?', 'Cuéntale tu objetivo a nuestro equipo.', 'Hablar con el equipo'],
  },
  fr: {
    lang: 'fr', cta: 'Découvrir le service', home: 'Accueil', languages: 'Langue',
    pending: 'Nous préparons le contenu de cette page.', back: 'Retour aux services',
    cards: ['Visas', 'Citoyenneté', 'Passeports et documents', 'Échange international', 'Voyages internationaux'],
    guidance: ['Vous hésitez sur le service à choisir ?', 'Présentez votre projet à notre équipe.', 'Parler à notre équipe'],
  },
  de: {
    lang: 'de', cta: 'Leistung ansehen', home: 'Startseite', languages: 'Sprache',
    pending: 'Wir bereiten den Inhalt dieser Seite vor.', back: 'Zurück zu den Leistungen',
    cards: ['Visa', 'Staatsangehörigkeit', 'Reisepässe und Dokumente', 'Auslandsaufenthalte', 'Internationale Reisen'],
    guidance: ['Unsicher, welche Leistung passt?', 'Erzählen Sie unserem Team von Ihrem Vorhaben.', 'Mit dem Team sprechen'],
  },
};
function servicePhoto(stem, originalWidth, originalHeight, widths = [720, 1440, 2160]) {
  const path = '/assets/photos/services/' + stem;
  return {
    photo: path + '-' + widths[1] + '.webp',
    srcset: widths.map(width => path + '-' + width + '.webp ' + width + 'w').join(', '),
    width: widths[1], height: Math.round(originalHeight * widths[1] / originalWidth),
    // The landscape citizenship photo needs extra pixels for its portrait crop.
    sizes: originalWidth > originalHeight
      ? '(max-width:639px) 135vw, (max-width:1099px) 88vw, (max-width:1439px) 58vw, 820px'
      : '(max-width:639px) 90vw, (max-width:1099px) 44vw, (max-width:1439px) 29vw, 410px',
  };
}
const SERVICES = [
  { id: 'visas', slug: 'vistos', ...servicePhoto('vistos-6ebed6b9', 5504, 8256) },
  { id: 'citizenship', slug: 'cidadania', ...servicePhoto('cidadania-a628ae67', 6000, 4000, [960, 1920, 2880]) },
  { id: 'documents', slug: 'passaporte-e-documentos', ...servicePhoto('passaporte-documentos-6183616b', 4480, 6720) },
  { id: 'exchange', slug: 'intercambio', ...servicePhoto('intercambio-65e0c973', 4343, 5906) },
  { id: 'travel', slug: 'viagens-internacionais', ...servicePhoto('viagens-internacionais-451d389a', 4115, 5849) },
];
// Replace the old grid and detached footer together; the marker makes the
// generated six-card region unambiguous and safe to transform more than once.
const GRID = /<div\b(?=[^>]*\bclass="service-grid")[^>]*>[\s\S]*?(?:<footer\b(?=[^>]*\bclass="service-footer")[^>]*>[\s\S]*?<\/footer>|<!-- aureum-service-cards:end -->)/;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const homePath = locale => locale === 'pt' ? '/' : '/' + locale + '/';
const servicePath = (locale, service) => homePath(locale) + 'servicos/' + service.slug + '/';

export function serviceNavigation(locale) {
  const copy = COPY[locale] || COPY.pt;
  return SERVICES.map((service, index) => ({ title: copy.cards[index], href: servicePath(locale, service) }));
}

function renderGrid(locale) {
  const copy = COPY[locale] || COPY.pt;
  const [guidanceTitle, guidanceText, guidanceCTA] = copy.guidance;
  const intentSource = 'Preciso de ajuda para identificar o serviço';
  const intent = localizedIntentTranslations[locale]?.[intentSource] || intentSource;
  return '<div class="service-grid" data-aureum-service-cards="v4">' + SERVICES.map((service, index) => {
    const title = copy.cards[index];
    // Reuse the destination card's actual component, including image, scrim,
    // frosted lower layer, typography, focus treatment and full-card CTA.
    return `<article class="dc service-category" data-service="${service.id}" aria-labelledby="service-${service.id}-title">
<img class="dc__photo" src="${service.photo}" srcset="${service.srcset}" sizes="${service.sizes}" width="${service.width}" height="${service.height}" alt="" loading="lazy" decoding="async">
<div class="dc__blur" aria-hidden="true"></div><div class="dc__scrim" aria-hidden="true"></div>
<div class="dc__body"><h3 class="dc__title" id="service-${service.id}-title">${escape(title)}</h3>
<a class="dc__cta" href="${servicePath(locale, service)}">${escape(copy.cta)}<span class="dc__sr">: ${escape(title)}</span><span class="dc__arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a></div></article>`;
  }).join('\n') + `
<article class="dc service-guidance" aria-labelledby="service-guidance-title">
<div class="dc__body"><div class="service-guidance__intro"><h3 class="dc__title" id="service-guidance-title">${escape(guidanceTitle)}</h3><p class="service-guidance__copy">${escape(guidanceText)}</p></div>
<a class="dc__cta" href="#contato" data-intent="${escape(intent)}">${escape(guidanceCTA)}<span class="dc__arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a></div></article>
</div><!-- aureum-service-cards:end -->`;
}

export function applyServiceCardStyles(html) {
  if (!/<section\b[^>]*\bid="servicos"/.test(html)) return html;
  const locale = (html.match(/<html\b[^>]*\blang=["']([^"']+)/i)?.[1] || 'pt').toLowerCase().split('-')[0];
  if (!GRID.test(html)) throw new Error('Cannot find the existing Aureum service grid.');
  let updated = html.replace(GRID, () => renderGrid(locale));
  if (!/href="\/assets\/css\/aureum-service-cards\.css(?:\?[^"\s]*)?"/.test(updated)) {
    updated = updated.replace('</head>', '<link rel="stylesheet" href="/assets/css/aureum-service-cards.css">\n</head>');
  }
  return updated;
}

export async function applyServiceCards(root = 'dist') {
  let pages = 0;
  for (const file of (await filesUnder(root)).filter(file => file.endsWith('.html'))) {
    const original = await readFile(file, 'utf8');
    const updated = applyServiceCardStyles(original);
    if (original !== updated) {
      await writeFile(file, updated);
      pages++;
    }
  }
  return { pages };
}

// These are deliberately minimal arrival pages, not invented service content.
// Keep their routes stable when the full pages are authored later.
export async function applyServicePages(root = 'dist') {
  let pages = 0;
  for (const [locale, copy] of Object.entries(COPY)) {
    for (const [index, service] of SERVICES.entries()) {
      const route = servicePath(locale, service);
      const folder = join(root, route.slice(1));
      const title = copy.cards[index];
      const languages = Object.entries(COPY).map(([target, translated]) => `<a href="${servicePath(target, service)}" lang="${translated.lang}" hreflang="${translated.lang}"${target === locale ? ' aria-current="page"' : ''}>${target.toUpperCase()}</a>`).join('');
      const alternates = Object.entries(COPY).map(([target, translated]) => `<link rel="alternate" hreflang="${translated.lang}" href="${siteOrigin}${servicePath(target, service)}">`).join('\n');
      const html = `<!doctype html>
<html lang="${copy.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)} | Aureum</title><meta name="description" content="${escape(title + '. ' + copy.pending)}"><meta name="robots" content="noindex,follow">
<link rel="icon" type="image/svg+xml" href="/assets/brand/favicon-aureum.svg">
<link rel="canonical" href="${siteOrigin}${route}">${alternates}
<link rel="preload" href="/assets/fonts/aureum-refined-inter-400.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="/assets/css/aureum-service-page.css"></head>
<body><header class="service-page-header"><a class="service-page-brand" href="${homePath(locale)}" aria-label="Aureum — ${escape(copy.home)}"><img src="/assets/brand/logo-reduzida-preto.svg" alt="Aureum" width="764" height="186"></a><nav aria-label="${escape(copy.languages)}">${languages}</nav></header>
<main><h1>${escape(title)}</h1><p>${escape(copy.pending)}</p><a class="service-page-back" href="${homePath(locale)}#servicos">${escape(copy.back)}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></main>
</body></html>\n`;
      await mkdir(folder, { recursive: true });
      await writeFile(join(folder, 'index.html'), html);
      pages++;
    }
  }
  return { pages };
}
