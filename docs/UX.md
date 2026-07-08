# Regras de UX — Molde ERP

Comportamento e experiência para ERP operacional de molduras e quadros.

---

## Princípios

1. **Contexto nunca se perde** — cliente, totais e status permanecem visíveis durante edição
2. **Ação rápida > navegação** — drawers, inline edit, command palette
3. **Tabela primeiro** — listagens em DataTable; cards só como vista alternativa
4. **Confirmação só no destrutivo** — excluir, cancelar pedido, estornar
5. **Feedback imediato** — toast em salvar; inline error em validação

---

## Navegação

### Sidebar

- Máximo 8–10 itens principais
- Agrupar secundários em “Mais” ou Configurações
- Item ativo sempre visível (scroll se necessário)
- Atalho `Ctrl+K` / `Cmd+K` para command palette

### Breadcrumb

Usar quando profundidade ≥ 2:

```
Orçamentos / ORC-2024-0842 / Editar
```

### Busca global

- Placeholder contextual: `Buscar clientes, orçamentos, pedidos...`
- Resultados agrupados por entidade
- Enter abre primeiro resultado; setas navegam

---

## Padrões de interação

| Situação | Padrão |
|----------|--------|
| Edição rápida de 1–5 campos | Drawer direito |
| Criar entidade simples | Drawer ou modal médio |
| Orçamento completo | Página dedicada + painel resumo |
| Visualizar detalhe | Split view ou página com abas |
| Ação em lote na tabela | Barra flutuante ao selecionar linhas |
| Duplicar orçamento | Ação na linha + confirmação leve (toast undo opcional) |

---

## Orçamento — regras específicas

- **Resumo financeiro fixo** à direita (sticky): subtotal, desconto, frete, total
- **Cliente sempre no topo** com link para ficha
- Linhas editáveis inline: produto, qtd, medidas, preço unitário, total linha
- Autosave de rascunho a cada alteração (debounce 800ms) + indicador “Salvo” / “Salvando...”
- Status do orçamento em badge + cor semântica
- Impressão/PDF como ação secundária no header

---

## Produção — regras específicas

- Status com badge + ícone (não só cor)
- Transições de status: dropdown na linha ou drawer
- Filtro rápido por etapa: Aguardando | Em corte | Em montagem | Pronto | Entregue
- Data prometida sempre visível na listagem

---

## Formulários operacionais

- Máximo 2–3 colunas em desktop
- Agrupar por contexto: “Dados do cliente”, “Entrega”, “Pagamento”
- Tab order lógico; Enter não submete form inteiro em tabelas
- Validação on blur; erro abaixo do campo
- Campos obrigatórios: asterisco na label

---

## Feedback

| Evento | Feedback |
|--------|----------|
| Salvar sucesso | Toast success 3s |
| Erro de API | Toast destructive + mensagem acionável |
| Validação | Inline + focus no primeiro erro |
| Loading lista | Skeleton rows |
| Loading ação | Spinner no botão + disabled |

---

## Estados vazios

- Ícone Lucide 48px muted
- Título curto + descrição 1 linha
- CTA primária (“Criar primeiro orçamento”)

---

## Telas principais

### Dashboard operacional simples

| Aspecto | Especificação |
|---------|---------------|
| Layout | 4 metric cards compactos + tabela “Pendências hoje” + lista “Últimos orçamentos” |
| Componentes | MetricCard, DataTable, StatusBadge |
| Densidade | Moderada |
| Light/Dark | Igual; dark reforça bordas da tabela |
| Risco UX | Excesso de gráficos — limitar a 0–1 mini chart opcional |

### Clientes

| Aspecto | Especificação |
|---------|---------------|
| Layout | Page header + filtros + DataTable |
| Componentes | DataTable, Drawer (novo/editar), StatusBadge |
| Densidade | Compact |
| Risco UX | Drawer com muitos campos — dividir em abas |

### Detalhe do cliente

| Aspecto | Especificação |
|---------|---------------|
| Layout | Header cliente + abas (Dados, Orçamentos, Pedidos, Financeiro) |
| Componentes | Tabs, DataTable, SummaryPanel |
| Densidade | Default |
| Risco UX | Perder contexto ao trocar aba — manter header fixo |

### Produtos / Materiais / Molduras

| Aspecto | Especificação |
|---------|---------------|
| Layout | Tabela + filtros por categoria; drawer para CRUD |
| Componentes | DataTable, ProductSelector pattern, MeasurementField |
| Densidade | Compact |
| Risco UX | Colunas demais — column visibility |

### Criação de orçamento

| Aspecto | Especificação |
|---------|---------------|
| Layout | 3 colunas: cliente/entrega (esq) | linhas (centro) | resumo (dir sticky) |
| Componentes | EditableTable, LineItemRow, PriceField, SummaryPanel |
| Densidade | Compact |
| Risco UX | Scroll esconde totais — painel direito sticky obrigatório |

### Lista de orçamentos

| Aspecto | Especificação |
|---------|---------------|
| Layout | Filtros status + período + DataTable |
| Componentes | DataTable, StatusBadge, bulk actions |
| Densidade | Compact |

### Detalhe do orçamento

| Aspecto | Especificação |
|---------|---------------|
| Layout | Header status + ações + tabela linhas + resumo lateral |
| Componentes | Tabs (histórico), SummaryPanel |
| Densidade | Compact |

### Pedidos

| Aspecto | Especificação |
|---------|---------------|
| Layout | Similar orçamentos; coluna produção e entrega |
| Componentes | ProductionStatus, DataTable |
| Densidade | Compact |

### Produção

| Aspecto | Especificação |
|---------|---------------|
| Layout | Tabela por status OU colunas kanban leves (sem drag pesado no MVP) |
| Componentes | StatusBadge, DataTable, Drawer OS |
| Densidade | Compact |
| Risco UX | Kanban vira brinquedo — priorizar tabela filtrável |

### Estoque

| Aspecto | Especificação |
|---------|---------------|
| Layout | Tabela + alertas linha (badge warning) |
| Componentes | DataTable, inline qty edit |
| Densidade | Compact |
| Risco UX | Sem sticky header em listas longas |

### Financeiro básico

| Aspecto | Especificação |
|---------|---------------|
| Layout | Tabela lançamentos + filtros período/status |
| Componentes | DataTable, PriceField, StatusBadge |
| Densidade | Compact |

### Configurações

| Aspecto | Especificação |
|---------|---------------|
| Layout | Sidebar secundária + form sections |
| Componentes | FormSection, Switch |
| Densidade | Comfortable |
| Risco UX | Formulário longo — dividir em seções colapsáveis |

---

## Atalhos de teclado (recomendados)

| Atalho | Ação |
|--------|------|
| `Ctrl+K` | Command palette |
| `Ctrl+S` | Salvar (em formulários) |
| `Esc` | Fechar drawer/modal |
| `N` | Novo (contextual, quando foco na lista) |

---

## Mobile / tablet

- Tabelas: `overflow-x-auto`
- Summary panel: vira drawer inferior em `< lg`
- Sidebar: sheet overlay

---

## Anti-patterns

- Modal dentro de modal
- Redirecionar para outra página para editar 2 campos
- Perder seleção de linhas ao filtrar sem aviso
- Gráfico ocupando > 30% da viewport em telas operacionais
- Confirmação para “Salvar rascunho”
