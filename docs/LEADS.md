# Recebimento de solicitações — Aureum

## Estado atual

A interface dos formulários está preparada para e-mail opcional e telefone/WhatsApp opcional com código internacional. Pelo menos um dos dois meios deve ser informado. O build transforma os formulários existentes nas páginas de marketing sem duplicar a lógica nas páginas de origem.

O endpoint `/api/leads` está **ativo em produção desde 25/11/2026**. O aviso específico foi publicado em cinco idiomas, a controladora aprovou a política, o domínio remetente foi confirmado como verificado pela equipe e as flags de recebimento/notificação foram habilitadas. O status público do endpoint confirmou `enabled=true` com a versão `2026-11-25-v1`.

Em 25/11/2026, foi confirmada por Gabriel a aprovação de Katarina para a política de retenção e a definição de papéis descritas no registro de governança:
- Contatos sem contratação: 12 meses após o último contato.
- Clientes com contratação/atendimento efetivo: 5 anos após o encerramento da relação.
- E-mails de atendimento, reclamações e contratações: 5 anos quando necessários como prova.
- Dados sem finalidade vigente e sem obrigação legal: exclusão ou anonimização.
- Documentos fiscais/contábeis: prazo legal específico.
- Katarina: controladora; Gabriel: operador.
- Disputa/processo/reclamação em andamento: preservar os documentos pertinentes até a resolução definitiva e o término do prazo aplicável.
- Evitar cópias de documentos pessoais, dados de pagamento e informações excessivas.

A Vercel Production recebeu `AUREUM_LEADS_RETENTION_DAYS=365`, correspondente ao prazo aprovado para contatos que apenas solicitam informações. Isso não aplica automaticamente a retenção de cinco anos a clientes, e-mails ou documentos fiscais; esses conjuntos exigem gestão nos sistemas em que são efetivamente mantidos.

Controles atuais:
- `AUREUM_LEADS_ENABLED=true` (Production)
- `AUREUM_LEADS_PRIVACY_APPROVED=true` (Production)
- `AUREUM_LEADS_NOTIFICATION_ENABLED=true` (Production)
- `AUREUM_LEADS_PRIVACY_NOTICE_VERSION=2026-11-25-v1` (Production)
- `AUREUM_LEADS_RETENTION_DAYS=365` (Production)
- `APPROVED_PRIVACY_NOTICE_VERSION=2026-11-25-v1` no código.

O endpoint foi consultado em produção e retornou `enabled=true`. Um envio sintético foi aceito pelo endpoint com HTTP 201; a API concluiu o armazenamento privado com expiração e o Resend aceitou a notificação. A entrega final na caixa de entrada não foi confirmada pelo conector de e-mail; conferir a mensagem de teste no Outlook e no painel de eventos do Resend.

## Arquitetura

- `scripts/lead-forms.mjs`: transforma os formulários existentes durante o build.
- `public/assets/js/aureum-lead-form.js`: validação no navegador, normalização E.164, preparação local da mensagem e envio após ativação autorizada.
- `api/leads.mjs`: endpoint same-origin, validação no servidor, honeypot, tempo mínimo de preenchimento, rate limiting complementar e persistência privada.
- `server/leads-core.mjs`: regras puras de validação e controle de ativação.
- `server/lead-notifications.mjs`: notificação transacional server-side pela API do Resend, sem expor credenciais no navegador.
- O código usa `@vercel/blob` 2.9.0 para enviar `ttlDays` e confirmar `expiresAt` antes de notificar a equipe. Os registros novos usam `leads/<id>.json` no Blob privado. Uma repetição só reutiliza um registro ativo com os mesmos dados. A validação real de expiração e exclusão com dados sintéticos continua pendente.

## Infraestrutura e isolamento confirmados

