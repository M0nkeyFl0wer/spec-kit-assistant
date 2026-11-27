# Step 2: a Claude Code plugin

Scoping notes, written 2026-11-26. Nothing here is built.

## What the extension already covers

Spec Kit runtime events put four hooks into `.claude/settings.json`: SessionStart, UserPromptSubmit, PreToolUse and Stop. They run `scripts/python/guide.py event`. That is the harness, and a plugin would run the same script.

## What a plugin would add

| Addition | Why it matters | Size |
| --- | --- | --- |
| Shell gating with "ask" | The extension cannot gate shell writes. A plugin hook can return a permission decision that asks the user instead of refusing outright, which makes gating `Bash` tolerable. | Medium: needs a classifier for write-like commands and tests for it |
| PostToolUse check-off audit | Notice when code changed but no task was checked off, and say so. | Small |
| PreCompact reminder | Re-pin the stage and the next task just before the context is compacted. | Small |
| Implementer subagent | A subagent whose tools and instructions are limited to "do the next unchecked task". | Medium |
| Stage in the status line | Always-visible stage and task count. | Small |
| Install without wiring | `specify integration upgrade` rewrites the hooks it owns. A plugin's hooks are separate and survive that. | Small |

## Questions to settle first

1. **Double firing.** With both installed, every event runs twice. The plugin should stand down when it sees Spec Kit's own hook entries, or the extension should ship without `events:` when the plugin is present.
2. **Two channels to maintain.** The Spec Kit catalog and a Claude Code plugin marketplace each need releases. Keeping `guide.py` as the single shared script keeps that cheap.
3. **Claude only.** The plugin helps Claude Code users and nobody else. The extension stays the cross-agent base.

## Suggested order

1. Thin plugin: a manifest plus a hooks file that calls the existing `guide.py`, with the double-firing guard.
2. PreCompact and PostToolUse additions.
3. Shell gating with "ask".
4. Implementer subagent and status line.

The plugin file layout and the hook decision format should be checked against the current Claude Code plugin docs before step 1; this note was written from the hook behaviour observed while building the extension.
