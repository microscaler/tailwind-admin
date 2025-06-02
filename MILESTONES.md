---

## Milestone 1: Immediate CI Integration (React Repo)

> **Goal:** Ensure every Codex-generated change is automatically validated.

1. **Create React CI Workflow**  
   - **Task 1.1.1**: In the React repo, create `.github/workflows/react-ci.yml`.  
   - **Task 1.1.2**: Configure jobs in the following order:  
     1. **lint-type**: `npm ci && npm run lint && npm run typecheck`  
     2. **unit-mutation** (depends on lint-type): `npm run test:unit && npx stryker run`  
     3. **e2e-visual** (depends on unit-mutation):  
        - Build: `npm run build`  
        - Serve: `npx serve -s build -l 3000`  
        - Run Playwright + Cucumber suite (`npx playwright test`) against `http://localhost:3000`.  
        - Run Storybook snapshot tests (fail if visual drift > 1%).  
     4. **performance** (optional, after e2e-visual):  
        - Run Lighthouse via Playwright or a custom script.  
        - Fail if bundle size > React’s baseline × 1.2 or FCP > React’s FCP × 1.1.  
   - **Task 1.1.3**: Use `actions/cache@v2` for `node_modules` caching.  
   - **Task 1.1.4**: Protect the `main` branch to require passing workflows.  
   

2. **Verify CI Runs on Blank State**  
   - **Task 1.2.1**: Commit an empty change (`README.md` whitespace) to trigger CI.  
   - **Task 1.2.2**: Fix any immediate lint/type errors until “lint-type” job passes.  
   - **Task 1.2.3**: Add a trivial Vitest test (`src/__tests__/smoke.test.ts`) that always passes; confirm unit job runs.  
   - **Task 1.2.4**: Run `npx playwright test` against a blank build (may all skip/fail, but ensure runner is installed).  

---

## Milestone 2: Establish React Testing Foundations

1. **Extract & Consolidate Mock Data**
    - **Task 2.1.1**: Locate all hard-coded or fixture data under `src/`.
    - **Task 2.1.2**: Copy JSON fixtures (e.g., sample users, chart data) into `mocks/` at repo root.
    - **Task 2.1.3**: Rename and organize files (e.g., `mocks/users.json`, `mocks/chart-series.json`).
    - **Task 2.1.4**: Update React components/tests to import from `../../mocks/...`.

2. **Set Up React Unit Testing (Vitest)**
    - **Task 2.2.1**: Ensure `vitest` is installed:
      ```bash
      npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
      ```  
    - **Task 2.2.2**: Create a basic Vitest config (`vitest.config.ts`) matching React repo’s TS settings.
    - **Task 2.2.3**: Write smoke-unit tests for core utilities (e.g., date formatters, sorting functions).
    - **Task 2.2.4**: Integrate Zod (or Yup) to validate mock data shapes. Write one test for `z.parse(mocks/users.json)`.

3. **Configure Mutation Testing (Stryker)**
    - **Task 2.3.1**: Install Stryker:
      ```bash
      npm install --save-dev @stryker-mutator/core @stryker-mutator/jest-runner
      ```  
    - **Task 2.3.2**: Add a `stryker.conf.json` targeting `src/utils` and `src/context` only.
    - **Task 2.3.3**: Run `npx stryker run`. Address any survived mutants by writing additional unit tests until ≥ 90% kill rate.

4. **Set Up Storybook for React (Visual Regression)**
    - **Task 2.4.1**: Install Storybook:
      ```bash
      npx sb init --builder @storybook/builder-vite
      ```  
    - **Task 2.4.2**: For each key component under `src/components/`, add a story in `src/components/<ComponentName>/<ComponentName>.stories.tsx`.
    - **Task 2.4.3**: Integrate Storybook’s snapshot addon (e.g., Chromatic or `@storybook/addon-storyshots`).
    - **Task 2.4.4**: Capture baseline snapshots for critical components (Sidebar, Table, Chart, Modal).

---

## Milestone 3: Generate & Refine React E2E + BDD Tests

1. **Generate Playwright Scripts via Codex**
    - **Task 3.1.1**: Prompt Codex to generate Playwright tests (TypeScript) for core flows:
        - Login flow (Auth forms)
        - Sidebar navigation to Dashboard, Tables, Charts, Users, Profile, 404
        - Create/Edit/Delete User (CRUD)
        - Verify Chart rendering with mock data
    - **Task 3.1.2**: Store tests in `e2e/playwright/tests/`.

