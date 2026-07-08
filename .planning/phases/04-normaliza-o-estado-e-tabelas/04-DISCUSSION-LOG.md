# Phase 4: Normalização, Estado e Tabelas - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 4-Normalização, Estado e Tabelas
**Areas discussed:** Momento da normalização e persistência; Campos derivados; Escopo dos filtros; Experiência das tabelas

---

## Sessão 1 — Momento da normalização e persistência

| Question | Selected |
|----------|----------|
| Quando normalizar? | Automaticamente após validação bem-sucedida |
| Substituir planilha? | Re-normalizar automaticamente |
| Persistência? | IndexedDB dataset completo + metadados |
| Reabrir app? | Restaurar e ir para `#executivo` |

---

## Sessão 2 — Campos derivados

### Situações de pedido fora da tabela padrão

| Option | Selected |
|--------|----------|
| Mapeamento estrito → "Sem status" + alerta | ✓ |
| Match tolerante (fuzzy) | |
| Manter original como grupo | |

### status_financeiro

| Option | Selected |
|--------|----------|
| Três estados (Quitado/Parcial/Pendente) | |
| Quatro estados com Inconsistente | |
| Você decide | ✓ |

**Resolved:** executor usa Quitado / Parcial / Pendente.

### Prazo e atraso para pedidos não entregues

| Option | Selected |
|--------|----------|
| Regras resume.md §7; em aberto neutro | ✓ |
| Atraso projetado com data de hoje | |
| Dois campos (real + projetado) | |

### Classificação de indicadores

| Option | Selected |
|--------|----------|
| Catálogo fixo + DADOS_PBI | ✓ |
| Só planilha | |
| Calcular tudo possível | |

---

## Sessão 2 — Escopo dos filtros

### Onde os filtros aparecem

| Option | Selected |
|--------|----------|
| Painel global na topbar + específicos na Base de Dados | ✓ |
| Só Base de Dados nesta fase | |
| Barra lateral fixa | |

### Páginas com filtros funcionais

| Option | Selected |
|--------|----------|
| Visíveis em todas; dados reais só na Base de Dados | ✓ |
| Só Base de Dados e Upload | |
| Todas reagem mesmo com placeholders | |

### Campo de data do período

| Option | Selected |
|--------|----------|
| Contextual (cadastro / vencimento / aba ativa) | ✓ |
| Sempre cadastro/competência | |
| Usuário escolhe campo | |

### Filtros categóricos

| Option | Selected |
|--------|----------|
| Seleção única + chips | |
| Multi-seleção nesta fase | ✓ |
| Autocomplete por texto | |

---

## Sessão 2 — Experiência das tabelas

### Organização na Base de Dados

| Option | Selected |
|--------|----------|
| Abas Pedidos \| Contas \| Indicadores | ✓ |
| Accordion empilhado | |
| Tabela única com coluna Origem | |

### Colunas visíveis por padrão

| Option | Selected |
|--------|----------|
| Negócio principal; técnicos ocultos | ✓ |
| Todas as colunas | |
| Mínimo operacional | |

### Paginação

| Option | Selected |
|--------|----------|
| 25/50/100 clássica | |
| 50 padrão | |
| Scroll virtual | ✓ |

### Destaque de inconsistências (TBL-02)

| Option | Selected |
|--------|----------|
| Fundo sutil + badge na coluna status/id | ✓ |
| Ícone com tooltip | |
| Aba/filtro "Só inconsistências" | |

---

## the agent's Discretion

- status_financeiro: Quitado / Parcial / Pendente
- Schema IndexedDB, módulos internos, colunas técnicas ocultas, implementação do virtual scroll, CSV

## Deferred Ideas

- KPIs/gráficos (Fases 5–9), salvar visão (v2), filtro por gráfico (v2), insights (Fase 9)
