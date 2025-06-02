# Agents Configuration & Guidelines

This document describes how we structure prompts, expected outputs, and iterative behavior for **Codex (or other AI assistants)** that autonomously assist in the React → SolidJS migration (and related tasks). We treat each major task as an “Agent” with a clear role. Every AI-generated contribution must be validated via our CI pipeline, ensuring that each generated PR is automatically tested before merge.

> **Note:** These guidelines are written for human maintainers and AI alike – to understand what the AI should do. If you’re a human contributor, you can also simulate these steps manually. If you’re setting up an AI agent (via the OpenAI API, etc.), use these as the specification for its prompt engineering.

---

## 1. Agent Roles & Capabilities

We have defined several agent roles, each focusing on a particular aspect of the project. The agents work in sequence or in parallel as needed:

1. **CI Setup Agent**
   - **Responsibility**: Create and maintain GitHub Actions workflows that validate both React and Solid code on every PR. This agent operates in **Code Mode** and can directly create or update workflow files and open pull requests.
   - **Capabilities**:
      - Generate YAML for workflows, namely:
         - `.github/workflows/react-ci.yml` (for running React app tests)
         - `.github/workflows/solid-ci.yml` (for Solid app tests)
         - `.github/workflows/leptos-ci.yml` (for Leptos app tests)
      - Ensure each workflow includes jobs for: linting, type-checking, unit tests, mutation tests, E2E tests, and visual regression tests, in proper sequence. Use caching (with `actions/cache`) to speed up dependencies installation.
      - Add branch protection rules (the agent can output instructions for maintainers to configure branch protection via GitHub UI or CLI, since direct setting might not be via code).
   - **Prompt Pattern (Example)**: *“Codex, create a GitHub Actions workflow file named `react-ci.yml` that runs on every pull_request to main and includes jobs: (1) lint and type-check (npm run lint && npm run typecheck), (2) unit & mutation tests (run Vitest and Stryker), (3) e2e & visual tests (build app, serve, run Playwright tests and Storybook visual tests), (4) performance budget (Lighthouse via Playwright). Use caching for node_modules. Output the YAML.”*
   - **Checkpoint**: A PR from this agent is successful when the workflow runs and passes on a trivial change (smoke test). This establishes the CI baseline (failing tests later will indicate issues with subsequent contributions).

2. **Test-Suite Generator Agent**
   - **Responsibility**: Build a comprehensive test suite for the existing React app, to ensure behavior is captured before migration. This agent operates in **Code Mode** and can create or update test files and open pull requests.
   - **Capabilities**:
      - Understand the React app’s file structure (`src/` content) and identify core user flows: e.g., logging in, navigating via sidebar, performing CRUD on a sample entity, viewing charts.
      - Produce **Playwright E2E test files** (TypeScript) that cover these flows, using `data-testid` attributes in the app for reliable selectors. Each test should simulate realistic user interaction and assert expected outcomes (URL changes, content appears, modals open, etc.).
      - Produce **.feature files** (Gherkin syntax) and corresponding step definitions (optional, if we use BDD style) to describe the flows in plain language – this can help QA or future test additions.
      - Create **Storybook stories** or direct component snapshot tests for key components (like Sidebar, Header, individual widgets) – to be used for visual regression. If Storybook is not set up, the agent can propose adding it.
   - **Prompt Pattern**: *“Codex, generate Playwright tests for the following flows in the React app: (1) Login (valid and invalid creds), (2) Sidebar navigation (click each menu, verify page loads), (3) User CRUD (create, edit, delete user on Users page), (4) Dashboard charts load with correct data). Use data-testid attributes for selectors. Each test in a separate `*.spec.ts` file under `e2e/tests/`. Also, provide a brief Gherkin feature outline for each flow.”*
   - **Checkpoint**: The test agent’s PR is merged when the new tests all pass against the React app and meaningfully cover >80% of user interactions (we aim for high coverage). Code coverage tools or reviewing the tests will ensure thoroughness.

