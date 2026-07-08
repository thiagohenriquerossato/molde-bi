# Phase 7: Pedidos e Receita - Research

**Researched:** 2026-07-08
**Status:** Complete

## Scope Anchor

Fase 7 entrega a página operacional `#pedidos` focada em análise comercial e de produção por pedido: **15 KPIs** em 4 blocos temáticos, **12 gráficos ECharts** e **6 tabelas de exceção** com scroll virtual, todos reagindo aos **filtros de pedidos completos (FLT-02)** no painel contextual da rota. Status respeitam `situacao_grupo` sem misturar pipeline com receita realizada. Nenhuma despesa, resultado integrado ou insight automático entra nesta fase (D-24).

## Technical Findings

### Arquitetura (reuso do padrão Fases 5 e 6)

```text
appState.dataset.pedidos
  → MoldeFilters.applyFilters(pedidos, "pedidos", filterState)
  → MoldeMetrics.computePedidosKpis(pedidos) + aggregations
  → MoldeCharts.renderPedidosCharts(containers, pedidos, theme)
  → MoldeTables.renderVirtualTable(container, {...}) para as 6 tabelas
  → app.js renderPedidosPage + mountPedidosDashboard + onFilterStateChanged
```

`app.js` continua orquestrador. Lógica de agregação vive em `metrics.js`, ECharts em `charts.js`, scroll virtual em `tables.js`. Padrão idêntico ao Financeiro (`renderFinanceiroPage` / `mountFinanceiroDashboard`) e Executivo (`metric-block`, `metric-block--pipeline`, grade 2 colunas).

### Helpers já disponíveis (metrics.js)

| Helper | Uso na Fase 7 |
|--------|---------------|
| `isReceitaAtiva(row)` | Bloco Valores, gráficos de receita/ticket/desconto/clientes |
| `isPipeline(row)` | Bloco Pipeline, gráfico funil (cor warning) |
| `isCancelado(row)` | Exclusão de receita; contagem Status |
| `aggregateOrdersByGroup(pedidos)` | Funil de situação |
| `topVendorsByRevenue(pedidos, limit)` | Receita por vendedor |
| `monthKeyFromPedido(row)` | Agregações mensais por `data_cadastro`/`mes_cadastro` |
| `sumField`, `formatCurrency`, `formatPercent` | KPIs e tooltips |

`RECEITA_ATIVA_GRUPOS = ["Pedido ativo", "Entregue"]` — fonte canônica; não recomputar inline.

### Campos derivados de pedidos já disponíveis (normalizers.js)

| Campo | Origem |
|-------|--------|
| `pedido_id` | `Pedido` normalizado |
| `situacao_original` | coluna `Situação` |
| `situacao_grupo` | mapeamento canônico (ver tabela abaixo) |
| `data_cadastro` / `mes_cadastro` | `Data de cadastro` → ISO / `YYYY-MM` |
| `data_prevista` / `data_entregue` / `mes_entrega` | datas parseadas |
| `cliente` / `cliente_normalizado` | texto; `Balcão` → `Balcão (cliente genérico)` |
| `vendedor` | texto normalizado |
| `valor_bruto` / `valor_desconto` / `valor_pago` / `valor_pendente` / `valor_final` | `parseBrazilianNumber` — pode ser `null` |
| `dias_producao` | `data_entregue − data_cadastro` (só entregues com ambas válidas) |
| `dias_atraso` | `data_entregue − data_prevista` (só entregues com ambas válidas) |
| `entregue_no_prazo` | `dias_atraso <= 0` quando entregue com datas válidas; senão `null` |
| `status_financeiro` | derivado: `Quitado`, `Parcial`, `Pendente` via `valor_pago`/`valor_pendente` |
| `forma_pagamento_entrada` / `forma_pagamento_saldo` | texto normalizado |

### Mapeamento `situacao_grupo` (NRM-04)

| Situação original | `situacao_grupo` |
|-------------------|------------------|
| Aguardando Aprovação | Pipeline / orçamento |
| Aguardando Produzir | Pedido ativo |
| Produzindo | Pedido ativo |
| Pronto para Entrega | Pedido ativo |
| Entregue | Entregue |
| Cancelado | Perdido / cancelado |
| Em branco / não mapeada | Sem status |

