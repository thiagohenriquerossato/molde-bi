# Requirements: Molde Momentos Dashboard Local

**Defined:** 2026-07-07
**Core Value:** O usuário consegue carregar as planilhas reais do negócio e enxergar rapidamente receita, despesas, pendências, prazos e inconsistências com números confiáveis.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FND-01**: User can open `index.html` locally and see the application shell without a backend.
- [ ] **FND-02**: User can navigate fixed pages from a clear sidebar or top navigation.
- [ ] **FND-03**: User sees a visual system based on `docs/` tokens, with pt-BR labels, compact cards, dense tables and semantic badges.
- [ ] **FND-04**: User can use the app without runtime internet access after vendor libraries are present locally.

### Import

- [ ] **IMP-01**: User can upload the pedidos spreadsheet from the upload page.
- [ ] **IMP-02**: User can upload the contas a pagar spreadsheet from the upload page.
- [ ] **IMP-03**: User can optionally upload the indicadores/metas spreadsheet from the upload page.
- [ ] **IMP-04**: User receives a clear validation summary after each workbook is read.
- [ ] **IMP-05**: User can continue to dashboards when only non-critical warnings exist.
- [ ] **IMP-06**: User can restore the latest normalized dataset from local browser storage.

### Validation

- [ ] **VAL-01**: User is warned when pedidos required columns are missing.
- [ ] **VAL-02**: User is warned about pedidos without situação, cliente, data prevista or data entregue.
- [ ] **VAL-03**: User is warned about invalid pedido dates or delivery dates before cadastro dates.
- [ ] **VAL-04**: User is warned about divergences between `Valor Bruto - Valor Desconto` and `Valor Final`.
- [ ] **VAL-05**: User is warned about delivered pedidos with pending value.
- [ ] **VAL-06**: User is warned when required contas monthly tabs or headers are missing.
- [ ] **VAL-07**: User is warned about contas without value, classification, category or bank account.
- [ ] **VAL-08**: User is warned about paid contas without payment date.
- [ ] **VAL-09**: User is warned about vencimentos outside the expected month/year for the monthly sheet.
- [ ] **VAL-10**: User is warned about similar category or classification spellings that may fragment analysis.

### Normalization

- [ ] **NRM-01**: User data excludes pedidos total rows where `Pedido` is empty.
- [ ] **NRM-02**: User data excludes contas total/formula rows by stopping at the first `TOTAL` row.
- [ ] **NRM-03**: User data has normalized dates, currency values, text fields and status labels.
- [ ] **NRM-04**: User data has derived pedido fields such as `situacao_grupo`, `dias_producao`, `dias_atraso`, `entregue_no_prazo` and `status_financeiro`.
- [ ] **NRM-05**: User data has derived conta fields such as `competencia_aba`, `status_pagamento`, `mes_vencimento`, `mes_pagamento` and `dias_atraso`.
- [ ] **NRM-06**: User sees indicadores/metas classified as calculable, manual or unavailable.

### Filters and Tables

- [ ] **FLT-01**: User can apply global filters for period, month, year, status, value range and free text search.
- [ ] **FLT-02**: User can apply pedido-specific filters for situação, vendedor, cliente, payment forms, pending value and prazo conditions.
- [ ] **FLT-03**: User can apply conta-specific filters for paid/open, vencido, fornecedor, classificação, categoria, conta, parcela and dates.
- [ ] **FLT-04**: User can clear filters and immediately see cards, charts and tables reset.
- [ ] **FLT-05**: User can export filtered datasets to CSV.
- [ ] **TBL-01**: User can inspect normalized pedidos, contas and indicadores/metas in paginated, sortable and searchable tables.
- [ ] **TBL-02**: User sees visual highlights for rows with validation warnings or inconsistencies.

### Executive Dashboard

- [ ] **EXE-01**: User sees executive KPIs for revenue, received amount, pending amount, expenses, overdue accounts, result, ticket médio and order counts.
- [ ] **EXE-02**: User sees charts for revenue, expenses, result, received versus pending, expenses fixed versus variable, order status and top rankings.
- [ ] **EXE-03**: User sees short exception lists for overdue and upcoming accounts.
- [ ] **EXE-04**: User can filter dashboard numbers without confusing pipeline with realized revenue.

### Finance

- [ ] **FIN-01**: User sees contas KPIs for total, paid, open, overdue, due today, due in 7 days and due in 30 days.
- [ ] **FIN-02**: User sees expenses by month, paid versus open, category, classification, supplier, due date heatmap and bank account charts.
- [ ] **FIN-03**: User sees tables for overdue contas, next 7 days, no value, no classification, paid without payment date and future launches.

### Orders and Revenue

- [ ] **ORD-01**: User sees pedido KPIs for total orders, gross value, discounts, final value, paid, pending, tickets, status counts and delivery performance.
- [ ] **ORD-02**: User sees pedido charts for revenue by month, orders by month, ticket by month, status, vendor, pending value, discounts, top clients and delivery punctuality.
- [ ] **ORD-03**: User sees active, pending, canceled, delivered and approval-stage orders separated by business meaning.

