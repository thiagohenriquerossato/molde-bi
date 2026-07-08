A análise mostra que dá para fazer um micro sistema muito bom **sem backend**, mas tecnicamente ele não pode ser “só HTML/CSS” no sentido literal. Para ler `.xlsx`, validar, filtrar, calcular indicadores e gerar gráficos, precisa ser um front-end estático com:

**HTML + CSS + JavaScript puro**, usando bibliotecas locais como **SheetJS** para ler planilhas e **ECharts ou Chart.js** para gráficos.

## 1. Diagnóstico das 3 planilhas

### 1.1. `Pedidos_Simplificado.xlsx`

Essa é a principal base de **receita / pedidos / vendas / produção**.

Estrutura encontrada:

| Campo                      | Função no sistema                   |
| -------------------------- | ----------------------------------- |
| Pedido                     | ID do pedido                        |
| Situação                   | Status comercial/produtivo          |
| Data de cadastro           | Data de entrada do pedido/orçamento |
| Data Prevista              | Prazo prometido                     |
| Data Entregue              | Data real de entrega                |
| Forma de Pagamento Entrada | Meio de pagamento da entrada        |
| Forma de Pagamento Saldo   | Meio de pagamento do saldo          |
| Cliente                    | Cliente                             |
| Vendedor                   | Responsável pela venda              |
| Valor Bruto                | Valor antes de desconto             |
| Valor Desconto             | Desconto concedido                  |
| Valor Pago                 | Valor recebido                      |
| Valor Pendente             | Valor ainda em aberto               |
| Valor Final                | Valor líquido do pedido             |

Principais achados:

| Item                              |               Resultado |
| --------------------------------- | ----------------------: |
| Linhas totais                     |                   1.024 |
| Pedidos reais                     |                   1.023 |
| Linha de total misturada no final |                       1 |
| Período dos pedidos               | 21/01/2026 a 07/07/2026 |
| Valor final total                 |           R$ 892.117,08 |
| Valor pago                        |           R$ 214.829,12 |
| Valor pendente                    |           R$ 677.287,96 |
| Pedidos entregues                 |                     478 |
| Aguardando aprovação              |                     449 |
| Aguardando produzir               |                      43 |
| Pronto para entrega               |                      28 |
| Cancelados                        |                      14 |
| Produzindo                        |                       6 |
| Sem situação                      |                       5 |

Pontos críticos:

* A linha final da planilha é um **total consolidado**, mas está junto da base. O sistema precisa ignorar linhas onde `Pedido` estiver vazio.
* `Aguardando Aprovação` representa um valor muito alto: **R$ 517.046,68**. Isso não deve ser tratado como receita realizada; deve entrar como **pipeline / orçamento em aberto**.
* `Valor Pago + Valor Pendente = Valor Final` está consistente.
* Em 25 pedidos, `Valor Bruto - Valor Desconto` não bate exatamente com `Valor Final`.
* Existem 2 pedidos com `Data Entregue` anterior à `Data de cadastro`, o que indica erro de lançamento.
* 449 pedidos estão com `Data Prevista = Não definido`.
* 577 pedidos estão com `Data Entregue = Não definido`.
* 992 pedidos estão com forma de pagamento da entrada como `Não definido`.
* 734 pedidos estão com forma de pagamento do saldo como `Não definido`.
* 46 pedidos estão sem cliente.
* O cliente “Balcão” concentra muitos pedidos e valor pendente, então deve ser tratado como **cliente genérico / não identificado**.

---

### 1.2. `PLANILHA CONTAS A PAGAR1.xlsx`

Essa é a principal base de **despesas / contas a pagar / fluxo de saída**.

A planilha tem:

* Abas de resumo:

  * `GRAFICO`
  * `ANALISE CATEGORIA FIXA`
  * `% POR CATEGORIA`

* Abas mensais:

  * `CONTAS JAN 2026`
  * `CONTAS FEV 2026`
  * `CONTAS MAR 2026`
  * `CONTAS ABRIL 2026`
  * `CONTAS MAIO 2026`
  * `CONTAS JUN 2026`
  * `CONTAS JUL 2026`
  * `CONTAS AGO 2026`
  * `CONTAS SET 2026`
  * `CONTAS OUT 2026`
  * `CONTAS NOV 2026`
  * `CONTAS DEZ 2026`

