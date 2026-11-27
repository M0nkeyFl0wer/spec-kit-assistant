# Changelog

## [0.1.0] - unreleased

First version as a Spec Kit extension. The `here-spec` CLI and the earlier Node wrapper are retired.

### Added

- **Guided run**: `workflows/guide/workflow.yml` plus `guide.py run`. The workflow engine owns the order, checks each file on disk, gates on your approval, and builds one task per assistant run.

- `speckit.guide.next` (alias `speckit.guide.start`): guided next step with a short interview.
- `speckit.guide.status`: stage, next step and gate state, read from the spec artifacts.
- `speckit.guide.tour`: plain-language tour of the steps and what is available.
- `speckit.guide.pause`: end an implementation run.
- `speckit.guide.unlock`: open code edits for one session; only the user's typed command does it.
- Runtime-event harness for session start, prompt submit, file edits and stop.
- Stop nudges give up after two with no progress; compaction re-pins the next task.
- Ticked tasks naming files that do not exist are reported.
- Status reports whether any event has reached the harness.
- `guide-config.yml` with `persona`, `gate`, `require_spec`, `keep_going` and `free_paths`.
