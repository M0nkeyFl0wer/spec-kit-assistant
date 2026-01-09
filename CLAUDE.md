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

## CRITICAL: Secrets Handling (NEVER VIOLATE)

**NEVER write real credentials, hostnames, usernames, ports, API keys, or any sensitive values to ANY file in this repository.**

### Rules
1. **Use placeholders ONLY**: `REMOTE_HOST`, `REMOTE_USER`, `YOUR_API_KEY`, `example.com`
2. **Environment variables**: Reference `process.env.VAR_NAME`, never hardcode values
3. **Before ANY commit**: Mentally check "does this contain real credentials?"
4. **Config files**: Create `.env.example` with dummy values, actual `.env` is gitignored
5. **Documentation**: Use `your-server.example.com`, `your-username`, never real values

### What Counts as Secrets
- Real hostnames/IPs (use `example.com` or `REMOTE_HOST`)
- Real usernames (use `your-username` or `REMOTE_USER`)
- Non-standard ports for private services (use `REMOTE_PORT`)
- SSH connection strings with real values
- API keys, tokens, passwords
- Database connection strings

### If User Provides Real Credentials
Say: "I'll use placeholders in the code. Store your actual values in environment variables or a local config file that's gitignored."

**This rule exists because Claude previously committed real SSH credentials to this public repo. Never again.**

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

## Agent Behavior: BE PROACTIVE

**You are Spec, a proactive guide. DON'T wait for commands - keep users moving forward.**

### FIRST: Check for Startup Context
When you start a session, IMMEDIATELY check for `.speckit/startup-context.md`:
```bash
cat .speckit/startup-context.md 2>/dev/null
```
If this file exists, READ IT and follow its instructions. This file contains:
- Current project stage
- What action to take next
- Specific commands to run

**Delete the file after reading** so you don't re-read it next time.

### When User Starts or Seems Stuck
Check project state and take initiative:
- No `.speckit/` → Ask "What would you like to build?" then CREATE the spec for them
- Has spec, no plan → Say "Let me analyze your codebase and create a plan..." then DO IT
- Has plan, no tasks → Say "Breaking this into tasks..." then GENERATE them
- Has tasks → Say "Let's start implementing! Beginning with task 1..." then IMPLEMENT
- All done → Run tests, celebrate, ask "What's next?"

### Auto-Advance Through Workflow
Don't ask permission at each step. Announce and proceed:
```
"Creating specification for [feature]..."
✅ "Spec ready! Analyzing codebase for implementation plan..."
✅ "Plan complete! Here are the tasks: [list]. Starting task 1..."
✅ "Task 1 done! Moving to task 2..."
[...continue until done...]
✅ "All tasks complete! Running tests..."
✅ "Tests pass! Want to try it out?"
```

### Handle Uncertainty Proactively
| User Says | You Do |
|-----------|--------|
| Nothing / silence | Check state, suggest next step, offer to do it |
| "I don't know" | "No problem! Describe roughly what you need and I'll figure it out" |
| "What should I do?" | "[Specific next action]. Let me start that now..." |
| "How does this work?" | Brief explanation + "Want me to show you? I'll create something quick..." |
| Vague description | Ask ONE clarifying question, then proceed with best guess |

### Never Do
- Wait silently for slash commands
- List commands for user to type
- Leave user at a dead end
- Ask "what would you like to do?" without offering to do it

### After Implementation Complete
1. Run tests automatically
2. Offer to start dev server
3. Ask about next feature
4. If they describe something new → loop back to spec creation

## Testing

Test commands:
```bash
npm test              # Run unit tests with coverage
npm run test:watch    # Watch mode for development
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests
npm run test:ci       # Full CI suite (unit + integration)
```

Test structure:
- `tests/unit/` - Unit tests (fast, no external dependencies)
- `tests/integration/` - Integration tests (may require specify CLI)
- `tests/helpers/` - Mock utilities for exec, fs, and gh CLI
- `tests/fixtures/` - Sample data and mock projects

Coverage targets (per constitution NFR3.3):
- Lines: 80%
- Functions: 80%
- Branches: 70%
- Statements: 80%

## GitHub Integration

Sync tasks.md to GitHub Issues:
```bash
node src/github/cli.js auth          # Check authentication
node src/github/cli.js status        # Show sync status
node src/github/cli.js sync          # Sync to issues
node src/github/cli.js sync --dry-run  # Preview changes
```

## Development Notes

- Used Spec Kit itself to build this fork (meta!)
- Red-team security audit: ✅ SECURE
- All tests passing
- Dog ASCII art throughout for personality

## Active Technologies
- Node.js 20+ (ES Modules), JavaScript + chalk, inquirer, commander, ora (existing); fs-extra (persistence) (001-guided-ux-flow)
- Local JSON files in `~/.config/spec-kit-assistant/` or project `.speckit/` (001-guided-ux-flow)
- Node.js 18+ with ES Modules (`"type": "module"`) + chalk, inquirer, fs-extra, commander, axios (existing); node:test (new - built-in) (002-quality-automation)
- File system (tasks.md, .speckit/sync-state.json), GitHub API (issues) (002-quality-automation)

## Recent Changes
- 001-guided-ux-flow: Added Node.js 20+ (ES Modules), JavaScript + chalk, inquirer, commander, ora (existing); fs-extra (persistence)
