import { readFile, writeFile } from 'node:fs/promises';
import { filesUnder } from './verify.mjs';

// A visual layer over the existing service anchors: no copy, IDs or intents change.
export function applyServiceCardStyles(html) {
  if (!/<section\b[^>]*\bid="servicos"/.test(html)) return html;
  let updated = html.replace(/<section\b[^>]*\bid="servicos"[\s\S]*?<\/section>/, section =>
    section.replace(/(<a\b(?=[^>]*\bclass="(?:service-card|citizenship)")[^>]*>)([\s\S]*?)(<\/a>)/g,
      (match, open, content, close) => content.startsWith('<div class="service-card__content">')
        ? match : open + '<div class="service-card__content">' + content + '</div>' + close));
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
