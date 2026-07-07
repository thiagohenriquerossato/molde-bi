# Research Summary

## Stack

Aplicação estática com HTML, CSS e JavaScript puro, usando módulos separados por domínio. SheetJS e ECharts devem ser vendorizados localmente para cumprir o requisito de funcionar sem internet em tempo de execução. IndexedDB deve armazenar dados normalizados; `localStorage` fica para preferências leves.

## Table Stakes

- Upload das três planilhas, com indicadores/metas opcional.
- Validação estrutural e linha a linha antes dos dashboards.
- Normalização robusta de pedidos, contas e indicadores.
- Dashboards e páginas operacionais com filtros consistentes.
- Separação explícita entre pipeline, receita ativa, receita recebida e valores pendentes.
- Exportação CSV dos dados filtrados.
- UI pt-BR baseada nos tokens e padrões em `docs/`.

## Architecture

O sistema deve seguir um fluxo ETL no browser: upload, importação, validação, normalização, persistência, filtros, métricas, gráficos, tabelas e insights. A arquitetura precisa manter regras de negócio fora da renderização para facilitar manutenção e reduzir risco de cálculos divergentes entre páginas.

## Watch Out For

O maior risco é financeiro: `Aguardando Aprovação` não pode ser tratado como receita realizada. O segundo maior risco é qualidade dos dados: totais misturados, abas mensais com fórmulas, datas inconsistentes, categorias duplicadas por grafia e indicadores sem fonte operacional.

## Roadmap Implications

Construir primeiro a fundação visual e técnica, depois importação e validação, depois normalização e métricas. Dashboards devem vir após dados confiáveis. As páginas avançadas devem reaproveitar filtros, métricas, tabelas e charts já estabilizados.
