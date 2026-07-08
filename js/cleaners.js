(function () {
  const schemas = () => window.MoldeSchemas;

  function worksheetToRows(worksheet, options = {}) {
    if (!worksheet || !window.XLSX) {
      return [];
    }

    const startRow = options.startRow || 1;
    const matrix = window.XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: true
    });

    return matrix
      .map((cells, index) => ({
        excelRow: index + 1,
        cells: Array.isArray(cells) ? cells : []
      }))
      .filter((row) => row.excelRow >= startRow);
  }

  function rowsToRecords(rows, headerRowValues) {
    return rows.map((row) => ({
      excelRow: row.excelRow,
      cells: row.cells,
      record: schemas().mapRecord(row.cells, headerRowValues)
    }));
  }

  function getFirstCellText(row) {
    const first = row.cells[0];
    return String(first ?? "").trim();
  }

  function getContaBusinessId(record) {
    const fornecedor = String(record.FORNECEDOR ?? "").trim();
    const descricao = String(record.DESCRIÇÃO ?? record["DESCRIÇÃO"] ?? "").trim();
    if (fornecedor) {
      return fornecedor;
    }
    if (descricao) {
      return descricao;
    }
    return "(sem identificador)";
  }

  function cleanPedidosRows(rows) {
    const kept = [];
    const warnings = [];

    rows.forEach((row) => {
      const pedido = String(row.record.PEDIDO ?? "").trim();
      if (!pedido) {
        warnings.push({
          ruleId: "NRM-01",
          reason: "Pedido vazio",
          message: "Linha ignorada por pedido vazio.",
          excelRow: row.excelRow,
          businessId: "(sem pedido)"
        });
        return;
      }
      kept.push(row);
    });

    return { rows: kept, warnings };
  }

  function cleanContasSheetRows(rows) {
    const kept = [];
    const warnings = [];
    let stop = false;

    rows.forEach((row) => {
      if (stop) {
        return;
      }

      const firstCell = getFirstCellText(row).toUpperCase();
      if (firstCell === "TOTAL" || firstCell.startsWith("TOTAL ")) {
        warnings.push({
          ruleId: "NRM-02",
          reason: "Parada em TOTAL",
          message: "Leitura interrompida na linha TOTAL.",
          excelRow: row.excelRow,
          businessId: "(total)"
        });
        stop = true;
        return;
      }

      const hasContent = row.cells.some((cell) => String(cell ?? "").trim() !== "");
      if (!hasContent) {
        return;
      }

      kept.push(row);
    });

    return { rows: kept, warnings };
  }

  window.MoldeCleaners = {
    worksheetToRows,
    rowsToRecords,
    cleanPedidosRows,
    cleanContasSheetRows
  };
})();
