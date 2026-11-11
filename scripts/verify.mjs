import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, dirname, extname, join, relative } from 'node:path';
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
  const critical = ['assets/hero-tower-bridge.mp4', 'assets/brand/aureum-wordmark-outlined-v1-white.svg', 'assets/brand/aureum-wordmark-outlined-v1-ink.svg', 'assets/fonts/aureum-refined-inter-400.woff', 'assets/fonts/aureum-refined-inter-500.woff', 'assets/fonts/aureum-refined-inter-700.woff', 'mia-profile-picture.webp', 'mia-ui.js', 'aureum-updates.js'];
  for (const asset of critical) if (!files.includes(join(root, asset))) failures.push(`Missing critical asset ${asset}`);
  if (htmlFiles.length !== 51) failures.push(`Expected 51 recovered pages; found ${htmlFiles.length}`);
  if (failures.length) throw new Error([...new Set(failures)].join('\n'));
  return { pages: htmlFiles.length, files: files.length, parsedScripts: scripts };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await verify(), null, 2));

