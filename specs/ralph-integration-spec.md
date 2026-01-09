# Spec Kit + Ralph Integration

## Feature: Ralph Autonomous Implementation Bridge

### Overview

Integrate Ralph autonomous loop methodology into Spec Kit to provide seamless transition from planning artifacts to autonomous code implementation.

### Problem Statement

Currently, Spec Kit excels at structured planning (constitution → spec → plan → tasks) but the implementation phase relies on:
1. Manual execution with `/speckit.implement`
2. Half-baked Claude Flow integration that launches Claude but doesn't ensure execution
3. Overengineered swarm orchestrator that orchestrates without generating code

**Gap**: No autonomous execution path from planning to working code.

### Solution

Bridge Spec Kit's structured artifacts to Ralph's autonomous loop:
- Convert `tasks.md` to Ralph's `@fix_plan.md` checkbox format
- Generate `PROMPT.md` from spec + plan context
- Generate `@AGENT.md` from build/test commands
- Enable autonomous implementation with progress tracking

### Requirements

#### R1: Artifact Conversion

**R1.1**: Convert `tasks.md` to `@fix_plan.md`
- Parse task items from tasks.md
- Convert to checkbox format: `- [ ] Task description`
- Preserve task grouping/phases
- Include dependency ordering

**R1.2**: Generate `PROMPT.md`
- Combine context from `constitution.md`, `spec.md`, `plan.md`
- Include success criteria
- Reference `@fix_plan.md` for task tracking
- Keep under 2000 words for context efficiency

**R1.3**: Generate `@AGENT.md`
- Extract build commands from `CLAUDE.md` or `package.json`
- Extract test commands
- Include verification steps
- Add environment setup instructions

#### R2: Autonomous Execution

**R2.1**: Start Ralph Loop
- Invoke `ralph` command with generated files
- Support `--max N` iteration limit
- Support `--monitor` for tmux dashboard
- Respect existing safety guards

**R2.2**: Progress Tracking
- Monitor `@fix_plan.md` checkbox completion
- Track iteration count
- Detect stall conditions (no progress over N iterations)
- Report completion status

**R2.3**: Git Integration
- Commit after each significant change
- Use conventional commit messages
- Tag completion milestones

#### R3: Remote Execution (Optional)

**R3.1**: Remote Host Support
- Sync project to remote via rsync
- Execute Ralph on remote server
- Stream progress back
- Pull completed work

**R3.2**: Parallel Execution
- Support git worktrees for parallel streams
- Distribute tasks across worktrees
- Merge completed streams

#### R4: Claude Code Hooks Integration

**R4.1**: PreToolUse Validation
- Validate code changes against spec before execution
- Block changes that violate constitution principles
- Warn on scope creep

**R4.2**: PostToolUse Progress Update
- Auto-update task checkboxes on completion
- Track metrics (files changed, tests passed)
- Log activity for review

**R4.3**: Stop Hook Cleanup
- Commit pending changes
- Generate completion summary
- Notify user via desktop notification

### Non-Requirements (Out of Scope)

- Visual IDE integration (CLI-first)
- Web dashboard (tmux is sufficient)
- Cloud deployment (local + SSH remotes only)
- Multi-model support (Claude Code only)

### Success Criteria

1. User can run `/speckit.ralph init` and get valid Ralph project files
2. User can run `/speckit.ralph start` and see autonomous progress
3. All tasks in `@fix_plan.md` get checked when implementation complete
4. Generated code passes tests defined in `@AGENT.md`
5. Git history shows atomic commits per task

### Acceptance Tests

```bash
# Test 1: Artifact conversion
cd test-project
/speckit.ralph init
[ -f PROMPT.md ] && echo "PASS: PROMPT.md created"
[ -f @fix_plan.md ] && echo "PASS: @fix_plan.md created"
[ -f @AGENT.md ] && echo "PASS: @AGENT.md created"

# Test 2: Checkbox format
grep -q "^\- \[ \]" @fix_plan.md && echo "PASS: Checkboxes present"

# Test 3: Start execution
/speckit.ralph start --max 3
# Should see iteration progress

# Test 4: Completion detection
grep -q "^\- \[x\]" @fix_plan.md && echo "PASS: Tasks completed"
```

### Dependencies

- Ralph CLI installed (`~/.ralph/` or `~/.local/bin/ralph`)
- Claude Code with hooks support
- Git repository initialized
- Spec Kit artifacts present (spec.md, plan.md, tasks.md)

### Timeline

Implementation phases:
1. **Phase 1**: Artifact conversion (`/speckit.ralph init`)
2. **Phase 2**: Basic execution (`/speckit.ralph start`)
3. **Phase 3**: Progress tracking (`/speckit.ralph status`)
4. **Phase 4**: Remote execution (`/speckit.ralph remote`)
5. **Phase 5**: Hook integration (spec validation)
