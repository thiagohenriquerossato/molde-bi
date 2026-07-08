# Phase 6: Financeiro e Contas a Pagar - Research

**Researched:** 2026-07-08
**Status:** Complete

## Scope Anchor

Fase 6 entrega a página operacional `#financeiro` focada apenas em contas a pagar: 12 KPIs em 3 blocos, 10 gráficos ECharts (incluindo heatmap mês×dia e curva ABC Pareto top 15), 6 tabelas de exceção com scroll virtual, refatoração da visibilidade/contextualização do painel de filtros globais e retrofit das listas de exceção do Executivo para scroll virtual. Nenhuma receita/pedido/pipeline entra nos KPIs financeiros (D-07).

## Technical Findings

### Arquitetura (reuso do padrão Fase 5)

```text
appState.dataset.contas
  → MoldeFilters.applyFilters(contas, "contas", filterState)
  → MoldeMetrics.computeFinanceKpis(contas) + aggregations
  → MoldeCharts.renderFinanceCharts(containers, contas, theme)
  → MoldeTables.renderVirtualTable(container, {...}) para as 6 tabelas
  → app.js renderFinanceiroPage + mountFinanceiroDashboard + onFilterStateChanged
```

`app.js` continua orquestrador. Lógica de agregação vive em `metrics.js`, ECharts em `charts.js`, scroll virtual em `tables.js`.

### Campos derivados de contas já disponíveis (normalizers.js)

| Campo | Origem |
|-------|--------|
| `valor` | `parseBrazilianNumber(VALOR)` — pode ser `null` |
| `pago` | `isPaidFlag(PAGO)` boolean |
| `status_pagamento` | derivado: `Pago`, `Vencido`, `Vence hoje`, `Próximos 7 dias`, `Próximos 30 dias`, `Futuro`, `Lançamento incompleto` |
| `dias_atraso` | dias desde vencimento se não pago e vencido, senão 0/null |
| `mes_vencimento` / `mes_pagamento` | `YYYY-MM` |
| `data_vencimento` / `data_pagamento` | ISO string |
| `fornecedor`, `classificacao`, `categoria`, `conta`, `parcela` | texto normalizado |

`status_pagamento` é a fonte canônica de classificação (não recomputar). "Sem valor" = `valor` null/undefined OU `status_pagamento === "Lançamento incompleto"`.

### KPIs financeiros (FIN-01 — 12 KPIs em 3 blocos)

Bloco **Posição** (soma R$ sobre conjunto filtrado):
| KPI | Regra |
|-----|-------|
| Total de contas | `sum(valor)` de todas as filtradas |
| Total pago | `sum(valor)` onde `pago === true` |
| Total aberto | `sum(valor)` onde não pago |
| Total vencido | `sum(valor)` onde `status_pagamento === "Vencido"` |

Bloco **Vencimentos**:
| Vence hoje | `sum(valor)` onde `status_pagamento === "Vence hoje"` |
| Vence em 7 dias | `sum(valor)` onde status ∈ {"Vence hoje","Próximos 7 dias"} |
| Vence em 30 dias | `sum(valor)` onde status ∈ {"Vence hoje","Próximos 7 dias","Próximos 30 dias"} |

Bloco **Análise**:
| Média mensal de despesas | média aritmética dos totais por `mes_vencimento` (soma por mês / nº de meses distintos) |
| Maior fornecedor do mês | nome + `sum(valor)` do maior fornecedor no recorte filtrado |
| Maior classificação do mês | nome + `sum(valor)` da maior classificação no recorte filtrado |
| % despesas fixas | `sum(valor fixas) / total * 100`, 1 casa decimal, via `isDespesaFixa` |
| % despesas variáveis | `100 - % fixas` (ou soma variáveis / total) |

"Do mês" (D-04) = respeita recorte de filtros globais em contas (período por `mes_vencimento`). Não há mês isolado extra — usa o conjunto filtrado corrente.

### Gráficos (FIN-02 — 10 ECharts)

| # | data-chart | Tipo | Série |
|---|-----------|------|-------|
| 1 | `expenses-month` | linha | `sum(valor)` por `mes_vencimento` |
| 2 | `paid-open-month` | barras empilhadas | pago vs aberto por mês |
| 3 | `expenses-category` | rosca | `sum(valor)` por `categoria` |
| 4 | `expenses-classification` | barras horizontais | top classificações por `sum(valor)` |
| 5 | `top-suppliers` | barras horizontais | top 15 fornecedores por `sum(valor)` |
| 6 | `due-heatmap` | heatmap mês×dia | eixo X dias 1–31, eixo Y meses, cor = soma a vencer (não pago) | **span 2 colunas** |
| 7 | `supplier-abc` | Pareto (barras + linha %) | top 15 fornecedores + "Outros", linha % acumulado | **span 2 colunas** |
| 8 | `fixed-evolution` | linha | `sum(valor fixas)` por mês |
| 9 | `variable-evolution` | linha | `sum(valor variáveis)` por mês |
| 10 | `bank-account` | barras/rosca | `sum(valor)` por `conta` |

