**Atualizado:** 20/11/2026ints

**Atualizado:** 14/11/2026  
**Repositório:** `GabrielGonzagaSilva/Aureum-Site-Comercial`  
**Branch:** `main`

## Sprint 5 — Formulário de contato

**Status:** Interface e backend preparados e publicados; ativação funcional pendente.

### Entregue
- 500 formulários transformados no build, distribuídos pelas 50 páginas de marketing.
- E-mail e telefone opcionais individualmente, com exigência de pelo menos um meio.
- Código internacional, DDD/código de área e normalização E.164.
- Validação no navegador e no servidor, mensagens nos cinco idiomas, honeypot e rate limiting complementar.
- Persistência privada no Vercel Blob, protegida por gates de privacidade e retenção.
- Integração server-side com Resend para notificação interna, com remetente/destinatário configuráveis, `reply_to` quando há e-mail e chave de idempotência.
- Tratamento localizado para falha de notificação sem afirmar que a equipe foi avisada.
- Destinatário e remetente configurados como variáveis Production não secretas na Vercel; API key e domínio de envio ainda não configurados.
- Recebimento online permanece intencionalmente desabilitado.

### Pendências obrigatórias
1. Katarina/responsável técnica aprovar finalidade, consentimento, aviso de privacidade, perfis de acesso e prazo de retenção.
2. Incluir o Resend no aviso e revisar o tratamento internacional e as condições contratuais do fornecedor.
3. Validar os textos aprovados nos cinco idiomas e registrar a versão oficial.
4. Criar/verificar `mail.aureumassessoria.com.br` no Resend, adicionar os registros gerados no Registro.br e criar uma API key restrita a envio.
5. Cadastrar `RESEND_API_KEY` como Secret na Vercel; somente após as aprovações, atualizar a constante e ativar as variáveis de recebimento/notificação.
6. Fazer um envio controlado, confirmar persistência privada, entrega real, idempotência, retenção e caminhos de falha.

**Não fazer:** ativar o endpoint, alterar a versão aprovada ou declarar o formulário funcional antes dessas validações.

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
