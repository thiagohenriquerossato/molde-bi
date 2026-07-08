# Phase 1 Research: Fundação Estática e Design System

## RESEARCH COMPLETE

Esta pesquisa define como planejar a Fase 1 sem avançar para importação, validação ou métricas reais. A fase deve entregar uma fundação estática, local e navegável para o Molde Momentos Dashboard Local, usando somente HTML, CSS e JavaScript vanilla.

O resultado esperado é um shell confiável para fases futuras: `index.html`, `css/app.css` e `js/app.js`, com sidebar, topbar, hash routes, tela inicial de Upload em estado vazio, páginas futuras navegáveis, tokens de design, componentes base, tema claro/escuro persistido e responsividade desktop-first.

## Stack e restrições técnicas

### Stack padrão

- HTML sem build obrigatório, com `index.html` como ponto de entrada.
- CSS puro em `css/app.css`, usando CSS custom properties para tokens, tema, layout, componentes e responsividade.
- JavaScript puro em `js/app.js`, sem framework e sem dependência de bundler.
- Navegação client-side por hash routes (`#upload`, `#executivo`, `#financeiro`, `#pedidos`, `#resultado`, `#insights`, `#base-dados`, `#metas`).
- Persistência leve via `localStorage` apenas para preferência de tema nesta fase.
- Texto, exemplos e microcopy em pt-BR.

### Restrições obrigatórias

- O app deve abrir diretamente pelo navegador a partir de `index.html`, sem backend, login, API, banco remoto ou servidor obrigatório.
- Não adicionar SheetJS, ECharts, bibliotecas de ícones remotas, fontes remotas ou qualquer dependência de internet em runtime.
- Não implementar leitura XLSX, upload real, parsing de arquivos, validação de planilhas, normalização, IndexedDB, filtros reais, métricas, gráficos ou dashboards reais.
- Não inventar indicadores nem simular números de negócio como se fossem dados carregados.
- Ações futuras de importação devem aparecer desabilitadas ou explicitamente marcadas como `Disponível na Fase 2`.
- O dark mode deve ser desenhado com tokens próprios e camadas slate, não uma inversão automática de cores.

## Arquitetura recomendada para os três arquivos iniciais

### `index.html`

O HTML deve conter a estrutura estática e semântica do shell, deixando o comportamento mínimo para `js/app.js`.

Recomendação de composição:

- `html` com `lang="pt-BR"` e atributo/classe de tema controlável pelo JavaScript.
- Skip link para o conteúdo principal.
- `body > .app-shell`, seguindo o contrato:
  - `aside.sidebar` com `nav` e grupos `Início`, `Análises`, `Operação` e `Sistema`.
  - `div.app-main`.
  - `header.topbar`.
  - `main.page-area`.
- Links de navegação reais usando `href="#rota"` para funcionar em `file://`.
- Topbar com busca visual/desabilitada, badge de status local, botão de menu mobile, toggle de tema e ação contextual desabilitada quando sugerir importação.
- Conteúdo inicial renderizável sem JavaScript crítico, preferencialmente com containers que `app.js` possa atualizar por rota.
- Templates simples de páginas podem ficar no HTML se isso mantiver a fase clara; se houver repetição alta, `app.js` pode gerar o conteúdo por dados estáticos de rota.

O plano deve evitar uma página HTML inchada com muitos blocos duplicados. A melhor divisão é manter o shell no HTML e concentrar o inventário das páginas em estruturas de dados pequenas no JavaScript.

### `css/app.css`

O CSS deve ser a fundação mais importante da fase, pois será reaproveitado pelas próximas etapas.

Recomendação de organização:

1. Reset leve e base (`box-sizing`, `body`, links, botões, inputs).
2. Tokens em `:root`:
   - cores light;
   - tipografia;
   - spacing de 4px;
   - radius;
   - shadows mínimas;
   - dimensões de layout;
   - z-index;
   - transições;
   - densidade.
3. Tokens dark em `.dark` ou `[data-theme="dark"]`.
4. Utilitários essenciais:
   - `.sr-only`;
   - `.tabular-nums`;
   - helpers de layout e truncamento se necessário.
5. Shell:
   - `.app-shell`;
   - `.sidebar`;
   - `.app-main`;
   - `.topbar`;
   - `.page-area`;
   - overlay mobile.
6. Componentes base:
   - botões;
   - inputs/search;
   - badges;
   - cards;
   - upload cards;
   - empty states;
   - tabelas;
   - filtros fake;
   - page header.
7. Responsividade:
   - desktop padrão `>= 1024px`;
   - tablet com sidebar colapsada entre `768px` e `1023px`;
   - mobile `< 768px` com sidebar overlay, cards empilhados e tabelas com overflow horizontal.
8. Acessibilidade:
   - focus ring visível;
   - `prefers-reduced-motion`;
   - estados disabled claros.

O CSS deve preservar bordas finas, superfícies claras/escuras por camada, densidade compacta em áreas operacionais e evitar sombras pesadas, gradientes e cards grandes.

