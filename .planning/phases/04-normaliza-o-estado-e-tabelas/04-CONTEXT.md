# Phase 4: Normalização, Estado e Tabelas - Context

**Gathered:** 2026-07-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase transforma dados brutos já validados em tabelas internas limpas, com campos derivados, persistência local, filtros e exportação CSV. O usuário deve conseguir inspecionar pedidos, contas e indicadores normalizados, aplicar filtros, restaurar o último dataset ao reabrir o app e exportar o conjunto filtrado. Dashboards com KPIs e gráficos reais ficam para as Fases 5–9.

</domain>

<decisions>
## Implementation Decisions

### Momento da normalização e persistência
- **D-01:** A normalização roda automaticamente logo após cada validação bem-sucedida — sem botão extra nem esperar o CTA `Continuar para dashboards`.
- **D-02:** Quando a segunda obrigatória (Pedidos ou Contas) concluir validação, o dataset combinado fica pronto para uso nas páginas seguintes.
- **D-03:** Substituir qualquer planilha já validada dispara re-normalização automática daquela fonte e atualização imediata do dataset persistido.
- **D-04:** Persistência em IndexedDB com dataset normalizado completo (pedidos, contas, indicadores quando existirem) **e** metadados de importação (nome do arquivo, timestamps, contagens, estado de validação por fonte).
- **D-05:** Ao reabrir o app, restaurar automaticamente o último dataset válido do IndexedDB e navegar direto para `#executivo` quando houver dados restauráveis; se não houver dataset salvo, manter rota inicial `#upload`.
- **D-06:** O CTA `Continuar para dashboards` permanece como atalho de navegação pós-validação, mas não é o gatilho da normalização.

### Campos derivados e classificação
- **D-07:** Campos derivados de pedidos seguem `docs/resume.md` §3.1, incluindo `situacao_grupo`, `dias_producao`, `dias_atraso`, `entregue_no_prazo` e `status_financeiro`.
- **D-08:** `situacao_grupo` usa mapeamento **estrito** da tabela de `docs/resume.md` §3.1; qualquer situação fora da tabela vira `Sem status` e gera alerta de inconsistência na linha.
- **D-09:** `status_financeiro` fica a critério do executor com lógica padrão ERP: **Quitado** (pendente ≤ 0), **Parcial** (pago > 0 e pendente > 0), **Pendente** (pago = 0).
- **D-10:** `dias_producao`, `dias_atraso` e `entregue_no_prazo` seguem `docs/resume.md` §7: produção e atraso só para pedidos entregues; pedidos em aberto ficam com valores neutros/null.
- **D-11:** Campos derivados de contas seguem `docs/resume.md` §3.2, incluindo `competencia_aba`, `status_pagamento`, `mes_vencimento`, `mes_pagamento` e `dias_atraso`.
- **D-12:** Mapeamento de `status_pagamento` segue a tabela de condições de `docs/resume.md` §3.2.
- **D-13:** Indicadores/metas classificados por **catálogo fixo no código** cruzado com aba `DADOS_PBI`: valor na planilha = manual; métrica calculável das bases = calculável; sem base = indisponível. Nunca inventar valores.

### Filtros
- **D-14:** Implementar filtros `FLT-01`..`FLT-05` conforme `REQUIREMENTS.md` e `docs/resume.md` §5.
- **D-15:** Painel de filtros globais **colapsável na topbar** + filtros específicos de pedidos/contas na Base de Dados.
- **D-16:** Filtros globais **visíveis em todas as páginas**; nesta fase só Base de Dados consome dados reais — demais páginas mantêm estado coerente sem quebrar.
- **D-17:** Período/mês/ano usa campo **contextual**: pedidos por `data_cadastro`/`mes_cadastro`; contas por `data_vencimento`/`mes_vencimento`; na Base de Dados, o campo segue a aba ativa.
- **D-18:** Campos categóricos (situação, vendedor, fornecedor, categoria, etc.) com **multi-seleção** nesta fase.
- **D-19:** Botões limpar filtros e exportar dataset filtrado entram nesta fase; salvar visão (`ANA-01`) e filtro por clique em gráfico ficam para v2.

### Tabelas e exportação
- **D-20:** Página Base de Dados (`#base-dados`) com **abas** Pedidos | Contas | Indicadores, uma tabela por aba.
- **D-21:** Colunas de negócio principais visíveis por padrão; IDs e derivados técnicos ocultos, reveláveis via column visibility (persistir preferência em `localStorage` por aba).
- **D-22:** Tabelas usam **scroll virtual** em vez de paginação clássica; busca livre e ordenação por coluna permanecem obrigatórios (`TBL-01`).
- **D-23:** Linhas com alertas de validação (`TBL-02`) recebem fundo sutil de alerta + badge na coluna de status/identificador listando o alerta VAL.
- **D-24:** Exportação CSV da toolbar exporta o dataset **filtrado** da aba/tabela ativa.

