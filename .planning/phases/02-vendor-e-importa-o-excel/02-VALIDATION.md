---
phase: 02
slug: vendor-e-importa-o-excel
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-07
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — static HTML/CSS/JavaScript |
| **Config file** | none |
| **Quick run command** | `node --check js/app.js && node --check js/importer.js` |
| **Full suite command** | `node --check js/app.js && node --check js/importer.js` plus manual browser import checks |
| **Estimated runtime** | ~5 seconds automated, manual checks depend on browser interaction |

---

## Sampling Rate

- **After every task commit:** Run `node --check js/app.js && node --check js/importer.js` when both files exist; before `js/importer.js` exists, run `node --check js/app.js`.
- **After every plan wave:** Run full suite command and complete the manual browser checks relevant to changed behavior.
- **Before `/gsd-verify-work`:** Automated syntax checks must pass and manual file import checks must be recorded in the phase summary.
- **Max feedback latency:** 60 seconds for automated checks.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | FND-04 | T-02-01 | No runtime CDN dependency | static | `test -f vendor/sheetjs/xlsx.full.min.js && test -f vendor/echarts/echarts.min.js` | ✅ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | FND-04 | T-02-01 | Vendor scripts load before app script | static | `rg 'vendor/sheetjs/xlsx.full.min.js|vendor/echarts/echarts.min.js|js/app.js' index.html` | ✅ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | IMP-01 | T-02-02 | Pedidos file data read only after user file selection | syntax/static | `node --check js/importer.js && rg 'XLSX.read|arrayBuffer|FileReader' js/importer.js` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | IMP-02 | T-02-02 | Contas workbook metadata surfaced without normalization | syntax/static | `node --check js/importer.js && rg 'sheetNames|monthly|CONTAS' js/importer.js js/app.js` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | IMP-03 | T-02-02 | Optional indicadores does not block required imports | syntax/static | `node --check js/app.js && rg 'Opcional não carregado|Indicadores' js/app.js` | ✅ W0 | ⬜ pending |
| 02-02-04 | 02 | 1 | IMP-01, IMP-02, IMP-03 | T-02-03 | Wrong file errors remain scoped to selected card | syntax/static | `node --check js/app.js && rg 'Erro de leitura|Substituir planilha|Lendo arquivo' js/app.js` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No framework installation is required for Phase 2.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Open app locally and load vendor scripts | FND-04 | Browser runtime and `file://` behavior must be observed | Open `index.html`; confirm no missing-script errors for `XLSX` or `echarts` in console |
| Select pedidos workbook | IMP-01 | File picker APIs require browser interaction | Select `Pedidos_Simplificado.xlsx`; confirm Pedidos card shows file name, row/sheet count and import timestamp |
| Select contas workbook | IMP-02 | Workbook sheet list must be observed from real file | Select `PLANILHA CONTAS A PAGAR1.xlsx`; confirm Contas card lists expected monthly sheets |
| Leave indicadores absent | IMP-03 | Optional flow is user-facing | Load only pedidos and contas; confirm Indicadores remains `Opcional não carregado` and required import flow is not blocked |
| Select indicadores workbook | IMP-03 | Optional workbook must still be readable | Select `Molde_Momentos_Template_Indicadores.xlsx`; confirm the card changes to `Lido` with metadata |
| Select wrong file in one card | IMP-01, IMP-02, IMP-03 | File-type mismatch feedback is visual | Select an invalid file for one card; confirm only that card shows `Erro de leitura` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or manual verification coverage.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references for this static phase.
- [x] No watch-mode flags.
- [x] Feedback latency < 60s for automated checks.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-07-07
