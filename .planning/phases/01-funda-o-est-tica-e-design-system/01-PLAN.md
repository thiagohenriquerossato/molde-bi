---
phase: 1
plan: 01
type: implementation
wave: 1
depends_on:
  - .planning/PROJECT.md
  - .planning/REQUIREMENTS.md
  - .planning/ROADMAP.md
  - .planning/STATE.md
  - .planning/research/SUMMARY.md
  - .planning/phases/01-funda-o-est-tica-e-design-system/01-CONTEXT.md
  - .planning/phases/01-funda-o-est-tica-e-design-system/01-UI-SPEC.md
  - .planning/phases/01-funda-o-est-tica-e-design-system/01-RESEARCH.md
  - .planning/phases/01-funda-o-est-tica-e-design-system/01-VALIDATION.md
files_modified:
  - index.html
  - css/app.css
  - js/app.js
autonomous: true
requirements_addressed:
  - FND-01
  - FND-02
  - FND-03
---

# Phase 1 Plan: Fundação Estática e Design System

<objective>
Criar a fundação estática e local do Molde Momentos Dashboard Local com `index.html`, `css/app.css` e `js/app.js`, entregando um shell semântico, navegável por hash routes, visualmente alinhado ao design system em `docs/`, com tema claro/escuro persistido e estados vazios em pt-BR. A fase cobre explicitamente `FND-01`, `FND-02` e `FND-03`, sem implementar importação XLSX, validação real, normalização, IndexedDB, gráficos, métricas ou qualquer dependência remota.
</objective>

<requirements_addressed>
- `FND-01`: abrir `index.html` localmente e visualizar o shell da aplicação sem backend.
- `FND-02`: navegar pelas páginas fixas usando sidebar/topbar e hash routes.
- `FND-03`: aplicar sistema visual baseado em `docs/`, com labels pt-BR, cards compactos, tabela densa e badges semânticos.
</requirements_addressed>

<threat_model>
## Ameaças e mitigações da fase

- **T-1-01: Dependência remota acidental.** CDN, fonte remota, biblioteca externa ou URL `http(s)` quebraria o uso local/offline. Mitigação: referenciar apenas `css/app.css` e `js/app.js`; verificar com `! rg "https?://|cdn|unpkg|jsdelivr|googleapis|fonts\\.gstatic" index.html css js`.
- **T-1-02: Escopo avançar para importação real.** Inputs funcionais, parsing XLSX, SheetJS ou ECharts antecipariam fases futuras. Mitigação: botões de upload ficam `disabled` ou `aria-disabled="true"` com copy `Disponível na Fase 2`; verificar ausência de `SheetJS`, `xlsx`, `echarts`, `Chart`, `FileReader` e handlers de arquivo.
- **T-1-03: Dados ou métricas inventadas.** KPIs, gráficos ou valores financeiros simulados podem gerar confiança indevida. Mitigação: páginas futuras mostram empty states e não exibem números de negócio, dashboards reais nem validações reais.
- **T-1-04: Quebra em `file://`.** Uso de modules complexos, `fetch()` local ou roteamento dependente de servidor pode falhar ao abrir direto no navegador. Mitigação: usar script local simples, hash routes e DOM estático/dinâmico sem `fetch`; verificar com abertura direta de `index.html`.
- **T-1-05: Acessibilidade insuficiente no shell.** Sem landmarks, skip link, foco visível ou `aria-current`, a navegação fica frágil. Mitigação: incluir `nav`, `header`, `main`, skip link, nomes acessíveis, `aria-current="page"`, `aria-expanded` no menu mobile e focus ring em CSS.
- **T-1-06: Dark mode superficial.** Inverter cores ou cobrir só o body cria contraste ruim. Mitigação: declarar tokens light/dark completos e aplicar em sidebar, topbar, cards, botões, inputs, badges, tabelas, empty states e overlay mobile.
- **T-1-07: UI desalinhada com o padrão operacional.** Layout decorativo, gradientes e cards grandes descaracterizam o ERP/dashboard denso. Mitigação: usar sidebar fixa, topbar 56px, superfícies com bordas, cards compactos, tabela densa e copy operacional em pt-BR.
</threat_model>

