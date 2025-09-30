/**
 * Coverage Gap Analyzer Engine
 * Analyzes gaps between specifications and implementations
 * Identifies missing implementations, specification drift, and test coverage gaps
 */

import { CoverageGap, CoverageGapCollection } from './coverage-gap.js';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

/**
 * Coverage Gap Analyzer
 * Detects and analyzes gaps between specifications and implementations
 */
export class CoverageGapAnalyzer {
  constructor(options = {}) {
    this.workspace = options.workspace || process.cwd();
    this.swarmIntegration = options.swarmIntegration || false;
    this.constitutionalCompliance = options.constitutionalCompliance || false;
    this.analysisCache = new Map();
    this.performanceMetrics = {
      analysis_start_time: null,
      analysis_duration: 0,
      artifacts_analyzed: 0,
      gaps_detected: 0
    };
  }

  /**
   * Analyze coverage gaps between specifications and implementations
   * @param {Object} request - Gap analysis request
   * @returns {Object} Gap analysis results
   */
  async analyzeGaps(request) {
    this.performanceMetrics.analysis_start_time = performance.now();

    try {
      // Validate request
      this.validateGapAnalysisRequest(request);

      // Initialize gap collection
      const gaps = new CoverageGapCollection();

      // Parse specification artifacts
      const specifications = await this.parseSpecificationArtifacts(request.specification_artifacts);

      // Parse implementation artifacts
      const implementations = await this.parseImplementationArtifacts(request.implementation_artifacts);

      // Analyze gaps based on requested types
      const analysisOptions = request.analysis_options || {};

      if (analysisOptions.gap_types?.includes('missing_implementation') !== false) {
        const missingGaps = await this.detectMissingImplementations(specifications, implementations);
        missingGaps.forEach(gap => gaps.add(gap));
      }

      if (analysisOptions.gap_types?.includes('specification_drift') !== false) {
        const driftGaps = await this.detectSpecificationDrift(specifications, implementations);
        driftGaps.forEach(gap => gaps.add(gap));
      }

      if (analysisOptions.gap_types?.includes('test_coverage') !== false) {
        const testGaps = await this.analyzeTestCoverage(specifications, implementations, request.test_artifacts || []);
        testGaps.forEach(gap => gaps.add(gap));
      }

      // Apply filters
      const filteredGaps = this.applyGapFilters(gaps, analysisOptions);

      // Calculate analysis duration
      this.performanceMetrics.analysis_duration = performance.now() - this.performanceMetrics.analysis_start_time;
      this.performanceMetrics.artifacts_analyzed = request.specification_artifacts.length + request.implementation_artifacts.length;
      this.performanceMetrics.gaps_detected = filteredGaps.gaps.length;

      // Validate timing compliance (constitutional limit: 1000ms)
      if (this.performanceMetrics.analysis_duration > 1000) {
        console.warn(`Coverage gap analysis took ${this.performanceMetrics.analysis_duration}ms, exceeds 1000ms limit`);
      }

      // Generate analysis results
      return {
        analysis_id: this.generateAnalysisId(),
        execution_time: this.performanceMetrics.analysis_duration,
        coverage_gaps: filteredGaps.gaps.map(g => g.toJSON()),
        coverage_summary: {
          total_gaps: filteredGaps.gaps.length,
          coverage_percentage: (1 - (filteredGaps.gaps.length / Math.max(specifications.requirements.length, 1))) * 100,
          by_type: filteredGaps.getCoverageSummary().by_type,
          by_severity: filteredGaps.getCoverageSummary().by_severity,
          blocking_gaps: filteredGaps.getBlocking().length
        }
      };
    } catch (error) {
      throw new Error(`Coverage gap analysis failed: ${error.message}`);
    }
  }

