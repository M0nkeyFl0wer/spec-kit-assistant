
# Implementation Plan: Web3 Context Templates for Ethereum dApp Development

**Branch**: `789-web3-context-templates` | **Date**: 2025-09-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/home/monkeyflower/spec-kit-assistant/specs/789-web3-context-templates/spec.md`

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
Extend the context engineering system (Feature 788) with Web3-specific personas, Scaffold-ETH boilerplate templates, smart contract security patterns, and Ethereum dApp best practices. The system acts as a protective guide (like a dog protecting its owner) by detecting Web3 keywords, activating specialized personas (Smart Contract Security, DeFi Patterns, Gas Optimization, Wallet Safety), and recommending appropriate privacy/security tools based on user needs without being pushy. Key innovations include comprehensive wallet drainer protection ($494M stolen in 2024), transaction simulation integration, privacy tool guidance (Flashbots Protect, Revoke.cash, ZK frameworks), and safety-first educational approach respecting user choice.

## Technical Context
**Language/Version**: JavaScript (Node.js 18+, ES modules), Solidity 0.8+
**Primary Dependencies**: Feature 788 (PersonaRotator, ContextState, SocraticRefiner), Scaffold-ETH patterns (bundled), OpenZeppelin contracts reference
**Storage**: Local file system for templates and persona banks (JSON/YAML), no external database
**Testing**: Node.js test runner, contract tests for Web3 personas, integration tests for domain detection
**Target Platform**: CLI tool (cross-platform), works offline with bundled templates
**Project Type**: single - extends existing Spec Kit Assistant architecture
**Performance Goals**: Domain detection <100ms, template generation <5s, persona activation <200ms
**Constraints**: Offline-capable (no external API calls), templates bundled locally, privacy-respecting (never force tools on users)
**Scale/Scope**: 4 Web3 personas, 6+ Scaffold-ETH templates (DEX/NFT/DAO/Token/Lending/Staking), 20+ privacy/security tool recommendations

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS (constitution is template-only, no specific requirements defined)

**General Principles Applied**:
- ✅ **Modularity**: Web3 personas are standalone modules that integrate with Feature 788
- ✅ **Testability**: Contract tests for personas, integration tests for domain detection
- ✅ **Offline-First**: All templates bundled locally, no external API dependencies
- ✅ **User Respect**: Never force privacy tools, always present options with education (FR-021)
- ✅ **Simplicity**: Extends existing architecture, doesn't reinvent persona system

**No violations detected** - Feature builds on established Feature 788 patterns

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
```
src/
├── context/
│   └── web3-domain-detector.js      # Web3 keyword detection (FR-001, FR-002)
├── personas/
│   └── web3/
│       ├── smart-contract-security.js  # Security & privacy persona (FR-004, FR-012)
│       ├── defi-patterns.js            # DeFi patterns persona (FR-005)
│       ├── gas-optimization.js         # Gas optimization persona (FR-006)
│       └── wallet-integration.js       # Wallet security persona (FR-007)
├── templates/
│   └── web3/
│       ├── scaffold-eth-templates/     # Scaffold-ETH boilerplate (FR-008, FR-009)
│       │   ├── dex-template.json
│       │   ├── nft-marketplace-template.json
│       │   ├── dao-template.json
│       │   ├── token-template.json
│       │   ├── lending-template.json
│       │   └── staking-template.json
│       ├── contract-patterns/          # Smart contract patterns (FR-011, FR-013)
│       │   ├── security-patterns.json
│       │   ├── openzeppelin-patterns.json
│       │   └── upgrade-patterns.json
│       ├── frontend-patterns/          # Frontend integration (FR-010)
│       │   ├── wagmi-hooks.json
│       │   └── wallet-connection.json
│       └── privacy-tools/              # Privacy/security tool catalog (FR-014, FR-019, FR-020)
│           ├── privacy-layers.json     # Aztec, Railgun, zkBob
│           ├── zk-frameworks.json      # Circom, Noir
│           ├── transaction-privacy.json # Flashbots, stealth addresses
│           └── wallet-security.json    # Revoke.cash, Tenderly, Blocknative
└── guidance/
    └── safety-guide.js                 # Safety-first guidance system (FR-019, FR-020, FR-021)

tests/
├── contract/
│   ├── test_web3_domain_detector.js
│   ├── test_smart_contract_security_persona.js
│   ├── test_defi_patterns_persona.js
│   ├── test_gas_optimization_persona.js
│   ├── test_wallet_integration_persona.js
│   └── test_scaffold_template_generator.js
├── integration/
│   ├── test_web3_persona_rotation.js
│   ├── test_privacy_tool_recommendation.js
│   └── test_safety_guidance_workflow.js
└── unit/
    ├── test_keyword_detection.js
    └── test_template_selection.js
