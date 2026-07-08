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

  const VENCE_7_STATUS = ["Vence hoje", "Próximos 7 dias"];
  const VENCE_30_STATUS = ["Vence hoje", "Próximos 7 dias", "Próximos 30 dias"];

  function sumByGroup(rows, keyGetter) {
    const totals = new Map();
    (rows || []).forEach((row) => {
      const key = keyGetter(row);
      const label = key && String(key).trim() !== "" ? String(key) : null;
      if (label === null) {
        return;
      }
      totals.set(label, (totals.get(label) || 0) + (row.valor || 0));
    });
    return totals;
  }

  function largestGroup(rows, keyGetter) {
    const totals = sumByGroup(rows, keyGetter);
    let nome = "—";
    let valor = 0;
    totals.forEach((value, label) => {
      if (value > valor) {
        valor = value;
        nome = label;
      }
    });
    return { nome, valor };
  }

  function computeFinanceKpis(contas) {
    const rows = contas || [];
    const totalContas = sumField(rows, (row) => row.valor);
    const totalPago = sumField(rows, (row) => (row.pago ? row.valor : 0));
    const totalAberto = sumField(rows, (row) => (!row.pago ? row.valor : 0));
    const totalVencido = sumField(
      rows.filter((row) => row.status_pagamento === "Vencido"),
      (row) => row.valor
    );
    const venceHoje = sumField(
      rows.filter((row) => row.status_pagamento === "Vence hoje"),
      (row) => row.valor
    );
    const vence7 = sumField(
      rows.filter((row) => VENCE_7_STATUS.includes(row.status_pagamento)),
      (row) => row.valor
    );
    const vence30 = sumField(
      rows.filter((row) => VENCE_30_STATUS.includes(row.status_pagamento)),
      (row) => row.valor
    );

    const monthTotals = new Map();
    rows.forEach((row) => {
      const month = monthKeyFromConta(row);
      if (!month) {
        return;
      }
      monthTotals.set(month, (monthTotals.get(month) || 0) + (row.valor || 0));
    });
    const mediaMensalDespesas = monthTotals.size
      ? Array.from(monthTotals.values()).reduce((total, value) => total + value, 0) / monthTotals.size
      : 0;

    const fixaTotal = sumField(rows.filter(isDespesaFixa), (row) => row.valor);
    const percentualFixas = totalContas > 0 ? (fixaTotal / totalContas) * 100 : 0;
    const percentualVariaveis = totalContas > 0 ? 100 - percentualFixas : 0;

    return {
      totalContas,
      totalPago,
      totalAberto,
      totalVencido,
      venceHoje,
      vence7,
      vence30,
      mediaMensalDespesas,
      maiorFornecedor: largestGroup(rows, (row) => row.fornecedor),
      maiorClassificacao: largestGroup(rows, (row) => row.classificacao),
      percentualFixas,
      percentualVariaveis
    };
  }

  function aggregateExpensesByMonth(contas) {
    const months = new Set();
    const valorMap = new Map();
    (contas || []).forEach((row) => {
      const month = monthKeyFromConta(row);
      if (!month) {
        return;
      }
      months.add(month);
      valorMap.set(month, (valorMap.get(month) || 0) + (row.valor || 0));
    });
    return sortMonths(months).map((month) => ({ month, valor: valorMap.get(month) || 0 }));
  }

  function aggregatePaidOpenByMonth(contas) {
    const months = new Set();
    const pagoMap = new Map();
    const abertoMap = new Map();
    (contas || []).forEach((row) => {
      const month = monthKeyFromConta(row);
      if (!month) {
        return;
      }
      months.add(month);
      const value = row.valor || 0;
      if (row.pago) {
        pagoMap.set(month, (pagoMap.get(month) || 0) + value);
      } else {
        abertoMap.set(month, (abertoMap.get(month) || 0) + value);
      }
    });
    return sortMonths(months).map((month) => ({
      month,
      pago: pagoMap.get(month) || 0,
      aberto: abertoMap.get(month) || 0
    }));
  }

  function toSortedEntries(totals, limit) {
    const entries = Array.from(totals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    return limit ? entries.slice(0, limit) : entries;
  }

  function expensesByCategory(contas) {
    return toSortedEntries(sumByGroup(contas, (row) => row.categoria || "Sem categoria"));
  }

  function expensesByClassification(contas, limit = 12) {
    return toSortedEntries(sumByGroup(contas, (row) => row.classificacao || "Sem classificação"), limit);
  }

  function topSuppliers(contas, limit = 15) {
    return toSortedEntries(sumByGroup(contas, (row) => row.fornecedor || "Sem fornecedor"), limit);
  }

  function expensesByBankAccount(contas) {
    return toSortedEntries(sumByGroup(contas, (row) => row.conta || "Sem conta"));
  }

  function dueHeatmapMatrix(contas) {
    const monthSet = new Set();
    const cells = new Map();
    (contas || [])
      .filter((row) => !row.pago && row.data_vencimento)
      .forEach((row) => {
        const month = monthKeyFromConta(row);
        const date = new Date(row.data_vencimento);
        if (!month || Number.isNaN(date.getTime())) {
          return;
        }
        monthSet.add(month);
        const day = date.getDate();
        const key = `${month}|${day}`;
        cells.set(key, (cells.get(key) || 0) + (row.valor || 0));
      });
    const months = sortMonths(monthSet);
    const data = [];
    cells.forEach((valor, key) => {
      const [month, day] = key.split("|");
      const monthIndex = months.indexOf(month);
      if (monthIndex === -1) {
        return;
      }
      data.push([Number(day) - 1, monthIndex, valor]);
    });
    return { months, data };
  }

  function supplierAbc(contas, limit = 15) {
    const all = toSortedEntries(sumByGroup(contas, (row) => row.fornecedor || "Sem fornecedor"));
    const total = all.reduce((sum, item) => sum + item.value, 0);
    const top = all.slice(0, limit);
    const rest = all.slice(limit);
    const outros = rest.reduce((sum, item) => sum + item.value, 0);
    const items = [...top];
    if (outros > 0) {
      items.push({ label: "Outros", value: outros });
    }
    let acumulado = 0;
    const withPct = items.map((item) => {
      acumulado += item.value;
      return {
        label: item.label,
        value: item.value,
        acumuladoPct: total > 0 ? (acumulado / total) * 100 : 0
      };
    });
    return { items: withPct, total };
  }

  function getOverdueContasAll(contas) {
    return (contas || [])
      .filter((row) => row.status_pagamento === "Vencido")
      .sort((a, b) => (b.dias_atraso || 0) - (a.dias_atraso || 0));
  }

  function getUpcomingContasAll(contas) {
    return (contas || [])
      .filter((row) => VENCE_7_STATUS.includes(row.status_pagamento))
      .sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento));
  }

  function getContasSemValor(contas) {
    return (contas || []).filter(
      (row) =>
        row.valor === null ||
        row.valor === undefined ||
        row.valor === 0 ||
        row.status_pagamento === "Lançamento incompleto"
    );
  }

  function getContasSemClassificacao(contas) {
    return (contas || []).filter((row) => !row.classificacao || String(row.classificacao).trim() === "");
  }

  function getContasPagasSemData(contas) {
    return (contas || []).filter((row) => row.pago === true && !row.data_pagamento);
  }

  function getContasFuturas(contas) {
    return (contas || [])
      .filter((row) => row.status_pagamento === "Futuro")
      .sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento));
  }

  function formatPercent(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    return `${value.toFixed(1).replace(".", ",")}%`;
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
    computeFinanceKpis,
    aggregateExpensesByMonth,
    aggregatePaidOpenByMonth,
    expensesByCategory,
    expensesByClassification,
    topSuppliers,
    expensesByBankAccount,
    dueHeatmapMatrix,
    supplierAbc,
    getOverdueContasAll,
    getUpcomingContasAll,
    getContasSemValor,
    getContasSemClassificacao,
    getContasPagasSemData,
    getContasFuturas,
    formatPercent,
    formatCurrency
  };
})();
