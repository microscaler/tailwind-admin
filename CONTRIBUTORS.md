# Contributors Guide

*Last updated: June 2025*

Thank you for considering contributing to the TailAdmin migration project! This guide is for all contributors – whether you are a human developer or an AI agent (like GitHub Copilot or OpenAI Codex) assisting with the code. We outline how to set up your environment, coding standards to follow, and the workflow we use to manage contributions in a task-oriented, AI-assisted manner.

## 1. Project Setup for Contributors

- **Repository Structure**: This monorepo contains multiple directories. The primary codebase is under `react/tailadmin-react-typescript-pro-2.0-main/` (the React Pro version). We will be adding a `solid/` directory for the SolidJS port (e.g., `solid/tailadmin-solidjs`), and potentially a `leptos/` directory for the Rust/Leptos port. Familiarize yourself with the `src` structure as described in the README and BACKGROUND documents.
- **Prerequisites**:
    - For React/SolidJS work: Node.js 22+ and a package manager (npm/yarn).
    - For Leptos work: Rust toolchain (Rust and Cargo) in addition to Node (since the project may still use npm scripts for front-end tooling like Tailwind).
    - Ensure you can run the React app (`npm run dev`) and run tests (`npm run test` etc.) to verify your environment.
- **Installing Dependencies**: After cloning, run `npm install` in the `react/tailadmin-react-typescript-pro-2.0-main` folder. For SolidJS (once the folder is generated), likely a separate `npm install` will be needed there. We keep dependencies separate for each framework to avoid version conflicts.
- **Branching Strategy**: We use a simple branching model on this project:
    - The **`main`** branch is the integration branch holding the latest stable code for all frameworks (React baseline and whatever parts of Solid/Leptos have been merged). Main is protected; direct pushes are not allowed.
    - For each contribution or set of related changes, create a **feature branch** (e.g., `feature/solid-button-port` or `fix/sidebar-bug-react`). If you are an AI agent operating via the AGENTS workflow, the system may create such branches for your changes as well.
    - Submit a Pull Request from your feature branch to `main`. Ensure your PR description clearly states what is being changed and references any related issue (if applicable).
- **Commit Messages**: Use clear, descriptive commit messages. If your commit is automated or AI-generated, please still ensure the message reflects the change (e.g., "Ported Button component to SolidJS" or "Added CI workflow for Solid tests"). This helps maintainers during review. We encourage prefixing commit messages with a tag when appropriate:
    - `[React] ...` for changes only in the React code.
    - `[Solid] ...` for SolidJS-related changes.
    - `[Leptos] ...` for Leptos/Rust changes.
    - `[Docs] ...` for documentation updates.
    - `[CI] ...` for continuous integration/config changes.
      These tags are not mandatory but helpful.

## 2. Coding Standards

- **Code Style**: The project generally follows standard Prettier and ESLint recommendations for React/TypeScript. Please run `npm run lint` and `npm run format` (if available) before committing to auto-fix formatting issues. The CI will catch lint errors.
- **TypeScript**: We use strict typing. When porting to Solid or writing new code, prefer explicit interfaces/types for component props and function returns. Avoid using `any` unless absolutely necessary.
- **React Specific**: If contributing to the React code, avoid altering the core logic or structure unless it's a fix – remember, the React code is our baseline that Solid/Leptos will be compared against. Any improvement or refactor in React should be mirrored to Solid code (and possibly re-verified via tests).
- **SolidJS Specific**: When writing SolidJS components:
    - Use Solid’s `createSignal`, `createEffect`, etc., instead of React’s hooks. For example, React’s `useState` becomes `createSignal`:contentReference[oaicite:85]{index=85}, `useEffect` often becomes `createEffect` or `onMount`:contentReference[oaicite:86]{index=86}, and context via `createContext`.
    - JSX differences: use `class=` instead of `className` in JSX markup:contentReference[oaicite:87]{index=87}. Solid’s JSX is very similar to React’s, but this is a key difference.
    - No need for dependency arrays (as in `useEffect`); Solid’s fine-grained reactivity handles it.
    - Write components as functions that return JSX or as Solid’s `Component<Props>` (if using their type).
    - We aim to keep the directory structure for Solid mirror to React’s: e.g., if React has `src/components/ui/Button.tsx`, Solid’s version might live in `solid/src/components/ui/Button.tsx`. This 1-to-1 mapping makes it easier to track parity.
