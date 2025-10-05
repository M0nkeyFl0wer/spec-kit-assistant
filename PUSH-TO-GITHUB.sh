#!/bin/bash
# 🐕 Push Spec Kit Assistant to GitHub
# Run this script to create the repo and push all code

set -e

echo "
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                  🐕 Pushing to GitHub!                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
"

# Check if we have a GitHub token
if [ -z "$GITHUB_TOKEN" ] && [ -z "$GH_TOKEN" ]; then
    echo "⚠️  No GitHub token found!"
    echo ""
    echo "Please either:"
    echo "  1. Set GITHUB_TOKEN environment variable"
    echo "  2. Or create the repo manually at:"
    echo "     https://github.com/new"
    echo ""
    echo "Then come back and run:"
    echo "  git push -u origin main"
    echo ""
    exit 1
fi

echo "📦 Creating repository on GitHub..."

# Create repo using GitHub API
REPO_NAME="spec-kit-assistant"
GITHUB_USER="M0nkeyFl0wer"

curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token ${GITHUB_TOKEN:-$GH_TOKEN}" \
  https://api.github.com/user/repos \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"🐕 Friendly dog assistant wrapper for GitHub Spec Kit - Makes spec-driven development delightful!\",
    \"homepage\": \"https://github.com/M0nkeyFl0wer/spec-kit-assistant\",
    \"private\": false,
    \"has_issues\": true,
    \"has_projects\": true,
    \"has_wiki\": false
  }"

echo ""
echo "✅ Repository created!"
echo ""

# Push to GitHub
echo "📤 Pushing code to GitHub..."
git push -u origin main

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║                   ✨ SUCCESS! ✨                                ║"
echo "║                                                                ║"
echo "║  Your code is now live at:                                    ║"
echo "║  https://github.com/M0nkeyFl0wer/spec-kit-assistant           ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🐕 Woof! Your Spec Kit Assistant is ready for the world!"
echo ""
