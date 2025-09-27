#!/bin/bash
# 🐕 RETRO SPEC - Terminal Companion with ASCII Art & Easter Eggs
# The Ultimate Toolkit with 80s/90s Terminal Vibes!

# Color definitions for retro terminal vibes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
BOLD='\033[1m'
RESET='\033[0m'

# Retro color schemes
NEON_GREEN='\033[1;92m'
NEON_PINK='\033[1;95m'
NEON_CYAN='\033[1;96m'
NEON_YELLOW='\033[1;93m'

# ASCII Art Functions
show_retro_banner() {
    clear
    echo -e "${NEON_CYAN}"
    figlet "SPEC TOOLKIT"
    echo -e "${NEON_PINK}╔══════════════════════════════════════════════════════════════════════╗"
    echo -e "║                    🌱 SOLARPUNK DEVELOPMENT SUITE 🌱                 ║"
    echo -e "║              Conversational Co-Learning • Agent Swarms               ║"
    echo -e "║                    Voice → Research → Build → Deploy                 ║"
    echo -e "╚══════════════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
}

show_matrix_style_loading() {
    echo -e "${NEON_GREEN}"
    for i in {1..5}; do
        echo -ne "█"
        sleep 0.1
    done
    echo -e " LOADING SPEC SYSTEMS...${RESET}"
    sleep 0.5
}

show_spec_ascii() {
    local mood=$1
    case $mood in
        "cyberpunk")
            echo -e "${NEON_CYAN}      ╭─────────╮"
            echo -e "     ╱ ◕  ░░░  ◕ ╲"
            echo -e "    ╱  ░░░ ^_^ ░░░  ╲  ${NEON_PINK}CYBER SPEC ONLINE${RESET}"
            echo -e "${NEON_CYAN}   ╱   ░░░░░░░░░░░   ╲"
            echo -e "  ╱     ░░░───░░░     ╲"
            echo -e " ╱       ░░░░░░░       ╲"
            echo -e "╱         ░░░░░         ╲${RESET}"
            ;;
        "retro")
            echo -e "${NEON_YELLOW}    ░░░░░░░░░░░░░░░░░"
            echo -e "   ░  ◢█◣   ◢█◣  ░"
            echo -e "  ░   ████   ████   ░"
            echo -e " ░    ████▄▄▄████    ░  ${NEON_GREEN}RETRO SPEC v2.0${RESET}"
            echo -e "${NEON_YELLOW}░     ████████████     ░"
            echo -e "░      ██▀▀▀▀▀██      ░"
            echo -e " ░      ██████      ░"
            echo -e "  ░░░░░░░░░░░░░░░░░${RESET}"
            ;;
        "matrix")
            echo -e "${NEON_GREEN}    ╔═══════════════╗"
            echo -e "    ║ █ ░ █   █ ░ █ ║"
            echo -e "    ║ ░ █ ░ ◕ ░ █ ░ ║"
            echo -e "    ║ █ ░ █ ▄ █ ░ █ ║  ${NEON_CYAN}MATRIX SPEC ACTIVATED${RESET}"
            echo -e "${NEON_GREEN}    ║ ░ █ ░ ▀ ░ █ ░ ║"
            echo -e "    ║ █ ░ █████ ░ █ ║"
            echo -e "    ╚═══════════════╝${RESET}"
            ;;
        *)
            echo -e "${YELLOW}      /^-----^\\"
            echo -e "     ( ◕     ◕ )"
            echo -e "      \\  ^___^  /  ${GREEN}Classic Spec Mode${RESET}"
            echo -e "${CYAN}       \\   ---   /"
            echo -e "        ^^^     ^^^${RESET}"
            ;;
    esac
}

retro_speak() {
    local message="$1"
    local style="${2:-normal}"

    case $style in
        "cyberpunk")
            echo -e "${NEON_PINK}${BOLD}🐕 Cyber-Spec says:${RESET} ${NEON_CYAN}\"$message\" *digital tail wagging*${RESET}"
            ;;
        "retro")
            echo -e "${NEON_YELLOW}${BOLD}🐕 Retro-Spec says:${RESET} ${NEON_GREEN}\"$message\" *8-bit woofs*${RESET}"
            ;;
        "matrix")
            echo -e "${NEON_GREEN}${BOLD}🐕 Matrix-Spec says: \"${message}\" *green digital paws*${RESET}"
            ;;
        *)
            echo -e "${CYAN}${BOLD}🐕 Spec says:${RESET} \"$message\" *happy dog noises*"
            ;;
    esac
}

# Easter Eggs!
konami_code() {
    retro_speak "🎮 KONAMI CODE ACTIVATED! Unlocking secret features..." "cyberpunk"
    show_spec_ascii "cyberpunk"
    retro_speak "✨ CYBER SPEC MODE ENABLED! Extra processing power activated!" "cyberpunk"
    retro_speak "🚀 Agent swarms now have Matrix-style digital rain effects!" "cyberpunk"
    retro_speak "💾 Save states enabled - never lose your progress again!" "cyberpunk"
}

