---
phase: 7
slug: pedidos-e-receita
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-08
---

# Phase 7 — Validation Strategy

> Contrato de validação por fase para amostragem de feedback durante a execução.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — vanilla JS, `node --check` + ripgrep |
| **Config file** | none |
| **Quick run command** | `node --check js/metrics.js js/charts.js js/app.js` |
| **Full suite command** | `node --check js/*.js && rg "window.Molde(Metrics|Charts|Filters|Tables)" js/` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** quick run command + bloco `rg`/`verify` da task
- **After every plan wave:** full suite command
- **Before `/gsd-verify-work`:** conferência manual em `#pedidos` com planilha real
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 07-01-01 | 01 | 1 | ORD-01 | unit-rg | `rg "computePedidosKpis|descontoMedio|percentualEntregueNoPrazo" js/metrics.js` | ⬜ pending |
| 07-01-02 | 01 | 1 | ORD-02 | unit-rg | `rg "aggregateRevenueByMonth|ticketHistogram|pendingByStatus" js/metrics.js` | ⬜ pending |
| 07-01-03 | 01 | 1 | ORD-01 | unit-rg | `rg "pedidos-charts-grid|pedidos-tables-grid" css/app.css` | ⬜ pending |
| 07-02-01 | 02 | 2 | ORD-02 | unit-rg | `rg "renderPedidosCharts|orders-status|ticket-distribution" js/charts.js` | ⬜ pending |
| 07-03-01 | 03 | 3 | ORD-01, ORD-02 | unit-rg | `rg "renderPedidosPage|mountPedidosDashboard" js/app.js` | ⬜ pending |
| 07-03-02 | 03 | 3 | ORD-03 | unit-rg | `rg "data-ped-table" js/app.js` (6x) | ⬜ pending |
| 07-03-03 | 03 | 3 | FLT-02 | unit-rg | `rg "renderPedidoFilters|route === \"pedidos\"" js/app.js` | ⬜ pending |

---

## Manual UAT Checklist

1. Importar `Pedidos_Simplificado.xlsx`, abrir `#pedidos`
2. Conferir 15 KPIs em 4 blocos; Pipeline com badge warning
3. Conferir 12 gráficos renderizados
4. Conferir 6 tabelas com scroll virtual
5. Alterar filtro de vendedor e ver KPIs/gráficos/tabelas atualizarem
6. Confirmar bloco Valores não inclui pipeline
