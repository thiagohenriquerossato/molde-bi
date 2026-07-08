# Phase 7: Pedidos e Receita - Context

**Gathered:** 2026-07-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega a página operacional `#pedidos` focada em análise comercial e de produção por pedido: **15 KPIs** em 4 blocos temáticos, **12 gráficos ECharts** e **6 tabelas de exceção**, todos reagindo aos **filtros de pedidos completos (FLT-02)** no painel contextual da rota. Status devem respeitar `situacao_grupo` (pipeline, ativo, entregue, cancelado, sem status) sem misturar orçamento com receita realizada. Resultado integrado, clientes/vendedores dedicados e insights automáticos permanecem fora do escopo analítico desta fase.

</domain>

<decisions>
## Implementation Decisions

### KPIs de pedidos (ORD-01)
- **D-01:** Implementar o **conjunto completo de 15 KPIs** conforme `docs/resume.md` §Página 4 — Pedidos / Receita (Indicadores).
- **D-02:** Layout em **4 blocos temáticos** com título, máx. 4 metric cards por linha, altura compacta (`docs/COMPONENTS.md`):
  - **Valores (6):** Valor bruto, Descontos, Valor final, Valor pago, Valor pendente, Ticket médio
  - **Status (4):** Total de pedidos, Pedidos entregues, Pedidos cancelados, Pedidos ativos
  - **Pipeline (1):** Pedidos aguardando aprovação — bloco **isolado** com acento warning (padrão Executivo D-08/D-09); subtítulo ou badge **"Não contabilizado na receita"**
  - **Prazos (4):** Desconto médio, Tempo médio de produção, Atraso médio, Percentual entregue no prazo
- **D-03:** Bloco **Valores** calcula somas e ticket médio apenas sobre **receita ativa** — pedidos com `situacao_grupo` em grupos aprovados/ativos/entregues; **exclui** cancelados e pipeline (`docs/resume.md` §7).
- **D-04:** Contagens do bloco **Status** usam o conjunto filtrado completo de pedidos; cada card filtra por `situacao_grupo` correspondente (ativo = `Pedido ativo`, cancelado = `Perdido / cancelado`, entregue = `Entregue`).
- **D-05:** KPI **Pipeline** conta pedidos com `situacao_grupo === "Pipeline / orçamento"`; valor exibido pode ser contagem com subtítulo de valor total em R$ (opcional secundário), mas **não** entra no bloco Valores.
- **D-06:** **Ticket médio** no bloco Valores = `valor_final` / quantidade de pedidos de receita ativa no filtro.
- **D-07:** **Desconto médio** no bloco Prazos = média de `valor_desconto` (ou % desconto/bruto) sobre receita ativa; formato % ou R$ a critério do executor desde que legível.

### Métricas de prazo (bloco Prazos)
- **D-08:** **Tempo médio de produção**, **atraso médio** e **% entregue no prazo** — critério de cálculo a critério do executor (`the agent's Discretion`), com default recomendado: apenas pedidos **entregues** com `dias_producao`/`dias_atraso`/`entregue_no_prazo` válidos; pedidos em aberto ou sem datas não entram no denominador.
- **D-09:** **% entregue no prazo** = entregues com `entregue_no_prazo === true` / total de entregues com data prevista e entrega válidas × 100.

### Pipeline vs receita (ORD-03)
- **D-10:** Nenhum KPI do bloco Valores nem gráfico de receita soma pipeline em receita, recebido ou pendente realizados.
- **D-11:** Gráficos que exibem receita (por mês, vendedor, cliente) usam **receita ativa** por padrão; decisão fina por gráfico fica a critério do executor (`the agent's Discretion`), desde que pipeline nunca apareça como receita realizada.
- **D-12:** Funil/gráfico de situação mostra `situacao_grupo` com pipeline como grupo próprio, visualmente distinto.

### Gráficos (ORD-02)
- **D-13:** Implementar **12 gráficos completos** conforme `docs/resume.md` §Página 4 (Gráficos):
  1. Receita por mês (coluna ou linha)
  2. Pedidos por mês (coluna)
  3. Ticket médio por mês (linha)
  4. Pedidos por situação (funil)
  5. Receita por vendedor (barras horizontais)
  6. Pedidos por vendedor (barras)
  7. Valor pendente por status (barras empilhadas)
  8. Desconto por mês (linha)
  9. Top clientes por valor (barras horizontais)
  10. Entregues no prazo × atrasados (rosca)
  11. Tempo médio de produção por mês (linha)
  12. Distribuição de ticket (histograma)