Campos principais das abas mensais:

| Campo         | Função no sistema          |
| ------------- | -------------------------- |
| DATA VENC     | Data de vencimento         |
| DATA PAG      | Data de pagamento          |
| VALOR         | Valor da conta             |
| FORNECEDOR    | Fornecedor                 |
| DESCRIÇÃO     | Descrição da despesa       |
| PARCELA       | Parcela / recorrência      |
| CLASSIFICAÇÃO | Tipo detalhado da despesa  |
| CATEGORIA     | Grupo maior da despesa     |
| CONTA         | Conta usada para pagamento |
| PAGO          | Status de pagamento        |

Principais achados:

| Item                                |     Resultado |
| ----------------------------------- | ------------: |
| Lançamentos lidos nas áreas mensais |           627 |
| Lançamentos com valor preenchido    |           615 |
| Linhas sem valor                    |            12 |
| Total de contas                     | R$ 900.950,25 |
| Total pago                          | R$ 503.579,31 |
| Total em aberto                     | R$ 397.370,94 |
| Vencido em 07/07/2026               |  R$ 24.525,32 |
| Vence nos próximos 7 dias           |   R$ 7.578,44 |
| Linhas sem conta bancária           |           233 |
| Linhas sem data de pagamento        |           228 |
| Linhas pagas sem data de pagamento  |             2 |

Por categoria:

| Categoria                       | Total aproximado |
| ------------------------------- | ---------------: |
| Despesas operacionais fixas     |    R$ 628.167,32 |
| Despesas operacionais variáveis |    R$ 264.091,49 |
| Despesas de vendas              |      R$ 6.340,19 |
| Imposto                         |      R$ 2.351,25 |

Top classificações de despesa:

| Classificação             | Total aproximado |
| ------------------------- | ---------------: |
| Desp. pessoal             |    R$ 185.527,71 |
| Pró-labore                |    R$ 117.826,40 |
| Participação lucro mensal |    R$ 102.399,60 |
| Cartão de crédito         |     R$ 94.899,10 |
| Forn. molduras            |     R$ 63.962,74 |
| Simples Nacional          |     R$ 47.146,29 |
| Mat. repet                |     R$ 33.086,43 |
| Desp. operação            |     R$ 32.173,28 |
| Financiamento             |     R$ 30.737,04 |
| Prestação de serviço      |     R$ 29.009,79 |

Pontos críticos:

* As abas mensais misturam **base de dados** com **totais e fórmulas**. O sistema deve ler somente as linhas entre o cabeçalho e a primeira linha `TOTAL`.
* Há inconsistências de nomenclatura, como `DESP.OPERAÇÃO` e `DESP. OPERAÇÃO`.
* Algumas classificações têm espaço no final, acento inconsistente ou grafia diferente.
* Existem datas de vencimento em 2025 dentro de abas de 2026, provavelmente erro de digitação.
* A aba `GRAFICO` já tenta criar uma visão de receita x despesa, mas com valores manuais e fórmulas frágeis. No sistema, isso deve ser recalculado direto das bases.

---

### 1.3. `Molde_Momentos_Template_Indicadores.xlsx`

Essa planilha é um **modelo de indicadores**, não exatamente uma base operacional.

Ela tem 11 abas:

| Aba        | Função                          |
| ---------- | ------------------------------- |
| CAPA       | Navegação / referência          |
| EXECUTIVO  | Resumo geral                    |
| FINANCEIRO | KPIs financeiros                |
| COMERCIAL  | KPIs de vendas                  |
| MARKETING  | KPIs de marketing               |
| DESIGN     | KPIs de design                  |
| PRODUÇÃO   | KPIs produtivos                 |
| ESTOQUE    | KPIs de estoque                 |
| RH         | KPIs de pessoas                 |
| PLANO AÇÃO | Ações corretivas                |
| DADOS_PBI  | Estrutura tabular para Power BI |

O ponto mais útil é a aba `DADOS_PBI`, que já organiza indicadores por setor:

