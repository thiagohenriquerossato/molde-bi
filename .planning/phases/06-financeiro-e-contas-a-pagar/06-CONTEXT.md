# Phase 6: Financeiro e Contas a Pagar - Context

**Gathered:** 2026-07-08
**Status:** Ready for planning

<domain>
## Domain

Esta fase entrega a página operacional `#financeiro` focada em despesas, vencimentos e fornecedores: 12 KPIs compactos, 10 gráficos ECharts e 6 tabelas de exceção (FIN-01..FIN-03), todos reagindo aos filtros de contas. Inclui refatoração da visibilidade e contextualização do painel de filtros globais (oculto em Upload e Base de Dados; conteúdo adaptado por rota). Retrofit das listas de exceção do Executivo para scroll virtual. Pedidos, resultado integrado e insights completos permanecem fora do escopo analítico desta fase.

</domain>

<decisions>
## Implementation Decisions

### KPIs financeiros (FIN-01)
- **D-01:** Implementar o **conjunto completo de 12 KPIs** conforme `docs/resume.md` §Página 3 — Financeiro / Contas a Pagar (Indicadores).
- **D-02:** Layout em **3 blocos temáticos** com título, máx. 4 metric cards por linha, altura compacta (`docs/COMPONENTS.md`):
  - **Posição (4):** Total de contas, Total pago, Total aberto, Total vencido
  - **Vencimentos (3):** Vence hoje, Vence em 7 dias, Vence em 30 dias
  - **Análise (5):** Média mensal de despesas, Maior fornecedor do mês, Maior classificação do mês, Percentual despesas fixas, Percentual despesas variáveis
- **D-03:** KPIs de **Posição** e **Vencimentos** exibem **soma em R$** (`valor`) sobre o conjunto filtrado; classificação via `status_pagamento` derivado (`docs/resume.md` §3.2).
- **D-04:** Cards **Maior fornecedor do mês** e **Maior classificação do mês** exibem **nome em destaque + valor secundário** (ex.: "Fornecedor X — R$ 12.400,00"). "Do mês" respeita recorte de filtros globais em contas por `mes_vencimento`/`data_vencimento` (Fase 4).
- **D-05:** **Média mensal de despesas** = média aritmética dos totais mensais de despesa no período filtrado (agrupamento por `mes_vencimento`).
- **D-06:** **Percentual fixas/variáveis** usa lógica `isDespesaFixa` já existente em `js/metrics.js` sobre o conjunto filtrado; exibir % com uma casa decimal.
- **D-07:** KPIs do Financeiro são **somente de contas** — não repetir receita, pedidos ou pipeline do Executivo.

### Gráficos (FIN-02)
- **D-08:** Implementar **10 gráficos completos** conforme `docs/resume.md` §Página 3 (Gráficos):
  1. Despesas por mês (linha ou coluna)
  2. Pago × aberto por mês (barras empilhadas)
  3. Despesas por categoria (rosca)
  4. Despesas por classificação (barras horizontais)
  5. Top fornecedores (barras horizontais)
  6. Calendário de vencimentos — **heatmap mês × dia** (eixo X: dias 1–31, eixo Y: meses do filtro, cor = soma de valor a vencer)
  7. Curva ABC de fornecedores — **Pareto top 15** (barras + linha % acumulado; demais agrupados em "Outros")
  8. Evolução despesas fixas (linha)
  9. Evolução despesas variáveis (linha)
  10. Saídas por conta bancária (barras ou rosca)
- **D-09:** Disposição: KPIs no topo; abaixo **grade 2 colunas** de gráficos (desktop), 1 coluna (mobile/tablet). **Heatmap ocupa linha inteira** (span 2 colunas).
- **D-10:** Gráficos usam paleta `docs/TOKENS.md`, locale pt-BR, sem gradientes decorativos; `resize`/`dispose` ao trocar rota (padrão Fase 5).
- **D-11:** Todos os gráficos reagem aos **filtros de contas ativos** na rota Financeiro.

### Tabelas de exceção (FIN-03)
- **D-12:** Implementar **6 tabelas FIN-03**:
  1. Contas vencidas — ordenar por `dias_atraso` decrescente
  2. Contas dos próximos 7 dias — ordenar por `data_vencimento` ascendente
  3. Contas sem valor — `status_pagamento === "Lançamento incompleto"` ou valor ausente/zero
  4. Contas sem classificação — classificação vazia
  5. Contas pagas sem data de pagamento — `pago === true` e `data_pagamento` ausente
  6. Lançamentos futuros por mês — `status_pagamento === "Futuro"`, agrupados/exibidos com coluna de mês
- **D-13:** Layout: **grade 2 colunas** (desktop), empilhado (mobile), abaixo dos gráficos.
- **D-14:** Cada tabela usa **scroll virtual** (padrão Base de Dados) — **sem limite fixo de 10 linhas**; exibir todas as linhas do conjunto filtrado com performance aceitável.
- **D-15:** Colunas padrão: **fornecedor, vencimento, valor, status_pagamento**; extras contextuais por tabela (`dias_atraso` em vencidas; `mes_vencimento` em futuros; badge de alerta em inconsistências).
- **D-16:** Densidade compacta conforme `docs/TABLES.md`; badges semânticos para `status_pagamento`.
- **D-17:** **Retrofit Executivo:** as duas listas de exceção em `#executivo` (vencidas, próximos 7 dias) migram de limite 10 linhas para **scroll virtual**, mantendo colunas atuais.

