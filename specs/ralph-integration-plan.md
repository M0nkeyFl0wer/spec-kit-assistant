# Ralph Integration Plan

## Implementation Approach

Build a lightweight bridge between Spec Kit artifacts and Ralph's execution format. Focus on conversion logic and CLI integration rather than complex orchestration.

## Architecture Decision

**Chosen**: Shell script + Node.js hybrid approach
- Shell scripts for CLI commands and Ralph invocation
- Node.js for artifact parsing and conversion
- Leverage existing Spec Kit infrastructure

**Rejected alternatives**:
- Full TypeScript rewrite (unnecessary complexity)
- Python implementation (inconsistent with existing codebase)
- Swarm orchestrator extension (proven overengineered)

## Phase 1: Artifact Conversion

### Task 1.1: Create tasks.md parser
**File**: `src/ralph/parse-tasks.js`

Parse tasks.md format:
```markdown
## Phase 1: Setup
- Task 1.1: Description
- Task 1.2: Description
```

Convert to @fix_plan.md:
```markdown
## Phase 1: Setup
- [ ] Task 1.1: Description
- [ ] Task 1.2: Description
```

Logic:
- Read tasks.md line by line
- Detect task lines (start with `- Task` or `- `)
- Prepend `[ ]` checkbox
- Preserve phase headers and structure

### Task 1.2: Create PROMPT.md generator
**File**: `src/ralph/generate-prompt.js`

Combine spec artifacts into single prompt:
1. Read `constitution.md` → extract key principles (first 500 words)
2. Read `spec.md` → include full content
3. Read `plan.md` → include implementation approach
4. Add success criteria section

Output structure:
```markdown
# Implementation Prompt

## Project Principles
[from constitution.md]

## Specification
[from spec.md]

## Approach
[from plan.md]

## Success Criteria
- Complete all tasks in @fix_plan.md
- Pass all tests in @AGENT.md
- Commit each change atomically
```

### Task 1.3: Create @AGENT.md generator
**File**: `src/ralph/generate-agent.js`

Extract build/test commands:
1. Check CLAUDE.md for build commands
2. Check package.json scripts
3. Detect project type (npm, cargo, go, python)
4. Generate appropriate commands

Output:
```markdown
# Agent Instructions

## Build
npm install && npm run build

## Test
npm test

## Verify
After each task: run tests, check lint
```

### Task 1.4: Create init command
**File**: `src/ralph/init.js`

CLI command: `/speckit.ralph init`

Steps:
1. Verify Spec Kit artifacts exist
2. Run tasks parser → @fix_plan.md
3. Run prompt generator → PROMPT.md
4. Run agent generator → @AGENT.md
5. Print summary

## Phase 2: Ralph Execution

### Task 2.1: Create start command
**File**: `src/ralph/start.js`

CLI command: `/speckit.ralph start [--max N] [--monitor]`

Steps:
1. Verify Ralph is installed
2. Verify Ralph project files exist
3. Build ralph command: `ralph --calls N`
4. If --monitor: wrap in tmux
5. Execute and stream output

### Task 2.2: Create status command
**File**: `src/ralph/status.js`

CLI command: `/speckit.ralph status`

Parse @fix_plan.md:
- Count `- [ ]` (pending)
- Count `- [x]` (completed)
- Calculate percentage
- Show current phase

Output:
```
Ralph Status:
  Progress: 7/15 tasks (47%)
  Phase: 2 - Core Implementation
  Last activity: 2m ago
```

## Phase 3: Remote Execution

### Task 3.1: Create remote command
**File**: `src/ralph/remote.js`

CLI command: `/speckit.ralph remote <host>`

Steps:
1. Validate SSH connectivity
2. rsync project to remote (exclude node_modules, .git)
3. SSH exec: `cd project && ralph --monitor`
4. On completion: rsync back

### Task 3.2: Create parallel command
**File**: `src/ralph/parallel.js`

CLI command: `/speckit.ralph parallel N`

Steps:
1. Create N git worktrees
2. Distribute tasks (round-robin by phase)
3. Create tmux session with N panes
4. Start Ralph in each worktree

## Phase 4: Hook Integration

### Task 4.1: Create spec validation hook
**File**: `hooks/validate-against-spec.sh`

PreToolUse hook that:
1. Reads current spec.md requirements
2. Checks proposed change against requirements
3. Warns on potential scope creep
4. Blocks obvious violations

### Task 4.2: Create progress update hook
**File**: `hooks/update-progress.sh`

PostToolUse hook that:
1. Detects task completion signals
2. Updates @fix_plan.md checkboxes
3. Commits progress

## File Structure

```
src/ralph/
├── init.js           # /speckit.ralph init
├── start.js          # /speckit.ralph start
├── status.js         # /speckit.ralph status
├── remote.js         # /speckit.ralph remote
├── parallel.js       # /speckit.ralph parallel
├── parse-tasks.js    # tasks.md → @fix_plan.md
├── generate-prompt.js # Generate PROMPT.md
└── generate-agent.js  # Generate @AGENT.md

hooks/
├── validate-against-spec.sh
└── update-progress.sh
```

## Testing Strategy

### Unit Tests
- Task parser: various tasks.md formats
- Prompt generator: with/without constitution
- Agent generator: npm/cargo/go projects

### Integration Tests
- Full init flow: spec artifacts → Ralph files
- Start flow: verify Ralph actually executes
- Status flow: parse real @fix_plan.md

### Manual Verification
- Run on test-project in repo
- Verify generated files match expected format
- Execute full loop with --max 2

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Ralph not installed | Check in init, provide install instructions |
| Spec artifacts missing | Validate upfront, clear error messages |
| Infinite loops | Enforce --max limit, stall detection |
| Remote SSH issues | Test connectivity before sync |

## Rollback Plan

All changes are additive:
- New files in `src/ralph/`
- New skill in `.claude/commands/`
- New hooks in `hooks/`

To rollback: delete added files, no existing functionality affected.
