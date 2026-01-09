/**
 * Guided UX Module Tests
 * Verifies the guided UX flow implementation
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Guided UX Module Exports', async () => {
  test('guided/index.js exports all expected modules', async () => {
    const guided = await import('../src/guided/index.js');

    // Entities
    assert(guided.Session, 'Should export Session');
    assert(guided.PhaseState, 'Should export PhaseState');
    assert(guided.PhaseType, 'Should export PhaseType');
    assert(guided.Decision, 'Should export Decision');
    assert(guided.UserPreferences, 'Should export UserPreferences');
    assert(guided.SmartDefault, 'Should export SmartDefault');
    assert(guided.ClarificationQuestion, 'Should export ClarificationQuestion');
    assert(guided.Option, 'Should export Option');

    // Services
    assert(guided.SessionManager, 'Should export SessionManager');
    assert(guided.SmartDefaults, 'Should export SmartDefaults');
    assert(guided.QuestionReducer, 'Should export QuestionReducer');
    assert(guided.QuestionPresenter, 'Should export QuestionPresenter');
    assert(guided.ProgressTracker, 'Should export ProgressTracker');
    assert(guided.MicroCelebrations, 'Should export MicroCelebrations');
    assert(guided.StreamingOutput, 'Should export StreamingOutput');

    // Flows
    assert(guided.GuidedOnboarding, 'Should export GuidedOnboarding');
    assert(guided.GuidedSpecify, 'Should export GuidedSpecify');
    assert(guided.FlowBridge, 'Should export FlowBridge');

    // UI
    assert(guided.ExpandableSection, 'Should export ExpandableSection');
    assert(guided.ProgressBar, 'Should export ProgressBar');

    // Archetypes
    assert(guided.archetypes, 'Should export archetypes');
    assert(guided.detectArchetype, 'Should export detectArchetype');
  });
});

describe('SmartDefaults', async () => {
  test('analyzeProject detects web app archetype', async () => {
    const { SmartDefaults } = await import('../src/guided/smart-defaults.js');
    const smartDefaults = new SmartDefaults();

    const result = smartDefaults.analyzeProject('A React dashboard for managing users');

    assert(result.archetype, 'Should return archetype');
    assert(result.archetype.id === 'web-app', 'Should detect web-app archetype');
    assert(result.archetype.confidence >= 0.5, 'Should have confidence >= 0.5');
    assert(Array.isArray(result.defaults), 'Should return defaults array');
  });

  test('analyzeProject detects CLI tool archetype', async () => {
    const { SmartDefaults } = await import('../src/guided/smart-defaults.js');
    const smartDefaults = new SmartDefaults();

    const result = smartDefaults.analyzeProject('A command line tool for automating deployments');

    assert(result.archetype.id === 'cli-tool', 'Should detect cli-tool archetype');
  });

  test('analyzeFeature returns defaults and questions', async () => {
    const { SmartDefaults } = await import('../src/guided/smart-defaults.js');
    const smartDefaults = new SmartDefaults();

    const result = smartDefaults.analyzeFeature('Add user authentication with OAuth');

    assert(Array.isArray(result.defaults), 'Should return defaults array');
    assert(Array.isArray(result.suggestedQuestions), 'Should return suggested questions');
    assert(result.suggestedQuestions.length <= 3, 'Should return max 3 questions');
  });
});

describe('QuestionReducer', async () => {
  test('enforces max question limits', async () => {
    const { QuestionReducer } = await import('../src/guided/question-reducer.js');
    const reducer = new QuestionReducer();

    const questions = [
      { id: 'q1', primary: true, priority: 1 },
      { id: 'q2', primary: true, priority: 2 },
      { id: 'q3', priority: 1 },
      { id: 'q4', priority: 2 },
      { id: 'q5', priority: 3 }
    ];

    const result = reducer.reduce(questions, []);

    assert(result.primary, 'Should have one primary question');
    assert(result.followUp.length <= 2, 'Should have max 2 follow-up questions');
  });

  test('skips questions with high-confidence defaults', async () => {
    const { QuestionReducer } = await import('../src/guided/question-reducer.js');
    const reducer = new QuestionReducer();

    const questions = [{ id: 'q1' }];
    const defaults = [{ questionId: 'q1', confidence: 0.95 }];

    const canSkip = reducer.canSkip('q1', defaults);
    assert(canSkip, 'Should skip question with high confidence default');
  });

  test('reduceClarifications respects max 3 limit', async () => {
    const { QuestionReducer } = await import('../src/guided/question-reducer.js');
    const reducer = new QuestionReducer();

    const questions = [
      { id: 'q1' }, { id: 'q2' }, { id: 'q3' },
      { id: 'q4' }, { id: 'q5' }
    ];

    const result = reducer.reduceClarifications(questions, []);

    assert(result.length <= 3, 'Should return max 3 clarifications');
  });
});

describe('Archetypes', async () => {
  test('detectArchetype returns valid result', async () => {
    const { detectArchetype, ArchetypeId } = await import('../src/guided/archetypes/index.js');

    const result = detectArchetype('Building an API backend with Express');

    assert(result.archetype, 'Should return archetype');
    assert(result.confidence >= 0, 'Should have confidence');
    assert(result.confidence <= 1, 'Confidence should be <= 1');
    assert(Array.isArray(result.matchedKeywords), 'Should return matched keywords');
  });

  test('getAllArchetypes returns all except unknown', async () => {
    const { getAllArchetypes, ArchetypeId } = await import('../src/guided/archetypes/index.js');

    const all = getAllArchetypes();

    assert(Array.isArray(all), 'Should return array');
    assert(all.length >= 5, 'Should have at least 5 archetypes');
    assert(!all.find(a => a.id === 'unknown'), 'Should not include unknown');
  });
});

describe('Entities', async () => {
  test('SmartDefault validates correctly', async () => {
    const { SmartDefault, DefaultSource } = await import('../src/guided/entities/smart-default.js');

    const valid = new SmartDefault({
      questionId: 'test',
      value: 'value',
      confidence: 0.8,
      reasoning: 'test reason',
      source: DefaultSource.ARCHETYPE
    });

    const validation = valid.validate();
    assert(validation.valid, 'Should be valid');
    assert(validation.errors.length === 0, 'Should have no errors');
  });

  test('SmartDefault.canAutoApply respects threshold', async () => {
    const { SmartDefault } = await import('../src/guided/entities/smart-default.js');

    const highConfidence = new SmartDefault({
      questionId: 'test',
      value: 'value',
      confidence: 0.95
    });

    const lowConfidence = new SmartDefault({
      questionId: 'test',
      value: 'value',
      confidence: 0.5
    });

    assert(highConfidence.canAutoApply(), 'High confidence should auto-apply');
    assert(!lowConfidence.canAutoApply(), 'Low confidence should not auto-apply');
  });

  test('ClarificationQuestion validates option count', async () => {
    const { ClarificationQuestion } = await import('../src/guided/entities/clarification-question.js');
    const { Option } = await import('../src/guided/entities/option.js');

    const tooFew = new ClarificationQuestion({
      id: 'test',
      question: 'Test?',
      options: [new Option({ value: 'a', label: 'A' })]
    });

    const valid = new ClarificationQuestion({
      id: 'test',
      question: 'Test?',
      options: [
        new Option({ value: 'a', label: 'A' }),
        new Option({ value: 'b', label: 'B' })
      ]
    });

    assert(!tooFew.validate().valid, 'Should require min 2 options');
    assert(valid.validate().valid, '2 options should be valid');
  });

  test('PhaseType has all expected phases', async () => {
    const { PhaseType } = await import('../src/guided/entities/phase-state.js');

    assert(PhaseType.ONBOARDING, 'Should have ONBOARDING');
    assert(PhaseType.SPECIFY, 'Should have SPECIFY');
    assert(PhaseType.PLAN, 'Should have PLAN');
    assert(PhaseType.IMPLEMENT, 'Should have IMPLEMENT');
    assert(PhaseType.TEST, 'Should have TEST');
  });
});

describe('Integration Module', async () => {
  test('integration/index.js exports all modules', async () => {
    const integration = await import('../src/integration/index.js');

    assert(integration.JsonRpcParser, 'Should export JsonRpcParser');
    assert(integration.JsonRpcResponse, 'Should export JsonRpcResponse');
    assert(integration.StreamingResponse, 'Should export StreamingResponse');
    assert(integration.CliJsonInterface, 'Should export CliJsonInterface');
    assert(integration.RPC_ERROR_CODES, 'Should export RPC_ERROR_CODES');
  });

  test('JsonRpcParser validates requests', async () => {
    const { JsonRpcParser } = await import('../src/integration/json-rpc-parser.js');
    const parser = new JsonRpcParser();

    // Valid request
    const valid = parser.parse(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'init',
      params: { projectName: 'test' }
    }));

    assert(valid.valid, 'Should accept valid request');
    assert(valid.request.method === 'init', 'Should parse method');

    // Invalid JSON
    const invalid = parser.parse('not json');
    assert(!invalid.valid, 'Should reject invalid JSON');
    assert(invalid.error.code === -32700, 'Should return parse error code');
  });

  test('JsonRpcResponse formats responses correctly', async () => {
    const { JsonRpcResponse } = await import('../src/integration/json-rpc-response.js');

    const success = JsonRpcResponse.success(1, { status: 'ok' });
    assert(success.jsonrpc === '2.0', 'Should have jsonrpc version');
    assert(success.id === 1, 'Should have id');
    assert(success.result.status === 'ok', 'Should have result');

    const error = JsonRpcResponse.error(1, -32600, 'Invalid request');
    assert(error.error.code === -32600, 'Should have error code');
    assert(error.error.message === 'Invalid request', 'Should have error message');
  });
});

describe('UI Components', async () => {
  test('ProgressBar tracks completion', async () => {
    const { ProgressBar } = await import('../src/guided/ui/progress-bar.js');

    const bar = new ProgressBar({
      phases: ['A', 'B', 'C', 'D'],
      currentPhase: 0
    });

    assert(bar.getPercentage() === 0, 'Should start at 0%');

    bar.completePhase(0);
    assert(bar.getPercentage() === 25, 'Should be 25% after 1 of 4');

    bar.completePhase(1);
    bar.completePhase(2);
    bar.completePhase(3);
    assert(bar.getPercentage() === 100, 'Should be 100% when complete');
  });

  test('ExpandableSection toggles state', async () => {
    const { ExpandableSection } = await import('../src/guided/ui/expandable-section.js');

    const section = new ExpandableSection({
      id: 'test',
      collapsedLabel: 'Show more',
      expandedLabel: 'Show less'
    });

    assert(!section.isExpanded, 'Should start collapsed');

    section.toggle();
    assert(section.isExpanded, 'Should be expanded after toggle');

    section.toggle();
    assert(!section.isExpanded, 'Should be collapsed after second toggle');
  });
});

describe('MicroCelebrations', async () => {
  test('can be disabled', async () => {
    const { MicroCelebrations } = await import('../src/guided/micro-celebrations.js');

    const disabled = MicroCelebrations.disabled();
    assert(!disabled.enabled, 'Should be disabled');

    const enabled = MicroCelebrations.enabled();
    assert(enabled.enabled, 'Should be enabled');
  });
});

console.log('\n✅ Running Guided UX tests...\n');