<tasks>
## 1. Criar o shell semântico local em `index.html`

<task>
id: `1-01-01`
type: `feature`
files:
- `index.html`

<read_first>
- `AGENTS.md`
- `.planning/REQUIREMENTS.md`
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-CONTEXT.md`
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-UI-SPEC.md`
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-RESEARCH.md`
- `docs/DESIGN.md`
- `docs/UX.md`
</read_first>

<action>
Criar `index.html` na raiz com HTML semântico e sem dependências remotas. Usar `lang="pt-BR"`, título `Molde Momentos Dashboard Local`, skip link para `#conteudo-principal`, shell `body > .app-shell`, `aside.sidebar`, `div.app-main`, `header.topbar` e `main.page-area`.

Adicionar links hash para todas as rotas planejadas:
- `#upload`
- `#executivo`
- `#financeiro`
- `#pedidos`
- `#resultado`
- `#insights`
- `#base-dados`
- `#metas`

Organizar a sidebar em grupos com estes rótulos exatos:
- `Início`: `Upload`
- `Análises`: `Executivo`, `Financeiro`, `Resultado`
- `Operação`: `Pedidos`, `Insights`, `Base de Dados`
- `Sistema`: `Metas`

Criar topbar com botão de menu mobile, busca visual/desabilitada com label acessível e placeholder `Buscar páginas, pedidos, contas...`, badge `Sem dados importados`, botão de tema com label `Alternar tema` e ação contextual desabilitada com texto `Selecionar planilha`.

Adicionar a página inicial de upload com título `Upload e validação`, descrição `Carregue as planilhas para preparar os dados do dashboard local.`, três cards de planilha e um painel curto explicando que o app é local, estático e sem dados importados nesta fase. Os cards devem exibir:
- `Pedidos` com `Pedidos_Simplificado.xlsx`, status `Pendente`, corpo `Base de pedidos, clientes, status, datas e valores.`
- `Contas a pagar` com `PLANILHA CONTAS A PAGAR1.xlsx`, status `Pendente`, corpo `Base mensal de contas, fornecedores, vencimentos e pagamentos.`
- `Indicadores e metas` com `Molde_Momentos_Template_Indicadores.xlsx`, badge `Opcional`, corpo `Catálogo opcional de indicadores e metas gerenciais.`

Todos os CTAs de upload devem mostrar `Selecionar planilha`, estar desabilitados e ter helper `Disponível na Fase 2`.
</action>

<acceptance_criteria>
- `index.html` existe na raiz e referencia somente `css/app.css` e `js/app.js` como assets da fase.
- O arquivo contém `aside` com classe `sidebar`, `header` com classe `topbar` e `main` com classe `page-area`.
- O skip link aponta para o conteúdo principal e o `main` possui `id="conteudo-principal"`.
- As rotas `#upload`, `#executivo`, `#financeiro`, `#pedidos`, `#resultado`, `#insights`, `#base-dados` e `#metas` aparecem como links reais.
- A página de upload contém exatamente as strings `Upload e validação`, `Carregue as planilhas para preparar os dados do dashboard local.`, `Pedidos_Simplificado.xlsx`, `PLANILHA CONTAS A PAGAR1.xlsx`, `Molde_Momentos_Template_Indicadores.xlsx`, `Opcional` e `Disponível na Fase 2`.
- Não existe input de arquivo funcional nem promessa de importação real nesta fase.
</acceptance_criteria>

