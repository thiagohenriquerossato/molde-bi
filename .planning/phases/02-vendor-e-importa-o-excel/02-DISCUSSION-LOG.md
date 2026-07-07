# Phase 2: Vendor e Importação Excel - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-07T20:30:00-03:00
**Phase:** 02-Vendor e Importação Excel
**Areas discussed:** Fluxo dos cards de upload

---

## Fluxo dos Cards de Upload

| Option | Description | Selected |
|--------|-------------|----------|
| Cards independentes, um botão por planilha | Mantém o padrão visual criado na Fase 1 e deixa cada fonte com estado próprio | ✓ |
| Um único botão para selecionar vários arquivos de uma vez | Reduz cliques, mas mistura responsabilidades e feedback de cada fonte | |
| Fluxo guiado em etapas: pedidos, contas e depois indicadores | Dá direção, mas adiciona cerimônia para um app local simples | |
| Você decide | Deixa a decisão para o executor | |

**User's choice:** Cards independentes, um botão por planilha.
**Notes:** O usuário escolheu manter a estrutura de três cards já existente na tela de Upload.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Badges por card: Obrigatório em pedidos/contas e Opcional em indicadores | Explicita a diferença de criticidade sem criar novas seções | ✓ |
| Manter só texto explicativo no corpo do card | Mais discreto, porém menos escaneável | |
| Separar visualmente em seção obrigatória e seção opcional | Mais claro, mas pode aumentar peso visual da tela | |
| Você decide | Deixa a decisão para o executor | |

**User's choice:** Badges por card: Obrigatório em pedidos/contas e Opcional em indicadores.
**Notes:** A distinção entre obrigatório e opcional deve ser visual e direta.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Levar/focar a página de Upload e destacar o primeiro card pendente | Aproveita o CTA global sem esconder qual fonte está pendente | ✓ |
| Abrir diretamente um seletor de arquivos genérico | Pode causar ambiguidade sobre qual fonte será importada | |
| Remover o CTA global até dashboards existirem | Evita ação global, mas desperdiça ponto de entrada visível | |
| Você decide | Deixa a decisão para o executor | |

**User's choice:** Levar/focar a página de Upload e destacar o primeiro card pendente.
**Notes:** O botão da topbar deve orientar, não substituir, o fluxo por cards.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Pendente, Lido, Erro de leitura e Opcional não carregado | Estados compactos e suficientes para a Fase 2 | ✓ |
| Estados mais detalhados: selecionado, lendo, lido, aviso, erro, opcional | Mais granular, mas aproxima a fase de validação | |
| Só Pendente ou Lido nesta fase | Simples demais para tratar erro de leitura | |
| Você decide | Deixa a decisão para o executor | |

**User's choice:** Pendente, Lido, Erro de leitura e Opcional não carregado.
**Notes:** Loading inline também foi decidido em pergunta posterior.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Nome do arquivo, quantidade de abas/linhas lidas e data/hora da importação | Dá confiança básica sem antecipar validação profunda | ✓ |
| Apenas nome do arquivo e estado Lido | Pouco informativo para planilhas reais | |
| Resumo no card + botão para abrir prévia detalhada | Útil, mas adiciona detalhe não escolhido para esta fase | |
| Você decide | Deixa a decisão para o executor | |

**User's choice:** Nome do arquivo, quantidade de abas/linhas lidas e data/hora da importação.
**Notes:** O resumo deve ser compacto e ficar no card.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Botão “Substituir planilha” dentro do próprio card | Deixa reimportação local e explícita | ✓ |
| Mesmo botão “Selecionar planilha” muda para reabrir o seletor | Menos texto, porém menos claro | |
| Exigir “Remover” antes de selecionar outra | Mais seguro, mas cria etapa extra desnecessária | |
| Você decide | Deixa a decisão para o executor | |

**User's choice:** Botão “Substituir planilha” dentro do próprio card.
**Notes:** Não foi escolhido exigir remoção antes da troca.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Estado inline no card: “Lendo arquivo...” com botão desabilitado | Feedback localizado e direto | ✓ |
| Barra global no topo da página para qualquer leitura | Pode competir com a topbar e parecer processo global | |
| Apenas toast/mensagem rápida | Pouco persistente para arquivos maiores | |
| Você decide | Deixa a decisão para o executor | |

**User's choice:** Estado inline no card: “Lendo arquivo...” com botão desabilitado.
**Notes:** A leitura deve ser percebida dentro do card correspondente.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Erro no próprio card, sem afetar os outros uploads | Mantém independência entre fontes | ✓ |
| Resumo de erro global acima dos cards | Pode ser útil na Fase 3, mas é mais pesado para erro de leitura inicial | |
| Aceitar e deixar a validação detalhada para a fase 3 | Evita bloquear, mas aceita erro óbvio cedo demais | |
| Você decide | Deixa a decisão para o executor | |

**User's choice:** Erro no próprio card, sem afetar os outros uploads.
**Notes:** Erros claramente associados ao arquivo selecionado devem ficar no card.

---

## the agent's Discretion

- Microcopy final dos estados e mensagens.
- Estrutura interna dos módulos de importação.
- Estilo exato do destaque do primeiro card pendente.

## Deferred Ideas

- Validação estrutural detalhada e resumo de severidades ficam para a Fase 3.
- Normalização, persistência, filtros, tabelas reais e exportação ficam para a Fase 4.
