#!/bin/bash

# 🐕 Spec Kit Assistant - Instant Claude Deployment
# Run this single command to set up everything for spec-driven development

set -euo pipefail

BOLD='\033[1m'
CYAN='\033[1;96m'
GREEN='\033[1;92m'
YELLOW='\033[1;93m'
RED='\033[1;91m'
RESET='\033[0m'

# ASCII Art Welcome
clear
echo -e "${CYAN}"
cat << 'EOF'
 ____  ____  _____ ____   _____ ___   ___  _     _  _____ _____
/ ___||  _ \| ____/ ___| |_   _/ _ \ / _ \| |   | |/ /_ _|_   _|
\___ \| |_) |  _|| |       | || | | | | | | |   | ' / | |  | |
 ___) |  __/| |__| |___    | || |_| | |_| | |___| . \ | |  | |
|____/|_|   |_____\____|   |_| \___/ \___/|_____|_|\_\___| |_|

EOF
echo -e "${RESET}"

echo -e "${GREEN}🐕 Spec the Golden Retriever says: Welcome to instant deployment! ${RESET}"
echo -e "${YELLOW}🚀 Setting up your spec-driven development environment...${RESET}"
echo ""

# Create project directory
PROJECT_DIR="spec-kit-assistant"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}📁 Found existing $PROJECT_DIR, backing up...${RESET}"
    mv "$PROJECT_DIR" "${PROJECT_DIR}-backup-$(date +%s)"
fi

echo -e "${CYAN}📦 Cloning Spec Kit Assistant...${RESET}"
git clone https://github.com/M0nkeyFl0wer/spec-kit-assistant.git
cd "$PROJECT_DIR"

# Check Node.js
echo -e "${CYAN}🔍 Checking Node.js installation...${RESET}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first:${RESET}"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION found. Need version 18+${RESET}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) ready${RESET}"

# Install dependencies
echo -e "${CYAN}📦 Installing dependencies...${RESET}"
npm install --no-audit --no-fund

# Install ASCII art tools for full retro experience
echo -e "${CYAN}🎨 Installing ASCII art tools...${RESET}"
if command -v apt-get &> /dev/null; then
    sudo apt-get update -qq
    sudo apt-get install -y figlet toilet cowsay fortune-mod sl neofetch 2>/dev/null || echo "Some ASCII tools may not be available"
elif command -v brew &> /dev/null; then
    brew install figlet toilet cowsay fortune sl neofetch 2>/dev/null || echo "Some ASCII tools may not be available"
elif command -v pkg &> /dev/null; then
    pkg install -y figlet toilet cowsay fortune sl neofetch 2>/dev/null || echo "Some ASCII tools may not be available"
fi

# Create alias for easy access
SHELL_RC=""
if [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
elif [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
fi

if [ -n "$SHELL_RC" ]; then
    ALIAS_LINE="alias spec='$(pwd)/retro-spec.sh'"
    if ! grep -q "alias spec=" "$SHELL_RC"; then
        echo "" >> "$SHELL_RC"
        echo "# Spec Kit Assistant" >> "$SHELL_RC"
        echo "$ALIAS_LINE" >> "$SHELL_RC"
        echo -e "${GREEN}✅ Added 'spec' alias to $SHELL_RC${RESET}"
    fi
fi

# Make retro-spec executable
chmod +x retro-spec.sh

# Test the installation
echo -e "${CYAN}🧪 Testing installation...${RESET}"
if node src/index.js --help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Spec Kit Assistant installed successfully!${RESET}"
else
    echo -e "${RED}❌ Installation test failed${RESET}"
    exit 1
fi

# Final success message
echo ""
echo -e "${GREEN}${BOLD}🎉 SUCCESS! Spec Kit Assistant is ready!${RESET}"
echo ""
echo -e "${YELLOW}🚀 Quick Start Commands:${RESET}"
echo -e "  ${CYAN}./retro-spec.sh ramble${RESET}   - Start conversational spec creation"
echo -e "  ${CYAN}./retro-spec.sh swarm${RESET}    - Deploy agent swarms"
echo -e "  ${CYAN}./retro-spec.sh matrix${RESET}   - Enter the Matrix mode"
echo ""
echo -e "${YELLOW}📚 Full CLI:${RESET}"
echo -e "  ${CYAN}node src/index.js init${RESET}     - Interactive project setup"
echo -e "  ${CYAN}node src/index.js swarm${RESET}    - Agent swarm management"
echo -e "  ${CYAN}node src/index.js consult${RESET}  - Direct consultation with Spec"
echo ""

if [ -n "$SHELL_RC" ]; then
    echo -e "${YELLOW}💡 Pro tip: Restart your terminal or run:${RESET}"
    echo -e "  ${CYAN}source $SHELL_RC${RESET}"
    echo -e "  Then use: ${CYAN}spec ramble${RESET} from anywhere!"
else
    echo -e "${YELLOW}💡 Bookmark this location:${RESET} $(pwd)"
fi

echo ""
echo -e "${GREEN}🐕 Spec says: Ready to try building something together! Woof! 🎉${RESET}"
echo -e "${YELLOW}💡 Check HONEST_STATUS.md for what actually works right now${RESET}"

# Auto-start interactive consultation by default
echo ""
echo -e "${CYAN}🚀 Starting your first spec consultation with Spec!${RESET}"
echo -e "${YELLOW}🐕 Get ready for ASCII art, smart questions, and guided development${RESET}"

if [ "${1:-}" = "--no-start" ]; then
    echo -e "${GREEN}🎯 Installation complete! Run './retro-spec.sh ramble' when ready${RESET}"
else
    echo -e "${CYAN}⏳ Auto-starting in 3 seconds... (Ctrl+C to cancel)${RESET}"
    sleep 3

    echo -e "${GREEN}🎉 Welcome to your interactive spec creation experience!${RESET}"
    echo ""

    # Start the AMAZING first-run experience with mega dog art!
    node first-run.js
fi