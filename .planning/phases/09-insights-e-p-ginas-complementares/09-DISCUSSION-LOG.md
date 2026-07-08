# Phase 9: Insights e Páginas Complementares - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 9-Insights e Páginas Complementares
**Areas discussed:** Navegação e rotas, Página Insights (estrutura), Cobertura de alertas

---

## Navegação e rotas

| Option | Description | Selected |
|--------|-------------|----------|
| Duas rotas novas | `#clientes` e `#producao` na sidebar | ✓ (via discrição) |
| Rota única `#gestao` | Abas internas Clientes \| Produção | |
| Subseções em `#pedidos` | Abas dentro de Pedidos | |
| Você decide | Executor escolhe estrutura | ✓ (escolha do usuário) |

| Option | Description | Selected |
|--------|-------------|----------|
| Grupo Operação | Junto com Pedidos, Insights, Base de Dados | ✓ |
| Grupo Análises | Com Executivo, Financeiro, Resultado | |
| Novo grupo Gestão | Separado | |

| Option | Description | Selected |
|--------|-------------|----------|
| Rótulos curtos | "Clientes" e "Produção" na nav | ✓ |
| Rótulos completos | Nomes longos na sidebar | |

| Option | Description | Selected |
|--------|-------------|----------|
| Ordem resume.md | Pedidos → Clientes → Produção → Insights → Base de Dados | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| FLT-02 em ambas | Painel contextual de pedidos em Clientes e Produção | ✓ |

**User's choice:** Duas rotas novas (discrição do executor), grupo Operação, rótulos curtos, ordem resume.md, FLT-02 completo.
**Notes:** Shell atual só tem `#insights` e `#metas`; CLV-01 e PRD-01 exigem novas entradas de nav.

---

## Página Insights — estrutura

| Option | Description | Selected |
|--------|-------------|----------|
| Por categoria primeiro | Financeiro → Comercial → Operacional | ✓ |
| Por severidade primeiro | Crítico → Atenção → Informativo | |
| Lista única | Tabela flat | |

| Option | Description | Selected |
|--------|-------------|----------|
| Cards + tabelas | Card-resumo expansível com detalhes | ✓ |
| Só tabelas | Denso, sem cards | |
| Lista compacta | Linhas com badge | |

| Option | Description | Selected |
|--------|-------------|----------|
| 3 níveis | Crítico, Atenção, Informativo | ✓ |
| 2 níveis | Crítico e Atenção | |
| Severidade fixa por tipo | Pré-definida no código | |

| Option | Description | Selected |
|--------|-------------|----------|
| Faixa KPIs no topo | Total, críticos, por domínio | ✓ |
| Sem KPIs | Direto aos blocos | |

| Option | Description | Selected |
|--------|-------------|----------|
| FLT-02 + FLT-03 | Ambos domínios no painel contextual | ✓ |

**User's choice:** Categoria primeiro, cards+tabelas, 3 severidades, KPI strip, filtros ambos domínios.

---

## Cobertura de alertas

| Option | Description | Selected |
|--------|-------------|----------|
| resume.md completo | ~25 tipos incluindo tendências | ✓ |
| Só REQUIREMENTS | 14 tipos INS-01..03 | |
| REQUIREMENTS + extensões fáceis | Subconjunto intermediário | |

| Option | Description | Selected |
|--------|-------------|----------|
| Mês atual vs anterior | Comparativo MoM para tendências | ✓ |
| vs média histórica | 3–6 meses | |
| Limiares fixos | Sem comparativo temporal | |

| Option | Description | Selected |
|--------|-------------|----------|
| Você decide (limiares) | Defaults sensatos + critério visível no card | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Empty state positivo | "Nenhum alerta ativo" com success | ✓ |

**User's choice:** Escopo completo resume.md, tendências MoM, limiares a critério do executor, empty positivo.

---

## the agent's Discretion

Áreas **não discutidas** interativamente — defaults recomendados no CONTEXT.md:
- **Clientes/Vendedores:** escopo completo resume.md §Página 5 (9 KPIs, 8 gráficos, heatmap).
- **Produção/Prazo:** escopo completo resume.md §Página 6 (10 KPIs, 6 gráficos, aging).
- **Metas/CFG-01:** catálogo por setor, estados calculável/manual/indisponível, sem números inventados.

## Deferred Ideas

- Edição de metas manuais na UI.
- Drill-down automático de alerta para outra rota.
- Filtro por clique em gráfico (v2).
