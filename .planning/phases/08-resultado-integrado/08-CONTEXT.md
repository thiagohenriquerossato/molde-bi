# Phase 8: Resultado Integrado - Context

**Gathered:** 2026-07-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega a página `#resultado` — visão integrada de gestão comparando **competência** e **caixa** sem misturar conceitos. Inclui KPIs integrados (recebíveis, contas abertas, saldo projetado, cobertura, break-even), gráficos dedicados (waterfall, recebido vs pago, projeção de caixa) e filtros de ambos domínios. Pipeline (`Aguardando Aprovação`) **nunca** entra em receita ou resultado. Insights automáticos, clientes/vendedores e alertas permanecem fora do escopo (Fase 9).

</domain>

<decisions>
## Implementation Decisions

### Layout e visão dupla (Competência × Caixa)
- **D-01:** Estrutura em **3 blocos temáticos sequenciais**: **Competência** → **Caixa** → **Posição operacional** (desktop e mobile empilhados).
- **D-02:** KPIs **dentro de cada bloco**, não em faixa global única.
- **D-03:** Gráficos **distribuídos por bloco**, não em grade única desagrupada.
- **D-04:** Distinção visual **sutil** — eyebrow + título de bloco ("Visão por competência", "Visão de caixa", "Posição operacional"); mesma paleta, sem acentos conflitantes.

### Bloco Competência
- **D-05:** KPIs: Receita do mês (receita ativa), Despesa do mês, Resultado competência.
- **D-06:** Gráficos: Receita × Despesa × Resultado por mês (linha combinada) + Waterfall do resultado.
- **D-07:** Toggle **Cadastro | Entrega** para base temporal da receita na competência; **default Cadastro**; controle no bloco Competência ou painel de filtros da rota; **só afeta este bloco** (Caixa e Posição operacional não mudam com o toggle).
- **D-08:** Despesas na competência por **`mes_vencimento` / `data_vencimento`** (padrão Fases 4–6).
- **D-09:** Período filtrado **cross-domain**: pedidos por `mes_cadastro` (ou `mes_entrega` se toggle) + contas por `mes_vencimento` no mesmo recorte global.

### Bloco Caixa
- **D-10:** KPIs: Recebido no mês, Despesa paga no mês, Resultado caixa.
- **D-11:** Gráficos: Recebido × Pago (linha) + Projeção de caixa (área, saldo acumulado).
- **D-12:** **Resultado caixa** = soma `valor_pago` dos pedidos no período − soma contas pagas no período (`pago === true` com `data_pagamento` no recorte).
- **D-13:** Período de caixa por **movimentação real**: entradas via `valor_pago` no recorte; saídas via `data_pagamento` no recorte (não reutilizar mes_cadastro/mes_vencimento para caixa).
- **D-14:** **Projeção de caixa** = série mensal de saldo acumulado: `(recebido − pago)` do mês + carry-forward do saldo anterior.

### Bloco Posição operacional
- **D-15:** Terceiro bloco **após Caixa** — leitura de resultado mensal para posição de caixa atual.
- **D-16:** KPIs (5): Contas a receber (`valor_pendente`), Contas a pagar abertas (`despesas em aberto`), Saldo operacional projetado, Cobertura, Ponto de equilíbrio.
- **D-17:** Gráficos (2): Recebíveis × contas em aberto (barras) + Ponto de equilíbrio mensal (linha).
- **D-18:** **Saldo operacional projetado** = recebíveis − contas abertas (snapshot do conjunto filtrado).
- **D-19:** **Cobertura** = razão recebíveis / contas abertas exibida como multiplicador (ex.: 1,25×); tratar divisão por zero como indisponível.
- **D-20:** **Ponto de equilíbrio** como KPI numérico: **"Pedidos para equilíbrio: N"** = despesas fixas do período ÷ ticket médio geral (mesma regra de `isDespesaFixa` e ticket do Executivo).

### Filtros da rota Resultado
- **D-21:** Painel contextual expõe **FLT-02 + FLT-03 completos** (ambos domínios), conforme Fase 6 D-19.
- **D-22:** Alterar filtro re-renderiza **todos** KPIs e gráficos da página `#resultado` sem reload.
- **D-23:** Período afeta competência (cross-domain cadastro/vencimento) e caixa (movimentação) de formas distintas conforme D-09 e D-13.

### Overlap com Executivo
- **D-24:** **Repetição intencional** de KPIs e gráficos que já existem no Executivo — Resultado é a visão integrada dedicada para comparar competência vs caixa.
- **D-25:** Implementar **6 gráficos completos** do `docs/resume.md` §Página 7 mesmo com overlap no gráfico receita×despesa×resultado.
- **D-26:** **Sem bloco Pipeline** na página Resultado — orçamentos pendentes ficam no Executivo/Pedidos; nota implícita via regras de negócio (pipeline excluído de receita).
- **D-27:** Tom visual **híbrido integrado** — mais visual que Financeiro/Pedidos, menos que Executivo; 3 blocos + 6 gráficos conforme `docs/DESIGN.md`.

