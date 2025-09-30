# Feature 790: Lightweight Cleanup & Optimization

**Type**: Maintenance
**Priority**: Medium
**Complexity**: Low
**Estimated Effort**: 4-6 hours

## Problem Statement

Code analysis of v1.0.0 reveals:
- Test suite broken (Jest/Node compatibility)
- Potentially unused code (Warp integration, prototype generator)
- Heavy dependencies that could be optional
- 6 failing context engineering tests

**Core Issue**: Accumulated technical debt from rapid Feature 788 development needs lightweight cleanup WITHOUT over-engineering.

## Goals

1. ✅ Fix test suite to run reliably
2. 🧹 Remove confirmed dead code
3. 📦 Reduce bundle size where easy
4. 🔧 Fix failing context tests
5. 📝 Document what stays vs. what goes

**NON-GOALS**:
- ❌ Major refactoring
- ❌ Architectural changes
- ❌ New features
- ❌ Over-engineering

## Success Metrics

- [ ] Test suite runs without errors (npm test passes)
- [ ] Bundle size reduced by at least 10% (from 275MB)
- [ ] All 6 context engineering tests pass
- [ ] No functionality regression
- [ ] Completion time: < 1 day

## Proposed Solution

### Phase 1: Fix Test Suite (CRITICAL - 1 hour)

**Problem**: Tests use Jest imports with Node.js test runner

**Solution**: Convert to native Node.js test format
```javascript
// Before (broken)
import { describe, it, expect } from '@jest/globals';

// After (working)
import { describe, it } from 'node:test';
import assert from 'node:assert';
```

**Files to Fix**:
- `test/integration/system.integration.test.js`
- `test/security/security.test.js`

**Impact**: Critical - enables CI/CD

---

### Phase 2: Remove Dead Code (LOW-HANGING FRUIT - 2 hours)

#### 2.1 Archive Warp Integration (if unused)

**Files to Review/Remove**:
- `src/swarm/warp-integration.js` (939 LOC)
- `src/integrations/warp/bridge.js` (498 LOC)
- Warp commands in `src/index.js` (lines 149-203)

**Decision Tree**:
```
Is Warp actively used?
├─ Yes → Keep and document
└─ No → Move to /archive/ directory
```

**Expected Savings**: ~1,500 LOC

#### 2.2 Verify Prototype Generator

**File**: `src/prototype/generator.js` (1,384 LOC - LARGEST FILE)

**Action**:
1. Grep for references in codebase
2. If unused → Remove
3. If used → Document purpose in comments

**Expected Savings**: 0-1,384 LOC (TBD)

#### 2.3 Remove Google Cloud Deps (Optional)

**Dependencies**:
- `@google-cloud/compute` (heavy)
- `@google-cloud/run` (heavy)

**Solution**: Make optional
```json
{
  "peerDependencies": {
    "@google-cloud/compute": "^4.12.0",
    "@google-cloud/run": "^1.5.1"
  },
  "peerDependenciesMeta": {
    "@google-cloud/compute": { "optional": true },
    "@google-cloud/run": { "optional": true }
  }
}
```

**Expected Savings**: ~50-100MB in default install

---

### Phase 3: Fix Context Engineering Tests (2-3 hours)

**Failing Tests** (6 total):
1. ContextState: `checkAlignment()` divergence detection
2. ContextVersion: `compareVersions()` (3 tests)
3. ContextVersion: `getVersionHistory()` chronological order
4. ContextVersion: `rollbackToVersion()` version creation

**Root Causes**:
- Likely comparison logic bugs in `src/context/context-version.js`
- Possibly missing async/await in test assertions

**Approach**:
1. Read test expectations
2. Fix implementation logic
3. Verify on Seshat (73% → 95%+ pass rate)

---

### Phase 4: Documentation (1 hour)

**Create**:
- `ARCHITECTURE.md` - Document what each major file does
- `DECISIONS.md` - Log what was removed and why

