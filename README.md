# Spec Kit Guide

> **Draft.** This README was rewritten for the extension and has not been reviewed yet.

```
  /^-----^\
 V  o o  V
  |  Y  |     Spec: "One step at a time. I'll hold the plan."
   \ Q /
```

An extension for [GitHub Spec Kit](https://github.com/github/spec-kit) that does two things:

1. **Guides.** `/speckit-guide-next` works out where your project is, asks the two or three questions the next step needs, confirms, and runs it. You never have to remember which command comes next.
2. **Holds the agent to the plan.** A small script is wired into your coding agent's own hooks, so the order is enforced by the tool and not by the agent's memory.

## Why

Spec Kit's commands are prompts, and a coding agent can ignore a prompt. The usual failures:

- It writes code before there is a plan.
- You ask a question halfway through implementation and it drops the task list.
- It stops after three tasks and reports that it is finished.

Guide reads the stage from the files on disk (`spec.md`, `plan.md`, `tasks.md`) every time, so there is no state for the agent to get wrong.

## What the harness does

| When | What happens |
| --- | --- |
| A session starts | The agent is told the current stage and the next step. |
| You send any message | The stage is pinned again. During an implementation run, the next unchecked task is pinned too, so a side question gets answered and the work carries on. |
| The agent edits a file | Code edits are refused until `tasks.md` exists. Specs, plans and docs stay open. |
| The agent tries to stop | During an implementation run with tasks left, it is sent back once. If it needs something from you it says so and stops. |

## Install

Needs Spec Kit 1.4 or later and Python 3.

```bash
specify extension add guide --from https://github.com/M0nkeyFl0wer/spec-kit-assistant/archive/refs/tags/v0.1.0.zip
```

To try a local checkout:

```bash
specify extension add --dev /path/to/spec-kit-assistant
```

## Commands

Claude Code spells these with hyphens. Agents that use dotted commands spell them `/speckit.guide.next` and so on.

| Command | What it does |
| --- | --- |
| `/speckit-guide-next` (or `-start`) | Ask what this step needs, then run it |
| `/speckit-guide-status` | Show the stage, the next step and whether code edits are locked |
| `/speckit-guide-pause` | End an implementation run so the agent may stop |

`/speckit-guide-harness` is also listed. It is the script behind the hooks and is not meant to be run by hand.

## Settings

`.specify/extensions/guide/guide-config.yml`:

| Setting | Default | Meaning |
| --- | --- | --- |
| `persona` | `spec` | `spec` for Spec the dog, `plain` for no persona |
| `gate` | `block` | `block` refuses out-of-order code edits, `warn` only reminds, `off` does neither |
| `require_spec` | `true` | Lock code edits before any spec exists. `false` starts gating once a feature has been started |
| `keep_going` | `true` | Send the agent back to the task list when it stops mid-run |
| `free_paths` | `docs/` | Extra folders the agent may always edit |

Put a setting in `local-config.yml` beside it for your machine only, or set an environment variable such as `SPECKIT_GUIDE_GATE=off`.

## What it does not do

- **Shell commands are not gated.** The gate covers the agent's file-editing tools. An agent that writes a file with a shell command gets past it.
- **Tested with Claude Code only.** Spec Kit translates the events for other agents, but nothing else has been tried.
- **It fails open.** If the script hits an error it allows the action and records it; `/speckit-guide-status` shows the count.

## Development

```bash
python -m pytest tests -q
```

Everything lives in `scripts/python/guide.py`, which uses the standard library only.

## History

This repository used to hold `here-spec`, a Python CLI that wrapped Spec Kit, and before that a Node wrapper. Both are in the git history on `main` before the `extension-guide` work.

## License

MIT. See [LICENSE](LICENSE).
