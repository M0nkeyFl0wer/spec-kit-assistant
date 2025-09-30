/**
 * Integration test for Constitutional Analysis Workflow
 * Tests the complete end-to-end constitutional compliance analysis process
 * These tests MUST FAIL before implementation - TDD approach
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

describe('Constitutional Analysis Workflow Integration', () => {
  let testWorkspace;
  let workflowOrchestrator;

  beforeEach(async () => {
    // Create temporary test workspace
    testWorkspace = join(process.cwd(), 'temp-test-workspace');
    await mkdir(testWorkspace, { recursive: true });

    // This will fail until workflow orchestrator is implemented
    const { ConstitutionalAnalysisWorkflow } = await import('../../src/analysis/constitutional-workflow.js');
    workflowOrchestrator = new ConstitutionalAnalysisWorkflow({
      workspace: testWorkspace,
      swarmIntegration: true
    });
  });

  afterEach(async () => {
    workflowOrchestrator = null;
    // Clean up test workspace
    await rm(testWorkspace, { recursive: true, force: true });
  });

  describe('End-to-end constitutional analysis workflow', () => {
    test('should analyze specification artifacts and generate constitutional compliance report', async () => {
      // Setup test artifacts
      const specContent = `# Test Feature Specification
## Functional Requirements
- FR-001: System MUST provide user authentication using swarm coordination
- FR-002: System MUST display animations within 500ms
- FR-003: System MUST provide friendly error messages consistent with Spec personality

## Technical Requirements
- TR-001: Implementation MUST use enhanced-swarm-orchestrator.js
- TR-002: All user interactions MUST maintain character consistency
`;

      const planContent = `# Implementation Plan
## Technical Context
**Language**: Node.js 18+
**Architecture**: Custom task coordinator (VIOLATION: should use swarm-first)

## Implementation Strategy
- Create custom authentication service
- Build independent animation system
- Implement direct error handling

## Dependencies
- Custom coordination library
- Independent animation framework
`;

      await writeFile(join(testWorkspace, 'spec.md'), specContent);
      await writeFile(join(testWorkspace, 'plan.md'), planContent);

      // Execute workflow
      const analysisRequest = {
        artifactPaths: [
          join(testWorkspace, 'spec.md'),
          join(testWorkspace, 'plan.md')
        ],
        options: {
          includeRemediation: true,
          enforceTiming: true,
          generateReport: true
        }
      };

      const startTime = performance.now();
      const result = await workflowOrchestrator.executeAnalysis(analysisRequest);
      const executionTime = performance.now() - startTime;

      // Verify workflow execution
      assert.ok(result.workflow_id);
      assert.ok(result.analysis_results);
      assert.ok(result.constitutional_report);
      assert.ok(typeof result.execution_summary.total_violations === 'number');

      // Verify timing compliance
      assert.ok(executionTime < 5000, `Workflow took ${executionTime}ms, should be < 5000ms`);

      // Verify constitutional violations detected
      assert.ok(result.analysis_results.constitutional_violations.length > 0);

      const swarmViolation = result.analysis_results.constitutional_violations.find(v =>
        v.type === 'swarm-first'
      );
      assert.ok(swarmViolation, 'Should detect swarm-first violation in plan.md');
      assert.strictEqual(swarmViolation.severity, 'CRITICAL');

      // Verify report generation
      assert.ok(result.constitutional_report.report_content);
      assert.ok(result.constitutional_report.remediation_plan);
    });

    test('should integrate with enhanced swarm orchestrator for complex analysis', async () => {
      const complexSpecContent = `# Complex Multi-Component Feature
## Functional Requirements
- FR-001: System MUST coordinate 15+ microservices
- FR-002: System MUST handle 1000+ concurrent users
- FR-003: System MUST maintain <100ms response times
- FR-004: System MUST provide real-time monitoring
- FR-005: System MUST ensure data consistency across services

## Performance Requirements
- PR-001: Animation sequences MUST complete within 500ms
- PR-002: Analysis operations MUST complete within 100ms
- PR-003: Memory usage MUST stay below 50MB
`;

      await writeFile(join(testWorkspace, 'complex-spec.md'), complexSpecContent);

      const analysisRequest = {
        artifactPaths: [join(testWorkspace, 'complex-spec.md')],
        options: {
          useSwarmCoordination: true,
          parallelAnalysis: true,
          complexityThreshold: 'HIGH'
        }
      };

      // This should trigger swarm coordination for complex analysis
      const result = await workflowOrchestrator.executeAnalysis(analysisRequest);

      // Verify swarm integration
      assert.ok(result.swarm_coordination_used);
      assert.ok(result.parallel_analysis_results);
      assert.ok(typeof result.complexity_score === 'number');
      assert.ok(result.complexity_score > 0.7); // Should be marked as complex

      // Verify performance analysis
      const performanceViolations = result.analysis_results.performance_violations;
      assert.ok(Array.isArray(performanceViolations));
    });

    test('should handle missing constitutional standards gracefully', async () => {
      // Test with minimal artifacts
      const minimalSpec = `# Minimal Spec\n- Basic requirement without constitutional context`;
      await writeFile(join(testWorkspace, 'minimal.md'), minimalSpec);

      const analysisRequest = {
        artifactPaths: [join(testWorkspace, 'minimal.md')],
        options: {
          strict: false,
          allowPartialAnalysis: true
        }
      };

      const result = await workflowOrchestrator.executeAnalysis(analysisRequest);

      // Should complete without errors
      assert.ok(result.workflow_id);
      assert.ok(result.analysis_results);

      // Should provide guidance for missing standards
      assert.ok(result.analysis_results.recommendations);
      assert.ok(result.analysis_results.recommendations.length > 0);

      const constitutionalGuidance = result.analysis_results.recommendations.find(r =>
        r.type === 'constitutional_guidance'
      );
      assert.ok(constitutionalGuidance);
    });

    test('should validate character consistency across multiple artifacts', async () => {
      const specWithCharacter = `# Character-Focused Feature
## User Experience Requirements
- UX-001: System MUST provide friendly, helpful feedback
- UX-002: Error messages MUST be encouraging, not discouraging
- UX-003: Success messages MUST be celebratory but not cringe
`;

      const badImplementationPlan = `# Implementation Plan
## Error Handling Strategy
- Display "FATAL ERROR" messages
- Show "SYSTEM FAILURE" notifications
- Use "INVALID INPUT" warnings
- Implement "OPERATION DENIED" responses
`;

      await writeFile(join(testWorkspace, 'character-spec.md'), specWithCharacter);
      await writeFile(join(testWorkspace, 'bad-plan.md'), badImplementationPlan);

      const analysisRequest = {
        artifactPaths: [
          join(testWorkspace, 'character-spec.md'),
          join(testWorkspace, 'bad-plan.md')
        ],
        options: {
          validateCharacterConsistency: true,
          characterProfile: 'spec-golden-retriever'
        }
      };

      const result = await workflowOrchestrator.executeAnalysis(analysisRequest);

      // Should detect character consistency violations
      const characterViolations = result.analysis_results.constitutional_violations.filter(v =>
        v.type === 'character-ux'
      );

      assert.ok(characterViolations.length > 0);

      const violation = characterViolations[0];
      assert.ok(violation.description.includes('friendly') || violation.description.includes('encouraging'));
      assert.ok(violation.remediation_suggestion);
      assert.ok(violation.remediation_suggestion.includes('Golden Retriever') ||
               violation.remediation_suggestion.includes('friendly'));
    });

    test('should measure and enforce constitutional timing limits', async () => {
      const performanceSpec = `# Performance-Critical Feature
## Timing Requirements
- TM-001: Animation feedback MUST appear within 500ms
- TM-002: Constitutional analysis MUST complete within 100ms
- TM-003: User response MUST be provided within 1000ms
`;

      await writeFile(join(testWorkspace, 'timing-spec.md'), performanceSpec);

      const analysisRequest = {
        artifactPaths: [join(testWorkspace, 'timing-spec.md')],
        options: {
          enforceTimingLimits: true,
          measurePerformance: true
        }
      };

      const startTime = performance.now();
      const result = await workflowOrchestrator.executeAnalysis(analysisRequest);
      const totalTime = performance.now() - startTime;

      // Verify timing compliance for analysis itself
      assert.ok(result.performance_metrics);
      assert.ok(typeof result.performance_metrics.analysis_time === 'number');

      // Analysis should respect its own timing limits
      assert.ok(result.performance_metrics.analysis_time < 2000,
               `Analysis time ${result.performance_metrics.analysis_time}ms should be < 2000ms`);

      // Should validate timing requirements in specification
      const timingValidations = result.analysis_results.timing_validations;
      assert.ok(Array.isArray(timingValidations));

      timingValidations.forEach(validation => {
        assert.ok(validation.requirement_id);
        assert.ok(typeof validation.specified_limit === 'number');
        assert.ok(typeof validation.constitutional_limit === 'number');
        assert.ok(['compliant', 'violation', 'warning'].includes(validation.compliance_status));
      });
    });

    test('should generate actionable remediation plans with swarm integration', async () => {
      const problematicSpec = `# Problematic Feature Specification
## Architecture Decisions
- Create custom microservice coordinator
- Build independent animation engine
- Implement proprietary testing framework
- Design custom authentication system

## Implementation Notes
- Bypass existing swarm infrastructure
- Avoid constitutional compliance checking
- Skip test-first development
- Minimize character interaction feedback
`;

      await writeFile(join(testWorkspace, 'problematic-spec.md'), problematicSpec);

      const analysisRequest = {
        artifactPaths: [join(testWorkspace, 'problematic-spec.md')],
        options: {
          generateRemediationPlan: true,
          includeSwarmGuidance: true,
          prioritizeViolations: true
        }
      };

      const result = await workflowOrchestrator.executeAnalysis(analysisRequest);

      // Should detect multiple constitutional violations
      assert.ok(result.analysis_results.constitutional_violations.length >= 3);

      // Should generate comprehensive remediation plan
      assert.ok(result.remediation_plan);
      assert.ok(Array.isArray(result.remediation_plan.prioritized_actions));

      // Should include swarm-specific guidance
      const swarmAction = result.remediation_plan.prioritized_actions.find(action =>
        action.description.includes('enhanced-swarm-orchestrator') ||
        action.description.includes('swarm coordination')
      );
      assert.ok(swarmAction, 'Should include swarm orchestrator guidance');
      assert.strictEqual(swarmAction.priority, 'CRITICAL');

      // Should provide specific implementation guidance
      result.remediation_plan.prioritized_actions.forEach(action => {
        assert.ok(action.violation_reference);
        assert.ok(action.description);
        assert.ok(action.implementation_guidance);
        assert.ok(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(action.priority));
        assert.ok(typeof action.estimated_effort_hours === 'number');
      });

      // Total estimated effort should be reasonable
      const totalEffort = result.remediation_plan.prioritized_actions.reduce(
        (sum, action) => sum + action.estimated_effort_hours, 0
      );
      assert.ok(totalEffort > 0 && totalEffort < 100, 'Total effort should be reasonable');
    });
  });

  describe('Workflow error handling and recovery', () => {
    test('should handle malformed specification artifacts gracefully', async () => {
      const malformedSpec = `# Incomplete Spec
## Requirements
- FR-001: System MUST
- Invalid requirement without completion
## Technical Context
**Language**:
**Dependencies**:
`;

      await writeFile(join(testWorkspace, 'malformed.md'), malformedSpec);

      const analysisRequest = {
        artifactPaths: [join(testWorkspace, 'malformed.md')],
        options: {
          strictValidation: false,
          recoverFromErrors: true
        }
      };

      const result = await workflowOrchestrator.executeAnalysis(analysisRequest);

      // Should complete despite malformed input
      assert.ok(result.workflow_id);
      assert.ok(result.analysis_results);

      // Should report parsing issues
      assert.ok(result.parsing_warnings);
      assert.ok(result.parsing_warnings.length > 0);

      // Should provide guidance for improvement
      assert.ok(result.improvement_suggestions);
    });

    test('should handle missing artifact files with clear error messages', async () => {
      const analysisRequest = {
        artifactPaths: [
          join(testWorkspace, 'nonexistent-spec.md'),
          join(testWorkspace, 'missing-plan.md')
        ],
        options: {
          failOnMissingFiles: false
        }
      };

      const result = await workflowOrchestrator.executeAnalysis(analysisRequest);

      // Should complete with warnings
      assert.ok(result.workflow_id);
      assert.ok(result.file_access_warnings);
      assert.strictEqual(result.file_access_warnings.length, 2);

      result.file_access_warnings.forEach(warning => {
        assert.ok(warning.file_path);
        assert.ok(warning.error_type);
        assert.ok(warning.suggestion);
      });
    });
  });
});