#!/usr/bin/env bash
# SEC-06/SEC-07 workflow-posture grep-asserts (security review ACs 9-10):
#  1. every workflow declares top-level "permissions:" with "contents: read"
#  2. no pull_request_target trigger anywhere under .github/
#  3. every third-party action is pinned to a full 40-char commit SHA
set -u
fail=0

for f in .github/workflows/*.yml; do
  if ! grep -q '^permissions:' "$f" || ! grep -A2 '^permissions:' "$f" | grep -q 'contents: read'; then
    echo "FAIL: $f missing top-level 'permissions: contents: read'"
    fail=1
  fi
done

if grep -rn 'pull_request_target' .github/; then
  echo "FAIL: pull_request_target trigger found under .github/"
  fail=1
fi

unpinned=$(grep -nE 'uses:' .github/workflows/*.yml | grep -vE '@[0-9a-f]{40}' || true)
if [ -n "$unpinned" ]; then
  echo "FAIL: action reference(s) not pinned to a 40-char commit SHA:"
  echo "$unpinned"
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo "workflow-security grep-asserts FAILED"
  exit 1
fi
echo "workflow-security grep-asserts passed."
