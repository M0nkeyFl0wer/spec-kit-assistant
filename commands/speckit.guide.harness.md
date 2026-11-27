---
description: "Internal: the script behind the session, prompt, edit and stop events"
scripts:
  py: scripts/python/guide.py event
---

# Guide: harness

This command exists so Spec Kit can attach `scripts/python/guide.py event` to the coding agent's lifecycle events. Spec Kit runs the script directly; these instructions are never sent to the agent by an event.

If a person invokes this command by hand, there is nothing to do here. Run the status command instead:

```bash
python3 .specify/extensions/guide/scripts/python/guide.py status
```