### the agent's Discretion
- Módulos (`resultado.js`, extensões em `metrics.js`/`charts.js`) desde que separados de `app.js`.
- Tipo exato ECharts (waterfall nativo vs stacked bars simulando waterfall) desde que legível.
- Microcopy pt-BR de eyebrows, tooltips explicando competência vs caixa e toggle Cadastro|Entrega.
- Persistência do toggle Cadastro|Entrega em `filterState` (localStorage opcional).
- Tratamento de empty state quando falta pedidos ou contas; altura/resize/dispose dos charts ao navegar.
- Colunas e densidade das tabelas de reconciliação — **não obrigatórias** nesta fase; foco em KPIs + gráficos.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento e escopo
- `.planning/PROJECT.md` — separação pipeline/receita, ECharts local, visual híbrido.
- `.planning/REQUIREMENTS.md` — requisitos `RES-01`..`RES-04`.
- `.planning/ROADMAP.md` — objetivo e critérios de sucesso da Fase 8.
- `.planning/STATE.md` — riscos conhecidos (pipeline, totais em planilhas).
- `.planning/phases/04-normaliza-o-estado-e-tabelas/04-CONTEXT.md` — filtros globais, campos derivados, período cross-domain.
- `.planning/phases/05-dashboard-executivo/05-CONTEXT.md` — KPIs/gráficos existentes, resultado competência, pipeline isolado.
- `.planning/phases/06-financeiro-e-contas-a-pagar/06-CONTEXT.md` — painel contextual por rota, FLT-03, filtros Resultado = ambos domínios.
- `.planning/phases/07-pedidos-e-receita/07-CONTEXT.md` — escopo exclusivo de pedidos; resultado integrado fora desta fase.

### Design system e UX
- `docs/DESIGN.md` — layout híbrido; Resultado mais visual que operacional.
- `docs/TOKENS.md` — tokens, chart colors, densidade.
- `docs/UX.md` — filtros, estados vazios, feedback.
- `docs/COMPONENTS.md` — metric cards compactos (máx. 4/linha), blocos temáticos.
- `docs/TABLES.md` — densidade (se tabelas auxiliares forem incluídas).

### Regras de negócio e métricas
- `docs/resume.md` §Página 7 — KPIs, gráficos e duas visões obrigatórias (competência e caixa).
- `docs/resume.md` §7 — fórmulas: resultado competência, resultado caixa, ticket médio, cobertura, break-even.
- `docs/resume.md` §3.1 — `situacao_grupo` e exclusão de pipeline da receita.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/metrics.js` — `computeExecutiveKpis`, `aggregateRevenueExpenseByMonth`, `aggregateReceivedPendingByMonth`, `isDespesaFixa`, `monthKeyFromPedido`, `monthKeyFromConta`; base para competência e caixa.
- `js/charts.js` — padrão `renderExecutiveCharts` / `renderFinanceCharts` / `renderPedidosCharts` com ECharts, tema, dispose.
- `js/filters.js` — FLT-02/FLT-03 completos; `renderFilterPanelContent` contextual por rota.
- `js/app.js` — rota `resultado` com empty state genérico (sem `render` dedicado); `ANALYTICAL_ROUTES` já inclui `resultado`.
- `css/app.css` — metric blocks, chart grid, padrões das Fases 5–7.

### Established Patterns
- Páginas analíticas = `render*Page` + KPI blocks + chart grid + dispose on route change.
- Filtros globais colapsáveis; chips ativos; re-render ao alterar `filterState`.
- Receita ativa exclui pipeline e cancelados; agregações mensais já existem para Executivo.

### Integration Points
- Novo `renderResultadoPage` registrado na rota `resultado`.
- Extensão `MoldeMetrics` com KPIs de caixa, posição operacional, projeção acumulada, break-even.
- Extensão `MoldeCharts` com `renderResultadoCharts` (6 instâncias incl. waterfall e área).
- Painel de filtros: expandir `renderFilterPanelContent` para rota `resultado` (FLT-02 + FLT-03).
- Toggle Cadastro|Entrega em `filterState` afetando agregações do bloco Competência.

</code_context>

<specifics>
## Specific Ideas

- Página descrita em `docs/resume.md` como "a visão mais importante para gestão" — comparar se o mês "se paga" (competência) vs dinheiro real movimentado (caixa).
- Toggle Cadastro|Entrega reflete ambiguidade da planilha ("Receita por Data de cadastro ou Data entregue").
- Break-even como contagem de pedidos ("Pedidos para equilíbrio: N") é mais acionável que valor em R$.

</specifics>

<deferred>
## Deferred Ideas

- Tabelas de reconciliação competência vs caixa linha a linha — fora do escopo discutido; foco KPIs + gráficos.
- Bloco Pipeline na página Resultado — permanece no Executivo/Pedidos.
- Insights automáticos e alertas — Fase 9.
- Filtros avançados (clique em gráfico filtra dashboard, salvar visão) — backlog `docs/resume.md` §Filtros avançados.

</deferred>

---

*Phase: 08-resultado-integrado*
*Context gathered: 2026-07-08*
