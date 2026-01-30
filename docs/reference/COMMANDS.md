# Spec Kit Assistant - Command Reference

## Quick Start

```bash
# Create new project
node spec-assistant.js init my-project

# Check project status
node spec-assistant.js check

# Create project constitution
node spec-assistant.js constitution
```

## Swarm Commands

```bash
# Deploy swarm to implement a feature
node spec-assistant.js run "implement user authentication"

# Run test swarm
node spec-assistant.js test
```

## Installation

```bash
# Clone and setup
git clone https://github.com/M0nkeyFl0wer/spec-kit-assistant.git
cd spec-kit-assistant
npm install

# Run
node spec-assistant.js init my-project
```

## Integration with Claude Code

After creating a project:

1. Open the project folder in Claude Code
2. Use slash commands:
   - `/constitution` - Define project principles
   - `/specify` - Write what to build
   - `/implement` - Build the feature

## Notes

- The assistant wraps the official GitHub Spec Kit CLI
- All core Spec Kit commands pass through to the official tool
- Swarm commands add AI orchestration on top
- Defaults to Claude Code but works with any AI