<verify>
```sh
test -f index.html
rg "css/app.css|js/app.js" index.html
rg "aside class=\"sidebar|header class=\"topbar|main class=\"page-area|conteudo-principal" index.html
rg "#upload|#executivo|#financeiro|#pedidos|#resultado|#insights|#base-dados|#metas" index.html
rg "Upload e validação|Carregue as planilhas para preparar os dados do dashboard local\\.|Pedidos_Simplificado\\.xlsx|PLANILHA CONTAS A PAGAR1\\.xlsx|Molde_Momentos_Template_Indicadores\\.xlsx|Opcional|Disponível na Fase 2" index.html
```
</verify>
</task>

## 2. Criar `css/app.css` com tokens, layout e componentes base

<task>
id: `1-01-02`
type: `feature`
files:
- `css/app.css`
- `index.html`

<read_first>
- `docs/DESIGN.md`
- `docs/TOKENS.md`
- `docs/COMPONENTS.md`
- `docs/TABLES.md`
- `docs/FORMS.md`
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-UI-SPEC.md`
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-RESEARCH.md`
</read_first>

<action>
Criar a pasta `css` se necessário e adicionar `css/app.css`. Implementar reset leve, base typográfica e tokens como CSS custom properties.

Declarar tokens light em `:root` usando valores do contrato:
- `--background: #F8FAFC`
- `--foreground: #0F172A`
- `--card: #FFFFFF`
- `--primary: #0F172A`
- `--primary-foreground: #F8FAFC`
- `--secondary: #F1F5F9`
- `--muted: #F1F5F9`
- `--muted-foreground: #64748B`
- `--border: #E2E8F0`
- `--ring: #2563EB`

Declarar tokens dark sob `html[data-theme="dark"]` usando:
- `--background: #0B1120`
- `--foreground: #F8FAFC`
- `--card: #111827`
- `--primary: #F1F5F9`
- `--primary-foreground: #0F172A`
- `--secondary: #1E293B`
- `--muted: #1E293B`
- `--muted-foreground: #94A3B8`
- `--border: #334155`
- `--ring: #60A5FA`

Adicionar tokens de spacing `--space-1` até `--space-12`, `--sidebar-width: 240px`, `--sidebar-width-collapsed: 64px`, `--topbar-height: 56px`, `--radius-md: 6px`, `--radius-lg: 8px`, `--transition-fast: 150ms ease` e `--transition-base: 200ms ease`.

Estilizar:
- shell desktop com sidebar fixa de `240px`, topbar `56px` e page padding `24px`;
- sidebar colapsada entre `768px` e `1023px`;
- sidebar overlay abaixo de `768px`;
- botões primary, outline, ghost e disabled;
- busca/input visual;
- badges `neutral`, `info`, `success`, `warning` e `danger`;
- cards compactos;
- upload cards;
- page header;
- empty states;
- tabela densa com container, header uppercase, linhas de `36px`, células `13px`, `tabular-nums` e overflow horizontal;
- foco acessível via `:focus-visible`;
- `prefers-reduced-motion`.

Evitar gradientes decorativos, sombras pesadas e cores hardcoded espalhadas fora dos tokens.
</action>

<acceptance_criteria>
- `css/app.css` existe e `index.html` aponta para ele.
- O CSS declara tokens light e dark para background, foreground, card, primary, primary-foreground, muted, muted-foreground, border e ring.
- O CSS contém regras para `.app-shell`, `.sidebar`, `.topbar`, `.page-area`, `.nav-link`, `.button`, `.badge`, `.card`, `.upload-card`, `.empty-state`, `.table-wrap` e `.data-table`.
- O layout respeita `--sidebar-width: 240px`, `--sidebar-width-collapsed: 64px`, `--topbar-height: 56px` e page padding desktop de `24px`.
- A responsividade cobre `@media (max-width: 1023px)` e `@media (max-width: 767px)`.
- O CSS contém foco visível com `:focus-visible` e suporte a `prefers-reduced-motion`.
- Não há import de fontes remotas, frameworks CSS ou CDN.
</acceptance_criteria>

