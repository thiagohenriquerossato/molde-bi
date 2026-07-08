# Componentes — Molde ERP

Padrões de uso para biblioteca shadcn/ui + extensões operacionais.

---

## Button

**Quando usar:** ações primárias, secundárias, destrutivas, ícone-only em toolbars.

| Variante | Uso |
|----------|-----|
| `default` | CTA principal (Salvar, Criar orçamento) |
| `secondary` | Ações frequentes não-primárias |
| `outline` | Cancelar, exportar, filtros |
| `ghost` | Ações em tabela, toolbar |
| `destructive` | Excluir, cancelar pedido |
| `link` | Navegação inline |

**Tamanhos:** `sm` em tabelas; `default` em forms; `lg` só em empty states.

**Classes base:**
```html
<!-- Primary -->
<button class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
```

| Estado | Light | Dark |
|--------|-------|------|
| Default | `bg-primary` slate-900 | `bg-primary` claro |
| Hover | `/90` | `/90` |
| Focus | `ring-ring` | `ring-ring` blue |
| Disabled | `opacity-50` | idem |

**Densidade:** `h-8 text-xs px-3` em modo compact.

---

## Input

**Quando usar:** texto, email, telefone, busca.

| Estado | Classes |
|--------|---------|
| Default | `h-9 rounded-md border border-input bg-background px-3 text-sm` |
| Focus | `ring-2 ring-ring ring-offset-2` |
| Error | `border-destructive focus-visible:ring-destructive` |
| Disabled | `opacity-50 cursor-not-allowed` |

**Dark:** fundo `bg-background` ou `bg-card`; borda `border-input` visível.

---

## Select / Combobox

**Select:** listas curtas (< 10), enums fixos.

**Combobox:** produtos, clientes, materiais com busca.

```html
<!-- Combobox trigger -->
<button class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
```

Popover: `bg-popover`, largura mínima = trigger.

---

## Textarea

Altura mínima `80px`; observações de orçamento. Resize vertical apenas.

---

## Checkbox / Radio / Switch

- Checkbox: seleção múltipla em tabela
- Radio: opções mutuamente exclusivas (tipo entrega)
- Switch: flags booleanas (ativo, notificar cliente)

Focus: `ring-2 ring-ring`.

---

## Badge / Status Badge

**Badge:** tags neutras, contadores.

**Status Badge:** estados de domínio — sempre texto + opcional ícone.

| Status | Variante |
|--------|----------|
| Rascunho | `neutral` |
| Enviado | `info` |
| Aprovado | `success` |
| Em produção | `info` |
| Atrasado | `warning` |
| Cancelado | `danger` |

```html
<span class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]">
  <span class="h-1.5 w-1.5 rounded-full bg-current" /> Aprovado
</span>
```

---

## Card / Metric Card

**Card:** agrupar seções; borda preferida a sombra.

**Metric Card:** KPI compacto — usar no máximo 4 por linha.

```html
<div class="rounded-lg border border-border bg-card p-4">
  <p class="text-xs text-muted-foreground">Orçamentos abertos</p>
  <p class="text-2xl font-semibold tabular-nums">24</p>
</div>
```

Evitar metric cards > 120px altura.

---

## Data Table

Ver `docs/TABLES.md`. Usar shadcn Table + TanStack Table.

---

## Tabs

Abas em detalhe de cliente, orçamento, configurações.

`TabsList`: `bg-muted`, `TabsTrigger` ativo `bg-background shadow-sm`.

---

## Breadcrumb

`text-sm text-muted-foreground`; último item `text-foreground font-medium`.

---

## Dialog

Modais para confirmação destrutiva e forms médios (< 15 campos).

- `max-w-lg` confirmação
- `max-w-2xl` form médio
- Overlay `bg-background/80 backdrop-blur-sm`

---

## Drawer / Sheet

**Drawer:** edição rápida lateral — padrão principal do ERP.

| Tamanho | Width |
|---------|-------|
| sm | 400px |
| md | 480px |
| lg | 640px |

**Sheet:** mobile sidebar e painéis inferiores.

---

## Dropdown Menu

Ações de linha (⋯), menu usuário, filtros salvos.

---

## Command Palette

`Ctrl+K` — busca global + ações rápidas (“Novo orçamento”, “Ir para Produção”).

---

## Toast

Sonner ou shadcn Toast. Posição `bottom-right`. Máx 3 visíveis.

---

## Empty / Loading / Error State

**Empty:**
```html
<div class="flex flex-col items-center justify-center py-12 text-center">
  <FileText class="h-12 w-12 text-muted-foreground/50" />
  <h3 class="mt-4 text-sm font-medium">Nenhum orçamento</h3>
  <p class="mt-1 text-sm text-muted-foreground">Crie o primeiro orçamento.</p>
  <Button class="mt-4">Novo orçamento</Button>
</div>
```

**Loading:** Skeleton com `animate-pulse bg-muted`.

**Error:** mensagem + botão “Tentar novamente”.

---

## Form Section

Título `text-sm font-semibold` + descrição opcional + grid de campos.

```html
<section class="space-y-4">
  <header>
    <h3 class="text-sm font-semibold">Dados do cliente</h3>
  </header>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
```

---

## Summary Panel

Painel direito sticky para orçamento/pedido.

```html
<aside class="sticky top-[calc(var(--topbar-height)+1rem)] w-[var(--summary-panel-width)] shrink-0 space-y-4 rounded-lg border border-border bg-card p-4">
```

Conteúdo: linhas de total, desconto, ações primárias.

---

## Line Item Row

Linha de orçamento: produto, dimensões, qtd, preço, total.

- Grid `grid-cols-[1fr_80px_80px_100px_100px_40px]`
- Total calculado readonly
- Botão remover `ghost` icon

---

## Price Field

Input com máscara BRL, alinhado à direita, `tabular-nums`.

```html
<input class="text-right tabular-nums" inputMode="decimal" />
```

---

## Measurement Field

Input numérico + select unidade (cm, m, m²).

---

## Customer Panel

Card compacto no topo do orçamento: avatar/iniciais, nome, telefone, link “Ver ficha”.

---

## Product Selector

Combobox com thumbnail opcional, SKU monospace, busca por nome/código.

---

## Production Status

Badge + dropdown de transição permitida (máquina de estados).

---

## Densidade global

`data-density="compact"` no container reduz:

- `h-8` inputs
- `text-xs` labels
- `py-2` table cells
