---

## ROADMAP.md

```markdown
# TailAdmin React → SolidJS Migration Roadmap

This document provides a detailed listing of all React components, pages, and utilities, and now also includes the early CI setup step. Use this as an ordered roadmap to generate code tasks for porting each item into SolidJS. References are cited from the TailAdmin documentation and repository metadata.

---

## 0. Initial CI Setup (React Repository)

1. **React CI Workflow (`.github/workflows/react-ci.yml`)**
    - Create a GitHub Actions workflow that runs on `pull_request` to `main`.
    - Jobs (in order):
        1. **lint-type**: `npm ci && npm run lint && npm run typecheck`.
        2. **unit-mutation** (needs lint-type): `npm run test:unit && npx stryker run`.
        3. **e2e-visual** (needs unit-mutation):
            - Build: `npm run build`.
            - Serve: `npx serve -s build -l 3000`.
            - Run `npx playwright test` + Storybook snapshot tests.
        4. **performance** (optional, after e2e-visual): Lighthouse metrics.
    - Use `actions/cache@v2`.
    - Protect `main` to require passing jobs.

---

## 1. Repository Structure Overview

````

free-react-tailwind-admin-dashboard/
├── .github/
│   └── workflows/
│       └── react-ci.yml
├── public/
│   ├── favicon.ico
│   ├── index.html
│   └── assets/
├── src/
│   ├── components/
│   │   ├── Alert.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── Button.tsx
│   │   ├── ButtonGroup.tsx
│   │   ├── Card.tsx
│   │   ├── Carousel.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Header.tsx
│   │   ├── Images.tsx
│   │   ├── Links.tsx
│   │   ├── List.tsx
│   │   ├── Modal.tsx
│   │   ├── Notification.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Pagination.tsx
│   │   ├── Popover.tsx
│   │   ├── Ribbons.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Spinner.tsx
│   │   ├── Table.tsx
│   │   ├── Tabs.tsx
│   │   ├── Tooltips.tsx
│   │   ├── Videos.tsx
│   │   └── \[others…]
│   ├── context/
│   │   ├── UserContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts
│   │   └── useToggle.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Tables.tsx
│   │   ├── Charts.tsx
│   │   ├── Users.tsx
│   │   ├── Profile.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── NotFound.tsx
│   ├── utils/
│   │   ├── dateFormatter.ts
│   │   ├── sortHelpers.ts
│   │   ├── schemaValidators.ts
│   │   └── api.ts
│   ├── types/
│   │   ├── User.ts
│   │   ├── Role.ts
│   │   └── ChartData.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── tailwind.config.cjs
├── mocks/
│   ├── users.json
│   └── chart-series.json
├── .eslintrc.js
├── tsconfig.json
├── vite.config.ts
└── package.json

```
> **Note**: The `src/components/` directory includes all UI components; `src/pages/` defines page-level routes; `context/` and `hooks/` contain shared logic; `utils/` holds helper functions; `types/` houses TypeScript interfaces. 

---

## 2. Component & Page Listing

Below is an ordered list of all UI pieces you need to port. Each entry should be one task for Codex, translating from React → Solid. Follow this sequence so that dependencies (e.g., Dashboard → Chart components) are ported before parent pages.

### 2.1. Layout & Global Components

1. **Sidebar.tsx**  
   - Description: Main navigation menu visible across all pages.  
   - Dependencies: `Button.tsx`, `Avatar.tsx`, `Badge.tsx` 

2. **Header.tsx**  
   - Description: Top bar with title, notification icon, user avatar.  
   - Dependencies: `Avatar.tsx`, `Notification.tsx` 

3. **Modal.tsx**  
   - Description: Generic modal wrapper used by multiple pages (e.g., “Create User”).  
   - Dependencies: `Button.tsx`, `FormElements` 

4. **Dropdown.tsx**  
   - Description: Reusable dropdown menu component for user actions.  
   - Dependencies: None 