```

**Structure Decision**: Single project structure extending existing Spec Kit Assistant. Web3-specific modules organized under `src/personas/web3/`, `src/templates/web3/`, and `src/context/`. This integrates cleanly with Feature 788's persona rotation system without creating separate projects.

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
- Generate tasks from Phase 1 design docs (contracts, data-model.md, quickstart.md)
- Each contract → contract test task [P]:
  - `web3-domain-detector.contract.yaml` → test_web3_domain_detector.js
  - `smart-contract-security-persona.contract.yaml` → test_smart_contract_security_persona.js
  - `safety-guidance-system.contract.yaml` → test_safety_guidance_system.js
- Each entity in data-model.md → model creation task [P]:
  - Web3DomainContext
  - Web3PersonaContext
  - ScaffoldTemplate
  - PrivacyToolCatalog (JSON files)
  - SafetyGuidanceProfile
  - ContractSecurityPattern
  - GasOptimizationProfile
  - SocraticRefinementExtension
- Integration tasks from user stories (FR-001 through FR-021)
- Implementation tasks to make tests pass

**Ordering Strategy** (TDD + Dependency):
1. **Phase 2.1: Tool Catalogs** [P] (no dependencies)
   - Create JSON files: privacy-layers.json, zk-frameworks.json, transaction-privacy.json, wallet-security.json
   - Create contract-patterns JSON files
   - Create scaffold-eth-templates JSON files

2. **Phase 2.2: Core Models** [P] (depends on catalogs)
   - Implement Web3DomainContext
   - Implement Web3PersonaContext base
   - Implement SafetyGuidanceProfile

3. **Phase 2.3: Domain Detector** (depends on models)
   - Write contract tests (test_web3_domain_detector.js)
   - Implement web3-domain-detector.js
   - Verify NFR-001 (<100ms performance)

4. **Phase 2.4: Personas** [P] (depends on models + catalogs)
   - Write contract tests for each persona
   - Implement smart-contract-security.js persona
   - Implement defi-patterns.js persona (FR-005)
   - Implement gas-optimization.js persona (FR-006)
   - Implement wallet-integration.js persona (FR-007)

5. **Phase 2.5: Safety Guidance** (depends on personas + catalogs)
   - Write contract tests (test_safety_guidance_system.js)
   - Implement safety-guide.js
   - Verify non-pushy language (FR-021)

6. **Phase 2.6: Scaffold Template Generator** (depends on catalogs)
   - Write contract tests (test_scaffold_template_generator.js)
   - Implement scaffold-eth-templates/generator.js (FR-008, FR-009)

7. **Phase 2.7: Integration with Feature 788** (depends on all modules)
   - Implement persona registration with PersonaRotator
   - Implement context storage in ContextState
   - Extend SocraticRefiner with Web3 patterns (FR-018)

8. **Phase 2.8: Integration Tests**
   - test_web3_persona_rotation.js
   - test_privacy_tool_recommendation.js
   - test_safety_guidance_workflow.js

9. **Phase 2.9: Quickstart Validation**
   - Execute quickstart.md end-to-end
   - Verify all acceptance criteria pass

**Parallelization Opportunities**:
- Tool catalog creation (tasks in 2.1) can all run in parallel
- Persona implementations (tasks in 2.4) are independent
- Contract tests can be written concurrently with implementation

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

**Estimated Implementation Time**:
- Phase 2.1-2.2 (catalogs + models): 4-6 hours
- Phase 2.3 (domain detector): 2-3 hours
- Phase 2.4 (personas): 8-10 hours (2-2.5 hours per persona)
- Phase 2.5 (safety guidance): 3-4 hours
- Phase 2.6 (template generator): 2-3 hours
- Phase 2.7 (Feature 788 integration): 2-3 hours
- Phase 2.8-2.9 (integration + validation): 3-4 hours
- **Total**: 24-33 hours (~3-4 working days)

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
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [ ] Phase 3: Tasks generated (/tasks command) - READY TO EXECUTE
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅ (Technical Context fully defined)
- [x] Complexity deviations documented ✅ (None - extends existing architecture)

**Artifacts Generated**:
- [x] `research.md` - Privacy tools, security patterns, best practices (10 research areas)
- [x] `data-model.md` - 8 core entities with relationships and validation rules
- [x] `contracts/web3-domain-detector.contract.yaml` - Domain detection API (6 test cases)
- [x] `contracts/smart-contract-security-persona.contract.yaml` - Security persona API (7 test cases)
- [x] `contracts/safety-guidance-system.contract.yaml` - Safety guidance API (8 test cases)
- [x] `quickstart.md` - 5-step validation workflow (~15 min)
- [x] `CLAUDE.md` updated with Feature 789 context

**Ready for /tasks command** ✅

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
