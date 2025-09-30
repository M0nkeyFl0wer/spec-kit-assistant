# Tasks: Spec Assistant UX with Animations and Install Script

**Input**: Design documents from `/home/monkeyflower/spec-kit-assistant/specs/785-building-the-spec/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   ✅ Found: tech stack (Node.js 18+, commander.js, figlet, chalk, inquirer, ora), structure
2. Load optional design documents:
   ✅ data-model.md: 7 entities → InstallationConfig, AnimationSequence, CharacterPersona, UXState, GitHubSpecKitConfig, ConsultationSession, SwarmIntegrationContext
   ✅ contracts/: 3 files → install-script, animation-engine, character-persona tests
   ✅ research.md: Technology decisions → setup guidance
3. Generate tasks by category:
   ✅ Setup: directory structure, dependencies, linting
   ✅ Tests: contract tests, integration tests
   ✅ Core: models, animation engine, character system, install script
   ✅ Integration: terminal detection, fallback modes
   ✅ Polish: unit tests, performance, documentation
4. Apply task rules:
   ✅ Different files = marked [P] for parallel
   ✅ Same file = sequential (no [P])
   ✅ Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   ✅ All contracts have corresponding tests
   ✅ All entities have model tasks
   ✅ All tests come before implementation
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Paths based on plan.md structure: animation/, character/, installation/, cli/, core/

## Phase 3.1: Setup
- [x] T001 Create project directory structure per plan.md: src/{animation,character,consultation,spec-kit,installation,cli,integration,core}/, tests/{contract,integration,unit}/, scripts/
- [x] T002 Initialize package.json dependencies: commander.js, figlet, chalk, inquirer, ora, fs-extra (verify existing dependencies)
- [x] T003 [P] Configure Node.js native test runner and ESLint formatting tools

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test install script in tests/contract/test_install_script.js
- [x] T005 [P] Contract test animation engine in tests/contract/test_animation_engine.js
- [x] T006 [P] Contract test character persona in tests/contract/test_character_persona.js
- [x] T007 [P] Contract test enhanced consultation engine in tests/contract/test_consultation_engine.js
- [x] T008 [P] Contract test GitHub Spec Kit integration in tests/contract/test_spec_kit_integration.js
- [x] T009 [P] Contract test GitHub template generation in tests/contract/test_github_templates.js
- [x] T010 [P] Contract test consultation discovery flow in tests/contract/test_consultation_discovery.js
- [x] T011 [P] Contract test swarm integration coordination in tests/contract/test_swarm_coordination.js
- [x] T012 [P] Integration test installation workflow in tests/integration/test_installation_workflow.js
- [x] T013 [P] Integration test animation display in tests/integration/test_animation_display.js
- [x] T014 [P] Integration test character interaction in tests/integration/test_character_interaction.js
- [x] T015 [P] Integration test consultation flow in tests/integration/test_consultation_flow.js
- [x] T016 [P] Integration test GitHub Spec Kit generation in tests/integration/test_spec_kit_generation.js
- [x] T017 [P] Performance tests for 500ms animation targets in tests/integration/test_performance.js

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T018 [P] InstallationConfig model in src/core/installation-config.js
- [x] T019 [P] AnimationSequence model in src/core/animation-sequence.js
- [x] T020 [P] CharacterPersona model in src/core/character-persona.js
- [x] T021 [P] UXState model in src/core/ux-state.js
- [x] T022 [P] ConsultationSession model in src/core/consultation-session.js
- [x] T023 [P] GitHubSpecKitConfig model in src/core/github-spec-kit-config.js
- [ ] T024 Animation engine implementation in src/animation/engine.js
- [ ] T025 Character system implementation in src/character/persona.js
- [ ] T026 Enhanced consultation engine implementation in src/consultation/enhanced-consultation-engine.js
- [ ] T027 GitHub Spec Kit integration implementation in src/spec-kit/github-integration.js
- [ ] T028 Spec Kit implementer in src/core/spec-kit-implementer.js
- [ ] T029 Install script implementation in scripts/install.sh
- [ ] T030 CLI command interface in src/cli/commands.js

## Phase 3.4: Integration
- [ ] T031 Terminal capability detection in src/core/terminal-detector.js
- [ ] T032 Fallback mode implementation in src/animation/fallback.js
- [ ] T033 Character response validation in src/character/validator.js
- [ ] T034 Consultation engine swarm integration in src/integration/consultation-swarm-integration.js
- [ ] T035 GitHub Spec Kit router integration in src/integration/spec-kit-router.js
- [ ] T036 Main CLI entry point integration in src/index.js

## Phase 3.5: Polish
- [ ] T037 [P] Unit tests for terminal detection in tests/unit/test_terminal_detector.js
- [ ] T038 [P] Unit tests for animation timing in tests/unit/test_animation_timing.js
- [ ] T039 [P] Unit tests for character validation in tests/unit/test_character_validator.js
- [ ] T040 [P] Unit tests for consultation side quest handling in tests/unit/test_side_quest_handler.js
- [ ] T041 [P] Unit tests for GitHub Spec Kit template generation in tests/unit/test_template_generator.js
- [ ] T042 [P] Update documentation with usage examples
- [ ] T043 Error handling and logging implementation
- [ ] T044 Run quickstart.md validation workflow

## Dependencies
- Setup (T001-T003) before all other phases
- Tests (T004-T017) **MUST COMPLETE** before implementation (T018-T036)
- Models (T018-T023) before engines (T024-T030)
- Core implementation (T024-T030) before integration (T031-T036)
- Integration before polish (T037-T044)

## Parallel Example
```
# Launch T004-T006 together:
Task: "Contract test install script in tests/contract/test_install_script.js"
Task: "Contract test animation engine in tests/contract/test_animation_engine.js"
Task: "Contract test character persona in tests/contract/test_character_persona.js"

