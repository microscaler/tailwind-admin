## AGENTS.md

````markdown
# Agents Configuration & Guidelines

This document describes how to structure prompts, expected outputs, and iterative behaviour for Codex (or any other AI assistant) to autonomously drive the React → SolidJS migration. Testing validation via CI is a priority so that every generated PR is tested automatically.

---

## 1. Agent Roles & Capabilities

1. **CI Setup Agent**  
   - **Responsibility**:  
     - Create/maintain GitHub Action workflows that validate React code immediately on PRs.  
   - **Capabilities**:  
     - Generate YAML for `.github/workflows/react-ci.yml` and `.github/workflows/solid-ci.yml`.  
     - Ensure each job (lint, typecheck, unit, mutation, e2e, visual, performance) is properly ordered and uses caching.  
     - Add branch protection rules via GitHub CLI or documentation.

2. **Test-Suite Generator Agent**  
   - **Responsibility**:  
     - Generate Playwright E2E tests and Cucumber BDD files for the React repo.  
     - Ensure at least 80–90% UI coverage of visible flows.  
     - Create React Storybook stories (if not present) and snapshot tests.  
   - **Capabilities**:  
     - Understand React’s file structure under `src/`.  
     - Identify core user flows (login, navigation, CRUD).  
     - Produce TypeScript Playwright test files with `data-testid` selectors.  
     - Produce `.feature` files with Gherkin syntax and matching step definitions.

3. **Component Port Agent**  
   - **Responsibility**:  
     - Port individual React components/pages into Solid-compatible equivalents.  
     - Translate React hooks (`useState`, `useEffect`, `useContext`) into Solid primitives (`createSignal`, `createEffect`, `createContext`).  
     - Convert JSX `className` → `class`.  
   - **Capabilities**:  
     - Parse React TSX files, apply systematic find-and-replace for hooks and props.  
     - Create new Solid TSX files under `solid-tailadmin/src/components/` and `src/pages/`.  
     - Write unit tests (Vitest) for transplanted logic.

4. **Validation & Regression Agent**  
   - **Responsibility**:  
     - After each component/page port, run React and Solid build + test pipelines.  
     - Compare Playwright + visual snapshot results.  
     - Report any functional or visual regressions.  
   - **Capabilities**:  
     - Execute shell commands to build/serve both React and Solid.  
     - Invoke Playwright test runner programmatically.  
     - Invoke Playwright’s `expect(screenshot).toMatchSnapshot()` for visual diffs.  
     - Post summary of “Passed / Failed” tests and pixel-diff percentages.

5. **Documentation Agent**  
   - **Responsibility**:  
     - Maintain shared `CONTRIBUTORS.md`, `AGENTS.md`, and `ROADMAP.md`.  
     - Update migration docs if project structure changes.  
   - **Capabilities**:  
     - Reflect changes to file structure or test baselines.  
     - Regenerate or adjust Roadmap to incorporate newly added components or pages.

---

## 2. Prompt Patterns & Examples

### 2.1. Setting Up CI Workflows
```txt
“Codex, create `.github/workflows/react-ci.yml` for the React repo. The workflow should run on `pull_request` to `main` and include:
1. `lint-type` job: install dependencies, run `npm run lint`, `npm run typecheck`.
2. `unit-mutation` job (needs `lint-type`): run `npm run test:unit` (Vitest) and `npx stryker run`.
3. `e2e-visual` job (needs `unit-mutation`): build React (`npm run build`), serve (`npx serve -s build -l 3000`), run `npx playwright test`, run Storybook snapshot tests (fail if visual drift > 1%).
4. `performance` job (needs `e2e-visual`): run Lighthouse (via Playwright–Lighthouse plugin) and fail if JS bundle > React baseline × 1.2, FCP > React FCP × 1.1.
Use `actions/cache@v2` for caching `~/.npm` or `node_modules`. Protect `main` so the workflow must pass before merges.” 
````

### 2.2. Generating Playwright E2E Tests (React)

```txt
“Codex, please generate a Playwright test suite for the TailAdmin React project. Cover these flows:
1. Login flow: navigate to `/login`, fill valid/invalid credentials, assert success/failure messages.
2. Sidebar navigation: click each sidebar item (Dashboard, Tables, Charts, Users, Profile, 404) and verify correct route + page header.
3. User CRUD: on `/users`, stub `mocks/users.json` and test 'Create User' form submission, 'Edit User' flow, and 'Delete User' confirmation.
4. Dashboard charts: stub `mocks/chart-series.json`, load `/dashboard`, and confirm that a Chart.js canvas is visible with expected data series.
Store tests under `e2e/playwright/tests/` using TypeScript and `data-testid` selectors.” 
```

### 2.3. Porting a React Component to Solid

```txt
“Codex, port `src/components/Sidebar.tsx` from React → Solid:
- Rename file to `SidebarSolid.tsx` under `solid-tailadmin/src/components/`.
- Replace all `className=` with `class=`.
- Convert `const [open, setOpen] = useState(false)` → `const [open, setOpen] = createSignal(false)`.
- Replace `useEffect(() => { ... }, [])` with `onMount(() => { ... });` (if needed).
- Update imports: `import React, { useState, useEffect } from 'react'` → `import { createSignal, onMount } from 'solid-js'`.
Output a valid Solid component that compiles under Vite + SolidJS.” 
```

### 2.4. Writing a Visual Regression Assertion

```txt
“Codex, in the Playwright test for Dashboard, after navigating to `/dashboard`, add:
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot('baseline-react/dashboard.png', { threshold: 0.01 });
Ensure that snapshot testing uses the React baseline stored at `e2e/baseline-react/dashboard.png`. If the diff percentage exceeds 1%, the test fails.” 
```

### 2.5. Configuring Solid CI Workflow

```txt
“Codex, create `.github/workflows/solid-ci.yml` with the following jobs on `pull_request` to `main`:
1. `lint-type`:
   runs `npm ci`, `npm run lint`, `npm run typecheck`.
2. `unit-mutation` (needs `lint-type`):
   runs `npm run test:unit` (Vitest) and `npx stryker run`.
3. `e2e-visual` (needs `unit-mutation`):
   - Build Solid: `npm run build`.
   - Serve build: `npm run preview`.
   - Run `npx playwright test --config=e2e/playwright.config.ts`.
   Ensure visual assertions compare to React baselines under `e2e/baseline-react/`.
4. `performance` (optional, after `e2e-visual`):
   - Run Lighthouse via Playwright.
   - Fail if Solid’s bundle size > React’s × 1.2 or FCP > React FCP × 1.1.
Use caching for `node_modules` via `actions/cache@v2`. Protect `main` to require passing jobs.” 
```

---

## 3. Iterative Behavior & Checkpoints

1. **Immediate CI Verification**

    * Agent generates `react-ci.yml`.
    * Agent ensures the first build on a trivial PR passes.
    * From now on, any further changes (tests, code, docs) must keep React CI green.

2. **Collective Test Coverage**

    * Agent generates Playwright + BDD tests.
    * Agent runs React CI; any failure is flagged immediately.

3. **Port & Validate**

    * Agent ports a single component/page.
    * Agent runs React CI against React build → must pass.
    * Agent runs Solid CI against Solid build → must pass (functional + visual).

4. **Merge & Maintenance**

    * Agent merges only when both React and Solid checks are green.
    * Agent updates docs (CONTRIBUTORS.md, ROADMAP.md) as needed to reflect any structural changes.

---

**By following these agent guidelines—especially with CI enforcement at the very start—Codex can generate, validate, and merge changes confidently, ensuring that each PR is automatically tested and that regressions are caught early.**

````