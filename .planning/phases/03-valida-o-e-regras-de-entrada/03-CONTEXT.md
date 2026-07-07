# Phase 3: Validação e Regras de Entrada - Context

**Gathered:** 2026-07-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega validação confiável das planilhas antes dos dashboards. O sistema deve validar estrutura, colunas, abas, datas, valores e inconsistências críticas; aplicar regras de exclusão de totais misturados; apresentar relatório por planilha com severidade clara; e permitir seguir para dashboards apenas quando as obrigatórias estiverem sem erros críticos. Normalização completa, persistência, filtros e tabelas ficam para a Fase 4.

</domain>

<decisions>
## Implementation Decisions

### Severidade e fluxo de continuidade
- **D-01:** Modelo rigor máximo confirmado — toda não-conformidade `VAL-01`..`VAL-10` é erro crítico (❌) e bloqueia seguir para dashboards.
- **D-02:** Alertas (⚠️) ficam reservados para achados fora das regras VAL — principalmente exclusões de limpeza e outros informativos operacionais que não invalidam a estrutura.
- **D-03:** A planilha opcional Indicadores/Metas nunca bloqueia o fluxo geral; problemas ficam isolados no card e no bloco correspondente do relatório.
- **D-04:** O CTA `Continuar para dashboards` aparece automaticamente após as obrigatórias serem carregadas e fica desabilitado até Pedidos e Contas passarem sem erros críticos.

### Apresentação do relatório
- **D-05:** O relatório deve aparecer em um painel `Resultado da validação` abaixo dos cards de upload.
- **D-06:** O painel usa blocos independentes por planilha: Pedidos, Contas e Indicadores (se carregado), cada um com status próprio ✅ / ⚠️ / ❌.
- **D-07:** Os cards de upload devem substituir o estado `Lido` por `Válido`, `Inválido` ou `Com informações` após a validação.
- **D-08:** Quando inválida, a planilha mostra contagem por tipo, lista curta dos principais erros críticos e ação `Corrigir planilha`.

### Granularidade dos achados
- **D-09:** Achados informativos e de limpeza devem listar todas as exclusões/linhas afetadas, não apenas contagem.
- **D-10:** Erros críticos devem aparecer em lista plana com até 10 primeiros itens, sem agrupamento inicial por regra.
- **D-11:** Cada achado deve referenciar linha Excel + identificador de negócio (`Pedido`, fornecedor ou descrição).
- **D-12:** Listas longas usam seções expansíveis com ação `Ver todos (N)`.

### Regras de limpeza inicial
- **D-13:** Exclusões por `NRM-01` e `NRM-02` aparecem como ⚠️ alerta de dados ignorados, separadas dos erros críticos VAL.
- **D-14:** Em pedidos, ignorar linhas com `Pedido` vazio, incluindo a linha de total no fim da planilha.
- **D-15:** Em contas, parar a leitura no primeiro `TOTAL` de cada aba mensal `CONTAS ... 2026`; não ler a linha TOTAL nem nada abaixo dela.
- **D-16:** Todas as linhas excluídas devem ser listadas no relatório, com linha Excel e motivo da exclusão.

### Momento da validação
- **D-17:** A validação roda automaticamente logo após cada upload bem-sucedido.
- **D-18:** Substituir planilha dispara revalidação imediata daquela fonte.
- **D-19:** O estado de validação é independente por planilha; uma obrigatória pode estar inválida enquanto a outra ainda está pendente.
- **D-20:** O CTA global permanece visível porém desabilitado enquanto existir erro crítico em qualquer obrigatória.

