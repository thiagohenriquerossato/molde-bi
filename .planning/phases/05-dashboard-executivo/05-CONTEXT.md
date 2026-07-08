# Phase 5: Dashboard Executivo - Context

**Gathered:** 2026-07-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega a primeira visão analítica real do negócio na rota `#executivo`: KPIs compactos, gráficos ECharts essenciais e listas curtas de exceção financeira. Os números devem reagir aos filtros globais já existentes (Fase 4), usar dados normalizados de pedidos e contas, e **nunca tratar pipeline (`Aguardando Aprovação`) como receita realizada**. Páginas Financeiro, Pedidos, Resultado Integrado e Insights permanecem fora do escopo analítico completo desta fase.

</domain>

<decisions>
## Implementation Decisions

### KPIs e hierarquia visual
- **D-01:** O Executivo exibe o conjunto **expandido de 12 KPIs** conforme `docs/resume.md` §Página 2 — Dashboard Executivo (cards principais).
- **D-02:** Os 12 KPIs são: Receita ativa (rótulo "Receita ativa"), Valor recebido, Valor pendente, Despesas totais, Despesas pagas, Despesas em aberto, Contas vencidas, Resultado por competência, Ticket médio, Pedidos totais, Pedidos entregues, Pedidos em aprovação (pipeline).
- **D-03:** Layout em **blocos temáticos com título**, respeitando `docs/COMPONENTS.md` (máx. 4 metric cards por linha, altura compacta <120px):
  - **Receita:** receita ativa, recebido, pendente
  - **Despesas:** despesas totais, pagas, em aberto, contas vencidas
  - **Resultado e pedidos:** resultado competência, ticket médio, pedidos totais, pedidos entregues
  - **Pipeline:** pedidos em aprovação (bloco isolado, visualmente separado dos blocos de receita)
- **D-04:** Card "Receita ativa" usa **receita ativa** de `docs/resume.md` §7 — soma `valor_final` de pedidos aprovados/ativos/entregues; **exclui** cancelados e pipeline.
- **D-05:** Card "Resultado por competência" usa receita ativa do período filtrado menos despesas do período filtrado (`docs/resume.md` §7). Resultado de caixa fica para a Fase 8.
- **D-06:** Card "Ticket médio" usa **ticket médio geral** — `valor_final` / quantidade de pedidos não cancelados no conjunto filtrado.
- **D-07:** Contagens de pedidos (totais, entregues, em aprovação) usam registros filtrados; "em aprovação" filtra `situacao_grupo === "Pipeline / orçamento"`.

### Pipeline vs receita realizada
- **D-08:** O bloco **Pipeline** fica **abaixo ou após** o bloco Receita, com superfície visual distinta (borda/acento warning) para não parecer continuação da receita realizada.
- **D-09:** Rótulo do KPI de pipeline: **"Pipeline (orçamento)"** com subtítulo ou badge **"Não contabilizado na receita"**.
- **D-10:** Pipeline **não entra** em séries de receita mensal nem em rankings de receita; aparece apenas no KPI dedicado e no gráfico de pedidos por status (como fatia/grupo próprio).
- **D-11:** Nenhum gráfico ou KPI do Executivo deve somar pipeline em "receita", "resultado" ou "recebido".

### Gráficos e layout
- **D-12:** Implementar o conjunto **EXE-02 completo** com 6 instâncias ECharts na página:
  1. Receita × Despesa × Resultado por mês (linha ou barras combinadas)
  2. Valor recebido × pendente por mês (barras empilhadas)
  3. Despesas fixas × variáveis por mês (barras empilhadas; classificação conforme normalização)
  4. Pedidos por status / `situacao_grupo` (funil ou rosca; pipeline como grupo próprio)
  5. Top 10 despesas por classificação (barras horizontais)
  6. Top vendedores por receita ativa (barras horizontais)
- **D-13:** Disposição desktop: KPIs no topo; abaixo, **grade 2 colunas** de gráficos; mobile/tablet empilha em 1 coluna. Sem gradientes ou charts decorativos (`docs/DESIGN.md`).
- **D-14:** Gráficos usam paleta de `docs/TOKENS.md`, locale pt-BR (moeda, datas) e **reagem aos filtros globais** da mesma forma que KPIs.
- **D-15:** Séries de receita nos gráficos usam **receita ativa**, nunca pipeline nem receita potencial.

### Listas de exceção (EXE-03)
- **D-16:** Abaixo dos gráficos, duas **tabelas curtas** lado a lado (desktop) ou empilhadas (mobile):
  - **Contas vencidas** — até 10 linhas, ordenadas por `dias_atraso` decrescente
  - **Próximos vencimentos** — até 10 linhas com vencimento nos próximos 7 dias, ordenadas por `data_vencimento`
- **D-17:** Colunas mínimas: fornecedor, vencimento, valor, status (`status_pagamento`). Densidade compacta conforme `docs/TABLES.md`.
- **D-18:** Sem drill-down ou navegação automática para `#financeiro` nesta fase — apenas leitura operacional rápida.

### Filtros no executivo (EXE-04)
- **D-19:** Filtros globais da topbar (Fase 4) **afetam todos** os KPIs, gráficos e listas desta página.
- **D-20:** Período cross-domain segue D-17 da Fase 4: pedidos por `data_cadastro`/`mes_cadastro`; contas por `data_vencimento`/`mes_vencimento`; resultado competência combina ambos no mesmo recorte temporal.
- **D-21:** Chips de filtro ativos permanecem visíveis; alterar filtro re-renderiza métricas e gráficos sem recarregar a página.
- **D-22:** Estado sem dataset ou sem pedidos+contas obrigatórios mantém empty state existente; não exibir KPIs/gráficos com zero inventado.

