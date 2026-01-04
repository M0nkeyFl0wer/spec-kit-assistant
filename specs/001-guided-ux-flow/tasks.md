# Tasks: Guided UX Flow

**Input**: Design documents from `/specs/001-guided-ux-flow/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec - tests are OPTIONAL for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (per plan.md)
- New modules: `src/guided/`, `src/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and new directory structure

- [x] T001 Create `src/guided/` directory for new guided UX modules
- [x] T002 Create `src/integration/` directory for external integration modules
- [x] T003 [P] Add `uuid` dependency to package.json for session IDs
- [x] T004 [P] Create `src/guided/index.js` module exports file

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement Session entity class in `src/guided/entities/session.js` per data-model.md
- [x] T006 [P] Implement PhaseState entity class in `src/guided/entities/phase-state.js` per data-model.md
- [x] T007 [P] Implement Decision entity class in `src/guided/entities/decision.js` per data-model.md
- [x] T008 [P] Implement UserPreferences entity class in `src/guided/entities/user-preferences.js` per data-model.md
- [x] T009 Implement platform-aware config path resolver in `src/guided/utils/config-paths.js` (XDG spec per research.md)
- [x] T010 Implement SessionManager with load/save/auto-save in `src/guided/session-manager.js` (FR-006, FR-012)
- [x] T011 [P] Implement StreamingOutput with ANSI escape sequences in `src/guided/streaming-output.js` (FR-013, per research.md)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - First-Time Project Setup (Priority: P1) 🎯 MVP

**Goal**: Enable a new user to start a project with a single natural language description, minimal follow-up questions, and smart defaults.

**Independent Test**: Start a new project from scratch, verify time-to-first-spec < 3 minutes and question count <= 2.

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement SmartDefault entity class in `src/guided/entities/smart-default.js` per data-model.md
- [ ] T013 [P] [US1] Create project archetype definitions in `src/guided/archetypes/index.js` (web-app, cli-tool, api, mobile)
- [ ] T014 [US1] Implement SmartDefaults analyzer with confidence scoring in `src/guided/smart-defaults.js` (FR-003)
- [ ] T015 [US1] Implement QuestionReducer to enforce max 1 primary + 2 follow-up questions in `src/guided/question-reducer.js` (FR-001, FR-011)
- [ ] T016 [US1] Create GuidedOnboarding flow controller in `src/guided/flows/onboarding-flow.js`
- [ ] T017 [US1] Integrate GuidedOnboarding with existing `src/onboarding/flow-controller.js` (modify existing file)
- [ ] T018 [US1] Update `spec-assistant.js` init command to use guided onboarding flow
- [ ] T019 [US1] Add "customize" expand option for advanced users per FR-007

**Checkpoint**: At this point, User Story 1 should be fully functional - new users can onboard with minimal questions

---

## Phase 4: User Story 2 - Spec Creation with Smart Defaults (Priority: P1)

**Goal**: Users can create feature specifications with max 3 clarification questions, each showing 2-4 suggested answers.

**Independent Test**: Run `/speckit.specify` with a feature description, verify spec created with <= 3 questions asked.

### Implementation for User Story 2

- [ ] T020 [P] [US2] Implement ClarificationQuestion entity in `src/guided/entities/clarification-question.js` per data-model.md
- [ ] T021 [P] [US2] Implement Option entity in `src/guided/entities/option.js` per data-model.md
- [ ] T022 [US2] Extend SmartDefaults to analyze feature descriptions in `src/guided/smart-defaults.js` (add specifyFeature method)
- [ ] T023 [US2] Create QuestionPresenter to format questions with implications in `src/guided/question-presenter.js` (FR-002)
- [ ] T024 [US2] Create GuidedSpecify flow controller in `src/guided/flows/specify-flow.js`
- [ ] T025 [US2] Integrate streaming output for AI-generated spec content in GuidedSpecify
- [ ] T026 [US2] Add "Other" free-text option to all questions per edge case requirement
- [ ] T027 [US2] Update existing specify workflow to use GuidedSpecify flow

**Checkpoint**: User Stories 1 AND 2 should both work independently - complete onboarding and specify workflows

---

## Phase 5: User Story 3 - Progressive Disclosure (Priority: P2)

**Goal**: Power users can access advanced features via expand/collapse controls without overwhelming beginners.

**Independent Test**: Complete any workflow using only defaults (never click expand) - verify functional output.

### Implementation for User Story 3

- [ ] T028 [P] [US3] Create ExpandableSection UI component in `src/guided/ui/expandable-section.js` (FR-007)
- [ ] T029 [US3] Add expand/collapse state tracking to UserPreferences (showAdvancedOptions flag)
- [ ] T030 [US3] Integrate ExpandableSection into GuidedOnboarding flow
- [ ] T031 [US3] Integrate ExpandableSection into GuidedSpecify flow
- [ ] T032 [US3] Add "Tell me more" / "Customize" labels per acceptance scenario

**Checkpoint**: All workflows support both quick mode (defaults) and detailed mode (expanded)

---

## Phase 6: User Story 4 - Progress Visibility (Priority: P2)

**Goal**: Users always see where they are in the workflow with progress indicators and delightful micro-celebrations.

**Independent Test**: Walk through any workflow, verify progress bar visible at each step and celebration appears on phase completion.

### Implementation for User Story 4

