import { describe, it, before } from 'node:test';
import assert from 'node:assert';

/**
 * Integration Test: GATE Discovery Flow
 * Spec: Feature 788 - Acceptance Criteria 2 (40% context improvement)
 *
 * Tests the complete GATE elicitation workflow from problem to execution
 * Following TDD: This test should FAIL initially until full integration
 */

describe('GATE Discovery Flow Integration', () => {
  let GATEElicitor, ContextState;

  before(async () => {
    try {
      const gateModule = await import('../../src/context/gate-elicitor.js');
      const contextModule = await import('../../src/context/context-state.js');

      GATEElicitor = gateModule.default || gateModule.GATEElicitor;
      ContextState = contextModule.default || contextModule.ContextState;
    } catch (error) {
      GATEElicitor = null;
      ContextState = null;
    }
  });

  it('should complete full GATE discovery workflow', async () => {
    assert.ok(GATEElicitor, 'GATEElicitor not implemented');
    assert.ok(ContextState, 'ContextState not implemented');

    const elicitor = new GATEElicitor();
    const contextState = new ContextState();

    // Step 1: Start with Problem phase
    const problemResult = await elicitor.startProblemDiscovery({
      userVision: 'I want to build a project management tool for remote teams'
    });

    assert.strictEqual(problemResult.phase, 'Problem', 'Should start with Problem phase');
    assert.ok(problemResult.problemQuestions.length >= 3, 'Should generate problem questions');

    // Step 2: Extract context from user responses
    const responses = [
      'Our team struggles to track dependencies between tasks',
      'Project managers and team leads need visibility',
      'Current tools are too complex and require training'
    ];

    const extractedContexts = [];
    for (const response of responses) {
      const extracted = await elicitor.extractContextFromResponse({
        question: problemResult.problemQuestions[0],
        userResponse: response
      });
      extractedContexts.push(extracted.contextExtracted);
    }

    // Step 3: Measure context density improvement
    const baselineContext = {
      requirements: ['Build project management tool'],
      users: ['users']
    };

    const gateContext = {
      requirements: ['Build project management tool'],
      problem: 'Track dependencies between tasks',
      users: ['project managers', 'team leads'],
      impact: 'Reduce complexity and training time',
      constraints: ['Must be simple', 'No training required']
    };

    const densityResult = await elicitor.measureContextDensity({
      beforeContext: baselineContext,
      afterContext: gateContext
    });

    // Success criteria: >= 40% improvement (FR-010)
    assert.ok(
      densityResult.improvementPercent >= 40,
      `Should achieve >= 40% improvement, got ${densityResult.improvementPercent}%`
    );

    // Step 4: Update context state with enriched context
    await contextState.updateState({
      updates: gateContext,
      triggeredBy: 'specKit'
    });

    const finalState = await contextState.getState();
    assert.ok(finalState.state.problem, 'State should include problem statement');
    assert.ok(finalState.state.users.length > 1, 'State should include multiple user personas');
  });

  it('should follow GATE phase progression', async () => {
    assert.ok(GATEElicitor, 'GATEElicitor not implemented');

    const elicitor = new GATEElicitor();

    // Problem phase
    const problemResult = await elicitor.startProblemDiscovery({
      userVision: 'Analytics dashboard'
    });

    assert.strictEqual(problemResult.phase, 'Problem', 'Should start with Problem');

    // Verify problem-first approach (WHY before WHAT)
    const hasProblemFocus = problemResult.problemQuestions.some(q =>
      q.toLowerCase().includes('why') ||
      q.toLowerCase().includes('problem') ||
      q.toLowerCase().includes('challenge')
    );

    assert.ok(hasProblemFocus, 'Questions should focus on problem/why');
  });

  it('should provide progressive disclosure with follow-ups', async () => {
    assert.ok(GATEElicitor, 'GATEElicitor not implemented');

    const elicitor = new GATEElicitor();

    // Vague response should trigger follow-up
    const vague Result = await elicitor.extractContextFromResponse({
      question: 'Who will use this?',
      userResponse: 'Developers'
    });

    assert.ok(
      vagueResult.nextQuestion || vagueResult.contextExtracted.users,
      'Should either request follow-up or extract context'
    );

    // Detailed response should extract rich context
    const detailedResult = await elicitor.extractContextFromResponse({
      question: 'What problem does this solve?',
      userResponse: 'Our distributed team of 50 developers across 5 time zones ' +
                   'struggles to coordinate code reviews, leading to 2-day delays ' +
                   'and blocking critical releases'
    });

    assert.ok(detailedResult.contextExtracted.problem, 'Should extract problem');
    assert.ok(detailedResult.contextExtracted.users, 'Should extract users');
    assert.ok(detailedResult.contextExtracted.impact, 'Should extract impact');
  });

  it('should validate 40% context density improvement', async () => {
    assert.ok(GATEElicitor, 'GATEElicitor not implemented');

    const elicitor = new GATEElicitor();

    // Feature-first baseline (minimal context)
    const featureFirstContext = {
      requirements: ['User login', 'Dashboard', 'Reports']
    };

    // GATE problem-first (rich context)
    const gateProblemFirstContext = {
      requirements: ['User login', 'Dashboard', 'Reports'],
      problem: 'Team members waste 30 minutes daily switching between multiple tools',
      users: ['Product managers', 'Engineers', 'QA testers', 'Stakeholders'],
      impact: 'Reduce tool-switching overhead by 80%, save 2.5 hours per team member per week',
      constraints: [
        'Must integrate with existing SSO',
        'Mobile-first responsive design',
        'Offline capability required',
        'Max 200ms load time'
      ]
    };

    const result = await elicitor.measureContextDensity({
      beforeContext: featureFirstContext,
      afterContext: gateProblemFirstContext
    });

    // Acceptance Criteria 2: >= 40% improvement
    assert.ok(
      result.improvementPercent >= 40,
      `GATE should achieve >= 40% context improvement, got ${result.improvementPercent}%`
    );

    console.log(`✅ GATE Context Improvement: ${result.improvementPercent}% (target: 40%)`);
  });

  it('should integrate with context state versioning', async () => {
    assert.ok(GATEElicitor, 'GATEElicitor not implemented');
    assert.ok(ContextState, 'ContextState not implemented');

    const elicitor = new GATEElicitor();
    const contextState = new ContextState();

    // Start discovery
    const discoveryResult = await elicitor.startProblemDiscovery({
      userVision: 'Inventory management system'
    });

    // Extract context
    const extractedContext = await elicitor.extractContextFromResponse({
      question: discoveryResult.problemQuestions[0],
      userResponse: 'Warehouse managers need real-time stock levels to prevent overstocking'
    });

    // Update context state (should version automatically)
    const updateResult = await contextState.updateState({
      updates: extractedContext.contextExtracted,
      triggeredBy: 'specKit'
    });

    assert.ok(updateResult.newVersion, 'Should create new version');
    assert.ok(updateResult.changelog.length > 0, 'Should generate changelog');

    const state = await contextState.getState();
    assert.ok(state.state.problem, 'State should include extracted problem');
  });

  it('should handle multi-round elicitation', async () => {
    assert.ok(GATEElicitor, 'GATEElicitor not implemented');

    const elicitor = new GATEElicitor();

    // Round 1
    const round1 = await elicitor.extractContextFromResponse({
      question: 'What is the main challenge?',
      userResponse: 'Communication is difficult'
    });

    // If vague, should provide follow-up
    if (round1.nextQuestion) {
      // Round 2
      const round2 = await elicitor.extractContextFromResponse({
        question: round1.nextQuestion,
        userResponse: 'Async team across 12 time zones, critical updates get missed, leading to duplicated work'
      });

      assert.ok(
        round2.contextExtracted.problem,
        'Should extract richer context after follow-up'
      );
    }
  });
});