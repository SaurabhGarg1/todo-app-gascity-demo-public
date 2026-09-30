#!/usr/bin/env bash
# Live gate for mol-todo-ship. Exit 75 while GitHub Pages is not serving
# this commit yet (does not spend a formula attempt). Exit 1 on a real
# validation failure. Exit 0 when Playwright agrees.
set -u

ROOT=$(cd "$(dirname "$0")/.." && pwd)
# shellcheck disable=SC1091
source "$ROOT/scripts/check-env.sh"

cd "${GC_WORK_DIR:-$ROOT}"
if [[ ! -f package.json ]]; then
  echo "check-pages: package.json not found in $(pwd)" >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "check-pages: node is not on PATH" >&2
  exit 1
fi

exec node "$ROOT/scripts/check-pages.mjs"
