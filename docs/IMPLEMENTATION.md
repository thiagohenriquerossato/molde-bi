# Implementação do design system — Molde ERP

Guia para aplicar tokens e padrões em **Vite + React + Tailwind + shadcn/ui**.

---

## 1. Inicializar projeto

```bash
npm create vite@latest molde-erp-front -- --template react-ts
cd molde-erp-front
npm install
```

---

## 2. Tailwind CSS v4 ou v3

Este repositório inclui `tailwind.config.ts` para **Tailwind v3** (padrão shadcn). Se usar v4, adapte imports conforme documentação shadcn atual.

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 3. shadcn/ui

```bash
npx shadcn@latest init
```

Use o `components.json` deste repositório como referência.

```bash
npx shadcn@latest add button input label select table dialog sheet drawer dropdown-menu command toast form checkbox switch badge tabs breadcrumb skeleton separator popover
```

---

## 4. Estrutura de pastas sugerida

```
src/
├── components/
│   ├── ui/              # shadcn
│   ├── layout/
│   │   ├── app-sidebar.tsx
│   │   ├── app-topbar.tsx
│   │   └── page-header.tsx
│   ├── data-table/
│   │   ├── data-table.tsx
│   │   ├── data-table-toolbar.tsx
│   │   └── columns/
│   └── domain/
│       ├── summary-panel.tsx
│       ├── line-item-row.tsx
│       ├── price-field.tsx
│       └── status-badge.tsx
├── styles/
│   ├── theme.css        # tokens
│   └── globals.css      # imports
├── lib/
│   └── utils.ts         # cn()
└── routes/              # TanStack Router
```

---

## 5. Importar tema

`src/main.tsx`:

```tsx
import "./styles/globals.css";
```

`src/styles/globals.css`:

```css
@import "./theme.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}
```

---

## 6. Dark mode

### Opção A: classe `.dark` no `<html>`

```tsx
// src/components/theme-provider.tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "system"
  );

  useEffect(() => {
    const root = document.documentElement;
    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme within ThemeProvider");
  return ctx;
};
```

### Opção B: `next-themes` (funciona em Vite)

```bash
npm install next-themes
```

---

## 7. Densidade

```tsx
// layout root ou por página
<html data-density="compact">
```

CSS em `theme.css`:

```css
[data-density="compact"] {
  --density-row: 36px;
  --density-input: 32px;
}
```

Componentes leem via `h-[var(--density-input)]` ou classes utilitárias.

---

## 8. Fontes

`index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

---

## 9. TanStack Router

```bash
npm install @tanstack/react-router
```

Layout route com sidebar + topbar:

```tsx
// routes/__root.tsx
export const Route = createRootRoute({
  component: () => (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar />
        <main className="flex-1 overflow-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  ),
});
```

---

## 10. TanStack Query

```bash
npm install @tanstack/react-query
```

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});
```

---

## 11. Formulários

```bash
npm install react-hook-form @hookform/resolvers zod
```

Padrão:

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
```

---

## 12. DataTable

```bash
npm install @tanstack/react-table
```

Seguir `docs/TABLES.md` e exemplo oficial shadcn data-table.

---

## 13. Utilitário `cn`

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 14. Status Badge

```tsx
// src/components/domain/status-badge.tsx
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        success: "bg-success/15 text-success",
        warning: "bg-warning/15 text-warning",
        danger: "bg-destructive/15 text-destructive",
        info: "bg-info/15 text-info",
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);
```

Registrar `success`, `warning`, `info` no `tailwind.config.ts`.

---

## 15. Command Palette

```bash
npx shadcn@latest add command
```

Atalho global `Ctrl+K` no `AppTopbar`.

---

## 16. Checklist de nova tela

1. Consultar `docs/UX.md` para layout da tela
2. Usar `PageHeader` + conteúdo
3. Listagens → `DataTable` compact
4. CRUD leve → `Drawer`
5. Tokens sem hardcode (`bg-primary`, não `bg-slate-900`)
6. Testar light + dark
7. Validar contraste em tabela
8. Toast + loading states

---

## 17. Scripts úteis

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

---

## 18. Referências

- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [TanStack Table](https://tanstack.com/table)
- [TanStack Router](https://tanstack.com/router)
- Docs locais: `docs/DESIGN.md`, `docs/TOKENS.md`
