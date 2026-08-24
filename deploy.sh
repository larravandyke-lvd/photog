#!/bin/bash
set -e
cd "$(dirname "$0")"
MESSAGE="${1:-Update $(date '+%Y-%m-%d %H:%M')}"
echo "→ Staging changes..."
git add -A
if git diff --cached --quiet; then
  echo "Nothing to deploy — no changes since the last commit."
  exit 0
fi
echo "→ Committing: $MESSAGE"
git commit -m "$MESSAGE"
echo "→ Pushing to GitHub..."
git push
echo ""
echo "✓ Pushed. Vercel will build and deploy automatically."
echo "  Watch progress at: https://vercel.com/dashboard"
echo "  Live site: https://photog-ten.vercel.app"
