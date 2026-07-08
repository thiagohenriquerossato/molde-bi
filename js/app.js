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
    icon: "EX",
    render: renderExecutivoPage
  },
  financeiro: {
    eyebrow: "Contas a pagar",
    title: "Financeiro",
    description: "Acompanhamento de despesas, vencimentos e pagamentos.",
    emptyTitle: "Financeiro sem contas importadas",
    emptyBody: "As análises de contas a pagar aparecerão após a importação da planilha financeira.",
    icon: "FN",
    render: renderFinanceiroPage
  },
  pedidos: {
    eyebrow: "Operação comercial",
    title: "Pedidos",
    description: "Acompanhamento de pedidos, clientes, valores e prazos.",
    emptyTitle: "Pedidos sem base importada",
    emptyBody: "Carregue a planilha de pedidos para acompanhar status, valores e prazos.",
    icon: "PD",
    render: renderPedidosPage
  },
  clientes: {
    eyebrow: "Relacionamento comercial",
    title: "Clientes e Vendedores",
    description: "Rankings, recorrência e pendências por cliente e vendedor.",
    emptyTitle: "Clientes sem base de pedidos",
    emptyBody: "Carregue a planilha de pedidos para analisar clientes e vendedores.",
    icon: "CL",
    render: renderClientesPage
  },
  producao: {
    eyebrow: "Operação e prazos",
    title: "Produção e Prazo",
    description: "Funil operacional, aging e prazos extraídos dos pedidos.",
    emptyTitle: "Produção sem base de pedidos",
    emptyBody: "Carregue a planilha de pedidos para acompanhar prazos e status operacionais.",
    icon: "PR",
    render: renderProducaoPage
  },
  resultado: {
    eyebrow: "Visão integrada",
    title: "Resultado",
    description: "Comparação operacional entre entradas e saídas após validação.",
    emptyTitle: "Resultado integrado indisponível",
    emptyBody: "A comparação entre receita e despesas depende das bases de pedidos e contas.",
    icon: "RS",
    render: renderResultadoPage
  },
  insights: {
    eyebrow: "Alertas",
    title: "Insights",
    description: "Alertas financeiros, comerciais e operacionais a partir das bases validadas.",
    emptyTitle: "Insights aguardando dados",
    emptyBody: "Alertas financeiros, comerciais e operacionais serão gerados depois da validação.",
    icon: "IN",
    render: renderInsightsPage
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
    icon: "MT",
    render: renderMetasPage
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
let executiveChartInstances = [];
let financeChartInstances = [];
let pedidosChartInstances = [];
let resultadoChartInstances = [];
let clientesChartInstances = [];
let producaoChartInstances = [];
let executiveResizeTimer = null;
const expandedInsightAlerts = new Set();
const ANALYTICAL_ROUTES = ["executivo", "financeiro", "pedidos", "clientes", "producao", "resultado", "insights", "metas"];
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
  if (getRouteFromHash() === "executivo" && canContinueToDashboards()) {
    mountExecutivoDashboard();
  }
  if (getRouteFromHash() === "financeiro" && hasContasData()) {
    mountFinanceiroDashboard();
  }
  if (getRouteFromHash() === "pedidos" && hasPedidosData()) {
    mountPedidosDashboard();
  }
  if (getRouteFromHash() === "resultado" && canContinueToDashboards()) {
    mountResultadoDashboard();
  }
  if (getRouteFromHash() === "insights" && canContinueToDashboards()) {
    mountInsightsDashboard();
  }
  if (getRouteFromHash() === "clientes" && hasPedidosData()) {
    mountClientesDashboard();
  }
  if (getRouteFromHash() === "producao" && hasPedidosData()) {
    mountProducaoDashboard();
  }
  if (getRouteFromHash() === "metas" && hasIndicadoresData()) {
    mountMetasDashboard();
  }
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

function getFilterSummaryText(selected) {
  if (!selected.length) {
    return "Todos";
  }
  if (selected.length === 1) {
    return selected[0];
  }
  return `${selected.length} selecionados`;
}

function renderFilterDropdown(group, field, label, values, selected) {
  const options = values
    .map((value) => {
      const checked = selected.includes(value) ? "checked" : "";
      return `
        <label class="filter-dropdown-option">
          <input type="checkbox" data-filter-check="${group}:${field}" value="${escapeHTML(value)}" ${checked}>
          <span>${escapeHTML(value)}</span>
        </label>
      `;
    })
    .join("");
  const hasSelection = selected.length > 0;

  return `
    <div class="filter-field">
      <span class="filter-field-label">${label}</span>
      <div class="filter-dropdown" data-filter-dropdown="${group}:${field}">
        <button type="button" class="filter-dropdown-toggle ${hasSelection ? "is-active" : ""}" data-filter-dropdown-toggle aria-haspopup="true" aria-expanded="false">
          <span class="filter-dropdown-summary">${escapeHTML(getFilterSummaryText(selected))}</span>
          <span class="filter-dropdown-caret" aria-hidden="true">▾</span>
        </button>
        <div class="filter-dropdown-menu" hidden>
          <input type="search" class="filter-dropdown-search" data-filter-dropdown-search placeholder="Buscar ${escapeHTML(label.toLowerCase())}...">
          <div class="filter-dropdown-options">
            ${options || `<p class="filter-dropdown-empty">Sem valores</p>`}
          </div>
        </div>
      </div>
    </div>
  `;
}

function closeAllFilterDropdowns() {
  if (!filterPanel) {
    return;
  }
  filterPanel.querySelectorAll(".filter-dropdown-menu").forEach((menu) => {
    menu.hidden = true;
  });
  filterPanel.querySelectorAll("[data-filter-dropdown-toggle]").forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "false");
  });
}

function updateFilterDropdownSummary(checkbox) {
  const dropdown = checkbox.closest("[data-filter-dropdown]");
  if (!dropdown) {
    return;
  }
  const [group, field] = dropdown.dataset.filterDropdown.split(":");
  const selected = filterState[group]?.[field] || [];
  const summaryEl = dropdown.querySelector(".filter-dropdown-summary");
  const toggle = dropdown.querySelector(".filter-dropdown-toggle");
  if (summaryEl) {
    summaryEl.textContent = getFilterSummaryText(selected);
  }
  if (toggle) {
    toggle.classList.toggle("is-active", selected.length > 0);
  }
}

function renderPeriodFilterFields() {
  return `
    <label>Ano<input type="number" data-filter-field="year" value="${filterState.year ?? ""}" min="2020" max="2035"></label>
    <label>Mês<input type="number" data-filter-field="month" value="${filterState.month ?? ""}" min="1" max="12"></label>
    <label>Valor mínimo<input type="number" step="0.01" data-filter-field="valueMin" value="${filterState.valueMin ?? ""}"></label>
    <label>Valor máximo<input type="number" step="0.01" data-filter-field="valueMax" value="${filterState.valueMax ?? ""}"></label>
  `;
}

function renderContaToggle(flag, label) {
  const checked = filterState.contas[flag] ? "checked" : "";
  return `
    <label class="filter-toggle">
      <input type="checkbox" data-filter-toggle-flag="${flag}" ${checked}>
      <span>${escapeHTML(label)}</span>
    </label>
  `;
}

function renderPedidoToggle(flag, label) {
  const checked = filterState.pedidos[flag] ? "checked" : "";
  return `
    <label class="filter-toggle">
      <input type="checkbox" data-filter-pedido-toggle="${flag}" ${checked}>
      <span>${escapeHTML(label)}</span>
    </label>
  `;
}

function renderContaFilters(contas) {
  const distinct = (field) => window.MoldeFilters.getDistinctValues(contas, field);
  const pagoValue = filterState.contas.pago === true ? "true" : filterState.contas.pago === false ? "false" : "";
  return `
    <div class="filter-panel-grid">
      ${renderPeriodFilterFields()}
      <fieldset>
        <legend>Contas</legend>
        ${renderFilterDropdown("contas", "statusPagamento", "Status", distinct("status_pagamento"), filterState.contas.statusPagamento)}
        ${renderFilterDropdown("contas", "fornecedor", "Fornecedor", distinct("fornecedor"), filterState.contas.fornecedor)}
        ${renderFilterDropdown("contas", "classificacao", "Classificação", distinct("classificacao"), filterState.contas.classificacao)}
        ${renderFilterDropdown("contas", "categoria", "Categoria", distinct("categoria"), filterState.contas.categoria)}
        ${renderFilterDropdown("contas", "conta", "Conta", distinct("conta"), filterState.contas.conta)}
        ${renderFilterDropdown("contas", "parcela", "Parcela", distinct("parcela"), filterState.contas.parcela)}
        <label class="filter-field-label" for="filter-conta-pago">Pagamento</label>
        <select id="filter-conta-pago" data-filter-conta-select="pago">
          <option value="" ${pagoValue === "" ? "selected" : ""}>Todos</option>
          <option value="true" ${pagoValue === "true" ? "selected" : ""}>Pago</option>
          <option value="false" ${pagoValue === "false" ? "selected" : ""}>Não pago</option>
        </select>
      </fieldset>
      <fieldset>
        <legend>Situação de vencimento</legend>
        <div class="filter-toggle-grid">
          ${renderContaToggle("vencido", "Vencido")}
          ${renderContaToggle("venceHoje", "Vence hoje")}
          ${renderContaToggle("vence7", "Próximos 7 dias")}
          ${renderContaToggle("vence30", "Próximos 30 dias")}
          ${renderContaToggle("semValor", "Sem valor")}
          ${renderContaToggle("semClassificacao", "Sem classificação")}
          ${renderContaToggle("semConta", "Sem conta")}
        </div>
      </fieldset>
    </div>
    <div class="filter-panel-actions">
      <button class="button button-outline" type="button" data-filter-clear>Limpar filtros</button>
    </div>
  `;
}

