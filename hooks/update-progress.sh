#!/bin/bash
# update-progress.sh
# PostToolUse hook for Ralph - tracks progress and updates status
#
# This hook is designed to be used with Claude Code's hooks system.
# It receives tool call results via stdin and updates progress tracking.
#
# Exit codes:
#   0 - Processing complete (always succeeds)
#
# Usage in .claude/settings.json:
# {
#   "hooks": {
#     "PostToolUse": ["./hooks/update-progress.sh"]
#   }
# }

set -e

# Configuration
PROGRESS_FILE="${PROGRESS_FILE:-./progress.json}"
STATUS_FILE="${STATUS_FILE:-./status.json}"
FIX_PLAN_FILE="${FIX_PLAN_FILE:-./@fix_plan.md}"

# Read hook input from stdin
INPUT=$(cat)

# Parse tool name and result from input
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool // empty')
TOOL_RESULT=$(echo "$INPUT" | jq -r '.result // empty')
TOOL_SUCCESS=$(echo "$INPUT" | jq -r '.success // true')

# Exit early if no tool name provided
if [ -z "$TOOL_NAME" ]; then
  exit 0
fi

# Initialize progress file if it doesn't exist
init_progress() {
  if [ ! -f "$PROGRESS_FILE" ]; then
    cat > "$PROGRESS_FILE" << 'EOF'
{
  "session_start": null,
  "tool_calls": 0,
  "successful_calls": 0,
  "failed_calls": 0,
  "files_modified": [],
  "commands_run": [],
  "tasks_completed": 0,
  "last_activity": null
}
EOF
  fi
}

# Update progress tracking
update_progress() {
  local tool="$1"
  local success="$2"

  init_progress

  # Read current progress
  local current=$(cat "$PROGRESS_FILE")

  # Update counters
  local tool_calls=$(echo "$current" | jq '.tool_calls + 1')
  local successful_calls=$(echo "$current" | jq ".successful_calls + (if $success then 1 else 0 end)")
  local failed_calls=$(echo "$current" | jq ".failed_calls + (if $success then 0 else 1 end)")
  local timestamp=$(date -Iseconds)

  # Set session start if not set
  local session_start=$(echo "$current" | jq -r '.session_start')
  if [ "$session_start" = "null" ]; then
    session_start="$timestamp"
  fi

  # Update the progress file
  echo "$current" | jq \
    --arg ts "$timestamp" \
    --arg ss "$session_start" \
    --argjson tc "$tool_calls" \
    --argjson sc "$successful_calls" \
    --argjson fc "$failed_calls" \
    '.session_start = $ss | .tool_calls = $tc | .successful_calls = $sc | .failed_calls = $fc | .last_activity = $ts' \
    > "${PROGRESS_FILE}.tmp" && mv "${PROGRESS_FILE}.tmp" "$PROGRESS_FILE"
}

# Track file modifications
track_file_modification() {
  local file_path="$1"

  init_progress

  local current=$(cat "$PROGRESS_FILE")

  # Add file to modified list if not already present
  echo "$current" | jq \
    --arg fp "$file_path" \
    'if (.files_modified | index($fp)) then . else .files_modified += [$fp] end' \
    > "${PROGRESS_FILE}.tmp" && mv "${PROGRESS_FILE}.tmp" "$PROGRESS_FILE"
}

# Track command execution
track_command() {
  local command="$1"

  init_progress

  local current=$(cat "$PROGRESS_FILE")
  local timestamp=$(date -Iseconds)

  # Add command to list (keep last 50)
  echo "$current" | jq \
    --arg cmd "$command" \
    --arg ts "$timestamp" \
    '.commands_run = ([{command: $cmd, timestamp: $ts}] + .commands_run)[:50]' \
    > "${PROGRESS_FILE}.tmp" && mv "${PROGRESS_FILE}.tmp" "$PROGRESS_FILE"
}

# Update status file for monitoring
update_status() {
  local tool="$1"
  local success="$2"

  # Calculate progress from @fix_plan.md
  local total_tasks=0
  local completed_tasks=0
  local percentage=0

  if [ -f "$FIX_PLAN_FILE" ]; then
    total_tasks=$(grep -c "^- \[[x ]\]" "$FIX_PLAN_FILE" 2>/dev/null || echo "0")
    completed_tasks=$(grep -c "^- \[x\]" "$FIX_PLAN_FILE" 2>/dev/null || echo "0")

    if [ "$total_tasks" -gt 0 ]; then
      percentage=$((completed_tasks * 100 / total_tasks))
    fi
  fi

  # Get current task
  local current_task=""
  if [ -f "$FIX_PLAN_FILE" ]; then
    current_task=$(grep -m1 "^- \[ \]" "$FIX_PLAN_FILE" 2>/dev/null | sed 's/^- \[ \] //' || echo "")
  fi

  # Write status file
  cat > "$STATUS_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "last_tool": "$tool",
  "last_success": $success,
  "progress": {
    "total_tasks": $total_tasks,
    "completed_tasks": $completed_tasks,
    "percentage": $percentage
  },
  "current_task": $(echo "$current_task" | jq -R .)
}
EOF
}

# Check if @fix_plan.md was modified (task completed)
check_task_completion() {
  local file_path="$1"

  if [ "$file_path" = "$FIX_PLAN_FILE" ] || [ "$file_path" = "@fix_plan.md" ]; then
    init_progress

    local current=$(cat "$PROGRESS_FILE")

    # Increment tasks completed counter
    echo "$current" | jq '.tasks_completed += 1' \
      > "${PROGRESS_FILE}.tmp" && mv "${PROGRESS_FILE}.tmp" "$PROGRESS_FILE"

    echo "Task marked complete in @fix_plan.md" >&2
  fi
}

# Main processing logic
main() {
  local success=true
  if [ "$TOOL_SUCCESS" = "false" ]; then
    success=false
  fi

  # Update general progress
  update_progress "$TOOL_NAME" "$success"

  case "$TOOL_NAME" in
    "Write"|"Edit")
      # Track file modifications
      local file_path=$(echo "$INPUT" | jq -r '.input.file_path // .input.path // empty')
      if [ -n "$file_path" ]; then
        track_file_modification "$file_path"
        check_task_completion "$file_path"
      fi
      ;;

    "Bash")
      # Track command execution
      local command=$(echo "$INPUT" | jq -r '.input.command // empty')
      if [ -n "$command" ]; then
        track_command "$command"
      fi
      ;;

    *)
      # Other tools - just update progress
      ;;
  esac

  # Update status file for monitoring
  update_status "$TOOL_NAME" "$success"

  exit 0
}

main
