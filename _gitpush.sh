#!/bin/bash
set -e
REPO_DIR="/home/usama/Downloads/oromia-academy-platform-main"
cd "$REPO_DIR"

echo ">>> Staging all changes..."
git add -A

echo ">>> Git status:"
git status --short

echo ">>> Committing..."
git commit -m "feat: smart question paste, bulk save, exam UX, AI import, auth fixes, dark mode

- Smart paste mode: paste multiple questions at once, live parse preview
- Bulk save all detected questions with one button and course picker
- Fix broken async function declarations (server crash fix)
- AI-powered PDF/text import in exam wizard (OpenRouter GPT-4o-mini)  
- MCQ options as large clickable buttons, auto-advance on selection
- True/False as big card buttons with emoji
- Course free-text autocomplete in exam and question forms
- Admin /admin redirects to /admin/exams (remove redundant overview)
- Fix useTheme() to expose setTheme() alongside toggle()
- Sun/Moon icons replace emoji in admin sidebar theme toggle
- Improved dark mode CSS variables for better contrast
- Fix register() email normalisation for Firestore create rule
- Fix createUserProfile: uid, status, courseIds fields
- Fix claim-owner-banner: navigate to /admin after claiming
- Force-refresh ID token in use-server-fn; wait for auth hydration
- Wrap AI server errors in AppError so real message reaches client
- Update OPENROUTER_API_KEY
- Quick Publish/Unpublish button on exam list cards" 2>&1 || echo ">>> Nothing new to commit or commit failed"

echo ">>> Pushing to origin main..."
git push origin main 2>&1

echo ">>> DONE"
