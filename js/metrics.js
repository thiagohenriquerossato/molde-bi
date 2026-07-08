(function () {
  const RECEITA_ATIVA_GRUPOS = ["Pedido ativo", "Entregue"];
  const PIPELINE_GRUPO = "Pipeline / orçamento";
  const CANCELADO_GRUPO = "Perdido / cancelado";
  const ENTREGUE_GRUPO = "Entregue";
  const DESPESA_FIXA_KEYWORDS = [
    "SALARIO",
    "SALÁRIO",
    "ALUGUEL",
    "INTERNET",
    "TELEFONE",
    "CONTADOR",
    "ENERGIA",
    "ÁGUA",
    "AGUA",
    "CONDOMINIO",
    "CONDOMÍNIO",
    "FIXA"
  ];

  const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  function isReceitaAtiva(row) {
    return RECEITA_ATIVA_GRUPOS.includes(row.situacao_grupo);
  }

  function isPipeline(row) {
    return row.situacao_grupo === PIPELINE_GRUPO;
  }

  function isCancelado(row) {
    return row.situacao_grupo === CANCELADO_GRUPO;
  }

  function isDespesaFixa(row) {
    const text = `${row.classificacao_normalizada || row.classificacao || ""} ${row.categoria_normalizada || row.categoria || ""}`.toUpperCase();
    return DESPESA_FIXA_KEYWORDS.some((keyword) => text.includes(keyword));
  }

  function sumField(rows, getter) {
    return (rows || []).reduce((total, row) => {
      const value = getter(row);
      return total + (Number.isFinite(value) ? value : 0);
    }, 0);
  }

  function formatMonthKey(dateOrString, monthField) {
    if (monthField && /^\d{4}-\d{2}$/.test(monthField)) {
      return monthField;
    }
    if (!dateOrString) {
      return null;
    }
    const date = new Date(dateOrString);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${date.getFullYear()}-${month}`;
  }

  function monthKeyFromPedido(row) {
    return formatMonthKey(row.data_cadastro, row.mes_cadastro);
  }

  function monthKeyFromConta(row) {
    return formatMonthKey(row.data_vencimento, row.mes_vencimento);
  }

  function sortMonths(months) {
    return [...months].sort((a, b) => a.localeCompare(b));
  }

  function computeExecutiveKpis(pedidos, contas) {
    const pedidoRows = pedidos || [];
    const contaRows = contas || [];
    const activeRows = pedidoRows.filter(isReceitaAtiva);
    const nonCancelled = pedidoRows.filter((row) => !isCancelado(row));
    const pipelineRows = pedidoRows.filter(isPipeline);
    const receitaAtiva = sumField(activeRows, (row) => row.valor_final);
    const valorRecebido = sumField(nonCancelled, (row) => row.valor_pago);
    const valorPendente = sumField(nonCancelled, (row) => row.valor_pendente);
    const despesasTotais = sumField(contaRows, (row) => row.valor);
    const despesasPagas = sumField(contaRows, (row) => (row.pago ? row.valor : 0));
    const despesasAbertas = sumField(contaRows, (row) => (!row.pago ? row.valor : 0));
    const contasVencidas = sumField(
      contaRows.filter((row) => row.status_pagamento === "Vencido"),
      (row) => row.valor
    );
    const pedidosTotais = nonCancelled.length;
    const pedidosEntregues = pedidoRows.filter((row) => row.situacao_grupo === ENTREGUE_GRUPO).length;
    const pipelineValor = sumField(pipelineRows, (row) => row.valor_final);
    const pipelineCount = pipelineRows.length;
    const ticketMedio = pedidosTotais > 0 ? sumField(nonCancelled, (row) => row.valor_final) / pedidosTotais : 0;

    return {
      receitaAtiva,
      valorRecebido,
      valorPendente,
      despesasTotais,
      despesasPagas,
      despesasAbertas,
      contasVencidas,
      resultadoCompetencia: receitaAtiva - despesasTotais,
      ticketMedio,
      pedidosTotais,
      pedidosEntregues,
      pipelineValor,
      pipelineCount
    };
  }

  function aggregateRevenueExpenseByMonth(pedidos, contas) {
    const months = new Set();
    const receitaMap = new Map();
    const despesaMap = new Map();

    (pedidos || []).filter(isReceitaAtiva).forEach((row) => {
      const month = monthKeyFromPedido(row);
      if (!month) {
        return;
      }
      months.add(month);
      receitaMap.set(month, (receitaMap.get(month) || 0) + (row.valor_final || 0));
    });

    (contas || []).forEach((row) => {
      const month = monthKeyFromConta(row);
      if (!month) {
        return;
      }
      months.add(month);
      despesaMap.set(month, (despesaMap.get(month) || 0) + (row.valor || 0));
    });

    return sortMonths(months).map((month) => {
      const receitaAtiva = receitaMap.get(month) || 0;
      const despesas = despesaMap.get(month) || 0;
      return { month, receitaAtiva, despesas, resultado: receitaAtiva - despesas };
    });
  }

  function aggregateReceivedPendingByMonth(pedidos) {
    const months = new Set();
    const recebidoMap = new Map();
    const pendenteMap = new Map();

    (pedidos || []).filter((row) => !isCancelado(row)).forEach((row) => {
      const month = monthKeyFromPedido(row);
      if (!month) {
        return;
      }
      months.add(month);
      recebidoMap.set(month, (recebidoMap.get(month) || 0) + (row.valor_pago || 0));
      pendenteMap.set(month, (pendenteMap.get(month) || 0) + (row.valor_pendente || 0));
    });

    return sortMonths(months).map((month) => ({
      month,
      recebido: recebidoMap.get(month) || 0,
      pendente: pendenteMap.get(month) || 0
    }));
  }

  function aggregateFixedVariableByMonth(contas) {
    const months = new Set();
    const fixaMap = new Map();
    const variavelMap = new Map();

    (contas || []).forEach((row) => {
      const month = monthKeyFromConta(row);
      if (!month) {
        return;
      }
      months.add(month);
      const value = row.valor || 0;
      if (isDespesaFixa(row)) {
        fixaMap.set(month, (fixaMap.get(month) || 0) + value);
      } else {
        variavelMap.set(month, (variavelMap.get(month) || 0) + value);
      }
    });

    return sortMonths(months).map((month) => ({
      month,
      fixa: fixaMap.get(month) || 0,
      variavel: variavelMap.get(month) || 0
    }));
  }

  function aggregateOrdersByGroup(pedidos) {
    const groups = new Map();
    (pedidos || []).forEach((row) => {
      const grupo = row.situacao_grupo || "Sem status";
      const current = groups.get(grupo) || { grupo, count: 0, valor: 0 };
      current.count += 1;
      current.valor += row.valor_final || 0;
      groups.set(grupo, current);
    });
    return Array.from(groups.values()).sort((a, b) => b.count - a.count);
  }

  function topClassifications(contas, limit = 10) {
    const totals = new Map();
    (contas || []).forEach((row) => {
      const label = row.classificacao || "Sem classificação";
      totals.set(label, (totals.get(label) || 0) + (row.valor || 0));
    });
    return Array.from(totals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  function topVendorsByRevenue(pedidos, limit = 10) {
    const totals = new Map();
    (pedidos || []).filter(isReceitaAtiva).forEach((row) => {
      const label = row.vendedor || "Sem vendedor";
      totals.set(label, (totals.get(label) || 0) + (row.valor_final || 0));
    });
    return Array.from(totals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  function getOverdueContas(contas, limit = 10) {
    return (contas || [])
      .filter((row) => row.status_pagamento === "Vencido")
      .sort((a, b) => (b.dias_atraso || 0) - (a.dias_atraso || 0))
      .slice(0, limit);
  }

  function getUpcomingContas(contas, limit = 10) {
    return (contas || [])
      .filter((row) => row.status_pagamento === "Próximos 7 dias")
      .sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento))
      .slice(0, limit);
  }

  function formatCurrency(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    return currencyFormatter.format(value);
  }

  window.MoldeMetrics = {
    RECEITA_ATIVA_GRUPOS,
    PIPELINE_GRUPO,
    isReceitaAtiva,
    isPipeline,
    isCancelado,
    isDespesaFixa,
    computeExecutiveKpis,
    aggregateRevenueExpenseByMonth,
    aggregateReceivedPendingByMonth,
    aggregateFixedVariableByMonth,
    aggregateOrdersByGroup,
    topClassifications,
    topVendorsByRevenue,
    getOverdueContas,
    getUpcomingContas,
    formatCurrency
  };
})();
