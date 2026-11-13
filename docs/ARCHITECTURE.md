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

## Header e navegação compartilhados

- `scripts/shared-header.mjs` aplica um único componente de header e navegação mobile durante o build. As páginas iniciais de cada idioma fornecem as strings localizadas aprovadas; o build normaliza as 50 páginas com header sem reescrever o conteúdo principal.
- Em páginas de destino, o componente adapta somente os destinos dos links: logo e âncoras de seção retornam à home do mesmo idioma, e o seletor de idioma mantém o destino atual.
- O CSS responsivo global fica em `public/aureum-enhancements.css`; não criar correções isoladas por página.
- Os SVGs branco e escuro são variantes intencionais do mesmo wordmark, não duas marcas para exibição simultânea: branco sobre o hero transparente, escuro quando o header fica sólido e escuro no menu mobile.
- Faixas: navegação completa a partir de 1201px; header compacto entre 761px e 1200px; menu mobile até 760px. A navegação centralizada do hero inicial da home é preservada antes da revelação do header.
- `scripts/verify.mjs` valida um header, um menu mobile, um par de variantes de logo e os links localizados em todas as 50 páginas. `public/privacidade.html` permanece como página independente sem header.

## Botões e cards compartilhados

- `public/aureum-enhancements.css` concentra os ajustes globais de botões e cards de destino, aplicados às 50 páginas com header nos cinco idiomas.
- O CTA do header em estado sólido recebe um override explícito para manter o raio de pílula apesar da regra legada de 8px; botões editoriais e de ação usam o mesmo raio. Controles de menu icon-only permanecem circulares sem alteração de dimensão.
- Os títulos de cards fotográficos são explicitamente brancos em `.dc__title` e `.dcard-body h3`, evitando que a regra genérica de títulos das seções aplique a cor escura sobre fotografias.
- Os hovers existentes, a animação das setas e o movimento das fotografias são preservados. O estado pressionado usa deslocamento discreto; foco visível e `prefers-reduced-motion` continuam respeitados.
- As correções são exclusivamente de CSS: fotos, links, textos, estrutura e destinos não são reescritos.
