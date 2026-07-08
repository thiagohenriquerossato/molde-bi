# Tabelas — Molde ERP

Padrão para DataTable e tabelas editáveis — elemento central do ERP.

---

## Dimensões

| Modo | Header height | Row height | Cell padding |
|------|---------------|------------|--------------|
| Compact | 32px | 36px | `px-3 py-1.5` |
| Default | 36px | 40px | `px-4 py-2` |
| Comfortable | 40px | 44px | `px-4 py-2.5` |

**Padrão Molde:** `compact` em orçamento/produção/estoque; `default` em cadastros.

---

## Estrutura HTML (shadcn)

```tsx
<div className="rounded-lg border border-border bg-card">
  <Table>
    <TableHeader className="bg-[hsl(var(--table-header))]">
      <TableRow className="hover:bg-transparent border-b border-border">
        <TableHead className="h-9 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Cliente
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="border-b border-border transition-colors hover:bg-[hsl(var(--table-row-hover))] data-[state=selected]:bg-[hsl(var(--table-row-selected))]">
        <TableCell className="px-4 py-2 text-sm">...</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

---

## Sticky header

```html
<thead class="sticky top-0 z-[var(--z-sticky)] bg-[hsl(var(--table-header))]">
```

Em páginas com topbar fixa, offset = `--topbar-height`.

---

## Colunas tipadas

### Status

- Largura fixa `120px`
- `StatusBadge` centralizado ou `text-left`

### Moeda

```html
<td class="text-right tabular-nums font-medium">R$ 1.250,00</td>
```

### Quantidade

```html
<td class="text-right tabular-nums">12</td>
```

### Medidas

```html
<td class="text-right tabular-nums">
  120 <span class="text-muted-foreground text-xs">cm</span>
</td>
```

### Ações

- Coluna fixa `48px` à direita
- `DropdownMenu` com ícone `MoreHorizontal`
- `sticky right-0 bg-card` em tabelas largas

---

## Row states

| Estado | Implementação |
|--------|---------------|
| Hover | `hover:bg-[hsl(var(--table-row-hover))]` |
| Selected | `data-[state=selected]` + `border-l-2 border-l-primary` |
| Disabled | `opacity-50 pointer-events-none` |
| Error (inline edit) | `bg-destructive/5` + célula `ring-1 ring-destructive` |

### Dark mode

- Bordas `border-border` sempre visíveis
- Hover com contraste +8% luminosidade sobre `card`
- Selected: `bg-accent` + borda esquerda `primary`

---

## Inline editing

1. Duplo-clique ou ícone “Editar” ativa célula
2. Input ocupa célula (`h-8`, sem borda externa ou `ring-1 ring-ring`)
3. `Enter` confirma; `Esc` cancela
4. `Tab` move para próxima célula editável
5. Erro: borda `destructive` + tooltip/mensagem abaixo

```tsx
<TableCell className="p-0">
  <Input className="h-8 rounded-none border-0 focus-visible:ring-1" />
</TableCell>
```

---

## Seleção e bulk actions

- Checkbox na primeira coluna (`w-12`)
- Ao selecionar ≥1 linha: barra fixa inferior

```html
<div class="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-lg border bg-card px-4 py-2 shadow-md">
  <span class="text-sm">3 selecionados</span>
  <Button variant="outline" size="sm">Exportar</Button>
  <Button variant="destructive" size="sm">Excluir</Button>
</div>
```

---

## Toolbar da tabela

Ordem: Search → Filtros → Column visibility → Export → Primary action

```html
<div class="flex items-center justify-between gap-4 py-4">
  <Input class="max-w-sm" placeholder="Filtrar..." />
  <div class="flex items-center gap-2">
    <Button variant="outline" size="sm">Filtros</Button>
    <Button size="sm">Novo</Button>
  </div>
</div>
```

---

## Filtros

- Popover com `Checkbox` para status
- Date range para período
- Chips de filtro ativo abaixo da toolbar (removíveis)

---

## Ordenação

- Ícone `ArrowUpDown` no header
- `aria-sort="ascending|descending|none"`
- Estado visual: ícone ativo `text-foreground`

---

## Paginação

- Padrão: 25 / 50 / 100 por página
- Controles: Anterior | Página X de Y | Próxima
- Alternativa: infinite scroll só em feeds de atividade

---

## Column visibility

`DropdownMenu` com checkboxes; persistir em `localStorage` por rota.

---

## Empty state

Dentro do `TableBody`:

```html
<tr>
  <td colspan="100%" class="h-48 text-center">
    <!-- Empty state component -->
  </td>
</tr>
```

---

## Loading skeleton

5–8 linhas de `Skeleton` com altura = row height.

```html
<div class="h-4 w-full animate-pulse rounded bg-muted" />
```

---

## Virtualização

Para listas > 200 linhas: `@tanstack/react-virtual` com row height fixo.

---

## Responsivo

```html
<div class="w-full overflow-x-auto">
  <Table class="min-w-[800px]">...</Table>
</div>
```

Breakpoint `< md`: considerar card-list alternativo para clientes.

---

## TanStack Table — config recomendada

```ts
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  enableRowSelection: true,
  state: { rowSelection, sorting, columnFilters, columnVisibility },
});
```

---

## Acessibilidade

- `<table>` semântico via shadcn Table
- `scope="col"` em headers
- Anunciar ordenação com `aria-label`
- Linha selecionada: `aria-selected="true"`
- Não depender só de cor para status — usar texto no badge

---

## Anti-patterns

- Div grid imitando tabela
- Row height inconsistente
- Remover outline de foco em células editáveis
- Paginação sem indicar total de registros
- Ações destrutivas sem confirmação na bulk bar
