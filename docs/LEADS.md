# Recebimento de solicitações — Aureum

## Estado atual

O formulário online permanece **desabilitado**. Enquanto o endpoint não confirmar uma versão de aviso aprovada e todos os controles estiverem ativos, o navegador apenas prepara uma mensagem local para revisão e cópia; nenhum dado pessoal é enviado ou armazenado pelo endpoint.

A interface preserva os 500 formulários nas 50 páginas de marketing, com e-mail opcional, telefone/WhatsApp opcional em formato internacional e exigência de pelo menos um meio de contato.

## Arquitetura

- `scripts/lead-forms.mjs`: transforma os formulários existentes durante o build e adiciona o link de privacidade, inicialmente oculto.
- `public/assets/js/aureum-lead-form.js`: validação no navegador, consentimento localizado e alternância entre a mensagem do modo de cópia local e a mensagem do modo online.
- `api/leads.mjs`: endpoint same-origin, validação no servidor, honeypot, tempo mínimo de preenchimento, rate limiting complementar e persistência privada.
- `server/leads-core.mjs`: regras de validação, consentimento, retenção e controle de ativação.
- `server/lead-notifications.mjs`: notificação transacional server-side pelo Resend.
- A persistência é feita em Vercel Blob privado, sob o prefixo `leads/`, com expiração `ttlDays` definida por variável de ambiente.

## Configuração de e-mail já concluída

- Domínio de envio verificado no Resend: `mail.aureumassessoria.com.br`.
- Região do domínio no Resend: São Paulo (`sa-east-1`).
- API Key cadastrada como variável **Secret** no ambiente Production da Vercel (`RESEND_API_KEY`).
- Destinatário: `contato.aureum@outlook.com`.
- Remetente: `Aureum <notificacoes@mail.aureumassessoria.com.br>`.
- O envio usa texto simples, sem anexos, pixels de rastreamento ou links públicos para os registros.
- O e-mail informado pelo visitante é usado como `reply_to`, quando presente.

A configuração do provedor está pronta, mas **não houve envio real de ponta a ponta**. A chave não é exibida nem armazenada neste documento.

## Aviso de privacidade e consentimento

Os rascunhos do aviso estão em:

- `public/privacidade-atendimento.html` (PT-BR)
- `public/en/contact-privacy.html` (EN)
- `public/es/privacidad-contacto.html` (ES)
- `public/fr/confidentialite-contact.html` (FR)
- `public/de/datenschutzhinweis-kontakt.html` (DE)

Todas as páginas estão marcadas como `noindex,nofollow` e exibem um aviso de rascunho. Não devem ser tratadas como política vigente até a revisão e aprovação da responsável técnica. O link do aviso e o texto de consentimento online permanecem ocultos enquanto o endpoint está desabilitado. Quando uma versão aprovada for disponibilizada, a interface trocará o texto antigo (modo de cópia local) pelo consentimento online correspondente ao idioma.

O documento de revisão e os pontos pendentes estão em `docs/PRIVACY-LEADS-REVIEW.md`.

## Retenção e armazenamento

O Blob privado recebe um TTL obrigatório entre 1 e 730 dias. **Nenhum prazo foi escolhido ou configurado em Production**, pois isso depende da aprovação da responsável técnica. O TTL do Blob não apaga a cópia de notificação recebida na caixa Outlook nem define, por si só, a retenção de logs dos fornecedores. A retenção da caixa de e-mail e dos registros de serviço precisa ser definida separadamente.

## Controles de ativação

A ativação exige todos os itens abaixo:

1. Aprovação da identidade da entidade controladora e dos dados de identificação.
2. Aprovação da hipótese legal e do texto de consentimento.
3. Aprovação da finalidade, dados coletados, destinatários e fornecedores.
4. Confirmação dos países envolvidos e do mecanismo de transferência internacional aplicável.
5. Aprovação do prazo do Vercel Blob e da política para a cópia de e-mail e registros dos fornecedores.
6. Revisão e aprovação das traduções EN/ES/FR/DE.
7. Registro de uma versão aprovada no código e nas variáveis de ambiente.
8. Testes controlados de persistência, envio, entrega, repetição, falhas e expiração.

Os seguintes controles continuam **desligados** em Production:

- `AUREUM_LEADS_ENABLED=false`
- `AUREUM_LEADS_PRIVACY_APPROVED=false`
- `AUREUM_LEADS_NOTIFICATION_ENABLED=false`
- `AUREUM_LEADS_PRIVACY_NOTICE_VERSION`: não configurada
- `AUREUM_LEADS_RETENTION_DAYS`: não configurada
- `APPROVED_PRIVACY_NOTICE_VERSION` em `api/leads.mjs`: permanece vazia

Mesmo que uma variável seja alterada por engano, o endpoint continua fechado enquanto a constante de versão aprovada no código estiver vazia.

## Fontes oficiais para revisão

- LGPD, Lei nº 13.709/2018, especialmente arts. 7º, 9º, 18 e 33: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- Direitos dos titulares — ANPD: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares
- Transferência internacional — ANPD: https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados

## Limites atuais

- Nenhuma solicitação online é recebida pelo endpoint.
- O modo local apenas prepara uma mensagem para o visitante copiar e encaminhar por um canal oficial.
- A integração de e-mail está configurada, mas não foi validada com um envio real.
- A ativação depende da aprovação de privacidade, do prazo de retenção e dos testes de ponta a ponta.
- O rate limiter em memória é uma proteção complementar e não substitui um mecanismo distribuído.