### Filtros e refatoração (FIN-04 / FLT-03)
- **D-18:** **Refatorar visibilidade do painel de filtros:** ocultar completamente em `#upload` e `#base-dados`. Exibir apenas em páginas analíticas: Executivo, Financeiro, Pedidos (futuro), Resultado (futuro), Insights (futuro).
- **D-19:** **Painel contextual por rota:**
  - **Financeiro:** expor filtros de **contas completos** (FLT-03): status pagamento, fornecedor, classificação, categoria, conta, parcela, toggles vencido/hoje/7d/30d, sem valor, sem classificação, sem conta, pago/não pago, período/valor/busca globais aplicados a contas
  - **Executivo:** mix pedidos + contas relevante ao dashboard integrado (como hoje, possivelmente expandido)
  - **Resultado (futuro):** ambos domínios
  - Demais rotas analíticas conforme domínio da fase
- **D-20:** Alterar filtro re-renderiza **todos** KPIs, gráficos e tabelas da página Financeiro sem reload.
- **D-21:** Base de Dados mantém busca/ordenação/export na toolbar da tabela — **sem** painel global duplicado.
- **D-22:** Período em contas continua por `data_vencimento`/`mes_vencimento` (Fase 4 D-17).

### the agent's Discretion
- Tipo exato de cada gráfico ECharts (linha vs coluna, rosca vs barras) desde que legível e alinhado ao resume.md.
- Módulos (`finance.js`, extensões em `metrics.js`/`charts.js`) desde que separados de `app.js`.
- Microcopy pt-BR de títulos de bloco, tabelas e tooltips.
- Altura dos containers de chart e heatmap; implementação técnica do scroll virtual nas tabelas de exceção.
- Ordem exata das 6 tabelas dentro da grade 2×3.
- Detalhe visual do card nome+valor (tipografia) desde que nome legível em uma linha com truncamento.
- Expansão incremental do painel contextual do Executivo além do mínimo, desde que D-18..D-21 sejam honrados.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento e escopo
- `.planning/PROJECT.md` — visual híbrido, página operacional densa, ECharts local.
- `.planning/REQUIREMENTS.md` — requisitos `FIN-01`..`FIN-03`, `FLT-03`, `FLT-04`.
- `.planning/ROADMAP.md` — objetivo e critérios de sucesso da Fase 6.
- `.planning/STATE.md` — foco atual e riscos (abas mensais, totais em contas).
- `.planning/phases/04-normaliza-o-estado-e-tabelas/04-CONTEXT.md` — filtros globais, campos derivados de contas, `status_pagamento`, scroll virtual.
- `.planning/phases/05-dashboard-executivo/05-CONTEXT.md` — padrões de KPI blocks, charts grid, listas de exceção a retrofittar.

### Design system e UX
- `docs/DESIGN.md` — layout operacional table-first, densidade moderada.
- `docs/TOKENS.md` — tokens, chart colors, densidade.
- `docs/UX.md` — filtros, estados vazios, feedback.
- `docs/COMPONENTS.md` — metric cards compactos (máx. 4/linha).
- `docs/TABLES.md` — tabelas densas, scroll virtual, badges.

### Regras de negócio e métricas
- `docs/resume.md` §Página 3 — KPIs, gráficos e tabelas do Financeiro.
- `docs/resume.md` §3.2 — schema e `status_pagamento` de contas.
- `docs/resume.md` §Filtros de contas — catálogo de filtros de contas.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/metrics.js` — `isDespesaFixa`, agregações mensais de contas, `getOverdueContas`, `getUpcomingContas`, `topClassifications`, `aggregateFixedVariableByMonth`.
- `js/charts.js` — padrão `renderExecutiveCharts` com ECharts, tema, dispose.
- `js/filters.js` — `applyContaFilters` com FLT-03 completo no estado; UI expõe só subset.
- `js/tables.js` — scroll virtual, column sets para contas, badges.
- `js/app.js` — rota `financeiro` com empty state; `renderExecutivoPage` como referência; painel de filtros na topbar.
- `css/app.css` — tokens, metric blocks, chart grid da Fase 5.

### Established Patterns
- Hash routes com `render` customizado por página analítica.
- Filtros globais colapsáveis na topbar; chips de filtro ativo.
- Página operacional = KPIs compactos + tabelas protagonistas + gráficos de apoio.
- Empty state quando `!hasDataset()` ou sem contas importadas.

### Integration Points
- Novo `renderFinanceiroPage` registrado na rota `financeiro`.
- Extensão de `MoldeMetrics` com KPIs e agregações financeiras dedicadas.
- Extensão de `MoldeCharts` com `renderFinanceCharts` (10 instâncias + heatmap).
- Refatorar `renderFilterPanelContent` / visibilidade do painel por rota ativa.
- Retrofit das tabelas de exceção em `renderExecutivoPage` para scroll virtual via `MoldeTables`.

</code_context>

<specifics>
## Specific Ideas

- Usuário quer **conjunto completo** do resume.md para KPIs (12) e gráficos (10), não apenas mínimo FIN-01/02.
- Filtros globais **não devem aparecer no Upload** — refatoração de visibilidade solicitada explicitamente.
- Painel de filtros **contextual por rota**; Financeiro expõe filtros de contas completos.
- Tabelas com **scroll virtual**; aplicar também às listas do Executivo (retrofit).
- Maior fornecedor/classificação: **nome + valor** nos cards.

</specifics>

<deferred>
## Deferred Ideas

- Tabela "Fornecedores mais recorrentes" do resume.md — fora de FIN-03; fase futura ou polimento.
- Filtro por clique em gráfico — v2 (Fase 4 D-19).
- Salvar visão de filtros — v2.
- Drill-down de tabela executiva/financeira para Base de Dados — fase futura.
- Páginas Pedidos, Resultado, Insights — filtros contextuais definidos aqui, implementação completa nas fases respectivas.

</deferred>

---

*Phase: 06-financeiro-e-contas-a-pagar*
*Context gathered: 2026-07-08*
