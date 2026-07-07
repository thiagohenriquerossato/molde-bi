# Phase 1: Fundação Estática e Design System - Context

**Gathered:** 2026-07-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega a fundação estática do produto: `index.html`, shell visual navegável, tokens CSS, componentes base e estados vazios em pt-BR. O app deve abrir localmente sem backend e preparar a navegação para as páginas planejadas, mas não deve ler arquivos XLSX, validar planilhas, normalizar dados, calcular métricas ou renderizar gráficos reais nesta fase.

</domain>

<decisions>
## Implementation Decisions

### Shell e navegação principal
- **D-01:** A aplicação deve usar sidebar fixa + topbar como padrão principal no desktop.
- **D-02:** Ao abrir `index.html`, a rota inicial deve ser a página de Upload e Validação em estado vazio.
- **D-03:** A navegação deve usar hash routes no browser, com rotas como `#upload`, `#executivo`, `#financeiro`, `#pedidos`, `#resultado`, `#insights`, `#base-dados` e `#metas`.
- **D-04:** A topbar deve conter busca em placeholder/desabilitada, indicador de status local e ações globais coerentes com a fase, sem prometer funcionalidades ainda não implementadas.

### Tela inicial e estados vazios
- **D-05:** A página inicial deve mostrar três cards de planilha: Pedidos, Contas a Pagar e Indicadores/Metas, sendo Indicadores/Metas claramente opcional.
- **D-06:** A copy da tela vazia deve ser operacional e direta, orientando o usuário a carregar as planilhas para começar.
- **D-07:** Ações futuras de upload/importação devem aparecer visíveis, porém desabilitadas, com nota objetiva como "Disponível na próxima fase".
- **D-08:** Páginas futuras sem dados devem ser clicáveis e mostrar empty states explicando que dependem da importação das planilhas.

### Densidade visual e componentes base
- **D-09:** A densidade deve ser `default` na navegação e compacta nas áreas operacionais, especialmente tabelas, cards de dados e blocos de upload.
- **D-10:** A Fase 1 deve entregar estilos base para cards, botões, inputs, badges, tabelas, filtros fake e empty states.
- **D-11:** A Fase 1 não deve ler XLSX nem usar SheetJS; a leitura real das planilhas pertence à Fase 2.
- **D-12:** A Fase 1 deve implementar light e dark mode com alternância funcional.

### Inventário de páginas e nomes no menu
- **D-13:** A sidebar deve listar todas as páginas planejadas: Upload, Executivo, Financeiro, Pedidos, Resultado, Insights, Base de Dados e Metas.
- **D-14:** Os itens da sidebar devem ser agrupados em Início, Análises, Operação e Sistema.
- **D-15:** Os rótulos devem usar português de negócio, não termos genéricos de dashboard ou ERP técnico.
- **D-16:** Páginas de fases futuras devem ter empty states úteis em vez de ficarem escondidas.

### Responsividade e tema
- **D-17:** A responsividade obrigatória é desktop-first, com tablet utilizável e mobile básico.
- **D-18:** A sidebar deve colapsar em tablet e virar overlay no mobile.
- **D-19:** A alternância de tema deve ficar na topbar, persistir em `localStorage` e usar preferência do sistema como padrão inicial.
- **D-20:** O dark mode deve cobrir tokens e componentes base completos, não ser apenas experimental.

### the agent's Discretion
- O executor pode decidir os nomes internos de classes CSS, desde que os tokens e padrões dos documentos em `docs/` sejam preservados.
- O executor pode decidir a microcopy exata dos empty states, desde que ela fique em pt-BR, seja operacional e não prometa importação real nesta fase.
- O executor pode decidir se usa JavaScript mínimo em `js/app.js` ou script inline curto, desde que a navegação por hash e o tema persistido fiquem claros e manuteníveis.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento e escopo
- `.planning/PROJECT.md` — visão do produto, restrições técnicas, regras de negócio e decisões globais.
- `.planning/REQUIREMENTS.md` — requisitos `FND-01`, `FND-02` e `FND-03` que esta fase deve cobrir.
- `.planning/ROADMAP.md` — objetivo e critérios de sucesso da Fase 1.
- `.planning/STATE.md` — foco atual, riscos conhecidos e estado do workflow.
- `.planning/research/SUMMARY.md` — direção técnica e implicações de arquitetura para o roadmap.

### Design system e UX
- `docs/DESIGN.md` — personalidade visual, layout base, light/dark mode, densidade e acessibilidade.
- `docs/TOKENS.md` — tokens HSL, spacing, radius, density, shadows, breakpoints e chart colors.
- `docs/UX.md` — regras de navegação, estados vazios, responsividade e anti-patterns.
- `docs/COMPONENTS.md` — padrões para botões, inputs, badges, cards, tabelas, empty/loading/error states e summary panels.
- `docs/TABLES.md` — especificação de tabelas compactas, headers, row states, responsividade e acessibilidade.
- `docs/FORMS.md` — padrões de labels, inputs, validação visual e layout de formulários.

### Planilhas reais e conteúdo
- `docs/resume.md` — nomes e papel das planilhas reais, principais campos e riscos de interpretação dos dados.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Não há `index.html`, CSS ou JavaScript existentes no repositório no momento da discussão. A Fase 1 deve criar a fundação do zero.

### Established Patterns
- Os padrões existentes são documentais: HTML, CSS e JavaScript puro; app local pelo `index.html`; design system em `docs/`; pt-BR; tabelas densas; badges semânticos; sem backend.
- A estrutura recomendada em `docs/resume.md` sugere `index.html`, `css/app.css` e módulos JS futuros. Para esta fase, o plano deve manter a base simples e preparada para esse crescimento.

### Integration Points
- `index.html` deve conectar shell, sidebar, topbar e regiões de página.
- `css/app.css` deve centralizar tokens, tema claro/escuro, layout, componentes base e responsividade.
- `js/app.js` ou equivalente deve controlar hash routes, item ativo da navegação, overlay mobile e preferência de tema.

</code_context>

<specifics>
## Specific Ideas

- O menu deve antecipar a arquitetura completa do produto para que o usuário entenda o mapa do sistema desde a primeira abertura.
- A tela de Upload e Validação deve citar as três fontes esperadas: `Pedidos_Simplificado.xlsx`, `PLANILHA CONTAS A PAGAR1.xlsx` e `Molde_Momentos_Template_Indicadores.xlsx`.
- Indicadores/Metas deve aparecer como opcional.
- Qualquer CTA ligado a importação real deve estar desabilitado ou claramente marcado como próximo passo da Fase 2.

</specifics>

<deferred>
## Deferred Ideas

- Leitura real das planilhas XLSX deve ficar para a Fase 2, junto com vendor de SheetJS e importação Excel.

</deferred>

---

*Phase: 01-funda-o-est-tica-e-design-system*
*Context gathered: 2026-07-07*
