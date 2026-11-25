import { readFile, writeFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { filesUnder } from './verify.mjs';
import { localeFromPath } from './lead-forms.mjs';
import { findElementById } from './shared-header.mjs';

export const experienceCopy = {
  pt: {
    title: 'Assessoria em vistos e cidadania',
    intro: 'Orientação para morar, estudar, trabalhar ou reunir a família no exterior.',
    start: 'Encontrar meu próximo passo', destinations: 'Explorar destinos',
    play: 'Reproduzir vídeo', pause: 'Pausar vídeo',
    services: 'Serviços', process: 'Como funciona', contact: 'Falar com a Aureum',
    draft: 'Preparar mensagem', review: 'Revisar meu caso', privacy: 'Aviso de privacidade',
    contactTitle: 'Vamos conversar sobre seu projeto?',
    contactIntro: 'Conte seu objetivo e prepare uma mensagem para enviar à Aureum pelo Instagram.',
    goal: 'Qual é seu objetivo?', extra: 'Adicionar meus dados de contato',
    preparation: 'O que contar no primeiro contato', preparationIntro: 'Com estas informações, a equipe pode entender o momento do seu projeto.',
    prompts: ['O que você quer fazer?', 'Qual destino você tem em mente?', 'Em que etapa está seu projeto?'],
    answers: ['Por exemplo, estudar, trabalhar, morar fora ou reunir a família.', 'Se ainda estiver escolhendo, conte quais países está considerando.', 'Diga o que já fez e o que precisa esclarecer. Guarde os documentos pessoais para uma etapa posterior.'],
    serviceSections: ['Quando faz sentido', 'O que podemos avaliar', 'Prepare sua mensagem'],
    guide: 'Veja também os destinos', priceHint: 'O valor depende do tipo de apoio que você precisa e das atividades incluídas na proposta. A equipe explica o escopo e os valores antes da contratação.',
  },
  en: {
    title: 'Visa and citizenship advisory',
    intro: 'Guidance for moving, studying, working or joining family abroad.',
    start: 'Find my next step', destinations: 'Explore destinations',
    play: 'Play video', pause: 'Pause video',
    services: 'Services', process: 'How it works', contact: 'Contact Aureum',
    draft: 'Prepare a message', review: 'Discuss my case', privacy: 'Privacy notice',
    contactTitle: 'Let’s talk about your plans',
    contactIntro: 'Describe your goal and prepare a message to send to Aureum on Instagram.',
    goal: 'What is your goal?', extra: 'Add my contact details',
    preparation: 'What to share in your first message', preparationIntro: 'These details help our team understand where you are in the process.',
    prompts: ['What would you like to do?', 'Where would you like to go?', 'Where are you in the process?'],
    answers: ['For example, study, work, move abroad or join family.', 'If you are still deciding, tell us which countries you are considering.', 'Share what you have done so far and what you would like to clarify. Keep personal documents for a later stage.'],
    serviceSections: ['When it makes sense', 'What we can assess', 'Prepare your message'],
    guide: 'Explore related destinations',
  },
  es: {
    title: 'Asesoría en visados y ciudadanía',
    intro: 'Orientación para vivir, estudiar, trabajar o reunirte con tu familia en el extranjero.',
    start: 'Encontrar mi próximo paso', destinations: 'Explorar destinos',
    play: 'Reproducir vídeo', pause: 'Pausar vídeo',
    services: 'Servicios', process: 'Cómo funciona', contact: 'Contactar con Aureum',
    draft: 'Preparar un mensaje', review: 'Consultar mi caso', privacy: 'Aviso de privacidad',
    contactTitle: 'Hablemos de tu proyecto',
    contactIntro: 'Describe tu objetivo y prepara un mensaje para enviar a Aureum por Instagram.',
    goal: '¿Cuál es tu objetivo?', extra: 'Añadir mis datos de contacto',
    preparation: 'Qué contar en el primer contacto', preparationIntro: 'Estos datos ayudan al equipo a entender en qué momento está tu proyecto.',
    prompts: ['¿Qué quieres hacer?', '¿Qué destino tienes en mente?', '¿En qué etapa estás?'],
    answers: ['Por ejemplo, estudiar, trabajar, vivir en otro país o reunirte con tu familia.', 'Si aún estás decidiendo, indica qué países estás considerando.', 'Cuenta qué has hecho y qué necesitas aclarar. Reserva los documentos personales para más adelante.'],
    serviceSections: ['Cuándo puede ayudarte', 'Qué podemos evaluar', 'Prepara tu mensaje'],
    guide: 'Explorar destinos relacionados',
  },
  fr: {
    title: 'Conseil en visas et citoyenneté',
    intro: 'Un accompagnement pour vivre, étudier, travailler ou rejoindre votre famille à l’étranger.',
    start: 'Trouver ma prochaine étape', destinations: 'Explorer les destinations',
    play: 'Lire la vidéo', pause: 'Mettre la vidéo en pause',
    services: 'Services', process: 'Notre méthode', contact: 'Contacter Aureum',
    draft: 'Préparer un message', review: 'Parler de mon cas', privacy: 'Avis de confidentialité',
    contactTitle: 'Parlons de votre projet',
    contactIntro: 'Décrivez votre objectif et préparez un message à envoyer à Aureum sur Instagram.',
    goal: 'Quel est votre objectif ?', extra: 'Ajouter mes coordonnées',
    preparation: 'Quoi indiquer lors du premier contact', preparationIntro: 'Ces éléments permettent à notre équipe de comprendre où vous en êtes.',
    prompts: ['Quel est votre objectif ?', 'Quelle destination envisagez-vous ?', 'Où en est votre projet ?'],
    answers: ['Par exemple, étudier, travailler, vivre à l’étranger ou rejoindre votre famille.', 'Si vous hésitez encore, indiquez les pays que vous envisagez.', 'Décrivez vos démarches et vos questions. Gardez vos documents personnels pour une étape ultérieure.'],
    serviceSections: ['À qui s’adresse ce service', 'Ce que nous pouvons examiner', 'Préparez votre message'],
    guide: 'Explorer les destinations associées',
  },
  de: {
    title: 'Beratung zu Visa und Staatsangehörigkeit',
    intro: 'Orientierung für Umzug, Studium, Arbeit oder Familiennachzug im Ausland.',
    start: 'Meinen nächsten Schritt finden', destinations: 'Reiseziele entdecken',
    play: 'Video abspielen', pause: 'Video anhalten',
    services: 'Leistungen', process: 'So funktioniert es', contact: 'Aureum kontaktieren',
    draft: 'Nachricht vorbereiten', review: 'Meinen Fall besprechen', privacy: 'Datenschutzhinweise',
    contactTitle: 'Sprechen wir über Ihr Vorhaben',
    contactIntro: 'Beschreiben Sie Ihr Ziel und bereiten Sie eine Nachricht an Aureum auf Instagram vor.',
    goal: 'Was ist Ihr Ziel?', extra: 'Meine Kontaktdaten ergänzen',
    preparation: 'Was Sie beim ersten Kontakt angeben können', preparationIntro: 'Diese Angaben helfen unserem Team, den Stand Ihres Vorhabens zu verstehen.',
    prompts: ['Was möchten Sie tun?', 'Welches Land kommt infrage?', 'Wie weit sind Sie mit Ihrem Vorhaben?'],
    answers: ['Zum Beispiel studieren, arbeiten, umziehen oder mit Ihrer Familie zusammenleben.', 'Wenn Sie noch überlegen, nennen Sie die Länder, die infrage kommen.', 'Beschreiben Sie bisherige Schritte und offene Fragen. Persönliche Dokumente sind erst später erforderlich.'],
    serviceSections: ['Wann sich die Beratung eignet', 'Was wir prüfen können', 'Nachricht vorbereiten'],
    guide: 'Weitere Ziele entdecken',
  },
};

export const escapeHtml = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));
export const privacyPath = locale => locale === 'pt' ? '/privacidade.html' : '/' + locale + '/privacy.html';