<verify>
```sh
test -f css/app.css
rg "--background|--foreground|--card|--primary|--primary-foreground|--muted|--muted-foreground|--border|--ring" css/app.css
rg "html\\[data-theme=\"dark\"\\]|#0B1120|#111827|#334155|#60A5FA" css/app.css
rg "--sidebar-width: 240px|--sidebar-width-collapsed: 64px|--topbar-height: 56px|24px" css/app.css
rg "\\.app-shell|\\.sidebar|\\.topbar|\\.page-area|\\.nav-link|\\.button|\\.badge|\\.card|\\.upload-card|\\.empty-state|\\.table-wrap|\\.data-table" css/app.css
rg "@media \\(max-width: 1023px\\)|@media \\(max-width: 767px\\)|:focus-visible|prefers-reduced-motion" css/app.css
! rg "@import|https?://|cdn|unpkg|jsdelivr|googleapis|fonts\\.gstatic" css/app.css
```
</verify>
</task>

## 3. Criar `js/app.js` com rotas, tema e menu mobile

<task>
id: `1-01-03`
type: `feature`
files:
- `js/app.js`
- `index.html`

<read_first>
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-CONTEXT.md`
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-UI-SPEC.md`
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-RESEARCH.md`
- `docs/UX.md`
- `docs/COMPONENTS.md`
</read_first>

<action>
Criar a pasta `js` se necessário e adicionar `js/app.js` com JavaScript vanilla pequeno e sem dependências. Usar uma constante de rotas estáticas contendo `upload`, `executivo`, `financeiro`, `pedidos`, `resultado`, `insights`, `base-dados` e `metas`.

Implementar:
- normalização de hash: hash vazio ou desconhecido deve cair em `#upload`;
- renderização/alternância do conteúdo da rota no `main`;
- empty states específicos para páginas futuras usando os textos do `01-UI-SPEC.md`;
- atualização do item ativo com `aria-current="page"`;
- fechamento da sidebar mobile ao navegar;
- botão de menu mobile com `aria-expanded`;
- tema inicial pela ordem: valor de `localStorage.getItem("molde-theme")`, preferência `prefers-color-scheme: dark`, fallback `light`;
- persistência da escolha com `localStorage.setItem("molde-theme", theme)`;
- aplicação do tema no root com `document.documentElement.dataset.theme = theme`;
- botão de tema com `aria-pressed` e texto acessível coerente.

Manter `app.js` livre de XLSX, SheetJS, ECharts, IndexedDB, `fetch`, cálculos financeiros, validações reais e mocks de dados de negócio.
</action>

<acceptance_criteria>
- `js/app.js` existe e `index.html` aponta para ele com caminho local.
- Hash vazio e hash inválido renderizam `#upload`.
- As oito rotas fixas têm conteúdo próprio ou empty state específico.
- Ao trocar de rota, exatamente o link ativo recebe `aria-current="page"`.
- O menu mobile alterna estado visual e `aria-expanded`, e fecha ao selecionar uma rota.
- O tema usa a chave `molde-theme`, aplica `data-theme` no `documentElement`, respeita preferência do sistema quando não há valor salvo e persiste a escolha no `localStorage`.
- Não há `fetch(`, `indexedDB`, `FileReader`, `SheetJS`, `xlsx`, `echarts`, `Chart` ou cálculos de métricas reais.
</acceptance_criteria>

<verify>
```sh
test -f js/app.js
rg "upload|executivo|financeiro|pedidos|resultado|insights|base-dados|metas" js/app.js
rg "aria-current|aria-expanded|hashchange|localStorage|getItem\\(\"molde-theme\"\\)|setItem\\(\"molde-theme\"|prefers-color-scheme|dataset\\.theme" js/app.js
rg "Dashboard executivo sem dados|Financeiro sem contas importadas|Pedidos sem base importada|Resultado integrado indisponível|Insights aguardando dados|Base normalizada vazia|Metas sem catálogo importado" js/app.js
! rg "fetch\\(|indexedDB|FileReader|SheetJS|xlsx|echarts|Chart" js/app.js
```
</verify>
</task>

