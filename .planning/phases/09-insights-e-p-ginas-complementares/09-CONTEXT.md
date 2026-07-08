# Phase 9: Insights e Páginas Complementares - Context

**Gathered:** 2026-07-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega quatro superfícies analíticas complementares: página `#insights` com alertas automáticos financeiros, comerciais e operacionais; páginas `#clientes` e `#producao` para análise dedicada de relacionamento comercial e prazos operacionais; e página `#metas` para catálogo de indicadores/metas do workbook opcional. Todas reagem aos filtros já existentes, reutilizam métricas e componentes das Fases 4–8, e **nunca inventam indicadores sem fonte**. Pipeline (`Aguardando Aprovação`) permanece fora de receita e alertas de receita realizada.

</domain>

<decisions>
## Implementation Decisions

### Navegação e rotas
- **D-01:** Adicionar **duas rotas novas** na sidebar: `#clientes` (CLV-01) e `#producao` (PRD-01), com `render` dedicado em `app.js` e links em `index.html`.
- **D-02:** Ambas ficam no grupo **Operação**, na ordem: Pedidos → **Clientes** → **Produção** → Insights → Base de Dados.
- **D-03:** Rótulos curtos na nav: **"Clientes"** e **"Produção"**; títulos completos no `page-header` ("Clientes e Vendedores", "Produção e Prazo").
- **D-04:** `#clientes` e `#producao` usam painel contextual com **FLT-02 completo** (filtros de pedidos), mesmo padrão da rota `#pedidos` (Fase 7).
- **D-05:** Incluir `#clientes` e `#producao` em `ANALYTICAL_ROUTES` e no painel de filtros contextual por rota.

### Página Insights — estrutura e layout
- **D-06:** Agrupamento **por categoria primeiro**: bloco **Financeiro** → **Comercial** → **Operacional**; severidade ordena itens **dentro** de cada bloco.
- **D-07:** Layout híbrido: **card-resumo por tipo de alerta** (título, contagem, badge de severidade) + **tabela expansível** com registros afetados (scroll virtual quando necessário).
- **D-08:** Três níveis de severidade com badges semânticos: **Crítico** (`danger`), **Atenção** (`warning`), **Informativo** (`info`/`neutral`).
- **D-09:** Faixa de **KPIs compactos no topo** (3–4 cards): total de alertas, alertas críticos, alertas financeiros, alertas comerciais/operacionais (split ou agregado conforme densidade).
- **D-10:** Filtros na rota `#insights`: painel contextual com **FLT-02 + FLT-03** (ambos domínios), como `#resultado` (Fase 8 D-21). Alterar filtro re-renderiza KPIs, cards e tabelas.
- **D-11:** Empty state **positivo** quando não há alertas: mensagem "Nenhum alerta ativo" com badge `success`; blocos vazios podem mostrar mensagem por categoria.

### Cobertura e regras de alertas
- **D-12:** Implementar escopo **completo** de `docs/resume.md` §Página 8 — **25 tipos** distribuídos em:
  - **Financeiro (9):** vencidas, vencendo 7 dias, sem valor, sem classificação, pagas sem data pagamento, fornecedor com aumento forte, despesa fixa acima da média, categoria com maior crescimento, mês futuro com concentração alta de vencimentos.
  - **Comercial (9):** aprovação há muitos dias, entregues com pendência, sem cliente, sem vendedor, sem data prevista, desconto alto, cancelados com valor relevante, cliente com alto pendente, vendedor com muitos pendentes.
  - **Operacional (7):** atrasados, entrega antes do cadastro, prontos para entrega há muitos dias, produzindo há muitos dias, queda de ticket médio, aumento de prazo médio de entrega (+ derivados de inconsistência já cobertos).
- **D-13:** Alertas de **tendência/comparativo** (fornecedor em alta, despesa fixa acima da média, categoria em crescimento, queda ticket, aumento prazo) usam **comparativo mês atual vs mês anterior** no conjunto filtrado.
- **D-14:** Limiares temporais e percentuais (dias em aprovação, desconto alto, aging produção, variação % para tendências): **discrição do executor** com defaults sensatos documentados no código; **critério visível** no card do alerta (subtítulo ou tooltip).
- **D-15:** Módulo dedicado `js/insights.js` (ou equivalente) para geração de alertas, separado de `app.js`; reutilizar getters de exceção de `metrics.js` onde já existirem (Fases 6–7).
- **D-16:** Alertas financeiros derivam de contas normalizadas; comerciais/operacionais de pedidos; **pipeline não conta** como receita nem dispara alertas de receita realizada.

