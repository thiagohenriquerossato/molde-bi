---
phase: 06
slug: financeiro-e-contas-a-pagar
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-08
---

# Phase 06 — UI Design Contract

> Contrato visual e de interação da página operacional Financeiro / Contas a Pagar.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | static HTML/CSS/JavaScript |
| Component library | none |
| Density | KPI cards compactos (`docs/COMPONENTS.md`, máx. 4/linha, <120px) |
| Tables | densas + scroll virtual (`docs/TABLES.md`) |
| Charts | ECharts, paleta dessaturada `docs/TOKENS.md` |
| Tokens | reusar `css/app.css` |

Layout table-first/operacional (`docs/DESIGN.md`): KPIs no topo, gráficos de apoio, tabelas protagonistas. Sem gradientes, sem gráficos decorativos, sem hero cards.

---

## Page Structure (`#financeiro`)

Stack vertical quando `hasDataset()` e há contas importadas (`canContinueToDashboards()` ou contas válidas):

1. `page-header` (padrão existente, badge "Dados carregados")
2. **Blocos de KPI** (3 seções com título)
3. **Grade de gráficos** (2 colunas desktop; heatmap e ABC ocupam linha inteira)
4. **Grade de tabelas de exceção** (2 colunas × 3 linhas desktop; scroll virtual)

Se sem contas: `renderEmptyPage(route)` existente.

---

## KPI Blocks (FIN-01)

```text
Posição      → 4 cards: Total de contas, Total pago, Total aberto, Total vencido
Vencimentos  → 3 cards: Vence hoje, Vence em 7 dias, Vence em 30 dias
Análise      → 5 cards: Média mensal de despesas, Maior fornecedor do mês,
               Maior classificação do mês, % despesas fixas, % despesas variáveis
```

- Reusar `renderMetricBlock` + `renderMetricCard` do `app.js`.
- Cards "Maior fornecedor do mês" e "Maior classificação do mês": nome em destaque no `metric-card-value` (truncado em 1 linha via `text-overflow: ellipsis`) + valor R$ no `metric-card-subtitle` (D-04).
- Percentuais exibem `NN,N%` (1 casa, pt-BR).
- Valores monetários: `Intl.NumberFormat pt-BR` currency, `tabular-nums`.

---

## Charts Grid (FIN-02)

Container `.finance-charts-grid` (2 colunas). Painéis `.chart-panel` com `h3.chart-panel-title` + `div.chart-canvas`.

| `data-chart` | Título | Span |
|--------------|--------|------|
| `expenses-month` | Despesas por mês | 1 |
| `paid-open-month` | Pago × aberto por mês | 1 |
| `expenses-category` | Despesas por categoria | 1 |
| `expenses-classification` | Despesas por classificação | 1 |
| `top-suppliers` | Top fornecedores | 1 |
| `due-heatmap` | Calendário de vencimentos | 2 (linha inteira) |
| `supplier-abc` | Curva ABC de fornecedores | 2 (linha inteira) |
| `fixed-evolution` | Evolução despesas fixas | 1 |
| `variable-evolution` | Evolução despesas variáveis | 1 |
| `bank-account` | Saídas por conta bancária | 1 |

Painéis span-2 recebem classe `.chart-panel--wide` (`grid-column: 1 / -1`). Canvas min-height 280px; heatmap pode usar 320px.

---

## Exception Tables (FIN-03)

Container `.finance-tables-grid` (2 colunas). Cada tabela em `article.card` com `h3.chart-panel-title` + `div[data-fin-table="..."]` (host do scroll virtual).

Ordem (grade 2×3):
1. Contas vencidas (`data-fin-table="overdue"`)
2. Próximos 7 dias (`data-fin-table="upcoming"`)
3. Contas sem valor (`data-fin-table="no-value"`)
4. Contas sem classificação (`data-fin-table="no-class"`)
5. Pagas sem data de pagamento (`data-fin-table="paid-no-date"`)
6. Lançamentos futuros por mês (`data-fin-table="future"`)

Colunas base: Fornecedor, Vencimento, Valor, Status pagamento. Extras: `dias_atraso` (vencidas), `mes_vencimento` (futuros). Scroll virtual via `MoldeTables.renderVirtualTable` — sem limite de 10 linhas. Badges semânticos para `status_pagamento`. Empty state por tabela quando vazia.

---

## Filter Behavior (FIN-04 / FLT-03)

- Painel de filtros **oculto** em `#upload` e `#base-dados` (botão "Filtros" e painel escondidos).
- Painel **visível** em rotas analíticas (executivo, financeiro, pedidos, resultado, insights).
- Conteúdo **contextual por rota**:
  - `financeiro`: período (ano/mês), valor min/max, status pagamento, fornecedor, classificação, categoria, conta, parcela + toggles (vencido, vence hoje, vence 7d, vence 30d, sem valor, sem classificação, sem conta, pago/não pago).
  - `executivo`: mix pedidos + contas (atual).
- Alterar qualquer filtro re-renderiza KPIs, gráficos e tabelas do Financeiro sem reload.
- Chips de filtro ativo permanecem visíveis.
- Base de Dados mantém busca/ordenação/export na toolbar — sem painel global duplicado.

---

## Responsive

| Breakpoint | KPI grid | Charts | Tabelas |
|------------|----------|--------|---------|
| Desktop ≥1024 | 4 cols | 2 cols (wide=full) | 2 cols |
| Tablet 768–1023 | 2 cols | 1 col | 1 col |
| Mobile <768 | 1 col | 1 col | 1 col |

---

## Accessibility

- Canvas de gráfico com `role="img"` + `aria-label` descritivo.
- Cards: label antes do valor.
- Tabelas: `thead`/`tbody`, `scope` nos headers (herda de `renderVirtualTable`).
- Blocos com títulos `h2`/`h3` semânticos.
