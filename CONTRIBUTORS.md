Below are the three guide-files with GitHub Actions CI moved to the very beginning so that every Codex-generated PR is validated early. In each file, the CI setup sections are now among the first tasks.

---

## CONTRIBUTORS.md

````markdown
# Contributors Guide

This document outlines step-by-step instructions, best practices, and required tooling for migrating the **Free React Tailwind Admin Dashboard** (TailAdmin) into a SolidJS-based codebase while maintaining high quality, coverage, and visual parity. Follow each milestone, and refer back to this guide as you work.

---

## Prerequisites

1. **Node.js & Package Manager**  
   - Node.js 18.x or later (Node.js 20.x+ recommended).  
   - npm or yarn for dependency management.

2. **Git & GitHub**  
   - Clone the React repo:  
     ```bash
     git clone https://github.com/TailAdmin/free-react-tailwind-admin-dashboard.git
     cd free-react-tailwind-admin-dashboard
     ```

3. **Editors & Linters**  
   - ESLint configured for React (provided in `eslint.config.js`).  
   - Prettier for code formatting.  
   - TypeScript with `"strict": true` in `tsconfig.json`.

4. **Tailwind CSS**  
   - Already set up in the React repo (`postcss.config.js`, `tailwind.config.cjs`).  
   - You will copy these into the SolidJS project later.

5. **Testing Tools**  
   - Vitest (unit testing) for both React and Solid.  
   - Stryker for mutation testing.  
   - Playwright + Cucumber (BDD) for end-to-end tests.  
   - Storybook for component-level visual snapshot testing.