| Setor      | Quantidade de indicadores |
| ---------- | ------------------------: |
| Financeiro |                        20 |
| Comercial  |                        10 |
| Marketing  |                        16 |
| Design     |                         8 |
| Produção   |                        16 |
| Estoque    |                         6 |
| RH         |                         7 |

Uso recomendado no sistema:

* Usar essa planilha como **catálogo de indicadores e metas**.
* Não depender das fórmulas dela.
* O sistema deve calcular automaticamente os indicadores que conseguir a partir de `Pedidos` e `Contas a Pagar`.
* Indicadores sem fonte de dados, como marketing, estoque, RH e parte da produção, devem aparecer como **“sem base importada”** ou **“manual”**.

---

# 2. Arquitetura recomendada do micro sistema

## Estrutura geral

```text
/molde-dashboard
  index.html
  /css
    app.css
  /js
    app.js
    importer.js
    validators.js
    normalizers.js
    data-store.js
    metrics.js
    filters.js
    charts.js
    insights.js
    tables.js
    schemas.js
```

## Fluxo de funcionamento

```text
Upload das planilhas
        ↓
Leitura dos arquivos XLSX no navegador
        ↓
Validação de estrutura
        ↓
Normalização dos dados
        ↓
Geração das tabelas internas
        ↓
Cálculo dos indicadores
        ↓
Aplicação dos filtros
        ↓
Dashboards, gráficos, tabelas e insights
```

## Bibliotecas recomendadas

| Finalidade     | Biblioteca                  |
| -------------- | --------------------------- |
| Ler XLSX       | SheetJS                     |
| Gráficos       | ECharts                     |
| Datas          | JavaScript nativo ou Day.js |
| Estado local   | LocalStorage ou IndexedDB   |
| Exportação CSV | JavaScript puro             |
| Impressão/PDF  | Print CSS do navegador      |

Eu recomendaria **ECharts** em vez de Chart.js porque ele lida melhor com dashboards mais completos, heatmap, treemap, gráficos combinados e interações.

---

# 3. Modelo de dados interno

Mesmo vindo de planilhas, o sistema deve transformar tudo em tabelas internas limpas.

## 3.1. Tabela `pedidos`

```text
pedido_id
situacao_original
situacao_grupo
data_cadastro
data_prevista
data_entregue
forma_pagamento_entrada
forma_pagamento_saldo
cliente
cliente_normalizado
vendedor
valor_bruto
valor_desconto
valor_pago
valor_pendente
valor_final
mes_cadastro
mes_entrega
dias_producao
dias_atraso
entregue_no_prazo
status_financeiro
```

### Campo derivado importante: `situacao_grupo`

| Situação original    | Grupo sugerido       |
| -------------------- | -------------------- |
| Aguardando Aprovação | Pipeline / orçamento |
| Aguardando Produzir  | Pedido ativo         |
| Produzindo           | Pedido ativo         |
| Pronto para Entrega  | Pedido ativo         |
| Entregue             | Entregue             |
| Cancelado            | Perdido / cancelado  |
| Em branco            | Sem status           |

Isso é essencial para não confundir orçamento com receita realizada.

---

## 3.2. Tabela `contas_pagar`

```text
id
competencia_aba
data_vencimento
data_pagamento
valor
fornecedor
fornecedor_normalizado
descricao
parcela
classificacao
classificacao_normalizada
categoria
categoria_normalizada
conta
pago
status_pagamento
mes_vencimento
mes_pagamento
dias_atraso
```

### Campo derivado: `status_pagamento`

| Condição                        | Status                |
| ------------------------------- | --------------------- |
| Pago = SIM                      | Pago                  |
| Não pago e vencimento < hoje    | Vencido               |
| Não pago e vencimento = hoje    | Vence hoje            |
| Não pago e vence em até 7 dias  | Próximos 7 dias       |
| Não pago e vence em até 30 dias | Próximos 30 dias      |
| Não pago e vencimento futuro    | Futuro                |
| Sem valor                       | Lançamento incompleto |

---

## 3.3. Tabela `indicadores_metas`

```text
mes
setor
indicador
valor
meta
vs_meta
origem
calculavel
```

### Campo `origem`

