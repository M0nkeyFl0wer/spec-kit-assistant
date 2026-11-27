# Spec Kit Guide - Claude Context

## What this repo is

A community extension for [GitHub Spec Kit](https://github.com/github/spec-kit), id `guide`.

- **Repo**: https://github.com/M0nkeyFl0wer/spec-kit-assistant (owner M0nkeyFl0wer)
- It is an extension, not a fork. Nothing from upstream is vendored here.
- The old `here-spec` Python CLI and the Node wrapper were retired on the `extension-guide` branch (2026-11-26). They are in git history on `main`.

## Layout

| Path | What it is |
| --- | --- |
| `extension.yml` | The manifest: commands, runtime events, hooks, defaults |
| `commands/*.md` | Prompts the agent follows. `speckit.guide.harness.md` only exists to attach the script to events |
| `scripts/python/guide.py` | The harness. Standard library only. Reads the stage from disk, gates edits, handles events |
| `config-template.yml` | Becomes `.specify/extensions/guide/guide-config.yml` in a user's project |
| `tests/test_guide.py` | Runs the script as a subprocess in throwaway projects |
| `.extensionignore` | Keeps dev files out of installed copies |
| `docs/PLUGIN-SCOPE.md` | Notes for step 2, a Claude Code plugin |

## Rules for the harness

- **The stage comes from files, never from stored state.** `spec.md`, `plan.md`, `tasks.md`. The only stored state is whether an implementation run is active (`.specify/guide/run.json`).
- **Standard library only** in `guide.py`. It runs under whatever Python launched Spec Kit's dispatcher. That is why the config file is flat and parsed by hand.
- **Fail open, but leave a trace.** An error allows the action and is written to `.specify/guide/errors.log`; `status` reports the count.
- **Event contract:** exit 0 and stdout adds context; exit 2 and stderr blocks.
- **User-only state changes come from the typed prompt.** Unlock, pause and starting a run are recognised in the user's message by the prompt event. Nothing the agent runs or says can unlock the gate.
- **The reader is a first-timer.** Command prompts use plain words, offer one next step, and never list commands to choose from.
- **Stop nudges must stay bounded.** Honour `stop_hook_active` and the no-progress cap.
- Keep comments. They explain why, for a reader learning the code.

## Testing

```bash
python -m pytest tests -q
```

To test against real Spec Kit, in a scratch directory outside this repo:

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init demo --integration claude
cd demo && uvx --from git+https://github.com/github/spec-kit.git specify extension add --dev /path/to/this/repo
cat .claude/settings.json   # four hooks should be there
```

A `--dev` install is a copy. Remove and add again after changing files.

## Publishing

- The community catalog takes submissions through an issue form on github/spec-kit, not a pull request.
- It needs a public repo with `extension.yml`, `README.md` and `LICENSE`, and a tagged release. The version in the manifest is plain `X.Y.Z`.
- Upstream docs: `docs/extensions/publishing.md` in github/spec-kit.

## CRITICAL: Secrets Handling (NEVER VIOLATE)

**NEVER write real credentials, hostnames, usernames, ports, API keys, or any sensitive values to ANY file in this repository.**

1. **Placeholders only**: `REMOTE_HOST`, `REMOTE_USER`, `YOUR_API_KEY`, `example.com`
2. **Environment variables**: reference them, never hardcode values
3. **Before any commit**: check "does this contain real credentials?"
4. **Documentation**: `your-server.example.com`, `your-username`, never real values

If the user provides real credentials, say: "I'll use placeholders in the code. Store your actual values in environment variables or a local config file that's gitignored."

This rule exists because real SSH credentials were once committed to this public repo.

## Spec the dog

Spec is the extension's optional voice (`persona: spec`). When working in this repo you can use it lightly: friendly, plain, brief, one small dog touch per reply at most, and never in the way of the work. Dog art lives in `assets/`.
