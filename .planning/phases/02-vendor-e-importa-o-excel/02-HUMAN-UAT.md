---
status: partial
phase: 02-vendor-e-importa-o-excel
source: [02-VERIFICATION.md]
started: 2026-07-07T21:30:00Z
updated: 2026-07-07T21:30:00Z
---

## Current Test

Aguardando teste manual no navegador com seletor nativo de arquivos.

## Tests

### 1. Cards de upload ativos após carregar a página
expected: Botões habilitados; badges corretos por origem; sem copy "Disponível na Fase 2" após renderização JS
result: [pending]

### 2. Leitura da planilha de pedidos
expected: Card muda para "Lido" com metadados de arquivo, aba, abas, linhas e horário
result: [pending]

### 3. Leitura da planilha de contas
expected: Card muda para "Lido" com abas mensais `CONTAS *2026` nos metadados
result: [pending]

### 4. Atalho da topbar para card pendente
expected: Foco em `#upload` e destaque do primeiro card obrigatório pendente
result: [pending]

### 5. Fluxo sem indicadores opcionais
expected: Pedidos + contas liberam "Bases obrigatórias lidas" sem exigir indicadores
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
