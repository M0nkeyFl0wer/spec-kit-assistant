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

**Seshat Server**: `ssh -p 8888 m0nkey-fl0wer@seshat.noosworx.com`
- Run swarms remotely for heavy operations
- Deploy to: `~/spec-kit-assistant/`

## Key Files

- `spec-assistant.js` - Main wrapper entry point
- `src/character/spec-logo.js` - Dog logo with official colors
- `src/character/spec.js` - Dog personality & interactions
- `enhanced-swarm-orchestrator.js` - AI swarm coordination
- `CONSTITUTION.md` - Project principles
- `SPEC.md` - Technical specification

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

## Development Notes

- Used Spec Kit itself to build this fork (meta!)
- Red-team security audit: ✅ SECURE
- All tests passing
- Dog ASCII art throughout for personality
