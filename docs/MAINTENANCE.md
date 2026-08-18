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

## Depois de alterar
- Validar links relativos.
- Testar menu mobile, foco por teclado, formulário e FAQ.
- Testar largura de 360px, 430px, 768px, 1024px, 1440px e 1920px.
- Conferir ausência de overflow horizontal.
- Registrar a mudança em `CHANGELOG.md` com data e impacto.

## Versionamento sugerido
- PATCH: correções de texto, espaçamento ou bug sem mudar estrutura.
- MINOR: nova seção, novo país ou comportamento compatível.
- MAJOR: mudança estrutural relevante, redesign ou quebra de compatibilidade.