3. **Component Port Agent**
   - **Responsibility**: Port individual React components and pages to SolidJS (and eventually to Leptos). This agent operates in **Code Mode** and can create or update component files and open pull requests.
   - **Capabilities**:
      - Parse a given React component file (TSX) and systematically transform it to SolidJS:
         - Remove or replace React-specific imports (`import React from 'react'` is not needed in Solid; React hooks replaced with Solid’s).
         - Convert stateful logic: `useState` -> `createSignal`, `useEffect` -> Solid’s `createEffect` or `onMount` (depending on the use case).
         - Convert JSX attributes: use `class=` instead of `className`, use Solid’s `<For>` or `<Show>` components for loops/conditionals that were JSX expressions.
         - Ensure event handlers and props pass correctly (Solid uses same JSX event syntax e.g. `onClick`, and props are passed similarly, but no synthetic event pooling like React).
         - Output the Solid component in a parallel directory (maintaining file name, e.g., `Sidebar.tsx` -> `SidebarSolid.tsx` in the Solid project structure).
         - *Leptos note*: A similar approach would be taken for Rust, but likely by a different specialized agent or after Solid is done.
      - Write a basic unit test for the Solid component if possible (or adapt the React one).
      - The agent should do minimal stylistic changes – aim for the Solid component to have an identical DOM structure and Tailwind classes as the React one (so that our visual tests pass).
   - **Prompt Pattern**: *“Codex, port the React component `src/components/Sidebar/Sidebar.tsx` to SolidJS. Steps: (1) Create `Sidebar.tsx` in `solid/src/components/Sidebar/` with analogous structure. (2) Replace React state with Solid signals: use createSignal for open/close state. (3) Replace any React effect with onMount (for any initialization). (4) Replace JSX attributes: className->class, etc. (5) Ensure the output HTML structure and classes remain the same. Provide the new SolidJS component code.”*
   - **Checkpoint**: A ported component is considered successful when:
      - It compiles in the Solid project (no TypeScript errors).
      - It passes all its associated tests (if the same Playwright or visual tests run on Solid, the component should behave the same).
      - Visual snapshot comparison shows no significant differences compared to React (except maybe minor expected differences in attributes, but pixel output should match).
      - The PR introducing the Solid component can be merged without breaking CI.

4. **Validation & Regression Agent**
   - **Responsibility**: After a batch of components/pages are ported, this agent verifies that everything works by running both versions and comparing results. This agent operates in **Code Mode** and can create or update validation scripts, test configs, and open pull requests.
   - **Capabilities**:
      - Programmatically run the React app and Solid app (maybe in CI or locally) – e.g., start both on different ports.
      - Execute the full Playwright test suite against both. Solid’s tests should all pass. If any fail in Solid but pass in React, identify which component or functionality is failing.
      - Take screenshots of key pages in both apps and do an image diff. Highlight any differences beyond the threshold (this could be automated via Playwright’s toMatchSnapshot or a custom diff tool).
      - Output a report summarizing: which tests passed/failed on Solid vs React, and which visual diffs were detected (with possibly a % difference).
      - This agent does *not* automatically fix things, but it provides detailed context for maintainers or triggers the Component Port Agent to re-port or adjust a component if an issue is found.
   - **Prompt Pattern**: *“Codex, run validation on the Solid app against the React baseline. Launch React app on port 3000 and Solid app on 3001. For each Playwright test scenario, run against both and ensure outcomes match. If a test fails on Solid, log which assertion failed. Also, for pages Dashboard, Users, Profile, take screenshots on both and compare pixel-wise. Report any differences >1%. Present a summary of results.”*
   - **Checkpoint**: The agent’s output (which may be in a comment on a PR or an artifact) shows **no regressions** or clearly pinpoints issues to fix. We will likely run this agent’s routine as part of CI (perhaps as a final step in the Solid CI workflow). Success is when Solid CI passes *and* visual/performance differences are within allowed range. This agent ensures we only merge Solid changes that maintain quality.

5. **Documentation Agent**
   - **Responsibility**: Keep documentation (like this file, README, ROADMAP, etc.) up-to-date as the project progresses. This agent operates in **Code Mode** and can create or update documentation files and open pull requests.
   - **Capabilities**:
      - Update **CONTRIBUTORS.md** when new contributors join or when guidelines evolve (for example, if we add a new agent role or change our branching strategy).
      - Update **ROADMAP.md** and **MILESTONES.md** as tasks are completed or new tasks identified. Ensure the timeline or task list reflects current reality (e.g., mark tasks as done, add new phases for Leptos after Solid is done, etc.).
      - Ensure **README.md** always accurately describes the state of the project (e.g., once the Solid version is functional, README should mention how to run it; if we archive the React version later, README should reflect that, etc.).
      - In general, ensure all references in docs (file paths, commands, version numbers) are correct after changes.
   - **Prompt Pattern**: *“Codex, the project structure changed: we moved Solid code into `/solid` directory. Update the README Installation section to mention how to install for Solid. Also update ROADMAP.md to mark milestone 1 as done and add a new milestone for Leptos exploration.”* (This would yield diffs for those files).
   - **Checkpoint**: Documentation agent’s changes are reviewed and merged when they improve clarity and accuracy of the docs. There’s no automated test for this, but maintainers will ensure the changes are factually correct. Documentation updates often accompany code changes in the same PR or can be separate documentation PRs.

