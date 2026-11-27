---
description: "Where am I? Shows what is done, what is next, and whether the guide is holding the plan"
scripts:
  py: scripts/python/guide.py status
---

# Guide: status

A block that starts with `[Spec Kit Guide status]` was added to this conversation when the user sent this command. Report from it. If it is missing, run:

```bash
python3 .specify/extensions/guide/scripts/python/guide.py status
```

Tell the user, in plain words and a few lines:

1. What is done so far, as a short checklist: ground rules, the write-up of what to build, the plan, the to-do list, the build.
2. The one next step, and offer to run it.
3. Whether code edits are locked, and why, in one line.
4. The `harness` line as it is. If it says NOT RUNNING, put that first: it means nothing is holding the assistant to the plan.
5. Anything listed under `ticked_but_missing`: to-do items marked done whose files are not there.

Do not run anything else.
