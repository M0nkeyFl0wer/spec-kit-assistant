#!/bin/bash
# One-liner installer for Spec Kit Assistant
# Usage: curl -fsSL https://raw.githubusercontent.com/M0nkeyFl0wer/spec-kit-assistant/main/install.sh | bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for required dependencies
check_dependencies() {
    local missing=()

    if ! command -v git &> /dev/null; then
        missing+=("git")
    fi

    if ! command -v node &> /dev/null; then
        missing+=("node")
    fi

    if ! command -v npm &> /dev/null; then
        missing+=("npm")
    fi

    if [ ${#missing[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing required dependencies: ${missing[*]}${NC}"
        echo ""
        echo "Please install them first:"
        echo ""
        # Detect OS and provide instructions
        if [ -f /etc/debian_version ]; then
            echo "  sudo apt update && sudo apt install -y git nodejs npm"
        elif [ -f /etc/fedora-release ]; then
            echo "  sudo dnf install -y git nodejs npm"
        elif [ -f /etc/arch-release ]; then
            echo "  sudo pacman -S git nodejs npm"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            echo "  brew install git node"
        elif [ -n "$TERMUX_VERSION" ]; then
            echo "  pkg install git nodejs-lts"
        else
            echo "  Install git, node, and npm for your system"
        fi
        echo ""
        exit 1
    fi

    # Check Node.js version (need 18+)
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        echo -e "${RED}❌ Node.js 18+ required (found: $(node -v))${NC}"
        echo "Please upgrade Node.js"
        exit 1
    fi
}

# Verify installation works
verify_installation() {
    local install_dir=$1

    # Check node_modules exists and has key packages
    if [ ! -d "$install_dir/node_modules/fs-extra" ]; then
        echo -e "${RED}❌ Dependencies not installed correctly${NC}"
        return 1
    fi

    if [ ! -d "$install_dir/node_modules/chalk" ]; then
        echo -e "${RED}❌ Dependencies not installed correctly${NC}"
        return 1
    fi

    # Quick syntax check on main file
    if ! node --check "$install_dir/spec-assistant.js" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Warning: Main script has syntax issues${NC}"
    fi

    return 0
}

# Check dependencies first
check_dependencies

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
if ! npm install --silent --ignore-scripts 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Silent install failed, trying verbose...${NC}"
    npm install --ignore-scripts
fi

# Verify the installation worked
echo "🔍 Verifying installation..."
if ! verify_installation "$INSTALL_DIR"; then
    echo -e "${RED}❌ Installation verification failed${NC}"
    echo "Try running manually:"
    echo "  cd $INSTALL_DIR && npm install"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies verified${NC}"

# Make additional scripts executable
chmod +x come-here-spec.sh 2>/dev/null || true

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
