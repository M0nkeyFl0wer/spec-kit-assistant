# Ralph Integration Tasks

## Phase 1: Artifact Conversion

- [ ] Task 1.1: Create `src/ralph/parse-tasks.js` - Parse tasks.md and convert to @fix_plan.md checkbox format
- [ ] Task 1.2: Create `src/ralph/generate-prompt.js` - Combine spec artifacts into PROMPT.md
- [ ] Task 1.3: Create `src/ralph/generate-agent.js` - Extract build/test commands for @AGENT.md
- [ ] Task 1.4: Create `src/ralph/init.js` - CLI entry point for `/speckit.ralph init`
- [ ] Task 1.5: Add unit tests for artifact parsers in `tests/ralph/`

## Phase 2: Ralph Execution

- [ ] Task 2.1: Create `src/ralph/start.js` - Start Ralph loop with --max and --monitor options
- [ ] Task 2.2: Create `src/ralph/status.js` - Parse @fix_plan.md and show progress
- [ ] Task 2.3: Add Ralph installation check with helpful error message
- [ ] Task 2.4: Add integration test for full init → start flow

## Phase 3: Remote Execution

- [ ] Task 3.1: Create `src/ralph/remote.js` - rsync + SSH execution on remote hosts
- [ ] Task 3.2: Create `src/ralph/parallel.js` - Git worktree management for parallel execution
- [ ] Task 3.3: Add tmux session management for parallel panes

## Phase 4: Hook Integration

- [ ] Task 4.1: Create `hooks/validate-against-spec.sh` - PreToolUse validation hook
- [ ] Task 4.2: Create `hooks/update-progress.sh` - PostToolUse progress tracking
- [ ] Task 4.3: Wire hooks into `.claude/settings.json` configuration

## Phase 5: Documentation & Polish

- [ ] Task 5.1: Update README.md with Ralph integration section
- [ ] Task 5.2: Add examples to `.claude/commands/speckit.ralph.md`
- [ ] Task 5.3: Create troubleshooting guide
- [ ] Task 5.4: Final manual testing on test-project
