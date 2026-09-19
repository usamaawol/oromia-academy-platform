#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "=== Git status ==="
git status --short
echo "=== Staging all ==="
git add -A
echo "=== Committing ==="
git commit -m "fix: dark mode, AI import, exam UX, auth fixes, admin improvements"
echo "=== Pushing ==="
git push origin main
echo "=== Done ==="