### the agent's Discretion
- Nomes dos módulos (`metrics.js`, `charts.js`, `executive.js` ou equivalente), desde que separados de `app.js` e reutilizem `MoldeFilters`.
- Tipo exato de cada gráfico ECharts (linha vs barra, funil vs rosca) desde que legível e alinhado a EXE-02.
- Microcopy pt-BR dos subtítulos de bloco e tooltips de pipeline.
- Altura mínima dos containers de chart e tratamento de resize/`dispose` ao trocar de rota.
- Formatação de variação ou comparativo período anterior — **não obrigatório** nesta fase; KPIs mostram valor absoluto formatado.
- Implementação técnica de agregação mensal (pré-computar vs. on-the-fly) desde que performance aceite com planilhas reais.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento e escopo
- `.planning/PROJECT.md` — visão do produto, separação pipeline/receita, ECharts local, visual híbrido executivo.
- `.planning/REQUIREMENTS.md` — requisitos `EXE-01`..`EXE-04`.
- `.planning/ROADMAP.md` — objetivo e critérios de sucesso da Fase 5.
- `.planning/STATE.md` — riscos conhecidos (pipeline inflando receita).
- `.planning/phases/04-normaliza-o-estado-e-tabelas/04-CONTEXT.md` — filtros globais, campos derivados, `situacao_grupo`, persistência e boot em `#executivo`.

### Design system e UX
- `docs/DESIGN.md` — layout híbrido; executivo mais visual; evitar painel de gráficos decorativo.
- `docs/TOKENS.md` — tokens, densidade, chart colors, `--summary-panel-width`.
- `docs/UX.md` — filtros, estados vazios, feedback.
- `docs/COMPONENTS.md` — metric cards compactos (máx. 4/linha), cards e badges.
- `docs/TABLES.md` — tabelas densas para listas de exceção.

### Regras de negócio e métricas
- `docs/resume.md` §Página 2 — lista de KPIs e gráficos do Dashboard Executivo.
- `docs/resume.md` §3.1 — `situacao_grupo` e separação pipeline.
- `docs/resume.md` §7 — fórmulas de receita ativa, pipeline, resultado competência, ticket médio.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/filters.js` — estado de filtros, `applyPedidos`/`applyContas`, chips ativos; base para métricas filtradas.
- `js/normalizers.js` — campos derivados (`situacao_grupo`, `status_pagamento`, `mes_cadastro`, `mes_vencimento`).
- `js/store.js` — dataset normalizado restaurado no boot.
- `js/app.js` — rota `executivo` com empty state; boot redireciona para `#executivo`; painel de filtros na topbar; `hasDataset()` e `appState.dataset`.
- `js/tables.js` — padrões de renderização tabular reutilizáveis para listas curtas.
- `vendor/echarts/echarts.min.js` — já carregado em `index.html`, ainda sem `echarts.init` no app.
- `css/app.css` — tokens e componentes base; metric cards ainda sem classes dedicadas.

### Established Patterns
- Hash routes com `render` customizado só em `upload` e `base-dados`; demais páginas usam template genérico + empty state.
- Filtros globais colapsáveis na topbar; multi-seleção em campos categóricos.
- Dados de negócio em IndexedDB; tema em `localStorage`.
- Fase 4 proibiu KPIs/gráficos fake — Executivo é a primeira página com números agregados reais.

### Integration Points
- Novo renderer `renderExecutivoPage` (ou equivalente) em `app.js` registrado na rota `executivo`.
- Módulo de métricas consome `MoldeFilters.apply*(dataset, filterState)` e expõe agregados para cards.
- Módulo de charts inicializa ECharts em containers da página executiva; `resize`/`dispose` ao navegar.
- Listas de exceção reutilizam dataset filtrado de contas com ordenação/limit.
- Alterações em `filterState` disparam re-render do Executivo quando rota ativa.

</code_context>

<specifics>
## Specific Ideas

- Usuário quer os **12 KPIs completos** do resume.md, não apenas o núcleo mínimo de EXE-01.
- Pipeline é risco crítico (~R$ 517k em aprovação) — separação visual é obrigatória mesmo com decisões de detalhe delegadas ao executor.
- Página executiva é a **tela inicial após upload** (já configurado no boot da Fase 4).
- Gráficos e demais áreas não foram detalhadas pelo usuário — seguir EXE-02/03/04 e recomendações do resume.md.

</specifics>

<deferred>
## Deferred Ideas

- Resultado de caixa, waterfall, projeção e KPIs integrados — Fase 8 (Resultado Integrado).
- Página Financeiro completa com heatmap, ABC e tabelas de exceção extensas — Fase 6.
- Análise comercial detalhada de pedidos — Fase 7.
- Alertas automáticos e insights — Fase 9.
- Drill-down de lista executiva para `#financeiro` — pode entrar em fase futura se necessário.
- Variação % vs período anterior nos KPIs — v2 / polimento.
- Filtro por clique em gráfico — v2.

</deferred>

---

*Phase: 05-dashboard-executivo*
*Context gathered: 2026-07-08*
