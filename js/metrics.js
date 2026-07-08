(function () {
  const RECEITA_ATIVA_GRUPOS = ["Pedido ativo", "Entregue"];
  const PIPELINE_GRUPO = "Aguardando Aprovação";
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

  function monthKeyFromPedidoCompetencia(row, receitaBase) {
    if (receitaBase === "entrega") {
      return formatMonthKey(row.data_entregue, row.mes_entrega);
    }
    return monthKeyFromPedido(row);
  }

  function monthKeyFromConta(row) {
    return formatMonthKey(row.data_vencimento, row.mes_vencimento);
  }

  function monthKeyFromPayment(row) {
    return formatMonthKey(row.data_pagamento, null);
  }

  function parseFilterDate(value) {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function matchesPeriodFields(dateField, monthField, state) {
    const date = parseFilterDate(dateField);
    if (state.year) {
      const year = date ? date.getFullYear() : monthField ? Number(monthField.slice(0, 4)) : null;
      if (year !== Number(state.year)) {
        return false;
      }
    }
    if (state.month) {
      const month = date ? date.getMonth() + 1 : monthField ? Number(monthField.slice(5, 7)) : null;
      if (month !== Number(state.month)) {
        return false;
      }
    }
    if (state.periodFrom) {
      const from = parseFilterDate(state.periodFrom);
      if (from && date && date < from) {
        return false;
      }
    }
    if (state.periodTo) {
      const to = parseFilterDate(state.periodTo);
      if (to && date && date > to) {
        return false;
      }
    }
    return true;
  }

  function hasPeriodFilter(state) {
    return Boolean(state.year || state.month || state.periodFrom || state.periodTo);
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

  const ATIVO_GRUPO = "Pedido ativo";
  const HIGH_DISCOUNT_RATIO = 0.2;

  function getActivePedidoRows(pedidos) {
    return (pedidos || []).filter(isReceitaAtiva);
  }

  function getDeliveredRows(pedidos) {
    return (pedidos || []).filter((row) => row.situacao_grupo === ENTREGUE_GRUPO);
  }

  function computePedidosKpis(pedidos) {
    const rows = pedidos || [];
    const activeRows = getActivePedidoRows(rows);
    const deliveredRows = getDeliveredRows(rows);
    const pipelineRows = rows.filter(isPipeline);

    const valorBruto = sumField(activeRows, (row) => row.valor_bruto);
    const descontos = sumField(activeRows, (row) => row.valor_desconto);
    const valorFinal = sumField(activeRows, (row) => row.valor_final);
    const valorPago = sumField(activeRows, (row) => row.valor_pago);
    const valorPendente = sumField(activeRows, (row) => row.valor_pendente);
    const activeCount = activeRows.length;
    const ticketMedio = activeCount > 0 ? valorFinal / activeCount : 0;

    const discountRates = activeRows
      .filter((row) => row.valor_bruto > 0)
      .map((row) => ((row.valor_desconto || 0) / row.valor_bruto) * 100);
    const descontoMedio = discountRates.length
      ? discountRates.reduce((total, value) => total + value, 0) / discountRates.length
      : 0;

    const productionDays = deliveredRows
      .map((row) => row.dias_producao)
      .filter((value) => Number.isFinite(value));
    const tempoMedioProducao = productionDays.length
      ? productionDays.reduce((total, value) => total + value, 0) / productionDays.length
      : 0;

    const lateDays = deliveredRows
      .map((row) => row.dias_atraso)
      .filter((value) => Number.isFinite(value) && value > 0);
    const atrasoMedio = lateDays.length
      ? lateDays.reduce((total, value) => total + value, 0) / lateDays.length
      : 0;

    const onTimeEligible = deliveredRows.filter(
      (row) => row.data_prevista && row.data_entregue && row.entregue_no_prazo !== null
    );
    const onTimeCount = onTimeEligible.filter((row) => row.entregue_no_prazo === true).length;
    const percentualEntregueNoPrazo = onTimeEligible.length ? (onTimeCount / onTimeEligible.length) * 100 : 0;

    const pipelineValor = sumField(pipelineRows, (row) => row.valor_final);

    return {
      valorBruto,
      descontos,
      valorFinal,
      valorPago,
      valorPendente,
      ticketMedio,
      totalPedidos: rows.length,
      pedidosEntregues: deliveredRows.length,
      pedidosCancelados: rows.filter((row) => row.situacao_grupo === CANCELADO_GRUPO).length,
      pedidosAtivos: rows.filter((row) => row.situacao_grupo === ATIVO_GRUPO).length,
      pipelineCount: pipelineRows.length,
      pipelineValor,
      descontoMedio,
      tempoMedioProducao,
      atrasoMedio,
      percentualEntregueNoPrazo
    };
  }

  function aggregateRevenueByMonth(pedidos) {
    const months = new Set();
    const valorMap = new Map();
    getActivePedidoRows(pedidos).forEach((row) => {
      const month = monthKeyFromPedido(row);
      if (!month) {
        return;
      }
      months.add(month);
      valorMap.set(month, (valorMap.get(month) || 0) + (row.valor_final || 0));
    });
    return sortMonths(months).map((month) => ({ month, valor: valorMap.get(month) || 0 }));
  }

  function aggregateOrdersCountByMonth(pedidos) {
    const months = new Set();
    const countMap = new Map();
    (pedidos || []).forEach((row) => {
      const month = monthKeyFromPedido(row);
      if (!month) {
        return;
      }
      months.add(month);
      countMap.set(month, (countMap.get(month) || 0) + 1);
    });
    return sortMonths(months).map((month) => ({ month, count: countMap.get(month) || 0 }));
  }

  function aggregateTicketByMonth(pedidos) {
    const months = new Set();
    const sumMap = new Map();
    const countMap = new Map();
    getActivePedidoRows(pedidos).forEach((row) => {
      const month = monthKeyFromPedido(row);
      if (!month) {
        return;
      }
      months.add(month);
      sumMap.set(month, (sumMap.get(month) || 0) + (row.valor_final || 0));
      countMap.set(month, (countMap.get(month) || 0) + 1);
    });
    return sortMonths(months).map((month) => {
      const count = countMap.get(month) || 0;
      const sum = sumMap.get(month) || 0;
      return { month, ticket: count > 0 ? sum / count : 0 };
    });
  }

  function aggregateDiscountByMonth(pedidos) {
    const months = new Set();
    const valorMap = new Map();
    getActivePedidoRows(pedidos).forEach((row) => {
      const month = monthKeyFromPedido(row);
      if (!month) {
        return;
      }
      months.add(month);
      valorMap.set(month, (valorMap.get(month) || 0) + (row.valor_desconto || 0));
    });
    return sortMonths(months).map((month) => ({ month, valor: valorMap.get(month) || 0 }));
  }

  function topClientsByRevenue(pedidos, limit = 12) {
    const totals = new Map();
    getActivePedidoRows(pedidos).forEach((row) => {
      const label = row.cliente || "Sem cliente";
      totals.set(label, (totals.get(label) || 0) + (row.valor_final || 0));
    });
    return Array.from(totals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  function ordersCountByVendor(pedidos, limit = 12) {
    const totals = new Map();
    (pedidos || []).forEach((row) => {
      const label = row.vendedor || "Sem vendedor";
      totals.set(label, (totals.get(label) || 0) + 1);
    });
    return Array.from(totals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  function pendingByStatus(pedidos) {
    const totals = new Map();
    (pedidos || [])
      .filter((row) => !isCancelado(row))
      .forEach((row) => {
        const grupo = row.situacao_grupo || "Sem status";
        totals.set(grupo, (totals.get(grupo) || 0) + (row.valor_pendente || 0));
      });
    return Array.from(totals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }

  function onTimeDeliverySplit(pedidos) {
    const delivered = getDeliveredRows(pedidos).filter(
      (row) => row.data_prevista && row.data_entregue && row.entregue_no_prazo !== null
    );
    const onTime = delivered.filter((row) => row.entregue_no_prazo === true).length;
    const late = delivered.length - onTime;
    return [
      { label: "No prazo", value: onTime },
      { label: "Atrasados", value: late }
    ].filter((item) => item.value > 0);
  }

  function productionTimeByMonth(pedidos) {
    const monthBuckets = new Map();
    getDeliveredRows(pedidos).forEach((row) => {
      if (!Number.isFinite(row.dias_producao)) {
        return;
      }
      const month = row.mes_entrega || monthKeyFromPedido(row);
      if (!month) {
        return;
      }
      const bucket = monthBuckets.get(month) || { sum: 0, count: 0 };
      bucket.sum += row.dias_producao;
      bucket.count += 1;
      monthBuckets.set(month, bucket);
    });
    return sortMonths(monthBuckets.keys()).map((month) => {
      const bucket = monthBuckets.get(month);
      return { month, media: bucket.count > 0 ? bucket.sum / bucket.count : 0 };
    });
  }

  function ticketHistogram(pedidos) {
    const bins = [
      { label: "Até R$ 500", min: 0, max: 500, count: 0 },
      { label: "R$ 500–1k", min: 500, max: 1000, count: 0 },
      { label: "R$ 1k–2k", min: 1000, max: 2000, count: 0 },
      { label: "R$ 2k–5k", min: 2000, max: 5000, count: 0 },
      { label: "Acima R$ 5k", min: 5000, max: Infinity, count: 0 }
    ];
    getActivePedidoRows(pedidos).forEach((row) => {
      const value = row.valor_final || 0;
      const bin = bins.find((item) => value >= item.min && value < item.max);
      if (bin) {
        bin.count += 1;
      }
    });
    return bins.map(({ label, count }) => ({ label, value: count }));
  }

  function getPedidosAtrasados(pedidos) {
    return (pedidos || [])
      .filter((row) => row.entregue_no_prazo === false)
      .sort((a, b) => (b.dias_atraso || 0) - (a.dias_atraso || 0));
  }

  function getPedidosEntreguesComPendencia(pedidos) {
    return (pedidos || [])
      .filter((row) => row.situacao_grupo === ENTREGUE_GRUPO && (row.valor_pendente || 0) > 0.01)
      .sort((a, b) => (b.valor_pendente || 0) - (a.valor_pendente || 0));
  }

  function getPedidosSemCliente(pedidos) {
    return (pedidos || []).filter((row) => !row.cliente || String(row.cliente).trim() === "");
  }

  function getPedidosSemDataPrevista(pedidos) {
    return (pedidos || []).filter((row) => !row.data_prevista);
  }

  function getPedidosDescontoAlto(pedidos) {
    return (pedidos || [])
      .filter((row) => row.valor_bruto > 0 && (row.valor_desconto || 0) / row.valor_bruto >= HIGH_DISCOUNT_RATIO)
      .sort((a, b) => (b.valor_desconto || 0) / (b.valor_bruto || 1) - (a.valor_desconto || 0) / (a.valor_bruto || 1));
  }

  function getPedidosPipeline(pedidos) {
    return (pedidos || [])
      .filter((row) => row.situacao_grupo === PIPELINE_GRUPO)
      .sort((a, b) => new Date(a.data_cadastro) - new Date(b.data_cadastro));
  }

  function aggregateRevenueExpenseByMonthCompetencia(pedidos, contas, receitaBase) {
    const months = new Set();
    const receitaMap = new Map();
    const despesaMap = new Map();

    (pedidos || []).filter(isReceitaAtiva).forEach((row) => {
      const month = monthKeyFromPedidoCompetencia(row, receitaBase);
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

  function sumCashReceivedInPeriod(pedidos, filterState) {
    return sumField(
      (pedidos || []).filter((row) => {
        if (isCancelado(row)) {
          return false;
        }
        if (!hasPeriodFilter(filterState)) {
          return true;
        }
        return matchesPeriodFields(row.data_cadastro, row.mes_cadastro, filterState);
      }),
      (row) => row.valor_pago
    );
  }

  function sumCashPaidInPeriod(contas, filterState) {
    return sumField(
      (contas || []).filter((row) => {
        if (!row.pago) {
          return false;
        }
        if (!hasPeriodFilter(filterState)) {
          return true;
        }
        return matchesPeriodFields(row.data_pagamento, monthKeyFromPayment(row), filterState);
      }),
      (row) => row.valor
    );
  }

  function aggregateReceivedPaidByMonth(pedidos, contas, filterState) {
    const months = new Set();
    const recebidoMap = new Map();
    const pagoMap = new Map();

    (pedidos || []).filter((row) => !isCancelado(row)).forEach((row) => {
      const month = monthKeyFromPedido(row);
      if (!month) {
        return;
      }
      if (hasPeriodFilter(filterState) && !matchesPeriodFields(row.data_cadastro, row.mes_cadastro, filterState)) {
        return;
      }
      months.add(month);
      recebidoMap.set(month, (recebidoMap.get(month) || 0) + (row.valor_pago || 0));
    });

    (contas || []).filter((row) => row.pago).forEach((row) => {
      const month = monthKeyFromPayment(row);
      if (!month) {
        return;
      }
      if (hasPeriodFilter(filterState) && !matchesPeriodFields(row.data_pagamento, month, filterState)) {
        return;
      }
      months.add(month);
      pagoMap.set(month, (pagoMap.get(month) || 0) + (row.valor || 0));
    });

    return sortMonths(months).map((month) => ({
      month,
      recebido: recebidoMap.get(month) || 0,
      pago: pagoMap.get(month) || 0
    }));
  }

  function aggregateCashProjection(pedidos, contas, filterState) {
    const flow = aggregateReceivedPaidByMonth(pedidos, contas, filterState);
    let balance = 0;
    return flow.map((item) => {
      balance += item.recebido - item.pago;
      return { month: item.month, saldo: balance, fluxo: item.recebido - item.pago };
    });
  }

  function aggregateReceivablesOpenByMonth(pedidos, contas) {
    const months = new Set();
    const recebiveisMap = new Map();
    const abertasMap = new Map();

    (pedidos || []).filter((row) => !isCancelado(row)).forEach((row) => {
      const month = monthKeyFromPedido(row);
      if (!month) {
        return;
      }
      months.add(month);
      recebiveisMap.set(month, (recebiveisMap.get(month) || 0) + (row.valor_pendente || 0));
    });

    (contas || []).filter((row) => !row.pago).forEach((row) => {
      const month = monthKeyFromConta(row);
      if (!month) {
        return;
      }
      months.add(month);
      abertasMap.set(month, (abertasMap.get(month) || 0) + (row.valor || 0));
    });

    return sortMonths(months).map((month) => ({
      month,
      recebiveis: recebiveisMap.get(month) || 0,
      abertas: abertasMap.get(month) || 0
    }));
  }

  function aggregateBreakEvenByMonth(pedidos, contas) {
    const months = new Set();
    const fixaMap = new Map();
    const ticketMap = new Map();
    const countMap = new Map();

    (contas || []).filter(isDespesaFixa).forEach((row) => {
      const month = monthKeyFromConta(row);
      if (!month) {
        return;
      }
      months.add(month);
      fixaMap.set(month, (fixaMap.get(month) || 0) + (row.valor || 0));
    });

    (pedidos || []).filter((row) => !isCancelado(row)).forEach((row) => {
      const month = monthKeyFromPedido(row);
      if (!month) {
        return;
      }
      months.add(month);
      ticketMap.set(month, (ticketMap.get(month) || 0) + (row.valor_final || 0));
      countMap.set(month, (countMap.get(month) || 0) + 1);
    });

    return sortMonths(months).map((month) => {
      const fixa = fixaMap.get(month) || 0;
      const count = countMap.get(month) || 0;
      const ticket = count > 0 ? (ticketMap.get(month) || 0) / count : 0;
      return { month, pedidosEquilibrio: ticket > 0 ? Math.ceil(fixa / ticket) : null };
    });
  }

  function buildWaterfallTotals(pedidos, contas, receitaBase) {
    const activeRows = (pedidos || []).filter(isReceitaAtiva);
    const receita = sumField(activeRows, (row) => row.valor_final);
    const despesas = sumField(contas || [], (row) => row.valor);
    return {
      receita,
      despesas,
      resultado: receita - despesas,
      receitaBase
    };
  }

  function computeResultadoKpis(pedidos, contas, filterState, options = {}) {
    const receitaBase = options.receitaBase || "cadastro";
    const pedidoRows = pedidos || [];
    const contaRows = contas || [];
    const activeRows = pedidoRows.filter(isReceitaAtiva);
    const nonCancelled = pedidoRows.filter((row) => !isCancelado(row));

    const receitaMes = sumField(activeRows, (row) => row.valor_final);
    const despesaMes = sumField(contaRows, (row) => row.valor);
    const resultadoCompetencia = receitaMes - despesaMes;

    const recebidoMes = sumCashReceivedInPeriod(pedidoRows, filterState || {});
    const despesaPagaMes = sumCashPaidInPeriod(contaRows, filterState || {});
    const resultadoCaixa = recebidoMes - despesaPagaMes;

    const recebiveis = sumField(nonCancelled, (row) => row.valor_pendente);
    const contasAbertas = sumField(
      contaRows.filter((row) => !row.pago),
      (row) => row.valor
    );
    const saldoProjetado = recebiveis - contasAbertas;
    const cobertura = contasAbertas > 0 ? recebiveis / contasAbertas : null;

    const despesasFixas = sumField(contaRows.filter(isDespesaFixa), (row) => row.valor);
    const pedidosCount = nonCancelled.length;
    const ticketMedio = pedidosCount > 0 ? sumField(nonCancelled, (row) => row.valor_final) / pedidosCount : 0;
    const pedidosEquilibrio = ticketMedio > 0 ? Math.ceil(despesasFixas / ticketMedio) : null;

    return {
      competencia: { receitaMes, despesaMes, resultadoCompetencia },
      caixa: { recebidoMes, despesaPagaMes, resultadoCaixa },
      operacional: { recebiveis, contasAbertas, saldoProjetado, cobertura, pedidosEquilibrio },
      receitaBase
    };
  }

  function formatRatio(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    return `${value.toFixed(2).replace(".", ",")}×`;
  }

  function formatCount(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    return String(Math.round(value));
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

  function getReferenceMonths(today = new Date()) {
    const current = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const previousDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previous = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`;
    return { current, previous };
  }

  function compareMonthMetric(current, previous, options = {}) {
    const higherIsBad = Boolean(options.higherIsBad);
    if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
      return null;
    }
    const changePct = ((current - previous) / Math.abs(previous)) * 100;
    const triggered = higherIsBad ? changePct >= (options.thresholdPct || 20) : changePct <= -(options.thresholdPct || 20);
    if (!triggered) {
      return null;
    }
    return {
      current,
      previous,
      changePct,
      variacao: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(1).replace(".", ",")}%`
    };
  }

  function sumContasByMonth(contas, month) {
    return sumField(
      (contas || []).filter((row) => monthKeyFromConta(row) === month),
      (row) => row.valor
    );
  }

  function sumContasByMonthGroup(contas, month, keyGetter) {
    const totals = new Map();
    (contas || [])
      .filter((row) => monthKeyFromConta(row) === month)
      .forEach((row) => {
        const label = keyGetter(row) || "Sem identificação";
        totals.set(label, (totals.get(label) || 0) + (row.valor || 0));
      });
    return totals;
  }

  function detectSupplierSpike(contas, months, thresholdPct = 20) {
    const currentTotals = sumContasByMonthGroup(contas, months.current, (row) => row.fornecedor);
    const previousTotals = sumContasByMonthGroup(contas, months.previous, (row) => row.fornecedor);
    let best = null;
    currentTotals.forEach((current, nome) => {
      const previous = previousTotals.get(nome) || 0;
      const comparison = compareMonthMetric(current, previous, { higherIsBad: true, thresholdPct });
      if (comparison && (!best || comparison.changePct > best.changePct)) {
        best = {
          nome,
          atual: current,
          anterior: previous,
          variacao: comparison.variacao,
          changePct: comparison.changePct
        };
      }
    });
    return best;
  }

  function detectFixedExpenseAboveAverage(contas, months) {
    const fixedByMonth = new Map();
    (contas || []).filter(isDespesaFixa).forEach((row) => {
      const month = monthKeyFromConta(row);
      if (!month) {
        return;
      }
      fixedByMonth.set(month, (fixedByMonth.get(month) || 0) + (row.valor || 0));
    });
    const current = fixedByMonth.get(months.current) || 0;
    const history = Array.from(fixedByMonth.entries())
      .filter(([month]) => month !== months.current)
      .map(([, value]) => value);
    if (!history.length || current <= 0) {
      return null;
    }
    const average = history.reduce((total, value) => total + value, 0) / history.length;
    if (current <= average * 1.05) {
      return null;
    }
    const changePct = ((current - average) / average) * 100;
    return {
      nome: "Despesas fixas",
      atual: current,
      anterior: average,
      variacao: `+${changePct.toFixed(1).replace(".", ",")}% vs média`
    };
  }

  function detectCategoryGrowth(contas, months, thresholdPct = 20) {
    const currentTotals = sumContasByMonthGroup(contas, months.current, (row) => row.categoria || "Sem categoria");
    const previousTotals = sumContasByMonthGroup(contas, months.previous, (row) => row.categoria || "Sem categoria");
    let best = null;
    currentTotals.forEach((current, nome) => {
      const previous = previousTotals.get(nome) || 0;
      const comparison = compareMonthMetric(current, previous, { higherIsBad: true, thresholdPct });
      if (comparison && (!best || comparison.changePct > best.changePct)) {
        best = {
          nome,
          atual: current,
          anterior: previous,
          variacao: comparison.variacao,
          changePct: comparison.changePct
        };
      }
    });
    return best;
  }

  function detectFutureDueConcentration(contas, thresholdPct = 40) {
    const futureRows = (contas || []).filter((row) => row.status_pagamento === "Futuro");
    if (!futureRows.length) {
      return [];
    }
    const total = sumField(futureRows, (row) => row.valor);
    if (total <= 0) {
      return [];
    }
    const byMonth = new Map();
    futureRows.forEach((row) => {
      const month = row.mes_vencimento || "Sem mês";
      byMonth.set(month, (byMonth.get(month) || 0) + (row.valor || 0));
    });
    return Array.from(byMonth.entries())
      .map(([mes, valor]) => ({
        mes,
        valor,
        percentual: `${((valor / total) * 100).toFixed(1).replace(".", ",")}%`
      }))
      .filter((item) => (item.valor / total) * 100 >= thresholdPct)
      .sort((a, b) => b.valor - a.valor);
  }

  function getClientsHighPending(pedidos, minValue = 3000) {
    const totals = new Map();
    (pedidos || [])
      .filter((row) => !isCancelado(row))
      .forEach((row) => {
        const nome = row.cliente || "Sem cliente";
        totals.set(nome, (totals.get(nome) || 0) + (row.valor_pendente || 0));
      });
    return Array.from(totals.entries())
      .filter(([, valor]) => valor >= minValue)
      .map(([nome, valor]) => ({ nome, valor, pedidos: null }))
      .sort((a, b) => b.valor - a.valor);
  }

  function getVendorsManyPending(pedidos, minOrders = 5) {
    const counts = new Map();
    const totals = new Map();
    (pedidos || [])
      .filter((row) => !isCancelado(row) && (row.valor_pendente || 0) > 0.01)
      .forEach((row) => {
        const nome = row.vendedor || "Sem vendedor";
        counts.set(nome, (counts.get(nome) || 0) + 1);
        totals.set(nome, (totals.get(nome) || 0) + (row.valor_pendente || 0));
      });
    return Array.from(counts.entries())
      .filter(([, pedidosCount]) => pedidosCount >= minOrders)
      .map(([nome, pedidosCount]) => ({ nome, valor: totals.get(nome) || 0, pedidos: pedidosCount }))
      .sort((a, b) => b.pedidos - a.pedidos);
  }

  function detectTicketDrop(pedidos, months, thresholdPct = 20) {
    const ticketForMonth = (month) => {
      const rows = getActivePedidoRows(pedidos).filter((row) => monthKeyFromPedido(row) === month);
      if (!rows.length) {
        return null;
      }
      return sumField(rows, (row) => row.valor_final) / rows.length;
    };
    const current = ticketForMonth(months.current);
    const previous = ticketForMonth(months.previous);
    const comparison = compareMonthMetric(current, previous, { higherIsBad: false, thresholdPct });
    if (!comparison) {
      return null;
    }
    return {
      nome: "Ticket médio",
      atual: current,
      anterior: previous,
      variacao: comparison.variacao
    };
  }

  function detectDeliveryTimeIncrease(pedidos, months, thresholdPct = 20) {
    const avgForMonth = (month) => {
      const rows = getDeliveredRows(pedidos).filter(
        (row) => (row.mes_entrega || monthKeyFromPedido(row)) === month && Number.isFinite(row.dias_producao)
      );
      if (!rows.length) {
        return null;
      }
      return rows.reduce((total, row) => total + row.dias_producao, 0) / rows.length;
    };
    const current = avgForMonth(months.current);
    const previous = avgForMonth(months.previous);
    const comparison = compareMonthMetric(current, previous, { higherIsBad: true, thresholdPct });
    if (!comparison) {
      return null;
    }
    return {
      nome: "Tempo médio de entrega",
      atual: `${current.toFixed(1).replace(".", ",")}`,
      anterior: `${previous.toFixed(1).replace(".", ",")}`,
      variacao: comparison.variacao
    };
  }

  function computeInsightsSummary(categories) {
    const all = [...(categories.financeiro || []), ...(categories.comercial || []), ...(categories.operacional || [])];
    const criticos = all.filter((alert) => alert.severity === "critico").reduce((total, alert) => total + alert.count, 0);
    const financeiros = (categories.financeiro || []).reduce((total, alert) => total + alert.count, 0);
    const comerciaisOperacionais =
      (categories.comercial || []).reduce((total, alert) => total + alert.count, 0) +
      (categories.operacional || []).reduce((total, alert) => total + alert.count, 0);
    return {
      total: all.reduce((total, alert) => total + alert.count, 0),
      criticos,
      financeiros,
      comerciaisOperacionais
    };
  }

  function normalizeSituacaoKey(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function countBySituacaoOriginal(pedidos, label) {
    return (pedidos || []).filter((row) => normalizeSituacaoKey(row.situacao_original) === normalizeSituacaoKey(label)).length;
  }

  function computeClientesKpis(pedidos) {
    const rows = pedidos || [];
    const activeRows = getActivePedidoRows(rows);
    const clients = new Set();
    const clientOrders = new Map();

    rows.forEach((row) => {
      const client = row.cliente || "Sem cliente";
      clients.add(client);
      const bucket = clientOrders.get(client) || { count: 0, revenue: 0, pending: 0, firstMonth: row.mes_cadastro };
      bucket.count += 1;
      if (row.mes_cadastro && (!bucket.firstMonth || row.mes_cadastro < bucket.firstMonth)) {
        bucket.firstMonth = row.mes_cadastro;
      }
      if (isReceitaAtiva(row)) {
        bucket.revenue += row.valor_final || 0;
      }
      if (!isCancelado(row)) {
        bucket.pending += row.valor_pendente || 0;
      }
      clientOrders.set(client, bucket);
    });

    const recorrentes = Array.from(clientOrders.values()).filter((item) => item.count > 1).length;
    const months = sortMonths(
      new Set(activeRows.map((row) => row.mes_cadastro).filter(Boolean))
    );
    const currentMonth = months.length ? months[months.length - 1] : null;
    const novosMes = currentMonth
      ? Array.from(clientOrders.entries()).filter(([, data]) => data.firstMonth === currentMonth && data.count === 1).length
      : 0;

    const topClientRevenue = topClientsByRevenue(rows, 1)[0] || { label: "—", value: 0 };
    const topClientPending = topClientsByPending(rows, 1)[0] || { label: "—", value: 0 };
    const vendorRevenue = topVendorsByRevenue(rows, 1)[0] || { label: "—", value: 0 };
    const vendorTicket = ticketByVendor(rows, 1)[0] || { label: "—", value: 0 };
    const vendorOrders = ordersCountByVendor(rows, 1)[0] || { label: "—", value: 0 };
    const vendorPending = pendingByVendor(rows, 1)[0] || { label: "—", value: 0 };

    return {
      clientesUnicos: clients.size,
      clientesRecorrentes: recorrentes,
      clientesNovosMes: novosMes,
      topClienteReceitaNome: topClientRevenue.label,
      topClienteReceitaValor: topClientRevenue.value,
      topClientePendenciaNome: topClientPending.label,
      topClientePendenciaValor: topClientPending.value,
      topVendedorReceitaNome: vendorRevenue.label,
      topVendedorReceitaValor: vendorRevenue.value,
      topVendedorTicketNome: vendorTicket.label,
      topVendedorTicketValor: vendorTicket.value,
      topVendedorPedidosNome: vendorOrders.label,
      topVendedorPedidosValor: vendorOrders.value,
      topVendedorPendenciaNome: vendorPending.label,
      topVendedorPendenciaValor: vendorPending.value
    };
  }

  function topClientsByPending(pedidos, limit = 12) {
    const totals = new Map();
    (pedidos || [])
      .filter((row) => !isCancelado(row))
      .forEach((row) => {
        const label = row.cliente || "Sem cliente";
        totals.set(label, (totals.get(label) || 0) + (row.valor_pendente || 0));
      });
    return Array.from(totals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  function ticketByVendor(pedidos, limit = 12) {
    const sumMap = new Map();
    const countMap = new Map();
    getActivePedidoRows(pedidos).forEach((row) => {
      const label = row.vendedor || "Sem vendedor";
      sumMap.set(label, (sumMap.get(label) || 0) + (row.valor_final || 0));
      countMap.set(label, (countMap.get(label) || 0) + 1);
    });
    return Array.from(sumMap.entries())
      .map(([label, sum]) => ({ label, value: (countMap.get(label) || 0) > 0 ? sum / countMap.get(label) : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  function pendingByVendor(pedidos, limit = 12) {
    const totals = new Map();
    (pedidos || [])
      .filter((row) => !isCancelado(row))
      .forEach((row) => {
        const label = row.vendedor || "Sem vendedor";
        totals.set(label, (totals.get(label) || 0) + (row.valor_pendente || 0));
      });
    return Array.from(totals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  function aggregateClientRecurrence(pedidos) {
    const months = new Set();
    (pedidos || []).forEach((row) => {
      if (row.mes_cadastro) {
        months.add(row.mes_cadastro);
      }
    });

    const firstMonthByClient = new Map();
    (pedidos || []).forEach((row) => {
      const client = row.cliente || "Sem cliente";
      const month = row.mes_cadastro;
      if (!month) {
        return;
      }
      const current = firstMonthByClient.get(client);
      if (!current || month < current) {
        firstMonthByClient.set(client, month);
      }
    });

    return sortMonths(months).map((month) => {
      let novos = 0;
      let recorrentes = 0;
      (pedidos || []).forEach((row) => {
        if (row.mes_cadastro !== month) {
          return;
        }
        const client = row.cliente || "Sem cliente";
        if (firstMonthByClient.get(client) === month) {
          novos += 1;
        } else {
          recorrentes += 1;
        }
      });
      return { month, novos, recorrentes };
    });
  }

  function aggregateVendorRankings(pedidos) {
    return {
      revenue: topVendorsByRevenue(pedidos, 12),
      ticket: ticketByVendor(pedidos, 12),
      orders: ordersCountByVendor(pedidos, 12),
      pending: pendingByVendor(pedidos, 12)
    };
  }

  function aggregateVendorStatusMatrix(pedidos) {
    const vendors = new Set();
    const groups = new Set();
    const matrix = new Map();

    (pedidos || []).forEach((row) => {
      const vendor = row.vendedor || "Sem vendedor";
      const grupo = row.situacao_grupo || "Sem status";
      vendors.add(vendor);
      groups.add(grupo);
      const key = `${vendor}::${grupo}`;
      matrix.set(key, (matrix.get(key) || 0) + 1);
    });

    const vendorList = Array.from(vendors).sort((a, b) => a.localeCompare(b, "pt-BR"));
    const groupList = Array.from(groups).sort((a, b) => a.localeCompare(b, "pt-BR"));
    const data = [];
    vendorList.forEach((vendor, yIndex) => {
      groupList.forEach((grupo, xIndex) => {
        const value = matrix.get(`${vendor}::${grupo}`) || 0;
        if (value > 0) {
          data.push([xIndex, yIndex, value]);
        }
      });
    });

    return { vendors: vendorList, groups: groupList, data };
  }

  function computeProducaoKpis(pedidos) {
    const rows = pedidos || [];
    const delivered = getDeliveredRows(rows);
    const activeLate = rows.filter((row) => row.entregue_no_prazo === false);
    const productionDays = delivered.map((row) => row.dias_producao).filter((value) => Number.isFinite(value));
    const leadDays = delivered
      .filter((row) => row.data_prevista && row.data_entregue)
      .map((row) => row.dias_atraso)
      .filter((value) => Number.isFinite(value));
    const onTimeEligible = delivered.filter((row) => row.entregue_no_prazo !== null);
    const onTimeCount = onTimeEligible.filter((row) => row.entregue_no_prazo === true).length;

    return {
      aguardandoProduzir: countBySituacaoOriginal(rows, "Aguardando Produzir"),
      produzindo: countBySituacaoOriginal(rows, "Produzindo"),
      prontosEntrega: countBySituacaoOriginal(rows, "Pronto para Entrega"),
      entregues: delivered.length,
      atrasados: activeLate.length,
      tempoMedioCadastroEntrega: productionDays.length
        ? productionDays.reduce((total, value) => total + value, 0) / productionDays.length
        : null,
      tempoMedioPrevistoEntregue: leadDays.length
        ? leadDays.reduce((total, value) => total + value, 0) / leadDays.length
        : null,
      percentualNoPrazo: onTimeEligible.length ? (onTimeCount / onTimeEligible.length) * 100 : null,
      semDataPrevista: rows.filter((row) => !row.data_prevista && !isCancelado(row)).length,
      semDataEntregue: rows.filter((row) => !row.data_entregue && row.situacao_grupo === ENTREGUE_GRUPO).length
    };
  }

  function aggregateProductionFunnel(pedidos) {
    const labels = ["Aguardando Produzir", "Produzindo", "Pronto para Entrega", "Entregue"];
    return labels.map((label) => ({
      label,
      value:
        label === "Entregue"
          ? getDeliveredRows(pedidos).length
          : countBySituacaoOriginal(pedidos, label)
    }));
  }

  function aggregateLateOrdersByMonth(pedidos) {
    const months = new Set();
    const countMap = new Map();
    (pedidos || [])
      .filter((row) => row.entregue_no_prazo === false)
      .forEach((row) => {
        const month = row.mes_entrega || monthKeyFromPedido(row);
        if (!month) {
          return;
        }
        months.add(month);
        countMap.set(month, (countMap.get(month) || 0) + 1);
      });
    return sortMonths(months).map((month) => ({ month, count: countMap.get(month) || 0 }));
  }

  function aggregateActiveOrderAging(pedidos, today = new Date()) {
    const bands = [
      { label: "0–3 dias", min: 0, max: 3, count: 0 },
      { label: "4–7 dias", min: 4, max: 7, count: 0 },
      { label: "8–15 dias", min: 8, max: 15, count: 0 },
      { label: "16–30 dias", min: 16, max: 30, count: 0 },
      { label: ">30 dias", min: 31, max: Infinity, count: 0 }
    ];
    (pedidos || [])
      .filter((row) => row.situacao_grupo === ATIVO_GRUPO && row.data_cadastro)
      .forEach((row) => {
        const dias = Math.max(0, Math.round((today.getTime() - new Date(row.data_cadastro).getTime()) / 86400000));
        const band = bands.find((item) => dias >= item.min && dias <= item.max);
        if (band) {
          band.count += 1;
        }
      });
    return bands.map(({ label, count }) => ({ label, value: count }));
  }

  function aggregateOrdersWithoutForecastByVendor(pedidos) {
    const totals = new Map();
    (pedidos || [])
      .filter((row) => !row.data_prevista && !isCancelado(row))
      .forEach((row) => {
        const label = row.vendedor || "Sem vendedor";
        totals.set(label, (totals.get(label) || 0) + 1);
      });
    return Array.from(totals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }

  function computeIndicatorValue(indicador, pedidos, contas) {
    const text = String(indicador?.indicador || "").toLowerCase();
    if (/receita/.test(text)) {
      return { valor: sumField(getActivePedidoRows(pedidos), (row) => row.valor_final), origem: "Calculado por pedidos" };
    }
    if (/ticket/.test(text)) {
      const active = getActivePedidoRows(pedidos);
      const ticket = active.length ? sumField(active, (row) => row.valor_final) / active.length : null;
      return { valor: ticket, origem: "Calculado por pedidos" };
    }
    if (/pedidos entregues/.test(text)) {
      return { valor: getDeliveredRows(pedidos).length, origem: "Calculado por pedidos" };
    }
    if (/despesa|contas a pagar|contas vencidas|vencid/.test(text)) {
      if (/vencid/.test(text)) {
        return {
          valor: (contas || []).filter((row) => row.status_pagamento === "Vencido").length,
          origem: "Calculado por contas"
        };
      }
      return { valor: sumField(contas || [], (row) => row.valor), origem: "Calculado por contas" };
    }
    if (/produção|producao|prazo|atras/.test(text)) {
      const kpis = computeProducaoKpis(pedidos);
      if (/atras/.test(text)) {
        return { valor: kpis.atrasados, origem: "Calculado por pedidos" };
      }
      if (/prazo/.test(text)) {
        return { valor: kpis.percentualNoPrazo, origem: "Calculado por pedidos" };
      }
      return { valor: kpis.tempoMedioCadastroEntrega, origem: "Calculado por pedidos" };
    }
    return null;
  }

  function classifyIndicadores(indicadores, pedidos, contas) {
    const catalog = window.MoldeNormalizers?.INDICATOR_CATALOG || [];
    const rows = indicadores || [];
    const sectors = new Map();

    rows.forEach((row) => {
      const setor = row.setor || "Sem setor";
      const text = String(row.indicador || "");
      const catalogHit = catalog.find((item) => item.match.test(text));
      let status = "indisponivel";
      let valorAtual = null;
      let origem = row.origem || "Não disponível";

      if (catalogHit?.calculavel) {
        const computed = computeIndicatorValue(row, pedidos, contas);
        if (computed && Number.isFinite(computed.valor)) {
          status = "calculavel";
          valorAtual = computed.valor;
          origem = computed.origem;
        } else if (computed && typeof computed.valor === "number") {
          status = "calculavel";
          valorAtual = computed.valor;
          origem = computed.origem;
        } else {
          status = "indisponivel";
        }
      } else if (catalogHit && !catalogHit.calculavel) {
        status = "manual";
        valorAtual = row.valor;
        origem = "Manual";
      } else if (row.calculavel) {
        const computed = computeIndicatorValue(row, pedidos, contas);
        if (computed) {
          status = "calculavel";
          valorAtual = computed.valor;
          origem = computed.origem;
        }
      } else if (row.valor !== null && row.valor !== undefined) {
        status = "manual";
        valorAtual = row.valor;
        origem = "Manual";
      }

      const entry = {
        indicador: row.indicador,
        meta: row.meta,
        valorAtual,
        origem,
        status,
        mes: row.mes
      };
      if (!sectors.has(setor)) {
        sectors.set(setor, []);
      }
      sectors.get(setor).push(entry);
    });

    return Array.from(sectors.entries())
      .map(([setor, items]) => ({ setor, items }))
      .sort((a, b) => a.setor.localeCompare(b.setor, "pt-BR"));
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
    computePedidosKpis,
    aggregateRevenueByMonth,
    aggregateOrdersCountByMonth,
    aggregateTicketByMonth,
    aggregateDiscountByMonth,
    topClientsByRevenue,
    ordersCountByVendor,
    pendingByStatus,
    onTimeDeliverySplit,
    productionTimeByMonth,
    ticketHistogram,
    getPedidosAtrasados,
    getPedidosEntreguesComPendencia,
    getPedidosSemCliente,
    getPedidosSemDataPrevista,
    getPedidosDescontoAlto,
    getPedidosPipeline,
    aggregateRevenueExpenseByMonthCompetencia,
    sumCashReceivedInPeriod,
    sumCashPaidInPeriod,
    aggregateReceivedPaidByMonth,
    aggregateCashProjection,
    aggregateReceivablesOpenByMonth,
    aggregateBreakEvenByMonth,
    buildWaterfallTotals,
    computeResultadoKpis,
    formatRatio,
    formatCount,
    formatPercent,
    formatCurrency,
    getReferenceMonths,
    compareMonthMetric,
    detectSupplierSpike,
    detectFixedExpenseAboveAverage,
    detectCategoryGrowth,
    detectFutureDueConcentration,
    getClientsHighPending,
    getVendorsManyPending,
    detectTicketDrop,
    detectDeliveryTimeIncrease,
    computeInsightsSummary,
    computeClientesKpis,
    topClientsByPending,
    ticketByVendor,
    pendingByVendor,
    aggregateClientRecurrence,
    aggregateVendorRankings,
    aggregateVendorStatusMatrix,
    computeProducaoKpis,
    aggregateProductionFunnel,
    aggregateLateOrdersByMonth,
    aggregateActiveOrderAging,
    aggregateOrdersWithoutForecastByVendor,
    classifyIndicadores
  };
})();
