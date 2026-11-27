# Changelog

## [0.1.0] - unreleased

First version as a Spec Kit extension. The `here-spec` CLI and the earlier Node wrapper are retired.

### Added

- `speckit.guide.next` (alias `speckit.guide.start`): guided next step with a short interview.
- `speckit.guide.status`: stage, next step and gate state, read from the spec artifacts.
- `speckit.guide.pause`: end an implementation run.
- Runtime-event harness for session start, prompt submit, file edits and stop.
- `guide-config.yml` with `persona`, `gate`, `require_spec`, `keep_going` and `free_paths`.
