# Phase 9: Insights e Páginas Complementares - Research

**Researched:** 2026-07-08
**Status:** Complete

## Scope Anchor

Fase 9 entrega: `#insights` (25 alertas em 3 categorias, cards expansíveis, KPI strip, FLT-02+FLT-03), `#clientes` (9 KPIs, 8 gráficos CLV-01), `#producao` (10 KPIs, 6 gráficos PRD-01, aging), `#metas` (CFG-01 catálogo por setor). Novas rotas `#clientes` e `#producao` no grupo Operação. Pipeline excluído de receita/alertas comerciais de receita.

## Technical Findings

### Arquitetura

```text
appState.dataset
  → MoldeFilters.applyFilters(pedidos/contas)
  → MoldeInsights.generateAlerts(pedidos, contas, options)
  → MoldeMetrics.computeClientesKpis / computeProducaoKpis / classifyIndicadores
  → MoldeCharts.renderClientesCharts / renderProducaoCharts
  → app.js render*Page + mount*Dashboard
```

### Reuso

| Asset | Uso |
|-------|-----|
| `getOverdueAccounts`, `getUpcomingAccounts`, etc. (metrics.js Fase 6) | Base alertas financeiros |
| Tabelas exceção Pedidos (Fase 7) | Padrão detalhes de alerta |
| `aggregateByVendor`, `topClientsByRevenue` | Clientes/Vendedores |
| `dias_producao`, `situacao_grupo`, `entregue_no_prazo` | Produção/Prazo |
| `INDICATOR_CATALOG` (normalizers.js) | Classificação CFG-01 |
| `renderResultadoFilters` | Modelo FLT-02+FLT-03 para Insights |

### Novo módulo insights.js

- `generateAlerts(pedidos, contas, { today, thresholds })` → `{ summary, categories: { financeiro, comercial, operacional } }`
- Cada alerta: `{ id, title, severity, count, criterion, rows[], columns[] }`
- Tendências MoM: helper `compareMonthMetric(current, previous, { higherIsBad })`
- Thresholds default documentados: aprovação 7d, desconto 15%, aging produção 14d, variação 20%

### Novas funções metrics.js

- `computeInsightsSummary(alerts)`
- `computeClientesKpis(pedidos)` — 9 KPIs resume §5
- `aggregateClientRecurrence`, `aggregateVendorRankings`, `aggregateVendorStatusMatrix`
- `computeProducaoKpis(pedidos)` — 10 KPIs resume §6
- `aggregateProductionFunnel`, `aggregateActiveOrderAging`, `aggregateOrdersWithoutForecastByVendor`
- `classifyIndicadores(indicadores, pedidos, contas)` — calculável/manual/indisponível

### Navegação

- `index.html`: inserir links Clientes e Produção após Pedidos
- `app.js`: rotas `clientes`, `producao` com render; `ANALYTICAL_ROUTES` += clientes, producao, metas
- Filtros: `renderClienteFilters` / `renderProducaoFilters` = FLT-02; `renderInsightsFilters` = FLT-02+FLT-03

### Charts novos (charts.js)

- `renderClientesCharts` — 8 instâncias incl. heatmap vendedor×status
- `renderProducaoCharts` — 6 instâncias incl. aging faixas
