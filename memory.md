# Harness Memory

This file is the persistent memory checklist for harness work in this repository.

## Purpose

- Keep stage control deterministic.
- Keep agent routing aligned with checkpoint state.
- Keep audit notes and references in one place.

## Canonical Sources

- Runtime state: `.speckit/checkpoints.json`
- Stage logic: `src/here_spec/checkpoint.py`
- Startup contract: `src/here_spec/core/startup_context.py`
- Agent launchers: `src/here_spec/agents/claude.py`, `src/here_spec/agents/opencode.py`
- CLI orchestration: `src/here_spec/cli/main.py`

## Harness Invariants

- `current_step` is always one of: `init`, `constitution`, `spec`, `plan`, `tasks`, `validate`, `build`, `building`, `paused`, `completed`, `error`.
- Each stage has one canonical command from `COMMAND_MAP`.
- Invalid step transitions are rejected.
- Startup context must include checksum and expiration.
- Agent launch is blocked on step/command mismatch.

## Validation Checklist

- Run tests: `pytest`
- Confirm transition enforcement: `tests/test_harness_transitions.py`
- Confirm startup contract integrity: `tests/test_startup_context_contract.py`
- Confirm launcher guards: `tests/test_launcher_guards.py`
- Confirm CLI behavior: `tests/test_cli.py`, `tests/test_flow.py`

## Vault RAG Logging Workflow

- Append each harness change to `logs/vault-rag/harness-changelog.md`.
- Append machine-friendly entries to `logs/vault-rag/harness-events.jsonl`.
- Keep entries factual, dated, and tied to file paths.

## Open Follow-Ups

- Add CI drift check for stale current-state docs.
- Split active vs legacy status documentation.
- Add schema migration tests for future `STATE_VERSION` changes.
