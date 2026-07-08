# Tokens de design — Molde ERP

Tokens em formato **HSL sem função** (compatível shadcn/ui). Valores aplicados em `src/styles/theme.css`.

---

## Cores — Light (`:root`)

| Token | HSL | Hex aprox. | Uso |
|-------|-----|------------|-----|
| `--background` | `210 40% 98%` | #F8FAFC | Workspace |
| `--foreground` | `222 47% 11%` | #0F172A | Texto principal |
| `--card` | `0 0% 100%` | #FFFFFF | Superfícies |
| `--card-foreground` | `222 47% 11%` | #0F172A | Texto em card |
| `--popover` | `0 0% 100%` | #FFFFFF | Menus |
| `--popover-foreground` | `222 47% 11%` | #0F172A | Texto em popover |
| `--primary` | `222 47% 11%` | #0F172A | Ações, nav ativa |
| `--primary-foreground` | `210 40% 98%` | #F8FAFC | Texto em primary |
| `--secondary` | `210 40% 96%` | #F1F5F9 | Botões secundários |
| `--secondary-foreground` | `222 47% 11%` | #0F172A | Texto secondary |
| `--muted` | `210 40% 96%` | #F1F5F9 | Fundos suaves |
| `--muted-foreground` | `215 16% 47%` | #64748B | Texto muted |
| `--accent` | `210 40% 96%` | #F1F5F9 | Hover/seleção |
| `--accent-foreground` | `222 47% 11%` | #0F172A | Texto accent |
| `--destructive` | `0 72% 51%` | #DC2626 | Erro/destrutivo |
| `--destructive-foreground` | `0 0% 100%` | #FFFFFF | Texto destructive |
| `--border` | `214 32% 91%` | #E2E8F0 | Bordas |
| `--input` | `214 32% 91%` | #E2E8F0 | Borda de input |
| `--ring` | `221 83% 53%` | #2563EB | Focus ring |
| `--success` | `160 84% 39%` | #059669 | Semântica success |
| `--success-foreground` | `0 0% 100%` | #FFFFFF | Texto success sólido |
| `--warning` | `32 95% 44%` | #D97706 | Semântica warning |
| `--warning-foreground` | `0 0% 100%` | #FFFFFF | Texto warning sólido |
| `--info` | `221 83% 53%` | #2563EB | Semântica info |
| `--info-foreground` | `0 0% 100%` | #FFFFFF | Texto info sólido |

### Tokens estendidos (light)

| Token | Valor | Uso |
|-------|-------|-----|
| `--elevated` | `0 0% 100%` | Modais |
| `--sidebar` | `0 0% 100%` | Sidebar bg |
| `--sidebar-foreground` | `222 47% 11%` | Texto sidebar |
| `--sidebar-border` | `214 32% 91%` | Borda sidebar |
| `--sidebar-accent` | `222 47% 11%` | Item ativo |
| `--sidebar-accent-foreground` | `210 40% 98%` | Texto item ativo |
| `--table-header` | `210 40% 96%` | Header tabela |
| `--table-row-hover` | `210 40% 96%` | Hover linha |
| `--table-row-selected` | `214 32% 91%` | Linha selecionada |

---

## Cores — Dark (`.dark`)

| Token | HSL | Hex aprox. |
|-------|-----|------------|
| `--background` | `222 47% 7%` | #0B1120 |
| `--foreground` | `210 40% 98%` | #F8FAFC |
| `--card` | `217 33% 12%` | #111827 |
| `--card-foreground` | `210 40% 98%` | #F8FAFC |
| `--popover` | `217 28% 17%` | #1E293B |
| `--popover-foreground` | `210 40% 98%` | #F8FAFC |
| `--primary` | `210 40% 96%` | #F1F5F9 |
| `--primary-foreground` | `222 47% 11%` | #0F172A |
| `--secondary` | `217 28% 17%` | #1E293B |
| `--secondary-foreground` | `210 40% 98%` | #F8FAFC |
| `--muted` | `217 28% 17%` | #1E293B |
| `--muted-foreground` | `215 20% 65%` | #94A3B8 |
| `--accent` | `217 28% 20%` | #243044 |
| `--accent-foreground` | `210 40% 98%` | #F8FAFC |
| `--destructive` | `0 63% 51%` | #DC2626 |
| `--destructive-foreground` | `0 0% 100%` | #FFFFFF |
| `--border` | `217 19% 27%` | #334155 |
| `--input` | `217 19% 27%` | #334155 |
| `--ring` | `213 94% 68%` | #60A5FA |
| `--success` | `160 64% 52%` | #34D399 |
| `--success-foreground` | `222 47% 11%` | #0F172A |
| `--warning` | `43 96% 56%` | #FBBF24 |
| `--warning-foreground` | `222 47% 11%` | #0F172A |
| `--info` | `213 94% 68%` | #60A5FA |
| `--info-foreground` | `222 47% 11%` | #0F172A |

### Tokens estendidos (dark)

| Token | Valor |
|-------|-------|
| `--elevated` | `217 28% 17%` |
| `--sidebar` | `217 33% 12%` |
| `--sidebar-foreground` | `210 40% 98%` |
| `--sidebar-border` | `217 19% 27%` |
| `--sidebar-accent` | `217 28% 20%` |
| `--sidebar-accent-foreground` | `210 40% 98%` |
| `--table-header` | `217 28% 15%` |
| `--table-row-hover` | `217 28% 17%` |
| `--table-row-selected` | `217 28% 22%` |

