# Recebimento de solicitações — Aureum

## Estado atual

A interface dos formulários está preparada para e-mail opcional e telefone/WhatsApp opcional com código internacional. Pelo menos um dos dois meios deve ser informado. O build transforma os 500 formulários existentes nas 50 páginas de marketing, sem duplicar a lógica nas páginas de origem.

O endpoint `/api/leads` permanece **intencionalmente desabilitado**. A responsável técnica ainda precisa aprovar o aviso de privacidade, a finalidade da coleta, o texto de consentimento, o acesso interno e o prazo de retenção. Até lá, o navegador não envia dados pessoais ao servidor; o formulário apenas prepara uma mensagem local para revisão e cópia.

## Arquitetura

- `scripts/lead-forms.mjs`: transforma os formulários existentes durante o build.
- `public/assets/js/aureum-lead-form.js`: validação no navegador, normalização E.164, preparação local da mensagem e envio após ativação autorizada.
- `api/leads.mjs`: endpoint same-origin, validação no servidor, honeypot, tempo mínimo de preenchimento, rate limiting complementar e persistência privada.
- `server/leads-core.mjs`: regras puras de validação e controle de ativação.
- `server/lead-notifications.mjs`: notificação transacional server-side pela API do Resend, sem expor credenciais no navegador.
- A persistência usa Vercel Blob privado, sob o prefixo `leads/`, com `ttlDays` configurável. O prazo precisa ser aprovado antes da ativação.

## Notificação por e-mail

A integração com **Resend** está implementada no código, mas não está ativa.

- Destinatário interno: `contato.aureum@outlook.com`.
- Remetente planejado: `Aureum <notificacoes@mail.aureumassessoria.com.br>`.
- A API grava primeiro o registro no Blob privado e, depois, solicita o envio da notificação.
- Se o visitante informou e-mail, a mensagem usa esse endereço como `reply_to`; se informou somente telefone, esse campo é omitido.
- O conteúdo é enviado como texto simples, sem anexos, pixels de rastreamento ou links públicos para os registros.
- A chamada usa uma chave de idempotência baseada no identificador da solicitação. Uma repetição do mesmo envio pode ser tentada sem duplicar a mensagem dentro da janela de idempotência do provedor.
- Se o armazenamento for concluído, mas o provedor rejeitar a notificação, a API retorna `notification_failed`. A interface informa que a solicitação foi registrada, mas a equipe ainda não foi notificada, e permite tentar novamente.

### Configuração pendente do provedor

1. Criar/acessar uma conta Resend da Aureum.
2. Adicionar o subdomínio `mail.aureumassessoria.com.br` como domínio de envio.
3. Copiar os registros DNS gerados pelo próprio Resend e cadastrá-los no Registro.br. O domínio está usando os nameservers `d.sec.dns.br` e `f.sec.dns.br`; a zona DNS não é gerenciada pela Vercel. Não altere nameservers nem registros MX existentes. Adicione somente os registros de envio solicitados pelo Resend e confirme a verificação do domínio.
4. Criar uma API key com permissão restrita a envio e ao domínio verificado.
5. Cadastrar `RESEND_API_KEY` como variável **Secret** no ambiente Production do projeto Vercel. Nunca colocar a chave no GitHub, em arquivo público ou no navegador.

As variáveis de destinatário, remetente e controle de notificação já podem ser mantidas na Vercel como configuração não secreta. A chave do Resend e a verificação DNS ainda não estão configuradas.

## Aprovações e ativação obrigatórias

1. Katarina/responsável técnica aprovar a finalidade, o texto de consentimento, o aviso de privacidade, os perfis de acesso, os procedimentos de tratamento e o prazo de retenção.
2. A revisão deve incluir o Resend como fornecedor que recebe dados pessoais para encaminhar a notificação, além do tratamento internacional e das condições contratuais aplicáveis. O aviso atual de privacidade do assistente não substitui um aviso específico para o formulário de contato.
3. Validar o texto aprovado nos cinco idiomas (PT/EN/ES/FR/DE). Não alterar o consentimento atual nem publicar um aviso como aprovado sem essa revisão.
4. Atualizar `APPROVED_PRIVACY_NOTICE_VERSION` em `api/leads.mjs` com uma versão aprovada e registrada.
5. Confirmar a conexão privada do Blob e aprovar o prazo de retenção entre 1 e 730 dias.
6. Depois das aprovações e da configuração do Resend, configurar na Vercel:
   - `AUREUM_LEADS_ENABLED=true`
   - `AUREUM_LEADS_PRIVACY_APPROVED=true`
   - `AUREUM_LEADS_PRIVACY_NOTICE_VERSION=<versão aprovada no código>`
   - `AUREUM_LEADS_RETENTION_DAYS=<prazo aprovado>`
   - `AUREUM_LEADS_NOTIFICATION_ENABLED=true`
   - `RESEND_API_KEY=<chave secreta criada no Resend>`
7. Fazer um envio controlado, confirmar o registro no Blob privado e acompanhar no Resend o estado real da mensagem (incluindo entrega), além de testar repetição, falhas e expiração antes de divulgar o formulário como canal ativo.

A constante `APPROVED_PRIVACY_NOTICE_VERSION` permanece vazia por padrão. Assim, mesmo que variáveis de ambiente sejam configuradas por engano, o endpoint continuará fechado até a aprovação e a atualização explícita do código.

## Limites atuais

- Nenhum e-mail ou WhatsApp automático é enviado nesta versão.
- O modo local apenas prepara uma mensagem para o visitante copiar e encaminhar.
- A integração Resend está publicada no código, mas depende de conta, domínio verificado e API key.
- O recebimento online permanece indisponível enquanto qualquer requisito de privacidade, retenção, armazenamento ou notificação estiver ausente.
- A confirmação exibida ao visitante só ocorre depois da persistência privada e da aceitação da notificação pelo provedor; isso não substitui a verificação posterior de entrega na caixa de entrada.
- O rate limiter em memória é uma proteção complementar e não substitui um mecanismo distribuído.
