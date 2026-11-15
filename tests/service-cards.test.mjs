import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { filesUnder } from '../scripts/verify.mjs';
import { applyServiceCardStyles, applyServicePages } from '../scripts/service-cards.mjs';

const grid = /<div\b(?=[^>]*\bclass="service-grid")[^>]*>[\s\S]*?(?:<footer\b(?=[^>]*\bclass="service-footer")[^>]*>[\s\S]*?<\/footer>|<!-- aureum-service-cards:end -->)/;
test('five services and one guidance card replace the old grid and footer on all 50 pages', async () => {
  let pages = 0;
  for (const file of (await filesUnder('public')).filter(f => f.endsWith('.html'))) {
    const html = await readFile(file, 'utf8');
    const result = applyServiceCardStyles(html);
    if (!html.includes('id="servicos"')) { assert.equal(result, html); continue; }
    pages++;
    const originalGrid = html.match(grid)[0];
    const newGrid = result.match(grid)[0];
    assert.equal([...newGrid.matchAll(/<article\b/g)].length, 6, file);
    assert.equal([...newGrid.matchAll(/class="dc service-category"/g)].length, 5);
    const serviceCards = [...newGrid.matchAll(/<article class="dc service-category"[\s\S]*?<\/article>/g)].map(m => m[0]).join('');
    assert.doesNotMatch(serviceCards, /<p\b|data-intent=|href="#contato"/);
    assert.equal([...newGrid.matchAll(/class="dc service-guidance"/g)].length, 1);
    assert.equal([...newGrid.matchAll(/href="#contato" data-intent=/g)].length, 1);
    assert.doesNotMatch(result, /<footer\b[^>]*class="service-footer"/);
    for (const id of ['visas', 'citizenship', 'documents', 'exchange', 'travel']) assert.ok(newGrid.includes('data-service="' + id + '"'));
    const locale = html.match(/<html\b[^>]*lang="([a-z]+)/i)[1];
    const prefix = locale === 'pt' ? '' : '/' + locale;
    for (const slug of ['vistos', 'cidadania', 'passaporte-e-documentos', 'intercambio', 'viagens-internacionais']) assert.ok(newGrid.includes('href="' + prefix + '/servicos/' + slug + '/"'), file);
    const restored = result.replace(grid, () => originalGrid).replace('<link rel="stylesheet" href="/assets/css/aureum-service-cards.css">\n', '');
    assert.equal(restored, html, file + ': all content outside the services grid/footer remains untouched');
    assert.equal(applyServiceCardStyles(result), result);
  }
  assert.equal(pages, 50);
  const home = applyServiceCardStyles(await readFile('public/index.html', 'utf8'));
  assert.deepEqual([...home.match(grid)[0].matchAll(/<h3\b[^>]*>([^<]+)<\/h3>/g)].map(m => m[1]), ['Vistos', 'Cidadania', 'Passaporte e documentos', 'Intercâmbio', 'Viagens internacionais', 'Não sabe qual serviço escolher?']);
});

test('every service link has a localized arrival page with a return path and no invented service content', async () => {
  const root = await mkdtemp(join(tmpdir(), 'aureum-services-'));
  try {
    const { pages } = await applyServicePages(root);
    assert.equal(pages, 25);
    for (const locale of ['', 'en/', 'es/', 'fr/', 'de/']) {
      for (const slug of ['vistos', 'cidadania', 'passaporte-e-documentos', 'intercambio', 'viagens-internacionais']) {
        const html = await readFile(join(root, locale, 'servicos', slug, 'index.html'), 'utf8');
        assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
        assert.match(html, /name="robots" content="noindex,follow"/);
        assert.ok(html.includes('href="/' + locale + '#servicos"'));
        assert.ok(html.includes('href="https://aureumassessoria.com.br/' + locale + 'servicos/' + slug + '/"'));
        assert.equal([...html.matchAll(/hreflang=/g)].length, 10);
        assert.doesNotMatch(html, /<form\b|<script\b/);
      }
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});
