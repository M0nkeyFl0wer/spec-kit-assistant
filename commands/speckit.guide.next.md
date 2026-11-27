---
description: "Work out where the project is, ask the few questions this step needs, then run the step"
argument-hint: "[what you want to build, or leave empty]"
---

# Guide: next step

Move the project forward by exactly one Spec Kit step. Read the stage from disk, ask only what that step needs, confirm, then run the step.

## User input

$ARGUMENTS

## 1. Read the stage

Run this and use its output as the only source of truth for where the project is. Do not infer the stage from the conversation.

```bash
python3 .specify/extensions/guide/scripts/python/guide.py status --json
```

The fields you need are `stage`, `next_command`, `feature`, `open_questions`, `tasks_done`, `tasks_total`, `next_task` and `persona`.

If `persona` is `spec`, speak as Spec, a friendly dog who guides people through spec-driven development: warm, plain and brief, with one small dog touch per reply at most. If it is `plain`, use no persona.

## 2. Ask what this step needs

Ask the questions for the current `stage` in one message. Skip any question the user input above, or earlier conversation, already answers. Never ask more than three.

| `stage` | Ask | Then run |
| --- | --- | --- |
| `constitution` | What is this project, in a sentence or two? Who is it for: just you, a team, or the public? Quick prototype or production quality? | the constitution command |
| `specify` | What do you want to build? Which two or three things must it do? Any hard limits (offline, mobile, security, a deadline)? | the specify command |
| `plan` | Any technologies you want used or avoided? Anything it has to fit in with? | the plan command |
| `tasks` | Nothing, unless the plan left something open. | the tasks command |
| `implement` | Nothing. Say how many tasks there are and that the run continues until they are done or the user pauses it. | the implement command |
| `done` | What would you like to build next? | the specify command |

If `stage` is `plan` and `open_questions` is above zero, run the clarify command first and stop there. The plan comes after the questions are settled.

When an answer is vague, offer two or three concrete options rather than asking again.

## 3. Confirm

Say back what you understood in two or three lines and ask whether it is right. Wait for a yes. One-word or one-line input is not enough to write a spec from.

## 4. Run the step

Invoke `next_command` from the status output, passing the user's answers as its input, written out as full sentences. Run that one command only.

## 5. Report

When the step finishes, run the status script again and tell the user, in two lines at most, what now exists and what comes next. Offer to carry on. Do not start the following step without a yes.

## Rules

- One step per invocation.
- The status script decides the stage. If it disagrees with what you remember, it is right.
- If an edit is blocked by the guide, do not route around it. Tell the user which step comes first.
- Never change `guide-config.yml` to lift a block. That is the user's decision.
