import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const LOCALES = ['pt', 'en', 'es', 'fr', 'de'];

function findElementById(html, tagName, id) {
  const openingPattern = new RegExp("<" + tagName + "\\b(?=[^>]*\\sid=[\"']" + id + "[\"'])[^>]*>", "i");
  const opening = openingPattern.exec(html);
  if (!opening) return null;

  const tokenPattern = new RegExp('<!--[\\s\\S]*?-->|<\\/?' + tagName + '\\b[^>]*>', 'gi');
  tokenPattern.lastIndex = opening.index;
  let depth = 0;
  let token;

  while ((token = tokenPattern.exec(html))) {
    if (token[0].startsWith('<!--')) continue;
    if (token[0].startsWith('</')) depth -= 1;
    else if (!token[0].endsWith('/>')) depth += 1;

    if (depth === 0) {
      return {
        start: opening.index,
        end: tokenPattern.lastIndex,
        markup: html.slice(opening.index, tokenPattern.lastIndex),
      };
    }
  }
  return null;
}

function replaceElementById(html, tagName, id, replacement) {
  const block = findElementById(html, tagName, id);
  if (!block) throw new Error('Could not find <' + tagName + ' id="' + id + '">');
  return html.slice(0, block.start) + replacement + html.slice(block.end);
}

function localeFromPath(relativePath) {
  const first = relativePath.split('/')[0];
  return LOCALES.includes(first) ? first : 'pt';
}

function destinationFromPath(relativePath) {
  const segments = relativePath.split('/').filter(Boolean);
  if (segments[segments.length - 1] === 'index.html') segments.pop();
  if (['en', 'es', 'fr', 'de'].includes(segments[0])) segments.shift();
  if (segments[0] !== 'destinos' || !/^[a-z0-9-]+$/i.test(segments[1] || '')) return null;
  return 'destinos/' + segments[1] + '/';
}

export function adaptNavigationMarkup(markup, locale, routeSuffix = null) {
  if (!LOCALES.includes(locale)) throw new Error('Unsupported Aureum locale: ' + locale);
  if (!routeSuffix) return markup;
  if (!/^destinos\/[a-z0-9-]+\/$/i.test(routeSuffix)) {
    throw new Error('Invalid destination route for shared navigation: ' + routeSuffix);
  }

  const homeHref = (locale === 'pt' ? '' : '/' + locale) + '/';
  let output = markup;

  output = output.replace(
    /(<a\b(?=[^>]*\sclass=["'][^"']*\blog\b[^"']*["'])[^>]*\shref=["'])#top(["'])/gi,
    function (_match, prefix, suffix) { return prefix + homeHref + suffix; }
  );

  output = output.replace(
    /href=(["'])#(servicos|sobre|como-funciona|contato)\1/gi,
    function (_match, quote, section) { return 'href=' + quote + homeHref + '#' + section + quote; }
  );

  output = output.replace(
    /(<nav\b(?=[^>]*\sclass=["'][^"']*\baureum-locale__panel\b[^"']*["'])[^>]*>[\s\S]*?<\/nav>)/gi,
    function (panel) {
      return panel.replace(
        /href=(["'])\/(?:(en|es|fr|de)\/)?\1/gi,
        function (_match, quote, targetLocale) {
          const targetPrefix = targetLocale ? '/' + targetLocale : '';
          return 'href=' + quote + targetPrefix + '/' + routeSuffix + quote;
        }
      );
    }
  );

  return output;
}

function markComponent(markup, name) {
  return markup.replace(/^<(header|div)\b/i, '<$1 data-aureum-component="' + name + '"');
}

async function htmlFilesUnder(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return htmlFilesUnder(path);
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
  }));
  return nested.flat();
}

export async function applySharedHeader(root = 'dist') {
  const rootPath = resolve(root);
  const templates = new Map();

  for (const locale of LOCALES) {
    const homePath = locale === 'pt'
      ? join(rootPath, 'index.html')
      : join(rootPath, locale, 'index.html');
    const homeHtml = await readFile(homePath, 'utf8');
    const header = findElementById(homeHtml, 'header', 'hdr');
    const mobile = findElementById(homeHtml, 'div', 'mmenu');

    if (!header || !mobile) {
      throw new Error('Missing canonical header or mobile navigation for locale ' + locale);
    }
    templates.set(locale, { header: header.markup, mobile: mobile.markup });
  }

  const htmlFiles = await htmlFilesUnder(rootPath);
  let processed = 0;

  for (const file of htmlFiles) {
    const relativePath = relative(rootPath, file).replace(/\\/g, '/');
    let html = await readFile(file, 'utf8');
    if (!/\sid=["']hdr["']/i.test(html)) continue;

    const locale = localeFromPath(relativePath);
    const routeSuffix = destinationFromPath(relativePath);
    const template = templates.get(locale);
    const header = markComponent(adaptNavigationMarkup(template.header, locale, routeSuffix), 'shared-header');
    const mobile = markComponent(adaptNavigationMarkup(template.mobile, locale, routeSuffix), 'shared-mobile-navigation');

    html = replaceElementById(html, 'header', 'hdr', header);
    html = replaceElementById(html, 'div', 'mmenu', mobile);
    await writeFile(file, html);
    processed += 1;
  }

  if (processed !== 50) {
    throw new Error('Expected to normalize 50 localized headers; found ' + processed);
  }

  console.log('Applied the shared header and mobile navigation to ' + processed + ' pages across ' + LOCALES.length + ' locales.');
  return { pages: processed, locales: LOCALES.length };
}
