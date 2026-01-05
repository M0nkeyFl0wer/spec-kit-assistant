# Tasks: Quality Automation Suite

**Input**: Design documents from `/specs/002-quality-automation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: This feature IS about creating a test suite, so tests are included throughout.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Test Infrastructure)

**Purpose**: Configure test runner, coverage, and project structure

- [x] T001 Add c8 as dev dependency for coverage in package.json
- [x] T002 [P] Create tests/ directory structure: tests/unit/, tests/integration/, tests/fixtures/
- [x] T003 [P] Update package.json scripts: test, test:watch, test:unit, test:integration, test:ci
- [x] T004 [P] Create tests/fixtures/tasks/ directory with sample tasks.md files
- [x] T005 [P] Create tests/fixtures/projects/ directory with mock project structures

---

## Phase 2: Foundational (Shared Test Utilities)

**Purpose**: Core test utilities and mocks that all user story tests depend on

**CRITICAL**: Must complete before any user story test implementation

- [x] T006 Create tests/helpers/mock-exec.js for mocking child_process.exec
- [x] T007 [P] Create tests/helpers/mock-fs.js for mocking file system operations
- [x] T008 [P] Create tests/helpers/mock-gh.js for mocking GitHub CLI commands
- [x] T009 Create tests/helpers/test-utils.js with shared assertion helpers
- [x] T010 [P] Create tests/fixtures/projects/empty-project/ mock directory
- [x] T011 [P] Create tests/fixtures/projects/spec-only/ mock with spec.md only
- [x] T012 [P] Create tests/fixtures/projects/full-feature/ mock with all artifacts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Test Infrastructure (Priority: P1)

**Goal**: Developers can run `npm test` and see passing tests with coverage report

**Independent Test**: Run `npm test` and verify exit code 0 with coverage output

### Implementation for User Story 1

- [x] T013 [US1] Create tests/unit/smoke.test.js with basic passing test to verify runner works
- [x] T014 [US1] Configure c8 coverage thresholds (80% minimum) in package.json or .c8rc
- [x] T015 [US1] Add JUnit XML reporter configuration for CI in package.json scripts
- [x] T016 [US1] Create .github/workflows/test.yml for CI test execution
- [x] T017 [US1] Verify `npm test` runs, shows coverage, exits with code 0

**Checkpoint**: Test infrastructure working - `npm test` succeeds with coverage report

---

## Phase 4: User Story 2 - GitHub Issues Integration (Priority: P1)

**Goal**: Convert tasks.md entries to GitHub Issues via `/speckit.taskstoissues`

**Independent Test**: Run `/speckit.taskstoissues` on a tasks.md and verify issues appear in GitHub

### Tests for User Story 2

- [ ] T018 [P] [US2] Unit test for auth module in tests/unit/github/auth.test.js
- [ ] T019 [P] [US2] Unit test for issues module in tests/unit/github/issues.test.js
- [ ] T020 [P] [US2] Unit test for sync module in tests/unit/github/sync.test.js
- [ ] T021 [P] [US2] Unit test for labels module in tests/unit/github/labels.test.js
- [ ] T022 [P] [US2] Unit test for task parser in tests/unit/github/task-parser.test.js

### Implementation for User Story 2

- [ ] T023 [US2] Create src/github/ directory structure
- [ ] T024 [P] [US2] Implement checkGitHubAuth() in src/github/auth.js (gh CLI → env → none)
- [ ] T025 [P] [US2] Implement parseTasksFile() in src/github/task-parser.js
- [ ] T026 [P] [US2] Implement label management in src/github/labels.js
- [ ] T027 [US2] Implement createIssue(), updateIssue(), closeIssue() in src/github/issues.js
- [ ] T028 [US2] Implement syncTasksToIssues() in src/github/sync.js
- [ ] T029 [US2] Implement updateTasksFile() to write issue numbers back to tasks.md
- [ ] T030 [US2] Create .speckit/sync-state.json schema and read/write functions
- [ ] T031 [US2] Add /speckit.taskstoissues skill definition in .claude/settings.json or equivalent
- [ ] T032 [US2] Handle git-only fallback mode when GitHub unavailable

**Checkpoint**: GitHub Issues integration working - tasks convert to issues

---

## Phase 5: User Story 3 - Agent Detection Tests (Priority: P2)

**Goal**: Verify agent detection correctly identifies Claude Code, Gemini, Cursor, Copilot, OpenCode

**Independent Test**: Run `npm test -- --grep "agent"` and verify all agent detection tests pass

### Tests for User Story 3

- [ ] T033 [P] [US3] Test Claude Code detection in tests/unit/launcher/agent-detector.test.js
- [ ] T034 [P] [US3] Test Gemini CLI detection in tests/unit/launcher/agent-detector.test.js
- [ ] T035 [P] [US3] Test Cursor detection in tests/unit/launcher/agent-detector.test.js
- [ ] T036 [P] [US3] Test Copilot detection in tests/unit/launcher/agent-detector.test.js
- [ ] T037 [P] [US3] Test OpenCode detection in tests/unit/launcher/agent-detector.test.js
- [ ] T038 [US3] Test multiple agents ranked by preference in tests/unit/launcher/agent-detector.test.js
- [ ] T039 [US3] Test empty array returned when no agents in tests/unit/launcher/agent-detector.test.js

**Checkpoint**: Agent detection fully tested - all agent scenarios covered

---

## Phase 6: User Story 4 - Workflow State Tests (Priority: P2)

**Goal**: Verify workflow state machine detects correct stage for each project state

**Independent Test**: Run `npm test -- --grep "workflow"` and verify all state tests pass

### Tests for User Story 4

- [ ] T040 [P] [US4] Test SPEC_INIT stage detection in tests/unit/launcher/workflow-state.test.js
- [ ] T041 [P] [US4] Test SPEC_CREATED stage detection in tests/unit/launcher/workflow-state.test.js
- [ ] T042 [P] [US4] Test PLAN_CREATED stage detection in tests/unit/launcher/workflow-state.test.js
- [ ] T043 [P] [US4] Test TASKS_CREATED stage detection in tests/unit/launcher/workflow-state.test.js
- [ ] T044 [P] [US4] Test IMPLEMENTING stage detection in tests/unit/launcher/workflow-state.test.js
- [ ] T045 [US4] Test COMPLETE stage detection in tests/unit/launcher/workflow-state.test.js

**Checkpoint**: Workflow state machine fully tested - all stages verified

---

## Phase 7: User Story 6 - CLI Passthrough Tests (Priority: P2)

**Goal**: Verify wrapper passes commands to specify CLI without modification

**Independent Test**: Run `npm run test:integration` and verify CLI passthrough tests pass

### Tests for User Story 6

- [ ] T046 [US6] Create integration test for `init` command in tests/integration/cli-passthrough.test.js
- [ ] T047 [P] [US6] Test stdout preservation in tests/integration/cli-passthrough.test.js
- [ ] T048 [P] [US6] Test stderr preservation in tests/integration/cli-passthrough.test.js
- [ ] T049 [US6] Test exit code passthrough (success) in tests/integration/cli-passthrough.test.js
- [ ] T050 [US6] Test exit code passthrough (failure) in tests/integration/cli-passthrough.test.js
- [ ] T051 [US6] Add skip logic when specify CLI not installed in tests/integration/cli-passthrough.test.js

**Checkpoint**: CLI passthrough verified - wrapper is transparent

---

## Phase 8: User Story 5 - Bidirectional Sync (Priority: P3)

**Goal**: Changes in tasks.md sync back to GitHub Issues without duplicates

**Independent Test**: Modify a synced tasks.md and verify issues update correctly

### Tests for User Story 5

- [ ] T052 [P] [US5] Test issue update when task description changes in tests/unit/github/sync.test.js
- [ ] T053 [P] [US5] Test issue close when task marked complete in tests/unit/github/sync.test.js
- [ ] T054 [P] [US5] Test warning when task deleted (issue NOT deleted) in tests/unit/github/sync.test.js
- [ ] T055 [US5] Test orphaned issue link detection in tests/unit/github/sync.test.js
- [ ] T056 [US5] Test duplicate prevention on re-sync in tests/unit/github/sync.test.js

### Implementation for User Story 5

- [ ] T057 [US5] Implement change detection via content hashing in src/github/sync.js
- [ ] T058 [US5] Implement issue update logic in src/github/sync.js
- [ ] T059 [US5] Implement issue close on task completion in src/github/sync.js
- [ ] T060 [US5] Implement orphaned link cleanup in src/github/sync.js
- [ ] T061 [US5] Add warning messages for deleted tasks with existing issues

**Checkpoint**: Bidirectional sync complete - changes flow both directions

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Coverage verification, documentation, edge cases

- [ ] T062 Verify overall coverage meets 80% threshold
- [ ] T063 [P] Add tests for edge cases: malformed tasks.md, rate limiting, auth failures
- [ ] T064 [P] Test ASCII dogs render correctly in tests/unit/character/ascii-dogs.test.js
- [ ] T065 [P] Update quickstart.md with actual commands and examples
- [ ] T066 [P] Add error code constants in src/github/errors.js per contracts/cli-interface.md
- [ ] T067 Run full test suite and fix any failures
- [ ] T068 Update CLAUDE.md with new test commands

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational completion
  - US1 (Test Infra) should complete first (enables verification of other stories)
  - US3, US4, US6 (Tests) can run in parallel after US1
  - US2 (GitHub Integration) can run in parallel with tests
  - US5 (Bidirectional Sync) depends on US2 completion
- **Polish (Phase 9)**: Depends on all stories complete

### User Story Dependencies

| Story | Dependencies | Can Parallelize With |
|-------|--------------|----------------------|
| US1 (P1) | Foundational only | None (do first) |
| US2 (P1) | Foundational, benefits from US1 | US3, US4, US6 |
| US3 (P2) | US1 complete | US4, US6, US2 |
| US4 (P2) | US1 complete | US3, US6, US2 |
| US6 (P2) | US1 complete | US3, US4, US2 |
| US5 (P3) | US2 complete | None |

### Parallel Opportunities

Within each phase, tasks marked [P] can run simultaneously:
- Phase 1: T002, T003, T004, T005
- Phase 2: T007, T008, T010, T011, T012
- Phase 4: T018-T022 (all tests), T024-T026 (independent modules)
- Phase 5: T033-T037 (individual agent tests)
- Phase 6: T040-T044 (individual stage tests)
- Phase 7: T047, T048
- Phase 8: T052-T054 (sync scenario tests)
- Phase 9: T063, T064, T065, T066

---

## Parallel Example: User Story 3 (Agent Detection)

```bash
# Launch all agent detection tests in parallel:
Task: "Test Claude Code detection in tests/unit/launcher/agent-detector.test.js"
Task: "Test Gemini CLI detection in tests/unit/launcher/agent-detector.test.js"
Task: "Test Cursor detection in tests/unit/launcher/agent-detector.test.js"
Task: "Test Copilot detection in tests/unit/launcher/agent-detector.test.js"
Task: "Test OpenCode detection in tests/unit/launcher/agent-detector.test.js"
```

---

## Implementation Strategy

### MVP First (Test Infrastructure + Core Tests)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 - Test Infrastructure
4. **STOP and VALIDATE**: Run `npm test` - should pass with smoke test
5. Continue with US3, US4, US6 for core module tests

### Incremental Delivery

1. Setup + Foundational → Test runner working
2. US1 (Test Infra) → `npm test` works → Validate
3. US2 (GitHub Integration) → Issues sync works → Validate
4. US3, US4, US6 (Module Tests) → Coverage increases → Validate 80%
5. US5 (Bidirectional) → Full sync works → Validate
6. Polish → Production ready

### Solo Developer Strategy

Execute in this order:
1. Phases 1-2 (Setup, Foundational)
2. Phase 3 (US1 - enables testing everything else)
3. Phases 5-7 (US3, US4, US6 - build coverage)
4. Phase 4 (US2 - GitHub integration)
5. Phase 8 (US5 - depends on US2)
6. Phase 9 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Coverage target: 80% (constitutional requirement)
- Tests use Node.js built-in test runner (`node:test`)
- c8 for coverage, JUnit XML + LCOV for CI
