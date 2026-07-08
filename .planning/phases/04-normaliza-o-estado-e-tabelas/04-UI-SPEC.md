---
phase: 04
slug: normaliza-o-estado-e-tabelas
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-08
---

# Phase 04 — UI Design Contract

> Visual and interaction contract for normalized data, filters, and tables.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | static HTML/CSS/JavaScript |
| Component library | none |
| Density | compact for tables (`docs/TABLES.md`) |
| Tokens | reuse `css/app.css` from Phase 1 |

No new frameworks, gradients, or decorative charts.

---

## Topbar Filter Panel

Add toggle button in `.topbar-actions`:

- Label: `Filtros`
- `data-filter-toggle` toggles `data-filter-open` on `.app-shell`
- Panel `.filter-panel` below topbar, collapsible, visible on **all routes**
- Contains: período (from/to month inputs or month+year selects), busca livre, valor min/max
- Pedidos-specific and contas-specific sections shown when route is `base-dados` OR always visible in panel grouped by heading `Pedidos` / `Contas`
- Footer actions: `Limpar filtros` (outline), active filter chips removable above panel body
- Multi-select categorical controls: native `<select multiple>` or checkbox list in compact fieldsets

Search box in topbar: enable when dataset loaded; binds to global `search` filter (do not leave permanently disabled after Phase 4).

---

## Base de Dados Page

Replace empty state when `appState.dataset` exists.

### Tablist

```text
[ Pedidos ] [ Contas a pagar ] [ Indicadores ]
```

- `role="tablist"` / `role="tab"` / `role="tabpanel"`
- Default tab: `pedidos`
- Only show Indicadores tab if `dataset.indicadores.length > 0` or indicadores source loaded

### Table Toolbar (per tab)

Order per `docs/TABLES.md`:

1. Search (inherits global or local override)
2. Column visibility toggle (`Colunas`)
3. `Exportar` (enabled when rows exist)
4. Row count label: `N registros` (filtered / total)

### Virtual Scroll Table

- Container `.table-virtual-viewport` with fixed height (~480px desktop)
- Row height 36px compact
- Sticky header inside viewport
- Sortable headers with `aria-sort`
- Warning rows: class `data-table-row-warning`, badge `badge-warning` in status/id column with first `validationAlerts` message

### Default Visible Columns

**Pedidos:** Pedido, Situação, Grupo, Cliente, Vendedor, Valor Final, Valor Pago, Valor Pendente, Data cadastro, Data prevista, Data entregue, Status financeiro

**Contas:** Fornecedor, Descrição, Valor, Vencimento, Pagamento, Status pagamento, Categoria, Classificação, Conta, Parcela

**Indicadores:** Mês, Setor, Indicador, Valor, Meta, Origem, Calculável

Technical fields hidden by default; column visibility persists in `localStorage` keys `molde-cols-pedidos`, `molde-cols-contas`, `molde-cols-indicadores`.

---

## Other Routes (Phase 4)

Executivo, Financeiro, Pedidos, etc. keep existing empty states but:

- Filter panel remains usable (chips update)
- Optional subtle banner: `Filtros ativos — dashboards na Fase 5`

No fake KPI numbers in Phase 4.

---

## CSV Export

- Filename: `molde-{tab}-{YYYY-MM-DD}.csv`
- UTF-8 with BOM
- Separator `;`
- Headers in pt-BR column labels
- Exports **filtered** rows only

---

## Accessibility

- Filter toggle: `aria-expanded`, `aria-controls`
- Tabs: roving tabindex or standard tab keyboard pattern
- Virtual scroll: `aria-rowcount`, preserve focus on sort
