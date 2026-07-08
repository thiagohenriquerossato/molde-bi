(function () {
  const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const dateFormatter = new Intl.DateTimeFormat("pt-BR");

  const COLUMN_SETS = {
    pedidos: [
      { key: "pedido_id", label: "Pedido", defaultVisible: true, type: "text", getValue: (r) => r.pedido_id },
      { key: "situacao_original", label: "Situação", defaultVisible: true, type: "badge", getValue: (r) => r.situacao_original },
      { key: "situacao_grupo", label: "Grupo", defaultVisible: true, type: "badge", getValue: (r) => r.situacao_grupo },
      { key: "cliente", label: "Cliente", defaultVisible: true, type: "text", getValue: (r) => r.cliente },
      { key: "vendedor", label: "Vendedor", defaultVisible: true, type: "text", getValue: (r) => r.vendedor },
      { key: "valor_final", label: "Valor final", defaultVisible: true, type: "currency", getValue: (r) => r.valor_final },
      { key: "valor_pago", label: "Valor pago", defaultVisible: true, type: "currency", getValue: (r) => r.valor_pago },
      { key: "valor_pendente", label: "Valor pendente", defaultVisible: true, type: "currency", getValue: (r) => r.valor_pendente },
      { key: "data_cadastro", label: "Data cadastro", defaultVisible: true, type: "date", getValue: (r) => r.data_cadastro },
      { key: "data_prevista", label: "Data prevista", defaultVisible: true, type: "date", getValue: (r) => r.data_prevista },
      { key: "data_entregue", label: "Data entregue", defaultVisible: true, type: "date", getValue: (r) => r.data_entregue },
      { key: "status_financeiro", label: "Status financeiro", defaultVisible: true, type: "badge", getValue: (r) => r.status_financeiro },
      { key: "cliente_normalizado", label: "Cliente normalizado", defaultVisible: false, type: "text", getValue: (r) => r.cliente_normalizado },
      { key: "dias_producao", label: "Dias produção", defaultVisible: false, type: "text", getValue: (r) => r.dias_producao },
      { key: "dias_atraso", label: "Dias atraso", defaultVisible: false, type: "text", getValue: (r) => r.dias_atraso },
      { key: "excelRow", label: "Linha Excel", defaultVisible: false, type: "text", getValue: (r) => r.excelRow }
    ],
    contas: [
      { key: "fornecedor", label: "Fornecedor", defaultVisible: true, type: "text", getValue: (r) => r.fornecedor },
      { key: "descricao", label: "Descrição", defaultVisible: true, type: "text", getValue: (r) => r.descricao },
      { key: "valor", label: "Valor", defaultVisible: true, type: "currency", getValue: (r) => r.valor },
      { key: "data_vencimento", label: "Vencimento", defaultVisible: true, type: "date", getValue: (r) => r.data_vencimento },
      { key: "data_pagamento", label: "Pagamento", defaultVisible: true, type: "date", getValue: (r) => r.data_pagamento },
      { key: "status_pagamento", label: "Status pagamento", defaultVisible: true, type: "badge", getValue: (r) => r.status_pagamento },
      { key: "categoria", label: "Categoria", defaultVisible: true, type: "text", getValue: (r) => r.categoria },
      { key: "classificacao", label: "Classificação", defaultVisible: true, type: "text", getValue: (r) => r.classificacao },
      { key: "conta", label: "Conta", defaultVisible: true, type: "text", getValue: (r) => r.conta },
      { key: "parcela", label: "Parcela", defaultVisible: true, type: "text", getValue: (r) => r.parcela },
      { key: "competencia_aba", label: "Competência aba", defaultVisible: false, type: "text", getValue: (r) => r.competencia_aba },
      { key: "dias_atraso", label: "Dias atraso", defaultVisible: false, type: "text", getValue: (r) => r.dias_atraso },
      { key: "excelRow", label: "Linha Excel", defaultVisible: false, type: "text", getValue: (r) => r.excelRow }
    ],
    indicadores: [
      { key: "mes", label: "Mês", defaultVisible: true, type: "text", getValue: (r) => r.mes },
      { key: "setor", label: "Setor", defaultVisible: true, type: "text", getValue: (r) => r.setor },
      { key: "indicador", label: "Indicador", defaultVisible: true, type: "text", getValue: (r) => r.indicador },
      { key: "valor", label: "Valor", defaultVisible: true, type: "currency", getValue: (r) => r.valor },
      { key: "meta", label: "Meta", defaultVisible: true, type: "currency", getValue: (r) => r.meta },
      { key: "origem", label: "Origem", defaultVisible: true, type: "badge", getValue: (r) => r.origem },
      { key: "calculavel", label: "Calculável", defaultVisible: true, type: "text", getValue: (r) => (r.calculavel ? "Sim" : "Não") },
      { key: "vs_meta", label: "Vs meta %", defaultVisible: false, type: "text", getValue: (r) => r.vs_meta }
    ]
  };

  function storageKey(kind) {
    return `molde-cols-${kind}`;
  }

  function getColumnVisibility(kind) {
    const defaults = (COLUMN_SETS[kind] || []).filter((col) => col.defaultVisible).map((col) => col.key);
    try {
      const raw = localStorage.getItem(storageKey(kind));
      if (!raw) {
        return defaults;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : defaults;
    } catch {
      return defaults;
    }
  }

  function setColumnVisibility(kind, keys) {
    try {
      localStorage.setItem(storageKey(kind), JSON.stringify(keys));
    } catch {
      return null;
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;");
  }

  function formatCell(value, type) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    if (type === "currency") {
      const num = Number(value);
      return Number.isFinite(num) ? currencyFormatter.format(num) : "—";
    }
    if (type === "date") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
    }
    return String(value);
  }

  function sortRows(rows, sortKey, direction, columns) {
    const column = columns.find((col) => col.key === sortKey);
    if (!column || !direction) {
      return rows.slice();
    }
    const factor = direction === "asc" ? 1 : -1;
    return rows.slice().sort((left, right) => {
      const a = column.getValue(left);
      const b = column.getValue(right);
      if (a === b) {
        return 0;
      }
      if (a === null || a === undefined || a === "") {
        return 1;
      }
      if (b === null || b === undefined || b === "") {
        return -1;
      }
      if (typeof a === "number" && typeof b === "number") {
        return (a - b) * factor;
      }
      return String(a).localeCompare(String(b), "pt-BR") * factor;
    });
  }

  function exportCsv(rows, columns, filename) {
    const header = columns.map((col) => col.label).join(";");
    const lines = rows.map((row) =>
      columns
        .map((col) => {
          const raw = col.getValue(row);
          const text = formatCell(raw, col.type).replace(/"/g, '""');
          return `"${text}"`;
        })
        .join(";")
    );
    const content = `\uFEFF${header}\n${lines.join("\n")}`;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderVirtualTable(container, options) {
    const {
      rows,
      columns,
      sort = { key: null, direction: null },
      onSort,
      rowClassFn
    } = options;
    const rowHeight = 36;
    const viewportHeight = 480;
    const visibleCount = Math.ceil(viewportHeight / rowHeight) + 4;

    container.innerHTML = `
      <div class="table-virtual-viewport" data-virtual-viewport style="height:${viewportHeight}px">
        <table class="data-table data-table-virtual" aria-rowcount="${rows.length}">
          <thead>
            <tr>
              ${columns
                .map((col) => {
                  const active = sort.key === col.key ? sort.direction : "none";
                  return `<th scope="col" data-sort-key="${col.key}" aria-sort="${active === "none" ? "none" : active === "asc" ? "ascending" : "descending"}">${col.label}</th>`;
                })
                .join("")}
            </tr>
          </thead>
          <tbody data-virtual-body></tbody>
        </table>
      </div>
    `;

    const viewport = container.querySelector("[data-virtual-viewport]");
    const body = container.querySelector("[data-virtual-body]");
    const spacerTop = document.createElement("tr");
    const spacerBottom = document.createElement("tr");
    spacerTop.innerHTML = `<td colspan="${columns.length}" style="height:0;padding:0;border:0"></td>`;
    spacerBottom.innerHTML = `<td colspan="${columns.length}" style="height:0;padding:0;border:0"></td>`;

    function renderSlice() {
      const scrollTop = viewport.scrollTop;
      const start = Math.max(Math.floor(scrollTop / rowHeight) - 2, 0);
      const end = Math.min(start + visibleCount, rows.length);
      const offset = start * rowHeight;
      const totalHeight = rows.length * rowHeight;
      const bottomHeight = Math.max(totalHeight - offset - (end - start) * rowHeight, 0);

      spacerTop.firstElementChild.style.height = `${offset}px`;
      spacerBottom.firstElementChild.style.height = `${bottomHeight}px`;

      const sliceRows = rows.slice(start, end).map((row) => {
        const warning = row.validationAlerts?.length > 0;
        const rowClass = [rowClassFn ? rowClassFn(row) : "", warning ? "data-table-row-warning" : ""]
          .filter(Boolean)
          .join(" ");
        const cells = columns
          .map((col, index) => {
            const value = col.getValue(row);
            let content = escapeHtml(formatCell(value, col.type));
            if (warning && index === 0) {
              const alertText = escapeHtml(row.validationAlerts[0].message);
              content = `${content} <span class="badge badge-warning">${alertText}</span>`;
            }
            const align = col.type === "currency" ? "text-right" : "";
            return `<td class="${align}">${content}</td>`;
          })
          .join("");
        return `<tr class="${rowClass}">${cells}</tr>`;
      });

      body.innerHTML = "";
      body.appendChild(spacerTop);
      sliceRows.forEach((html) => {
        const temp = document.createElement("tbody");
        temp.innerHTML = html;
        body.appendChild(temp.firstElementChild);
      });
      body.appendChild(spacerBottom);
    }

    viewport.addEventListener("scroll", renderSlice, { passive: true });
    container.querySelectorAll("[data-sort-key]").forEach((header) => {
      header.addEventListener("click", () => {
        const key = header.dataset.sortKey;
        let direction = "asc";
        if (sort.key === key && sort.direction === "asc") {
          direction = "desc";
        } else if (sort.key === key && sort.direction === "desc") {
          direction = null;
        }
        onSort?.({ key: direction ? key : null, direction });
      });
    });

    renderSlice();
  }

  window.MoldeTables = {
    COLUMN_SETS,
    getColumnVisibility,
    setColumnVisibility,
    formatCell,
    sortRows,
    exportCsv,
    renderVirtualTable
  };
})();
