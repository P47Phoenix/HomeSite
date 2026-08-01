#!/usr/bin/env bash
# Image smoke (QA contract F-5; TC-S6-04 / TC-S6-05): the IMAGE, not dist/, is
# the tested artifact. Asserts /healthz 200, the FR-02/F6 cache policy, the
# full SEC-09 header set, 404 on unknown paths (no wildcard-200), and non-root.
# Runs in CI with docker and locally with podman:
#   ENGINE=podman bash scripts/image-smoke.sh homesite:local
set -euo pipefail

IMAGE="${1:?usage: image-smoke.sh <image-ref>}"
ENGINE="${ENGINE:-docker}"
BASE="http://127.0.0.1:8080"

CID=$("$ENGINE" run -d -p 127.0.0.1:8080:8080 "$IMAGE")
cleanup() { "$ENGINE" rm -f "$CID" >/dev/null 2>&1 || true; }
trap cleanup EXIT

for _ in $(seq 1 30); do
  curl -fsS -o /dev/null "$BASE/healthz" 2>/dev/null && break
  sleep 1
done

FAIL=0
assert() {
  local desc="$1" actual="$2" pattern="$3"
  if printf '%s' "$actual" | grep -qiF -- "$pattern"; then
    echo "PASS: $desc"
  else
    echo "FAIL: $desc"
    echo "  expected to contain: $pattern"
    echo "  actual: $actual"
    FAIL=1
  fi
}

assert "/healthz returns 200" \
  "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/healthz")" "200"

assert "/ serves Cache-Control: no-cache" \
  "$(curl -sI "$BASE/" | tr -d '\r' | grep -i '^cache-control:' || true)" "no-cache"

ASSET=$(curl -s "$BASE/" | grep -oE 'assets/[^"]+\.(css|js)' | head -1 || true)
assert "a hashed asset is referenced by the served HTML" "$ASSET" "assets/"

assert "/$ASSET serves the immutable cache policy" \
  "$(curl -sI "$BASE/$ASSET" | tr -d '\r' | grep -i '^cache-control:' || true)" \
  "public, max-age=31536000, immutable"

HEADERS=$(curl -sI "$BASE/" | tr -d '\r')
assert "SEC-09 full CSP" "$HEADERS" \
  "default-src 'none'; style-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
assert "SEC-09 X-Content-Type-Options" "$HEADERS" "nosniff"
assert "SEC-09 Referrer-Policy" "$HEADERS" "no-referrer"
assert "SEC-09 X-Frame-Options" "$HEADERS" "DENY"

assert "unknown path returns 404 (no wildcard-200)" \
  "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/nope")" "404"

UID_IN_CONTAINER=$("$ENGINE" exec "$CID" id -u)
if [ "$UID_IN_CONTAINER" != "0" ]; then
  echo "PASS: container runs non-root (uid $UID_IN_CONTAINER)"
else
  echo "FAIL: container runs as root"
  FAIL=1
fi

if [ "$FAIL" -eq 0 ]; then
  echo "image smoke: ALL PASS"
else
  echo "image smoke: FAILED"
  exit 1
fi
