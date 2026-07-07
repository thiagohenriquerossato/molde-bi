# Pitfalls Research

## Critical Pitfalls

### Pipeline Inflating Revenue

`Aguardando Aprovação` represents pipeline/orçamentos, not realized revenue. Treating it as active revenue would distort executive indicators, result by competência and business health.

Prevention: centralize status grouping in `normalizers.js` and revenue definitions in `metrics.js`. Every revenue KPI must specify whether it uses potential, active, received or pending amounts.

### Spreadsheet Totals Mixed With Base Rows

Pedidos has a final total row where `Pedido` is empty. Contas monthly sheets contain totals and formula regions after the data table.

Prevention: schemas must include stop rules. Pedidos ignores rows with empty `Pedido`; contas stops at the first row containing `TOTAL` in the expected table region.

### Monthly Sheet Parsing Drift

The contas file uses month tabs from `CONTAS JAN 2026` to `CONTAS DEZ 2026`, with header placement and month semantics. Wrong parsing can assign expenses to the wrong month.

Prevention: create explicit month sheet metadata and validate vencimentos against expected month/year while preserving row warnings instead of dropping data silently.

### Dirty Category and Classification Names

Classifications have spacing, accents and spelling variations, such as `DESP.OPERAÇÃO` and `DESP. OPERAÇÃO`.

Prevention: normalize text by trimming, collapsing whitespace and comparing accent-insensitive keys. Keep original labels for display and normalized labels for grouping.

### Date and Currency Ambiguity

Excel serial dates, pt-BR date strings and empty `Não definido` values can produce invalid dates. Currency values can arrive as numbers, formatted strings or blanks.

Prevention: use dedicated parsing helpers with explicit invalid states. Do not coerce invalid dates to today or zero-value amounts unless the business rule says so.

### Indicators Without Source Data

The indicators workbook includes marketing, design, estoque and RH metrics that cannot be calculated from pedidos and contas.

Prevention: classify each indicator as calculable, manual or unavailable. Show missing data sources clearly instead of generating placeholder numbers.

### Over-Charted Interface

The product needs many analytical charts, but the visual docs define an operational ERP where tables are central.

Prevention: use a hybrid layout. Executive and integrated pages can be more visual; finance, orders and base data pages should favor dense tables, compact KPIs and exception lists.

### Local File and Browser Limits

Opening `index.html` through `file://` can affect module loading or IndexedDB behavior depending on browser settings.

Prevention: implement with browser-compatible ES modules and document a fallback of opening a lightweight local server only for development if a browser blocks local modules. The user-facing requirement remains local static execution.

## Phase Mapping

| Pitfall | Phase To Address |
|---------|------------------|
| Pipeline inflating revenue | Validation and normalization, metrics |
| Totals mixed with rows | Import and validation |
| Monthly sheet parsing drift | Import and validation |
| Dirty category names | Normalization |
| Date and currency ambiguity | Normalization |
| Indicators without source | Configurations and metas |
| Over-charted interface | Design system and dashboard pages |
| Browser local limits | Foundation and final verification |
