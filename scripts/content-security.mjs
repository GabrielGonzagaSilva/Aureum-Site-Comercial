import { createHash } from 'node:crypto';

export function applyContentSecurity(html) {
  const hashes = new Set();
  for (const [, attributes, script] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (!script.trim() || /\ssrc\s*=|application\/ld\+json/i.test(attributes)) continue;
    const hash = createHash('sha256').update(script.replace(/\r\n?/g, '\n')).digest('base64');
    hashes.add(`'sha256-${hash}'`);
  }
  const policy = [
    "default-src 'none'",
    ["script-src 'self'", ...hashes].join(' '),
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data:",
    "media-src 'self'",
    "connect-src 'self'",
    "form-action 'none'",
  ].join('; ');
  return html.replace(/<head\b[^>]*>/i, `$&\n<meta http-equiv="Content-Security-Policy" content="${policy}">`);
}