- **D-14:** Disposição: KPIs no topo; abaixo **grade 2 colunas** (desktop), 1 coluna (mobile/tablet) — padrão Fases 5 e 6.
- **D-15:** Gráficos usam paleta `docs/TOKENS.md`, locale pt-BR, sem gradientes decorativos; `resize`/`dispose` ao trocar rota.
- **D-16:** Todos os gráficos reagem aos **filtros de pedidos ativos** na rota Pedidos.

### Tabelas de exceção
- **D-17:** Implementar **6 tabelas operacionais** abaixo dos gráficos (grade 2 colunas desktop, empilhado mobile), padrão Financeiro:
  1. **Pedidos atrasados** — `entregue_no_prazo === false`; ordenar `dias_atraso` decrescente
  2. **Entregues com valor pendente** — `situacao_grupo === "Entregue"` e `valor_pendente > 0`
  3. **Sem cliente** — `cliente` vazio ou normalizado como não identificado
  4. **Sem data prevista** — `data_prevista` ausente
  5. **Desconto alto** — desconto acima de limiar (executor define; sugerido ≥ 20% do valor bruto ou top percentil)
  6. **Pipeline em aprovação** — `situacao_grupo === "Pipeline / orçamento"`; ordenar por antiguidade (`data_cadastro` ascendente)
- **D-18:** Cada tabela usa **scroll virtual** (padrão Base de Dados / Financeiro) — sem limite fixo de linhas.
- **D-19:** Colunas padrão: **pedido, cliente, vendedor, situação, valor final, valor pendente**; extras contextuais (`dias_atraso`, `data_prevista`, `% desconto`) conforme tabela.
- **D-20:** Densidade compacta e badges semânticos por `situacao_grupo` e `status_financeiro` (`docs/TABLES.md`).

### Filtros contextuais (FLT-02)
- **D-21:** Na rota **Pedidos**, expor **FLT-02 completo** no painel contextual (deferido da Fase 6 D-19): situação, `situacao_grupo`, vendedor, cliente, forma pagamento entrada/saldo, toggles com pendente, sem cliente, sem data prevista, entregue no prazo, atrasado, cancelado, aguardando aprovação, mais período/valor/busca globais aplicados a pedidos.
- **D-22:** Alterar filtro re-renderiza **todos** KPIs, gráficos e tabelas da página Pedidos sem reload.
- **D-23:** Período em pedidos por `data_cadastro`/`mes_cadastro` (Fase 4 D-17).
- **D-24:** KPIs e gráficos do Pedidos são **somente de pedidos** — não repetir despesas ou resultado integrado do Executivo/Financeiro.

### the agent's Discretion
- Critério exato de tempo médio, atraso médio e % no prazo para pedidos sem datas completas (default: só entregues válidos).
- Tratamento gráfico de receita vs pipeline em cada chart (desde que D-10..D-12 sejam honrados).
- Limiar de "desconto alto" na tabela de exceção.
- Tipo exato de cada gráfico ECharts (linha vs coluna, funil vs rosca, bins do histograma).
- Módulos (`pedidos.js`, extensões em `metrics.js`/`charts.js`) desde que separados de `app.js`.
- Microcopy pt-BR de títulos de bloco, tabelas e tooltips.
- Ordem exata das 6 tabelas na grade; card pipeline com valor R$ secundário ou só contagem.
- Implementação técnica do scroll virtual e agregações mensais.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento e escopo
- `.planning/PROJECT.md` — visual híbrido, página operacional densa, ECharts local, separação pipeline/receita.
- `.planning/REQUIREMENTS.md` — requisitos `ORD-01`..`ORD-03`, `FLT-02`, `FLT-04`.
- `.planning/ROADMAP.md` — objetivo e critérios de sucesso da Fase 7.
- `.planning/STATE.md` — foco atual e riscos (pipeline inflando receita).
- `.planning/phases/04-normaliza-o-estado-e-tabelas/04-CONTEXT.md` — filtros globais, campos derivados de pedidos, `situacao_grupo`, scroll virtual.
- `.planning/phases/05-dashboard-executivo/05-CONTEXT.md` — separação pipeline/receita, fórmulas de receita ativa, padrões de KPI blocks e charts grid.
- `.planning/phases/06-financeiro-e-contas-a-pagar/06-CONTEXT.md` — padrão de 12 KPIs, 10 gráficos, 6 tabelas de exceção, painel contextual por rota.

