# Research: Quality Automation Suite

**Feature Branch**: `002-quality-automation`
**Date**: 2026-01-04
**Status**: Complete

## Research Topics

### 1. Node.js Built-in Test Runner Best Practices

**Decision**: Use `node:test` module with `node --test` command

**Rationale**:
- Built into Node.js 18+ (no external dependencies)
- Native ESM support matches project configuration
- Produces TAP output, convertible to JUnit XML
- Supports describe/it syntax familiar to developers

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Jest | Requires transpilation for ESM, heavy dependency |
| Vitest | External dependency, overkill for CLI tool |
| Mocha | Additional dependency, less modern |
| AVA | External dependency, different paradigm |

**Implementation Pattern**:
```javascript
import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';

describe('module', () => {
  it('should do something', async () => {
    assert.strictEqual(actual, expected);
  });
});
```

---

### 2. Coverage Tooling for Node.js Built-in Test Runner

**Decision**: Use `c8` for coverage with LCOV output

**Rationale**:
- Works seamlessly with `node:test`
- Produces LCOV format for CI dashboards (Codecov, Coveralls)
- Produces JUnit XML via `--reporter=junit`
- No special configuration needed

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| nyc | Older, c8 is successor |
| Jest coverage | Requires Jest framework |
| V8 coverage directly | No LCOV output, manual processing |

**Implementation Pattern**:
```json
{
  "scripts": {
    "test": "c8 --reporter=lcov --reporter=text node --test",
    "test:watch": "node --test --watch",
    "test:ci": "c8 --reporter=lcov --reporter=junit node --test"
  }
}
```

---

### 3. GitHub CLI Authentication Detection

**Decision**: Layer authentication: `gh auth status` → `GITHUB_TOKEN` env → git-only fallback

**Rationale**:
- `gh auth status` returns exit code 0 if authenticated
- GITHUB_TOKEN is standard for CI environments
- Graceful degradation ensures tool works without GitHub

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Only gh CLI | Breaks in CI without gh installed |
| Only GITHUB_TOKEN | Less secure for local dev (token in shell history) |
| OAuth flow | Too complex for CLI tool |

**Implementation Pattern**:
```javascript
async function getGitHubAuth() {
  // Try gh CLI first (most secure)
  try {
    await execAsync('gh auth status');
    return { method: 'gh-cli', available: true };
  } catch {}

  // Fall back to environment variable
  if (process.env.GITHUB_TOKEN) {
    return { method: 'env-token', available: true };
  }

  // No GitHub auth - git-only mode
  return { method: 'none', available: false };
}
```

---

### 4. GitHub Issues API via gh CLI

**Decision**: Use `gh issue create/edit/close` commands instead of direct API

**Rationale**:
- Leverages existing authentication
- Handles rate limiting automatically
- JSON output mode for parsing
- Works with both personal and org repos

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Octokit SDK | Additional dependency, manual auth handling |
| Raw REST API | Manual auth, rate limiting, pagination |
| GraphQL API | More complex, overkill for issues |

**Implementation Pattern**:
```javascript
// Create issue
const result = await execAsync(`gh issue create --title "${title}" --body "${body}" --json number`);
const { number } = JSON.parse(result.stdout);

// Update issue
await execAsync(`gh issue edit ${number} --body "${newBody}"`);

// Close issue
await execAsync(`gh issue close ${number}`);

// List issues with labels
const issues = await execAsync(`gh issue list --label "spec-kit" --json number,title,state`);
```

---

### 5. tasks.md Parsing Format

**Decision**: Parse markdown task lists with metadata in YAML frontmatter or inline markers

**Rationale**:
- tasks.md already has defined structure from spec-kit
- Task format: `- [ ] Task description`
- Dependencies via inline markers: `(depends: #123)`
- Issue links stored inline: `[#42]`

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| JSON sidecar | Separate file to maintain |
| Database | Overkill, not portable |
| YAML only | Loses markdown readability |

**Implementation Pattern**:
```markdown
# Tasks for 002-quality-automation

## Phase 1: Setup
- [x] Configure test runner [#42]
- [ ] Add coverage reporting (depends: #42)

## Phase 2: Unit Tests
- [ ] Test agent detector
```

**Parsed Structure**:
```javascript
{
  id: 'task-001',
  description: 'Configure test runner',
  status: 'complete', // or 'pending'
  issueNumber: 42,
  dependencies: [],
  phase: 'Phase 1: Setup'
}
```

---

### 6. Sync State Persistence

**Decision**: Store sync state in `.speckit/sync-state.json`

**Rationale**:
- .speckit/ already used for session data
- JSON is easy to read/write
- Can track last sync time, checksums for change detection
- Per-feature isolation via feature directory reference

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| In tasks.md itself | Pollutes user-facing file |
| SQLite | Dependency, overkill |
| Git notes | Complex, poor tooling |

**Implementation Pattern**:
```json
{
  "featureDir": "specs/002-quality-automation",
  "lastSync": "2026-01-04T12:00:00Z",
  "tasks": {
    "task-001": {
      "issueNumber": 42,
      "lastHash": "abc123",
      "synced": true
    }
  }
}
```

---

### 7. Mocking Strategy for Tests

**Decision**: Use `node:test` built-in `mock` module

**Rationale**:
- Built into Node.js 20+
- No external mocking library needed
- Supports function mocks, timers, module mocks

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Sinon | External dependency |
| Jest mocks | Requires Jest |
| Manual stubs | Less maintainable |

**Implementation Pattern**:
```javascript
import { mock } from 'node:test';

// Mock a function
const mockExec = mock.fn(() => Promise.resolve({ stdout: '{}' }));

// Mock a module (Node 20.6+)
mock.module('node:child_process', {
  namedExports: { exec: mockExec }
});

// Verify calls
assert.strictEqual(mockExec.mock.calls.length, 1);
```

---

## Summary

All technical decisions align with constitutional principles:
- **Minimal dependencies**: Using built-in Node.js test runner and c8
- **Security first**: Layered auth with gh CLI preferred over tokens
- **UX first**: Graceful degradation to git-only mode
- **Maintainability**: Standard patterns, clear structure

**No NEEDS CLARIFICATION items remain.**