- **Leptos Specific**: (If contributing to Leptos) We are in early stages here.
    - Try to mirror the component structure in Rust. Leptos uses a macro `view!` to define UI in a JSX-like syntax. We might create a Rust function or component for each React component.
    - Ensure feature parity: for instance, if a React component has interactive behavior (state changes, effects), the Leptos component should implement similar logic using Leptos signals/effects.
    - Follow Rust best practices (format with `rustfmt`, check lint with `cargo clippy`). We may add a Rust CI workflow as Leptos contributions ramp up.

- **Comments and Documentation**: If you introduce or port a complex piece of logic, please include comments explaining it. For example, if a React effect was doing something tricky and you convert it to Solid, comment why that effect exists. This is especially useful as we cross languages (TS to Rust). JSDoc or documentation comments for functions are welcome.

- **UI/UX Consistency**: Any changes to UI should be consistent with the TailAdmin design. If you’re unsure, consult the Figma (when available) or raise an issue/PR comment. We do not accept arbitrary restyling – the goal is to keep the design uniform across React, Solid, and Leptos.

## 3. Contribution Workflow

We follow a **task-oriented contribution model**. Large goals are broken into tasks (see **MILESTONES.md** and **AGENTS.md** for the breakdown). This means as a contributor, you can pick up a specific task, for example:
- “Write Playwright tests for user login/logout flow,” or
- “Port the Navbar component to SolidJS,” or
- “Implement the sidebar toggle in SolidJS,” or
- “Prototype the Dashboard page in Leptos with static data.”

Each task should be achievable in a reasonable time and result in a PR that passes all tests. We encourage you to:
1. **Check Issues or Milestones**: We track tasks as issues or in the Milestones document. Comment on an issue to let others know you’re working on it (to avoid duplication).
2. **Create Draft PRs early**: If you’ve started working on a task, open a draft PR. This allows maintainers to give early feedback. It’s also where automated agents might chime in with results (for example, CI failures that the AI can then address).
3. **Run Tests Locally**: Before marking a PR ready for review, run `npm run test:unit` and `npm run test:e2e` (and any relevant Leptos tests if applicable). Ensure everything passes locally and that your new code is covered by tests. If you are adding a new component, also add a test for it.
4. **Follow the Agent Guidelines if using AI**: If you are leveraging the AGENTS.md playbook with Codex, ensure you follow the prompt patterns described there. For example, if you ask Codex to port a component, you might use a prompt template like those in **AGENTS.md Section 2**:contentReference[oaicite:88]{index=88}:contentReference[oaicite:89]{index=89}. This consistency helps when multiple people/AI work on the project.

## 4. Collaboration Between Human & AI Contributors

This project treats AI as a collaborator under human supervision:
- We have defined distinct **Agent roles** (see AGENTS.md) that outline how an AI should contribute (in terms of expected output and iterative behavior):contentReference[oaicite:90]{index=90}:contentReference[oaicite:91]{index=91}. As a human contributor, you can also “play the role” of an agent by following those guidelines manually (for example, writing a CI workflow by following the steps under the CI Setup Agent).
- If you see an AI-generated PR (it will be labeled or commented as such), feel free to review it as you would a human PR. AI contributions go through the same review process.
- If you use an AI tool to generate part of your code, double-check the code for correctness and style. Do not blindly trust AI output, especially for security-sensitive code (e.g., authentication logic).
- **Ethics & Licensing**: Ensure that any code, whether written by you or suggested by AI, does not introduce licensing issues (don’t copy large swaths from proprietary code, for example). All code merged will be Apache-2.0 licensed, and contributors (human) are required to sign off that they have rights to contribute it. AI tools should be used only on input that is compatible with this licensing.

## 5. Communication

