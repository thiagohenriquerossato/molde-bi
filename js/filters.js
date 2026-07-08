(function () {
  function createDefaultState() {
    return {
      search: "",
      year: null,
      month: null,
      periodFrom: null,
      periodTo: null,
      valueMin: null,
      valueMax: null,
      pedidos: {
        situacao: [],
        situacaoGrupo: [],
        vendedor: [],
        cliente: [],
        formaEntrada: [],
        formaSaldo: [],
        comPendente: false,
        semCliente: false,
        semDataPrevista: false,
        entregueNoPrazo: false,
        atrasado: false,
        cancelado: false,
        aguardandoAprovacao: false
      },
      contas: {
        statusPagamento: [],
        fornecedor: [],
        classificacao: [],
        categoria: [],
        conta: [],
        parcela: [],
        pago: null,
        vencido: false,
        venceHoje: false,
        vence7: false,
        vence30: false,
        semValor: false,
        semClassificacao: false,
        semConta: false
      },
      resultado: {
        receitaBase: "cadastro"
      }
    };
  }

  function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function clearAll() {
    return createDefaultState();
  }

  function parseDate(value) {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function rowMatchesSearch(row, search) {
    if (!search) {
      return true;
    }
    const needle = search.trim().toLowerCase();
    return Object.values(row).some((value) => {
      if (value === null || value === undefined) {
        return false;
      }
      if (typeof value === "object") {
        return false;
      }
      return String(value).toLowerCase().includes(needle);
    });
  }

  function matchesMulti(value, selected) {
    if (!selected.length) {
      return true;
    }
    return selected.includes(String(value ?? ""));
  }

  function getPedidoValueField(row) {
    return row.valor_final ?? row.valor_pendente ?? row.valor_pago ?? null;
  }

  function getContaValueField(row) {
    return row.valor ?? null;
  }

  function matchesPeriod(row, kind, state) {
    const dateField = kind === "pedidos" ? row.data_cadastro : row.data_vencimento;
    const monthField = kind === "pedidos" ? row.mes_cadastro : row.mes_vencimento;
    const date = parseDate(dateField);

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
      const from = parseDate(state.periodFrom);
      if (from && date && date < from) {
        return false;
      }
    }
    if (state.periodTo) {
      const to = parseDate(state.periodTo);
      if (to && date && date > to) {
        return false;
      }
    }
    return true;
  }

  function matchesValueRange(row, kind, state) {
    const value = kind === "pedidos" ? getPedidoValueField(row) : getContaValueField(row);
    if (value === null || value === undefined) {
      return !state.valueMin && !state.valueMax;
    }
    if (state.valueMin !== null && state.valueMin !== "" && value < Number(state.valueMin)) {
      return false;
    }
    if (state.valueMax !== null && state.valueMax !== "" && value > Number(state.valueMax)) {
      return false;
    }
    return true;
  }

  function applyPedidoFilters(row, filters) {
    if (filters.comPendente && !(row.valor_pendente > 0.01)) {
      return false;
    }
    if (filters.semCliente && row.cliente) {
      return false;
    }
    if (filters.semDataPrevista && row.data_prevista) {
      return false;
    }
    if (filters.entregueNoPrazo && row.entregue_no_prazo !== true) {
      return false;
    }
    if (filters.atrasado && !(row.entregue_no_prazo === false)) {
      return false;
    }
    if (filters.cancelado && row.situacao_grupo !== "Perdido / cancelado") {
      return false;
    }
    if (filters.aguardandoAprovacao && row.situacao_grupo !== "Aguardando Aprovação") {
      return false;
    }
    if (!matchesMulti(row.situacao_original, filters.situacao)) {
      return false;
    }
    if (!matchesMulti(row.situacao_grupo, filters.situacaoGrupo)) {
      return false;
    }
    if (!matchesMulti(row.vendedor, filters.vendedor)) {
      return false;
    }
    if (!matchesMulti(row.cliente, filters.cliente)) {
      return false;
    }
    if (!matchesMulti(row.forma_pagamento_entrada, filters.formaEntrada)) {
      return false;
    }
    if (!matchesMulti(row.forma_pagamento_saldo, filters.formaSaldo)) {
      return false;
    }
    return true;
  }

  function applyContaFilters(row, filters) {
    if (filters.pago === true && !row.pago) {
      return false;
    }
    if (filters.pago === false && row.pago) {
      return false;
    }
    if (filters.vencido && row.status_pagamento !== "Vencido") {
      return false;
    }
    if (filters.venceHoje && row.status_pagamento !== "Vence hoje") {
      return false;
    }
    if (filters.vence7 && row.status_pagamento !== "Próximos 7 dias") {
      return false;
    }
    if (filters.vence30 && row.status_pagamento !== "Próximos 30 dias") {
      return false;
    }
    if (filters.semValor && row.valor !== null && row.valor !== undefined) {
      return false;
    }
    if (filters.semClassificacao && row.classificacao) {
      return false;
    }
    if (filters.semConta && row.conta) {
      return false;
    }
    if (!matchesMulti(row.status_pagamento, filters.statusPagamento)) {
      return false;
    }
    if (!matchesMulti(row.fornecedor, filters.fornecedor)) {
      return false;
    }
    if (!matchesMulti(row.classificacao, filters.classificacao)) {
      return false;
    }
    if (!matchesMulti(row.categoria, filters.categoria)) {
      return false;
    }
    if (!matchesMulti(row.conta, filters.conta)) {
      return false;
    }
    if (!matchesMulti(row.parcela, filters.parcela)) {
      return false;
    }
    return true;
  }

  function applyFilters(rows, kind, state) {
    const list = Array.isArray(rows) ? rows : [];
    return list.filter((row) => {
      if (!rowMatchesSearch(row, state.search)) {
        return false;
      }
      if (!matchesPeriod(row, kind, state)) {
        return false;
      }
      if (!matchesValueRange(row, kind, state)) {
        return false;
      }
      if (kind === "pedidos") {
        return applyPedidoFilters(row, state.pedidos);
      }
      if (kind === "contas") {
        return applyContaFilters(row, state.contas);
      }
      return true;
    });
  }

  function getDistinctValues(rows, field) {
    const values = new Set();
    (rows || []).forEach((row) => {
      const value = row[field];
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        values.add(String(value));
      }
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  function getActiveChips(state) {
    const chips = [];
    if (state.search) {
      chips.push({ id: "search", label: `Busca: ${state.search}`, path: ["search"] });
    }
    if (state.year) {
      chips.push({ id: "year", label: `Ano: ${state.year}`, path: ["year"] });
    }
    if (state.month) {
      chips.push({ id: "month", label: `Mês: ${state.month}`, path: ["month"] });
    }
    if (state.valueMin !== null && state.valueMin !== "") {
      chips.push({ id: "valueMin", label: `Mín: ${state.valueMin}`, path: ["valueMin"] });
    }
    if (state.valueMax !== null && state.valueMax !== "") {
      chips.push({ id: "valueMax", label: `Máx: ${state.valueMax}`, path: ["valueMax"] });
    }
    return chips;
  }

  window.MoldeFilters = {
    createDefaultState,
    cloneState,
    clearAll,
    applyFilters,
    getDistinctValues,
    getActiveChips
  };
})();
