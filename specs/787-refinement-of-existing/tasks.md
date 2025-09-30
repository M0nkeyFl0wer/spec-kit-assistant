# Tasks: Spec Assistant Constitutional Compliance and Performance Refinement

**Input**: Design documents from `/home/monkeyflower/spec-kit-assistant/specs/787-refinement-of-existing/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   ✅ Found: tech stack (Node.js 18+, enhanced existing dependencies), structure
2. Load optional design documents:
   ✅ data-model.md: 6 entities → ConstitutionalViolation, PerformanceMetric, RequirementRefinement, CoverageGap, AnalysisReport, ValidationCriteria
   ✅ contracts/: 3 files → constitutional-compliance-analyzer, requirement-refinement-engine, coverage-gap-analyzer
   ✅ research.md: Technology decisions → analysis framework setup
3. Generate tasks by category:
   ✅ Setup: analysis directory structure, constitutional standards
   ✅ Tests: contract tests, integration tests
   ✅ Core: models, analysis engines, refinement utilities
   ✅ Integration: swarm coordination, character feedback, performance validation
   ✅ Polish: unit tests, error handling, documentation
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
   ✅ All quickstart scenarios covered
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Paths based on plan.md structure: analysis/, refinement/, validation/, reporting/

## Phase 3.1: Setup
- [x] T001 Create analysis directory structure per plan.md: src/{analysis,refinement,validation,reporting}/, tests/{contract,integration,unit}/
- [x] T002 Initialize constitutional standards configuration in .specify/analysis/constitutional-standards.json

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T003 [P] Contract test constitutional compliance analyzer in tests/contract/test_constitutional_compliance_analyzer.js
- [ ] T004 [P] Contract test requirement refinement engine in tests/contract/test_requirement_refinement_engine.js
- [ ] T005 [P] Contract test coverage gap analyzer in tests/contract/test_coverage_gap_analyzer.js
- [ ] T006 [P] Integration test constitutional analysis workflow in tests/integration/test_constitutional_analysis_workflow.js
- [ ] T007 [P] Integration test requirement refinement workflow in tests/integration/test_requirement_refinement_workflow.js
- [ ] T008 [P] Integration test coverage gap analysis workflow in tests/integration/test_coverage_gap_analysis_workflow.js
- [ ] T009 [P] Integration test end-to-end refinement workflow in tests/integration/test_end_to_end_refinement_workflow.js
- [ ] T010 [P] Integration test performance validation workflow in tests/integration/test_performance_validation_workflow.js

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T011 [P] ConstitutionalViolation model in src/analysis/constitutional-violation.js
- [ ] T012 [P] PerformanceMetric model in src/validation/performance-metric.js
- [ ] T013 [P] RequirementRefinement model in src/refinement/requirement-refinement.js
- [ ] T014 [P] CoverageGap model in src/analysis/coverage-gap.js
- [ ] T015 [P] AnalysisReport model in src/reporting/analysis-report.js
- [ ] T016 [P] ValidationCriteria model in src/validation/validation-criteria.js
- [ ] T017 Constitutional compliance analyzer engine in src/analysis/constitutional-analyzer.js
- [ ] T018 Requirement refinement engine in src/refinement/refinement-engine.js
- [ ] T019 Coverage gap analyzer engine in src/analysis/coverage-analyzer.js
- [ ] T020 Analysis report generator in src/reporting/report-generator.js

## Phase 3.4: Integration
- [ ] T021 Enhanced swarm orchestrator integration for analysis coordination in src/analysis/swarm-coordinator.js
- [ ] T022 Character-driven feedback system for analysis results in src/reporting/character-feedback.js
- [ ] T023 Performance validation with constitutional limits in src/validation/performance-validator.js
- [ ] T024 CLI command interface for analysis commands in src/cli/analysis-commands.js

## Phase 3.5: Polish
- [ ] T025 [P] Unit tests for constitutional violation detection in tests/unit/test_constitutional_violation_detection.js
- [ ] T026 [P] Unit tests for requirement refinement logic in tests/unit/test_requirement_refinement_logic.js
- [ ] T027 [P] Unit tests for coverage gap detection in tests/unit/test_coverage_gap_detection.js
- [ ] T028 [P] Unit tests for character feedback validation in tests/unit/test_character_feedback_validation.js
- [ ] T029 Error handling and logging implementation across analysis modules
- [ ] T030 Backward compatibility validation with existing Spec Assistant functionality
- [ ] T031 Performance optimization for constitutional timing compliance (<100ms analysis, <500ms refinement)
- [ ] T032 Run quickstart.md validation workflow to verify all test scenarios

## Dependencies
- Setup (T001-T002) before all other phases
- Tests (T003-T010) **MUST COMPLETE** before implementation (T011-T024)
- Models (T011-T016) before engines (T017-T020)
- Core implementation (T017-T020) before integration (T021-T024)
- Integration before polish (T025-T032)

## Parallel Example
```
# Launch T003-T005 together:
Task: "Contract test constitutional compliance analyzer in tests/contract/test_constitutional_compliance_analyzer.js"
Task: "Contract test requirement refinement engine in tests/contract/test_requirement_refinement_engine.js"
Task: "Contract test coverage gap analyzer in tests/contract/test_coverage_gap_analyzer.js"

