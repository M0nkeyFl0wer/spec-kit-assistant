import { describe, it, before } from 'node:test';
import assert from 'node:assert';

/**
 * Integration Test: Persona Enrichment Workflow
 * Spec: Feature 788 - Acceptance Criteria 3 (86.8% completeness)
 *
 * Tests multi-persona context enrichment achieving comprehensive coverage
 * Following TDD: This test should FAIL initially until full integration
 */

describe('Persona Enrichment Integration', () => {
  let PersonaRotator, ContextState;

  before(async () => {
    try {
      const personaModule = await import('../../src/context/persona-rotator.js');
      const contextModule = await import('../../src/context/context-state.js');

      PersonaRotator = personaModule.default || personaModule.PersonaRotator;
      ContextState = contextModule.default || contextModule.ContextState;
    } catch (error) {
      PersonaRotator = null;
      ContextState = null;
    }
  });

  it('should complete full 4-persona enrichment cycle', async () => {
    assert.ok(PersonaRotator, 'PersonaRotator not implemented');
    assert.ok(ContextState, 'ContextState not implemented');

    const rotator = new PersonaRotator();
    const contextState = new ContextState();

    // Start with baseline context
    let currentContext = {
      problem: 'Users struggle with feature discovery',
      requirements: ['Improve navigation'],
      users: ['end users']
    };

    // Initialize context state
    await contextState.updateState({
      updates: currentContext,
      triggeredBy: 'specKit'
    });

    // Enrich with all 4 personas
    const personas = [];
    for (let i = 0; i < 4; i++) {
      const persona = await rotator.getNextPersona();
      personas.push(persona.role);

      const enrichmentResult = await rotator.enrichContext({
        context: currentContext,
        persona
      });

      // Update context with enriched version
      currentContext = enrichmentResult.enrichedContext;

      await contextState.updateState({
        updates: enrichmentResult.enrichedContext,
        triggeredBy: 'specKit'
      });
    }

    // Verify 4 distinct personas were used
    const uniquePersonas = new Set(personas);
    assert.strictEqual(uniquePersonas.size, 4, 'Should use 4 distinct personas');

    // Get completeness report
    const report = await rotator.getCompletenessReport();

    // Success criteria: >= 86.8% completeness (Acceptance 3)
    assert.ok(
      report.overallCompleteness >= 86.8,
      `Should achieve >= 86.8% completeness, got ${report.overallCompleteness}%`
    );

    console.log(`✅ Persona Enrichment Completeness: ${report.overallCompleteness}% (target: 86.8%)`);
  });

  it('should track unique vs duplicate insights', async () => {
    assert.ok(PersonaRotator, 'PersonaRotator not implemented');

    const rotator = new PersonaRotator();

    const context = {
      problem: 'Performance issues in mobile app',
      requirements: ['Optimize load times']
    };

    let totalInsights = 0;
    let uniqueInsights = 0;

    for (let i = 0; i < 4; i++) {
      const persona = await rotator.getNextPersona();
      const result = await rotator.enrichContext({ context, persona });

      if (result.addedInsights) {
        result.addedInsights.forEach(insight => {
          totalInsights++;
          if (insight.isUnique) {
            uniqueInsights++;
          }
        });
      }
    }

    assert.ok(totalInsights > 0, 'Should generate insights');
    assert.ok(uniqueInsights > 0, 'Should have some unique insights');

    const uniquePercent = (uniqueInsights / totalInsights) * 100;
    console.log(`Unique insights: ${uniquePercent.toFixed(1)}% (${uniqueInsights}/${totalInsights})`);
  });

  it('should identify coverage gaps in sparse context', async () => {
    assert.ok(PersonaRotator, 'PersonaRotator not implemented');

    const rotator = new PersonaRotator();

    // Intentionally sparse context
    const sparseContext = {
      requirements: ['Build something']
    };

    // Enrich with 2 personas only
    for (let i = 0; i < 2; i++) {
      const persona = await rotator.getNextPersona();
      await rotator.enrichContext({ context: sparseContext, persona });
    }

    const report = await rotator.getCompletenessReport();

    assert.ok(Array.isArray(report.gaps), 'Should identify gaps');
    assert.ok(report.gaps.length > 0, 'Should find multiple gaps in sparse context');
    assert.ok(
      report.overallCompleteness < 86.8,
      'Sparse context should not meet completeness target'
    );
  });

  it('should achieve completeness with comprehensive context', async () => {
    assert.ok(PersonaRotator, 'PersonaRotator not implemented');

    const rotator = new PersonaRotator();

    // Comprehensive baseline context
    const comprehensiveContext = {
      problem: 'Detailed problem: Users spend 45 minutes daily navigating complex UI to complete routine tasks',
      users: ['Power users', 'Occasional users', 'Administrators'],
      requirements: [
        'Simplify navigation with contextual menus',
        'Add keyboard shortcuts for power users',
        'Implement task templates for routine operations',
        'Provide guided workflows for new users'
      ],
      constraints: [
        'Must maintain backward compatibility',
        'No breaking changes to existing APIs',
        'Performance budget: < 100ms for all operations'
      ],
      impact: 'Reduce task completion time by 60%, decrease support tickets by 40%',
      successCriteria: [
        'Task completion time < 18 minutes (down from 45)',
        'User satisfaction score > 4.5/5',
        'Support ticket reduction measured over 3 months'
      ]
    };

    // Enrich with all 4 personas
    for (let i = 0; i < 4; i++) {
      const persona = await rotator.getNextPersona();
      await rotator.enrichContext({
        context: comprehensiveContext,
        persona
      });
    }

    const report = await rotator.getCompletenessReport();

    // With comprehensive input, should easily exceed 86.8%
    assert.ok(
      report.overallCompleteness >= 86.8,
      `Comprehensive context should achieve >= 86.8%, got ${report.overallCompleteness}%`
    );

    assert.strictEqual(report.perspectives.length, 4, 'Should have 4 perspective entries');
  });

  it('should integrate persona insights with context versioning', async () => {
    assert.ok(PersonaRotator, 'PersonaRotator not implemented');
    assert.ok(ContextState, 'ContextState not implemented');

    const rotator = new PersonaRotator();
    const contextState = new ContextState();

    let context = {
      problem: 'API response times are slow',
      requirements: ['Improve performance']
    };

    // Track versions as personas enrich context
    const versions = [];

    for (let i = 0; i < 4; i++) {
      const persona = await rotator.getNextPersona();
      const enriched = await rotator.enrichContext({ context, persona });

      const updateResult = await contextState.updateState({
        updates: enriched.enrichedContext,
        triggeredBy: 'specKit'
      });

      versions.push(updateResult.newVersion);
      context = enriched.enrichedContext;
    }

    // Should have created 4 versions (one per persona)
    assert.strictEqual(versions.length, 4, 'Should create version per persona');

    // Versions should increment
    const uniqueVersions = new Set(versions);
    assert.strictEqual(uniqueVersions.size, 4, 'Each version should be unique');
  });

  it('should cycle personas correctly', async () => {
    assert.ok(PersonaRotator, 'PersonaRotator not implemented');

    const rotator = new PersonaRotator();

    const firstPersona = await rotator.getNextPersona();
    const personas = [firstPersona.role];

    // Get next 7 personas (should cycle through 4 twice, minus 1)
    for (let i = 0; i < 7; i++) {
      const persona = await rotator.getNextPersona();
      personas.push(persona.role);
    }

    // 5th persona should match 1st (cycling)
    assert.strictEqual(
      personas[4],
      personas[0],
      'Should cycle back to first persona after 4 rotations'
    );
  });

  it('should provide perspective-specific enrichment', async () => {
    assert.ok(PersonaRotator, 'PersonaRotator not implemented');

    const rotator = new PersonaRotator();

    const context = {
      problem: 'System scalability concerns',
      requirements: ['Handle more users']
    };

    const enrichments = [];

    // Get enrichments from different personas
    for (let i = 0; i < 4; i++) {
      const persona = await rotator.getNextPersona();
      const result = await rotator.enrichContext({ context, persona });

      enrichments.push({
        persona: persona.role,
        insights: result.addedInsights || [],
        focusAreas: persona.focusAreas || []
      });
    }

    // Each persona should have distinct focus areas
    const allFocusAreas = enrichments.flatMap(e => e.focusAreas);
    const uniqueFocusAreas = new Set(allFocusAreas);

    assert.ok(
      uniqueFocusAreas.size > enrichments.length,
      'Different personas should have diverse focus areas'
    );
  });
});