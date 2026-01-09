---
name: speckit.ralph
description: Bridge Spec Kit artifacts to Ralph autonomous implementation loops
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Task
---

# Spec Kit + Ralph Integration

Bridges Spec Kit's structured planning (constitution → spec → plan → tasks) with Ralph's autonomous implementation loops.

## Philosophy

- **Spec Kit** defines *what* to build with rigor
- **Ralph** executes *how* to build it autonomously
- **This Bridge** converts planning artifacts to execution format

## Workflow Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   SPEC KIT      │     │    BRIDGE       │     │     RALPH       │
│                 │     │                 │     │                 │
│ constitution.md │────▶│ Generate        │────▶│ PROMPT.md       │
│ spec.md         │     │ Ralph project   │     │ @fix_plan.md    │
│ plan.md         │     │ files from      │     │ @AGENT.md       │
│ tasks.md        │     │ Spec Kit        │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Commands

### Initialize Ralph from Spec Kit
```bash
/speckit.ralph init
```

Converts existing Spec Kit artifacts to Ralph project structure:
1. Reads `spec.md`, `plan.md`, `tasks.md`
2. Generates `PROMPT.md` (combines spec + plan context)
3. Generates `@fix_plan.md` (tasks as checkboxes)
4. Generates `@AGENT.md` (build/test commands from CLAUDE.md)

### Start Implementation Loop
```bash
/speckit.ralph start [--max N] [--monitor]
```

Options:
- `--max N`: Maximum iterations (default: 10)
- `--monitor`: Open tmux dashboard

### Check Progress
```bash
/speckit.ralph status
```

Shows current iteration, completed tasks, remaining work.

### Remote Execution (Optional)
```bash
/speckit.ralph remote <host>
```

For heavy compute tasks, offload to a remote server via SSH.

## File Mapping

| Spec Kit Source | Ralph Target | Purpose |
|-----------------|--------------|---------|
| `constitution.md` | (context in PROMPT.md) | Project principles |
| `spec.md` | → `PROMPT.md` | Feature requirements |
| `plan.md` | → `PROMPT.md` | Implementation approach |
| `tasks.md` | → `@fix_plan.md` | Actionable checkboxes |
| `CLAUDE.md` | → `@AGENT.md` | Build/test commands |

## Example Usage

### 1. Complete Spec Kit Workflow First
```bash
/speckit.clarify "Build user authentication"
/speckit.plan
/speckit.tasks
```

### 2. Review Generated Tasks
```bash
cat tasks.md
# Ensure tasks are specific and atomic
```

### 3. Bridge to Ralph
```bash
/speckit.ralph init
# Review generated files
cat PROMPT.md
cat @fix_plan.md
```

### 4. Start Autonomous Implementation
```bash
/speckit.ralph start --monitor
```

### 5. Monitor Progress
```bash
/speckit.ralph status
# Or watch the tmux dashboard
```

## Generated File Formats

### PROMPT.md (from spec.md + plan.md)
```markdown
# Project Context

## Constitution Summary
[Key principles from constitution.md]

## Feature Specification
[Content from spec.md]

## Implementation Plan
[Content from plan.md]

## Success Criteria
- [ ] All tasks in @fix_plan.md completed
- [ ] Tests passing
- [ ] Code meets spec requirements
```

### @fix_plan.md (from tasks.md)
```markdown
# Implementation Tasks

## Phase 1: Setup
- [ ] Task 1.1: Initialize project structure
- [ ] Task 1.2: Set up dependencies

## Phase 2: Core Implementation
- [ ] Task 2.1: Implement feature X
- [ ] Task 2.2: Add tests for feature X

## Phase 3: Polish
- [ ] Task 3.1: Documentation
- [ ] Task 3.2: Final review
```

### @AGENT.md (from CLAUDE.md)
```markdown
# Agent Instructions

## Build Commands
```bash
npm install
npm run build
```

## Test Commands
```bash
npm test
npm run lint
```

## Verification
After each task:
1. Run tests
2. Check linting
3. Verify build succeeds
```

## Parallel Execution

For projects with independent task streams:

```bash
# Create git worktrees for parallel work
/speckit.ralph parallel 3
```

This creates isolated worktrees where multiple Ralph instances can work simultaneously on different task groups.

## Tips

1. **Be specific in spec.md** - Vague specs cause infinite loops
2. **Make tasks atomic** - One checkbox = one discrete change
3. **Include test commands** - Ralph verifies work via tests
4. **Set reasonable --max** - Prevent runaway loops
5. **Use monitor mode** - Watch progress in real-time

## Troubleshooting

### Ralph loops without progress
- Tasks may be too vague → refine in tasks.md
- Missing test commands → add to @AGENT.md
- Spec unclear → run /speckit.clarify again

### Tasks marked done but incomplete
- Task description ambiguous → make more specific
- Missing acceptance criteria → add to spec.md

### Build/test failures
- Check @AGENT.md commands are correct
- Verify environment dependencies
- Review CLAUDE.md for project setup requirements

## Integration with Existing Speckit Skills

This skill complements the existing workflow:

1. `/speckit.clarify` → Refine requirements
2. `/speckit.specify` → Create detailed spec
3. `/speckit.plan` → Design implementation approach
4. `/speckit.tasks` → Generate actionable tasks
5. `/speckit.analyze` → Verify artifact consistency
6. **`/speckit.ralph`** → Bridge to autonomous implementation
7. `/speckit.implement` → Alternative: guided implementation

Choose `/speckit.ralph` for autonomous execution or `/speckit.implement` for interactive, guided development.