# Launch T006-T010 together:
Task: "Integration test constitutional analysis workflow in tests/integration/test_constitutional_analysis_workflow.js"
Task: "Integration test requirement refinement workflow in tests/integration/test_requirement_refinement_workflow.js"
Task: "Integration test coverage gap analysis workflow in tests/integration/test_coverage_gap_analysis_workflow.js"
Task: "Integration test end-to-end refinement workflow in tests/integration/test_end_to_end_refinement_workflow.js"
Task: "Integration test performance validation workflow in tests/integration/test_performance_validation_workflow.js"

# Launch T011-T016 together:
Task: "ConstitutionalViolation model in src/analysis/constitutional-violation.js"
Task: "PerformanceMetric model in src/validation/performance-metric.js"
Task: "RequirementRefinement model in src/refinement/requirement-refinement.js"
Task: "CoverageGap model in src/analysis/coverage-gap.js"
Task: "AnalysisReport model in src/reporting/analysis-report.js"
Task: "ValidationCriteria model in src/validation/validation-criteria.js"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - constitutional-compliance-analyzer.yaml → T003 contract test [P] + T017 implementation
   - requirement-refinement-engine.yaml → T004 contract test [P] + T018 implementation
   - coverage-gap-analyzer.yaml → T005 contract test [P] + T019 implementation

2. **From Data Model**:
   - ConstitutionalViolation → T011 model creation [P]
   - PerformanceMetric → T012 model creation [P]
   - RequirementRefinement → T013 model creation [P]
   - CoverageGap → T014 model creation [P]
   - AnalysisReport → T015 model creation [P]
   - ValidationCriteria → T016 model creation [P]

3. **From Quickstart Scenarios**:
   - Constitutional analysis workflow → T006 integration test [P]
   - Requirement refinement workflow → T007 integration test [P]
   - Coverage gap analysis workflow → T008 integration test [P]
   - End-to-end refinement workflow → T009 integration test [P]
   - Performance validation workflow → T010 integration test [P]

4. **Ordering**:
   - Setup → Tests → Models → Engines → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T003-T005)
- [x] All entities have model tasks (T011-T016)
- [x] All tests come before implementation (TDD order)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task

## Constitutional Compliance Notes

- **Swarm-First Architecture**: T021 ensures all analysis coordination uses enhanced swarm orchestrator
- **Character-Driven UX**: T022 maintains Spec personality in all feedback and reports
- **Test-First Development**: Strict TDD ordering enforced with T003-T010 before T011-T024
- **Performance Standards**: T023 and T031 enforce constitutional timing limits (<100ms, <500ms)
- **Production Readiness**: T029 implements comprehensive error handling and logging

---

**Status**: Ready for Implementation - All tasks generated with constitutional compliance