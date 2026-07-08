(function () {
  const FALLBACK_COLORS = ["#2563EB", "#059669", "#D97706", "#7C3AED", "#DC2626"];

  function getChartColors() {
    const style = getComputedStyle(document.documentElement);
    const colors = [];
    for (let index = 1; index <= 5; index += 1) {
      const value = style.getPropertyValue(`--chart-${index}`).trim();
      colors.push(value || FALLBACK_COLORS[index - 1]);
    }
    return colors;
  }

  function getWarningColor() {
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue("--warning-fg").trim() || "#B45309";
  }

  function formatBrl(value) {
    if (window.MoldeMetrics?.formatCurrency) {
      return window.MoldeMetrics.formatCurrency(value);
    }
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
  }

  function formatMonthLabel(month) {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return month || "";
    }
    const [year, monthNum] = month.split("-");
    const date = new Date(Number(year), Number(monthNum) - 1, 1);
    return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
  }

  function baseTooltip() {
    return {
      trigger: "axis",
      valueFormatter: (value) => formatBrl(value)
    };
  }

  function disposeInstances(instances) {
    (instances || []).forEach((instance) => {
      if (instance && typeof instance.dispose === "function") {
        instance.dispose();
      }
    });
  }

  function initChart(element, option, theme) {
    if (!element || !window.echarts) {
      return null;
    }
    const instance = window.echarts.init(element, theme === "dark" ? "dark" : null);
    instance.setOption(option);
    return instance;
  }

  function renderExecutiveCharts(containers, pedidos, contas, theme) {
    const metrics = window.MoldeMetrics;
    if (!metrics || !containers) {
      return [];
    }

    const colors = getChartColors();
    const warningColor = getWarningColor();
    const instances = [];

    const revenueExpense = metrics.aggregateRevenueExpenseByMonth(pedidos, contas);
    if (containers.revenueExpenseResult) {
      instances.push(
        initChart(
          containers.revenueExpenseResult,
          {
            aria: { enabled: true },
            animationDuration: 300,
            color: colors,
            grid: { left: 48, right: 16, top: 32, bottom: 32 },
            tooltip: baseTooltip(),
            legend: { data: ["Receita ativa", "Despesas", "Resultado"] },
            xAxis: { type: "category", data: revenueExpense.map((item) => formatMonthLabel(item.month)) },
            yAxis: { type: "value" },
            series: [
              { name: "Receita ativa", type: "bar", data: revenueExpense.map((item) => item.receitaAtiva) },
              { name: "Despesas", type: "bar", data: revenueExpense.map((item) => item.despesas) },
              { name: "Resultado", type: "line", data: revenueExpense.map((item) => item.resultado) }
            ]
          },
          theme
        )
      );
    }

    const receivedPending = metrics.aggregateReceivedPendingByMonth(pedidos);
    if (containers.receivedPending) {
      instances.push(
        initChart(
          containers.receivedPending,
          {
            aria: { enabled: true },
            animationDuration: 300,
            color: [colors[0], colors[2]],
            grid: { left: 48, right: 16, top: 32, bottom: 32 },
            tooltip: baseTooltip(),
            legend: { data: ["Recebido", "Pendente"] },
            xAxis: { type: "category", data: receivedPending.map((item) => formatMonthLabel(item.month)) },
            yAxis: { type: "value" },
            series: [
              { name: "Recebido", type: "bar", stack: "total", data: receivedPending.map((item) => item.recebido) },
              { name: "Pendente", type: "bar", stack: "total", data: receivedPending.map((item) => item.pendente) }
            ]
          },
          theme
        )
      );
    }

    const fixedVariable = metrics.aggregateFixedVariableByMonth(contas);
    if (containers.fixedVariable) {
      instances.push(
        initChart(
          containers.fixedVariable,
          {
            aria: { enabled: true },
            animationDuration: 300,
            color: [colors[1], colors[3]],
            grid: { left: 48, right: 16, top: 32, bottom: 32 },
            tooltip: baseTooltip(),
            legend: { data: ["Fixas", "Variáveis"] },
            xAxis: { type: "category", data: fixedVariable.map((item) => formatMonthLabel(item.month)) },
            yAxis: { type: "value" },
            series: [
              { name: "Fixas", type: "bar", stack: "total", data: fixedVariable.map((item) => item.fixa) },
              { name: "Variáveis", type: "bar", stack: "total", data: fixedVariable.map((item) => item.variavel) }
            ]
          },
          theme
        )
      );
    }

    const ordersByGroup = metrics.aggregateOrdersByGroup(pedidos);
    if (containers.ordersStatus) {
      const pieColors = ordersByGroup.map((item) =>
        item.grupo === metrics.PIPELINE_GRUPO ? warningColor : colors[ordersByGroup.indexOf(item) % colors.length]
      );
      instances.push(
        initChart(
          containers.ordersStatus,
          {
            aria: { enabled: true },
            animationDuration: 300,
            tooltip: { trigger: "item", valueFormatter: (value) => `${value} pedidos` },
            legend: { orient: "vertical", left: "left", top: "middle" },
            series: [
              {
                type: "pie",
                radius: ["40%", "70%"],
                data: ordersByGroup.map((item, index) => ({
                  name: item.grupo,
                  value: item.count,
                  itemStyle: { color: pieColors[index] }
                }))
              }
            ]
          },
          theme
        )
      );
    }

    const topClass = metrics.topClassifications(contas, 10);
    if (containers.topClassification) {
      instances.push(
        initChart(
          containers.topClassification,
          {
            aria: { enabled: true },
            animationDuration: 300,
            color: colors,
            grid: { left: 120, right: 16, top: 16, bottom: 32 },
            tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (value) => formatBrl(value) },
            xAxis: { type: "value" },
            yAxis: { type: "category", data: topClass.map((item) => item.label).reverse() },
            series: [{ type: "bar", data: topClass.map((item) => item.value).reverse() }]
          },
          theme
        )
      );
    }

    const topVendors = metrics.topVendorsByRevenue(pedidos, 10);
    if (containers.topVendors) {
      instances.push(
        initChart(
          containers.topVendors,
          {
            aria: { enabled: true },
            animationDuration: 300,
            color: colors,
            grid: { left: 120, right: 16, top: 16, bottom: 32 },
            tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (value) => formatBrl(value) },
            xAxis: { type: "value" },
            yAxis: { type: "category", data: topVendors.map((item) => item.label).reverse() },
            series: [{ name: "Receita ativa", type: "bar", data: topVendors.map((item) => item.value).reverse() }]
          },
          theme
        )
      );
    }

    return instances.filter(Boolean);
  }

  function disposeExecutiveCharts(instances) {
    disposeInstances(instances);
  }

  function lineOption(colors, categories, name, values) {
    return {
      aria: { enabled: true },
      animationDuration: 300,
      color: colors,
      grid: { left: 56, right: 16, top: 32, bottom: 32 },
      tooltip: baseTooltip(),
      legend: { data: [name] },
      xAxis: { type: "category", data: categories },
      yAxis: { type: "value" },
      series: [{ name, type: "line", smooth: true, data: values }]
    };
  }

  function horizontalBarOption(colors, entries) {
    const sorted = [...entries].reverse();
    return {
      aria: { enabled: true },
      animationDuration: 300,
      color: colors,
      grid: { left: 140, right: 24, top: 16, bottom: 32 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (value) => formatBrl(value) },
      xAxis: { type: "value" },
      yAxis: { type: "category", data: sorted.map((item) => item.label) },
      series: [{ type: "bar", data: sorted.map((item) => item.value) }]
    };
  }

  function donutOption(colors, entries) {
    return {
      aria: { enabled: true },
      animationDuration: 300,
      color: colors,
      tooltip: { trigger: "item", valueFormatter: (value) => formatBrl(value) },
      legend: { orient: "vertical", left: "left", top: "middle", type: "scroll" },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          data: entries.map((item) => ({ name: item.label, value: item.value }))
        }
      ]
    };
  }

  function renderFinanceCharts(containers, contas, theme) {
    const metrics = window.MoldeMetrics;
    if (!metrics || !containers) {
      return [];
    }

    const colors = getChartColors();
    const instances = [];
    const push = (element, option) => {
      if (element) {
        instances.push(initChart(element, option, theme));
      }
    };

    const expenses = metrics.aggregateExpensesByMonth(contas);
    push(
      containers.expensesMonth,
      lineOption(
        colors,
        expenses.map((item) => formatMonthLabel(item.month)),
        "Despesas",
        expenses.map((item) => item.valor)
      )
    );

    const paidOpen = metrics.aggregatePaidOpenByMonth(contas);
    push(containers.paidOpenMonth, {
      aria: { enabled: true },
      animationDuration: 300,
      color: [colors[1], colors[2]],
      grid: { left: 56, right: 16, top: 32, bottom: 32 },
      tooltip: baseTooltip(),
      legend: { data: ["Pago", "Aberto"] },
      xAxis: { type: "category", data: paidOpen.map((item) => formatMonthLabel(item.month)) },
      yAxis: { type: "value" },
      series: [
        { name: "Pago", type: "bar", stack: "total", data: paidOpen.map((item) => item.pago) },
        { name: "Aberto", type: "bar", stack: "total", data: paidOpen.map((item) => item.aberto) }
      ]
    });

    push(containers.expensesCategory, donutOption(colors, metrics.expensesByCategory(contas)));
    push(containers.expensesClassification, horizontalBarOption(colors, metrics.expensesByClassification(contas, 12)));
    push(containers.topSuppliers, horizontalBarOption(colors, metrics.topSuppliers(contas, 15)));

    const heatmap = metrics.dueHeatmapMatrix(contas);
    if (containers.dueHeatmap) {
      const maxValue = heatmap.data.reduce((max, cell) => Math.max(max, cell[2]), 0);
      push(containers.dueHeatmap, {
        aria: { enabled: true },
        animationDuration: 300,
        tooltip: {
          position: "top",
          formatter: (params) => {
            const [dayIndex, monthIndex, valor] = params.value;
            const month = formatMonthLabel(heatmap.months[monthIndex]);
            return `${month} · dia ${dayIndex + 1}<br/>${formatBrl(valor)}`;
          }
        },
        grid: { left: 72, right: 24, top: 16, bottom: 56 },
        xAxis: {
          type: "category",
          data: Array.from({ length: 31 }, (_, index) => String(index + 1)),
          splitArea: { show: true }
        },
        yAxis: {
          type: "category",
          data: heatmap.months.map((month) => formatMonthLabel(month)),
          splitArea: { show: true }
        },
        visualMap: {
          min: 0,
          max: maxValue || 1,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: 0,
          inRange: { color: [colors[0] + "22", colors[0]] }
        },
        series: [
          {
            type: "heatmap",
            data: heatmap.data,
            emphasis: { itemStyle: { shadowBlur: 6 } }
          }
        ]
      });
    }

    const abc = metrics.supplierAbc(contas, 15);
    if (containers.supplierAbc) {
      push(containers.supplierAbc, {
        aria: { enabled: true },
        animationDuration: 300,
        color: [colors[3], colors[2]],
        grid: { left: 56, right: 56, top: 32, bottom: 72 },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: (params) => {
            const bar = params.find((item) => item.seriesName === "Valor");
            const line = params.find((item) => item.seriesName === "% acumulado");
            const parts = [params[0].axisValue];
            if (bar) {
              parts.push(`Valor: ${formatBrl(bar.value)}`);
            }
            if (line) {
              parts.push(`Acumulado: ${Number(line.value).toFixed(1).replace(".", ",")}%`);
            }
            return parts.join("<br/>");
          }
        },
        legend: { data: ["Valor", "% acumulado"] },
        xAxis: {
          type: "category",
          data: abc.items.map((item) => item.label),
          axisLabel: { interval: 0, rotate: 40 }
        },
        yAxis: [
          { type: "value" },
          { type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}%" } }
        ],
        series: [
          { name: "Valor", type: "bar", data: abc.items.map((item) => item.value) },
          {
            name: "% acumulado",
            type: "line",
            yAxisIndex: 1,
            smooth: true,
            data: abc.items.map((item) => Number(item.acumuladoPct.toFixed(1)))
          }
        ]
      });
    }

    const fixedVariable = metrics.aggregateFixedVariableByMonth(contas);
    const monthLabels = fixedVariable.map((item) => formatMonthLabel(item.month));
    push(containers.fixedEvolution, lineOption([colors[1]], monthLabels, "Despesas fixas", fixedVariable.map((item) => item.fixa)));
    push(containers.variableEvolution, lineOption([colors[3]], monthLabels, "Despesas variáveis", fixedVariable.map((item) => item.variavel)));

    push(containers.bankAccount, {
      aria: { enabled: true },
      animationDuration: 300,
      color: colors,
      grid: { left: 56, right: 16, top: 16, bottom: 56 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (value) => formatBrl(value) },
      xAxis: { type: "category", data: metrics.expensesByBankAccount(contas).map((item) => item.label), axisLabel: { interval: 0, rotate: 30 } },
      yAxis: { type: "value" },
      series: [{ type: "bar", data: metrics.expensesByBankAccount(contas).map((item) => item.value) }]
    });

    return instances.filter(Boolean);
  }

  function disposeFinanceCharts(instances) {
    disposeInstances(instances);
  }

  function renderPedidosCharts(containers, pedidos, theme) {
    const metrics = window.MoldeMetrics;
    if (!metrics || !containers) {
      return [];
    }

    const colors = getChartColors();
    const warningColor = getWarningColor();
    const instances = [];
    const push = (element, option) => {
      if (element) {
        instances.push(initChart(element, option, theme));
      }
    };

    const revenue = metrics.aggregateRevenueByMonth(pedidos);
    push(
      containers.revenueMonth,
      {
        aria: { enabled: true },
        animationDuration: 300,
        color: [colors[0]],
        grid: { left: 56, right: 16, top: 32, bottom: 32 },
        tooltip: baseTooltip(),
        xAxis: { type: "category", data: revenue.map((item) => formatMonthLabel(item.month)) },
        yAxis: { type: "value" },
        series: [{ name: "Receita", type: "bar", data: revenue.map((item) => item.valor) }]
      }
    );

    const ordersMonth = metrics.aggregateOrdersCountByMonth(pedidos);
    push(
      containers.ordersMonth,
      {
        aria: { enabled: true },
        animationDuration: 300,
        color: [colors[1]],
        grid: { left: 56, right: 16, top: 32, bottom: 32 },
        tooltip: { trigger: "axis", valueFormatter: (value) => `${value} pedidos` },
        xAxis: { type: "category", data: ordersMonth.map((item) => formatMonthLabel(item.month)) },
        yAxis: { type: "value" },
        series: [{ name: "Pedidos", type: "bar", data: ordersMonth.map((item) => item.count) }]
      }
    );

    const ticketMonth = metrics.aggregateTicketByMonth(pedidos);
    push(containers.ticketMonth, lineOption(colors, ticketMonth.map((item) => formatMonthLabel(item.month)), "Ticket médio", ticketMonth.map((item) => item.ticket)));

    const ordersByGroup = metrics.aggregateOrdersByGroup(pedidos);
    push(containers.ordersStatus, {
      aria: { enabled: true },
      animationDuration: 300,
      tooltip: { trigger: "item", formatter: (params) => `${params.name}<br/>${params.value} pedidos` },
      series: [
        {
          type: "funnel",
          left: "10%",
          width: "80%",
          sort: "descending",
          label: { show: true, position: "inside" },
          data: ordersByGroup.map((item) => ({
            name: item.grupo,
            value: item.count,
            itemStyle: { color: item.grupo === metrics.PIPELINE_GRUPO ? warningColor : undefined }
          }))
        }
      ]
    });

    push(containers.revenueVendor, horizontalBarOption(colors, metrics.topVendorsByRevenue(pedidos, 12)));
    push(containers.ordersVendor, {
      aria: { enabled: true },
      animationDuration: 300,
      color: colors,
      grid: { left: 120, right: 16, top: 16, bottom: 32 },
      tooltip: { trigger: "axis", valueFormatter: (value) => `${value} pedidos` },
      xAxis: { type: "value" },
      yAxis: { type: "category", data: metrics.ordersCountByVendor(pedidos, 12).map((item) => item.label).reverse() },
      series: [{ type: "bar", data: metrics.ordersCountByVendor(pedidos, 12).map((item) => item.value).reverse() }]
    });

    const pending = metrics.pendingByStatus(pedidos);
    push(containers.pendingStatus, {
      aria: { enabled: true },
      animationDuration: 300,
      color: colors,
      grid: { left: 56, right: 16, top: 32, bottom: 72 },
      tooltip: baseTooltip(),
      xAxis: { type: "category", data: pending.map((item) => item.label), axisLabel: { interval: 0, rotate: 30 } },
      yAxis: { type: "value" },
      series: [{ name: "Pendente", type: "bar", data: pending.map((item) => item.value) }]
    });

    const discountMonth = metrics.aggregateDiscountByMonth(pedidos);
    push(containers.discountMonth, lineOption([colors[3]], discountMonth.map((item) => formatMonthLabel(item.month)), "Descontos", discountMonth.map((item) => item.valor)));

    push(containers.topClients, horizontalBarOption(colors, metrics.topClientsByRevenue(pedidos, 12)));

    const onTime = metrics.onTimeDeliverySplit(pedidos);
    push(containers.onTimeDelivery, donutOption(colors, onTime));

    const production = metrics.productionTimeByMonth(pedidos);
    push(containers.productionTimeMonth, lineOption([colors[4]], production.map((item) => formatMonthLabel(item.month)), "Dias", production.map((item) => item.media)));

    const histogram = metrics.ticketHistogram(pedidos);
    push(containers.ticketDistribution, {
      aria: { enabled: true },
      animationDuration: 300,
      color: [colors[0]],
      grid: { left: 56, right: 16, top: 16, bottom: 56 },
      tooltip: { trigger: "axis", valueFormatter: (value) => `${value} pedidos` },
      xAxis: { type: "category", data: histogram.map((item) => item.label), axisLabel: { interval: 0, rotate: 20 } },
      yAxis: { type: "value" },
      series: [{ type: "bar", data: histogram.map((item) => item.value) }]
    });

    return instances.filter(Boolean);
  }

  function disposePedidosCharts(instances) {
    disposeInstances(instances);
  }

  function renderResultadoCharts(containers, pedidos, contas, filterState, options, theme) {
    const metrics = window.MoldeMetrics;
    if (!metrics || !containers) {
      return [];
    }

    const colors = getChartColors();
    const warningColor = getWarningColor();
    const receitaBase = options?.receitaBase || "cadastro";
    const instances = [];

    const push = (element, option) => {
      const instance = initChart(element, option, theme);
      if (instance) {
        instances.push(instance);
      }
    };

    const revenueExpense = metrics.aggregateRevenueExpenseByMonthCompetencia(pedidos, contas, receitaBase);
    if (containers.revenueExpenseResult) {
      push(
        containers.revenueExpenseResult,
        {
          aria: { enabled: true },
          animationDuration: 300,
          color: colors,
          grid: { left: 48, right: 16, top: 32, bottom: 32 },
          tooltip: baseTooltip(),
          legend: { data: ["Receita ativa", "Despesas", "Resultado"] },
          xAxis: { type: "category", data: revenueExpense.map((item) => formatMonthLabel(item.month)) },
          yAxis: { type: "value" },
          series: [
            { name: "Receita ativa", type: "bar", data: revenueExpense.map((item) => item.receitaAtiva) },
            { name: "Despesas", type: "bar", data: revenueExpense.map((item) => item.despesas) },
            { name: "Resultado", type: "line", data: revenueExpense.map((item) => item.resultado) }
          ]
        }
      );
    }

    const waterfall = metrics.buildWaterfallTotals(pedidos, contas, receitaBase);
    if (containers.resultWaterfall) {
      push(containers.resultWaterfall, {
        aria: { enabled: true },
        animationDuration: 300,
        color: [colors[1], warningColor, colors[0]],
        grid: { left: 48, right: 16, top: 32, bottom: 32 },
        tooltip: baseTooltip(),
        xAxis: { type: "category", data: ["Receita", "Despesas", "Resultado"] },
        yAxis: { type: "value" },
        series: [
          {
            type: "bar",
            data: [
              { value: waterfall.receita, itemStyle: { color: colors[1] } },
              { value: -waterfall.despesas, itemStyle: { color: warningColor } },
              { value: waterfall.resultado, itemStyle: { color: colors[0] } }
            ],
            label: { show: true, position: "top", formatter: (params) => formatBrl(Math.abs(params.value)) }
          }
        ]
      });
    }

    const receivedPaid = metrics.aggregateReceivedPaidByMonth(pedidos, contas, filterState || {});
    if (containers.receivedPaid) {
      push(containers.receivedPaid, {
        aria: { enabled: true },
        animationDuration: 300,
        color: colors,
        grid: { left: 48, right: 16, top: 32, bottom: 32 },
        tooltip: baseTooltip(),
        legend: { data: ["Recebido", "Pago"] },
        xAxis: { type: "category", data: receivedPaid.map((item) => formatMonthLabel(item.month)) },
        yAxis: { type: "value" },
        series: [
          { name: "Recebido", type: "line", data: receivedPaid.map((item) => item.recebido) },
          { name: "Pago", type: "line", data: receivedPaid.map((item) => item.pago) }
        ]
      });
    }

    const projection = metrics.aggregateCashProjection(pedidos, contas, filterState || {});
    if (containers.cashProjection) {
      push(containers.cashProjection, {
        aria: { enabled: true },
        animationDuration: 300,
        color: [colors[2]],
        grid: { left: 48, right: 16, top: 32, bottom: 32 },
        tooltip: baseTooltip(),
        xAxis: { type: "category", data: projection.map((item) => formatMonthLabel(item.month)) },
        yAxis: { type: "value" },
        series: [{ name: "Saldo acumulado", type: "line", areaStyle: {}, data: projection.map((item) => item.saldo) }]
      });
    }

    const receivablesOpen = metrics.aggregateReceivablesOpenByMonth(pedidos, contas);
    if (containers.receivablesOpen) {
      push(containers.receivablesOpen, {
        aria: { enabled: true },
        animationDuration: 300,
        color: colors,
        grid: { left: 48, right: 16, top: 32, bottom: 32 },
        tooltip: baseTooltip(),
        legend: { data: ["Recebíveis", "Contas abertas"] },
        xAxis: { type: "category", data: receivablesOpen.map((item) => formatMonthLabel(item.month)) },
        yAxis: { type: "value" },
        series: [
          { name: "Recebíveis", type: "bar", data: receivablesOpen.map((item) => item.recebiveis) },
          { name: "Contas abertas", type: "bar", data: receivablesOpen.map((item) => item.abertas) }
        ]
      });
    }

    const breakEven = metrics.aggregateBreakEvenByMonth(pedidos, contas);
    if (containers.breakEvenMonth) {
      push(containers.breakEvenMonth, {
        aria: { enabled: true },
        animationDuration: 300,
        color: [colors[4]],
        grid: { left: 48, right: 16, top: 32, bottom: 32 },
        tooltip: { trigger: "axis", valueFormatter: (value) => (Number.isFinite(value) ? `${value} pedidos` : "—") },
        xAxis: { type: "category", data: breakEven.map((item) => formatMonthLabel(item.month)) },
        yAxis: { type: "value", minInterval: 1 },
        series: [
          {
            name: "Pedidos para equilíbrio",
            type: "line",
            data: breakEven.map((item) => item.pedidosEquilibrio)
          }
        ]
      });
    }

    return instances.filter(Boolean);
  }

  function disposeResultadoCharts(instances) {
    disposeInstances(instances);
  }

  window.MoldeCharts = {
    getChartColors,
    renderExecutiveCharts,
    disposeExecutiveCharts,
    renderFinanceCharts,
    disposeFinanceCharts,
    renderPedidosCharts,
    disposePedidosCharts,
    renderResultadoCharts,
    disposeResultadoCharts
  };
})();
