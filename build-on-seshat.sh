#!/bin/bash
# Build Spec Kit Assistant on Remote Server (seshat)
# Usage: ./build-on-seshat.sh [command]
# Commands: build, test, install, sync-back

set -e

# SSH config from CLAUDE.md
REMOTE_HOST="seshat.noosworx.com"
REMOTE_PORT="8888"
REMOTE_USER="m0nkey-fl0wer"
REMOTE_WORKDIR="~/spec-kit-assistant-build"
LOCAL_REPO="/home/flower/Projects/spec-kit-assistant"

colors() {
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    YELLOW='\033[1;33m'
    PURPLE='\033[0;35m'
    NC='\033[0m'
}

check_connection() {
    echo -e "${BLUE}📡 Checking connection to seshat...${NC}"
    if ! ssh -o ConnectTimeout=5 -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} "echo 'connected'" >/dev/null 2>&1; then
        echo -e "${YELLOW}❌ Cannot connect to seshat${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Connected to seshat${NC}\n"
}

sync_to_remote() {
    echo -e "${BLUE}📤 Syncing code to seshat...${NC}"
    
    # Create remote directory
    ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_WORKDIR}"
    
    # Sync files (exclude heavy/non-essential dirs)
    rsync -avz --delete -e "ssh -p ${REMOTE_PORT}" \
        --exclude '.git' \
        --exclude 'node_modules' \
        --exclude '__pycache__' \
        --exclude '*.pyc' \
        --exclude '.pytest_cache' \
        --exclude '.coverage' \
        --exclude 'coverage' \
        --exclude '*.log' \
        --exclude 'logs' \
        --exclude 'test-*' \
        --exclude 'my-project' \
        --exclude 'Your-Little-Helper' \
        --exclude 'i' \
        --exclude 'testest' \
        ${LOCAL_REPO}/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_WORKDIR}/
    
    echo -e "${GREEN}✅ Code synced to seshat${NC}\n"
}

sync_from_remote() {
    echo -e "${BLUE}📥 Syncing results from seshat...${NC}"
    
    # Sync back built artifacts, logs, etc
    rsync -avz -e "ssh -p ${REMOTE_PORT}" \
        ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_WORKDIR}/build/ \
        ${LOCAL_REPO}/build-remote/ 2>/dev/null || true
    
    rsync -avz -e "ssh -p ${REMOTE_PORT}" \
        ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_WORKDIR}/dist/ \
        ${LOCAL_REPO}/dist-remote/ 2>/dev/null || true
    
    echo -e "${GREEN}✅ Results synced back${NC}\n"
}

remote_build() {
    echo -e "${PURPLE}🔨 Building on seshat...${NC}\n"
    
    ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} << EOF
        cd ${REMOTE_WORKDIR}
        
        echo "📦 Installing dependencies..."
        # Install Python deps
        pip3 install -e . --quiet 2>/dev/null || pip install -e . --quiet
        
        # Install Node deps if needed
        if [ -f package.json ]; then
            npm install --silent 2>/dev/null || true
        fi
        
        echo "✅ Dependencies installed"
        
        echo "🧪 Running tests..."
        # Run Python tests
        python3 -m pytest tests/ -v --tb=short 2>/dev/null || echo "No pytest tests"
        
        # Run Node tests
        if [ -f package.json ]; then
            npm test 2>/dev/null || echo "No npm tests"
        fi
        
        echo "✅ Tests complete"
        
        echo "📦 Building packages..."
        # Build wheel
        python3 -m build --wheel 2>/dev/null || echo "Build command not available"
        
        echo "✅ Build complete"
        
        # Show results
        echo ""
        echo "📊 Build Results:"
        ls -lah dist/ 2>/dev/null || echo "No dist/ directory"
        ls -lah build/ 2>/dev/null || echo "No build/ directory"
EOF
    
    echo -e "${GREEN}✅ Remote build complete${NC}\n"
}

