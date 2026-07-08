# Phase 8: Resultado Integrado - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 8-Resultado Integrado
**Areas discussed:** Competência × Caixa, Posição operacional, Fórmulas de caixa, Base temporal, Filtros Resultado, Overlap Executivo

---

## Competência × Caixa

| Option | Description | Selected |
|--------|-------------|----------|
| Blocos temáticos sequenciais | Seção Competência no topo, Caixa abaixo | ✓ |
| Abas Competência \| Caixa | Uma visão por vez | |
| Duas colunas lado a lado | Competência esquerda, Caixa direita | |

**User's choice:** Blocos temáticos sequenciais
**Notes:** KPIs dentro de cada bloco; gráficos distribuídos por visão; distinção visual sutil (eyebrow + título).

---

## Posição operacional

| Option | Description | Selected |
|--------|-------------|----------|
| Terceiro bloco após Caixa | Sequência Competência → Caixa → Posição operacional | ✓ |
| Primeiro bloco no topo | Snapshot atual antes das visões mensais | |
| Painel lateral fixo | KPIs operacionais à direita | |

**User's choice:** Terceiro bloco após Caixa com 5 KPIs completos, 2 gráficos dedicados, break-even como "Pedidos para equilíbrio: N".

---

## Fórmulas de caixa

| Option | Description | Selected |
|--------|-------------|----------|
| Resultado caixa período filtrado | valor_pago no período − pagas no período | ✓ |
| Saldo = recebíveis − abertas | Snapshot do conjunto filtrado | ✓ |
| Cobertura como razão | Multiplicador recebíveis/contas abertas | ✓ |
| Projeção acumulada | recebido − pago + carry-forward mensal | ✓ |

**User's choice:** Todas as opções recomendadas acima.

---

## Base temporal

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle Cadastro \| Entrega | Default Cadastro; só bloco Competência | ✓ |
| Despesa por vencimento | mes_vencimento | ✓ |
| Caixa entrada valor_pago período | Movimentação no recorte | ✓ |
| Caixa saída data_pagamento | Pagamento real no período | ✓ |

**User's choice:** Toggle para receita na competência; demais bases conforme recomendado.

---

## Filtros Resultado

| Option | Description | Selected |
|--------|-------------|----------|
| FLT-02 + FLT-03 completos | Ambos domínios no painel | ✓ |
| Período cross-domain competência | cadastro/vencimento no recorte | ✓ |
| Caixa por movimentação | valor_pago + data_pagamento | ✓ |
| Toggle só Competência | Caixa e Posição não afetados | ✓ |

**User's choice:** Todas as opções recomendadas.

---

## Overlap Executivo

| Option | Description | Selected |
|--------|-------------|----------|
| Repetição intencional KPIs | Mesmos totais com foco integrado | ✓ |
| 6 gráficos completos | Inclui overlap receita×despesa×resultado | ✓ |
| Sem bloco Pipeline | Pipeline só Executivo/Pedidos | ✓ |
| Tom híbrido integrado | Entre Financeiro e Executivo | ✓ |

**User's choice:** Todas as opções recomendadas.

---

## the agent's Discretion

Toggle persistência, tipo exato de waterfall ECharts, microcopy pt-BR, empty states, módulos de código.

## Deferred Ideas

- Tabelas de reconciliação competência vs caixa
- Bloco Pipeline na página Resultado
- Filtros avançados (salvar visão, clique em gráfico)
