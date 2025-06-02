#!/usr/bin/env bash
set -euox pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd solidjs
npm install
cd "$REPO_ROOT"