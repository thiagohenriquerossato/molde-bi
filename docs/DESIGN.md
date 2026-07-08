# Molde ERP — Design System

Design system inicial para ERP operacional de loja/fábrica de quadros e molduras. Extraído das referências em `/references` e adaptado para produto denso, orientado a tabelas, orçamentos e produção — não um dashboard genérico.

---

## 1. Personalidade visual

### Como o sistema deve parecer

Uma **ferramenta de trabalho diário**: limpa, precisa e confiável. Visual próximo de produtos SaaS operacionais modernos (shadcn/ui, Linear, Stripe Dashboard administrativo), mas com **mais densidade** que um CRM de vendas genérico.

### Sensação geral

| Dimensão | Direção |
|----------|---------|
| Densidade | Alta em tabelas e formulários; moderada em navegação |
| Sofisticação | Alta — tipografia consistente, bordas finas, hierarquia clara |
| Formalidade | Profissional e neutra; sem ornamentos |
| Tom | Eficiente, objetivo, “sistema de balcão/oficina digital” |

### O que transmitir ao usuário

- **Controle**: status, valores e prazos sempre visíveis
- **Velocidade**: ações principais a um clique; pouca navegação
- **Confiança**: números legíveis, estados explícitos, feedback imediato
- **Foco operacional**: orçamento e produção são o centro, não gráficos decorativos

### Princípios extraídos das referências

Das imagens de referência (ERP/CRM light mode):

- Sidebar fixa + topbar com busca global
- Superfícies brancas sobre fundo cinza muito claro
- Primary escuro (slate/navy) para ações e item ativo da navegação
- Bordas `1px` leves em vez de sombras pesadas
- Badges pastéis para status
- Métricas compactas no topo (quando necessário), nunca dominando a tela
- Tabelas como protagonistas em listagens

### O que NÃO é este sistema

- Dashboard com muitos gráficos e cards grandes
- UI “marketing” com gradientes e ilustrações
- Formulários longos em página única
- Dark mode por inversão automática de cores

---

## 2. Light mode — especificação

### Fundos e superfícies

| Token | Uso | Valor |
|-------|-----|-------|
| `background` | Área principal de trabalho | `#F8FAFC` (slate-50) |
| `card` | Cards, painéis, tabela container | `#FFFFFF` |
| `popover` | Dropdowns, menus, combobox | `#FFFFFF` |
| `muted` | Inputs de busca, zebra leve, chips | `#F1F5F9` (slate-100) |
| `secondary` | Botões secundários, tags neutras | `#F1F5F9` |
| `accent` | Hover em listas, seleção suave | `#F1F5F9` |

### Sidebar e topbar

| Elemento | Especificação |
|----------|---------------|
| Sidebar bg | `#FFFFFF` com borda direita `border-border` |
| Sidebar item | Texto `muted-foreground`, ícone 16px |
| Sidebar item ativo | Fundo `primary`, texto `primary-foreground`, `rounded-md` |
| Topbar bg | `#FFFFFF`, altura 56px, borda inferior |
| Topbar search | `bg-muted`, sem borda visível, `h-9`, ícone à esquerda |

### Tabelas

| Elemento | Especificação |
|----------|---------------|
| Container | `bg-card`, borda `border`, `rounded-lg` |
| Header | `bg-muted/50`, texto `muted-foreground`, `text-xs font-medium uppercase tracking-wide` |
| Row | Altura 40px (compact) / 44px (default) |
| Row hover | `bg-muted/40` |
| Row selected | `bg-accent` + borda esquerda 2px `primary` |
| Divider | `border-b border-border` apenas horizontal |

### Texto

| Nível | Cor | Uso |
|-------|-----|-----|
| Primary | `#0F172A` (slate-900) | Títulos, valores, nomes |
| Secondary | `#475569` (slate-600) | Subtítulos, metadados |
| Muted | `#64748B` (slate-500) | Labels, placeholders, timestamps |

### Cores semânticas

| Papel | Base | Foreground | Uso |
|-------|------|------------|-----|
| Primary | `#0F172A` | `#F8FAFC` | CTAs, nav ativa, barras de progresso |
| Accent (info) | `#EFF6FF` | `#1D4ED8` | Links, seleção informativa |
| Success | `#ECFDF5` | `#047857` | Pago, concluído, em estoque |
| Warning | `#FFFBEB` | `#B45309` | Atraso, pendência, rascunho |
| Danger | `#FEF2F2` | `#B91C1C` | Cancelado, erro, estoque crítico |
| Info | `#EFF6FF` | `#1D4ED8` | Em produção, aguardando |

### Estados interativos

| Estado | Regra |
|--------|-------|
| Hover (botão primary) | `primary/90` |
| Hover (botão outline) | `bg-muted` |
| Active | `scale` proibido; usar `bg-muted` ou escurecer 5% |
| Disabled | `opacity-50`, `pointer-events-none` |
| Focus ring | `ring-2 ring-ring ring-offset-2 ring-offset-background` |
| Selected (lista/tabela) | `bg-accent` + indicador lateral opcional |

### Sombras e bordas