  /**
   * Assess implementation quality against constitutional standards
   * @param {Object} request - Quality assessment request
   * @returns {Object} Quality assessment results
   */
  async assessQuality(request) {
    const qualityAssessments = [];
    let overallQualityScore = 1.0;

    for (const artifact of request.implementation_artifacts) {
      const assessment = await this.assessArtifactQuality(artifact, request.quality_criteria || {});
      qualityAssessments.push(assessment);
    }

    // Calculate overall quality score
    if (qualityAssessments.length > 0) {
      overallQualityScore = qualityAssessments.reduce((sum, assessment) => sum + assessment.quality_score, 0) / qualityAssessments.length;
    }

    return {
      quality_assessments: qualityAssessments,
      overall_quality_score: {
        score: overallQualityScore,
        grade: this.calculateQualityGrade(overallQualityScore)
      }
    };
  }

  /**
   * Generate coverage report
   * @param {Object} request - Report generation request
   * @returns {Object} Generated report
   */
  async generateReport(request) {
    const reportId = this.generateReportId();
    const generatedAt = new Date().toISOString();

    // Consolidate analysis results
    const consolidatedGaps = this.consolidateAnalysisResults(request.analysis_results);

    // Generate report content based on format
    const reportContent = await this.generateReportContent(consolidatedGaps, request.report_options || {});

    // Generate report summary
    const reportSummary = this.generateReportSummary(consolidatedGaps);

    // Generate remediation plan if requested
    let remediationPlan = null;
    if (request.report_options?.include_remediation_plan) {
      remediationPlan = this.generateRemediationPlan(consolidatedGaps);
    }

    return {
      report_id: reportId,
      generated_at: generatedAt,
      report_content: reportContent,
      report_summary: reportSummary,
      remediation_plan: remediationPlan,
      report_format: request.report_options?.format || 'markdown'
    };
  }

  /**
   * Validate gap analysis request
   * @param {Object} request - Request to validate
   */
  validateGapAnalysisRequest(request) {
    if (!request || typeof request !== 'object') {
      throw new Error('Gap analysis request must be a valid object');
    }

    if (!request.specification_artifacts || !Array.isArray(request.specification_artifacts)) {
      throw new Error('Gap analysis request must include specification_artifacts array');
    }

    if (!request.implementation_artifacts || !Array.isArray(request.implementation_artifacts)) {
      throw new Error('Gap analysis request must include implementation_artifacts array');
    }

    if (request.specification_artifacts.length === 0) {
      throw new Error('Gap analysis request must include at least one specification artifact');
    }
  }

  /**
   * Parse specification artifacts to extract requirements
   * @param {Array} artifacts - Specification artifacts
   * @returns {Object} Parsed specifications
   */
  async parseSpecificationArtifacts(artifacts) {
    const specifications = {
      requirements: [],
      sections: [],
      metadata: {}
    };

    for (const artifact of artifacts) {
      const parsed = await this.parseSpecificationArtifact(artifact);
      specifications.requirements.push(...parsed.requirements);
      specifications.sections.push(...parsed.sections);
      Object.assign(specifications.metadata, parsed.metadata);
    }

    return specifications;
  }