5. **Alert.tsx**  
   - Description: Banner alert (success/error) across pages.  
   - Dependencies: `Button.tsx` (for dismiss). 

6. **Button.tsx** & **ButtonGroup.tsx**  
   - Description: Base button styles and grouped buttons (e.g., in forms). 

7. **Card.tsx**  
   - Description: Container card used in Dashboard tiles.  
   - Dependencies: None 

8. **Spinner.tsx**  
   - Description: Loading spinner used in data-fetching pages. 

### 2.2. Basic UI Components

9. **Avatar.tsx**  
   - Description: Displays user profile image. 

10. **Badge.tsx**  
    - Description: Badge for user roles or status indicators. 

11. **Breadcrumb.tsx**  
    - Description: Breadcrumb navigation component. 

12. **Images.tsx**  
    - Description: Image wrapper with styling & placeholders. 

13. **Links.tsx**  
    - Description: Reusable `<a>` with Tailwind class default. 

14. **List.tsx**  
    - Description: Generic list component (e.g., list of notifications). 

15. **ProgressBar.tsx**  
    - Description: Visual progress bar for uploads or tasks. 

16. **Popover.tsx**  
    - Description: Tiny popup used for tooltips or quick info. 

17. **Ribbons.tsx**  
    - Description: Decorative ribbon label (e.g., “New”). 

18. **Tabs.tsx**  
    - Description: Tab navigation for profile sections, charts views. 

19. **Tooltips.tsx**  
    - Description: Hover tooltips for icons. 

20. **Pagination.tsx**  
    - Description: Table pagination control. 

21. **Notification.tsx**  
    - Description: Toast notifications for success/error events. 

22. **Carousel.tsx**  
    - Description: Image/content carousel (used on Dashboard preview). 

23. **Videos.tsx**  
    - Description: Video embed wrapper. 

---

## 3. Page Listing

For each page, port all child components first (e.g., if `Dashboard.tsx` uses `Card` and `LineChart`, port those before `Dashboard.tsx` itself).

### 3.1. Dashboard.tsx  
- **Description**: Main landing page showing key metrics and charts.  
- **Child Components**:  
  - `Card.tsx`  
  - `LineChart.tsx` (in `src/components/Charts/LineChart.tsx`)   
  - `BarChart.tsx` (in `src/components/Charts/BarChart.tsx`)   
  - `ProgressBar.tsx`  
  - `Carousel.tsx` (if used)  
- **Data Logic**:  
  - Fetch mock data from `mocks/chart-series.json`. 

### 3.2. Tables.tsx  
- **Description**: Displays tabular data with sorting & filtering.  
- **Child Components**:  
  - `Table.tsx`  
  - `Pagination.tsx`  
  - `Badge.tsx` (for status)  
  - `Spinner.tsx` (loading state)  
- **Data Logic**:  
  - Fetch mock user data from `mocks/users.json`.  
  - Use `sortHelpers.ts` for sorting. 

### 3.3. Charts.tsx  
- **Description**: Page dedicated to various chart types.  
- **Child Components**:  
  - `LineChart.tsx`  
  - `BarChart.tsx`  
  - `PieChart.tsx` (in `src/components/Charts/PieChart.tsx`)   
  - `DonutChart.tsx` (if present)  
- **Data Logic**:  
  - Use `chart-series.json` mocks. 

### 3.4. Users.tsx  
- **Description**: CRUD interface for “Users.”  
- **Child Components**:  
  - `Table.tsx` (to list users)  
  - `Modal.tsx` (to create/edit users)  
  - `FormElements/Input.tsx` (for form fields)  
  - `FormElements/Select.tsx` (for role dropdown)  
  - `Button.tsx` (for Save/Delete)  
  - `Spinner.tsx` (loading states)  
- **Data Logic**:  
  - Fetch `users.json`.  
  - Use `api.ts` for create/update/delete (mocked). 

