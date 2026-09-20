#!/bin/bash
REPO_DIR="/home/usama/Downloads/oromia-academy-platform-main"
LOG="$REPO_DIR/_gitlog2.txt"
cd "$REPO_DIR"

{
  echo "=== START ==="
  git add -A
  git status --short
  git commit -m "fix: resolve session-expired on Vercel by embedding Firebase API key in SSR bundle

- Add GOOGLE_API_KEY to .env (same value as VITE_FIREBASE_API_KEY) so
  process.env['GOOGLE_API_KEY'] is available on the Vercel server runtime
- Fall back to import.meta.env.VITE_FIREBASE_API_KEY in verifyIdToken so
  the Vite-embedded build-time value is used even without runtime env vars
- Same fallback chain applied to systemDiagnostics apiKeySet check
- Fix corrupt async function remove() declaration in questions page
- Remove unused Wand2 import" || echo "COMMIT_SKIPPED"
  git push origin main
  echo "=== DONE ==="
} > "$LOG" 2>&1
