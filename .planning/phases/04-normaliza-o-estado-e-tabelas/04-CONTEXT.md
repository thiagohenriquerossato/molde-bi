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

### Campos derivados e classificação (não discutido — padrão do projeto)
- **D-07:** Campos derivados de pedidos seguem `docs/resume.md` §3.1, incluindo `situacao_grupo`, `dias_producao`, `dias_atraso`, `entregue_no_prazo` e `status_financeiro`.
- **D-08:** Mapeamento de `situacao_grupo` segue a tabela de `docs/resume.md` — `Aguardando Aprovação` = pipeline/orçamento, nunca receita realizada.
- **D-09:** Campos derivados de contas seguem `docs/resume.md` §3.2, incluindo `competencia_aba`, `status_pagamento`, `mes_vencimento`, `mes_pagamento` e `dias_atraso`.
- **D-10:** Mapeamento de `status_pagamento` segue a tabela de condições de `docs/resume.md` §3.2.
- **D-11:** Indicadores/metas classificados como calculável, manual ou indisponível conforme `docs/resume.md` §3.3 e campo `origem`; nunca inventar valores sem base.

### Filtros e tabelas (não discutido — requisitos + design system)
- **D-12:** Implementar filtros `FLT-01`..`FLT-05` e tabelas `TBL-01`/`TBL-02` conforme `REQUIREMENTS.md` e `docs/resume.md` §5.
- **D-13:** Filtros globais ficam acessíveis na topbar ou em painel compartilhado reutilizável pelas páginas; filtros específicos de pedidos e contas complementam os globais na Base de Dados e nas páginas analíticas futuras.
- **D-14:** Página Base de Dados (`#base-dados`) é o hub principal de inspeção tabular, com abas ou equivalente para Pedidos, Contas e Indicadores.
- **D-15:** Tabelas com paginação, ordenação, busca livre e exportação CSV do dataset filtrado; destaque visual para linhas com alertas de validação (`TBL-02`).
- **D-16:** Filtros avançados fora do escopo v1 — salvar visão (`ANA-01`), clique em gráfico filtrando dashboard e multi-seleção em todos os campos ficam para backlog v2; exportar filtrado e limpar filtros entram nesta fase.

### the agent's Discretion
- Nomes e estrutura dos módulos (`normalizers.js`, `store.js`, `filters.js`, `tables.js` ou equivalente), desde que responsabilidades permaneçam separadas.
- Schema exato do IndexedDB (nomes de stores, índices) desde que suporte restauração completa e reimportação.
- Microcopy pt-BR dos estados de restauração, progresso de normalização e mensagens de dataset vazio.
- Colunas visíveis por padrão em cada tabela, tamanho de página e detalhes de UI dos filtros, desde que `docs/TABLES.md`, `docs/COMPONENTS.md` e densidade compacta sejam respeitados.
- Estratégia de normalização incremental por fonte vs. recomputação total, desde que D-01..D-03 sejam honrados.
- Formato técnico do CSV exportado (separador, encoding, BOM para Excel) desde que respeite pt-BR e o dataset filtrado atual.

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
- `docs/TABLES.md` — estrutura de DataTable, toolbar, filtros, paginação e destaques.
- `docs/FORMS.md` — inputs, labels e padrões de filtro.

### Regras de negócio e modelo de dados
- `docs/resume.md` — modelo interno §3, filtros §5, campos derivados, classificação de indicadores e regras de pipeline vs receita.

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

### Established Patterns
- Um card independente por fonte com estados pós-validação (`validated`, `invalid`, `info`).
- Validação automática após upload; substituição dispara revalidação imediata.
- `localStorage` apenas para tema; dados de negócio ainda não persistidos.
- Separação de módulos por responsabilidade (import → clean → validate → [normalizar/store]).

### Integration Points
- Pipeline pós-`validation.js`: novo normalizador consome linhas limpas e produz registros tipados.
- Novo módulo de store grava/restaura IndexedDB e alimenta estado global da aplicação.
- `app.js` deve restaurar dataset no boot, redirecionar para `#executivo` quando aplicável e renderizar Base de Dados com dados reais.
- Filtros compartilhados devem afetar tabelas desta fase e preparar consumo pelas Fases 5–9.
- Exportação CSV conecta à toolbar existente na Base de Dados e às tabelas filtradas.

</code_context>

<specifics>
## Specific Ideas

- O usuário quer fluxo automático: normalizar sem ação manual extra após validação.
- Reimportação deve manter o dataset sempre alinhado com as planilhas carregadas.
- Ao reabrir o navegador, retomar de onde parou indo direto ao Executivo — experiência de continuidade local.
- Áreas de campos derivados, filtros e UX tabular não foram discutidas; seguir `docs/resume.md` e requisitos como padrão.

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
