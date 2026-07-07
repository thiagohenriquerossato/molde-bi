---
phase: 03
slug: valida-o-e-regras-de-entrada
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-07
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — static HTML/CSS/JavaScript |
| **Config file** | none |
| **Quick run command** | `node --check js/schemas.js && node --check js/cleaners.js && node --check js/validators.js && node --check js/validation.js && node --check js/app.js && node --check js/importer.js` |
| **Full suite command** | quick run + `rg` rule coverage checks below |
| **Estimated runtime** | ~10 seconds automated |

---

## Sampling Rate

- **After every task commit:** Run quick run command for all touched JS files.
- **After every plan wave:** Run full suite and manual browser validation on real spreadsheets.
- **Before `/gsd-verify-work`:** All automated checks green; manual checklist recorded.
- **Max feedback latency:** 60 seconds for automated checks.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 03-01-01 | 01 | 1 | VAL-01, NRM-01 | syntax/static | `node --check js/schemas.js && rg "PEDIDOS_REQUIRED_COLUMNS|CONTAS_REQUIRED_COLUMNS" js/schemas.js` | ⬜ pending |
| 03-01-02 | 01 | 1 | NRM-01, NRM-02 | syntax/static | `node --check js/cleaners.js && rg "NRM-01|NRM-02|TOTAL|Pedido" js/cleaners.js` | ⬜ pending |
| 03-01-03 | 01 | 1 | VAL-01..VAL-10 | syntax/static | `node --check js/validators.js && rg "VAL-0[1-9]|VAL-10" js/validators.js` | ⬜ pending |
| 03-01-04 | 01 | 1 | IMP-04 | syntax/static | `node --check js/validation.js && rg "window\\.MoldeValidation|validateWorkbook" js/validation.js` | ⬜ pending |
| 03-02-01 | 02 | 2 | IMP-04, IMP-05 | syntax/static | `rg "Resultado da validação|validateWorkbook|validationReport" js/app.js` | ⬜ pending |
| 03-02-02 | 02 | 2 | IMP-04, IMP-05 | syntax/static | `rg "Válido|Inválido|Com informações|Continuar para dashboards" js/app.js css/app.css` | ⬜ pending |
| 03-02-03 | 02 | 2 | IMP-05 | syntax/static | `rg "Continuar para dashboards|aria-disabled|#executivo" js/app.js` | ⬜ pending |

---

## Wave 0 Requirements

Existing static infrastructure is sufficient. No new test framework required.

---

## Manual-Only Verifications

| Behavior | Requirement | Test Instructions |
|----------|-------------|-------------------|
| Auto validation after upload | IMP-04 | Load pedidos file; confirm validation panel updates without extra button |
| Critical errors block CTA | IMP-05 | With known bad real data, confirm CTA disabled |
| Warnings allow continue | IMP-05 | If only cleanup warnings, confirm CTA enabled |
| Indicadores never blocks | D-03 | Load invalid optional indicadores with valid required; CTA still enabled |
| Replace revalidates | D-18 | Substitute planilha; confirm report refreshes |
| Real spreadsheet smoke | VAL/NRM | Test all three root `.xlsx` files in browser |

---

## Validation Sign-Off

- [x] All tasks have automated verify or manual coverage.
- [x] Sampling continuity maintained.
- [x] Wave 0 covers static phase needs.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-07-07
