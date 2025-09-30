import { describe, it, before } from 'node:test';
import assert from 'node:assert';

/**
 * Contract Test: GATEElicitor API
 * Spec: specs/788-research-backed-context-management/contracts/gate-elicitation.contract.yaml
 *
 * Tests the progressive context elicitation using problem-first GATE Framework
 * Following TDD: These tests should FAIL initially until implementation
 */

describe('GATEElicitor Contract Tests', () => {
  let GATEElicitor;

  before(async () => {
    try {
      const module = await import('../../src/context/gate-elicitor.js');
      GATEElicitor = module.default || module.GATEElicitor;
    } catch (error) {
      GATEElicitor = null;
    }
  });

  describe('startProblemDiscovery()', () => {
    it('should generate problem-space questions from user vision', async () => {
      assert.ok(GATEElicitor, 'GATEElicitor not implemented');

      const elicitor = new GATEElicitor();
      const result = await elicitor.startProblemDiscovery({
        userVision: 'I want to build a task management app'
      });

      assert.ok(Array.isArray(result.problemQuestions), 'Should return questions array');
      assert.ok(result.problemQuestions.length >= 3, 'Should generate at least 3 questions');
      assert.strictEqual(result.phase, 'Problem', 'Should be in Problem phase');
    });

    it('should prioritize WHY over WHAT in questions', async () => {
      assert.ok(GATEElicitor, 'GATEElicitor not implemented');

      const elicitor = new GATEElicitor();
      const result = await elicitor.startProblemDiscovery({
        userVision: 'Need a reporting dashboard'
      });

      const questions = result.problemQuestions;
      const problemFocused = questions.some(q =>
        q.toLowerCase().includes('why') ||
        q.toLowerCase().includes('problem') ||
        q.toLowerCase().includes('challenge')
      );

      assert.ok(problemFocused, 'At least one question should focus on problem/why');
    });

    it('should complete within 500ms', async () => {
      assert.ok(GATEElicitor, 'GATEElicitor not implemented');

      const elicitor = new GATEElicitor();
      const start = Date.now();

      await elicitor.startProblemDiscovery({
        userVision: 'Build an analytics tool'
      });

      const duration = Date.now() - start;
      assert.ok(duration < 500, `Should complete in < 500ms, took ${duration}ms`);
    });
  });

  describe('extractContextFromResponse()', () => {
    it('should extract structured context from user response', async () => {
      assert.ok(GATEElicitor, 'GATEElicitor not implemented');

      const elicitor = new GATEElicitor();
      const result = await elicitor.extractContextFromResponse({
        question: 'What problem are you trying to solve?',
        userResponse: 'Our team struggles to track project deadlines and dependencies. ' +
                     'We need better visibility for project managers and team leads.'
      });

      assert.ok(result.contextExtracted, 'Should return extracted context');
      assert.ok(result.contextExtracted.problem, 'Should extract problem statement');
      assert.ok(Array.isArray(result.contextExtracted.users), 'Should extract user personas');
      assert.ok(result.contextExtracted.impact, 'Should extract impact');
    });

    it('should provide follow-up question when more depth needed', async () => {
      assert.ok(GATEElicitor, 'GATEElicitor not implemented');

      const elicitor = new GATEElicitor();
      const result = await elicitor.extractContextFromResponse({
        question: 'Who will use this?',
        userResponse: 'Developers'  // Vague answer
      });

      assert.ok(
        typeof result.nextQuestion === 'string' || result.nextQuestion === null,
        'nextQuestion should be string or null'
      );

      if (result.userResponse?.length < 50) {
        assert.ok(
          result.nextQuestion,
          'Should provide follow-up for vague response'
        );
      }
    });

    it('should complete within 200ms', async () => {
      assert.ok(GATEElicitor, 'GATEElicitor not implemented');

      const elicitor = new GATEElicitor();
      const start = Date.now();

      await elicitor.extractContextFromResponse({
        question: 'What is the main challenge?',
        userResponse: 'Communication between distributed teams'
      });

      const duration = Date.now() - start;
      assert.ok(duration < 200, `Should complete in < 200ms, took ${duration}ms`);
    });

    it('should handle constraints extraction', async () => {
      assert.ok(GATEElicitor, 'GATEElicitor not implemented');

      const elicitor = new GATEElicitor();
      const result = await elicitor.extractContextFromResponse({
        question: 'Any technical constraints?',
        userResponse: 'Must work offline, limited to 100MB storage, needs to run on old devices'
      });

      assert.ok(Array.isArray(result.contextExtracted.constraints), 'Should extract constraints');
      assert.ok(result.contextExtracted.constraints.length > 0, 'Should find multiple constraints');
    });
  });

  describe('measureContextDensity()', () => {
    it('should calculate improvement percentage', async () => {
      assert.ok(GATEElicitor, 'GATEElicitor not implemented');

      const elicitor = new GATEElicitor();
      const beforeContext = {
        requirements: ['Build a dashboard'],
        users: ['users']
      };

      const afterContext = {
        requirements: ['Build a dashboard'],
        users: ['project managers', 'team leads', 'developers'],
        problem: 'Track project deadlines and dependencies',
        impact: 'Reduce missed deadlines by 50%',
        constraints: ['Must integrate with Jira', 'Web-based only']
      };

      const result = await elicitor.measureContextDensity({
        beforeContext,
        afterContext
      });

      assert.ok(typeof result.improvementPercent === 'number', 'Should return numeric percentage');
      assert.ok(result.improvementPercent >= 0, 'Improvement should be non-negative');
    });

    it('should achieve >= 40% improvement target', async () => {
      assert.ok(GATEElicitor, 'GATEElicitor not implemented');

      const elicitor = new GATEElicitor();
      const beforeContext = {
        requirements: ['Feature X', 'Feature Y']
      };

      const afterContext = {
        requirements: ['Feature X', 'Feature Y'],
        problem: 'Detailed problem statement',
        users: ['persona 1', 'persona 2', 'persona 3'],
        impact: 'Measurable impact',
        constraints: ['constraint 1', 'constraint 2']
      };

      const result = await elicitor.measureContextDensity({
        beforeContext,
        afterContext
      });

      // This test validates the 40% improvement success criteria (FR-010)
      assert.ok(
        result.improvementPercent >= 40,
        `Should achieve >= 40% improvement, got ${result.improvementPercent}%`
      );
    });

    it('should handle identical contexts', async () => {
      assert.ok(GATEElicitor, 'GATEElicitor not implemented');

      const elicitor = new GATEElicitor();
      const context = {
        requirements: ['Same'],
        users: ['Same']
      };

      const result = await elicitor.measureContextDensity({
        beforeContext: context,
        afterContext: context
      });

      assert.strictEqual(result.improvementPercent, 0, 'Identical contexts should show 0% improvement');
    });
  });
});