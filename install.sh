#!/bin/bash
# One-liner installer for Spec Kit Assistant
# Usage: curl -fsSL https://raw.githubusercontent.com/M0nkeyFl0wer/spec-kit-assistant/main/install.sh | bash

set -e

echo "🐕 Installing Spec Kit Assistant..."

# Clone repo
if [ -d "spec-kit-assistant" ]; then
    echo "📁 Directory exists, pulling latest..."
    cd spec-kit-assistant
    git pull
else
    git clone https://github.com/M0nkeyFl0wer/spec-kit-assistant.git
    cd spec-kit-assistant
fi

# Make run script executable
chmod +x run.sh

# Install dependencies silently
echo "📦 Installing dependencies..."
npm install --silent --ignore-scripts 2>/dev/null || npm install --ignore-scripts

echo ""
echo "✅ Installation complete!"
echo ""

# Auto-launch
./run.sh
