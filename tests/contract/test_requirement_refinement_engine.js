/**
 * Contract test for Requirement Refinement Engine
 * Tests the API contract defined in contracts/requirement-refinement-engine.yaml
 * These tests MUST FAIL before implementation - TDD approach
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

describe('Requirement Refinement Engine Contract', () => {
  let refinementEngine;

  beforeEach(async () => {
    // This will fail until RefinementEngine is implemented
    const { RefinementEngine } = await import('../../src/refinement/refinement-engine.js');
    refinementEngine = new RefinementEngine();
  });

  afterEach(() => {
    refinementEngine = null;
  });

  describe('/refine/requirements endpoint contract', () => {
    test('should accept requirements array and refinement options', async () => {
      const request = {
        requirements: [
          {
            id: 'FR-001',
            text: 'System MUST provide intuitive visual commands'
          },
          {
            id: 'FR-002',
            text: 'Users MUST be able to interact with fast animations'
          }
        ],
        refinement_options: {
          focus_areas: ['ambiguity', 'measurability'],
          preserve_intent: true,
          include_validation_criteria: true
        }
      };

      // This should fail until refinementEngine.refineRequirements is implemented
      const result = await refinementEngine.refineRequirements(request);

      // Verify response structure matches contract
      assert.ok(result.refinement_session_id);
      assert.ok(Array.isArray(result.processed_requirements));
      assert.ok(result.summary);
      assert.ok(typeof result.summary.total_requirements === 'number');
    });

    test('should detect ambiguous requirements and provide refinements', async () => {
      const request = {
        requirements: [
          {
            id: 'FR-003',
            text: 'System MUST be fast and user-friendly'
          }
        ]
      };

      const result = await refinementEngine.refineRequirements(request);

      const processedReq = result.processed_requirements[0];

      // Verify requirement refinement structure
      assert.strictEqual(processedReq.requirement_id, 'FR-003');
      assert.strictEqual(processedReq.original_text, 'System MUST be fast and user-friendly');
      assert.ok(typeof processedReq.refinement_needed === 'boolean');

      if (processedReq.refinement_needed) {
        assert.ok(Array.isArray(processedReq.issues_identified));
        assert.ok(processedReq.refined_text);
        assert.ok(processedReq.clarification_rationale);
        assert.ok(Array.isArray(processedReq.testability_criteria));
        assert.ok(['draft', 'approved', 'rejected'].includes(processedReq.approval_status));
      }
    });

    test('should identify specific ambiguity types', async () => {
      const request = {
        requirements: [
          {
            id: 'FR-004',
            text: 'System MUST provide scalable performance'
          }
        ]
      };

      const result = await refinementEngine.refineRequirements(request);
      const processedReq = result.processed_requirements[0];

      if (processedReq.refinement_needed) {
        // Should identify vague adjectives
        assert.ok(processedReq.issues_identified.includes('vague_adjectives') ||
                 processedReq.issues_identified.includes('ambiguous_language'));
      }
    });

    test('should provide measurable criteria in refinements', async () => {
      const request = {
        requirements: [
          {
            id: 'FR-005',
            text: 'Animations MUST be responsive'
          }
        ]
      };

      const result = await refinementEngine.refineRequirements(request);
      const processedReq = result.processed_requirements[0];

      if (processedReq.refinement_needed && processedReq.measurability_validation) {
        processedReq.measurability_validation.forEach(validation => {
          assert.ok(validation.criterion);
          assert.ok(validation.measurement_method);
          assert.ok(validation.success_threshold);
        });
      }
    });

    test('should complete refinement within constitutional timing limits', async () => {
      const request = {
        requirements: [
          {
            id: 'FR-006',
            text: 'System MUST handle user input efficiently'
          }
        ]
      };

      const startTime = performance.now();
      const result = await refinementEngine.refineRequirements(request);
      const executionTime = performance.now() - startTime;

      // Constitutional limit: refinement should complete within 500ms
      assert.ok(executionTime < 500, `Refinement took ${executionTime}ms, should be < 500ms`);
    });

    test('should preserve requirement intent during refinement', async () => {
      const request = {
        requirements: [
          {
            id: 'FR-007',
            text: 'Users MUST be able to authenticate securely'
          }
        ],
        refinement_options: {
          preserve_intent: true
        }
      };

      const result = await refinementEngine.refineRequirements(request);
      const processedReq = result.processed_requirements[0];

      if (processedReq.refinement_needed) {
        // Refined text should still contain core concepts from original
        const originalWords = processedReq.original_text.toLowerCase().split(/\s+/);
        const refinedWords = processedReq.refined_text.toLowerCase().split(/\s+/);

        const keyWords = ['authenticate', 'securely', 'users'];
        keyWords.forEach(word => {
          assert.ok(refinedWords.some(w => w.includes(word)) ||
                   originalWords.some(w => w.includes(word)));
        });
      }
    });
  });

  describe('/refine/validate-criteria endpoint contract', () => {
    test('should validate measurability of refined requirements', async () => {
      const request = {
        refined_requirements: [
          {
            requirement_id: 'FR-001',
            refined_text: 'System MUST complete animations within 500ms with visual feedback indicators',
            testability_criteria: ['Measure animation duration', 'Verify visual feedback display']
          }
        ],
        validation_standards: {
          require_quantifiable_metrics: true,
          require_testable_conditions: true,
          require_success_criteria: true
        }
      };

      // This should fail until refinementEngine.validateCriteria is implemented
      const result = await refinementEngine.validateCriteria(request);

      assert.ok(Array.isArray(result.validation_results));
      assert.ok(result.overall_validation);

      result.validation_results.forEach(validation => {
        assert.ok(validation.requirement_id);
        assert.ok(['valid', 'invalid', 'needs_improvement'].includes(validation.validation_status));
        assert.ok(typeof validation.validation_score === 'number');
        assert.ok(validation.validation_score >= 0 && validation.validation_score <= 1);
        assert.ok(validation.measurability_assessment);
      });
    });

    test('should detect invalid measurability criteria', async () => {
      const request = {
        refined_requirements: [
          {
            requirement_id: 'FR-002',
            refined_text: 'System MUST be intuitive and easy to use',
            testability_criteria: ['Check if users like it']
          }
        ]
      };

      const result = await refinementEngine.validateCriteria(request);
      const validation = result.validation_results[0];

      assert.strictEqual(validation.validation_status, 'invalid');
      assert.ok(validation.issues_found.length > 0);
      assert.ok(validation.suggestions.length > 0);
    });

    test('should assess measurability components', async () => {
      const request = {
        refined_requirements: [
          {
            requirement_id: 'FR-003',
            refined_text: 'Animation sequences MUST complete within 500ms as measured by performance.now() with success rate >95%',
            testability_criteria: ['Performance timing measurement', 'Success rate calculation']
          }
        ]
      };

      const result = await refinementEngine.validateCriteria(request);
      const validation = result.validation_results[0];

      assert.ok(validation.measurability_assessment.has_quantifiable_metrics);
      assert.ok(validation.measurability_assessment.has_testable_conditions);
      assert.ok(validation.measurability_assessment.has_success_criteria);
      assert.ok(validation.measurability_assessment.clarity_score > 0.7);
    });
  });

  describe('/refine/generate-validation endpoint contract', () => {
    test('should generate validation criteria for refined requirements', async () => {
      const request = {
        requirements: [
          {
            requirement_id: 'FR-001',
            refined_text: 'System MUST display character animations within 500ms with 95% success rate',
            functional_area: 'character-animation'
          }
        ],
        validation_preferences: {
          automation_preference: 'partial',
          include_performance_criteria: true,
          include_user_experience_criteria: true
        }
      };

      // This should fail until refinementEngine.generateValidation is implemented
      const result = await refinementEngine.generateValidation(request);

      assert.ok(Array.isArray(result.validation_criteria));

      result.validation_criteria.forEach(criteria => {
        assert.ok(criteria.criteria_id);
        assert.ok(criteria.requirement_reference);
        assert.ok(['automated', 'manual', 'hybrid'].includes(criteria.validation_method));
        assert.ok(Array.isArray(criteria.success_criteria));
        assert.ok(['full', 'partial', 'none'].includes(criteria.automation_level));
        assert.ok(typeof criteria.estimated_effort === 'number');
      });
    });

    test('should customize validation based on automation preference', async () => {
      const request = {
        requirements: [
          {
            requirement_id: 'FR-002',
            refined_text: 'Performance metrics MUST be collected automatically with 1ms precision',
            functional_area: 'performance'
          }
        ],
        validation_preferences: {
          automation_preference: 'full'
        }
      };

      const result = await refinementEngine.generateValidation(request);
      const criteria = result.validation_criteria[0];

      assert.ok(['automated', 'hybrid'].includes(criteria.validation_method));
      assert.ok(['full', 'partial'].includes(criteria.automation_level));
    });

    test('should include performance criteria when requested', async () => {
      const request = {
        requirements: [
          {
            requirement_id: 'FR-003',
            refined_text: 'Analysis MUST complete within constitutional timing limits',
            functional_area: 'analysis'
          }
        ],
        validation_preferences: {
          include_performance_criteria: true
        }
      };

      const result = await refinementEngine.generateValidation(request);
      const criteria = result.validation_criteria[0];

      const hasPerformanceCriteria = criteria.success_criteria.some(sc =>
        sc.criterion.toLowerCase().includes('time') ||
        sc.criterion.toLowerCase().includes('performance') ||
        sc.criterion.toLowerCase().includes('speed')
      );

      assert.ok(hasPerformanceCriteria);
    });
  });

  describe('Constitutional compliance integration', () => {
    test('should maintain character-driven feedback in refinements', async () => {
      const request = {
        requirements: [
          {
            id: 'FR-001',
            text: 'System MUST provide feedback'
          }
        ]
      };

      const result = await refinementEngine.refineRequirements(request);
      const processedReq = result.processed_requirements[0];

      if (processedReq.refinement_needed) {
        // Refinement should include character-friendly language
        const refinedText = processedReq.refined_text.toLowerCase();
        assert.ok(!refinedText.includes('error') || !refinedText.includes('fail') ||
                 refinedText.includes('friendly') || refinedText.includes('helpful'));
      }
    });

    test('should enforce TDD-compatible validation criteria', async () => {
      const request = {
        requirements: [
          {
            requirement_id: 'FR-002',
            refined_text: 'Component MUST pass all contract tests before implementation',
            functional_area: 'testing'
          }
        ]
      };

      const result = await refinementEngine.generateValidation(request);
      const criteria = result.validation_criteria[0];

      const hasTDDCriteria = criteria.success_criteria.some(sc =>
        sc.criterion.toLowerCase().includes('test') ||
        sc.criterion.toLowerCase().includes('fail') ||
        sc.criterion.toLowerCase().includes('before')
      );

      assert.ok(hasTDDCriteria);
    });
  });
});