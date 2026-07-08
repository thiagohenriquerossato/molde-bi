---
phase: 4
slug: normaliza-o-estado-e-tabelas
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-08
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — vanilla JS, `node --check` + ripgrep |
| **Config file** | none |
| **Quick run command** | `node --check js/normalizers.js js/store.js js/filters.js js/tables.js js/app.js` |
| **Full suite command** | `node --check js/*.js && rg "window.Molde(Normalizers|Store|Filters|Tables)" js/` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command + task-specific `rg`/`verify` block
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Manual browser checks on IndexedDB restore and CSV export
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | NRM-03..06 | T-04-01 | Derived fields without inventing indicators | unit-rg | `rg "situacao_grupo|status_pagamento" js/normalizers.js` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | IMP-06 | T-04-02 | IndexedDB persist/restore | unit-rg | `rg "indexedDB|saveDataset|loadDataset" js/store.js` | ✅ | ⬜ pending |
| 04-01-03 | 01 | 1 | IMP-06, NRM-03 | T-04-03 | Auto-normalize after validation | unit-rg | `rg "normalizeWorkbook|upsertSource" js/app.js` | ✅ | ⬜ pending |
| 04-02-01 | 02 | 2 | FLT-01..04 | T-04-04 | Shared filter state | unit-rg | `rg "applyFilters|clearAll" js/filters.js` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 2 | FLT-01..04 | T-04-05 | Topbar filter panel all pages | unit-rg | `rg "data-filter-panel|data-filter-toggle" index.html css/app.css` | ✅ | ⬜ pending |
| 04-03-01 | 03 | 3 | TBL-01, TBL-02 | T-04-06 | Virtual scroll + warning rows | unit-rg | `rg "virtual|data-table-row-warning" js/tables.js` | ✅ | ⬜ pending |
| 04-03-02 | 03 | 3 | FLT-05, TBL-01 | T-04-07 | CSV export filtered | unit-rg | `rg "exportCsv|Exportar" js/tables.js js/app.js` | ✅ | ⬜ pending |
| 04-03-03 | 03 | 3 | IMP-06 | T-04-08 | Boot restore → executivo | manual | Reload browser after upload | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers phase requirements: `node --check` on all `js/*.js` files.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| IndexedDB restore on reload | IMP-06 | Browser storage API | Upload valid sheets, reload `index.html`, confirm lands on `#executivo` with data |
| CSV opens in Excel pt-BR | FLT-05 | Encoding/separator | Export from Base de Dados, verify `;` and accents |
| Virtual scroll performance | TBL-01 | DOM/runtime | Scroll full contas table, no freeze |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending 2026-07-08
