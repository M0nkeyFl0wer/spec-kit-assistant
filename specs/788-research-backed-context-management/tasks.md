# Tasks: Spec as Context Engineer

**Input**: Design documents from `/home/monkeyflower/spec-kit-assistant/specs/788-research-backed-context-management/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
2. Load design documents ✅
   → data-model.md: 7 entities extracted
   → contracts/: 3 contract files found
   → research.md: 7 architectural decisions
3. Generate tasks by category ✅
4. Apply task rules (TDD, [P] for parallel) ✅
5. Number tasks sequentially (T001-T038) ✅
6. Dependency graph generated ✅
7. Parallel execution examples created ✅
8. Validation: All contracts tested, all entities modeled ✅
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root (as per plan.md)
- Context engineering services in `src/context/`
- Enhancements to existing `src/core/` and `src/consultation/`

---

## Phase 3.1: Setup

- [x] T001 Verify existing spec-kit-assistant structure and dependencies intact
- [x] T002 [P] Install additional Node.js dependencies: `semver` for versioning
- [x] T003 [P] Create `src/context/` directory structure for context engineering services
- [x] T004 [P] Create `.specify/state/` directory for context state storage
- [x] T005 [P] Create `.specify/state/version-history/` directory for version snapshots

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

### Contract Tests (Each contract → test file)
- [x] T006 [P] Create contract test for ContextState API in `tests/contract/test_context_state.js`
- [x] T007 [P] Create contract test for ReconciliationProtocol API in `tests/contract/test_reconciliation_protocol.js`
- [x] T008 [P] Create contract test for GATEElicitor API in `tests/contract/test_gate_elicitor.js`
- [x] T009 [P] Create contract test for PersonaRotator API in `tests/contract/test_persona_rotator.js`
- [x] T010 [P] Create contract test for SocraticRefiner API in `tests/contract/test_socratic_refiner.js`
- [x] T011 [P] Create contract test for DiscoveryTimer API in `tests/contract/test_discovery_timer.js`
- [x] T012 [P] Create contract test for ContextVersion API in `tests/contract/test_context_version.js`

### Integration Tests (From acceptance scenarios)
- [x] T013 [P] Create integration test for mid-build reconciliation in `tests/integration/test_mid_build_reconciliation.js`
- [x] T014 [P] Create integration test for GATE discovery flow in `tests/integration/test_gate_discovery_flow.js`
- [x] T015 [P] Create integration test for persona enrichment in `tests/integration/test_persona_enrichment.js`
- [x] T016 [P] Create integration test for Socratic refinement loop in `tests/integration/test_socratic_refinement_loop.js`
- [x] T017 [P] Create integration test for 15-minute discovery protocol in `tests/integration/test_15_minute_discovery.js`

---

## Phase 3.3: Entity Models

### Data Models (Each entity → model file)
- [x] T018 [P] Create ContextState model in `src/context/models/context-state.js` with validation rules
- [x] T019 [P] Create ContextVersion model in `src/context/models/context-version.js` with immutability
- [x] T020 [P] Create ReconciliationEvent model in `src/context/models/reconciliation-event.js` with state transitions
- [x] T021 [P] Create PersonaContext model in `src/context/models/persona-context.js` with validation
- [x] T022 [P] Create ElicitationPhase model in `src/context/models/elicitation-phase.js` with time tracking
- [x] T023 [P] Create AssumptionRefinement model in `src/context/models/assumption-refinement.js` with iteration limits
- [x] T024 [P] Create ContextAlignment model in `src/context/models/context-alignment.js` with divergence detection

---

## Phase 3.4: Core Services (Sequential - build on models)

### Context State Management
- [x] T025 Implement ContextState service in `src/context/context-state.js` with EventEmitter and file persistence (FR-001, FR-002, FR-003)

### Version Management
- [x] T026 Implement ContextVersion service in `src/context/context-version.js` with semver integration and changelog generation (FR-006)

### Reconciliation Protocol
- [x] T027 Implement ReconciliationProtocol service in `src/context/reconciliation-protocol.js` with pause-sync-resume logic (FR-004, FR-005)

### GATE Framework
- [x] T028 Implement GATEElicitor service in `src/context/gate-elicitor.js` with problem-first questions and context extraction (FR-007, FR-008, FR-009, FR-010)

### Multi-Persona System
- [x] T029 Implement PersonaRotator service in `src/context/persona-rotator.js` with 4 personas and uniqueness detection (FR-011, FR-012, FR-013)

### Socratic Refinement
- [x] T030 Implement SocraticRefiner service in `src/context/socratic-refiner.js` with assumption detection and iterative probing (FR-014, FR-015, FR-016)

### Discovery Timer
- [x] T031 Implement DiscoveryTimer service in `src/context/discovery-timer.js` with phase management and fast-track options (FR-017, FR-018, FR-019)

---

## Phase 3.5: Integration with Existing Components

### Enhance Spec-First Interceptor
- [x] T032 Integrate ContextState awareness into `src/core/spec-first-interceptor.js` for real-time divergence detection (FR-020, FR-002, FR-003)

### Enhance Consultation Engine
- [x] T033 Integrate GATE elicitation into `src/consultation/enhanced-consultation-engine.js` replacing current discovery flow (FR-021, FR-007)

### Persona Integration
- [x] T034 Integrate PersonaRotator into `src/consultation/enhanced-consultation-engine.js` for multi-perspective discovery (FR-021, FR-011)

### Socratic Integration
- [x] T035 Integrate SocraticRefiner into `src/consultation/enhanced-consultation-engine.js` for requirement clarification (FR-021, FR-014)

---

## Phase 3.6: Validation & Polish

### Testing & Performance
- [x] T036 [P] Run all contract tests and verify 2s reconciliation budget (NFR-002)
- [x] T037 [P] Run all integration tests and verify 15-minute discovery budget (NFR-003)
- [x] T038 [P] Create backward compatibility tests for existing spec kit functionality in `tests/integration/test_backward_compatibility.js`

### Performance Validation
- [ ] T039 [P] Implement performance test for context divergence detection < 100ms in `tests/performance/test_divergence_detection.js`
- [ ] T040 [P] Implement performance test for reconciliation protocol < 2s in `tests/performance/test_reconciliation_timing.js`
- [ ] T041 [P] Implement performance test for discovery protocol < 15min in `tests/performance/test_discovery_timing.js`

### Documentation & Final Validation
- [ ] T042 [P] Update CLAUDE.md with context engineering architecture (run `.specify/scripts/bash/update-agent-context.sh claude`)
- [ ] T043 [P] Update README.md with context engineering workflow documentation
- [ ] T044 [P] Run complete quickstart validation workflow from `quickstart.md`
- [ ] T045 [P] Validate all success metrics: 0% divergence conflicts, 40% GATE improvement, 86.8% persona completeness, 74% Socratic success

---

## Parallel Execution Examples

### Setup Phase (Can run together)
```bash
# Run these tasks in parallel:
Task T002 & Task T003 & Task T004 & Task T005
```

### Contract Tests (Can run together)
```bash
# Run these tasks in parallel:
Task T006 & Task T007 & Task T008 & Task T009 & Task T010 & Task T011 & Task T012
```

### Integration Tests (Can run together)
```bash
# Run these tasks in parallel:
Task T013 & Task T014 & Task T015 & Task T016 & Task T017
```

### Entity Models (Can run together)
```bash
# Run these tasks in parallel:
Task T018 & Task T019 & Task T020 & Task T021 & Task T022 & Task T023 & Task T024
```

### Performance Tests (Can run together)
```bash
# Run these tasks in parallel:
Task T036 & Task T037 & Task T038 & Task T039 & Task T040 & Task T041
```

### Final Documentation (Can run together)
```bash
# Run these tasks in parallel:
Task T042 & Task T043 & Task T044 & Task T045
```

---

## Dependencies

### Critical Dependencies
- T001 must complete before all other tasks (verify foundation)
- T002-T005 must complete before T006+ (setup before tests)
- T006-T017 must complete before T018+ (tests before implementation - TDD)
- T018-T024 must complete before T025+ (models before services)
- T025-T031 must complete before T032+ (services before integration)
- T032-T035 must complete before T036+ (integration before validation)

### Service Dependencies (Sequential)
- T025 (ContextState) blocks T026 (ContextVersion) - versioning needs state
- T025, T026 block T027 (ReconciliationProtocol) - reconciliation needs state + version
- T027 blocks T032 (spec-first-interceptor integration) - interceptor uses reconciliation
- T028, T029, T030, T031 block T033, T034, T035 (consultation engine enhancements)

### Integration Dependencies
- T032 depends on T025, T026, T027 (ContextState, ContextVersion, ReconciliationProtocol)
- T033 depends on T028 (GATEElicitor)
- T034 depends on T029 (PersonaRotator)
- T035 depends on T030 (SocraticRefiner)

---

## File Impact Analysis

### New Files (Can be parallel)
- All model files (T018-T024): Independent creation in `src/context/models/`
- All contract test files (T006-T012): Independent creation in `tests/contract/`
- All integration test files (T013-T017): Independent creation in `tests/integration/`
- All service files (T025-T031): Sequential in `src/context/` (dependencies exist)

### Modified Files (Sequential tasks required)
- `src/core/spec-first-interceptor.js`: T032 only
- `src/consultation/enhanced-consultation-engine.js`: T033, T034, T035 (sequential)
- `CLAUDE.md`: T042 only
- `README.md`: T043 only

---

## Constitutional Compliance Validation

### Per-Task Constitutional Checks

**T001-T005 (Setup)**:
- ✅ Swarm-First: No swarm coordination needed
- ✅ Spec-Driven: Following spec 788
- ✅ Test-First: N/A (setup tasks)
- ✅ Character-Driven: N/A (infrastructure)
- ✅ Production-Ready: Directory structure follows conventions
- ✅ Incremental Complexity: Justified in plan.md

**T006-T017 (Tests)**:
- ✅ Swarm-First: No swarm coordination needed
- ✅ Spec-Driven: Tests derived from spec contracts
- ✅ **Test-First: CRITICAL - These tests MUST be written and MUST FAIL before T018+**
- ✅ Character-Driven: Tests validate character-preserving behavior
- ✅ Production-Ready: Tests validate performance requirements
- ✅ Incremental Complexity: No additional complexity

**T018-T024 (Models)**:
- ✅ Swarm-First: No swarm coordination needed
- ✅ Spec-Driven: Models from data-model.md entities
- ✅ Test-First: Only after T006-T017 pass
- ✅ Character-Driven: N/A (data structures)
- ✅ Production-Ready: Validation rules enforce data integrity
- ✅ Incremental Complexity: Justified (state management needed)

**T025-T031 (Services)**:
- ✅ Swarm-First: Uses existing swarm orchestrator if needed
- ✅ Spec-Driven: Services implement functional requirements
- ✅ Test-First: Contract tests validate service APIs
- ✅ Character-Driven: GATE/Persona/Socratic maintain friendly tone
- ✅ Production-Ready: Error handling, logging, performance budgets
- ✅ Incremental Complexity: All justified in Complexity Tracking

**T032-T035 (Integration)**:
- ✅ Swarm-First: No new swarm coordinators created
- ✅ Spec-Driven: Integration points from FR-020 to FR-023
- ✅ Test-First: Integration tests validate end-to-end flows
- ✅ **Character-Driven: CRITICAL - Must preserve Spec the Golden Retriever personality**
- ✅ Production-Ready: Backward compatibility maintained
- ✅ Incremental Complexity: Extending existing components, not replacing

**T036-T045 (Validation)**:
- ✅ Swarm-First: No swarm coordination needed
- ✅ Spec-Driven: Validates spec success metrics
- ✅ Test-First: Final validation of TDD cycle
- ✅ Character-Driven: Validates character consistency
- ✅ **Production-Ready: CRITICAL - All performance budgets must pass**
- ✅ Incremental Complexity: No additional complexity

---

## Risk Mitigation

### High-Risk Tasks
- **T032**: Modifying core spec-first-interceptor (backup required, extensive testing)
- **T033-T035**: Modifying core consultation engine (character preservation critical)
- **T027**: Reconciliation protocol (2s budget strict requirement)
- **T031**: Discovery timer (15-minute budget user expectation)

### Validation Requirements
- **T036-T038**: All contract and integration tests must pass
- **T039-T041**: All performance budgets must be met (100ms, 2s, 15min)
- **T044**: Quickstart must execute successfully end-to-end
- **T045**: All success metrics must validate (0% conflicts, 40% GATE, 86.8% persona, 74% Socratic)

### Backward Compatibility Requirements
- **T038**: Existing specs must work without context engineering (graceful degradation)
- **T043**: README must document migration path for existing users
- Existing swarm orchestration must remain functional

---

## Success Criteria

**Task Completion**:
- [x] All 45 tasks defined with clear descriptions
- [x] All tasks numbered sequentially (T001-T045)
- [x] Parallel opportunities identified (23 tasks marked [P])
- [x] Dependencies mapped and blocking relationships clear
- [x] File paths specified for all implementation tasks

**Validation Checklist** (GATE):
- [x] All 3 contracts have corresponding tests (T006, T007, T008)
- [x] All 7 entities have model tasks (T018-T024)
- [x] All 7 services have implementation tasks (T025-T031)
- [x] All tests come before implementation (T006-T017 before T018+)
- [x] Parallel tasks are truly independent (different files, no shared state)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] Constitutional compliance validated per phase

---

**Total Tasks**: 45
**Parallel Opportunities**: 23 tasks can run in parallel
**Sequential Dependencies**: 22 tasks must run sequentially
**Estimated Completion**: Implementation ready for context engineering architecture

**Ready for**: Phase 4 (Implementation execution following constitutional principles)