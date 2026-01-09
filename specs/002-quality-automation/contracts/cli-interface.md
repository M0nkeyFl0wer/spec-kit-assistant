# CLI Interface Contract: Quality Automation Suite

**Version**: 1.0.0
**Date**: 2026-01-04

## Test Commands

### npm test

Run all tests with coverage.

**Usage**:
```bash
npm test
```

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | All tests passed |
| 1 | One or more tests failed |

**Output**:
- Console: Test results in TAP format with coverage summary
- File: `coverage/lcov.info` (LCOV format)
- File: `test-results.xml` (JUnit XML format)

**Example Output**:
```
TAP version 14
# Subtest: Agent Detection
    ok 1 - should detect Claude Code when installed
    ok 2 - should detect Gemini CLI when installed
    ok 3 - should return empty array when no agents
    1..3
ok 1 - Agent Detection # time=45.123ms

...

# tests 42
# suites 8
# pass 42
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1234.567

----------|---------|----------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
All files |   85.2  |    78.4  |   90.1  |   85.2  |
----------|---------|----------|---------|---------|
```

---

### npm run test:watch

Run tests in watch mode (re-run on file changes).

**Usage**:
```bash
npm run test:watch
```

**Behavior**:
- Watches `src/` and `tests/` directories
- Re-runs affected tests on file save
- Ctrl+C to exit

---

### npm run test:unit

Run only unit tests (fast, no external dependencies).

**Usage**:
```bash
npm run test:unit
```

---

### npm run test:integration

Run only integration tests (requires specify CLI).

**Usage**:
```bash
npm run test:integration
```

**Prerequisites**:
- `specify` CLI installed and accessible
- May require network access

**Skip Behavior**:
If `specify` CLI not found, tests skip with message:
```
# SKIP: specify CLI not found - install with: uv tool install spec-kit
```

---

## GitHub Issues Commands

### /speckit.taskstoissues

Convert tasks.md to GitHub Issues.

**Usage** (in Claude Code or compatible agent):
```
/speckit.taskstoissues
```

**Prerequisites**:
- Valid tasks.md in current feature directory
- GitHub authentication (gh CLI or GITHUB_TOKEN)

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | All tasks synced successfully |
| 1 | Some tasks failed to sync |
| 2 | No GitHub authentication available |

**Output (JSON mode)**:
```json
{
  "created": [
    { "taskId": "task-001", "issueNumber": 42, "url": "https://github.com/..." }
  ],
  "updated": [
    { "taskId": "task-002", "issueNumber": 43, "url": "https://github.com/..." }
  ],
  "skipped": [
    { "taskId": "task-003", "reason": "already synced, no changes" }
  ],
  "failed": [],
  "mode": "github"
}
```

**Output (git-only mode)**:
```json
{
  "created": [],
  "updated": [],
  "skipped": [],
  "failed": [],
  "mode": "git-only",
  "message": "GitHub not configured. Tasks remain in tasks.md only."
}
```

---

## GitHub Auth Module

### checkGitHubAuth()

Check if GitHub authentication is available.

**Returns**:
```typescript
interface GitHubAuthResult {
  method: 'gh-cli' | 'env-token' | 'none';
  available: boolean;
  username?: string;
}
```

**Examples**:
```javascript
// gh CLI authenticated
{ method: 'gh-cli', available: true, username: 'M0nkeyFl0wer' }

// GITHUB_TOKEN set
{ method: 'env-token', available: true }

// No auth
{ method: 'none', available: false }
```

---

## Sync State File

**Location**: `.speckit/sync-state.json`

**Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["featureDir", "lastSync", "tasks"],
  "properties": {
    "featureDir": {
      "type": "string",
      "description": "Relative path to feature directory"
    },
    "lastSync": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of last sync"
    },
    "tasks": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["issueNumber", "lastHash", "synced"],
        "properties": {
          "issueNumber": { "type": "integer", "minimum": 1 },
          "lastHash": { "type": "string" },
          "synced": { "type": "boolean" },
          "lastSyncTime": { "type": "string", "format": "date-time" }
        }
      }
    }
  }
}
```

---

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| `E_NO_TASKS` | No tasks found | tasks.md is empty or missing |
| `E_PARSE_ERROR` | Parse error | tasks.md has invalid format |
| `E_NO_AUTH` | No authentication | GitHub auth not available |
| `E_RATE_LIMIT` | Rate limited | GitHub API rate limit exceeded |
| `E_NOT_FOUND` | Issue not found | Referenced issue was deleted |
| `E_PERMISSION` | Permission denied | No write access to repository |