function editSection(html, id, update) {
  const section = findElementById(html, 'section', id);
  if (!section) return html;
  return html.slice(0, section.start) + update(section.markup) + html.slice(section.end);
}

function refineHero(section, copy) {
  if (!section.includes('hero-logo-centered-test')) return section;
  const body = `
<div class="ux-hero-media" aria-hidden="true">
  <img src="/assets/hero-tower-bridge-poster.jpg" alt="" width="1920" height="1080" fetchpriority="high" decoding="async">
  <video class="ux-hero-video" muted loop playsinline preload="none" hidden></video>
</div>
<div class="wrap hero-c ux-hero-copy">
  <img class="hero-brand-center" src="/assets/brand/logo-completa-branco.svg" alt="Aureum" width="764" height="524" decoding="async">
  <h1>${escapeHtml(copy.title)}</h1>
  <p>${escapeHtml(copy.intro)}</p>
  <div class="ux-hero-actions">
    <a class="ux-hero-primary" href="#orientacao">${escapeHtml(copy.start)} <span aria-hidden="true">↗</span></a>
    <a class="ux-hero-secondary" href="#destinos">${escapeHtml(copy.destinations)}</a>
  </div>
</div>
<button class="ux-hero-motion" type="button" data-play="${escapeHtml(copy.play)}" data-pause="${escapeHtml(copy.pause)}" aria-pressed="false" hidden>${escapeHtml(copy.play)}</button>
</section>`;
  return '<section class="hero ux-hero" id="top" aria-label="Aureum">' + body;
}

