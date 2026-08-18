# Changelog — Aureum Site Comercial

Todas as mudanças relevantes devem ser registradas aqui.

## [4.0.3] — 2026-08-18

### Correção de publicação
- Corrigido o workflow do GitHub Pages: `actions/configure-pages@v6` foi substituído por `actions/configure-pages@v5`, versão disponível e documentada pelo GitHub.
- O push no `main` dispara uma nova tentativa de publicação automaticamente.

## [4.0.2] — 2026-08-18

### Publicação
- Adicionado workflow em `.github/workflows/pages.yml` para publicação automática no GitHub Pages a cada push no branch `main`.
- Configurado deploy estático com `actions/checkout@v6`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v4` e `actions/deploy-pages@v4`.
- O endereço previsto de publicação é `https://gabrielgonzagasilva.github.io/Aureum-Site-Comercial/` após a ativação inicial do GitHub Pages no repositório.

## [4.0.1] — 2026-08-18

### Repositório oficial
- Publicação da baseline do site comercial no repositório `GabrielGonzagaSilva/Aureum-Site-Comercial`.
- README atualizado para definir este repositório e o branch `main` como fonte oficial das próximas evoluções do site.

### Correção funcional
- Remoção do JavaScript inline legado da home.
- Menu mobile, FAQ, animações, formulário, redes sociais e ano do footer passam a depender apenas de `assets/js/site.js`, evitando listeners duplicados e comportamento inconsistente.

## [4.0.0] — 2026-08-18

### Arquitetura
- Separação do HTML monolítico em `index.html`, CSS e JavaScript compartilhados.
- Criação de subpáginas para Portugal, Espanha, Austrália e Brasil.
- Criação de documentação para expansão de destinos.
- Definição deste repositório como fonte oficial do site comercial da Aureum.

### UX e responsividade
- Revisão do sistema global de espaçamentos com escalas fluidas.
- Ajustes de line-height, tracking e quebra tipográfica.
- Novos safeguards para 360px, 560px, tablet, desktop e ultrawide.
- Melhorias de legibilidade no footer.
- Manutenção de suporte a `prefers-reduced-motion`.

### Contato
- Inclusão de área de redes sociais no contato e footer.
- Criação de `assets/js/config.js` para inserir URLs oficiais sem editar múltiplas páginas.
- Links sociais permanecem desabilitados enquanto os endereços oficiais não forem informados.

### Conteúdo e navegação
- Cards de países agora abrem suas respectivas subpáginas.
- Breadcrumbs e CTAs de retorno/contato adicionados nas páginas de destino.

## [3.0.0] — 2026-08-18
- Baseline visual editorial sofisticada aprovada para o site comercial.
