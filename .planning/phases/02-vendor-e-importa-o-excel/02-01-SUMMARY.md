---
phase: 02-vendor-e-importa-o-excel
plan: 01
subsystem: infra
tags: [sheetjs, echarts, vendor, offline]
requires:
  - phase: 01-fundacao-estatica-e-design-system
    provides: shell estatico e carregamento de scripts locais
provides:
  - SheetJS local em vendor/sheetjs/xlsx.full.min.js
  - ECharts local em vendor/echarts/echarts.min.js
  - Ordem de scripts pronta para importacao XLSX
affects: [importacao, dashboards, graficos]
tech-stack:
  added: [SheetJS Community Edition, Apache ECharts]
  patterns: [vendor local sem build, scripts classicos defer]
key-files:
  created: [vendor/sheetjs/xlsx.full.min.js, vendor/echarts/echarts.min.js]
  modified: [index.html]
key-decisions:
  - "Bibliotecas ficam isoladas em vendor/ para manter o app estatico e offline."
  - "Scripts sao carregados antes de js/app.js para expor window.XLSX e window.echarts."
patterns-established:
  - "Dependencias de runtime devem ser arquivos locais referenciados por caminhos relativos."
requirements-completed: [FND-04]
duration: 10min
completed: 2026-07-07
---

# Phase 2 Plan 01: Vendor Local de SheetJS e ECharts Summary

**SheetJS e ECharts vendorizados localmente com carregamento relativo antes da aplicacao**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-07T20:53:00Z
- **Completed:** 2026-07-07T21:03:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Adicionados os bundles locais de SheetJS e ECharts em `vendor/`.
- Atualizado `index.html` para carregar as bibliotecas antes de `js/app.js`.
- Mantida a execucao estatica sem `package.json`, bundler, backend ou CDN no app.

## Task Commits

Each task was committed atomically:

1. **Task 02-01: Vendor local e ordem de scripts** - `f53f1b4` (feat)

## Files Created/Modified

- `vendor/sheetjs/xlsx.full.min.js` - Bundle local do SheetJS.
- `vendor/echarts/echarts.min.js` - Bundle local do ECharts.
- `index.html` - Carrega os bundles locais antes do script principal.

## Decisions Made

Segui o plano: bibliotecas de terceiros ficam em `vendor/`, separadas da logica da aplicacao.

## Deviations from Plan

O scan amplo por `https?://` dentro de `vendor/` encontra strings internas dos bundles oficiais minificados. Isso nao adiciona dependencia remota de runtime no app; `index.html`, `css/` e `js/` seguem sem CDN ou URL remota.

## Issues Encountered

O primeiro `npm pack` falhou no sandbox por resolucao DNS. A obtencao dos pacotes funcionou fora do sandbox, e o diretorio temporario foi removido.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

`window.XLSX` e `window.echarts` ficam disponiveis para a integracao da leitura XLSX no Plano 02.

---
*Phase: 02-vendor-e-importa-o-excel*
*Completed: 2026-07-07*
