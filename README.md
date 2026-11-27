# Spec Kit Guide

> **Draft.** This README was rewritten for the extension and has not been reviewed yet.

```
  /^-----^\
 V  o o  V
  |  Y  |     Spec: "One step at a time. I'll hold the plan."
   \ Q /
```

An extension for [GitHub Spec Kit](https://github.com/github/spec-kit), for people who want to build something with an AI assistant and have never done spec-driven development.

You say what you want to build. Spec asks a few questions, runs each step for you, and keeps the assistant on the plan.

1. **It guides.** `/speckit-guide-start` explains how this works in three sentences, asks what the next step needs, confirms, and runs it. You do not need to learn the commands.
2. **It holds the assistant to the plan.** A small script is wired into your coding agent's own hooks, so the order is enforced by the tool and not by the assistant's memory.

## Two ways to use it

**The guided run (the main way).** A Spec Kit workflow is in charge, not the assistant. In your project folder, in a terminal:

```bash
python3 .specify/extensions/guide/scripts/python/guide.py run
```

What happens:

1. Spec asks what you want to build, who it is for and what you are aiming for, then reads it back.
2. The run starts the assistant for one job: writing short ground rules. A check confirms the file exists.
3. The same for the write-up of what to build, then the plan. You are shown each one and asked to approve it.
4. The to-do list is written and checked.
5. The build: the assistant is started once per task, with only that task. After each one a check confirms the box was ticked. If a task comes back unticked twice, the run stops and says which one.

While the assistant is working, a line every twenty seconds says what it is doing, for how long, and the last file it wrote, so a long step never looks frozen.

When the run ends, for any reason, it prints where things stand and why it stopped. Run the same command again to carry on; it reads the files on disk and picks up from there, without asking the questions again.

**Permissions.** The workflow starts the assistant without a chat window, so it cannot stop to ask your permission. For that run only, the launcher allows it to edit files and to run Spec Kit's own scripts. Building usually also needs shell commands (tests, installs); the launcher asks you, or pass `--allow-commands`. It changes no settings file.

**In a chat session.** The `/speckit-guide-*` commands below, inside your assistant. Lighter and more conversational, but the assistant is driving and the hooks can only block and remind.

## Why

Spec Kit's commands are prompts, and a coding agent can ignore a prompt. The usual failures:

- It writes code before there is a plan.
- You ask a question halfway through implementation and it drops the task list.
- It stops after three tasks and reports that it is finished.

Guide reads the stage from the files on disk (`spec.md`, `plan.md`, `tasks.md`) every time, so there is no state for the agent to get wrong.

## What the harness does

| When | What happens |
| --- | --- |
| A session starts, or the context is compacted | The agent is told the current stage and the next step. A build in progress is pinned to its next task. |
| You send any message | The stage is pinned again. During an implementation run, the next unchecked task is pinned too, so a side question gets answered and the work carries on. |
| The agent edits a file | Code edits are refused until `tasks.md` exists. Specs, plans and docs stay open. |
| The agent tries to stop | During a build with tasks left, it is sent back once. After two tries with no new task ticked, it is let go. If every task is ticked but a file a task names is missing, it is asked to check. |

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
| `/speckit-guide-start` (or `-next`) | Ask what this step needs, then run it |
| `/speckit-guide-tour` | A two-minute plain-language tour of the steps and what else is available |
| `/speckit-guide-status` | What is done, what is next, whether code edits are locked, and whether the hooks are running |
| `/speckit-guide-pause` | Stop a build in progress |
| `/speckit-guide-unlock` | Open code edits for this session, when you knowingly want to skip ahead. Only you can do this; the assistant cannot |

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
- **The missing-file check is shallow.** It notices a ticked task whose named file does not exist. It cannot tell whether the work is right.
- **Subagents are untested.** Whether edits made by a subagent pass through the same hook has not been checked.

## Development

```bash
python -m pytest tests -q
```

Everything lives in `scripts/python/guide.py`, which uses the standard library only.

## History

This repository used to hold `here-spec`, a Python CLI that wrapped Spec Kit, and before that a Node wrapper. Both are in the git history on `main` before the `extension-guide` work.

## License

MIT. See [LICENSE](LICENSE).
