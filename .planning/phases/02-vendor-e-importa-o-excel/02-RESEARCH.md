# Phase 2: Vendor e Importação Excel - Research

**Researched:** 2026-07-07
**Status:** Complete

## Scope Anchor

Phase 2 must make the browser app capable of reading XLSX files locally. It covers local vendor libraries, file selection, workbook parsing and compact per-card metadata. It must not implement deep validation, row normalization, persisted datasets, filters, metrics or real dashboards.

## Technical Findings

### Browser XLSX Reading

- SheetJS should be vendored locally and exposed to the browser before import code runs.
- In browsers, `XLSX.readFile()` is not appropriate because browsers cannot read arbitrary filesystem paths.
- The supported browser flow is: receive a `File` from `<input type="file">`, convert it to `ArrayBuffer` with `file.arrayBuffer()` or `FileReader.readAsArrayBuffer(file)`, then call `XLSX.read(arrayBuffer)`.
- `XLSX.read(arrayBuffer)` returns a workbook with `SheetNames` and `Sheets`; Phase 2 should use that only for metadata and light sheet extraction.

### Local Vendor Strategy

- The project has no `package.json` and must remain runnable from `index.html`, so planning should avoid introducing a build pipeline.
- Use a local `vendor/` directory with explicit script paths, for example:
  - `vendor/sheetjs/xlsx.full.min.js`
  - `vendor/echarts/echarts.min.js`
- `index.html` should load vendor scripts before `js/app.js`, so `window.XLSX` and `window.echarts` are available to plain scripts.
- ECharts is not used for real charts in Phase 2, but must be available locally to satisfy `FND-04` and prepare later dashboard phases.

### Import Module Boundary

- `js/app.js` already owns routing, shell behavior, theme and render functions.
- Import parsing should be moved into a separate module/file such as `js/importer.js`, keeping XLSX-specific code out of page rendering.
- Since the app currently uses classic scripts, a low-risk approach is to expose a small namespace on `window`, for example `window.MoldeImporter`.
- The importer should return normalized metadata objects, not normalized business datasets.

Recommended metadata shape for Phase 2:

```js
{
  kind: "pedidos" | "contas" | "indicadores",
  fileName: string,
  importedAt: string,
  sheetNames: string[],
  rowCount: number,
  primarySheetName: string | null
}
```

### Source-Specific Phase 2 Behavior

- Pedidos: read workbook and first worksheet. Count rows from the first worksheet, but do not drop total rows or validate columns yet.
- Contas a pagar: read workbook and list monthly sheet names expected by the source workbook. Do not validate headers or stop at `TOTAL` yet.
- Indicadores/metas: read optional workbook without blocking completion when absent. Prefer the `DADOS_PBI` sheet if present for metadata, but do not classify indicators yet.

### UI and Interaction Implications

- The existing upload cards in `js/app.js` should become interactive and state-driven.
- Each card needs a hidden file input with `accept=".xlsx,.xls"` and a visible button following the existing `.button` styles.
- User-selected decisions from `02-CONTEXT.md` are feasible without new components:
  - independent cards,
  - required/optional badges,
  - inline `Lendo arquivo...`,
  - compact statuses,
  - `Substituir planilha`,
  - isolated card errors,
  - topbar action focusing the first pending card.
- The topbar status badge should summarize import progress, for example `Sem dados importados`, `1 de 2 obrigatórias lida`, or `Bases obrigatórias lidas`.

## Validation Architecture

Phase 2 verification should be lightweight and compatible with a static app:

- Static syntax check: `node --check js/app.js` and `node --check js/importer.js`.
- File presence checks:
  - `vendor/sheetjs/xlsx.full.min.js` exists.
  - `vendor/echarts/echarts.min.js` exists.
  - `index.html` references both vendor files before `js/app.js`.
- Source checks:
  - `js/importer.js` contains a function that reads a `File` via `arrayBuffer` or `FileReader`.
  - `js/importer.js` calls `XLSX.read`.
  - `js/app.js` contains status labels `Obrigatório`, `Opcional`, `Lendo arquivo`, `Lido`, `Erro de leitura`, `Opcional não carregado` and `Substituir planilha`.
- Manual browser verification remains necessary because the core behavior depends on local file picker APIs:
  - Open `index.html`.
  - Select `Pedidos_Simplificado.xlsx`; confirm the Pedidos card shows file name, row/sheet metadata and import timestamp.
  - Select `PLANILHA CONTAS A PAGAR1.xlsx`; confirm the Contas card lists monthly sheets.
  - Leave indicadores unloaded and confirm it stays `Opcional não carregado`.
  - Select `Molde_Momentos_Template_Indicadores.xlsx`; confirm it reads without blocking.
  - Select a wrong file in one card and confirm only that card shows `Erro de leitura`.

## Risks and Constraints

- Runtime internet dependency is not allowed. CDN links must not remain in `index.html`.
- `file://` behavior must be verified manually, especially if script loading changes.
- Full validation belongs to Phase 3. Phase 2 should not mark a workbook as business-valid, only as read successfully.
- Large pasted vendor files may make diffs noisy; plans should isolate them from app logic changes.

## References

- SheetJS browser local file docs: `File` must be read to `ArrayBuffer`, then passed to `XLSX.read`.
- Apache ECharts handbook: standalone local files from `dist/` can be included with a normal `<script>` tag.
- `.planning/phases/02-vendor-e-importa-o-excel/02-CONTEXT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `docs/resume.md`

## RESEARCH COMPLETE
