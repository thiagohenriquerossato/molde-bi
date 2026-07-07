---
phase: 1
slug: funda-o-est-tica-e-design-system
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-07
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for Phase 1: Fundação Estática e Design System.

This contract locks the browser-only shell, static navigation, visual tokens, component baseline and empty states for the first implementation phase. It must be read together with `01-CONTEXT.md` before planning or implementation.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | Vanilla HTML, CSS and JavaScript |
| Preset | Not applicable |
| Component library | None |
| Icon library | Inline SVG icons or simple CSS/icon text; no runtime internet dependency |
| Font | `Inter`, `system-ui`, `sans-serif`; fallback must work without remote font loading |
| Locale | pt-BR for all visible copy, dates, currency and numeric examples |

### Product Feel

- The UI must feel like a compact operational ERP/dashboard, not a decorative BI landing page.
- The visual language is neutral, dense, clear and table-friendly.
- Surfaces use borders before shadows.
- Gradients, decorative illustrations and large chart-first layouts are out of scope for this phase.

---

## Page Shell Contract

### Structural Layout

The app shell must use this hierarchy:

```text
body
  .app-shell
    aside.sidebar
    div.app-main
      header.topbar
      main.page-area
```

Required dimensions:

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Sidebar | `240px` fixed | `64px` collapsed | Overlay drawer |
| Topbar | `56px` high | `56px` high | `56px` high |
| Page padding | `24px` | `16px` | `16px` |
| Section gap | `16px` | `16px` | `12px` |

### Sidebar

The sidebar must be visible on desktop, collapsed on tablet and overlay on mobile.

Required groups and labels:

| Group | Items |
|-------|-------|
| Início | Upload |
| Análises | Executivo, Financeiro, Resultado |
| Operação | Pedidos, Insights, Base de Dados |
| Sistema | Metas |

Route mapping:

| Label | Hash |
|-------|------|
| Upload | `#upload` |
| Executivo | `#executivo` |
| Financeiro | `#financeiro` |
| Pedidos | `#pedidos` |
| Resultado | `#resultado` |
| Insights | `#insights` |
| Base de Dados | `#base-dados` |
| Metas | `#metas` |

Sidebar item states:

| State | Visual |
|-------|--------|
| Default | Muted text, transparent background |
| Hover | `--accent` background |
| Active | `--primary` background, `--primary-foreground` text, `--radius-md` |
| Future page | Clickable, normal nav state, page content explains data dependency |

### Topbar

The topbar must contain:

- Disabled or placeholder global search with copy `Buscar páginas, pedidos, contas...`.
- Local status badge with copy `Local` or `Sem dados importados`.
- Theme toggle with accessible label `Alternar tema`.
- Primary contextual action that remains disabled in Phase 1 when it would imply real import.

The topbar must not imply backend sync, login, remote database or real XLSX parsing.

---

## Page Inventory

### Upload (`#upload`)

Default initial route. This is the only page with richer Phase 1 content.

Required content:

- Page header:
  - Title: `Upload e validação`
  - Description: `Carregue as planilhas para preparar os dados do dashboard local.`
- Three upload cards:
  - `Pedidos`
  - `Contas a pagar`
  - `Indicadores e metas`
- The indicators card must show an optional badge: `Opcional`.
- Upload buttons must be visible but disabled, with helper copy `Disponível na Fase 2`.
- Include a short readiness panel explaining that the app is local and static.

Upload card content:

| Card | Expected File Copy | Status |
|------|--------------------|--------|
| Pedidos | `Pedidos_Simplificado.xlsx` | `Pendente` |
| Contas a pagar | `PLANILHA CONTAS A PAGAR1.xlsx` | `Pendente` |
| Indicadores e metas | `Molde_Momentos_Template_Indicadores.xlsx` | `Opcional` |

### Future Pages

All other pages must be navigable and show useful empty states.

| Page | Empty State Heading | Empty State Body |
|------|---------------------|------------------|
| Executivo | `Dashboard executivo sem dados` | `Importe as planilhas para visualizar receita, despesas, resultado e pedidos.` |
| Financeiro | `Financeiro sem contas importadas` | `As análises de contas a pagar aparecerão após a importação da planilha financeira.` |
| Pedidos | `Pedidos sem base importada` | `Carregue a planilha de pedidos para acompanhar status, valores e prazos.` |
| Resultado | `Resultado integrado indisponível` | `A comparação entre receita e despesas depende das bases de pedidos e contas.` |
| Insights | `Insights aguardando dados` | `Alertas financeiros, comerciais e operacionais serão gerados depois da validação.` |
| Base de Dados | `Base normalizada vazia` | `As tabelas normalizadas serão exibidas após importação, validação e normalização.` |
| Metas | `Metas sem catálogo importado` | `Indicadores e metas são opcionais e aparecerão quando a planilha correspondente for carregada.` |

