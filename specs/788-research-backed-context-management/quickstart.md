# Quickstart: Testing Context Engineering End-to-End

**Feature**: Spec as Context Engineer
**Target User**: Developers testing research-backed context management
**Time**: ~20 minutes

## Prerequisites

- Spec Kit Assistant installed (or new fork)
- Node.js 18+
- Terminal with color support (optional)

## Test Scenario: Context Engineering Workflow

### Step 1: Start New Spec with GATE Discovery

```bash
# Initialize new spec using context engineering
node src/index.js spec "improve user authentication"
```

**Expected Behavior**:
- ✅ System begins with problem-first question: "What problem are you trying to solve?"
- ✅ NOT feature-first: "What do you want to build?"
- ❌ If you see feature questions first, GATE elicitation not working

**User Response Example**:
```
"Users forget passwords frequently and support tickets are overwhelming."
```

**Expected Follow-up**:
- ✅ System asks: "Who experiences this problem?" (progressive disclosure)
- ✅ Context extraction visible: problem, users, impact identified

### Step 2: Experience Multi-Persona Exploration

**Expected Behavior**:
- ✅ System announces: "🐕 Let's look at this from different perspectives!"
- ✅ Persona rotation visible:
  1. Security Persona: "What could go wrong if authentication fails?"
  2. UX Persona: "How will users recover their passwords?"
  3. Architecture Persona: "How does this scale to 10k password resets/day?"
  4. QA Persona: "What edge cases exist for password recovery?"

**Success Criteria**:
- ✅ Each persona asks at least 2 questions
- ✅ Questions don't overlap significantly
- ✅ You notice insights you wouldn't have thought of initially

### Step 3: Test Socratic Refinement

**Scenario**: Provide vague requirement to test refinement loop

**User Input**: "The system should be secure."

**Expected Socratic Loop**:
```
System: "When you say 'secure', what specific security measures are you thinking of?"
User: "Well, encrypted and safe."
System: "Let's get more specific - what encryption standard? Where does encryption apply?"
User: "AES-256 for data at rest."
System: ✅ "Great! That's testable. System MUST encrypt data at rest using AES-256."
```

**Success Criteria**:
- ✅ System identifies "secure" as ambiguous
- ✅ Iterative probing converts vague → specific → testable
- ✅ Final requirement has verifiable criteria
- ✅ Maximum 3 iterations (per NFR-007)

### Step 4: Verify 15-Minute Discovery Protocol

**Expected Behavior**:
- ✅ Phase progress indicators visible:
  ```
  Minutes 1-5: Problem Discovery (WHY) ⏳ 2:15 remaining
  Minutes 6-10: Multi-Perspective Requirements ⏳ 4:30 remaining
  Minutes 11-13: Constitution Extraction ⏳ 1:45 remaining
  Minutes 14-15: Specification Framework ⏳ 0:58 remaining
  ```
- ✅ Discovery completes within 15 minutes
- ✅ If >20 minutes: fast-track option offered (EC-005)

**Success Criteria**:
- ✅ All phases complete within budget
- ✅ No feeling of time pressure (timer pauses during user input)
- ✅ Natural phase transitions

### Step 5: Test Mid-Build Reconciliation

**Scenario**: Add requirement while implementation in progress

```bash
# Start implementation (simulated or actual)
node src/index.js implement

# Mid-implementation, add new requirement
# (In another terminal or pause and add):
node src/index.js add-requirement "Also support 2FA with TOTP"
```

**Expected Reconciliation Behavior**:
```
🐕 Spec: "Hold on! New requirement detected."
⏸️  Pausing implementation of task T025...
🔄 Updating context to v1.1.0...
🔗 Reconciling Spec Kit and Claude contexts...
✅ Contexts synchronized! Resuming implementation...
⏱️  Total reconciliation: 1.8s
```

**Success Criteria**:
- ✅ System pauses within 100ms of change detection (FR-003)
- ✅ Version increments (1.0.0 → 1.1.0)
- ✅ Both contexts reconcile before resume
- ✅ Total pause-sync-resume < 2 seconds (NFR-002)
- ✅ No "fighting for control" messages
- ✅ Implementation resumes coherently with updated context

### Step 6: Validate Context Synchronization

**Check Context State**:
```bash
# View current context state
cat .specify/state/context-state.json

# Check context alignment
node src/index.js check-alignment
```

**Expected Output**:
```json
{
  "version": "1.1.0",
  "requirements": [...],
  "alignment": {
    "specKitStateVersion": "1.1.0",
    "claudeStateVersion": "1.1.0",
    "divergenceStatus": false,
    "lastSyncTime": "2025-09-29T14:30:22.000Z"
  }
}
```

**Success Criteria**:
- ✅ specKitStateVersion === claudeStateVersion
- ✅ divergenceStatus: false
- ✅ No reconciliation events with "failed" status

## Success Validation Checklist

Run this checklist to verify all features working:

- [ ] **GATE Discovery**: Problem-first questions asked before feature questions
- [ ] **Context Density**: 40% more context extracted vs traditional approach
- [ ] **Multi-Persona**: 4 personas rotated, each surfacing unique insights
- [ ] **Socratic Refinement**: Vague requirements refined to testable specifications
- [ ] **15-Minute Protocol**: Discovery completes within time budget
- [ ] **Mid-Build Reconciliation**: New requirements reconcile within 2 seconds
- [ ] **Context Synchronization**: Zero divergence errors, versions stay aligned
- [ ] **Character Consistency**: Spec the Golden Retriever personality maintained throughout

## Troubleshooting

**Problem**: GATE questions not triggering
- **Check**: `.specify/state/context-state.json` exists
- **Fix**: Ensure context engineering enabled for this spec

**Problem**: Reconciliation exceeds 2s budget
- **Check**: Network latency or slow file I/O
- **Fix**: Review `.specify/state/reconciliation-events.json` for bottlenecks

**Problem**: Persona questions overlapping
- **Check**: Persona rotation logic in PersonaRotator
- **Fix**: Verify uniqueness detection working correctly

**Problem**: Socratic loop not converging
- **Check**: Iteration count in AssumptionRefinement
- **Fix**: Should force convergence after 3 iterations (NFR-007)

## Performance Validation

Expected timing benchmarks:

- Context divergence detection: < 100ms
- Pause-sync-resume cycle: < 2000ms
- GATE question generation: < 500ms
- Context extraction: < 200ms
- Persona rotation: < 300ms
- Socratic probe generation: < 200ms
- Discovery protocol: < 15 minutes (80% of cases)

## Next Steps

After successful quickstart validation:

1. Run full test suite: `npm test`
2. Review generated spec.md quality
3. Compare context density vs old approach
4. Measure user satisfaction with cooperative behavior
5. Review reconciliation logs for patterns

---

**Success**: If all checkboxes pass, context engineering is working as designed!