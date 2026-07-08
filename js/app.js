const uploadSources = {
  pedidos: {
    title: "Pedidos",
    sampleFileName: "Pedidos_Simplificado.xlsx",
    body: "Base de pedidos, clientes, status, datas e valores.",
    required: true
  },
  contas: {
    title: "Contas a pagar",
    sampleFileName: "PLANILHA CONTAS A PAGAR1.xlsx",
    body: "Base mensal de contas, fornecedores, vencimentos e pagamentos.",
    required: true
  },
  indicadores: {
    title: "Indicadores e metas",
    sampleFileName: "Molde_Momentos_Template_Indicadores.xlsx",
    body: "Catálogo opcional de indicadores e metas gerenciais.",
    required: false
  }
};

const importState = {
  pedidos: { status: "pending", metadata: null, validationReport: null, error: "" },
  contas: { status: "pending", metadata: null, validationReport: null, error: "" },
  indicadores: { status: "optional-empty", metadata: null, validationReport: null, error: "" }
};

const uploadInputAttributes = {
  pedidos: "data-upload-input=\"pedidos\"",
  contas: "data-upload-input=\"contas\"",
  indicadores: "data-upload-input=\"indicadores\""
};

const uploadTriggerAttributes = {
  pedidos: "data-upload-trigger=\"pedidos\"",
  contas: "data-upload-trigger=\"contas\"",
  indicadores: "data-upload-trigger=\"indicadores\""
};

const routes = {
  upload: {
    eyebrow: "Preparação dos dados",
    title: "Upload e validação",
    description: "Carregue as planilhas para preparar os dados do dashboard local.",
    badge: "Ambiente local",
    render: renderUploadPage
  },
  executivo: {
    eyebrow: "Análise executiva",
    title: "Executivo",
    description: "Visão geral do negócio após importação e validação das planilhas.",
    emptyTitle: "Dashboard executivo sem dados",
    emptyBody: "Importe as planilhas para visualizar receita, despesas, resultado e pedidos.",
    icon: "EX"
  },
  financeiro: {
    eyebrow: "Contas a pagar",
    title: "Financeiro",
    description: "Acompanhamento de despesas, vencimentos e pagamentos.",
    emptyTitle: "Financeiro sem contas importadas",
    emptyBody: "As análises de contas a pagar aparecerão após a importação da planilha financeira.",
    icon: "FN"
  },
  pedidos: {
    eyebrow: "Operação comercial",
    title: "Pedidos",
    description: "Acompanhamento de pedidos, clientes, valores e prazos.",
    emptyTitle: "Pedidos sem base importada",
    emptyBody: "Carregue a planilha de pedidos para acompanhar status, valores e prazos.",
    icon: "PD"
  },
  resultado: {
    eyebrow: "Visão integrada",
    title: "Resultado",
    description: "Comparação operacional entre entradas e saídas após validação.",
    emptyTitle: "Resultado integrado indisponível",
    emptyBody: "A comparação entre receita e despesas depende das bases de pedidos e contas.",
    icon: "RS"
  },
  insights: {
    eyebrow: "Alertas",
    title: "Insights",
    description: "Alertas financeiros, comerciais e operacionais a partir das bases validadas.",
    emptyTitle: "Insights aguardando dados",
    emptyBody: "Alertas financeiros, comerciais e operacionais serão gerados depois da validação.",
    icon: "IN"
  },
  "base-dados": {
    eyebrow: "Dados normalizados",
    title: "Base de Dados",
    description: "Tabelas internas limpas para auditoria e exportação.",
    badge: "Dados normalizados",
    emptyTitle: "Base normalizada vazia",
    emptyBody: "As tabelas normalizadas serão exibidas após importação, validação e normalização.",
    icon: "BD",
    render: renderBaseDadosPage
  },
  metas: {
    eyebrow: "Indicadores opcionais",
    title: "Metas",
    description: "Catálogo opcional de indicadores e metas gerenciais.",
    emptyTitle: "Metas sem catálogo importado",
    emptyBody: "Indicadores e metas são opcionais e aparecerão quando a planilha correspondente for carregada.",
    icon: "MT"
  }
};

const routeNames = Object.keys(routes);
const requiredImportKinds = Object.entries(uploadSources)
  .filter(([, source]) => source.required)
  .map(([kind]) => kind);
