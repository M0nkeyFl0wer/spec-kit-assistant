# Data Model: Context Engineering Entities

**Feature**: Spec as Context Engineer
**Date**: 2025-09-29

## Entity Definitions

### 1. ContextState

**Purpose**: Shared observable state store for context synchronization between Spec Kit and Claude

**Fields**:
- `version` (string): Current semantic version (e.g., "1.2.3")
- `requirements` (array): List of functional requirements with IDs
- `assumptions` (array): Captured assumptions and constraints
- `constraints` (array): Technical and business constraints
- `successCriteria` (array): Measurable success metrics
- `lastModified` (timestamp): Last update timestamp
- `modifiedBy` (string): Entity that triggered update ("user", "specKit", "claude")

**Relationships**:
- Has many `ContextVersion` (version history)
- Has one `ContextAlignment` (current sync status)

**Validation Rules**:
- `version` must be valid semver format (X.Y.Z)
- Arrays must be non-null (can be empty)
- `lastModified` must be valid ISO 8601 timestamp
- `modifiedBy` must be one of: ["user", "specKit", "claude", "reconciliation"]

**State Transitions**:
```
Draft (initial) → Active (in use) → Superseded (new version created)
```

**Storage**: `.specify/state/context-state.json`

---

### 2. ContextVersion

**Purpose**: Immutable snapshot of context state at a specific version for version history and rollback

**Fields**:
- `versionNumber` (string): Semantic version identifier
- `snapshot` (ContextState): Complete context state at this version
- `changelog` (array): List of changes from previous version
  - Each entry: `{ field: string, change: string, before: any, after: any }`
- `timestamp` (Date): When this version was created
- `triggeringEvent` (string): What caused this version increment

**Relationships**:
- Belongs to `ContextState` (part of version history)

**Validation Rules**:
- `versionNumber` must be unique within version history
- `snapshot` must be complete valid ContextState
- `snapshot` is immutable after creation (no updates allowed)
- `changelog` must have at least one entry (empty for v1.0.0 only)

**State Transitions**:
- None (immutable record once created)

**Storage**: `.specify/state/version-history/` with filename `context-{version}.json`

---

### 3. ReconciliationEvent

**Purpose**: Track pause-sync-resume cycles when context divergence is detected and reconciled

**Fields**:
- `id` (string): Unique event ID (UUID)
- `trigger` (string): What triggered reconciliation (e.g., "mid-build requirement addition")
- `pauseTime` (Date): When implementation was paused
- `syncActions` (array): List of synchronization actions taken
  - Each entry: `{ action: string, target: string, result: string }`
- `resumeTime` (Date): When implementation resumed
- `affectedTasks` (array): List of task IDs that need reconciliation
- `status` (enum): Current status [pending, syncing, completed, failed]
- `beforeVersion` (string): Context version before reconciliation
- `afterVersion` (string): Context version after reconciliation

**Relationships**:
- References `ContextVersion` (before and after states)

**Validation Rules**:
- `resumeTime` must be greater than `pauseTime`
- `status` must be one of: ["pending", "syncing", "completed", "failed"]
- Total reconciliation time (`resumeTime - pauseTime`) must be ≤ 2000ms (NFR-002)
- `beforeVersion` and `afterVersion` must be valid semver

**State Transitions**:
```
Pending → Syncing → Completed
                 └→ Failed (with error details)
```

**Storage**: `.specify/state/reconciliation-events.json` (append-only log)

---

### 4. PersonaContext

**Purpose**: Store context extracted by each persona (Security/UX/Architecture/QA) during multi-perspective discovery

**Fields**:
- `personaType` (enum): Which persona [Security, UX, Architecture, QA]
- `questionsAsked` (array): List of questions asked by this persona
- `contextExtracted` (array): Context elements extracted from responses
  - Each entry: `{ question: string, response: string, extracted: object }`
- `uniqueInsights` (array): Insights unique to this persona (not found by others)
- `timestamp` (Date): When persona session completed

**Relationships**:
- Belongs to `ElicitationPhase` (part of Perspective phase)

**Validation Rules**:
- `personaType` must be one of: ["Security", "UX", "Architecture", "QA"]
- `uniqueInsights` must have minimum 2 items (per FR-012)
- `contextExtracted` must be non-empty

**State Transitions**:
- None (accumulated during discovery, finalized at phase end)

**Storage**: Part of `ElicitationPhase` object in discovery session

---

### 5. ElicitationPhase

**Purpose**: Track time-bounded discovery phases (Problem/Perspective/Constitution/Spec) with progress and outputs

**Fields**:
- `phaseName` (enum): Phase identifier [Problem, Perspective, Constitution, Specification]
- `timeBudget` (number): Allocated time in milliseconds
- `completionStatus` (boolean): Whether phase completed
- `contextGathered` (object): Context extracted during this phase
- `startTime` (Date): Phase start timestamp
- `endTime` (Date): Phase end timestamp (null if still active)
- `phaseToken` (string): Unique identifier for this phase instance

