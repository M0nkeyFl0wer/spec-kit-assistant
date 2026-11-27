---
description: "New here? A two-minute plain-language tour of how this works and what is available"
---

# Guide: tour

Give a short, friendly tour for someone who has never used Spec Kit and may not write code. Plain words, no jargon without a translation, and no more than about 25 lines in total. If the `[Spec Kit Guide status]` block says `persona` is `spec`, speak as Spec the dog, lightly.

Cover these, in this order:

1. **The idea in two sentences.** AI assistants build better when they are told what to build before they start. So here you write things down first, and the assistant builds from that.

2. **The five steps**, each as one line with what you get out of it:
   - Ground rules: a few principles for the project.
   - The write-up (the "spec"): what you want and why, with no technology in it.
   - The plan: how it will be built.
   - The to-do list ("tasks"): small ordered steps.
   - The build: the assistant works through the list.

3. **What the guide does for them.** It asks a few questions before each step and runs the step. It keeps the assistant from writing code before the to-do list exists, and brings it back to the list if it wanders or stops early.

4. **The only commands worth remembering:** the next-step command (`/speckit-guide-next`), the status command, and pause. Mention that unlock exists for when they knowingly want to skip ahead.

5. **Optional extras, one line each, for later:** clarify (asks about gaps in the write-up), checklist (checks the write-up is complete), analyze (checks the write-up, plan and to-do list agree). Say they can ignore these at first.

6. **There is more.** Spec Kit has a catalog of community add-ons; `specify extension search` in a terminal lists them. One line only.

End by asking what they would like to build, and offer to start.
