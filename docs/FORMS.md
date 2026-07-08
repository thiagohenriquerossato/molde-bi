# Formulários operacionais — Molde ERP

Padrões para React Hook Form + Zod + shadcn Form.

---

## Layout

### Colunas

| Viewport | Colunas |
|----------|---------|
| `< md` | 1 |
| `md` | 2 |
| `lg` | 3 (máximo em cadastros) |

Orçamento: layout custom (não form grid tradicional) — ver `docs/UX.md`.

### Espaçamento

- Entre campos: `gap-4` (compact: `gap-3`)
- Entre seções: `space-y-6`
- Label → input: `space-y-1.5`

---

## Labels

```html
<Label class="text-xs font-medium leading-none">
  Nome do cliente <span class="text-destructive">*</span>
</Label>
```

- Sempre associar `htmlFor` + `id`
- Help text: `text-xs text-muted-foreground` abaixo do campo
- Sem placeholders como substituto de label

---

## Validação

### Estratégia

| Momento | Comportamento |
|---------|---------------|
| onBlur | Validar campo individual |
| onChange | Revalidar após primeiro erro |
| onSubmit | Validar form completo; focus primeiro erro |

### Mensagens

- Abaixo do campo: `text-xs text-destructive`
- Tom direto: “Informe um CPF válido” (não “Campo inválido”)
- Zod messages em português

```ts
const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  valor: z.number().min(0, "Valor deve ser positivo"),
});
```

---

## Campos obrigatórios

- Asterisco vermelho na label
- `aria-required="true"`
- Não bloquear submit silenciosamente — mostrar erros

---

## Máscaras

| Campo | Máscara |
|-------|---------|
| CPF/CNPJ | `99.999.999/9999-99` dinâmico |
| Telefone | `(99) 99999-9999` |
| CEP | `99999-999` |
| Moeda | R$ com separadores pt-BR |
| Medida | numérico + sufixo unidade |

Usar `react-number-format` ou similar; valor interno sempre número normalizado.

---

## Moeda (Price Field)

```tsx
<FormField
  control={form.control}
  name="valor"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Valor unitário</FormLabel>
      <FormControl>
        <Input
          className="text-right tabular-nums"
          inputMode="decimal"
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

- Armazenar em centavos (integer) ou decimal conforme API
- Exibir formatado; parse no blur

---

## Medidas (Measurement Field)

```tsx
<div class="flex gap-2">
  <Input type="number" class="tabular-nums" />
  <Select defaultValue="cm">
    <SelectItem value="cm">cm</SelectItem>
    <SelectItem value="m">m</SelectItem>
    <SelectItem value="m2">m²</SelectItem>
  </Select>
</div>
```

Validar mínimos por tipo de produto (ex.: largura > 0).

---

## Autocomplete (Cliente / Produto)

- Debounce busca: 300ms
- Mínimo 2 caracteres
- Loading state no Combobox
- Exibir SKU/código secundário em `text-muted-foreground`

---

## Navegação por teclado

- `Tab` / `Shift+Tab` entre campos
- Em tabela editável: `Tab` avança células
- `Ctrl+S` submit (preventDefault no browser save)
- `Esc` fecha drawer sem perder rascunho → confirmar se dirty

---

## Salvar rascunho

- Orçamentos/pedidos: autosave com debounce 800ms
- Indicador no header: “Rascunho salvo às 14:32”
- Botão explícito “Salvar rascunho” em forms longos
- `formState.isDirty` bloqueia navegação com prompt

---

## Ações do formulário

Posição: footer sticky em drawer; abaixo do form em página.

| Ordem | Botão |
|-------|-------|
| Esquerda | Destructive (raro) |
| Direita | Cancelar (outline) → Salvar (primary) |

```html
<div class="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-card p-4">
  <Button variant="outline">Cancelar</Button>
  <Button type="submit">Salvar</Button>
</div>
```

Loading: `<Button disabled><Loader2 class="animate-spin" /> Salvando...</Button>`

---

## Form em Drawer

- Header: título + close
- Body: scroll `flex-1 overflow-y-auto p-4`
- Footer: ações sticky
- Largura: `480px` padrão

---

## Form em página completa

Usar quando > 20 campos ou fluxo multi-etapa (wizard futuro).

Seções colapsáveis (`Collapsible`) para Configurações.

---

## React Hook Form + shadcn

```tsx
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues,
  mode: "onBlur",
});
```

Sempre usar `<FormField>` + `FormMessage` — não espalhar erros manualmente.

---

## Densidade em formulários

| Elemento | Compact | Default |
|----------|---------|---------|
| Input height | `h-8` | `h-9` |
| Label | `text-xs` | `text-xs` |
| Gap | `gap-3` | `gap-4` |

---

## Dark mode

- Inputs: `bg-background` com borda visível
- Erro: `border-destructive` — não reduzir contraste do texto de erro
- Placeholder: `text-muted-foreground` legível (não abaixo de 4.5:1 em labels adjacentes)

---

## Checklist por form

- [ ] Schema Zod com mensagens PT
- [ ] Labels em todos os inputs
- [ ] Focus no primeiro erro ao submit
- [ ] Loading/disabled no submit
- [ ] Toast de sucesso/erro
- [ ] Máscaras em campos formatados
- [ ] `autocomplete` correto (email, tel, address-level1)