`situacao_grupo` e `status_financeiro` são fontes canônicas — não recomputar nos KPIs/gráficos.

### Separação pipeline vs receita (§7 resume.md)

```text
Receita ativa     = sum(valor_final) onde isReceitaAtiva(row)
Pipeline          = sum/count onde situacao_grupo === "Pipeline / orçamento"
Receita recebida  = sum(valor_pago) — nesta fase, bloco Valores usa receita ativa
A receber         = sum(valor_pendente) — nesta fase, bloco Valores usa receita ativa
```

Pipeline **nunca** entra em KPIs do bloco Valores nem em gráficos de receita realizada (D-10..D-12).

## KPIs de pedidos (ORD-01 — 15 KPIs em 4 blocos)

Conjunto filtrado = `MoldeFilters.applyFilters(dataset.pedidos, "pedidos", filterState)`.
Receita ativa = linhas onde `isReceitaAtiva(row)`.

### Bloco Valores (6 KPIs — somente receita ativa)

| KPI | Regra |
|-----|-------|
| Valor bruto | `sum(valor_bruto)` sobre receita ativa |
| Descontos | `sum(valor_desconto)` sobre receita ativa |
| Valor final | `sum(valor_final)` sobre receita ativa |
| Valor pago | `sum(valor_pago)` sobre receita ativa |
| Valor pendente | `sum(valor_pendente)` sobre receita ativa |
| Ticket médio | `sum(valor_final) / count(receita ativa)`; 0 se count = 0 |

Formato: R$ via `formatCurrency`; ticket com 2 casas.

### Bloco Status (4 KPIs — conjunto filtrado completo)

| KPI | Regra |
|-----|-------|
| Total de pedidos | `count` de todas as linhas filtradas |
| Pedidos entregues | `count` onde `situacao_grupo === "Entregue"` |
| Pedidos cancelados | `count` onde `situacao_grupo === "Perdido / cancelado"` |
| Pedidos ativos | `count` onde `situacao_grupo === "Pedido ativo"` |

Formato: inteiro (contagem).

### Bloco Pipeline (1 KPI — isolado, acento warning)

| KPI | Regra |
|-----|-------|
| Pedidos aguardando aprovação | `count` onde `situacao_grupo === "Pipeline / orçamento"` |

Layout: `metric-block--pipeline`, badge **"Não contabilizado na receita"**, subtítulo opcional com `sum(valor_final)` pipeline em R$ (secundário). Valor principal = contagem.

### Bloco Prazos (4 KPIs — receita ativa + entregues válidos)

| KPI | Regra |
|-----|-------|
| Desconto médio | média de `valor_desconto / valor_bruto × 100` sobre receita ativa com `valor_bruto > 0`; exibir `%` via `formatPercent` |
| Tempo médio de produção | média de `dias_producao` sobre entregues (`situacao_grupo === "Entregue"`) com `dias_producao !== null` |
| Atraso médio | média de `dias_atraso` sobre entregues com `dias_atraso !== null` e `dias_atraso > 0` (só atrasados) |
| Percentual entregue no prazo | `count(entregue_no_prazo === true) / count(entregues com data_prevista e data_entregue válidas) × 100` |

Pedidos em aberto ou sem datas completas **não** entram no denominador de prazos (D-08/D-09).

## Gráficos (ORD-02 — 12 ECharts)

Período mensal por `mes_cadastro`/`data_cadastro` salvo indicação contrária. Todos reagem ao conjunto filtrado. Receita = receita ativa salvo nota.

