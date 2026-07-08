# Phase 5: Dashboard Executivo - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 5-Dashboard Executivo
**Areas discussed:** KPIs e hierarquia visual, Pipeline vs receita (parcial), Gráficos (pergunta ignorada)

---

## KPIs e hierarquia visual

| Option | Description | Selected |
|--------|-------------|----------|
| Núcleo EXE-01 (8 KPIs) | receita ativa, recebido, pendente, despesas, vencidas, resultado, ticket, pedidos | |
| Expandido resume.md (12 KPIs) | núcleo + despesas pagas/abertas + pedidos entregues + pipeline | ✓ |
| Em camadas | 4 hero + segunda faixa com scroll | |
| Você decide | priorizar legibilidade e pipeline ≠ receita | |

**User's choice:** Expandido resume.md (12 KPIs)

| Option | Description | Selected |
|--------|-------------|----------|
| Blocos temáticos | Receita \| Despesas \| Resultado/Pedidos \| Pipeline | |
| Grade única 4×3 | sem separação por tema | |
| Prioridade por linha | receita na linha 1, despesas linha 2, etc. | |
| Você decide | seguir COMPONENTS.md | ✓ |

**User's choice:** Você decide → executor adota blocos temáticos (capturado em D-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Resultado competência + ticket geral | alinhado ao escopo executivo | |
| Dois resultados (competência + caixa) | antecipa Fase 8 | |
| Resultado competência + ticket fechados | | |
| Você decide | combinação mais útil | ✓ |

**User's choice:** Você decide → competência + ticket médio geral (D-05, D-06)

| Option | Description | Selected |
|--------|-------------|----------|
| Bloco Pipeline isolado | badge "Orçamento", nota explicativa | |
| Inline muted na grade receita | tooltip | |
| Faixa banner fixa | pipeline fora dos cards | |
| Você decide | máxima clareza | ✓ |

**User's choice:** Você decide → bloco isolado com acento warning (D-08, D-09)

---

## Pipeline vs receita

| Option | Description | Selected |
|--------|-------------|----------|
| Bloco Pipeline isolado | seção própria abaixo de Receita | |
| Mesma faixa muted | card warning ao lado | |
| Painel lateral callout | summary panel | |
| Você decide | máxima clareza | ✓ |

**User's choice:** Você decide → bloco isolado (D-08)

| Option | Description | Selected |
|--------|-------------|----------|
| Copy explícita | "Pipeline (orçamento)" + "Não contabilizado na receita" | |
| Badge semântico | label curto + badge warning | |
| Tooltip | label neutro + hover | |
| Você decide | pt-BR claro | ✓ |

**User's choice:** Você decide → copy explícita (D-09)

| Option | Description | Selected |
|--------|-------------|----------|
| Receita = só receita ativa | pipeline em card separado | |
| Dois cards receita | ativa + potencial | |
| Um card com nota | receita total excluindo pipeline | |
| Você decide | seguir resume.md §7 | ✓ |

**User's choice:** Você decide → receita ativa apenas (D-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Excluir pipeline de gráficos de receita | só KPI dedicado + status chart | |
| Série separada | ativa vs pipeline no mesmo gráfico | |
| Só no gráfico de status | não em receita mensal | |
| Você decide | evitar inflar receita | ✓ |

**User's choice:** Você decide → excluir de receita mensal; pipeline no status chart (D-10, D-11, D-15)

---

## Gráficos e layout

**Nota:** Usuário selecionou a área mas **ignorou** a pergunta sobre conjunto de gráficos. Decisão registrada pelo executor: conjunto EXE-02 completo (D-12).

---

## the agent's Discretion

Áreas delegadas pelo usuário com defaults fixados no CONTEXT.md:
- Agrupamento visual dos 12 KPIs (blocos temáticos)
- Resultado competência + ticket médio geral
- Posicionamento, labels e exclusão de pipeline em gráficos de receita
- Conjunto completo de gráficos EXE-02
- Listas de exceção, filtros cross-domain e layout de grade (não discutidos — defaults de EXE-03/04 e resume.md)

## Deferred Ideas

- Resultado caixa e gráficos integrados — Fase 8
- Drill-down para Financeiro — fase futura
- Variação % em KPIs — v2
