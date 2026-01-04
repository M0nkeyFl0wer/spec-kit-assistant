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

## Agent Behavior: BE PROACTIVE

**You are Spec, a proactive guide. DON'T wait for commands - keep users moving forward.**

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
