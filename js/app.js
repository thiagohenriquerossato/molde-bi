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
    description: "Tabelas internas limpas para auditoria e exportação futura.",
    emptyTitle: "Base normalizada vazia",
    emptyBody: "As tabelas normalizadas serão exibidas após importação, validação e normalização.",
    icon: "BD"
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
const pageView = document.querySelector("[data-route-view]");
const shell = document.querySelector(".app-shell");
const menuToggle = document.querySelector("[data-menu-toggle]");
const sidebarCloseTargets = document.querySelectorAll("[data-sidebar-close]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeStorageKey = "molde-theme";

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
        <button class="button button-outline" type="button" disabled aria-disabled="true">Selecionar planilha</button>
        <span class="helper-text">Disponível na Fase 2</span>
      </div>
    </section>
  `;
}

function renderUploadPage(route) {
  return `
    ${createPageHeader(route)}
    <div class="upload-grid" aria-label="Planilhas esperadas">
      ${createUploadCard("Pendente", "Pedidos", "Pedidos_Simplificado.xlsx", "Base de pedidos, clientes, status, datas e valores.", "badge-neutral")}
      ${createUploadCard("Pendente", "Contas a pagar", "PLANILHA CONTAS A PAGAR1.xlsx", "Base mensal de contas, fornecedores, vencimentos e pagamentos.", "badge-neutral")}
      ${createUploadCard("Opcional", "Indicadores e metas", "Molde_Momentos_Template_Indicadores.xlsx", "Catálogo opcional de indicadores e metas gerenciais.", "badge-info")}
    </div>
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
              <tr>
                <td>Pedidos</td>
                <td><span class="badge badge-neutral">Sem dados</span></td>
                <td>Importação na Fase 2</td>
              </tr>
              <tr>
                <td>Contas a pagar</td>
                <td><span class="badge badge-neutral">Sem dados</span></td>
                <td>Importação na Fase 2</td>
              </tr>
              <tr>
                <td>Indicadores e metas</td>
                <td><span class="badge badge-info">Opcional</span></td>
                <td>Catálogo na Fase 2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  `;
}

function createUploadCard(status, title, fileName, body, badgeClass) {
  return `
    <article class="upload-card">
      <div class="card-heading">
        <span class="badge ${badgeClass}">${status}</span>
        <h2>${title}</h2>
      </div>
      <p class="file-name">${fileName}</p>
      <p>${body}</p>
      <button class="button button-outline" type="button" disabled aria-disabled="true">Selecionar planilha</button>
      <span class="helper-text">Disponível na Fase 2</span>
    </article>
  `;
}

function closeMobileSidebar() {
  shell.dataset.sidebarOpen = "false";
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
}

function toggleMobileSidebar() {
  const isOpen = shell.dataset.sidebarOpen === "true";
  shell.dataset.sidebarOpen = String(!isOpen);
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
}

function renderRoute() {
  const routeName = getRouteFromHash();
  const route = routes[routeName];
  ensureValidHash(routeName);
  updateActiveLink(routeName);
  pageView.innerHTML = route.render ? route.render(route) : renderEmptyPage(route);
  closeMobileSidebar();
}

applyTheme(getInitialTheme());
renderRoute();

window.addEventListener("hashchange", renderRoute);

menuToggle.addEventListener("click", toggleMobileSidebar);
themeToggle.addEventListener("click", toggleTheme);
sidebarCloseTargets.forEach((target) => target.addEventListener("click", closeMobileSidebar));

document.querySelectorAll("[data-route-link]").forEach((link) => {
  link.addEventListener("click", closeMobileSidebar);
});
