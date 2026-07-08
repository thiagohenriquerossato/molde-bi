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

  window.MoldeCharts = {
    getChartColors,
    renderExecutiveCharts,
    disposeExecutiveCharts
  };
})();