### the agent's Discretion
- Nomes e estrutura dos módulos (`normalizers.js`, `store.js`, `filters.js`, `tables.js` ou equivalente), desde que responsabilidades permaneçam separadas.
- Schema exato do IndexedDB (nomes de stores, índices) desde que suporte restauração completa e reimportação.
- Microcopy pt-BR dos estados de restauração, progresso de normalização e mensagens de dataset vazio.
- Lista exata de colunas "negócio" vs "técnicas" por aba, desde que `docs/TABLES.md` e densidade compacta sejam respeitados.
- Implementação do scroll virtual (técnica e limiar de ativação), desde que performance permaneça aceitável com as planilhas reais.
- Normalização de texto (`cliente_normalizado`, `fornecedor_normalizado`, etc.): trim, colapso de espaços e tratamento de "Balcão" como cliente genérico conforme `docs/resume.md`.
- Formato técnico do CSV exportado (separador, encoding, BOM para Excel) desde que respeite pt-BR e o dataset filtrado atual.
- Estratégia de normalização incremental por fonte vs. recomputação total, desde que D-01..D-03 sejam honrados.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento e escopo
- `.planning/PROJECT.md` — visão do produto, IndexedDB preferencial, regras de negócio e restrições técnicas.
- `.planning/REQUIREMENTS.md` — requisitos `IMP-06`, `NRM-03`..`NRM-06`, `FLT-01`..`FLT-05`, `TBL-01`, `TBL-02`.
- `.planning/ROADMAP.md` — objetivo e critérios de sucesso da Fase 4.
- `.planning/STATE.md` — foco atual, riscos conhecidos e progresso.
- `.planning/research/SUMMARY.md` — direção técnica para ETL, persistência e separação de responsabilidades.
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-CONTEXT.md` — shell, navegação, rota `#base-dados`, densidade e tabelas.
- `.planning/phases/02-vendor-e-importa-o-excel/02-CONTEXT.md` — fluxo de upload, cards e metadados pós-leitura.
- `.planning/phases/03-valida-o-e-regras-de-entrada/03-CONTEXT.md` — validação rigorosa, limpeza NRM-01/NRM-02 e CTA pós-validação.

### Design system e UX
- `docs/DESIGN.md` — layout híbrido, densidade operacional e padrões de página.
- `docs/TOKENS.md` — tokens, estados semânticos e densidade.
- `docs/UX.md` — feedback, filtros, estados vazios e anti-patterns.
- `docs/COMPONENTS.md` — botões, badges, toolbars e ações de exportação.
- `docs/TABLES.md` — estrutura de DataTable, toolbar, filtros, paginação/scroll e destaques.
- `docs/FORMS.md` — inputs, labels e padrões de filtro.

### Regras de negócio e modelo de dados
- `docs/resume.md` — modelo interno §3, filtros §5, regras de cálculo §7, campos derivados e pipeline vs receita.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/schemas.js` — mapeamento de colunas e `normalizeHeader` para transformação consistente.
- `js/cleaners.js` — exclusões NRM-01/NRM-02 já aplicadas na entrada validada.
- `js/validators.js` — parsing de datas, moeda e labels; base para normalização de tipos.
- `js/validation.js` — orquestração pós-import e relatório por planilha.
- `js/importer.js` — leitura XLSX e metadados de workbook/abas.
- `js/app.js` — hash routes, página Upload com CTA, placeholder de Base de Dados e `table-toolbar` com botão Exportar desabilitado.
- `css/app.css` — tokens, `data-table`, badges e densidade compacta.
- `index.html` — topbar com campo de busca desabilitado (placeholder para filtros globais).

### Established Patterns
- Um card independente por fonte com estados pós-validação (`validated`, `invalid`, `info`).
- Validação automática após upload; substituição dispara revalidação imediata.
- `localStorage` apenas para tema; dados de negócio ainda não persistidos.
- Separação de módulos por responsabilidade (import → clean → validate → [normalizar/store]).

### Integration Points
- Pipeline pós-`validation.js`: normalizador consome linhas limpas e produz registros tipados com campos derivados.
- Módulo de store grava/restaura IndexedDB e alimenta estado global da aplicação.
- Topbar recebe painel de filtros colapsável; estado de filtros compartilhado entre páginas.
- `app.js` restaura dataset no boot, redireciona para `#executivo` quando aplicável e renderiza Base de Dados com abas e tabelas reais.
- Exportação CSV conecta à toolbar da aba ativa na Base de Dados.

</code_context>

<specifics>
## Specific Ideas

- Fluxo automático: normalizar sem ação manual extra após validação; reimportação mantém dataset alinhado.
- Ao reabrir, retomar indo direto ao Executivo.
- `situacao_grupo` rigoroso — desconhecidos não devem ser agrupados silenciosamente.
- Filtros globais na topbar em todas as páginas, mesmo antes dos dashboards reais.
- Base de Dados com abas e scroll virtual para leitura densa sem paginação clássica.
- Linhas problemáticas devem saltar aos olhos com badge, não só ícone escondido.

</specifics>

<deferred>
## Deferred Ideas

- KPIs, gráficos ECharts e dashboards analíticos reais — Fases 5–9.
- Salvar visões de filtro nomeadas (`ANA-01`) — v2.
- Filtro por clique em gráfico — v2 / fases analíticas.
- Alertas automáticos de insights — Fase 9.

</deferred>

---

*Phase: 04-normaliza-o-estado-e-tabelas*
*Context gathered: 2026-07-08*
