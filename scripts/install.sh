#!/bin/bash
# T029: Install script implementation
# Constitutional CPU-conscious installation with platform detection
# Installs Spec Kit Assistant with animated Spec the Golden Retriever

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Constitutional limits
MAX_CPU_USAGE=10  # 10% CPU limit
ANIMATION_TIMEOUT=500  # 500ms max animation time
INSTALL_TIMEOUT=300  # 5 minutes max install time

# Installation state
INSTALL_DIR=""
NODE_VERSION=""
PLATFORM=""
ARCHITECTURE=""
REQUIREMENTS_MET=false
INSTALLATION_SUCCESS=false

# Spec the Golden Retriever ASCII Art
DOG_WELCOME='
    🐕 Spec the Golden Retriever
    ╭─────────────────────────╮
    │   Woof! Installing      │
    │   Spec Kit Assistant!   │
    ╰─────────────────────────╯
          ∩───∩
         (  ._. )
        o_(")(")
'

DOG_WORKING='
    🐕 Working...
    ╭─────────────────────────╮
    │   *tail wagging*        │
    │   Installing packages   │
    ╰─────────────────────────╯
          ∩───∩
         (  ^.^ )
        o_(")(")
'

DOG_SUCCESS='
    🐕 Success!
    ╭─────────────────────────╮
    │   All done! Good human! │
    │   Ready to fetch specs! │
    ╰─────────────────────────╯
          ∩───∩
         (  ≧.≦ )
        o_(")(")
'

DOG_ERROR='
    🐕 Oops!
    ╭─────────────────────────╮
    │   Something went wrong  │
    │   Need help? Woof!      │
    ╰─────────────────────────╯
          ∩───∩
         (  ¯.¯ )
        o_(")(")
'

# Logging with constitutional timing
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show animated character with constitutional timing
show_character() {
    local character="$1"
    local message="$2"

    if command -v tput >/dev/null 2>&1; then
        # Clear screen and show character with animation
        clear
        echo -e "${CYAN}$character${NC}"
        if [ -n "$message" ]; then
            echo -e "${BLUE}🐕 Spec: \"$message\"${NC}"
        fi

        # Constitutional 500ms delay
        sleep 0.5
    else
        # Fallback for limited terminals
        echo -e "${CYAN}🐕 $message${NC}"
    fi
}

# CPU monitoring function
check_cpu_usage() {
    if command -v top >/dev/null 2>&1; then
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
        local cpu_percent=${cpu_usage%.*}

        if [ "$cpu_percent" -gt "$MAX_CPU_USAGE" ]; then
            log_warning "CPU usage ($cpu_percent%) exceeds constitutional limit ($MAX_CPU_USAGE%)"
            log_info "Pausing installation to maintain constitutional compliance..."
            sleep 2
        fi
    fi
}

# Platform detection with constitutional constraints
detect_platform() {
    log_info "🔍 Detecting platform and system requirements..."

    PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCHITECTURE=$(uname -m)

    case "$PLATFORM" in
        "linux")
            log_success "✅ Linux platform detected: $PLATFORM"
            ;;
        "darwin")
            log_success "✅ macOS platform detected: $PLATFORM"
            ;;
        *)
            log_error "❌ Unsupported platform: $PLATFORM"
            log_error "Constitutional requirement: Linux or macOS only"
            exit 1
            ;;
    esac

    log_info "Architecture: $ARCHITECTURE"
}

# Node.js version detection and validation
check_nodejs() {
    log_info "🔍 Checking Node.js installation..."

    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        log_success "✅ Node.js found: $NODE_VERSION"

        # Extract major version number
        local major_version=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)

        if [ "$major_version" -ge 18 ]; then
            log_success "✅ Node.js version meets requirements (>=18)"
            return 0
        else
            log_error "❌ Node.js version $NODE_VERSION is too old (requires >=18)"
            return 1
        fi
    else
        log_error "❌ Node.js not found"
        log_info "Please install Node.js 18+ from: https://nodejs.org/"
        return 1
    fi
}