function refineDrawer(html) {
  const menu = findElementById(html, 'div', 'mmenu');
  if (!menu) return html;
  const updated = menu.markup.replace(
    /(<nav\b[^>]*>)\s*<h4>([^<]+)<\/h4>([\s\S]*?)<h4>[^<]+<\/h4>([\s\S]*?)<\/nav>\s*<div class="mmenu-foot">\s*(<details\b[\s\S]*?<\/details>)([\s\S]*?)<\/div>/,
    (_, nav, destinations, countries, links, language, cta) => {
      const contact = links.match(/<a href="[^"]*#contato">[^<]+<\/a>/)?.[0] || '';
      return `<div class="ux-drawer-language">${language}</div>${nav}${contact}${links.replace(contact, '')}
<details class="ux-drawer-destinations"><summary>${destinations}</summary>${countries}</details></nav>
<div class="mmenu-foot">${cta}</div>`;
    },
  );
  return html.slice(0, menu.start) + updated + html.slice(menu.end);
}

const goalLabel = {
  pt: 'Qual é seu objetivo? (opcional)', en: 'What is your goal? (optional)',
  es: '¿Cuál es tu objetivo? (opcional)', fr: 'Quel est votre objectif ? (facultatif)',
  de: 'Was ist Ihr Ziel? (optional)',
};

function refineContact(section, copy, locale) {
  let updated = section
    .replace(/<h2 class="h2">[^<]*<\/h2>/, '<h2 class="h2">' + escapeHtml(copy.contactTitle) + '</h2>')
    .replace(/<p class="lead">[^<]*<\/p>/, '<p class="lead">' + escapeHtml(copy.contactIntro) + '</p>')
    .replace(/<div class="ux-contact-intro">[\s\S]*?<\/div>\s*<\/div>/, '')
    .replace(/(<form\b[^>]*id="lead-main"[^>]*>)\s*<div class="f full"[^>]*><h3>[\s\S]*?<\/div>/, '$1')
    .replace(/(<label for="lead-main-msg">)[\s\S]*?(<\/label>)/, '$1' + escapeHtml(goalLabel[locale]) + '$2')
    .replace(/<p class="f-note">[^<]*<\/p>/, '');
  const personal = /<div class="f full"><label for="lead-main-name">[\s\S]*?(?=<div class="f full"><label for="lead-main-dest">)/;
  const fields = updated.match(personal)?.[0];
  if (fields) {
    updated = updated.replace(personal, '').replace(
      /(<textarea\b[^>]*id="lead-main-msg"[^>]*>[\s\S]*?<\/textarea><\/div>)/,
      '$1<details class="ux-manual-contact full"><summary>' + escapeHtml(copy.extra) + '</summary>' + fields + '</details>',
    );
  }
  return updated;
}

function refineScenarios(section, copy, locale) {
  const servicePath = (locale === 'pt' ? '' : '/' + locale) + '/servicos/vistos/';
  const routes = ['#destinos', servicePath, '#contato'];
  const visaAction = {
    pt: 'Conhecer o serviço de vistos', en: 'Explore visa support', es: 'Conocer la asesoría en visados',
    fr: 'Découvrir l’accompagnement visa', de: 'Visaberatung ansehen',
  }[locale];
  const labels = [copy.destinations, visaAction, copy.review];
  let index = 0;
  return section
    .replace(/<a class="scenario-card"[^>]*>[\s\S]*?<\/a>/g, card => {
      const slot = index++;
      const updated = card.replace(/href="#contato"/, 'href="' + routes[slot] + '"');
      const contextual = slot === 2 ? updated : updated.replace(/\sdata-intent="[^"]*"/, '');
      return contextual.replace(/(<span class="action-label">)[^<]*(<\/span>)/, '$1' + escapeHtml(labels[slot]) + '$2');
    })
    .replace(/<aside class="helper-note"[^>]*>[\s\S]*?<\/aside>/, '');
}