### `js/app.js`

O JavaScript deve ficar pequeno, previsível e preparado para crescer sem misturar regras futuras de dados.

Responsabilidades recomendadas:

- Definir o inventário estático de rotas, títulos, descrições e empty states.
- Normalizar a rota atual: sem hash ou hash desconhecido deve cair em `#upload`.
- Renderizar ou alternar a página ativa.
- Atualizar item ativo na sidebar com `aria-current="page"`.
- Atualizar título/descrição/contexto da topbar quando fizer sentido.
- Controlar abertura/fechamento da sidebar mobile.
- Fechar sidebar mobile ao navegar.
- Aplicar tema inicial por esta ordem:
  1. valor salvo em `localStorage`;
  2. preferência do sistema via `prefers-color-scheme`;
  3. light como fallback.
- Persistir alternância de tema no `localStorage`.

O plano deve manter `app.js` livre de parsing XLSX, mocks financeiros, cálculos, validações e qualquer estrutura de dados operacional. O arquivo deve preparar a superfície de navegação, não a camada de negócio.

## Padrões de UI que o plano deve obrigatoriamente preservar

### Shell e navegação

- Sidebar fixa no desktop com largura `240px`.
- Topbar com altura `56px`.
- Page padding de `24px` no desktop e `16px` em telas menores.
- Grupos obrigatórios no menu:
  - `Início`: Upload.
  - `Análises`: Executivo, Financeiro, Resultado.
  - `Operação`: Pedidos, Insights, Base de Dados.
  - `Sistema`: Metas.
- Item ativo com fundo `primary`, texto `primary-foreground` e radius médio.
- Páginas futuras devem continuar clicáveis e explicar a dependência de importação, validação ou normalização.

### Upload e estados vazios

- A rota inicial deve ser `#upload`.
- A página de Upload deve ter título `Upload e validação` e descrição `Carregue as planilhas para preparar os dados do dashboard local.`.
- Deve haver três cards:
  - `Pedidos`, esperando `Pedidos_Simplificado.xlsx`;
  - `Contas a pagar`, esperando `PLANILHA CONTAS A PAGAR1.xlsx`;
  - `Indicadores e metas`, esperando `Molde_Momentos_Template_Indicadores.xlsx` e marcado como `Opcional`.
- Botões de seleção devem estar visíveis, porém desabilitados, com helper `Disponível na Fase 2`.
- Empty states devem ter ícone ou marcador visual simples, título curto, descrição de uma frase e CTA desabilitado quando a próxima ação for futura.

### Visual

- Interface de ferramenta operacional, não landing page nem BI decorativo.
- Fundo principal `#F8FAFC` no light e `#0B1120` no dark.
- Superfícies em `card`, bordas `1px`, radius `lg`, sombras mínimas.
- Primary escuro no light e claro no dark, usado com parcimônia.
- Badges semânticos com texto, não apenas cor.
- Tipografia compacta: body em 14px, cards/tabelas em 13px, labels em 12px.
- Números e valores com `font-variant-numeric: tabular-nums`.
- Tabelas densas com header em uppercase muted, linhas de 36px e overflow horizontal.
- Inputs e botões com foco visível.
- Mobile básico funcional, sem esmagar colunas ou esconder navegação.

### Acessibilidade e semântica

- Usar landmarks: `nav`, `header`, `main`.
- Incluir skip link.
- Links ativos com `aria-current="page"`.
- Theme toggle com nome acessível e estado atual (`aria-pressed` ou equivalente).
- Menu mobile com estado expandido (`aria-expanded`).
- Disabled buttons com `disabled` ou `aria-disabled="true"` e explicação adjacente.
- Não depender apenas de cor para status.

## Riscos e limites de escopo

### Riscos principais

- Escopo vazar para importação real de XLSX. Isso anteciparia Fase 2 e aumentaria risco de dependência externa.
- Criar dashboards, KPIs ou gráficos falsos. Isso conflita com a regra de não inventar indicadores sem fonte.
- Usar CDN para fontes, ícones, SheetJS, ECharts ou qualquer recurso visual. O produto precisa funcionar localmente.
- Implementar uma UI genérica de dashboard com cards grandes e charts decorativos, desalinhada do padrão operacional denso.
- Deixar dark mode parcial, fazendo apenas troca superficial de fundo e texto.
- Concentrar comportamento demais no HTML inline ou criar JavaScript difícil de evoluir para fases futuras.
- Não testar em `file://`, onde alguns padrões de módulo ou fetch local podem falhar.

### Limites de escopo

- Permitido: shell, navegação por hash, tema persistido, sidebar/topbar, upload cards vazios, empty states, estilos base e responsividade.
- Permitido: exemplos visuais estáticos de tabela/estado vazio, desde que claramente sem dados importados.
- Não permitido: leitura de arquivos, validação real, normalização, filtros funcionais, métricas, charts, armazenamento de datasets, exportação CSV, SheetJS, ECharts, IndexedDB.
- Não permitido: login, backend, API, banco remoto, sincronização ou colaboração.