**Relationships**:
- Has many `PersonaContext` (for Perspective phase only)

**Validation Rules**:
- `phaseName` must be one of: ["Problem", "Perspective", "Constitution", "Specification"]
- `endTime - startTime` must be ≤ `timeBudget` for successful completion
- Phase sequence must be enforced: Problem → Perspective → Constitution → Specification
- `completionStatus` true only if `endTime` exists

**State Transitions**:
```
Pending (not started) → Active (in progress) → Completed (finished within budget)
                                             → Overrun (exceeded budget, fast-track offered)
```

**Storage**: `.specify/state/discovery-session.json` (current session)

---

### 6. AssumptionRefinement

**Purpose**: Track Socratic refinement loop iterations as vague requirements are refined to testable specifications

**Fields**:
- `vagueInput` (string): Original ambiguous requirement
- `assumptionIdentified` (string): Specific assumption surfaced
- `userConfirmation` (boolean): Whether user confirmed assumption
- `refinedContext` (string): Clarified, testable requirement
- `iterationNumber` (number): Which iteration in the Socratic loop (1-3)
- `isTestable` (boolean): Whether refined context is now testable
- `probeQuestion` (string): Question asked to refine assumption

**Relationships**:
- Part of Socratic refinement session for a specific requirement

**Validation Rules**:
- `iterationNumber` must be ≤ 3 (per NFR-007)
- `refinedContext` should have numeric or verifiable criteria when `isTestable` is true
- `iterationNumber` increments sequentially (1, 2, 3)

**State Transitions**:
```
Identified (assumption found) → Confirmed/Rejected (user feedback) → Refined (testable criteria)
```

**Storage**: Part of requirement refinement log in discovery session

---

### 7. ContextAlignment

**Purpose**: Monitor synchronization status between Spec Kit and Claude context versions

**Fields**:
- `specKitStateVersion` (string): Current version Spec Kit is operating on
- `claudeStateVersion` (string): Current version Claude is operating on
- `divergenceStatus` (boolean): Whether versions are misaligned
- `lastSyncTime` (Date): Last successful synchronization timestamp
- `divergenceDetectedAt` (Date, nullable): When divergence was first detected (null if aligned)
- `autoReconcile` (boolean): Whether to automatically trigger reconciliation

**Relationships**:
- Belongs to `ContextState` (tracks sync status for current state)

**Validation Rules**:
- Both `specKitStateVersion` and `claudeStateVersion` must be valid semver
- `divergenceStatus` must match version comparison: `specKitStateVersion !== claudeStateVersion`
- `divergenceDetectedAt` must be null when `divergenceStatus` is false
- Divergence must be detected within 100ms (FR-003)

**State Transitions**:
```
Aligned (versions match) → Diverged (versions differ) → Reconciling (sync in progress) → Aligned
```

**Storage**: Part of `ContextState` object (`.specify/state/context-state.json`)

---

## Entity Relationships Diagram

```
ContextState (1)
  ├─── (1:N) ContextVersion
  └─── (1:1) ContextAlignment

ReconciliationEvent (N)
  ├─── (N:1) ContextVersion (before)
  └─── (N:1) ContextVersion (after)

ElicitationPhase (1)
  └─── (1:N) PersonaContext [for Perspective phase only]

DiscoverySession (1)
  ├─── (1:N) ElicitationPhase
  └─── (1:N) AssumptionRefinement
```

## Storage Structure

```
.specify/state/
├── context-state.json              # Current ContextState + ContextAlignment
├── version-history/
│   ├── context-1.0.0.json         # ContextVersion snapshots
│   ├── context-1.1.0.json
│   └── context-1.2.0.json
├── reconciliation-events.json      # Append-only log of ReconciliationEvent
└── discovery-session.json          # Current ElicitationPhase + PersonaContext + AssumptionRefinement
```

## Performance Considerations

- **ContextState**: In-memory with periodic file sync, EventEmitter for notifications
- **ContextVersion**: Write-once, read for rollback (rarely accessed)
- **ReconciliationEvent**: Append-only log (no updates, fast writes)
- **PersonaContext**: Created during discovery, archived after spec complete
- **ElicitationPhase**: Active only during discovery (short-lived)
- **AssumptionRefinement**: Small object, max 3 iterations per requirement
- **ContextAlignment**: Checked frequently, kept in memory with ContextState

## Migration Strategy

For backward compatibility with existing specs:
1. New specs get full context state management
2. Existing specs continue with file-based approach
3. Detection: Check for `.specify/state/context-state.json` existence
4. Gradual opt-in: Users can enable context engineering for existing specs

---

**Status**: Complete - Ready for contract generation