2. **Generate Cucumber BDD Scenarios via Codex**
    - **Task 3.2.1**: Prompt Codex for Gherkin feature files under `e2e/features/`:
        - `auth.feature`: “Admin can log in/out”
        - `navigation.feature`: “Sidebar links route correctly”
        - `users.feature`: “Admin can manage users”
        - `charts.feature`: “Dashboard displays active users chart”
    - **Task 3.2.2**: Generate step definitions in `e2e/steps/` that invoke Playwright helpers.

3. **Manual Review & Flakiness Fixes**
    - **Task 3.3.1**: Run `npx playwright test` against `npm run dev`.
    - **Task 3.3.2**: Replace brittle text selectors with `data-testid` attributes (add these to React code as needed).
    - **Task 3.3.3**: Adjust timeouts, implement `await page.waitForSelector(...)` to address timing issues.

4. **Baseline Playwright Screenshots for Visual Regression**
    - **Task 3.4.1**: In Playwright tests, before assertions, add `await page.screenshot({ path: 'e2e/baseline-react/<test-name>.png' });`.
    - **Task 3.4.2**: Store all baseline images in `e2e/baseline-react/`.

5. **Verify CI Incorporates New Tests**
    - **Task 3.5.1**: Ensure `.github/workflows/react-ci.yml` runs the newly generated Playwright + Cucumber suite under the “e2e-visual” job.
    - **Task 3.5.2**: Merge a PR that adds a failing selector to confirm CI flags it.

---

## Milestone 4: Extract Shared Contracts & Align Lint/Type Settings

1. **Extract Shared Type Definitions**
    - **Task 4.1.1**: Under `src/types/`, create `User.ts`, `Role.ts`, `ChartData.ts`.
    - **Task 4.1.2**: Export interfaces matching React props/data shapes.
    - **Task 4.1.3**: Update React code and tests to import from `src/types` instead of inline types.

2. **Align ESLint & TypeScript for Both Repos**
    - **Task 4.2.1**: Copy React’s `tsconfig.json` and `eslint.config.js` (minus React-specific rules) into a template `config/solidjs/`.
    - **Task 4.2.2**: In SolidJS repo, install `eslint-plugin-solid` and adjust:
      ```jsonc
      {
        "extends": ["eslint:recommended", "plugin:solid/typescript"],
        "parserOptions": { "project": "./tsconfig.json", "jsxImportSource": "solid-js" },
        "rules": { /* mirror React rules, but drop React-hooks rules */ }
      }
      ```  
    - **Task 4.2.3**: Ensure `"strict": true` in both `tsconfig.json`.

---

## Milestone 5: Scaffold SolidJS Project & Tooling

1. **Scaffold SolidJS App**
    - **Task 5.1.1**: Run:
      ```bash
      cd ..
      npm init solid@latest solid-tailadmin
      cd solid-tailadmin
      ```  
      Choose: TypeScript + Vite.

2. **Integrate Tailwind CSS**
    - **Task 5.2.1**: Copy `tailwind.config.cjs` and `postcss.config.js` from React repo into `solid-tailadmin/`.
    - **Task 5.2.2**: In `index.css`, ensure:
      ```css
      @tailwind base;
      @tailwind components;
      @tailwind utilities;
      ```

3. **Configure Routing & Placeholder Pages**
    - **Task 5.3.1**: Install `solid-app-router`:
      ```bash
      npm install solid-app-router
      ```  
    - **Task 5.3.2**: In `src/App.tsx`, set up `<Routes>` pointing to placeholder pages:
      ```tsx
      import { Routes, Route } from "solid-app-router";
      import Dashboard from "./pages/Dashboard";
      // etc.
      function App() {
        return (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        );
      }
      ```  
    - **Task 5.3.3**: In `src/pages/`, create empty files: `Dashboard.tsx`, `Tables.tsx`, `Charts.tsx`, `Users.tsx`, `Profile.tsx`, `NotFound.tsx`, `Login.tsx` with placeholder `<h1>Loading…</h1>`.

4. **SolidJS Unit Testing Setup (Vitest + @testing-library/solid)**
    - **Task 5.4.1**: Install:
      ```bash
      npm install --save-dev vitest @testing-library/solid @testing-library/jest-dom jsdom
      ```  
    - **Task 5.4.2**: Add a basic test (`src/__tests__/signal.spec.ts`) to assert `createSignal` behavior.
    - **Task 5.4.3**: Copy shared `tsconfig.json` into Solid root, adjust `"jsxImportSource": "solid-js"`.

