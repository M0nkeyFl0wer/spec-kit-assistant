# Quickstart: Quality Automation Suite

**Feature Branch**: `002-quality-automation`

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- (Optional) GitHub CLI (`gh`) for issue sync
- (Optional) `specify` CLI for integration tests

## Setup

### 1. Install Dependencies

```bash
cd spec-kit-assistant
npm install
```

This adds c8 for coverage (dev dependency).

### 2. Run Tests

```bash
# Run all tests with coverage
npm test

# Watch mode for development
npm run test:watch

# Unit tests only (fast)
npm run test:unit

# Integration tests only (requires specify CLI)
npm run test:integration
```

### 3. Check Coverage

After running tests, view coverage:

```bash
# Console summary shown automatically

# Open HTML report (if generated)
open coverage/index.html

# LCOV file for CI
cat coverage/lcov.info
```

## GitHub Issues Integration

### 1. Authenticate (Choose One)

**Option A: GitHub CLI (Recommended)**
```bash
gh auth login
```

**Option B: Environment Variable**
```bash
export GITHUB_TOKEN=your_token_here
```

**Option C: Skip (Git-Only Mode)**
No setup needed. Issue sync disabled, tasks.md works locally.

### 2. Convert Tasks to Issues

After running `/speckit.tasks` to generate tasks.md:

```bash
# In your AI coding agent
/speckit.taskstoissues
```

Or programmatically:
```javascript
import { syncTasksToIssues } from './src/github/sync.js';

const result = await syncTasksToIssues('specs/002-quality-automation');
console.log(`Created: ${result.created.length} issues`);
```

### 3. Update Issues

When you edit tasks.md (change descriptions, mark complete):

```bash
/speckit.taskstoissues
```

The command detects changes and updates only modified issues.

## Test Structure

```
tests/
├── unit/           # Fast, isolated tests
│   ├── launcher/   # Agent detection, workflow state
│   ├── github/     # Auth, issues, sync
│   └── character/  # ASCII art
├── integration/    # Real CLI tests
└── fixtures/       # Test data
```

## Writing Tests

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('My Module', () => {
  it('should do something', async () => {
    const result = await myFunction();
    assert.strictEqual(result, expected);
  });
});
```

## Coverage Target

Constitutional requirement: **80% or higher**

Current coverage shown after each test run.

## Troubleshooting

### Tests Skip with "specify CLI not found"

Install the specify CLI:
```bash
uv tool install spec-kit
```

### GitHub Issues Not Creating

Check auth status:
```bash
gh auth status
```

Or verify token:
```bash
echo $GITHUB_TOKEN | head -c 10
```

### Coverage Below 80%

Focus on untested files shown in coverage report. Add tests for:
- Edge cases
- Error paths
- Async operations
