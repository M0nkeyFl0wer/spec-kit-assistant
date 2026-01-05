---
description: Convert existing tasks into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

This skill syncs tasks.md to GitHub Issues using the built-in GitHub integration module.

### Prerequisites

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute.

2. From the executed script, extract the path to **tasks.md**.

### GitHub Authentication

The sync module supports layered authentication:
- **Preferred**: GitHub CLI (`gh auth login`)
- **Fallback**: GITHUB_TOKEN environment variable
- **Graceful degradation**: Git-only mode if GitHub unavailable

Check authentication status:
```bash
node src/github/cli.js auth
```

### Sync Tasks to Issues

Run the sync:
```bash
node src/github/cli.js sync <path-to-tasks.md>
```

Options:
- `--dry-run`: Preview what would happen without making changes
- `--force`: Re-sync all tasks, even if unchanged

### What the Sync Does

1. **Creates labels** in the repository (spec-kit, priority:p1-p3, phase:*, parallel, blocked)
2. **Parses tasks.md** extracting task IDs, descriptions, phases, dependencies
3. **Creates GitHub Issues** for pending tasks (skips completed tasks)
4. **Adds dependency links** between related issues
5. **Updates tasks.md** with issue numbers (e.g., `[#42]`)
6. **Tracks sync state** in `.speckit/sync-state.json` for change detection

### Re-syncing

On subsequent runs:
- **New tasks**: Create new issues
- **Changed tasks**: Update existing issues
- **Completed tasks**: Close issues with comment
- **Deleted tasks**: Warning only (issues preserved, manual close recommended)

### Git-Only Mode

If GitHub is unavailable, the module gracefully degrades:
- Sync status command still works (shows local state)
- Dry-run mode shows what would happen
- No errors thrown - just informational warnings

### Example Output

```
Syncing: specs/002-quality-automation/tasks.md

  Setting up labels...
  Parsing tasks...
  Processing 68 tasks...
  Created: T018 → #1
  Created: T019 → #2
  ...
  Adding dependency links...
  Updating tasks.md...

--- Summary ---
Created: 50
Updated: 0
Closed: 0
Unchanged: 18
```

> [!CAUTION]
> UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL
