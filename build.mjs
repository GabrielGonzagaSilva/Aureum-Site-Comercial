import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { applySharedHeader } from './scripts/shared-header.mjs';
import { applyLocalizedCopy } from './scripts/localized-copy.mjs';
import { verify, filesUnder } from './scripts/verify.mjs';

// Builds use only versioned source. No deployment, URL, or network is a build input.
// The connector's upload limit requires storing the original video as binary parts.
// Reassembly is lossless and verified against the recovered original's SHA-256.
const media = JSON.parse(await readFile('media/hero-tower-bridge/manifest.json', 'utf8'));
const videoParts = [];
for (const part of media.parts) {
  const bytes = await readFile(part.path);
  if (bytes.length !== part.bytes || createHash('sha256').update(bytes).digest('hex') !== part.sha256) throw new Error(`Invalid video part: ${part.path}`);
  videoParts.push(bytes);
}
const video = Buffer.concat(videoParts);
if (video.length !== media.bytes || createHash('sha256').update(video).digest('hex') !== media.sha256) throw new Error('Recovered video checksum mismatch');
await mkdir('public/assets', { recursive: true });
await writeFile(media.output, video);
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
const localizedCopy = await applyLocalizedCopy('dist');
console.log('Applied localized copy to ' + localizedCopy.pages + ' pages (' + localizedCopy.changed + ' updated).');
await applySharedHeader('dist');
const outputFiles = await filesUnder('dist');
const versions = new Map();
for (const file of outputFiles.filter(file => /\.(?:js|css)$/.test(file))) {
  const hash = createHash('sha256').update(await readFile(file)).digest('hex').slice(0, 12);
  versions.set('/' + file.slice('dist/'.length), hash);
}
for (const file of outputFiles.filter(file => file.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const versioned = html.replace(/\b(href|src)=(['"])(\/[^'"?]+\.(?:js|css))\2/g, (match, attribute, quote, url) => {
    const version = versions.get(url);
    return version ? `${attribute}=${quote}${url}?v=${version}${quote}` : match;
  });
  await writeFile(file, versioned);
}
const verification = await verify('dist');
const assets = {};
for (const file of outputFiles) {
  assets[file.slice('dist/'.length)] = createHash('sha256').update(await readFile(file)).digest('hex');
}
await writeFile('dist/release.json', JSON.stringify({
  commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || null,
  branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || null,
  ...verification,
  assets,
}, null, 2) + '\n');
console.log(`Built ${verification.pages} pages and ${verification.files} files from Git source.`);

