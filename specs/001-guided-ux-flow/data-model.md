# Data Model: Guided UX Flow

**Branch**: `001-guided-ux-flow` | **Date**: 2026-01-04

## Entities

### Session

Represents the user's complete state for a project, persisted across restarts.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique session identifier (UUID) |
| version | string | yes | Schema version for migrations ("1.0") |
| projectId | string | yes | Project name/path identifier |
| projectPath | string | yes | Absolute path to project directory |
| currentPhase | PhaseType | yes | Current active workflow phase |
| phases | Map<PhaseType, PhaseState> | yes | State of each workflow phase |
| decisions | Decision[] | yes | All user decisions made |
| preferences | UserPreferences | yes | User UI preferences |
| createdAt | ISO8601 | yes | Session creation timestamp |
| updatedAt | ISO8601 | yes | Last modification timestamp |

**Validation Rules**:
- `id` must be valid UUIDv4
- `version` must match supported schema versions
- `projectPath` must be valid filesystem path
- `updatedAt` >= `createdAt`

**State Transitions**:
- Created: When user starts new project
- Updated: After any user interaction (auto-save)
- Migrated: When schema version changes

---

### PhaseState

Tracks the status of a single workflow phase.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | "pending" \| "in_progress" \| "complete" \| "skipped" | yes | Phase completion status |
| startedAt | ISO8601 \| null | no | When user entered this phase |
| completedAt | ISO8601 \| null | no | When phase was completed |
| artifacts | string[] | no | Paths to generated artifacts |
| errors | string[] | no | Any errors encountered |

**PhaseType Enum**:
```
onboarding | specify | clarify | plan | tasks | implement | test
```

**State Transitions**:
```
pending → in_progress (user enters phase)
in_progress → complete (phase finished successfully)
in_progress → pending (user goes back)
pending → skipped (user explicitly skips)
```

---

### Decision

Records a single user decision for audit trail and learning.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique decision identifier |
| phase | PhaseType | yes | Which phase this decision was made in |
| questionId | string | yes | Identifier of the question asked |
| question | string | yes | Human-readable question text |
| answer | string | yes | User's selected/provided answer |
| wasDefault | boolean | yes | Whether user accepted a default |
| confidence | number | no | Confidence of the default (0-1) |
| timestamp | ISO8601 | yes | When decision was made |

**Validation Rules**:
- `confidence` must be 0.0 to 1.0 if provided
- `questionId` must be unique within the phase

---

### SmartDefault

A pre-computed suggestion based on context analysis.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| questionId | string | yes | Which question this default answers |
| value | any | yes | The suggested default value |
| confidence | number | yes | How confident we are (0-1) |
| reasoning | string | yes | Human-readable explanation |
| source | "archetype" \| "history" \| "pattern" | yes | Where this default came from |

**Validation Rules**:
- `confidence` must be 0.0 to 1.0
- Only present defaults with confidence >= 0.5

---

### ClarificationQuestion

A question presented to the user when clarification is needed.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique question identifier |
| phase | PhaseType | yes | Which phase this question belongs to |
| question | string | yes | The question text |
| type | "single" \| "multi" \| "text" | yes | Answer type |
| options | Option[] | no | Available choices (for single/multi) |
| default | SmartDefault \| null | no | Suggested default if available |
| required | boolean | yes | Whether question must be answered |
| expandable | boolean | yes | Whether this is behind "customize" |

---

### Option

A single choice for a clarification question.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| value | string | yes | Option value (stored in Decision) |
| label | string | yes | Display label |
| description | string | no | Explanation of implications |
| isDefault | boolean | no | Whether this is the recommended choice |

---

### UserPreferences

User's UI/UX preferences.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| showAdvancedOptions | boolean | yes | false | Whether to expand all options by default |
| celebrationsEnabled | boolean | yes | true | Show micro-celebrations |
| streamingEnabled | boolean | yes | true | Stream AI output |
| soundEnabled | boolean | yes | false | Play sounds on events |

---

## Relationships

```
Session 1──* Decision (decisions made within session)
Session 1──* PhaseState (one per phase)
ClarificationQuestion 0..1── SmartDefault (optional default)
ClarificationQuestion 0..* Option (for choice questions)
Decision ──1 ClarificationQuestion (answers a question)
```

## Indexes (for JSON file queries)

Since we're using JSON files, these are logical indexes implemented in code:

| Index | Fields | Purpose |
|-------|--------|---------|
| session_by_project | projectPath | Find session for current project |
| decisions_by_phase | phase, timestamp | List decisions for a phase |
| phases_incomplete | status != "complete" | Find next actionable phase |

---

## Example Session JSON

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "version": "1.0",
  "projectId": "my-awesome-app",
  "projectPath": "/home/user/projects/my-awesome-app",
  "currentPhase": "specify",
  "phases": {
    "onboarding": {
      "status": "complete",
      "startedAt": "2026-01-04T09:00:00Z",
      "completedAt": "2026-01-04T09:02:30Z",
      "artifacts": [".speckit/session.json"]
    },
    "specify": {
      "status": "in_progress",
      "startedAt": "2026-01-04T09:02:30Z",
      "completedAt": null,
      "artifacts": []
    },
    "clarify": { "status": "pending" },
    "plan": { "status": "pending" },
    "tasks": { "status": "pending" },
    "implement": { "status": "pending" },
    "test": { "status": "pending" }
  },
  "decisions": [
    {
      "id": "dec-001",
      "phase": "onboarding",
      "questionId": "project-type",
      "question": "What type of project is this?",
      "answer": "web-app",
      "wasDefault": true,
      "confidence": 0.85,
      "timestamp": "2026-01-04T09:01:15Z"
    }
  ],
  "preferences": {
    "showAdvancedOptions": false,
    "celebrationsEnabled": true,
    "streamingEnabled": true,
    "soundEnabled": false
  },
  "createdAt": "2026-01-04T09:00:00Z",
  "updatedAt": "2026-01-04T09:02:30Z"
}
```

---

**Status**: Data model complete. Ready for contracts generation.
