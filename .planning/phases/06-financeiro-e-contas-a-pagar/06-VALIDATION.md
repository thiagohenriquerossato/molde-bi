---
phase: 6
slug: financeiro-e-contas-a-pagar
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-08
---

# Phase 6 — Validation Strategy

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
- **Before `/gsd-verify-work`:** conferência manual em `#financeiro` com planilhas reais
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 06-01-01 | 01 | 1 | FIN-01 | unit-rg | `rg "computeFinanceKpis\|mediaMensalDespesas\|percentualFixas" js/metrics.js` | ⬜ pending |
| 06-01-02 | 01 | 1 | FIN-02 | unit-rg | `rg "aggregateExpensesByMonth\|aggregatePaidOpenByMonth\|dueHeatmapMatrix\|supplierAbc" js/metrics.js` | ⬜ pending |
| 06-01-03 | 01 | 1 | FIN-01 | unit-rg | `rg "finance-charts-grid\|chart-panel--wide\|finance-tables-grid" css/app.css` | ⬜ pending |
| 06-02-01 | 02 | 2 | FIN-02 | unit-rg | `rg "renderFinanceCharts\|due-heatmap\|supplier-abc" js/charts.js` | ⬜ pending |
| 06-02-02 | 02 | 2 | FIN-02 | unit-rg | `rg "heatmap\|visualMap\|type: \"pie\"" js/charts.js` | ⬜ pending |
| 06-03-01 | 03 | 3 | FIN-01, FIN-02 | unit-rg | `rg "renderFinanceiroPage\|mountFinanceiroDashboard" js/app.js` | ⬜ pending |
| 06-03-02 | 03 | 3 | FIN-03 | unit-rg | `rg "data-fin-table" js/app.js` (6x) + `rg "renderVirtualTable" js/app.js` | ⬜ pending |
| 06-03-03 | 03 | 3 | FLT-03 | unit-rg | `rg "isAnalyticalRoute\|updateFilterVisibility" js/app.js` | ⬜ pending |
| 06-03-04 | 03 | 3 | FIN-03 | unit-rg | `rg "renderVirtualTable" js/app.js` (executivo retrofit) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Infra existente cobre requisitos: `node --check` em todos `js/*.js`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 12 KPIs financeiros | FIN-01 | Data-dependent | Importar planilhas, abrir `#financeiro`, conferir 3 blocos com 4/3/5 cards |
| 10 gráficos renderizam | FIN-02 | Canvas/DOM | Confirmar 10 gráficos visíveis incl. heatmap e Pareto |
| 6 tabelas scroll virtual | FIN-03 | DOM/runtime | Rolar cada tabela, confirmar >10 linhas sem paginação |
| Filtro re-renderiza | FLT-03 | Runtime | Trocar fornecedor, ver KPIs/gráficos/tabelas atualizarem |
| Painel oculto no Upload/Base | FLT-03 | DOM | Ir para `#upload` e `#base-dados`, confirmar painel/botão de filtros ocultos |
| Retrofit executivo | FIN-03 | DOM | Confirmar listas do `#executivo` com scroll virtual |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending 2026-07-08
