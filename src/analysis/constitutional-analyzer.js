/**
 * Constitutional Compliance Analyzer Engine
 * Analyzes specifications and implementations for constitutional principle compliance
 * Integrates with enhanced swarm orchestrator for complex analysis tasks
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ConstitutionalViolation, ConstitutionalViolationCollection } from './constitutional-violation.js';

/**
 * Constitutional Compliance Analyzer
 * Validates artifacts against constitutional principles and standards
 */
export class ConstitutionalAnalyzer {
  constructor(options = {}) {
    this.constitutionalStandards = null;
    this.swarmIntegration = options.swarmIntegration || false;
    this.workspace = options.workspace || process.cwd();
    this.analysisCache = new Map();
    this.performanceMetrics = {
      analysis_start_time: null,
      analysis_duration: 0,
      artifacts_processed: 0,
      violations_detected: 0
    };
  }

  /**
   * Load constitutional standards configuration
   * @returns {Object} Constitutional standards
   */
  async getConstitutionalStandards() {
    if (this.constitutionalStandards) {
      return this.constitutionalStandards;
    }

    try {
      const standardsPath = join(this.workspace, '.specify', 'analysis', 'constitutional-standards.json');
      const standardsContent = await readFile(standardsPath, 'utf-8');
      this.constitutionalStandards = JSON.parse(standardsContent);
      return this.constitutionalStandards;
    } catch (error) {
      throw new Error(`Failed to load constitutional standards: ${error.message}`);
    }
  }

  /**
   * Analyze constitutional compliance of artifacts
   * @param {Object} request - Analysis request
   * @returns {Object} Analysis results
   */
  async analyzeConstitutional(request) {
    this.performanceMetrics.analysis_start_time = performance.now();

    try {
      // Validate request
      this.validateAnalysisRequest(request);

      // Load constitutional standards
      const standards = await this.getConstitutionalStandards();

      // Initialize violation collection
      const violations = new ConstitutionalViolationCollection();

      // Process each artifact
      for (const artifact of request.artifacts) {
        const artifactViolations = await this.analyzeArtifact(artifact, standards, request.options || {});
        artifactViolations.forEach(violation => violations.add(violation));
      }

      // Apply filters if specified
      const filteredViolations = this.applyFilters(violations, request.options || {});

      // Calculate analysis duration
      this.performanceMetrics.analysis_duration = performance.now() - this.performanceMetrics.analysis_start_time;
      this.performanceMetrics.artifacts_processed = request.artifacts.length;
      this.performanceMetrics.violations_detected = filteredViolations.violations.length;

      // Validate timing compliance (constitutional limit: 2000ms)
      if (this.performanceMetrics.analysis_duration > 2000) {
        console.warn(`Constitutional analysis took ${this.performanceMetrics.analysis_duration}ms, exceeds 2000ms limit`);
      }

      // Generate analysis results
      return {
        analysis_id: this.generateAnalysisId(),
        execution_time: this.performanceMetrics.analysis_duration,
        constitutional_compliance: {
          violations: filteredViolations.violations.map(v => v.toJSON()),
          total_violations: filteredViolations.violations.length,
          compliance_score: this.calculateComplianceScore(filteredViolations),
          by_severity: filteredViolations.getSummary().by_severity,
          by_type: filteredViolations.getSummary().by_type
        },
        summary: {
          total_violations: filteredViolations.violations.length,
          critical_violations: filteredViolations.getBySeverity('CRITICAL').length,
          blocking_violations: filteredViolations.getBlocking().length,
          artifacts_analyzed: request.artifacts.length,
          analysis_duration_ms: this.performanceMetrics.analysis_duration
        }
      };
    } catch (error) {
      throw new Error(`Constitutional analysis failed: ${error.message}`);
    }
  }

  /**
   * Validate performance metrics against constitutional limits
   * @param {Object} request - Performance validation request
   * @returns {Object} Performance validation results
   */
  async validatePerformance(request) {
    const standards = await this.getConstitutionalStandards();
    const performanceStandards = standards.performanceStandards;

    const validationResults = [];
    let overallCompliance = true;
    let violationCount = 0;

    for (const metric of request.metrics) {
      const validation = this.validateSingleMetric(metric, performanceStandards);
      validationResults.push(validation);

      if (validation.compliance_status === 'violation') {
        overallCompliance = false;
        violationCount++;
      }
    }

    return {
      validation_results: validationResults,
      overall_compliance: overallCompliance,
      violation_count: violationCount
    };
  }