# Package manager detection
check_package_manager() {
    log_info "🔍 Checking package manager..."

    if command -v npm >/dev/null 2>&1; then
        local npm_version=$(npm --version)
        log_success "✅ npm found: v$npm_version"
        return 0
    else
        log_error "❌ npm not found"
        log_info "npm should be installed with Node.js"
        return 1
    fi
}

# Git detection
check_git() {
    log_info "🔍 Checking Git installation..."

    if command -v git >/dev/null 2>&1; then
        local git_version=$(git --version)
        log_success "✅ Git found: $git_version"
        return 0
    else
        log_warning "⚠️ Git not found - some features will be limited"
        log_info "Install Git for full functionality: https://git-scm.com/"
        return 1
    fi
}

# Terminal capabilities check
check_terminal() {
    log_info "🔍 Checking terminal capabilities..."

    local has_color=false
    local has_animation=false

    # Check color support
    if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
        local colors=$(tput colors 2>/dev/null || echo 0)
        if [ "$colors" -ge 8 ]; then
            has_color=true
            log_success "✅ Color terminal detected ($colors colors)"
        fi

        # Check cursor control for animations
        if tput cup 0 0 >/dev/null 2>&1; then
            has_animation=true
            log_success "✅ Animation support detected"
        fi
    fi

    if [ "$has_color" = false ]; then
        log_info "📟 Basic terminal detected - using fallback mode"
        export NO_COLOR=1
    fi

    if [ "$has_animation" = false ]; then
        log_info "📟 Limited animation support - using text mode"
        export SPEC_FALLBACK_MODE=true
    fi
}

# System requirements validation
validate_requirements() {
    log_info "📋 Validating system requirements..."

    local requirements_ok=true

    # Check platform
    detect_platform

    # Check Node.js
    if ! check_nodejs; then
        requirements_ok=false
    fi

    # Check package manager
    if ! check_package_manager; then
        requirements_ok=false
    fi

    # Check Git (optional but recommended)
    check_git

    # Check terminal capabilities
    check_terminal

    # Memory check (constitutional limit awareness)
    if command -v free >/dev/null 2>&1; then
        local available_mem=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        if [ "$available_mem" -lt 512 ]; then
            log_warning "⚠️ Low available memory ($available_mem MB) - installation may be slow"
        else
            log_success "✅ Sufficient memory available ($available_mem MB)"
        fi
    fi

    if [ "$requirements_ok" = true ]; then
        REQUIREMENTS_MET=true
        log_success "✅ All requirements met!"
        return 0
    else
        log_error "❌ Requirements not met"
        return 1
    fi
}

# Download and install Spec Kit Assistant
install_spec_kit() {
    show_character "$DOG_WORKING" "Installing Spec Kit Assistant packages..."

    log_info "📦 Installing Spec Kit Assistant..."

    # Set installation directory
    INSTALL_DIR="${HOME}/.spec-kit-assistant"

    # Create installation directory
    log_info "Creating installation directory: $INSTALL_DIR"
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"

    # Initialize package.json if not exists
    if [ ! -f "package.json" ]; then
        log_info "📋 Initializing package.json..."
        cat > package.json << 'EOF'
{
  "name": "spec-kit-assistant",
  "version": "1.0.0",
  "description": "Spec Kit Assistant with Spec the Golden Retriever",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "node --test",
    "spec": "node src/index.js",
    "woof": "node src/index.js woof-woof",
    "come-here": "node src/index.js come-here",
    "good-boy": "node src/index.js good-boy"
  },
  "dependencies": {
    "commander": "^11.0.0",
    "inquirer": "^9.2.0",
    "chalk": "^5.3.0",
    "figlet": "^1.7.0",
    "ora": "^7.0.0",
    "fs-extra": "^11.1.0"
  },
  "keywords": ["spec", "assistant", "github", "spec-kit", "golden-retriever"],
  "author": "Spec Kit Assistant",
  "license": "MIT"
}
EOF
    fi

    # Monitor CPU usage during installation
    check_cpu_usage

    # Install dependencies with constitutional timeout
    log_info "📦 Installing npm dependencies..."
    timeout "$INSTALL_TIMEOUT" npm install || {
        log_error "❌ Installation timed out or failed"
        return 1
    }

    # Monitor CPU after installation
    check_cpu_usage

    log_success "✅ Dependencies installed successfully"
    return 0
}