Each agent’s operation results in a pull request (or set of PRs). We label these PRs with the agent name (e.g., `agent:ci-setup`, `agent:porting`) for clarity.
---

## 2. Prompt Patterns & Examples

This section provides concrete examples of prompts we use to direct the AI agents, along with expected output style. Maintaining consistent prompt patterns helps achieve consistent results from the AI.

### 2.1. Setting Up CI Workflows

<details>
<summary>**Prompt to CI Setup Agent** (example)</summary>

```txt
“Codex, create `.github/workflows/react-ci.yml` for the React repo. The workflow should run on `pull_request` to `main` and include:

1. `lint-type` job: install dependencies, run `npm run lint`, `npm run typecheck`.

2. `unit-mutation` job (needs `lint-type`): run `npm run test:unit` (Vitest) and `npx stryker run`.

3. `e2e-visual` job (needs `unit-mutation`): build React (`npm run build`), serve (`npx serve -s build -l 3000`), run `npx playwright test`, run Storybook snapshot tests (fail if visual drift > 1%).

4. `performance` job (needs `e2e-visual`): run Lighthouse (via Playwright–Lighthouse plugin) and fail if JS bundle > React baseline × 1.2, FCP > React FCP × 1.1.

Use `actions/cache@v2` for caching `~/.npm` or `node_modules`. Protect `main` so the workflow must pass before merges.”
````

</details>

**Expected Output**: The agent should output a YAML workflow file content that matches the description. It would define jobs for each step, perhaps something like:

* A job named `lint-type` running on Node latest, with steps to checkout, setup Node, install deps (with cache), and run lint and tsc.
* A job `unit-mutation` that depends on `lint-type`, runs tests and mutation testing.
* A job `e2e-visual` that depends on previous, builds the app, uses a simple server to serve the build, runs Playwright tests (headless), and perhaps runs a Storybook or visual regression command.
* A job `performance` that depends on e2e, runs a Lighthouse CI or custom script to measure bundle size and performance metrics.
* Proper uses of `needs`, caching, etc., as described.

This workflow, when committed, should kick off on PRs. We’ll manually verify it on a test PR (e.g., a PR that changes nothing significant but triggers the workflow).

### 2.2. Generating Playwright E2E Tests (React)

<details>
<summary>**Prompt to Test-Suite Generator Agent** (example)</summary>

```txt
“Codex, please generate a Playwright test suite for the TailAdmin React project. Cover these flows:

1. Login flow: navigate to `/login`, fill valid/invalid credentials, assert success/failure messages.

2. Sidebar navigation: click each sidebar item (Dashboard, Tables, Charts, Users, Profile, 404) and verify correct route + page header.

3. User CRUD: on `/users`, stub `mocks/users.json` and test 'Create User' form submission, 'Edit User' flow, and 'Delete User' confirmation.

4. Dashboard charts: stub `mocks/chart-series.json`, load `/dashboard`, and confirm that a Chart.js canvas is visible with expected data series.

