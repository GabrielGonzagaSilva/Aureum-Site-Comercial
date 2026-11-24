import { readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { filesUnder } from './verify.mjs';

export const siteOrigin = 'https://aureumassessoria.com.br';
const deploymentOrigin = 'https://aureum-site-comercial.vercel.app';
const canonicalLink = /<link\b[^>]*\brel=["']canonical["'][^>]*>/i;
const noindex = /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b)[^>]*>/i;

export async function applySearchMetadata(root = 'dist') {
  const urls = [];
  for (const file of (await filesUnder(root)).filter(file => file.endsWith('.html'))) {
    const route = '/' + relative(root, file).split(sep).join('/').replace(/(^|\/)index\.html$/, '$1');
    const url = siteOrigin + route;
    const original = await readFile(file, 'utf8');
    const updated = original.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i, head => {
      const normalized = head.replaceAll(deploymentOrigin, siteOrigin);
      if (noindex.test(normalized)) return normalized;

      urls.push(url);
      const link = `<link rel="canonical" href="${url}">`;
      return canonicalLink.test(normalized)
        ? normalized.replace(canonicalLink, link)
        : normalized.replace('</head>', `${link}\n</head>`);
    });
    if (updated !== original) await writeFile(file, updated);
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.sort().map(url => `  <url><loc>${url}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
  await writeFile(join(root, 'sitemap.xml'), sitemap);
  await writeFile(join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`);
}
