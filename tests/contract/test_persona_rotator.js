import { describe, it, before } from 'node:test';
import assert from 'node:assert';

/**
 * Contract Test: PersonaRotator API
 * Spec: Based on feature 788 Multi-Persona System (FR-011, FR-012, FR-013)
 *
 * Tests the multi-persona context enrichment system
 * Following TDD: These tests should FAIL initially until implementation
 */

describe('PersonaRotator Contract Tests', () => {
  let PersonaRotator;

  before(async () => {
    try {
      const module = await import('../../src/context/persona-rotator.js');
      PersonaRotator = module.default || module.PersonaRotator;
    } catch (error) {
      PersonaRotator = null;
    }
  });

  describe('getNextPersona()', () => {
    it('should rotate through 4 distinct personas', async () => {
      assert.ok(PersonaRotator, 'PersonaRotator not implemented');

      const rotator = new PersonaRotator();
      const personas = new Set();

      for (let i = 0; i < 4; i++) {
        const persona = await rotator.getNextPersona();
        personas.add(persona.role);
      }

      assert.strictEqual(personas.size, 4, 'Should provide 4 distinct personas');
    });

    it('should return persona with required fields', async () => {
      assert.ok(PersonaRotator, 'PersonaRotator not implemented');

      const rotator = new PersonaRotator();
      const persona = await rotator.getNextPersona();

      assert.ok(persona.role, 'Persona should have role');
      assert.ok(persona.perspective, 'Persona should have perspective');
      assert.ok(Array.isArray(persona.focusAreas), 'Persona should have focus areas');
    });

    it('should cycle back to first persona after 4 rotations', async () => {
      assert.ok(PersonaRotator, 'PersonaRotator not implemented');

      const rotator = new PersonaRotator();
      const firstPersona = await rotator.getNextPersona();

      // Get next 3 personas
      for (let i = 0; i < 3; i++) {
        await rotator.getNextPersona();
      }

      // 5th should be same as 1st
      const fifthPersona = await rotator.getNextPersona();
      assert.strictEqual(fifthPersona.role, firstPersona.role, 'Should cycle back to first');
    });
  });

  describe('enrichContext()', () => {
    it('should add persona-specific insights to context', async () => {
      assert.ok(PersonaRotator, 'PersonaRotator not implemented');

      const rotator = new PersonaRotator();
      const baseContext = {
        problem: 'Users struggle with navigation',
        requirements: ['Improve UX']
      };

      const result = await rotator.enrichContext({
        context: baseContext,
        persona: await rotator.getNextPersona()
      });

      assert.ok(result.enrichedContext, 'Should return enriched context');
      assert.ok(result.addedInsights, 'Should document added insights');
      assert.ok(
        result.addedInsights.length > 0 ||
        Object.keys(result.enrichedContext).length > Object.keys(baseContext).length,
        'Should add new insights or context elements'
      );
    });

    it('should detect unique insights vs duplicates', async () => {
      assert.ok(PersonaRotator, 'PersonaRotator not implemented');

      const rotator = new PersonaRotator();
      const context = {
        requirements: ['Need better search']
      };

      let totalInsights = 0;
      let uniqueInsights = 0;

      for (let i = 0; i < 4; i++) {
        const persona = await rotator.getNextPersona();
        const result = await rotator.enrichContext({ context, persona });

        const newInsights = result.addedInsights || [];
        totalInsights += newInsights.length;

        newInsights.forEach(insight => {
          if (insight.isUnique) {
            uniqueInsights++;
          }
        });
      }

      assert.ok(uniqueInsights > 0, 'Should identify unique insights');
    });

    it('should track completeness metrics', async () => {
      assert.ok(PersonaRotator, 'PersonaRotator not implemented');

      const rotator = new PersonaRotator();
      const context = {
        problem: 'Slow performance',
        users: ['developers']
      };

      const result = await rotator.enrichContext({
        context,
        persona: await rotator.getNextPersona()
      });

      assert.ok(
        result.completenessScore !== undefined,
        'Should track completeness score'
      );
    });
  });

  describe('getCompletenessReport()', () => {
    it('should generate completeness report after rotations', async () => {
      assert.ok(PersonaRotator, 'PersonaRotator not implemented');

      const rotator = new PersonaRotator();
      const context = { problem: 'Test problem' };

      // Enrich with all 4 personas
      for (let i = 0; i < 4; i++) {
        const persona = await rotator.getNextPersona();
        await rotator.enrichContext({ context, persona });
      }

      const report = await rotator.getCompletenessReport();

      assert.ok(report.overallCompleteness !== undefined, 'Should have overall score');
      assert.ok(Array.isArray(report.perspectives), 'Should list perspectives used');
      assert.strictEqual(report.perspectives.length, 4, 'Should have used 4 perspectives');
    });

    it('should achieve >= 86.8% completeness target', async () => {
      assert.ok(PersonaRotator, 'PersonaRotator not implemented');

      const rotator = new PersonaRotator();
      const comprehensiveContext = {
        problem: 'Detailed problem statement',
        users: ['user 1', 'user 2'],
        requirements: ['req 1', 'req 2', 'req 3'],
        constraints: ['constraint 1'],
        impact: 'Clear impact statement'
      };

      // Enrich with all personas
      for (let i = 0; i < 4; i++) {
        const persona = await rotator.getNextPersona();
        await rotator.enrichContext({
          context: comprehensiveContext,
          persona
        });
      }

      const report = await rotator.getCompletenessReport();

      // Success criteria from spec: 86.8% completeness
      assert.ok(
        report.overallCompleteness >= 86.8,
        `Should achieve >= 86.8% completeness, got ${report.overallCompleteness}%`
      );
    });

    it('should identify coverage gaps', async () => {
      assert.ok(PersonaRotator, 'PersonaRotator not implemented');

      const rotator = new PersonaRotator();
      const sparseContext = {
        problem: 'Vague problem'
      };

      // Enrich with only 2 personas
      for (let i = 0; i < 2; i++) {
        const persona = await rotator.getNextPersona();
        await rotator.enrichContext({ context: sparseContext, persona });
      }

      const report = await rotator.getCompletenessReport();

      assert.ok(Array.isArray(report.gaps), 'Should identify gaps');
      assert.ok(report.gaps.length > 0, 'Should find coverage gaps in sparse context');
    });
  });
});