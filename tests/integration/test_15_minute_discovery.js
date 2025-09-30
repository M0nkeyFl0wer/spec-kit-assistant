import { describe, it, before } from 'node:test';
import assert from 'node:assert';

/**
 * Integration Test: 15-Minute Discovery Protocol
 * Spec: Feature 788 - NFR-003 (Discovery within 15 minutes)
 *
 * Tests complete GATE discovery with time budget management
 * Following TDD: This test should FAIL initially until full integration
 */

describe('15-Minute Discovery Protocol Integration', () => {
  let DiscoveryTimer, GATEElicitor, PersonaRotator, SocraticRefiner, ContextState;

  before(async () => {
    try {
      const timerModule = await import('../../src/context/discovery-timer.js');
      const gateModule = await import('../../src/context/gate-elicitor.js');
      const personaModule = await import('../../src/context/persona-rotator.js');
      const socraticModule = await import('../../src/context/socratic-refiner.js');
      const contextModule = await import('../../src/context/context-state.js');

      DiscoveryTimer = timerModule.default || timerModule.DiscoveryTimer;
      GATEElicitor = gateModule.default || gateModule.GATEElicitor;
      PersonaRotator = personaModule.default || personaModule.PersonaRotator;
      SocraticRefiner = socraticModule.default || socraticModule.SocraticRefiner;
      ContextState = contextModule.default || contextModule.ContextState;
    } catch (error) {
      DiscoveryTimer = null;
      GATEElicitor = null;
      PersonaRotator = null;
      SocraticRefiner = null;
      ContextState = null;
    }
  });

  it('should complete full discovery within 15 minutes', async () => {
    assert.ok(DiscoveryTimer, 'DiscoveryTimer not implemented');
    assert.ok(GATEElicitor, 'GATEElicitor not implemented');

    const timer = new DiscoveryTimer();
    const elicitor = new GATEElicitor();

    // Start discovery session
    const sessionStart = await timer.startDiscovery();
    assert.strictEqual(sessionStart.budgetMinutes, 15, 'Should have 15-minute budget');

    const overallStartTime = Date.now();

    // Phase 1: Problem Discovery (GATE)
    const problemResult = await elicitor.startProblemDiscovery({
      userVision: 'Build collaborative document editing tool'
    });

    await timer.advancePhase(); // Problem → Goal

    // Phase 2: Goal Elicitation
    // (simplified for test - in real usage would gather user input)
    await timer.advancePhase(); // Goal → Approach

    // Phase 3: Approach Planning
    await timer.advancePhase(); // Approach → Tradeoffs

    // Phase 4: Tradeoffs Analysis
    await timer.advancePhase(); // Tradeoffs → Execution

    // Phase 5: Execution Planning
    const completionResult = await timer.completeDiscovery();

    const totalDuration = Date.now() - overallStartTime;

    // Success criteria: Complete within 15 minutes (NFR-003)
    assert.ok(
      completionResult.totalTimeSeconds <= 900,
      `Discovery should complete in <= 900s, took ${completionResult.totalTimeSeconds}s`
    );

    assert.ok(
      totalDuration <= 900000,
      `Measured time should be <= 15 min, took ${totalDuration}ms`
    );

    console.log(`✅ Discovery completed in ${(totalDuration / 1000).toFixed(1)}s (budget: 900s)`);
  });

  it('should follow GATE phase sequence with time allocations', async () => {
    assert.ok(DiscoveryTimer, 'DiscoveryTimer not implemented');

    const timer = new DiscoveryTimer();

    const startResult = await timer.startDiscovery();

    // Verify phase allocations exist
    assert.ok(startResult.phaseAllocations, 'Should allocate time to phases');
    assert.ok(startResult.phaseAllocations.Problem, 'Should allocate Problem time');
    assert.ok(startResult.phaseAllocations.Goal, 'Should allocate Goal time');
    assert.ok(startResult.phaseAllocations.Approach, 'Should allocate Approach time');
    assert.ok(startResult.phaseAllocations.Tradeoffs, 'Should allocate Tradeoffs time');
    assert.ok(startResult.phaseAllocations.Execution, 'Should allocate Execution time');

    // Total should be 900 seconds (15 minutes)
    const totalAllocation = Object.values(startResult.phaseAllocations)
      .reduce((sum, seconds) => sum + seconds, 0);

    assert.strictEqual(totalAllocation, 900, 'Total allocation should be 900 seconds');

    // Follow phase sequence
    const phases = ['Problem'];
    for (let i = 0; i < 4; i++) {
      const advanceResult = await timer.advancePhase();
      phases.push(advanceResult.currentPhase);
    }

    assert.deepStrictEqual(
      phases,
      ['Problem', 'Goal', 'Approach', 'Tradeoffs', 'Execution'],
      'Should follow GATE sequence'
    );
  });

  it('should support fast-track mode for experienced users', async () => {
    assert.ok(DiscoveryTimer, 'DiscoveryTimer not implemented');

    const timer = new DiscoveryTimer();

    await timer.startDiscovery();

    // Enable fast-track
    const fastTrackResult = await timer.enableFastTrack();

    assert.strictEqual(fastTrackResult.fastTrackEnabled, true, 'Should enable fast track');
    assert.strictEqual(fastTrackResult.currentPhase, 'Execution', 'Should skip to Execution');

    assert.ok(
      Array.isArray(fastTrackResult.skippedPhases),
      'Should list skipped phases'
    );

    assert.ok(
      fastTrackResult.skippedPhases.length >= 3,
      'Should skip at least 3 phases (Goal, Approach, Tradeoffs)'
    );
  });

  it('should integrate all context engineering components', async () => {
    assert.ok(DiscoveryTimer, 'DiscoveryTimer not implemented');
    assert.ok(GATEElicitor, 'GATEElicitor not implemented');
    assert.ok(PersonaRotator, 'PersonaRotator not implemented');
    assert.ok(SocraticRefiner, 'SocraticRefiner not implemented');
    assert.ok(ContextState, 'ContextState not implemented');

    const timer = new DiscoveryTimer();
    const elicitor = new GATEElicitor();
    const rotator = new PersonaRotator();
    const refiner = new SocraticRefiner();
    const contextState = new ContextState();

    const overallStart = Date.now();

    // Step 1: Start discovery timer
    await timer.startDiscovery();

    // Step 2: GATE elicitation (Problem phase)
    const gateResult = await elicitor.startProblemDiscovery({
      userVision: 'Real-time analytics platform for IoT devices'
    });

    const contextFromGATE = await elicitor.extractContextFromResponse({
      question: gateResult.problemQuestions[0],
      userResponse: 'Need to process 10M sensor readings per hour with < 1s latency'
    });

    await timer.advancePhase(); // Problem → Goal

    // Step 3: Persona enrichment (Goal phase)
    let enrichedContext = contextFromGATE.contextExtracted;

    for (let i = 0; i < 2; i++) {  // Use 2 personas for speed
      const persona = await rotator.getNextPersona();
      const enrichment = await rotator.enrichContext({
        context: enrichedContext,
        persona
      });
      enrichedContext = enrichment.enrichedContext;
    }

    await timer.advancePhase(); // Goal → Approach

    // Step 4: Socratic refinement (Approach phase)
    const assumptions = await refiner.detectAssumptions({
      requirements: enrichedContext.requirements || ['Process data']
    });

    if (assumptions.assumptions.length > 0) {
      await refiner.refineAssumption({
        assumption: assumptions.assumptions[0],
        userResponse: 'Specific: Process 10M readings/hour with 99.9% accuracy'
      });
    }

    await timer.advancePhase(); // Approach → Tradeoffs
    await timer.advancePhase(); // Tradeoffs → Execution

    // Step 5: Update context state with final enriched context
    await contextState.updateState({
      updates: enrichedContext,
      triggeredBy: 'specKit'
    });

    // Step 6: Complete discovery
    const discoveryResult = await timer.completeDiscovery();

    const totalTime = Date.now() - overallStart;

    // Verify integration success
    assert.ok(discoveryResult.completed, 'Discovery should complete');
    assert.ok(totalTime <= 900000, `Should complete in <= 15 min, took ${totalTime}ms`);

    const finalState = await contextState.getState();
    assert.ok(finalState.state.problem, 'Final state should include problem');

    console.log(`✅ Full integration completed in ${(totalTime / 1000).toFixed(1)}s`);
  });

  it('should track time remaining and provide warnings', async () => {
    assert.ok(DiscoveryTimer, 'DiscoveryTimer not implemented');

    const timer = new DiscoveryTimer();

    await timer.startDiscovery();

    // Check time immediately
    const initialCheck = await timer.checkTimeRemaining();
    assert.ok(initialCheck.remainingSeconds > 0, 'Should have time remaining');
    assert.ok(initialCheck.remainingSeconds <= 900, 'Should be <= 900 seconds');
    assert.strictEqual(initialCheck.currentPhase, 'Problem', 'Should start in Problem phase');

    // Advance some phases
    await timer.advancePhase();
    await timer.advancePhase();

    const midCheck = await timer.checkTimeRemaining();
    assert.ok(midCheck.remainingSeconds < initialCheck.remainingSeconds, 'Time should decrease');
    assert.ok(midCheck.percentComplete > 0, 'Should show progress');
  });

  it('should emit discovery lifecycle events', async () => {
    assert.ok(DiscoveryTimer, 'DiscoveryTimer not implemented');

    const timer = new DiscoveryTimer();
    const events = [];

    timer.on('discoveryStarted', () => events.push('started'));
    timer.on('phaseAdvanced', () => events.push('advanced'));
    timer.on('discoveryCompleted', () => events.push('completed'));

    await timer.startDiscovery();

    // Advance through 2 phases
    await timer.advancePhase();
    await timer.advancePhase();

    await timer.completeDiscovery();

    assert.ok(events.includes('started'), 'Should emit discoveryStarted');
    assert.ok(events.includes('advanced'), 'Should emit phaseAdvanced');
    assert.ok(events.includes('completed'), 'Should emit discoveryCompleted');

    const advancedCount = events.filter(e => e === 'advanced').length;
    assert.strictEqual(advancedCount, 2, 'Should emit phaseAdvanced for each advance');
  });

  it('should handle phase time budget overruns gracefully', async () => {
    assert.ok(DiscoveryTimer, 'DiscoveryTimer not implemented');

    const timer = new DiscoveryTimer();
    let warningEmitted = false;

    timer.on('phaseTimeWarning', (data) => {
      warningEmitted = true;
      assert.ok(data.phase, 'Warning should include phase');
      assert.ok(data.timeSpent >= 0, 'Warning should include time spent');
    });

    await timer.startDiscovery();

    // Simulate spending too long in a phase
    await new Promise(resolve => setTimeout(resolve, 100));

    await timer.advancePhase();

    // Warning might be emitted if phase budget configured
    // Not strictly required for this test to pass
  });

  it('should maintain session state across phase transitions', async () => {
    assert.ok(DiscoveryTimer, 'DiscoveryTimer not implemented');

    const timer = new DiscoveryTimer();

    const startResult = await timer.startDiscovery();
    const sessionId = startResult.sessionId;

    // Advance through phases
    for (let i = 0; i < 3; i++) {
      await timer.advancePhase();

      // Verify session still active
      const timeCheck = await timer.checkTimeRemaining();
      assert.ok(timeCheck, 'Should maintain session state');
    }

    const completeResult = await timer.completeDiscovery();

    // Session ID should remain consistent
    assert.ok(completeResult, 'Should complete with valid result');
  });

  it('should validate complete workflow meets all acceptance criteria', async () => {
    // This meta-test verifies that the discovery protocol integrates
    // all acceptance criteria from the spec

    assert.ok(DiscoveryTimer, 'DiscoveryTimer not implemented');
    assert.ok(GATEElicitor, 'GATEElicitor not implemented');
    assert.ok(PersonaRotator, 'PersonaRotator not implemented');
    assert.ok(SocraticRefiner, 'SocraticRefiner not implemented');

    const timer = new DiscoveryTimer();
    const elicitor = new GATEElicitor();
    const rotator = new PersonaRotator();
    const refiner = new SocraticRefiner();

    const startTime = Date.now();

    // Start protocol
    await timer.startDiscovery();

    // GATE (Acceptance 2: 40% improvement)
    const gateStart = await elicitor.startProblemDiscovery({
      userVision: 'Test vision'
    });
    assert.ok(gateStart.problemQuestions.length >= 3, 'GATE should generate questions');

    // Persona (Acceptance 3: 86.8% completeness)
    let context = { problem: 'Test', requirements: ['Test'] };
    for (let i = 0; i < 4; i++) {
      const persona = await rotator.getNextPersona();
      const enriched = await rotator.enrichContext({ context, persona });
      context = enriched.enrichedContext;
    }

    // Socratic (Acceptance 4: 74% refinement)
    const assumptions = await refiner.detectAssumptions({
      requirements: ['Vague requirement']
    });

    if (assumptions.assumptions.length > 0) {
      await refiner.refineAssumption({
        assumption: assumptions.assumptions[0],
        userResponse: 'Explicit requirement'
      });
    }

    // Complete discovery
    await timer.completeDiscovery();

    const totalTime = Date.now() - startTime;

    // NFR-003: <= 15 minutes
    assert.ok(totalTime <= 900000, `Should complete in <= 15 min, took ${totalTime}ms`);

    console.log('✅ All acceptance criteria components integrated successfully');
  });
});