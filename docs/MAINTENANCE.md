# Processo obrigatório de manutenção

## Antes de alterar
- Identificar se a mudança é visual, conteúdo, funcionalidade, SEO, acessibilidade ou arquitetura.
- Confirmar se afeta home, subpáginas ou componente compartilhado.
- Priorizar alteração compartilhada em `assets/` quando o comportamento deve valer para todas as páginas.

## Ao alterar
- Preservar identidade visual aprovada: papel quente, preto profundo, latão, serif editorial e sans funcional.
- Evitar padrões visuais genéricos de SaaS/IA: cards excessivos, gradientes decorativos, ícones repetitivos e efeitos sem função.
- Não duplicar CSS por página sem justificativa.
- Não inserir informações internas do Hub.

## Limite obrigatório do conteúdo público
O site comercial deve comunicar **valor, escopo, confiança, destinos, serviços e experiência do cliente**, sem transformar a propriedade intelectual da Aureum em conteúdo público.

Não publicar no site comercial:
- método operacional passo a passo;
- sequência interna de análise ou execução;
- árvores de decisão, matrizes, critérios internos de elegibilidade ou priorização;
- checklists proprietários e mapas documentais internos;
- roadmaps operacionais detalhados usados pela equipe;
- lógica de precificação, margem ou posicionamento competitivo;
- fontes internas de pesquisa, monitoramento e inteligência de mercado;
- automações, prompts, agentes, dashboards ou estruturas do Hub;
- playbooks, SOPs, scripts internos ou mecanismos de validação proprietários.

Quando for necessário explicar como é trabalhar com a Aureum, priorizar linguagem de **experiência e resultado percebido pelo cliente** — por exemplo: atendimento individual, clareza, atualização, responsabilidade e acompanhamento — sem revelar a mecânica interna que produz esses resultados.

## Localização e conteúdo multilíngue
- Centralizar correções de copy em `scripts/localized-copy.mjs`; não replicar manualmente o mesmo texto nas páginas geradas.
- O build aplica as correções às 50 páginas localizadas em `dist/`, antes da normalização do header.
- Manter os valores de `data-intent` e `data-subject` no idioma da página para que a mensagem preparada corresponda à experiência apresentada.
- Não alterar afirmações migratórias, textos de privacidade, elegibilidade, requisitos, prazos, preços ou garantias sem fonte oficial e validação da responsável técnica.

## Depois de alterar
- Validar links relativos.
- Testar menu mobile, foco por teclado, formulário e FAQ.
- Testar largura de 360px, 430px, 768px, 1024px, 1440px e 1920px.
- Conferir ausência de overflow horizontal.
- Revisar o conteúdo público sob o critério de proteção de propriedade intelectual.
- Registrar a mudança em `CHANGELOG.md` com data e impacto.

## Versionamento sugerido
- PATCH: correções de texto, espaçamento ou bug sem mudar estrutura.
- MINOR: nova seção, novo país ou comportamento compatível.
- MAJOR: mudança estrutural relevante, redesign ou quebra de compatibilidade.


## Formulários e dados de contato

- Os formulários públicos são transformados por \`scripts/lead-forms.mjs\` durante o build; não editar cópias geradas em páginas individuais.
- E-mail e telefone são opcionais separadamente, mas pelo menos um deve ser informado. Telefone deve ser normalizado para E.164.
- O endpoint \`/api/leads\` permanece fechado até aprovação do aviso de privacidade, consentimento, finalidade e retenção pela responsável técnica.
- Nunca ativar \`AUREUM_LEADS_ENABLED\` antes de atualizar o texto aprovado nos cinco idiomas e a versão de privacidade no código.
- Dados de contato só podem ser confirmados após persistência privada real. Não apresentar mensagem de sucesso baseada apenas em resposta do navegador.
