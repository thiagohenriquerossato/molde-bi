# Phase 4: Normalização, Estado e Tabelas - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 4-Normalização, Estado e Tabelas
**Areas discussed:** Momento da normalização e persistência

---

## Momento da normalização e persistência

### Quando a normalização deve rodar pela primeira vez?

| Option | Description | Selected |
|--------|-------------|----------|
| Ao clicar "Continuar para dashboards" | Normaliza só quando o usuário confirma que quer seguir | |
| Automaticamente após validação bem-sucedida | Normaliza assim que Pedidos e Contas passam sem erros críticos | ✓ |
| Botão explícito "Normalizar dados" | Usuário controla quando rodar | |

**User's choice:** Automaticamente após validação bem-sucedida
**Notes:** CTA de dashboards permanece atalho de navegação, não gatilho de normalização.

### O que acontece quando o usuário substitui uma planilha já validada?

| Option | Description | Selected |
|--------|-------------|----------|
| Re-normalizar automaticamente | Dataset sempre consistente com o que está carregado | ✓ |
| Invalidar dataset e exigir nova ação | Não reprocessar sozinho | |
| Re-normalizar só a fonte trocada manualmente | Manter outras intactas até ação manual | |

**User's choice:** Re-normalizar automaticamente ao substituir planilha

### O que deve ser persistido localmente?

| Option | Description | Selected |
|--------|-------------|----------|
| IndexedDB dataset completo + metadados | Alinha com PROJECT.md; restaura sem re-upload | ✓ |
| IndexedDB só tabelas normalizadas | Metadados de upload ficam em memória | |
| localStorage compacto | Mais simples, limitado em volume | |

**User's choice:** IndexedDB com dataset normalizado completo e metadados de importação

### Como o app deve se comportar ao reabrir o navegador?

| Option | Description | Selected |
|--------|-------------|----------|
| Restaurar e ir para Executivo | Retomar de onde parou | ✓ |
| Restaurar mas manter na página Upload | Indicador de dados restaurados | |
| Perguntar se quer restaurar | Começar do zero ou retomar | |

**User's choice:** Restaurar automaticamente e navegar direto para `#executivo`

---

## Áreas não discutidas (defaults aplicados no CONTEXT.md)

- Campos derivados — seguir `docs/resume.md` §3
- Escopo dos filtros — `FLT-01`..`FLT-05`; avançados v2 fora do escopo
- Experiência das tabelas — Base de Dados como hub; paginação, ordenação, busca, destaque TBL-02

## the agent's Discretion

- Schema IndexedDB, módulos internos, colunas padrão, formato CSV, estratégia incremental vs recomputação total

## Deferred Ideas

- KPIs/gráficos (Fases 5–9), salvar visão de filtro (v2), alertas automáticos (Fase 9)
