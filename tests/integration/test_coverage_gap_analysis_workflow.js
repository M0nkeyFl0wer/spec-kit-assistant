/**
 * Integration test for Coverage Gap Analysis Workflow
 * Tests the complete end-to-end coverage gap detection and analysis process
 * These tests MUST FAIL before implementation - TDD approach
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

describe('Coverage Gap Analysis Workflow Integration', () => {
  let testWorkspace;
  let gapAnalysisWorkflow;

  beforeEach(async () => {
    // Create temporary test workspace
    testWorkspace = join(process.cwd(), 'temp-gap-analysis-workspace');
    await mkdir(testWorkspace, { recursive: true });
    await mkdir(join(testWorkspace, 'src'), { recursive: true });
    await mkdir(join(testWorkspace, 'tests'), { recursive: true });

    // This will fail until gap analysis workflow is implemented
    const { CoverageGapAnalysisWorkflow } = await import('../../src/analysis/gap-analysis-workflow.js');
    gapAnalysisWorkflow = new CoverageGapAnalysisWorkflow({
      workspace: testWorkspace,
      swarmIntegration: true,
      constitutionalCompliance: true
    });
  });

  afterEach(async () => {
    gapAnalysisWorkflow = null;
    // Clean up test workspace
    await rm(testWorkspace, { recursive: true, force: true });
  });

  describe('End-to-end coverage gap analysis workflow', () => {
    test('should detect missing implementation gaps between specification and code', async () => {
      // Create specification with comprehensive requirements
      const specContent = `# User Management Feature
## Functional Requirements
- FR-001: System MUST provide user registration with email validation
- FR-002: System MUST authenticate users using OAuth 2.0
- FR-003: System MUST allow password reset via email
- FR-004: System MUST support user profile management
- FR-005: System MUST log all authentication events for audit

## Security Requirements
- SR-001: System MUST encrypt user passwords using bcrypt
- SR-002: System MUST implement rate limiting for login attempts
- SR-003: System MUST validate all user input against injection attacks
`;

      // Create partial implementation
      const authImplementation = `// Authentication Service
class AuthService {
  constructor() {
    this.users = new Map();
  }

  async login(email, password) {
    // Basic login implementation
    const user = this.users.get(email);
    return user && user.password === password;
  }

  async register(email, password) {
    // Basic registration - missing email validation
    this.users.set(email, { email, password });
    return true;
  }
}

export { AuthService };`;

      // Create minimal test coverage
      const authTests = `import { test } from 'node:test';
import { AuthService } from '../src/auth-service.js';

test('should login existing user', async () => {
  const auth = new AuthService();
  await auth.register('test@example.com', 'password');
  const result = await auth.login('test@example.com', 'password');
  assert.ok(result);
});`;

      await writeFile(join(testWorkspace, 'spec.md'), specContent);
      await writeFile(join(testWorkspace, 'src', 'auth-service.js'), authImplementation);
      await writeFile(join(testWorkspace, 'tests', 'auth.test.js'), authTests);

      const analysisRequest = {
        specificationPaths: [join(testWorkspace, 'spec.md')],
        implementationPaths: [join(testWorkspace, 'src')],
        testPaths: [join(testWorkspace, 'tests')],
        analysisOptions: {
          detectMissingImplementation: true,
          analyzeTestCoverage: true,
          validateSecurityRequirements: true,
          includeRemediationPlan: true
        }
      };

      const startTime = performance.now();
      const result = await gapAnalysisWorkflow.executeAnalysis(analysisRequest);
      const executionTime = performance.now() - startTime;

      // Verify workflow execution
      assert.ok(result.analysis_id);
      assert.ok(result.coverage_analysis);
      assert.ok(result.gap_summary);

      // Verify timing compliance
      assert.ok(executionTime < 3000, `Gap analysis took ${executionTime}ms, should be < 3000ms`);

      // Verify missing implementation detection
      const missingImplementationGaps = result.coverage_analysis.gaps.filter(gap =>
        gap.gap_type === 'missing_implementation'
      );

      assert.ok(missingImplementationGaps.length >= 4, 'Should detect multiple missing implementations');

      // Should detect missing email validation
      const emailValidationGap = missingImplementationGaps.find(gap =>
        gap.description.includes('email validation') ||
        gap.requirement_reference === 'FR-001'
      );
      assert.ok(emailValidationGap, 'Should detect missing email validation');
      assert.strictEqual(emailValidationGap.severity, 'HIGH');

      // Should detect missing OAuth implementation
      const oauthGap = missingImplementationGaps.find(gap =>
        gap.description.includes('OAuth') ||
        gap.requirement_reference === 'FR-002'
      );
      assert.ok(oauthGap, 'Should detect missing OAuth implementation');

      // Should detect missing security implementations
      const securityGaps = result.coverage_analysis.gaps.filter(gap =>
        gap.requirement_reference.startsWith('SR-')
      );
      assert.ok(securityGaps.length >= 3, 'Should detect all missing security requirements');

      // Verify remediation plan
      assert.ok(result.remediation_plan);
      assert.ok(Array.isArray(result.remediation_plan.prioritized_actions));
      assert.ok(result.remediation_plan.prioritized_actions.length > 0);
    });

    test('should detect specification drift between requirements and implementation', async () => {
      const originalSpec = `# Payment Processing Feature
## Functional Requirements
- FR-001: System MUST process payments using Stripe API with webhook validation
- FR-002: System MUST support credit cards and bank transfers
- FR-003: System MUST store transaction records with encryption

## Security Requirements
- SR-001: System MUST use HTTPS for all payment communications
- SR-002: System MUST comply with PCI DSS standards
`;

      const driftedImplementation = `// Payment Service with implementation drift
class PaymentService {
  constructor() {
    // Using PayPal instead of Stripe (drift from specification)
    this.paypalClient = new PayPalClient();
    this.database = new PlainTextDatabase(); // No encryption (security drift)
  }

  async processPayment(amount, method) {
    // Only supports credit cards, no bank transfers (missing functionality)
    if (method !== 'credit_card') {
      throw new Error('Unsupported payment method');
    }

    // Using HTTP instead of HTTPS (security violation)
    const response = await fetch('http://api.paypal.com/payments', {
      method: 'POST',
      body: JSON.stringify({ amount, method })
    });

    // Storing in plain text (violates encryption requirement)
    await this.database.store({
      transaction_id: response.transaction_id,
      amount: amount,
      method: method,
      timestamp: Date.now()
    });

    return response;
  }
}

export { PaymentService };`;

      await writeFile(join(testWorkspace, 'payment-spec.md'), originalSpec);
      await writeFile(join(testWorkspace, 'src', 'payment-service.js'), driftedImplementation);

      const analysisRequest = {
        specificationPaths: [join(testWorkspace, 'payment-spec.md')],
        implementationPaths: [join(testWorkspace, 'src')],
        analysisOptions: {
          detectSpecificationDrift: true,
          analyzeSecurityCompliance: true,
          validateApiUsage: true
        }
      };

      const result = await gapAnalysisWorkflow.executeAnalysis(analysisRequest);

      // Verify specification drift detection
      const driftGaps = result.coverage_analysis.gaps.filter(gap =>
        gap.gap_type === 'specification_drift'
      );

      assert.ok(driftGaps.length >= 2, 'Should detect multiple specification drifts');

      // Should detect Stripe vs PayPal drift
      const apiDrift = driftGaps.find(gap =>
        gap.drift_analysis &&
        (gap.drift_analysis.specified_technology.includes('Stripe') ||
         gap.drift_analysis.implemented_technology.includes('PayPal'))
      );
      assert.ok(apiDrift, 'Should detect API provider drift');
      assert.ok(apiDrift.drift_analysis.impact_assessment);
      assert.strictEqual(apiDrift.severity, 'HIGH');

      // Should detect encryption vs plain text drift
      const encryptionDrift = driftGaps.find(gap =>
        gap.description.includes('encryption') ||
        gap.description.includes('plain text')
      );
      assert.ok(encryptionDrift, 'Should detect encryption implementation drift');
      assert.strictEqual(encryptionDrift.severity, 'CRITICAL');

      // Verify security compliance analysis
      const securityViolations = result.coverage_analysis.security_analysis.violations;
      assert.ok(Array.isArray(securityViolations));
      assert.ok(securityViolations.length >= 2, 'Should detect security violations');

      // Should detect HTTP usage violation
      const httpViolation = securityViolations.find(v =>
        v.violation_type === 'insecure_communication'
      );
      assert.ok(httpViolation, 'Should detect HTTP usage violation');
    });

    test('should analyze test coverage gaps and suggest missing test scenarios', async () => {
      const testableSpec = `# File Upload Feature
## Functional Requirements
- FR-001: System MUST accept file uploads up to 10MB
- FR-002: System MUST validate file types (jpg, png, pdf)
- FR-003: System MUST scan uploaded files for malware
- FR-004: System MUST store files with unique identifiers
- FR-005: System MUST provide download functionality with access control

## Error Handling Requirements
- ER-001: System MUST handle oversized file uploads gracefully
- ER-002: System MUST reject invalid file types with clear messages
- ER-003: System MUST handle malware detection failures
- ER-004: System MUST handle storage failures with retry logic
`;

      const uploadImplementation = `// File Upload Service
class FileUploadService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = ['jpg', 'png', 'pdf'];
    this.storage = new FileStorage();
    this.scanner = new MalwareScanner();
  }

  async uploadFile(file, userId) {
    // Size validation
    if (file.size > this.maxFileSize) {
      throw new Error('File too large');
    }

    // Type validation
    const extension = file.name.split('.').pop().toLowerCase();
    if (!this.allowedTypes.includes(extension)) {
      throw new Error('Invalid file type');
    }

    // Malware scanning
    const scanResult = await this.scanner.scan(file);
    if (!scanResult.clean) {
      throw new Error('Malware detected');
    }

    // Generate unique identifier
    const fileId = this.generateUniqueId();

    // Store file
    try {
      await this.storage.store(fileId, file, userId);
      return { fileId, message: 'Upload successful' };
    } catch (error) {
      // Retry logic
      await this.storage.store(fileId, file, userId);
      return { fileId, message: 'Upload successful after retry' };
    }
  }

  async downloadFile(fileId, userId) {
    return await this.storage.retrieve(fileId, userId);
  }

  generateUniqueId() {
    return Date.now().toString() + Math.random().toString(36);
  }
}`;

      const limitedTests = `// Limited test coverage
import { test } from 'node:test';
import { FileUploadService } from '../src/upload-service.js';

test('should upload valid file', async () => {
  const service = new FileUploadService();
  const mockFile = { name: 'test.jpg', size: 1024 };
  const result = await service.uploadFile(mockFile, 'user123');
  assert.ok(result.fileId);
});

test('should reject oversized file', async () => {
  const service = new FileUploadService();
  const largeFile = { name: 'large.jpg', size: 20 * 1024 * 1024 };
  await assert.rejects(() => service.uploadFile(largeFile, 'user123'));
});`;

      await writeFile(join(testWorkspace, 'upload-spec.md'), testableSpec);
      await writeFile(join(testWorkspace, 'src', 'upload-service.js'), uploadImplementation);
      await writeFile(join(testWorkspace, 'tests', 'upload.test.js'), limitedTests);

      const analysisRequest = {
        specificationPaths: [join(testWorkspace, 'upload-spec.md')],
        implementationPaths: [join(testWorkspace, 'src')],
        testPaths: [join(testWorkspace, 'tests')],
        analysisOptions: {
          analyzeTestCoverage: true,
          identifyMissingTestScenarios: true,
          validateErrorHandling: true
        }
      };

      const result = await gapAnalysisWorkflow.executeAnalysis(analysisRequest);

      // Verify test coverage analysis
      const testCoverageGaps = result.coverage_analysis.gaps.filter(gap =>
        gap.gap_type === 'test_coverage'
      );

      assert.ok(testCoverageGaps.length >= 4, 'Should detect multiple test coverage gaps');

      // Should detect missing file type validation tests
      const fileTypeTestGap = testCoverageGaps.find(gap =>
        gap.description.includes('file type') || gap.requirement_reference === 'FR-002'
      );
      assert.ok(fileTypeTestGap, 'Should detect missing file type validation tests');

      // Should detect missing malware scanning tests
      const malwareTestGap = testCoverageGaps.find(gap =>
        gap.description.includes('malware') || gap.requirement_reference === 'FR-003'
      );
      assert.ok(malwareTestGap, 'Should detect missing malware scanning tests');

      // Should detect missing download functionality tests
      const downloadTestGap = testCoverageGaps.find(gap =>
        gap.description.includes('download') || gap.requirement_reference === 'FR-005'
      );
      assert.ok(downloadTestGap, 'Should detect missing download tests');

      // Verify test scenario suggestions
      testCoverageGaps.forEach(gap => {
        if (gap.test_analysis) {
          assert.ok(Array.isArray(gap.test_analysis.missing_test_scenarios));
          assert.ok(gap.test_analysis.missing_test_scenarios.length > 0);
          assert.ok(typeof gap.test_analysis.coverage_percentage === 'number');
          assert.ok(gap.test_analysis.recommendation);

          // Test scenarios should be specific and actionable
          gap.test_analysis.missing_test_scenarios.forEach(scenario => {
            assert.ok(scenario.length > 10, 'Test scenarios should be descriptive');
            assert.ok(scenario.includes('should'), 'Test scenarios should use "should" pattern');
          });
        }
      });

      // Verify overall coverage assessment
      assert.ok(result.coverage_analysis.test_coverage_summary);
      assert.ok(typeof result.coverage_analysis.test_coverage_summary.overall_coverage_percentage === 'number');
      assert.ok(result.coverage_analysis.test_coverage_summary.overall_coverage_percentage < 70,
               'Limited tests should result in low coverage percentage');
    });

    test('should integrate with swarm orchestrator for complex multi-file analysis', async () => {
      // Create complex multi-service specification
      const microservicesSpec = `# E-Commerce Platform Microservices
## User Service Requirements
- US-001: User registration and authentication
- US-002: User profile management
- US-003: User preference tracking

## Product Service Requirements
- PS-001: Product catalog management
- PS-002: Inventory tracking
- PS-003: Product search and filtering

## Order Service Requirements
- OS-001: Order creation and management
- OS-002: Payment processing integration
- OS-003: Order status tracking and notifications

## Analytics Service Requirements
- AS-001: User behavior tracking
- AS-002: Sales analytics and reporting
- AS-003: Performance metrics collection

## Integration Requirements
- IR-001: Services MUST communicate via message queues
- IR-002: Services MUST use shared authentication
- IR-003: Services MUST implement circuit breaker patterns
- IR-004: Services MUST support distributed tracing
`;

      // Create multiple service implementations
      const userService = `class UserService {
        async register(userData) { return { userId: 'user123' }; }
        async login(credentials) { return { token: 'jwt-token' }; }
      }`;

      const productService = `class ProductService {
        async getProducts() { return []; }
        async searchProducts(query) { return []; }
      }`;

      const orderService = `class OrderService {
        async createOrder(orderData) { return { orderId: 'order123' }; }
      }`;

      // Limited analytics service
      const analyticsService = `class AnalyticsService {
        async trackEvent(event) { console.log(event); }
      }`;

      await writeFile(join(testWorkspace, 'microservices-spec.md'), microservicesSpec);
      await writeFile(join(testWorkspace, 'src', 'user-service.js'), userService);
      await writeFile(join(testWorkspace, 'src', 'product-service.js'), productService);
      await writeFile(join(testWorkspace, 'src', 'order-service.js'), orderService);
      await writeFile(join(testWorkspace, 'src', 'analytics-service.js'), analyticsService);

      const analysisRequest = {
        specificationPaths: [join(testWorkspace, 'microservices-spec.md')],
        implementationPaths: [join(testWorkspace, 'src')],
        analysisOptions: {
          useSwarmCoordination: true,
          parallelAnalysis: true,
          crossServiceAnalysis: true,
          complexityThreshold: 'HIGH'
        }
      };

      const result = await gapAnalysisWorkflow.executeAnalysis(analysisRequest);

      // Verify swarm coordination usage
      assert.ok(result.swarm_coordination_used);
      assert.ok(result.parallel_analysis_results);
      assert.ok(typeof result.complexity_assessment.complexity_score === 'number');
      assert.ok(result.complexity_assessment.complexity_score > 0.8, 'Should be marked as high complexity');

      // Verify cross-service analysis
      assert.ok(result.coverage_analysis.cross_service_gaps);
      assert.ok(Array.isArray(result.coverage_analysis.cross_service_gaps));

      // Should detect missing integration implementations
      const integrationGaps = result.coverage_analysis.gaps.filter(gap =>
        gap.requirement_reference.startsWith('IR-')
      );
      assert.ok(integrationGaps.length >= 4, 'Should detect all missing integration requirements');

      // Should detect missing message queue implementation
      const messageQueueGap = integrationGaps.find(gap =>
        gap.description.includes('message queue') || gap.requirement_reference === 'IR-001'
      );
      assert.ok(messageQueueGap, 'Should detect missing message queue implementation');

      // Should detect missing distributed tracing
      const tracingGap = integrationGaps.find(gap =>
        gap.description.includes('distributed tracing') || gap.requirement_reference === 'IR-004'
      );
      assert.ok(tracingGap, 'Should detect missing distributed tracing');

      // Verify service-specific gap analysis
      assert.ok(result.service_analysis);
      assert.ok(Array.isArray(result.service_analysis.service_coverage));

      result.service_analysis.service_coverage.forEach(service => {
        assert.ok(service.service_name);
        assert.ok(typeof service.implementation_coverage === 'number');
        assert.ok(Array.isArray(service.missing_features));
      });
    });

    test('should enforce constitutional compliance during gap analysis', async () => {
      const constitutionalSpec = `# Feature Requiring Constitutional Compliance
## Architecture Requirements
- AR-001: System MUST use enhanced swarm orchestrator for task coordination
- AR-002: System MUST implement test-first development approach
- AR-003: System MUST maintain character-driven user experience

## Performance Requirements
- PR-001: Animations MUST complete within 500ms constitutional limit
- PR-002: Analysis operations MUST complete within 100ms
- PR-003: Memory usage MUST not exceed 50MB limit

## Development Requirements
- DR-001: All features MUST begin with complete specifications
- DR-002: Contract tests MUST be written before implementation
- DR-003: Character consistency MUST be validated throughout
`;

      const nonCompliantImplementation = `// Non-constitutional implementation
class CustomTaskCoordinator {  // Violates swarm-first principle
  constructor() {
    this.tasks = [];
  }

  async executeTasks() {
    // Custom coordination instead of using swarm
    return this.tasks.map(task => task.execute());
  }
}

class SlowAnimationEngine {
  async renderAnimation() {
    // Takes 800ms - violates 500ms constitutional limit
    await new Promise(resolve => setTimeout(resolve, 800));
    return 'animation-complete';
  }
}

class TechnicalErrorHandler {
  handleError(error) {
    // Not character-friendly - violates character-driven UX
    return 'FATAL ERROR: OPERATION FAILED';
  }
}`;

      await writeFile(join(testWorkspace, 'constitutional-spec.md'), constitutionalSpec);
      await writeFile(join(testWorkspace, 'src', 'non-compliant.js'), nonCompliantImplementation);

      const analysisRequest = {
        specificationPaths: [join(testWorkspace, 'constitutional-spec.md')],
        implementationPaths: [join(testWorkspace, 'src')],
        analysisOptions: {
          enforceConstitutionalCompliance: true,
          validateSwarmFirst: true,
          validatePerformanceLimits: true,
          validateCharacterConsistency: true
        }
      };

      const result = await gapAnalysisWorkflow.executeAnalysis(analysisRequest);

      // Verify constitutional compliance analysis
      assert.ok(result.constitutional_compliance_analysis);
      assert.ok(Array.isArray(result.constitutional_compliance_analysis.violations));

      const violations = result.constitutional_compliance_analysis.violations;
      assert.ok(violations.length >= 3, 'Should detect multiple constitutional violations');

      // Should detect swarm-first violation
      const swarmViolation = violations.find(v =>
        v.principle === 'swarm-first' || v.description.includes('CustomTaskCoordinator')
      );
      assert.ok(swarmViolation, 'Should detect swarm-first violation');
      assert.strictEqual(swarmViolation.severity, 'CRITICAL');

      // Should detect performance limit violation
      const performanceViolation = violations.find(v =>
        v.principle === 'performance-standards' || v.description.includes('800ms')
      );
      assert.ok(performanceViolation, 'Should detect performance limit violation');

      // Should detect character consistency violation
      const characterViolation = violations.find(v =>
        v.principle === 'character-ux' || v.description.includes('FATAL ERROR')
      );
      assert.ok(characterViolation, 'Should detect character consistency violation');

      // Verify remediation suggestions include constitutional guidance
      violations.forEach(violation => {
        assert.ok(violation.remediation_suggestion);
        if (violation.principle === 'swarm-first') {
          assert.ok(violation.remediation_suggestion.includes('enhanced-swarm-orchestrator') ||
                   violation.remediation_suggestion.includes('swarm coordination'));
        }
      });

      // Verify constitutional metrics
      assert.ok(result.constitutional_compliance_analysis.compliance_score);
      assert.ok(typeof result.constitutional_compliance_analysis.compliance_score === 'number');
      assert.ok(result.constitutional_compliance_analysis.compliance_score < 0.5,
               'Non-compliant implementation should have low compliance score');
    });
  });

  describe('Gap analysis workflow error handling and edge cases', () => {
    test('should handle empty or missing implementation gracefully', async () => {
      const specWithoutImplementation = `# Feature Without Implementation
## Requirements
- FR-001: System MUST provide user authentication
- FR-002: System MUST validate user input
- FR-003: System MUST store user data securely
`;

      await writeFile(join(testWorkspace, 'no-impl-spec.md'), specWithoutImplementation);
      // Intentionally not creating any implementation files

      const analysisRequest = {
        specificationPaths: [join(testWorkspace, 'no-impl-spec.md')],
        implementationPaths: [join(testWorkspace, 'src')],
        analysisOptions: {
          tolerateEmptyImplementation: true
        }
      };

      const result = await gapAnalysisWorkflow.executeAnalysis(analysisRequest);

      // Should complete successfully
      assert.ok(result.analysis_id);
      assert.ok(result.coverage_analysis);

      // Should indicate 100% missing implementation
      assert.strictEqual(result.coverage_analysis.coverage_percentage, 0);

      // All gaps should be missing implementation
      const allGaps = result.coverage_analysis.gaps;
      assert.ok(allGaps.length >= 3, 'Should create gaps for all requirements');

      allGaps.forEach(gap => {
        assert.strictEqual(gap.gap_type, 'missing_implementation');
        assert.ok(['HIGH', 'CRITICAL'].includes(gap.severity));
      });
    });

    test('should provide meaningful results for partial implementations', async () => {
      const partialSpec = `# Partially Implemented Feature
## Requirements
- FR-001: System MUST authenticate users
- FR-002: System MUST authorize user actions
- FR-003: System MUST log security events
`;

      const partialImplementation = `// Partial implementation
class PartialAuthService {
  async authenticate(credentials) {
    // Only basic authentication implemented
    return credentials.username === 'admin';
  }

  // Missing: authorization and logging functionality
}`;

      await writeFile(join(testWorkspace, 'partial-spec.md'), partialSpec);
      await writeFile(join(testWorkspace, 'src', 'partial-auth.js'), partialImplementation);

      const analysisRequest = {
        specificationPaths: [join(testWorkspace, 'partial-spec.md')],
        implementationPaths: [join(testWorkspace, 'src')],
        analysisOptions: {
          analyzePartialImplementation: true
        }
      };

      const result = await gapAnalysisWorkflow.executeAnalysis(analysisRequest);

      // Should detect partial implementation
      assert.ok(result.coverage_analysis.coverage_percentage > 0);
      assert.ok(result.coverage_analysis.coverage_percentage < 100);

      // Should identify both implemented and missing functionality
      const implementedFeatures = result.coverage_analysis.implemented_features;
      const missingFeatures = result.coverage_analysis.gaps;

      assert.ok(Array.isArray(implementedFeatures));
      assert.ok(implementedFeatures.length >= 1, 'Should detect authentication implementation');
      assert.ok(missingFeatures.length >= 2, 'Should detect missing authorization and logging');
    });
  });
});