# Phase 7: Pedidos e Receita - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 7-Pedidos e Receita
**Areas discussed:** KPIs e blocos visuais, Gráficos e layout, Tabelas de exceção, Filtros contextuais

---

## KPIs e blocos visuais

| Option | Description | Selected |
|--------|-------------|----------|
| Conjunto completo (15 KPIs) | Alinha com resume.md §Página 4 e padrão Fases 5/6 | ✓ |
| Núcleo ORD-01 apenas | ~10 KPIs essenciais | |
| Você decide | Executor equilibra resume e ORD-01 | |

**User's choice:** Conjunto completo (15 KPIs)

| Option | Description | Selected |
|--------|-------------|----------|
| 4 blocos temáticos | Valores (6) · Status (4) · Pipeline (1) · Prazos (4) | ✓ |
| 3 blocos | Valores+ticket (8) · Status (4) · Prazos+pipeline (3) | |
| Grade única | 15 cards sem títulos de bloco | |

**User's choice:** 4 blocos temáticos

| Option | Description | Selected |
|--------|-------------|----------|
| Bloco isolado com acento warning | Igual Executivo; subtítulo "Não contabilizado na receita" | ✓ |
| Dentro do bloco Status | Junto com entregues, cancelados e ativos | |
| Sem KPI de pipeline | Só gráfico de situação mostra orçamento | |

**User's choice:** Bloco isolado com acento warning

| Option | Description | Selected |
|--------|-------------|----------|
| Valores sobre receita ativa | Exclui cancelados e pipeline | ✓ |
| Valores sobre não cancelados | Inclui pipeline | |
| Valores sobre todos os pedidos | Inclui cancelados e pipeline | |

**User's choice:** Valores sobre receita ativa

| Option | Description | Selected |
|--------|-------------|----------|
| Só pedidos entregues | Médias conforme resume.md §7 | |
| Todo o conjunto filtrado | Inclui pedidos em aberto | |
| Você decide | Executor define tratamento de null | ✓ |

**User's choice:** Você decide (prazo metrics)

---

## Gráficos e layout

| Option | Description | Selected |
|--------|-------------|----------|
| Conjunto completo (12 gráficos) | resume.md §Página 4; grade 2 colunas | ✓ |
| Núcleo ORD-02 (~9) | Sem histograma nem tempo médio produção | |
| Você decide | Executor equilibra resume e ORD-02 | |

**User's choice:** Conjunto completo (12 gráficos)

| Option | Description | Selected |
|--------|-------------|----------|
| Grade 2 colunas | Igual Financeiro/Executivo | ✓ |
| Grade mista | Funil + histograma em span 2 colunas | |
| Coluna única | Todos empilhados | |

**User's choice:** Grade 2 colunas

| Option | Description | Selected |
|--------|-------------|----------|
| Receita ativa apenas | Pipeline só no funil de situação | |
| Séries separadas | Receita ativa + pipeline no mesmo gráfico | |
| Você decide | Executor escolhe por gráfico | ✓ |

**User's choice:** Você decide (chart revenue)

---

## Tabelas de exceção

| Option | Description | Selected |
|--------|-------------|----------|
| 6 tabelas de exceção | Padrão Financeiro; atrasados, pendência, sem cliente, etc. | ✓ |
| 3 tabelas essenciais | Atrasados, pendência em entregues, sem cliente | |
| Sem tabelas | Só KPIs + gráficos; exceções na Fase 9 | |

**User's choice:** 6 tabelas de exceção

---

## Filtros contextuais

| Option | Description | Selected |
|--------|-------------|----------|
| FLT-02 completo | Todos os filtros de pedidos + globais | ✓ |
| Núcleo FLT-02 | Situação, vendedor, cliente, pendente + globais | |
| Igual Executivo | Só situação, vendedor, cliente | |

**User's choice:** FLT-02 completo

---

## the agent's Discretion

- Critério de métricas de prazo (tempo médio, atraso, % no prazo) — usuário delegou ao executor
- Tratamento de receita vs pipeline por gráfico — usuário delegou ao executor

## Deferred Ideas

- Clientes/Vendedores dedicados — Fase 9
- Produção e Prazo dedicado — Fase 9
- Insights automáticos — Fase 9
