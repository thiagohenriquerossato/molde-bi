# Molde Momentos Dashboard Local

## What This Is

Um micro sistema local para o negócio Molde Momentos, focado em molduras, quadros e pedidos personalizados. O produto transforma planilhas Excel operacionais em uma interface visual de gestão, com upload, validação, normalização, dashboards, tabelas, filtros, gráficos e alertas, funcionando apenas no navegador e sem backend.

O sistema deve se comportar como um mini ERP/dashboard local: simples de abrir pelo `index.html`, robusto o bastante para lidar com dados sujos das planilhas reais e claro o suficiente para apoiar decisões financeiras, comerciais e operacionais.

## Core Value

O usuário consegue carregar as planilhas reais do negócio e enxergar rapidamente receita, despesas, pendências, prazos e inconsistências com números confiáveis.

## Requirements

### Validated

(None yet - ship to validate)

### Active

- [ ] O usuário consegue abrir o sistema localmente pelo navegador sem backend, banco externo ou login.
- [ ] O usuário consegue importar as planilhas de pedidos, contas a pagar e indicadores/metas.
- [ ] O sistema valida estrutura, colunas, abas, datas, valores e inconsistências críticas antes de exibir dashboards.
- [ ] O sistema normaliza pedidos, contas e indicadores em tabelas internas limpas.
- [ ] O sistema separa pipeline, receita ativa, receita recebida e valores a receber sem inflar indicadores.
- [ ] O sistema apresenta dashboard executivo, financeiro, pedidos, resultado integrado, insights, base de dados e metas.
- [ ] O sistema aplica filtros globais e específicos em cards, gráficos e tabelas.
- [ ] O sistema persiste localmente os últimos dados carregados e permite exportar dados filtrados para CSV.
- [ ] O sistema segue o design system dos documentos em `docs/`, com visual híbrido entre BI executivo e ERP operacional denso.

### Out of Scope

- Backend, API, servidor de aplicação ou banco de dados remoto - o produto deve funcionar localmente no navegador.
- Login, permissões, usuários e autenticação - não fazem parte do uso local proposto.
- Sincronização multiusuário ou colaboração em tempo real - depende de backend e está fora do escopo.
- Edição completa das planilhas de origem - o sistema lê, normaliza, calcula e exporta visões filtradas.
- Cálculo automático de indicadores sem fonte nas planilhas atuais, como parte de marketing, estoque e RH - esses indicadores devem aparecer como manuais ou sem base importada.

## Context

O negócio hoje é controlado por planilhas Excel. As três bases principais são:

- `Pedidos_Simplificado.xlsx`: pedidos, receita, clientes, vendedores, status, datas, valores pagos e pendentes.
- `PLANILHA CONTAS A PAGAR1.xlsx`: contas mensais de 2026, despesas, fornecedores, categorias, classificações, vencimentos e pagamentos.
- `Molde_Momentos_Template_Indicadores.xlsx`: catálogo de indicadores, metas e visão gerencial, principalmente via aba `DADOS_PBI`.

`docs/resume.md` já contém a análise funcional principal das planilhas. Ele identifica uma linha final de total misturada em pedidos, abas mensais com totais e fórmulas em contas a pagar, categorias com grafias parecidas, datas inconsistentes e indicadores sem fonte operacional.

Os documentos visuais em `docs/` definem um produto operacional denso, com sidebar fixa, topbar, superfícies claras, bordas finas, badges semânticos, tabelas como protagonistas e gráficos usados como apoio. O dashboard executivo pode ser mais visual, mas páginas operacionais devem priorizar leitura rápida, tabelas densas e KPIs compactos.

## Constraints

- **Tech stack**: HTML, CSS e JavaScript puro - atende ao requisito de sistema local simples e sem build obrigatório.
- **Runtime**: abrir `index.html` localmente - o usuário não deve depender de servidor para usar o sistema.
- **Dependencies**: SheetJS e ECharts vendorizados localmente - evita dependência de internet em tempo de execução.
- **Data source**: planilhas carregadas pelo usuário - não existe banco autoritativo além dos arquivos Excel.
- **Storage**: `localStorage` ou IndexedDB - manter os últimos dados carregados sem backend.
- **Locale**: pt-BR - datas, moeda, textos, separadores numéricos e rótulos devem ser brasileiros.
- **Visual**: seguir tokens e padrões dos documentos em `docs/` - evita criar um dashboard genérico desalinhado da identidade definida.
- **Business logic**: `Aguardando Aprovação` é pipeline, não receita realizada - principal risco para indicadores financeiros.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar aplicação estática vanilla | Reduz dependências e atende ao requisito de abrir localmente sem backend | - Pending |
| Vendorizar SheetJS e ECharts | Permite leitura XLSX e dashboards sem depender da internet em runtime | - Pending |
| Priorizar ECharts | Oferece heatmap, waterfall, gráficos combinados e interações melhores para dashboards completos | - Pending |
| Usar visual híbrido | O executivo precisa ser mais analítico, enquanto operação precisa de densidade e tabelas | - Pending |
| Separar pipeline de receita ativa | Evita inflar resultados com pedidos em aprovação/orçamento | - Pending |
| Usar IndexedDB preferencialmente para dados normalizados | Mais adequado que `localStorage` para tabelas e reimportações futuras | - Pending |
| Tratar indicadores sem fonte como manual ou indisponível | Evita números inventados para marketing, estoque, RH e partes da produção | - Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? Move to Out of Scope with reason.
2. Requirements validated? Move to Validated with phase reference.
3. New requirements emerged? Add to Active.
4. Decisions to log? Add to Key Decisions.
5. "What This Is" still accurate? Update if drifted.

**After each milestone**:
1. Full review of all sections.
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state.

---
*Last updated: 2026-07-07 after initialization*