- **Issues and Discussions**: Use GitHub Issues to report bugs or propose enhancements. For general design discussions or questions (“How should we approach X in Solid?”), GitHub Discussions or our Discord channel are good places.
- **Pull Request Reviews**: Be constructive and patient. If you’re reviewing an AI’s PR, comment as if you were reviewing a junior developer’s code – point out issues, suggest improvements. A maintainer will likely then adjust the AI prompts or do a manual fix in response. If you’re reviewing a human’s PR, the same courtesy applies.
- **Coding Hours**: There are no strict hours – contributors around the world (and automated agents) might work at any time. We use CI as the always-on gatekeeper. If a test fails at 3am, an agent might auto-push a fix, or it might wait for a maintainer next day. We strive to keep `main` in a passing state.

## 6. Running CI and Tests Locally

It can be helpful to replicate CI tasks locally:
- **Lint/Format**: `npm run lint && npm run format:check` will run ESLint and Prettier checks.
- **Unit Tests**: `npm run test:unit` (for React tests, uses Vitest). We will have a similar command for Solid tests (likely also Vitest or Jest).
- **E2E Tests**: `npm run test:e2e` (this will start the app and run Playwright tests). Ensure you have a headless browser environment. You might need to build the app first (`npm run build`) or use `npm run dev` in parallel – see instructions in the Playwright config.
- **Visual Tests**: Our Playwright tests might save screenshots to `e2e/baseline-react/` and compare to `e2e/baseline-react/` for React, and similar for Solid. To update a baseline (if a legitimate UI change is made), you can run `npm run test:e2e -- --update-snapshots` (or a specific command to update snapshots).
- **Mutation Tests**: `npm run test:mutation` will run Stryker. This is a longer process – it’s okay to skip locally and let CI handle it, but if your PR fails due to mutation testing, you’ll need to debug why (mutation tests failing indicates not all code paths are properly tested).
- **Leptos tests**: If we introduce Rust tests, we will include instructions (likely `cargo test` in the leptos directory).

Remember that passing all tests locally does not guarantee a pass on CI (especially with visual tests which can be environment-sensitive). Always look at the CI results on your PR. Our GitHub Actions are configured to give detailed feedback (logs, screenshots on failure, etc.). If something is flaky or unclear, ask for help – we may need to adjust tests or workflows.

## 7. A Note on Tailwind CSS

Tailwind classes are pervasive in our JSX/HTML. When contributing:
- Use existing Tailwind utility classes and theme where possible instead of adding new CSS. The `tailwind.config.js` defines the theme. If you think a new utility or variant is needed, discuss first (e.g., enabling a new Tailwind plugin or adding a new color in the config).
- Naming conventions: We generally follow BEM-like semantics in class names if a custom class is ever used, but in most cases Tailwind alone suffices.
- Dark mode: TailAdmin uses `data-theme="dark"` attribute or similar toggling. If you introduce a component, ensure it supports dark mode styling (Tailwind’s dark: variant).
- RTL support: Currently not explicitly mentioned, likely not a focus, but keep it in mind (avoid hard-coding left/right styles that Tailwind can handle via RTL variants if needed in future).

## 8. Contribution Etiquette

- **Small, Focused PRs**: It’s better to submit multiple small PRs than one gigantic PR that does too many things. Small PRs are easier to review and test. Our milestone breakdown is meant to facilitate this.
- **Changelog**: We maintain a `CHANGELOG.md` (or will, as the project progresses). If your contribution is user-facing (like a new feature or a breaking change), please add an entry to the Unreleased section in the changelog.
- **Acknowledgment**: We list contributors in **CONTRIBUTORS.md** (this file) or a separate AUTHORS file. Feel free to add your name/handle in the Contributors section below in your first PR.
- **Code of Conduct**: Please be respectful in all communications. We follow the Contributor Covenant Code of Conduct (implicitly, as used by many GitHub projects). Harassment of any kind will not be tolerated.

## 9. Contributors

*(We will keep this list updated manually — if you contribute, you’re encouraged to add your name and affiliation here in your PR.)*

- **Microscaler Team (TailAdmin creators)** – Initial code and design.
- **Casibbald (Maintainer)** – Project lead for the migration (AI + community facilitator).
- **[Your Name]** – _Description of contribution_.

*(and so on…)*

---

Thank you once again for contributing. This project is quite ambitious in its scope (multi-framework support with AI assistance), and we hope it will be a fun and educational journey for everyone involved. If you have suggestions to improve these guidelines, feel free to open a PR for this file as well!