5. **Lint & Format for SolidJS**
    - **Task 5.5.1**: Copy the template ESLint config (`config/solidjs/eslint.config.js`) into `solid-tailadmin/.eslintrc.js`.
    - **Task 5.5.2**: Ensure Prettier config is present.
    - **Task 5.5.3**: Run `npm run lint` and `npm run typecheck` to verify a blank Solid scaffold passes.

---

## Milestone 6: Incremental Port & Validation

> **Strategy:** Port component-by-component (or page-by-page), running all React tests against the React build and all tests against the Solid build after each port.

### 6.1. Port Layout & Core Components First

#### 6.1.1. Sidebar & Header
- **Task 6.1.1.1**: Copy `src/components/Sidebar.tsx` → `solid-tailadmin/src/components/SidebarSolid.tsx`.
- **Task 6.1.1.2**: Replace `className=` → `class=`, convert `useState` → `createSignal`, convert `useEffect` → `createEffect`/`onCleanup`.
- **Task 6.1.1.3**: Copy `src/components/Header.tsx` → `HeaderSolid.tsx` and apply same conversions.
- **Task 6.1.1.4**: Import and render `<SidebarSolid />` and `<HeaderSolid />` around `<Outlet />` in `App.tsx`.
- **Task 6.1.1.5**: Write unit tests for `SidebarSolid`: render collapsed vs expanded states. Use `@testing-library/solid`.

#### 6.1.2. Global Context Providers
- **Task 6.1.2.1**: If React has a `UserContext.tsx`, port to Solid’s `createContext` + `useContext`.
- **Task 6.1.2.2**: Write a Vitest test to confirm provider passes correct default values.

#### 6.1.3. Run Baseline Validations
- **Task 6.1.3.1**: Build React (`npm run build`) and serve (e.g., `serve -s build -l 3000`).
- **Task 6.1.3.2**: Build Solid (`npm run build`) and serve on `:3001`.
- **Task 6.1.3.3**: Run React Playwright suite against `http://localhost:3000`: expect all tests passing.
- **Task 6.1.3.4**: Run Solid Playwright suite against `http://localhost:3001`: expect failures (placeholders). Confirm environment is wired correctly.

### 6.2. Port Pages One by One

#### 6.2.1. Dashboard Page
- **Task 6.2.1.1**: Copy `src/pages/Dashboard.tsx` → `solid-tailadmin/src/pages/Dashboard.tsx`.
- **Task 6.2.1.2**: Identify child components (e.g., `LineChart`, `Card`) and port them first. For each:
    - Convert `useState` → `createSignal`.
    - Convert `useEffect` chart initialization → `onMount`.
    - Wrap chart init in `onCleanup` for teardown.
- **Task 6.2.1.3**: Replace `className` → `class` in JSX.
- **Task 6.2.1.4**: Write Vitest unit tests for any helper functions used by Dashboard (e.g., data mappings).
- **Task 6.2.1.5**: Run:
    - React E2E + visual tests against `:3000`.
    - Solid E2E + visual tests against `:3001`.
    - **Functional**: All Playwright tests for `/dashboard` should pass in Solid.
    - **Visual**: Compare screenshot to React baseline via `await expect(page).toHaveScreenshot('baseline/dashboard.png', {threshold: 0.01})`.

#### 6.2.2. Tables Page
- **Task 6.2.2.1**: Copy `src/pages/Tables.tsx` → `Tables.tsx` in Solid.
- **Task 6.2.2.2**: Port any child components: `Table`, `Pagination`, `FilterBar`.
- **Task 6.2.2.3**: Convert React hooks → Solid signals/store.
- **Task 6.2.2.4**: Write unit tests for sorting and filtering functions.
- **Task 6.2.2.5**: Run both E2E + visual diff tests (threshold < 1%).

#### 6.2.3. Charts Page
- **Task 6.2.3.1**: Copy `src/pages/Charts.tsx` → `Charts.tsx` in Solid.
- **Task 6.2.3.2**: Port child chart components (`BarChart`, `PieChart`, etc.).
- **Task 6.2.3.3**: Use `onMount` to initialize Chart.js or ApexCharts.
- **Task 6.2.3.4**: Add unit tests mocking chart data update logic.
- **Task 6.2.3.5**: Run E2E + visual tests, compare screenshots.

