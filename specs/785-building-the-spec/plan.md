
# Implementation Plan: Spec Assistant UX with Animations and Install Script

**Branch**: `785-building-the-spec` | **Date**: 2025-09-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/home/monkeyflower/spec-kit-assistant/specs/785-building-the-spec/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Developer-friendly installation and UX experience featuring one-command setup, animated interface with Spec the Golden Retriever character, visual progress indicators, and offline-capable operation on Linux/macOS systems with 500ms animation response targets.

## Technical Context
**Language/Version**: Node.js 18+ (existing codebase)
**Primary Dependencies**: commander.js, figlet, chalk, inquirer, ora, fs-extra (from package.json)
**Enhanced Dependencies**: Enhanced swarm orchestrator integration, GitHub API client capabilities
**Storage**: File-based configuration, no database required
**Testing**: Node.js native test runner (from package.json)
**Target Platform**: Linux and macOS (Unix-like systems)
**Project Type**: Single CLI application with terminal UX
**Performance Goals**: Animation responses <500ms, install script <2 minutes
**Constraints**: Fully offline capable, terminal compatibility, 100% character consistency
**Scale/Scope**: Single developer tool, ASCII animations, install automation

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Swarm-First Architecture**: Must use existing `enhanced-swarm-orchestrator.js` - no custom coordinators
**Spec-Driven Development**: Feature must have valid spec.md with resolved [NEEDS CLARIFICATION] markers
**Character-Driven UX**: Implementation must support Spec the Golden Retriever interface patterns
**Agent Integration**: Plan must update CLAUDE.md incrementally during Phase 1
**Production Readiness**: Must include testing strategy, security scan plan, and performance targets

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->
```
src/
├── animation/         # ASCII animation engine
├── character/         # Spec personality system
├── consultation/      # Enhanced consultation engine
├── spec-kit/         # GitHub Spec Kit integration
├── installation/      # Install script logic
├── cli/              # Command interface
├── integration/      # Swarm and external integrations
└── core/             # Shared utilities

tests/
├── contract/         # UX behavior contracts
├── integration/      # Full workflow tests
└── unit/            # Component tests

scripts/
└── install.sh       # One-command installation
```

**Structure Decision**: Single CLI project structure selected. Organized by functional domains (animation, character, consultation, spec-kit, installation) rather than technical layers. Enhanced consultation engine provides multi-phase project discovery. GitHub Spec Kit integration enables official spec.new compatibility. Swarm integration supports complex task coordination. Install script at root level for easy discovery.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate from contracts: install-script.contract → install script tests + implementation
- Generate from contracts: animation-engine.contract → animation tests + engine implementation
- Generate from contracts: character-persona.contract → persona tests + character system
- Generate from data model: InstallationConfig, AnimationSequence, CharacterPersona, UXState → model classes
- Generate from quickstart: Installation workflow → integration tests

**Ordering Strategy**:
- Setup: Create directory structure, configure dependencies
- Tests First (TDD): Contract tests for install script, animation engine, character persona [P]
- Core Models: Data model implementations [P]
- Implementation: Install script, animation engine, character system
- Integration: Terminal capability detection, fallback modes
- Polish: Performance optimization, error handling, documentation

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md
- Setup tasks: 3 tasks
- Contract tests: 6 tasks [P]
- Model implementations: 4 tasks [P]
- Core implementations: 8 tasks
- Integration & polish: 5 tasks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
