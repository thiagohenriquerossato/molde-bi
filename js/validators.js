(function () {
  const schemas = () => window.MoldeSchemas;

  function normalizeLabel(value) {
    return String(value ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function isEmptyValue(value) {
    const text = String(value ?? "").trim();
    if (!text) {
      return true;
    }
    const lower = text.toLowerCase();
    return lower === "não definido" || lower === "nao definido";
  }

  function parseBrazilianNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (value === null || value === undefined || isEmptyValue(value)) {
      return null;
    }
    const normalized = String(value).trim().replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function parseBrazilianDate(value) {
    if (value === null || value === undefined || isEmptyValue(value)) {
      return null;
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      const utc = Math.round((value - 25569) * 86400 * 1000);
      const date = new Date(utc);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    const text = String(value).trim();
    const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) {
      return null;
    }
    const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function levenshtein(a, b) {
    const left = normalizeLabel(a);
    const right = normalizeLabel(b);
    if (left === right) {
      return 0;
    }
    const matrix = Array.from({ length: left.length + 1 }, () => new Array(right.length + 1).fill(0));
    for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
    for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;
    for (let i = 1; i <= left.length; i += 1) {
      for (let j = 1; j <= right.length; j += 1) {
        const cost = left[i - 1] === right[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[left.length][right.length];
  }

  function isPaidFlag(value) {
    const text = String(value ?? "").trim().toLowerCase();
    return text === "sim" || text === "s" || text === "pago" || text === "yes";
  }

  function getBusinessIdPedido(record) {
    const pedido = String(record.PEDIDO ?? "").trim();
    return pedido || "(sem pedido)";
  }

  function getBusinessIdConta(record) {
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

  function createCritical(ruleId, message, excelRow, businessId) {
    return { ruleId, message, excelRow, businessId };
  }

  function validatePedidosStructure(headerIndex) {
    const errors = [];
    schemas().PEDIDOS_REQUIRED_COLUMNS.forEach((columnName) => {
      const key = schemas().normalizeHeader(columnName);
      if (!Object.prototype.hasOwnProperty.call(headerIndex, key)) {
        errors.push(
          createCritical(
            "VAL-01",
            `Coluna obrigatória ausente: ${columnName}.`,
            schemas().PEDIDOS_HEADER_ROW,
            "Cabeçalho"
          )
        );
      }
    });
    return errors;
  }

  function validatePedidosRows(records) {
    const errors = [];

    records.forEach(({ record, excelRow }) => {
      const businessId = getBusinessIdPedido(record);

      if (isEmptyValue(record.SITUAÇÃO ?? record["SITUAÇÃO"])) {
        errors.push(createCritical("VAL-02", "Pedido sem situação.", excelRow, businessId));
      }
      if (isEmptyValue(record.CLIENTE)) {
        errors.push(createCritical("VAL-02", "Pedido sem cliente.", excelRow, businessId));
      }
      if (isEmptyValue(record["DATA PREVISTA"])) {
        errors.push(createCritical("VAL-02", "Pedido sem data prevista.", excelRow, businessId));
      }
      if (isEmptyValue(record["DATA ENTREGUE"])) {
        errors.push(createCritical("VAL-02", "Pedido sem data entregue.", excelRow, businessId));
      }

      const cadastro = parseBrazilianDate(record["DATA DE CADASTRO"]);
      const prevista = parseBrazilianDate(record["DATA PREVISTA"]);
      const entregue = parseBrazilianDate(record["DATA ENTREGUE"]);

      if (!isEmptyValue(record["DATA DE CADASTRO"]) && !cadastro) {
        errors.push(createCritical("VAL-03", "Data de cadastro inválida.", excelRow, businessId));
      }
      if (!isEmptyValue(record["DATA PREVISTA"]) && !prevista) {
        errors.push(createCritical("VAL-03", "Data prevista inválida.", excelRow, businessId));
      }
      if (!isEmptyValue(record["DATA ENTREGUE"]) && !entregue) {
        errors.push(createCritical("VAL-03", "Data entregue inválida.", excelRow, businessId));
      }
      if (cadastro && entregue && entregue < cadastro) {
        errors.push(createCritical("VAL-03", "Data entregue anterior à data de cadastro.", excelRow, businessId));
      }

      const valorBruto = parseBrazilianNumber(record["VALOR BRUTO"]);
      const valorDesconto = parseBrazilianNumber(record["VALOR DESCONTO"]);
      const valorFinal = parseBrazilianNumber(record["VALOR FINAL"]);
      if (valorBruto !== null && valorDesconto !== null && valorFinal !== null) {
        const expected = valorBruto - valorDesconto;
        if (Math.abs(expected - valorFinal) > 0.01) {
          errors.push(
            createCritical(
              "VAL-04",
              "Divergência entre Valor Bruto - Valor Desconto e Valor Final.",
              excelRow,
              businessId
            )
          );
        }
      }

      const situacao = String(record.SITUAÇÃO ?? record["SITUAÇÃO"] ?? "").toLowerCase();
      const valorPendente = parseBrazilianNumber(record["VALOR PENDENTE"]) ?? 0;
      if (situacao.includes("entregue") && valorPendente > 0.01) {
        errors.push(createCritical("VAL-05", "Pedido entregue com valor pendente.", excelRow, businessId));
      }
    });

    return errors;
  }

  function validateContasStructure(monthlySheets, workbook) {
    const errors = [];
    const present = new Set(monthlySheets);

    schemas().EXPECTED_CONTAS_MONTHLY_SHEETS.forEach((sheetName) => {
      if (!present.has(sheetName)) {
        errors.push(
          createCritical("VAL-06", `Aba mensal ausente: ${sheetName}.`, schemas().CONTAS_HEADER_ROW, sheetName)
        );
      }
    });

    monthlySheets.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const matrix = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: true });
      const headerRow = matrix[schemas().CONTAS_HEADER_ROW - 1] || [];
      const headerIndex = schemas().buildHeaderIndex(headerRow);

      schemas().CONTAS_REQUIRED_COLUMNS.forEach((columnName) => {
        const key = schemas().normalizeHeader(columnName);
        if (!Object.prototype.hasOwnProperty.call(headerIndex, key)) {
          errors.push(
            createCritical(
              "VAL-06",
              `Cabeçalho incompleto em ${sheetName}: falta ${columnName}.`,
              schemas().CONTAS_HEADER_ROW,
              sheetName
            )
          );
        }
      });
    });

    return errors;
  }

  function validateContasRows(records, sheetName, expectedMonth, expectedYear) {
    const errors = [];

    records.forEach(({ record, excelRow }) => {
      const businessId = `${sheetName} · ${getBusinessIdConta(record)}`;

      if (parseBrazilianNumber(record.VALOR) === null) {
        errors.push(createCritical("VAL-07", "Conta sem valor.", excelRow, businessId));
      }
      if (isEmptyValue(record.CLASSIFICAÇÃO ?? record["CLASSIFICAÇÃO"])) {
        errors.push(createCritical("VAL-07", "Conta sem classificação.", excelRow, businessId));
      }
      if (isEmptyValue(record.CATEGORIA)) {
        errors.push(createCritical("VAL-07", "Conta sem categoria.", excelRow, businessId));
      }
      if (isEmptyValue(record.CONTA)) {
        errors.push(createCritical("VAL-07", "Conta sem conta bancária.", excelRow, businessId));
      }

      if (isPaidFlag(record.PAGO) && isEmptyValue(record["DATA PAG"])) {
        errors.push(createCritical("VAL-08", "Conta paga sem data de pagamento.", excelRow, businessId));
      }

      const vencimento = parseBrazilianDate(record["DATA VENC"]);
      if (vencimento && expectedMonth && expectedYear) {
        const month = vencimento.getMonth() + 1;
        const year = vencimento.getFullYear();
        if (month !== expectedMonth || year !== expectedYear) {
          errors.push(
            createCritical(
              "VAL-09",
              `Vencimento fora do mês/ano esperado da aba (${expectedMonth}/${expectedYear}).`,
              excelRow,
              businessId
            )
          );
        }
      }
    });

    return errors;
  }

  function validateSimilarLabels(records, fieldName, ruleId, sheetName) {
    const values = [];
    records.forEach(({ record, excelRow }) => {
      const raw = record[fieldName] ?? record[schemas().normalizeHeader(fieldName)];
      const label = String(raw ?? "").trim();
      if (!label) {
        return;
      }
      values.push({ label, normalized: normalizeLabel(label), excelRow, businessId: `${sheetName} · ${getBusinessIdConta(record)}` });
    });

    const errors = [];
    const seenPairs = new Set();

    for (let i = 0; i < values.length; i += 1) {
      for (let j = i + 1; j < values.length; j += 1) {
        const left = values[i];
        const right = values[j];
        if (left.normalized === right.normalized) {
          continue;
        }
        const distance = levenshtein(left.normalized, right.normalized);
        if (distance > 2) {
          continue;
        }
        const pairKey = [left.normalized, right.normalized].sort().join("|");
        if (seenPairs.has(pairKey)) {
          continue;
        }
        seenPairs.add(pairKey);
        errors.push(
          createCritical(
            ruleId,
            `${fieldName} com grafias parecidas: "${left.label}" e "${right.label}".`,
            right.excelRow,
            right.businessId
          )
        );
      }
    }

    return errors;
  }

  function validateContasSimilarSpellings(allRecords) {
    const errors = [];
    const bySheet = new Map();

    allRecords.forEach((entry) => {
      if (!bySheet.has(entry.sheetName)) {
        bySheet.set(entry.sheetName, []);
      }
      bySheet.get(entry.sheetName).push(entry);
    });

    bySheet.forEach((records, sheetName) => {
      errors.push(...validateSimilarLabels(records, "CATEGORIA", "VAL-10", sheetName));
      errors.push(...validateSimilarLabels(records, "CLASSIFICAÇÃO", "VAL-10", sheetName));
    });

    return errors;
  }

  window.MoldeValidators = {
    normalizeLabel,
    parseBrazilianDate,
    parseBrazilianNumber,
    levenshtein,
    isPaidFlag,
    getBusinessIdPedido,
    getBusinessIdConta,
    validatePedidosStructure,
    validatePedidosRows,
    validateContasStructure,
    validateContasRows,
    validateContasSimilarSpellings
  };
})();