const pageView = document.querySelector("[data-route-view]");
const pageArea = document.querySelector("#conteudo-principal");
const shell = document.querySelector(".app-shell");
const sidebar = document.querySelector("#sidebar");
const menuToggle = document.querySelector("[data-menu-toggle]");
const sidebarCloseTargets = document.querySelectorAll("[data-sidebar-close]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const topbarImportBadge = document.querySelector(".topbar-actions .badge");
const topbarUploadButton = document.querySelector(".topbar-actions .button-primary");
const topbarSearchInput = document.querySelector("[data-global-search]");
const filterPanel = document.querySelector("[data-filter-panel]");
const filterChips = document.querySelector("[data-filter-chips]");
const filterToggle = document.querySelector("[data-filter-toggle]");
const themeStorageKey = "molde-theme";
const mobileQuery = window.matchMedia("(max-width: 767px)");
const expandedWarningBlocks = new Set();
let shouldFocusPendingUpload = false;
const appState = { dataset: null, restoredFromStore: false };
let filterState = { search: "" };
let baseDadosTab = "pedidos";
const tableSortState = {
  pedidos: { key: null, direction: null },
  contas: { key: null, direction: null },
  indicadores: { key: null, direction: null }
};
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short"
});

function getStoredTheme() {
  try {
    return localStorage.getItem(themeStorageKey);
  } catch {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {
    return null;
  }
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme() {
  const storedTheme = getStoredTheme();
  return storedTheme === "dark" || storedTheme === "light" ? storedTheme : getSystemTheme();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.textContent = isDark ? "Tema claro" : "Tema escuro";
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  setStoredTheme(nextTheme);
}

function getRouteFromHash() {
  const route = window.location.hash.replace("#", "");
  return routeNames.includes(route) ? route : "upload";
}

function ensureValidHash(route) {
  if (window.location.hash !== `#${route}`) {
    window.location.hash = route;
  }
}

function updateActiveLink(route) {
  document.querySelectorAll("[data-route-link]").forEach((link) => {
    if (link.dataset.routeLink === route) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function formatImportedAt(value) {
  if (!value) {
    return "";
  }

  return dateTimeFormatter.format(new Date(value));
}

function pluralizeSheet(count) {
  return count === 1 ? "1 aba" : `${count} abas`;
}

function pluralizeRow(count) {
  return count === 1 ? "1 linha" : `${count} linhas`;
}

function hasDataset() {
  return Boolean(appState.dataset && (appState.dataset.pedidos?.length || appState.dataset.contas?.length || appState.dataset.indicadores?.length));
}

function hydrateImportStateFromMeta(snapshot) {
  if (!snapshot?.importMeta) {
    return;
  }
  Object.keys(uploadSources).forEach((kind) => {
    const meta = snapshot.importMeta[kind];
    if (!meta) {
      return;
    }
    importState[kind] = {
      status: "validated",
      metadata: {
        fileName: meta.fileName,
        importedAt: meta.importedAt,
        sheetNames: meta.sheetNames || [],
        rowCount: meta.rowCount || 0,
        primarySheetName: meta.sheetNames?.[0] || "",
        monthlySheetNames: kind === "contas" ? meta.sheetNames || [] : []
      },
      validationReport: {
        status: meta.validationStatus || "valid",
        summary: { blockerCount: 0, alertCount: 0, warningCount: 0, excludedCount: 0, validRowCount: meta.rowCount || 0 },
        blockers: [],
        alerts: [],
        warnings: []
      },
      error: ""
    };
  });
}

function syncTopbarSearch() {
  if (!topbarSearchInput) {
    return;
  }
  const enabled = hasDataset();
  topbarSearchInput.disabled = !enabled;
  if (enabled) {
    topbarSearchInput.removeAttribute("aria-disabled");
    topbarSearchInput.value = filterState.search || "";
  } else {
    topbarSearchInput.setAttribute("aria-disabled", "true");
    topbarSearchInput.value = "";
  }
}

function renderFilterChips() {
  if (!filterChips || !window.MoldeFilters) {
    return;
  }
  const chips = window.MoldeFilters.getActiveChips(filterState);
  if (!chips.length) {
    filterChips.hidden = true;
    filterChips.innerHTML = "";
    return;
  }
  filterChips.hidden = false;
  filterChips.innerHTML = chips
    .map(
      (chip) => `
        <span class="filter-chip">
          ${escapeHTML(chip.label)}
          <button type="button" class="button button-ghost" data-filter-chip-remove="${chip.id}" aria-label="Remover filtro">×</button>
        </span>
      `
    )
    .join("");
}

function renderFilterPanelContent() {
  if (!filterPanel) {
    return;
  }
  if (!hasDataset()) {
    filterPanel.innerHTML = `<p class="helper-text">Carregue planilhas para filtrar dados.</p>`;
    return;
  }

  const pedidos = appState.dataset?.pedidos || [];
  const contas = appState.dataset?.contas || [];

  const renderMulti = (id, label, values, selected, group) => {
    const options = values
      .map((value) => {
        const isSelected = selected.includes(value);
        return `<option value="${escapeHTML(value)}" ${isSelected ? "selected" : ""}>${escapeHTML(value)}</option>`;
      })
      .join("");
    return `
      <label>
        ${label}
        <select multiple data-filter-multi="${group}:${id}" size="4">${options}</select>
      </label>
    `;
  };

  filterPanel.innerHTML = `
    <div class="filter-panel-grid">
      <label>Ano<input type="number" data-filter-field="year" value="${filterState.year ?? ""}" min="2020" max="2035"></label>
      <label>Mês<input type="number" data-filter-field="month" value="${filterState.month ?? ""}" min="1" max="12"></label>
      <label>Valor mínimo<input type="number" step="0.01" data-filter-field="valueMin" value="${filterState.valueMin ?? ""}"></label>
      <label>Valor máximo<input type="number" step="0.01" data-filter-field="valueMax" value="${filterState.valueMax ?? ""}"></label>
      <fieldset>
        <legend>Pedidos</legend>
        ${renderMulti("situacaoGrupo", "Grupo", window.MoldeFilters.getDistinctValues(pedidos, "situacao_grupo"), filterState.pedidos.situacaoGrupo, "pedidos")}
        ${renderMulti("vendedor", "Vendedor", window.MoldeFilters.getDistinctValues(pedidos, "vendedor"), filterState.pedidos.vendedor, "pedidos")}
        ${renderMulti("cliente", "Cliente", window.MoldeFilters.getDistinctValues(pedidos, "cliente"), filterState.pedidos.cliente, "pedidos")}
      </fieldset>
      <fieldset>
        <legend>Contas</legend>
        ${renderMulti("statusPagamento", "Status", window.MoldeFilters.getDistinctValues(contas, "status_pagamento"), filterState.contas.statusPagamento, "contas")}
        ${renderMulti("fornecedor", "Fornecedor", window.MoldeFilters.getDistinctValues(contas, "fornecedor"), filterState.contas.fornecedor, "contas")}
        ${renderMulti("categoria", "Categoria", window.MoldeFilters.getDistinctValues(contas, "categoria"), filterState.contas.categoria, "contas")}
      </fieldset>
    </div>
    <div class="filter-panel-actions">
      <button class="button button-outline" type="button" data-filter-clear>Limpar filtros</button>
    </div>
  `;
}

function mountBaseDadosTable() {
  const container = document.querySelector("[data-base-table]");
  if (!container || !window.MoldeTables || !window.MoldeFilters || !appState.dataset) {
    return;
  }

  const rows = appState.dataset[baseDadosTab] || [];
  const filtered = window.MoldeFilters.applyFilters(rows, baseDadosTab, filterState);
  const columns = window.MoldeTables.COLUMN_SETS[baseDadosTab].filter((col) =>
    window.MoldeTables.getColumnVisibility(baseDadosTab).includes(col.key)
  );
  const sort = tableSortState[baseDadosTab];
  const sorted = window.MoldeTables.sortRows(filtered, sort.key, sort.direction, columns);
  const countEl = document.querySelector("[data-base-count]");
  if (countEl) {
    countEl.textContent = `${filtered.length} de ${rows.length} registros`;
  }

  window.MoldeTables.renderVirtualTable(container, {
    rows: sorted,
    columns,
    sort,
    onSort: (nextSort) => {
      tableSortState[baseDadosTab] = nextSort;
      mountBaseDadosTable();
    },
    rowClassFn: (row) => (row.validationAlerts?.length ? "data-table-row-warning" : "")
  });
}

function renderBaseDadosPage(route) {
  if (!hasDataset()) {
    return renderEmptyPage(route);
  }

  const tabs = [
    { id: "pedidos", label: "Pedidos" },
    { id: "contas", label: "Contas a pagar" }
  ];
  if (appState.dataset.indicadores?.length) {
    tabs.push({ id: "indicadores", label: "Indicadores" });
  }

  return `
    ${createPageHeader(route)}
    <p class="helper-text filter-active-banner">Filtros globais da topbar afetam esta tabela. Dashboards analíticos chegam na Fase 5.</p>
    <div class="base-dados-tabs" role="tablist" aria-label="Tabelas normalizadas">
      ${tabs
        .map(
          (tab) => `
            <button
              class="base-dados-tab"
              type="button"
              role="tab"
              data-base-tab="${tab.id}"
              aria-selected="${baseDadosTab === tab.id}"
            >
              ${tab.label}
            </button>
          `
        )
        .join("")}
    </div>
    <article class="card">
      <div class="table-toolbar">
        <div>
          <h2>${tabs.find((tab) => tab.id === baseDadosTab)?.label || "Dados"}</h2>
          <p data-base-count>0 registros</p>
        </div>
        <div class="table-toolbar-actions">
          <button class="button button-outline" type="button" data-base-columns>Colunas</button>
          <button class="button button-outline" type="button" data-base-export>Exportar</button>
        </div>
      </div>
      <div data-base-table></div>
    </article>
  `;
}

function getValidationStatus(kind) {
  return importState[kind]?.validationReport?.status || null;
}

function canContinueToDashboards() {
  return requiredImportKinds.every((kind) => {
    const status = getValidationStatus(kind);
    return status === "valid" || status === "valid_with_warnings";
  });
}

function getValidationCardBadge(kind) {
  const state = importState[kind];
  if (state.status === "validating") {
    return { text: "Validando...", className: "badge-warning" };
  }
  if (state.status === "validated" && state.validationReport) {
    if (state.validationReport.status === "valid") {
      return { text: "Válido", className: "badge-success" };
    }
    if (state.validationReport.status === "valid_with_warnings") {
      return { text: "Importado com alertas", className: "badge-warning" };
    }
    return { text: "Bloqueado", className: "badge-danger" };
  }
  return null;
}

function createPageHeader(route) {
  return `
    <header class="page-header">
      <div>
        <span class="eyebrow">${route.eyebrow}</span>
        <h1>${route.title}</h1>
        <p>${route.description}</p>
      </div>
      <span class="badge badge-neutral">${route.badge || "Sem dados importados"}</span>
    </header>
  `;
}

function renderEmptyPage(route) {
  return `
    ${createPageHeader(route)}
    <section class="empty-state" aria-labelledby="empty-title">
      <div class="empty-state-inner">
        <span class="empty-state-icon" aria-hidden="true">${route.icon}</span>
        <h2 id="empty-title">${route.emptyTitle}</h2>
        <p>${route.emptyBody}</p>
        <button class="button button-outline" type="button" data-empty-upload-trigger>Selecionar planilha</button>
        <span class="helper-text">Disponível na página de Upload</span>
      </div>
    </section>
  `;
}

function renderFindingItem(finding, severityLabel, severityClass) {
  return `
    <li class="validation-finding ${severityClass}">
      <span class="validation-finding-label">${severityLabel}</span>
      <strong>Linha ${finding.excelRow} · ${escapeHTML(finding.businessId)}</strong>
      <span>${escapeHTML(finding.message)}</span>
    </li>
  `;
}

function renderFindingsGroup(kind, groupId, findings, options) {
  if (!findings.length) {
    return "";
  }

  const groupKey = `${kind}:${groupId}`;
  const isExpanded = expandedWarningBlocks.has(groupKey);
  const visible = isExpanded ? findings : findings.slice(0, 5);

  return `
    <div class="validation-findings ${options.groupClass}">
      <h4>${options.title} (${findings.length})</h4>
      <ul>
        ${visible.map((finding) => renderFindingItem(finding, options.label, options.itemClass)).join("")}
      </ul>
      ${findings.length > 5 ? `
        <button
          class="button button-outline validation-expand"
          type="button"
          data-validation-expand="${groupKey}"
          aria-expanded="${isExpanded}"
        >
          ${isExpanded ? "Recolher" : `Ver todos (${findings.length})`}
        </button>
      ` : ""}
    </div>
  `;
}

function renderValidationBlock(kind) {
  const source = uploadSources[kind];
  const state = importState[kind];

  if (kind === "indicadores" && state.status === "optional-empty") {
    return "";
  }

  if (!state.validationReport && state.status !== "reading" && state.status !== "validating") {
    return `
      <article class="validation-block" data-validation-block="${kind}">
        <div class="validation-block-heading">
          <h3>${source.title}</h3>
          <span class="badge badge-neutral">Aguardando</span>
        </div>
        <p class="helper-text">${source.required ? "Aguardando planilha obrigatória." : "Opcional não carregado."}</p>
      </article>
    `;
  }

  if (state.status === "reading" || state.status === "validating") {
    return `
      <article class="validation-block" data-validation-block="${kind}">
        <div class="validation-block-heading">
          <h3>${source.title}</h3>
          <span class="badge badge-warning">Validando...</span>
        </div>
        <p class="helper-text">Validação em andamento.</p>
      </article>
    `;
  }

  const report = state.validationReport;
  if (!report) {
    return "";
  }

  const blockBadge = report.status === "valid"
    ? { text: "Válida", className: "badge-success" }
    : report.status === "valid_with_warnings"
      ? { text: "Importada com alertas", className: "badge-warning" }
      : { text: "Bloqueada", className: "badge-danger" };

  return `
    <article class="validation-block" data-validation-block="${kind}">
      <div class="validation-block-heading">
        <h3>${source.title}</h3>
        <span class="badge ${blockBadge.className}">${blockBadge.text}</span>
      </div>
      <div class="validation-summary">
        ${report.summary.blockerCount ? `<span><strong>${report.summary.blockerCount}</strong> erros estruturais</span>` : ""}
        <span><strong>${report.summary.alertCount}</strong> alertas</span>
        <span><strong>${report.summary.warningCount}</strong> avisos</span>
        <span><strong>${report.summary.validRowCount}</strong> linhas importadas</span>
      </div>
      ${renderFindingsGroup(kind, "blockers", report.blockers, {
        title: "Erros estruturais",
        label: "Estrutural",
        groupClass: "validation-findings--critical",
        itemClass: "validation-finding--critical"
      })}
      ${renderFindingsGroup(kind, "alerts", report.alerts, {
        title: "Alertas",
        label: "Alerta",
        groupClass: "validation-findings--warnings",
        itemClass: "validation-finding--warning"
      })}
      ${renderFindingsGroup(kind, "warnings", report.warnings, {
        title: "Avisos",
        label: "Aviso",
        groupClass: "validation-findings--info",
        itemClass: "validation-finding--info"
      })}
      ${report.status === "invalid" ? `
        <button class="button button-outline" type="button" data-fix-upload="${kind}">Corrigir planilha</button>
      ` : ""}
    </article>
  `;
}

function renderValidationPanel() {
  const blocks = Object.keys(uploadSources)
    .map((kind) => renderValidationBlock(kind))
    .filter(Boolean)
    .join("");

  if (!blocks) {
    return "";
  }

  return `
    <section class="validation-panel" aria-live="polite">
      <h2>Resultado da validação</h2>
      <div class="validation-panel-grid">${blocks}</div>
    </section>
  `;
}

function renderDashboardCta() {
  const enabled = canContinueToDashboards();
  return `
    <div class="validation-cta">
      <button
        class="button button-primary"
        type="button"
        data-continue-dashboards
        ${enabled ? "" : "disabled aria-disabled=\"true\""}
      >
        Continuar para dashboards
      </button>
      <p class="helper-text validation-cta-helper" ${enabled ? "hidden" : ""}>
        Corrija os erros estruturais em Pedidos e Contas para continuar. Alertas e avisos não bloqueiam.
      </p>
    </div>
  `;
}

function renderUploadPage(route) {
  return `
    ${createPageHeader(route)}
    <div class="upload-grid" aria-label="Planilhas esperadas">
      ${Object.keys(uploadSources).map(createUploadCard).join("")}
    </div>
    ${renderValidationPanel()}
    ${renderDashboardCta()}
    <section class="content-grid">
      <article class="card readiness-card">
        <span class="badge badge-success">Pronto para abrir</span>
        <h2>Sistema local e estático</h2>
        <p>Esta fundação roda direto no navegador, sem backend, login, banco remoto ou dependência de internet em tempo de execução.</p>
      </article>
      <article class="card">
        <div class="table-toolbar">
          <div>
            <h2>Prévia da base normalizada</h2>
            <p>As tabelas reais aparecerão após importação, validação e normalização.</p>
          </div>
          <button class="button button-outline" type="button" disabled aria-disabled="true">Exportar</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Origem</th>
                <th scope="col">Estado</th>
                <th scope="col">Próxima etapa</th>
              </tr>
            </thead>
            <tbody>
              ${Object.keys(uploadSources).map(createPreviewRow).join("")}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  `;
}

function createUploadCard(kind) {
  const source = uploadSources[kind];
  const view = getUploadCardView(kind);

  return `
    <article class="upload-card ${view.cardClass}" data-upload-card="${kind}" tabindex="-1">
      <div class="card-heading">
        <span class="badge ${view.badgeClass}">${view.badgeText}</span>
        <h2>${source.title}</h2>
      </div>
      <p class="file-name">${escapeHTML(view.fileName)}</p>
      <p>${source.body}</p>
      ${view.metadataHTML}
      ${view.errorHTML}
      <div class="status-region" aria-live="polite">${view.statusText}</div>
      <input class="file-input" id="upload-${kind}" type="file" accept=".xlsx,.xls" ${uploadInputAttributes[kind]}>
      <button class="button button-outline" type="button" ${uploadTriggerAttributes[kind]} ${view.disabledAttribute}>
        ${view.buttonText}
      </button>
      <span class="helper-text">${view.helperText}</span>
    </article>
  `;
}

function createPreviewRow(kind) {
  const source = uploadSources[kind];
  const view = getUploadCardView(kind);

  return `
    <tr>
      <td>${source.title}</td>
      <td><span class="badge ${view.badgeClass}">${view.badgeText}</span></td>
      <td>${view.previewText}</td>
    </tr>
  `;
}

function getUploadCardView(kind) {
  const source = uploadSources[kind];
  const state = importState[kind];
  const metadata = state.metadata;
  const isReading = state.status === "reading";
  const isValidating = state.status === "validating";
  const isValidated = state.status === "validated";
  const isError = state.status === "error";
  const validationBadge = getValidationCardBadge(kind);
  const initialBadge = source.required ? "Obrigatório" : "Opcional não carregado";

  if (isValidated && metadata && validationBadge) {
    const report = state.validationReport;
    return {
      badgeText: validationBadge.text,
      badgeClass: validationBadge.className,
      buttonText: "Substituir planilha",
      helperText: report?.status === "invalid"
        ? "Corrija os erros estruturais e substitua a planilha."
        : "Importação concluída para esta fonte.",
      fileName: metadata.fileName,
      metadataHTML: createMetadataHTML(metadata),
      errorHTML: "",
      statusText: report?.status === "invalid" ? "Planilha bloqueada." : "Planilha importada.",
      previewText: report?.status === "invalid"
        ? `${report?.summary.blockerCount || 0} erros estruturais`
        : `${report?.summary.alertCount || 0} alertas, ${report?.summary.warningCount || 0} avisos`,
      cardClass: report?.status === "invalid" ? "upload-card-highlight" : "",
      disabledAttribute: ""
    };
  }

  if (isValidating && metadata) {
    return {
      badgeText: "Validando...",
      badgeClass: "badge-warning",
      buttonText: "Validando...",
      helperText: "Validação automática em andamento.",
      fileName: metadata.fileName,
      metadataHTML: createMetadataHTML(metadata),
      errorHTML: "",
      statusText: "Validando...",
      previewText: "Validação em andamento",
      cardClass: "upload-card-highlight",
      disabledAttribute: "disabled aria-disabled=\"true\""
    };
  }

  if (isReading) {
    return {
      badgeText: "Lendo arquivo",
      badgeClass: "badge-warning",
      buttonText: "Lendo arquivo...",
      helperText: "Aguarde a leitura local do workbook.",
      fileName: source.sampleFileName,
      metadataHTML: "",
      errorHTML: "",
      statusText: "Lendo arquivo...",
      previewText: "Leitura em andamento",
      cardClass: "upload-card-highlight",
      disabledAttribute: "disabled aria-disabled=\"true\""
    };
  }

  if (isError) {
    return {
      badgeText: "Erro de leitura",
      badgeClass: "badge-danger",
      buttonText: "Selecionar novamente",
      helperText: source.required ? "Obrigatório" : "Indicadores continuam opcionais.",
      fileName: source.sampleFileName,
      metadataHTML: "",
      errorHTML: `<p class="upload-card-error">${escapeHTML(state.error)}</p>`,
      statusText: state.error,
      previewText: "Erro isolado neste card",
      cardClass: "upload-card-highlight",
      disabledAttribute: ""
    };
  }

  return {
    badgeText: initialBadge,
    badgeClass: source.required ? "badge-neutral" : "badge-info",
    buttonText: "Selecionar planilha",
    helperText: source.required ? "Obrigatório" : "Opcional não carregado",
    fileName: source.sampleFileName,
    metadataHTML: "",
    errorHTML: "",
    statusText: source.required ? "Aguardando seleção." : "Opcional não carregado.",
    previewText: source.required ? "Aguardando importação" : "Opcional",
    cardClass: "",
    disabledAttribute: ""
  };
}

function createMetadataHTML(metadata) {
  const monthlyText = metadata.monthlySheetNames.length
    ? `<li>Abas mensais: ${metadata.monthlySheetNames.map(escapeHTML).join(", ")}</li>`
    : "";

  return `
    <ul class="upload-card-meta">
      <li>Arquivo: ${escapeHTML(metadata.fileName)}</li>
      <li>Aba principal: ${escapeHTML(metadata.primarySheetName || "Não identificada")}</li>
      <li>${pluralizeSheet(metadata.sheetNames.length)} no workbook</li>
      <li>${pluralizeRow(metadata.rowCount)} na aba principal</li>
      <li>Importado em ${formatImportedAt(metadata.importedAt)}</li>
      ${monthlyText}
    </ul>
  `;
}

async function handleUploadSelection(kind, file) {
  if (!uploadSources[kind]) {
    return;
  }

  setImportStatus(kind, "reading");

  try {
    const { workbook, metadata } = await window.MoldeImporter.readWorkbookBuffer(file, kind);
    setImportStatus(kind, "validating", { metadata });
    const validationReport = window.MoldeValidation.validateWorkbook(workbook, kind);

    if (validationReport.status === "valid" || validationReport.status === "valid_with_warnings") {
      const { rows } = window.MoldeNormalizers.normalizeWorkbook(workbook, kind, validationReport);
      appState.dataset = await window.MoldeStore.upsertSource(kind, rows, metadata, validationReport);
    }

    setImportStatus(kind, "validated", { metadata, validationReport });
    syncTopbarSearch();
    renderFilterPanelContent();
    renderFilterChips();
  } catch (error) {
    setImportStatus(kind, "error", {
      error: error instanceof Error ? error.message : "Não foi possível ler a planilha."
    });
  }
}

function setImportStatus(kind, status, payload = {}) {
  const previousMetadata = importState[kind].metadata;

  importState[kind] = {
    status,
    metadata: payload.metadata || (status === "reading" || status === "validating" ? previousMetadata : null),
    validationReport: payload.validationReport ?? (status === "reading" ? null : importState[kind].validationReport),
    error: payload.error || ""
  };

  if (status === "reading") {
    importState[kind].validationReport = null;
  }

  renderCurrentRoute({ preserveFocus: true });
  updateTopbarImportStatus();
  updateDashboardCta();
}

function getRequiredImportCount() {
  return requiredImportKinds.filter((kind) => importState[kind].status === "validated").length;
}

function updateTopbarImportStatus() {
  const readCount = getRequiredImportCount();
  const canContinue = canContinueToDashboards();
  let statusText = "Sem dados importados";
  let badgeClass = "badge-info";

  if (readCount === 1) {
    statusText = "1 de 2 obrigatórias validada";
  } else if (readCount === 2) {
    statusText = canContinue ? "Bases validadas" : "Validação pendente";
    badgeClass = canContinue ? "badge-success" : "badge-warning";
  }

  if (topbarImportBadge) {
    topbarImportBadge.textContent = statusText;
    topbarImportBadge.className = `badge ${badgeClass}`;
  }

  if (topbarUploadButton) {
    topbarUploadButton.disabled = false;
    topbarUploadButton.removeAttribute("aria-disabled");
    topbarUploadButton.textContent = readCount === requiredImportKinds.length ? "Revisar importação" : "Selecionar planilha";
  }
}

function updateDashboardCta() {
  const button = document.querySelector("[data-continue-dashboards]");
  const helper = document.querySelector(".validation-cta-helper");
  if (!button) {
    return;
  }

  const enabled = canContinueToDashboards();
  button.disabled = !enabled;
  if (enabled) {
    button.removeAttribute("aria-disabled");
    if (helper) {
      helper.hidden = true;
    }
  } else {
    button.setAttribute("aria-disabled", "true");
    if (helper) {
      helper.hidden = false;
    }
  }
}

function focusFirstPendingUploadCard() {
  if (getRouteFromHash() !== "upload") {
    shouldFocusPendingUpload = true;
    window.location.hash = "upload";
    return;
  }

  const pendingKind = requiredImportKinds.find((kind) => importState[kind].status !== "validated") || "pedidos";
  const card = document.querySelector(`[data-upload-card="${pendingKind}"]`);
  card?.focus({ preventScroll: true });
  card?.scrollIntoView({ behavior: "smooth", block: "center" });
  card?.classList.add("upload-card-highlight");
}

function attachGlobalInteractions() {
  filterToggle?.addEventListener("click", () => {
    const open = shell.dataset.filterOpen === "true";
    shell.dataset.filterOpen = String(!open);
    filterToggle.setAttribute("aria-expanded", String(!open));
    filterPanel.hidden = open;
    if (!open) {
      renderFilterPanelContent();
    }
  });

  filterPanel?.addEventListener("change", (event) => {
    const multi = event.target.closest("[data-filter-multi]");
    if (multi) {
      const [group, field] = multi.dataset.filterMulti.split(":");
      filterState[group][field] = Array.from(multi.selectedOptions).map((option) => option.value);
      onFilterStateChanged();
      return;
    }
    const field = event.target.closest("[data-filter-field]");
    if (field) {
      const key = field.dataset.filterField;
      const value = field.value === "" ? null : field.type === "number" ? Number(field.value) : field.value;
      filterState[key] = value;
      onFilterStateChanged();
    }
  });

  filterPanel?.addEventListener("click", (event) => {
    if (event.target.closest("[data-filter-clear]")) {
      filterState = window.MoldeFilters.clearAll();
      onFilterStateChanged();
      renderFilterPanelContent();
    }
  });

  filterChips?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-chip-remove]");
    if (!button) {
      return;
    }
    const chip = window.MoldeFilters.getActiveChips(filterState).find((item) => item.id === button.dataset.filterChipRemove);
    if (chip?.path?.[0]) {
      filterState[chip.path[0]] = chip.path[0] === "search" ? "" : null;
      onFilterStateChanged();
      renderFilterPanelContent();
    }
  });

  topbarSearchInput?.addEventListener("input", (event) => {
    filterState.search = event.target.value;
    onFilterStateChanged();
    renderFilterChips();
  });
}

function onFilterStateChanged() {
  renderFilterChips();
  syncTopbarSearch();
  if (getRouteFromHash() === "base-dados") {
    mountBaseDadosTable();
  }
}

function attachRouteInteractions() {
  document.querySelectorAll("[data-upload-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const input = document.querySelector(`[data-upload-input="${trigger.dataset.uploadTrigger}"]`);
      input?.click();
    });
  });

  document.querySelectorAll("[data-upload-input]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      handleUploadSelection(event.target.dataset.uploadInput, file);
      event.target.value = "";
    });
  });

  document.querySelectorAll("[data-empty-upload-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      window.location.hash = "upload";
    });
  });

  document.querySelectorAll("[data-fix-upload]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const input = document.querySelector(`[data-upload-input="${trigger.dataset.fixUpload}"]`);
      input?.click();
    });
  });

  document.querySelectorAll("[data-validation-expand]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const groupKey = trigger.dataset.validationExpand;
      if (expandedWarningBlocks.has(groupKey)) {
        expandedWarningBlocks.delete(groupKey);
      } else {
        expandedWarningBlocks.add(groupKey);
      }
      renderCurrentRoute({ preserveFocus: true });
    });
  });

  document.querySelector("[data-continue-dashboards]")?.addEventListener("click", () => {
    if (canContinueToDashboards()) {
      window.location.hash = "executivo";
    }
  });

  document.querySelectorAll("[data-base-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      baseDadosTab = tab.dataset.baseTab;
      renderCurrentRoute({ preserveFocus: true });
    });
  });

  document.querySelector("[data-base-export]")?.addEventListener("click", () => {
    if (!appState.dataset || !window.MoldeTables || !window.MoldeFilters) {
      return;
    }
    const rows = window.MoldeFilters.applyFilters(appState.dataset[baseDadosTab] || [], baseDadosTab, filterState);
    const columns = window.MoldeTables.COLUMN_SETS[baseDadosTab].filter((col) =>
      window.MoldeTables.getColumnVisibility(baseDadosTab).includes(col.key)
    );
    const date = new Date().toISOString().slice(0, 10);
    window.MoldeTables.exportCsv(rows, columns, `molde-${baseDadosTab}-${date}.csv`);
  });

  document.querySelector("[data-base-columns]")?.addEventListener("click", () => {
    const all = window.MoldeTables.COLUMN_SETS[baseDadosTab];
    const visible = new Set(window.MoldeTables.getColumnVisibility(baseDadosTab));
    const next = all.filter((col) => !visible.has(col.key)).map((col) => col.key);
    if (!next.length) {
      window.MoldeTables.setColumnVisibility(
        baseDadosTab,
        all.filter((col) => col.defaultVisible).map((col) => col.key)
      );
    } else {
      window.MoldeTables.setColumnVisibility(baseDadosTab, [...visible, ...next.slice(0, 2)]);
    }
    mountBaseDadosTable();
  });
}