function refineProcess(section) {
  return section.replace(/(<ol class="ae-steps"[^>]*>)([\s\S]*?)(<\/ol>)/, (original, open, list, close) => {
    const steps = [...list.matchAll(/<li class="ae-step">[\s\S]*?<\/li>/g)].map(([step]) => step);
    if (steps.length !== 5) return original;
    const description = step => step.match(/<p class="card-description">([\s\S]*?)<\/p>/)?.[1];
    const combine = (step, extra, number, before) => step
      .replace(/(aria-hidden="true">)0\d(<\/span>)/, (_, start, end) => start + number + end)
      .replace(/(<p class="card-description">)([\s\S]*?)(<\/p>)/, (_, start, content, end) =>
        start + (before ? extra + ' ' + content : content + ' ' + extra) + end);
    const assessment = description(steps[1]);
    const guidance = description(steps[4]);
    if (!assessment || !guidance) return original;
    return open + steps[0] + combine(steps[2], assessment, '02', true) + combine(steps[3], guidance, '03', false) + close;
  });
}

function refinePreparation(section, copy) {
  const header = section.match(/<header class="page-header">[\s\S]*?<\/header>/)?.[0];
  if (!header) return section;
  const updatedHeader = header
    .replace(/<p class="eyebrow">[^<]*<\/p>/, '')
    .replace(/(<h2\b[^>]*>)[\s\S]*?<\/h2>/, '$1' + escapeHtml(copy.preparation) + '</h2>')
    .replace(/(<p class="page-intro">)[^<]*(<\/p>)/, '$1' + escapeHtml(copy.preparationIntro) + '$2');
  const cards = copy.prompts.map((prompt, index) =>
    `<article><h3>${escapeHtml(prompt)}</h3><p>${escapeHtml(copy.answers[index])}</p></article>`).join('');
  return section.slice(0, section.indexOf(header)) + updatedHeader + '<div class="ux-preparation-grid">' + cards + '</div></div></section>';
}

export function refineExperience(html, locale) {
  const copy = experienceCopy[locale];
  let output = editSection(html, 'top', section => refineHero(section, copy));
  output = editSection(output, 'orientacao', section => refineScenarios(section, copy, locale));
  output = editSection(output, 'como-funciona', refineProcess);
  output = editSection(output, 'diferenciais', section => refinePreparation(section, copy));
  output = editSection(output, 'contato', section => refineContact(section, copy, locale));
  output = refineDrawer(output);
  const photo = {
    pt: 'Porto e rio Douro, Portugal', en: 'Porto and the River Douro, Portugal',
    es: 'Oporto y el río Duero, Portugal', fr: 'Porto et le Douro, Portugal', de: 'Porto und der Douro, Portugal',
  }[locale];
  output = output.replace(/aria-label="[^"]+"(?= class="ph pt-hero" role="img")/g, 'aria-label="' + photo + '"');
  output = output.replace(/(<section\b[^>]*)(aria-label="[^"]*")( class="band">)/g, '$1aria-label="' + escapeHtml(copy.draft) + '"$3');
  if (copy.priceHint) output = output.replace('O valor depende das atividades incluídas no atendimento. Antes da contratação, o escopo, os valores e as responsabilidades precisam ser apresentados e esclarecidos.', copy.priceHint);
  output = output.replace(/<nav aria-label="(?:Legal|Aviso legal|Mentions légales|Rechtliche Hinweise)"[^>]*>(?:(?!<h4>)[\s\S])*?<\/nav>/g, nav =>
    nav.replace(/(<nav\b[^>]*>)[\s\S]*/, '$1<a href="' + privacyPath(locale) + '">' + escapeHtml(copy.privacy) + '</a></nav>'));
  output = output.replace(/<span\b[^>]*class="[^"]*f-social-link[^"]*is-pending[^"]*"[^>]*>[\s\S]*?<\/span>/g, '');
  return output.replace('</head>', '<link rel="stylesheet" href="/assets/css/aureum-experience.css">\n<script src="/assets/js/aureum-experience.js" defer></script>\n</head>');
}

export async function applyExperience(root = 'dist') {
  for (const file of (await filesUnder(root)).filter(file => file.endsWith('.html'))) {
    const html = await readFile(file, 'utf8');
    if (!/\sid=["']hdr["']/i.test(html)) continue;
    await writeFile(file, refineExperience(html, localeFromPath(relative(root, file))));
  }
}
