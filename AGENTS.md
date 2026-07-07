# AGENTS.md

## Project

Molde Momentos Dashboard Local is a static, browser-only mini ERP/dashboard for Excel spreadsheets. It must run locally without backend, login or external database.

## Required Context

Before planning or implementing project work, read:

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/research/SUMMARY.md`
- `docs/resume.md`

For UI work, also read:

- `docs/DESIGN.md`
- `docs/TOKENS.md`
- `docs/UX.md`
- `docs/COMPONENTS.md`
- `docs/TABLES.md`
- `docs/FORMS.md`

## Technical Direction

- Use HTML, CSS and vanilla JavaScript.
- Keep the app runnable from `index.html`.
- Do not add backend, login, remote database or runtime internet dependency.
- Vendor SheetJS and ECharts locally before using them.
- Prefer IndexedDB for normalized datasets and `localStorage` for lightweight preferences.
- Keep code split by responsibility: importer, schemas, validators, normalizers, store, filters, metrics, charts, insights and tables.

## Business Rules

- `Aguardando Aprovação` is pipeline/orçamento, not realized revenue.
- Receita ativa excludes canceled orders and should not include approval-stage pipeline as realized revenue.
- Resultado competência uses active revenue minus expenses.
- Resultado caixa uses received pedido values minus paid contas.
- Pedidos total rows with empty `Pedido` must be ignored.
- Contas monthly sheets must stop reading at the first `TOTAL` row.
- Indicators without data source must be shown as manual or unavailable, never invented.

## UI Direction

- Follow the design system in `docs/`.
- Use pt-BR copy, dates, currency and numeric formatting.
- Prefer compact KPI cards, dense tables, clear filters and semantic badges.
- Use a hybrid layout: more visual on executive/integrated pages, more operational and table-first on finance, orders and base data pages.
- Avoid decorative charts, gradients and noisy dashboard layouts.

## Current Workflow

- Mode: YOLO.
- Granularity: fine.
- Next phase: Phase 1 - Fundação Estática e Design System.
- Recommended next command: `/gsd-plan-phase 1`.
