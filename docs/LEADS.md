# Recebimento de solicitações — Aureum

## Estado atual

A interface dos formulários está preparada para e-mail opcional e telefone/WhatsApp opcional com código internacional. Pelo menos um dos dois meios deve ser informado. O build transforma os 500 formulários existentes nas 50 páginas de marketing, sem duplicar a lógica nas páginas de origem.

O endpoint `/api/leads` permanece **intencionalmente desabilitado**. A aprovação jurídica do aviso de privacidade, da finalidade, do texto apresentado ao titular, dos perfis de acesso e do prazo de retenção ainda não foi concluída. Até lá, o navegador não envia dados pessoais ao servidor; o formulário apenas prepara uma mensagem local para revisão e cópia.

Na configuração de produção consultada em 21/11/2026:
- `AUREUM_LEADS_ENABLED=false`
- `AUREUM_LEADS_PRIVACY_APPROVED=false`
- `AUREUM_LEADS_NOTIFICATION_ENABLED=false`
- `AUREUM_LEADS_PRIVACY_NOTICE_VERSION` ainda não está cadastrada.
- `AUREUM_LEADS_RETENTION_DAYS` ainda não está cadastrada.
- A constante `APPROVED_PRIVACY_NOTICE_VERSION` permanece vazia no código.

Esses bloqueios devem permanecer até a aprovação e os testes finais.

## Arquitetura

- `scripts/lead-forms.mjs`: transforma os formulários existentes durante o build.
- `public/assets/js/aureum-lead-form.js`: validação no navegador, normalização E.164, preparação local da mensagem e envio após ativação autorizada.
- `api/leads.mjs`: endpoint same-origin, validação no servidor, honeypot, tempo mínimo de preenchimento, rate limiting complementar e persistência privada.
- `server/leads-core.mjs`: regras puras de validação e controle de ativação.
- `server/lead-notifications.mjs`: notificação transacional server-side pela API do Resend, sem expor credenciais no navegador.
- O código usa `@vercel/blob` 2.9.0 para enviar `ttlDays` e confirmar `expiresAt` antes de notificar a equipe. Os registros novos usam `leads/<id>.json` no Blob privado. Uma repetição só reutiliza um registro ativo com os mesmos dados. O teste de expiração real continua pendente, pois depende do prazo aprovado e de um armazenamento autorizado para a verificação.

## Infraestrutura e isolamento confirmados

- As Vercel Functions estão fixadas na região `iad1` (Washington, D.C., Estados Unidos), também declarada em `vercel.json`.
- O Vercel Blob conectado ao projeto é o armazenamento privado `aureum-private-conversations`, também na região `iad1`.
- O armazenamento tem os prefixos históricos `conversations/` e `backup/`. O código de recebimento online usa `leads/` quando aprovado e habilitado.
- O token do Blob fica restrito ao ambiente Production. A API pública da Mia está pausada e responde `503` antes de ler a conversa ou chamar fornecedores.
- Os previews e URLs de deployment geradas pela Vercel exigem autenticação Vercel; os domínios de produção continuam públicos.
- O repositório GitHub é público. O arquivo `.env.example` contém apenas nomes de variáveis sem valores, e `.gitignore` exclui arquivos `.env*`, exceto esse modelo. Não armazenar dados de leads, conversas, documentos ou credenciais no GitHub.

### Dados do assistente Mia

Quando a Mia estava ativa, o conteúdo da conversa passava pelo Google Gemini para gerar respostas. O código anterior arquivava em produção o último texto do visitante, a resposta e metadados técnicos, em duas cópias privadas (`conversations/` e `backup/`). Esses registros históricos precisam de um prazo aprovado e de uma regra aplicada às duas cópias. A página pública de privacidade explica o histórico e o funcionamento atual.

## Notificação por e-mail

A integração com **Resend** está implementada no código, mas não está ativa.

- O destinatário e o remetente planejados estão cadastrados como variáveis de configuração no ambiente Production.
- `RESEND_API_KEY` está cadastrada na Vercel como variável Secret em Production.
- `AUREUM_LEADS_NOTIFICATION_ENABLED=false`; portanto, nenhuma notificação automática é enviada.
- A verificação atual do domínio de envio não pode ser confirmada pelas configurações da Vercel ou pelo repositório. Confirmar o estado diretamente na conta Resend antes de habilitar o envio.
- A API grava primeiro o registro no Blob privado e, depois, solicita o envio da notificação.
- Se o visitante informou e-mail, a mensagem usa esse endereço como `reply_to`; se informou somente telefone, esse campo é omitido.
- O conteúdo é enviado como texto simples, sem anexos, pixels de rastreamento ou links públicos para os registros.
- A chamada usa uma chave de idempotência baseada no identificador da solicitação.
- Se o armazenamento for concluído, mas o provedor rejeitar a notificação, a API retorna `notification_failed`.

## Aprovações e ativação obrigatórias

1. Katarina/responsável técnica aprovar a finalidade, o texto apresentado ao titular, o aviso de privacidade, os perfis de acesso, os procedimentos de tratamento e os prazos de retenção.
2. A revisão deve incluir Vercel, Vercel Blob, Resend, Microsoft Outlook e Google Gemini, conforme o fluxo de dados de cada funcionalidade. O aviso do assistente não substitui um aviso específico para o formulário de contato.
3. Validar o texto aprovado nos cinco idiomas (PT/EN/ES/FR/DE). Não alterar o texto apresentado ao titular nem publicar um aviso como aprovado sem essa revisão.
4. Atualizar `APPROVED_PRIVACY_NOTICE_VERSION` em `api/leads.mjs` com uma versão aprovada e registrada.
5. Aprovar o prazo de retenção entre 1 e 730 dias, validar `expiresAt` com dados sintéticos e verificar a exclusão efetiva. O SDK e a conferência da expiração no fluxo de gravação estão implementados.
6. Definir e implementar um prazo separado ou compatível para os registros de conversas da Mia, incluindo as duas cópias privadas.
7. Depois das aprovações e da confirmação do domínio Resend, configurar na Vercel:
   - `AUREUM_LEADS_ENABLED=true`
   - `AUREUM_LEADS_PRIVACY_APPROVED=true`
   - `AUREUM_LEADS_PRIVACY_NOTICE_VERSION=<versão aprovada no código>`
   - `AUREUM_LEADS_RETENTION_DAYS=<prazo aprovado>`
   - `AUREUM_LEADS_NOTIFICATION_ENABLED=true`
8. Fazer um envio controlado, confirmar o registro no Blob privado e acompanhar no Resend o estado real da mensagem (incluindo entrega), além de testar repetição, falhas e expiração antes de divulgar o formulário como canal ativo.

A constante `APPROVED_PRIVACY_NOTICE_VERSION` permanece vazia por padrão. Assim, mesmo que variáveis de ambiente sejam configuradas por engano, o endpoint continuará fechado até a aprovação e a atualização explícita do código.

## Limites atuais

- Nenhum e-mail ou WhatsApp automático é enviado nesta versão.
- O modo local apenas prepara uma mensagem para o visitante copiar e encaminhar.
- O recebimento online permanece indisponível enquanto qualquer requisito de privacidade, retenção, armazenamento ou notificação estiver ausente.
- A confirmação exibida ao visitante só ocorre depois da persistência privada e da aceitação da notificação pelo provedor; isso não substitui a verificação posterior de entrega na caixa de entrada.
- O rate limiter em memória é uma proteção complementar e não substitui um mecanismo distribuído.