- [ ] T033 [P] [US4] Implement ProgressTracker in `src/guided/progress-tracker.js` (FR-005)
- [ ] T034 [P] [US4] Implement MicroCelebrations with encouraging messages in `src/guided/micro-celebrations.js` (FR-008)
- [ ] T035 [US4] Create progress bar renderer using chalk in `src/guided/ui/progress-bar.js`
- [ ] T036 [US4] Integrate ProgressTracker into all guided flows (onboarding, specify)
- [ ] T037 [US4] Add phase completion callbacks to trigger MicroCelebrations
- [ ] T038 [US4] Add keyboard navigation support to progress indicator (FR-009)
- [ ] T039 [US4] Allow revisiting completed phases from progress indicator

**Checkpoint**: Full workflow experience with progress visibility and celebrations

---

## Phase 7: User Story 5 - Little Helper Integration (Priority: P3)

**Goal**: Little Helper desktop app can invoke Spec Kit via CLI with structured JSON output, fully abstracting terminal interaction.

**Independent Test**: Send JSON-RPC request via stdin, verify valid JSON response on stdout per contracts/cli-json-schema.json.

### Implementation for User Story 5

- [ ] T040 [P] [US5] Implement JSON-RPC request parser in `src/integration/json-rpc-parser.js`
- [ ] T041 [P] [US5] Implement JSON-RPC response formatter in `src/integration/json-rpc-response.js`
- [ ] T042 [US5] Implement CLI JSON interface router in `src/integration/cli-json-interface.js` (FR-010)
- [ ] T043 [US5] Implement `init` method handler per contracts/cli-json-schema.json
- [ ] T044 [US5] Implement `specify` method handler per contracts/cli-json-schema.json
- [ ] T045 [US5] Implement `answer` method handler per contracts/cli-json-schema.json
- [ ] T046 [US5] Implement `status` method handler per contracts/cli-json-schema.json
- [ ] T047 [US5] Implement `plan` and `tasks` method handlers per contracts/cli-json-schema.json
- [ ] T048 [US5] Implement NDJSON streaming for AI output (stream method per contract)
- [ ] T049 [US5] Add `--json` flag to `spec-assistant.js` to enable JSON mode
- [ ] T050 [US5] Add error code responses per contracts/cli-json-schema.json errorCodes
- [ ] T051 [US5] Ensure stderr used only for logs, stdout reserved for JSON responses

**Checkpoint**: Little Helper can invoke all Spec Kit features via JSON-RPC protocol

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T052 [P] Update CLAUDE.md with guided UX usage instructions
- [ ] T053 [P] Update README.md with new guided workflow documentation
- [ ] T054 [P] Add JSDoc comments to all new modules in `src/guided/`
- [ ] T055 Code review and refactor for consistency across guided modules
- [ ] T056 Verify all flows work with keyboard-only navigation (FR-009)
- [ ] T057 Verify streaming output works in non-TTY environments (CI/piped)
- [ ] T058 Run `specs/001-guided-ux-flow/quickstart.md` validation
- [ ] T059 Manual testing: complete full onboarding → specify → plan flow
- [ ] T060 Validate defaults-only workflow: complete onboarding → specify without clicking any "expand" or "customize" options (FR-004 verification)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 but can proceed in parallel
  - US3 and US4 are both P2 and depend on US1/US2 for integration
  - US5 is P3 and can proceed independently after Foundation
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - May share SmartDefaults with US1
- **User Story 3 (P2)**: Requires US1/US2 flows to exist for integration
- **User Story 4 (P2)**: Requires US1/US2 flows to exist for integration
- **User Story 5 (P3)**: Independent after Foundation - wraps all workflows in JSON

### Within Each User Story

- Entities before services
- Services before flow controllers
- Flow controllers before integration with existing code
- Story complete before moving to next priority

### Parallel Opportunities

- T003, T004 in Setup can run in parallel
- T006, T007, T008, T011 in Foundational can run in parallel
- T012, T013 in US1 can run in parallel
- T020, T021 in US2 can run in parallel
- T033, T034 in US4 can run in parallel
- T040, T041 in US5 can run in parallel
- T052, T053, T054 in Polish can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# After T005 (Session entity) completes, launch these in parallel:
Task: "Implement PhaseState entity class in src/guided/entities/phase-state.js"
Task: "Implement Decision entity class in src/guided/entities/decision.js"
Task: "Implement UserPreferences entity class in src/guided/entities/user-preferences.js"
Task: "Implement StreamingOutput in src/guided/streaming-output.js"
```

## Parallel Example: User Story 1

```bash
# After Foundational completes, launch these in parallel:
Task: "Implement SmartDefault entity class in src/guided/entities/smart-default.js"
Task: "Create project archetype definitions in src/guided/archetypes/index.js"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (onboarding)
4. Complete Phase 4: User Story 2 (specify)
5. **STOP and VALIDATE**: Test onboarding → specify flow end-to-end
6. Deploy/demo if ready - this is the core value proposition!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 → Core guided workflow (MVP!)
3. Add US3 → Progressive disclosure for power users
4. Add US4 → Delightful progress experience
5. Add US5 → Little Helper integration
6. Polish → Documentation and refinement

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (onboarding)
   - Developer B: User Story 2 (specify)
   - Developer C: User Story 5 (JSON interface - independent)
3. After US1/US2 complete:
   - Developer A: User Story 3 (progressive disclosure)
   - Developer B: User Story 4 (progress visibility)
4. Stories complete and integrate

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Existing files to modify: `spec-assistant.js`, `src/onboarding/flow-controller.js`
- All new files go in `src/guided/` or `src/integration/`