| Origem                | Exemplo                                   |
| --------------------- | ----------------------------------------- |
| Calculado por pedidos | Receita, ticket médio, pedidos entregues  |
| Calculado por contas  | Despesas, contas vencidas, contas a pagar |
| Manual                | Marketing, RH, estoque                    |
| Não disponível        | Indicador sem base correspondente         |

---

# 4. Páginas do sistema

## Página 1 — Upload e validação

Essa página é obrigatória e deve ser muito bem feita.

### Blocos de upload

1. **Pedidos / Receita**

   * Espera: `Pedidos_Simplificado.xlsx`
   * Aba esperada: primeira aba
   * Cabeçalho esperado: linha 1

2. **Contas a Pagar**

   * Espera: `PLANILHA CONTAS A PAGAR1.xlsx`
   * Abas esperadas: `CONTAS ... 2026`
   * Cabeçalho esperado: linha 2

3. **Indicadores / Metas**

   * Espera: `Molde_Momentos_Template_Indicadores.xlsx`
   * Opcional
   * Aba principal: `DADOS_PBI`

### Validações necessárias

Para pedidos:

* Verificar se todas as colunas obrigatórias existem.
* Ignorar linha onde `Pedido` estiver vazio.
* Alertar pedidos sem situação.
* Alertar clientes vazios.
* Alertar datas inválidas.
* Alertar `Data Entregue` anterior à `Data de cadastro`.
* Alertar divergência entre `Valor Bruto - Valor Desconto` e `Valor Final`.
* Alertar pedidos com desconto muito alto.
* Alertar pedidos entregues com valor pendente.

Para contas a pagar:

* Verificar abas mensais.
* Verificar cabeçalho na linha 2.
* Ler somente até a primeira linha `TOTAL`.
* Alertar linhas sem valor.
* Alertar linhas sem classificação.
* Alertar contas pagas sem data de pagamento.
* Alertar vencimentos fora do ano da aba.
* Alertar categorias ou classificações parecidas com nomes diferentes.
* Alertar contas vencidas.

Resultado da validação:

```text
✅ Planilha válida
⚠️ Planilha válida com alertas
❌ Planilha inválida
```

---

## Página 2 — Dashboard Executivo

Essa deve ser a tela inicial após o upload.

### Cards principais

| Indicador                   | Fonte            |
| --------------------------- | ---------------- |
| Receita total / Valor final | Pedidos          |
| Valor recebido              | Pedidos          |
| Valor pendente              | Pedidos          |
| Despesas totais             | Contas           |
| Despesas pagas              | Contas           |
| Despesas em aberto          | Contas           |
| Contas vencidas             | Contas           |
| Resultado por competência   | Pedidos + Contas |
| Ticket médio                | Pedidos          |
| Pedidos totais              | Pedidos          |
| Pedidos entregues           | Pedidos          |
| Pedidos em aprovação        | Pedidos          |

### Gráficos principais

| Gráfico                               | Tipo                       |
| ------------------------------------- | -------------------------- |
| Receita x Despesa x Resultado por mês | Linha ou barras combinadas |
| Valor recebido x pendente             | Barras empilhadas          |
| Despesas fixas x variáveis por mês    | Barras empilhadas          |
| Pedidos por status                    | Funil ou rosca             |
| Top 10 despesas por classificação     | Barras horizontais         |
| Top vendedores por receita            | Barras horizontais         |
| Contas vencidas e próximas            | Cards + tabela curta       |

---

## Página 3 — Financeiro / Contas a Pagar

Foco em despesas, vencimentos e fluxo de saída.

### Indicadores

* Total de contas.
* Total pago.
* Total aberto.
* Total vencido.
* Vence hoje.
* Vence em 7 dias.
* Vence em 30 dias.
* Média mensal de despesas.
* Maior fornecedor do mês.
* Maior classificação do mês.
* Percentual de despesas fixas.
* Percentual de despesas variáveis.

### Gráficos

| Visão                           | Tipo               |
| ------------------------------- | ------------------ |
| Despesas por mês                | Linha ou coluna    |
| Pago x aberto por mês           | Barras empilhadas  |
| Despesas por categoria          | Rosca              |
| Despesas por classificação      | Barras horizontais |
| Top fornecedores                | Barras horizontais |
| Calendário de vencimentos       | Heatmap            |
| Curva ABC de fornecedores       | Pareto             |
| Evolução das despesas fixas     | Linha              |
| Evolução das despesas variáveis | Linha              |
| Saídas por conta bancária       | Barras ou rosca    |

