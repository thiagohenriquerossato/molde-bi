# Phase 8: Resultado Integrado - Research

**Researched:** 2026-07-08
**Status:** Complete

## Scope Anchor

Fase 8 entrega `#resultado` com 3 blocos (Competência, Caixa, Posição operacional), 11 KPIs e 6 gráficos ECharts, filtros FLT-02 + FLT-03, toggle Cadastro|Entrega só no bloco Competência. Pipeline excluído de receita/resultado.

## Technical Findings

### Arquitetura

```text
appState.dataset
  → MoldeFilters.applyFilters(pedidos/contas)
  → MoldeMetrics.computeResultadoKpis + agregações caixa/projeção
  → MoldeCharts.renderResultadoCharts
  → app.js renderResultadoPage + mountResultadoDashboard
```

### Reuso

| Asset | Uso |
|-------|-----|
| `computeExecutiveKpis` / `aggregateRevenueExpenseByMonth` | Base competência |
| `isDespesaFixa`, `isReceitaAtiva` | Break-even, receita |
| `renderFinanceiroPage` / `renderPedidosPage` | Padrão de página analítica |
| `renderResultadoFilters` | FLT-02 + FLT-03 + toggle base receita |

### Novas funções (metrics.js)

- `computeResultadoKpis` — 3 blocos de KPIs
- `aggregateRevenueExpenseByMonthCompetencia` — toggle cadastro/entrega
- `aggregateReceivedPaidByMonth`, `aggregateCashProjection` — caixa
- `aggregateReceivablesOpenByMonth`, `aggregateBreakEvenByMonth` — operacional
- `sumCashReceivedInPeriod`, `sumCashPaidInPeriod` — movimentação real

### Filtros

- `filterState.resultado.receitaBase`: `"cadastro"` | `"entrega"`
- Caixa: período em `mes_cadastro` (entrada) e `data_pagamento` (saída)
- Competência: cross-domain cadastro/vencimento (ou entrega/vencimento)