function closeMobileSidebar() {
  shell.dataset.sidebarOpen = "false";
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  syncSidebarAccessibility();
}

function toggleMobileSidebar() {
  const isOpen = shell.dataset.sidebarOpen === "true";
  shell.dataset.sidebarOpen = String(!isOpen);
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  syncSidebarAccessibility();
}

function syncSidebarAccessibility() {
  const isMobileClosed = mobileQuery.matches && shell.dataset.sidebarOpen !== "true";
  sidebar.toggleAttribute("inert", isMobileClosed);
  sidebar.setAttribute("aria-hidden", String(isMobileClosed));
}

function renderCurrentRoute(options = {}) {
  const routeName = getRouteFromHash();
  const route = routes[routeName];
  ensureValidHash(routeName);
  updateActiveLink(routeName);
  pageView.innerHTML = route.render ? route.render(route) : renderEmptyPage(route);
  attachRouteInteractions();
  document.title = `${route.title} - Molde Momentos Dashboard Local`;
  closeMobileSidebar();

  if (shouldFocusPendingUpload && routeName === "upload") {
    shouldFocusPendingUpload = false;
    focusFirstPendingUploadCard();
    return;
  }

  if (!options.preserveFocus) {
    pageArea.focus({ preventScroll: true });
  }

  updateDashboardCta();
  syncTopbarSearch();
  renderFilterChips();

  if (routeName === "base-dados" && hasDataset()) {
    mountBaseDadosTable();
  }
}