**Update**:
- `README.md` - Reflect optional cloud dependencies
- `package.json` - Add comments for dependencies

---

## Implementation Plan

### Tasks (15 total)

**Phase 1: Test Fixes** (T001-T003)
- [ ] T001 Convert `test/integration/system.integration.test.js` to Node.js format
- [ ] T002 Convert `test/security/security.test.js` to Node.js format
- [ ] T003 Run full test suite and verify passing

**Phase 2: Dead Code Removal** (T004-T009)
- [ ] T004 Audit Warp integration usage (grep codebase)
- [ ] T005 Archive or remove Warp files based on audit
- [ ] T006 Audit prototype generator usage
- [ ] T007 Remove or document prototype generator
- [ ] T008 Move Google Cloud deps to peerDependencies
- [ ] T009 Test install without optional deps

**Phase 3: Context Test Fixes** (T010-T012)
- [ ] T010 Fix `checkAlignment()` divergence detection logic
- [ ] T011 Fix `compareVersions()` and `getVersionHistory()` logic
- [ ] T012 Fix `rollbackToVersion()` version creation logic

**Phase 4: Documentation** (T013-T015)
- [ ] T013 Create `ARCHITECTURE.md` with file explanations
- [ ] T014 Create `DECISIONS.md` logging cleanup choices
- [ ] T015 Update `README.md` and `package.json` docs

---

## Risk Assessment

**Risks**:
1. **Removing actively-used code** → Mitigate: Thorough grep audit before removal
2. **Breaking tests further** → Mitigate: Run test suite after each change
3. **Dependency conflicts** → Mitigate: Test with and without optional deps

**Rollback Plan**: Git revert to v1.0.0 tag if issues arise

---

## Testing Strategy

### Test After Each Phase
```bash
# Phase 1
npm test

# Phase 2
npm test
npm install --production  # Verify optional deps work

# Phase 3
ssh seshat "cd spec-kit-788-test && npm test"

# Phase 4
npm start  # Smoke test CLI
spec fetch --spec test-feature
```

### Success Criteria Per Phase
- Phase 1: `npm test` exits 0
- Phase 2: Bundle size < 250MB
- Phase 3: Context tests 95%+ pass rate
- Phase 4: Documentation complete and accurate

---

## Timeline

**Total Estimated**: 6 hours (1 working day)

| Phase | Duration | Blocking? |
|-------|----------|-----------|
| Phase 1: Test Fixes | 1 hour | Yes (blocks CI/CD) |
| Phase 2: Dead Code | 2 hours | No (parallel with P3) |
| Phase 3: Context Tests | 3 hours | No (parallel with P2) |
| Phase 4: Documentation | 1 hour | No (can be done last) |

**Parallel Execution**: Phases 2 and 3 can run simultaneously on different branches.

---

## Definition of Done

- [ ] All tests pass (`npm test` exits 0)
- [ ] Bundle size reduced by >=10% (< 250MB)
- [ ] Context engineering tests at 95%+ pass rate
- [ ] No features removed that were actively used
- [ ] Documentation explains all architectural decisions
- [ ] Git history clean (one commit per phase)
- [ ] v1.1.0 tag created

---

## Follow-up Work (NOT in this feature)

**Future Optimizations** (low priority):
- Modularize `src/cloud/integration.js` (1,151 LOC)
- Split `src/index.js` commands into separate files
- Plugin system for extensibility
- Feature 789 (Web3) - decide to implement or remove branch

**Do these ONLY if user requests**. Current codebase is lightweight enough.

---

## Approval Checklist

Before starting:
- [ ] User approves scope (no over-engineering)
- [ ] User confirms Warp is unused
- [ ] User confirms Feature 789 can be ignored for now

**Constitutional Compliance**:
- ✅ Spec-driven (this spec)
- ✅ Test-first (fixing tests first)
- ✅ Character-preserved (no UX changes)
- ✅ Incremental (4 phases)
- ✅ Swarm-optional (no swarm needed for cleanup)