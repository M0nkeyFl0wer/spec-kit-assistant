/**
 * Integration test for End-to-End Refinement Workflow
 * Tests the complete specification analysis, refinement, and validation pipeline
 * These tests MUST FAIL before implementation - TDD approach
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

describe('End-to-End Refinement Workflow Integration', () => {
  let testWorkspace;
  let endToEndWorkflow;

  beforeEach(async () => {
    // Create temporary test workspace
    testWorkspace = join(process.cwd(), 'temp-e2e-refinement-workspace');
    await mkdir(testWorkspace, { recursive: true });
    await mkdir(join(testWorkspace, 'specs'), { recursive: true });
    await mkdir(join(testWorkspace, 'src'), { recursive: true });
    await mkdir(join(testWorkspace, 'tests'), { recursive: true });

    // This will fail until end-to-end workflow is implemented
    const { EndToEndRefinementWorkflow } = await import('../../src/refinement/e2e-refinement-workflow.js');
    endToEndWorkflow = new EndToEndRefinementWorkflow({
      workspace: testWorkspace,
      swarmIntegration: true,
      constitutionalCompliance: true,
      characterConsistency: true
    });
  });

  afterEach(async () => {
    endToEndWorkflow = null;
    // Clean up test workspace
    await rm(testWorkspace, { recursive: true, force: true });
  });

  describe('Complete specification refinement pipeline', () => {
    test('should execute full analysis → refinement → validation → implementation guidance workflow', async () => {
      // Create initial specification with multiple issues
      const problematicSpec = `# Chat Application Feature
## User Requirements
- The app should be fast and user-friendly
- Users want to send messages easily
- The system must handle many users
- Error handling should be good
- The interface should look nice

## Technical Requirements
- Use good architecture
- Implement proper security
- Make it scalable
- Ensure performance is acceptable
- Database should be efficient

## Business Requirements
- The feature should increase user engagement
- Support should be available
- The system should be reliable
- Costs should be reasonable
- Timeline should be realistic
`;

      // Create existing implementation to analyze
      const existingImplementation = `// Existing chat implementation with issues
class ChatService {
  constructor() {
    this.messages = []; // In-memory storage - not scalable
    this.users = new Map();
  }

  async sendMessage(userId, message) {
    // No validation or security checks
    this.messages.push({
      userId: userId,
      message: message,
      timestamp: Date.now()
    });
    return true;
  }

  async getMessages() {
    // Returns all messages - performance issue
    return this.messages;
  }

  async addUser(userData) {
    // No authentication
    this.users.set(userData.id, userData);
  }
}`;

      // Create minimal tests
      const existingTests = `import { test } from 'node:test';
import { ChatService } from '../src/chat-service.js';

test('can send message', async () => {
  const chat = new ChatService();
  const result = await chat.sendMessage('user1', 'hello');
  assert.ok(result);
});`;

      await writeFile(join(testWorkspace, 'specs', 'chat-spec.md'), problematicSpec);
      await writeFile(join(testWorkspace, 'src', 'chat-service.js'), existingImplementation);
      await writeFile(join(testWorkspace, 'tests', 'chat.test.js'), existingTests);

      const workflowRequest = {
        initialSpecificationPath: join(testWorkspace, 'specs', 'chat-spec.md'),
        existingImplementationPath: join(testWorkspace, 'src'),
        existingTestsPath: join(testWorkspace, 'tests'),
        workflowOptions: {
          performFullAnalysis: true,
          refineRequirements: true,
          validateImplementation: true,
          generateImplementationPlan: true,
          enforceConstitutionalCompliance: true,
          maintainCharacterConsistency: true
        },
        outputOptions: {
          generateRefinedSpec: true,
          generateImplementationGuidance: true,
          generateTestPlan: true,
          generateRemediationReport: true
        }
      };

      const startTime = performance.now();
      const result = await endToEndWorkflow.executeWorkflow(workflowRequest);
      const executionTime = performance.now() - startTime;

      // Verify workflow completion
      assert.ok(result.workflow_execution_id);
      assert.ok(result.pipeline_results);
      assert.ok(result.refined_specification);
      assert.ok(result.implementation_guidance);
      assert.ok(result.validation_results);

      // Verify timing compliance (should complete within 10 seconds)
      assert.ok(executionTime < 10000, `E2E workflow took ${executionTime}ms, should be < 10000ms`);

      // Verify analysis phase results
      const analysisResults = result.pipeline_results.analysis_phase;
      assert.ok(analysisResults.constitutional_violations);
      assert.ok(analysisResults.ambiguous_requirements);
      assert.ok(analysisResults.coverage_gaps);

      // Should detect constitutional violations
      assert.ok(analysisResults.constitutional_violations.length > 0);
      const swarmViolation = analysisResults.constitutional_violations.find(v =>
        v.type === 'swarm-first'
      );
      assert.ok(swarmViolation, 'Should detect lack of swarm integration');

      // Should detect ambiguous requirements
      assert.ok(analysisResults.ambiguous_requirements.length >= 5);
      const ambiguousReq = analysisResults.ambiguous_requirements.find(req =>
        req.original_text.includes('fast and user-friendly')
      );
      assert.ok(ambiguousReq, 'Should detect vague performance requirement');

      // Verify refinement phase results
      const refinementResults = result.pipeline_results.refinement_phase;
      assert.ok(refinementResults.refined_requirements);
      assert.ok(refinementResults.measurability_improvements);
      assert.ok(refinementResults.constitutional_compliance_updates);

      // Should provide specific, measurable requirements
      const refinedRequirements = refinementResults.refined_requirements;
      refinedRequirements.forEach(req => {
        if (req.was_refined) {
          // Should include specific metrics
          const hasMetrics = /\d+\s*(ms|seconds|users|%|MB)/.test(req.refined_text);
          assert.ok(hasMetrics, `Refined requirement should include metrics: ${req.refined_text}`);

          // Should include testability criteria
          assert.ok(Array.isArray(req.testability_criteria));
          assert.ok(req.testability_criteria.length > 0);
        }
      });

      // Verify validation phase results
      const validationResults = result.pipeline_results.validation_phase;
      assert.ok(validationResults.implementation_gaps);
      assert.ok(validationResults.test_coverage_gaps);
      assert.ok(validationResults.security_issues);

      // Should identify implementation gaps
      assert.ok(validationResults.implementation_gaps.length > 0);
      const securityGap = validationResults.implementation_gaps.find(gap =>
        gap.description.includes('security') || gap.description.includes('authentication')
      );
      assert.ok(securityGap, 'Should identify security implementation gaps');

      // Verify implementation guidance generation
      assert.ok(result.implementation_guidance.architecture_recommendations);
      assert.ok(result.implementation_guidance.priority_order);
      assert.ok(result.implementation_guidance.constitutional_compliance_steps);

      // Should recommend swarm-first architecture
      const swarmRecommendation = result.implementation_guidance.architecture_recommendations.find(rec =>
        rec.recommendation.includes('enhanced-swarm-orchestrator') ||
        rec.recommendation.includes('swarm coordination')
      );
      assert.ok(swarmRecommendation, 'Should recommend swarm-first architecture');

      // Verify character consistency throughout
      const characterElements = [
        result.refined_specification.content,
        result.implementation_guidance.description,
        result.validation_results.summary
      ];

      characterElements.forEach(content => {
        if (content && typeof content === 'string') {
          const hasCharacterFriendlyLanguage = content.toLowerCase().includes('friendly') ||
                                             content.toLowerCase().includes('helpful') ||
                                             content.toLowerCase().includes('clear') ||
                                             content.toLowerCase().includes('supportive');

          const hasHarshLanguage = content.toLowerCase().includes('fatal') ||
                                 content.toLowerCase().includes('failed') ||
                                 content.toLowerCase().includes('error');

          // If harsh language exists, should be balanced
          if (hasHarshLanguage) {
            assert.ok(hasCharacterFriendlyLanguage,
              'Content with harsh language should include friendly balance');
          }
        }
      });
    });

    test('should handle complex multi-artifact specifications with swarm coordination', async () => {
      // Create comprehensive specification set
      const mainSpec = `# E-Commerce Platform Specification
## Overview
This platform MUST provide scalable e-commerce functionality.

## Core Features
- User management and authentication
- Product catalog management
- Shopping cart and checkout
- Payment processing
- Order management and tracking
`;

      const userManagementSpec = `# User Management Module
## Functional Requirements
- UM-001: System MUST register users with email verification
- UM-002: System MUST authenticate using OAuth 2.0 and JWT tokens
- UM-003: System MUST support role-based access control (RBAC)
- UM-004: System MUST track user activity for security auditing
`;

      const paymentSpec = `# Payment Processing Module
## Functional Requirements
- PM-001: System MUST process credit cards via Stripe API with PCI compliance
- PM-002: System MUST handle payment failures with retry logic (max 3 attempts)
- PM-003: System MUST support refunds within 30 days with audit trail
- PM-004: System MUST encrypt all payment data using AES-256
`;

      const implementationPlan = `# Implementation Plan
## Technical Context
**Language**: Node.js 18+
**Architecture**: Microservices with enhanced swarm coordination
**Database**: PostgreSQL with Redis caching
**Testing**: Jest with contract testing

## Phase 1: Foundation
- Set up swarm orchestrator integration
- Implement user authentication service
- Create database schema

## Phase 2: Core Features
- Product catalog service
- Shopping cart functionality
- Payment processing integration
`;

      await writeFile(join(testWorkspace, 'specs', 'main-spec.md'), mainSpec);
      await writeFile(join(testWorkspace, 'specs', 'user-management.md'), userManagementSpec);
      await writeFile(join(testWorkspace, 'specs', 'payment-processing.md'), paymentSpec);
      await writeFile(join(testWorkspace, 'specs', 'implementation-plan.md'), implementationPlan);

      const workflowRequest = {
        specificationArtifacts: [
          join(testWorkspace, 'specs', 'main-spec.md'),
          join(testWorkspace, 'specs', 'user-management.md'),
          join(testWorkspace, 'specs', 'payment-processing.md'),
          join(testWorkspace, 'specs', 'implementation-plan.md')
        ],
        workflowOptions: {
          useSwarmCoordination: true,
          parallelProcessing: true,
          crossArtifactAnalysis: true,
          complexityThreshold: 'HIGH'
        }
      };

      const result = await endToEndWorkflow.executeWorkflow(workflowRequest);

      // Verify swarm coordination usage
      assert.ok(result.swarm_coordination_metrics);
      assert.ok(result.swarm_coordination_metrics.agents_deployed > 1);
      assert.ok(result.swarm_coordination_metrics.parallel_tasks_executed > 1);

      // Verify cross-artifact consistency analysis
      assert.ok(result.cross_artifact_analysis);
      assert.ok(result.cross_artifact_analysis.consistency_issues);
      assert.ok(result.cross_artifact_analysis.dependency_mapping);

      // Should detect cross-module dependencies
      const dependencies = result.cross_artifact_analysis.dependency_mapping;
      assert.ok(Array.isArray(dependencies));

      const userPaymentDependency = dependencies.find(dep =>
        (dep.source_module.includes('user') && dep.target_module.includes('payment')) ||
        (dep.dependency_type === 'authentication_required')
      );
      assert.ok(userPaymentDependency, 'Should detect user authentication dependency for payments');

      // Verify complexity handling
      assert.ok(result.complexity_assessment);
      assert.ok(result.complexity_assessment.overall_complexity_score > 0.7);
      assert.ok(result.complexity_assessment.swarm_coordination_recommended);

      // Should provide module-specific guidance
      assert.ok(result.module_specific_guidance);
      assert.ok(Array.isArray(result.module_specific_guidance));

      result.module_specific_guidance.forEach(guidance => {
        assert.ok(guidance.module_name);
        assert.ok(guidance.refinement_recommendations);
        assert.ok(guidance.implementation_priority);
        assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(guidance.implementation_priority));
      });
    });

    test('should maintain constitutional compliance throughout the entire pipeline', async () => {
      const nonCompliantSpec = `# Feature with Constitutional Issues
## Requirements
- System should coordinate tasks efficiently
- Application must be fast and responsive
- Interface should provide user feedback
- Implementation must be well-tested
- Architecture should be scalable

## Technical Notes
- Create custom task coordinator for better control
- Build independent animation engine for performance
- Implement direct database access for speed
- Use custom testing framework for flexibility
- Bypass existing infrastructure for optimization
`;

      await writeFile(join(testWorkspace, 'specs', 'non-compliant-spec.md'), nonCompliantSpec);

      const workflowRequest = {
        initialSpecificationPath: join(testWorkspace, 'specs', 'non-compliant-spec.md'),
        workflowOptions: {
          enforceConstitutionalCompliance: true,
          validateSwarmFirst: true,
          validateTestFirst: true,
          validateCharacterConsistency: true,
          enforcePerformanceLimits: true,
          preventComplexityViolations: true
        }
      };

      const result = await endToEndWorkflow.executeWorkflow(workflowRequest);

      // Verify constitutional compliance enforcement
      assert.ok(result.constitutional_compliance_report);
      assert.ok(Array.isArray(result.constitutional_compliance_report.violations_detected));
      assert.ok(Array.isArray(result.constitutional_compliance_report.compliance_improvements));

      const violations = result.constitutional_compliance_report.violations_detected;
      assert.ok(violations.length >= 3, 'Should detect multiple constitutional violations');

      // Should detect swarm-first violations
      const swarmViolations = violations.filter(v =>
        v.principle === 'swarm-first' || v.description.includes('custom task coordinator')
      );
      assert.ok(swarmViolations.length > 0, 'Should detect swarm-first violations');

      // Should detect complexity violations
      const complexityViolations = violations.filter(v =>
        v.principle === 'complexity' || v.description.includes('bypass existing infrastructure')
      );
      assert.ok(complexityViolations.length > 0, 'Should detect unjustified complexity');

      // Should detect test-first violations
      const testViolations = violations.filter(v =>
        v.principle === 'test-first' || v.description.includes('custom testing framework')
      );
      assert.ok(testViolations.length > 0, 'Should detect test-first violations');

      // Verify compliance improvements
      const improvements = result.constitutional_compliance_report.compliance_improvements;
      assert.ok(improvements.length > 0);

      improvements.forEach(improvement => {
        assert.ok(improvement.violation_reference);
        assert.ok(improvement.original_requirement);
        assert.ok(improvement.compliant_refinement);
        assert.ok(improvement.constitutional_principle);

        // Improvements should reference proper constitutional alternatives
        if (improvement.constitutional_principle === 'swarm-first') {
          assert.ok(improvement.compliant_refinement.includes('enhanced-swarm-orchestrator') ||
                   improvement.compliant_refinement.includes('swarm coordination'));
        }
      });

      // Verify final specification compliance
      assert.ok(result.refined_specification);
      const finalSpecContent = result.refined_specification.content;

      // Should not contain constitutional violations
      assert.ok(!finalSpecContent.includes('custom task coordinator'));
      assert.ok(!finalSpecContent.includes('bypass existing infrastructure'));
      assert.ok(!finalSpecContent.includes('custom testing framework'));

      // Should include constitutional compliance language
      assert.ok(finalSpecContent.includes('enhanced-swarm-orchestrator') ||
               finalSpecContent.includes('swarm coordination'));

      // Verify constitutional metrics
      assert.ok(result.constitutional_compliance_report.final_compliance_score);
      assert.ok(result.constitutional_compliance_report.final_compliance_score > 0.8,
               'Final specification should have high compliance score');
    });

    test('should generate actionable implementation roadmap with test-first approach', async () => {
      const featureSpec = `# Advanced Analytics Dashboard
## Functional Requirements
- AD-001: System MUST display real-time performance metrics with <100ms update frequency
- AD-002: System MUST support custom dashboard configurations saved per user
- AD-003: System MUST export reports in PDF, Excel, and CSV formats
- AD-004: System MUST provide data visualization with interactive charts
- AD-005: System MUST implement role-based access to sensitive analytics

## Performance Requirements
- PR-001: Dashboard MUST load within 2 seconds on initial access
- PR-002: Chart rendering MUST complete within 500ms
- PR-003: Data refresh MUST not impact user interaction responsiveness
- PR-004: Export generation MUST complete within 30 seconds for large datasets

## Security Requirements
- SR-001: Data access MUST be logged for compliance auditing
- SR-002: Sensitive metrics MUST be encrypted in transit and at rest
- SR-003: User permissions MUST be validated on every data request
`;

      await writeFile(join(testWorkspace, 'specs', 'analytics-spec.md'), featureSpec);

      const workflowRequest = {
        initialSpecificationPath: join(testWorkspace, 'specs', 'analytics-spec.md'),
        workflowOptions: {
          generateImplementationRoadmap: true,
          enforceTestFirstApproach: true,
          prioritizeByComplexity: true,
          includePerformanceValidation: true,
          generateContractTests: true
        }
      };

      const result = await endToEndWorkflow.executeWorkflow(workflowRequest);

      // Verify implementation roadmap generation
      assert.ok(result.implementation_roadmap);
      assert.ok(Array.isArray(result.implementation_roadmap.phases));
      assert.ok(result.implementation_roadmap.phases.length >= 3);

      // Verify test-first approach enforcement
      const phases = result.implementation_roadmap.phases;
      phases.forEach(phase => {
        assert.ok(phase.phase_name);
        assert.ok(Array.isArray(phase.tasks));
        assert.ok(phase.estimated_duration);

        // Each phase should start with test creation
        const testTasks = phase.tasks.filter(task =>
          task.task_type === 'test_creation' ||
          task.description.includes('test') ||
          task.description.includes('TDD')
        );
        assert.ok(testTasks.length > 0, `Phase ${phase.phase_name} should include test tasks`);

        // Test tasks should come before implementation tasks
        const firstImplementationIndex = phase.tasks.findIndex(task =>
          task.task_type === 'implementation'
        );
        const firstTestIndex = phase.tasks.findIndex(task =>
          task.task_type === 'test_creation'
        );

        if (firstImplementationIndex >= 0 && firstTestIndex >= 0) {
          assert.ok(firstTestIndex < firstImplementationIndex,
                   'Test tasks should come before implementation tasks');
        }
      });

      // Verify contract test generation
      assert.ok(result.generated_contract_tests);
      assert.ok(Array.isArray(result.generated_contract_tests));

      result.generated_contract_tests.forEach(contractTest => {
        assert.ok(contractTest.requirement_reference);
        assert.ok(contractTest.test_description);
        assert.ok(contractTest.test_code_template);
        assert.ok(contractTest.expected_failure_reason);

        // Contract tests should be designed to fail initially
        assert.ok(contractTest.expected_failure_reason.includes('not implemented') ||
                 contractTest.expected_failure_reason.includes('missing'));
      });

      // Verify performance validation inclusion
      const performanceValidationTasks = phases.flatMap(phase => phase.tasks).filter(task =>
        task.description.includes('performance') ||
        task.description.includes('timing') ||
        task.description.includes('benchmark')
      );
      assert.ok(performanceValidationTasks.length >= 2, 'Should include performance validation tasks');

      // Verify complexity-based prioritization
      assert.ok(result.complexity_analysis);
      assert.ok(result.complexity_analysis.task_complexity_scores);

      const complexityScores = result.complexity_analysis.task_complexity_scores;
      assert.ok(Array.isArray(complexityScores));

      // High complexity tasks should be identified
      const highComplexityTasks = complexityScores.filter(score =>
        score.complexity_level === 'HIGH'
      );
      assert.ok(highComplexityTasks.length > 0, 'Should identify high complexity tasks');

      // Real-time metrics should be marked as high complexity
      const realTimeTask = highComplexityTasks.find(task =>
        task.task_description.includes('real-time') ||
        task.task_description.includes('100ms update')
      );
      assert.ok(realTimeTask, 'Real-time metrics should be marked as high complexity');

      // Verify implementation guidance quality
      assert.ok(result.implementation_guidance);
      assert.ok(result.implementation_guidance.architectural_decisions);
      assert.ok(result.implementation_guidance.technology_recommendations);
      assert.ok(result.implementation_guidance.risk_mitigation_strategies);

      // Should recommend swarm coordination for complex tasks
      const swarmRecommendation = result.implementation_guidance.architectural_decisions.find(decision =>
        decision.decision.includes('swarm') || decision.rationale.includes('swarm')
      );
      assert.ok(swarmRecommendation, 'Should recommend swarm coordination for complex implementation');
    });
  });

  describe('End-to-end workflow error handling and resilience', () => {
    test('should handle partial workflow failures with graceful degradation', async () => {
      const partiallyCorruptSpec = `# Partially Corrupted Specification
## Valid Requirements
- VR-001: System MUST provide user authentication
- VR-002: System MUST validate user input

## Corrupted Section
- CR-001: System MUST [CORRUPTED_DATA]
- CR-002: Invalid requirement structure without proper formatting
## Missing Headers
- Orphaned requirement without section
`;

      await writeFile(join(testWorkspace, 'specs', 'corrupted-spec.md'), partiallyCorruptSpec);

      const workflowRequest = {
        initialSpecificationPath: join(testWorkspace, 'specs', 'corrupted-spec.md'),
        workflowOptions: {
          allowPartialProcessing: true,
          recoverFromErrors: true,
          generateWarningReports: true
        }
      };

      const result = await endToEndWorkflow.executeWorkflow(workflowRequest);

      // Should complete with warnings instead of failing
      assert.ok(result.workflow_execution_id);
      assert.ok(result.partial_processing_report);
      assert.ok(Array.isArray(result.processing_warnings));

      // Should process valid requirements
      const validRequirements = result.pipeline_results.analysis_phase.processed_requirements.filter(req =>
        req.requirement_id.startsWith('VR-')
      );
      assert.ok(validRequirements.length >= 2, 'Should process valid requirements');

      // Should report issues with corrupted requirements
      const corruptionWarnings = result.processing_warnings.filter(warning =>
        warning.warning_type === 'parsing_error' ||
        warning.warning_type === 'corrupted_data'
      );
      assert.ok(corruptionWarnings.length > 0, 'Should report corruption warnings');

      // Should provide recovery suggestions
      assert.ok(result.recovery_suggestions);
      assert.ok(Array.isArray(result.recovery_suggestions));

      result.recovery_suggestions.forEach(suggestion => {
        assert.ok(suggestion.issue_description);
        assert.ok(suggestion.recommended_action);
        assert.ok(suggestion.priority);
      });
    });

    test('should validate and enforce resource limits during execution', async () => {
      const resourceIntensiveSpec = `# Resource Intensive Feature
## Performance Requirements
${Array.from({length: 50}, (_, i) => `- PR-${String(i+1).padStart(3, '0')}: System MUST handle performance requirement ${i+1}`).join('\n')}

## Functional Requirements
${Array.from({length: 100}, (_, i) => `- FR-${String(i+1).padStart(3, '0')}: System MUST implement functional requirement ${i+1}`).join('\n')}

## Security Requirements
${Array.from({length: 30}, (_, i) => `- SR-${String(i+1).padStart(3, '0')}: System MUST enforce security requirement ${i+1}`).join('\n')}
`;

      await writeFile(join(testWorkspace, 'specs', 'large-spec.md'), resourceIntensiveSpec);

      const workflowRequest = {
        initialSpecificationPath: join(testWorkspace, 'specs', 'large-spec.md'),
        workflowOptions: {
          enforceResourceLimits: true,
          maxProcessingTime: 5000, // 5 seconds
          maxRequirements: 200,
          enableResourceMonitoring: true
        }
      };

      const startTime = performance.now();
      const result = await endToEndWorkflow.executeWorkflow(workflowRequest);
      const executionTime = performance.now() - startTime;

      // Should complete within resource limits
      assert.ok(executionTime < 6000, 'Should complete within time limit with buffer');

      // Should provide resource usage metrics
      assert.ok(result.resource_usage_metrics);
      assert.ok(typeof result.resource_usage_metrics.execution_time === 'number');
      assert.ok(typeof result.resource_usage_metrics.requirements_processed === 'number');
      assert.ok(typeof result.resource_usage_metrics.peak_memory_usage === 'number');

      // Should handle large specification efficiently
      assert.ok(result.resource_usage_metrics.requirements_processed >= 150,
               'Should process significant number of requirements');

      // Should provide optimization recommendations for large specs
      if (result.resource_usage_metrics.requirements_processed > 100) {
        assert.ok(result.optimization_recommendations);
        assert.ok(Array.isArray(result.optimization_recommendations));

        const swarmRecommendation = result.optimization_recommendations.find(rec =>
          rec.recommendation.includes('swarm') || rec.recommendation.includes('parallel')
        );
        assert.ok(swarmRecommendation, 'Should recommend swarm coordination for large specifications');
      }
    });
  });
});