| # | data-chart | Tipo | Série / regra |
|---|-----------|------|---------------|
| 1 | `revenue-month` | coluna | `sum(valor_final)` receita ativa por `mes_cadastro` |
| 2 | `orders-month` | coluna | `count` pedidos por `mes_cadastro` (todos filtrados) |
| 3 | `ticket-month` | linha | ticket médio (`sum valor_final / count`) receita ativa por mês |
| 4 | `orders-status` | funil (`funnel`) | `aggregateOrdersByGroup`; pipeline com cor `--warning-fg` |
| 5 | `revenue-vendor` | barras horizontais | top 12 vendedores por `sum(valor_final)` receita ativa |
| 6 | `orders-vendor` | barras | top 12 vendedores por `count` (todos filtrados) |
| 7 | `pending-status` | barras empilhadas | `sum(valor_pendente)` por `situacao_grupo`; excluir cancelados |
| 8 | `discount-month` | linha | `sum(valor_desconto)` receita ativa por `mes_cadastro` |
| 9 | `top-clients` | barras horizontais | top 12 clientes por `sum(valor_final)` receita ativa |
| 10 | `on-time-delivery` | rosca | entregues: `entregue_no_prazo === true` vs `false` (com datas válidas) |
| 11 | `production-time-month` | linha | média `dias_producao` por `mes_entrega` (entregues válidos) |
| 12 | `ticket-distribution` | histograma | bins de `valor_final` receita ativa (5 faixas automáticas ou fixas: 0–500, 500–1k, 1k–2k, 2k–5k, 5k+) |

ECharts: `echarts.init(dom, theme)`, cores `--chart-1..5`, tooltip pt-BR via `formatBrl`/`formatPercent`, `dispose` ao trocar rota. Funil usa `series.type = "funnel"`. Histograma usa `series.type = "bar"` com bins pré-agregados em `metrics.js`.

Disposição: KPIs no topo; grade `pedidos-charts-grid` 2 colunas desktop / 1 coluna mobile (espelhar `.finance-charts-grid`).

## Tabelas de exceção (6 tabelas, scroll virtual)

Todas via `MoldeTables.renderVirtualTable` (sem limite de linhas). Container: `data-ped-table="{id}"`.

Colunas base (`PEDIDOS_TABLE_COLUMNS.base`):

```text
pedido_id, cliente, vendedor, situacao_grupo, valor_final, valor_pendente, status_financeiro
```

| # | id | Filtro | Ordenação | Colunas extra |
|---|-----|--------|-----------|---------------|
| 1 Atrasados | `overdue` | `entregue_no_prazo === false` | `dias_atraso` desc | `dias_atraso`, `data_prevista` |
| 2 Entregues c/ pendência | `delivered-pending` | `situacao_grupo === "Entregue"` e `valor_pendente > 0.01` | `valor_pendente` desc | — |
| 3 Sem cliente | `no-client` | `!cliente` ou `cliente_normalizado` vazio | — | badge alerta |
| 4 Sem data prevista | `no-forecast` | `!data_prevista` | — | badge alerta |
| 5 Desconto alto | `high-discount` | `valor_desconto / valor_bruto >= 0.20` (≥ 20%) com `valor_bruto > 0` | `% desconto` desc | coluna `% desconto` calculada |
| 6 Pipeline em aprovação | `pipeline` | `situacao_grupo === "Pipeline / orçamento"` | `data_cadastro` asc | `data_cadastro` |

Badges semânticos: `situacao_grupo` e `status_financeiro` via `type: "badge"` (`docs/TABLES.md`). Empty state por tabela quando conjunto vazio.

Grade: `pedidos-tables-grid` — 2 colunas desktop, empilhado mobile (espelhar `.finance-tables-grid`).

## Filtros contextuais FLT-02 (D-21..D-23)

Estado (`filterState.pedidos`) já implementado em `filters.js` (`applyPedidoFilters`). UI completa **deferida da Fase 6** — expor na rota `pedidos`:

### Extensão `renderFilterPanelContent`

Adicionar branch `route === "pedidos"` → `renderPedidoFilters(pedidos)`:

**Período/valor** (globais, reutilizar `renderPeriodFilterFields`):
- Ano, mês, valor mín/máx — período por `data_cadastro`/`mes_cadastro` (D-23)
- Busca via topbar (`filterState.search`)

**Multi-seleção** (`renderFilterDropdown`):
- `pedidos.situacao` → `situacao_original`
- `pedidos.situacaoGrupo` → `situacao_grupo`
- `pedidos.vendedor` → `vendedor`
- `pedidos.cliente` → `cliente`
- `pedidos.formaEntrada` → `forma_pagamento_entrada`
- `pedidos.formaSaldo` → `forma_pagamento_saldo`

**Toggles booleanos** (`filter-toggle-grid`, mapear `filterState.pedidos.<flag>`):

