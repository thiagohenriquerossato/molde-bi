(function () {
  const PEDIDOS_HEADER_ROW = 1;
  const CONTAS_HEADER_ROW = 2;
  const CONTAS_DATA_START_ROW = 3;
  const CONTAS_MONTHLY_PREFIX = "CONTAS ";
  const CONTAS_YEAR_TOKEN = "2026";

  const PEDIDOS_REQUIRED_COLUMNS = [
    "Pedido",
    "Situação",
    "Data de cadastro",
    "Data Prevista",
    "Data Entregue",
    "Forma de Pagamento Entrada",
    "Forma de Pagamento Saldo",
    "Cliente",
    "Vendedor",
    "Valor Bruto",
    "Valor Desconto",
    "Valor Pago",
    "Valor Pendente",
    "Valor Final"
  ];

  const CONTAS_REQUIRED_COLUMNS = [
    "DATA VENC",
    "DATA PAG",
    "VALOR",
    "FORNECEDOR",
    "DESCRIÇÃO",
    "PARCELA",
    "CLASSIFICAÇÃO",
    "CATEGORIA",
    "CONTA",
    "PAGO"
  ];

  const MONTH_NAME_TO_NUMBER = {
    JAN: 1,
    FEV: 2,
    MAR: 3,
    ABRIL: 4,
    ABR: 4,
    MAIO: 5,
    JUN: 6,
    JUL: 7,
    AGO: 8,
    SET: 9,
    OUT: 10,
    NOV: 11,
    DEZ: 12
  };

  const EXPECTED_CONTAS_MONTHLY_SHEETS = [
    "CONTAS JAN 2026",
    "CONTAS FEV 2026",
    "CONTAS MAR 2026",
    "CONTAS ABRIL 2026",
    "CONTAS MAIO 2026",
    "CONTAS JUN 2026",
    "CONTAS JUL 2026",
    "CONTAS AGO 2026",
    "CONTAS SET 2026",
    "CONTAS OUT 2026",
    "CONTAS NOV 2026",
    "CONTAS DEZ 2026"
  ];

  function normalizeHeader(value) {
    return String(value ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  function buildHeaderIndex(headerRowValues) {
    const index = {};

    headerRowValues.forEach((value, columnIndex) => {
      const normalized = normalizeHeader(value);
      if (normalized) {
        index[normalized] = columnIndex;
      }
    });

    return index;
  }

  function getPedidosSheetName(workbook) {
    const sheetNames = Array.isArray(workbook.SheetNames) ? workbook.SheetNames : [];
    return sheetNames[0] || null;
  }

  function getContasMonthlySheets(sheetNames) {
    return (Array.isArray(sheetNames) ? sheetNames : []).filter(
      (sheetName) => sheetName.startsWith(CONTAS_MONTHLY_PREFIX) && sheetName.includes(CONTAS_YEAR_TOKEN)
    );
  }

  function getIndicadoresSheetName(workbook) {
    const sheetNames = Array.isArray(workbook.SheetNames) ? workbook.SheetNames : [];
    if (sheetNames.includes("DADOS_PBI")) {
      return "DADOS_PBI";
    }
    return sheetNames[0] || null;
  }

  function getExpectedMonthYearFromSheetName(sheetName) {
    const upper = String(sheetName || "").toUpperCase();
    const yearMatch = upper.match(/(20\d{2})/);
    const expectedYear = yearMatch ? Number(yearMatch[1]) : null;

    for (const [token, month] of Object.entries(MONTH_NAME_TO_NUMBER)) {
      if (upper.includes(` ${token} `) || upper.endsWith(` ${token} ${expectedYear}`) || upper.includes(` ${token} ${expectedYear}`)) {
        return { expectedMonth: month, expectedYear };
      }
    }

    return { expectedMonth: null, expectedYear };
  }

  function mapRecord(rowValues, headerRowValues) {
    const record = {};

    headerRowValues.forEach((header, columnIndex) => {
      const key = normalizeHeader(header);
      if (!key) {
        return;
      }
      record[key] = rowValues[columnIndex];
    });

    return record;
  }

  window.MoldeSchemas = {
    PEDIDOS_HEADER_ROW,
    CONTAS_HEADER_ROW,
    CONTAS_DATA_START_ROW,
    PEDIDOS_REQUIRED_COLUMNS,
    CONTAS_REQUIRED_COLUMNS,
    CONTAS_MONTHLY_PREFIX,
    CONTAS_YEAR_TOKEN,
    MONTH_NAME_TO_NUMBER,
    EXPECTED_CONTAS_MONTHLY_SHEETS,
    normalizeHeader,
    buildHeaderIndex,
    getPedidosSheetName,
    getContasMonthlySheets,
    getIndicadoresSheetName,
    getExpectedMonthYearFromSheetName,
    mapRecord
  };
})();
