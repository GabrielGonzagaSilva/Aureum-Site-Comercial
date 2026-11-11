import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
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
const verification = await verify('public');
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
const assets = {};
for (const file of await filesUnder('public')) {
  assets[file.slice('public/'.length)] = createHash('sha256').update(await readFile(file)).digest('hex');
}
await writeFile('dist/release.json', JSON.stringify({
  commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || null,
  branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || null,
  ...verification,
  assets,
}, null, 2) + '\n');
console.log(`Built ${verification.pages} pages and ${verification.files} files from Git source.`);

