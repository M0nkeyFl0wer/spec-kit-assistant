#!/bin/bash
# Spec's ASCII Animations - Real digital tail wagging and more!

# Colors for animations
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
BOLD='\033[1m'
RESET='\033[0m'
NEON_GREEN='\033[1;92m'
NEON_PINK='\033[1;95m'
NEON_CYAN='\033[1;96m'

# Clear screen function
clear_screen() {
    printf '\033[2J\033[H'
}

# Digital tail wagging animation
tail_wag_animation() {
    local cycles=${1:-5}

    for ((i=1; i<=cycles; i++)); do
        # Tail to the right
        clear_screen
        echo -e "${NEON_CYAN}      /^-----^\\"
        echo -e "     ( ◕     ◕ )"
        echo -e "      \\  ^___^  /  ${NEON_PINK}*wag wag*${RESET}"
        echo -e "${CYAN}       \\   ---   /"
        echo -e "        ^^^     ^^^${NEON_GREEN}  ~~~${RESET}"
        sleep 0.3

        # Tail to the left
        clear_screen
        echo -e "${NEON_CYAN}      /^-----^\\"
        echo -e "     ( ◕     ◕ )"
        echo -e "      \\  ^___^  /  ${NEON_PINK}*wag wag*${RESET}"
        echo -e "${CYAN}       \\   ---   /"
        echo -e "     ${NEON_GREEN}~~~${RESET}  ^^^     ^^^"
        sleep 0.3
    done
}

# Blockchain animation
blockchain_animation() {
    echo -e "${NEON_GREEN}🔗 BLOCKCHAIN DEPLOYING...${RESET}"
    echo ""

    for i in {1..10}; do
        echo -ne "${CYAN}["
        for ((j=1; j<=i; j++)); do
            echo -ne "█"
        done
        for ((j=i; j<10; j++)); do
            echo -ne "░"
        done
        echo -ne "]${RESET} Block $i/10\r"
        sleep 0.2
    done
    echo ""
    echo -e "${NEON_GREEN}┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐${RESET}"
    echo -e "${NEON_GREEN}│Block│━━━▶│Block│━━━▶│Block│━━━▶│Block│${RESET}"
    echo -e "${NEON_GREEN}│  1  │    │  2  │    │  3  │    │  4  │${RESET}"
    echo -e "${NEON_GREEN}└─────┘    └─────┘    └─────┘    └─────┘${RESET}"
    echo -e "${NEON_PINK}✨ Blockchain secured! ✨${RESET}"
}

# Network animation
network_animation() {
    echo -e "${NEON_CYAN}🌐 NETWORK MAPPING...${RESET}"
    echo ""

    for frame in {1..8}; do
        clear_screen
        echo -e "${NEON_CYAN}🌐 AGENT SWARM NETWORK${RESET}"
        echo ""
        case $frame in
            1|5) echo -e "    ${CYAN}◯${RESET}     ${CYAN}◯${RESET}     ${CYAN}◯${RESET}" ;;
            2|6) echo -e "    ${CYAN}◯${NEON_GREEN}─────${CYAN}◯${RESET}     ${CYAN}◯${RESET}" ;;
            3|7) echo -e "    ${CYAN}◯${NEON_GREEN}─────${CYAN}◯${NEON_GREEN}─────${CYAN}◯${RESET}" ;;
            4|8) echo -e "    ${CYAN}◯${NEON_GREEN}─────${CYAN}◯${NEON_GREEN}─────${CYAN}◯${RESET}" ;;
        esac
        echo -e "    ${CYAN}│${RESET}     ${CYAN}│${RESET}     ${CYAN}│${RESET}"
        echo -e "    ${CYAN}◯${RESET}     ${CYAN}◯${RESET}     ${CYAN}◯${RESET}"
        echo ""
        echo -e "${NEON_PINK}Agents connected: $((frame * 2))/16${RESET}"
        sleep 0.3
    done
}

# Data Science train animation (for processing)
data_train_animation() {
    local message="$1"
    echo -e "${NEON_YELLOW}🚂 DATA SCIENCE EXPRESS 🚂${RESET}"
    echo -e "${CYAN}Processing: $message${RESET}"
    echo ""

    for i in {1..20}; do
        echo -ne "\r"
        for ((j=0; j<i; j++)); do echo -ne " "; done
        echo -ne "${NEON_GREEN}🚂${YELLOW}▓▓▓${BLUE}▓▓${RESET}"
        sleep 0.1
    done
    echo ""
    echo -e "${NEON_PINK}✨ Analysis complete! ✨${RESET}"
}

