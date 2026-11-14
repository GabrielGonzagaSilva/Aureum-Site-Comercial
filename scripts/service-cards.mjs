import { readFile, writeFile } from 'node:fs/promises';
import { filesUnder } from './verify.mjs';

// The three categories requested by Aureum. Short introductory copy can be
// replaced when the final service descriptions arrive; no eligibility claims.
const COPY = {
  pt: {
    cta: 'Falar sobre este serviço',
    cards: [
      ['Vistos', 'Orientação sobre documentos e etapas do seu pedido de visto.'],
      ['Cidadania', 'Avaliação inicial de possibilidades de cidadania e nacionalidade, conforme seus vínculos e as regras aplicáveis.'],
      ['Passaporte e documentos', 'Converse com a equipe sobre passaportes e documentos para o seu projeto internacional.'],
    ],
  },
  en: {
    cta: 'Discuss this service',
    cards: [
      ['Visas', 'Guidance on documents and the steps in your visa application.'],
      ['Citizenship', 'An initial assessment of citizenship and nationality options, based on your connections and the applicable rules.'],
      ['Passports and documents', 'Talk to our team about passports and documents for your international plans.'],
    ],
  },
  es: {
    cta: 'Consultar sobre este servicio',
    cards: [
      ['Visados', 'Orientación sobre los documentos y las etapas de tu solicitud de visado.'],
      ['Ciudadanía', 'Evaluación inicial de las posibilidades de ciudadanía y nacionalidad, según tus vínculos y las normas aplicables.'],
      ['Pasaportes y documentos', 'Habla con el equipo sobre pasaportes y documentos para tu proyecto internacional.'],
    ],
  },
  fr: {
    cta: 'Échanger sur ce service',
    cards: [
      ['Visas', 'Accompagnement concernant les documents et les étapes de votre demande de visa.'],
      ['Citoyenneté', 'Première évaluation des possibilités de citoyenneté et de nationalité, selon vos liens et les règles applicables.'],
      ['Passeports et documents', 'Échangez avec notre équipe au sujet des passeports et documents pour votre projet international.'],
    ],
  },
  de: {
    cta: 'Diese Leistung besprechen',
    cards: [
      ['Visa', 'Orientierung zu Unterlagen und Schritten Ihres Visumantrags.'],
      ['Staatsangehörigkeit', 'Erste Einschätzung der Möglichkeiten einer Staatsangehörigkeit nach Ihren Verbindungen und den geltenden Regeln.'],
      ['Reisepässe und Dokumente', 'Sprechen Sie mit unserem Team über Reisepässe und Dokumente für Ihr internationales Vorhaben.'],
    ],
  },
};
const SERVICES = [
  { id: 'visas', photo: '/assets/photos/australia-01.webp' },
  { id: 'citizenship', photo: '/assets/photos/portugal-02.webp' },
  { id: 'documents', photo: '/assets/photos/franca-01.webp' },
];
const GRID = /<div\b(?=[^>]*\bclass="service-grid")[^>]*>[\s\S]*?<\/div>(?=\s*<footer\b[^>]*\bclass="service-footer")/;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function renderGrid(locale) {
  const copy = COPY[locale] || COPY.pt;
  return '<div class="service-grid" data-aureum-service-cards="v2">' + SERVICES.map((service, index) => {
    const [title, description] = copy.cards[index];
    // Reuse the destination card's actual component, including image, scrim,
    // frosted lower layer, typography, focus treatment and full-card CTA.
    return `<article class="dc service-category" data-service="${service.id}" aria-labelledby="service-${service.id}-title">
<img class="dc__photo" src="${service.photo}" alt="" loading="lazy" decoding="async">
<div class="dc__blur" aria-hidden="true"></div><div class="dc__scrim" aria-hidden="true"></div>
<div class="dc__body"><h3 class="dc__title" id="service-${service.id}-title">${escape(title)}</h3>
<p class="dc__text">${escape(description)}</p>
<a class="dc__cta" href="#contato" data-intent="${escape(title)}">${escape(copy.cta)}<span class="dc__sr">: ${escape(title)}</span><span class="dc__arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a></div></article>`;
  }).join('\n') + '</div>';
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
