(function () {
  const DEFAULT_THRESHOLDS = {
    diasAprovacao: 7,
    diasStatusOperacional: 14,
    descontoAltoPct: 15,
    variacaoMomPct: 20,
    valorCanceladoMin: 500,
    pendenteClienteMin: 3000,
    pedidosPendentesVendedor: 5,
    concentracaoFuturaPct: 40
  };

  const SEVERITY_ORDER = { critico: 0, atencao: 1, informativo: 2 };

  const CONTA_COLUMNS = {
    base: [
      { key: "fornecedor", label: "Fornecedor", type: "text", getValue: (r) => r.fornecedor },
      { key: "data_vencimento", label: "Vencimento", type: "date", getValue: (r) => r.data_vencimento },
      { key: "valor", label: "Valor", type: "currency", getValue: (r) => r.valor },
      { key: "status_pagamento", label: "Status", type: "badge", getValue: (r) => r.status_pagamento }
    ],
    overdue: [
      { key: "fornecedor", label: "Fornecedor", type: "text", getValue: (r) => r.fornecedor },
      { key: "data_vencimento", label: "Vencimento", type: "date", getValue: (r) => r.data_vencimento },
      { key: "valor", label: "Valor", type: "currency", getValue: (r) => r.valor },
      { key: "dias_atraso", label: "Dias atraso", type: "text", getValue: (r) => r.dias_atraso },
      { key: "status_pagamento", label: "Status", type: "badge", getValue: (r) => r.status_pagamento }
    ]
  };

  const PEDIDO_COLUMNS = {
    base: [
      { key: "pedido_id", label: "Pedido", type: "text", getValue: (r) => r.pedido_id },
      { key: "cliente", label: "Cliente", type: "text", getValue: (r) => r.cliente },
      { key: "vendedor", label: "Vendedor", type: "text", getValue: (r) => r.vendedor },
      { key: "situacao_grupo", label: "Situação", type: "badge", getValue: (r) => r.situacao_grupo },
      { key: "valor_final", label: "Valor final", type: "currency", getValue: (r) => r.valor_final },
      { key: "valor_pendente", label: "Pendente", type: "currency", getValue: (r) => r.valor_pendente }
    ],
    overdue: [
      { key: "pedido_id", label: "Pedido", type: "text", getValue: (r) => r.pedido_id },
      { key: "cliente", label: "Cliente", type: "text", getValue: (r) => r.cliente },
      { key: "vendedor", label: "Vendedor", type: "text", getValue: (r) => r.vendedor },
      { key: "dias_atraso", label: "Dias atraso", type: "text", getValue: (r) => r.dias_atraso },
      { key: "data_prevista", label: "Previsão", type: "date", getValue: (r) => r.data_prevista },
      { key: "valor_final", label: "Valor final", type: "currency", getValue: (r) => r.valor_final }
    ],
    pipeline: [
      { key: "pedido_id", label: "Pedido", type: "text", getValue: (r) => r.pedido_id },
      { key: "cliente", label: "Cliente", type: "text", getValue: (r) => r.cliente },
      { key: "vendedor", label: "Vendedor", type: "text", getValue: (r) => r.vendedor },
      { key: "data_cadastro", label: "Cadastro", type: "date", getValue: (r) => r.data_cadastro },
      { key: "dias_aprovacao", label: "Dias em aprovação", type: "text", getValue: (r) => r._diasAprovacao },
      { key: "valor_final", label: "Valor final", type: "currency", getValue: (r) => r.valor_final }
    ],
    discount: [
      { key: "pedido_id", label: "Pedido", type: "text", getValue: (r) => r.pedido_id },
      { key: "cliente", label: "Cliente", type: "text", getValue: (r) => r.cliente },
      { key: "vendedor", label: "Vendedor", type: "text", getValue: (r) => r.vendedor },
      { key: "valor_bruto", label: "Bruto", type: "currency", getValue: (r) => r.valor_bruto },
      { key: "valor_desconto", label: "Desconto", type: "currency", getValue: (r) => r.valor_desconto },
      {
        key: "pct_desconto",
        label: "% desconto",
        type: "text",
        getValue: (r) =>
          r.valor_bruto > 0 ? `${((r.valor_desconto || 0) / r.valor_bruto * 100).toFixed(1).replace(".", ",")}%` : "—"
      }
    ],
    entity: [
      { key: "nome", label: "Nome", type: "text", getValue: (r) => r.nome },
      { key: "valor", label: "Valor", type: "currency", getValue: (r) => r.valor },
      { key: "pedidos", label: "Pedidos", type: "text", getValue: (r) => r.pedidos }
    ],
    trend: [
      { key: "nome", label: "Item", type: "text", getValue: (r) => r.nome },
      { key: "atual", label: "Mês atual", type: "currency", getValue: (r) => r.atual },
      { key: "anterior", label: "Mês anterior", type: "currency", getValue: (r) => r.anterior },
      { key: "variacao", label: "Variação", type: "text", getValue: (r) => r.variacao }
    ]
  };

  function daysBetween(from, to) {
    if (!from || !to) {
      return null;
    }
    const start = new Date(from);
    const end = new Date(to);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }
    return Math.round((end.getTime() - start.getTime()) / 86400000);
  }

  function normalizeSituacao(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function buildAlert(id, title, severity, criterion, rows, columns) {
    return {
      id,
      title,
      severity,
      criterion,
      count: rows.length,
      rows,
      columns
    };
  }

  function sortAlerts(alerts) {
    return [...alerts].sort((a, b) => {
      const severityDiff = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
      if (severityDiff !== 0) {
        return severityDiff;
      }
      return b.count - a.count;
    });
  }

  function generateFinancialAlerts(contas, metrics, thresholds, months) {
    const alerts = [];
    const overdue = metrics.getOverdueContasAll(contas);
    if (overdue.length) {
      alerts.push(
        buildAlert(
          "fin-overdue",
          "Contas vencidas",
          "critico",
          "Status de pagamento = Vencido",
          overdue,
          CONTA_COLUMNS.overdue
        )
      );
    }

    const upcoming = metrics.getUpcomingContasAll(contas);
    if (upcoming.length) {
      alerts.push(
        buildAlert(
          "fin-upcoming-7",
          "Contas vencendo nos próximos 7 dias",
          "atencao",
          "Vence hoje ou nos próximos 7 dias",
          upcoming,
          CONTA_COLUMNS.base
        )
      );
    }

    const semValor = metrics.getContasSemValor(contas);
    if (semValor.length) {
      alerts.push(
        buildAlert(
          "fin-no-value",
          "Contas sem valor",
          "atencao",
          "Valor ausente, zero ou lançamento incompleto",
          semValor,
          CONTA_COLUMNS.base
        )
      );
    }

    const semClass = metrics.getContasSemClassificacao(contas);
    if (semClass.length) {
      alerts.push(
        buildAlert(
          "fin-no-class",
          "Contas sem classificação",
          "atencao",
          "Campo classificação vazio",
          semClass,
          CONTA_COLUMNS.base
        )
      );
    }

    const pagasSemData = metrics.getContasPagasSemData(contas);
    if (pagasSemData.length) {
      alerts.push(
        buildAlert(
          "fin-paid-no-date",
          "Contas pagas sem data de pagamento",
          "atencao",
          "PAGO = SIM sem DATA PAG",
          pagasSemData,
          CONTA_COLUMNS.base
        )
      );
    }

    const supplierSpike = metrics.detectSupplierSpike(contas, months, thresholds.variacaoMomPct);
    if (supplierSpike) {
      alerts.push(
        buildAlert(
          "fin-supplier-spike",
          "Fornecedor com aumento forte no mês",
          "informativo",
          `Variação acima de ${thresholds.variacaoMomPct}% vs mês anterior`,
          [supplierSpike],
          PEDIDO_COLUMNS.trend
        )
      );
    }

    const fixedAbove = metrics.detectFixedExpenseAboveAverage(contas, months);
    if (fixedAbove) {
      alerts.push(
        buildAlert(
          "fin-fixed-above-avg",
          "Despesa fixa acima da média",
          "informativo",
          "Despesas fixas do mês atual acima da média histórica filtrada",
          [fixedAbove],
          PEDIDO_COLUMNS.trend
        )
      );
    }

    const categoryGrowth = metrics.detectCategoryGrowth(contas, months, thresholds.variacaoMomPct);
    if (categoryGrowth) {
      alerts.push(
        buildAlert(
          "fin-category-growth",
          "Categoria com maior crescimento",
          "informativo",
          `Maior crescimento MoM acima de ${thresholds.variacaoMomPct}%`,
          [categoryGrowth],
          PEDIDO_COLUMNS.trend
        )
      );
    }

    const futureConcentration = metrics.detectFutureDueConcentration(contas, thresholds.concentracaoFuturaPct);
    if (futureConcentration.length) {
      alerts.push(
        buildAlert(
          "fin-future-concentration",
          "Mês futuro com concentração alta de vencimentos",
          "atencao",
          `Um mês concentra mais de ${thresholds.concentracaoFuturaPct}% dos vencimentos futuros`,
          futureConcentration,
          [
            { key: "mes", label: "Mês", type: "text", getValue: (r) => r.mes },
            { key: "valor", label: "Valor", type: "currency", getValue: (r) => r.valor },
            { key: "percentual", label: "% do total", type: "text", getValue: (r) => r.percentual }
          ]
        )
      );
    }

    return alerts;
  }

  function generateCommercialAlerts(pedidos, metrics, thresholds, today) {
    const alerts = [];
    const pipelineStale = metrics.getPedidosPipeline(pedidos)
      .map((row) => {
        const dias = daysBetween(row.data_cadastro, today.toISOString());
        return { ...row, _diasAprovacao: dias };
      })
      .filter((row) => Number.isFinite(row._diasAprovacao) && row._diasAprovacao >= thresholds.diasAprovacao);

    if (pipelineStale.length) {
      alerts.push(
        buildAlert(
          "com-pipeline-stale",
          "Pedidos aguardando aprovação há muitos dias",
          "atencao",
          `Em aprovação há ${thresholds.diasAprovacao}+ dias (pipeline, fora da receita)`,
          pipelineStale,
          PEDIDO_COLUMNS.pipeline
        )
      );
    }

    const deliveredPending = metrics.getPedidosEntreguesComPendencia(pedidos);
    if (deliveredPending.length) {
      alerts.push(
        buildAlert(
          "com-delivered-pending",
          "Pedidos entregues com valor pendente",
          "critico",
          "Situação entregue com valor pendente > 0",
          deliveredPending,
          PEDIDO_COLUMNS.base
        )
      );
    }

    const semCliente = metrics.getPedidosSemCliente(pedidos);
    if (semCliente.length) {
      alerts.push(
        buildAlert("com-no-client", "Pedidos sem cliente", "atencao", "Campo cliente vazio", semCliente, PEDIDO_COLUMNS.base)
      );
    }

    const semVendedor = (pedidos || []).filter((row) => !row.vendedor || String(row.vendedor).trim() === "");
    if (semVendedor.length) {
      alerts.push(
        buildAlert("com-no-vendor", "Pedidos sem vendedor", "atencao", "Campo vendedor vazio", semVendedor, PEDIDO_COLUMNS.base)
      );
    }

    const semPrevisao = metrics.getPedidosSemDataPrevista(pedidos).filter((row) => !metrics.isCancelado(row));
    if (semPrevisao.length) {
      alerts.push(
        buildAlert(
          "com-no-forecast",
          "Pedidos sem data prevista",
          "atencao",
          "Data prevista ausente em pedidos não cancelados",
          semPrevisao,
          PEDIDO_COLUMNS.base
        )
      );
    }

    const descontoAlto = (pedidos || [])
      .filter(
        (row) =>
          row.valor_bruto > 0 && ((row.valor_desconto || 0) / row.valor_bruto) * 100 >= thresholds.descontoAltoPct
      )
      .sort((a, b) => (b.valor_desconto || 0) / (b.valor_bruto || 1) - (a.valor_desconto || 0) / (a.valor_bruto || 1));

    if (descontoAlto.length) {
      alerts.push(
        buildAlert(
          "com-high-discount",
          "Pedidos com desconto alto",
          "atencao",
          `Desconto ≥ ${thresholds.descontoAltoPct}% sobre valor bruto`,
          descontoAlto,
          PEDIDO_COLUMNS.discount
        )
      );
    }

    const canceladosRelevantes = (pedidos || [])
      .filter((row) => metrics.isCancelado(row) && (row.valor_final || 0) >= thresholds.valorCanceladoMin)
      .sort((a, b) => (b.valor_final || 0) - (a.valor_final || 0));

    if (canceladosRelevantes.length) {
      alerts.push(
        buildAlert(
          "com-cancelled-value",
          "Pedidos cancelados com valor relevante",
          "informativo",
          `Cancelados com valor final ≥ ${thresholds.valorCanceladoMin}`,
          canceladosRelevantes,
          PEDIDO_COLUMNS.base
        )
      );
    }

    const clientesPendencia = metrics.getClientsHighPending(pedidos, thresholds.pendenteClienteMin);
    if (clientesPendencia.length) {
      alerts.push(
        buildAlert(
          "com-client-high-pending",
          "Cliente com alto valor pendente",
          "atencao",
          `Pendência acumulada ≥ limiar de ${thresholds.pendenteClienteMin}`,
          clientesPendencia,
          PEDIDO_COLUMNS.entity
        )
      );
    }

    const vendedoresPendentes = metrics.getVendorsManyPending(pedidos, thresholds.pedidosPendentesVendedor);
    if (vendedoresPendentes.length) {
      alerts.push(
        buildAlert(
          "com-vendor-many-pending",
          "Vendedor com muitos pedidos pendentes",
          "atencao",
          `${thresholds.pedidosPendentesVendedor}+ pedidos com valor pendente`,
          vendedoresPendentes,
          PEDIDO_COLUMNS.entity
        )
      );
    }

    return alerts;
  }

  function generateOperationalAlerts(pedidos, metrics, thresholds, today, months) {
    const alerts = [];
    const atrasados = metrics.getPedidosAtrasados(pedidos);
    if (atrasados.length) {
      alerts.push(
        buildAlert(
          "op-late",
          "Pedidos atrasados",
          "critico",
          "Entrega após data prevista",
          atrasados,
          PEDIDO_COLUMNS.overdue
        )
      );
    }

    const entregaAntesCadastro = (pedidos || []).filter((row) => {
      if (!row.data_entregue || !row.data_cadastro) {
        return false;
      }
      return new Date(row.data_entregue) < new Date(row.data_cadastro);
    });
    if (entregaAntesCadastro.length) {
      alerts.push(
        buildAlert(
          "op-delivery-before-cadastro",
          "Pedidos com entrega antes do cadastro",
          "critico",
          "Data entregue anterior à data de cadastro",
          entregaAntesCadastro,
          PEDIDO_COLUMNS.base
        )
      );
    }

    const statusLong = (statusLabel) =>
      (pedidos || [])
        .filter((row) => normalizeSituacao(row.situacao_original) === normalizeSituacao(statusLabel))
        .map((row) => {
          const dias = daysBetween(row.data_cadastro, today.toISOString());
          return { ...row, _diasStatus: dias };
        })
        .filter((row) => Number.isFinite(row._diasStatus) && row._diasStatus >= thresholds.diasStatusOperacional);

    const prontosLongos = statusLong("Pronto para Entrega");
    if (prontosLongos.length) {
      alerts.push(
        buildAlert(
          "op-ready-long",
          "Pedidos prontos para entrega há muitos dias",
          "atencao",
          `Status pronto há ${thresholds.diasStatusOperacional}+ dias desde cadastro`,
          prontosLongos,
          PEDIDO_COLUMNS.base
        )
      );
    }

    const produzindoLongos = statusLong("Produzindo");
    if (produzindoLongos.length) {
      alerts.push(
        buildAlert(
          "op-producing-long",
          "Pedidos produzindo há muitos dias",
          "atencao",
          `Status produzindo há ${thresholds.diasStatusOperacional}+ dias desde cadastro`,
          produzindoLongos,
          PEDIDO_COLUMNS.base
        )
      );
    }

    const aguardandoProduzirLongos = statusLong("Aguardando Produzir");
    if (aguardandoProduzirLongos.length) {
      alerts.push(
        buildAlert(
          "op-awaiting-produce-long",
          "Pedidos aguardando produzir há muitos dias",
          "atencao",
          `Aguardando produzir há ${thresholds.diasStatusOperacional}+ dias desde cadastro`,
          aguardandoProduzirLongos,
          PEDIDO_COLUMNS.base
        )
      );
    }

    const ticketDrop = metrics.detectTicketDrop(pedidos, months, thresholds.variacaoMomPct);
    if (ticketDrop) {
      alerts.push(
        buildAlert(
          "op-ticket-drop",
          "Queda de ticket médio",
          "informativo",
          `Queda acima de ${thresholds.variacaoMomPct}% vs mês anterior (receita ativa)`,
          [ticketDrop],
          PEDIDO_COLUMNS.trend
        )
      );
    }

    const prazoIncrease = metrics.detectDeliveryTimeIncrease(pedidos, months, thresholds.variacaoMomPct);
    if (prazoIncrease) {
      alerts.push(
        buildAlert(
          "op-delivery-time-increase",
          "Aumento de prazo médio de entrega",
          "informativo",
          `Aumento acima de ${thresholds.variacaoMomPct}% vs mês anterior`,
          [prazoIncrease],
          [
            { key: "nome", label: "Indicador", type: "text", getValue: (r) => r.nome },
            { key: "atual", label: "Mês atual (dias)", type: "text", getValue: (r) => r.atual },
            { key: "anterior", label: "Mês anterior (dias)", type: "text", getValue: (r) => r.anterior },
            { key: "variacao", label: "Variação", type: "text", getValue: (r) => r.variacao }
          ]
        )
      );
    }

    return alerts;
  }

  function generateAlerts(pedidos, contas, options = {}) {
    const metrics = window.MoldeMetrics;
    if (!metrics) {
      return { summary: { total: 0, criticos: 0, financeiros: 0, comerciaisOperacionais: 0 }, categories: { financeiro: [], comercial: [], operacional: [] } };
    }

    const thresholds = { ...DEFAULT_THRESHOLDS, ...(options.thresholds || {}) };
    const today = options.today instanceof Date ? options.today : new Date();
    const months = metrics.getReferenceMonths(today);

    const financeiro = sortAlerts(generateFinancialAlerts(contas || [], metrics, thresholds, months));
    const comercial = sortAlerts(generateCommercialAlerts(pedidos || [], metrics, thresholds, today));
    const operacional = sortAlerts(generateOperationalAlerts(pedidos || [], metrics, thresholds, today, months));

    const categories = { financeiro, comercial, operacional };
    const summary = metrics.computeInsightsSummary(categories);

    return { summary, categories, thresholds };
  }

  window.MoldeInsights = {
    DEFAULT_THRESHOLDS,
    generateAlerts
  };
})();
