---
phase: 02-vendor-e-importa-o-excel
status: human_needed
requirements_verified: [FND-04, IMP-01, IMP-02, IMP-03]
must_haves_total: 14
must_haves_passed: 14
human_verification_required: true
created: 2026-07-07
---

# Phase 2 Verification

## Result

Status: human_needed.

A implementação automatizada da Fase 2 passou em todas as verificações de código e leitura de workbook. Restam itens de confirmação visual no navegador com o seletor nativo de arquivos.

## Requirements

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FND-04 | passed | `vendor/sheetjs/xlsx.full.min.js` e `vendor/echarts/echarts.min.js` existem; `index.html` referencia apenas caminhos relativos locais; não há `package.json` nem URLs remotas em `index.html`, `css/` ou `js/`. |
| IMP-01 | passed | Card de pedidos com input `accept=".xlsx,.xls"`, trigger independente e leitura via `window.MoldeImporter.readWorkbookFile(file, "pedidos")`. |
| IMP-02 | passed | Card de contas com input independente, metadados com `monthlySheetNames` filtrando abas `CONTAS *2026`. |
| IMP-03 | passed | Card de indicadores marcado como opcional; estado inicial `optional-empty`; completude obrigatória considera apenas pedidos + contas. |

## Must-Haves

- Vendor local SheetJS: passed.
- Vendor local ECharts: passed.
- Ordem de scripts sheetjs → echarts → importer → app: passed.
- `window.MoldeImporter` com API planejada: passed.
- Leitura via `arrayBuffer()` + `XLSX.read`: passed.
- Sem `XLSX.readFile`, IndexedDB, normalização ou métricas: passed.
- Cards independentes por origem: passed.
- Estados Pendente, Lendo, Lido, Erro e Opcional não carregado: passed.
- Metadados com arquivo, aba principal, abas, linhas e horário: passed.
- Erro isolado por card: passed.
- Topbar atualiza progresso obrigatório e foca card pendente: passed.
- `aria-live="polite"` em região de status: passed.
- Leitura real das três planilhas de exemplo: passed.
- Escopo negativo (sem validação profunda/persistência): passed.

## Automated Verification

- `node --check js/app.js`: passed.
- `node --check js/importer.js`: passed.
- Vendor bundles contêm `XLSX` e `echarts`: passed.
- Ausência de `https?://` em `index.html`, `css/` e `js/`: passed.
- Ausência de `XLSX.readFile` e `indexedDB` em `js/`: passed.
- Leitura Node com bundle local:
  - `Pedidos_Simplificado.xlsx`: `Sheet1`, 1 aba, 1024 linhas.
  - `PLANILHA CONTAS A PAGAR1.xlsx`: 15 abas, 12 abas mensais `CONTAS *2026`.
  - `Molde_Momentos_Template_Indicadores.xlsx`: `DADOS_PBI`, 11 abas.

## Human Verification

1. Abrir `index.html` no navegador e confirmar que os três cards de upload estão ativos (sem copy "Disponível na Fase 2" após o JS carregar).
   expected: Botões "Selecionar planilha" habilitados; badges "Obrigatório" em pedidos/contas e "Opcional não carregado" em indicadores.

2. Selecionar `Pedidos_Simplificado.xlsx` no card de pedidos.
   expected: Badge "Lido", metadados com nome do arquivo, aba principal, contagem de abas/linhas e horário de importação.

3. Selecionar `PLANILHA CONTAS A PAGAR1.xlsx` no card de contas.
   expected: Badge "Lido" e lista de abas mensais `CONTAS *2026` nos metadados.

4. Clicar "Selecionar planilha" na topbar antes de concluir pedidos/contas.
   expected: Navega para `#upload` e destaca o primeiro card obrigatório pendente.

5. Carregar apenas pedidos e contas, sem indicadores.
   expected: Topbar mostra "Bases obrigatórias lidas"; indicadores permanece opcional sem bloquear o fluxo.

## Gaps

None in automated scope. Browser file-picker behavior awaits human confirmation.
