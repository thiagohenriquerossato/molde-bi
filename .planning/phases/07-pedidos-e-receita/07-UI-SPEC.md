---
phase: 07
slug: pedidos-e-receita
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-08
---

# Phase 07 — UI Design Contract

> Contrato visual e de interação da página operacional Pedidos / Receita.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | static HTML/CSS/JavaScript |
| Component library | none |
| Density | KPI cards compactos (`docs/COMPONENTS.md`, máx. 4/linha, <120px) |
| Tables | densas + scroll virtual (`docs/TABLES.md`) |
| Charts | ECharts, paleta dessaturada `docs/TOKENS.md` |
| Tokens | reusar `css/app.css` |

Layout operacional table-first (`docs/DESIGN.md`): KPIs no topo, gráficos de apoio, tabelas de exceção protagonistas. Sem gradientes, sem gráficos decorativos, sem hero cards. Pipeline nunca aparece como receita realizada nos blocos Valores nem em gráficos de receita.

---

## Page Structure (`#pedidos`)

Stack vertical quando `hasDataset()` e há pedidos importados (`appState.dataset.pedidos.length > 0`):

1. `page-header` (padrão existente, badge "Dados carregados")
2. **Blocos de KPI** (4 seções com título: Valores, Status, Pipeline, Prazos)
3. **Grade de gráficos** `.pedidos-charts-grid` (2 colunas desktop, 1 mobile/tablet)
4. **Grade de tabelas de exceção** `.pedidos-tables-grid` (2 colunas × 3 linhas desktop; scroll virtual)

Se sem pedidos: `renderEmptyPage(route)` existente.

Ordem dos blocos KPI (topo → base):

```text
Valores   → 6 cards (receita ativa apenas)
Status    → 4 cards (conjunto filtrado completo)
Pipeline  → 1 card isolado com acento warning
Prazos    → 4 cards (métricas de prazo/desconto)
```

---

## KPI Blocks (ORD-01)

Reusar `renderMetricBlock` + `renderMetricCard` do `app.js`. Valores monetários: `Intl.NumberFormat pt-BR` currency, `tabular-nums`. Percentuais: `NN,N%` (1 casa, pt-BR).

### Valores (6 cards — receita ativa)

Somente pedidos com `situacao_grupo` em grupos aprovados/ativos/entregues; **exclui** cancelados e pipeline.

| Card | Chave sugerida | Formato |
|------|----------------|---------|
| Valor bruto | `valorBruto` | R$ |
| Descontos | `descontos` | R$ |
| Valor final | `valorFinal` | R$ |
| Valor pago | `valorPago` | R$ |
| Valor pendente | `valorPendente` | R$ |
| Ticket médio | `ticketMedio` | R$ |

Ticket médio = `valor_final` / quantidade de pedidos de receita ativa no filtro.

### Status (4 cards — conjunto filtrado completo)

| Card | Chave sugerida | Filtro `situacao_grupo` |
|------|----------------|-------------------------|
| Total de pedidos | `totalPedidos` | todos no recorte |
| Pedidos entregues | `pedidosEntregues` | `Entregue` |
| Pedidos cancelados | `pedidosCancelados` | `Perdido / cancelado` |
| Pedidos ativos | `pedidosAtivos` | `Pedido ativo` |

### Pipeline (1 card — bloco isolado warning)

Ver seção **Pipeline block visual** abaixo.

### Prazos (4 cards)

Default: cálculos sobre pedidos **entregues** com campos de prazo válidos; pedidos em aberto ou sem datas não entram no denominador.

| Card | Chave sugerida | Formato |
|------|----------------|---------|
| Desconto médio | `descontoMedio` | % ou R$ (legível) |
| Tempo médio de produção | `tempoMedioProducao` | dias (ex.: `12,3 dias`) |
| Atraso médio | `atrasoMedio` | dias |
| Percentual entregue no prazo | `percentualNoPrazo` | % |

`% entregue no prazo` = entregues com `entregue_no_prazo === true` / total de entregues com data prevista e entrega válidas × 100.

---

## Pipeline Block Visual (ORD-03 / D-05)

Bloco **isolado** entre Status e Prazos, reutilizando padrão Executivo (D-08/D-09 Fase 5):

