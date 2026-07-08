# Roadmap: Molde Momentos Dashboard Local

**Created:** 2026-07-07
**Granularity:** Fine
**Mode:** YOLO

## Overview

10 phases | 53 requirements mapped | All v1 requirements covered

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Fundação Estática e Design System | Criar shell local e base visual vanilla | FND-01, FND-02, FND-03 | 4 |
| 2 | Vendor e Importação Excel | 2/2 | Complete    | 2026-07-07 |
| 3 | Validação e Regras de Entrada | Validar workbooks, abas, colunas e linhas | IMP-04, IMP-05, VAL-01..VAL-10, NRM-01, NRM-02 | 5 |
| 4 | Normalização, Estado e Tabelas | Criar dados internos, persistência, filtros e tabelas | IMP-06, NRM-03..NRM-06, FLT-01..FLT-05, TBL-01, TBL-02 | 5 |
| 5 | Dashboard Executivo | Entregar visão geral confiável do negócio | EXE-01, EXE-02, EXE-03, EXE-04 | 4 |
| 6 | Financeiro e Contas a Pagar | Entregar análise operacional de despesas | FIN-01, FIN-02, FIN-03 | 4 |
| 7 | Pedidos e Receita | Entregar análise comercial e de produção por pedido | ORD-01, ORD-02, ORD-03 | 4 |
| 8 | Resultado Integrado | Entregar competência, caixa e projeções | RES-01, RES-02, RES-03, RES-04 | 4 |
| 9 | Insights e Páginas Complementares | Entregar alertas, clientes, produção e metas | INS-01, INS-02, INS-03, CLV-01, PRD-01, CFG-01 | 5 |
| 10 | Polimento e Verificação Final | Consolidar responsividade, acessibilidade e uso local | Cross-cutting | 5 |

## Phase Details

### Phase 1: Fundação Estática e Design System

**Status:** Complete — 2026-07-07

**Goal:** Criar a base estática do sistema, com navegação, layout e tokens visuais prontos para receber dados reais.

**Requirements:** FND-01, FND-02, FND-03

**UI hint:** yes

**Success criteria:**
1. `index.html` abre a aplicação sem backend.
2. Sidebar ou top navigation permite acessar todas as páginas planejadas.
3. `css/app.css` implementa tokens, densidade, cards, tabelas, botões, badges e layout base conforme `docs/`.
4. A tela inicial mostra o estado vazio orientando o upload das planilhas.

### Phase 2: Vendor e Importação Excel

**Status:** Complete — 2026-07-07

**Goal:** Permitir seleção e leitura dos arquivos Excel no navegador usando bibliotecas locais.

**Requirements:** FND-04, IMP-01, IMP-02, IMP-03

**UI hint:** yes

**Success criteria:**
1. SheetJS e ECharts ficam disponíveis em `/vendor` ou pasta equivalente local.
2. Usuário seleciona planilha de pedidos e o sistema lê workbook e primeira aba.
3. Usuário seleciona planilha de contas e o sistema lista abas mensais esperadas.
4. Usuário seleciona planilha de indicadores/metas opcional sem bloquear o fluxo.

### Phase 3: Validação e Regras de Entrada

**Goal:** Gerar relatório de validação confiável antes dos dashboards.

**Requirements:** IMP-04, IMP-05, VAL-01, VAL-02, VAL-03, VAL-04, VAL-05, VAL-06, VAL-07, VAL-08, VAL-09, VAL-10, NRM-01, NRM-02

**UI hint:** yes

**Success criteria:**
1. Relatório separa erros críticos, alertas e informações por planilha.
2. Pedidos valida colunas, datas, clientes, status, valores e pendências.
3. Contas valida abas mensais, cabeçalho, valores, classificação, conta, pagamento e competência.
4. Totais misturados em pedidos e contas são removidos por regras explícitas.
5. Usuário consegue seguir para dashboards quando só houver alertas não críticos.

### Phase 4: Normalização, Estado e Tabelas

**Goal:** Transformar dados brutos em tabelas internas filtráveis, persistidas e exportáveis.

**Requirements:** IMP-06, NRM-03, NRM-04, NRM-05, NRM-06, FLT-01, FLT-02, FLT-03, FLT-04, FLT-05, TBL-01, TBL-02

**UI hint:** yes

