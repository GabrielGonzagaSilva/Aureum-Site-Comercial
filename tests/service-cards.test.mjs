import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { filesUnder } from '../scripts/verify.mjs';
import { applyServiceCardStyles } from '../scripts/service-cards.mjs';

test('service visual layer preserves every service and destination across all 50 localized pages', async () => {
  let pages = 0;
  for (const file of (await filesUnder('public')).filter(f => f.endsWith('.html'))) {
    const html = await readFile(file, 'utf8');
    const result = applyServiceCardStyles(html);
    if (!html.includes('id="servicos"')) {
      assert.equal(result, html);
      continue;
    }
    pages++;
    const section = html.match(/<section\b[^>]*id="servicos"[\s\S]*?<\/section>/)[0];
    const restored = result.replace(/(<a\b[^>]*>)<div class="service-card__content">([\s\S]*?)<\/div><\/a>/g, '$1$2</a>')
      .replace('<link rel="stylesheet" href="/assets/css/aureum-service-cards.css">\n', '');
    assert.ok(restored.includes(section), file + ': original service markup is preserved inside the layout wrapper');
    assert.equal(restored, html);
    assert.equal(applyServiceCardStyles(result), result);
  }
  assert.equal(pages, 50);
});
