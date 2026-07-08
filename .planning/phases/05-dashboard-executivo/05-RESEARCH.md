# Phase 5: Dashboard Executivo - Research

**Researched:** 2026-07-08
**Status:** Complete

## Scope Anchor

Phase 5 delivers the first real analytical page at `#executivo`: 12 compact KPIs in thematic blocks, 6 ECharts charts, short exception tables for overdue/upcoming contas, all driven by normalized pedidos/contas data and global filters. Pipeline (`Aguardando Aprovação` / `situacao_grupo === "Pipeline / orçamento"`) must never inflate revenue, resultado or recebido metrics.

## Technical Findings

### Architecture

Split responsibilities across three new modules:

```text
appState.dataset
  → MoldeFilters.applyFilters(pedidos|contas, filterState)
  → MoldeMetrics.computeExecutive*(filteredPedidos, filteredContas)
  → MoldeCharts.renderExecutive*(container, series, theme)
  → app.js renderExecutivoPage + onFilterStateChanged refresh
```

Keep `app.js` as orchestrator only — no aggregation logic inline.

### Revenue Semantics (Critical)

From `docs/resume.md` §7 and `05-CONTEXT.md` D-04..D-11:

| Concept | Rule |
|---------|------|
| Receita ativa | Sum `valor_final` where `situacao_grupo` in `["Pedido ativo", "Entregue"]` |
| Pipeline | Sum `valor_final` where `situacao_grupo === "Pipeline / orçamento"` |
| Excluded | `situacao_grupo === "Perdido / cancelado"` and `Sem status` from revenue KPIs |
| Valor recebido | Sum `valor_pago` on non-cancelled pedidos (active + pipeline + entregue) OR only active+entregue — **use active+entregue only** to avoid counting unpaid pipeline as received |
| Valor pendente | Sum `valor_pendente` on non-cancelled pedidos in filtered set |
| Resultado competência | Receita ativa (period) − despesas totais contas (period) |
| Ticket médio | `sum(valor_final non-cancelled) / count(non-cancelled pedidos)` |

**Recebido/pendente:** Use all non-cancelled pedidos for cash-position KPIs (matches operational "a receber" view), but **monthly revenue charts** use receita ativa only.

### Contas KPIs

| KPI | Rule |
|-----|------|
| Despesas totais | Sum `valor` on filtered contas |
| Despesas pagas | Sum `valor` where `pago === true` or `status_pagamento === "Pago"` |
| Despesas em aberto | Sum `valor` where not paid |
| Contas vencidas | Sum `valor` where `status_pagamento === "Vencido"` OR count for KPI card (show sum) |

### Despesa fixa vs variável

No derived field exists yet. `metrics.js` should add:

```js
function isDespesaFixa(row) {
  const text = `${row.classificacao_normalizada || ""} ${row.categoria_normalizada || ""}`.toUpperCase();
  return DESPESA_FIXA_KEYWORDS.some((kw) => text.includes(kw));
}
```

`DESPESA_FIXA_KEYWORDS` initial set: `SALARIO`, `SALÁRIO`, `ALUGUEL`, `INTERNET`, `TELEFONE`, `CONTADOR`, `ENERGIA`, `ÁGUA`, `AGUA`, `CONDOMINIO`, `CONDOMÍNIO`, `FIXA`.

Unmatched → variável. Document list in code; refine from real spreadsheet distinct values if needed.

### Monthly Aggregation

```js
function monthKeyFromPedido(row) { return row.mes_cadastro || formatYYYYMM(row.data_cadastro); }
function monthKeyFromConta(row) { return row.mes_vencimento || formatYYYYMM(row.data_vencimento); }
```

Build `Map<YYYY-MM, aggregates>` for charts. Sort keys chronologically. When year/month global filter active, KPIs use filtered rows; charts show months present in filtered data (may be single month).

### ECharts Integration