### Tabelas importantes

* Contas vencidas.
* Contas dos próximos 7 dias.
* Contas sem valor.
* Contas sem classificação.
* Contas pagas sem data de pagamento.
* Fornecedores mais recorrentes.
* Lançamentos futuros por mês.

---

## Página 4 — Pedidos / Receita

Foco comercial e operacional.

### Indicadores

* Total de pedidos.
* Valor bruto.
* Descontos.
* Valor final.
* Valor pago.
* Valor pendente.
* Ticket médio.
* Desconto médio.
* Pedidos entregues.
* Pedidos cancelados.
* Pedidos aguardando aprovação.
* Pedidos ativos.
* Tempo médio de produção.
* Atraso médio.
* Percentual entregue no prazo.

### Gráficos

| Visão                           | Tipo               |
| ------------------------------- | ------------------ |
| Receita por mês                 | Coluna ou linha    |
| Pedidos por mês                 | Coluna             |
| Ticket médio por mês            | Linha              |
| Pedidos por situação            | Funil              |
| Receita por vendedor            | Barras horizontais |
| Pedidos por vendedor            | Barras             |
| Valor pendente por status       | Barras empilhadas  |
| Desconto por mês                | Linha              |
| Top clientes por valor          | Barras horizontais |
| Entregues no prazo x atrasados  | Rosca              |
| Tempo médio de produção por mês | Linha              |
| Distribuição de ticket          | Histograma         |

---

## Página 5 — Clientes e Vendedores

Essa página deve responder perguntas como:

* Quem mais vende?
* Quem tem maior ticket?
* Quem tem mais pendência?
* Quais clientes mais compram?
* Quais clientes estão com valores pendentes?
* Quantos clientes são recorrentes?

### Indicadores

* Clientes únicos.
* Clientes recorrentes.
* Clientes novos por mês.
* Top cliente por receita.
* Top cliente por pendência.
* Vendedor com maior receita.
* Vendedor com maior ticket médio.
* Vendedor com maior quantidade de pedidos.
* Vendedor com maior pendência.

### Gráficos

| Visão                        | Tipo            |
| ---------------------------- | --------------- |
| Receita por vendedor         | Barras          |
| Ticket médio por vendedor    | Barras          |
| Pedidos por vendedor         | Barras          |
| Pendência por vendedor       | Barras          |
| Top clientes por receita     | Barras          |
| Top clientes por pendência   | Barras          |
| Clientes novos x recorrentes | Linha ou coluna |
| Matriz vendedor x status     | Heatmap         |

---

## Página 6 — Produção e Prazo

Mesmo sem uma planilha específica de produção, dá para extrair bastante coisa dos pedidos.

### Indicadores

* Pedidos aguardando produzir.
* Pedidos produzindo.
* Pedidos prontos para entrega.
* Pedidos entregues.
* Pedidos atrasados.
* Tempo médio entre cadastro e entrega.
* Tempo médio entre previsto e entregue.
* Percentual no prazo.
* Pedidos sem data prevista.
* Pedidos sem data entregue.

### Gráficos

| Visão                             | Tipo             |
| --------------------------------- | ---------------- |
| Funil operacional                 | Funil            |
| Pedidos atrasados por mês         | Coluna           |
| Tempo médio de produção           | Linha            |
| Entregues no prazo x atrasados    | Rosca            |
| Aging dos pedidos ativos          | Barras por faixa |
| Pedidos sem previsão por vendedor | Barras           |

### Aging sugerido

```text
0 a 3 dias
4 a 7 dias
8 a 15 dias
16 a 30 dias
Acima de 30 dias
```

---

## Página 7 — Resultado Integrado

Essa é a visão mais importante para gestão.

Ela deve juntar:

* Pedidos como entrada/receita.
* Contas a pagar como saída/despesa.

### Duas visões obrigatórias

#### 1. Visão por competência

Usa:

* Receita por `Data de cadastro` ou `Data entregue`.
* Despesas por aba de competência ou `Data Venc`.

