# Recebimento de solicitações — Aureum

## Estado atual

A interface do formulário foi preparada para e-mail opcional, telefone/WhatsApp opcional com código internacional e validação conjunta. O usuário precisa informar pelo menos um dos dois meios de contato.

O endpoint \`/api/leads\` existe, mas o recebimento está **intencionalmente desabilitado**. Enquanto o aviso de privacidade, a finalidade da coleta, o consentimento e a retenção não forem aprovados pela responsável técnica, o navegador não envia os dados ao servidor. O formulário permanece em modo de preparação local da mensagem, sem armazenamento ou confirmação de recebimento.

## Arquitetura preparada

- \`scripts/lead-forms.mjs\`: transforma os formulários existentes no build, sem duplicar markup em 50 páginas.
- \`public/assets/js/aureum-lead-form.js\`: validação no navegador, normalização E.164, modo de preparação local e envio após ativação autorizada.
- \`api/leads.mjs\`: endpoint same-origin, validação independente no servidor, honeypot, tempo mínimo de preenchimento, limite de tentativas em memória e persistência privada.
- \`server/leads-core.mjs\`: regras puras de validação, sanitização e controle de ativação.
- A persistência usa o Blob privado já conectado ao projeto, sob o prefixo \`leads/\`, com expiração automática por \`ttlDays\`. Não há cópia pública nem duplicação redundante dos dados de contato.

## Condições obrigatórias para ativação futura

1. Katarina/responsável técnica aprovar o texto do consentimento, finalidade, aviso de privacidade, acesso interno e prazo de retenção.
2. Atualizar o texto aprovado nas cinco línguas e a versão de \`APPROVED_PRIVACY_NOTICE_VERSION\` em \`api/leads.mjs\`.
3. Configurar na Vercel, somente após a aprovação:
   - \`AUREUM_LEADS_ENABLED=true\`
   - \`AUREUM_LEADS_PRIVACY_APPROVED=true\`
   - \`AUREUM_LEADS_PRIVACY_NOTICE_VERSION=<versão aprovada no código>\`
   - \`AUREUM_LEADS_RETENTION_DAYS=<prazo aprovado entre 1 e 730>\`
4. Confirmar \`BLOB_READ_WRITE_TOKEN\` no ambiente de produção. Essa variável já existe no projeto; não copie seu valor para código ou documentação.
5. Testar um envio controlado e confirmar o registro no Blob privado antes de anunciar o formulário como canal ativo.

O código mantém a versão aprovada vazia por padrão. Portanto, mesmo que alguma variável seja configurada por engano, o endpoint continua fechado até que a versão de privacidade seja atualizada no código.

## Limites atuais

- Nenhum e-mail ou WhatsApp automático é enviado.
- O modo local apenas prepara uma mensagem para revisão e cópia pelo próprio visitante.
- A confirmação de recebimento só aparece depois que o servidor confirmar a gravação privada.
- O limite de tentativas em memória é uma proteção complementar; não substitui um serviço distribuído de rate limiting.
- Os registros armazenados recebem TTL individual; o prazo deve ser definido pela responsável técnica.
