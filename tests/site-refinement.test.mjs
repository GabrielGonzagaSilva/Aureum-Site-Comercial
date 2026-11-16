import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {filesUnder} from '../scripts/verify.mjs';
import {localeFromPath,transformLocalizedHtml} from '../scripts/localized-copy.mjs';
import {refineSiteHtml} from '../scripts/site-refinement.mjs';
import {serviceNavigation} from '../scripts/service-cards.mjs';

test('all marketing routes share an idempotent system and the five current service links',async()=>{
  let pages=0;
  for(const file of (await filesUnder('public')).filter(f=>f.endsWith('.html'))) {
    const source=await readFile(file,'utf8');
    if(!source.includes('id="hdr"'))continue;
    const locale=localeFromPath(file.slice('public/'.length));
    const output=refineSiteHtml(transformLocalizedHtml(source,locale),locale);
    assert.equal(refineSiteHtml(output,locale),output,file+': repeated builds must not duplicate assets');
    assert.equal((output.match(/href="\/assets\/css\/aureum-site-system.css"/g)||[]).length,1);
    assert.equal((output.match(/src="\/assets\/js\/aureum-site-system.js"/g)||[]).length,1);
    assert.doesNotMatch(output,/<link\b[^>]*https:\/\/fonts\.(googleapis|gstatic)\.com/);
    assert.doesNotMatch(output,/https:\/\/flagcdn\.com\//);
    const footer=output.match(/<footer class="foot">[\s\S]*?<\/footer>/)[0];
    for(const service of serviceNavigation(locale)) assert.ok(footer.includes('href="'+service.href+'"'),file+': footer must reach '+service.title);
    assert.ok(output.includes('class="pcard site-service-overview"'));
    assert.ok(output.includes("try { id = decodeURIComponent(location.hash.slice(1)); } catch"));
    assert.equal((output.match(/\bdata-intent=/g)||[]).length,(source.match(/\bdata-intent=/g)||[]).length);
    for(const [,title] of output.matchAll(/<h2\b[^>]*class="page-title"[^>]*>([\s\S]*?)<\/h2>/g)) assert.doesNotMatch(title,/\S<br\s*\/?>\S/);
    pages++;
  }
  assert.equal(pages,50);
});
