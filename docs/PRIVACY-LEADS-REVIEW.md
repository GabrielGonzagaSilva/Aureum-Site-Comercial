# Aureum — Revisão do aviso de privacidade do formulário

**Status:** rascunho técnico para validação. Não é parecer jurídico nem aviso vigente.  
**Versão proposta:** `aureum-leads-privacy-v1` (ainda não aprovada).  
**Estado operacional:** formulário online desabilitado.

## O que já está preparado

- Cinco páginas de rascunho: PT-BR, EN, ES, FR e DE.
- Consentimento online localizado, que só substitui a mensagem do modo de cópia local quando a API confirma uma versão aprovada.
- Link de privacidade localizado, inicialmente oculto.
- Persistência em Vercel Blob privado com TTL obrigatório.
- Notificação via Resend para `contato.aureum@outlook.com`.
- Controles de ativação independentes; nenhum deles foi ligado.

## Validações necessárias antes de publicar

- [ ] **Controlador:** preencher nome empresarial completo, CNPJ/identificador aplicável e endereço da entidade que opera a marca Aureum.
- [ ] **Canal de privacidade:** confirmar se `contato.aureum@outlook.com` é o canal oficial para pedidos de titulares ou indicar outro endereço.
- [ ] **Hipótese legal:** validar se o consentimento explícito é a base adequada para este formulário ou se o tratamento deve se apoiar em outra hipótese legal. A caixa atual é obrigatória e o backend exige `consent: true`; a redação deve corresponder à decisão jurídica.
- [ ] **Finalidade e minimização:** confirmar os campos necessários e se o texto livre deve incluir aviso para não enviar passaportes, documentos, dados financeiros ou dados sensíveis.
- [ ] **Fornecedores e papéis:** revisar os termos e os papéis de Vercel/Vercel Blob, Resend e Microsoft Outlook, incluindo eventuais subprocessadores.
- [ ] **Transferência internacional:** confirmar países de destino, duração, finalidade, salvaguardas e mecanismo legal aplicável para cada fornecedor. Não presumir que a região São Paulo do Resend resolve a localização de todos os dados.
- [ ] **Retenção no Blob:** definir o número de dias (o código aceita de 1 a 730). O valor deve refletir a necessidade real do atendimento e as obrigações aplicáveis.
- [ ] **Retenção do e-mail:** definir como e por quanto tempo a cópia enviada ao Outlook será mantida e excluída. O TTL do Blob não remove mensagens da caixa postal.
- [ ] **Logs dos fornecedores:** confirmar períodos de retenção e exclusão aplicáveis aos registros técnicos de Vercel, Resend e Microsoft.
- [ ] **Acesso interno:** identificar quem pode consultar os registros e quem executará solicitações de acesso, correção ou exclusão.
- [ ] **Traduções:** revisar EN/ES/FR/DE em relação ao texto PT-BR aprovado.
- [ ] **Data e versão:** aprovar o conteúdo final e registrar a versão efetiva antes de habilitar o endpoint.

## Proposta de consentimento online

- PT-BR: “Ao enviar, autorizo o tratamento dos dados informados para que a Aureum avalie e responda à minha solicitação.”
- EN: “By submitting, I authorize Aureum to process the information I provide to review and respond to my enquiry.”
- ES: “Al enviar, autorizo a Aureum a tratar los datos que proporciono para evaluar y responder a mi solicitud.”
- FR: “En envoyant ce formulaire, j’autorise Aureum à traiter les informations fournies afin d’examiner et de répondre à ma demande.”
- DE: “Mit dem Absenden willige ich ein, dass Aureum die von mir angegebenen Daten verarbeitet, um meine Anfrage zu prüfen und zu beantworten.”

**A redação acima pressupõe consentimento como hipótese legal e precisa ser validada.** Se a responsável técnica escolher outra hipótese legal, a caixa, o backend e as traduções devem ser ajustados antes da ativação.

## Observações técnicas importantes

1. A notificação contém os dados do formulário e é enviada via Resend para a caixa Outlook indicada. A mensagem pode permanecer na caixa postal mesmo depois de expirar o registro do Blob.
2. O backend usa o endereço IP recebido no cabeçalho da requisição temporariamente para rate limiting em memória; esse valor não é incluído no objeto persistido do lead.
3. O registro privado inclui nome, e-mail/telefone, destino, objetivo, mensagem, idioma, página de origem, consentimento, identificador da solicitação e data/hora.
4. O formulário permanece no modo de cópia local até que todos os controles sejam aprovados, o aviso final esteja publicado e os testes de entrega sejam concluídos.

## Fontes oficiais consultadas

- LGPD (Lei nº 13.709/2018): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- ANPD — Direitos dos titulares: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares
- ANPD — Transferência internacional: https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados
