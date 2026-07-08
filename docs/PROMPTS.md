# Prompts reutilizáveis — Molde ERP

Use estes prompts ao criar novas telas com IA, mantendo consistência com o design system.

---

## Prompt base (sempre incluir)

```
Você está implementando uma tela do Molde ERP — sistema operacional para loja/fábrica de quadros e molduras.

Stack: Vite, React, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, TanStack Router, TanStack Query, React Hook Form, Zod.

Design system obrigatório:
- Leia docs/DESIGN.md, docs/TOKENS.md, docs/UX.md, docs/COMPONENTS.md, docs/TABLES.md, docs/FORMS.md
- Use tokens CSS de src/styles/theme.css (bg-background, text-foreground, etc.)
- NÃO criar dashboard genérico com muitos gráficos
- Priorizar tabelas densas, formulários compactos, drawers para edição rápida
- Resumo financeiro sticky em telas de orçamento
- Lucide icons (sem emojis)
- Suporte light e dark mode via CSS variables
- Densidade compact em tabelas operacionais
- Português (pt-BR) na UI
```

---

## Prompt: lista com DataTable

```
Crie a tela [NOME DA ENTIDADE] do Molde ERP.

Layout:
- Page header com título, descrição curta e botão primário "Novo [entidade]"
- Toolbar: busca (max-w-sm), filtros em popover, column visibility
- DataTable com TanStack Table + shadcn Table
- Colunas: [LISTAR COLUNAS]
- Row height compact (36px), sticky header
- Ações por linha: menu ⋯ (editar, duplicar, excluir)
- Paginação 25/50/100
- Drawer lateral (480px) para criar/editar com React Hook Form + Zod
- Empty state com CTA
- Loading skeleton

Estados: hover row, selected row, status badges semânticos.
Não usar cards grid como layout principal.
```

---

## Prompt: criação de orçamento

```
Crie a tela de criação/edição de orçamento do Molde ERP.

Layout 3 colunas (lg+):
1. Esquerda (280px): CustomerPanel, dados entrega, observações
2. Centro (flex): EditableTable de linhas — produto, medidas, qtd, preço unit, total
3. Direita (320px, sticky): SummaryPanel com subtotal, desconto, frete, total

Comportamento:
- Autosave rascunho debounce 800ms
- ProductSelector combobox com busca
- PriceField e MeasurementField com máscaras pt-BR
- Adicionar linha no final da tabela
- Header: status badge, ações Salvar / Enviar / Imprimir
- Validação Zod inline

Densidade compact. Sem gráficos.
```

---

## Prompt: detalhe com abas

```
Crie a tela de detalhe de [CLIENTE | PEDIDO | ORÇAMENTO] do Molde ERP.

Layout:
- Header fixo: identificação, status badge, ações primárias
- Breadcrumb acima
- Tabs: [listar abas]
- Conteúdo da aba ativa: DataTable ou FormSection conforme aba
- Manter contexto do cliente/entidade sempre visível no header

Não navegar para outra página para editar campos simples — usar drawer.
```

---

## Prompt: drawer de edição rápida

```
Crie um Drawer de edição para [ENTIDADE] no Molde ERP.

- Largura 480px, Sheet/Drawer shadcn
- Form RHF + Zod, mode onBlur
- Seções FormSection com grid 2 colunas
- Footer sticky: Cancelar (outline) + Salvar (primary)
- Toast em sucesso/erro
- Fechar com Esc; confirmar se form dirty

Campos: [LISTAR]
```

---

## Prompt: dashboard operacional

```
Crie o Dashboard operacional do Molde ERP.

Máximo 4 MetricCards compactos em linha:
- Orçamentos abertos
- Pedidos em produção
- Entregas hoje
- Valor pipeline (opcional)

Abaixo:
- DataTable "Pendências de hoje" (prioridade, tipo, cliente, prazo, status)
- Lista simples "Últimos orçamentos" (5 itens)

PROIBIDO: múltiplos gráficos, charts grandes, cards decorativos.
Altura total de métricas < 120px cada.
```

---

## Prompt: tela de produção

```
Crie a tela de Produção do Molde ERP.

- Filtros rápidos por status (tabs ou toggle group)
- DataTable: pedido, cliente, produto, etapa, prazo, responsável, status
- ProductionStatus badge com dropdown de transição
- Drawer para detalhe da ordem de serviço
- Densidade compact, sticky header

Priorizar tabela sobre kanban no MVP.
```

---

## Prompt: implementar componente

```
Implemente o componente [NOME] para o Molde ERP seguindo docs/COMPONENTS.md.

- TypeScript + React
- Variantes com cva() se necessário
- Tokens semânticos (não cores hardcoded)
- Estados: default, hover, focus, disabled, error
- Light e dark via CSS variables
- Export em src/components/ui/ ou src/components/[domain]/
- Sem comentários desnecessários no código
```

---

## Prompt: revisão de consistência

```
Revise a tela [ARQUIVO/ROTA] contra o design system Molde ERP.

Verifique:
1. Usa tokens CSS (não bg-gray-500 hardcoded)
2. Densidade adequada para contexto operacional
3. Tabela segue docs/TABLES.md
4. Form segue docs/FORMS.md
5. Não parece dashboard genérico
6. Dark mode legível em tabelas
7. Focus states e aria labels
8. Ações destrutivas com confirmação

Liste desvios e correções sugeridas.
```

---

## Variáveis para substituir

| Variável | Exemplo |
|----------|---------|
| `[NOME DA ENTIDADE]` | Clientes, Materiais |
| `[LISTAR COLUNAS]` | Nome, Email, Status, Valor |
| `[ENTIDADE]` | cliente, material |
| `[listar abas]` | Dados, Orçamentos, Pedidos |
