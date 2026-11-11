# Arquitetura do site comercial da Aureum

## Estrutura vigente desde 11/11/2026

- `public/`: fonte estática oficial recuperada, com 51 páginas em cinco idiomas, fotos, fontes e identidade vetorial.
- `media/hero-tower-bridge/`: partes binárias e manifesto do vídeo original; o build recompõe o MP4 e verifica o SHA-256, sem baixar nenhum deployment.
- `api/chat.mjs`: entrada pública da Mia, com arquivo privado de conversas; `server/chat-core.mjs` contém o núcleo recuperado. A API executa no mesmo deployment do site, sem rewrite para versões antigas.
- `build.mjs`: validação de integridade, sintaxe e rotas; saída em `dist/`; metadados verificáveis em `release.json`.
- `vercel.json`: configuração de build e cache; integração Git no projeto existente, com `main` em Production e outras branches em Preview.
- `archive/github-20261106/`: arquivos anteriores do GitHub, preservados como histórico e excluídos da saída pública.
- `docs/recovery/`: proveniência e hashes da recuperação. Nenhum script de recuperação é executado no fluxo normal de publicação.

O build de produção também executa os testes da API. As credenciais permanecem na Vercel e não fazem parte do repositório. As seções abaixo registram a arquitetura anterior; os caminhos ativos são os listados acima.

## Objetivo

Manter o site comercial completamente separado do Hub interno e permitir expansão para novos destinos com baixo custo de manutenção.

## Princípios

1. **Home única e editorial**: concentra posicionamento, método, atuação, confiança, FAQ e contato.
2. **Subpáginas por destino**: cada país possui URL própria em `paises/<slug>.html`.
3. **Design centralizado**: toda regra visual está em `assets/css/styles.css`.
4. **Comportamento centralizado**: menu, animações, FAQ, formulário e configuração social ficam em `assets/js/`.
5. **Conteúdo público apenas**: nenhuma informação do Hub interno, inteligência competitiva, precificação estratégica, dashboards ou processo operacional deve ser exposta.
6. **Progressive enhancement**: navegação e conteúdo permanecem legíveis sem depender de frameworks.

## Responsividade

Breakpoints principais: 1180px, 1050px, 900px, 760px, 560px, 430px e 360px. Há também ajuste para telas acima de 1700px.

A escala de espaçamento utiliza `clamp()` e tokens (`--pad`, `--section`, `--flow-*`) para reduzir saltos bruscos entre tamanhos. Títulos usam `text-wrap: balance` e parágrafos `text-wrap: pretty` para diminuir quebras tipográficas ruins.

## Redes sociais

Os canais oficiais ficam em `assets/js/config.js`. Enquanto uma URL estiver vazia, o canal aparece desabilitado e não gera link falso.

## Logo

Quando a marca final for recebida, substituir o wordmark textual por um componente de logo compartilhado no header e no footer. Preservar `aria-label` e dimensões responsivas.