function renderRoute() {
  renderCurrentRoute();
}

async function bootstrap() {
  applyTheme(getInitialTheme());
  syncSidebarAccessibility();
  attachGlobalInteractions();

  if (window.MoldeFilters) {
    filterState = window.MoldeFilters.createDefaultState();
  }

  if (window.MoldeStore) {
    try {
      const snapshot = await window.MoldeStore.loadDataset();
      if (snapshot) {
        appState.dataset = snapshot;
        appState.restoredFromStore = true;
        hydrateImportStateFromMeta(snapshot);
        const currentHash = window.location.hash.replace("#", "");
        if (!currentHash || currentHash === "upload") {
          window.location.hash = "executivo";
        }
      }
    } catch {
      appState.dataset = null;
    }
  }

  renderRoute();
  updateTopbarImportStatus();
  updateDashboardCta();
  syncTopbarSearch();
  renderFilterPanelContent();
  renderFilterChips();
}

bootstrap();

window.addEventListener("hashchange", renderRoute);
mobileQuery.addEventListener("change", syncSidebarAccessibility);

menuToggle.addEventListener("click", toggleMobileSidebar);
themeToggle.addEventListener("click", toggleTheme);
topbarUploadButton?.addEventListener("click", focusFirstPendingUploadCard);
sidebarCloseTargets.forEach((target) => target.addEventListener("click", closeMobileSidebar));

document.querySelectorAll("[data-route-link]").forEach((link) => {
  link.addEventListener("click", closeMobileSidebar);
});