function renderExecutivoFilters(pedidos, contas) {
  return `
    <div class="filter-panel-grid">
      ${renderPeriodFilterFields()}
      <fieldset>
        <legend>Pedidos</legend>
        ${renderFilterDropdown("pedidos", "situacaoGrupo", "Grupo", window.MoldeFilters.getDistinctValues(pedidos, "situacao_grupo"), filterState.pedidos.situacaoGrupo)}
        ${renderFilterDropdown("pedidos", "vendedor", "Vendedor", window.MoldeFilters.getDistinctValues(pedidos, "vendedor"), filterState.pedidos.vendedor)}
        ${renderFilterDropdown("pedidos", "cliente", "Cliente", window.MoldeFilters.getDistinctValues(pedidos, "cliente"), filterState.pedidos.cliente)}
      </fieldset>
      <fieldset>
        <legend>Contas</legend>
        ${renderFilterDropdown("contas", "statusPagamento", "Status", window.MoldeFilters.getDistinctValues(contas, "status_pagamento"), filterState.contas.statusPagamento)}
        ${renderFilterDropdown("contas", "fornecedor", "Fornecedor", window.MoldeFilters.getDistinctValues(contas, "fornecedor"), filterState.contas.fornecedor)}
        ${renderFilterDropdown("contas", "categoria", "Categoria", window.MoldeFilters.getDistinctValues(contas, "categoria"), filterState.contas.categoria)}
      </fieldset>
    </div>
    <div class="filter-panel-actions">
      <button class="button button-outline" type="button" data-filter-clear>Limpar filtros</button>
    </div>
  `;
}

function renderPedidoFilters(pedidos) {
  const distinct = (field) => window.MoldeFilters.getDistinctValues(pedidos, field);
  return `
    <div class="filter-panel-grid">
      ${renderPeriodFilterFields()}
      <fieldset>
        <legend>Pedidos</legend>
        ${renderFilterDropdown("pedidos", "situacao", "Situação", distinct("situacao_original"), filterState.pedidos.situacao)}
        ${renderFilterDropdown("pedidos", "situacaoGrupo", "Grupo", distinct("situacao_grupo"), filterState.pedidos.situacaoGrupo)}
        ${renderFilterDropdown("pedidos", "vendedor", "Vendedor", distinct("vendedor"), filterState.pedidos.vendedor)}
        ${renderFilterDropdown("pedidos", "cliente", "Cliente", distinct("cliente"), filterState.pedidos.cliente)}
        ${renderFilterDropdown("pedidos", "formaEntrada", "Pagamento entrada", distinct("forma_pagamento_entrada"), filterState.pedidos.formaEntrada)}
        ${renderFilterDropdown("pedidos", "formaSaldo", "Pagamento saldo", distinct("forma_pagamento_saldo"), filterState.pedidos.formaSaldo)}
      </fieldset>
      <fieldset>
        <legend>Condições</legend>
        <div class="filter-toggle-grid">
          ${renderPedidoToggle("comPendente", "Com valor pendente")}
          ${renderPedidoToggle("semCliente", "Sem cliente")}
          ${renderPedidoToggle("semDataPrevista", "Sem data prevista")}
          ${renderPedidoToggle("entregueNoPrazo", "Entregue no prazo")}
          ${renderPedidoToggle("atrasado", "Atrasado")}
          ${renderPedidoToggle("cancelado", "Cancelado")}
          ${renderPedidoToggle("aguardandoAprovacao", "Aguardando aprovação")}
        </div>
      </fieldset>
    </div>
    <div class="filter-panel-actions">
      <button class="button button-outline" type="button" data-filter-clear>Limpar filtros</button>
    </div>
  `;
}

function renderResultadoFilters(pedidos, contas) {
  const pedidoDistinct = (field) => window.MoldeFilters.getDistinctValues(pedidos, field);
  const contaDistinct = (field) => window.MoldeFilters.getDistinctValues(contas, field);
  const receitaBase = filterState.resultado?.receitaBase || "cadastro";
  const pagoValue = filterState.contas.pago === true ? "true" : filterState.contas.pago === false ? "false" : "";
  return `
    <div class="filter-panel-grid">
      ${renderPeriodFilterFields()}
      <fieldset>
        <legend>Competência</legend>
        <label>Base da receita
          <select data-filter-resultado-base>
            <option value="cadastro" ${receitaBase === "cadastro" ? "selected" : ""}>Cadastro</option>
            <option value="entrega" ${receitaBase === "entrega" ? "selected" : ""}>Entrega</option>
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>Pedidos</legend>
        ${renderFilterDropdown("pedidos", "situacao", "Situação", pedidoDistinct("situacao_original"), filterState.pedidos.situacao)}
        ${renderFilterDropdown("pedidos", "situacaoGrupo", "Grupo", pedidoDistinct("situacao_grupo"), filterState.pedidos.situacaoGrupo)}
        ${renderFilterDropdown("pedidos", "vendedor", "Vendedor", pedidoDistinct("vendedor"), filterState.pedidos.vendedor)}
        ${renderFilterDropdown("pedidos", "cliente", "Cliente", pedidoDistinct("cliente"), filterState.pedidos.cliente)}
        ${renderFilterDropdown("pedidos", "formaEntrada", "Pagamento entrada", pedidoDistinct("forma_pagamento_entrada"), filterState.pedidos.formaEntrada)}
        ${renderFilterDropdown("pedidos", "formaSaldo", "Pagamento saldo", pedidoDistinct("forma_pagamento_saldo"), filterState.pedidos.formaSaldo)}
      </fieldset>
      <fieldset>
        <legend>Contas</legend>
        ${renderFilterDropdown("contas", "statusPagamento", "Status", contaDistinct("status_pagamento"), filterState.contas.statusPagamento)}
        ${renderFilterDropdown("contas", "fornecedor", "Fornecedor", contaDistinct("fornecedor"), filterState.contas.fornecedor)}
        ${renderFilterDropdown("contas", "classificacao", "Classificação", contaDistinct("classificacao"), filterState.contas.classificacao)}
        ${renderFilterDropdown("contas", "categoria", "Categoria", contaDistinct("categoria"), filterState.contas.categoria)}
        ${renderFilterDropdown("contas", "conta", "Conta", contaDistinct("conta"), filterState.contas.conta)}
        ${renderFilterDropdown("contas", "parcela", "Parcela", contaDistinct("parcela"), filterState.contas.parcela)}
        <label>Pago
          <select data-filter-conta-select="pago">
            <option value="" ${pagoValue === "" ? "selected" : ""}>Todos</option>
            <option value="true" ${pagoValue === "true" ? "selected" : ""}>Sim</option>
            <option value="false" ${pagoValue === "false" ? "selected" : ""}>Não</option>
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>Condições pedidos</legend>
        <div class="filter-toggle-grid">
          ${renderPedidoToggle("comPendente", "Com valor pendente")}
          ${renderPedidoToggle("semCliente", "Sem cliente")}
          ${renderPedidoToggle("semDataPrevista", "Sem data prevista")}
          ${renderPedidoToggle("entregueNoPrazo", "Entregue no prazo")}
          ${renderPedidoToggle("atrasado", "Atrasado")}
          ${renderPedidoToggle("cancelado", "Cancelado")}
          ${renderPedidoToggle("aguardandoAprovacao", "Aguardando aprovação")}
        </div>
      </fieldset>
      <fieldset>
        <legend>Condições contas</legend>
        <div class="filter-toggle-grid">
          ${renderContaToggle("vencido", "Vencido")}
          ${renderContaToggle("venceHoje", "Vence hoje")}
          ${renderContaToggle("vence7", "Vence em 7 dias")}
          ${renderContaToggle("vence30", "Vence em 30 dias")}
          ${renderContaToggle("semValor", "Sem valor")}
          ${renderContaToggle("semClassificacao", "Sem classificação")}
          ${renderContaToggle("semConta", "Sem conta")}
        </div>
      </fieldset>
    </div>
    <div class="filter-panel-actions">
      <button class="button button-outline" type="button" data-filter-clear>Limpar filtros</button>
    </div>
  `;
}

function renderInsightsFilters(pedidos, contas) {
  return renderResultadoFilters(pedidos, contas);
}

function renderClienteFilters(pedidos) {
  return renderPedidoFilters(pedidos);
}

function renderProducaoFilters(pedidos) {
  return renderPedidoFilters(pedidos);
}

function renderFilterPanelContent(route = getRouteFromHash()) {
  if (!filterPanel) {
    return;
  }
  if (!hasDataset()) {
    filterPanel.innerHTML = `<p class="helper-text">Carregue planilhas para filtrar dados.</p>`;
    return;
  }

  const pedidos = appState.dataset?.pedidos || [];
  const contas = appState.dataset?.contas || [];

  if (route === "financeiro") {
    filterPanel.innerHTML = renderContaFilters(contas);
    return;
  }

  if (route === "pedidos") {
    filterPanel.innerHTML = renderPedidoFilters(pedidos);
    return;
  }

  if (route === "clientes" || route === "producao") {
    filterPanel.innerHTML = renderClienteFilters(pedidos);
    return;
  }

  if (route === "resultado") {
    filterPanel.innerHTML = renderResultadoFilters(pedidos, contas);
    return;
  }

  if (route === "insights") {
    filterPanel.innerHTML = renderInsightsFilters(pedidos, contas);
    return;
  }

  filterPanel.innerHTML = renderExecutivoFilters(pedidos, contas);
}

function isAnalyticalRoute(route) {
  return ANALYTICAL_ROUTES.includes(route);
}

