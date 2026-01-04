#!/bin/bash
# One-liner installer for Spec Kit Assistant
# Usage: curl -fsSL https://raw.githubusercontent.com/M0nkeyFl0wer/spec-kit-assistant/main/install.sh | bash

set -e

# Show the pixel dog logo first!
cat << 'EOF'
                                         ██████          ██████
                                       ██▓▓▓▓▓▓██████████▓▓▓▓▓▓██
                                       ██▓▓▓▓██          ██▓▓▓▓██
                                       ██▓▓████    ▓▓▓▓▓▓████▓▓██
   ███████╗██████╗ ███████╗ ██████╗    ██  ██  ██▓▓██▓▓██  ██
   ██╔════╝██╔══██╗██╔════╝██╔════╝        ██    ▓▓▓▓▓▓██
   ███████╗██████╔╝█████╗  ██║            ██              ██
   ╚════██║██╔═══╝ ██╔══╝  ██║            ██    ██████    ██
   ███████║██║     ███████╗╚██████╗       ██    ██████    ██
   ╚══════╝╚═╝     ╚══════╝ ╚═════╝       ██              ██
                                            ██    ██    ██
                                               ████░░████
                                                 ██░░██
                                                 ██░░██
                                                   ████

                  🌱 GitHub Spec Kit Assistant
              Spec-Driven Development Made Easy
EOF

echo ""
echo "🐕 Installing Spec Kit Assistant..."
echo ""

# Determine install location
INSTALL_DIR="${SPEC_INSTALL_DIR:-$HOME/spec-kit-assistant}"

# Clone repo
if [ -d "$INSTALL_DIR" ]; then
    echo "📁 Directory exists, pulling latest..."
    cd "$INSTALL_DIR"
    git pull --quiet
else
    echo "📥 Cloning repository..."
    git clone --quiet https://github.com/M0nkeyFl0wer/spec-kit-assistant.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Make run script executable
chmod +x run.sh

# Install dependencies silently
echo "📦 Installing dependencies..."
npm install --silent --ignore-scripts 2>/dev/null || npm install --ignore-scripts

# Create the 'spec' command wrapper
echo "🔧 Setting up commands..."

# Create bin directory if needed
mkdir -p "$HOME/.local/bin"

# Create the spec command script (direct CLI)
cat > "$HOME/.local/bin/spec" << SPEC_EOF
#!/bin/bash
# Spec Kit Assistant - Quick launcher
# Run 'spec' from anywhere!
cd "$INSTALL_DIR" && ./run.sh "\$@"
SPEC_EOF
chmod +x "$HOME/.local/bin/spec"

# Create the come-here-spec command (interactive launcher)
cat > "$HOME/.local/bin/come-here-spec" << SPEC_EOF
#!/bin/bash
# Come Here Spec - Interactive project launcher
exec "$INSTALL_DIR/come-here-spec.sh" "\$@"
SPEC_EOF
chmod +x "$HOME/.local/bin/come-here-spec"

echo ""
echo "✅ Installation complete!"
echo ""

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo "📝 Add this to your shell config to use 'spec' command anywhere:"
    echo ""

    # Detect shell
    if [ -n "$ZSH_VERSION" ] || [ "$SHELL" = "/bin/zsh" ] || [ "$SHELL" = "/usr/bin/zsh" ]; then
        echo "   echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.config/zsh/exports.zsh"
        echo "   source ~/.config/zsh/exports.zsh"
    else
        echo "   echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc"
        echo "   source ~/.bashrc"
    fi
    echo ""
fi

echo "🚀 Usage:"
echo "   come-here-spec          # Interactive launcher (recommended!)"
echo "   spec                    # Show help and available commands"
echo "   spec init \"My Project\" # Start a new project"
echo "   spec run \"build X\"     # Deploy AI swarm"
echo ""
echo "🐕 Woof! Ready to go! Run 'come-here-spec' to get started."
echo ""

# Ask if user wants to launch now
read -p "Launch Spec Kit Assistant now? [Y/n] " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    ./run.sh
fi