#### 6.2.4. Users Page (CRUD)
- **Task 6.2.4.1**: Copy `src/pages/Users.tsx` → `Users.tsx` in Solid.
- **Task 6.2.4.2**: Port form components (e.g., `UserForm`). Convert `useForm` or `react-hook-form` usage (if present) into Solid’s form handling or `solid-forms`.
- **Task 6.2.4.3**: Port API call logic (fetch `mocks/users.json`) into Solid’s `createResource`.
- **Task 6.2.4.4**: Write Vitest tests for form validation functions.
- **Task 6.2.4.5**: Run E2E + visual tests; ensure “Create User” modal, “Edit User” flow, and “Delete User” confirmation work identically.

#### 6.2.5. Profile & 404 Page
- **Task 6.2.5.1**: Copy `src/pages/Profile.tsx` → `Profile.tsx` in Solid. Convert React-only hooks to Solid.
- **Task 6.2.5.2**: Copy `src/pages/NotFound.tsx` → `NotFound.tsx`. Minimal port (mostly JSX + Tailwind).
- **Task 6.2.5.3**: Write a quick unit test for `NotFound` to ensure it renders “404” text.
- **Task 6.2.5.4**: Run a Playwright test that navigates to a non-existent route (e.g., `/foo`) and confirms the 404 page in both React and Solid.

#### 6.2.6. Authentication (Login/Register)
- **Task 6.2.6.1**: Copy `src/pages/Login.tsx` and `src/pages/Register.tsx` (if exists) → `Login.tsx` / `Register.tsx` in Solid.
- **Task 6.2.6.2**: Replace React `useState` form handling with Solid signals and `onSubmit` handlers.
- **Task 6.2.6.3**: Write unit tests for input validation functions.
- **Task 6.2.6.4**: Run E2E tests: attempt login with valid/invalid credentials, compare behavior.

### 6.3. Port Shared Components & Utilities

#### 6.3.1. Tables, Forms, and Utilities
- **Task 6.3.1.1**: Copy `src/components/Table.tsx` → `TableSolid.tsx`. Convert React hooks → Solid signals.
- **Task 6.3.1.2**: Copy `src/components/FormElements/*` (e.g., `Input.tsx`, `Select.tsx`) → Solid equivalents. Remove any React-specific refs/logic.
- **Task 6.3.1.3**: Write Vitest tests to confirm sorting/filtering functions produce identical results.

#### 6.3.2. Modals, Dropdowns, Toggles (Headless UI or Alpine Alternatives)
- **Task 6.3.2.1**: If React uses `@headlessui/react` for dropdowns/modals, replace with Solid’s own `<Show>` and `<Portal>` logic or a Solid-compatible Headless UI port.
- **Task 6.3.2.2**: Write unit tests for “open/close” state of each modal and dropdown.
- **Task 6.3.2.3**: Run E2E tests for a sample modal (e.g., “Create User” modal).

---

## Milestone 7: Enhanced Validation & Quality Gates

1. **API Contract Verification**
    - **Task 7.1.1**: In React E2E tests, stub network calls:
      ```ts
      await page.route('**/api/users', route =>
        route.fulfill({ json: require('../mocks/users.json') })
      );
      ```  
    - **Task 7.1.2**: Mirror the same stubs in Solid E2E tests.
    - **Task 7.1.3**: Write a Vitest test in Solid that does `expect(UserSchema.parse(mocks/users)).toBeTruthy()`.

2. **Mutation Testing in Solid**
    - **Task 7.2.1**: Install Stryker in `solid-tailadmin`:
      ```bash
      npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
      ```  
    - **Task 7.2.2**: Configure `solid.stryker.conf.json` targeting the same utility files.
    - **Task 7.2.3**: Run `npx stryker run`. Achieve ≥ 90% mutation kill rate.

3. **Establish Visual Regression Baseline for Solid**
    - **Task 7.3.1**: Copy React baseline screenshots from `e2e/baseline-react/` into `e2e/baseline-solid/` (as placeholders for now).
    - **Task 7.3.2**: In Solid Playwright tests, at each critical step, run:
      ```ts
      const screenshot = await page.screenshot();
      expect(screenshot).toMatchSnapshot('baseline-react/<test-name>.png', { threshold: 0.01 });
      ```  
    - **Task 7.3.3**: Commit Solid’s initial screenshots after they match React’s baselines.

4. **Performance Smoke Tests**
    - **Task 7.4.1**: Write a Lighthouse script (or use Playwright + Lighthouse plugin) to measure:
        - JS bundle size
        - First Contentful Paint (FCP)
        - Time to Interactive (TTI)
    - **Task 7.4.2**: Define acceptable thresholds:
        - Solid bundle size ≤ React bundle size × 0.8.
        - FCP/TTI within 10% of React’s metrics.
    - **Task 7.4.3**: Integrate this as an optional CI check.

