#!/usr/bin/env bash
# Push the current branch, publish dist/ to gh-pages, and record the URL
# for scripts/check-pages.sh. GitHub MCP is not required.
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "publish-pages: origin is not configured" >&2
  exit 1
fi

ORIGIN=$(git remote get-url origin)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" == "HEAD" ]]; then
  echo "publish-pages: checkout a branch before publishing" >&2
  exit 1
fi

PATH_PART=${ORIGIN%.git}
PATH_PART=${PATH_PART#git@github.com:}
PATH_PART=${PATH_PART#ssh://git@github.com/}
PATH_PART=${PATH_PART#https://github.com/}
PATH_PART=${PATH_PART#http://github.com/}
OWNER=${PATH_PART%%/*}
REPO=${PATH_PART#*/}
OWNER_LC=$(printf '%s' "$OWNER" | tr '[:upper:]' '[:lower:]')
REPO_LC=$(printf '%s' "$REPO" | tr '[:upper:]' '[:lower:]')

if [[ "$REPO_LC" == *.github.io ]]; then
  BASE="/"
  URL="https://${REPO_LC}/"
else
  BASE="/${REPO}/"
  URL="https://${OWNER_LC}.github.io/${REPO}/"
fi

COMMIT=$(git rev-parse HEAD)

push_with_retry() {
  local attempt
  for attempt in 1 2 3; do
    if "$@"; then
      return 0
    fi
    echo "publish-pages: push failed (attempt ${attempt})" >&2
    sleep $((attempt * 2))
  done
  return 1
}

push_with_retry git push -u origin HEAD

npx tsc -b
npx vite build --base="$BASE"

MARKER="<!-- gc-build:${COMMIT} -->"
INDEX=dist/index.html
if [[ ! -f "$INDEX" ]]; then
  echo "publish-pages: dist/index.html was not produced" >&2
  exit 1
fi
if ! grep -q "gc-build:${COMMIT}" "$INDEX"; then
  # macOS and GNU sed differ; use a temporary file.
  {
    echo "$MARKER"
    cat "$INDEX"
  } >"${INDEX}.tmp"
  mv "${INDEX}.tmp" "$INDEX"
fi

DEPLOY=$(mktemp -d)
cleanup() { rm -rf "$DEPLOY"; }
trap cleanup EXIT

if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git clone --depth 1 --branch gh-pages "$ORIGIN" "$DEPLOY"
else
  git -C "$DEPLOY" init -b gh-pages
  git -C "$DEPLOY" remote add origin "$ORIGIN"
fi

find "$DEPLOY" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -a dist/. "$DEPLOY/"
git -C "$DEPLOY" add -A
if git -C "$DEPLOY" diff --cached --quiet; then
  echo "publish-pages: gh-pages already has this build"
else
  git -C "$DEPLOY" commit -m "Deploy ${COMMIT}"
  # gh-pages is a build artifact branch. Replace it when histories diverge.
  push_with_retry git -C "$DEPLOY" push --force-with-lease origin gh-pages \
    || push_with_retry git -C "$DEPLOY" push -u origin gh-pages
fi

if command -v gh >/dev/null 2>&1; then
  PAGES_BODY='{"build_type":"legacy","source":{"branch":"gh-pages","path":"/"}}'
  if ! printf '%s' "$PAGES_BODY" | gh api --method POST "repos/${OWNER}/${REPO}/pages" --input -; then
    printf '%s' "$PAGES_BODY" | gh api --method PUT "repos/${OWNER}/${REPO}/pages" --input - \
      || echo "publish-pages: could not enable Pages via gh; the site URL is still ${URL}" >&2
  fi
fi

mkdir -p validation
cat > validation/publish.json <<EOF
{"url":"${URL}","commit":"${COMMIT}"}
EOF

echo "published ${COMMIT} to ${URL}"
