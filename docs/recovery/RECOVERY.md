# Recuperação de 11/11/2026

## Referências preservadas

- GitHub original: `c5d44e8e649b6564f832acbdc1ba6fc68bec5f7d`, preservado em `backup/main-before-recovery-2026-11-11`.
- Domínio antes da alteração: `aureum-site-comercial.vercel.app` → `dpl_FpDpja8wrLEkCnadFM5CXdMizj3c`, Preview com alias atribuído manualmente.
- Último deployment marcado Production antes da recuperação: `dpl_GvRdGRPRriPMPhB1jEntx1nWu1mV`.
- Patch mais recente: `dpl_9B339A7HPCTRDqhqiQpioLCiFA6a`, Preview sem commit Git.
- Nenhum deployment anterior foi excluído.

## Decisão de consolidação

A base servida pelo domínio tinha 51 páginas e 112 arquivos referenciados. O Preview mais recente tinha apenas 15 páginas e perdia 36 rotas de destinos em EN/ES/FR/DE. A comparação dos arquivos mostrou que as diferenças úteis mais recentes estavam em `aureum-updates.js` e `aureum-enhancements.css`. A consolidação mantém as 51 páginas e incorpora esses dois patches, corrigindo o texto literal no header e a sobrescrita de idioma dos painéis.

As árvores de origem de 24 deployments posteriores ao commit principal foram comparadas. A base de 07/11 preservava o conjunto das funcionalidades e scripts anteriores. Os registros de 50 deployments estão em `deployment-inventory.json`; os bytes recuperados e suas origens imutáveis estão documentados em `source-manifest.json`.

O backend foi recuperado integralmente. SHA-1 dos bytes originais:

- `chat-core.mjs`: `f2563fa926306bea3243b456ac6af62ddca1a646`.
- `chat.mjs`: `746d0257110c97fecb790b12544463b4062e6e08`.

O núcleo foi movido para `server/` e apenas o import do handler foi ajustado. O vídeo é o original H.264, 1920×1080, 42,64 segundos, SHA-256 `ae1105ac022ec6838019b9897c25b0b8ee2ba63547f32b71014a8e10e83f3121`. A transferência pelo conector exige partes menores; o build recompõe e confere o arquivo original antes da publicação.

## Falhas corrigidas

- O build copiava deployments antigos, criando uma cadeia de dependências fora do Git; agora todo o build usa arquivos versionados.
- O build que falhou em `dpl_E9Hsveyn4SQE489Jn4e6dGvaoXLk` tinha expressão regular mal escapada; o script foi substituído pelo build local validado.
- A Mia respondia GET 200, mas POST com a origem oficial retornava 403. O rewrite para a API antiga foi removido.
- O Preview mais recente perdia as rotas traduzidas; a base completa foi preservada.
- Havia texto literal `\\n` fora do HTML e scripts da barra de Preview copiados para o conteúdo; ambos foram removidos.

## Verificação local executada

- Build: 51 páginas, 112 arquivos e 408 scripts analisados sem erro de sintaxe.
- Todas as referências locais verificadas, incluindo fotos, fontes, SVG e vídeo.
- Quatro testes do núcleo da Mia: configuração ausente, origem recusada, histórico vazio e contexto do idioma da página.
- O manifesto do vídeo garante reconstituição byte a byte antes de qualquer build.

## Validação do Preview gerado pelo GitHub

- Deployment `dpl_CzTzXZWdhCSR9fyfwKft2FsfBykc`, commit `d9bfe76c9474d50746e5de4cf861d85ffefa9dce`: READY.
- As 51 rotas responderam HTTP 200 e seus bytes corresponderam à base local validada.
- O manifesto publicado identificou corretamente a branch e o commit, e os hashes dos 112 arquivos corresponderam ao build local.
- A Mia respondeu GET 200 e POST 200, com a origem do próprio Preview, preservando o registro privado do handler recuperado.
- Chrome: header sem texto indevido, Inter aplicada e painel responsivo observado com largura CSS de 545 px por zoom do navegador, sem rolagem horizontal e com o botão de fechar e campo de mensagem dentro da área visível.
- Não executados: Safari, aparelhos físicos e teclado virtual móvel real.

## Configuração de ambientes

CSS e JavaScript recebem URLs com um hash do conteúdo durante o build. Assim, os navegadores deixam de reutilizar os endereços sem versão que deployments manuais anteriores permitiam armazenar por uma hora. O manifesto descreve os bytes finais de `dist/`, incluindo as URLs versionadas nas páginas.

A validação também encontrou respostas da Mia em português na página em inglês. O núcleo preserva o prompt privado e recebe uma instrução adicional de idioma a partir da página de origem do mesmo domínio. Essa correção é coberta por teste do payload enviado ao provedor; os hashes acima identificam a fonte original antes dessa alteração localizada.

O projeto Vercel existente já estava conectado ao repositório correto: `main` para Production e todas as demais branches para Preview. O desvio vinha de uploads manuais e aliases, não da ausência dessa ligação. As variáveis `GEMINI_API_KEY`, `BLOB_READ_WRITE_TOKEN` e `AUREUM_ASSISTANT_PROMPT` foram verificadas somente por nome e ambiente, sem recuperar ou publicar seus valores.

O número oficial de WhatsApp estava vazio. O formulário principal prepara a mensagem para revisão e não faz envio automático. Facebook, LinkedIn, termos e cookies estavam pendentes de configuração; a recuperação preserva esses estados sem inventar canais ou integrações.

## Dependências do backend

O `npm audit` do build identificou quatro alertas derivados da mesma dependência transitiva Zod 4.1.11, trazida pela configuração CLI do SDK Blob. O override fixa Zod 4.6.6, versão corrigida de GHSA-mrhx-c7xc-m3w5, preservando o SDK Blob recuperado e a mesma versão principal do validador. A correção é verificada com instalação limpa, auditoria, build e chamada real da Mia com arquivamento privado.

