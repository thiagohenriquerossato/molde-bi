(function () {
  const schemas = () => window.MoldeSchemas;
  const cleaners = () => window.MoldeCleaners;
  const validators = () => window.MoldeValidators;

  const SITUACAO_GRUPO_ENTRIES = [
    ["Aguardando Aprovação", "Pipeline / orçamento"],
    ["Aguardando Produzir", "Pedido ativo"],
    ["Produzindo", "Pedido ativo"],
    ["Pronto para Entrega", "Pedido ativo"],
    ["Entregue", "Entregue"],
    ["Cancelado", "Perdido / cancelado"]
  ];

  const SITUACAO_GRUPO_MAP = new Map(
    SITUACAO_GRUPO_ENTRIES.map(([key, value]) => [normalizeSituacaoKey(key), value])
  );

  const INDICATOR_CATALOG = [
    { match: /receita/i, origem: "Calculado por pedidos", calculavel: true },
    { match: /ticket/i, origem: "Calculado por pedidos", calculavel: true },
    { match: /pedidos entregues/i, origem: "Calculado por pedidos", calculavel: true },
    { match: /despesa|contas a pagar|contas vencidas/i, origem: "Calculado por contas", calculavel: true },
    { match: /marketing|estoque|rh|recursos humanos/i, origem: "Manual", calculavel: false },
    { match: /produção|producao|prazo/i, origem: "Calculado por pedidos", calculavel: true }
  ];

  function normalizeSituacaoKey(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function normalizeText(value) {
    return String(value ?? "").trim().replace(/\s+/g, " ");
  }

  function normalizeEntityName(value) {
    const text = normalizeText(value);
    if (!text) {
      return "";
    }
    if (normalizeSituacaoKey(text) === "balcão" || normalizeSituacaoKey(text) === "balcao") {
      return "Balcão (cliente genérico)";
    }
    return text;
  }

  function getRecordField(record, ...keys) {
    for (const key of keys) {
      const normalized = schemas().normalizeHeader(key);
      if (Object.prototype.hasOwnProperty.call(record, normalized)) {
        return record[normalized];
      }
    }
    return "";
  }

  function diffDays(later, earlier) {
    if (!later || !earlier) {
      return null;
    }
    const ms = later.getTime() - earlier.getTime();
    return Math.round(ms / 86400000);
  }

  function toYearMonth(date) {
    if (!date) {
      return null;
    }
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${date.getFullYear()}-${month}`;
  }

  function mapSituacaoGrupo(original, alerts) {
    const key = normalizeSituacaoKey(original);
    if (!key) {
      return "Sem status";
    }
    if (SITUACAO_GRUPO_MAP.has(key)) {
      return SITUACAO_GRUPO_MAP.get(key);
    }
    alerts.push({ ruleId: "NRM-04", message: "Situação não mapeada" });
    return "Sem status";
  }

  function mapStatusFinanceiro(valorPago, valorPendente) {
    const pago = valorPago ?? 0;
    const pendente = valorPendente ?? 0;
    if (pendente <= 0.01) {
      return "Quitado";
    }
    if (pago > 0.01 && pendente > 0.01) {
      return "Parcial";
    }
    return "Pendente";
  }

  function mapStatusPagamento(row, today) {
    const valor = row.valor;
    if (valor === null || valor === undefined) {
      return "Lançamento incompleto";
    }
    if (row.pago) {
      return "Pago";
    }
    const venc = row.data_vencimento;
    if (!venc) {
      return "Lançamento incompleto";
    }
    const vencDate = new Date(venc.getFullYear(), venc.getMonth(), venc.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diff = diffDays(vencDate, todayDate);
    if (diff < 0) {
      return "Vencido";
    }
    if (diff === 0) {
      return "Vence hoje";
    }
    if (diff <= 7) {
      return "Próximos 7 dias";
    }
    if (diff <= 30) {
      return "Próximos 30 dias";
    }
    return "Futuro";
  }

  function buildAlertsIndex(validationReport) {
    const index = new Map();
    if (!validationReport) {
      return index;
    }
    [...(validationReport.criticalErrors || []), ...(validationReport.warnings || [])].forEach((finding) => {
      if (!finding.excelRow) {
        return;
      }
      if (!index.has(finding.excelRow)) {
        index.set(finding.excelRow, []);
      }
      index.get(finding.excelRow).push({
        ruleId: finding.ruleId,
        message: finding.message
      });
    });
    return index;
  }

  function normalizePedidoRow(entry, alertsIndex) {
    const { record, excelRow } = entry;
    const alerts = [...(alertsIndex.get(excelRow) || [])];
    const situacaoOriginal = normalizeText(getRecordField(record, "Situação"));
    const dataCadastro = validators().parseBrazilianDate(getRecordField(record, "Data de cadastro"));
    const dataPrevista = validators().parseBrazilianDate(getRecordField(record, "Data Prevista"));
    const dataEntregue = validators().parseBrazilianDate(getRecordField(record, "Data Entregue"));
    const valorBruto = validators().parseBrazilianNumber(getRecordField(record, "Valor Bruto"));
    const valorDesconto = validators().parseBrazilianNumber(getRecordField(record, "Valor Desconto"));
    const valorPago = validators().parseBrazilianNumber(getRecordField(record, "Valor Pago"));
    const valorPendente = validators().parseBrazilianNumber(getRecordField(record, "Valor Pendente"));
    const valorFinal = validators().parseBrazilianNumber(getRecordField(record, "Valor Final"));
    const entregue = normalizeSituacaoKey(situacaoOriginal) === "entregue";
    let diasProducao = null;
    let diasAtraso = null;
    let entregueNoPrazo = null;

    if (entregue && dataCadastro && dataEntregue) {
      diasProducao = diffDays(dataEntregue, dataCadastro);
    }
    if (entregue && dataPrevista && dataEntregue) {
      diasAtraso = diffDays(dataEntregue, dataPrevista);
      entregueNoPrazo = diasAtraso <= 0;
    }

    return {
      excelRow,
      pedido_id: normalizeText(getRecordField(record, "Pedido")),
      situacao_original: situacaoOriginal,
      situacao_grupo: mapSituacaoGrupo(situacaoOriginal, alerts),
      data_cadastro: dataCadastro ? dataCadastro.toISOString() : null,
      data_prevista: dataPrevista ? dataPrevista.toISOString() : null,
      data_entregue: dataEntregue ? dataEntregue.toISOString() : null,
      forma_pagamento_entrada: normalizeText(getRecordField(record, "Forma de Pagamento Entrada")),
      forma_pagamento_saldo: normalizeText(getRecordField(record, "Forma de Pagamento Saldo")),
      cliente: normalizeText(getRecordField(record, "Cliente")),
      cliente_normalizado: normalizeEntityName(getRecordField(record, "Cliente")),
      vendedor: normalizeText(getRecordField(record, "Vendedor")),
      valor_bruto: valorBruto,
      valor_desconto: valorDesconto,
      valor_pago: valorPago,
      valor_pendente: valorPendente,
      valor_final: valorFinal,
      mes_cadastro: toYearMonth(dataCadastro),
      mes_entrega: toYearMonth(dataEntregue),
      dias_producao: diasProducao,
      dias_atraso: diasAtraso,
      entregue_no_prazo: entregueNoPrazo,
      status_financeiro: mapStatusFinanceiro(valorPago, valorPendente),
      validationAlerts: alerts
    };
  }

  function normalizeContaRow(entry, sheetName, alertsIndex, today) {
    const { record, excelRow } = entry;
    const alerts = [...(alertsIndex.get(excelRow) || [])];
    const dataVencimento = validators().parseBrazilianDate(getRecordField(record, "DATA VENC"));
    const dataPagamento = validators().parseBrazilianDate(getRecordField(record, "DATA PAG"));
    const valor = validators().parseBrazilianNumber(getRecordField(record, "VALOR"));
    const pago = validators().isPaidFlag(getRecordField(record, "PAGO"));
    const { expectedMonth, expectedYear } = schemas().getExpectedMonthYearFromSheetName(sheetName);
    const competenciaAba = expectedMonth && expectedYear ? `${expectedYear}-${String(expectedMonth).padStart(2, "0")}` : null;
    let diasAtraso = null;

    if (!pago && dataVencimento) {
      const diff = diffDays(
        new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        new Date(dataVencimento.getFullYear(), dataVencimento.getMonth(), dataVencimento.getDate())
      );
      diasAtraso = diff > 0 ? diff : 0;
    }

    const row = {
      excelRow,
      id: `${sheetName}-${excelRow}`,
      competencia_aba: competenciaAba,
      sheet_name: sheetName,
      data_vencimento: dataVencimento ? dataVencimento.toISOString() : null,
      data_pagamento: dataPagamento ? dataPagamento.toISOString() : null,
      valor,
      fornecedor: normalizeText(getRecordField(record, "FORNECEDOR")),
      fornecedor_normalizado: normalizeEntityName(getRecordField(record, "FORNECEDOR")),
      descricao: normalizeText(getRecordField(record, "DESCRIÇÃO", "DESCRICAO")),
      parcela: normalizeText(getRecordField(record, "PARCELA")),
      classificacao: normalizeText(getRecordField(record, "CLASSIFICAÇÃO", "CLASSIFICACAO")),
      classificacao_normalizada: normalizeText(getRecordField(record, "CLASSIFICAÇÃO", "CLASSIFICACAO")),
      categoria: normalizeText(getRecordField(record, "CATEGORIA")),
      categoria_normalizada: normalizeText(getRecordField(record, "CATEGORIA")),
      conta: normalizeText(getRecordField(record, "CONTA")),
      pago,
      mes_vencimento: toYearMonth(dataVencimento),
      mes_pagamento: toYearMonth(dataPagamento),
      dias_atraso: diasAtraso,
      validationAlerts: alerts
    };

    row.status_pagamento = mapStatusPagamento(row, today);
    return row;
  }

  function classifyIndicador(name, hasValue) {
    const text = normalizeText(name);
    if (!text) {
      return { origem: "Não disponível", calculavel: false };
    }
    const catalogHit = INDICATOR_CATALOG.find((item) => item.match.test(text));
    if (catalogHit) {
      return { origem: catalogHit.origem, calculavel: catalogHit.calculavel };
    }
    if (hasValue) {
      return { origem: "Manual", calculavel: false };
    }
    return { origem: "Não disponível", calculavel: false };
  }

  function normalizeIndicadorRow(cells, excelRow, headerIndex) {
    const getCell = (key) => {
      const idx = headerIndex[schemas().normalizeHeader(key)];
      return idx === undefined ? "" : cells[idx];
    };
    const indicador = normalizeText(getCell("INDICADOR") || getCell("Indicador"));
    const valorRaw = getCell("VALOR") || getCell("Valor");
    const metaRaw = getCell("META") || getCell("Meta");
    const valor = validators().parseBrazilianNumber(valorRaw);
    const meta = validators().parseBrazilianNumber(metaRaw);
    const hasValue = valor !== null || normalizeText(valorRaw) !== "";
    const classification = classifyIndicador(indicador, hasValue);
    let vsMeta = null;
    if (valor !== null && meta !== null && meta !== 0) {
      vsMeta = ((valor - meta) / meta) * 100;
    }

    return {
      excelRow,
      mes: normalizeText(getCell("MES") || getCell("Mês") || getCell("Mes")),
      setor: normalizeText(getCell("SETOR") || getCell("Setor")),
      indicador,
      valor,
      meta,
      vs_meta: vsMeta,
      origem: classification.origem,
      calculavel: classification.calculavel,
      validationAlerts: []
    };
  }

  function getWorksheetMatrix(worksheet) {
    return window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: true });
  }

  function normalizePedidos(workbook, validationReport) {
    const sheetName = schemas().getPedidosSheetName(workbook);
    if (!sheetName) {
      return { rows: [], meta: { kind: "pedidos", rowCount: 0 } };
    }
    const worksheet = workbook.Sheets[sheetName];
    const matrix = getWorksheetMatrix(worksheet);
    const headerRowValues = matrix[schemas().PEDIDOS_HEADER_ROW - 1] || [];
    const dataRows = cleaners()
      .worksheetToRows(worksheet, { startRow: schemas().PEDIDOS_HEADER_ROW + 1 })
      .map((row) => ({
        excelRow: row.excelRow,
        cells: row.cells,
        record: schemas().mapRecord(row.cells, headerRowValues)
      }));
    const cleaned = cleaners().cleanPedidosRows(dataRows);
    const alertsIndex = buildAlertsIndex(validationReport);
    const rows = cleaned.rows.map((entry) => normalizePedidoRow(entry, alertsIndex));
    return { rows, meta: { kind: "pedidos", rowCount: rows.length, sheetName } };
  }

  function normalizeContas(workbook, validationReport) {
    const sheetNames = Array.isArray(workbook.SheetNames) ? workbook.SheetNames : [];
    const monthlySheets = schemas().getContasMonthlySheets(sheetNames);
    const today = new Date();
    const alertsIndex = buildAlertsIndex(validationReport);
    const rows = [];

    monthlySheets.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const matrix = getWorksheetMatrix(worksheet);
      const headerRowValues = matrix[schemas().CONTAS_HEADER_ROW - 1] || [];
      const dataRows = cleaners()
        .worksheetToRows(worksheet, { startRow: schemas().CONTAS_DATA_START_ROW })
        .map((row) => ({
          excelRow: row.excelRow,
          cells: row.cells,
          record: schemas().mapRecord(row.cells, headerRowValues)
        }));
      const cleaned = cleaners().cleanContasSheetRows(dataRows);
      cleaned.rows.forEach((entry) => {
        rows.push(normalizeContaRow({ ...entry, sheetName }, sheetName, alertsIndex, today));
      });
    });

    return { rows, meta: { kind: "contas", rowCount: rows.length, sheetCount: monthlySheets.length } };
  }

  function normalizeIndicadores(workbook, validationReport) {
    const sheetName = schemas().getIndicadoresSheetName(workbook);
    if (!sheetName) {
      return { rows: [], meta: { kind: "indicadores", rowCount: 0 } };
    }
    const worksheet = workbook.Sheets[sheetName];
    const matrix = getWorksheetMatrix(worksheet);
    const headerRowValues = matrix[0] || [];
    const headerIndex = schemas().buildHeaderIndex(headerRowValues);
    const rows = matrix
      .slice(1)
      .map((cells, index) => ({ cells, excelRow: index + 2 }))
      .filter(({ cells }) => cells.some((cell) => String(cell ?? "").trim() !== ""))
      .map(({ cells, excelRow }) => normalizeIndicadorRow(cells, excelRow, headerIndex));

    return { rows, meta: { kind: "indicadores", rowCount: rows.length, sheetName } };
  }

  function normalizeWorkbook(workbook, kind, validationReport) {
    if (kind === "pedidos") {
      return normalizePedidos(workbook, validationReport);
    }
    if (kind === "contas") {
      return normalizeContas(workbook, validationReport);
    }
    if (kind === "indicadores") {
      return normalizeIndicadores(workbook, validationReport);
    }
    return { rows: [], meta: { kind, rowCount: 0 } };
  }

  window.MoldeNormalizers = {
    SITUACAO_GRUPO_MAP,
    INDICATOR_CATALOG,
    normalizePedidos,
    normalizeContas,
    normalizeIndicadores,
    normalizeWorkbook,
    mapSituacaoGrupo,
    mapStatusFinanceiro,
    mapStatusPagamento
  };
})();