---

## Badges semânticos (utility classes)

### Light

| Variante | Background | Text |
|----------|------------|------|
| success | `hsl(152 76% 95%)` | `hsl(160 84% 30%)` |
| warning | `hsl(48 96% 95%)` | `hsl(32 95% 35%)` |
| danger | `hsl(0 86% 97%)` | `hsl(0 72% 45%)` |
| info | `hsl(214 100% 97%)` | `hsl(221 83% 45%)` |
| neutral | `hsl(210 40% 96%)` | `hsl(215 16% 40%)` |

### Dark

Usar `bg-{semantic}/15` + `text-{semantic}` ou classes dedicadas em `theme.css`.

---

## Tipografia

| Token | Valor |
|-------|-------|
| `--font-sans` | `'Inter', system-ui, sans-serif` |
| `--font-mono` | `'JetBrains Mono', ui-monospace, monospace` |
| `--text-2xs` | `0.6875rem` (11px) |
| `--text-xs` | `0.75rem` (12px) |
| `--text-sm` | `0.8125rem` (13px) |
| `--text-base` | `0.875rem` (14px) |
| `--text-lg` | `1.125rem` (18px) |
| `--text-xl` | `1.25rem` (20px) |
| `--text-2xl` | `1.5rem` (24px) |

### Line-height

| Token | Valor |
|-------|-------|
| `--leading-tight` | `1.25` |
| `--leading-normal` | `1.43` |
| `--leading-relaxed` | `1.5` |

### Letter-spacing

| Token | Valor |
|-------|-------|
| `--tracking-tight` | `-0.01em` |
| `--tracking-normal` | `0` |
| `--tracking-wide` | `0.04em` (headers de tabela) |

---

## Spacing

Escala base **4px**. Tokens nomeados:

| Token | px |
|-------|-----|
| `--space-0` | 0 |
| `--space-1` | 4 |
| `--space-2` | 8 |
| `--space-3` | 12 |
| `--space-4` | 16 |
| `--space-5` | 20 |
| `--space-6` | 24 |
| `--space-8` | 32 |
| `--space-10` | 40 |
| `--space-12` | 48 |

### Layout

| Token | Valor |
|-------|-------|
| `--sidebar-width` | `240px` |
| `--sidebar-width-collapsed` | `64px` |
| `--topbar-height` | `56px` |
| `--summary-panel-width` | `320px` |
| `--drawer-width-sm` | `400px` |
| `--drawer-width-md` | `480px` |
| `--drawer-width-lg` | `640px` |

---

## Radius

| Token | Valor |
|-------|-------|
| `--radius-sm` | `0.25rem` (4px) |
| `--radius-md` | `0.375rem` (6px) |
| `--radius-lg` | `0.5rem` (8px) |
| `--radius-xl` | `0.75rem` (12px) |
| `--radius` | `0.5rem` (default shadcn) |

---

## Shadows

| Token | Light | Dark |
|-------|-------|------|
| `--shadow-sm` | `0 1px 2px rgb(15 23 42 / 0.05)` | `none` |
| `--shadow-md` | `0 4px 6px rgb(15 23 42 / 0.07)` | `0 4px 12px rgb(0 0 0 / 0.4)` |
| `--shadow-lg` | `0 10px 15px rgb(15 23 42 / 0.08)` | `0 8px 24px rgb(0 0 0 / 0.5)` |

Preferir bordas em cards operacionais; sombra só em overlays.

---

## Borders

| Token | Valor |
|-------|-------|
| `--border-width` | `1px` |
| `--border-width-thick` | `2px` (selected row indicator) |

---

## Z-index

| Token | Valor | Uso |
|-------|-------|-----|
| `--z-base` | 0 | Conteúdo |
| `--z-sticky` | 10 | Header tabela |
| `--z-dropdown` | 20 | Menus |
| `--z-drawer` | 30 | Drawer/Sheet |
| `--z-modal` | 40 | Dialog |
| `--z-toast` | 50 | Toast |
| `--z-command` | 60 | Command palette |

---

## Breakpoints

| Nome | Min-width |
|------|-----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

---

## Opacity

| Token | Valor | Uso |
|-------|-------|-----|
| `--opacity-disabled` | 0.5 | Disabled |
| `--opacity-muted` | 0.7 | Ícones secundários |
| `--opacity-overlay` | 0.8 | Backdrop modal |

---

## Transitions

| Token | Valor |
|-------|-------|
| `--transition-fast` | `150ms ease` |
| `--transition-base` | `200ms ease` |
| `--transition-slow` | `300ms ease` |

---

## Density

| Token | row | input | gap |
|-------|-----|-------|-----|
| `--density-compact` | 36px | 32px | 8px |
| `--density-default` | 40px | 36px | 12px |
| `--density-comfortable` | 44px | 40px | 16px |

Ativar via `data-density="compact"` no `html` ou container.

---

## Mapeamento Tailwind

```ts
colors: {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  // ... ver tailwind.config.ts
}
```

---

## Chart colors (uso mínimo)

| Token | Light | Dark |
|-------|-------|------|
| `--chart-1` | `221 83% 53%` | `213 94% 68%` |
| `--chart-2` | `160 84% 39%` | `160 64% 52%` |
| `--chart-3` | `32 95% 44%` | `43 96% 56%` |
| `--chart-4` | `262 83% 58%` | `270 70% 65%` |
| `--chart-5` | `0 72% 51%` | `0 63% 51%` |
