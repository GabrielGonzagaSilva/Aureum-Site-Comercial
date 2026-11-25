import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { filesUnder } from './verify.mjs';
import { localizedIntentTranslations } from './localized-copy.mjs';
import { siteOrigin } from './search-metadata.mjs';
import { experienceCopy, privacyPath } from './experience.mjs';

// Public service categories and localized guidance for the first contact.
const COPY = {
  pt: {
    lang: 'pt-BR', cta: 'Conhecer serviço', home: 'Página inicial', languages: 'Idioma',
    back: 'Voltar aos serviços', contact: 'Preparar contato',
    scope: 'A equipe avalia seu contexto e confirma quais etapas a assessoria pode incluir. No primeiro contato, descreva seu objetivo e evite enviar documentos pessoais.',
    descriptions: [
      'Receba orientação inicial sobre vistos para morar, trabalhar, estudar ou reunir a família. Informe o país de destino, o motivo da viagem e a etapa em que você está.',
      'Conte quais vínculos você tem com o país e o que já conseguiu reunir sobre sua história familiar ou documental. A equipe pode orientar os pontos que precisam de avaliação.',
      'Receba orientação para organizar passaporte e documentos de um projeto internacional. Diga qual documento você precisa preparar, renovar ou organizar e para qual finalidade.',
      'Planeje a documentação de um intercâmbio com orientação inicial. Compartilhe o país, o período previsto e o tipo de estudo ou programa que você tem em mente.',
      'Organize os preparativos de uma viagem internacional. Informe o destino, o período e o motivo da viagem para que a equipe entenda quais dúvidas você precisa esclarecer.',
    ],
    cards: ['Vistos', 'Cidadania', 'Passaporte e documentos', 'Intercâmbio', 'Viagens internacionais'],
    guidance: ['Não sabe qual serviço escolher?', 'Conte seu objetivo à nossa equipe.', 'Falar com a equipe'],
  },
  en: {
    lang: 'en', cta: 'Explore service', home: 'Home', languages: 'Language',
    back: 'Back to services', contact: 'Prepare a message',
    scope: 'Our team reviews your circumstances and confirms what the service can cover. In your first message, describe your goal and keep personal documents to yourself.',
    descriptions: [
      'Get initial guidance on visas for moving, working, studying or joining family abroad. Tell us your destination, your reason for travelling and where you are in the process.',
      'Tell us about your ties to the country and what you have learned about your family history or records. Our team can help identify what needs to be assessed.',
      'Get guidance on organising a passport or documents for an international project. Tell us which document you need to prepare, renew or organise and what it is for.',
      'Get initial guidance on paperwork for studying abroad. Share the country, expected dates and the type of study or programme you have in mind.',
      'Get organised for an international trip. Share your destination, expected dates and reason for travelling so our team can understand what questions you need to clarify.',
    ],
    cards: ['Visas', 'Citizenship', 'Passports and documents', 'Study abroad', 'International travel'],
    guidance: ['Not sure which service to choose?', 'Tell our team about your goals.', 'Talk to our team'],
  },
  es: {
    lang: 'es', cta: 'Conocer el servicio', home: 'Inicio', languages: 'Idioma',
    back: 'Volver a los servicios', contact: 'Preparar un mensaje',
    scope: 'El equipo evalúa tu situación y confirma qué etapas puede incluir la asesoría. En el primer contacto, explica tu objetivo y evita enviar documentos personales.',
    descriptions: [
      'Recibe orientación inicial sobre visados para vivir, trabajar, estudiar o reunirte con tu familia. Indica el país de destino, el motivo del viaje y la etapa en la que estás.',
      'Cuéntanos qué vínculos tienes con el país y qué has podido reunir sobre tu historia familiar o documental. El equipo puede orientarte sobre los puntos que requieren una evaluación.',
      'Recibe orientación para organizar el pasaporte y los documentos de un proyecto internacional. Indica qué documento necesitas preparar, renovar u organizar y con qué finalidad.',
      'Planifica los documentos de un intercambio con orientación inicial. Comparte el país, las fechas previstas y el tipo de estudios o programa que tienes en mente.',
      'Organiza los preparativos de un viaje internacional. Comparte el destino, las fechas y el motivo del viaje para que el equipo entienda qué dudas necesitas aclarar.',
    ],
    cards: ['Visados', 'Ciudadanía', 'Pasaportes y documentos', 'Intercambio', 'Viajes internacionales'],
    guidance: ['¿No sabes qué servicio elegir?', 'Cuéntale tu objetivo a nuestro equipo.', 'Hablar con el equipo'],
  },
  fr: {
    lang: 'fr', cta: 'Découvrir le service', home: 'Accueil', languages: 'Langue',
    back: 'Retour aux services', contact: 'Préparer un message',
    scope: 'Notre équipe examine votre situation et précise les étapes que l’accompagnement peut couvrir. Lors du premier contact, décrivez votre objectif et gardez vos documents personnels.',
    descriptions: [
      'Bénéficiez d’une première orientation sur les visas pour vivre, travailler, étudier ou rejoindre votre famille. Indiquez le pays de destination, le motif du voyage et l’étape où vous en êtes.',
      'Décrivez vos liens avec le pays et les éléments que vous avez réunis sur votre histoire familiale ou vos documents. Notre équipe peut vous orienter sur les points à examiner.',
      'Recevez des conseils pour organiser votre passeport et vos documents en vue d’un projet international. Indiquez quel document vous souhaitez préparer, renouveler ou organiser et pour quel usage.',
      'Préparez les documents d’un échange international avec une première orientation. Indiquez le pays, la période envisagée et les études ou le programme qui vous intéressent.',
      'Organisez les préparatifs d’un voyage à l’étranger. Indiquez la destination, les dates envisagées et le motif du voyage pour que notre équipe comprenne vos questions.',
    ],
    cards: ['Visas', 'Citoyenneté', 'Passeports et documents', 'Échange international', 'Voyages internationaux'],
    guidance: ['Vous hésitez sur le service à choisir ?', 'Présentez votre projet à notre équipe.', 'Parler à notre équipe'],
  },
  de: {
    lang: 'de', cta: 'Leistung ansehen', home: 'Startseite', languages: 'Sprache',
    back: 'Zurück zu den Leistungen', contact: 'Nachricht vorbereiten',
    scope: 'Unser Team prüft Ihre Situation und klärt, welche Schritte die Beratung abdecken kann. Beschreiben Sie beim ersten Kontakt Ihr Ziel und behalten Sie persönliche Unterlagen bei sich.',
    descriptions: [
      'Erhalten Sie eine erste Orientierung zu Visa für Umzug, Arbeit, Studium oder Familiennachzug. Nennen Sie das Zielland, den Reisegrund und den Stand Ihres Vorhabens.',
      'Berichten Sie über Ihre Verbindungen zum Land und die Informationen, die Sie zu Ihrer Familiengeschichte oder zu Ihren Unterlagen gesammelt haben. Unser Team kann bei der Einordnung der offenen Fragen helfen.',
      'Erhalten Sie Unterstützung bei der Vorbereitung eines Reisepasses und der Unterlagen für ein internationales Vorhaben. Nennen Sie das Dokument, das Sie vorbereiten, erneuern oder organisieren möchten, und den Zweck.',
      'Erhalten Sie eine erste Orientierung zu Unterlagen für einen Auslandsaufenthalt. Nennen Sie das Land, den geplanten Zeitraum und die Art des Studiums oder Programms.',
      'Organisieren Sie die Vorbereitung einer internationalen Reise. Teilen Sie uns Ziel, Zeitraum und Anlass mit, damit unser Team Ihre Fragen einordnen kann.',
    ],
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

export async function applyServicePages(root = 'dist') {
  let pages = 0;
  for (const [locale, copy] of Object.entries(COPY)) {
    for (const [index, service] of SERVICES.entries()) {
      const route = servicePath(locale, service);
      const folder = join(root, route.slice(1));
      const title = copy.cards[index];
      const description = copy.descriptions[index];
      const experience = experienceCopy[locale];
      const contactHref = homePath(locale) + '?servico=' + service.slug + '#contato';
      const languages = Object.entries(COPY).map(([target, translated]) => `<a href="${servicePath(target, service)}" lang="${translated.lang}" hreflang="${translated.lang}"${target === locale ? ' aria-current="page"' : ''}>${target.toUpperCase()}</a>`).join('');
      const alternates = Object.entries(COPY).map(([target, translated]) => `<link rel="alternate" hreflang="${translated.lang}" href="${siteOrigin}${servicePath(target, service)}">`).join('\n');
      const html = `<!doctype html>
<html lang="${copy.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)} | Aureum</title><meta name="description" content="${escape(description)}">
<link rel="icon" type="image/svg+xml" href="/assets/brand/favicon-aureum.svg">
<link rel="canonical" href="${siteOrigin}${route}">${alternates}
<link rel="alternate" hreflang="x-default" href="${siteOrigin}${servicePath('pt', service)}">
<link rel="preload" href="/assets/fonts/aureum-refined-inter-400.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="/assets/css/aureum-service-page.css"></head>
<body>
<header class="service-page-header">
  <a class="service-page-brand" href="${homePath(locale)}" aria-label="Aureum — ${escape(copy.home)}"><img src="/assets/brand/logo-reduzida-preto.svg" alt="Aureum" width="764" height="186"></a>
  <nav class="service-page-navigation" aria-label="Aureum">
    <a href="${homePath(locale)}#servicos">${escape(experience.services)}</a>
    <a href="${homePath(locale)}#destinos">${escape(experience.destinations)}</a>
    <a href="${homePath(locale)}#como-funciona">${escape(experience.process)}</a>
  </nav>
  <nav class="service-page-language" aria-label="${escape(copy.languages)}">${languages}</nav>
</header>
<main>
  <div class="service-page-hero">
    <div class="service-page-intro">
      <ol class="service-page-crumbs">
        <li><a href="${homePath(locale)}">${escape(copy.home)}</a></li>
        <li><a href="${homePath(locale)}#servicos">${escape(experience.services)}</a></li>
        <li aria-current="page">${escape(title)}</li>
      </ol>
      <h1>${escape(title)}</h1>
      <p>${escape(description)}</p>
      <div class="service-page-actions"><a class="service-page-contact" href="${contactHref}">${escape(copy.contact)}</a><a class="service-page-back" href="${homePath(locale)}#servicos">${escape(copy.back)}</a></div>
    </div>
    <img class="service-page-photo" src="${service.photo}" srcset="${service.srcset}" sizes="(max-width: 760px) 92vw, 42vw" width="${service.width}" height="${service.height}" alt="" decoding="async">
  </div>
  <div class="service-page-details">
    <section>
      <h2>${escape(experience.serviceSections[1])}</h2>
      <p>${escape(copy.scope)}</p>
    </section>
    <section>
      <h2>${escape(experience.preparation)}</h2>
      <ul>${experience.prompts.map(prompt => '<li>' + escape(prompt) + '</li>').join('')}</ul>
    </section>
  </div>
</main>
<footer class="service-page-footer">
  <a href="${homePath(locale)}#destinos">${escape(experience.guide)}</a>
  <a href="${privacyPath(locale)}">${escape(experience.privacy)}</a>
</footer>
</body></html>\n`;
      await mkdir(folder, { recursive: true });
      await writeFile(join(folder, 'index.html'), html);
      pages++;
    }
  }
  return { pages };
}