  /**
   * Validate a single performance metric
   * @param {Object} metric - Performance metric
   * @param {Object} standards - Performance standards
   * @returns {Object} Validation result
   */
  validateSingleMetric(metric, standards) {
    const metricStandard = this.findMetricStandard(metric.name, standards);

    if (!metricStandard) {
      return {
        metric_name: metric.name,
        compliance_status: 'unknown',
        measured_value: metric.measured_value,
        constitutional_limit: null,
        recommendation: 'No constitutional standard defined for this metric'
      };
    }

    const limit = metricStandard.maxDuration || metricStandard.maxUsage || metricStandard.maxTimeout;
    let status = 'compliant';
    let recommendation = 'Performance meets constitutional standards';

    if (metric.measured_value > limit) {
      status = 'violation';
      recommendation = `Optimize to meet ${limit}${metricStandard.unit} constitutional limit`;
    } else if (metric.measured_value > limit * 0.8) {
      status = 'warning';
      recommendation = 'Performance approaching constitutional limit - monitor closely';
    }

    return {
      metric_name: metric.name,
      compliance_status: status,
      measured_value: metric.measured_value,
      constitutional_limit: limit,
      recommendation
    };
  }

  /**
   * Find performance standard for a metric
   * @param {string} metricName - Metric name
   * @param {Object} standards - Performance standards
   * @returns {Object|null} Metric standard
   */
  findMetricStandard(metricName, standards) {
    // Direct match
    if (standards[metricName]) {
      return standards[metricName];
    }

    // Pattern matching for common metrics
    const patterns = {
      'animation': ['animation', 'anim'],
      'analysisTime': ['analysis', 'analyze'],
      'refinementTime': ['refinement', 'refine'],
      'memoryUsage': ['memory', 'mem'],
      'cpuUsage': ['cpu', 'processor']
    };

    for (const [standardKey, patterns_] of Object.entries(patterns)) {
      if (patterns_.some(pattern => metricName.toLowerCase().includes(pattern))) {
        return standards[standardKey];
      }
    }

    return null;
  }

  /**
   * Validate analysis request
   * @param {Object} request - Analysis request
   */
  validateAnalysisRequest(request) {
    if (!request || typeof request !== 'object') {
      throw new Error('Analysis request must be a valid object');
    }

    if (!request.artifacts || !Array.isArray(request.artifacts)) {
      throw new Error('Analysis request must include artifacts array');
    }

    if (request.artifacts.length === 0) {
      throw new Error('Analysis request must include at least one artifact');
    }

    // Validate each artifact
    request.artifacts.forEach((artifact, index) => {
      if (!artifact.path || !artifact.type || !artifact.content) {
        throw new Error(`Artifact ${index} missing required fields (path, type, content)`);
      }
    });
  }

  /**
   * Analyze a single artifact for constitutional violations
   * @param {Object} artifact - Artifact to analyze
   * @param {Object} standards - Constitutional standards
   * @param {Object} options - Analysis options
   * @returns {ConstitutionalViolation[]} Detected violations
   */
  async analyzeArtifact(artifact, standards, options) {
    const violations = [];

    // Analyze each constitutional principle
    for (const [principleKey, principle] of Object.entries(standards.constitutionalPrinciples)) {
      if (options.principle_filter && !options.principle_filter.includes(principleKey)) {
        continue;
      }

      const principleViolations = await this.analyzePrinciple(artifact, principleKey, principle, options);
      violations.push(...principleViolations);
    }

    return violations;
  }

  /**
   * Analyze artifact against a specific constitutional principle
   * @param {Object} artifact - Artifact to analyze
   * @param {string} principleKey - Principle key
   * @param {Object} principle - Principle definition
   * @param {Object} options - Analysis options
   * @returns {ConstitutionalViolation[]} Violations for this principle
   */
  async analyzePrinciple(artifact, principleKey, principle, options) {
    const violations = [];
    const content = artifact.content.toLowerCase();

    switch (principleKey) {
      case 'swarm-first':
        violations.push(...this.analyzeSwarmFirst(artifact, content, principle));
        break;
      case 'test-first':
        violations.push(...this.analyzeTestFirst(artifact, content, principle));
        break;
      case 'character-ux':
        violations.push(...this.analyzeCharacterUx(artifact, content, principle));
        break;
      case 'production-ready':
        violations.push(...this.analyzeProductionReady(artifact, content, principle));
        break;
      case 'complexity':
        violations.push(...this.analyzeComplexity(artifact, content, principle));
        break;
      case 'spec-driven':
        violations.push(...this.analyzeSpecDriven(artifact, content, principle));
        break;
    }

    // Apply severity filter
    return violations.filter(violation =>
      !options.severity_filter || this.meetsSeverityFilter(violation.severity, options.severity_filter)
    );
  }

