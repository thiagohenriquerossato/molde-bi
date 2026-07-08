# Produto (NCM + Unidade de Medida canônica) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Atualizar o frontend de Produto para suportar `ncm_code` (opcional) no bloco de Classificação e restringir `unit_of_measure` a uma lista canônica enviada sempre em lowercase, bloqueando salvamento quando houver valor inválido/legado.

**Architecture:** A tipagem/integração fica centralizada em `src/services/products/products.types.ts` e `src/services/products/products.mapper.ts`. O formulário continua com `react-hook-form` + `zod`, mas passa a usar enum canônico para `unitOfMeasure` e adiciona `ncmCode`. Para UX de legado, o form armazena o valor original em um campo somente-UI e exibe um alerta; o schema bloqueia submit até o usuário escolher um valor válido.

**Tech Stack:** React + TypeScript, react-hook-form, zod, UI components (Select/Input) em `src/components/ui/*`, requests via `authenticatedRequest`.

---

## Decisões (aprovadas)

- **`unit_of_measure`**: permitido no front apenas `un`, `cm`, `m`, `m2`, `ml`, `kg` e sempre enviado em lowercase.
- **Legado/inválido**: bloquear salvamento quando o valor não estiver na lista canônica (após normalizações básicas).
- **Normalização**: normalizar apenas variações seguras (caixa e símbolo \(ex.: `M²` -> `m2`\)). Valores desconhecidos continuam inválidos.
- **`ncm_code`**: string opcional/nullable, máximo 20 caracteres, exibida e persistida no bloco “Classificação”.

---

### Task 1: Atualizar tipos de Produto (API, detalhe e payload)

**Files:**
- Modify: `src/services/products/products.types.ts`

**Step 1: Adicionar `ncm_code` em `ProductClassificationApi`**
- `ncm_code?: string | null;`

**Step 2: Adicionar `ncmCode` em `ProductDetail`**
- `ncmCode: string | null;`

**Step 3: Adicionar `ncm_code` em `ProductWritePayload`**
- `ncm_code?: string | null;`

**Step 4: Ajustar constantes de unidade**
- Substituir `PRODUCT_UNIT_OPTIONS` para valores canônicos (lowercase) e incluir `ml` e `kg`.

**Verify:**
- TypeScript compila sem erros de tipo relacionados a `ncmCode`/`ncm_code`.

---

### Task 2: Mapear `ncm_code` e normalização de unidade no mapper

**Files:**
- Modify: `src/services/products/products.mapper.ts`
- Modify: `src/features/products/schema/productFormSchema.ts`

**Step 1: Implementar normalizador de unidade canônica**
- Função pura `normalizeUnitOfMeasure(input: string): string`:
  - `trim()`
  - `toLowerCase()`
  - mapear `m²` -> `m2`
  - retornar string normalizada

**Step 2: `mapProductToDetail`**
- Mapear `product.classification.ncm_code ?? null` -> `ncmCode`

**Step 3: `mapProductDetailToFormValues`**
- Preencher `ncmCode` a partir de `product.ncmCode ?? ""`
- `unitOfMeasure`:
  - normalizar; se estiver em lista canônica, usar valor normalizado
  - se não estiver, setar `unitOfMeasure` como `""` (para forçar validação) e guardar o valor original em `unitOfMeasureLegacy`

**Step 4: `mapFormValuesToWritePayload`**
- Enviar `unit_of_measure` sempre como lowercase (já validado)
- Enviar `ncm_code`:
  - `values.ncmCode.trim() || null` (respeitando opcionalidade)

**Verify:**
- Editar produto com `unit_of_measure = "CM"` não bloqueia (vira `cm`)
- Editar produto com `unit_of_measure = "foo"` bloqueia (campo vazio + legacy preenchido)

---

### Task 3: Atualizar schema e valores padrão do formulário

**Files:**
- Modify: `src/features/products/schema/productFormSchema.ts`

**Step 1: Adicionar campos**
- `ncmCode: z.string().max(20, "...").optional()` (permitir vazio)
- `unitOfMeasureLegacy: z.string().optional()` (somente UI)

**Step 2: Trocar `unitOfMeasure` para enum canônico**
- `z.enum(["un","cm","m","m2","ml","kg"])` com mensagem de erro amigável (obrigatório).

**Step 3: Ajustar `emptyProductFormValues`**
- `unitOfMeasure: "un"`
- `ncmCode: ""`
- `unitOfMeasureLegacy: ""`

**Verify:**
- Form não permite salvar se `unitOfMeasure` estiver vazio/fora do enum.

---

### Task 4: UI — Campo NCM e nova seção “Classificação”

**Files:**
- Modify: `src/features/products/components/ProductGeneralSection.tsx`

**Step 1: Criar seção “Classificação”**
- Mover inputs de `categoryName` e `supplierId` (e seus helpers) para essa seção.

**Step 2: Adicionar campo “NCM”**
- `Input` com `maxLength={20}`
- Opcional (sem asterisco)

**Step 3: Atualizar Select de unidade para lista canônica**
- Usar `PRODUCT_UNIT_OPTIONS` canônico (lowercase).

**Step 4: UX legado/inválido**
- Se `unitOfMeasureLegacy` estiver preenchido e `unitOfMeasure` vazio, exibir mensagem de alerta abaixo do Select:
  - “Unidade atual inválida/legada: <valor>. Selecione uma unidade válida para salvar.”

**Verify:**
- Usuário vê claramente o motivo do bloqueio ao editar item legado.

---

### Task 5: Exibir `ncm_code` no resumo/detalhe (Classificação)

**Files:**
- Modify: `src/features/products/components/ProductSidebarSummary.tsx`

**Step 1: Adicionar bloco visual de Classificação**
- Mostrar `Categoria` e `NCM` (apenas quando existirem).

**Verify:**
- Ao preencher NCM no form, aparece no resumo; se vazio, não aparece.

---

### Task 6: Persistência completa (create/update/duplicate)

**Files:**
- Modify: `src/services/products/products.service.ts`

**Step 1: `duplicateProduct`**
- Incluir `ncm_code` no payload de duplicação a partir de `source.ncmCode` (se existir).
- Garantir `unit_of_measure` sempre canônico/lowercase.

**Verify:**
- Duplicar produto mantém NCM e unidade válida.

---

### Task 7: Verificação final

**Step 1: Lint/Typecheck**
- Rodar o comando padrão do projeto (descobrir via `package.json`):
  - `pnpm lint`/`npm run lint` e/ou `pnpm typecheck`/`npm run build`

**Step 2: Smoke test manual (rápido)**
- Criar produto com NCM vazio e unidade `cm`
- Editar produto e preencher NCM
- Simular produto legado (via devtools/mock se disponível) e confirmar bloqueio e mensagem

---

## Observações de integração (Swagger/OpenAPI)

- O backend valida:
  - `ncm_code`: string nullable, `maxLength=20`
  - `unit_of_measure`: enum canônico; backend tolera variações de caixa, mas o front envia sempre lowercase.

