# Changelog — Aureum Site Comercial

Todas as mudanças relevantes devem ser registradas aqui.


## 2026-11-15 — Logo móvel: um controlador de visibilidade e variantes estáticas

- Reproduzida em produção a duplicação entre o logo central do hero e o wordmark do cabeçalho abaixo de 761px. O runtime desativava o gerenciamento no mobile, enquanto um segundo controlador inline continuava alterando `inert` e `aria-hidden`.
- Removidos os cinco controladores inline redundantes. O controlador compartilhado passa a usar o mesmo limiar do hero em todas as larguras, com atualização em scroll, resize, retorno à página e navegação por hash. O menu móvel preserva seu próprio logo.
- Centralizadas na folha compartilhada as variantes branca/escura e a visibilidade inicial, evitando dependência de CSS injetado tardiamente. Preservados SVGs, conteúdo e idiomas. A imagem mantém sua proporção ao atingir a altura máxima; a geometria do wordmark fica reservada e respeita movimento reduzido.
- Corrigida a posição do botão do menu no tablet enquanto o seletor de idioma está centralizado sobre o hero.
- Substituído o teste de correspondência de strings por 14 cenários de navegador: seis larguras (360/430/768/1024/1440/1920px), home e Portugal nos cinco idiomas, carregamento lento do runtime, mudanças de breakpoint, preferência escura do dispositivo, movimento reduzido, teclado e axe no cabeçalho. Cada cenário roda em Chromium e WebKit móvel no CI.
- Validação local: 35 testes unitários, build de 76 páginas, verificação estática e `git diff --check` aprovados. A execução local dos navegadores foi impedida pelas restrições do ambiente; a validação de navegação acontece no CI antes da liberação em produção.

## 2026-11-14 — Serviços: cinco cards com título e navegação própria

- Mantido o visual aprovado dos cards de países e atualizada a ordem para Vistos, Cidadania, Passaporte e documentos, Intercâmbio e Viagens internacionais.
- Removidas as descrições. Cada card apresenta apenas o título e o CTA “Conhecer serviço”, com traduções em EN, ES, FR e DE. Toda a área do card é clicável.
- Os links agora navegam para rotas individuais estáveis de serviço, em vez de abrir o contato. Criadas páginas iniciais mínimas com marca, idioma, título, aviso de conteúdo em preparação e retorno aos serviços; os conteúdos definitivos serão preparados depois. Essas páginas permanecem fora da indexação até serem concluídas.
- Grid com três cards na primeira linha e dois centralizados na segunda no desktop; duas colunas no tablet e uma no celular. Fotografias e tratamento visual preservados, com duas fotos adicionais da biblioteca existente.
- Validação local: 36 testes unitários e 22 cenários Playwright aprovados, cobrindo os cinco serviços nos cinco idiomas, navegação pelos cards e CTAs, retorno, acessibilidade e seis larguras em Chromium/WebKit. Build com 76 páginas; os 50 headers e 500 formulários existentes permanecem preservados.
- A navegação é verificada em cenários independentes por idioma, aguardando o documento de destino para respeitar o orçamento de tempo do CI. O vídeo do hero é bloqueado apenas nessa suíte de serviços; as fotos dos cards e todas as verificações de navegação/acessibilidade permanecem reais.

## 2026-11-14 — Serviços: três categorias no mesmo componente dos países

- Recriada a seção com exatamente três categorias: Vistos, Cidadania e Passaporte e documentos. Adicionadas descrições introdutórias curtas em PT, EN, ES, FR e DE, prontas para receber o conteúdo definitivo.
- Reutilizado o componente real dos cards de países: fotografia de fundo inteiro, tratamento escuro na base, título e descrição brancos, divisor e CTA com seta. As fotografias já pertencem à biblioteca do site.
- Mantidas três colunas no desktop, duas com o último card centralizado no tablet e uma no celular. O restante da página e os cards de países permanecem preservados.
- Cada botão abre o modal existente com a categoria correspondente. Nenhuma lógica de formulário, integração ou coleta de dados foi alterada.
- Validação: build de 51 páginas e 35 testes unitários; cobertura Playwright de seis larguras em Chromium e WebKit, acessibilidade e abertura dos três serviços nos cinco idiomas.

