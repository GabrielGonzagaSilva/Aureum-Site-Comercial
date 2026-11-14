# Changelog — Aureum Site Comercial

Todas as mudanças relevantes devem ser registradas aqui.\n\n## 2026-11-13 — Sprint 4: revisão linguística e localização\n\n- Revisados os textos editoriais, CTAs, formulários, mensagens de estado, descrições de destino e atributos de acessibilidade nas cinco versões linguísticas.\n- Corrigidas traduções literais e falsos cognatos que alteravam o sentido em EN, ES, FR e DE; padronizada a forma de tratamento em espanhol e alemão.\n- Localizados os 32 valores de `data-intent` e os 11 valores de `data-subject` usados nas mensagens de contato, preservando os 48 e 55 atributos presentes em cada página.\n- Corrigidos rótulos acessíveis do rodapé, indicação de localização, links sociais pendentes e termos de navegação/cookies.\n- Ajustado o título da seção Destinos em PT-BR para “Destinos, projetos e contextos diferentes”.\n- Criada uma camada central de copy em `scripts/localized-copy.mjs`, aplicada às 50 páginas no build antes da geração dos headers compartilhados.\n- Nenhuma exigência migratória, elegibilidade, prazo, preço, garantia, política de privacidade ou escopo de serviço foi alterado. A validação jurídica e migratória continua pendente da responsável técnica.\n- Adicionados testes automatizados para cobertura das 50 páginas, traduções de intenção e preservação da estrutura do formulário.\n

## 2026-11-13 — Sprint 3: responsividade, hierarquia e espaçamento

- Reauditadas as Sprints 1 e 2 na versão publicada: navegação compartilhada, variantes do wordmark, links localizados, botões em pílula, estados de interação e títulos dos cards preservados.
- Os cinco cabeçalhos editoriais passam a organizar título e descrição em uma única coluna em todos os tamanhos de tela, seguindo a hierarquia da seção Destinos.
- Removidas alturas fixas/mínimas dos cabeçalhos e títulos que podiam criar áreas vazias, inclusive nas traduções.
- Ajustada a largura da descrição de Destinos para 74ch e mantida como parágrafo contínuo, sem quebra manual.
- Mantidas as quebras editoriais dos títulos no desktop; em telas de até 1023px, os títulos passam a quebrar naturalmente.
- Refinado o ritmo vertical com tokens fluidos para cabeçalho, conteúdo e padding, com ajustes para tablet e mobile.
- Ampliada a validação automatizada para estrutura editorial, cinco idiomas, continuidade dos parágrafos e presença/ordem dos estilos compartilhados.


## 2026-11-13 — Sprint 2: botões, cards e padronização de componentes

- Padronizado o raio de pílula nos botões recorrentes, com override explícito para o CTA do header sólido e os botões editoriais que tinham regras mais específicas.
- Mantidos os controles de menu icon-only circulares, preservando suas dimensões e função.
- Corrigida a especificidade dos títulos de cards fotográficos: nomes de destinos permanecem brancos em `.dc` e `.dcard`, inclusive dentro de seções cujo estilo genérico de heading usa tinta escura.
- Adicionado feedback pressionado discreto e transição suave para CTAs editoriais; hovers, animações de seta/fotografia, foco visível e `prefers-reduced-motion` preservados.
- Adicionados testes automatizados para raio, contraste dos títulos e movimento reduzido, além de verificações no build para a presença das regras globais.
- CI e preview aprovados; PR #5 integrado à `main` e Sprint 2 publicada em produção no commit `321075f` (deployment `97VjEaBMwDQF11uVnpcs55PgdRc8`).

## 2026-11-12 — Sprint 1: headers, identidade visual e navegação

- Criado `scripts/shared-header.mjs` para normalizar o header desktop e o menu mobile no build, usando a versão localizada da home como referência de conteúdo para as páginas daquele idioma.
- Mantidos os textos aprovados em PT, EN, ES, FR e DE; links de logo, seções e seletor de idioma são adaptados à rota atual sem alterar o conteúdo das páginas.
- Centralizado em `public/aureum-enhancements.css` o layout desktop em grid, o header compacto para tablet, o menu mobile e a alternância explícita entre os SVGs branco e escuro.
- Preservado o comportamento especial do header sobre o hero da home e a navegação por teclado; nenhum asset de marca foi redesenhado ou removido.
- Adicionada validação estrutural e de links para as 50 páginas com header, além de testes unitários para a adaptação de rotas.
- Preview Vercel e CI aprovados; PR #4 integrado à `main` e implementação publicada em produção no commit `6f1a45f`.

