---
phase: 1
slug: funda-o-est-tica-e-design-system
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-07
---

# Phase 1 — Validation Strategy

> Contrato de validação para a fundação estática, shell local, design system e estados vazios.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — projeto estático HTML/CSS/JS vanilla |
| **Config file** | none |
| **Quick run command** | `test -f index.html && test -f css/app.css && test -f js/app.js` |
| **Full suite command** | `test -f index.html && test -f css/app.css && test -f js/app.js && ! rg "https?://|cdn|unpkg|jsdelivr|googleapis|fonts\\.gstatic|SheetJS|xlsx|echarts|indexedDB|fetch\\(" index.html css js` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `test -f index.html && test -f css/app.css && test -f js/app.js` when the three files are expected to exist.
- **After every plan wave:** Run `test -f index.html && test -f css/app.css && test -f js/app.js && ! rg "https?://|cdn|unpkg|jsdelivr|googleapis|fonts\\.gstatic|SheetJS|xlsx|echarts|indexedDB|fetch\\(" index.html css js`.
- **Before `/gsd-verify-work`:** Full suite must be green and manual browser checks must pass.
- **Max feedback latency:** 10 seconds for CLI checks; manual browser checks are phase sign-off.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | FND-01 | T-1-01 | App opens locally without backend or remote runtime dependency | smoke | `test -f index.html && rg "css/app.css|js/app.js" index.html` | ✅ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | FND-02 | T-1-02 | Hash navigation exposes all planned local pages without server routing | static | `rg "#upload|#executivo|#financeiro|#pedidos|#resultado|#insights|#base-dados|#metas" index.html js/app.js` | ✅ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | FND-03 | T-1-03 | UI uses local tokens and accessible static controls, without misleading data claims | static | `rg "--background|--foreground|--card|--border|--primary|--muted" css/app.css && rg "Upload e validação|Disponível na Fase 2|Sem dados importados" index.html js/app.js` | ✅ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | FND-03 | T-1-04 | Future data actions remain disabled until import phase | static | `rg "disabled|aria-disabled" index.html js/app.js` | ✅ W0 | ⬜ pending |
| 1-01-05 | 01 | 1 | FND-03 | T-1-05 | Implementation does not introduce remote dependencies, XLSX parsing, charts, IndexedDB or fetch/API calls | negative | `! rg "https?://|cdn|unpkg|jsdelivr|googleapis|fonts\\.gstatic|SheetJS|xlsx|echarts|indexedDB|fetch\\(" index.html css js` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing lightweight CLI checks cover the phase requirements. No test framework installation is required for Phase 1.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App opens directly from `index.html` | FND-01 | `file://` behavior and visual rendering need browser confirmation | Open `index.html` in the browser and confirm the shell appears without a server |
| Sidebar/topbar layout and route switching | FND-02 | Active states, overlay and hash routing are interaction behaviors | Click every sidebar item, reload on hashes and confirm active item plus page content |
| Theme toggle and persistence | FND-03 | `localStorage` and system preference need browser state | Toggle theme, reload and confirm the selected theme persists |
| Responsive shell | FND-03 | Breakpoints and overlay behavior need viewport inspection | Test desktop, tablet and mobile widths; confirm sidebar fixed, collapsed and overlay modes |
| Accessibility basics | FND-03 | Keyboard focus and landmarks require browser interaction | Use keyboard navigation, skip link, theme toggle and mobile menu; confirm visible focus and names |

---

## Validation Sign-Off

- [x] All tasks have automated or manual verification.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing infrastructure references.
- [x] No watch-mode flags.
- [x] Feedback latency < 10s for automated checks.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-07-07
