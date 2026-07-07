# Phase 1: Fundação Estática e Design System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-07
**Phase:** 01-Fundação Estática e Design System
**Areas discussed:** Shell e navegação principal, Tela inicial e estados vazios, Densidade visual e componentes base, Inventário de páginas e nomes no menu, Responsividade e tema

---

## Shell e navegação principal

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar fixa + topbar | Modelo recomendado pelos documentos de design | ✓ |
| Topbar única com abas/seções | Navegação mais simples, menos alinhada ao ERP denso | |
| Sidebar no desktop e menu compacto no mobile | Híbrido mais responsivo desde o início | |

**User's choice:** Sidebar fixa + topbar.
**Notes:** A rota inicial deve ser Upload e Validação; navegação por hash routes; topbar com busca placeholder/desabilitada, status local e ações globais.

---

## Tela inicial e estados vazios

| Option | Description | Selected |
|--------|-------------|----------|
| Três cards de planilha | Cards para Pedidos, Contas a Pagar e Indicadores/Metas opcional | ✓ |
| Painel central único | Estado vazio mais simples | |
| Prévia do dashboard | Mais visual, mas poderia sugerir dados inexistentes | |

**User's choice:** Três cards de planilha com CTA e estado indisponível/pendente.
**Notes:** Copy operacional e direta; indicadores/metas opcional; ações futuras visíveis e desabilitadas com nota de próxima fase.

---

## Densidade visual e componentes base

| Option | Description | Selected |
|--------|-------------|----------|
| Navegação default e áreas operacionais compactas | Equilibra clareza no shell e densidade em tabelas/cards | ✓ |
| Compacto em toda a aplicação | Mais denso, com risco de parecer apertado | |
| Mais confortável agora, compactar depois | Mais simples visualmente, menos fiel ao design system | |

**User's choice:** Navegação default e áreas operacionais compactas.
**Notes:** Entregar cards, botões, inputs, badges, tabelas, filtros fake e empty states. O usuário mencionou usar as planilhas; isso foi redirecionado para Fase 2 como leitura real de XLSX. Tema escolhido: light e dark mode com alternância funcional.

---

## Inventário de páginas e nomes no menu

| Option | Description | Selected |
|--------|-------------|----------|
| Todas as páginas planejadas | Upload, Executivo, Financeiro, Pedidos, Resultado, Insights, Base de Dados, Metas | ✓ |
| Somente páginas base | Menos itens, menor visão do sistema completo | |
| Somente Upload e Dashboard | Mínimo para a fase, mas pouco representativo do produto | |

**User's choice:** Todas as páginas planejadas.
**Notes:** Agrupar em Início, Análises, Operação e Sistema; páginas futuras clicáveis com empty states; rótulos em português de negócio.

---

## Responsividade e tema

| Option | Description | Selected |
|--------|-------------|----------|
| Desktop-first com tablet utilizável e mobile básico | Escopo equilibrado para a fundação | ✓ |
| Mobile completo com sidebar em drawer | Mais completo, maior esforço para Fase 1 | |
| Apenas desktop nesta fase | Mais simples, mas deixa lacuna visual | |

**User's choice:** Desktop-first com tablet utilizável e mobile básico.
**Notes:** Sidebar colapsa em tablet e vira overlay no mobile. Toggle de tema fica na topbar, persiste em `localStorage` e usa preferência do sistema como padrão. Dark mode deve cobrir tokens e componentes base completos.

---

## the agent's Discretion

- Nomes internos de classes CSS e organização exata do JS mínimo.
- Microcopy final dos empty states, desde que operacional, pt-BR e sem prometer importação real.
- Detalhes de implementação da sidebar colapsada/overlay, mantendo os comportamentos decididos.

## Deferred Ideas

- Leitura real das planilhas XLSX — Fase 2.
