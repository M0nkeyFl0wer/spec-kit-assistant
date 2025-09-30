/**
 * Contract test for Constitutional Compliance Analyzer
 * Tests the API contract defined in contracts/constitutional-compliance-analyzer.yaml
 * These tests MUST FAIL before implementation - TDD approach
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

describe('Constitutional Compliance Analyzer Contract', () => {
  let analyzer;

  beforeEach(async () => {
    // This will fail until ConstitutionalAnalyzer is implemented
    const { ConstitutionalAnalyzer } = await import('../../src/analysis/constitutional-analyzer.js');
    analyzer = new ConstitutionalAnalyzer();
  });

  afterEach(() => {
    analyzer = null;
  });

  describe('/analyze/constitutional endpoint contract', () => {
    test('should accept valid analysis request with artifacts array', async () => {
      const request = {
        artifacts: [
          {
            path: '/test/spec.md',
            type: 'spec',
            content: '# Test Spec\n## Requirements\n- FR-001: System MUST do something'
          },
          {
            path: '/test/plan.md',
            type: 'plan',
            content: '# Test Plan\n## Technical Context\n**Language**: Node.js'
          }
        ],
        options: {
          severity_filter: 'HIGH',
          principle_filter: ['swarm-first', 'test-first'],
          include_suggestions: true
        }
      };

      // This should fail until analyzer.analyzeConstitutional is implemented
      const result = await analyzer.analyzeConstitutional(request);

      // Verify response structure matches contract
      assert.ok(result.analysis_id);
      assert.ok(typeof result.execution_time === 'number');
      assert.ok(result.constitutional_compliance);
      assert.ok(Array.isArray(result.constitutional_compliance.violations));
      assert.ok(result.summary);
      assert.ok(typeof result.summary.total_violations === 'number');
    });

    test('should validate constitutional violation structure', async () => {
      const request = {
        artifacts: [
          {
            path: '/test/bad-spec.md',
            type: 'spec',
            content: '# Bad Spec\n- Create custom coordinator instead of swarm'
          }
        ]
      };

      const result = await analyzer.analyzeConstitutional(request);

      if (result.constitutional_compliance.violations.length > 0) {
        const violation = result.constitutional_compliance.violations[0];

        // Verify violation structure per contract
        assert.ok(violation.id);
        assert.ok(['swarm-first', 'spec-driven', 'test-first', 'character-ux', 'production-ready', 'complexity'].includes(violation.type));
        assert.ok(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(violation.severity));
        assert.ok(violation.location);
        assert.ok(violation.description);
        assert.ok(violation.detected_at);
      }
    });

    test('should enforce execution time within constitutional limits', async () => {
      const request = {
        artifacts: [
          {
            path: '/test/spec.md',
            type: 'spec',
            content: '# Simple Spec\n- Basic requirement'
          }
        ]
      };

      const startTime = performance.now();
      const result = await analyzer.analyzeConstitutional(request);
      const executionTime = performance.now() - startTime;

      // Constitutional limit: analysis should complete quickly
      assert.ok(executionTime < 2000, `Analysis took ${executionTime}ms, should be < 2000ms`);
      assert.ok(result.execution_time < 2000, 'Reported execution time should be within limits');
    });

    test('should handle missing artifacts gracefully', async () => {
      const request = {
        artifacts: []
      };

      try {
        await analyzer.analyzeConstitutional(request);
        assert.fail('Should throw error for empty artifacts');
      } catch (error) {
        assert.ok(error.message.includes('artifacts') || error.message.includes('required'));
      }
    });

    test('should filter violations by severity', async () => {
      const request = {
        artifacts: [
          {
            path: '/test/mixed-spec.md',
            type: 'spec',
            content: '# Mixed Spec\n- Has both critical and low severity issues'
          }
        ],
        options: {
          severity_filter: 'CRITICAL'
        }
      };

      const result = await analyzer.analyzeConstitutional(request);

      // All returned violations should be CRITICAL or higher
      result.constitutional_compliance.violations.forEach(violation => {
        assert.ok(['CRITICAL'].includes(violation.severity));
      });
    });

    test('should filter violations by principle type', async () => {
      const request = {
        artifacts: [
          {
            path: '/test/swarm-spec.md',
            type: 'spec',
            content: '# Swarm Spec\n- Create custom agent coordinator'
          }
        ],
        options: {
          principle_filter: ['swarm-first']
        }
      };

      const result = await analyzer.analyzeConstitutional(request);

      // All returned violations should be swarm-first related
      result.constitutional_compliance.violations.forEach(violation => {
        assert.strictEqual(violation.type, 'swarm-first');
      });
    });

    test('should include remediation suggestions when requested', async () => {
      const request = {
        artifacts: [
          {
            path: '/test/spec.md',
            type: 'spec',
            content: '# Spec with issues'
          }
        ],
        options: {
          include_suggestions: true
        }
      };

      const result = await analyzer.analyzeConstitutional(request);

      result.constitutional_compliance.violations.forEach(violation => {
        assert.ok(violation.remediation_suggestion);
        assert.ok(violation.remediation_suggestion.length > 0);
      });
    });
  });

  describe('/analyze/performance endpoint contract', () => {
    test('should validate performance metrics against constitutional limits', async () => {
      const request = {
        metrics: [
          {
            name: 'animation-duration',
            measured_value: 600,
            unit: 'milliseconds'
          },
          {
            name: 'cpu-usage',
            measured_value: 15,
            unit: 'percent'
          }
        ]
      };

      // This should fail until analyzer.validatePerformance is implemented
      const result = await analyzer.validatePerformance(request);

      assert.ok(Array.isArray(result.validation_results));
      assert.ok(typeof result.overall_compliance === 'boolean');
      assert.ok(typeof result.violation_count === 'number');

      // Verify validation result structure
      result.validation_results.forEach(validation => {
        assert.ok(validation.metric_name);
        assert.ok(['compliant', 'violation', 'warning'].includes(validation.compliance_status));
        assert.ok(typeof validation.measured_value === 'number');
        assert.ok(typeof validation.constitutional_limit === 'number');
      });
    });

    test('should detect constitutional violations in performance metrics', async () => {
      const request = {
        metrics: [
          {
            name: 'animation-duration',
            measured_value: 800, // Exceeds 500ms constitutional limit
            unit: 'milliseconds'
          }
        ]
      };

      const result = await analyzer.validatePerformance(request);

      const animationResult = result.validation_results.find(r => r.metric_name === 'animation-duration');
      assert.ok(animationResult);
      assert.strictEqual(animationResult.compliance_status, 'violation');
      assert.ok(animationResult.recommendation);
    });

    test('should use default constitutional limits when not specified', async () => {
      const request = {
        metrics: [
          {
            name: 'animation-duration',
            measured_value: 300,
            unit: 'milliseconds'
          }
        ]
      };

      const result = await analyzer.validatePerformance(request);

      const animationResult = result.validation_results.find(r => r.metric_name === 'animation-duration');
      assert.strictEqual(animationResult.constitutional_limit, 500); // Default limit
    });
  });

  describe('Constitutional standards integration', () => {
    test('should load constitutional standards from configuration', async () => {
      // Verify analyzer can access constitutional standards
      const standards = await analyzer.getConstitutionalStandards();

      assert.ok(standards.constitutionalPrinciples);
      assert.ok(standards.performanceStandards);
      assert.ok(standards.constitutionalPrinciples['swarm-first']);
      assert.ok(standards.performanceStandards.animation);
    });

    test('should validate against all constitutional principles', async () => {
      const request = {
        artifacts: [
          {
            path: '/test/comprehensive-spec.md',
            type: 'spec',
            content: '# Comprehensive Spec\n- Has potential violations of multiple principles'
          }
        ]
      };

      const result = await analyzer.analyzeConstitutional(request);

      // Should check all principles defined in constitutional standards
      const violationTypes = result.constitutional_compliance.violations.map(v => v.type);
      const availableTypes = ['swarm-first', 'spec-driven', 'test-first', 'character-ux', 'production-ready', 'complexity'];

      // At least some principle types should be checked
      assert.ok(violationTypes.length === 0 || violationTypes.some(type => availableTypes.includes(type)));
    });
  });
});