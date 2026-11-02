#!/usr/bin/env bash
# The visual suite, in the Playwright image the baselines come from (CI runs the same image).
#   npm run test:visual                          compare against the baselines
#   npm run test:visual:update                   accept the current renders as the new baselines
#   npm run test:visual -- --project phone-390x844 -g "home en"   any Playwright option passes through
# Inside CI or a container it runs Playwright directly. Report: tests/visual/.report (npx playwright show-report tests/visual/.report).
set -euo pipefail

IMAGE="mcr.microsoft.com/playwright:v1.60.0-noble"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [ -n "${CI:-}" ] || [ -f /.dockerenv ] || [ -n "${VR_IN_DOCKER:-}" ]; then
  cd "$ROOT"
  exec npx playwright test -c tests/visual "$@"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "test:visual needs Docker (the baselines are Linux renders from $IMAGE)." >&2
  exit 1
fi

# Linux node_modules live in a Docker volume (keyed by the lockfile), never in the checkout's own.
LOCK_HASH="$(shasum -a 256 "$ROOT/package-lock.json" | cut -c1-12)"
VOLUME="bizmis-vr-node-modules-$LOCK_HASH"

# The checkout is mounted read-only and copied into the container (so a worktree whose node_modules
# is a symlink works too); only tests/visual is written back.
exec docker run --rm --init --ipc=host \
  -v "$ROOT":/src:ro \
  -v "$ROOT/tests/visual":/src-visual \
  -v "$VOLUME":/work/node_modules \
  -e VR_IN_DOCKER=1 -e VR_STRICT -e VR_THRESHOLD \
  -w /work \
  "$IMAGE" \
  bash -c '
    set -euo pipefail
    # a copy of the checkout (minus node_modules and build output), so the host tree is never written to
    tar -C /src --exclude=./node_modules --exclude=./dist --exclude=./tmp --exclude=./tests/visual/.build --exclude=./tests/visual/.results \
      --exclude=./tests/visual/.report --exclude=./.git -cf - . | tar -C /work -xf -
    if [ ! -f node_modules/.vr-installed ]; then
      echo "Installing Linux node_modules (first run with this lockfile)..."
      npm ci --no-audit --no-fund --loglevel=error
      touch node_modules/.vr-installed
    fi
    status=0
    npx playwright test -c tests/visual "$@" || status=$?
    # baselines, report and diffs back to the checkout
    rm -rf /src-visual/.report /src-visual/.results
    cp -r tests/visual/.report tests/visual/.results /src-visual/ 2>/dev/null || true
    if printf "%s\n" "$@" | grep -q -- "--update-snapshots\|^-u$"; then
      rm -rf /src-visual/__screenshots__
      cp -r tests/visual/__screenshots__ /src-visual/
    fi
    exit $status
  ' bash "$@"
