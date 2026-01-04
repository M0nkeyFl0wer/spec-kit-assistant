# Quickstart: Guided UX Flow Development

**Branch**: `001-guided-ux-flow` | **Date**: 2026-01-04

## Prerequisites

- Node.js 20+
- npm or yarn
- Git

## Setup

```bash
# Clone and checkout feature branch
git clone https://github.com/M0nkeyFl0wer/spec-kit-assistant.git
cd spec-kit-assistant
git checkout 001-guided-ux-flow

# Install dependencies
npm install

# Run tests (once tests are implemented)
npm test
```

## Project Structure

```
src/
├── guided/              # NEW: Guided UX modules
│   ├── session-manager.js
│   ├── smart-defaults.js
│   ├── question-reducer.js
│   ├── progress-tracker.js
│   ├── micro-celebrations.js
│   └── streaming-output.js
├── integration/         # NEW: External integration
│   └── cli-json-interface.js
└── ...existing modules
```

## Development Workflow

### 1. Session Management

```javascript
import { SessionManager } from './src/guided/session-manager.js';

const session = new SessionManager();
await session.load('/path/to/project');

// Update phase
session.enterPhase('specify');

// Record decision
session.recordDecision({
  phase: 'specify',
  questionId: 'feature-type',
  answer: 'user-auth',
  wasDefault: false
});

// Auto-saves on each change
```

### 2. Smart Defaults

```javascript
import { SmartDefaults } from './src/guided/smart-defaults.js';

const defaults = new SmartDefaults();
const suggestions = await defaults.analyze('I want to build a web app with user login');

// Returns:
// {
//   archetype: 'web-app',
//   defaults: {
//     authentication: { value: 'session-based', confidence: 0.9 },
//     database: { value: 'postgresql', confidence: 0.7 }
//   }
// }
```

### 3. Progress Tracking

```javascript
import { ProgressTracker } from './src/guided/progress-tracker.js';

const tracker = new ProgressTracker(session);
tracker.render();  // Shows progress bar

tracker.complete('specify');  // Triggers celebration
```

### 4. JSON Mode (Little Helper Integration)

```bash
# Enable JSON mode with --json flag
node spec-assistant.js --json specify "user authentication"

# Input (stdin):
# {"jsonrpc": "2.0", "id": 1, "method": "specify", "params": {"description": "user auth"}}

# Output (stdout):
# {"jsonrpc": "2.0", "id": 1, "result": {"status": "success", "specPath": "..."}}
```

## Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run specific test
npm test -- --grep "SessionManager"
```

### Integration Tests

```bash
# Test full guided flow
npm run test:integration

# Test JSON protocol
echo '{"jsonrpc":"2.0","id":1,"method":"status"}' | node spec-assistant.js --json
```

## Key Files to Modify

| File | Purpose | FR Reference |
|------|---------|--------------|
| `src/guided/session-manager.js` | Session persistence | FR-006, FR-012 |
| `src/guided/smart-defaults.js` | Default generation | FR-003 |
| `src/guided/question-reducer.js` | Minimize questions | FR-001, FR-011 |
| `src/guided/progress-tracker.js` | Progress UI | FR-005 |
| `src/guided/micro-celebrations.js` | Delightful moments | FR-008 |
| `src/guided/streaming-output.js` | AI streaming | FR-013 |
| `src/integration/cli-json-interface.js` | Little Helper | FR-010 |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPECKIT_CONFIG_DIR` | `~/.config/spec-kit-assistant` | Override config location |
| `SPECKIT_JSON_MODE` | `false` | Enable JSON output by default |
| `SPECKIT_NO_CELEBRATIONS` | `false` | Disable celebrations |

## Related Documentation

- [Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Research](./research.md)
- [Data Model](./data-model.md)
- [CLI JSON Schema](./contracts/cli-json-schema.json)

---

**Next Steps**: Run `/speckit.tasks` to generate implementation tasks.
