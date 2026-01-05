# Data Model: Quality Automation Suite

**Feature Branch**: `002-quality-automation`
**Date**: 2026-01-04

## Entities

### 1. TestCase

A single verifiable assertion about system behavior.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Test name (e.g., "should detect Claude Code") |
| module | string | yes | Module under test (e.g., "launcher/agent-detector") |
| type | enum | yes | "unit" \| "integration" |
| status | enum | yes | "pass" \| "fail" \| "skip" |
| duration | number | no | Execution time in milliseconds |
| error | TestError | no | Error details if status is "fail" |

### 2. TestError

Details about a test failure.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | yes | Error message |
| file | string | yes | Source file path |
| line | number | yes | Line number |
| expected | any | no | Expected value |
| actual | any | no | Actual value |
| stack | string | no | Stack trace |

### 3. TestSuite

A collection of related test cases.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Suite name (e.g., "Agent Detection") |
| file | string | yes | Test file path |
| tests | TestCase[] | yes | Array of test cases |
| passed | number | computed | Count of passing tests |
| failed | number | computed | Count of failing tests |
| skipped | number | computed | Count of skipped tests |
| duration | number | computed | Total execution time |

### 4. CoverageReport

Aggregated statistics about code coverage.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timestamp | string | yes | ISO 8601 timestamp |
| summary | CoverageSummary | yes | Overall coverage stats |
| files | FileCoverage[] | yes | Per-file breakdown |

### 5. CoverageSummary

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| lines | CoverageMetric | yes | Line coverage |
| branches | CoverageMetric | yes | Branch coverage |
| functions | CoverageMetric | yes | Function coverage |
| statements | CoverageMetric | yes | Statement coverage |

### 6. CoverageMetric

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| total | number | yes | Total items |
| covered | number | yes | Covered items |
| percentage | number | computed | covered / total * 100 |

### 7. Task

An actionable work item from tasks.md.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique identifier (e.g., "task-001") |
| description | string | yes | Task description text |
| status | enum | yes | "pending" \| "complete" |
| phase | string | no | Phase/section heading |
| dependencies | string[] | no | IDs of dependent tasks |
| issueNumber | number | no | Linked GitHub Issue number |
| issueUrl | string | computed | Full GitHub Issue URL |

**State Transitions**:
```
pending → complete (via checkbox toggle or issue close)
complete → pending (via checkbox toggle or issue reopen)
```

### 8. GitHubIssue

External representation of a task in GitHub.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| number | number | yes | Issue number |
| title | string | yes | Issue title |
| body | string | yes | Issue body (markdown) |
| state | enum | yes | "open" \| "closed" |
| labels | string[] | no | Applied labels |
| assignees | string[] | no | Assigned usernames |
| url | string | yes | Full URL to issue |
| createdAt | string | yes | ISO 8601 creation time |
| updatedAt | string | yes | ISO 8601 last update |

### 9. SyncState

Mapping between tasks.md entries and GitHub Issues.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| featureDir | string | yes | Path to feature directory |
| lastSync | string | yes | ISO 8601 timestamp of last sync |
| tasks | Record<string, TaskSyncRecord> | yes | Per-task sync records |

### 10. TaskSyncRecord

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| issueNumber | number | yes | Linked GitHub Issue number |
| lastHash | string | yes | Hash of task content at last sync |
| synced | boolean | yes | Whether task is in sync |
| lastSyncTime | string | yes | ISO 8601 timestamp |

### 11. GitHubAuth

Authentication state for GitHub operations.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| method | enum | yes | "gh-cli" \| "env-token" \| "none" |
| available | boolean | yes | Whether GitHub operations are possible |
| username | string | no | Authenticated username (if available) |
| scopes | string[] | no | Available API scopes |

## Relationships

```
TestSuite 1──* TestCase
TestCase 1──? TestError

CoverageReport 1──1 CoverageSummary
CoverageReport 1──* FileCoverage

Task *──* Task (dependencies)
Task 1──? GitHubIssue

SyncState 1──* TaskSyncRecord
TaskSyncRecord 1──1 GitHubIssue
```

## Validation Rules

### Task
- `id` must be unique within tasks.md
- `dependencies` must reference existing task IDs
- `issueNumber` must be positive integer if present
- Circular dependencies are not allowed

### GitHubIssue
- `number` must be positive integer
- `state` must be "open" or "closed"
- `labels` must contain valid label names

### SyncState
- `lastSync` must be valid ISO 8601 timestamp
- `featureDir` must be valid relative path
- `tasks` keys must match task IDs in tasks.md

### CoverageReport
- All percentages must be 0-100
- `covered` must be <= `total`