### Integrated Result

- [ ] **RES-01**: User can compare competência result using active revenue minus expenses.
- [ ] **RES-02**: User can compare cash result using received pedido values minus paid contas.
- [ ] **RES-03**: User sees integrated KPIs for receivables, open payables, projected operational balance, coverage and break-even point.
- [ ] **RES-04**: User sees charts for revenue versus expense versus result, waterfall, received versus paid, receivables versus open payables and cash projection.

### Insights

- [ ] **INS-01**: User sees financial alerts for overdue accounts, upcoming accounts, missing values, missing classifications and paid accounts without payment date.
- [ ] **INS-02**: User sees commercial alerts for approval delays, delivered orders with pending value, missing client/vendor and high discounts.
- [ ] **INS-03**: User sees operational alerts for delayed orders, delivery before cadastro, long-running production states and delivery time changes.

### Additional Pages

- [ ] **CLV-01**: User sees client and vendor KPIs, charts and rankings for revenue, ticket, orders and pending values.
- [ ] **PRD-01**: User sees production and deadline KPIs, funnel, aging bands and punctuality views.
- [ ] **CFG-01**: User sees indicators/metas from the optional workbook and knows which can be calculated from current sheets.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Data Entry

- **DTE-01**: User can manually enter targets that are not available in the indicadores workbook.
- **DTE-02**: User can manually annotate suppliers, clients or categories.

### Advanced Analysis

- **ANA-01**: User can save named filter views.
- **ANA-02**: User can generate printable management reports with selected pages.
- **ANA-03**: User can import additional data sources for marketing, estoque, RH or production details.

### Operational Editing

- **EDT-01**: User can edit normalized records inside the app without changing the source workbook.
- **EDT-02**: User can export corrected normalized records as a new workbook.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Backend/API | The product must remain local and static |
| Login/authentication | Single-user local workflow does not need accounts |
| Remote database | Source of truth is user-uploaded Excel files |
| Real-time collaboration | Requires backend and shared state |
| Editing source spreadsheets | The app is for import, validation, visualization and export |
| Invented indicators | Missing source data must be shown as manual or unavailable |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Unmapped | Pending |
| FND-02 | Unmapped | Pending |
| FND-03 | Unmapped | Pending |
| FND-04 | Unmapped | Pending |
| IMP-01 | Unmapped | Pending |
| IMP-02 | Unmapped | Pending |
| IMP-03 | Unmapped | Pending |
| IMP-04 | Unmapped | Pending |
| IMP-05 | Unmapped | Pending |
| IMP-06 | Unmapped | Pending |
| VAL-01 | Unmapped | Pending |
| VAL-02 | Unmapped | Pending |
| VAL-03 | Unmapped | Pending |
| VAL-04 | Unmapped | Pending |
| VAL-05 | Unmapped | Pending |
| VAL-06 | Unmapped | Pending |
| VAL-07 | Unmapped | Pending |
| VAL-08 | Unmapped | Pending |
| VAL-09 | Unmapped | Pending |
| VAL-10 | Unmapped | Pending |
| NRM-01 | Unmapped | Pending |
| NRM-02 | Unmapped | Pending |
| NRM-03 | Unmapped | Pending |
| NRM-04 | Unmapped | Pending |
| NRM-05 | Unmapped | Pending |
| NRM-06 | Unmapped | Pending |
| FLT-01 | Unmapped | Pending |
| FLT-02 | Unmapped | Pending |
| FLT-03 | Unmapped | Pending |
| FLT-04 | Unmapped | Pending |
| FLT-05 | Unmapped | Pending |
| TBL-01 | Unmapped | Pending |
| TBL-02 | Unmapped | Pending |
| EXE-01 | Unmapped | Pending |
| EXE-02 | Unmapped | Pending |
| EXE-03 | Unmapped | Pending |
| EXE-04 | Unmapped | Pending |
| FIN-01 | Unmapped | Pending |
| FIN-02 | Unmapped | Pending |
| FIN-03 | Unmapped | Pending |
| ORD-01 | Unmapped | Pending |
| ORD-02 | Unmapped | Pending |
| ORD-03 | Unmapped | Pending |
| RES-01 | Unmapped | Pending |
| RES-02 | Unmapped | Pending |
| RES-03 | Unmapped | Pending |
| RES-04 | Unmapped | Pending |
| INS-01 | Unmapped | Pending |
| INS-02 | Unmapped | Pending |
| INS-03 | Unmapped | Pending |
| CLV-01 | Unmapped | Pending |
| PRD-01 | Unmapped | Pending |
| CFG-01 | Unmapped | Pending |

**Coverage:**
- v1 requirements: 53 total
- Mapped to phases: 0
- Unmapped: 53

---
*Requirements defined: 2026-07-07*
*Last updated: 2026-07-07 after initial definition*