### Página Clientes e Vendedores (`#clientes`) — discrição com default recomendado
- **D-17:** Escopo **completo** `docs/resume.md` §Página 5 — **9 KPIs** e **8 gráficos**, incluindo heatmap vendedor × status.
- **D-18:** Layout **operacional** (padrão Fases 6–7): blocos temáticos compactos + gráficos de apoio; sem repetir página Pedidos inteira — foco em rankings, recorrência e pendências por cliente/vendedor.
- **D-19:** KPIs: clientes únicos, recorrentes, novos por mês, top cliente receita/pendência, top vendedor receita/ticket/pedidos/pendência conforme resume.
- **D-20:** Gráficos: receita/ticket/pedidos/pendência por vendedor, top clientes receita/pendência, novos × recorrentes, matriz heatmap vendedor × `situacao_grupo`.

### Página Produção e Prazo (`#producao`) — discrição com default recomendado
- **D-21:** Escopo **completo** `docs/resume.md` §Página 6 — **10 KPIs** e **6 gráficos**.
- **D-22:** Layout operacional; dados **somente de pedidos** (sem planilha de produção separada).
- **D-23:** KPIs: aguardando produzir, produzindo, prontos, entregues, atrasados, tempos médios, % no prazo, sem data prevista/entregue.
- **D-24:** Gráficos: funil operacional, atrasados por mês, tempo médio produção, no prazo × atrasados, **aging** com faixas `0–3`, `4–7`, `8–15`, `16–30`, `>30` dias, pedidos sem previsão por vendedor.
- **D-25:** Usar campos derivados existentes (`dias_producao`, `dias_atraso`, `entregue_no_prazo`, `situacao_grupo`) — não recomputar.

### Página Metas / Configurações (`#metas`, CFG-01) — discrição com default recomendado
- **D-26:** Exibir catálogo da planilha opcional `indicadores_metas` agrupado por **setor** (Financeiro, Comercial, Marketing, Design, Produção, Estoque, RH).
- **D-27:** Três estados por indicador: **Calculável** (valor computado a partir de pedidos/contas), **Manual** (valor do workbook ou entrada futura), **Indisponível / sem base importada** (sem fonte nas planilhas atuais).
- **D-28:** Indicadores calculáveis mostram valor atual + origem; manuais mostram meta do workbook quando existir; indisponíveis **nunca** exibem número inventado.
- **D-29:** Workbook opcional ausente mantém empty state existente; não bloqueia outras páginas.
- **D-30:** Reutilizar/estender `INDICATOR_CATALOG` em `normalizers.js` para classificar calculável vs manual.

### the agent's Discretion
- Implementação exata de rotas/hash (`clientes` vs `clientes-vendedores`) desde que nav e deep links funcionem.
- Severidade pré-atribuída por tipo de alerta (ex.: vencida = crítico, tendência = informativo).
- Valores numéricos dos limiares (dias, % desconto, % variação mês a mês) — documentar defaults no módulo.
- Expansão/colapso default dos cards de alerta (expandido se crítico, colapsado se informativo).
- Tipo ECharts exato por gráfico em Clientes/Produção desde que legível e denso.
- Edição inline de metas manuais — **não obrigatória** nesta fase; leitura do catálogo importado é suficiente para CFG-01.
- Nomes de módulos (`insights.js`, `clientes.js`, `producao.js`, `metas.js`) e extensões em `metrics.js`/`charts.js`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento e escopo
- `.planning/PROJECT.md` — indicadores sem fonte como manual/indisponível; visual híbrido.
- `.planning/REQUIREMENTS.md` — `INS-01`..`INS-03`, `CLV-01`, `PRD-01`, `CFG-01`.
- `.planning/ROADMAP.md` — objetivo e critérios de sucesso da Fase 9.
- `.planning/STATE.md` — riscos (pipeline, indicadores sem fonte).
- `.planning/phases/04-normaliza-o-estado-e-tabelas/04-CONTEXT.md` — filtros FLT-02/FLT-03, campos derivados.
- `.planning/phases/05-dashboard-executivo/05-CONTEXT.md` — pipeline isolado, blocos temáticos.
- `.planning/phases/06-financeiro-e-contas-a-pagar/06-CONTEXT.md` — tabelas de exceção, painel contextual.
- `.planning/phases/07-pedidos-e-receita/07-CONTEXT.md` — escopo Pedidos, overlap deferido para esta fase.
- `.planning/phases/08-resultado-integrado/08-CONTEXT.md` — filtros ambos domínios na rota integrada.

