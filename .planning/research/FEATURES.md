# Features Research

## Table Stakes

### Import and Validation

- Upload the pedidos spreadsheet.
- Upload the contas a pagar spreadsheet.
- Upload the indicadores/metas spreadsheet as optional.
- Validate expected sheets, headers and required columns.
- Show critical errors, warnings and row-level inconsistencies.
- Allow continuing when only non-critical warnings exist.

### Normalized Data

- Convert raw Excel rows into internal `pedidos`, `contas_pagar` and `indicadores_metas` tables.
- Ignore total rows and formula summary regions mixed into source sheets.
- Normalize dates, currency values, text, categories, status labels and payment flags.
- Add derived fields such as status groups, aging, production days and financial status.

### Dashboard and Operations

- Executive dashboard with KPIs, charts and short exception tables.
- Financial page for contas a pagar, vencimentos, payments, suppliers and classifications.
- Orders/revenue page for commercial and production indicators.
- Integrated result page for competência and caixa views.
- Insights and alerts page for financial, commercial and operational issues.
- Base de dados page with normalized tables.
- Configurações/metas page for indicators and future manual targets.

### Filtering and Export

- Global date, month, year, status, value range and text search filters.
- Domain filters for pedidos and contas.
- Filter propagation to cards, charts and tables.
- Clear filters action.
- CSV export of filtered data.

## Differentiators

- Hybrid ERP/BI interface: visual executive overview plus dense operational pages.
- Clickable chart segments that update the current page filters.
- Validation report that explains data quality before dashboards are trusted.
- Explicit separation between pipeline, active revenue, received revenue and receivables.
- Indicators catalog showing what is calculable, manual or unavailable with current sheets.

## Anti-Features

- Do not build authentication.
- Do not build backend synchronization.
- Do not edit the source spreadsheets in place.
- Do not invent indicators when source data is missing.
- Do not treat `Aguardando Aprovação` as realized revenue.

## Complexity Notes

The highest complexity is not rendering the UI. It is reliable ETL in the browser: monthly sheet parsing, total row detection, inconsistent category spelling, invalid dates, business-specific status grouping and maintaining filter consistency across cards, charts and tables.
