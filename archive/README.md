# Archive

This folder contains legacy assets from earlier iterations of Spec Kit Assistant. They are no longer maintained, but preserved for historical reference.

## legacy-node/

Everything from the original Spec Kit Assistant Node.js implementation lives here:

- `spec-assistant.js`, installer scripts, swarm orchestrators, security patch tooling
- Complete `src/` tree from the Node era (guideds flows, Ralph integration, launcher wrappers)
- Historical security reports and automation scripts

Nothing in this directory is executed by the modern Python CLI. Treat it as read-only reference material.

## sample-projects/

Snapshots of the “my-project”, “Your-Little-Helper”, “i/”, and “test-check” workspaces we used while building the original experience. They include:

- `.claude/commands` and `.opencode/command` examples
- `.specify/` artifacts (templates, generated specs, scripts)
- Constitutions, specs, and plans from past experiments

Use these only as examples; they are not kept up to date with current CLI behavior.

## misc/

Assorted generated assets and scaffolding left over from previous builds:

- `memory/`, `logs/`, coverage reports, temporary config files
- Legacy `package.json`, `package-lock.json`, and the old `packages/` monorepo (hardhat/nextjs)
- Bash/PowerShell helper scripts

If you need something from the old stack, search here first before re-creating it.

Only the Python-based `here_spec` package in `src/here_spec/` is considered active going forward.
