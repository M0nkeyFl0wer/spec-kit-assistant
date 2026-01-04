# Implementation Plan: Guided UX Flow

**Branch**: `001-guided-ux-flow` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-guided-ux-flow/spec.md`

## Summary

Redesign the Spec Kit Assistant UX to provide a guided, hand-holding experience from onboarding through testing. The system will minimize questions (max 1 primary + 3 clarifications per phase), use smart defaults with progressive disclosure, auto-save sessions locally, stream AI responses, and expose a CLI/JSON interface for Little Helper integration.

## Technical Context

**Language/Version**: Node.js 20+ (ES Modules), JavaScript
**Primary Dependencies**: chalk, inquirer, commander, ora (existing); fs-extra (persistence)
**Storage**: Local JSON files in `~/.config/spec-kit-assistant/` or project `.speckit/`
**Testing**: Jest or Vitest (to be added)
**Target Platform**: Cross-platform CLI (Linux, macOS, Windows)
**Project Type**: Single CLI application with modular architecture
**Performance Goals**: <5s initial AI response (streaming), <100ms UI transitions
**Constraints**: No external services for core flow; terminal-abstracted for Little Helper
**Scale/Scope**: Single-user local tool; session state per project

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is not yet defined (template only). Proceeding with implicit principles derived from project context:

| Principle | Status | Notes |
|-----------|--------|-------|
| User-first UX | PASS | Core feature goal |
| CLI-based architecture | PASS | Existing pattern maintained |
| Local-first data | PASS | Session storage in local files |
| No breaking changes | PASS | Additive enhancements to existing commands |
| Security | PASS | Input validation already implemented (spec-assistant.js:111-130) |

**Post-Design Re-check**: Required after Phase 1 to verify data model and contracts align with principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-guided-ux-flow/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── core/                      # Existing core modules
│   ├── spec-aligned-todo.js
│   ├── github-spec-kit-integration.js
│   ├── spec-kit-implementer.js
│   └── spec-first-interceptor.js
├── character/                 # Existing dog personality
│   ├── spec-logo.js
│   └── dog-art.js
├── onboarding/                # Existing (to enhance)
│   ├── flow-controller.js     # MODIFY: Add phase tracking
│   └── side-quest-manager.js
├── guided/                    # NEW: Guided UX modules
│   ├── session-manager.js     # Session persistence (FR-006, FR-012)
│   ├── smart-defaults.js      # Default generation (FR-003)
│   ├── question-reducer.js    # Question minimization (FR-001, FR-011)
│   ├── progress-tracker.js    # Progress indicators (FR-005)
│   ├── micro-celebrations.js  # Delightful moments (FR-008)
│   └── streaming-output.js    # AI streaming (FR-013)
├── integration/               # NEW: External integration
│   └── cli-json-interface.js  # Little Helper interface (FR-010)
└── utils/                     # Existing utilities
    ├── error-handler.js
    ├── health-check.js
    ├── monitoring.js
    ├── secure-config.js
    └── secure-path.js

tests/
├── unit/
│   ├── session-manager.test.js
│   ├── smart-defaults.test.js
│   ├── question-reducer.test.js
│   └── progress-tracker.test.js
├── integration/
│   ├── guided-flow.test.js
│   └── little-helper-cli.test.js
└── contract/
    └── cli-json-schema.test.js
```

**Structure Decision**: Single project structure (Option 1) - this is a CLI tool enhancement, not a web/mobile app. New modules added under `src/guided/` and `src/integration/` to keep changes isolated and testable.

## Complexity Tracking

> No constitution violations to justify. Design follows existing patterns.

| Design Decision | Rationale | Simpler Alternative Considered |
|-----------------|-----------|-------------------------------|
| Separate guided/ directory | Isolates new functionality, enables independent testing | Inline in existing files - rejected: harder to test, clutters existing code |
| JSON session files | Simple, human-readable, git-friendly | SQLite - rejected: overkill for single-user session data |
| Streaming via callback pattern | Matches Node.js idioms, works with existing ora spinners | WebSocket - rejected: unnecessary complexity for CLI |

## Phase Artifacts

### Phase 0: Research (Next)

Research required for:
1. **Smart defaults patterns** - How to infer reasonable defaults from minimal user input
2. **Session persistence best practices** - Config file locations per platform
3. **Streaming output in CLI** - Terminal control sequences for live updates
4. **Little Helper integration** - Examine Rust CLI subprocess patterns

### Phase 1: Design & Contracts (After Research)

Artifacts to generate:
1. `data-model.md` - Session, Phase, SmartDefault, ClarificationQuestion entities
2. `contracts/cli-json-schema.json` - JSON schema for Little Helper integration
3. `quickstart.md` - Developer setup guide for this feature

---

**Status**: Ready for Phase 0 research. Run `/speckit.plan` Phase 0 to generate research.md.