## 2026-11-14 — Serviços: cards com foto parcial e transição para branco

- Aplicado aos cinco serviços atuais o formato vertical inspirado nos cards de destinos: fotografia na metade superior, máscara em degradê fluido para branco, título e descrição em área limpa e CTA alinhado ao rodapé.
- Reutilizadas fotografias já versionadas do site. Os títulos, descrições, textos dos botões, IDs acessíveis, links e contextos de contato permanecem exatamente como estavam em PT, EN, ES, FR e DE.
- Grid com três colunas no desktop, duas no tablet e uma no celular; o card de cidadania utiliza o mesmo formato dos demais. O conteúdo cresce quando uma tradução exige mais espaço, sem alturas fixas que cortem texto.
- Alteração centralizada no build e em uma folha de estilos restrita à seção Serviços; os cards de destinos e as demais seções não foram redesenhados. Nenhuma lógica de formulário, integração ou coleta de dados foi alterada.
- Validação local: 35 testes unitários, build de produção e verificações estáticas aprovados. Os 14 novos cenários Playwright passaram em Chromium e WebKit, cobrindo seis larguras, carregamento das fotos, proporção da imagem, ausência de cortes e acessibilidade nas cinco línguas.

## 2026-11-14 — Contato: superfície branca, marca e alternativa WhatsApp

- Substituído o marfim do modal e dos campos por branco, preservando a Inter local, os tons floresta/esmeralda, o backdrop e as correções de rolagem existentes.
- Integrado o wordmark vetorial oficial ao topo. A faixa da marca e do fechamento permanece sticky; apresentação e formulário rolam normalmente, inclusive em janelas baixas.
- Adicionada alternativa de conversa pelo WhatsApp, com ícone oficial já existente, tradução em cinco idiomas e link externo com `noopener noreferrer`. A mensagem inicial é genérica: nenhum nome, e-mail, telefone ou texto preenchido no formulário é incluído no link.
- O botão lê a configuração existente `AUREUM_INTEGRATIONS.whatsappNumber`. Sem um número válido, apresenta estado indisponível e orienta para o formulário; nenhum número fictício é publicado.
- Mantidos o formulário único, os dados digitados, a navegação por teclado, as duas colunas no desktop e a coluna única em telas menores. A coleta online de leads permanece desativada.
- A entrada mantém conteúdo e backdrop visíveis desde o primeiro frame. Removida a transição inicial de opacidade, que o CI reproduziu travando no WebKit; mantidos deslocamento sutil, saída e movimento reduzido.
- Acrescentados testes de identidade visual, logo, estados do WhatsApp, abertura em nova aba sem envio de dados do formulário e acessibilidade.

## 2026-11-14 — Modal de contato: estabilidade, vidro e layout responsivo

