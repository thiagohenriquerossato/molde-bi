---
phase: 5
slug: dashboard-executivo
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-08
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — vanilla JS, `node --check` + ripgrep |
| **Config file** | none |
| **Quick run command** | `node --check js/metrics.js js/charts.js js/app.js` |
| **Full suite command** | `node --check js/*.js && rg "window.Molde(Metrics|Charts)" js/` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command + task-specific `rg`/`verify` block
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Manual browser check on `#executivo` with real spreadsheets
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | EXE-01, EXE-04 | T-05-01 | Receita ativa excludes pipeline | unit-rg | `rg "receitaAtiva|RECEITA_ATIVA|Pipeline / orçamento" js/metrics.js` | ⬜ | ⬜ pending |
| 05-01-02 | 01 | 1 | EXE-01 | T-05-02 | 12 KPI aggregates exported | unit-rg | `rg "computeExecutiveKpis|ticketMedio|resultadoCompetencia" js/metrics.js` | ⬜ | ⬜ pending |
| 05-01-03 | 01 | 1 | EXE-01 | — | Metric card CSS | unit-rg | `rg "metric-card|metric-grid|metric-block" css/app.css` | ⬜ | ⬜ pending |
| 05-02-01 | 02 | 2 | EXE-02 | T-05-03 | ECharts init + dispose | unit-rg | `rg "echarts\\.init|dispose|renderExecutive" js/charts.js` | ⬜ | ⬜ pending |
| 05-02-02 | 02 | 2 | EXE-02, EXE-04 | T-05-01 | Revenue series use active only | unit-rg | `rg "receitaAtiva|revenueExpenseResult" js/charts.js js/metrics.js` | ⬜ | ⬜ pending |
| 05-03-01 | 03 | 3 | EXE-01, EXE-03 | T-05-04 | Executive page renderer | unit-rg | `rg "renderExecutivoPage|mountExecutivoDashboard" js/app.js` | ⬜ | ⬜ pending |
| 05-03-02 | 03 | 3 | EXE-03 | — | Exception tables limit 10 | unit-rg | `rg "vencidas|proximos|exception" js/app.js js/metrics.js` | ⬜ | ⬜ pending |
| 05-03-03 | 03 | 3 | EXE-04 | T-05-05 | Filter change refreshes executive | unit-rg | `rg "executivo.*onFilterStateChanged|onFilterStateChanged" js/app.js` | ⬜ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers phase requirements: `node --check` on all `js/*.js` files.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pipeline ≠ receita ativa | EXE-04 | Business rule visual | Upload Pedidos, open Executivo, confirm Pipeline card value ≠ Receita ativa |
| Filters update KPIs/charts | EXE-04 | DOM/runtime | Change year filter, confirm KPI values and chart data change |
| ECharts render | EXE-02 | Canvas/DOM | Confirm 6 charts visible with data after upload |
| Exception lists | EXE-03 | Data-dependent | Verify vencidas and próximos 7 dias tables show up to 10 rows |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending 2026-07-08