### 3.5. Profile.tsx  
- **Description**: User profile management page.  
- **Child Components**:  
  - `Avatar.tsx`  
  - `FormElements/Input.tsx`  
  - `FormElements/Textarea.tsx` (if present)  
  - `Tabs.tsx` (if profile has multiple sections)  
- **Data Logic**:  
  - Load current user from `UserContext`. 

### 3.6. Login.tsx & Register.tsx  
- **Description**: Authentication forms.  
- **Child Components**:  
  - `FormElements/Input.tsx`  
  - `Button.tsx`  
  - `Alert.tsx` (error messages)  
- **Data Logic**:  
  - Use `useAuth.ts` hook to handle submission (mocked). 

### 3.7. NotFound.tsx  
- **Description**: 404 page shown for unmatched routes.  
- **Child Components**:  
  - `Button.tsx` (back to home)  
  - `Images.tsx` (illustration)  
- **Data Logic**:  
  - None (static). 

---

## 4. Contexts & Hooks

### 4.1. UserContext.tsx  
- **Purpose**: Provides current user data & auth state.  
- **Dependencies**: `useAuth.ts`, `api.ts`  
- **Porting Notes**:  
  - Convert React `createContext` → Solid’s `createContext`.  
  - Replace `useState` → `createStore` or `createSignal`. 

### 4.2. ThemeContext.tsx  
- **Purpose**: Manages dark/light mode.  
- **Porting Notes**:  
  - Same as above; use `localStorage` via `createSignal` + `createEffect`.

### 4.3. useAuth.ts  
- **Purpose**: Hook for login/logout.  
- **Porting Notes**:  
  - Convert `useState` → `createSignal`.  
  - Convert `useEffect` → `onMount`.

### 4.4. useFetch.ts  
- **Purpose**: Generic fetch hook for data.  
- **Porting Notes**:  
  - Convert `useState` → `createResource` or `createSignal`.  
  - Handle cleanup with `onCleanup`.

### 4.5. useToggle.ts  
- **Purpose**: Simple boolean toggle hook (sidebar collapse, modal open).  
- **Porting Notes**:  
  - Replace `useState(false)` with `createSignal(false)` and return `[state, () => set(!state())]`.

---

## 5. Utilities & Types

### 5.1. dateFormatter.ts  
- **Purpose**: Format dates for display.  
- **Porting Notes**: Pure utility function; no changes needed. Write Vitest tests to confirm identical outputs.

### 5.2. sortHelpers.ts  
- **Purpose**: Sort arrays of objects (e.g., users by last name).  
- **Porting Notes**: Pure functions—copy as is. Write unit tests if not present.

### 5.3. schemaValidators.ts  
- **Purpose**: Zod/Yup schemas for user data, chart series.  
- **Porting Notes**: Copy and import into Solid. Write unit tests verifying `schema.parse(...)` success.

### 5.4. api.ts  
- **Purpose**: API calls (GET, POST, PUT, DELETE) to endpoints.  
- **Porting Notes**: If using `fetch`, replace with Solid’s `createResource` or keep as pure functions. No major changes except handling signals.

### 5.5. Type Definitions (`src/types/`)  
- **Files**: `User.ts`, `Role.ts`, `ChartData.ts`  
- **Porting Notes**: Import these types into both React and Solid. No content change.

---

## 6. Testing Artifacts

### 6.1. Mocks (`mocks/`)  
- `users.json`: Sample user array (id, name, email, role).  
- `chart-series.json`: Sample chart data for line/bar/pie charts.

### 6.2. Storybook Stories (`src/components/**/*.stories.tsx`)  
- For each component listed in **2.1** & **2.2**, there should be an associated story file.  
- Visual snapshot baselines are stored under `.storybook/__snapshots__/` or via Chromatic.

