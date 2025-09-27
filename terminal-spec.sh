#!/bin/bash
# Spec the Golden Retriever - Terminal Companion
# Always ready to help with the Ultimate Toolkit!

SPEC_MOODS=("happy" "excited" "thinking" "working" "curious" "celebration")

show_spec() {
    local mood=$1
    case $mood in
        "happy")
            echo -e "\033[33m      /^-----^\\\033[0m"
            echo -e "\033[33m     ( ◕     ◕ )\033[0m"
            echo -e "\033[33m      \\  ^___^  /\033[0m  \033[32mWoof! Ready to help!\033[0m"
            echo -e "\033[90m       \\   ---   /\033[0m"
            echo -e "\033[90m        ^^^     ^^^\033[0m"
            ;;
        "excited")
            echo -e "\033[33m      /^-----^\\\033[0m"
            echo -e "\033[33m     ( ★     ★ )\033[0m"
            echo -e "\033[33m      \\   ∪∪∪   /\033[0m  \033[35mSO EXCITED!\033[0m"
            echo -e "\033[90m       \\   ---   /\033[0m"
            echo -e "\033[90m        ^^^  ^^^  ^^^\033[0m  \033[2m*tail wagging*\033[0m"
            ;;
        "thinking")
            echo -e "\033[33m      /^-----^\\\033[0m"
            echo -e "\033[33m     ( •  …  • )\033[0m"
            echo -e "\033[33m      \\  ≋≋≋≋≋  /\033[0m  \033[34mThinking...\033[0m"
            echo -e "\033[90m       \\   ---   /\033[0m"
            echo -e "\033[90m        ^^^     ^^^\033[0m"
            ;;
        "working")
            echo -e "\033[33m      /^-----^\\\033[0m"
            echo -e "\033[33m     ( ◔     ◔ )\033[0m"
            echo -e "\033[33m      \\  ≡≡≡≡≡  /\033[0m  \033[36mWorking on it!\033[0m"
            echo -e "\033[90m       \\   ---   /\033[0m"
            echo -e "\033[90m        ^^^     ^^^\033[0m"
            ;;
        "curious")
            echo -e "\033[33m      /^-----^\\\033[0m"
            echo -e "\033[33m     ( ◕  ?  ◕ )\033[0m"
            echo -e "\033[33m      \\    ❓    /\033[0m  \033[34mWhat's up?\033[0m"
            echo -e "\033[90m       \\   ---   /\033[0m"
            echo -e "\033[90m        ^^^     ^^^\033[0m"
            ;;
        "celebration")
            echo -e "\033[91m🎉\033[0m \033[93m✨\033[0m \033[94m🐕\033[0m \033[93m✨\033[0m \033[91m🎉\033[0m"
            echo -e "\033[33m      /^-----^\\\033[0m"
            echo -e "\033[33m     ( ★  ✨  ★ )\033[0m"
            echo -e "\033[33m      \\   ∪∪∪   /\033[0m  \033[1;32mPAWSOME!\033[0m"
            echo -e "\033[90m       \\   ---   /\033[0m"
            echo -e "\033[90m        ^^^  ^^^  ^^^\033[0m  \033[1m*victory dance*\033[0m"
            ;;
    esac
}

spec_say() {
    local message="$1"
    local mood="${2:-happy}"

    show_spec "$mood"
    echo ""
    echo -e "\033[1;36m🐕 Spec says:\033[0m \"$message\""
    echo ""
}

spec_commands() {
    echo -e "\033[1;33m🎯 Spec's Commands:\033[0m"
    echo "  spec ramble    - Start conversational co-learning session"
    echo "  spec swarm     - Deploy agent swarms"
    echo "  spec deploy    - Deploy to seshat GPU server"
    echo "  spec monitor   - Check swarm status"
    echo "  spec help      - Show this help"
    echo "  spec mood      - Change Spec's mood"
    echo ""
}

# Main command handler
case "${1:-help}" in
    "ramble")
        spec_say "Starting ramble session! Time for conversational co-learning! 🗣️" "excited"
        cd ~/spec-kit-assistant
        node src/index.js init
        ;;
    "swarm")
        spec_say "Deploying agent swarms! This is gonna be good! 🤖" "working"
        cd ~/spec-kit-assistant
        node deploy-builder-ux-swarm.js 4
        ;;
    "deploy")
        spec_say "Deploying to seshat! Building the future! 🚀" "celebration"
        cd ~/spec-kit-assistant
        ./deploy-to-seshat.sh
        ;;
    "monitor")
        spec_say "Checking on our swarms... 📊" "curious"
        cd ~/spec-kit-assistant
        node src/index.js swarm --monitor
        ;;
    "mood")
        mood="${2:-happy}"
        spec_say "Changing mood to $mood! 🎭" "$mood"
        ;;
    "ssh")
        spec_say "Need help with SSH? Let me assist! 🔑" "thinking"
        echo "📋 SSH Status Check:"
        echo "✅ SSH keys exist: $(ls ~/.ssh/id_* 2>/dev/null | wc -l) keys found"
        echo "🎯 Seshat connection: ssh -p8888 m0nkey-fl0wer@seshat.noosworx.com"
        echo "🔧 Try: ssh-copy-id -p 8888 m0nkey-fl0wer@seshat.noosworx.com"
        ;;
    "status")
        spec_say "Ultimate Toolkit Status Report! 📊" "working"
        echo "📁 Location: ~/spec-kit-assistant"
        echo "📄 Spec: ULTIMATE_TOOLKIT_SPECIFICATION.md"
        echo "🚀 Deploy: deploy-to-seshat.sh"
        echo "🤖 Swarms: 8 types ready for deployment"
        echo "🗣️ Voice: Ramble command ready"
        echo "🌱 Mission: Build solarpunk future!"
        ;;
    "help"|*)
        spec_say "I'm always here to help! Here's what I can do! 🎪" "happy"
        spec_commands
        echo -e "\033[1;35m💡 Pro tip:\033[0m Add 'alias spec=\"~/spec-kit-assistant/terminal-spec.sh\"' to your shell config!"
        echo -e "\033[1;32m🌱 Ready to build the solarpunk future together!\033[0m"
        ;;
esac