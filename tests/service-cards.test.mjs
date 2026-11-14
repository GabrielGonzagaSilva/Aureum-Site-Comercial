import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { filesUnder } from '../scripts/verify.mjs';
import { applyServiceCardStyles } from '../scripts/service-cards.mjs';

const grid = /<div\b(?=[^>]*\bclass="service-grid")[^>]*>[\s\S]*?<\/div>(?=\s*<footer\b[^>]*\bclass="service-footer")/;
test('three localized service categories replace only the old service grid on all 50 pages', async () => {
  let pages = 0;
  for (const file of (await filesUnder('public')).filter(f => f.endsWith('.html'))) {
    const html = await readFile(file, 'utf8');
    const result = applyServiceCardStyles(html);
    if (!html.includes('id="servicos"')) { assert.equal(result, html); continue; }
    pages++;
    const originalGrid = html.match(grid)[0];
    const newGrid = result.match(grid)[0];
    assert.equal([...newGrid.matchAll(/<article\b/g)].length, 3, file);
    assert.equal([...newGrid.matchAll(/class="dc service-category"/g)].length, 3);
    assert.equal([...newGrid.matchAll(/href="#contato" data-intent=/g)].length, 3);
    for (const id of ['visas', 'citizenship', 'documents']) assert.ok(newGrid.includes('data-service="' + id + '"'));
    const restored = result.replace(grid, () => originalGrid).replace('<link rel="stylesheet" href="/assets/css/aureum-service-cards.css">\n', '');
    assert.equal(restored, html, file + ': destination cards, header, footer and forms remain untouched');
    assert.equal(applyServiceCardStyles(result), result);
  }
  assert.equal(pages, 50);
  const home = applyServiceCardStyles(await readFile('public/index.html', 'utf8'));
  for (const title of ['Vistos', 'Cidadania', 'Passaporte e documentos']) assert.ok(home.includes('>' + title + '</h3>'));
});
