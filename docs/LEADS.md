# Recebimento de solicitações — Aureum

## Estado atual

A interface dos formulários foi preparada para e-mail opcional e telefone/WhatsApp opcional com código internacional. Pelo menos um dos dois meios deve ser informado. O build transforma os 500 formulários existentes nas 50 páginas de marketing, sem duplicar a lógica nas páginas de origem.

O endpoint `/api/leads` existe, mas o recebimento está **intencionalmente desabilitado**. Enquanto a responsável técnica não aprovar o aviso de privacidade, a finalidade da coleta, o texto de consentimento, o acesso interno e o prazo de retenção, o navegador não envia dados pessoais ao servidor. Nesse estado, o formulário apenas prepara uma mensagem local para revisão e cópia; não existe confirmação de recebimento.

## Arquitetura preparada

- `scripts/lead-forms.mjs`: transforma os formulários existentes durante o build.
- `public/assets/js/aureum-lead-form.js`: validação no navegador, normalização E.164, preparação local da mensagem e envio após ativação autorizada.
- `api/leads.mjs`: endpoint same-origin, validação no servidor, honeypot, tempo mínimo de preenchimento, rate limiting complementar e persistência privada.
- `server/leads-core.mjs`: regras puras de validação, sanitização e controle de ativação.
- A persistência usa o Vercel Blob privado, sob o prefixo `leads/`, com `ttlDays` configurável. O prazo deve ser aprovado antes da ativação.

## Pendências para encerramento da Sprint 5

1. Katarina/responsável técnica aprovar o texto de consentimento, a finalidade, o aviso de privacidade, os perfis de acesso e o prazo de retenção.
2. Validar os textos aprovados nos cinco idiomas (PT/EN/ES/FR/DE).
3. Atualizar a constante `APPROVED_PRIVACY_NOTICE_VERSION` em `api/leads.mjs` com uma versão aprovada e registrada.
4. Somente após as aprovações, configurar na Vercel:
   - `AUREUM_LEADS_ENABLED=true`
   - `AUREUM_LEADS_PRIVACY_APPROVED=true`
   - `AUREUM_LEADS_PRIVACY_NOTICE_VERSION=<versão aprovada no código>`
   - `AUREUM_LEADS_RETENTION_DAYS=<prazo aprovado entre 1 e 730>`
5. Confirmar a conexão privada do Blob no ambiente de produção, sem expor valores de credenciais.
6. Fazer um envio controlado, confirmar o registro recuperável no Blob privado, validar a expiração e testar os caminhos de falha antes de divulgar o formulário como canal ativo.
7. Definir e implementar, em etapa própria, os canais de notificação por e-mail e WhatsApp. Nenhum dos dois está integrado ou ativo nesta versão.

A constante de versão aprovada permanece vazia por padrão. Assim, mesmo que alguma variável de ambiente seja configurada por engano, o endpoint continuará fechado até a aprovação e a atualização explícita do código.

## Limites atuais

- Nenhum e-mail ou WhatsApp automático é enviado.
- O modo local apenas prepara uma mensagem para o próprio visitante copiar e encaminhar.
- O endpoint responde com indisponibilidade enquanto o recebimento estiver desabilitado.
- A confirmação de recebimento só poderá ser exibida após persistência privada real.
- O rate limiter em memória é uma proteção complementar e não substitui um mecanismo distribuído.
- O prazo de retenção não está definido; `ttlDays` só deve ser configurado com o prazo aprovado.