| Flag | Label |
|------|-------|
| `comPendente` | Com valor pendente |
| `semCliente` | Sem cliente |
| `semDataPrevista` | Sem data prevista |
| `entregueNoPrazo` | Entregue no prazo |
| `atrasado` | Atrasado |
| `cancelado` | Cancelado |
| `aguardandoAprovacao` | Aguardando aprovação |

### Handler de toggles

Estender `attachGlobalInteractions`: `data-filter-toggle-flag` precisa distinguir grupo — usar prefixo `pedidos:` (ex.: `data-filter-toggle-flag="pedidos:comPendente"`) ou atributo `data-filter-toggle-group="pedidos"`. Handler atual só grava em `filterState.contas`.

### Re-render

`onFilterStateChanged`: adicionar `if route === "pedidos" && hasPedidosData() → mountPedidosDashboard()`.

`toggleTheme`: re-mount pedidos charts quando rota ativa.

`scheduleExecutiveChartResize`: incluir `pedidosChartInstances`.

## Anti-Patterns (Do Not)

- Não incluir pipeline em KPIs do bloco Valores nem em gráficos de receita realizada.
- Não incluir despesas/contas nos KPIs/gráficos do Pedidos.
- Não recomputar `situacao_grupo`, `dias_producao`, `dias_atraso`, `entregue_no_prazo` — usar derivados do normalizer.
- Não deixar instâncias ECharts sem `dispose` ao trocar rota.
- Não limitar tabelas de exceção a 10 linhas — usar scroll virtual.
- Não inventar KPI sem fonte de dados (`docs/resume.md` §Página 4).
- Não misturar filtros de contas na UI da rota Pedidos (somente FLT-02 + globais).

## Files to Modify

| Arquivo | Mudanças |
|---------|----------|
| `js/metrics.js` | `computePedidosKpis`, agregações mensais (receita, pedidos, ticket, desconto, produção), `topClientsByRevenue`, `pendingByStatus`, `ticketHistogram`, getters das 6 tabelas de exceção |
| `js/charts.js` | `renderPedidosCharts`, `disposePedidosCharts` (12 instâncias) |
| `js/app.js` | `renderPedidosPage`, `mountPedidosDashboard`, `PEDIDOS_KPI_BLOCKS`, `PEDIDOS_CHART_PANELS`, `PEDIDOS_TABLES`, `PEDIDOS_TABLE_COLUMNS`, `renderPedidoFilters`, branch FLT-02 em `renderFilterPanelContent`, handler toggles pedidos, `onFilterStateChanged`/`toggleTheme`/`scheduleExecutiveChartResize`, registrar `render: renderPedidosPage` na rota `pedidos`, `pedidosChartInstances`, `hasPedidosData()` |
| `js/filters.js` | (opcional) estender `getActiveChips` para toggles/campos pedidos |
| `css/app.css` | `.pedidos-charts-grid`, `.pedidos-tables-grid` (espelhar financeiro) |
| `index.html` | Sem mudança obrigatória; scripts já carregados cobrem a fase |

## Validation Architecture

| Check | Command |
|-------|---------|
| Syntax | `node --check js/metrics.js js/charts.js js/app.js js/filters.js js/tables.js` |
| Pedidos metrics | `rg "computePedidosKpis\|aggregateRevenueByMonth\|topClientsByRevenue\|getPedidosAtrasados" js/metrics.js` |
| Pedidos charts | `rg "renderPedidosCharts\|orders-status\|ticket-distribution" js/charts.js` |
| Pedidos route | `rg "renderPedidosPage\|mountPedidosDashboard" js/app.js` |
| FLT-02 UI | `rg "renderPedidoFilters\|route === \"pedidos\"" js/app.js` |
| Filter re-render | `rg "mountPedidosDashboard" js/app.js` (em `onFilterStateChanged`) |
| 6 exception tables | `rg "data-ped-table" js/app.js` (6 ocorrências) |
| Pipeline isolation | `rg "metric-block--pipeline" js/app.js` (bloco Pedidos) |

Manual: importar planilha de pedidos, abrir `#pedidos`, conferir 15 KPIs (bloco Pipeline com badge warning), 12 gráficos renderizados, 6 tabelas com scroll, alterar filtro de vendedor/situação e ver tudo re-renderizar; confirmar que valores do bloco Valores não mudam ao filtrar só pipeline.

## RESEARCH COMPLETE