---

## Spacing Scale

Declared values must be implemented as CSS custom properties in `css/app.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Icon gaps, fine separators |
| `--space-2` | `8px` | Compact gaps, badge padding |
| `--space-3` | `12px` | Card internal compact spacing |
| `--space-4` | `16px` | Default component gap |
| `--space-5` | `20px` | Dense page blocks |
| `--space-6` | `24px` | Desktop page padding |
| `--space-8` | `32px` | Header to content gap |
| `--space-10` | `40px` | Large empty state spacing |
| `--space-12` | `48px` | Major vertical breathing room |

Exceptions: none. New spacing values must use this 4px scale.

---

## Typography

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Body | `14px` | `400` | `1.43` | Default UI copy |
| Small body | `13px` | `400` | `1.38` | Tables, dense cards, metadata |
| Label | `12px` | `500` | `1.33` | Labels, table headers, badges |
| Micro | `11px` | `500` | `1.27` | Timestamps, secondary metadata |
| Section heading | `18px` | `600` | `1.55` | Panel titles |
| Page title | `24px` | `600` | `1.33` | Page headers |

Numeric values must use:

```css
font-variant-numeric: tabular-nums;
```

Do not load remote fonts in Phase 1. If `Inter` is unavailable locally, system fonts are acceptable.

---

## Color

All colors must be exposed as CSS custom properties and used through variables.

### Light Mode

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F8FAFC` | Main workspace background |
| Secondary (30%) | `#FFFFFF` | Sidebar, topbar, cards, table containers |
| Accent (10%) | `#0F172A` | Active nav, primary buttons, strong focus |
| Border | `#E2E8F0` | Cards, table rows, topbar/sidebar separators |
| Muted | `#F1F5F9` | Search, table headers, hover states |
| Text | `#0F172A` | Main text |
| Muted text | `#64748B` | Labels, placeholders and secondary metadata |
| Destructive | `#DC2626` | Destructive or error-only states |

### Dark Mode

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#0B1120` | Main workspace background |
| Secondary (30%) | `#111827` | Sidebar, cards, tables |
| Elevated | `#1E293B` | Overlays, mobile sidebar, popovers |
| Accent (10%) | `#F1F5F9` | Active/primary foreground emphasis |
| Border | `#334155` | Visible boundaries |
| Muted | `#1E293B` | Inputs, hover states |
| Text | `#F8FAFC` | Main text |
| Muted text | `#94A3B8` | Secondary metadata |
| Destructive | `#DC2626` | Destructive or error-only states |

Accent reserved for:

- Active navigation item.
- Primary disabled/import CTA styling boundary.
- Focus rings.
- Strong selected states.

Accent must not be applied to every interactive element.

---

## Semantic Badges

Badges must include text and not rely on color alone.

| Variant | Light Background | Light Text | Dark Background | Dark Text | Example Copy |
|---------|------------------|------------|-----------------|-----------|--------------|
| `neutral` | `#F1F5F9` | `#475569` | `#1E293B` | `#CBD5E1` | `Pendente` |
| `info` | `#EFF6FF` | `#1D4ED8` | `#1E3A8A` at 40% | `#93C5FD` | `Local` |
| `success` | `#ECFDF5` | `#047857` | `#064E3B` at 40% | `#6EE7B7` | `Pronto` |
| `warning` | `#FFFBEB` | `#B45309` | `#78350F` at 40% | `#FCD34D` | `Disponível na Fase 2` |
| `danger` | `#FEF2F2` | `#B91C1C` | `#7F1D1D` at 40% | `#FCA5A5` | `Erro` |

---

## Component Contracts

### Cards

Cards must use:

- `background: var(--card)`.
- `border: 1px solid var(--border)`.
- `border-radius: var(--radius-lg)`.
- Padding `16px` default, `12px` compact.
- No heavy shadows in operational surfaces.

Upload cards must include:

- Small semantic badge at the top.
- Title.
- Expected file name.
- One disabled button.
- Helper text with phase dependency.

### Buttons

Button variants required:

| Variant | Required Use |
|---------|--------------|
| Primary | Main contextual actions |
| Secondary | Frequent non-primary actions |
| Outline | Filters, secondary navigation, disabled future actions |
| Ghost | Icon-only sidebar/topbar actions |