function updateFilterVisibility(route) {
  const analytical = isAnalyticalRoute(route);
  if (filterToggle) {
    filterToggle.hidden = !analytical;
  }
  if (analytical) {
    renderFilterPanelContent(route);
    return;
  }
  if (filterPanel) {
    filterPanel.hidden = true;
  }
  if (shell) {
    shell.dataset.filterOpen = "false";
  }
  filterToggle?.setAttribute("aria-expanded", "false");
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

function renderMetricCard(label, options = {}) {
  const classes = ["metric-card", options.warning ? "metric-card--warning" : ""].filter(Boolean).join(" ");
  const badge = options.badge ? `<span class="metric-card-badge">${escapeHTML(options.badge)}</span>` : "";
  const valueClass = ["metric-card-value", options.valueClass || ""].filter(Boolean).join(" ");
  let subtitle = "";
  if (options.subtitle || options.subtitleKey) {
    const subtitleAttr = options.subtitleKey ? ` data-metric-subtitle="${options.subtitleKey}"` : "";
    subtitle = `<span class="metric-card-subtitle"${subtitleAttr}>${escapeHTML(options.subtitle || "—")}</span>`;
  }
  return `
    <article class="${classes}">
      <p class="metric-card-label">${escapeHTML(label)}</p>
      ${badge}
      <p class="${valueClass}" data-metric="${options.key || ""}">—</p>
      ${subtitle}
    </article>
  `;
}

function hasContasData() {
  return Boolean(appState.dataset && appState.dataset.contas?.length);
}

function hasPedidosData() {
  return Boolean(appState.dataset && appState.dataset.pedidos?.length);
}

function hasIndicadoresData() {
  return Boolean(appState.dataset && appState.dataset.indicadores?.length);
}

function renderMetricBlock(title, cardsHtml, options = {}) {
  const blockClass = options.pipeline ? "metric-block metric-block--pipeline" : "metric-block";
  return `
    <section class="${blockClass}">
      <h2 class="metric-block-title">${escapeHTML(title)}</h2>
      <div class="metric-grid">${cardsHtml}</div>
    </section>
  `;
}

function renderExecutivoPage(route) {
  if (!canContinueToDashboards()) {
    return renderEmptyPage(route);
  }

  const receitaCards = [
    renderMetricCard("Receita ativa", { key: "receitaAtiva" }),
    renderMetricCard("Valor recebido", { key: "valorRecebido" }),
    renderMetricCard("Valor pendente", { key: "valorPendente" })
  ].join("");

  const despesaCards = [
    renderMetricCard("Despesas totais", { key: "despesasTotais" }),
    renderMetricCard("Despesas pagas", { key: "despesasPagas" }),
    renderMetricCard("Despesas em aberto", { key: "despesasAbertas" }),
    renderMetricCard("Contas vencidas", { key: "contasVencidas" })
  ].join("");

  const resultadoCards = [
    renderMetricCard("Resultado competência", { key: "resultadoCompetencia" }),
    renderMetricCard("Ticket médio", { key: "ticketMedio" }),
    renderMetricCard("Pedidos totais", { key: "pedidosTotais" }),
    renderMetricCard("Pedidos entregues", { key: "pedidosEntregues" })
  ].join("");

  const pipelineCard = renderMetricCard("Aguardando Aprovação", {
    key: "pipelineValor",
    warning: true,
    badge: "Não contabilizado na receita",
    subtitle: "0 pedidos"
  });

  const chartPanels = [
    { id: "revenue-expense-result", title: "Receita, despesa e resultado por mês" },
    { id: "received-pending", title: "Recebido e pendente por mês" },
    { id: "fixed-variable", title: "Despesas fixas e variáveis por mês" },
    { id: "orders-status", title: "Pedidos por situação" },
    { id: "top-classification", title: "Top 10 despesas por classificação" },
    { id: "top-vendors", title: "Top vendedores por receita" }
  ]
    .map(
      (panel) => `
        <article class="chart-panel">
          <h3 class="chart-panel-title">${escapeHTML(panel.title)}</h3>
          <div class="chart-canvas" data-chart="${panel.id}" role="img" aria-label="${escapeHTML(panel.title)}"></div>
        </article>
      `
    )
    .join("");

  return `
    <header class="page-header">
      <div>
        <span class="eyebrow">${route.eyebrow}</span>
        <h1>${route.title}</h1>
        <p>${route.description}</p>
      </div>
      <span class="badge badge-success">Dados carregados</span>
    </header>
    ${renderMetricBlock("Receita", receitaCards)}
    ${renderMetricBlock("Despesas", despesaCards)}
    ${renderMetricBlock("Resultado e pedidos", resultadoCards)}
    ${renderMetricBlock("Aguardando Aprovação", pipelineCard, { pipeline: true })}
    <section class="executive-charts-grid" aria-label="Gráficos executivos">
      ${chartPanels}
    </section>
    <section class="executive-exceptions" aria-label="Contas em atenção">
      <article class="card">
        <h3 class="chart-panel-title">Contas vencidas</h3>
        <div data-exception="overdue"></div>
      </article>
      <article class="card">
        <h3 class="chart-panel-title">Próximos 7 dias</h3>
        <div data-exception="upcoming"></div>
      </article>
    </section>
  `;
}

function disposeExecutiveCharts() {
  if (window.MoldeCharts && executiveChartInstances.length) {
    window.MoldeCharts.disposeExecutiveCharts(executiveChartInstances);
  }
  executiveChartInstances = [];
}

function mountExecutivoDashboard() {
  if (getRouteFromHash() !== "executivo" || !canContinueToDashboards() || !window.MoldeMetrics || !appState.dataset) {
    return;
  }

  const pedidos = window.MoldeFilters.applyFilters(appState.dataset.pedidos || [], "pedidos", filterState);
  const contas = window.MoldeFilters.applyFilters(appState.dataset.contas || [], "contas", filterState);
  const kpis = window.MoldeMetrics.computeExecutiveKpis(pedidos, contas);
  const format = window.MoldeMetrics.formatCurrency;

  const metricMap = {
    receitaAtiva: format(kpis.receitaAtiva),
    valorRecebido: format(kpis.valorRecebido),
    valorPendente: format(kpis.valorPendente),
    despesasTotais: format(kpis.despesasTotais),
    despesasPagas: format(kpis.despesasPagas),
    despesasAbertas: format(kpis.despesasAbertas),
    contasVencidas: format(kpis.contasVencidas),
    resultadoCompetencia: format(kpis.resultadoCompetencia),
    ticketMedio: format(kpis.ticketMedio),
    pedidosTotais: String(kpis.pedidosTotais),
    pedidosEntregues: String(kpis.pedidosEntregues),
    pipelineValor: format(kpis.pipelineValor)
  };

  document.querySelectorAll("[data-metric]").forEach((element) => {
    const key = element.dataset.metric;
    if (metricMap[key] !== undefined) {
      element.textContent = metricMap[key];
    }
  });

  const pipelineSubtitle = document.querySelector(".metric-card--warning .metric-card-subtitle");
  if (pipelineSubtitle) {
    pipelineSubtitle.textContent = `${kpis.pipelineCount} pedido${kpis.pipelineCount === 1 ? "" : "s"}`;
  }

  disposeExecutiveCharts();

  if (window.MoldeCharts && window.echarts) {
    const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const containers = {
      revenueExpenseResult: document.querySelector('[data-chart="revenue-expense-result"]'),
      receivedPending: document.querySelector('[data-chart="received-pending"]'),
      fixedVariable: document.querySelector('[data-chart="fixed-variable"]'),
      ordersStatus: document.querySelector('[data-chart="orders-status"]'),
      topClassification: document.querySelector('[data-chart="top-classification"]'),
      topVendors: document.querySelector('[data-chart="top-vendors"]')
    };
    executiveChartInstances = window.MoldeCharts.renderExecutiveCharts(containers, pedidos, contas, theme);
  }

  mountExecutiveExceptionTable(
    '[data-exception="overdue"]',
    window.MoldeMetrics.getOverdueContasAll(contas),
    "Nenhuma conta vencida no recorte atual."
  );
  mountExecutiveExceptionTable(
    '[data-exception="upcoming"]',
    window.MoldeMetrics.getUpcomingContasAll(contas),
    "Nenhum vencimento nos próximos 7 dias."
  );
}

function mountExecutiveExceptionTable(selector, rows, emptyMessage) {
  const container = document.querySelector(selector);
  if (!container) {
    return;
  }
  if (!rows.length) {
    container.innerHTML = `<p class="executive-exception-empty">${escapeHTML(emptyMessage)}</p>`;
    return;
  }
  window.MoldeTables.renderVirtualTable(container, {
    rows,
    columns: FINANCE_TABLE_COLUMNS.base
  });
}

function scheduleExecutiveChartResize() {
  if (executiveResizeTimer) {
    clearTimeout(executiveResizeTimer);
  }
  executiveResizeTimer = setTimeout(() => {
    const route = getRouteFromHash();
    const instances =
      route === "executivo"
        ? executiveChartInstances
        : route === "financeiro"
          ? financeChartInstances
          : route === "pedidos"
            ? pedidosChartInstances
            : route === "resultado"
              ? resultadoChartInstances
              : [];
    instances.forEach((instance) => {
      if (instance && typeof instance.resize === "function") {
        instance.resize();
      }
    });
  }, 150);
}

const FINANCE_TABLE_COLUMNS = {
  base: [
    { key: "fornecedor", label: "Fornecedor", type: "text", getValue: (r) => r.fornecedor },
    { key: "data_vencimento", label: "Vencimento", type: "date", getValue: (r) => r.data_vencimento },
    { key: "valor", label: "Valor", type: "currency", getValue: (r) => r.valor },
    { key: "status_pagamento", label: "Status", type: "badge", getValue: (r) => r.status_pagamento }
  ],
  overdue: [
    { key: "fornecedor", label: "Fornecedor", type: "text", getValue: (r) => r.fornecedor },
    { key: "data_vencimento", label: "Vencimento", type: "date", getValue: (r) => r.data_vencimento },
    { key: "valor", label: "Valor", type: "currency", getValue: (r) => r.valor },
    { key: "dias_atraso", label: "Dias atraso", type: "text", getValue: (r) => r.dias_atraso },
    { key: "status_pagamento", label: "Status", type: "badge", getValue: (r) => r.status_pagamento }
  ],
  future: [
    { key: "fornecedor", label: "Fornecedor", type: "text", getValue: (r) => r.fornecedor },
    { key: "mes_vencimento", label: "Mês", type: "text", getValue: (r) => r.mes_vencimento },
    { key: "data_vencimento", label: "Vencimento", type: "date", getValue: (r) => r.data_vencimento },
    { key: "valor", label: "Valor", type: "currency", getValue: (r) => r.valor },
    { key: "status_pagamento", label: "Status", type: "badge", getValue: (r) => r.status_pagamento }
  ]
};

const FINANCE_KPI_BLOCKS = [
  {
    title: "Posição",
    cards: [
      { label: "Total de contas", key: "totalContas" },
      { label: "Total pago", key: "totalPago" },
      { label: "Total aberto", key: "totalAberto" },
      { label: "Total vencido", key: "totalVencido" }
    ]
  },
  {
    title: "Vencimentos",
    cards: [
      { label: "Vence hoje", key: "venceHoje" },
      { label: "Vence em 7 dias", key: "vence7" },
      { label: "Vence em 30 dias", key: "vence30" }
    ]
  },
  {
    title: "Análise",
    cards: [
      { label: "Média mensal de despesas", key: "mediaMensalDespesas" },
      { label: "Maior fornecedor do mês", key: "maiorFornecedorNome", valueClass: "metric-card-value--name", subtitleKey: "maiorFornecedorValor" },
      { label: "Maior classificação do mês", key: "maiorClassificacaoNome", valueClass: "metric-card-value--name", subtitleKey: "maiorClassificacaoValor" },
      { label: "% despesas fixas", key: "percentualFixas" },
      { label: "% despesas variáveis", key: "percentualVariaveis" }
    ]
  }
];

const FINANCE_CHART_PANELS = [
  { id: "expenses-month", title: "Despesas por mês" },
  { id: "paid-open-month", title: "Pago × aberto por mês" },
  { id: "expenses-category", title: "Despesas por categoria" },
  { id: "expenses-classification", title: "Despesas por classificação" },
  { id: "top-suppliers", title: "Top fornecedores" },
  { id: "due-heatmap", title: "Calendário de vencimentos", wide: true },
  { id: "supplier-abc", title: "Curva ABC de fornecedores", wide: true },
  { id: "fixed-evolution", title: "Evolução das despesas fixas" },
  { id: "variable-evolution", title: "Evolução das despesas variáveis" },
  { id: "bank-account", title: "Saídas por conta bancária" }
];

const FINANCE_TABLES = [
  { id: "overdue", title: "Contas vencidas", columns: "overdue", empty: "Nenhuma conta vencida no recorte atual." },
  { id: "upcoming", title: "Próximos 7 dias", columns: "base", empty: "Nenhum vencimento nos próximos 7 dias." },
  { id: "no-value", title: "Contas sem valor", columns: "base", empty: "Nenhuma conta sem valor no recorte atual." },
  { id: "no-class", title: "Contas sem classificação", columns: "base", empty: "Nenhuma conta sem classificação no recorte atual." },
  { id: "paid-no-date", title: "Pagas sem data de pagamento", columns: "base", empty: "Nenhuma conta paga sem data de pagamento." },
  { id: "future", title: "Lançamentos futuros por mês", columns: "future", empty: "Nenhum lançamento futuro no recorte atual." }
];

const PEDIDOS_TABLE_COLUMNS = {
  base: [
    { key: "pedido_id", label: "Pedido", type: "text", getValue: (r) => r.pedido_id },
    { key: "cliente", label: "Cliente", type: "text", getValue: (r) => r.cliente },
    { key: "vendedor", label: "Vendedor", type: "text", getValue: (r) => r.vendedor },
    { key: "situacao_grupo", label: "Situação", type: "badge", getValue: (r) => r.situacao_grupo },
    { key: "valor_final", label: "Valor final", type: "currency", getValue: (r) => r.valor_final },
    { key: "valor_pendente", label: "Pendente", type: "currency", getValue: (r) => r.valor_pendente },
    { key: "status_financeiro", label: "Financeiro", type: "badge", getValue: (r) => r.status_financeiro }
  ],
  overdue: [
    { key: "pedido_id", label: "Pedido", type: "text", getValue: (r) => r.pedido_id },
    { key: "cliente", label: "Cliente", type: "text", getValue: (r) => r.cliente },
    { key: "vendedor", label: "Vendedor", type: "text", getValue: (r) => r.vendedor },
    { key: "dias_atraso", label: "Dias atraso", type: "text", getValue: (r) => r.dias_atraso },
    { key: "data_prevista", label: "Previsão", type: "date", getValue: (r) => r.data_prevista },
    { key: "valor_final", label: "Valor final", type: "currency", getValue: (r) => r.valor_final },
    { key: "valor_pendente", label: "Pendente", type: "currency", getValue: (r) => r.valor_pendente }
  ],
  pipeline: [
    { key: "pedido_id", label: "Pedido", type: "text", getValue: (r) => r.pedido_id },
    { key: "cliente", label: "Cliente", type: "text", getValue: (r) => r.cliente },
    { key: "vendedor", label: "Vendedor", type: "text", getValue: (r) => r.vendedor },
    { key: "data_cadastro", label: "Cadastro", type: "date", getValue: (r) => r.data_cadastro },
    { key: "valor_final", label: "Valor final", type: "currency", getValue: (r) => r.valor_final },
    { key: "situacao_grupo", label: "Situação", type: "badge", getValue: (r) => r.situacao_grupo }
  ],
  discount: [
    { key: "pedido_id", label: "Pedido", type: "text", getValue: (r) => r.pedido_id },
    { key: "cliente", label: "Cliente", type: "text", getValue: (r) => r.cliente },
    { key: "vendedor", label: "Vendedor", type: "text", getValue: (r) => r.vendedor },
    { key: "valor_bruto", label: "Bruto", type: "currency", getValue: (r) => r.valor_bruto },
    { key: "valor_desconto", label: "Desconto", type: "currency", getValue: (r) => r.valor_desconto },
    {
      key: "pct_desconto",
      label: "% desconto",
      type: "text",
      getValue: (r) => (r.valor_bruto > 0 ? `${((r.valor_desconto || 0) / r.valor_bruto * 100).toFixed(1).replace(".", ",")}%` : "—")
    }
  ]
};

const PEDIDOS_KPI_BLOCKS = [
  {
    title: "Valores",
    cards: [
      { label: "Valor bruto", key: "valorBruto" },
      { label: "Descontos", key: "descontos" },
      { label: "Valor final", key: "valorFinal" },
      { label: "Valor pago", key: "valorPago" },
      { label: "Valor pendente", key: "valorPendente" },
      { label: "Ticket médio", key: "ticketMedio" }
    ]
  },
  {
    title: "Status",
    cards: [
      { label: "Total de pedidos", key: "totalPedidos" },
      { label: "Pedidos entregues", key: "pedidosEntregues" },
      { label: "Pedidos cancelados", key: "pedidosCancelados" },
      { label: "Pedidos ativos", key: "pedidosAtivos" }
    ]
  },
  {
    title: "Aguardando Aprovação",
    pipeline: true,
    cards: [
      {
        label: "Pedidos aguardando aprovação",
        key: "pipelineCount",
        subtitleKey: "pipelineValor",
        badge: "Não contabilizado na receita",
        warning: true
      }
    ]
  },
  {
    title: "Prazos",
    cards: [
      { label: "Desconto médio", key: "descontoMedio" },
      { label: "Tempo médio de produção", key: "tempoMedioProducao" },
      { label: "Atraso médio", key: "atrasoMedio" },
      { label: "% entregue no prazo", key: "percentualEntregueNoPrazo" }
    ]
  }
];

const PEDIDOS_CHART_PANELS = [
  { id: "revenue-month", title: "Receita por mês" },
  { id: "orders-month", title: "Pedidos por mês" },
  { id: "ticket-month", title: "Ticket médio por mês" },
  { id: "orders-status", title: "Pedidos por situação" },
  { id: "revenue-vendor", title: "Receita por vendedor" },
  { id: "orders-vendor", title: "Pedidos por vendedor" },
  { id: "pending-status", title: "Valor pendente por status" },
  { id: "discount-month", title: "Desconto por mês" },
  { id: "top-clients", title: "Top clientes por valor" },
  { id: "on-time-delivery", title: "Entregues no prazo × atrasados" },
  { id: "production-time-month", title: "Tempo médio de produção por mês" },
  { id: "ticket-distribution", title: "Distribuição de ticket" }
];

const PEDIDOS_TABLES = [
  { id: "overdue", title: "Pedidos atrasados", columns: "overdue", empty: "Nenhum pedido atrasado no recorte atual." },
  { id: "delivered-pending", title: "Entregues com valor pendente", columns: "base", empty: "Nenhum pedido entregue com pendência." },
  { id: "no-client", title: "Sem cliente", columns: "base", empty: "Nenhum pedido sem cliente no recorte atual." },
  { id: "no-forecast", title: "Sem data prevista", columns: "base", empty: "Nenhum pedido sem data prevista." },
  { id: "high-discount", title: "Desconto alto", columns: "discount", empty: "Nenhum pedido com desconto alto no recorte atual." },
  { id: "pipeline", title: "Aguardando Aprovação", columns: "pipeline", empty: "Nenhum pedido em aprovação no recorte atual." }
];

function renderFinanceiroPage(route) {
  if (!hasContasData()) {
    return renderEmptyPage(route);
  }

  const kpiBlocks = FINANCE_KPI_BLOCKS.map((block) => {
    const cards = block.cards
      .map((card) => renderMetricCard(card.label, {
        key: card.key,
        valueClass: card.valueClass,
        subtitleKey: card.subtitleKey
      }))
      .join("");
    return renderMetricBlock(block.title, cards);
  }).join("");

  const chartPanels = FINANCE_CHART_PANELS
    .map(
      (panel) => `
        <article class="chart-panel ${panel.wide ? "chart-panel--wide" : ""}">
          <h3 class="chart-panel-title">${escapeHTML(panel.title)}</h3>
          <div class="chart-canvas" data-chart="${panel.id}" role="img" aria-label="${escapeHTML(panel.title)}"></div>
        </article>
      `
    )
    .join("");

  const tables = FINANCE_TABLES
    .map(
      (table) => `
        <article class="card">
          <h3 class="chart-panel-title">${escapeHTML(table.title)}</h3>
          <div data-fin-table="${table.id}"></div>
        </article>
      `
    )
    .join("");

  return `
    <header class="page-header">
      <div>
        <span class="eyebrow">${route.eyebrow}</span>
        <h1>${route.title}</h1>
        <p>${route.description}</p>
      </div>
      <span class="badge badge-success">Dados carregados</span>
    </header>
    ${kpiBlocks}
    <section class="finance-charts-grid" aria-label="Gráficos financeiros">
      ${chartPanels}
    </section>
    <section class="finance-tables-grid" aria-label="Tabelas de exceção financeiras">
      ${tables}
    </section>
  `;
}

function disposeFinanceCharts() {
  if (window.MoldeCharts && financeChartInstances.length) {
    window.MoldeCharts.disposeFinanceCharts(financeChartInstances);
  }
  financeChartInstances = [];
}

function mountFinanceTable(id, rows, columnsKey, emptyMessage) {
  const container = document.querySelector(`[data-fin-table="${id}"]`);
  if (!container) {
    return;
  }
  if (!rows.length) {
    container.innerHTML = `<p class="executive-exception-empty">${escapeHTML(emptyMessage)}</p>`;
    return;
  }
  window.MoldeTables.renderVirtualTable(container, {
    rows,
    columns: FINANCE_TABLE_COLUMNS[columnsKey]
  });
}

function mountFinanceiroDashboard() {
  if (getRouteFromHash() !== "financeiro" || !hasContasData() || !window.MoldeMetrics || !appState.dataset) {
    return;
  }

  const contas = window.MoldeFilters.applyFilters(appState.dataset.contas || [], "contas", filterState);
  const metrics = window.MoldeMetrics;
  const kpis = metrics.computeFinanceKpis(contas);
  const format = metrics.formatCurrency;
  const percent = metrics.formatPercent;

  const metricMap = {
    totalContas: format(kpis.totalContas),
    totalPago: format(kpis.totalPago),
    totalAberto: format(kpis.totalAberto),
    totalVencido: format(kpis.totalVencido),
    venceHoje: format(kpis.venceHoje),
    vence7: format(kpis.vence7),
    vence30: format(kpis.vence30),
    mediaMensalDespesas: format(kpis.mediaMensalDespesas),
    maiorFornecedorNome: kpis.maiorFornecedor.nome,
    maiorClassificacaoNome: kpis.maiorClassificacao.nome,
    percentualFixas: percent(kpis.percentualFixas),
    percentualVariaveis: percent(kpis.percentualVariaveis)
  };
  const subtitleMap = {
    maiorFornecedorValor: format(kpis.maiorFornecedor.valor),
    maiorClassificacaoValor: format(kpis.maiorClassificacao.valor)
  };

  document.querySelectorAll("[data-metric]").forEach((element) => {
    const key = element.dataset.metric;
    if (metricMap[key] !== undefined) {
      element.textContent = metricMap[key];
      if (key === "maiorFornecedorNome" || key === "maiorClassificacaoNome") {
        element.title = metricMap[key];
      }
    }
  });
  document.querySelectorAll("[data-metric-subtitle]").forEach((element) => {
    const key = element.dataset.metricSubtitle;
    if (subtitleMap[key] !== undefined) {
      element.textContent = subtitleMap[key];
    }
  });

  disposeFinanceCharts();
  if (window.MoldeCharts && window.echarts) {
    const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const containers = {
      expensesMonth: document.querySelector('[data-chart="expenses-month"]'),
      paidOpenMonth: document.querySelector('[data-chart="paid-open-month"]'),
      expensesCategory: document.querySelector('[data-chart="expenses-category"]'),
      expensesClassification: document.querySelector('[data-chart="expenses-classification"]'),
      topSuppliers: document.querySelector('[data-chart="top-suppliers"]'),
      dueHeatmap: document.querySelector('[data-chart="due-heatmap"]'),
      supplierAbc: document.querySelector('[data-chart="supplier-abc"]'),
      fixedEvolution: document.querySelector('[data-chart="fixed-evolution"]'),
      variableEvolution: document.querySelector('[data-chart="variable-evolution"]'),
      bankAccount: document.querySelector('[data-chart="bank-account"]')
    };
    financeChartInstances = window.MoldeCharts.renderFinanceCharts(containers, contas, theme);
  }

  mountFinanceTable("overdue", metrics.getOverdueContasAll(contas), "overdue", FINANCE_TABLES[0].empty);
  mountFinanceTable("upcoming", metrics.getUpcomingContasAll(contas), "base", FINANCE_TABLES[1].empty);
  mountFinanceTable("no-value", metrics.getContasSemValor(contas), "base", FINANCE_TABLES[2].empty);
  mountFinanceTable("no-class", metrics.getContasSemClassificacao(contas), "base", FINANCE_TABLES[3].empty);
  mountFinanceTable("paid-no-date", metrics.getContasPagasSemData(contas), "base", FINANCE_TABLES[4].empty);
  mountFinanceTable("future", metrics.getContasFuturas(contas), "future", FINANCE_TABLES[5].empty);
}

function renderPedidosPage(route) {
  if (!hasPedidosData()) {
    return renderEmptyPage(route);
  }

  const kpiBlocks = PEDIDOS_KPI_BLOCKS.map((block) => {
    const cards = block.cards
      .map((card) =>
        renderMetricCard(card.label, {
          key: card.key,
          subtitleKey: card.subtitleKey,
          badge: card.badge,
          warning: card.warning
        })
      )
      .join("");
    return renderMetricBlock(block.title, cards, { pipeline: Boolean(block.pipeline) });
  }).join("");

  const chartPanels = PEDIDOS_CHART_PANELS.map(
    (panel) => `
      <article class="chart-panel">
        <h3 class="chart-panel-title">${escapeHTML(panel.title)}</h3>
        <div class="chart-canvas" data-chart="${panel.id}" role="img" aria-label="${escapeHTML(panel.title)}"></div>
      </article>
    `
  ).join("");

  const tables = PEDIDOS_TABLES.map(
    (table) => `
      <article class="card">
        <h3 class="chart-panel-title">${escapeHTML(table.title)}</h3>
        <div data-ped-table="${table.id}"></div>
      </article>
    `
  ).join("");

  return `
    <header class="page-header">
      <div>
        <span class="eyebrow">${route.eyebrow}</span>
        <h1>${route.title}</h1>
        <p>${route.description}</p>
      </div>
      <span class="badge badge-success">Dados carregados</span>
    </header>
    ${kpiBlocks}
    <section class="pedidos-charts-grid" aria-label="Gráficos de pedidos">
      ${chartPanels}
    </section>
    <section class="pedidos-tables-grid" aria-label="Tabelas de exceção de pedidos">
      ${tables}
    </section>
  `;
}

function disposePedidosCharts() {
  if (window.MoldeCharts && pedidosChartInstances.length) {
    window.MoldeCharts.disposePedidosCharts(pedidosChartInstances);
  }
  pedidosChartInstances = [];
}

function mountPedidosTable(id, rows, columnsKey, emptyMessage) {
  const container = document.querySelector(`[data-ped-table="${id}"]`);
  if (!container) {
    return;
  }
  if (!rows.length) {
    container.innerHTML = `<p class="executive-exception-empty">${escapeHTML(emptyMessage)}</p>`;
    return;
  }
  window.MoldeTables.renderVirtualTable(container, {
    rows,
    columns: PEDIDOS_TABLE_COLUMNS[columnsKey]
  });
}

function mountPedidosDashboard() {
  if (getRouteFromHash() !== "pedidos" || !hasPedidosData() || !window.MoldeMetrics || !appState.dataset) {
    return;
  }

  const pedidos = window.MoldeFilters.applyFilters(appState.dataset.pedidos || [], "pedidos", filterState);
  const metrics = window.MoldeMetrics;
  const kpis = metrics.computePedidosKpis(pedidos);
  const format = metrics.formatCurrency;
  const percent = metrics.formatPercent;

  const metricMap = {
    valorBruto: format(kpis.valorBruto),
    descontos: format(kpis.descontos),
    valorFinal: format(kpis.valorFinal),
    valorPago: format(kpis.valorPago),
    valorPendente: format(kpis.valorPendente),
    ticketMedio: format(kpis.ticketMedio),
    totalPedidos: String(kpis.totalPedidos),
    pedidosEntregues: String(kpis.pedidosEntregues),
    pedidosCancelados: String(kpis.pedidosCancelados),
    pedidosAtivos: String(kpis.pedidosAtivos),
    pipelineCount: String(kpis.pipelineCount),
    descontoMedio: percent(kpis.descontoMedio),
    tempoMedioProducao: Number.isFinite(kpis.tempoMedioProducao) ? `${kpis.tempoMedioProducao.toFixed(1).replace(".", ",")} dias` : "—",
    atrasoMedio: Number.isFinite(kpis.atrasoMedio) ? `${kpis.atrasoMedio.toFixed(1).replace(".", ",")} dias` : "—",
    percentualEntregueNoPrazo: percent(kpis.percentualEntregueNoPrazo)
  };
  const subtitleMap = {
    pipelineValor: format(kpis.pipelineValor)
  };

  document.querySelectorAll("[data-metric]").forEach((element) => {
    const key = element.dataset.metric;
    if (metricMap[key] !== undefined) {
      element.textContent = metricMap[key];
    }
  });
  document.querySelectorAll("[data-metric-subtitle]").forEach((element) => {
    const key = element.dataset.metricSubtitle;
    if (subtitleMap[key] !== undefined) {
      element.textContent = subtitleMap[key];
    }
  });

  disposePedidosCharts();
  if (window.MoldeCharts && window.echarts) {
    const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const containers = {
      revenueMonth: document.querySelector('[data-chart="revenue-month"]'),
      ordersMonth: document.querySelector('[data-chart="orders-month"]'),
      ticketMonth: document.querySelector('[data-chart="ticket-month"]'),
      ordersStatus: document.querySelector('[data-chart="orders-status"]'),
      revenueVendor: document.querySelector('[data-chart="revenue-vendor"]'),
      ordersVendor: document.querySelector('[data-chart="orders-vendor"]'),
      pendingStatus: document.querySelector('[data-chart="pending-status"]'),
      discountMonth: document.querySelector('[data-chart="discount-month"]'),
      topClients: document.querySelector('[data-chart="top-clients"]'),
      onTimeDelivery: document.querySelector('[data-chart="on-time-delivery"]'),
      productionTimeMonth: document.querySelector('[data-chart="production-time-month"]'),
      ticketDistribution: document.querySelector('[data-chart="ticket-distribution"]')
    };
    pedidosChartInstances = window.MoldeCharts.renderPedidosCharts(containers, pedidos, theme);
  }

  mountPedidosTable("overdue", metrics.getPedidosAtrasados(pedidos), "overdue", PEDIDOS_TABLES[0].empty);
  mountPedidosTable("delivered-pending", metrics.getPedidosEntreguesComPendencia(pedidos), "base", PEDIDOS_TABLES[1].empty);
  mountPedidosTable("no-client", metrics.getPedidosSemCliente(pedidos), "base", PEDIDOS_TABLES[2].empty);
  mountPedidosTable("no-forecast", metrics.getPedidosSemDataPrevista(pedidos), "base", PEDIDOS_TABLES[3].empty);
  mountPedidosTable("high-discount", metrics.getPedidosDescontoAlto(pedidos), "discount", PEDIDOS_TABLES[4].empty);
  mountPedidosTable("pipeline", metrics.getPedidosPipeline(pedidos), "pipeline", PEDIDOS_TABLES[5].empty);
}

const RESULTADO_SECTIONS = [
  {
    id: "competencia",
    eyebrow: "Visão por competência",
    title: "Competência",
    cards: [
      { label: "Receita do mês", key: "receitaMes" },
      { label: "Despesa do mês", key: "despesaMes" },
      { label: "Resultado competência", key: "resultadoCompetencia" }
    ],
    charts: [
      { id: "revenue-expense-result", title: "Receita, despesa e resultado por mês" },
      { id: "result-waterfall", title: "Waterfall do resultado" }
    ]
  },
  {
    id: "caixa",
    eyebrow: "Visão de caixa",
    title: "Caixa",
    cards: [
      { label: "Recebido no mês", key: "recebidoMes" },
      { label: "Despesa paga no mês", key: "despesaPagaMes" },
      { label: "Resultado caixa", key: "resultadoCaixa" }
    ],
    charts: [
      { id: "received-paid", title: "Recebido x pago" },
      { id: "cash-projection", title: "Projeção de caixa" }
    ]
  },
  {
    id: "operacional",
    eyebrow: "Posição operacional",
    title: "Posição operacional",
    cards: [
      { label: "Contas a receber", key: "recebiveis" },
      { label: "Contas a pagar abertas", key: "contasAbertas" },
      { label: "Saldo operacional projetado", key: "saldoProjetado" },
      { label: "Cobertura", key: "cobertura" },
      { label: "Pedidos para equilíbrio", key: "pedidosEquilibrio" }
    ],
    charts: [
      { id: "receivables-open", title: "Recebíveis x contas em aberto" },
      { id: "break-even-month", title: "Ponto de equilíbrio mensal" }
    ]
  }
];

function renderResultadoSection(section) {
  const cards = section.cards
    .map((card) => renderMetricCard(card.label, { key: card.key }))
    .join("");
  const charts = section.charts
    .map(
      (panel) => `
        <article class="chart-panel">
          <h3 class="chart-panel-title">${escapeHTML(panel.title)}</h3>
          <div class="chart-canvas" data-chart="${panel.id}" role="img" aria-label="${escapeHTML(panel.title)}"></div>
        </article>
      `
    )
    .join("");

  return `
    <section class="resultado-section" data-resultado-section="${section.id}">
      <header class="resultado-section-header">
        <span class="eyebrow">${escapeHTML(section.eyebrow)}</span>
        <h2 class="resultado-section-title">${escapeHTML(section.title)}</h2>
      </header>
      <div class="metric-grid resultado-section-kpis">${cards}</div>
      <section class="resultado-charts-grid" aria-label="Gráficos ${escapeHTML(section.title)}">
        ${charts}
      </section>
    </section>
  `;
}

function renderResultadoPage(route) {
  if (!canContinueToDashboards()) {
    return renderEmptyPage(route);
  }

  return `
    <header class="page-header">
      <div>
        <span class="eyebrow">${route.eyebrow}</span>
        <h1>${route.title}</h1>
        <p>${route.description}</p>
      </div>
      <span class="badge badge-success">Dados carregados</span>
    </header>
    ${RESULTADO_SECTIONS.map(renderResultadoSection).join("")}
  `;
}

function disposeResultadoCharts() {
  if (window.MoldeCharts && resultadoChartInstances.length) {
    window.MoldeCharts.disposeResultadoCharts(resultadoChartInstances);
  }
  resultadoChartInstances = [];
}

function mountResultadoDashboard() {
  if (getRouteFromHash() !== "resultado" || !canContinueToDashboards() || !window.MoldeMetrics || !appState.dataset) {
    return;
  }

  const pedidos = window.MoldeFilters.applyFilters(appState.dataset.pedidos || [], "pedidos", filterState);
  const contas = window.MoldeFilters.applyFilters(appState.dataset.contas || [], "contas", filterState);
  const metrics = window.MoldeMetrics;
  const receitaBase = filterState.resultado?.receitaBase || "cadastro";
  const kpis = metrics.computeResultadoKpis(pedidos, contas, filterState, { receitaBase });
  const format = metrics.formatCurrency;

  const metricMap = {
    receitaMes: format(kpis.competencia.receitaMes),
    despesaMes: format(kpis.competencia.despesaMes),
    resultadoCompetencia: format(kpis.competencia.resultadoCompetencia),
    recebidoMes: format(kpis.caixa.recebidoMes),
    despesaPagaMes: format(kpis.caixa.despesaPagaMes),
    resultadoCaixa: format(kpis.caixa.resultadoCaixa),
    recebiveis: format(kpis.operacional.recebiveis),
    contasAbertas: format(kpis.operacional.contasAbertas),
    saldoProjetado: format(kpis.operacional.saldoProjetado),
    cobertura: metrics.formatRatio(kpis.operacional.cobertura),
    pedidosEquilibrio: metrics.formatCount(kpis.operacional.pedidosEquilibrio)
  };

  document.querySelectorAll("[data-metric]").forEach((element) => {
    const key = element.dataset.metric;
    if (metricMap[key] !== undefined) {
      element.textContent = metricMap[key];
    }
  });

  disposeResultadoCharts();
  if (window.MoldeCharts && window.echarts) {
    const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const containers = {
      revenueExpenseResult: document.querySelector('[data-chart="revenue-expense-result"]'),
      resultWaterfall: document.querySelector('[data-chart="result-waterfall"]'),
      receivedPaid: document.querySelector('[data-chart="received-paid"]'),
      cashProjection: document.querySelector('[data-chart="cash-projection"]'),
      receivablesOpen: document.querySelector('[data-chart="receivables-open"]'),
      breakEvenMonth: document.querySelector('[data-chart="break-even-month"]')
    };
    resultadoChartInstances = window.MoldeCharts.renderResultadoCharts(
      containers,
      pedidos,
      contas,
      filterState,
      { receitaBase },
      theme
    );
  }
}

const INSIGHTS_CATEGORIES = [
  { id: "financeiro", title: "Financeiro" },
  { id: "comercial", title: "Comercial" },
  { id: "operacional", title: "Operacional" }
];

const INSIGHT_SEVERITY_BADGES = {
  critico: { label: "Crítico", className: "badge-danger" },
  atencao: { label: "Atenção", className: "badge-warning" },
  informativo: { label: "Informativo", className: "badge-info" }
};

function renderInsightAlertCard(alert) {
  const severity = INSIGHT_SEVERITY_BADGES[alert.severity] || INSIGHT_SEVERITY_BADGES.informativo;
  const expanded = alert.severity === "critico" || expandedInsightAlerts.has(alert.id);
  return `
    <article class="insight-alert-card" data-insight-alert="${escapeHTML(alert.id)}">
      <header class="insight-alert-header">
        <div>
          <h4 class="insight-alert-title">${escapeHTML(alert.title)}</h4>
          <p class="insight-alert-criterion">${escapeHTML(alert.criterion)}</p>
        </div>
        <div class="insight-alert-meta">
          <span class="badge ${severity.className}">${severity.label}</span>
          <span class="badge badge-neutral">${alert.count}</span>
          <button
            class="button button-ghost insight-alert-toggle"
            type="button"
            data-insight-toggle="${escapeHTML(alert.id)}"
            aria-expanded="${expanded ? "true" : "false"}"
          >${expanded ? "Recolher" : "Expandir"}</button>
        </div>
      </header>
      <div class="insight-alert-body" data-insight-body="${escapeHTML(alert.id)}" ${expanded ? "" : "hidden"}>
        <div data-insight-table="${escapeHTML(alert.id)}"></div>
      </div>
    </article>
  `;
}

function renderInsightsCategoryBlock(categoryId, title, alerts) {
  if (!alerts.length) {
    return `
      <section class="insight-category-block" data-insight-category="${categoryId}">
        <h2 class="metric-block-title">${escapeHTML(title)}</h2>
        <p class="executive-exception-empty">Nenhum alerta ativo nesta categoria.</p>
      </section>
    `;
  }
  return `
    <section class="insight-category-block" data-insight-category="${categoryId}">
      <h2 class="metric-block-title">${escapeHTML(title)}</h2>
      <div class="insight-alert-list">
        ${alerts.map(renderInsightAlertCard).join("")}
      </div>
    </section>
  `;
}

function renderInsightsPage(route) {
  if (!canContinueToDashboards()) {
    return renderEmptyPage(route);
  }

  const kpiStrip = [
    renderMetricCard("Total de alertas", { key: "insightsTotal" }),
    renderMetricCard("Alertas críticos", { key: "insightsCriticos", valueClass: "metric-card-value--warning" }),
    renderMetricCard("Alertas financeiros", { key: "insightsFinanceiros" }),
    renderMetricCard("Comerciais + operacionais", { key: "insightsComOp" })
  ].join("");

  return `
    <header class="page-header">
      <div>
        <span class="eyebrow">${route.eyebrow}</span>
        <h1>${route.title}</h1>
        <p>${route.description}</p>
      </div>
      <span class="badge badge-success">Dados carregados</span>
    </header>
    <section class="metric-block">
      <h2 class="metric-block-title">Resumo</h2>
      <div class="metric-grid insights-kpi-strip">${kpiStrip}</div>
    </section>
    <div data-insights-positive hidden>
      <section class="empty-state insight-positive-state" aria-labelledby="insights-ok-title">
        <div class="empty-state-inner">
          <span class="badge badge-success">Tudo certo</span>
          <h2 id="insights-ok-title">Nenhum alerta ativo</h2>
          <p>Não há problemas financeiros, comerciais ou operacionais no recorte atual.</p>
        </div>
      </section>
    </div>
    <div data-insights-content>
      ${INSIGHTS_CATEGORIES.map((category) => `<div data-insight-block="${category.id}"></div>`).join("")}
    </div>
  `;
}

function mountInsightTable(alert) {
  const container = document.querySelector(`[data-insight-table="${alert.id}"]`);
  if (!container) {
    return;
  }
  if (!alert.rows.length) {
    container.innerHTML = `<p class="executive-exception-empty">Nenhum registro para exibir.</p>`;
    return;
  }
  window.MoldeTables.renderVirtualTable(container, {
    rows: alert.rows,
    columns: alert.columns
  });
}

function mountInsightsDashboard() {
  if (getRouteFromHash() !== "insights" || !canContinueToDashboards() || !window.MoldeInsights || !appState.dataset) {
    return;
  }

  const pedidos = window.MoldeFilters.applyFilters(appState.dataset.pedidos || [], "pedidos", filterState);
  const contas = window.MoldeFilters.applyFilters(appState.dataset.contas || [], "contas", filterState);
  const payload = window.MoldeInsights.generateAlerts(pedidos, contas);
  const summary = payload.summary;

  const metricMap = {
    insightsTotal: String(summary.total),
    insightsCriticos: String(summary.criticos),
    insightsFinanceiros: String(summary.financeiros),
    insightsComOp: String(summary.comerciaisOperacionais)
  };

  document.querySelectorAll("[data-metric]").forEach((element) => {
    const key = element.dataset.metric;
    if (metricMap[key] !== undefined) {
      element.textContent = metricMap[key];
    }
  });

  const positive = document.querySelector("[data-insights-positive]");
  const content = document.querySelector("[data-insights-content]");
  const hasAlerts = summary.total > 0;
  if (positive) {
    positive.hidden = hasAlerts;
  }
  if (content) {
    content.hidden = !hasAlerts;
  }

  INSIGHTS_CATEGORIES.forEach((category) => {
    const block = document.querySelector(`[data-insight-block="${category.id}"]`);
    if (!block) {
      return;
    }
    const alerts = payload.categories[category.id] || [];
    block.innerHTML = renderInsightsCategoryBlock(category.id, category.title, alerts);
    alerts.forEach((alert) => mountInsightTable(alert));
  });
}

function handleInsightToggle(event) {
  const button = event.target.closest("[data-insight-toggle]");
  if (!button) {
    return;
  }
  const alertId = button.dataset.insightToggle;
  const body = document.querySelector(`[data-insight-body="${alertId}"]`);
  if (!body) {
    return;
  }
  if (expandedInsightAlerts.has(alertId)) {
    expandedInsightAlerts.delete(alertId);
    body.hidden = true;
    button.setAttribute("aria-expanded", "false");
    button.textContent = "Expandir";
  } else {
    expandedInsightAlerts.add(alertId);
    body.hidden = false;
    button.setAttribute("aria-expanded", "true");
    button.textContent = "Recolher";
  }
}

const CLIENTES_KPI_BLOCKS = [
  {
    title: "Base de clientes",
    cards: [
      { label: "Clientes únicos", key: "clientesUnicos" },
      { label: "Clientes recorrentes", key: "clientesRecorrentes" },
      { label: "Clientes novos no mês", key: "clientesNovosMes" }
    ]
  },
  {
    title: "Destaques por cliente",
    cards: [
      { label: "Top cliente por receita", key: "topClienteReceitaNome", subtitleKey: "topClienteReceitaValor" },
      { label: "Top cliente por pendência", key: "topClientePendenciaNome", subtitleKey: "topClientePendenciaValor" }
    ]
  },
  {
    title: "Destaques por vendedor",
    cards: [
      { label: "Maior receita", key: "topVendedorReceitaNome", subtitleKey: "topVendedorReceitaValor" },
      { label: "Maior ticket médio", key: "topVendedorTicketNome", subtitleKey: "topVendedorTicketValor" },
      { label: "Mais pedidos", key: "topVendedorPedidosNome", subtitleKey: "topVendedorPedidosValor" },
      { label: "Maior pendência", key: "topVendedorPendenciaNome", subtitleKey: "topVendedorPendenciaValor" }
    ]
  }
];

const CLIENTES_CHART_PANELS = [
  { id: "cl-revenue-vendor", title: "Receita por vendedor" },
  { id: "cl-ticket-vendor", title: "Ticket médio por vendedor" },
  { id: "cl-orders-vendor", title: "Pedidos por vendedor" },
  { id: "cl-pending-vendor", title: "Pendência por vendedor" },
  { id: "cl-top-clients-revenue", title: "Top clientes por receita" },
  { id: "cl-top-clients-pending", title: "Top clientes por pendência" },
  { id: "cl-new-recurrent", title: "Clientes novos × recorrentes" },
  { id: "cl-vendor-status-heatmap", title: "Matriz vendedor × status", wide: true }
];

function renderClientesPage(route) {
  if (!hasPedidosData()) {
    return renderEmptyPage(route);
  }

  const kpiBlocks = CLIENTES_KPI_BLOCKS.map((block) => {
    const cards = block.cards
      .map((card) => renderMetricCard(card.label, { key: card.key, subtitleKey: card.subtitleKey, valueClass: card.subtitleKey ? "metric-card-value--name" : "" }))
      .join("");
    return renderMetricBlock(block.title, cards);
  }).join("");

  const chartPanels = CLIENTES_CHART_PANELS.map(
    (panel) => `
      <article class="chart-panel ${panel.wide ? "chart-panel--wide" : ""}">
        <h3 class="chart-panel-title">${escapeHTML(panel.title)}</h3>
        <div class="chart-canvas" data-chart="${panel.id}" role="img" aria-label="${escapeHTML(panel.title)}"></div>
      </article>
    `
  ).join("");

  return `
    <header class="page-header">
      <div>
        <span class="eyebrow">${route.eyebrow}</span>
        <h1>${route.title}</h1>
        <p>${route.description}</p>
      </div>
      <span class="badge badge-success">Dados carregados</span>
    </header>
    ${kpiBlocks}
    <section class="clientes-charts-grid" aria-label="Gráficos de clientes e vendedores">
      ${chartPanels}
    </section>
  `;
}

function disposeClientesCharts() {
  if (window.MoldeCharts && clientesChartInstances.length) {
    window.MoldeCharts.disposeClientesCharts(clientesChartInstances);
  }
  clientesChartInstances = [];
}

function mountClientesDashboard() {
  if (getRouteFromHash() !== "clientes" || !hasPedidosData() || !window.MoldeMetrics || !appState.dataset) {
    return;
  }

  const pedidos = window.MoldeFilters.applyFilters(appState.dataset.pedidos || [], "pedidos", filterState);
  const metrics = window.MoldeMetrics;
  const kpis = metrics.computeClientesKpis(pedidos);
  const format = metrics.formatCurrency;

  const metricMap = {
    clientesUnicos: String(kpis.clientesUnicos),
    clientesRecorrentes: String(kpis.clientesRecorrentes),
    clientesNovosMes: String(kpis.clientesNovosMes),
    topClienteReceitaNome: kpis.topClienteReceitaNome,
    topClientePendenciaNome: kpis.topClientePendenciaNome,
    topVendedorReceitaNome: kpis.topVendedorReceitaNome,
    topVendedorTicketNome: kpis.topVendedorTicketNome,
    topVendedorPedidosNome: kpis.topVendedorPedidosNome,
    topVendedorPendenciaNome: kpis.topVendedorPendenciaNome
  };
  const subtitleMap = {
    topClienteReceitaValor: format(kpis.topClienteReceitaValor),
    topClientePendenciaValor: format(kpis.topClientePendenciaValor),
    topVendedorReceitaValor: format(kpis.topVendedorReceitaValor),
    topVendedorTicketValor: format(kpis.topVendedorTicketValor),
    topVendedorPedidosValor: String(kpis.topVendedorPedidosValor),
    topVendedorPendenciaValor: format(kpis.topVendedorPendenciaValor)
  };

  document.querySelectorAll("[data-metric]").forEach((element) => {
    const key = element.dataset.metric;
    if (metricMap[key] !== undefined) {
      element.textContent = metricMap[key];
      if (metricMap[key] && metricMap[key] !== "—") {
        element.title = metricMap[key];
      }
    }
  });
  document.querySelectorAll("[data-metric-subtitle]").forEach((element) => {
    const key = element.dataset.metricSubtitle;
    if (subtitleMap[key] !== undefined) {
      element.textContent = subtitleMap[key];
    }
  });

  disposeClientesCharts();
  if (window.MoldeCharts && window.echarts) {
    const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const containers = {
      revenueVendor: document.querySelector('[data-chart="cl-revenue-vendor"]'),
      ticketVendor: document.querySelector('[data-chart="cl-ticket-vendor"]'),
      ordersVendor: document.querySelector('[data-chart="cl-orders-vendor"]'),
      pendingVendor: document.querySelector('[data-chart="cl-pending-vendor"]'),
      topClientsRevenue: document.querySelector('[data-chart="cl-top-clients-revenue"]'),
      topClientsPending: document.querySelector('[data-chart="cl-top-clients-pending"]'),
      newRecurrent: document.querySelector('[data-chart="cl-new-recurrent"]'),
      vendorStatusHeatmap: document.querySelector('[data-chart="cl-vendor-status-heatmap"]')
    };
    clientesChartInstances = window.MoldeCharts.renderClientesCharts(containers, pedidos, theme);
  }
}

const PRODUCAO_KPI_BLOCKS = [
  {
    title: "Status operacional",
    cards: [
      { label: "Aguardando produzir", key: "aguardandoProduzir" },
      { label: "Produzindo", key: "produzindo" },
      { label: "Prontos para entrega", key: "prontosEntrega" },
      { label: "Entregues", key: "entregues" },
      { label: "Atrasados", key: "atrasados", warning: true }
    ]
  },
  {
    title: "Prazos",
    cards: [
      { label: "Tempo médio cadastro → entrega", key: "tempoMedioCadastroEntrega" },
      { label: "Tempo médio previsto → entregue", key: "tempoMedioPrevistoEntregue" },
      { label: "% entregues no prazo", key: "percentualNoPrazo" },
      { label: "Sem data prevista", key: "semDataPrevista" },
      { label: "Sem data entregue", key: "semDataEntregue" }
    ]
  }
];

const PRODUCAO_CHART_PANELS = [
  { id: "pr-production-funnel", title: "Funil operacional" },
  { id: "pr-late-by-month", title: "Pedidos atrasados por mês" },
  { id: "pr-production-time", title: "Tempo médio de produção" },
  { id: "pr-on-time-split", title: "Entregues no prazo × atrasados" },
  { id: "pr-active-aging", title: "Aging dos pedidos ativos" },
  { id: "pr-no-forecast-vendor", title: "Pedidos sem previsão por vendedor" }
];

function renderProducaoPage(route) {
  if (!hasPedidosData()) {
    return renderEmptyPage(route);
  }

  const kpiBlocks = PRODUCAO_KPI_BLOCKS.map((block) => {
    const cards = block.cards
      .map((card) => renderMetricCard(card.label, { key: card.key, warning: card.warning }))
      .join("");
    return renderMetricBlock(block.title, cards);
  }).join("");

  const chartPanels = PRODUCAO_CHART_PANELS.map(
    (panel) => `
      <article class="chart-panel">
        <h3 class="chart-panel-title">${escapeHTML(panel.title)}</h3>
        <div class="chart-canvas" data-chart="${panel.id}" role="img" aria-label="${escapeHTML(panel.title)}"></div>
      </article>
    `
  ).join("");

  return `
    <header class="page-header">
      <div>
        <span class="eyebrow">${route.eyebrow}</span>
        <h1>${route.title}</h1>
        <p>${route.description}</p>
      </div>
      <span class="badge badge-success">Dados carregados</span>
    </header>
    ${kpiBlocks}
    <section class="producao-charts-grid" aria-label="Gráficos de produção e prazo">
      ${chartPanels}
    </section>
  `;
}

function disposeProducaoCharts() {
  if (window.MoldeCharts && producaoChartInstances.length) {
    window.MoldeCharts.disposeProducaoCharts(producaoChartInstances);
  }
  producaoChartInstances = [];
}

function mountProducaoDashboard() {
  if (getRouteFromHash() !== "producao" || !hasPedidosData() || !window.MoldeMetrics || !appState.dataset) {
    return;
  }

  const pedidos = window.MoldeFilters.applyFilters(appState.dataset.pedidos || [], "pedidos", filterState);
  const metrics = window.MoldeMetrics;
  const kpis = metrics.computeProducaoKpis(pedidos);
  const percent = metrics.formatPercent;

  const metricMap = {
    aguardandoProduzir: String(kpis.aguardandoProduzir),
    produzindo: String(kpis.produzindo),
    prontosEntrega: String(kpis.prontosEntrega),
    entregues: String(kpis.entregues),
    atrasados: String(kpis.atrasados),
    tempoMedioCadastroEntrega: Number.isFinite(kpis.tempoMedioCadastroEntrega)
      ? `${kpis.tempoMedioCadastroEntrega.toFixed(1).replace(".", ",")} dias`
      : "—",
    tempoMedioPrevistoEntregue: Number.isFinite(kpis.tempoMedioPrevistoEntregue)
      ? `${kpis.tempoMedioPrevistoEntregue.toFixed(1).replace(".", ",")} dias`
      : "—",
    percentualNoPrazo: percent(kpis.percentualNoPrazo),
    semDataPrevista: String(kpis.semDataPrevista),
    semDataEntregue: String(kpis.semDataEntregue)
  };

  document.querySelectorAll("[data-metric]").forEach((element) => {
    const key = element.dataset.metric;
    if (metricMap[key] !== undefined) {
      element.textContent = metricMap[key];
    }
  });

  disposeProducaoCharts();
  if (window.MoldeCharts && window.echarts) {
    const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const containers = {
      productionFunnel: document.querySelector('[data-chart="pr-production-funnel"]'),
      lateByMonth: document.querySelector('[data-chart="pr-late-by-month"]'),
      productionTime: document.querySelector('[data-chart="pr-production-time"]'),
      onTimeSplit: document.querySelector('[data-chart="pr-on-time-split"]'),
      activeAging: document.querySelector('[data-chart="pr-active-aging"]'),
      noForecastVendor: document.querySelector('[data-chart="pr-no-forecast-vendor"]')
    };
    producaoChartInstances = window.MoldeCharts.renderProducaoCharts(containers, pedidos, theme);
  }
}

const METAS_STATUS_BADGES = {
  calculavel: { label: "Calculável", className: "badge-success" },
  manual: { label: "Manual", className: "badge-info" },
  indisponivel: { label: "Indisponível", className: "badge-neutral" }
};

function formatMetasIndicatorValue(item) {
  if (item.status === "indisponivel" || item.valorAtual === null || item.valorAtual === undefined) {
    return "—";
  }
  const name = String(item.indicador || "").toLowerCase();
  if (/pedidos|quantidade|clientes|atras/.test(name) && !/receita|despesa|ticket/.test(name)) {
    return String(Math.round(item.valorAtual));
  }
  if (/prazo|percent|%/.test(name)) {
    return window.MoldeMetrics.formatPercent(item.valorAtual);
  }
  if (/tempo|dias/.test(name)) {
    return `${Number(item.valorAtual).toFixed(1).replace(".", ",")} dias`;
  }
  return window.MoldeMetrics.formatCurrency(item.valorAtual);
}

function renderMetasSectorBlock(sector) {
  const rows = sector.items
    .map((item) => {
      const status = METAS_STATUS_BADGES[item.status] || METAS_STATUS_BADGES.indisponivel;
      const valorAtual = formatMetasIndicatorValue(item);
      const meta = Number.isFinite(item.meta) ? window.MoldeMetrics.formatCurrency(item.meta) : "—";
      return `
        <tr>
          <td>${escapeHTML(item.indicador)}</td>
          <td>${meta}</td>
          <td>${valorAtual}</td>
          <td>${escapeHTML(item.origem)}</td>
          <td><span class="badge ${status.className}">${status.label}</span></td>
        </tr>
      `;
    })
    .join("");

  return `
    <article class="card metas-sector-card">
      <h3 class="chart-panel-title">${escapeHTML(sector.setor)}</h3>
      <div class="table-wrap">
        <table class="data-table metas-sector-table">
          <thead>
            <tr>
              <th scope="col">Indicador</th>
              <th scope="col">Meta</th>
              <th scope="col">Valor atual</th>
              <th scope="col">Origem</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </article>
  `;
}

function renderMetasPage(route) {
  if (!hasIndicadoresData()) {
    return renderEmptyPage(route);
  }

  return `
    <header class="page-header">
      <div>
        <span class="eyebrow">${route.eyebrow}</span>
        <h1>${route.title}</h1>
        <p>${route.description}</p>
      </div>
      <span class="badge badge-info">Catálogo importado</span>
    </header>
    <section class="metas-catalog-grid" data-metas-catalog aria-label="Catálogo de indicadores por setor"></section>
  `;
}

function mountMetasDashboard() {
  if (getRouteFromHash() !== "metas" || !hasIndicadoresData() || !window.MoldeMetrics || !appState.dataset) {
    return;
  }

  const container = document.querySelector("[data-metas-catalog]");
  if (!container) {
    return;
  }

  const pedidos = appState.dataset.pedidos || [];
  const contas = appState.dataset.contas || [];
  const sectors = window.MoldeMetrics.classifyIndicadores(appState.dataset.indicadores || [], pedidos, contas);
  container.innerHTML = sectors.map(renderMetasSectorBlock).join("");
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
  pageView?.addEventListener("click", handleInsightToggle);

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
    const pedidoToggle = event.target.closest("[data-filter-pedido-toggle]");
    if (pedidoToggle) {
      filterState.pedidos[pedidoToggle.dataset.filterPedidoToggle] = pedidoToggle.checked;
      onFilterStateChanged();
      return;
    }
    const toggleFlag = event.target.closest("[data-filter-toggle-flag]");
    if (toggleFlag) {
      filterState.contas[toggleFlag.dataset.filterToggleFlag] = toggleFlag.checked;
      onFilterStateChanged();
      return;
    }
    const contaSelect = event.target.closest("[data-filter-conta-select]");
    if (contaSelect) {
      const field = contaSelect.dataset.filterContaSelect;
      filterState.contas[field] = contaSelect.value === "" ? null : contaSelect.value === "true";
      onFilterStateChanged();
      return;
    }
    const resultadoBase = event.target.closest("[data-filter-resultado-base]");
    if (resultadoBase) {
      if (!filterState.resultado) {
        filterState.resultado = { receitaBase: "cadastro" };
      }
      filterState.resultado.receitaBase = resultadoBase.value === "entrega" ? "entrega" : "cadastro";
      onFilterStateChanged();
      return;
    }
    const check = event.target.closest("[data-filter-check]");
    if (check) {
      const [group, field] = check.dataset.filterCheck.split(":");
      const selected = new Set(filterState[group][field]);
      if (check.checked) {
        selected.add(check.value);
      } else {
        selected.delete(check.value);
      }
      filterState[group][field] = Array.from(selected);
      updateFilterDropdownSummary(check);
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

  filterPanel?.addEventListener("input", (event) => {
    const search = event.target.closest("[data-filter-dropdown-search]");
    if (!search) {
      return;
    }
    const term = search.value.trim().toLowerCase();
    const menu = search.closest(".filter-dropdown-menu");
    menu?.querySelectorAll(".filter-dropdown-option").forEach((option) => {
      const label = option.textContent.trim().toLowerCase();
      option.style.display = label.includes(term) ? "" : "none";
    });
  });

  filterPanel?.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-filter-dropdown-toggle]");
    if (toggle) {
      const menu = toggle.nextElementSibling;
      const willOpen = menu.hidden;
      closeAllFilterDropdowns();
      if (willOpen) {
        menu.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        menu.querySelector("[data-filter-dropdown-search]")?.focus();
      }
      return;
    }
    if (event.target.closest("[data-filter-clear]")) {
      filterState = window.MoldeFilters.clearAll();
      onFilterStateChanged();
      renderFilterPanelContent();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".filter-dropdown")) {
      closeAllFilterDropdowns();
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

  window.addEventListener("resize", scheduleExecutiveChartResize);
}

function onFilterStateChanged() {
  renderFilterChips();
  syncTopbarSearch();
  if (getRouteFromHash() === "base-dados") {
    mountBaseDadosTable();
  }
  if (getRouteFromHash() === "executivo" && canContinueToDashboards()) {
    mountExecutivoDashboard();
  }
  if (getRouteFromHash() === "financeiro" && hasContasData()) {
    mountFinanceiroDashboard();
  }
  if (getRouteFromHash() === "pedidos" && hasPedidosData()) {
    mountPedidosDashboard();
  }
  if (getRouteFromHash() === "resultado" && canContinueToDashboards()) {
    mountResultadoDashboard();
  }
  if (getRouteFromHash() === "insights" && canContinueToDashboards()) {
    mountInsightsDashboard();
  }
  if (getRouteFromHash() === "clientes" && hasPedidosData()) {
    mountClientesDashboard();
  }
  if (getRouteFromHash() === "producao" && hasPedidosData()) {
    mountProducaoDashboard();
  }
  if (getRouteFromHash() === "metas" && hasIndicadoresData()) {
    mountMetasDashboard();
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
  disposeExecutiveCharts();
  disposeFinanceCharts();
  disposePedidosCharts();
  disposeResultadoCharts();
  disposeClientesCharts();
  disposeProducaoCharts();
  const routeName = getRouteFromHash();
  const route = routes[routeName];
  ensureValidHash(routeName);
  updateActiveLink(routeName);
  updateFilterVisibility(routeName);
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

  if (routeName === "executivo" && canContinueToDashboards()) {
    mountExecutivoDashboard();
  }

  if (routeName === "financeiro" && hasContasData()) {
    mountFinanceiroDashboard();
  }

  if (routeName === "pedidos" && hasPedidosData()) {
    mountPedidosDashboard();
  }

  if (routeName === "resultado" && canContinueToDashboards()) {
    mountResultadoDashboard();
  }

  if (routeName === "insights" && canContinueToDashboards()) {
    mountInsightsDashboard();
  }

  if (routeName === "clientes" && hasPedidosData()) {
    mountClientesDashboard();
  }

  if (routeName === "producao" && hasPedidosData()) {
    mountProducaoDashboard();
  }

  if (routeName === "metas" && hasIndicadoresData()) {
    mountMetasDashboard();
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
