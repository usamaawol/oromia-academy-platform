#!/bin/bash
REPO_DIR="/home/usama/Downloads/oromia-academy-platform-main"
LOG="$REPO_DIR/_gitlog.txt"
cd "$REPO_DIR"

{
  echo "=== START ==="
  echo "--- git add ---"
  git add -A
  echo "--- git status ---"
  git status --short
  echo "--- git log (latest) ---"
  git log --oneline -3
  echo "--- git commit ---"
  git commit -m "feat: smart paste bulk save, AI import, exam UX, auth/dark mode fixes" || echo "COMMIT_SKIPPED"
  echo "--- git push ---"
  git push origin main
  echo "=== SUCCESS ==="
} > "$LOG" 2>&1

echo "done" > "$REPO_DIR/_done.txt"
