#!/usr/bin/env bash
# Local gate for mol-todo-ship: unit tests and the production build.
# Exit 0 when both pass. Any other exit asks the formula to iterate.
set -u

ROOT=$(cd "$(dirname "$0")/.." && pwd)
# shellcheck disable=SC1091
source "$ROOT/scripts/check-env.sh"

cd "${GC_WORK_DIR:-$ROOT}"
if [[ ! -f package.json ]]; then
  echo "check-local: package.json not found in $(pwd)" >&2
  exit 1
fi

mkdir -p validation
LOG=validation/local.txt
: >"$LOG"

set +e
npm run test:run >>"$LOG" 2>&1
status=$?
if [[ $status -eq 0 ]]; then
  npm run build >>"$LOG" 2>&1
  status=$?
fi
set -e

if [[ $status -ne 0 ]]; then
  echo "local check failed (exit $status); see validation/local.txt" >&2
  exit "$status"
fi

echo "pass" >>"$LOG"
exit 0