Disabled buttons must use `opacity: 0.5`, keep visible text and include `aria-disabled="true"` or the native `disabled` attribute when appropriate.

### Inputs

Phase 1 inputs are visual/static only.

Required examples:

- Topbar search input or search-like button.
- Fake filter/search field in component demo or future page.

Inputs must have visible labels or accessible labels. Placeholder must not be the only accessible name.

### Tables

Phase 1 must include a dense table style demonstration or empty table state, even without normalized data.

Table visual contract:

| Element | Value |
|---------|-------|
| Container | Card surface with border and rounded corners |
| Header height | `32px` compact or `36px` default |
| Row height | `36px` compact |
| Header text | `12px`, uppercase, medium, muted |
| Cell text | `13px`, foreground |
| Currency/number cells | Right aligned, tabular nums |
| Horizontal overflow | Required for small screens |

### Empty States

Empty states must use:

- Icon or simple visual marker at 32-48px.
- Short heading.
- One-sentence body with next step.
- Optional disabled CTA when the next action is future-scoped.

Empty states must not use emojis as icons.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary disabled CTA | `Selecionar planilha` |
| Disabled helper | `Disponível na Fase 2` |
| Upload page title | `Upload e validação` |
| Upload page body | `Carregue as planilhas para preparar os dados do dashboard local.` |
| Pedidos card body | `Base de pedidos, clientes, status, datas e valores.` |
| Contas card body | `Base mensal de contas, fornecedores, vencimentos e pagamentos.` |
| Indicadores card body | `Catálogo opcional de indicadores e metas gerenciais.` |
| Generic future page heading | `Aguardando dados importados` |
| Generic future page body | `Esta página será preenchida após a importação e validação das planilhas.` |
| Error state | `Não foi possível carregar esta visualização. Recarregue a página e tente novamente.` |
| Destructive confirmation | Not applicable in Phase 1 |

Tone rules:

- Use direct pt-BR business language.
- Avoid playful copy.
- Do not promise real uploads, validation or dashboards in Phase 1.
- Prefer "planilhas", "dados locais", "sem dados importados", "disponível na Fase 2".

---

## Responsiveness Contract

| Breakpoint | Shell Behavior |
|------------|----------------|
| `>= 1024px` | Sidebar fixed at `240px`; topbar fixed; page padding `24px` |
| `768px - 1023px` | Sidebar collapsed to `64px`; labels may hide; tooltips/titles remain accessible |
| `< 768px` | Sidebar becomes overlay; menu button appears in topbar; content uses single column |

Mobile/tablet requirements:

- Upload cards stack into one column under `768px`.
- Tables and wide demos use horizontal scroll rather than squeezed columns.
- Touch targets must not be smaller than `32px` high in dense desktop contexts and should reach `44px` when displayed on mobile.
- Overlay sidebar must have a visible close affordance and close on route selection.

---

## Theme Contract

Theme behavior:

- Use system preference as initial default.
- Persist user choice in `localStorage`.
- Toggle must live in topbar.
- The root element must receive a deterministic class or attribute, such as `.dark` or `data-theme="dark"`.

Theme coverage:

- Body/workspace.
- Sidebar and active nav.
- Topbar and search.
- Cards.
- Buttons.
- Inputs.
- Badges.
- Tables.
- Empty states.
- Mobile overlay.

Dark mode must be designed with layered slate surfaces; do not invert colors automatically.

---

## Accessibility Contract

Required:

- Skip link to main content.
- `nav` landmark for sidebar.
- `header` landmark for topbar.
- `main` landmark for page content.
- Buttons and nav items have accessible names.
- Active route uses `aria-current="page"`.
- Theme toggle exposes pressed/current state.
- Mobile sidebar overlay exposes expanded state on the trigger.
- Focus ring is visible on all interactive controls.
- Empty states do not rely on color alone.
- Disabled future actions communicate the reason in adjacent text.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | None | Not required |
| third-party | None | Not allowed in Phase 1 |

No component registry may be introduced in Phase 1. The implementation must stay vanilla HTML/CSS/JS.

---

## Out Of Scope For UI Contract

The following must not be implemented or visually implied as working in Phase 1:

- Reading `.xlsx` files.
- SheetJS or ECharts vendor setup.
- Real upload flow.
- Validation reports.
- Normalized datasets.
- Real filters.
- Real KPI metrics or charts.
- Persisted imported data.
- Login, backend, API or remote database.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-07-07
