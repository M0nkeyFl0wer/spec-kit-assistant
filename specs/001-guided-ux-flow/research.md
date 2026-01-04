# Research: Guided UX Flow

**Branch**: `001-guided-ux-flow` | **Date**: 2026-01-04

## Research Topics

### 1. Smart Defaults Patterns

**Decision**: Use context-aware heuristics with confidence scoring

**Rationale**:
- Analyze user input keywords to match project archetypes (web app, CLI tool, API, mobile)
- Each archetype has pre-defined sensible defaults (e.g., web app → React patterns, authentication flow)
- Assign confidence scores to defaults; only ask clarifying questions when confidence < 70%
- Learn from user corrections to improve future suggestions (store in session)

**Alternatives Considered**:
- ML-based prediction: Rejected - requires training data, adds complexity, overkill for MVP
- Static templates only: Rejected - doesn't adapt to user context
- Ask everything upfront: Rejected - contradicts minimal-questions requirement

**Implementation Approach**:
```javascript
// Smart defaults structure
{
  archetype: 'web-app',
  confidence: 0.85,
  defaults: {
    authentication: { value: 'session-based', confidence: 0.9, reasoning: 'Standard for web apps' },
    database: { value: 'postgresql', confidence: 0.7, reasoning: 'Most common choice' }
  },
  suggestedQuestions: [] // Only populated if confidence < 0.7
}
```

---

### 2. Session Persistence Best Practices

**Decision**: Use XDG Base Directory spec with project-local fallback

**Rationale**:
- XDG spec (`~/.config/spec-kit-assistant/`) is standard on Linux, works on macOS
- Windows: Use `%APPDATA%/spec-kit-assistant/`
- Also store per-project session in `.speckit/session.json` for portability
- JSON format for human readability and easy debugging

**Alternatives Considered**:
- SQLite: Rejected - adds dependency, overkill for simple key-value session data
- Environment variables: Rejected - not persistent across restarts
- Cloud sync: Rejected - conflicts with local-first principle (future enhancement only)

**Platform Paths**:
| Platform | Global Config | Project Session |
|----------|--------------|-----------------|
| Linux | `~/.config/spec-kit-assistant/` | `.speckit/session.json` |
| macOS | `~/Library/Application Support/spec-kit-assistant/` or `~/.config/` | `.speckit/session.json` |
| Windows | `%APPDATA%\spec-kit-assistant\` | `.speckit\session.json` |

**Session File Structure**:
```json
{
  "version": "1.0",
  "projectId": "my-project",
  "currentPhase": "specify",
  "phases": {
    "onboarding": { "status": "complete", "completedAt": "2026-01-04T10:00:00Z" },
    "specify": { "status": "in_progress", "startedAt": "2026-01-04T10:05:00Z" }
  },
  "decisions": [
    { "phase": "onboarding", "question": "project-type", "answer": "web-app", "timestamp": "..." }
  ],
  "preferences": {
    "showAdvancedOptions": false,
    "celebrationsEnabled": true
  }
}
```

---

### 3. Streaming Output in CLI

**Decision**: Use ANSI escape sequences with ora spinner integration

**Rationale**:
- `ora` (already a dependency) handles spinners and can update text in-place
- For streaming AI text, use `process.stdout.write()` with ANSI cursor control
- Clear line (`\x1b[2K`), move cursor (`\x1b[1G`) for live updates
- Graceful fallback for non-TTY environments (CI, piped output)

**Alternatives Considered**:
- Blessed/Ink (terminal UI libraries): Rejected - heavy dependencies, learning curve
- Print everything line-by-line: Rejected - poor UX, scrolls past context
- WebSocket to browser: Rejected - requires browser, conflicts with CLI-first

**Implementation Pattern**:
```javascript
import ora from 'ora';

// For streaming text
function streamOutput(generator) {
  if (!process.stdout.isTTY) {
    // Non-interactive: batch output
    return collectAndPrint(generator);
  }

  const spinner = ora({ text: 'Thinking...', spinner: 'dots' }).start();
  let buffer = '';

  for await (const chunk of generator) {
    spinner.stop();
    process.stdout.write(chunk);
    buffer += chunk;
  }

  return buffer;
}

// For progress updates
function updateProgress(phase, progress) {
  process.stdout.write(`\x1b[2K\x1b[1G`); // Clear line, move to start
  process.stdout.write(`[${progressBar(progress)}] ${phase}`);
}
```

---

### 4. Little Helper Integration

**Decision**: JSON-RPC style protocol over stdin/stdout

**Rationale**:
- Little Helper (Rust) can spawn `spec-kit-assistant` as subprocess
- Communicate via structured JSON messages on stdin/stdout
- Stderr reserved for errors/logs (won't interfere with JSON parsing)
- Simple request/response pattern; streaming uses newline-delimited JSON (NDJSON)

**Alternatives Considered**:
- HTTP API: Rejected - requires running server, port management complexity
- Native Rust FFI: Rejected - requires building Rust bindings, maintenance burden
- File-based IPC: Rejected - slower, requires polling, race conditions

**Protocol Design**:

**Request (Little Helper → Spec Kit)**:
```json
{"jsonrpc": "2.0", "id": 1, "method": "specify", "params": {"description": "user auth feature"}}
```

**Response (Spec Kit → Little Helper)**:
```json
{"jsonrpc": "2.0", "id": 1, "result": {"status": "success", "specPath": "/path/to/spec.md"}}
```

**Streaming (for AI output)**:
```json
{"jsonrpc": "2.0", "id": 1, "method": "stream", "params": {"type": "chunk", "content": "First part..."}}
{"jsonrpc": "2.0", "id": 1, "method": "stream", "params": {"type": "chunk", "content": " more text..."}}
{"jsonrpc": "2.0", "id": 1, "method": "stream", "params": {"type": "done"}}
```

**CLI Flag**:
```bash
# Normal interactive mode
node spec-assistant.js specify "auth feature"

# JSON mode for Little Helper
node spec-assistant.js --json specify "auth feature"
```

---

## Summary of Decisions

| Topic | Decision | Key Benefit |
|-------|----------|-------------|
| Smart Defaults | Context-aware heuristics with confidence scoring | Minimizes questions, adapts to user |
| Session Persistence | XDG paths + project-local JSON | Cross-platform, human-readable |
| Streaming Output | ANSI escape + ora spinner | Smooth UX, existing dependency |
| Little Helper Integration | JSON-RPC over stdin/stdout | Simple, language-agnostic, no server |

---

**Status**: Research complete. Ready for Phase 1: Design & Contracts.