- Corrigida a restauração que herdava `scroll-behavior: smooth`; a posição é capturada antes de mover o formulário ou chamar `showModal()` e restaurada instantaneamente, sem alterar URL, hash ou histórico.
- Preservados o espaço original do cartão e a extensão rolável do documento durante o bloqueio com body fixo. Isso evita colapso da seção, mudanças no header dependente de scroll e deslocamento no rodapé ao fechar uma revisão mais curta. Apenas estilos de bloqueio são restaurados; propriedades de outras integrações são preservadas.
- Compensação de scrollbar com gutter estável, sem compensação dupla. O menu móvel libera seu bloqueio antes da abertura e recupera foco no botão do menu.
- Mantidos diálogo nativo, fundo inerte, Escape e clique externo; adicionados ciclo de Tab, fechamento externo protegido contra arraste, foco com `preventScroll`, associação dos erros aos campos e proteção contra inicialização duplicada.
- Backdrop floresta com blur de 4px, superfície marfim discretamente translúcida, borda fina, sombra moderada, fallback opaco e transições de 160ms com movimento reduzido respeitado. Mantida a Inter local e a paleta oficial.
- Modal de até 980px: nome/e-mail e telefone/destino em duas colunas a partir de 800px; mensagem e avisos em largura total. Em telas menores, uma coluna, campos legíveis, safe areas, fechamento sticky e rolagem interna. `visualViewport`, resize e limite em `dvh` acomodam janelas baixas e teclado virtual sem alturas fixas de conteúdo.
- Mesmo formulário, IDs, valores, listeners, contexto dos CTAs, traduções PT/EN/ES/FR/DE, validação internacional e consentimento preservados. Nenhuma alteração na API ou ativação da coleta/persistência/notificação de leads.
- Adicionada suíte Playwright com axe, servidor local do build e execução no CI; instruções no README. Cobertura de ciclos repetidos no topo/meio/rodapé, foco, CTAs, navegação hash, revisão local sem POST, seis larguras, altura curta, idiomas e reflow equivalente a zoom de 200%.
- Validação local concluída: 34 testes unitários, 32 cenários Playwright em Chromium/WebKit, axe sem violações reportadas nas homepages e páginas de Portugal dos cinco idiomas, build de produção (51 páginas), verificações estáticas e auditoria de dependências de produção sem vulnerabilidades reportadas.
- Emulação automatizada não substitui teste de teclado virtual e gestos em Safari/iOS ou Chrome/Android físicos, nem auditoria manual com leitor de tela.

## 2026-11-14 — Preservar a posição da página ao abrir o modal

- Ajustada a captura dos CTAs para a fase de captura do evento, impedindo que a navegação por âncora/hash aconteça antes da abertura do modal.
- O fundo agora fica realmente travado na posição atual durante a abertura, com compensação da barra de rolagem; ao fechar, o scroll e os estilos inline anteriores são restaurados.
- Mantida a navegação normal dos links que não são CTAs de contato.
- Ampliados os testes de regressão para verificar captura do clique, bloqueio de navegação e restauração da posição.

## 2026-11-14 — Corrigir logo mobile e abrir contato em modal

- Identificada a causa da duplicação visual: o JavaScript de atualizações injetava tardiamente display:block!important em todas as imagens de logo, anulando a alternância de cores. Corrigida a regra na origem e explicitada a versão adequada ao fundo, inclusive no menu móvel.
- CTAs de contato abrem um diálogo nativo responsivo com desfoque leve, botão de fechar, Escape, foco controlado e rolagem interna. Links comuns de navegação continuam funcionando.
- O cartão do formulário principal existente é movido temporariamente para o diálogo e devolvido ao ponto original no fechamento, sem clonar formulários, IDs ou listeners.
- Preservados contexto e seleção de destino/objetivo dos CTAs.
- Mantida a preparação local da mensagem e a API de leads desativada até aprovação da privacidade; nenhum envio automático foi ativado.
- Adicionados testes de regressão para o cabeçalho e o modal nos cinco idiomas.

## 2026-11-14 — Sprint 6: regressão automatizada, segurança e publicação

