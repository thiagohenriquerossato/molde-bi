---
phase: 05
slug: dashboard-executivo
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-08
---

# Phase 05 — UI Design Contract

> Visual and interaction contract for the executive dashboard.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | static HTML/CSS/JavaScript |
| Component library | none |
| Density | compact metric cards (`docs/COMPONENTS.md`, max 4/row, <120px) |
| Charts | ECharts, desaturated palette from `docs/TOKENS.md` |
| Tokens | reuse `css/app.css` |

No gradients, decorative charts or oversized hero cards.

---

## Page Structure (`#executivo`)

Vertical stack when `hasDataset()` and `canContinueToDashboards()`:

1. `page-header` (existing pattern)
2. **Metric blocks** (4 sections with titles)
3. **Charts grid** (2 columns desktop, 1 mobile)
4. **Exception tables** (2 columns desktop)

If dataset incomplete: keep existing `renderEmptyPage` empty state.

---

## Metric Blocks

### Block order and titles

```text
Receita          → 3 cards: Receita ativa, Valor recebido, Valor pendente
Despesas         → 4 cards: Despesas totais, Pagas, Em aberto, Contas vencidas
Resultado e pedidos → 4 cards: Resultado competência, Ticket médio, Pedidos totais, Pedidos entregues
Pipeline         → 1 card isolated: Pipeline (orçamento)
```

### Pipeline block (D-08, D-09)

- Wrapper `.metric-block.metric-block--pipeline`
- Card `.metric-card.metric-card--warning`
- Label: `Pipeline (orçamento)`
- Subtitle/badge: `Não contabilizado na receita`
- Value: formatted BRL, count subtitle optional (`N pedidos`)

### Metric card markup

```html
<section class="metric-block">
  <h2 class="metric-block-title">Receita</h2>
  <div class="metric-grid">
    <article class="metric-card">
      <p class="metric-card-label">Receita ativa</p>
      <p class="metric-card-value">R$ 0,00</p>
    </article>
  </div>
</section>
```

Values use `tabular-nums`, `Intl.NumberFormat pt-BR` currency.

---

## Charts Grid

Container `.executive-charts-grid` with 6 panels `.chart-panel`:

| `data-chart` | Title |
|--------------|-------|
| `revenue-expense-result` | Receita, despesa e resultado por mês |
| `received-pending` | Recebido e pendente por mês |
| `fixed-variable` | Despesas fixas e variáveis por mês |
| `orders-status` | Pedidos por situação |
| `top-classification` | Top 10 despesas por classificação |
| `top-vendors` | Top vendedores por receita |

Each panel: `h3.chart-panel-title` + `div.chart-canvas` min-height 280px.

---

## Exception Tables

Section `.executive-exceptions` with two `.card` articles:

1. **Contas vencidas** — table max 10 rows
2. **Próximos 7 dias** — table max 10 rows

Columns: Fornecedor, Vencimento, Valor, Status — compact `data-table` style from `docs/TABLES.md`.

No row click / navigation to Financeiro in Phase 5.

---

## Filter Behavior

- Global topbar filters apply to all KPIs, charts and exception lists
- Active filter chips remain visible
- Changing any filter re-renders executive content without full page reload
- Remove Phase 4 helper banner "Dashboards analíticos chegam na Fase 5" from executivo when real dashboard mounts

---

## Responsive

| Breakpoint | Metric grid | Charts | Exceptions |
|------------|-------------|--------|------------|
| Desktop ≥1024 | 4 cols | 2 cols | 2 cols |
| Tablet 768–1023 | 2 cols | 1 col | 1 col |
| Mobile <768 | 1 col | 1 col | 1 col |

---

## Accessibility

- Chart panels: `aria-label` on canvas wrapper describing chart purpose
- Metric values associated with labels via structure (label before value)
- Tables: proper `thead`/`tbody`, scope on headers