- Bordas: `1px solid` via token `border` (`#E2E8F0`)
- Sombras: mínimas — `shadow-sm` apenas em popovers/drawers/modais
- Cards operacionais: preferir borda a sombra

### Contraste

- Texto body sobre `background`: mínimo **4.5:1**
- Texto muted: mínimo **4.5:1** em labels; **3:1** aceitável só em metadados secundários
- Status badges: sempre par fundo/texto do mesmo hue

---

## 3. Dark mode — especificação

Dark mode **desenhado**, não invertido. Superfícies em camadas azul-acinzentadas (slate), evitando `#000` puro.

### Fundos e superfícies (camadas)

| Camada | Token | Valor aprox. | Uso |
|--------|-------|--------------|-----|
| 0 — Base | `background` | `#0B1120` | Workspace |
| 1 — Surface | `card` | `#111827` | Cards, tabelas |
| 2 — Elevated | custom `--elevated` | `#1E293B` | Drawers, modais, popovers |
| 3 — Muted | `muted` | `#1E293B` | Inputs, hover de linha |

### Sidebar e topbar (dark)

| Elemento | Especificação |
|----------|---------------|
| Sidebar | `bg-card`, borda `border` |
| Item ativo | `bg-primary` (`#E2E8F0` texto escuro) ou `bg-muted` + texto claro — usar primary claro `#F1F5F9` com foreground escuro |
| Topbar | Mesmo nível que `card`, não fundir com background |

**Decisão dark:** `primary` = `#F1F5F9` (ação clara sobre fundo escuro); `primary-foreground` = `#0F172A`.

### Tabelas (dark)

| Elemento | Especificação |
|----------|---------------|
| Header | `bg-muted/80`, texto `muted-foreground` |
| Row hover | `bg-muted/60` |
| Row selected | `bg-accent/80` + borda esquerda `ring` color |
| Borders | `#334155` — visíveis, nunca `white/5` |
| Valores monetários | `text-foreground` semibold, `tabular-nums` |

### Texto (dark)

| Nível | Cor |
|-------|-----|
| Primary | `#F8FAFC` |
| Secondary | `#CBD5E1` |
| Muted | `#94A3B8` |

### Semânticas (dark)

Badges com fundo **20% opacity** da cor base + texto saturado:

| Papel | Fundo | Texto |
|-------|-------|-------|
| Success | `#064E3B` / 40% | `#6EE7B7` |
| Warning | `#78350F` / 40% | `#FCD34D` |
| Danger | `#7F1D1D` / 40% | `#FCA5A5` |
| Info | `#1E3A8A` / 40% | `#93C5FD` |

### Estados (dark)

- Hover: clarear superfície +1 nível, não inverter
- Focus: `ring-blue-400` (`--ring: 96 165 250`)
- Disabled: `opacity-40`
- Sombras: quase nenhuma; profundidade por contraste de superfície

### Contraste (dark)

- Texto principal sobre `card`: ≥ 7:1 preferível em tabelas densas
- Bordas sempre perceptíveis em `border` token
- Não usar cinza abaixo de `#64748B` para texto importante

---

## 4. Tipografia

### Famílias

| Papel | Fonte | Fallback |
|-------|-------|----------|
| Principal | **Inter** | `system-ui, sans-serif` |
| Monospace (códigos, SKU) | **JetBrains Mono** | `ui-monospace, monospace` |

### Escala

| Token | Size | Line-height | Weight | Uso |
|-------|------|-------------|--------|-----|
| `text-2xl` | 24px | 32px | 600 | Título de página |
| `text-xl` | 20px | 28px | 600 | Título de seção |
| `text-lg` | 18px | 28px | 600 | Subtítulo de painel |
| `text-base` | 14px | 20px | 400 | Body padrão |
| `text-sm` | 13px | 18px | 400 | Tabelas, formulários |
| `text-xs` | 12px | 16px | 500 | Labels, headers de tabela |
| `text-2xs` | 11px | 14px | 500 | Metadados, timestamps |

### Tabelas

- Header: `text-xs font-medium uppercase tracking-wide text-muted-foreground`
- Célula: `text-sm text-foreground`
- Secundário na célula: `text-xs text-muted-foreground`

### Labels de formulário

- `text-xs font-medium text-foreground`
- Obrigatório: asterisco `text-destructive` após label

### Números, moeda e medidas

```css
.tabular-nums { font-variant-numeric: tabular-nums; }
```

- Moeda: alinhamento à direita, `font-medium`, `tabular-nums`
- Quantidade: centralizado ou à direita conforme coluna
- Medidas (cm, m²): sufixo em `text-muted-foreground text-xs`
- Decimais: locale `pt-BR`; separador milhar `.` e decimal `,`

### Truncamento

- Nomes longos: `truncate max-w-[200px]` com `title` tooltip
- Tabelas: nunca quebrar linha em colunas de status/valor; usar truncate + tooltip

---

## 5. Layout system

### Dimensões estruturais

| Elemento | Valor |
|----------|-------|
| Sidebar width | `240px` (colapsada: `64px`) |
| Topbar height | `56px` |
| Page padding | `24px` (compact: `16px`) |
| Gap entre seções | `16px` |
| Drawer width | `480px` (form) / `640px` (orçamento) |
| Summary panel | `320px` fixo à direita |

