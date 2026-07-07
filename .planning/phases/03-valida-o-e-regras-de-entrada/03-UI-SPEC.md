---
phase: 03
slug: valida-o-e-regras-de-entrada
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-07
---

# Phase 03 — UI Design Contract

> Visual and interaction contract for workbook validation and entry rules.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — static HTML/CSS/JavaScript |
| Preset | not applicable |
| Component library | none |
| Icon library | none — use text badges and severity prefixes |
| Font | inherit from Phase 1 (`Inter, system-ui, ...`) |

Reuse `css/app.css` tokens and existing upload card patterns. No new UI frameworks, gradients or decorative charts.

---

## Layout Contract

### Upload Page Structure

Preserve existing upload page header and three-card grid. Add a new section **below** `.upload-grid`:

```text
[page header]
[upload cards grid]
[Resultado da validação panel]   ← new in Phase 3
[existing content-grid / preview table]
[Continuar para dashboards CTA]  ← new in Phase 3
```

The validation panel must not replace upload cards or move validation into modals.

### Validation Panel

- Section title: `Resultado da validação`
- One block per loaded source: Pedidos, Contas, Indicadores (only if file loaded)
- Each block shows:
  - source title
  - status badge
  - summary counts (`erros críticos`, `alertas`, `linhas válidas`)
  - findings list area

Blocks are independent; pending required sources show `Aguardando validação` or `Aguardando planilha`.

---

## Component Contract

### Upload Card Status Badges (post-validation)

Replace `Lido` after validation completes:

| Validation Result | Badge Class | Copy |
|-------------------|-------------|------|
| Valid | `badge-success` | `Válido` |
| Valid with warnings only | `badge-warning` | `Com informações` |
| Invalid (critical errors) | `badge-danger` | `Inválido` |
| Reading | `badge-warning` | `Validando...` |
| Read error (unchanged) | `badge-danger` | `Erro de leitura` |
| Pending | `badge-neutral` or `badge-info` | `Obrigatório` / `Opcional não carregado` |

During validation after upload, card may briefly show `Validando...` before final badge.

### Validation Block Status

| Status | Badge Class | Copy prefix |
|--------|-------------|-------------|
| Valid | `badge-success` | `Válida` |
| Warnings only | `badge-warning` | `Válida com alertas` |
| Invalid | `badge-danger` | `Inválida` |
| Pending | `badge-neutral` | `Aguardando` |

Use text equivalents `✅`, `⚠️`, `❌` only as optional prefix in summary line, never as sole indicator.

### Finding List Items

Each finding row must show:

- `Linha {excelRow} · {businessId}`
- short rule message
- severity label (`Erro crítico` or `Alerta`)

Critical errors: show up to 10 items in flat list.

Warnings (cleanup/info): full list with expandable container when count > 5:

- collapsed: first 5 items + button `Ver todos ({N})`
- expanded: all items + `Recolher`

Invalid block must include secondary action:

- `Corrigir planilha` — focuses/reopens file input for that card

### Global CTA

| State | Button Copy | Class | Enabled |
|-------|---------------|-------|---------|
| Required sources missing | `Continuar para dashboards` | `button button-primary` | false |
| Critical errors on required | `Continuar para dashboards` | `button button-primary` | false |
| Required valid or warnings only | `Continuar para dashboards` | `button button-primary` | true |

Helper text when disabled:

- `Corrija os erros críticos em Pedidos e Contas para continuar.`

On click when enabled: navigate to `#executivo` (first dashboard route).

---

## Spacing Scale

Reuse Phase 1/2 tokens. New validation panel:

| Token | Usage |
|-------|-------|
| `--space-4` | panel padding and block gap |
| `--space-3` | finding list item gap |
| `--space-2` | inline badge/text gap |

---

## Typography

| Role | Size | Weight |
|------|------|--------|
| Panel title | 18px | 600 |
| Block title | 16px | 600 |
| Finding text | 13px | 400 |
| Summary counts | 12px | 700 |
| CTA helper | 12px | 400 |

Numeric counts and line numbers use `tabular-nums`.

---

## Color

| Role | Token | Usage |
|------|-------|-------|
| Critical | `--danger-fg` / `badge-danger` | invalid status and critical findings |
| Warning | `--warning-fg` / `badge-warning` | cleanup exclusions and valid-with-warnings |
| Success | `--success-fg` / `badge-success` | valid status |
| Panel surface | `--card` + `border-border` | validation panel container |

No gradient backgrounds in validation UI.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Panel title | `Resultado da validação` |
| Valid badge (card) | `Válido` |
| Warning badge (card) | `Com informações` |
| Invalid badge (card) | `Inválido` |
| Validating state | `Validando...` |
| Block valid | `Válida` |
| Block warnings | `Válida com alertas` |
| Block invalid | `Inválida` |
| Critical label | `Erro crítico` |
| Warning label | `Alerta` |
| Expand action | `Ver todos ({N})` |
| Collapse action | `Recolher` |
| Fix action | `Corrigir planilha` |
| CTA | `Continuar para dashboards` |
| CTA disabled helper | `Corrija os erros críticos em Pedidos e Contas para continuar.` |
| Excluded row reason | `Linha ignorada` / `Parada em TOTAL` |

Do not use copy `Planilha válida` without severity qualifier when critical errors exist.

---

## Interaction Contract

### Automatic Validation

- Validation starts immediately after successful workbook read.
- Replacing a file re-runs validation for that source only.
- Other sources retain their prior validation state.

### Independent Source State

- Pedidos may be `Inválido` while Contas is still `Aguardando`.
- Indicadores problems never disable global CTA.

### Accessibility

- Validation panel updates use `aria-live="polite"` on panel or block level.
- Expand/collapse controls are `<button type="button">` with clear labels.
- Disabled CTA uses `disabled` and `aria-disabled="true"`.
- Severity communicated by text + badge, not color alone.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party UI | none | not allowed |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-07-07
