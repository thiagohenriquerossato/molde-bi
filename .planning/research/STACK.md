# Stack Research

## Recommendation

Build a static browser application with HTML, CSS and vanilla JavaScript modules. Use local vendor copies of SheetJS for XLSX import and ECharts for charts. Keep the app runnable by opening `index.html`, with no backend, no login and no build step required for v1.

## Core Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Shell | `index.html` | Direct local execution and simple distribution |
| Styling | `css/app.css` with CSS variables | Matches `docs/TOKENS.md` and avoids framework coupling |
| JavaScript | ES modules in `/js` | Keeps domain logic split by responsibility |
| XLSX import | SheetJS vendored locally | Mature Excel parsing and broad `.xlsx` compatibility |
| Charts | ECharts vendored locally | Better support for heatmaps, waterfall, combined charts and dashboard interactions |
| Persistence | IndexedDB first, `localStorage` for preferences | IndexedDB handles normalized tables better than `localStorage` |
| Export | Browser Blob CSV generation | No backend needed |
| Printing | Print CSS | Native browser support |

## Directory Shape

```text
/
  index.html
  /css
    app.css
  /js
    app.js
    importer.js
    validators.js
    normalizers.js
    data-store.js
    metrics.js
    filters.js
    charts.js
    insights.js
    tables.js
    schemas.js
  /vendor
    xlsx.full.min.js
    echarts.min.js
  /docs
```

## Runtime Principles

- Do not require network access after files are present locally.
- Do not require Node, npm or a dev server for business use.
- Keep third-party code isolated under `/vendor`.
- Keep all business rules in domain modules, not in render code.
- Use pt-BR formatters for dates, currency and percentages.
- Prefer deterministic calculations over values copied from spreadsheet formulas.

## Confidence

High. The stack directly matches the user's constraints and the technical recommendation in `docs/resume.md`.