Serve para entender se o mês “se paga”.

#### 2. Visão de caixa

Usa:

* Entrada: `Valor Pago` dos pedidos.
* Saída: contas com `PAGO = SIM`.

Serve para entender dinheiro real movimentado.

### Indicadores

* Receita do mês.
* Recebido no mês.
* Despesa do mês.
* Despesa paga no mês.
* Resultado competência.
* Resultado caixa.
* Contas a receber.
* Contas a pagar abertas.
* Saldo operacional projetado.
* Cobertura: recebíveis / contas abertas.
* Ponto de equilíbrio: despesas fixas / ticket médio.

### Gráficos

| Visão                         | Tipo            |
| ----------------------------- | --------------- |
| Receita x despesa x resultado | Linha combinada |
| Waterfall do resultado        | Waterfall       |
| Recebido x pago               | Linha           |
| Recebíveis x contas em aberto | Barras          |
| Ponto de equilíbrio mensal    | Linha           |
| Projeção de caixa             | Área            |

---

## Página 8 — Insights e Alertas

Essa página deve transformar dados em decisões.

### Alertas financeiros

* Contas vencidas.
* Contas vencendo nos próximos 7 dias.
* Contas sem valor.
* Contas sem classificação.
* Contas pagas sem data de pagamento.
* Fornecedor com aumento forte no mês.
* Despesa fixa acima da média.
* Categoria com maior crescimento.
* Mês futuro com concentração alta de vencimentos.

### Alertas comerciais

* Pedidos aguardando aprovação há muitos dias.
* Pedidos entregues com valor pendente.
* Pedidos sem cliente.
* Pedidos sem vendedor.
* Pedidos sem data prevista.
* Pedidos com desconto alto.
* Pedidos cancelados com valor relevante.
* Cliente com alto valor pendente.
* Vendedor com muitos pedidos pendentes.

### Alertas operacionais

* Pedidos atrasados.
* Pedidos com entrega antes do cadastro.
* Pedidos prontos para entrega há muitos dias.
* Pedidos produzindo há muitos dias.
* Queda de ticket médio.
* Aumento de prazo médio de entrega.

---

# 5. Filtros globais

O sistema precisa ter filtros em todas as páginas.

## Filtros gerais

```text
Período
Mês
Ano
Status
Valor mínimo
Valor máximo
Busca livre
```

## Filtros de pedidos

```text
Situação
Vendedor
Cliente
Forma de pagamento entrada
Forma de pagamento saldo
Com valor pendente
Sem cliente
Sem data prevista
Entregue no prazo
Atrasado
Cancelado
Aguardando aprovação
```

## Filtros de contas

```text
Pago / não pago
Vencido
Vence hoje
Vence em 7 dias
Vence em 30 dias
Fornecedor
Classificação
Categoria
Conta
Parcela
Competência
Data de vencimento
Data de pagamento
Sem valor
Sem classificação
Sem conta
```

## Filtros avançados

* Clique em um gráfico filtra o resto do dashboard.
* Busca por texto em qualquer coluna.
* Multi-seleção em todos os campos categóricos.
* Botão “limpar filtros”.
* Botão “salvar visão”.
* Botão “exportar dados filtrados”.

---

# 6. Indicadores prioritários para o MVP

## Essenciais

1. Receita total.
2. Valor recebido.
3. Valor pendente.
4. Total de despesas.
5. Despesas pagas.
6. Despesas em aberto.
7. Contas vencidas.
8. Resultado mensal.
9. Ticket médio.
10. Pedidos por status.
11. Top vendedores.
12. Top clientes.
13. Top fornecedores.
14. Top classificações de despesa.
15. Entregas no prazo.
16. Pedidos atrasados.
17. Despesas fixas x variáveis.
18. Fluxo de caixa mensal.

## Avançados

1. Ponto de equilíbrio.
2. Projeção de caixa.
3. Curva ABC de fornecedores.
4. Aging de contas a pagar.
5. Aging de pedidos.
6. Clientes recorrentes.
7. Clientes novos.
8. Taxa de conversão aproximada.
9. Desconto médio por vendedor.
10. Margem operacional aproximada.
11. Score de saúde do negócio.
12. Insights automáticos por mês.

---

