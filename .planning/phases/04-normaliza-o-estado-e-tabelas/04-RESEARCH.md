# Phase 4: Normalização, Estado e Tabelas - Research

**Researched:** 2026-07-08
**Status:** Complete

## Scope Anchor

Phase 4 transforms validated workbook data into normalized internal tables with derived fields, persists the full dataset in IndexedDB, restores on app boot, exposes global filters in the topbar, renders tabbed data tables on `#base-dados` with virtual scroll, row warning highlights, and filtered CSV export. No real KPIs, ECharts charts, or dashboard metrics (Phases 5–9).

## Technical Findings

### Normalization Pipeline

Extend the existing browser ETL chain:

```text
File selected
  → XLSX.read                         [importer.js — existing]
  → validateWorkbook                  [validation.js — existing]
  → normalizeWorkbook (if valid*)       [normalizers.js — new]
  → upsertSource + persist            [store.js — new]
  → refresh filter/table views        [filters.js, tables.js, app.js]

* valid or valid_with_warnings
```

`normalizers.js` must reuse the same row extraction path as validation:

- `MoldeSchemas` for headers and sheet selection
- `MoldeCleaners` for NRM-01/NRM-02 exclusions
- `MoldeValidators.parseBrazilianDate`, `parseBrazilianNumber`, `normalizeLabel` for typed fields

Do **not** duplicate validation rules; normalization assumes validation already passed. Row-level VAL findings are copied into normalized records as `validationAlerts[]` for TBL-02 highlighting.

Expose `window.MoldeNormalizers` with:

```js
normalizeWorkbook(workbook, kind) → { rows: NormalizedRow[], meta: { kind, rowCount } }
normalizePedidos(workbook)
normalizeContas(workbook)
normalizeIndicadores(workbook)
```

### Pedidos Derived Fields

From `docs/resume.md` §3.1 and §7, per `04-CONTEXT.md` D-07..D-10:

| Field | Rule |
|-------|------|
| `pedido_id` | `Pedido` trimmed string |
| `situacao_original` | raw `Situação` |
| `situacao_grupo` | strict map; unknown → `Sem status` + alert |
| `cliente_normalizado` | trim/collapse spaces; `Balcão` → tag as generic client |
| `mes_cadastro` / `mes_entrega` | `YYYY-MM` from parsed dates |
| `dias_producao` | `data_entregue - data_cadastro` in days, only if entregue |
| `dias_atraso` | `data_entregue - data_prevista`, only if entregue |
| `entregue_no_prazo` | `dias_atraso <= 0` when entregue, else `null` |
| `status_financeiro` | Quitado / Parcial / Pendente per D-09 |

Strict `situacao_grupo` map (trim, case-insensitive match):

| Original | Grupo |
|----------|-------|
| Aguardando Aprovação | Pipeline / orçamento |
| Aguardando Produzir | Pedido ativo |
| Produzindo | Pedido ativo |
| Pronto para Entrega | Pedido ativo |
| Entregue | Entregue |
| Cancelado | Perdido / cancelado |
| (empty) | Sem status |

### Contas Derived Fields

| Field | Rule |
|-------|------|
| `competencia_aba` | from sheet name via `getExpectedMonthYearFromSheetName` |
| `status_pagamento` | table in resume §3.2 using `pago`, `data_vencimento`, today |
| `mes_vencimento` / `mes_pagamento` | `YYYY-MM` |
| `dias_atraso` | unpaid and vencimento < today → days; else 0 or null |
| `fornecedor_normalizado` / `categoria_normalizada` / `classificacao_normalizada` | trim + collapse spaces |

### Indicadores Classification

Fixed catalog in `normalizers.js` (or `indicators-catalog.js`):

- **calculável (pedidos)**: receita, ticket médio, pedidos entregues, etc.
- **calculável (contas)**: despesas, contas vencidas, contas a pagar
- **manual**: marketing, RH, estoque rows with values in `DADOS_PBI`
- **indisponível**: no matching source and no sheet value

Never synthesize numeric indicator values without base data.

### IndexedDB Store

Database: `molde-momentos-dashboard`, version `1`.

Recommended object stores:

| Store | Key | Value |
|-------|-----|-------|
| `dataset` | `"current"` | Full snapshot: `{ pedidos, contas, indicadores, importMeta, normalizedAt }` |
| `preferences` | string | column visibility per tab (optional — can use localStorage instead per D-21 discretion) |

