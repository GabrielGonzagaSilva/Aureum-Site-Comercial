"""One-time, hash-verified recovery. This script is not used by normal builds."""
import concurrent.futures as cf
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'docs/recovery/source-manifest.json').read_text())
allowed_hosts = {
    'aureum-site-comercial-c2wk7b3ue-gabrielgonzagasilvas-projects.vercel.app',
    'aureum-site-comercial-exqbkg9q8-gabrielgonzagasilvas-projects.vercel.app',
}

def restore(item):
    url = urlsplit(item['source'])
    if url.scheme != 'https' or url.hostname not in allowed_hosts:
        raise RuntimeError('Source is outside the approved deployments')
    target = (root / item['path']).resolve()
    if not target.is_relative_to(root / 'public'):
        raise RuntimeError('Destination is outside public/')
    for attempt in range(3):
        try:
            with urlopen(Request(item['source'], headers={'User-Agent':'Aureum-Recovery/1.0'}), timeout=60) as response:
                data = response.read()
            if len(data) != item['bytes'] or hashlib.sha256(data).hexdigest() != item['sha256']:
                raise RuntimeError('Recovered bytes do not match the reviewed snapshot: ' + item['path'])
            break
        except Exception:
            if attempt == 2:
                raise
    if target.suffix == '.html':
        text = data.decode('utf-8')
        text = re.sub(r'<script\b[^>]*\bsrc=["\']https://vercel\.live/[^>]*></script>', '', text, flags=re.I)
        text = re.sub(r'(?<=>)\s*\\[nN]\s*(?=<)', '\n', text)
        data = text.encode('utf-8')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    return item['path']

with cf.ThreadPoolExecutor(max_workers=8) as pool:
    restored = list(pool.map(restore, manifest['files']))
print(f'Restored and verified {len(restored)} files from frozen deployment snapshots.')