# 7. Regras de cálculo recomendadas

## Receita

Separar três conceitos:

```text
Receita potencial = soma Valor Final de todos os pedidos não cancelados
Pipeline = soma Valor Final de Aguardando Aprovação
Receita ativa = soma Valor Final de pedidos aprovados/ativos/entregues
Receita recebida = soma Valor Pago
A receber = soma Valor Pendente
```

## Pedidos fechados

```text
Pedidos fechados =
Aguardando Produzir
+ Produzindo
+ Pronto para Entrega
+ Entregue
```

## Conversão aproximada

```text
Conversão = pedidos fechados / total de pedidos não cancelados
```

Mas isso deve ser exibido como **aproximado**, porque a base não separa claramente orçamento de pedido aprovado.

## Resultado por competência

```text
Resultado competência = Receita ativa do mês - Despesas do mês
```

## Resultado de caixa

```text
Resultado caixa = Valor recebido - Despesas pagas
```

## Ticket médio

```text
Ticket médio = Valor Final / quantidade de pedidos
```

Idealmente calcular em três versões:

```text
Ticket médio geral
Ticket médio pedidos fechados
Ticket médio entregues
```

## Prazo de produção

```text
Dias produção = Data Entregue - Data de cadastro
```

## Atraso

```text
Dias atraso = Data Entregue - Data Prevista
```

Se for menor ou igual a zero, está no prazo.

---

# 8. O que eu mudaria na estrutura das planilhas

Mesmo mantendo planilha como banco de dados, eu recomendo padronizar assim:

## Pedidos

Manter uma única aba/base, mas evitar:

* Linha de total no final.
* Texto `Não definido`; melhor deixar vazio.
* Situação em branco.
* Cliente em branco.
* Datas inválidas.
* Valores de resumo dentro da base.

## Contas a pagar

Ideal seria sair de 12 abas mensais para uma única aba:

```text
CONTAS_A_PAGAR
```

Com uma coluna:

```text
competencia
```

Em vez de separar por mês.

Mas se quiser manter como está, o sistema consegue ler as 12 abas desde que siga esta regra:

```text
Ler da linha 3 até antes da primeira linha TOTAL.
```

## Indicadores

A planilha de indicadores deve virar:

```text
METAS
```

Com colunas:

```text
mes
setor
indicador
meta
tipo
origem
```

O valor realizado deve ser calculado pelo sistema, não digitado na planilha.

---

# 9. Priorização de desenvolvimento

## Fase 1 — Base funcional

* Upload das planilhas.
* Validação de estrutura.
* Normalização dos dados.
* Dashboard executivo.
* Dashboard financeiro.
* Dashboard de pedidos.
* Filtros globais.
* Tabelas detalhadas.

## Fase 2 — Gestão

* Página de clientes e vendedores.
* Página de produção e prazo.
* Resultado integrado.
* Alertas e insights.
* Exportação CSV.
* Impressão de relatório.

## Fase 3 — Inteligência

* Score de saúde do negócio.
* Comparação mês contra mês.
* Previsão de caixa.
* Sugestão automática de ações.
* Plano de ação integrado.
* Leitura de metas da planilha de indicadores.

---

# 10. Minha recomendação final de arquitetura

O sistema deve ser pensado como um **Power BI local em HTML**, com a seguinte lógica:

```text
Planilhas = banco de dados
JavaScript = motor de ETL e cálculo
HTML/CSS = interface
ECharts = visualização
LocalStorage/IndexedDB = persistência local
```

A estrutura ideal das telas seria:

```text
1. Upload e Validação
2. Dashboard Executivo
3. Financeiro
4. Pedidos / Receita
5. Clientes e Vendedores
6. Produção e Prazos
7. Resultado Integrado
8. Insights e Alertas
9. Base de Dados
10. Configurações / Metas
```

O ponto mais importante: **não tratar tudo como receita realizada**. A base de pedidos mistura orçamento, pedido em aprovação, pedido ativo, entregue e cancelado. Então o sistema precisa separar:

```text
Pipeline
Pedidos ativos
Entregues
Cancelados
Recebido
A receber
```

Com isso, o micro sistema vai dar uma visão muito mais real do negócio do que a planilha atual.
