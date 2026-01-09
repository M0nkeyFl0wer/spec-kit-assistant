# Implementation Plan: Quality Automation Suite

**Branch**: `002-quality-automation` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-quality-automation/spec.md`

## Summary

Implement comprehensive test suite achieving >80% code coverage (constitutional requirement) and GitHub Issues integration for converting tasks.md to trackable issues. The test suite covers launcher, agent detection, workflow state, and CLI passthrough. GitHub integration uses layered authentication (gh CLI → GITHUB_TOKEN → git-only fallback).

## Technical Context

**Language/Version**: Node.js 18+ with ES Modules (`"type": "module"`)
**Primary Dependencies**: chalk, inquirer, fs-extra, commander, axios (existing); node:test (new - built-in)
**Storage**: File system (tasks.md, .speckit/sync-state.json), GitHub API (issues)
**Testing**: Node.js built-in test runner (`node --test`) with c8 for coverage
**Target Platform**: Linux, macOS, Windows (WSL)
**Project Type**: Single project (CLI tool)
**Performance Goals**: Tests complete in <60 seconds, issue sync <5s per task
**Constraints**: No external test framework dependencies, tests run offline (except integration tests)
**Scale/Scope**: ~55 source files, targeting 80% coverage, typical projects have 10-50 tasks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **1. Authentic Fork** | Wrap and enhance, never replace | ✅ PASS | Tests verify CLI passthrough preserves specify behavior |
| **2. UX First** | Fast loading, no premature init | ✅ PASS | Tests run independently, no swarm initialization |
| **3. Branding** | Official colors, credit Spec Kit | ✅ PASS | Not applicable to test suite |
| **4. Code Quality** | Test coverage >80% | ✅ TARGET | This feature directly addresses this requirement |
| **4. Code Quality** | Security first | ✅ PASS | GitHub token via gh CLI/env var, no hardcoded secrets |
| **5. Swarm Integration** | Optional, lazy-load only | ✅ PASS | Swarm tests use mocks, no real swarm initialization |

**Gate Status**: ✅ PASS - All constitutional principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/002-quality-automation/
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
├── character/           # ASCII art, dog personality (existing)
├── core/                # Core functionality (existing)
├── guided/              # Guided workflow (existing)
├── integration/         # CLI/JSON-RPC integration (existing)
├── launcher/            # Interactive launcher (existing - primary test target)
├── onboarding/          # User onboarding (existing)
├── swarm/               # Swarm orchestration (existing - mock in tests)
├── utils/               # Utilities (existing)
└── github/              # NEW: GitHub Issues integration
    ├── auth.js          # Layered auth (gh CLI → env var → git-only)
    ├── issues.js        # Create/update/close issues
    ├── sync.js          # Bidirectional sync logic
    └── labels.js        # Label management

tests/
├── unit/                # Unit tests (mocked dependencies)
│   ├── launcher/        # Launcher tests
│   │   ├── agent-detector.test.js
│   │   ├── workflow-state.test.js
│   │   └── interactive-launcher.test.js
│   ├── github/          # GitHub integration tests
│   │   ├── auth.test.js
│   │   ├── issues.test.js
│   │   └── sync.test.js
│   └── character/       # ASCII art tests
│       └── ascii-dogs.test.js
├── integration/         # Integration tests (real CLI)
│   ├── cli-passthrough.test.js
│   └── specify-commands.test.js
└── fixtures/            # Test data
    ├── tasks/           # Sample tasks.md files
    └── projects/        # Mock project directories
```

**Structure Decision**: Single project structure with separate `tests/` directory at repository root. Tests organized by type (unit/integration) and then by module matching src/ structure.

## Complexity Tracking

> No constitution violations requiring justification.

| Item | Decision | Rationale |
|------|----------|-----------|
| Built-in test runner | node:test instead of Jest/Vitest | Constitutional principle: minimal dependencies |
| c8 for coverage | Industry standard, no Jest dependency | Works with built-in test runner, produces LCOV |
| Separate tests/ dir | Not in src/ | Cleaner separation, standard Node.js convention |
