#!/bin/bash
# Script to remove sensitive data from git history
# Uses git-filter-repo (install with: pip install git-filter-repo)

set -e

echo "🧹 Cleaning Git History of Sensitive Data"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git-filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
    echo -e "${YELLOW}git-filter-repo is not installed. Installing...${NC}"
    pip install git-filter-repo
fi

# Create backup
echo -e "${YELLOW}Creating backup branch...${NC}"
git branch backup-before-cleaning 2>/dev/null || true

# Sensitive strings to remove
SENSITIVE_STRINGS=(
    "REMOTE_HOST"
    "REMOTE_USER"
    ":REMOTE_PORT"
    "REMOTE_SERVER_HOST=remote-server"
    "REMOTE_SERVER_USER=m0nkey"
)

echo -e "${YELLOW}Removing sensitive strings from git history...${NC}"
echo "This may take a few minutes..."
echo ""

# Create expressions file
cat > /tmp/sensitive-strings.txt << EOF
REMOTE_HOST
REMOTE_USER
REMOTE_SERVER_HOST=REMOTE_HOST
REMOTE_SERVER_PORT=8888
REMOTE_SERVER_USER=REMOTE_USER
ssh://REMOTE_USER@REMOTE_HOST:REMOTE_PORT
EOF

# Use git-filter-repo to replace sensitive strings
echo -e "${YELLOW}Running git-filter-repo...${NC}"
git-filter-repo --replace-text /tmp/sensitive-strings.txt --force

# Clean up
rm /tmp/sensitive-strings.txt

echo -e "${GREEN}✅ Git history cleaned!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT NEXT STEPS:${NC}"
echo "1. Review the changes: git log --oneline"
echo "2. Force push to remote: git push origin main --force"
echo "3. Notify team members to re-clone the repository"
echo ""
echo -e "${RED}WARNING: This is a destructive operation!${NC}"
echo "All team members will need to re-clone the repository."
echo ""
echo "To restore from backup: git checkout backup-before-cleaning"
