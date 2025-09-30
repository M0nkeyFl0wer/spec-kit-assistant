/**
 * Integration test for Requirement Refinement Workflow
 * Tests the complete end-to-end requirement refinement and validation process
 * These tests MUST FAIL before implementation - TDD approach
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

describe('Requirement Refinement Workflow Integration', () => {
  let testWorkspace;
  let refinementWorkflow;

  beforeEach(async () => {
    // Create temporary test workspace
    testWorkspace = join(process.cwd(), 'temp-refinement-workspace');
    await mkdir(testWorkspace, { recursive: true });

    // This will fail until refinement workflow is implemented
    const { RequirementRefinementWorkflow } = await import('../../src/refinement/refinement-workflow.js');
    refinementWorkflow = new RequirementRefinementWorkflow({
      workspace: testWorkspace,
      constitutionalCompliance: true,
      characterConsistency: true
    });
  });

  afterEach(async () => {
    refinementWorkflow = null;
    // Clean up test workspace
    await rm(testWorkspace, { recursive: true, force: true });
  });

  describe('End-to-end requirement refinement workflow', () => {
    test('should identify ambiguous requirements and provide concrete refinements', async () => {
      const ambiguousSpec = `# Feature with Ambiguous Requirements
## Functional Requirements
- FR-001: System MUST be fast and responsive
- FR-002: Application MUST provide good user experience
- FR-003: Platform MUST be scalable and efficient
- FR-004: Interface MUST be intuitive and user-friendly
- FR-005: System MUST handle errors gracefully

## Performance Requirements
- PR-001: Response time MUST be acceptable
- PR-002: Memory usage MUST be reasonable
- PR-003: CPU utilization MUST be optimized
`;

      await writeFile(join(testWorkspace, 'ambiguous-spec.md'), ambiguousSpec);

      const refinementRequest = {
        specificationPath: join(testWorkspace, 'ambiguous-spec.md'),
        refinementOptions: {
          focusAreas: ['ambiguity', 'measurability', 'testability'],
          preserveIntent: true,
          includeValidationCriteria: true,
          enforceConstitutionalLimits: true
        }
      };

      const startTime = performance.now();
      const result = await refinementWorkflow.executeRefinement(refinementRequest);
      const executionTime = performance.now() - startTime;

      // Verify workflow execution
      assert.ok(result.refinement_session_id);
      assert.ok(result.original_requirements);
      assert.ok(result.refined_requirements);
      assert.ok(result.refinement_summary);

      // Verify timing compliance (constitutional limit: 500ms)
      assert.ok(executionTime < 1000, `Refinement took ${executionTime}ms, should be < 1000ms`);

      // Verify ambiguity detection
      assert.ok(result.original_requirements.length >= 8); // Should capture all requirements

      const ambiguousRequirements = result.original_requirements.filter(req =>
        req.refinement_needed === true
      );
      assert.ok(ambiguousRequirements.length >= 5, 'Should identify multiple ambiguous requirements');

      // Verify specific refinements
      const fastRequirement = result.refined_requirements.find(req =>
        req.original_text.includes('fast and responsive')
      );
      assert.ok(fastRequirement);
      assert.ok(fastRequirement.refined_text);
      assert.ok(fastRequirement.refined_text.includes('milliseconds') ||
               fastRequirement.refined_text.includes('seconds'));
      assert.ok(Array.isArray(fastRequirement.testability_criteria));
      assert.ok(fastRequirement.testability_criteria.length > 0);

      // Verify measurability improvements
      const performanceReq = result.refined_requirements.find(req =>
        req.original_text.includes('acceptable')
      );
      assert.ok(performanceReq);
      assert.ok(performanceReq.measurability_validation);
      assert.ok(performanceReq.measurability_validation.has_quantifiable_metrics);
    });

    test('should maintain character consistency during refinement process', async () => {
      const characterUxSpec = `# Character-Driven Feature
## User Experience Requirements
- UX-001: System MUST provide feedback to users
- UX-002: Error handling MUST be implemented
- UX-003: Success messages MUST be displayed
- UX-004: User guidance MUST be available
- UX-005: Help system MUST be accessible

## Interaction Requirements
- IR-001: User actions MUST receive responses
- IR-002: System state MUST be communicated
- IR-003: Progress indicators MUST be shown
`;

      await writeFile(join(testWorkspace, 'character-spec.md'), characterUxSpec);

      const refinementRequest = {
        specificationPath: join(testWorkspace, 'character-spec.md'),
        refinementOptions: {
          maintainCharacterConsistency: true,
          characterProfile: 'spec-golden-retriever',
          friendlyLanguage: true,
          avoidNegativeLanguage: true
        }
      };

      const result = await refinementWorkflow.executeRefinement(refinementRequest);

      // Verify character consistency in refinements
      const refinedRequirements = result.refined_requirements;

      refinedRequirements.forEach(req => {
        if (req.refinement_needed) {
          const refinedText = req.refined_text.toLowerCase();

          // Should include friendly, encouraging language
          const hasFriendlyLanguage = refinedText.includes('friendly') ||
                                    refinedText.includes('helpful') ||
                                    refinedText.includes('encouraging') ||
                                    refinedText.includes('clear') ||
                                    refinedText.includes('supportive');

          // Should avoid harsh technical language
          const hasHarshLanguage = refinedText.includes('error') ||
                                 refinedText.includes('fail') ||
                                 refinedText.includes('invalid') ||
                                 refinedText.includes('denied');

          if (hasHarshLanguage) {
            // If harsh language is necessary, should be balanced with friendly context
            const hasBalancingLanguage = refinedText.includes('guidance') ||
                                       refinedText.includes('help') ||
                                       refinedText.includes('support');
            assert.ok(hasBalancingLanguage,
              `Requirement "${req.refined_text}" has harsh language without friendly balance`);
          }
        }
      });

      // Verify character guidance in refinement rationale
      const characterRefinements = refinedRequirements.filter(req =>
        req.clarification_rationale &&
        req.clarification_rationale.includes('character') ||
        req.clarification_rationale.includes('friendly')
      );
      assert.ok(characterRefinements.length > 0, 'Should include character-driven refinement guidance');
    });

    test('should enforce constitutional timing limits during refinement', async () => {
      const performanceSpec = `# Performance-Critical Feature
## Timing Requirements
- TM-001: User interface MUST respond quickly
- TM-002: Data processing MUST be efficient
- TM-003: Animation MUST be smooth
- TM-004: Loading times MUST be optimized
- TM-005: Background tasks MUST not impact performance

## Quality Requirements
- QR-001: System MUST be reliable
- QR-002: Operations MUST be consistent
- QR-003: Resource usage MUST be controlled
`;

      await writeFile(join(testWorkspace, 'performance-spec.md'), performanceSpec);

      const refinementRequest = {
        specificationPath: join(testWorkspace, 'performance-spec.md'),
        refinementOptions: {
          enforceConstitutionalLimits: true,
          includePerformanceCriteria: true,
          validateTimingCompliance: true
        }
      };

      const result = await refinementWorkflow.executeRefinement(refinementRequest);

      // Verify constitutional timing limits are applied
      const timingRequirements = result.refined_requirements.filter(req =>
        req.original_text.includes('quick') ||
        req.original_text.includes('efficient') ||
        req.original_text.includes('smooth') ||
        req.original_text.includes('optimized')
      );

      assert.ok(timingRequirements.length > 0);

      timingRequirements.forEach(req => {
        if (req.refinement_needed) {
          const refinedText = req.refined_text;

          // Should include specific timing values
          const hasTimingValue = /\d+\s*(ms|milliseconds|seconds|s)/.test(refinedText);
          assert.ok(hasTimingValue,
            `Timing requirement "${refinedText}" should include specific timing values`);

          // Timing values should respect constitutional limits
          if (refinedText.includes('animation')) {
            const hasConstitutionalLimit = refinedText.includes('500') &&
                                         refinedText.includes('ms');
            assert.ok(hasConstitutionalLimit,
              'Animation requirements should reference 500ms constitutional limit');
          }
        }
      });

      // Verify constitutional compliance validation
      assert.ok(result.constitutional_validation);
      assert.ok(Array.isArray(result.constitutional_validation.timing_compliance));

      result.constitutional_validation.timing_compliance.forEach(validation => {
        assert.ok(validation.requirement_id);
        assert.ok(typeof validation.specified_limit === 'number');
        assert.ok(typeof validation.constitutional_limit === 'number');
        assert.ok(['compliant', 'violation', 'adjusted'].includes(validation.status));
      });
    });

    test('should integrate with swarm orchestrator for complex refinement tasks', async () => {
      const complexSpec = `# Complex Multi-Domain Feature
## Authentication Requirements
- AU-001: User authentication MUST be secure
- AU-002: Session management MUST be reliable
- AU-003: Password policies MUST be enforced
- AU-004: Multi-factor authentication MUST be supported

## Data Management Requirements
- DM-001: Data validation MUST be comprehensive
- DM-002: Data storage MUST be efficient
- DM-003: Data retrieval MUST be fast
- DM-004: Data backup MUST be automated

## Integration Requirements
- IN-001: API endpoints MUST be documented
- IN-002: Service communication MUST be secure
- IN-003: Error handling MUST be consistent
- IN-004: Monitoring MUST be comprehensive

## Performance Requirements
- PF-001: System scalability MUST handle growth
- PF-002: Resource optimization MUST be continuous
- PF-003: Performance monitoring MUST be real-time
`;

      await writeFile(join(testWorkspace, 'complex-spec.md'), complexSpec);

      const refinementRequest = {
        specificationPath: join(testWorkspace, 'complex-spec.md'),
        refinementOptions: {
          useSwarmCoordination: true,
          parallelRefinement: true,
          complexityThreshold: 'HIGH',
          domainSpecialization: true
        }
      };

      const result = await refinementWorkflow.executeRefinement(refinementRequest);

      // Verify swarm coordination was used
      assert.ok(result.swarm_coordination_used);
      assert.ok(result.parallel_refinement_results);

      // Verify domain-specific refinements
      assert.ok(result.domain_analysis);
      assert.ok(Array.isArray(result.domain_analysis.identified_domains));

      const expectedDomains = ['authentication', 'data-management', 'integration', 'performance'];
      expectedDomains.forEach(domain => {
        const domainFound = result.domain_analysis.identified_domains.some(d =>
          d.domain_name.toLowerCase().includes(domain)
        );
        assert.ok(domainFound, `Should identify ${domain} domain`);
      });

      // Verify parallel refinement quality
      assert.ok(result.refinement_summary.parallel_efficiency > 0.7);
      assert.ok(typeof result.refinement_summary.total_refinement_time === 'number');
      assert.ok(result.refinement_summary.total_refinement_time < 2000); // Should be efficient
    });

    test('should validate refined requirements against constitutional principles', async () => {
      const constitutionalSpec = `# Feature Requiring Constitutional Validation
## Architecture Requirements
- AR-001: Task coordination MUST be implemented
- AR-002: Component communication MUST be established
- AR-003: Service orchestration MUST be configured

## Development Requirements
- DR-001: Implementation approach MUST be planned
- DR-002: Testing strategy MUST be defined
- DR-003: Code quality MUST be maintained

## User Experience Requirements
- UX-001: Interface design MUST be considered
- UX-002: User feedback MUST be collected
- UX-003: Character consistency MUST be maintained
`;

      await writeFile(join(testWorkspace, 'constitutional-spec.md'), constitutionalSpec);

      const refinementRequest = {
        specificationPath: join(testWorkspace, 'constitutional-spec.md'),
        refinementOptions: {
          validateConstitutionalCompliance: true,
          enforceSwarmFirst: true,
          enforceTestFirst: true,
          enforceCharacterConsistency: true
        }
      };

      const result = await refinementWorkflow.executeRefinement(refinementRequest);

      // Verify constitutional compliance validation
      assert.ok(result.constitutional_validation);
      assert.ok(Array.isArray(result.constitutional_validation.principle_compliance));

      // Check swarm-first enforcement
      const swarmCompliance = result.constitutional_validation.principle_compliance.find(p =>
        p.principle === 'swarm-first'
      );
      assert.ok(swarmCompliance);

      // Architecture requirements should reference swarm orchestrator
      const architectureRefinements = result.refined_requirements.filter(req =>
        req.requirement_id.startsWith('AR-')
      );

      const swarmReferences = architectureRefinements.filter(req =>
        req.refined_text && (
          req.refined_text.includes('enhanced-swarm-orchestrator') ||
          req.refined_text.includes('swarm coordination') ||
          req.refined_text.includes('swarm-based')
        )
      );
      assert.ok(swarmReferences.length > 0, 'Architecture requirements should reference swarm orchestrator');

      // Check test-first enforcement
      const testCompliance = result.constitutional_validation.principle_compliance.find(p =>
        p.principle === 'test-first'
      );
      assert.ok(testCompliance);

      // Development requirements should include test-first language
      const developmentRefinements = result.refined_requirements.filter(req =>
        req.requirement_id.startsWith('DR-')
      );

      const testFirstReferences = developmentRefinements.filter(req =>
        req.refined_text && (
          req.refined_text.includes('test-driven') ||
          req.refined_text.includes('TDD') ||
          req.refined_text.includes('tests before implementation')
        )
      );
      assert.ok(testFirstReferences.length > 0, 'Development requirements should reference test-first approach');
    });

    test('should generate measurable validation criteria for all refinements', async () => {
      const unmeasurableSpec = `# Feature with Unmeasurable Requirements
## Quality Requirements
- QR-001: System MUST be robust
- QR-002: Application MUST be maintainable
- QR-003: Code MUST be clean
- QR-004: Documentation MUST be comprehensive

## User Experience Requirements
- UX-001: Interface MUST be intuitive
- UX-002: Navigation MUST be easy
- UX-003: Content MUST be accessible
- UX-004: Design MUST be appealing
`;

      await writeFile(join(testWorkspace, 'unmeasurable-spec.md'), unmeasurableSpec);

      const refinementRequest = {
        specificationPath: join(testWorkspace, 'unmeasurable-spec.md'),
        refinementOptions: {
          generateMeasurableCriteria: true,
          includeValidationMethods: true,
          requireQuantifiableMetrics: true
        }
      };

      const result = await refinementWorkflow.executeRefinement(refinementRequest);

      // All requirements should be refined to be measurable
      const unmeasurableCount = result.refined_requirements.filter(req =>
        !req.measurability_validation ||
        !req.measurability_validation.has_quantifiable_metrics
      ).length;

      assert.strictEqual(unmeasurableCount, 0, 'All requirements should be refined to be measurable');

      // Verify validation criteria generation
      result.refined_requirements.forEach(req => {
        if (req.refinement_needed) {
          assert.ok(Array.isArray(req.testability_criteria));
          assert.ok(req.testability_criteria.length > 0);

          // Each criterion should be specific and actionable
          req.testability_criteria.forEach(criterion => {
            assert.ok(criterion.length > 10, 'Criteria should be descriptive');
            assert.ok(!criterion.includes('good') && !criterion.includes('reasonable'));
          });

          // Should include measurable elements
          assert.ok(req.measurability_validation);
          assert.ok(req.measurability_validation.has_quantifiable_metrics);
          assert.ok(req.measurability_validation.has_testable_conditions);
          assert.ok(req.measurability_validation.has_success_criteria);
          assert.ok(req.measurability_validation.clarity_score >= 0.7);
        }
      });

      // Verify validation method suggestions
      assert.ok(result.validation_methods);
      assert.ok(Array.isArray(result.validation_methods.suggested_approaches));

      result.validation_methods.suggested_approaches.forEach(approach => {
        assert.ok(approach.method_name);
        assert.ok(approach.applicable_requirements);
        assert.ok(['automated', 'manual', 'hybrid'].includes(approach.validation_type));
        assert.ok(typeof approach.estimated_effort === 'number');
      });
    });
  });

  describe('Refinement workflow error handling and edge cases', () => {
    test('should handle specifications with no refinement needed', async () => {
      const wellDefinedSpec = `# Well-Defined Feature Specification
## Functional Requirements
- FR-001: System MUST authenticate users using OAuth 2.0 with 99.9% availability
- FR-002: Application MUST display character animations within 500ms using enhanced-swarm-orchestrator.js
- FR-003: Platform MUST process user input with <100ms response time and friendly error messages

## Performance Requirements
- PR-001: Memory usage MUST not exceed 50MB during normal operation
- PR-002: CPU utilization MUST remain below 10% during idle state
- PR-003: Network requests MUST timeout after 30 seconds maximum
`;

      await writeFile(join(testWorkspace, 'well-defined-spec.md'), wellDefinedSpec);

      const refinementRequest = {
        specificationPath: join(testWorkspace, 'well-defined-spec.md'),
        refinementOptions: {
          strictValidation: true,
          requireRefinement: false
        }
      };

      const result = await refinementWorkflow.executeRefinement(refinementRequest);

      // Should complete successfully
      assert.ok(result.refinement_session_id);

      // Should indicate minimal refinement needed
      const requirementsNeedingRefinement = result.original_requirements.filter(req =>
        req.refinement_needed === true
      );
      assert.ok(requirementsNeedingRefinement.length <= 1, 'Well-defined spec should need minimal refinement');

      // Should provide validation of existing quality
      assert.ok(result.quality_assessment);
      assert.ok(result.quality_assessment.overall_quality_score > 0.8);
    });

    test('should handle malformed requirement syntax gracefully', async () => {
      const malformedSpec = `# Specification with Syntax Issues
## Requirements
- FR-001 System MUST (missing colon)
- FR-002: MUST provide functionality (missing subject)
- FR-003: System SHOULD maybe do something (vague modal verb)
-: Missing requirement ID
## Missing Section Headers
- Orphaned requirement without proper section
`;

      await writeFile(join(testWorkspace, 'malformed-spec.md'), malformedSpec);

      const refinementRequest = {
        specificationPath: join(testWorkspace, 'malformed-spec.md'),
        refinementOptions: {
          fixSyntaxIssues: true,
          tolerateParsingErrors: true
        }
      };

      const result = await refinementWorkflow.executeRefinement(refinementRequest);

      // Should complete with warnings
      assert.ok(result.refinement_session_id);
      assert.ok(result.parsing_warnings);
      assert.ok(result.parsing_warnings.length > 0);

      // Should provide syntax corrections
      assert.ok(result.syntax_corrections);
      result.syntax_corrections.forEach(correction => {
        assert.ok(correction.issue_type);
        assert.ok(correction.original_text);
        assert.ok(correction.suggested_fix);
      });

      // Should still attempt refinement where possible
      assert.ok(result.refined_requirements.length > 0);
    });
  });
});