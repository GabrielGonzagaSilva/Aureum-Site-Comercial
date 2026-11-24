import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { filesUnder } from '../scripts/verify.mjs';
import { applySearchMetadata } from '../scripts/search-metadata.mjs';
import { applyServicePages } from '../scripts/service-cards.mjs';

const files = await filesUnder('public');
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const marketingPages = [];

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  if (/\sid=["']hdr["']/i.test(html)) marketingPages.push({ file, html });
}

function localeFromFile(file) {
  const path = relative('public', file).replace(/\\/g, '/');
  const first = path.split('/').filter(Boolean)[0];
  return ['en', 'es', 'fr', 'de'].includes(first) ? first : 'pt';
}

test('all 50 marketing pages retain localized document and SEO metadata', () => {
  assert.equal(htmlFiles.length, 51, 'the recovered site must keep all 51 HTML pages');
  assert.equal(marketingPages.length, 50, 'the site must keep 50 marketing pages');

  const expectedLanguage = { pt: 'pt-BR', en: 'en', es: 'es', fr: 'fr', de: 'de' };
  for (const { file, html } of marketingPages) {
    const locale = localeFromFile(file);
    const language = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1] || '';
    const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
    const descriptionTag = html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i)?.[0] || '';
    const description = descriptionTag.match(/\bcontent=["']([^"']+)["']/i)?.[1]?.trim() || '';
    const viewportTag = html.match(/<meta\b(?=[^>]*\bname=["']viewport["'])[^>]*>/i)?.[0] || '';
    const headingCount = (html.match(/<h1\b/gi) || []).length;

    assert.equal(language, expectedLanguage[locale], file + ': document language must match its route');
    assert.ok(title.length >= 8, file + ': page title must be present');
    assert.ok(description.length >= 40, file + ': localized meta description must be present');
    assert.match(viewportTag, /width=device-width/i, file + ': responsive viewport metadata is required');
    assert.ok(headingCount >= 1, file + ': a primary page heading must be present');
  }
});

test('privacy information page remains available in Brazilian Portuguese', async () => {
  const html = await readFile('public/privacidade.html', 'utf8');
  assert.match(html, /<html\b[^>]*\blang=["']pt-BR["']/i);
  assert.match(html, /<title\b[^>]*>[^<]+<\/title>/i);
  assert.match(html, /robots["'][^>]*content=["']index,follow["']/i);
});

test('search metadata uses the production domain and omits noindex pages from the sitemap', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'aureum-search-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const pages = ['index.html', 'en/destinos/portugal/index.html', 'privacidade.html'];
  for (const page of pages) {
    const target = join(root, page);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, await readFile(join('public', page)));
  }
  await applyServicePages(root);
  await writeFile(join(root, 'draft.html'), '<html><head><meta name="robots" content="noindex,follow"></head></html>');

  await applySearchMetadata(root);
  const origin = 'https://aureumassessoria.com.br';
  const routes = ['/', '/en/destinos/portugal/', '/privacidade.html'];
  for (const [index, page] of pages.entries()) {
    const head = (await readFile(join(root, page), 'utf8')).split('</head>')[0];
    assert.ok(head.includes(`<link rel="canonical" href="${origin}${routes[index]}">`), page);
    assert.doesNotMatch(head, /aureum-site-comercial\.vercel\.app/);
  }
  const english = await readFile(join(root, pages[1]), 'utf8');
  assert.ok(english.includes(`hreflang="pt-BR" href="${origin}/destinos/portugal/"`));
  assert.ok(english.includes(`property="og:url" content="${origin}/en/destinos/portugal/"`));
  const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  assert.equal(urls.length, 28);
  assert.ok(routes.every(route => urls.includes(origin + route)));
  assert.ok(urls.includes(`${origin}/servicos/vistos/`));
  assert.doesNotMatch(sitemap, /draft\.html/);
  assert.equal(await readFile(join(root, 'robots.txt'), 'utf8'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
});

test('production response headers include baseline transport and browser protections', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  const globalRule = config.headers.find((rule) => rule.source === '/(.*)');
  const headers = new Map((globalRule?.headers || []).map(({ key, value }) => [key.toLowerCase(), value]));

  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(headers.get('x-frame-options'), 'DENY');
  assert.equal(headers.get('strict-transport-security'), 'max-age=31536000');
  assert.equal(headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=()');
  assert.match(headers.get('content-security-policy'), /frame-ancestors 'none';.*form-action 'none'/);
});