### 6.3. Playwright & Cucumber (`e2e/`)  
- `e2e/playwright/tests/`: TypeScript test files for each flow.  
- `e2e/baseline-react/`: Baseline screenshots for React build.  
- `e2e/features/*.feature`: Gherkin scenarios.  
- `e2e/steps/*.ts`: Step definitions invoking Playwright.

---

## 7. Porting Order & Dependencies

1. **Initial CI Setup**  
   - See Section 0 above.

2. **Shared Utilities & Types**  
   - `dateFormatter.ts`, `sortHelpers.ts`, `schemaValidators.ts`, `api.ts`, `types/` 

3. **Global Contexts & Hooks**  
   - `UserContext.tsx`, `ThemeContext.tsx`, `useAuth.ts`, `useFetch.ts`, `useToggle.ts`

4. **Layout Components**  
   - `Sidebar.tsx`, `Header.tsx`, `Modal.tsx`, `Dropdown.tsx`

5. **Basic UI Components** (alphabetical for parallel work)  
   - `Alert.tsx`, `Avatar.tsx`, `Badge.tsx`, `Breadcrumb.tsx`,  
   - `Button.tsx`, `ButtonGroup.tsx`, `Card.tsx`, `Carousel.tsx`,  
   - `Images.tsx`, `Links.tsx`, `List.tsx`, `Notification.tsx`,  
   - `Pagination.tsx`, `Popover.tsx`, `ProgressBar.tsx`,  
   - `Ribbons.tsx`, `Spinner.tsx`, `Tabs.tsx`, `Table.tsx`,  
   - `Tooltips.tsx`, `Videos.tsx`

6. **Charts Components**  
   - `LineChart.tsx`, `BarChart.tsx`, `PieChart.tsx`, `DonutChart.tsx`

7. **Pages (in sequence)**  
   1. `Dashboard.tsx` (depends on Chart + Card)  
   2. `Tables.tsx` (depends on Table + Pagination + Badge + Spinner)  
   3. `Charts.tsx` (depends on all chart components)  
   4. `Users.tsx` (depends on Table, Modal, FormElements, Button, Spinner)  
   5. `Profile.tsx` (depends on Avatar, Tabs, FormElements)  
   6. `Login.tsx` & `Register.tsx` (depends on FormElements, Alert, Button)  
   7. `NotFound.tsx` (static, depends on Button, Images)

---

## 8. Post-Port Checks & Quality Gates

- For each ported item, ensure:  
  1. **Lint & Typecheck**: `npm run lint` & `npm run typecheck`.  
  2. **Unit Tests**:  
     - All relevant Vitest tests pass.  
     - Mutation tests show ≥ 90% kill rate on ported files.  
  3. **E2E & Visual Tests**:  
     - Run React baseline tests (serve React build); confirm no regressions.  
     - Run Solid tests (serve Solid build); confirm functional parity.  
     - Visual diffs ≤ 1% for all pages/components.  
  4. **Performance Check**:  
     - Compare Solid’s bundle size, FCP, and TTI to React baseline.  
     - Ensure Solid ≤ React × 1.1 for time metrics and ≤ React × 0.8 for bundle size.

---

## 9. Citations

- Component list derived from TailAdmin documentation:  
  - “React Components: Alert, Avatar, Badge, Breadcrumb, Button, Button Group, Card, Carousel, Dropdown, Images, Links, List, Modal, Notification, ProgressBar, Pagination, Popover, Ribbons, Spinner, Table, Tabs, Tooltips, Videos.”   
- Page features confirmed from React repo overview:  
  - “Includes prebuilt profile management and 404 page; Tables and Charts (Line & Bar); Authentication forms and input elements; Sophisticated sidebar.”   

---

This **ROADMAP.md**—now with an initial CI setup—should be used by Codex (or any other agent) to systematically generate port tasks and track migration progress, ensuring that every pull request is automatically validated. Each bullet above represents a discrete port task, in the correct dependency order.
```
