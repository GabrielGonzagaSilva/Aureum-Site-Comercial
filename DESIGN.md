# Aureum — identidade preservada

Site comercial de assessoria internacional. Esta recuperação preserva a direção visual existente: hero em vídeo com logo vetorial, seções editoriais, destinos com fotografias e painéis separados de Mia e WhatsApp.

- Paleta aprovada: branco `#FFFFFF` para as superfícies, verde suave `#F7F9F6` para alternância, sálvia `#768774`, esmeralda `#1C4C3C`, floresta `#0A211B` e dourado `#A37A42` para detalhes. Texto dourado pequeno usa `#795629` para contraste. Marfim `#E9DDCD` fica reservado a detalhes sobre verde.
- Tipografia: Inter hospedada em `public/assets/fonts/`. Logos em SVG com letras convertidas em vetores.
- Fonte visual: páginas em `public/`, estilos de base em `public/assets/css/` e refinamentos recuperados em `public/aureum-enhancements.css` e `public/aureum-updates.js`.
- Preservar botões arredondados, contraste, foco visível, adaptação para telas estreitas, redução de movimento e fechamento dos painéis por teclado.
- Preservar PT, EN, ES, FR e DE, inclusive as rotas de destinos. A área de análises continua desativada.
- A Mia usa `/api/chat`, recebe apenas o histórico informado pelo visitante e mantém o registro privado já existente; segredos nunca chegam ao navegador.
- Alterações nesta recuperação são correções e consolidação, sem nova direção visual ou conteúdo de serviços inventado.

## Sistema compartilhado — 16/11/2026

- Estilos finais estáticos em `public/assets/css/aureum-site-system.css`, aplicados pelo build às 50 páginas de marketing. Correções de identidade deixam de depender de uma injeção tardia de CSS pelo JavaScript.
- Mesma função tipográfica recebe o mesmo tamanho e peso: títulos de seção Inter 500, escala fluida de 32–52 px; títulos de cards editoriais 21–25 px; fotografia, hero e diálogo preservam suas funções próprias.
- Conteúdo limitado a 1440 px, com margens internas comuns de 24–80 px. Cada seção possui um único responsável pelo espaçamento vertical: 36 px no celular e até 64 px no desktop, sem somar padding externo e interno.
- Movimento focal preservado: hero em vídeo e transição para a marca no cabeçalho. Controles usam 160 ms, menus 220 ms e fotografias 420 ms. Redução de movimento elimina deslocamentos e mantém feedback de cor/estado. Efeitos de atenção pausam com aba oculta ou painel aberto.
- Os cinco serviços e suas rotas alimentam os cards e a navegação do rodapé. Os títulos com quebra editorial mantêm separação entre palavras no celular.

