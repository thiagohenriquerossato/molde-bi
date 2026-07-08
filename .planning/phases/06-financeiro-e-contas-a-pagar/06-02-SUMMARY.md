---
phase: 6
plan: 02
status: complete
completed: 2026-07-08
requirements_addressed:
  - FIN-02
---

# Phase 6 Plan 02 Summary: Gráficos ECharts do Financeiro

## What was built

Adicionado `renderFinanceCharts(containers, contas, theme)` a `MoldeCharts` em `js/charts.js` com os 10 gráficos do Financeiro, reusando tema, cores (`--chart-*`), tooltips pt-BR e `initChart`.

- Linhas: despesas por mês, evolução fixas, evolução variáveis.
- Barras empilhadas: pago × aberto por mês.
- Rosca: despesas por categoria.
- Barras horizontais: despesas por classificação, top fornecedores (15).
- Heatmap mês×dia (`visualMap` + `series.type = "heatmap"`) para calendário de vencimentos.
- Pareto ABC (barras + linha % acumulado no segundo `yAxis` 0–100) com "Outros".
- Barras: saídas por conta bancária.
- Helpers `lineOption`, `horizontalBarOption`, `donutOption`; `disposeFinanceCharts` exportado.

## Key files
- created: —
- modified: `js/charts.js`

## Verification
- `node --check js/charts.js` exit 0.
- `rg "renderFinanceCharts|visualMap|heatmap|supplierAbc|yAxisIndex"` confirma implementação.

## Self-Check: PASSED