- Suíte automatizada final: 32/32 testes aprovados, sem falhas; o build gerou 51 páginas e 114 arquivos a partir do Git.
- Confirmada a estrutura de 50 páginas de marketing em cinco idiomas, 50 headers compartilhados e 500 formulários transformados (10 por página).
- Confirmados os testes de localização, navegação, botões/cards, hierarquia editorial, formulário internacional, validação E.164, consentimento, privacidade, rate limiting e bloqueio do endpoint antes da leitura do corpo.
- `npm ci` e `npm audit --omit=dev --audit-level=high` concluíram com zero vulnerabilidades; a auditoria de produção permanece obrigatória no CI.
- Acrescentada auditoria estática de metadados SEO, idioma do documento, viewport, heading principal e preservação da página de privacidade.
- Reforçados os headers globais de segurança: nosniff, Referrer-Policy, proteção contra framing, HSTS e Permissions-Policy.
- O deployment de produção ficou READY e o domínio apex respondeu HTTP 200. As cinco homepages, as cinco versões da página de Portugal e os três assets compartilhados de navegação/formulário responderam HTTP 200; `www` redireciona para o domínio apex com HTTP 308.
- O endpoint `/api/leads` respondeu `enabled: false`, conforme o bloqueio de privacidade esperado. `/api/chat` respondeu `ready` no GET; isso confirma configuração, não uma resposta real do Gemini. A validação visual manual em navegadores e resoluções reais continua pendente.
- O teste de recebimento real de leads permanece bloqueado até a aprovação documentada da Sprint 5. A conversa real com Gemini/Mia também requer smoke test de produção; os testes automatizados atuais cobrem o núcleo com provedor simulado.

## 2026-11-13 — Sprint 5: formulário de contato e preparação das integrações

**Situação:** implementação publicada; encerramento funcional pendente de aprovação de privacidade e teste real de recebimento.

- Centralizada no build a transformação dos formulários existentes nas 50 páginas localizadas, sem duplicar markup nas páginas de origem.
- E-mail e telefone/WhatsApp passam a ser individualmente opcionais; a validação exige pelo menos um meio de contato.
- Adicionado seletor de código internacional, alternativa para códigos não listados e entrada do número nacional com DDD/código de área. A normalização do telefone gera formato E.164 antes do envio.
- Implementadas validações no navegador e no servidor, mensagens localizadas em PT/EN/ES/FR/DE, estados acessíveis, honeypot e proteção complementar contra envios automatizados.
- Preparada a API `/api/leads` para persistência privada no Vercel Blob, com identificador idempotente, validação same-origin e expiração automática configurável.
- **Recebimento online permanece desabilitado.** O texto atual de consentimento ainda descreve apenas a preparação da mensagem; não houve aprovação do novo aviso, finalidade, acesso e prazo de retenção. Nesse estado, o navegador não envia dados pessoais ao endpoint e apenas prepara a mensagem localmente.
- Nenhuma integração de e-mail ou WhatsApp foi ativada ou simulada. A confirmação de recebimento só poderá aparecer após gravação privada real.
- Adicionados testes de transformação multilíngue, opcionalidade dos contatos, formato E.164, sanitização, ativação condicionada à privacidade, rate limiting e bloqueio do endpoint antes da leitura de dados pessoais.

## 2026-11-13 — Sprint 4: revisão linguística e localização

- Revisados os textos editoriais, CTAs, formulários, mensagens de estado, descrições de destino e atributos de acessibilidade nas cinco versões linguísticas.
- Corrigidas traduções literais e falsos cognatos que alteravam o sentido em EN, ES, FR e DE; padronizada a forma de tratamento em espanhol e alemão.
- Localizados os 32 valores de `data-intent` e os 11 valores de `data-subject` usados nas mensagens de contato, preservando os 48 e 55 atributos presentes em cada página.
- Corrigidos rótulos acessíveis do rodapé, indicação de localização, links sociais pendentes e termos de navegação/cookies.
- Ajustado o título da seção Destinos em PT-BR para “Destinos, projetos e contextos diferentes”.
- Criada uma camada central de copy em `scripts/localized-copy.mjs`, aplicada às 50 páginas no build antes da geração dos headers compartilhados.
- Nenhuma exigência migratória, elegibilidade, prazo, preço, garantia, política de privacidade ou escopo de serviço foi alterado. A validação jurídica e migratória continua pendente da responsável técnica.
- Adicionados testes automatizados para cobertura das 50 páginas, traduções de intenção e preservação da estrutura do formulário.


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

