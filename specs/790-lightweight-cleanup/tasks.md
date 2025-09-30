# Tasks: Feature 790 - Lightweight Cleanup

**Input**: Spec from `/home/monkeyflower/spec-kit-assistant/specs/790-lightweight-cleanup/spec.md`
**Target**: Clean, optimized v1.1.0 release

## Execution Flow
```
1. Phase 1: Fix test suite (BLOCKING)
2. Phase 2 & 3: Remove dead code + Fix context tests (PARALLEL)
3. Phase 4: Documentation
4. Validation: Full test suite + bundle size check
5. Release: v1.1.0 tag
```

---

## Phase 1: Fix Test Suite (CRITICAL)

### T001 Convert integration test to Node.js format
**File**: `test/integration/system.integration.test.js`
**Action**: Replace Jest imports with Node.js test runner
```javascript
// Replace
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
// With
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
// Replace expect() with assert.equal(), assert.ok(), etc.
```
**Validation**: File syntax valid, imports resolve

---

### T002 Convert security test to Node.js format
**File**: `test/security/security.test.js`
**Action**: Same as T001
**Validation**: File syntax valid, imports resolve

---

### T003 Run test suite and verify passing
**Command**: `npm test`
**Expected**: Exit code 0, all tests pass or skip gracefully
**Blocker**: T001, T002 must complete first

---

## Phase 2: Dead Code Removal

### T004 Audit Warp integration usage
**Commands**:
```bash
grep -r "warp-integration" src/
grep -r "WarpBridge" src/
grep -r "warpBridge" src/
```
**Output**: List of files referencing Warp
**Decision**: If only found in `src/index.js` commands → REMOVE
**Documentation**: Record findings in DECISIONS.md

---

### T005 Archive Warp integration files
**Action**: If T004 confirms unused, move to archive:
```bash
mkdir -p archive/warp-integration
git mv src/swarm/warp-integration.js archive/warp-integration/
git mv src/integrations/warp/ archive/warp-integration/
```
**Edit**: Remove Warp commands from `src/index.js` (lines ~149-203)
**Validation**: `npm start` works, no import errors

---

### T006 Audit prototype generator usage
**Command**: `grep -r "prototype/generator" src/`
**Decision**:
- If unused → Remove file
- If used → Add JSDoc explaining purpose
**Expected Savings**: 0-1,384 LOC

---

### T007 Remove or document prototype generator
**Action**: Based on T006 audit
- **If unused**: `git rm src/prototype/generator.js`
- **If used**: Add comprehensive JSDoc header
**Validation**: No import errors after removal

---

### T008 Move Google Cloud deps to peerDependencies
**File**: `package.json`
**Change**:
```json
{
  "dependencies": {
    // Remove @google-cloud/compute and @google-cloud/run
  },
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
**Validation**: `npm install` succeeds without GCP deps

---

### T009 Test install without optional deps
**Commands**:
```bash
rm -rf node_modules package-lock.json
npm install --production
npm start
spec fetch --spec test
```
**Expected**: CLI works without cloud features
**Fallback**: Cloud integration shows friendly error if GCP deps missing

---

## Phase 3: Fix Context Engineering Tests

### T010 Fix checkAlignment() divergence detection
**File**: `src/context/context-state.js`
**Test**: `tests/contract/test_context_state.js` - "should detect divergent versions"
**Issue**: Likely comparison logic doesn't handle version mismatch correctly
**Fix**: Review alignment logic in `checkAlignment()` method
**Validation**: Test passes on local and Seshat

---

### T011 Fix compareVersions() logic
**File**: `src/context/context-version.js`
**Tests**: `tests/contract/test_context_version.js` - 3 failing tests in `compareVersions()`
**Issue**: Version diff calculation or divergence detection broken
**Fix**:
1. Read semver comparison logic
2. Fix diff calculation
3. Fix semantic distance calculation
**Validation**: All 3 tests pass

---

### T012 Fix version history and rollback
**File**: `src/context/context-version.js`
**Tests**:
- `getVersionHistory()` - chronological ordering
- `rollbackToVersion()` - version creation after rollback
**Issue**: Likely sorting or version creation logic
**Fix**:
1. Sort version history by timestamp (descending)
2. Ensure rollback creates new version entry
**Validation**: Both tests pass, Seshat shows 95%+ pass rate

---

## Phase 4: Documentation

### T013 Create ARCHITECTURE.md
**File**: `/home/monkeyflower/spec-kit-assistant/ARCHITECTURE.md`
**Content**:
```markdown
# Architecture Overview

## Directory Structure
- src/core/ - Core spec kit functionality
- src/context/ - Context engineering (Feature 788)
- src/swarm/ - Agent swarm orchestration
- src/character/ - Spec the Golden Retriever UX
- src/consultation/ - Interactive discovery
- src/cloud/ - Cloud integrations (optional)