coffee_break() {
    retro_speak "☕ Ooh! Coffee time! I love coffee breaks! Can I have a treat too?" "retro"
    show_spec_ascii "retro"
    retro_speak "🎵 *happy dog bouncing to chiptune music* This is my jam!" "retro"
    echo -e "${NEON_YELLOW}"
    cowsay -f tux "Taking a break from building the future!"
    echo -e "${RESET}"
    retro_speak "🐕 Here's some wisdom while we chill!" "retro"
    fortune | cowsay -f dragon
}

matrix_mode() {
    retro_speak "ENTERING THE MATRIX..." "matrix"
    show_spec_ascii "matrix"
    retro_speak "RED PILL OR BLUE PILL? (We choose both - that's the solarpunk way!)" "matrix"
    echo -e "${NEON_GREEN}"
    toilet -f mono12 -F metal "NEO SPEC"
    echo -e "${RESET}"
}

# Command Functions with ASCII Art
ramble_command() {
    show_retro_banner
    show_spec_ascii "cyberpunk"
    retro_speak "🗣️ RAMBLE MODE INITIALIZING... Prepare for conversational co-learning!" "cyberpunk"
    show_matrix_style_loading

    echo -e "${NEON_GREEN}"
    figlet "RAMBLE MODE"
    echo -e "${RESET}"

    retro_speak "🎤 Voice processing: ONLINE" "retro"
    retro_speak "🧠 Research agents: STANDBY" "retro"
    retro_speak "🚀 Prototype builders: READY" "retro"

    cd ~/spec-kit-assistant
    node src/index.js init
}

swarm_command() {
    show_retro_banner
    show_spec_ascii "matrix"
    retro_speak "🤖 DEPLOYING AGENT SWARMS..." "matrix"

    echo -e "${NEON_CYAN}"
    toilet -f term "SWARM DEPLOY"
    echo -e "${RESET}"

    show_matrix_style_loading
    cd ~/spec-kit-assistant
    node deploy-builder-ux-swarm.js 4
}

# Main Command Handler
case "${1:-help}" in
    "ramble")
        ramble_command
        ;;
    "swarm")
        swarm_command
        ;;
    "matrix")
        matrix_mode
        ;;
    "coffee")
        coffee_break
        ;;
    "konami")
        konami_code
        ;;
    "banner")
        show_retro_banner
        retro_speak "🌈 Welcome to the retro future!" "cyberpunk"
        ;;
    "vibe")
        style="${2:-cyberpunk}"
        show_retro_banner
        show_spec_ascii "$style"
        retro_speak "Vibing in $style mode! ✨" "$style"
        ;;
    "deploy")
        show_retro_banner
        show_spec_ascii "cyberpunk"
        retro_speak "🚀 DEPLOYING TO SESHAT MOTHERSHIP..." "cyberpunk"
        show_matrix_style_loading
        cd ~/spec-kit-assistant
        ./deploy-to-seshat.sh
        ;;
    "neofetch")
        show_retro_banner
        neofetch
        ;;
    "fortune")
        retro_speak "🔮 Consulting the digital oracle..." "retro"
        fortune | cowsay -f dragon-and-cow
        ;;
    "train")
        retro_speak "🚂 All aboard the ASCII express!" "retro"
        sl
        ;;
    "help"|*)
        show_retro_banner
        show_spec_ascii "retro"
        retro_speak "Welcome to RETRO SPEC - The Ultimate ASCII Experience! 🎮" "retro"

        echo -e "${NEON_YELLOW}${BOLD}🎯 CORE COMMANDS:${RESET}"
        echo -e "  ${NEON_CYAN}spec ramble${RESET}    - Start conversational co-learning"
        echo -e "  ${NEON_CYAN}spec swarm${RESET}     - Deploy agent swarms with style"
        echo -e "  ${NEON_CYAN}spec deploy${RESET}    - Deploy to seshat with flair"
        echo ""
        echo -e "${NEON_PINK}${BOLD}🎮 EASTER EGGS:${RESET}"
        echo -e "  ${NEON_GREEN}spec matrix${RESET}    - Enter the Matrix"
        echo -e "  ${NEON_GREEN}spec coffee${RESET}    - Take a retro coffee break"
        echo -e "  ${NEON_GREEN}spec konami${RESET}    - Unlock secret features"
        echo -e "  ${NEON_GREEN}spec train${RESET}     - ASCII train experience"
        echo -e "  ${NEON_GREEN}spec fortune${RESET}   - Digital fortune telling"
        echo ""
        echo -e "${NEON_CYAN}${BOLD}🎨 VIBES:${RESET}"
        echo -e "  ${NEON_MAGENTA}spec vibe cyberpunk${RESET} - Neon cyber aesthetics"
        echo -e "  ${NEON_MAGENTA}spec vibe retro${RESET}     - 80s/90s terminal vibes"
        echo -e "  ${NEON_MAGENTA}spec vibe matrix${RESET}    - Green digital rain"
        echo ""
        echo -e "${NEON_YELLOW}💡 Pro tip: Add this to your ~/.bashrc:${RESET}"
        echo -e "${CYAN}alias spec=\"~/spec-kit-assistant/retro-spec.sh\"${RESET}"
        echo ""
        echo -e "${NEON_GREEN}🌱 Ready to build the solarpunk future with style! 🌍✨${RESET}"
        ;;
esac