# Phase 3: Validação e Regras de Entrada - Research

**Researched:** 2026-07-07
**Status:** Complete

## Scope Anchor

Phase 3 must validate workbooks after successful import, apply entry cleanup rules (`NRM-01`, `NRM-02`), produce a per-sheet validation report with severity (`❌` critical, `⚠️` warning, `✅` valid), and gate dashboard navigation until required sources pass without critical errors. It must not implement full normalization, derived fields, IndexedDB persistence, filters, metrics or real dashboards.

## Technical Findings

### Validation Pipeline

Recommended browser-only pipeline:

```text
File selected
  → XLSX.read(arrayBuffer)            [existing importer]
  → parse rows per source rules         [new parser layer]
  → apply cleaners (NRM-01/02)          [new cleaners module]
  → run validators (VAL-01..10)       [new validators module]
  → build validation report object      [new validation orchestrator]
  → render report + update card states  [app.js UI]
```

Keep responsibilities split:

- `js/importer.js` — workbook I/O and sheet selection only.
- `js/schemas.js` — required columns, header row indexes, sheet naming rules.
- `js/cleaners.js` — exclusion rules and excluded-row findings.
- `js/validators.js` — VAL rule implementations on cleaned rows.
- `js/validation.js` — orchestration and normalized report shape.

Expose `window.MoldeValidation` from `js/validation.js`, similar to `window.MoldeImporter`.

### Report Shape

Each source should produce:

```js
{
  kind: "pedidos" | "contas" | "indicadores",
  status: "valid" | "valid_with_warnings" | "invalid",
  summary: {
    criticalCount: number,
    warningCount: number,
    excludedCount: number,
    validRowCount: number
  },
  criticalErrors: [
    { ruleId: "VAL-03", message: string, excelRow: number, businessId: string }
  ],
  warnings: [
    { ruleId: "NRM-01", message: string, excelRow: number, businessId: string, reason: string }
  ]
}
```

Severity mapping from `03-CONTEXT.md`:

- Any `VAL-01`..`VAL-10` finding → `criticalErrors`, status becomes `invalid`.
- `NRM-01`/`NRM-02` exclusions → `warnings`, status may remain `valid_with_warnings`.
- No critical errors and no warnings → `valid`.

Global CTA `Continuar para dashboards` enabled only when `pedidos` and `contas` reports are `valid` or `valid_with_warnings`. Indicadores never blocks CTA.

### Pedidos Rules

Source contract from `docs/resume.md`:

- First worksheet.
- Header on Excel row 1.
- Required columns:
  - `Pedido`, `Situação`, `Data de cadastro`, `Data Prevista`, `Data Entregue`
  - `Forma de Pagamento Entrada`, `Forma de Pagamento Saldo`
  - `Cliente`, `Vendedor`
  - `Valor Bruto`, `Valor Desconto`, `Valor Pago`, `Valor Pendente`, `Valor Final`

Cleanup (`NRM-01`):

- Exclude rows where `Pedido` is empty (includes trailing total row).

VAL mappings:

| Rule | Implementation hint |
|------|---------------------|
| VAL-01 | Missing required column names in header row |
| VAL-02 | Empty `Situação`, `Cliente`, `Data Prevista` or `Data Entregue` on data rows |
| VAL-03 | Invalid date parse; `Data Entregue` before `Data de cadastro` |
| VAL-04 | `abs((Valor Bruto - Valor Desconto) - Valor Final) > 0.01` |
| VAL-05 | `Situação` indicates delivered and `Valor Pendente > 0` |

Use SheetJS `sheet_to_json` with `header: 1` or explicit header mapping, preserving `excelRow` as `index + 1` in worksheet coordinates.

Date parsing: accept Excel serial numbers and `dd/mm/yyyy` strings; treat `Não definido` and blank as empty.

### Contas Rules

Source contract:

- Monthly sheets matching `CONTAS ... 2026`.
- Header on Excel row 2.
- Data from row 3 until before first `TOTAL` row in column A or first cell containing `TOTAL`.

Required columns:

- `DATA VENC`, `DATA PAG`, `VALOR`, `FORNECEDOR`, `DESCRIÇÃO`
- `PARCELA`, `CLASSIFICAÇÃO`, `CATEGORIA`, `CONTA`, `PAGO`