**Success criteria:**
1. Dados normalizados possuem campos derivados para pedidos, contas e indicadores.
2. IndexedDB ou storage equivalente restaura o último dataset carregado.
3. Filtros globais e específicos afetam datasets derivados.
4. Tabelas normalizadas têm paginação, ordenação, busca e destaque de inconsistências.
5. Exportação CSV respeita o dataset filtrado.

### Phase 5: Dashboard Executivo

**Goal:** Apresentar a visão executiva com KPIs e gráficos essenciais sem inflar receita.

**Requirements:** EXE-01, EXE-02, EXE-03, EXE-04

**UI hint:** yes

**Status:** Complete — 2026-07-08

**Success criteria:**
1. KPIs mostram receita, recebido, pendente, despesas, vencidas, resultado, ticket e pedidos.
2. Gráficos principais usam ECharts e atualizam com filtros.
3. Listas curtas mostram contas vencidas e próximas.
4. Pipeline em aprovação aparece separado de receita ativa e realizada.

### Phase 6: Financeiro e Contas a Pagar

**Status:** Complete — 2026-07-08

**Goal:** Entregar uma página financeira operacional para despesas, vencimentos e fornecedores.

**Requirements:** FIN-01, FIN-02, FIN-03

**UI hint:** yes

**Success criteria:**
1. KPIs financeiros calculam total, pago, aberto, vencido e janelas de vencimento.
2. Gráficos mostram mês, categoria, classificação, fornecedor, conta bancária e vencimentos.
3. Tabelas de exceção exibem contas vencidas, próximas, sem valor, sem classificação e pagas sem data.
4. Filtros de contas afetam todos os cards, gráficos e tabelas da página.

### Phase 7: Pedidos e Receita

**Goal:** Entregar análise comercial e operacional de pedidos com status e valores corretos.

**Requirements:** ORD-01, ORD-02, ORD-03

**UI hint:** yes

**Success criteria:**
1. KPIs de pedidos calculam valores, tickets, status, prazo e entrega no prazo.
2. Gráficos mostram receita, pedidos, ticket, situação, vendedor, cliente, pendência e pontualidade.
3. Status são agrupados em pipeline, ativo, entregue, cancelado e sem status.
4. Filtros de pedidos afetam todos os cards, gráficos e tabelas da página.

### Phase 8: Resultado Integrado

**Goal:** Comparar resultado por competência e resultado de caixa sem misturar conceitos.

**Requirements:** RES-01, RES-02, RES-03, RES-04

**UI hint:** yes

**Success criteria:**
1. Competência usa receita ativa do mês menos despesas do mês.
2. Caixa usa valores recebidos menos contas pagas.
3. KPIs mostram recebíveis, contas abertas, saldo projetado, cobertura e ponto de equilíbrio.
4. Gráficos mostram resultado mensal, waterfall, recebido versus pago e projeção de caixa.

### Phase 9: Insights e Páginas Complementares

**Goal:** Adicionar alertas automáticos e completar as páginas de gestão secundárias.

**Requirements:** INS-01, INS-02, INS-03, CLV-01, PRD-01, CFG-01

**UI hint:** yes

**Success criteria:**
1. Página de insights agrupa alertas financeiros, comerciais e operacionais por severidade.
2. Clientes e vendedores mostram rankings, receita, ticket, pedidos e pendências.
3. Produção e prazos mostram funil, atrasos, aging e pontualidade.
4. Configurações/metas lista indicadores calculáveis, manuais e indisponíveis.
5. Cada página reaproveita filtros, componentes e métricas compartilhadas.

### Phase 10: Polimento e Verificação Final

**Goal:** Consolidar qualidade de uso local, responsividade desktop-first, acessibilidade e manutenção.

**Requirements:** Cross-cutting

**UI hint:** yes

**Success criteria:**
1. App funciona localmente sem chamadas externas em runtime.
2. Layout permanece utilizável em desktop e responsivo em telas menores.
3. Tabelas, cards, filtros e charts mantêm formatação pt-BR e contraste adequado.
4. Principais fluxos são verificados com as três planilhas reais.
5. Código fica organizado por módulos, sem arquivos excessivamente longos ou regras duplicadas.

## Dependency Notes

- Phases 1-4 são base obrigatória para qualquer dashboard confiável.
- Phases 5-9 dependem de filtros, métricas e tabelas estáveis.
- Phase 10 valida o conjunto e pode corrigir problemas de integração encontrados nas fases anteriores.

## Coverage

- v1 requirements: 53
- Mapped requirements: 53
- Unmapped requirements: 0