---

## Milestone 8: Finalize Solid CI/CD Pipeline & Merge Readiness

1. **Configure Solid CI Pipeline**
    - **Task 8.1.1**: Create `.github/workflows/solid-ci.yml` mirroring React CI, but pointing to Solid commands:
        1. **lint-type**: `npm ci && npm run lint && npm run typecheck`
        2. **unit-mutation** (depends on lint-type): `npm run test:unit && npx stryker run`
        3. **e2e-visual** (depends on unit-mutation):
            - Build: `npm run build`
            - Serve: `npm run preview`
            - Run `npx playwright test --config=e2e/playwright.config.ts`.
            - Visual assertions compare to React baselines under `e2e/baseline-react/`.
        4. **performance** (optional, after e2e-visual):
            - Run Lighthouse.
            - Fail if Solid’s bundle size > React’s × 1.2 or FCP > React FCP × 1.1.
    - **Task 8.1.2**: Use caching for `node_modules` via `actions/cache@v2`.
    - **Task 8.1.3**: Protect the `main` branch to require passing Solid CI.

2. **Dual-Track CI Validation**
    - **Task 8.2.1**: On React PRs: React CI must pass before merging.
    - **Task 8.2.2**: On Solid PRs: Solid CI must pass, and visual diffs vs. React baselines must be ≤ 1%.
    - **Task 8.2.3**: Block merges into `main` until both conditions are satisfied.

3. **Staging Deployment & QA**
    - **Task 8.3.1**: Deploy React build to `staging-react.sesame-idam.com`.
    - **Task 8.3.2**: Deploy Solid build to `staging-solid.sesame-idam.com`.
    - **Task 8.3.3**: Perform manual QA/A-B comparison in staging:
        - Compare component UIs side-by-side.
        - Validate that user flows (login, CRUD, chart updates) match exactly.

---

## Milestone 9: Cutover & Monitoring

1. **Production Switch**
    - **Task 9.1.1**: Update deployment scripts/hosting configuration to serve Solid build (e.g., Netlify’s publish directory) instead of React.
    - **Task 9.1.2**: Archive/deprecate React pipeline—document in README that Solid is now “authoritative.”

2. **Post-Deployment Smoke Checks**
    - **Task 9.2.1**: Run a short Playwright smoke suite against production Solid URL (`sesame-idam.com`):
        - Login → Dashboard load → Create a user → Logout.
    - **Task 9.2.2**: Run Lighthouse in prod and compare metrics to staging.

3. **Maintenance & Baseline Updates**
    - **Task 9.3.1**: Document “How to regenerate visual baselines” in `docs/Baselines.md`.
    - **Task 9.3.2**: Schedule a quarterly mutation test run and performance check.
    - **Task 9.3.3**: If TailAdmin React releases new components, manually port UI changes into Solid; then re-run E2E + visual tests to catch drift.

---

## Additional Best Practices

- **Component Storybook for Solid** (Optional but recommended)
    - Spin up Storybook in Solid to capture component stories.
    - Add visual snapshot tests to `stories.test.ts`.

- **Granular Commits & Branches**
    - Each ported component/page gets its own branch (e.g., `port/sidebar`, `port/dashboard`).
    - Merge only after passing React + Solid CI gates.

- **Code Review Checklist**
    - ✔ Tailwind classes unchanged unless intentional.
    - ✔ Signals or stores replace all React hooks.
    - ✔ All unit tests (Vitest) pass.
    - ✔ E2E tests pass in both React (baseline) and Solid.
    - ✔ Visual diffs ≤ 1%.
    - ✔ Performance budgets met.

- **Documentation**
    - Update `README.md` in Solid to reflect new usage.
    - Create a migration overview in `docs/Migration.md` summarizing differences (React hooks vs. Solid signals, router changes, lifecycle).

---

### Citations

- “TailAdmin React includes a sophisticated sidebar, data visualization, profile management, 404 page, tables, charts, auth forms, and more.”
- “React components list: Alert, Avatar, Badge, Breadcrumb, Button, Button Group, Card, Carousel, Dropdown, Images, Links, List, Modal, Notification, ProgressBar, Pagination, Popover, Ribbons, Spinner, Table, Tabs, Tooltips, Videos.”

---

**By following this Contributors Guide—with CI enforcement moved to the start—every Codex-generated pull request will be validated immediately, catching errors early and maintaining a green build throughout the migration.**
````

---