Cleanup (`NRM-02`):

- Stop reading each monthly sheet at first `TOTAL` row; exclude that row and everything below from validation dataset.
- Report each excluded total/footer row as warning with full list.

VAL mappings:

| Rule | Implementation hint |
|------|---------------------|
| VAL-06 | Expected monthly tabs missing; required headers missing on row 2 |
| VAL-07 | Empty `VALOR`, `CLASSIFICAÇÃO`, `CATEGORIA` or `CONTA` |
| VAL-08 | `PAGO` indicates paid and `DATA PAG` empty |
| VAL-09 | `DATA VENC` month/year differs from sheet expected month/year |
| VAL-10 | Similar normalized `CATEGORIA`/`CLASSIFICAÇÃO` spellings (trim, collapse spaces, compare lowercase; flag pairs with Levenshtein distance ≤ 2 or prefix match after normalization) |

Derive expected month/year from sheet name tokens (`JAN`, `FEV`, `MAR`, `ABRIL`, `MAIO`, `JUN`, `JUL`, `AGO`, `SET`, `OUT`, `NOV`, `DEZ` + `2026`).

### Indicadores (Optional)

Phase requirements do not include indicadores-specific VAL IDs. If loaded:

- Prefer sheet `DADOS_PBI`.
- Run lightweight structural check only (sheet exists, non-empty header).
- Show result in report block but never block global CTA.

### UI Integration

Extend existing upload flow in `js/app.js`:

1. After `readWorkbookFile` succeeds, call `MoldeValidation.validateWorkbook(workbook, kind)`.
2. Store `validationReport` per source in state alongside `metadata`.
3. Replace card badge `Lido` with `Válido`, `Com informações` or `Inválido`.
4. Render `Resultado da validação` panel below cards with per-source blocks.
5. Show flat top-10 critical list, expandable full warning list, `Corrigir planilha` action on invalid.
6. Add CTA `Continuar para dashboards` disabled until required sources pass.

CSS additions in `css/app.css`:

- `.validation-panel`, `.validation-block`, `.validation-finding`, `.validation-finding-expand`, `.validation-cta`

Script load order in `index.html`:

1. vendor sheetjs
2. vendor echarts
3. `js/importer.js`
4. `js/schemas.js`
5. `js/cleaners.js`
6. `js/validators.js`
7. `js/validation.js`
8. `js/app.js`

## Validation Architecture

Automated checks:

- `node --check` on every new `js/*.js` file.
- `rg` for rule IDs `VAL-01` through `VAL-10`, `NRM-01`, `NRM-02`.
- `rg` for UI copy: `Resultado da validação`, `Válido`, `Inválido`, `Com informações`, `Continuar para dashboards`.
- Assert no `indexedDB`, no normalization fields (`situacao_grupo`, `status_pagamento`), no ECharts usage.

Manual browser checks with real spreadsheets:

1. Load `Pedidos_Simplificado.xlsx` — expect invalid or critical findings (real data has known issues).
2. Load `PLANILHA CONTAS A PAGAR1.xlsx` — expect warnings for excluded totals and possible critical row issues.
3. Confirm CTA disabled while critical errors exist on required sources.
4. Confirm indicadores optional load does not block CTA.
5. Replace file triggers revalidation.

## Risks and Constraints

- Strict mode means real spreadsheets may not pass without fixes — UI must explain blockers clearly.
- `file://` module loading: keep classic scripts, no ES modules.
- Phase 3 must not persist normalized datasets — only in-memory validation state.
- Do not treat `Aguardando Aprovação` as revenue here; only validate row integrity.
- Large finding lists: use expandable sections per CONTEXT (`Ver todos (N)`).

## References

- `.planning/phases/03-valida-o-e-regras-de-entrada/03-CONTEXT.md`
- `.planning/REQUIREMENTS.md` — `IMP-04`, `IMP-05`, `VAL-01`..`VAL-10`, `NRM-01`, `NRM-02`
- `.planning/ROADMAP.md` — Phase 3 success criteria
- `docs/resume.md` — spreadsheet structure and validation list
- `js/importer.js`, `js/app.js` — current import UI

## RESEARCH COMPLETE