## 4. Fechar escopo negativo e consistência visual da fase

<task>
id: `1-01-04`
type: `hardening`
files:
- `index.html`
- `css/app.css`
- `js/app.js`

<read_first>
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-VALIDATION.md`
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-UI-SPEC.md`
- `docs/resume.md`
</read_first>

<action>
Revisar os três arquivos para garantir que a fase não sugere funcionalidades futuras como prontas. Garantir que:
- não exista CDN, backend, API, login, banco remoto ou runtime internet dependency;
- não exista SheetJS, ECharts, Chart.js, XLSX real, `FileReader`, `fetch()` ou IndexedDB;
- não existam métricas reais, gráficos reais, valores financeiros simulados, validações reais ou datasets persistidos;
- páginas futuras expliquem dependência de importação/validação sem mostrar dados inventados;
- botões de importação estejam desabilitados e acompanhados de `Disponível na Fase 2`;
- indicadores sem fonte não sejam inventados; nesta fase eles aparecem apenas como futura página/empty state.
</action>

<acceptance_criteria>
- Os arquivos da fase não contêm URLs remotas, CDN ou referências a bibliotecas externas.
- Os arquivos da fase não contêm `SheetJS`, `xlsx`, `echarts`, `Chart`, `FileReader`, `indexedDB` ou `fetch(`.
- Os arquivos não exibem valores monetários reais ou KPIs de negócio como dados carregados.
- Toda ação que pareça importação ou seleção de planilha está desabilitada ou claramente rotulada como fase futura.
- As regras de negócio de `Aguardando Aprovação`, totais de pedidos/contas e indicadores sem fonte não são implementadas nem simuladas nesta fase.
</acceptance_criteria>

<verify>
```sh
! rg "https?://|cdn|unpkg|jsdelivr|googleapis|fonts\\.gstatic" index.html css js
! rg "SheetJS|xlsx|echarts|Chart|FileReader|indexedDB|fetch\\(" index.html css js
! rg "R\\$ [0-9]|Receita ativa|Resultado competência|Resultado caixa|Aguardando Aprovação" index.html css js
rg "disabled|aria-disabled|Disponível na Fase 2|Sem dados importados" index.html js/app.js
```
</verify>
</task>

## 5. Verificar abertura local, navegação, tema e responsividade

<task>
id: `1-01-05`
type: `verification`
files:
- `index.html`
- `css/app.css`
- `js/app.js`

<read_first>
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-VALIDATION.md`
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-UI-SPEC.md`
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-RESEARCH.md`
</read_first>

<action>
Executar a verificação automatizada leve da fase e fazer inspeção manual no navegador. A aceitação principal é abrir `index.html` diretamente, mas um servidor estático temporário pode ser usado apenas para inspeção adicional.

Checklist manual:
- abrir `index.html` diretamente no navegador e confirmar que o shell aparece sem servidor;
- confirmar que a rota inicial é `#upload`;
- clicar em todos os itens da sidebar e confirmar conteúdo, hash e item ativo;
- recarregar em cada hash e confirmar restauração correta;
- alternar tema, recarregar e confirmar persistência em `localStorage`;
- limpar a chave `molde-theme` e confirmar uso de `prefers-color-scheme`;
- testar teclado: skip link, menu, links, theme toggle e foco visível;
- testar desktop, tablet e mobile: sidebar fixa, colapsada e overlay; cards empilhados; tabela com overflow horizontal;
- confirmar que não há importação real, validação real, gráficos, métricas ou chamadas externas.
</action>

<acceptance_criteria>
- O smoke test de arquivos passa.
- O full suite command definido em `01-VALIDATION.md` passa.
- A inspeção manual confirma `FND-01`, `FND-02` e `FND-03`.
- Qualquer falha visual, de acessibilidade ou de escopo negativo encontrada na inspeção é corrigida antes de marcar a fase como pronta.
</acceptance_criteria>