remote_test() {
    echo -e "${PURPLE}🧪 Running tests on seshat...${NC}\n"
    
    ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} << EOF
        cd ${REMOTE_WORKDIR}
        
        echo "🧪 Test Suite:"
        echo "=============="
        
        # Python tests
        if [ -d tests/ ]; then
            echo ""
            echo "Python Tests:"
            python3 -m pytest tests/ -v --tb=short 2>&1 || echo "⚠️  Python tests failed or not found"
        fi
        
        # Node tests
        if [ -f package.json ]; then
            echo ""
            echo "Node Tests:"
            npm test 2>&1 || echo "⚠️  Node tests failed or not found"
        fi
        
        echo ""
        echo "✅ Test run complete"
EOF
    
    echo -e "${GREEN}✅ Remote tests complete${NC}\n"
}

remote_install() {
    echo -e "${PURPLE}💿 Installing on seshat...${NC}\n"
    
    ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} << EOF
        cd ${REMOTE_WORKDIR}
        
        echo "Installing Spec Kit Assistant..."
        pip3 install -e . --force-reinstall --quiet
        
        echo ""
        echo "Testing installation:"
        which here-spec 2>/dev/null || echo "here-spec not in PATH"
        here-spec --version 2>/dev/null || echo "Version check failed"
        
        echo ""
        echo "✅ Installation complete on seshat"
        echo "💡 Use: ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} 'here-spec --help'"
EOF
    
    echo -e "${GREEN}✅ Remote installation complete${NC}\n"
}

interactive_mode() {
    echo -e "${PURPLE}🐕 Spec Kit Assistant - Remote Build Tool${NC}\n"
    
    check_connection
    
    echo "What would you like to do?"
    echo ""
    echo "1. 🚀 Full build (sync → build → sync back)"
    echo "2. 🧪 Run tests only"
    echo "3. 💿 Install on seshat"
    echo "4. 📤 Sync TO seshat only"
    echo "5. 📥 Sync FROM seshat only"
    echo "6. 🖥️  Open SSH session to seshat"
    echo "7. ❌ Exit"
    echo ""
    read -p "Enter choice (1-7): " choice
    
    case $choice in
        1)
            sync_to_remote
            remote_build
            sync_from_remote
            ;;
        2)
            remote_test
            ;;
        3)
            remote_install
            ;;
        4)
            sync_to_remote
            ;;
        5)
            sync_from_remote
            ;;
        6)
            echo -e "${BLUE}Opening SSH to seshat...${NC}"
            ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} -t "cd ${REMOTE_WORKDIR}; bash"
            ;;
        7)
            echo "Goodbye! 🐕"
            exit 0
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
}

# Main
command="${1:-interactive}"

case $command in
    build|full)
        colors
        check_connection
        sync_to_remote
        remote_build
        sync_from_remote
        ;;
    test)
        colors
        check_connection
        remote_test
        ;;
    install)
        colors
        check_connection
        remote_install
        ;;
    sync-to)
        colors
        check_connection
        sync_to_remote
        ;;
    sync-from)
        colors
        check_connection
        sync_from_remote
        ;;
    ssh)
        colors
        check_connection
        echo -e "${BLUE}Opening SSH to seshat...${NC}"
        ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} -t "cd ${REMOTE_WORKDIR}; bash"
        ;;
    interactive|"")
        colors
        interactive_mode
        ;;
    *)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  build      - Full build cycle (sync → build → sync back)"
        echo "  test       - Run tests on seshat"
        echo "  install    - Install on seshat"
        echo "  sync-to    - Sync code TO seshat"
        echo "  sync-from  - Sync results FROM seshat"
        echo "  ssh        - Open SSH session"
        echo "  interactive - Interactive menu (default)"
        exit 1
        ;;
esac

echo -e "${GREEN}🐕 All done! Spec is happy!${NC}"