### Padrões de layout

```
┌──────────┬─────────────────────────────────────────────┐
│ Sidebar  │ Topbar (search + ações globais)             │
│          ├─────────────────────────────────────────────┤
│          │ Page header (título + ações)                │
│          ├──────────────────────────┬──────────────────┤
│          │ Conteúdo principal       │ Summary panel    │
│          │ (tabela / formulário)    │ (fixo)           │
│          └──────────────────────────┴──────────────────┘
```

### Padrões favoritos

| Padrão | Uso |
|--------|-----|
| Lista + detalhe | Clientes, pedidos |
| Formulário + resumo | Orçamento, pedido |
| Tabela + drawer | Edição rápida de linha |
| Tabela + painel direito | Orçamento com totais |
| Split view | Produção + detalhe da OS |
| Tela cheia operacional | Montagem de orçamento |

### Page header

- Título `text-2xl font-semibold`
- Descrição opcional `text-sm text-muted-foreground`
- Ações à direita: primária + secundárias outline
- Breadcrumb acima quando profundidade > 1

---

## 6. Densidade

| Modo | Row height | Input height | Padding card |
|------|------------|--------------|--------------|
| Compact | 36px | 32px (`h-8`) | `p-3` |
| Default | 40px | 36px (`h-9`) | `p-4` |
| Comfortable | 44px | 40px (`h-10`) | `p-5` |

**Padrão do Molde ERP:** `default` em navegação; `compact` em tabelas de orçamento e produção.

---

## 7. Iconografia

- Biblioteca: **Lucide React**
- Tamanhos: `16px` (inline), `20px` (botões), `24px` (empty states)
- Stroke: `1.5` ou `2` consistente
- Sem emojis como ícones

---

## 8. Motion

| Tipo | Duração | Easing |
|------|---------|--------|
| Hover/focus | 150ms | ease |
| Drawer/sheet | 200ms | ease-out |
| Toast | 200ms | ease |
| Skeleton | pulse 1.5s | — |

Respeitar `prefers-reduced-motion: reduce`.

---

## 9. Telas principais — visão de layout

Ver detalhes em `docs/UX.md`. Resumo:

| Tela | Layout | Densidade |
|------|--------|-----------|
| Dashboard operacional | Métricas 4 col + fila de tarefas + tabela pendências | Moderada |
| Clientes | Header + filtros + DataTable | Compact |
| Detalhe cliente | Split: dados + abas + histórico pedidos | Default |
| Orçamento (criação) | Form esquerda + linhas centro + resumo direita | Compact |
| Lista orçamentos | Tabela + filtros status | Compact |
| Produção | Kanban leve OU tabela por status | Compact |
| Estoque | Tabela + alertas mínimos | Compact |

### Diferenças light/dark

- Mesma hierarquia; dark usa mais contraste em bordas de tabela
- Badges ajustam opacidade de fundo
- Gráficos (quando existirem): paleta desaturada no dark

### Riscos de UX por tela

| Tela | Risco |
|------|-------|
| Orçamento | Perder resumo financeiro ao rolar |
| Produção | Status só por cor |
| Estoque | Tabela larga sem sticky columns |
| Dashboard | Virar “painel de gráficos” |

---

## 10. Acessibilidade

- Contraste WCAG AA mínimo (AAA em tabelas densas quando possível)
- Focus visível em todos os controles interativos
- Estados não dependem só de cor (ícone + texto em badges)
- Alvo mínimo: **44×44px** em touch; **32px** altura mínima em desktop denso com padding adequado
- `aria-sort`, `aria-selected` em tabelas
- Skip link para conteúdo principal
- Dark mode testado com simulação de daltonismo para status

---

## 11. Critérios de qualidade (checklist)

- [x] Light mode completo com tokens
- [x] Dark mode refinado (camadas, não inversão)
- [x] Sem dependência de gráficos grandes
- [x] Orientado a ERP operacional
- [x] Orçamento e tabelas como foco
- [x] Implementável em Vite + shadcn/ui
- [x] Tokens compatíveis com CSS variables

---

## 12. O que evitar

- Dashboard genérico cheio de charts
- Cards KPI gigantes
- Gradientes decorativos
- Copiar telas das referências literalmente
- `dark:` com cores hardcoded espalhadas
- Formulários de página inteira sem resumo lateral
- Sombras pesadas em cards operacionais

---

## Referências analisadas

Arquivos em `/references`:

1. Dashboard Overview — estrutura sidebar/topbar, métricas compactas, charts mínimos
2. Dashboard funnel/goals — barras de progresso, activity feed (adaptar para fila operacional)
3. Client Management — tabela densa, filtros, badges de status
4. Leads grid — cards (usar só como alternativa visual; preferir tabela no ERP)
5. Lead cards detalhados — padrão de status badge + valor em destaque

**Adaptação para Molde ERP:** manter shell (sidebar + topbar + busca), substituir ênfase em cards/gráficos por **tabelas editáveis**, **painéis de resumo** e **drawers**.
