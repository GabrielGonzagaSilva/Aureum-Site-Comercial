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