ECharts: `echarts.init(dom, theme)`, cores de `--chart-1..5`, tooltip pt-BR via `formatBrl`, `dispose` ao trocar rota. Heatmap usa `visualMap` + `series.type = "heatmap"`. Pareto combina `series` bar + line com segundo `yAxis` (percentual 0–100).

### Tabelas de exceção (FIN-03 — 6 tabelas, scroll virtual)

Todas via `MoldeTables.renderVirtualTable` (sem limite de 10 linhas):

| # | Filtro | Ordenação | Colunas extra |
|---|--------|-----------|---------------|
| 1 Vencidas | `status_pagamento === "Vencido"` | `dias_atraso` desc | `dias_atraso` |
| 2 Próximos 7 dias | status ∈ {"Vence hoje","Próximos 7 dias"} | `data_vencimento` asc | — |
| 3 Sem valor | `valor` null/0 ou `status_pagamento === "Lançamento incompleto"` | — | badge alerta |
| 4 Sem classificação | `classificacao` vazio | — | badge alerta |
| 5 Pagas sem data pagamento | `pago === true` e `data_pagamento` ausente | — | badge alerta |
| 6 Lançamentos futuros por mês | `status_pagamento === "Futuro"` | `data_vencimento` asc | `mes_vencimento` |

Colunas padrão: fornecedor, vencimento, valor, status_pagamento. Reusar `MoldeTables.COLUMN_SETS.contas` como base, mas definir column sets contextuais no `metrics.js`/inline para incluir `dias_atraso`/`mes_vencimento`. Badges semânticos via `formatCell` type `badge`.

`renderVirtualTable` já lida com altura fixa de viewport (480px) e virtualização por scroll — cada tabela precisa apenas de um container próprio.

### Retrofit Executivo (D-17)

As duas listas em `#executivo` (`renderExceptionTable` HTML estático, max 10) migram para `MoldeTables.renderVirtualTable`, mantendo colunas (fornecedor, vencimento, valor, status). Reduzir viewport para tabelas curtas mantém densidade. Manter empty state quando vazio.

### Filtros contextuais por rota (FIN-04 / FLT-03)

Estado (`filterState`) já suporta todos campos de contas (`filters.js` `createDefaultState().contas`). Apenas a UI expõe subset. Refatoração:

- **Visibilidade:** ocultar botão "Filtros" + painel em `#upload` e `#base-dados`. Exibir em rotas analíticas (executivo, financeiro, pedidos, resultado, insights). Implementar `isAnalyticalRoute(route)` e `updateFilterVisibility(route)` chamado em `renderCurrentRoute`.
- **Conteúdo contextual:** `renderFilterPanelContent(route)` monta seções conforme rota:
  - `financeiro`: período (ano/mês), valor min/max, busca (via topbar), status pagamento, fornecedor, classificação, categoria, conta, parcela, toggles vencido/hoje/7d/30d/sem valor/sem classificação/sem conta/pago-não pago.
  - `executivo`: mix atual pedidos + contas.
  - fallback: comportamento atual.
- Toggles booleanos (`vencido`, `venceHoje`, etc.) precisam de UI de checkbox mapeada para `filterState.contas.<flag>`; handler em `attachGlobalInteractions` já cobre `data-filter-check` (multi) — adicionar tratamento para toggles booleanos via novo atributo `data-filter-toggle-flag="contas:vencido"`.
- Alterar filtro re-renderiza tudo do Financeiro: estender `onFilterStateChanged` com `if route === "financeiro" → mountFinanceiroDashboard()`.

### Anti-Patterns (Do Not)

- Não incluir receita, pedidos ou pipeline nos KPIs/gráficos do Financeiro.
- Não recomputar `status_pagamento` — usar o derivado.
- Não deixar instâncias ECharts sem `dispose` ao trocar rota (memory leak / resize errado).
- Não limitar tabelas FIN-03 a 10 linhas — usar scroll virtual.
- Não duplicar painel de filtros no Base de Dados.
- Não inventar KPI sem fonte de dados.

## Validation Architecture

| Check | Command |
|-------|---------|
| Syntax | `node --check js/metrics.js js/charts.js js/app.js js/filters.js js/tables.js` |
| Finance metrics | `rg "computeFinanceKpis\|aggregateExpensesByMonth\|topSuppliers\|dueHeatmap\|supplierAbc" js/metrics.js` |
| Finance charts | `rg "renderFinanceCharts\|heatmap\|supplier-abc" js/charts.js` |
| Finance route | `rg "renderFinanceiroPage\|mountFinanceiroDashboard" js/app.js` |
| Filter visibility | `rg "isAnalyticalRoute\|updateFilterVisibility" js/app.js` |
| Contextual filters | `rg "renderFilterPanelContent" js/app.js` |
| Executivo retrofit | `rg "renderVirtualTable" js/app.js` (usado no mountExecutivoDashboard) |
| 6 exception tables | `rg "data-fin-table" js/app.js` (6 ocorrências) |

Manual: importar planilhas reais, abrir `#financeiro`, conferir 12 KPIs, 10 gráficos renderizados, 6 tabelas com scroll, mudar filtro de fornecedor e ver tudo re-renderizar; ir para `#upload` e `#base-dados` e confirmar painel de filtros oculto.

## RESEARCH COMPLETE