  /**
   * Analyze swarm-first principle violations
   * @param {Object} artifact - Artifact
   * @param {string} content - Content to analyze
   * @param {Object} principle - Principle definition
   * @returns {ConstitutionalViolation[]} Swarm-first violations
   */
  analyzeSwarmFirst(artifact, content, principle) {
    const violations = [];

    // Check for custom coordinators (violation)
    const customCoordinatorPatterns = [
      'custom.*coordinator',
      'new.*coordinator',
      'class.*coordinator',
      'taskcoordinator',
      'custom.*orchestrator'
    ];

    customCoordinatorPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      if (regex.test(content)) {
        violations.push(ConstitutionalViolation.createSwarmFirstViolation({
          description: 'Custom coordinator detected - violates swarm-first principle',
          location: `${artifact.path}`,
          remediation_suggestion: 'Replace custom coordinator with enhanced-swarm-orchestrator.js',
          violation_evidence: {
            source_file: artifact.path,
            violation_pattern: pattern,
            code_snippet: this.extractMatchingSnippet(content, regex)
          }
        }));
      }
    });

    // Check for missing swarm integration in coordination tasks
    const coordinationKeywords = ['coordinate', 'orchestrate', 'manage.*tasks', 'distribute.*work'];
    const hasSwarmReference = content.includes('swarm') || content.includes('enhanced-swarm-orchestrator');

    coordinationKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      if (regex.test(content) && !hasSwarmReference) {
        violations.push(ConstitutionalViolation.createSwarmFirstViolation({
          severity: 'HIGH',
          description: 'Task coordination without swarm integration detected',
          location: `${artifact.path}`,
          remediation_suggestion: 'Use enhanced-swarm-orchestrator.js for task coordination',
          violation_evidence: {
            source_file: artifact.path,
            violation_pattern: keyword,
            context: { missing_swarm_integration: true }
          }
        }));
      }
    });

    return violations;
  }

  /**
   * Analyze test-first principle violations
   * @param {Object} artifact - Artifact
   * @param {string} content - Content to analyze
   * @param {Object} principle - Principle definition
   * @returns {ConstitutionalViolation[]} Test-first violations
   */
  analyzeTestFirst(artifact, content, principle) {
    const violations = [];

    // Check for implementation before tests
    if (artifact.type === 'plan' || artifact.type === 'spec') {
      const implementationKeywords = ['implement', 'build', 'create', 'develop'];
      const testKeywords = ['test', 'tdd', 'contract.*test'];

      const hasImplementation = implementationKeywords.some(keyword =>
        new RegExp(keyword, 'gi').test(content)
      );

      const hasTestFirst = testKeywords.some(keyword =>
        new RegExp(`${keyword}.*first|first.*${keyword}|before.*implement`, 'gi').test(content)
      );

      if (hasImplementation && !hasTestFirst) {
        violations.push(ConstitutionalViolation.createTestFirstViolation({
          description: 'Implementation planned without test-first approach',
          location: `${artifact.path}`,
          remediation_suggestion: 'Add test-first development approach to implementation plan',
          violation_evidence: {
            source_file: artifact.path,
            context: { missing_test_first_planning: true }
          }
        }));
      }
    }

    // Check for missing contract tests in implementation artifacts
    if (artifact.type === 'implementation') {
      const hasContractTests = content.includes('contract') && content.includes('test');
      const isTestFile = artifact.path.includes('test') || artifact.path.includes('.test.');

      if (!isTestFile && !hasContractTests) {
        violations.push(ConstitutionalViolation.createTestFirstViolation({
          severity: 'HIGH',
          description: 'Implementation without corresponding contract tests',
          location: `${artifact.path}`,
          remediation_suggestion: 'Create contract tests before implementing functionality',
          violation_evidence: {
            source_file: artifact.path,
            context: { missing_contract_tests: true }
          }
        }));
      }
    }

    return violations;
  }

  /**
   * Analyze character-driven UX principle violations
   * @param {Object} artifact - Artifact
   * @param {string} content - Content to analyze
   * @param {Object} principle - Principle definition
   * @returns {ConstitutionalViolation[]} Character UX violations
   */
  analyzeCharacterUx(artifact, content, principle) {
    const violations = [];

    // Check for harsh technical language
    const harshTerms = ['error', 'failure', 'invalid', 'denied', 'forbidden', 'fatal', 'crash'];
    const encouragingTerms = ['helpful', 'friendly', 'clear', 'supportive', 'guidance'];

    const foundHarsh = harshTerms.filter(term => content.includes(term));
    const hasEncouraging = encouragingTerms.some(term => content.includes(term));

    if (foundHarsh.length > 0 && !hasEncouraging) {
      violations.push(ConstitutionalViolation.createCharacterUxViolation({
        description: `Harsh technical language without character-friendly balance: ${foundHarsh.join(', ')}`,
        location: `${artifact.path}`,
        remediation_suggestion: 'Replace harsh technical terms with character-friendly alternatives',
        violation_evidence: {
          source_file: artifact.path,
          violation_pattern: foundHarsh.join('|'),
          context: { harsh_terms_found: foundHarsh }
        }
      }));
    }

    // Check for cringe language
    const cringeTerms = ['amazing', 'awesome', 'fantastic', 'incredible', 'super duper'];
    const foundCringe = cringeTerms.filter(term => content.includes(term));

    if (foundCringe.length > 2) {
      violations.push(ConstitutionalViolation.createCharacterUxViolation({
        severity: 'MEDIUM',
        description: `Overly effusive language detected: ${foundCringe.join(', ')}`,
        location: `${artifact.path}`,
        remediation_suggestion: 'Tone down overly effusive language to maintain authenticity',
        violation_evidence: {
          source_file: artifact.path,
          context: { cringe_terms_found: foundCringe }
        }
      }));
    }

    return violations;
  }

  /**
   * Analyze production-ready principle violations
   * @param {Object} artifact - Artifact
   * @param {string} content - Content to analyze
   * @param {Object} principle - Principle definition
   * @returns {ConstitutionalViolation[]} Production-ready violations
   */
  analyzeProductionReady(artifact, content, principle) {
    const violations = [];

    // Check for missing error handling
    if (artifact.type === 'implementation') {
      const hasErrorHandling = content.includes('try') || content.includes('catch') || content.includes('error');
      const hasAsyncCode = content.includes('async') || content.includes('await');

      if (hasAsyncCode && !hasErrorHandling) {
        violations.push(new ConstitutionalViolation({
          type: 'production-ready',
          severity: 'HIGH',
          description: 'Async code without proper error handling',
          location: `${artifact.path}`,
          remediation_suggestion: 'Add comprehensive error handling for async operations',
          constitutional_reference: {
            principle: 'production-ready',
            requirement: 'Comprehensive logging and error handling'
          }
        }));
      }
    }

    // Check for missing security considerations
    const securityKeywords = ['password', 'token', 'auth', 'login', 'user.*input'];
    const securityMeasures = ['encrypt', 'validate', 'sanitize', 'secure'];

    securityKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      if (regex.test(content)) {
        const hasSecurityMeasures = securityMeasures.some(measure =>
          new RegExp(measure, 'gi').test(content)
        );

        if (!hasSecurityMeasures) {
          violations.push(new ConstitutionalViolation({
            type: 'production-ready',
            severity: 'CRITICAL',
            description: `Security-sensitive functionality without proper security measures: ${keyword}`,
            location: `${artifact.path}`,
            remediation_suggestion: 'Implement proper security validation and encryption',
            constitutional_reference: {
              principle: 'production-ready',
              requirement: 'Security scanning and vulnerability prevention'
            }
          }));
        }
      }
    });

    return violations;
  }

  /**
   * Analyze complexity principle violations
   * @param {Object} artifact - Artifact
   * @param {string} content - Content to analyze
   * @param {Object} principle - Principle definition
   * @returns {ConstitutionalViolation[]} Complexity violations
   */
  analyzeComplexity(artifact, content, principle) {
    const violations = [];

    // Check for unjustified complexity
    const complexityIndicators = [
      'custom.*framework',
      'proprietary.*solution',
      'complex.*architecture',
      'advanced.*pattern'
    ];

    const justificationIndicators = [
      'alternative.*considered',
      'simpler.*approach',
      'justification',
      'compared.*options'
    ];

    complexityIndicators.forEach(indicator => {
      const regex = new RegExp(indicator, 'gi');
      if (regex.test(content)) {
        const hasJustification = justificationIndicators.some(justification =>
          new RegExp(justification, 'gi').test(content)
        );

        if (!hasJustification) {
          violations.push(new ConstitutionalViolation({
            type: 'complexity',
            severity: 'MEDIUM',
            description: `Complex solution without documented justification: ${indicator}`,
            location: `${artifact.path}`,
            remediation_suggestion: 'Document simpler alternatives considered and justify complexity',
            constitutional_reference: {
              principle: 'complexity',
              requirement: 'Document simpler alternatives considered'
            }
          }));
        }
      }
    });

    return violations;
  }

  /**
   * Analyze spec-driven principle violations
   * @param {Object} artifact - Artifact
   * @param {string} content - Content to analyze
   * @param {Object} principle - Principle definition
   * @returns {ConstitutionalViolation[]} Spec-driven violations
   */
  analyzeSpecDriven(artifact, content, principle) {
    const violations = [];

    // Check for NEEDS CLARIFICATION markers
    if (content.includes('needs clarification') || content.includes('todo') || content.includes('tbd')) {
      violations.push(new ConstitutionalViolation({
        type: 'spec-driven',
        severity: 'HIGH',
        description: 'Specification contains unresolved clarification markers',
        location: `${artifact.path}`,
        remediation_suggestion: 'Resolve all NEEDS CLARIFICATION markers before implementation',
        constitutional_reference: {
          principle: 'spec-driven',
          requirement: 'Complete spec.md with resolved NEEDS CLARIFICATION markers'
        }
      }));
    }

    // Check for implementation without specification
    if (artifact.type === 'implementation') {
      const hasSpecReference = content.includes('spec') || content.includes('requirement');

      if (!hasSpecReference) {
        violations.push(new ConstitutionalViolation({
          type: 'spec-driven',
          severity: 'MEDIUM',
          description: 'Implementation without clear specification reference',
          location: `${artifact.path}`,
          remediation_suggestion: 'Link implementation to corresponding specification requirements',
          constitutional_reference: {
            principle: 'spec-driven',
            requirement: 'No implementation without approved specifications'
          }
        }));
      }
    }

    return violations;
  }

  /**
   * Extract matching code snippet for evidence
   * @param {string} content - Content to search
   * @param {RegExp} regex - Regular expression
   * @returns {string} Code snippet
   */
  extractMatchingSnippet(content, regex) {
    const match = content.match(regex);
    if (!match) return '';

    const matchIndex = content.indexOf(match[0]);
    const start = Math.max(0, matchIndex - 50);
    const end = Math.min(content.length, matchIndex + match[0].length + 50);

    return content.substring(start, end);
  }

  /**
   * Check if violation meets severity filter
   * @param {string} severity - Violation severity
   * @param {string} filter - Severity filter
   * @returns {boolean} True if meets filter
   */
  meetsSeverityFilter(severity, filter) {
    const severityLevels = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
    return severityLevels[severity] <= severityLevels[filter];
  }

  /**
   * Apply filters to violation collection
   * @param {ConstitutionalViolationCollection} violations - Violations
   * @param {Object} options - Filter options
   * @returns {ConstitutionalViolationCollection} Filtered violations
   */
  applyFilters(violations, options) {
    const filtered = new ConstitutionalViolationCollection();

    violations.violations.forEach(violation => {
      let include = true;

      // Apply severity filter
      if (options.severity_filter && !this.meetsSeverityFilter(violation.severity, options.severity_filter)) {
        include = false;
      }

      // Apply principle filter
      if (options.principle_filter && !options.principle_filter.includes(violation.type)) {
        include = false;
      }

      if (include) {
        // Add remediation suggestions if requested
        if (options.include_suggestions && !violation.remediation_suggestion) {
          const plan = violation.generateRemediationPlan();
          violation.remediation_suggestion = plan.constitutional_guidance || plan.steps.join('; ');
        }

        filtered.add(violation);
      }
    });

    return filtered;
  }

  /**
   * Calculate overall compliance score
   * @param {ConstitutionalViolationCollection} violations - Violations
   * @returns {number} Compliance score (0-1)
   */
  calculateComplianceScore(violations) {
    if (violations.violations.length === 0) {
      return 1.0;
    }

    // Weight violations by severity
    const severityWeights = { 'CRITICAL': 1.0, 'HIGH': 0.7, 'MEDIUM': 0.4, 'LOW': 0.2 };
    let totalWeight = 0;
    let violationWeight = 0;

    violations.violations.forEach(violation => {
      const weight = severityWeights[violation.severity] || 0.5;
      totalWeight += 1.0;
      violationWeight += weight;
    });

    return Math.max(0, (totalWeight - violationWeight) / totalWeight);
  }

  /**
   * Generate unique analysis ID
   * @returns {string} Analysis ID
   */
  generateAnalysisId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CA-${timestamp}-${random}`;
  }
}