- Wrapper `.metric-block.metric-block--pipeline` via `renderMetricBlock(title, cards, { pipeline: true })`
- Card `.metric-card.metric-card--warning`
- Título do bloco: `Pipeline`
- Label do card: `Pedidos aguardando aprovação`
- Badge `.metric-card-badge`: `Não contabilizado na receita`
- Valor principal: contagem de pedidos (`situacao_grupo === "Pipeline / orçamento"`)
- Subtitle opcional `.metric-card-subtitle`: valor total em R$ (`N pedidos · R$ X`)

Markup de referência:

```html
<section class="metric-block metric-block--pipeline">
  <h2 class="metric-block-title">Pipeline</h2>
  <div class="metric-grid">
    <article class="metric-card metric-card--warning">
      <p class="metric-card-label">Pedidos aguardando aprovação</p>
      <p class="metric-card-value" data-metric="pipelineCount">0</p>
      <span class="metric-card-badge">Não contabilizado na receita</span>
      <span class="metric-card-subtitle" data-metric="pipelineSubtitle">0 pedidos · R$ 0,00</span>
    </article>
  </div>
</section>
```

CSS existente em `css/app.css`: `.metric-block--pipeline`, `.metric-card--warning`, `.metric-card-badge`. **Não** somar pipeline nos cards do bloco Valores.

---

## Charts Grid (ORD-02)

Container `.pedidos-charts-grid` (2 colunas desktop). Painéis `.chart-panel` com `h3.chart-panel-title` + `div.chart-canvas`. Todos os 12 gráficos ocupam span 1 (sem wide panels nesta fase). Canvas min-height 280px.

| `data-chart` | Título | Tipo sugerido |
|--------------|--------|---------------|
| `revenue-month` | Receita por mês | coluna ou linha |
| `orders-month` | Pedidos por mês | coluna |
| `ticket-month` | Ticket médio por mês | linha |
| `orders-situation` | Pedidos por situação | funil |
| `revenue-vendor` | Receita por vendedor | barras horizontais |
| `orders-vendor` | Pedidos por vendedor | barras |
| `pending-status` | Valor pendente por status | barras empilhadas |
| `discount-month` | Desconto por mês | linha |
| `top-clients` | Top clientes por valor | barras horizontais |
| `on-time-delivery` | Entregues no prazo × atrasados | rosca |
| `production-time-month` | Tempo médio de produção por mês | linha |
| `ticket-distribution` | Distribuição de ticket | histograma |

Regras visuais:

- Gráficos de receita (`revenue-month`, `revenue-vendor`, `top-clients`, `ticket-month`, `ticket-distribution`) usam **receita ativa** por padrão.
- `orders-situation` exibe `situacao_grupo` com pipeline como grupo próprio, cor/visual distinto.
- Locale pt-BR, paleta `docs/TOKENS.md`, sem gradientes decorativos.
- `resize` / `dispose` ao trocar rota (padrão `renderFinanceCharts`).

CSS a adicionar (espelho de `.finance-charts-grid`):

```css
.pedidos-charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}
```

Incluir `.pedidos-charts-grid` no breakpoint tablet/mobile junto com `.finance-charts-grid`.

---

## Exception Tables (D-17..D-20)

Container `.pedidos-tables-grid` (2 colunas). Cada tabela em `article.card` com `h3.chart-panel-title` + host `div[data-ped-table="..."]` para scroll virtual.

Ordem (grade 2×3):

| `data-ped-table` | Título | Critério / ordenação |
|------------------|--------|----------------------|
| `overdue` | Pedidos atrasados | `entregue_no_prazo === false`; `dias_atraso` desc |
| `delivered-pending` | Entregues com valor pendente | `situacao_grupo === "Entregue"` e `valor_pendente > 0` |
| `no-client` | Sem cliente | `cliente` vazio ou não identificado |
| `no-forecast` | Sem data prevista | `data_prevista` ausente |
| `high-discount` | Desconto alto | limiar ≥ 20% do valor bruto (ou top percentil) |
| `pipeline-approval` | Pipeline em aprovação | `situacao_grupo === "Pipeline / orçamento"`; `data_cadastro` asc |