# Launch T007-T009 together:
Task: "Integration test installation workflow in tests/integration/test_installation_workflow.js"
Task: "Integration test animation display in tests/integration/test_animation_display.js"
Task: "Integration test character interaction in tests/integration/test_character_interaction.js"

# Launch T018-T023 together:
Task: "InstallationConfig model in src/core/installation-config.js"
Task: "AnimationSequence model in src/core/animation-sequence.js"
Task: "CharacterPersona model in src/core/character-persona.js"
Task: "UXState model in src/core/ux-state.js"
Task: "ConsultationSession model in src/core/consultation-session.js"
Task: "GitHubSpecKitConfig model in src/core/github-spec-kit-config.js"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - install-script.contract → T004 contract test [P] + T029 implementation
   - animation-engine.contract → T005 contract test [P] + T024 implementation
   - character-persona.contract → T006 contract test [P] + T025 implementation
   - consultation-engine.contract → T007 contract test [P] + T026 implementation
   - github-spec-kit.contract → T008 contract test [P] + T027 implementation
   - github-templates.contract → T009 contract test [P] + T028 implementation
   - consultation-discovery.contract → T010 contract test [P] + T026 implementation
   - swarm-coordination.contract → T011 contract test [P] + T034 implementation

2. **From Data Model**:
   - InstallationConfig → T018 model creation [P]
   - AnimationSequence → T019 model creation [P]
   - CharacterPersona → T020 model creation [P]
   - UXState → T021 model creation [P]
   - ConsultationSession → T022 model creation [P]
   - GitHubSpecKitConfig → T023 model creation [P]

3. **From Quickstart Scenarios**:
   - Installation workflow → T012 integration test [P]
   - Animation display → T013 integration test [P]
   - Character interaction → T014 integration test [P]
   - Consultation flow → T015 integration test [P]
   - GitHub Spec Kit generation → T016 integration test [P]

4. **Ordering**:
   - Setup → Tests → Models → Core → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T004-T011)
- [x] All entities have model tasks (T018-T023)
- [x] All tests come before implementation (TDD order)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task