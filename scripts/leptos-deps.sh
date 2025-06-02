#!/usr/bin/env bash
set -euox pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd leptos
cargo fetch
cd "$REPO_ROOT"