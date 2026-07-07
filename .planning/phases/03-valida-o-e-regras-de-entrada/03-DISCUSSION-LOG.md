# Phase 3: Validação e Regras de Entrada - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-07
**Phase:** 3-Validação e Regras de Entrada
**Areas discussed:** Severidade e fluxo, Apresentação do relatório, Granularidade dos achados, Regras de limpeza inicial, Momento da validação

---

## Severidade e fluxo de continuidade

| Option | Description | Selected |
|--------|-------------|----------|
| Só estrutura bloqueia | Colunas/abas/cabeçalho ausentes impedem seguir; inconsistências de linha viram alertas | |
| Estrutura + base vazia | Bloqueia também se, após remover totais, não sobrar nenhuma linha válida | |
| Rigor máximo | Qualquer regra VAL-01..VAL-10 sem conformidade bloqueia até corrigir a planilha | ✓ (confirmado após clarificação) |

| Option | Description | Selected |
|--------|-------------|----------|
| Inconsistências de linha | Datas inválidas, valores divergentes, campos vazios etc. como alerta | ✓ (inicial; depois refinado pelo modelo rigor máximo) |
| Linha + regras de negócio | Inclui pedidos entregues com pendência, contas vencidas e desconto alto | |
| Mínimo | Só alertas que afetam cálculo financeiro direto | |

| Option | Description | Selected |
|--------|-------------|----------|
| Nunca bloqueia | Indicadores/Metas opcional; erro só no card | ✓ |
| Alerta global | Se carregado com problemas, aviso sem bloquear dashboards | |
| Bloqueia se carregado | Erros críticos no opcional impedem seguir | |

| Option | Description | Selected |
|--------|-------------|----------|
| CTA automático | Botão aparece quando Pedidos + Contas estão válidos (com ou sem alertas) | ✓ |
| Validação manual | Usuário clica Validar dados após importar | |
| Via topbar | Sem botão extra; topbar muda para Abrir dashboards | |

**Clarificação:** Usuário confirmou modelo rigor máximo — toda não-conformidade VAL bloqueia; alertas ficam para informativos/limpeza.

**User's choice:** Rigor máximo + Indicadores nunca bloqueia + CTA automático desabilitado até válido.

---

## Apresentação do relatório

| Option | Description | Selected |
|--------|-------------|----------|
| Painel abaixo dos cards | Seção Resultado da validação com bloco por planilha | ✓ |
| Dentro de cada card | Badge + resumo compacto no card | |
| Híbrido | Status no card + painel detalhado abaixo | |

| Option | Description | Selected |
|--------|-------------|----------|
| Blocos por planilha | Pedidos, Contas e Indicadores com status próprio | ✓ |
| Resumo global primeiro | Banner único no topo | |
| Abas internas | Uma aba por planilha no painel | |

| Option | Description | Selected |
|--------|-------------|----------|
| Substituir Lido | Card mostra Válido, Inválido ou Com informações | ✓ |
| Manter Lido + badge extra | Leitura e validação em camadas | |
| Só no painel | Cards continuam só com estado de leitura | |

| Option | Description | Selected |
|--------|-------------|----------|
| Resumo + principais achados | Contagem por tipo + lista curta + Corrigir planilha | ✓ |
| Lista completa | Todas as não-conformidades visíveis | |
| Só contagem | Apenas número de erros críticos | |

**User's choice:** Painel abaixo dos cards, blocos por planilha, cards refletem validação, inválido com resumo + principais achados.

---

## Granularidade dos achados

| Option | Description | Selected |
|--------|-------------|----------|
| Só contagens | Ex.: 3 linhas de total ignoradas | |
| Contagens + amostra | Até 5 exemplos | |
| Lista completa de informativos | Todas as exclusões listadas | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Agrupado + top 5 | Por regra com exemplos | |
| Agrupado + lista completa | Todas as linhas por regra | |
| Lista plana | Até 10 primeiros erros sem agrupar | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Linha Excel + identificador | Linha 45 · Pedido 2024-089 | ✓ |
| Só número da linha | Linha 45 | |
| Só identificador de negócio | Pedido/fornecedor sem linha | |

| Option | Description | Selected |
|--------|-------------|----------|
| Seções expansíveis | Ver todos (N) expande a lista | ✓ |
| Lista com scroll | Altura máxima com rolagem | |
| Paginação | Navegar páginas de achados | |

**User's choice:** Informativos com lista completa; erros críticos em top 10 plano; referência linha + ID; listas longas expansíveis.

---

## Regras de limpeza inicial

| Option | Description | Selected |
|--------|-------------|----------|
| Seção informativa | Limpeza automática separada de erros | |
| Como alerta | Exclusões em ⚠️ porque indicam dados ignorados | ✓ |
| Silencioso | Aplica regra sem mostrar | |

| Option | Description | Selected |
|--------|-------------|----------|
| Só Pedido vazio | Ignora linhas sem Pedido, incluindo total | ✓ |
| Pedido vazio OU texto TOTAL | Também ignora linhas com TOTAL | |
| Parar no TOTAL | Mesma regra de contas | |

| Option | Description | Selected |
|--------|-------------|----------|
| Parar no primeiro TOTAL | Não lê TOTAL nem abaixo na aba mensal | ✓ |
| Pular só linha TOTAL | Continua lendo abaixo | |
| Por aba mensal | Cada aba para no seu TOTAL | ✓ (equivalente à opção recomendada) |

| Option | Description | Selected |
|--------|-------------|----------|
| Listar todas as exclusões | Coerente com lista completa de informativos | ✓ |
| Só contagem | N linhas ignoradas | |
| Contagem por motivo | Sem listar linhas | |

**User's choice:** Exclusões como ⚠️, pedidos por Pedido vazio, contas parando no TOTAL, listar todas as exclusões.

---

## Momento da validação

| Option | Description | Selected |
|--------|-------------|----------|
| Automática após upload | Cada planilha valida ao ser lida | ✓ |
| Automática quando obrigatórias prontas | Valida só com Pedidos + Contas | |
| Botão manual | Usuário clica Validar dados | |

| Option | Description | Selected |
|--------|-------------|----------|
| Revalidar automaticamente | Substituir dispara nova validação | ✓ |
| Confirmar antes | Pergunta se quer revalidar | |
| Manual | Substituir só relê | |

| Option | Description | Selected |
|--------|-------------|----------|
| Independente por planilha | Cada fonte com seu estado | ✓ |
| Aguardar par | Relatório só com duas obrigatórias | |
| Estado global pendente | Aguardando todas as planilhas | |

| Option | Description | Selected |
|--------|-------------|----------|
| Desabilitado até válido | CTA só habilita sem erros críticos | ✓ |
| Sempre visível bloqueado | Bloqueia com mensagem ao clicar | |
| Oculto até pronto | Botão só aparece quando pode seguir | |

**User's choice:** Validação automática, revalidação ao substituir, estado por planilha, CTA desabilitado até válido.

---

## the agent's Discretion

- Limiares técnicos auxiliares não discutidos (ex.: tolerância de centavos em divergência de valor).
- Estrutura interna dos módulos de validação.
- Microcopy exata das mensagens em pt-BR.

## Deferred Ideas

- Normalização, persistência, filtros e tabelas → Fase 4
- Insights automáticos → Fase 9