  /**
   * Parse a single specification artifact
   * @param {Object} artifact - Specification artifact
   * @returns {Object} Parsed specification
   */
  async parseSpecificationArtifact(artifact) {
    const content = artifact.content;
    const parsed = {
      requirements: [],
      sections: [],
      metadata: {
        source_file: artifact.path,
        artifact_type: artifact.type
      }
    };

    // Extract requirements using patterns
    const requirementPatterns = [
      /^\s*-\s*(FR-\d+|UR-\d+|NFR-\d+|TR-\d+|SR-\d+):\s*(.+)$/gm, // Formal requirements
      /^\s*-\s*(.+MUST.+)$/gm, // MUST statements
      /^\s*-\s*(.+SHALL.+)$/gm, // SHALL statements
      /^\s*-\s*(.+WILL.+)$/gm  // WILL statements
    ];

    requirementPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const requirementId = match[1]?.includes('-') ? match[1] : `REQ-${parsed.requirements.length + 1}`;
        const requirementText = match[2] || match[1];

        parsed.requirements.push({
          id: requirementId,
          text: requirementText.trim(),
          source_line: this.findLineNumber(content, match.index),
          source_file: artifact.path,
          type: this.classifyRequirementType(requirementText)
        });
      }
    });

    // Extract sections
    const sectionMatches = content.match(/^#+\s+(.+)$/gm);
    if (sectionMatches) {
      parsed.sections = sectionMatches.map(match => match.replace(/^#+\s+/, ''));
    }

    return parsed;
  }

  /**
   * Parse implementation artifacts
   * @param {Array} artifacts - Implementation artifacts
   * @returns {Object} Parsed implementations
   */
  async parseImplementationArtifacts(artifacts) {
    const implementations = {
      files: [],
      functions: [],
      classes: [],
      exports: [],
      metadata: {}
    };

    for (const artifact of artifacts) {
      const parsed = await this.parseImplementationArtifact(artifact);
      implementations.files.push(parsed);
      implementations.functions.push(...parsed.functions);
      implementations.classes.push(...parsed.classes);
      implementations.exports.push(...parsed.exports);
    }

    return implementations;
  }

  /**
   * Parse a single implementation artifact
   * @param {Object} artifact - Implementation artifact
   * @returns {Object} Parsed implementation
   */
  async parseImplementationArtifact(artifact) {
    const content = artifact.content;
    const parsed = {
      file_path: artifact.path,
      functions: [],
      classes: [],
      exports: [],
      imports: [],
      metadata: {
        lines_of_code: content.split('\n').length,
        file_size: content.length
      }
    };

    // Extract functions
    const functionPatterns = [
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(/g,
      /(\w+)\s*:\s*(?:async\s+)?function/g
    ];

    functionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        parsed.functions.push({
          name: match[1],
          line_number: this.findLineNumber(content, match.index),
          is_async: match[0].includes('async'),
          is_exported: match[0].includes('export')
        });
      }
    });

    // Extract classes
    const classPattern = /(?:export\s+)?class\s+(\w+)/g;
    let classMatch;
    while ((classMatch = classPattern.exec(content)) !== null) {
      parsed.classes.push({
        name: classMatch[1],
        line_number: this.findLineNumber(content, classMatch.index),
        is_exported: classMatch[0].includes('export')
      });
    }

    // Extract exports
    const exportPatterns = [
      /export\s+\{\s*([^}]+)\s*\}/g,
      /export\s+(?:default\s+)?(\w+)/g
    ];

    exportPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1].includes(',')) {
          // Multiple exports
          const exports = match[1].split(',').map(e => e.trim());
          parsed.exports.push(...exports);
        } else {
          parsed.exports.push(match[1]);
        }
      }
    });

    return parsed;
  }

  /**
   * Detect missing implementations
   * @param {Object} specifications - Parsed specifications
   * @param {Object} implementations - Parsed implementations
   * @returns {CoverageGap[]} Missing implementation gaps
   */
  async detectMissingImplementations(specifications, implementations) {
    const gaps = [];

    for (const requirement of specifications.requirements) {
      const hasImplementation = this.findImplementationForRequirement(requirement, implementations);

      if (!hasImplementation) {
        const gap = CoverageGap.createMissingImplementationGap(
          requirement.id,
          {
            requirement_text: requirement.text,
            source_file: requirement.source_file,
            requirement_type: requirement.type
          },
          {
            severity: this.determineMissingImplementationSeverity(requirement),
            confidence_score: 0.9
          }
        );

        gaps.push(gap);
      }
    }

    return gaps;
  }

  /**
   * Detect specification drift
   * @param {Object} specifications - Parsed specifications
   * @param {Object} implementations - Parsed implementations
   * @returns {CoverageGap[]} Specification drift gaps
   */
  async detectSpecificationDrift(specifications, implementations) {
    const gaps = [];

    for (const requirement of specifications.requirements) {
      const implementation = this.findImplementationForRequirement(requirement, implementations);

      if (implementation) {
        const drift = this.analyzeDrift(requirement, implementation);

        if (drift.has_drift) {
          const gap = CoverageGap.createSpecificationDriftGap(
            requirement.id,
            {
              requirement_text: requirement.text,
              source_file: requirement.source_file
            },
            {
              file_paths: [implementation.file_path],
              implementation_status: 'incorrect',
              code_snippets: [implementation.relevant_code || '']
            },
            drift.analysis,
            {
              severity: drift.severity,
              confidence_score: drift.confidence
            }
          );

          gaps.push(gap);
        }
      }
    }

    return gaps;
  }

  /**
   * Analyze test coverage gaps
   * @param {Object} specifications - Parsed specifications
   * @param {Object} implementations - Parsed implementations
   * @param {Array} testArtifacts - Test artifacts
   * @returns {CoverageGap[]} Test coverage gaps
   */
  async analyzeTestCoverage(specifications, implementations, testArtifacts) {
    const gaps = [];

    // Parse test artifacts
    const tests = await this.parseTestArtifacts(testArtifacts);

    for (const requirement of specifications.requirements) {
      const testCoverage = this.analyzeRequirementTestCoverage(requirement, tests);

      if (testCoverage.coverage_percentage < 70) {
        const gap = CoverageGap.createTestCoverageGap(
          requirement.id,
          {
            missing_test_scenarios: testCoverage.missing_scenarios,
            coverage_percentage: testCoverage.coverage_percentage,
            test_types_missing: testCoverage.missing_test_types,
            recommendation: testCoverage.recommendation
          },
          {
            severity: testCoverage.coverage_percentage < 30 ? 'HIGH' : 'MEDIUM',
            confidence_score: 0.8
          }
        );

        gaps.push(gap);
      }
    }

    return gaps;
  }

  /**
   * Find implementation for a requirement
   * @param {Object} requirement - Requirement
   * @param {Object} implementations - Implementations
   * @returns {Object|null} Found implementation
   */
  findImplementationForRequirement(requirement, implementations) {
    const requirementKeywords = this.extractKeywords(requirement.text);

    // Look for matching functions, classes, or exports
    for (const file of implementations.files) {
      // Check functions
      for (const func of file.functions) {
        if (this.matchesKeywords(func.name, requirementKeywords)) {
          return {
            type: 'function',
            name: func.name,
            file_path: file.file_path,
            line_number: func.line_number
          };
        }
      }

      // Check classes
      for (const cls of file.classes) {
        if (this.matchesKeywords(cls.name, requirementKeywords)) {
          return {
            type: 'class',
            name: cls.name,
            file_path: file.file_path,
            line_number: cls.line_number
          };
        }
      }
    }

    return null;
  }

  /**
   * Analyze drift between requirement and implementation
   * @param {Object} requirement - Requirement
   * @param {Object} implementation - Implementation
   * @returns {Object} Drift analysis
   */
  analyzeDrift(requirement, implementation) {
    const analysis = {
      has_drift: false,
      severity: 'LOW',
      confidence: 0.5,
      analysis: {}
    };

    // Simple drift detection based on naming and content analysis
    const requirementKeywords = this.extractKeywords(requirement.text);
    const implementationName = implementation.name.toLowerCase();

    // Check for technology/approach mismatches
    if (requirement.text.toLowerCase().includes('oauth') && !implementationName.includes('oauth')) {
      analysis.has_drift = true;
      analysis.severity = 'HIGH';
      analysis.confidence = 0.8;
      analysis.analysis = {
        divergence_type: 'technology',
        specified_technology: 'OAuth',
        implemented_technology: 'Unknown/Alternative',
        drift_magnitude: 'HIGH'
      };
    }

    // Check for naming mismatches
    const nameMatch = requirementKeywords.some(keyword =>
      implementationName.includes(keyword.toLowerCase())
    );

    if (!nameMatch && requirementKeywords.length > 0) {
      analysis.has_drift = true;
      analysis.severity = 'MEDIUM';
      analysis.confidence = 0.6;
      analysis.analysis = {
        divergence_type: 'approach',
        drift_magnitude: 'MEDIUM'
      };
    }

    return analysis;
  }

  /**
   * Parse test artifacts
   * @param {Array} testArtifacts - Test artifacts
   * @returns {Object} Parsed tests
   */
  async parseTestArtifacts(testArtifacts) {
    const tests = {
      test_files: [],
      test_cases: [],
      coverage_info: {}
    };

    for (const artifact of testArtifacts) {
      const parsed = await this.parseTestArtifact(artifact);
      tests.test_files.push(parsed);
      tests.test_cases.push(...parsed.test_cases);
    }

    return tests;
  }

  /**
   * Parse a single test artifact
   * @param {Object} artifact - Test artifact
   * @returns {Object} Parsed test
   */
  async parseTestArtifact(artifact) {
    const content = artifact.content;
    const parsed = {
      file_path: artifact.path,
      test_cases: [],
      test_suites: []
    };

    // Extract test cases
    const testPatterns = [
      /test\s*\(\s*['"`](.+?)['"`]/g,
      /it\s*\(\s*['"`](.+?)['"`]/g,
      /describe\s*\(\s*['"`](.+?)['"`]/g
    ];

    testPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        parsed.test_cases.push({
          name: match[1],
          line_number: this.findLineNumber(content, match.index),
          type: match[0].includes('describe') ? 'suite' : 'test'
        });
      }
    });

    return parsed;
  }

  /**
   * Analyze test coverage for a requirement
   * @param {Object} requirement - Requirement
   * @param {Object} tests - Parsed tests
   * @returns {Object} Coverage analysis
   */
  analyzeRequirementTestCoverage(requirement, tests) {
    const requirementKeywords = this.extractKeywords(requirement.text);
    const matchingTests = tests.test_cases.filter(test =>
      requirementKeywords.some(keyword =>
        test.name.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    const coveragePercentage = Math.min(100, (matchingTests.length / Math.max(requirementKeywords.length, 1)) * 100);

    return {
      coverage_percentage: coveragePercentage,
      matching_tests: matchingTests.length,
      missing_scenarios: this.identifyMissingTestScenarios(requirement, matchingTests),
      missing_test_types: this.identifyMissingTestTypes(requirement, matchingTests),
      recommendation: this.generateTestRecommendation(requirement, coveragePercentage)
    };
  }

  /**
   * Assess artifact quality
   * @param {Object} artifact - Artifact to assess
   * @param {Object} criteria - Quality criteria
   * @returns {Object} Quality assessment
   */
  async assessArtifactQuality(artifact, criteria) {
    const assessment = {
      artifact_path: artifact.path,
      assessment_type: 'code_quality',
      assessment_result: 'PASS',
      quality_score: 1.0,
      issues_found: []
    };

    const content = artifact.content;

    // Constitutional compliance check
    if (criteria.check_constitutional_compliance) {
      const constitutionalIssues = this.checkConstitutionalCompliance(content);
      if (constitutionalIssues.length > 0) {
        assessment.assessment_result = 'FAIL';
        assessment.quality_score -= 0.3;
        assessment.issues_found.push(...constitutionalIssues);
      }
    }

    // Performance standards check
    if (criteria.check_performance_standards) {
      const performanceIssues = this.checkPerformanceStandards(content);
      if (performanceIssues.length > 0) {
        assessment.assessment_result = 'WARNING';
        assessment.quality_score -= 0.2;
        assessment.issues_found.push(...performanceIssues);
      }
    }

    // Security practices check
    if (criteria.check_security_practices) {
      const securityIssues = this.checkSecurityPractices(content);
      if (securityIssues.length > 0) {
        assessment.assessment_result = 'FAIL';
        assessment.quality_score -= 0.4;
        assessment.issues_found.push(...securityIssues);
      }
    }

    assessment.quality_score = Math.max(0, assessment.quality_score);

    return assessment;
  }

  /**
   * Check constitutional compliance in code
   * @param {string} content - Code content
   * @returns {Object[]} Constitutional issues
   */
  checkConstitutionalCompliance(content) {
    const issues = [];

    // Check for custom coordinators (swarm-first violation)
    if (/class\s+\w*[Cc]oordinator/g.test(content) || /new\s+\w*[Cc]oordinator/g.test(content)) {
      issues.push({
        principle_violated: 'swarm-first',
        violation_description: 'Custom coordinator implementation detected',
        remediation_suggestion: 'Use enhanced-swarm-orchestrator.js instead'
      });
    }

    // Check for missing test references (test-first violation)
    if (content.includes('function') || content.includes('class')) {
      if (!content.includes('test') && !content.includes('spec')) {
        issues.push({
          principle_violated: 'test-first',
          violation_description: 'Implementation without test references',
          remediation_suggestion: 'Add contract tests before implementation'
        });
      }
    }

    return issues;
  }

  /**
   * Check performance standards compliance
   * @param {string} content - Code content
   * @returns {Object[]} Performance issues
   */
  checkPerformanceStandards(content) {
    const issues = [];

    // Check for potential performance issues
    if (content.includes('setTimeout') && /setTimeout\s*\(\s*\w+\s*,\s*([5-9]\d{2,}|\d{4,})/g.test(content)) {
      issues.push({
        issue_type: 'timing_violation',
        description: 'setTimeout with duration > 500ms may violate constitutional limits',
        recommendation: 'Review timing requirements against constitutional standards'
      });
    }

    // Check for synchronous operations in async contexts
    if (content.includes('async') && /for\s*\([^)]*\)\s*\{[^}]*(?:await|\.then)/g.test(content)) {
      issues.push({
        issue_type: 'performance_antipattern',
        description: 'Sequential async operations in loop may cause performance issues',
        recommendation: 'Consider Promise.all() for parallel execution'
      });
    }

    return issues;
  }

  /**
   * Check security practices
   * @param {string} content - Code content
   * @returns {Object[]} Security issues
   */
  checkSecurityPractices(content) {
    const issues = [];

    // Check for hardcoded credentials
    if (/(?:password|token|key|secret)\s*[:=]\s*['"`][^'"`]+['"`]/gi.test(content)) {
      issues.push({
        issue_type: 'hardcoded_credentials',
        description: 'Potential hardcoded credentials detected',
        recommendation: 'Use environment variables or secure configuration'
      });
    }

    // Check for SQL injection risks
    if (/(?:query|sql)\s*\+|`[^`]*\$\{[^}]*\}[^`]*`/gi.test(content)) {
      issues.push({
        issue_type: 'sql_injection_risk',
        description: 'Potential SQL injection vulnerability',
        recommendation: 'Use parameterized queries or prepared statements'
      });
    }

    return issues;
  }

  /**
   * Apply gap filters
   * @param {CoverageGapCollection} gaps - Gaps to filter
   * @param {Object} options - Filter options
   * @returns {CoverageGapCollection} Filtered gaps
   */
  applyGapFilters(gaps, options) {
    const filtered = new CoverageGapCollection();

    gaps.gaps.forEach(gap => {
      let include = true;

      // Apply severity filter
      if (options.severity_threshold) {
        const severityLevels = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        if (severityLevels[gap.severity] > severityLevels[options.severity_threshold]) {
          include = false;
        }
      }

      // Apply gap type filter
      if (options.gap_types && !options.gap_types.includes(gap.gap_type)) {
        include = false;
      }

      if (include) {
        // Add remediation if requested
        if (options.include_remediation && !gap.remediation_suggestion.action_required) {
          gap.generateRemediationSuggestion();
        }

        filtered.add(gap);
      }
    });

    return filtered;
  }

  /**
   * Utility methods
   */

  extractKeywords(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !['must', 'shall', 'will', 'should', 'the', 'and', 'for', 'with'].includes(word));
  }

  matchesKeywords(name, keywords) {
    const nameLower = name.toLowerCase();
    return keywords.some(keyword => nameLower.includes(keyword) || keyword.includes(nameLower));
  }

  findLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  classifyRequirementType(text) {
    if (text.includes('performance') || text.includes('speed') || text.includes('time')) {
      return 'performance';
    }
    if (text.includes('security') || text.includes('auth') || text.includes('encrypt')) {
      return 'security';
    }
    if (text.includes('user') || text.includes('interface') || text.includes('display')) {
      return 'functional';
    }
    return 'general';
  }

  determineMissingImplementationSeverity(requirement) {
    if (requirement.type === 'security') return 'CRITICAL';
    if (requirement.text.includes('MUST')) return 'HIGH';
    if (requirement.text.includes('SHALL')) return 'HIGH';
    return 'MEDIUM';
  }

  identifyMissingTestScenarios(requirement, existingTests) {
    const scenarios = [];
    const text = requirement.text.toLowerCase();

    if (text.includes('error') && !existingTests.some(t => t.name.includes('error'))) {
      scenarios.push('Error handling test scenarios');
    }

    if (text.includes('performance') && !existingTests.some(t => t.name.includes('performance'))) {
      scenarios.push('Performance validation test scenarios');
    }

    if (text.includes('security') && !existingTests.some(t => t.name.includes('security'))) {
      scenarios.push('Security validation test scenarios');
    }

    return scenarios;
  }

  identifyMissingTestTypes(requirement, existingTests) {
    const missing = [];

    if (requirement.type === 'performance' && !existingTests.some(t => t.name.includes('performance'))) {
      missing.push('performance');
    }

    if (requirement.type === 'security' && !existingTests.some(t => t.name.includes('security'))) {
      missing.push('security');
    }

    if (!existingTests.some(t => t.name.includes('integration'))) {
      missing.push('integration');
    }

    return missing;
  }

  generateTestRecommendation(requirement, coveragePercentage) {
    if (coveragePercentage < 30) {
      return 'Critical: Implement comprehensive test coverage including unit, integration, and end-to-end tests';
    } else if (coveragePercentage < 70) {
      return 'Moderate: Add missing test scenarios and improve coverage for edge cases';
    } else {
      return 'Good: Consider adding performance and security-specific test cases';
    }
  }

  calculateQualityGrade(score) {
    if (score >= 0.9) return 'A';
    if (score >= 0.8) return 'B';
    if (score >= 0.7) return 'C';
    if (score >= 0.6) return 'D';
    return 'F';
  }

  consolidateAnalysisResults(results) {
    // Consolidate multiple analysis results into a single gap collection
    const consolidated = new CoverageGapCollection();

    results.forEach(result => {
      if (result.coverage_gaps) {
        result.coverage_gaps.forEach(gapData => {
          const gap = CoverageGap.fromJSON(gapData);
          consolidated.add(gap);
        });
      }
    });

    return consolidated;
  }

  generateReportContent(gaps, options) {
    const format = options.format || 'markdown';

    if (format === 'markdown') {
      return this.generateMarkdownReport(gaps, options);
    } else if (format === 'json') {
      return JSON.stringify(gaps.toJSON(), null, 2);
    }

    return gaps.toJSON();
  }

  generateMarkdownReport(gaps, options) {
    let report = '# Coverage Gap Analysis Report\n\n';

    const summary = gaps.getCoverageSummary();
    report += `## Summary\n\n`;
    report += `- Total Gaps: ${summary.total_gaps}\n`;
    report += `- Coverage: ${Math.round(summary.coverage_percentage)}%\n`;
    report += `- Blocking Issues: ${summary.blocking_gaps}\n\n`;

    if (gaps.gaps.length > 0) {
      report += `## Gaps by Type\n\n`;

      const byType = {};
      gaps.gaps.forEach(gap => {
        if (!byType[gap.gap_type]) byType[gap.gap_type] = [];
        byType[gap.gap_type].push(gap);
      });

      Object.keys(byType).forEach(type => {
        report += `### ${type}\n\n`;
        byType[type].forEach(gap => {
          report += `- **${gap.requirement_reference}**: ${gap.description}\n`;
        });
        report += '\n';
      });
    }

    return report;
  }

  generateReportSummary(gaps) {
    const summary = gaps.getCoverageSummary();

    return {
      total_gaps: summary.total_gaps,
      critical_gaps: gaps.getBySeverity('CRITICAL').length,
      coverage_percentage: summary.coverage_percentage,
      remediation_priority_order: gaps.generateRemediationPlan().prioritized_actions.slice(0, 5).map(action => ({
        gap_id: action.gap_id,
        priority: action.priority,
        description: action.remediation_plan.action_required
      }))
    };
  }

  generateRemediationPlan(gaps) {
    return gaps.generateRemediationPlan();
  }

  generateAnalysisId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CGA-${timestamp}-${random}`;
  }

  generateReportId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CGR-${timestamp}-${random}`;
  }
}