## 2026-11-12 — Comportamento conversacional da Mia

- Ajustada a configuração privada da assistente para oferecer acolhimento e esclarecimento inicial antes de propor contato humano.
- Priorizado atendimento consultivo, com explicações de profundidade intermediária e encaminhamento contextualizado, sem repetição automática de convites comerciais.
- Preservados os limites de privacidade, informação migratória, elegibilidade, promessas comerciais, escopo verificado de serviços e idiomas.
- Instruções privadas continuam restritas à variável de ambiente da Vercel; este registro não contém o prompt.
- A implantação exige novo build de produção e teste de resposta real com o Gemini.

## [4.0.5] — 2026-10-17

### Impeccable quality gate
- Aplicado um passe completo de layout, adaptação responsiva e polish em todas as UIs públicas da Aureum.
- Grid desktop fixado em 12 colunas com 72 px de margem, 24 px de gutter e área útil de 1296 px; tablet em 8 colunas com 48 px de margem; mobile em 4 colunas com 20 px de margem.
- Removidos eyebrows/kickers, numeração ornamental, letras decorativas e tags sem função informacional.
- Tipografia revisada com display máximo de 96 px, tracking limitado a -0.04em, medidas de leitura mais controladas e body mobile mínimo de 16 px.
- Destinos no mobile passaram de carrossel obrigatório para fluxo vertical em uma coluna.
- Touch targets normalizados para no mínimo 44 px nos principais controles e links interativos.
- Contraste reforçado em placeholders, labels, footer e textos secundários em superfícies escuras.
- Setas e indicadores passaram a ser desenhados por CSS em vez de glifos Unicode decorativos.
- Scrollbar, caret, seleção, focus ring e estados de foco foram alinhados à paleta Aureum.
- Mantido suporte a `prefers-reduced-motion` e motion reduzido a transições discretas.
- Home e páginas de Portugal, Espanha, Austrália e Brasil foram sincronizadas com o mesmo contrato visual e responsivo.
- Figma atualizado com o mesmo quality gate nas versões desktop, tablet e mobile.
- UX Pilot preparado com briefing rígido equivalente para geração hi-fi consistente com o sistema Aureum.

## [4.0.4] — 2026-08-18

### Proteção de propriedade intelectual
- Revisão completa da home e das páginas de Portugal, Espanha, Austrália e Brasil para evitar exposição pública do método operacional da Aureum.
- Removidas sequências explícitas de análise, mapa documental, roadmap de execução, etapas internas e fluxos replicáveis por concorrentes.
- A seção pública de método foi reposicionada como **Abordagem Aureum**, comunicando apenas experiência percebida pelo cliente: individualização, responsabilidade, clareza, organização e acompanhamento.
- As páginas de destinos deixaram de apresentar processos em quatro etapas e passaram a comunicar princípios de experiência e atendimento.
- Copy comercial refinada para preservar autoridade e diferenciação sem revelar árvores de decisão, checklists, lógica de elegibilidade ou mecânica operacional.

### Governança
- `docs/MAINTENANCE.md` passou a conter uma regra permanente de proteção do conteúdo público.
- Fica proibida a publicação no site comercial de métodos passo a passo, critérios internos, checklists proprietários, roadmaps operacionais, lógica de precificação, inteligência competitiva, automações, prompts, dashboards e estruturas do Hub.

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
# 2026-11-11 — recuperação e consolidação de produção

- Recuperadas 51 páginas em cinco idiomas e todos os arquivos estáticos referenciados, incluindo vídeo, fotos, logos e Inter.
- Preservadas as 36 rotas traduzidas ausentes no Preview mais recente.
- Recuperadas as funções originais da Mia e o arquivo privado de conversas, com hashes conferidos contra a origem.
- Incorporados os ajustes de Mia, header, botões e paleta de 10–11/11.
- Corrigida a disputa de observadores que sobrescrevia o idioma da identidade da Mia e da identificação do Reino Unido.
- A Mia respeita o idioma da página e traduz a identificação do visitante no histórico da conversa.
- Retirado o rewrite de `/api/chat` para um deployment antigo, que causava erro 403 de origem no domínio principal.
- Removido o texto literal de escape no header e scripts da barra Vercel capturados em cópias antigas.
- Substituído o build que copiava deployments por build local e determinístico, sem dependência de URLs de Preview.
- Fixado Node.js 24 no projeto e no CI para impedir mudanças automáticas de versão principal.
- Unificada a publicação na integração GitHub → Vercel; configuração anterior de GitHub Pages preservada como registro, fora dos workflows ativos.

