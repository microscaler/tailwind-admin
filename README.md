# tailwind-admin

This repository contains the TailAdmin React template alongside SolidJS and Leptos ports.

## Continuous Integration

Pull requests to `main` run three GitHub Actions workflows:

- **React CI** – executes lint, typecheck, placeholder tests and build under `react/`.
- **Solid CI** – mirrors the React workflow for the `solidjs/` project.
- **Leptos CI** – runs basic `cargo` checks for the Rust prototype in `leptos/`.

Enable branch protection for `main` so these workflows must pass before merging.
