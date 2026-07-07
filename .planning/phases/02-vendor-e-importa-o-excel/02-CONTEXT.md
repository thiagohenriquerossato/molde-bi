# Phase 2: Vendor e Importação Excel - Context

**Gathered:** 2026-07-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega as bibliotecas locais necessárias para uso offline e a leitura inicial de arquivos XLSX no navegador. O usuário deve conseguir selecionar a planilha de pedidos, a planilha de contas a pagar e, opcionalmente, a planilha de indicadores/metas. A fase deve confirmar que os workbooks foram lidos e expor metadados básicos, mas validação estrutural profunda, normalização, persistência de dataset e métricas ficam para fases posteriores.

</domain>

<decisions>
## Implementation Decisions

### Fluxo dos Cards de Upload
- **D-01:** A tela de Upload deve manter cards independentes, com um botão de seleção por planilha: Pedidos, Contas a Pagar e Indicadores/Metas.
- **D-02:** Pedidos e Contas a Pagar devem aparecer com badge de `Obrigatório`; Indicadores/Metas deve aparecer com badge de `Opcional`.
- **D-03:** O botão global da topbar deve levar/focar a página de Upload e destacar o primeiro card pendente, em vez de abrir diretamente um seletor genérico.
- **D-04:** Cada card deve usar estados compactos: `Pendente`, `Lido`, `Erro de leitura` e `Opcional não carregado`.
- **D-05:** Após leitura bem-sucedida, o card deve mostrar nome do arquivo, quantidade de abas/linhas lidas e data/hora da importação.
- **D-06:** Uma planilha já carregada deve ser trocada por um botão `Substituir planilha` dentro do próprio card.
- **D-07:** Durante a leitura, o card deve mostrar estado inline `Lendo arquivo...` e manter o botão desabilitado.
- **D-08:** Arquivo claramente errado deve gerar erro no próprio card, sem afetar os outros uploads.

### the agent's Discretion
- O executor pode decidir a microcopy exata dos estados, desde que fique em pt-BR, use tom operacional e não antecipe validação profunda da Fase 3.
- O executor pode decidir a estrutura interna dos módulos de importação, desde que preserve JavaScript puro, responsabilidade separada e app local por `index.html`.
- O executor pode decidir como destacar visualmente o primeiro card pendente acionado pela topbar, respeitando tokens, badges semânticos e acessibilidade.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento e escopo
- `.planning/PROJECT.md` — visão do produto, restrições técnicas, regras de negócio e decisões globais.
- `.planning/REQUIREMENTS.md` — requisitos `FND-04`, `IMP-01`, `IMP-02` e `IMP-03` cobertos por esta fase.
- `.planning/ROADMAP.md` — objetivo e critérios de sucesso da Fase 2.
- `.planning/STATE.md` — foco atual, riscos conhecidos e estado do workflow.
- `.planning/research/SUMMARY.md` — direção técnica: ETL no browser, bibliotecas locais e separação de responsabilidades.
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-CONTEXT.md` — decisões herdadas da fundação visual, navegação e estado vazio.

### Design system e UX
- `docs/DESIGN.md` — personalidade visual, shell, densidade, light/dark mode e acessibilidade.
- `docs/TOKENS.md` — tokens de cor, spacing, radius, densidade e estados semânticos.
- `docs/UX.md` — regras de navegação, feedback, estados vazios e anti-patterns.
- `docs/COMPONENTS.md` — padrões de botões, cards, badges, loading e error states.
- `docs/TABLES.md` — padrões para tabelas e previews tabulares quando necessário.
- `docs/FORMS.md` — padrões de inputs, labels, validação visual e ações de formulário.

### Planilhas reais
- `docs/resume.md` — nomes dos arquivos esperados, abas relevantes, campos principais e riscos de leitura das planilhas.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `index.html` — já possui shell local, topbar, sidebar, cards de upload e prévia de base vazia.
- `css/app.css` — já define tokens, badges, botões, cards, tabelas, responsividade e dark mode compatíveis com a Fase 2.
- `js/app.js` — já controla hash routes, renderização da página de Upload, tema, sidebar mobile e empty states.

### Established Patterns
- A aplicação usa HTML, CSS e JavaScript puro, sem build obrigatório e sem dependência de backend.
- A rota inicial é `#upload`, com cards para as três planilhas e Indicadores/Metas marcado como opcional.
- O padrão visual é operacional, denso e baseado em cards compactos, badges semânticos e tabelas simples.
- A Fase 1 deixou CTAs de importação desabilitados com copy `Disponível na Fase 2`; a Fase 2 deve transformar esses pontos em ações reais.

### Integration Points
- `index.html` deve receber scripts vendorizados locais ou módulos que exponham SheetJS/ECharts sem internet em runtime.
- `js/app.js` deve delegar leitura de XLSX para módulo(s) de importação, evitando concentrar lógica de parsing na renderização.
- A página de Upload deve atualizar cards e topbar com estados de importação sem navegar para dashboards ainda vazios.
- A pasta `vendor` ou equivalente deve conter as bibliotecas locais necessárias para cumprir `FND-04`.

</code_context>

<specifics>
## Specific Ideas

- O fluxo deve continuar parecendo uma ferramenta local simples: um card por fonte, ação direta e feedback no próprio card.
- O usuário quer clareza visual entre planilhas obrigatórias e a planilha opcional de indicadores/metas.
- A importação inicial deve produzir confiança básica pelo resumo de arquivo, abas/linhas e horário, sem prometer que os dados já estão validados.

</specifics>

<deferred>
## Deferred Ideas

- Validação estrutural detalhada, severidade de erros/alertas e permissão para seguir com alertas pertencem à Fase 3.
- Normalização, persistência local do dataset, filtros, tabelas reais e exportação CSV pertencem à Fase 4.

</deferred>

---

*Phase: 02-vendor-e-importa-o-excel*
*Context gathered: 2026-07-07*