## Major Components
- spec-first-interceptor.js (814 LOC) - Workflow enforcement
- spec-kit-implementer.js (845 LOC) - Implementation engine
- consultation/engine.js (830 LOC) - Discovery process
- character/dog-art.js (1,201 LOC) - ASCII art assets

## Data Flow
[User] → [CLI] → [Spec First Interceptor] → [Consultation Engine] → [Spec Generator]
                     ↓
              [Context Engineering] (Feature 788)
                     ↓
              [Swarm Orchestration] (optional)
```
**Validation**: Document is clear and helpful

---

### T014 Create DECISIONS.md
**File**: `/home/monkeyflower/spec-kit-assistant/DECISIONS.md`
**Content**: Log all removal decisions
```markdown
# Architectural Decision Log

## Feature 790: Lightweight Cleanup (2025-09-30)

### Removed
- [ ] Warp integration (unused after swarm stack adoption)
- [ ] Prototype generator (unused / undocumented)

### Made Optional
- [ ] Google Cloud dependencies (peer deps)

### Fixed
- [ ] Test suite Jest/Node compatibility
- [ ] Context engineering test failures (6 tests)

### Kept
- [ ] All character assets (core UX)
- [ ] Cloud integration code (optional feature)
- [ ] All swarm orchestration
```
**Validation**: Complete and accurate

---

### T015 Update documentation
**Files**: `README.md`, `package.json`
**Changes**:
1. README.md: Note optional cloud features
2. README.md: Update installation instructions
3. package.json: Add comment explaining peerDependencies
**Validation**: Installation instructions work

---

## Validation & Release

### T016 Run complete test suite
**Commands**:
```bash
npm test                           # Local tests
ssh seshat "cd spec-kit-788-test && npm test"  # Remote tests
```
**Expected**: 95%+ pass rate (was 73%)

---

### T017 Verify bundle size reduction
**Commands**:
```bash
rm -rf node_modules
npm install --production
du -sh .
```
**Expected**: < 250MB (was 275MB, target 10% reduction)

---

### T018 Smoke test CLI
**Commands**:
```bash
npm start
spec fetch
spec fetch --spec test-cleanup
spec come-here
spec woof-woof
```
**Expected**: All commands work, no errors

---

### T019 Create v1.1.0 release
**Commands**:
```bash
git add -A
git commit -m "✨ Feature 790: Lightweight Cleanup Complete

- Fixed test suite Jest/Node compatibility
- Removed unused Warp integration code
- Made Google Cloud deps optional (peer deps)
- Fixed 6 context engineering test failures
- Added ARCHITECTURE.md and DECISIONS.md
- Bundle size reduced 10% (275MB → 247MB)

Test pass rate: 73% → 95%
All functionality preserved
No breaking changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git tag -a v1.1.0 -m "v1.1.0 - Lightweight Cleanup Release"
git push origin master
git push origin v1.1.0
```

---

## Success Criteria Checklist

- [ ] Test suite passes (npm test exits 0)
- [ ] Bundle size < 250MB (10% reduction)
- [ ] Context tests 95%+ pass rate (was 73%)
- [ ] No features removed that were actively used
- [ ] ARCHITECTURE.md and DECISIONS.md created
- [ ] v1.1.0 tag pushed to GitHub
- [ ] Installation works with and without cloud deps

---

## Time Tracking

| Task | Estimated | Actual | Status |
|------|-----------|--------|--------|
| T001-T003 (Tests) | 1h | - | Pending |
| T004-T009 (Dead Code) | 2h | - | Pending |
| T010-T012 (Context Fixes) | 3h | - | Pending |
| T013-T015 (Docs) | 1h | - | Pending |
| T016-T019 (Release) | 0.5h | - | Pending |
| **TOTAL** | **7.5h** | - | - |

---

## Parallel Execution Strategy

**Branch Strategy**:
```
master
├── 790-test-fixes (T001-T003) → Merge first (blocking)
├── 790-dead-code (T004-T009)  → Parallel with context-fixes
└── 790-context-fixes (T010-T012) → Parallel with dead-code
    └── 790-documentation (T013-T015) → After both above merge
```

**Execution Order**:
1. T001-T003: Sequential (blocking)
2. T004-T009 & T010-T012: Parallel (2 agents)
3. T013-T015: Sequential (depends on above)
4. T016-T019: Sequential (release process)

---

## Constitutional Compliance

✅ **Spec-Driven**: Feature 790 spec complete
✅ **Test-First**: Fixing tests in Phase 1 before code changes
✅ **Character-Preserved**: No UX changes
✅ **Incremental**: 4 clear phases
✅ **No Over-Engineering**: Lightweight cleanup only
✅ **Swarm-Optional**: Can be done manually or with swarm assistance

---

**Total Tasks**: 19
**Estimated Completion**: 1 working day (7.5 hours)
**Ready for**: User approval to begin execution