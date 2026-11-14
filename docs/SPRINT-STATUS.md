# AUREUM — Controle de Sprints

**Atualizado:** 14/11/2026  
**Repositório:** `GabrielGonzagaSilva/Aureum-Site-Comercial`  
**Branch:** `main`

## Sprint 5 — Formulário de contato

**Status:** Implementada e publicada; encerramento funcional pendente.

### Entregue
- 500 formulários transformados no build, distribuídos pelas 50 páginas de marketing.
- E-mail e telefone opcionais individualmente, com exigência de pelo menos um meio.
- Código internacional, DDD/código de área e normalização E.164.
- Validação no navegador e no servidor, mensagens nos cinco idiomas, honeypot e rate limiting complementar.
- Endpoint preparado para persistência privada no Vercel Blob.
- Recebimento online intencionalmente desabilitado até a aprovação de privacidade.

### Pendências obrigatórias
1. Aprovar com Katarina/responsável técnica a finalidade, o consentimento e o aviso de privacidade.
2. Aprovar o prazo de retenção, os perfis de acesso e os procedimentos de tratamento.
3. Validar os textos nos cinco idiomas.
4. Atualizar a versão aprovada no código e configurar as variáveis de ativação na Vercel somente depois da aprovação.
5. Testar um envio real, confirmar a gravação privada, a idempotência, a retenção e os erros.
6. Definir e implementar os canais de notificação por e-mail e WhatsApp em etapa própria.

**Não fazer:** ativar o endpoint, alterar a versão aprovada ou declarar recebimento funcional antes dessas validações.

## Sprint 6 — Testes, regressão e publicação

**Status:** Validação automatizada e publicação concluídas; validação manual de navegador pendente.

### Evidências automatizadas
- 32/32 testes aprovados; `npm audit --omit=dev --audit-level=high` sem vulnerabilidades.
- 51 páginas HTML no total: 50 páginas de marketing e a página de privacidade.
- 50 headers compartilhados e 500 formulários preservados no build.
- Testes de navegação, cinco idiomas, botões, cards, hierarquia editorial, formulários, validação, segurança da Mia e bloqueio de recebimento não aprovado.
- Build executado no GitHub Actions e deployment de produção confirmado.
- Smoke test do domínio: apex HTTP 200; cinco homepages e cinco rotas de Portugal em PT/EN/ES/FR/DE HTTP 200; CSS/JS compartilhados HTTP 200; `www` redireciona ao apex com HTTP 308.
- `/api/leads` permanece desabilitado (`enabled: false`) por decisão de privacidade. `/api/chat` GET retorna `ready`, mas uma resposta real do Gemini ainda não foi validada.
- Auditoria de dependências adicionada ao CI.
- Testes estáticos de metadados SEO, idioma, viewport, heading principal e headers de segurança adicionados.

### Pendências de validação manual
- Testar Chrome, Safari, Firefox e Edge, conforme disponibilidade.
- Testar 360, 430, 768, 1024, 1280, 1366, 1440 e 1920 px, além de alturas reduzidas e zoom 125%/150%.
- Conferir overflow, foco visível, teclado, leitor de tela e WCAG 2.2 AA.
- Fazer smoke test real da Mia com Gemini em produção, sem enviar dados pessoais.
- Testar formulário real apenas depois da aprovação da Sprint 5.

## Regras de encerramento
- CI aprovado não equivale a validação visual manual.
- Deployment READY não equivale a teste real de cada funcionalidade.
- Nenhuma pendência de privacidade pode ser contornada para concluir a sprint.
