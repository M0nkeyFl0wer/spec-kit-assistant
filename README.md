# 🐕 Spec Kit Assistant (here-spec)

Friendly, progressive onboarding for [GitHub Spec Kit](https://github.com/github/spec-kit). The `here-spec` CLI walks absolute beginners through every step of the Spec-Driven Development workflow, keeps track of progress, and launches your favorite AI coding agent with the right context.

- ✅ **Progressive checkpoints** – asks you 2-3 questions before each Spec Kit step (constitution → spec → plan → tasks → validate → build)
- 🐶 **Spec the dog** – supportive ASCII companion that keeps the vibe friendly and fun
- 🤖 **Agent-aware** – works with Claude Code today, Opencode free tier as an alternative
- 💾 **Crash-safe** – stores progress in `.speckit/checkpoints.json`, so you can pause/resume anytime
- 🧠 **Context-rich** – generates per-step prompts so agents know exactly what to do without you remembering slash commands

> **Note:** This is an unofficial UX layer. The official Spec Kit CLI remains the authoritative source of functionality.

---

## Requirements

| Dependency | Why |
|------------|-----|
| Python 3.9+ | Runs the `here-spec` CLI |
| Claude Code CLI (`npm install -g @anthropic-ai/claude-code`) | Primary AI agent (optional if using Opencode) |
| Opencode CLI (`npm install -g opencode-ai`) | Free-tier alternative (optional) |
| Git | Required by Spec Kit |

If you plan to run Spec Kit commands that use `uv` or `specify`, install those per the [official documentation](https://github.com/github/spec-kit).

---

## Installation

### pipx (recommended)
```bash
pipx install "git+https://github.com/M0nkeyFl0wer/spec-kit-assistant.git"
```

### pip / virtualenv
```bash
git clone https://github.com/M0nkeyFl0wer/spec-kit-assistant.git
cd spec-kit-assistant
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
```

### Manual (development mode)
```bash
git clone https://github.com/M0nkeyFl0wer/spec-kit-assistant.git
cd spec-kit-assistant
pip install -e .  # installs entry point `here-spec`
```

Verify the install:
```bash
here-spec --help
```

---

## Quick Start

Just run `here-spec` with no arguments. Spec will figure out what to do:

```bash
here-spec
```

- If you are **not** inside a project folder, Spec will ask for a project name and start a new run.
- If you **are** already inside a project (contains `.speckit/checkpoints.json`), Spec resumes from the last step.

### Common commands

| Command | Description |
|---------|-------------|
| `here-spec` | Smart default: start or continue depending on location |
| `here-spec init [name]` | Explicitly create a new project |
| `here-spec continue [path]` | Resume a project from anywhere |
| `here-spec status [path]` | Show progress and selected agent |
| `here-spec check` | Verify system + agent requirements |
| `here-spec config` | Toggle celebrations, default agent, default quality |
| `here-spec step <name>` | Run a specific checkpoint manually (`constitution`, `spec`, `plan`, `tasks`, `validate`, `build`) |

---

## Progressive Workflow

Each Spec Kit command gets its own mini-interview so you never have to remember slash commands or context order:

1. **Constitution helper** – captures project name, description, target users, readiness to create the constitution.
2. **Spec helper** – asks for core features + constraints, then runs `/speckit.constitution` and `/speckit.specify` with the right context.
3. **Plan helper** – chooses tech approach & quality level, kicks off the planning phase.
4. **Task helper** – confirms scope, then generates tasks.
5. **Validate helper** – walks through the checklist.
6. **Build helper** – final confirmation and implementation command.

You can pause after any step; Spec stores answers + progress in `.speckit/checkpoints.json` and `.speckit/context-*.md` inside the project directory.

---

## Agent Support

### Claude Code (recommended)
1. Install: `npm install -g @anthropic-ai/claude-code`
2. Run `claude login` (or `claude auth login`) and follow the browser prompt to store your API key locally.
3. Spec will detect the CLI and launch it with per-step context.

### Opencode (free tier)
1. Install: `npm install -g opencode-ai`
2. Run `opencode auth login` and paste the API key provided by Opencode.
3. Select “Opencode” when Spec asks which helper to use.

> **API Keys:** Spec does **not** write your API keys to disk. Configure each CLI using their official tools (Claude Code or Opencode). Future releases will add an optional encrypted keyring.

### Automating setup via environment variables

| Variable | Description |
|----------|-------------|
| `HERE_SPEC_PROJECT_NAME` | Defaults the project/folder name when creating a new run |
| `HERE_SPEC_AGENT` | Force a specific agent (`claude` or `opencode`) |
| `HERE_SPEC_QUICK` | Set to `1/true` to skip interviews and run the quick flow |
| `HERE_SPEC_AUTO_CONFIRM` | Set to `1/true` to auto-accept all confirmation prompts |
| `HERE_SPEC_FREE` | Set to `1/true` to prefer the Opencode free tier |

Example (headless) run:

```bash
HERE_SPEC_PROJECT_NAME=my-app \
HERE_SPEC_AGENT=claude \
HERE_SPEC_QUICK=1 \
HERE_SPEC_AUTO_CONFIRM=1 \
here-spec
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│ here-spec CLI                              │
│                                             │
│ 1. Checkpoint Manager                       │
│    (saves answers/progress)                 │
│                                             │
│ 2. Context Builder                          │
│    (creates .speckit/context-*.md)          │
│                                             │
│ 3. Agent Launchers                          │
│    (Claude / Opencode wrappers)             │
│                                             │
│ 4. Spec the Dog                             │
│    (ASCII art + personality)                │
└─────────────────────────────────────────────┘
```

- `here_spec/checkpoint.py` – state machine + progressive interview logic.
- `here_spec/agents/{claude,opencode}.py` – generate context files and launch CLIs.
- `here_spec/art/dog_art.py` – Spec’s ASCII art + personality descriptors.

Everything lives inside the project directory so you can safely commit the generated spec artifacts.

---

## Development

```bash
git clone https://github.com/M0nkeyFl0wer/spec-kit-assistant.git
cd spec-kit-assistant
pip install -e .
```

### Run the CLI in dev mode
```bash
python -m here_spec.cli.main --help
```

### Testing
Automated tests are being added (see TODO). For now you can verify basic flows manually:
```bash
here-spec --help
here-spec check
here-spec init demo-project
here-spec continue demo-project
```

---

## Roadmap

- ✅ Progressive checkpoints per Spec Kit step
- ✅ Non-interactive safety (detects aggressive CLI launches)
- 🟡 Automated test suite (Typer CLI + unit tests)
- 🟡 State schema versioning + recovery
- 🟡 Improved multi-project chooser in `here-spec continue`
- 🟡 Encrypted credential storage for API keys
- 🟡 Official docs for agent setup + environment variables

Contributions are welcome! Please open an issue or PR if you spot bugs or want to help with the roadmap.

---

## License

MIT – see [LICENSE](LICENSE)

Made with 🐕 + ❤️ by a developer who believes specs should feel welcoming.