<verify>
```sh
test -f index.html && test -f css/app.css && test -f js/app.js
test -f index.html && test -f css/app.css && test -f js/app.js && ! rg "https?://|cdn|unpkg|jsdelivr|googleapis|fonts\\.gstatic|SheetJS|xlsx|echarts|indexedDB|fetch\\(" index.html css js
rg "#upload|#executivo|#financeiro|#pedidos|#resultado|#insights|#base-dados|#metas" index.html js/app.js
rg "--background|--foreground|--card|--border|--primary|--muted" css/app.css
```
</verify>
</task>
</tasks>

<verification>
## Verificação automatizada

Executar após concluir as tarefas:

```sh
test -f index.html && test -f css/app.css && test -f js/app.js
test -f index.html && test -f css/app.css && test -f js/app.js && ! rg "https?://|cdn|unpkg|jsdelivr|googleapis|fonts\\.gstatic|SheetJS|xlsx|echarts|indexedDB|fetch\\(" index.html css js
rg "#upload|#executivo|#financeiro|#pedidos|#resultado|#insights|#base-dados|#metas" index.html js/app.js
rg "Upload e validação|Disponível na Fase 2|Sem dados importados|aria-current|Alternar tema" index.html js/app.js
rg "--background|--foreground|--card|--border|--primary|--muted|html\\[data-theme=\"dark\"\\]" css/app.css
```

## Verificação manual obrigatória

- Abrir `index.html` diretamente no navegador, sem servidor, e confirmar shell visível.
- Navegar por todos os hashes e validar conteúdo, hash atual e `aria-current`.
- Recarregar em `#upload`, `#executivo`, `#financeiro`, `#pedidos`, `#resultado`, `#insights`, `#base-dados` e `#metas`.
- Alternar tema, recarregar e verificar persistência via `localStorage`.
- Testar navegação por teclado e skip link.
- Testar viewport desktop, tablet e mobile.
- Confirmar visualmente que upload, importação, validação, métricas e gráficos reais não foram implementados.
</verification>

<success_criteria>
- `FND-01`: `index.html` abre localmente e renderiza o shell sem backend, login, build, servidor obrigatório ou dependência remota.
- `FND-02`: sidebar/topbar permitem navegar por todas as páginas planejadas via hash routes, com item ativo e `aria-current="page"`.
- `FND-03`: `css/app.css` implementa tokens light/dark, layout, componentes base, tabela densa, badges semânticos, responsividade e foco acessível conforme `docs/`.
- A rota inicial `#upload` orienta o usuário com três cards de planilha, copy pt-BR e CTAs desabilitados para a Fase 2.
- Páginas futuras são clicáveis e exibem empty states úteis, sem esconder o roadmap do produto.
- O escopo negativo passa: sem CDN, sem backend, sem SheetJS/ECharts, sem XLSX real, sem IndexedDB, sem fetch/API e sem métricas reais.
</success_criteria>

<must_haves>
- Usar somente HTML, CSS e JavaScript vanilla.
- Manter o app executável diretamente por `index.html`.
- Criar apenas `index.html`, `css/app.css` e `js/app.js` para o produto nesta fase, salvo ajustes mínimos inevitáveis.
- Usar português pt-BR em toda copy visível.
- Implementar shell com sidebar, topbar, skip link, `main` semântico e rotas hash.
- Implementar tema claro/escuro com tokens próprios e persistência em `localStorage`.
- Implementar menu mobile com estado acessível.
- Implementar tabela/empty state visual sem dados reais.
- Deixar upload/importação claramente desabilitados com `Disponível na Fase 2`.
- Não adicionar backend, login, servidor obrigatório, API, banco remoto, CDN, fontes remotas, bibliotecas externas, SheetJS, ECharts, IndexedDB, parsing XLSX, gráficos reais, validações reais, filtros reais, métricas reais ou datasets persistidos.
</must_haves>
