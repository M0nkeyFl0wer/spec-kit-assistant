#!/bin/bash
# validate-against-spec.sh
# PreToolUse hook for Ralph - validates tool usage against spec constraints
#
# This hook is designed to be used with Claude Code's hooks system.
# It receives tool call information via stdin and validates against the spec.
#
# Exit codes:
#   0 - Validation passed, allow tool call
#   1 - Validation failed, block tool call
#
# Usage in .claude/settings.json:
# {
#   "hooks": {
#     "PreToolUse": ["./hooks/validate-against-spec.sh"]
#   }
# }

set -e

# Read hook input from stdin
INPUT=$(cat)

# Parse tool name and parameters from input
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool // empty')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.input // empty')

# Exit early if no tool name provided
if [ -z "$TOOL_NAME" ]; then
  exit 0
fi

# Find spec files
find_spec_file() {
  local search_paths=(
    "./specs/spec.md"
    "./.speckit/spec.md"
    "./SPEC.md"
  )

  for path in "${search_paths[@]}"; do
    if [ -f "$path" ]; then
      echo "$path"
      return 0
    fi
  done

  return 1
}

# Find PROMPT.md for context
find_prompt_file() {
  if [ -f "./PROMPT.md" ]; then
    echo "./PROMPT.md"
    return 0
  fi
  return 1
}

# Check if a file path is allowed based on spec constraints
validate_file_path() {
  local file_path="$1"

  # Check for sensitive file patterns
  local blocked_patterns=(
    ".env"
    ".env.local"
    "secrets"
    "credentials"
    "*.pem"
    "*.key"
    "id_rsa"
    ".ssh"
  )

  for pattern in "${blocked_patterns[@]}"; do
    if [[ "$file_path" == *"$pattern"* ]]; then
      echo "BLOCKED: File path matches sensitive pattern: $pattern" >&2
      return 1
    fi
  done

  return 0
}

# Check if command is allowed
validate_command() {
  local command="$1"

  # Block dangerous commands
  local blocked_commands=(
    "rm -rf /"
    "rm -rf /*"
    "dd if="
    "mkfs"
    ":(){:|:&};:"
    "chmod -R 777 /"
    "curl .* | bash"
    "wget .* | bash"
  )

  for pattern in "${blocked_commands[@]}"; do
    if echo "$command" | grep -qE "$pattern"; then
      echo "BLOCKED: Command matches dangerous pattern" >&2
      return 1
    fi
  done

  # Warn about potentially destructive git commands
  if echo "$command" | grep -qE "git (push --force|reset --hard|clean -fd)"; then
    echo "WARNING: Potentially destructive git command detected" >&2
    # Don't block, just warn
  fi

  return 0
}

# Check task relevance - is the tool call relevant to current task?
validate_task_relevance() {
  local tool="$1"
  local tool_input="$2"

  # Read current task from @fix_plan.md if available
  if [ -f "./@fix_plan.md" ]; then
    # Find first unchecked task
    local current_task=$(grep -m1 "^- \[ \]" "./@fix_plan.md" | sed 's/^- \[ \] //')

    if [ -n "$current_task" ]; then
      # Log current task for context
      echo "Current task: $current_task" >&2
    fi
  fi

  return 0
}

# Main validation logic
main() {
  case "$TOOL_NAME" in
    "Write"|"Edit")
      # Validate file writes
      local file_path=$(echo "$TOOL_INPUT" | jq -r '.file_path // .path // empty')
      if [ -n "$file_path" ]; then
        validate_file_path "$file_path" || exit 1
      fi
      ;;

    "Bash")
      # Validate shell commands
      local command=$(echo "$TOOL_INPUT" | jq -r '.command // empty')
      if [ -n "$command" ]; then
        validate_command "$command" || exit 1
      fi
      ;;

    "Read")
      # Allow reads but log them
      local file_path=$(echo "$TOOL_INPUT" | jq -r '.file_path // .path // empty')
      if [ -n "$file_path" ]; then
        validate_file_path "$file_path" || exit 1
      fi
      ;;

    *)
      # Allow other tools
      ;;
  esac

  # General task relevance check
  validate_task_relevance "$TOOL_NAME" "$TOOL_INPUT"

  exit 0
}

main
