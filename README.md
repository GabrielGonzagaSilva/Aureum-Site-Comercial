# Aureum — Site Comercial

Repositório oficial do site institucional/comercial público da Aureum, completamente separado do Hub interno.

## Estrutura

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