Store tests under `e2e/playwright/tests/` using TypeScript and `data-testid` selectors.”
```

</details>

**Expected Output**: The agent should produce one or multiple `.spec.ts` files content. For example:

* `login.spec.ts`: contains a Playwright test that goes to `/login`, fills in a form (maybe using something like `await page.fill('[data-testid="email"]', 'admin@example.com')`, etc.), clicks login, expects navigation to dashboard or an error message.
* `navigation.spec.ts`: opens the app (assuming already logged in or using a context/file to bypass auth), then clicks sidebar links by locating them via data-testid or text, and asserts that the page’s H1 or title corresponds to the clicked section (e.g., clicking "Users" leads to page with heading "Users").
* `users.spec.ts`: maybe using MSW or similar to stub network calls, but since this is a static template, perhaps just interacting with a fake form. Could fill the "Create User" form (if such exists in template) and simulate submission, then check if a new row appears.
* `dashboard.spec.ts`: ensures charts load (could check that the canvas element is present, maybe the agent suggests using a known chart library’s DOM structure to verify data or at least that no errors occurred).
* Possibly a `visual.spec.ts` or integrated in each spec to take screenshots.

It should also mention using `test.use({ storageState: 'state.json' })` or similar if login needs to be bypassed in subsequent tests, or it can perform login in a beforeAll.

We might provide a basic `data-testid` attributes in the React code for key elements if not already present (the agent might also propose adding those; if it does, those changes should be separate PR or mentioned).

Each test will end with assertions like `expect(await page.locator(...).textContent()).toContain(...)` or similar. We expect the agent to output code ready to be placed into files.

### 2.3. Porting a React Component to Solid

<details>
<summary>**Prompt to Component Port Agent** (example for Sidebar component)**</summary>

```txt
“Codex, port \`src/components/Sidebar.tsx\` from React → Solid:

- Rename file to `SidebarSolid.tsx` under `solid-tailadmin/src/components/`.
- Replace all `className=` with `class=`.
- Convert `const [open, setOpen] = useState(false)` → `const [open, setOpen] = createSignal(false)`.
- Replace `useEffect(() => { ... }, [])` with `onMount(() => { ... });` (if needed).
- Update imports: `import React, { useState, useEffect } from 'react'` → `import { createSignal, onMount } from 'solid-js'`.

Output a valid Solid component that compiles under Vite + SolidJS.”
```

</details>

**Expected Output**: The agent returns the content of `SidebarSolid.tsx`. For instance:

```tsx
import { createSignal, onMount } from 'solid-js';
import { NavLink } from '@solidjs/router'; // SolidJS equivalent for React Router's NavLink, if using Solid Router
import Logo from '../components/Logo';

const Sidebar: Component = () => {
  const [open, setOpen] = createSignal(false);
  const toggleOpen = () => setOpen(!open());

  onMount(() => {
    // any effect that was in React's useEffect
  });

  return (
    <aside class={`sidebar ${open() ? "open" : ""}`}> 
      {/* ... */}
      <button data-testid="sidebar-toggle" onClick={toggleOpen}>Toggle</button>
      <nav>
        <NavLink href="/dashboard" class="..." activeClass="...">Dashboard</NavLink>
        {/* ...other links... */}
      </nav>
    </aside>
  );
};

export default Sidebar;
```

The above is a hypothetical snippet. Key things: it should have `open()` wherever state is used in JSX, should not use React-specific things, and class names remain the same. It might also note that Solid’s `<NavLink>` usage differs (depending on the router library).

We’ll review such output to ensure:

* No React imports remain.
* Signals are used correctly (accessed as functions).
* All JSX attributes are Solid-compatible.
* The structure and classes match the original (so CSS works and visual diffs pass).

If the component was using context or Redux, the agent would also need to port those (Solid’s context or a simple signal store, etc.). For any missing pieces, the agent might generate stub implementations (like if React had `useContext(ThemeContext)`, Solid part might import a similar context from a Solid context file).

The agent should ideally also include any necessary import changes (e.g., use Solid’s router for NavLink, or adjust for different third-party libs if any).

### 2.4. Writing a Visual Regression Assertion

Sometimes the agents need to write tests or code for visual comparisons. For example, in the Playwright tests, we want to compare screenshots.

<details>
<summary>**Prompt to Validation Agent** (embedding a visual regression check)</summary>

```txt
“Codex, in the Playwright test for Dashboard, after navigating to `/dashboard`, add:

```

const screenshot = await page.screenshot();
expect(screenshot).toMatchSnapshot('baseline-react/dashboard.png', { threshold: 0.01 });

```

Ensure that snapshot testing uses the React baseline stored at `e2e/baseline-react/dashboard.png`. If the diff percentage exceeds 1%, the test fails.”
```

</details>

**Expected Output**: The agent modifies/outputs the test code including the snippet:

```ts
// ... after doing some interactions or waiting for chart to load:
const screenshot = await page.screenshot();
// Compare to baseline screenshot (pre-captured from React app)
expect(screenshot).toMatchSnapshot('baseline-react/dashboard.png', { threshold: 0.01 });
```

It might also mention that the baseline image should be present in the repo (for the React version, we would have committed baseline screenshots). The agent would know not to commit actual images (since those might be in Git LFS or a separate storage), but it’s okay to reference them.

