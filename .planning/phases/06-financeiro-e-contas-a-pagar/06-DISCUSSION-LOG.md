# Phase 6: Financeiro e Contas a Pagar - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 06-financeiro-e-contas-a-pagar
**Areas discussed:** KPIs, Gráficos, Filtros, Tabelas

---

## KPIs financeiros

| Option | Description | Selected |
|--------|-------------|----------|
| Conjunto completo (12 KPIs) | Alinha com resume.md §Página 3 | ✓ |
| Mínimo FIN-01 (8 KPIs) | Só total, pago, aberto, vencido, hoje, 7d, 30d | |
| Híbrido (10 KPIs) | FIN-01 + média + % fixas/variáveis | |

| Option | Description | Selected |
|--------|-------------|----------|
| 3 blocos temáticos | Posição (4) + Vencimentos (3) + Análise (5) | ✓ |
| 2 blocos | Posição (7) + Composição (5) | |
| Grade única | 12 cards sem títulos de bloco | |

| Option | Description | Selected |
|--------|-------------|----------|
| Nome + valor | Fornecedor/classificação em destaque + valor | ✓ |
| Só valor | Montante com nome em tooltip | |
| Mini-ranking | Top 3 dentro do card | |

| Option | Description | Selected |
|--------|-------------|----------|
| Soma em R$ | Consistente com Executivo | ✓ |
| Quantidade de contas | Número de lançamentos | |
| Duplo | Valor + contagem no subtítulo | |

**User's choice:** 12 KPIs completos, 3 blocos, nome+valor nos tops, vencimentos em R$.

---

## Gráficos

| Option | Description | Selected |
|--------|-------------|----------|
| Conjunto completo (10) | resume.md §Página 3 incluindo ABC e evolução fixas/variáveis | ✓ |
| Mínimo FIN-02 (7) | Sem ABC nem linhas fixas/variáveis separadas | |
| Híbrido (8) | FIN-02 + ABC Pareto | |

| Option | Description | Selected |
|--------|-------------|----------|
| Grade 2 colunas | Espelha Executivo; heatmap linha inteira | ✓ |
| Seções temáticas | Blocos Evolução/Composição/Fornecedores/Vencimentos | |
| Abas de gráficos | Reduz scroll | |

| Option | Description | Selected |
|--------|-------------|----------|
| Heatmap mês × dia | Dias 1-31 × meses do filtro | ✓ |
| Semana × dia da semana | Calendário genérico | |
| Só mês corrente | Um calendário mensal | |

| Option | Description | Selected |
|--------|-------------|----------|
| ABC top 15 | Pareto com "Outros" | ✓ |
| ABC top 10 | Mais legível em telas menores | |
| Todos fornecedores | Sem limite | |

**User's choice:** 10 gráficos, grade 2 col, heatmap mês×dia, ABC top 15.

---

## Filtros

| Option | Description | Selected |
|--------|-------------|----------|
| Só páginas analíticas | Ocultar em Upload e Base de Dados | ✓ |
| Executivo + Financeiro only | Escopo mínimo | |
| Barra contextual por rota | Filtros pedidos OU contas | |

| Option | Description | Selected |
|--------|-------------|----------|
| Painel contextual por rota | Financeiro = contas; Executivo = mix; Resultado = ambos | ✓ |
| Painel compartilhado expandido | Mesmos filtros em todas analíticas | |
| Manter painel atual | Só refatorar visibilidade | |

**User's choice (free text):** "refatorar filtros... não faz sentido ter filtro em todas as páginas, inclusive no upload."

---

## Tabelas de exceção

| Option | Description | Selected |
|--------|-------------|----------|
| FIN-03 completo (6 tabelas) | Sem fornecedores recorrentes | ✓ |
| Resume completo (7) | + fornecedores recorrentes | |
| Você decide | FIN-03 mínimo padrão Executivo | |

| Option | Description | Selected |
|--------|-------------|----------|
| Grade 2 colunas | 6 tabelas em 2×3 | ✓ |
| Lista vertical | Largura total | |
| Abas de exceção | Agrupadas por tema | |

| Option | Description | Selected |
|--------|-------------|----------|
| Scroll virtual | Todas linhas filtradas; retrofit Executivo | ✓ |
| 10 linhas | Padrão Executivo atual | |
| 25 linhas | Mais operacional | |

| Option | Description | Selected |
|--------|-------------|----------|
| Colunas padrão | fornecedor, vencimento, valor, status + extras | ✓ |
| Colunas completas | Todas colunas de negócio | |
| Mínimo | fornecedor, vencimento, valor | |

**User's choice (free text):** "scroll virtual... mude o executivo pra isso tb"

---

## the agent's Discretion

- Tipos exatos de gráficos ECharts, alturas, microcopy, ordem das tabelas na grade.
- Detalhes de fórmulas não discutidos explicitamente (média mensal, % fixas) inferidos do resume.md e `metrics.js`.

## Deferred Ideas

- Fornecedores recorrentes (tabela resume.md)
- Filtro por clique em gráfico, salvar visão
- Drill-down para Base de Dados
