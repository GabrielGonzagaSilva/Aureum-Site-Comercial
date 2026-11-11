# Aureum — Site Comercial

Repositório oficial do site institucional/comercial público da Aureum, completamente separado do Hub interno.

## Fonte de produção — recuperação de 11/11/2026

O código servido está em `public/` e a API da Mia em `api/chat.mjs`, com o núcleo em `server/chat-core.mjs`. São 51 páginas recuperadas (home e nove destinos em cinco idiomas, mais privacidade), fotos, vídeo, logos vetoriais, fontes Inter e os ajustes mais recentes. O conteúdo anterior do GitHub foi preservado em `archive/github-20261106/` e no histórico.

`main` → integração Git da Vercel → build → Production → https://aureum-site-comercial.vercel.app/. Branches secundárias geram Preview no mesmo projeto. Não publique alterações diretamente por upload de arquivos: faça commit para manter a origem rastreável.

```sh
npm ci
npm test
npm run build
```

O build valida links, arquivos essenciais e sintaxe dos scripts e copia exclusivamente os arquivos versionados para `dist/`. Não baixa conteúdo de deployments anteriores. `release.json` informa o commit e os hashes dos arquivos publicados.

O vídeo original é armazenado em partes binárias em `media/hero-tower-bridge/`, devido ao limite de transferência do conector. O build o recompõe sem perda e confere o SHA-256 antes de publicar.

As credenciais existentes continuam configuradas na Vercel. `.env.example` lista somente os nomes. Nunca coloque segredos em `public/`, commits ou logs. O WhatsApp oficial não tinha número configurado na versão recuperada; seus controles continuam informando essa situação sem inventar um contato.

`docs/recovery/` registra os deployments consultados e os hashes dos arquivos originais. `scripts/restore-recovery.py` é um instrumento de recuperação histórica e não faz parte do build normal.

## Estrutura anterior (preservada no arquivo)

- `index.html` — home comercial.
- `paises/` — subpáginas de destinos.
- `assets/css/styles.css` — sistema visual e responsividade compartilhados.
- `assets/js/config.js` — configuração central de canais e links externos.
- `assets/js/site.js` — comportamento compartilhado.
- `docs/` — arquitetura, processo de manutenção, expansão e changelog.

## Fonte oficial

Este repositório é a baseline oficial do site comercial da Aureum. Evoluções futuras do site devem partir do branch `main` deste repositório e respeitar a documentação em `docs/`.

## Publicação

A estrutura é estática e compatível com GitHub Pages e outros provedores de hospedagem estática, sem acoplamento ao Hub interno.

## Regra de manutenção

Toda alteração funcional, visual, estrutural ou de conteúdo relevante deve gerar uma entrada em `docs/CHANGELOG.md`.
