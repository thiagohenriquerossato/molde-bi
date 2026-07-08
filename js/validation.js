(function () {
  const schemas = () => window.MoldeSchemas;
  const cleaners = () => window.MoldeCleaners;
  const validators = () => window.MoldeValidators;

  function buildReport(kind, criticalErrors, warnings, validRowCount) {
    const status = criticalErrors.length > 0
      ? "invalid"
      : warnings.length > 0
        ? "valid_with_warnings"
        : "valid";

    return {
      kind,
      status,
      summary: {
        criticalCount: criticalErrors.length,
        warningCount: warnings.length,
        excludedCount: warnings.filter((item) => item.ruleId === "NRM-01" || item.ruleId === "NRM-02").length,
        validRowCount
      },
      criticalErrors,
      warnings
    };
  }

  function getWorksheetMatrix(worksheet) {
    return window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: true });
  }

  function validatePedidos(workbook) {
    const sheetName = schemas().getPedidosSheetName(workbook);
    if (!sheetName) {
      return buildReport("pedidos", [
        {
          ruleId: "VAL-01",
          message: "Planilha de pedidos sem abas legíveis.",
          excelRow: 1,
          businessId: "Pedidos"
        }
      ], [], 0);
    }

    const worksheet = workbook.Sheets[sheetName];
    const matrix = getWorksheetMatrix(worksheet);
    const headerRowValues = matrix[schemas().PEDIDOS_HEADER_ROW - 1] || [];
    const headerIndex = schemas().buildHeaderIndex(headerRowValues);
    const criticalErrors = validators().validatePedidosStructure(headerIndex);

    const dataRows = cleaners()
      .worksheetToRows(worksheet, { startRow: schemas().PEDIDOS_HEADER_ROW + 1 })
      .map((row) => ({
        excelRow: row.excelRow,
        cells: row.cells,
        record: schemas().mapRecord(row.cells, headerRowValues)
      }));

    const cleaned = cleaners().cleanPedidosRows(dataRows);
    const rowErrors = validators().validatePedidosRows(cleaned.rows);

    return buildReport(
      "pedidos",
      [...criticalErrors, ...rowErrors],
      cleaned.warnings,
      cleaned.rows.length
    );
  }

  function validateContas(workbook) {
    const sheetNames = Array.isArray(workbook.SheetNames) ? workbook.SheetNames : [];
    const monthlySheets = schemas().getContasMonthlySheets(sheetNames);
    const criticalErrors = validators().validateContasStructure(monthlySheets, workbook);
    const warnings = [];
    const allRecords = [];

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
      warnings.push(...cleaned.warnings);

      const { expectedMonth, expectedYear } = schemas().getExpectedMonthYearFromSheetName(sheetName);
      const recordsWithSheet = cleaned.rows.map((row) => ({ ...row, sheetName }));
      allRecords.push(...recordsWithSheet);
      criticalErrors.push(...validators().validateContasRows(recordsWithSheet, sheetName, expectedMonth, expectedYear));
    });

    criticalErrors.push(...validators().validateContasSimilarSpellings(allRecords));

    return buildReport("contas", criticalErrors, warnings, allRecords.length);
  }

  function validateIndicadores(workbook) {
    const sheetName = schemas().getIndicadoresSheetName(workbook);
    const criticalErrors = [];
    const warnings = [];

    if (!sheetName) {
      criticalErrors.push({
        ruleId: "IND-STRUCT",
        message: "Planilha de indicadores sem abas legíveis.",
        excelRow: 1,
        businessId: "Indicadores"
      });
      return buildReport("indicadores", criticalErrors, warnings, 0);
    }

    const worksheet = workbook.Sheets[sheetName];
    const matrix = getWorksheetMatrix(worksheet);
    const headerRow = matrix[0] || [];
    if (!headerRow.some((cell) => String(cell ?? "").trim())) {
      criticalErrors.push({
        ruleId: "IND-STRUCT",
        message: `Aba ${sheetName} sem cabeçalho identificável.`,
        excelRow: 1,
        businessId: sheetName
      });
    }

    const validRowCount = Math.max(matrix.length - 1, 0);
    return buildReport("indicadores", criticalErrors, warnings, validRowCount);
  }

  function validateWorkbook(workbook, kind) {
    if (kind === "pedidos") {
      return validatePedidos(workbook);
    }
    if (kind === "contas") {
      return validateContas(workbook);
    }
    if (kind === "indicadores") {
      return validateIndicadores(workbook);
    }
    return buildReport(kind, [], [], 0);
  }

  window.MoldeValidation = {
    buildReport,
    validateWorkbook,
    validatePedidos,
    validateContas,
    validateIndicadores
  };
})();