### Design system e UX
- `docs/DESIGN.md` — layout operacional table-first, densidade moderada.
- `docs/TOKENS.md` — tokens, chart colors, densidade.
- `docs/UX.md` — filtros, estados vazios, feedback.
- `docs/COMPONENTS.md` — metric cards compactos (máx. 4/linha).
- `docs/TABLES.md` — tabelas densas, scroll virtual, badges.

### Regras de negócio e métricas
- `docs/resume.md` §Página 4 — KPIs, gráficos do Pedidos / Receita.
- `docs/resume.md` §3.1 — schema pedidos, mapeamento `situacao_grupo`.
- `docs/resume.md` §7 — receita ativa, pipeline, ticket médio, dias produção/atraso.
- `docs/resume.md` §Filtros de pedidos — catálogo FLT-02.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/metrics.js` — `isReceitaAtiva`, `isPipeline`, `isCancelado`, `computeExecutiveKpis`, `aggregateOrdersByGroup`, `topVendorsByRevenue`; base para KPIs e agregações de pedidos.
- `js/charts.js` — padrão `renderExecutiveCharts` / `renderFinanceCharts` com ECharts, tema, dispose.
- `js/filters.js` — `applyPedidoFilters` com FLT-02 completo no estado; UI expõe subset no Executivo.
- `js/tables.js` — scroll virtual, column sets, badges.
- `js/normalizers.js` — `situacao_grupo`, `dias_producao`, `dias_atraso`, `entregue_no_prazo`, `status_financeiro`.
- `js/app.js` — rota `pedidos` com empty state genérico; `renderFinanceiroPage` e `renderExecutivoPage` como referência; painel de filtros contextual por rota.
- `css/app.css` — tokens, metric blocks, chart grid das Fases 5 e 6.

### Established Patterns
- Hash routes com `render` customizado por página analítica.
- Filtros globais colapsáveis na topbar; painel contextual Financeiro já implementado (D-18..D-21 Fase 6).
- Página operacional = KPIs compactos + gráficos de apoio + tabelas de exceção protagonistas.
- Empty state quando `!hasDataset()` ou sem pedidos importados.

### Integration Points
- Novo `renderPedidosPage` registrado na rota `pedidos`.
- Extensão de `MoldeMetrics` com KPIs e agregações de pedidos dedicadas.
- Extensão de `MoldeCharts` com `renderPedidosCharts` (12 instâncias).
- Extensão de `renderFilterPanelContent` para rota `pedidos` com FLT-02 completo na UI.
- Tabelas de exceção via `MoldeTables` com scroll virtual.

</code_context>

<specifics>
## Specific Ideas

- Usuário quer **conjunto completo** do resume.md: 15 KPIs, 12 gráficos e 6 tabelas — padrão alinhado às Fases 5 e 6.
- Bloco Pipeline **isolado com warning**, igual Executivo — risco crítico de confundir orçamento com receita.
- Valores monetários do bloco Valores só sobre **receita ativa**.
- Filtros **FLT-02 completos** na rota Pedidos (implementação deferida da Fase 6).

</specifics>

<deferred>
## Deferred Ideas

- Página Clientes e Vendedores dedicada (rankings, recorrência, matriz heatmap) — Fase 9 (`CLV-01`).
- Página Produção e Prazo (funil produção, aging, sem previsão por vendedor) — Fase 9 (`PRD-01`).
- Alertas automáticos consolidados — Fase 9 (`INS-02`, `INS-03`).
- Resultado integrado e caixa — Fase 8.
- Filtro por clique em gráfico — v2.
- Drill-down de tabela para Base de Dados — fase futura.

</deferred>

---

*Phase: 07-pedidos-e-receita*
*Context gathered: 2026-07-08*
