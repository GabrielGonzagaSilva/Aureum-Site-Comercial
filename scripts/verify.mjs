import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, dirname, extname, join, relative, basename } from 'node:path';
import { Script } from 'node:vm';
import { fileURLToPath } from 'node:url';

export async function filesUnder(root) {
  const entries = await readdir(root, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? filesUnder(join(root, e.name)) : [join(root, e.name)]))).flat().sort();
}

export async function verify(root = 'public') {
  const files = await filesUnder(root);
  const htmlFiles = files.filter(f => extname(f) === '.html');
  const failures = [];
  let scripts = 0;
  let headerPages = 0;
  let sharedHeaderPages = 0;
  const builtOutput = basename(resolve(root)) === 'dist';
  for (const file of files) {
    if (!['.html', '.css', '.js'].includes(extname(file))) continue;
    const content = await readFile(file, 'utf8');
    if (extname(file) === '.js') {
      try { new Script(content, { filename: file }); scripts++; } catch (e) { failures.push(e.message); }
      continue;
    }
    if (extname(file) === '.html') {
      if (/https:\/\/vercel\.live\//.test(content)) failures.push(`${file}: injected deployment toolbar`);
      if (/>\s*\\[nN]\s*</.test(content)) failures.push(`${file}: stray header escape`);
      const inline = [...content.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
      for (const [i, match] of inline.entries()) {
        if (/\bsrc\s*=|application\/ld\+json/i.test(match[1]) || !match[2].trim()) continue;
        try { new Script(match[2], { filename: `${file}:inline-${i}` }); scripts++; } catch (e) { failures.push(e.message); }
      }
      const headerIds = [...content.matchAll(/\sid=["']hdr["']/gi)];
      if (headerIds.length) {
        headerPages += 1;
        const headerBlocks = [...content.matchAll(/<header\b(?=[^>]*\sid=["']hdr["'])[^>]*>[\s\S]*?<\/header>/gi)];
        if (headerIds.length !== 1 || headerBlocks.length !== 1) failures.push(file + ': expected exactly one shared header');
        const header = headerBlocks[0]?.[0] ?? '';
        const headerOpen = header.match(/<header\b[^>]*>/i)?.[0] ?? '';
        const logoAnchors = [...header.matchAll(/<a(?=\s)[^>]*\sclass=["']logo["'][^>]*>/gi)];
        const whiteVariants = (header.match(/class=["'][^"']*logo-img--white[^"']*["']/gi) || []).length;
        const inkVariants = (header.match(/class=["'][^"']*logo-img--ink[^"']*["']/gi) || []).length;
        if (logoAnchors.length !== 1) failures.push(file + ': expected one desktop logo link');
        if (whiteVariants !== 1 || inkVariants !== 1) failures.push(file + ': expected one white and one ink logo variant');

        const menuIds = [...content.matchAll(/\sid=["']mmenu["']/gi)];
        const menuOpen = content.match(/<div\b(?=[^>]*\sid=["']mmenu["'])[^>]*>/i)?.[0] ?? '';
        const menuStart = content.search(/<div\b(?=[^>]*\sid=["']mmenu["'])[^>]*>/i);
        const menuSnippet = menuStart >= 0 ? content.slice(menuStart, menuStart + 1600) : '';
        const menuWhite = (menuSnippet.match(/class=["'][^"']*logo-img--white[^"']*["']/gi) || []).length;
        const menuInk = (menuSnippet.match(/class=["'][^"']*logo-img--ink[^"']*["']/gi) || []).length;
        if (menuIds.length !== 1) failures.push(file + ': expected exactly one mobile navigation container');
        if (menuWhite !== 1 || menuInk !== 1) failures.push(file + ': expected one white and one ink logo variant in mobile navigation');
        if (!/href=["']\/aureum-enhancements\.css(?:[?#][^"']*)?["']/i.test(content)) {
          failures.push(file + ': missing shared header stylesheet');
        }
        const sharedStylesheet = /<link\b(?=[^>]*href=["']\/aureum-enhancements\.css(?:[?#][^"']*)?["'])[^>]*>/i.exec(content);
        const lastInlineStyle = content.lastIndexOf('</style>');
        if (sharedStylesheet && sharedStylesheet.index < lastInlineStyle) {
          failures.push(file + ': shared override stylesheet must load after inline page styles');
        }
        const editorialHeaders = [...content.matchAll(/<header\b(?=[^>]*class=["'][^"']*\bpage-header\b[^"']*["'])[^>]*>([\s\S]*?)<\/header>/gi)];
        if (content.includes('id="home"') && editorialHeaders.length !== 5) {
          failures.push(file + ': expected five editorial section headers; found ' + editorialHeaders.length);
        }
        for (const [, block] of editorialHeaders) {
          if (!/<div\b(?=[^>]*class=["'][^"']*\bheading-group\b[^"']*["'])[^>]*>[\s\S]*?<\/div>\s*<p\b(?=[^>]*class=["'][^"']*\bpage-intro\b[^"']*["'])/i.test(block)) {
            failures.push(file + ': editorial description must follow its heading group');
          }
          const intro = block.match(/<p\b(?=[^>]*class=["'][^"']*\bpage-intro\b[^"']*["'])[^>]*>([\s\S]*?)<\/p>/i);
          if (intro && /<br\s*\/?>/i.test(intro[1])) {
            failures.push(file + ': editorial descriptions must not contain forced line breaks');
          }
        }
        const destinationStart = content.search(/<section\b(?=[^>]*\bid=["']destinos["'])/i);
        if (destinationStart >= 0) {
          const destinationEnd = content.indexOf('</section>', destinationStart);
          const destinationSection = content.slice(destinationStart, destinationEnd >= 0 ? destinationEnd : content.length);
          const destinationLead = destinationSection.match(/<p\b(?=[^>]*class=["'][^"']*\blead\b[^"']*["'])[^>]*>([\s\S]*?)<\/p>/i);
          if (destinationLead && /<br\s*\/?>/i.test(destinationLead[1])) {
            failures.push(file + ': destination description must remain a continuous paragraph');
          }
        }

        if (builtOutput) {
          const hasHeaderMarker = /data-aureum-component=["']shared-header["']/.test(headerOpen);
          const hasMenuMarker = /data-aureum-component=["']shared-mobile-navigation["']/.test(menuOpen);
          if (!hasHeaderMarker || !hasMenuMarker) failures.push(file + ': shared navigation was not generated by the build component');
          else sharedHeaderPages += 1;
        }

        const relativePath = relative(resolve(root), file).replace(/\\/g, '/');
        const segments = relativePath.split('/').filter(Boolean);
        const locale = ['en', 'es', 'fr', 'de'].includes(segments[0]) ? segments[0] : 'pt';
        const routeSegments = [...segments];
        if (routeSegments[routeSegments.length - 1] === 'index.html') routeSegments.pop();
        if (['en', 'es', 'fr', 'de'].includes(routeSegments[0])) routeSegments.shift();
        const destination = routeSegments[0] === 'destinos' ? routeSegments[1] : null;
        const homeHref = locale === 'pt' ? '/' : '/' + locale + '/';

        if (destination) {
          if (!header.includes('href="' + homeHref + '"')) failures.push(file + ': logo must return to the current locale home');
          for (const targetLocale of ['pt', 'en', 'es', 'fr', 'de']) {
            const prefix = targetLocale === 'pt' ? '' : '/' + targetLocale;
            const expected = prefix + '/destinos/' + destination + '/';
            if (!header.includes('href="' + expected + '"')) failures.push(file + ': language switcher is missing ' + expected);
          }
          for (const section of ['servicos', 'sobre', 'como-funciona', 'contato']) {
            if (!header.includes('href="' + homeHref + '#' + section + '"')) failures.push(file + ': section link must target ' + homeHref + '#' + section);
          }
        } else {
          if (!header.includes('href="#top"')) failures.push(file + ': homepage logo must target #top');
          for (const section of ['servicos', 'sobre', 'como-funciona', 'contato']) {
            if (!header.includes('href="#' + section + '"')) failures.push(file + ': homepage section link is missing #' + section);
          }
        }
      }
    }
    if (builtOutput) {
      const leadForms = [...content.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].filter((match) => {
        const open = match[0].match(/^<form\b[^>]*>/i)?.[0] ?? '';
        return /\bclass=["'][^"']*\blead\b[^"']*["']/i.test(open);
      });
      for (const [index, match] of leadForms.entries()) {
        const form = match[0];
        const open = form.match(/^<form\b[^>]*>/i)?.[0] ?? '';
        if (!/data-aureum-lead-form=["']v1["']/i.test(open)) failures.push(file + ': lead form ' + index + ' was not transformed');
        if (!/<select\b(?=[^>]*\bname=["']codigo_pais["'])/i.test(form)) failures.push(file + ': lead form ' + index + ' is missing the country code selector');
        if (!/<input\b(?=[^>]*\bname=["']whatsapp["'])(?=[^>]*\btype=["']text["'])/i.test(form)) failures.push(file + ': lead form ' + index + ' is missing the international phone input');
        if (/<input\b(?=[^>]*\bname=["']email["'])(?=[^>]*\brequired\b)/i.test(form)) failures.push(file + ': email must remain optional');
        if (!/contact-method-note/.test(form)) failures.push(file + ': lead form ' + index + ' is missing the contact requirement');
        if (!/name=["']website["']/.test(form)) failures.push(file + ': lead form ' + index + ' is missing the spam honeypot');
      }
      if (leadForms.length) {
        if (!/href=["']\/assets\/css\/aureum-lead-form\.css(?:[?#][^"']*)?["']/i.test(content)) failures.push(file + ': missing shared lead form stylesheet');
        if (!/src=["']\/assets\/js\/aureum-lead-form\.js(?:[?#][^"']*)?["']/i.test(content)) failures.push(file + ': missing shared lead form script');
      }
    }
    const references = [
      ...content.matchAll(/\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/gi),
      ...content.matchAll(/url\(\s*["']?([^\s)"']+)/gi),
    ];
    for (const [, value] of references) {
      if (/^(?:#|https?:|data:|blob:|mailto:|tel:|javascript:)/i.test(value)) continue;
      const pathname = value.split(/[?#]/)[0];
      if (!pathname || pathname.startsWith('/api/')) continue;
      const target = pathname.startsWith('/') ? resolve(root, '.' + pathname) : resolve(dirname(file), pathname);
      if (!target.startsWith(resolve(root) + '/') && target !== resolve(root)) { failures.push(`${file}: unsafe reference ${value}`); continue; }
      const candidates = [target, join(target, 'index.html')];
      if (!(await Promise.all(candidates.map(async p => { try { return (await stat(p)).isFile(); } catch { return false; } }))).some(Boolean)) failures.push(`${file}: missing ${value}`);
    }
  }
  for (const locale of ['', 'en/', 'es/', 'fr/', 'de/']) {
    for (const destination of ['portugal','espanha','australia','brasil','alemanha','canada','franca','irlanda','londres']) {
      const expected = join(root, locale, 'destinos', destination, 'index.html');
      if (!files.includes(expected)) failures.push(`Missing recovered route ${expected}`);
    }
  }
  const critical = ['assets/hero-tower-bridge.mp4', 'assets/brand/aureum-wordmark-outlined-v1-white.svg', 'assets/brand/aureum-wordmark-outlined-v1-ink.svg', 'assets/fonts/aureum-refined-inter-400.woff', 'assets/fonts/aureum-refined-inter-500.woff', 'assets/fonts/aureum-refined-inter-700.woff', 'mia-profile-picture.webp', 'mia-ui.js', 'aureum-updates.js', 'assets/js/aureum-lead-form.js', 'assets/css/aureum-lead-form.css'];
  for (const asset of critical) if (!files.includes(join(root, asset))) failures.push(`Missing critical asset ${asset}`);
  const sharedHeaderCss = await readFile(join(root, 'aureum-enhancements.css'), 'utf8').catch(() => '');
  const requiredHeaderRules = [
    '/* Sprint 1 — shared header component',
    '#hdr .navbar .wrap',
    '#hdr .logo-img--white',
    '#hdr.solid .logo-img--ink',
    '#mmenu .logo-img--ink',
    '@media(max-width:1200px)',
    '@media(max-width:760px)',
  ];
  for (const rule of requiredHeaderRules) {
    if (!sharedHeaderCss.includes(rule)) failures.push('Missing shared header rule: ' + rule);
  }
  const requiredSprint2Rules = [
    '/* Sprint 2 — buttons, cards and component states. */',
    '.site-hdr.solid .btn-hdr',
    '.ae-section a.ae-button',
    '.aureum-refined .primary-button',
    '.dc .dc__title',
    '.dcard .dcard-body h3',
    ':active:not(:disabled)',
    '@media (prefers-reduced-motion:reduce)',
  ];
  for (const rule of requiredSprint2Rules) {
    if (!sharedHeaderCss.includes(rule)) failures.push('Missing Sprint 2 UI rule: ' + rule);
  }
  const requiredSprint3Rules = [
    '/* Sprint 3 — responsive editorial hierarchy and spacing. */',
    '.aureum-refined .page-header',
    'grid-template-columns:minmax(0,1fr)!important',
    '.aureum-refined .page-title',
    '#home #destinos .sec-head .lead',
    '--aureum-editorial-header-gap:clamp',
    '--aureum-editorial-section-gap:clamp',
    'text-wrap:pretty',
    '@media (max-width:1023px)',
    '@media (max-width:767px)',
  ];
  for (const rule of requiredSprint3Rules) {
    if (!sharedHeaderCss.includes(rule)) failures.push('Missing Sprint 3 editorial rule: ' + rule);
  }
  if (headerPages !== 50) failures.push('Expected 50 pages with a shared header; found ' + headerPages);
  if (builtOutput && sharedHeaderPages !== 50) failures.push('Expected 50 build-generated shared headers; found ' + sharedHeaderPages);
  if (htmlFiles.length !== 51) failures.push(`Expected 51 recovered pages; found ${htmlFiles.length}`);
  if (failures.length) throw new Error([...new Set(failures)].join('\n'));
  return { pages: htmlFiles.length, files: files.length, parsedScripts: scripts, headerPages, sharedHeaderPages };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await verify(), null, 2));

