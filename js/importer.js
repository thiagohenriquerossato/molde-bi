(function () {
  const acceptedExtensions = [".xlsx", ".xls"];

  function getFileExtension(fileName) {
    const dotIndex = fileName.lastIndexOf(".");
    return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
  }

  function assertReadableFile(file) {
    if (!file) {
      throw new Error("Selecione uma planilha para continuar.");
    }

    if (!acceptedExtensions.includes(getFileExtension(file.name))) {
      throw new Error("Formato não reconhecido. Use um arquivo .xlsx ou .xls.");
    }

    if (!window.XLSX || typeof window.XLSX.read !== "function") {
      throw new Error("Biblioteca de leitura Excel não carregada.");
    }
  }

  async function readWorkbookBuffer(file, kind) {
    assertReadableFile(file);
    const buffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(buffer);
    return {
      workbook,
      metadata: getWorkbookMetadata(workbook, file, kind)
    };
  }

  async function readWorkbookFile(file, kind) {
    const result = await readWorkbookBuffer(file, kind);
    return result.metadata;
  }

  function getWorkbookMetadata(workbook, file, kind) {
    const sheetNames = Array.isArray(workbook.SheetNames) ? workbook.SheetNames : [];
    const primarySheetName = getPrimarySheetName(workbook, kind);
    const worksheet = primarySheetName ? workbook.Sheets[primarySheetName] : null;

    return {
      kind,
      fileName: file.name,
      importedAt: new Date().toISOString(),
      sheetNames,
      rowCount: countWorksheetRows(worksheet),
      primarySheetName,
      monthlySheetNames: kind === "contas" ? listMonthlySheets(sheetNames) : []
    };
  }

  function getPrimarySheetName(workbook, kind) {
    const sheetNames = Array.isArray(workbook.SheetNames) ? workbook.SheetNames : [];

    if (kind === "indicadores" && sheetNames.includes("DADOS_PBI")) {
      return "DADOS_PBI";
    }

    return sheetNames[0] || null;
  }

  function countWorksheetRows(worksheet) {
    if (!worksheet || !worksheet["!ref"]) {
      return 0;
    }

    const range = window.XLSX.utils.decode_range(worksheet["!ref"]);
    return Math.max(range.e.r - range.s.r, 0);
  }

  function listMonthlySheets(sheetNames) {
    return sheetNames.filter((sheetName) => sheetName.startsWith("CONTAS ") && sheetName.includes("2026"));
  }

  window.MoldeImporter = {
    readWorkbookBuffer,
    readWorkbookFile,
    getWorkbookMetadata,
    getPrimarySheetName,
    countWorksheetRows,
    listMonthlySheets
  };
})();