- As Vercel Functions estão fixadas na região `iad1` (Washington, D.C., Estados Unidos), também declarada em `vercel.json`.
- O Vercel Blob conectado ao projeto é o armazenamento privado `aureum-private-conversations`, também na região `iad1`.
- O armazenamento tem os prefixos históricos `conversations/` e `backup/`. O código de recebimento online usa `leads/` quando aprovado e habilitado.
- O token do Blob fica restrito ao ambiente Production.
- Os previews e URLs de deployment geradas pela Vercel exigem autenticação Vercel; os domínios de produção continuam públicos.
- O repositório GitHub é público. O arquivo `.env.example` contém apenas nomes de variáveis sem valores, e `.gitignore` exclui arquivos `.env*`, exceto esse modelo. Não armazenar dados de leads, conversas, documentos ou credenciais no GitHub.

### Dados do assistente Mia

Quando a Mia estava ativa, o conteúdo da conversa passava pelo Google Gemini para gerar respostas. O código anterior arquivava em produção o último texto do visitante, a resposta e metadados técnicos, em duas cópias privadas (`conversations/` e `backup/`). Esses registros históricos precisam de um prazo aprovado e de uma regra aplicada às duas cópias. A página pública de privacidade explica o histórico e o funcionamento atual.

## Notificação por e-mail

A integração com **Resend** está ativa em Production e a entrega do primeiro teste foi confirmada pelo responsável da Aureum em 25/11/2026.

- Destinatário interno: `contato.aureum@outlook.com`.
- Remetente: `notificacoes@mail.aureumassessoria.com.br`.
- `RESEND_API_KEY` permanece como variável Secret na Vercel Production.
- `AUREUM_LEADS_NOTIFICATION_ENABLED=true`.
- A equipe confirmou que `mail.aureumassessoria.com.br` aparece como Verified no painel Resend.
- O teste sintético pós-deploy retornou HTTP 201; o endpoint concluiu a persistência privada com expiração e o Resend aceitou a notificação. O responsável confirmou o recebimento na caixa Outlook.
- A API grava primeiro o registro no Blob privado e, depois, solicita o envio da notificação.
- Se o visitante informou e-mail, a mensagem usa esse endereço como `reply_to`; se informou somente telefone, esse campo é omitido.
- O conteúdo é enviado como texto simples, sem anexos, pixels de rastreamento ou links públicos para os registros.
- A chamada usa uma chave de idempotência baseada no identificador da solicitação.
- Se o armazenamento for concluído, mas o provedor rejeitar a notificação, a API retorna `notification_failed`.

## Governança e operação após ativação

1. A aprovação da controladora, a versão do aviso, a retenção de 365 dias para contatos sem contratação e a confirmação de domínio no Resend foram registradas em 25/11/2026.
2. O aviso específico dos formulários foi publicado em cinco idiomas, com link direto no texto de consentimento.
3. O build de produção executou 44 testes automatizados, todos aprovados, e gerou 76 páginas/178 arquivos.
4. O endpoint público foi consultado após a publicação e retornou `enabled=true` com a versão `2026-11-25-v1`.
5. O primeiro envio sintético foi confirmado como recebido na caixa interna. Monitorar continuamente eventos de entrega, rejeição e bounce no Resend.
6. Aplicar os prazos de cinco anos a clientes, e-mails comprobatórios e documentos fiscais nos sistemas em que esses registros são mantidos (Outlook, atendimento e contabilidade).
7. Definir e implementar um prazo aprovado para registros históricos da Mia, incluindo as duas cópias privadas, antes de reativar o assistente.
8. O rate limiter em memória é proteção complementar e não substitui mecanismo distribuído.

A constante `APPROVED_PRIVACY_NOTICE_VERSION` está versionada no código. Qualquer alteração material no aviso exige nova versão correspondente no endpoint e na configuração de produção.

## Limites atuais

- O formulário público recebe solicitações e envia notificação por e-mail à caixa interna configurada.
- Não há envio automático de WhatsApp; o telefone é incluído na notificação para retorno humano.
- A aceitação pelo Resend não garante entrega final; monitorar eventos e caixa de entrada.
- A confirmação exibida ao visitante só ocorre depois da persistência privada e da aceitação da notificação pelo provedor; isso não substitui a verificação posterior de entrega na caixa de entrada.
- O rate limiter em memória é uma proteção complementar e não substitui um mecanismo distribuído.