### the agent's Discretion
- O executor pode decidir nomes internos de módulos (`validators`, `schemas`, `normalizers`) desde que mantenha responsabilidades separadas e JavaScript puro.
- O executor pode decidir a microcopy exata dos estados e mensagens, desde que use pt-BR, badges semânticos e a distinção ❌/⚠️/✅ definida aqui.
- O executor pode decidir limiares técnicos auxiliares não discutidos aqui (ex.: tolerância numérica para divergência de centavos), desde que não afrouxe o modelo rigor máximo de VAL.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento e escopo
- `.planning/PROJECT.md` — visão do produto, restrições técnicas, regras de negócio e decisões globais.
- `.planning/REQUIREMENTS.md` — requisitos `IMP-04`, `IMP-05`, `VAL-01`..`VAL-10`, `NRM-01` e `NRM-02`.
- `.planning/ROADMAP.md` — objetivo e critérios de sucesso da Fase 3.
- `.planning/STATE.md` — foco atual, riscos conhecidos e estado do workflow.
- `.planning/research/SUMMARY.md` — direção técnica para ETL, validação e separação de responsabilidades.
- `.planning/phases/01-funda-o-est-tica-e-design-system/01-CONTEXT.md` — shell, navegação, densidade e estados vazios herdados.
- `.planning/phases/02-vendor-e-importa-o-excel/02-CONTEXT.md` — cards de upload, estados de leitura e fluxo de importação herdados.

### Design system e UX
- `docs/DESIGN.md` — personalidade visual, densidade, badges e acessibilidade.
- `docs/TOKENS.md` — tokens de cor, spacing, estados semânticos e densidade.
- `docs/UX.md` — feedback, estados vazios, validação inline e anti-patterns.
- `docs/COMPONENTS.md` — cards, badges, summary panels, loading e error states.
- `docs/TABLES.md` — padrões para listas tabulares densas e destaques de inconsistência.
- `docs/FORMS.md` — padrões de validação visual e mensagens de erro.

### Regras de negócio e planilhas reais
- `docs/resume.md` — validações necessárias por planilha, regras de total, status de resultado e riscos de interpretação.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `index.html` — shell local com página Upload e cards por planilha.
- `css/app.css` — tokens, badges semânticos, cards, tabelas e estados visuais compatíveis com painel de validação.
- `js/app.js` — hash routes, renderização dos cards, `importState`, metadados pós-leitura e topbar com progresso das obrigatórias.
- `js/importer.js` — leitura XLSX, metadados de workbook, contagem de linhas, aba principal e abas mensais de contas.

### Established Patterns
- Um card independente por fonte: Pedidos, Contas e Indicadores opcional.
- Estados compactos no card: `Pendente`, `Lido`, `Lendo arquivo...`, `Erro de leitura`.
- Leitura delegada a `MoldeImporter`; UI concentrada em `app.js`.
- A Fase 3 deve estender esse fluxo com validação pós-leitura, sem mover normalização/persistência para esta fase.

### Integration Points
- `js/importer.js` ou módulos derivados devem expor dados brutos suficientes para validadores por tipo de planilha.
- `js/app.js` deve renderizar painel de validação abaixo dos cards e atualizar badges/CTA conforme severidade.
- Novos módulos sugeridos em `docs/resume.md` (`validators`, `schemas`, regras de limpeza) conectam-se entre importação e UI de Upload.
- O CTA `Continuar para dashboards` deve integrar com navegação existente sem exigir backend.

</code_context>

<specifics>
## Specific Ideas

- O usuário quer rigor máximo: inconsistências de linha previstas em VAL devem bloquear, não virar alerta permissivo.
- O relatório deve parecer ferramenta de auditoria operacional: bloco por planilha, referência por linha Excel e identificador de negócio.
- Exclusões de total/linha vazia são importantes o bastante para aparecer como ⚠️ com lista completa, não como detalhe escondido.
- A validação deve ser automática e transparente — sem etapa manual extra após upload.

</specifics>

<deferred>
## Deferred Ideas

- Normalização completa, campos derivados, IndexedDB, filtros, tabelas e exportação CSV pertencem à Fase 4.
- Alertas automáticos de insights financeiros/comerciais/operacionais pertencem à Fase 9.

</deferred>

---

*Phase: 03-valida-o-e-regras-de-entrada*
*Context gathered: 2026-07-07*