## Estratégia de validação manual/CLI

### Validação manual

- Abrir `index.html` diretamente no navegador e confirmar que a aplicação renderiza sem servidor.
- Confirmar que a rota inicial cai em `#upload`.
- Clicar em todos os itens da sidebar e validar:
  - mudança de conteúdo;
  - item ativo correto;
  - `aria-current="page"` no item ativo;
  - empty state útil em páginas futuras.
- Testar reload em cada hash para garantir restauração da página correta.
- Alternar tema, recarregar a página e confirmar persistência em `localStorage`.
- Testar preferência do sistema em uma sessão sem tema salvo.
- Reduzir viewport para tablet e mobile:
  - sidebar colapsada em tablet;
  - sidebar overlay em mobile;
  - cards empilhados;
  - tabela com overflow horizontal.
- Navegar por teclado:
  - skip link;
  - links do menu;
  - toggle de tema;
  - botão de menu mobile;
  - foco visível em todos os controles.
- Confirmar que botões de upload estão desabilitados e comunicam `Disponível na Fase 2`.
- Confirmar que não há promessas visuais de upload, validação, métricas ou gráficos reais.

### Validação CLI

- Verificar que os arquivos esperados existem:
  - `index.html`;
  - `css/app.css`;
  - `js/app.js`.
- Procurar referências proibidas a CDN ou chamadas remotas:
  - `http://`;
  - `https://`;
  - `cdn`;
  - `unpkg`;
  - `jsdelivr`;
  - `googleapis`;
  - `fonts.gstatic`.
- Procurar bibliotecas fora de escopo:
  - `xlsx`;
  - `SheetJS`;
  - `echarts`;
  - `Chart`;
  - `IndexedDB` ou `indexedDB`.
- Validar que `index.html` referencia CSS e JS locais.
- Opcionalmente iniciar um servidor estático apenas para inspeção (`python3 -m http.server`), mas a aceitação principal deve continuar sendo abrir `index.html` localmente.

## Validation Architecture

### Critérios verificáveis de arquivos

- `index.html` existe na raiz do repositório.
- `css/app.css` existe e é referenciado por `index.html`.
- `js/app.js` existe e é referenciado por `index.html`.
- Nenhum arquivo da fase depende de backend, build step, módulo remoto ou CDN.

### Critérios verificáveis de shell

- A estrutura contém `aside.sidebar`, `header.topbar` e `main.page-area`.
- A navegação contém as rotas:
  - `#upload`;
  - `#executivo`;
  - `#financeiro`;
  - `#pedidos`;
  - `#resultado`;
  - `#insights`;
  - `#base-dados`;
  - `#metas`.
- Sem hash ou hash inválido redireciona/renderiza `#upload`.
- O item ativo da navegação muda ao trocar de rota.
- O item ativo expõe `aria-current="page"`.

### Critérios verificáveis de conteúdo

- A página `#upload` mostra os três cards obrigatórios de planilha.
- O card `Indicadores e metas` indica que a planilha é opcional.
- Todos os botões de upload/importação estão desabilitados ou marcados como ação futura.
- Páginas futuras exibem empty states específicos e úteis.
- Nenhuma página mostra KPIs, valores financeiros, gráficos ou validações reais.

### Critérios verificáveis de design system

- `css/app.css` declara tokens de cores light e dark como CSS custom properties.
- O tema dark cobre body, sidebar, topbar, cards, botões, inputs, badges, tabelas, empty states e overlay mobile.
- Cards usam borda e superfície `card`, sem sombra pesada.
- Tabelas têm estilo compacto, header diferenciado e overflow horizontal.
- Badges semânticos têm texto visível.
- Focus ring é visível em controles interativos.

### Critérios verificáveis de tema

- O tema inicial respeita `localStorage` quando há preferência salva.
- Sem preferência salva, o app usa `prefers-color-scheme`.
- O toggle da topbar altera o tema no root.
- O toggle persiste a escolha em `localStorage`.
- Recarregar a página mantém a preferência escolhida.

### Critérios verificáveis de responsividade

- Em `>= 1024px`, a sidebar fica fixa e expandida.
- Entre `768px` e `1023px`, a sidebar fica colapsada.
- Abaixo de `768px`, a sidebar funciona como overlay acionado pela topbar.
- Upload cards empilham em mobile.
- Tabelas ou demos largas usam rolagem horizontal, não comprimem colunas.

### Critérios verificáveis de escopo negativo

- Não há importação de SheetJS, ECharts ou qualquer biblioteca externa.
- Não há inputs de arquivo funcionais processando XLSX.
- Não há uso de `indexedDB` para datasets.
- Não há cálculos de receita, despesas, resultado, pedidos ou indicadores.
- Não há fetch/API/chamada remota.
- Não há login, autenticação ou sincronização.