This shows that our tests enforce that the Solid version (when running the same test) uses the *React’s baseline images* as the source of truth. The threshold of 0.01 (1%) means even tiny differences will be caught. We set such a tight threshold because ideally the UIs should be identical pixel-wise. In practice, fonts and anti-aliasing might cause minor differences, hence a small threshold.

### 2.5. Configuring Solid CI Workflow

<details>
<summary>**Prompt to CI Setup Agent** (for Solid CI)</summary>

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
   - Ensure visual assertions compare to React baselines under `e2e/baseline-react/`.

4. `performance` (optional, after `e2e-visual`):
   - Run Lighthouse via Playwright.
   - Fail if Solid’s bundle size > React’s × 1.2 or FCP > React FCP × 1.1.

Use caching for `node_modules` via `actions/cache@v2`. Protect `main` to require passing jobs.” 
```

</details>

**Expected Output**: Similar to the React CI, but adjusted for Solid:

* The Solid CI might run in a separate directory (if the Solid code is in `solid/` subfolder, the workflow might `working-directory: solid/tailadmin-solidjs` in each step or do a checkout and then `cd solid/...`).
* Jobs largely mirror React, but any Solid-specific command differences (maybe `npm run dev` vs `npm run start`, etc.). If we structure the Solid project similarly with scripts, it should be close.
* Ensuring that for visual tests, the config or environment points Playwright to the correct base URL (if we serve Solid app on port 4173 by default with `npm run preview`, we might not need `serve` utility as Vite’s preview does it).
* It references the React baseline for screenshots, meaning the Solid tests should be configured to compare screenshots to files in `baseline-react/` directory.
* The performance job can reuse the same thresholds but perhaps the agent explicitly mentions checking the Solid bundle (which we might measure via output folder size or a Lighthouse metric for JS bytes).

The result is a YAML that, when run, will verify Solid build and tests just like we do for React.

---

## 3. Iterative Behavior & Checkpoints

To successfully use AI agents, we enforce iterative development with clear checkpoints where humans or CI validate the progress. Here’s how each stage is validated:

1. **Immediate CI Verification**
   \*Agent generates `react-ci.yml`.
   \*Agent ensures the first build on a trivial PR passes (e.g., a PR that just changes README triggers the workflow, it should succeed).
   *From now on, any further changes (tests, code, docs) must keep React CI green. We do not merge anything that breaks the baseline React functionality, as it’s our safety net.*

2. **Collective Test Coverage**
   \*Agent generates Playwright + BDD tests.
   \*Agent runs React CI; any failure is flagged immediately (e.g., if tests flake or need adjustments, fix now, not later).
   *By the end of this stage, we have high confidence in our test suite. We essentially freeze the React implementation (only minor fixes afterwards) and consider it the ground truth.*

3. **Port & Validate**
   \*Agent (or contributors) ports a single component or page at a time.
   \*Agent runs React CI against React build → must pass (ensuring the change didn’t accidentally break something in React, which can happen if shared files like configs changed).
   \*Agent runs Solid CI against Solid build → must pass **all tests and visual comparisons**. If Solid fails a test that React passed, the port isn’t correct – fix before proceeding. If visual snapshots differ, adjust the Solid code until it matches (or in rare cases update baseline if the difference is justified by an intentional change).
   *This step is repeated for each component/page. We suggest a PR per component or logical grouping. Only when both React and Solid checks are green do we merge each PR – this ensures partial progress can safely integrate into `main` without regressions.*

4. **Merge & Maintenance**
   \*Agent (or maintainer) merges the PR once all checks pass and reviewers approve.
   \*Agent (Documentation) updates docs (CONTRIBUTORS.md, ROADMAP.md, etc.) as needed to reflect any new structure (for example, once all pages are ported, docs might mention how to switch between React and Solid builds).
   *After merge, if any new upstream changes from TailAdmin need integration (e.g., a version 2.1 update with new components), those should be added to React first, tests updated, then ported to Solid with the same rigorous process. The agents can be invoked again for those changes.*
   *We keep using the validation agent for any new feature addition to ensure the two implementations remain in lockstep.*

---

**By following these agent guidelines** – especially with CI enforcement from the very start – Codex can generate, validate, and merge changes confidently, ensuring that each PR is automatically tested and that regressions are caught early. This collaborative approach between AI and human oversight will drive the TailAdmin migration to success, with high code quality and fidelity at each step.