# Matrix-style data rain
matrix_rain() {
    local duration=${1:-5}
    local cols=$(tput cols)
    local lines=$(tput lines)

    # Generate random characters for matrix effect
    chars="01"

    for ((i=0; i<duration; i++)); do
        clear_screen
        for ((line=0; line<lines; line++)); do
            for ((col=0; col<cols; col+=2)); do
                if (( RANDOM % 4 == 0 )); then
                    echo -ne "${NEON_GREEN}${chars:$((RANDOM % ${#chars})):1}${RESET}"
                else
                    echo -ne " "
                fi
            done
            echo ""
        done
        sleep 0.1
    done
}

# Easter egg for typos
typo_easter_egg() {
    local typo="$1"

    case "$typo" in
        *"teh"*|*"hte"*)
            echo -e "${NEON_PINK}🐕 Spec says: \"Woof! I saw 'teh' - did you mean 'the'? No worries, happens to the best of us!\" *happy tail wag*${RESET}"
            tail_wag_animation 2
            ;;
        *"recieve"*)
            echo -e "${NEON_CYAN}🐕 Spec says: \"Remember: 'i' before 'e' except after 'c'! It's 'receive' - but you're still pawsome!\" *encouraging wag*${RESET}"
            ;;
        *"seperate"*)
            echo -e "${NEON_YELLOW}🐕 Spec says: \"Ooh! 'Separate' has 'a rat' in it - sep-A-rate! Memory trick from your friendly coding dog!\" *smart tail wag*${RESET}"
            ;;
        *"definately"*)
            echo -e "${NEON_GREEN}🐕 Spec says: \"It's 'definitely' - with 'finite' in the middle! Definitely a common typo though!\" *understanding wag*${RESET}"
            ;;
        *)
            echo -e "${NEON_MAGENTA}🐕 Spec says: \"Hmm, spotted a potential typo! No judgment here - we're all learning! Woof!\" *supportive tail wag*${RESET}"
            ;;
    esac
}

# Spec processing animation (combines multiple effects)
spec_processing() {
    local task="$1"

    echo -e "${NEON_CYAN}🐕 Spec is processing: $task${RESET}"

    # Show thinking Spec
    echo -e "${YELLOW}      /^-----^\\"
    echo -e "     ( •  …  • )"
    echo -e "      \\  ≋≋≋≋≋  /  ${BLUE}*intense thinking*${RESET}"
    echo -e "${CYAN}       \\   ---   /"
    echo -e "        ^^^     ^^^"

    sleep 1

    # Tail wag while processing
    tail_wag_animation 3

    # Show completion
    echo -e "${NEON_GREEN}✨ Task completed! ✨${RESET}"
}

# Interactive menu
show_animation_menu() {
    echo -e "${NEON_CYAN}🎮 SPEC'S ASCII ANIMATION THEATER 🎮${RESET}"
    echo ""
    echo -e "${YELLOW}Choose an animation:${RESET}"
    echo -e "  ${GREEN}1)${RESET} Digital tail wagging"
    echo -e "  ${GREEN}2)${RESET} Blockchain deployment"
    echo -e "  ${GREEN}3)${RESET} Network mapping"
    echo -e "  ${GREEN}4)${RESET} Data Science train"
    echo -e "  ${GREEN}5)${RESET} Matrix data rain"
    echo -e "  ${GREEN}6)${RESET} Spec processing demo"
    echo -e "  ${GREEN}7)${RESET} Easter egg demo"
    echo ""
}

# Main function
case "${1:-menu}" in
    "tail"|"wag")
        tail_wag_animation 5
        ;;
    "blockchain"|"chain")
        blockchain_animation
        ;;
    "network"|"net")
        network_animation
        ;;
    "train"|"data")
        data_train_animation "${2:-Processing data science tasks}"
        ;;
    "matrix"|"rain")
        matrix_rain 3
        ;;
    "process")
        spec_processing "${2:-Ultimate Toolkit tasks}"
        ;;
    "typo")
        typo_easter_egg "${2:-test typo teh quick brown fox}"
        ;;
    "menu"|*)
        show_animation_menu
        ;;
esac