- Library: `vendor/echarts/echarts.min.js` (already in `index.html`)
- Read CSS variables for theme: `--chart-1`..`--chart-5` from `document.documentElement`
- `echarts.init(dom, null, { locale: "PT-br" })` if locale bundle absent, format tooltips manually with `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`
- Store instances in `appState.executiveChartInstances[]`
- On route leave or re-render: `instance.dispose()` each, clear array
- `window.addEventListener("resize", debouncedResize)` only while `#executivo` active

Chart mapping (EXE-02):

| Chart | Type | Series |
|-------|------|--------|
| Receita × Despesa × Resultado | bar + line combo | receita ativa, despesas, resultado by month |
| Recebido × Pendente | stacked bar | valor_pago, valor_pendente by month (pedidos) |
| Fixas × Variáveis | stacked bar | fixa, variavel by month (contas) |
| Pedidos por status | donut/pie | count by `situacao_grupo` |
| Top classificações | horizontal bar | top 10 sum valor by `classificacao` |
| Top vendedores | horizontal bar | top 10 sum receita ativa by `vendedor` |

### Exception Lists (EXE-03)

From filtered contas (not further narrowed by status filter for lists — use `applyFilters` then subset):

- **Vencidas:** `status_pagamento === "Vencido"`, sort `dias_atraso` desc, limit 10
- **Próximas 7 dias:** `status_pagamento === "Próximos 7 dias"`, sort `data_vencimento` asc, limit 10

Render as compact HTML tables (not virtual scroll) — max 10 rows each.

### Filter Integration

Extend `onFilterStateChanged()` in `app.js`:

```js
if (getRouteFromHash() === "executivo" && hasDataset()) {
  mountExecutivoDashboard();
}
```

`hasDataset()` requires pedidos OR contas — executive page needs **both** required sources for full dashboard; if only one present, show partial KPIs with helper text for missing source (or keep empty state until both required imports validated — **prefer**: show available metrics when `canContinueToDashboards()` true).

### CSS Additions

New classes in `css/app.css`:

- `.metric-block`, `.metric-block-title`, `.metric-grid` (4 cols desktop, 2 tablet, 1 mobile)
- `.metric-card`, `.metric-card-label`, `.metric-card-value`, `.metric-card--warning` (pipeline block)
- `.executive-charts-grid` (2 columns desktop)
- `.chart-panel` (min-height 280px, border card)
- `.executive-exceptions` (2-col grid for tables)

### Files to Create/Modify

| File | Action |
|------|--------|
| `js/metrics.js` | New — `window.MoldeMetrics` |
| `js/charts.js` | New — `window.MoldeCharts` |
| `js/app.js` | `renderExecutivoPage`, filter hook, chart lifecycle |
| `css/app.css` | Metric + chart layout |
| `index.html` | Script tags for metrics.js, charts.js before app.js |

### Anti-Patterns (Do Not)

- Do not use pipeline in `sumReceitaAtiva` or monthly revenue series
- Do not hardcode fake KPI values
- Do not leave `echarts.init` without `dispose` on re-render
- Do not add resultado caixa (Phase 8)
- Do not add drill-down navigation to `#financeiro`

## Validation Architecture

| Check | Command |
|-------|---------|
| Syntax | `node --check js/metrics.js js/charts.js js/app.js` |
| Metrics module | `rg "window\\.MoldeMetrics|receitaAtiva|Pipeline / orçamento" js/metrics.js` |
| Charts module | `rg "window\\.MoldeCharts|echarts\\.init|dispose" js/charts.js` |
| Executive route | `rg "renderExecutivoPage|mountExecutivoDashboard" js/app.js` |
| No pipeline in revenue | `rg "receitaAtiva|RECEITA_ATIVA" js/metrics.js` and verify pipeline excluded |
| Pipeline isolation | `rg "metric-card--warning|Pipeline \\(orçamento\\)" js/app.js css/app.css` |

Manual: upload real sheets, land on `#executivo`, confirm pipeline KPI ≠ receita ativa, change year filter and see KPIs/charts update.

## RESEARCH COMPLETE
