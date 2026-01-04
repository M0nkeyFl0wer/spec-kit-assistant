#!/bin/bash
# Come Here Spec - Interactive project launcher
# Usage: come-here-spec
#
# This is a thin wrapper that launches the Node.js interactive launcher.
# The Node.js version handles agent detection, workflow state, and smart suggestions.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if node_modules exists
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$SCRIPT_DIR" && npm install --silent --ignore-scripts 2>/dev/null || npm install --ignore-scripts
fi

# Launch the Node.js interactive launcher
exec node "$SCRIPT_DIR/come-here.js" "$@"

# ============================================================================
# Legacy bash implementation below (kept for reference)
# ============================================================================
exit 0

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Show the dog greeting
echo ""
echo -e "${CYAN}"
cat << 'EOF'
       / \__
      (    @\___
      /         O
     /   (_____/
    /_____/   U
EOF
echo -e "${NC}"
echo -e "${BOLD}Woof! I'm Spec, your loyal assistant!${NC}"
echo ""

# Ask: new or existing project?
echo -e "${CYAN}Are we starting something new or continuing?${NC}"
echo ""
echo "  1) Start a new project"
echo "  2) Continue an existing project"
echo ""
read -p "Choose [1/2]: " -n 1 -r choice
echo ""
echo ""

if [[ "$choice" == "1" ]]; then
    # NEW PROJECT
    echo -e "${CYAN}What should we call this project?${NC}"
    echo -e "${DIM}(This will be the directory name)${NC}"
    echo ""
    read -p "Project name: " project_name
    echo ""

    if [[ -z "$project_name" ]]; then
        echo -e "${YELLOW}No name provided. Let's try again later!${NC}"
        exit 1
    fi

    # Sanitize project name for directory
    dir_name=$(echo "$project_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-_')

    # Ask where to create it
    echo -e "${CYAN}Where should I create it?${NC}"
    echo ""
    echo "  1) Current directory: $(pwd)/$dir_name"
    echo "  2) Projects folder: $HOME/Projects/$dir_name"
    echo "  3) Custom location"
    echo ""
    read -p "Choose [1/2/3]: " -n 1 -r location
    echo ""
    echo ""

    case "$location" in
        1) target_dir="$(pwd)/$dir_name" ;;
        2) target_dir="$HOME/Projects/$dir_name" ;;
        3)
            read -p "Enter path: " custom_path
            target_dir="$custom_path/$dir_name"
            ;;
        *) target_dir="$(pwd)/$dir_name" ;;
    esac

    # Check if directory exists
    if [[ -d "$target_dir" ]]; then
        echo -e "${YELLOW}Directory already exists: $target_dir${NC}"
        read -p "Use existing directory? [Y/n]: " -n 1 -r use_existing
        echo ""
        if [[ ! $use_existing =~ ^[Yy]$ ]] && [[ -n $use_existing ]]; then
            echo "Okay, let's try again later!"
            exit 1
        fi
    else
        echo -e "${DIM}Creating: $target_dir${NC}"
        mkdir -p "$target_dir"
    fi

    # Move to directory and initialize
    cd "$target_dir"
    echo ""
    echo -e "${GREEN}Let's go! Starting new project: $project_name${NC}"
    echo ""

    # Run spec init
    "$SCRIPT_DIR/run.sh" init "$project_name"

elif [[ "$choice" == "2" ]]; then
    # EXISTING PROJECT
    echo -e "${CYAN}What's the project called?${NC}"
    echo -e "${DIM}(I'll search for it)${NC}"
    echo ""
    read -p "Project name: " search_term
    echo ""

    if [[ -z "$search_term" ]]; then
        echo -e "${YELLOW}No name provided. Let's try again later!${NC}"
        exit 1
    fi

    # Search for matching directories with .speckit or .specify folders
    echo -e "${DIM}Searching for spec projects...${NC}"
    echo ""

    # Find directories matching the name that have spec files
    matches=()

    # Search in common locations
    search_paths=("$HOME/Projects" "$(pwd)" "$HOME")

    for base in "${search_paths[@]}"; do
        if [[ -d "$base" ]]; then
            while IFS= read -r -d '' dir; do
                # Check if it has .speckit or .specify directory
                if [[ -d "$dir/.speckit" ]] || [[ -d "$dir/.specify" ]]; then
                    matches+=("$dir")
                fi
            done < <(find "$base" -maxdepth 3 -type d -iname "*$search_term*" -print0 2>/dev/null)
        fi
    done

    # Remove duplicates
    IFS=$'\n' matches=($(printf "%s\n" "${matches[@]}" | sort -u))
    unset IFS

    if [[ ${#matches[@]} -eq 0 ]]; then
        echo -e "${YELLOW}No spec projects found matching '$search_term'${NC}"
        echo ""
        echo "Would you like to:"
        echo "  1) Start a new project with that name"
        echo "  2) Enter a path manually"
        echo "  3) Cancel"
        echo ""
        read -p "Choose [1/2/3]: " -n 1 -r fallback
        echo ""

        case "$fallback" in
            1)
                dir_name=$(echo "$search_term" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-_')
                target_dir="$HOME/Projects/$dir_name"
                mkdir -p "$target_dir"
                cd "$target_dir"
                "$SCRIPT_DIR/run.sh" init "$search_term"
                ;;
            2)
                read -p "Enter full path: " manual_path
                if [[ -d "$manual_path" ]]; then
                    cd "$manual_path"
                    "$SCRIPT_DIR/run.sh"
                else
                    echo -e "${YELLOW}Directory not found: $manual_path${NC}"
                    exit 1
                fi
                ;;
            *)
                echo "Okay, see you later!"
                exit 0
                ;;
        esac
    elif [[ ${#matches[@]} -eq 1 ]]; then
        # Single match - use it
        target_dir="${matches[0]}"
        echo -e "${GREEN}Found it: $target_dir${NC}"
        echo ""
        cd "$target_dir"
        "$SCRIPT_DIR/run.sh"
    else
        # Multiple matches - let user choose
        echo "Found ${#matches[@]} matching projects:"
        echo ""
        for i in "${!matches[@]}"; do
            echo "  $((i+1))) ${matches[$i]}"
        done
        echo ""
        read -p "Choose [1-${#matches[@]}]: " -r selection

        if [[ "$selection" =~ ^[0-9]+$ ]] && [[ "$selection" -ge 1 ]] && [[ "$selection" -le ${#matches[@]} ]]; then
            target_dir="${matches[$((selection-1))]}"
            echo ""
            echo -e "${GREEN}Opening: $target_dir${NC}"
            echo ""
            cd "$target_dir"
            "$SCRIPT_DIR/run.sh"
        else
            echo -e "${YELLOW}Invalid selection${NC}"
            exit 1
        fi
    fi
else
    echo "Okay, see you later! Run 'come-here-spec' when you're ready."
    exit 0
fi
