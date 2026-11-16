# Revisão do site — 16/11/2026

Escopo: identidade visual, textos de interface, hierarquia tipográfica, margens, espaçamento, grids, navegação, acessibilidade e movimento. Preservados os serviços, as fotografias fornecidas, a marca vetorial, os cinco idiomas e os fluxos de contato existentes.

## Problemas verificados e corrigidos

| Prioridade | Evidência anterior | Resultado |
| --- | --- | --- |
| P1 | Dourado pequeno com contraste de 4,43:1 sobre branco e 2,89:1 sobre marfim | Tom de texto `#795629` e superfícies claras coerentes; os contrastes reprovados deixam de aparecer nas auditorias. |
| P1 | Menu móvel deixava o conteúdo de fundo alcançável pelo teclado | Fundo isolado com `inert`, foco contido no menu e retorno ao acionador ao fechar. |
| P2 | Títulos de seção em 52 e 47,52 px no desktop; 29, 32 e 33 px no celular | Uma escala por função, Inter 500: 52 px em 1440 px e 32 px em 390 px. Hero, cards com foto e diálogo preservam hierarquias próprias. |
| P2 | Margens de 80 e 116 px no mesmo desktop | Um container e margens compartilhados para os blocos de conteúdo. |
| P2 | Seções somavam padding externo e interno; blocos comuns tinham 115,2 px por lado em 1440 px | Um responsável pelo espaçamento: até 64 px por lado no desktop e 36 px no celular. |
| P2 | Títulos com `<br>` escondido no celular juntavam palavras | Separadores reais preservam a leitura nos cinco idiomas. |
| P2 | Rodapé mostrava quatro serviços antigos e levava apenas à seção genérica | Cinco serviços atuais, na ordem aprovada, com suas páginas específicas. |
| P2 | Teaser antigo mencionava programas e países e voltava à lista de destinos | Resumo dos cinco serviços existentes com acesso à seção correta. |
| P2 | Fragmento de URL malformado podia interromper o roteador | Decodificação protegida, mantendo a página e o contato disponíveis. |
| P1 | Um alinhamento de fragmento aguardava `window.load` e podia desfazer a rolagem do visitante após imagens demoradas, reproduzido no WebKit em espanhol | Alinhamento na preparação do DOM, sem sobrescrever uma mudança de posição ou navegação posterior; regressão com carregamento atrasado. |
| P2 | Correções de identidade dependiam de CSS injetado depois do carregamento | Estilos compartilhados estáticos, versionados no build e disponíveis antes da pintura. |
| P2 | Bandeiras dependiam de requisições externas; fontes redundantes eram solicitadas apesar da Inter local | SVGs locais e remoção dos links de fontes externas nos arquivos gerados. |
| P2 | Redução de movimento usava durações globais de 0,01 ms; efeitos de atenção continuavam sem um ciclo de vida comum | Feedback de cor preservado, deslocamentos reduzidos e efeitos pausados com aba oculta, menu ou painel aberto. |

## Movimento

O momento principal continua sendo o hero em vídeo e a passagem para a marca no cabeçalho. A revisão não adiciona entradas repetidas que escondam conteúdo enquanto o usuário rola.

- Controles: 160 ms; menus e painéis de navegação: 220 ms; aproximação das fotografias: 420 ms.
- Movimento reduzido: feedback de cor de 100 ms e aparição discreta dos menus, sem deslocamento.
- Mantida a pausa do vídeo quando fora da tela ou com preferência por movimento reduzido.
- Removido `will-change` permanente das ondas dos acionadores flutuantes.

## Cobertura de verificação

- Build e verificação estática das 76 páginas, incluindo as 25 páginas iniciais de serviços e o documento de privacidade.
- Varredura de layout das 50 páginas de marketing em 1440 e 390 px: sem overflow horizontal ou erros de JavaScript observados.
- 106 endereços internos únicos conferidos contra os arquivos gerados: nenhum destino inexistente.
- Regressão dos serviços, cabeçalho e contato em 360, 430, 768, 1024, 1440 e 1920 px, incluindo telas de baixa altura, teclado, retorno do foco, rolagem e preservação do formulário.
- Auditorias axe das homepages nos cinco idiomas e das páginas representativas de destino. Isso verifica critérios automatizáveis; não substitui testes com tecnologias assistivas e dispositivos físicos.
- Auditoria das dependências de produção sem vulnerabilidades reportadas.
- 36 testes unitários aprovados e 114 cenários de navegador cobertos entre Chromium e WebKit. A falha reproduzida de rolagem foi corrigida; os cenários do cabeçalho em espanhol, navegação/contato e carregamento tardio passaram após a correção nos dois mecanismos. O ajuste de espera do teste mantém todas as exigências de visibilidade e proporção do logo.

## Limites preservados

- As páginas específicas dos serviços continuam com conteúdo em preparação, conforme a decisão anterior.
- O envio de formulários permanece desativado. O fluxo disponível prepara a mensagem para revisão, sem simular envio.
- O WhatsApp depende da configuração do número oficial; os estados de indisponibilidade e disponibilidade continuam explícitos.
- Não foram alterados termos de privacidade, integrações, credenciais, retenção ou regras comerciais.