Colunas base: **Pedido, Cliente, Vendedor, Situação, Valor final, Valor pendente**. Extras por tabela:

| Tabela | Colunas extras |
|--------|----------------|
| `overdue` | `dias_atraso` |
| `no-forecast` | `data_prevista` |
| `high-discount` | `% desconto` |
| `pipeline-approval` | `data_cadastro` |

Scroll virtual via `MoldeTables.renderVirtualTable` — sem limite fixo de linhas. Badges semânticos por `situacao_grupo` e `status_financeiro` (`docs/TABLES.md`). Empty state por tabela quando vazia (`p.executive-exception-empty`).

CSS a adicionar (espelho de `.finance-tables-grid`):

```css
.pedidos-tables-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}
```

---

## Filter Behavior (FLT-02)

- Painel de filtros **oculto** em `#upload` e `#base-dados`.
- Painel **visível** em rotas analíticas (executivo, financeiro, **pedidos**, resultado, insights).
- Na rota **`pedidos`**, conteúdo **FLT-02 completo** via `renderPedidoFilters(pedidos)` — substituir fallback executivo em `renderFilterPanelContent`.
- Alterar qualquer filtro re-renderiza KPIs, gráficos e tabelas da página Pedidos sem reload.
- Chips de filtro ativo permanecem visíveis.
- Período em pedidos por `data_cadastro` / `mes_cadastro`.
- Busca global (topbar) e faixa de valor aplicam-se a pedidos nesta rota.

### Campos do painel FLT-02 (rota `pedidos`)

**Globais** (reusar `renderPeriodFilterFields` + campos de valor):

| Campo UI | Chave `filterState` |
|----------|---------------------|
| Ano | `year` |
| Mês | `month` |
| Período de | `periodFrom` |
| Período até | `periodTo` |
| Valor mínimo | `valueMin` |
| Valor máximo | `valueMax` |

**Pedidos — dropdowns multi-seleção** (`renderFilterDropdown("pedidos", ...)`):

| Label UI | Campo | Chave `filterState.pedidos` |
|----------|-------|----------------------------|
| Situação | `situacao` | `situacao` |
| Grupo | `situacao_grupo` | `situacaoGrupo` |
| Vendedor | `vendedor` | `vendedor` |
| Cliente | `cliente` | `cliente` |
| Forma pagamento entrada | `forma_entrada` | `formaEntrada` |
| Forma pagamento saldo | `forma_saldo` | `formaSaldo` |

**Pedidos — toggles** (`data-filter-toggle-flag` ou padrão pedidos equivalente ao financeiro):

| Label UI | Chave `filterState.pedidos` |
|----------|----------------------------|
| Com valor pendente | `comPendente` |
| Sem cliente | `semCliente` |
| Sem data prevista | `semDataPrevista` |
| Entregue no prazo | `entregueNoPrazo` |
| Atrasado | `atrasado` |
| Cancelado | `cancelado` |
| Aguardando aprovação | `aguardandoAprovacao` |

Estrutura sugerida do painel:

```text
filter-panel-grid
  ├── renderPeriodFilterFields()
  ├── fieldset "Pedidos"
  │     ├── dropdowns (6)
  │     └── filter-toggle-grid (7 toggles)
  └── filter-panel-actions → Limpar filtros
```

**Não** incluir filtros de contas na rota Pedidos — KPIs e gráficos são somente de pedidos.

---

## Responsive

| Breakpoint | KPI grid | Charts | Tabelas |
|------------|----------|--------|---------|
| Desktop ≥1024 | 4 cols | 2 cols | 2 cols |
| Tablet 768–1023 | 2 cols | 1 col | 1 col |
| Mobile <768 | 1 col | 1 col | 1 col |

Bloco Pipeline mantém card único; em mobile o card ocupa largura total dentro do bloco warning.

---

## Accessibility

- Canvas de gráfico com `role="img"` + `aria-label` descritivo (título do painel).
- Cards: label antes do valor; badge pipeline legível por leitor de tela.
- Tabelas: `thead`/`tbody`, `scope` nos headers (herda de `renderVirtualTable`).
- Blocos com títulos `h2`/`h3` semânticos.
- Seções `.pedidos-charts-grid` e `.pedidos-tables-grid` com `aria-label` descritivo.