API on `window.MoldeStore`:

```js
open() → Promise<IDBDatabase>
saveDataset(snapshot) → Promise<void>
loadDataset() → Promise<snapshot | null>
upsertSource(kind, rows, metadata, validationReport) → Promise<snapshot>
clearDataset() → Promise<void>
```

`importMeta` per kind: `{ fileName, importedAt, sheetNames, rowCount, validationStatus }`.

Boot flow in `app.js`:

1. `await MoldeStore.loadDataset()`
2. If snapshot exists → hydrate `appState.dataset`, navigate to `#executivo` (D-05)
3. Else stay on `#upload`

`file://` note: IndexedDB works on `file://` in Chromium; document manual verification in VALIDATION.md.

### Filters Module

`window.MoldeFilters` holds global state:

```js
{
  period: { from, to } | null,
  month: number | null,
  year: number | null,
  search: string,
  pedidos: { situacao[], vendedor[], cliente[], ... },
  contas: { statusPagamento[], fornecedor[], ... },
  valueMin, valueMax
}
```

Functions:

- `createDefaultState()`
- `applyFilters(rows, kind, state)` → filtered rows
- `getActiveFilterChips(state)` → removable chips for UI
- `clearAll(state)` → default

Period field per D-17:

- `pedidos` → `data_cadastro` (fallback `mes_cadastro`)
- `contas` → `data_vencimento` (fallback `mes_vencimento`)
- active tab on `#base-dados` drives context when both apply

Multi-select: categorical filters use OR within field, AND across fields.

Topbar: collapsible panel `data-filter-panel` toggled by `data-filter-toggle`; visible on all routes; chips below topbar when active.

### Tables Module

`window.MoldeTables` responsibilities:

- Column definitions per tab (business vs technical, default visibility)
- Virtual scroll renderer (fixed row height ~36px, compact density)
- Client-side sort (click header, `aria-sort`)
- Free-text search delegates to filter state
- Row class `data-table-row-warning` + badge for `validationAlerts`
- `exportCsv(rows, columns, filename)` with UTF-8 BOM, `;` separator for pt-BR Excel

Base de Dados route: replace `renderEmptyPage` with `renderBaseDadosPage` when dataset loaded.

Tabs: `data-base-tab="pedidos|contas|indicadores"` with keyboard-accessible tablist.

### Integration Points in `app.js`

After successful validation in `handleUploadSelection`:

```js
if (report.status === "valid" || report.status === "valid_with_warnings") {
  const normalized = window.MoldeNormalizers.normalizeWorkbook(workbook, kind);
  await window.MoldeStore.upsertSource(kind, normalized.rows, metadata, report);
  appState.dataset = await window.MoldeStore.loadDataset();
}
```

Keep `workbook` in closure only during handler — do not persist raw XLSX.

`renderCurrentRoute` must read shared filter state for any page; only `#base-dados` renders full table.

### Files to Add

| File | Role |
|------|------|
| `js/normalizers.js` | NRM-03..06, derived fields |
| `js/store.js` | IMP-06, IndexedDB |
| `js/filters.js` | FLT-01..04 |
| `js/tables.js` | TBL-01, TBL-02, FLT-05 export helpers |
| `css/app.css` | filter panel, tabs, virtual table, warning rows |
| `index.html` | script tags, topbar filter toggle |
| `js/app.js` | boot restore, pipeline hook, base-dados route |

### Anti-Patterns to Avoid

- Do not treat `Aguardando Aprovação` as active revenue in any derived revenue flags (reserve for Phase 5 metrics).
- Do not add ECharts initialization or KPI calculations in Phase 4.
- Do not use `localStorage` for full dataset (too large); only theme + column prefs.
- Do not block normalization on indicadores optional source.

## Validation Architecture

| Layer | Method | Commands |
|-------|--------|----------|
| Syntax | `node --check` | `node --check js/*.js` |
| Module presence | ripgrep | `rg "window.MoldeStore" js/store.js` |
| No premature dashboards | ripgrep | `! rg "echarts\\.init" js/app.js js/tables.js` |
| IndexedDB API | manual browser | Open app, upload sheets, reload, confirm `#executivo` |
| CSV export | manual browser | Export from Base de Dados, open in LibreOffice/Excel |
| Filter chips | manual browser | Apply multi-select, clear all |

Wave 0: no test framework — use `node --check` + ripgrep per task.

## RESEARCH COMPLETE