### Design system e UX
- `docs/DESIGN.md` — layout híbrido, densidade operacional vs executiva.
- `docs/TOKENS.md` — badges semânticos danger/warning/info/success.
- `docs/UX.md` — empty states, navegação, filtros globais.
- `docs/COMPONENTS.md` — metric cards, badges, blocos temáticos.
- `docs/TABLES.md` — tabelas compactas e scroll virtual.

### Domínio e regras de negócio
- `docs/resume.md` §Página 5 — Clientes e Vendedores (KPIs, gráficos, heatmap).
- `docs/resume.md` §Página 6 — Produção e Prazo (KPIs, funil, aging).
- `docs/resume.md` §Página 8 — Insights e Alertas (lista completa de 25 tipos).
- `docs/resume.md` §3.3 — tabela `indicadores_metas` e setores do workbook opcional.
- `docs/resume.md` §10 — estrutura ideal de telas e ordem de navegação.

### Código existente
- `index.html` — sidebar e grupos de nav atuais.
- `js/app.js` — rotas, `ANALYTICAL_ROUTES`, stubs `#insights` e `#metas`.
- `js/metrics.js` — agregações de pedidos/contas reutilizáveis.
- `js/charts.js` — padrão ECharts das fases anteriores.
- `js/filters.js` — FLT-02, FLT-03, `filterState`.
- `js/normalizers.js` — `INDICATOR_CATALOG`, campos derivados de pedidos.
- `js/tables.js` — scroll virtual e colunas normalizadas.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Rotas stub `insights` e `metas` em `js/app.js` com empty states prontos — falta `render` e conteúdo analítico.
- `MoldeMetrics` já agrega por vendedor, cliente, produção, pendências (Fases 5–7).
- `MoldeCharts` com funil, barras horizontais, linha, rosca, histograma — reutilizar em Clientes/Produção.
- `MoldeTables` com virtual scroll para detalhes de alertas e rankings.
- `INDICATOR_CATALOG` em `normalizers.js` para classificar indicadores calculáveis vs manuais.
- Tabelas de exceção em Financeiro/Pedidos como referência de padrão para detalhes de alertas.

### Established Patterns
- Páginas operacionais: KPIs compactos em blocos + gráficos + tabelas densas (Fases 6–7).
- Página integrada/insights: blocos temáticos + filtros cross-domain (Fase 8).
- Pipeline nunca misturado com receita realizada.
- Filtros contextuais por rota via `renderFilterPanelContent`.
- Módulos por responsabilidade (`metrics.js`, `charts.js`, página dedicada).

### Integration Points
- `index.html` — adicionar links `#clientes` e `#producao` no grupo Operação.
- `js/app.js` — registrar rotas, renders, `ANALYTICAL_ROUTES`, painel de filtros.
- Novo `js/insights.js` — engine de alertas consumida por `#insights`.
- Extensões em `metrics.js` / `charts.js` para Clientes, Produção e Metas.
- `filterState` — FLT-02 em `#clientes`/`#producao`; FLT-02+FLT-03 em `#insights`.

</code_context>

<specifics>
## Specific Ideas

- Ordem de navegação alinhada a `docs/resume.md` §10 dentro do grupo Operação.
- Insights deve **transformar dados em decisões** — priorizar legibilidade dos alertas sobre gráficos decorativos.
- Empty state de Insights **positivo** quando não há problemas — reforça confiança.
- Clientes/Produção/Metas seguem conjunto completo do resume (padrão escolhido nas Fases 6–7 para páginas dedicadas).

</specifics>

<deferred>
## Deferred Ideas

- Edição/persistência de metas manuais pelo usuário — além da leitura do workbook (v2 ou fase futura).
- Filtro por clique em gráfico — v2 (`docs/resume.md` §5).
- Drill-down de alerta para rota específica (ex.: auto-navegar para Financeiro) — não obrigatório nesta fase.
- Score de saúde do negócio e insights automáticos por mês narrativos — avançados em `docs/resume.md` §6.

</deferred>

---

*Phase: 09-insights-e-paginas-complementares*
*Context gathered: 2026-07-08*
