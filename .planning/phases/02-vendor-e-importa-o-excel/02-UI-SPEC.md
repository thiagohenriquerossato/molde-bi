---
phase: 02
slug: vendor-e-importa-o-excel
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-07
---

# Phase 02 — UI Design Contract

> Visual and interaction contract for the Excel import phase.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — static HTML/CSS/JavaScript |
| Preset | not applicable |
| Component library | none |
| Icon library | none in current codebase; use text/status badges only unless Phase 1 introduces local icons later |
| Font | `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |

The phase must reuse `css/app.css` tokens and existing component classes. Do not introduce Tailwind, shadcn, external icon packages, gradients or decorative dashboard styling.

---

## Layout Contract

### Upload Page

- Keep the existing `#upload` route as the entry point.
- Preserve the page header copy pattern:
  - eyebrow: `Preparação dos dados`
  - title: `Upload e validação`
  - description: `Carregue as planilhas para preparar os dados do dashboard local.`
- Keep the three-card grid on desktop using the existing `.upload-grid`.
- On tablet/mobile, cards continue stacking according to the existing responsive CSS.
- The topbar primary action must focus the upload page and visually highlight the first pending required card.

### Upload Cards

Each card must keep the existing structure:

1. status badge,
2. card title,
3. expected file name,
4. short source description,
5. primary card action,
6. helper/status metadata.

Cards must remain compact. Do not add large preview tables, charts or modal flows in Phase 2.

---

## Component Contract

### Card Types

| Card | Requiredness | Expected File | Primary Behavior |
|------|--------------|---------------|------------------|
| Pedidos | `Obrigatório` | `Pedidos_Simplificado.xlsx` | Reads workbook and first sheet metadata |
| Contas a pagar | `Obrigatório` | `PLANILHA CONTAS A PAGAR1.xlsx` | Reads workbook and lists monthly sheet metadata |
| Indicadores e metas | `Opcional` | `Molde_Momentos_Template_Indicadores.xlsx` | Reads optional workbook without blocking required cards |

### Status Badges

| State | Badge Class | Copy |
|-------|-------------|------|
| Required pending | `badge-warning` | `Obrigatório` |
| Optional absent | `badge-info` | `Opcional não carregado` |
| Reading | `badge-info` | `Lendo arquivo` |
| Read | `badge-success` | `Lido` |
| Read error | `badge-danger` | `Erro de leitura` |

Do not use color alone to communicate state. The badge copy must always be visible.

### Buttons

| State | Button Copy | Class |
|-------|-------------|-------|
| No file selected | `Selecionar planilha` | `button button-outline` |
| Reading | `Lendo arquivo...` | `button button-outline`, disabled |
| File read | `Substituir planilha` | `button button-outline` |
| Read error | `Selecionar novamente` | `button button-outline` |

The topbar button copy must remain `Selecionar planilha` and act as a shortcut to the first pending required card.

---

## Spacing Scale

Declared values reuse existing CSS variables and all are multiples of 4:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px / `--space-1` | badge gaps and tight helper spacing |
| sm | 8px / `--space-2` | button/card inner gaps |
| md | 16px / `--space-4` | card padding and grid gap |
| lg | 24px / `--space-6` | page padding desktop |
| xl | 32px / `--space-8` | wider section breathing room only if needed |
| 2xl | 48px / `--space-12` | not needed in Phase 2 UI |

Exceptions: none.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.43 |
| Small body / card metadata | 13px | 400 or 700 for file names | 1.43 |
| Label / badge | 12px | 700 | 1.33 |
| Card heading | 18px | 600 | 1.55 |
| Page heading | 24px | 600 | 1.33 |

File names, row counts, sheet counts and timestamps must use `tabular-nums` where numeric values appear.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `--background` / `#F8FAFC` light, `#0B1120` dark | Workspace background |
| Secondary (30%) | `--card` / `#FFFFFF` light, `#111827` dark | Upload cards, table/card surfaces |
| Accent (10%) | semantic badge backgrounds | Required/optional/read/error state emphasis only |
| Destructive | `--danger-bg` + `--danger-fg` | `Erro de leitura` state only |

Accent reserved for: status badges, focused first pending card, focus ring. Do not add decorative gradients or chart colors in Phase 2.

### Highlight First Pending Card

When the topbar action targets the first pending required card:

- Add a temporary state class such as `.upload-card-highlight`.
- Use border emphasis with `border-color: var(--ring)` or an inset outline.
- Do not change layout size or cause content shift.
- Remove the highlight automatically after a short period or when the user interacts with the card.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Topbar primary CTA | `Selecionar planilha` |
| Pedidos CTA | `Selecionar planilha` / `Substituir planilha` |
| Contas CTA | `Selecionar planilha` / `Substituir planilha` |
| Indicadores CTA | `Selecionar planilha` / `Substituir planilha` |
| Reading state | `Lendo arquivo...` |
| Required badge | `Obrigatório` |
| Optional empty badge | `Opcional não carregado` |
| Success badge | `Lido` |
| Error badge | `Erro de leitura` |
| Success metadata | `Arquivo: {nome}` · `{N} abas` · `{N} linhas lidas` · `Importado em {data/hora}` |
| Pedidos helper before import | `Selecione a planilha de pedidos para ler a primeira aba.` |
| Contas helper before import | `Selecione a planilha de contas para listar as abas mensais.` |
| Indicadores helper before import | `Opcional. Use para carregar o catálogo de indicadores e metas.` |
| Error state | `Não foi possível ler este arquivo. Confira se é uma planilha Excel e tente novamente.` |
| Destructive confirmation | not applicable — Phase 2 does not delete or mutate persisted data |

Do not use copy that says the planilha is `válida`; Phase 2 only confirms that it was `lida`.

---

## Interaction Contract

### File Selection

- Each card owns its own hidden file input.
- Visible card buttons trigger only their corresponding input.
- Accepted extensions: `.xlsx,.xls`.
- Selecting one card must not clear or change other card states.

### Reading State

- The selected card immediately changes to `Lendo arquivo`.
- Its button becomes disabled and displays `Lendo arquivo...`.
- Other cards remain interactive.

### Success State

- Card changes to `Lido`.
- Button changes to `Substituir planilha`.
- Metadata appears inside the same card.
- The topbar status updates based on required cards.

### Error State

- Card changes to `Erro de leitura`.
- Button changes to `Selecionar novamente`.
- Error copy appears in the card helper area.
- Other cards remain unchanged.

### Optional Workbook

- If indicadores/metas is not selected, it must show `Opcional não carregado`.
- Required import completion must depend only on Pedidos and Contas a Pagar.

---

## Accessibility Contract

- Every file input must have an accessible label associated with its card title.
- Buttons must be keyboard focusable.
- Disabled reading buttons must use `disabled` and `aria-disabled="true"` where appropriate.
- Status changes must be placed in a polite live region or equivalent status area so screen readers can perceive updates.
- Focus should move to the highlighted card only when the topbar action is used; normal file selection should not unexpectedly move focus.
- Error copy must be text, not color-only.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party | none | not allowed in Phase 2 UI |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-07-07
