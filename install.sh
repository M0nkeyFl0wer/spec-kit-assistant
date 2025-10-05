#!/bin/bash
# 🐕 Spec Kit Assistant - One Command Install
# Makes setup butter smooth and lovely!

set -e

echo "
    🐕 Woof! Installing Spec Kit Assistant...

         |\__/,|   (\`\\
       _.|o o  |_   ) )
     -(((---(((--------
"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ first:"
    echo "   https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Clone repo
if [ ! -d "spec-kit-assistant" ]; then
    echo "📦 Cloning Spec Kit Assistant..."
    git clone https://github.com/M0nkeyFl0wer/spec-kit-assistant.git
    cd spec-kit-assistant
else
    echo "📂 Using existing spec-kit-assistant directory..."
    cd spec-kit-assistant
    git pull
fi

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install --silent

# Install uv package manager (for official Spec Kit)
if ! command -v uv &> /dev/null; then
    echo "📦 Installing uv package manager..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
fi

# Install official Spec Kit
echo "📦 Installing official GitHub Spec Kit..."
~/.local/bin/uv tool install .

# Make executable
chmod +x spec-assistant.js

# Add to PATH (optional)
echo ""
echo "✨ Installation complete!"
echo ""
echo "🐕 Spec is ready to help! Try these commands:"
echo ""
echo "   cd spec-kit-assistant"
echo "   node spec-assistant.js init \"My Awesome Project\""
echo ""
echo "🦴 For even easier access, add to your PATH:"
echo "   echo 'alias spec-assistant=\"$PWD/spec-assistant.js\"' >> ~/.bashrc"
echo ""
echo "🐕 Woof woof! Happy spec-driven development!"
echo ""
