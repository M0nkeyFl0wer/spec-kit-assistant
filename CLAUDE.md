# Spec Kit Assistant - Claude Context

## GitHub Repository
- **Owner**: M0nkeyFl0wer
- **Repo**: https://github.com/M0nkeyFl0wer/spec-kit-assistant
- **Fork of**: https://github.com/github/spec-kit

## Quick Install (Short Version!)

```bash
git clone https://github.com/M0nkeyFl0wer/spec-kit-assistant.git
cd spec-kit-assistant && npm install && node spec-assistant.js init "My Project"
```

## Architecture

This is a **TRUE FORK** that wraps the official GitHub Spec Kit:
- Node.js wrapper provides dog personality UX
- Calls real `specify` CLI for all core commands
- Adds AI swarm orchestration for enhanced features
- Uses official Spec Kit colors: Purple (#8B5CF6), Pink (#EC4899), Green (#10B981)

## Remote Deployment

- Supports SSH deployment to remote servers for heavy swarm operations
- Configure your server details in local config (not in repo)

## Key Files

- `spec-assistant.js` - Main wrapper entry point
- `src/character/spec-logo.js` - Dog logo with official colors
- `src/character/spec.js` - Dog personality & interactions
- `enhanced-swarm-orchestrator.js` - AI swarm coordination
- `CONSTITUTION.md` - Project principles
- `SPEC.md` - Technical specification
- `src/guided/` - Guided UX flow module (see below)

## Commands

**Official Spec Kit** (pass-through):
- `init` - Initialize spec
- `check` - Validate spec
- `constitution` - Show constitution

**Enhanced** (AI swarms):
- `run` - Deploy builder swarm
- `test` - Run test swarms
- `deploy` - Production deployment
- `swarm` - Swarm management

## Guided UX Flow (src/guided/)

The guided UX module provides a streamlined onboarding and specification experience:

**Features:**
- Smart defaults with confidence scoring (0-1 scale)
- Minimal questions (max 1 primary + 2 follow-up per phase)
- Progressive disclosure (expand for advanced options)
- Session persistence across restarts
- Micro-celebrations on phase completion
- JSON-RPC interface for Little Helper integration

**Key Components:**
- `FlowBridge` - Integration bridge between guided and legacy flows
- `GuidedOnboarding` - First-time project setup flow
- `GuidedSpecify` - Feature specification with clarifications
- `SmartDefaults` - Analyzes input for intelligent defaults
- `SessionManager` - Persists session state
- `MicroCelebrations` - Delightful feedback on completion

**CLI Flags:**
- `--guided` (default) - Use guided onboarding
- `--no-guided` - Skip guided questions
- `--advanced` - Show all options upfront
- `--json` - JSON-RPC mode for Little Helper

**Example:**
```bash
node spec-assistant.js init my-project          # Guided setup
node spec-assistant.js init my-project --advanced  # Show all options
node spec-assistant.js --json init my-project   # JSON-RPC output
```

## Development Notes

- Used Spec Kit itself to build this fork (meta!)
- Red-team security audit: ✅ SECURE
- All tests passing
- Dog ASCII art throughout for personality

## Active Technologies
- Node.js 20+ (ES Modules), JavaScript + chalk, inquirer, commander, ora (existing); fs-extra (persistence) (001-guided-ux-flow)
- Local JSON files in `~/.config/spec-kit-assistant/` or project `.speckit/` (001-guided-ux-flow)

## Recent Changes
- 001-guided-ux-flow: Added Node.js 20+ (ES Modules), JavaScript + chalk, inquirer, commander, ora (existing); fs-extra (persistence)