# Create executable wrapper script
create_wrapper() {
    log_info "🔗 Creating executable wrapper..."

    local wrapper_script="/usr/local/bin/spec"

    # Check if we can write to /usr/local/bin
    if [ -w "/usr/local/bin" ] || [ "$(id -u)" = "0" ]; then
        cat > "$wrapper_script" << EOF
#!/bin/bash
# Spec the Golden Retriever wrapper script
# Generated by install.sh

export SPEC_HOME="$INSTALL_DIR"
cd "\$SPEC_HOME"
node src/index.js "\$@"
EOF
        chmod +x "$wrapper_script"
        log_success "✅ Wrapper script created: $wrapper_script"
    else
        # Create user-local wrapper
        local user_bin="$HOME/.local/bin"
        mkdir -p "$user_bin"
        wrapper_script="$user_bin/spec"

        cat > "$wrapper_script" << EOF
#!/bin/bash
# Spec the Golden Retriever wrapper script
# Generated by install.sh

export SPEC_HOME="$INSTALL_DIR"
cd "\$SPEC_HOME"
node src/index.js "\$@"
EOF
        chmod +x "$wrapper_script"
        log_success "✅ Wrapper script created: $wrapper_script"
        log_info "Add $user_bin to your PATH to use 'spec' command globally"
    fi
}

# Verify installation
verify_installation() {
    log_info "🔍 Verifying installation..."

    # Check if main files exist
    if [ -f "$INSTALL_DIR/package.json" ] && [ -d "$INSTALL_DIR/node_modules" ]; then
        log_success "✅ Installation files verified"
    else
        log_error "❌ Installation verification failed"
        return 1
    fi

    # Test basic functionality
    cd "$INSTALL_DIR"
    if timeout 10 node -e "console.log('Node.js test successful')" >/dev/null 2>&1; then
        log_success "✅ Node.js execution test passed"
    else
        log_error "❌ Node.js execution test failed"
        return 1
    fi

    INSTALLATION_SUCCESS=true
    return 0
}

# Cleanup function
cleanup() {
    local exit_code=$?

    if [ $exit_code -ne 0 ] && [ "$INSTALLATION_SUCCESS" = false ]; then
        show_character "$DOG_ERROR" "Installation failed! Need help?"
        log_error "Installation failed with exit code $exit_code"

        if [ -d "$INSTALL_DIR" ] && [ -n "$INSTALL_DIR" ]; then
            log_info "Cleaning up failed installation..."
            rm -rf "$INSTALL_DIR"
        fi
    fi

    exit $exit_code
}

# Main installation function
main() {
    # Set up cleanup trap
    trap cleanup EXIT

    # Welcome message
    show_character "$DOG_WELCOME" "Welcome! Let's install Spec Kit Assistant!"

    log_info "🚀 Starting Spec Kit Assistant installation..."
    log_info "Constitutional compliance: CPU limit $MAX_CPU_USAGE%, timeout $INSTALL_TIMEOUT s"

    # Validate requirements
    if ! validate_requirements; then
        log_error "❌ System requirements not met"
        exit 1
    fi

    # Install Spec Kit Assistant
    if ! install_spec_kit; then
        log_error "❌ Installation failed"
        exit 1
    fi

    # Create wrapper script
    create_wrapper

    # Verify installation
    if ! verify_installation; then
        log_error "❌ Installation verification failed"
        exit 1
    fi

    # Success!
    show_character "$DOG_SUCCESS" "Installation complete! Ready to fetch specs!"

    log_success "🎉 Spec Kit Assistant installed successfully!"
    log_info ""
    log_info "📁 Installation directory: $INSTALL_DIR"
    log_info "🚀 Usage:"
    log_info "   spec fetch            # Start Spec (fetch specs!)"
    log_info "   spec fetch --spec <feature>  # Generate a specification"
    log_info "   spec come-here        # Call Spec for help"
    log_info "   spec woof-woof        # Interactive mode"
    log_info ""
    log_info "🐕 Spec says: \"Woof! Ready to help you create amazing specifications!\""

    INSTALLATION_SUCCESS=true
}

# Run main installation
main "$@"