/**
 * Coverage Gap Model
 * Represents gaps between specifications and implementation
 * Supports the coverage gap analysis framework
 */

/**
 * Represents a coverage gap between specification and implementation
 */
export class CoverageGap {
  constructor(options = {}) {
    this.id = options.id || this.generateId();
    this.gap_id = options.gap_id || this.id;
    this.gap_type = options.gap_type || 'missing_implementation'; // missing_implementation, specification_drift, test_coverage, incomplete_implementation
    this.severity = options.severity || 'MEDIUM'; // CRITICAL, HIGH, MEDIUM, LOW
    this.requirement_reference = options.requirement_reference || '';
    this.specification_evidence = options.specification_evidence || {};
    this.implementation_evidence = options.implementation_evidence || {};
    this.description = options.description || '';
    this.detected_at = options.detected_at || new Date().toISOString();
    this.confidence_score = options.confidence_score || 0.8;
    this.impact_assessment = options.impact_assessment || {};
    this.remediation_suggestion = options.remediation_suggestion || {};
    this.drift_analysis = options.drift_analysis || null;
    this.test_analysis = options.test_analysis || null;
    this.coverage_metrics = options.coverage_metrics || {};
    this.metadata = options.metadata || {};
  }

  /**
   * Generate unique gap ID
   * @returns {string} Gap ID
   */
  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CG-${timestamp}-${random}`;
  }

  /**
   * Validate gap data structure
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!this.gap_type) {
      errors.push('Gap type is required');
    } else if (!this.isValidGapType(this.gap_type)) {
      errors.push(`Invalid gap type: ${this.gap_type}`);
    }

    if (!this.severity) {
      errors.push('Severity level is required');
    } else if (!this.isValidSeverity(this.severity)) {
      errors.push(`Invalid severity level: ${this.severity}`);
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!this.requirement_reference || this.requirement_reference.trim().length === 0) {
      warnings.push('Missing requirement reference - may hinder traceability');
    }

    // Confidence score validation
    if (this.confidence_score < 0 || this.confidence_score > 1) {
      errors.push('Confidence score must be between 0 and 1');
    }

    // Type-specific validation
    if (this.gap_type === 'specification_drift' && !this.drift_analysis) {
      warnings.push('Specification drift gaps should include drift analysis');
    }

    if (this.gap_type === 'test_coverage' && !this.test_analysis) {
      warnings.push('Test coverage gaps should include test analysis');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if gap type is valid
   * @param {string} type - Gap type
   * @returns {boolean} True if valid
   */
  isValidGapType(type) {
    const validTypes = [
      'missing_implementation',
      'specification_drift',
      'test_coverage',
      'incomplete_implementation',
      'quality_gap',
      'performance_gap',
      'security_gap'
    ];
    return validTypes.includes(type);
  }

  /**
   * Check if severity level is valid
   * @param {string} severity - Severity level
   * @returns {boolean} True if valid
   */
  isValidSeverity(severity) {
    const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    return validSeverities.includes(severity);
  }

  /**
   * Set specification evidence
   * @param {Object} evidence - Specification evidence
   */
  setSpecificationEvidence(evidence) {
    if (!evidence || typeof evidence !== 'object') {
      throw new Error('Specification evidence must be a valid object');
    }

    this.specification_evidence = {
      file_path: evidence.file_path || '',
      line_number: evidence.line_number || null,
      requirement_text: evidence.requirement_text || '',
      section: evidence.section || '',
      requirement_type: evidence.requirement_type || 'functional',
      priority: evidence.priority || 'MEDIUM',
      acceptance_criteria: evidence.acceptance_criteria || [],
      related_requirements: evidence.related_requirements || []
    };
  }

  /**
   * Set implementation evidence
   * @param {Object} evidence - Implementation evidence
   */
  setImplementationEvidence(evidence) {
    if (!evidence || typeof evidence !== 'object') {
      throw new Error('Implementation evidence must be a valid object');
    }

    this.implementation_evidence = {
      file_paths: evidence.file_paths || [],
      code_snippets: evidence.code_snippets || [],
      implementation_status: evidence.implementation_status || 'missing', // missing, partial, complete, incorrect
      implementation_quality: evidence.implementation_quality || 'unknown',
      test_coverage: evidence.test_coverage || 0,
      documentation_status: evidence.documentation_status || 'missing',
      last_modified: evidence.last_modified || null
    };
  }

  /**
   * Set drift analysis for specification drift gaps
   * @param {Object} analysis - Drift analysis data
   */
  setDriftAnalysis(analysis) {
    if (this.gap_type !== 'specification_drift') {
      throw new Error('Drift analysis only applicable to specification_drift gaps');
    }

    this.drift_analysis = {
      divergence_type: analysis.divergence_type || 'unknown', // technology, approach, requirements, implementation
      specified_technology: analysis.specified_technology || '',
      implemented_technology: analysis.implemented_technology || '',
      drift_magnitude: analysis.drift_magnitude || 'MEDIUM', // LOW, MEDIUM, HIGH, CRITICAL
      impact_assessment: analysis.impact_assessment || '',
      migration_effort: analysis.migration_effort || 'MEDIUM',
      backwards_compatibility: analysis.backwards_compatibility || false,
      risk_level: analysis.risk_level || 'MEDIUM'
    };
  }

  /**
   * Set test analysis for test coverage gaps
   * @param {Object} analysis - Test analysis data
   */
  setTestAnalysis(analysis) {
    if (this.gap_type !== 'test_coverage') {
      throw new Error('Test analysis only applicable to test_coverage gaps');
    }

    this.test_analysis = {
      missing_test_scenarios: analysis.missing_test_scenarios || [],
      coverage_percentage: analysis.coverage_percentage || 0,
      test_types_missing: analysis.test_types_missing || [], // unit, integration, e2e, performance
      critical_paths_untested: analysis.critical_paths_untested || [],
      edge_cases_missing: analysis.edge_cases_missing || [],
      recommendation: analysis.recommendation || '',
      effort_estimate: analysis.effort_estimate || 'MEDIUM'
    };
  }

  /**
   * Set impact assessment
   * @param {Object} impact - Impact assessment data
   */
  setImpactAssessment(impact) {
    this.impact_assessment = {
      functional_impact: impact.functional_impact || 'MEDIUM', // LOW, MEDIUM, HIGH, CRITICAL
      user_impact: impact.user_impact || 'MEDIUM',
      security_impact: impact.security_impact || 'LOW',
      performance_impact: impact.performance_impact || 'LOW',
      maintainability_impact: impact.maintainability_impact || 'MEDIUM',
      business_impact: impact.business_impact || 'MEDIUM',
      technical_debt: impact.technical_debt || 'MEDIUM',
      compliance_impact: impact.compliance_impact || 'LOW'
    };
  }

  /**
   * Generate remediation suggestion
   * @param {Object} options - Remediation options
   * @returns {Object} Remediation suggestion
   */
  generateRemediationSuggestion(options = {}) {
    const suggestion = {
      gap_id: this.id,
      action_required: '',
      implementation_guidance: '',
      estimated_effort: this.estimateRemediationEffort(),
      priority: this.getPriorityFromSeverity(),
      steps: [],
      resources_needed: [],
      constitutional_guidance: ''
    };

    switch (this.gap_type) {
      case 'missing_implementation':
        suggestion.action_required = 'Implement missing functionality';
        suggestion.implementation_guidance = this.generateImplementationGuidance();
        suggestion.steps = [
          'Analyze requirement specifications',
          'Design implementation approach',
          'Write contract tests (TDD)',
          'Implement functionality',
          'Validate against requirements',
          'Update documentation'
        ];
        suggestion.resources_needed = ['development time', 'specification documents', 'test frameworks'];
        break;

      case 'specification_drift':
        suggestion.action_required = 'Align implementation with specification';
        suggestion.implementation_guidance = this.generateDriftCorrection();
        suggestion.steps = [
          'Assess current implementation',
          'Compare with specification requirements',
          'Plan migration strategy',
          'Implement changes incrementally',
          'Validate compliance',
          'Update documentation'
        ];
        suggestion.resources_needed = ['migration plan', 'testing resources', 'validation tools'];
        break;

      case 'test_coverage':
        suggestion.action_required = 'Implement missing test coverage';
        suggestion.implementation_guidance = this.generateTestGuidance();
        suggestion.steps = [
          'Identify untested scenarios',
          'Write missing test cases',
          'Implement test automation',
          'Validate test coverage metrics',
          'Integrate with CI/CD pipeline'
        ];
        suggestion.resources_needed = ['test frameworks', 'coverage tools', 'automation infrastructure'];
        break;

      case 'incomplete_implementation':
        suggestion.action_required = 'Complete partial implementation';
        suggestion.implementation_guidance = 'Finish implementing missing parts of the feature';
        suggestion.steps = [
          'Identify incomplete areas',
          'Plan completion strategy',
          'Implement missing components',
          'Test integration',
          'Validate completeness'
        ];
        break;

      case 'quality_gap':
        suggestion.action_required = 'Improve implementation quality';
        suggestion.implementation_guidance = 'Refactor code to meet quality standards';
        suggestion.steps = [
          'Run quality analysis',
          'Identify improvement areas',
          'Refactor code',
          'Add proper error handling',
          'Improve documentation'
        ];
        break;

      case 'performance_gap':
        suggestion.action_required = 'Optimize performance';
        suggestion.implementation_guidance = 'Improve performance to meet constitutional standards';
        suggestion.steps = [
          'Profile performance bottlenecks',
          'Implement optimizations',
          'Validate performance improvements',
          'Monitor ongoing performance'
        ];
        suggestion.constitutional_guidance = 'Ensure performance meets constitutional timing limits';
        break;

      case 'security_gap':
        suggestion.action_required = 'Address security vulnerabilities';
        suggestion.implementation_guidance = 'Implement proper security measures';
        suggestion.steps = [
          'Conduct security assessment',
          'Implement security controls',
          'Validate security measures',
          'Document security practices'
        ];
        break;
    }

    // Add constitutional compliance guidance
    if (this.requiresConstitutionalGuidance()) {
      suggestion.constitutional_guidance = this.generateConstitutionalGuidance();
    }

    this.remediation_suggestion = suggestion;
    return suggestion;
  }

  /**
   * Generate implementation guidance based on gap type
   * @returns {string} Implementation guidance
   */
  generateImplementationGuidance() {
    const requirement = this.specification_evidence.requirement_text || '';

    let guidance = 'Implement the missing functionality according to specification requirements. ';

    // Add specific guidance based on requirement content
    if (requirement.toLowerCase().includes('authentication')) {
      guidance += 'Implement secure authentication using established patterns. ';
    }

    if (requirement.toLowerCase().includes('validation')) {
      guidance += 'Add input validation with proper error handling. ';
    }

    if (requirement.toLowerCase().includes('performance') || requirement.toLowerCase().includes('speed')) {
      guidance += 'Ensure implementation meets constitutional performance standards. ';
    }

    if (requirement.toLowerCase().includes('user') || requirement.toLowerCase().includes('interface')) {
      guidance += 'Maintain character-consistent user experience throughout. ';
    }

    return guidance;
  }

  /**
   * Generate drift correction guidance
   * @returns {string} Drift correction guidance
   */
  generateDriftCorrection() {
    if (!this.drift_analysis) {
      return 'Analyze the drift between specification and implementation, then align accordingly.';
    }

    let guidance = `Current implementation uses ${this.drift_analysis.implemented_technology} while specification requires ${this.drift_analysis.specified_technology}. `;

    switch (this.drift_analysis.drift_magnitude) {
      case 'LOW':
        guidance += 'Minor adjustments needed to align with specification. ';
        break;
      case 'MEDIUM':
        guidance += 'Significant changes required to meet specification requirements. ';
        break;
      case 'HIGH':
        guidance += 'Major refactoring needed to align with specification. ';
        break;
      case 'CRITICAL':
        guidance += 'Complete reimplementation may be necessary to meet specification. ';
        break;
    }

    if (this.drift_analysis.backwards_compatibility) {
      guidance += 'Maintain backwards compatibility during migration. ';
    } else {
      guidance += 'Breaking changes may be necessary - plan migration carefully. ';
    }

    return guidance;
  }

  /**
   * Generate test guidance
   * @returns {string} Test guidance
   */
  generateTestGuidance() {
    if (!this.test_analysis) {
      return 'Implement comprehensive test coverage for the missing functionality.';
    }

    let guidance = `Current test coverage is ${this.test_analysis.coverage_percentage}%. `;

    if (this.test_analysis.missing_test_scenarios.length > 0) {
      guidance += `Missing test scenarios: ${this.test_analysis.missing_test_scenarios.slice(0, 3).join(', ')}`;
      if (this.test_analysis.missing_test_scenarios.length > 3) {
        guidance += ` and ${this.test_analysis.missing_test_scenarios.length - 3} more. `;
      } else {
        guidance += '. ';
      }
    }

    if (this.test_analysis.test_types_missing.length > 0) {
      guidance += `Missing test types: ${this.test_analysis.test_types_missing.join(', ')}. `;
    }

    guidance += 'Follow TDD approach: write tests first, ensure they fail, then implement. ';

    return guidance;
  }

  /**
   * Check if gap requires constitutional guidance
   * @returns {boolean} True if constitutional guidance needed
   */
  requiresConstitutionalGuidance() {
    const requirement = this.specification_evidence.requirement_text || '';
    const description = this.description.toLowerCase();

    const constitutionalKeywords = [
      'swarm', 'orchestrat', 'coordinat', 'test', 'animation', 'performance',
      'character', 'feedback', 'user experience'
    ];

    return constitutionalKeywords.some(keyword =>
      requirement.toLowerCase().includes(keyword) || description.includes(keyword)
    );
  }

  /**
   * Generate constitutional guidance
   * @returns {string} Constitutional guidance
   */
  generateConstitutionalGuidance() {
    const requirement = this.specification_evidence.requirement_text || '';
    const description = this.description.toLowerCase();

    let guidance = '';

    if (requirement.toLowerCase().includes('coordinat') || requirement.toLowerCase().includes('orchestrat')) {
      guidance += 'Use enhanced-swarm-orchestrator.js for task coordination - no custom coordinators. ';
    }

    if (description.includes('test') || requirement.toLowerCase().includes('test')) {
      guidance += 'Follow test-first development: write tests before implementation. ';
    }

    if (requirement.toLowerCase().includes('animation')) {
      guidance += 'Ensure animations complete within 500ms constitutional limit. ';
    }

    if (requirement.toLowerCase().includes('analysis')) {
      guidance += 'Ensure analysis completes within 100ms constitutional limit. ';
    }

    if (requirement.toLowerCase().includes('character') || requirement.toLowerCase().includes('feedback')) {
      guidance += 'Maintain Spec the Golden Retriever personality: friendly, honest, fun (not cringe). ';
    }

    return guidance;
  }

  /**
   * Estimate remediation effort in hours
   * @returns {number} Estimated hours
   */
  estimateRemediationEffort() {
    const baseEffort = {
      'missing_implementation': 8,
      'specification_drift': 12,
      'test_coverage': 4,
      'incomplete_implementation': 6,
      'quality_gap': 4,
      'performance_gap': 6,
      'security_gap': 8
    };

    const severityMultiplier = {
      'CRITICAL': 2.0,
      'HIGH': 1.5,
      'MEDIUM': 1.0,
      'LOW': 0.5
    };

    const base = baseEffort[this.gap_type] || 6;
    const multiplier = severityMultiplier[this.severity] || 1.0;

    // Additional complexity factors
    let complexityMultiplier = 1.0;

    if (this.drift_analysis && this.drift_analysis.drift_magnitude === 'CRITICAL') {
      complexityMultiplier += 0.5;
    }

    if (this.test_analysis && this.test_analysis.coverage_percentage < 50) {
      complexityMultiplier += 0.3;
    }

    if (this.requiresConstitutionalGuidance()) {
      complexityMultiplier += 0.2;
    }

    return Math.ceil(base * multiplier * complexityMultiplier);
  }

  /**
   * Get priority level from severity
   * @returns {string} Priority level
   */
  getPriorityFromSeverity() {
    const severityToPriority = {
      'CRITICAL': 'CRITICAL',
      'HIGH': 'HIGH',
      'MEDIUM': 'MEDIUM',
      'LOW': 'LOW'
    };
    return severityToPriority[this.severity] || 'MEDIUM';
  }

  /**
   * Check if gap blocks implementation
   * @returns {boolean} True if blocking
   */
  isBlocking() {
    if (this.severity === 'CRITICAL') {
      return true;
    }

    if (this.gap_type === 'missing_implementation' && this.severity === 'HIGH') {
      return true;
    }

    if (this.gap_type === 'security_gap' && (this.severity === 'HIGH' || this.severity === 'CRITICAL')) {
      return true;
    }

    return false;
  }

  /**
   * Calculate coverage percentage for this gap
   * @returns {number} Coverage percentage (0-1)
   */
  calculateCoveragePercentage() {
    const status = this.implementation_evidence.implementation_status;

    switch (status) {
      case 'complete':
        return 1.0;
      case 'partial':
        return 0.5;
      case 'missing':
        return 0.0;
      case 'incorrect':
        return 0.2;
      default:
        return 0.0;
    }
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      gap_id: this.gap_id,
      gap_type: this.gap_type,
      severity: this.severity,
      requirement_reference: this.requirement_reference,
      specification_evidence: this.specification_evidence,
      implementation_evidence: this.implementation_evidence,
      description: this.description,
      detected_at: this.detected_at,
      confidence_score: this.confidence_score,
      impact_assessment: this.impact_assessment,
      remediation_suggestion: this.remediation_suggestion,
      drift_analysis: this.drift_analysis,
      test_analysis: this.test_analysis,
      coverage_metrics: this.coverage_metrics,
      metadata: this.metadata
    };
  }

  /**
   * Create gap from JSON data
   * @param {Object} data - JSON data
   * @returns {CoverageGap} Gap instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for CoverageGap');
    }

    return new CoverageGap(data);
  }

  /**
   * Create missing implementation gap
   * @param {string} requirementId - Requirement ID
   * @param {Object} specification - Specification evidence
   * @param {Object} options - Gap options
   * @returns {CoverageGap} Missing implementation gap
   */
  static createMissingImplementationGap(requirementId, specification, options = {}) {
    const gap = new CoverageGap({
      gap_type: 'missing_implementation',
      requirement_reference: requirementId,
      severity: options.severity || 'HIGH',
      description: `Missing implementation for requirement ${requirementId}`,
      ...options
    });

    gap.setSpecificationEvidence(specification);
    gap.setImplementationEvidence({
      implementation_status: 'missing',
      file_paths: [],
      code_snippets: []
    });

    return gap;
  }

  /**
   * Create specification drift gap
   * @param {string} requirementId - Requirement ID
   * @param {Object} specification - Specification evidence
   * @param {Object} implementation - Implementation evidence
   * @param {Object} driftAnalysis - Drift analysis
   * @param {Object} options - Gap options
   * @returns {CoverageGap} Specification drift gap
   */
  static createSpecificationDriftGap(requirementId, specification, implementation, driftAnalysis, options = {}) {
    const gap = new CoverageGap({
      gap_type: 'specification_drift',
      requirement_reference: requirementId,
      severity: options.severity || 'HIGH',
      description: `Specification drift detected for requirement ${requirementId}`,
      ...options
    });

    gap.setSpecificationEvidence(specification);
    gap.setImplementationEvidence(implementation);
    gap.setDriftAnalysis(driftAnalysis);

    return gap;
  }

  /**
   * Create test coverage gap
   * @param {string} requirementId - Requirement ID
   * @param {Object} testAnalysis - Test analysis
   * @param {Object} options - Gap options
   * @returns {CoverageGap} Test coverage gap
   */
  static createTestCoverageGap(requirementId, testAnalysis, options = {}) {
    const gap = new CoverageGap({
      gap_type: 'test_coverage',
      requirement_reference: requirementId,
      severity: options.severity || 'MEDIUM',
      description: `Insufficient test coverage for requirement ${requirementId}`,
      ...options
    });

    gap.setTestAnalysis(testAnalysis);

    return gap;
  }
}

/**
 * Coverage Gap Collection
 * Manages collections of coverage gaps with analysis capabilities
 */
export class CoverageGapCollection {
  constructor() {
    this.gaps = [];
  }

  /**
   * Add gap to collection
   * @param {CoverageGap} gap - Gap to add
   */
  add(gap) {
    if (!(gap instanceof CoverageGap)) {
      throw new Error('Must be a CoverageGap instance');
    }

    this.gaps.push(gap);
  }

  /**
   * Remove gap by ID
   * @param {string} gapId - Gap ID
   * @returns {boolean} True if removed
   */
  remove(gapId) {
    const index = this.gaps.findIndex(g => g.id === gapId);
    if (index >= 0) {
      this.gaps.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get gaps by type
   * @param {string} type - Gap type
   * @returns {CoverageGap[]} Filtered gaps
   */
  getByType(type) {
    return this.gaps.filter(g => g.gap_type === type);
  }

  /**
   * Get gaps by severity
   * @param {string} severity - Severity level
   * @returns {CoverageGap[]} Filtered gaps
   */
  getBySeverity(severity) {
    return this.gaps.filter(g => g.severity === severity);
  }

  /**
   * Get blocking gaps
   * @returns {CoverageGap[]} Blocking gaps
   */
  getBlocking() {
    return this.gaps.filter(g => g.isBlocking());
  }

  /**
   * Calculate overall coverage percentage
   * @returns {number} Overall coverage percentage (0-1)
   */
  calculateOverallCoverage() {
    if (this.gaps.length === 0) {
      return 1.0;
    }

    const totalCoverage = this.gaps.reduce((sum, gap) => {
      return sum + gap.calculateCoveragePercentage();
    }, 0);

    return totalCoverage / this.gaps.length;
  }

  /**
   * Get coverage summary
   * @returns {Object} Coverage summary
   */
  getCoverageSummary() {
    const summary = {
      total_gaps: this.gaps.length,
      coverage_percentage: this.calculateOverallCoverage() * 100,
      by_type: {},
      by_severity: {},
      blocking_gaps: 0,
      total_remediation_effort: 0
    };

    this.gaps.forEach(gap => {
      // Count by type
      summary.by_type[gap.gap_type] = (summary.by_type[gap.gap_type] || 0) + 1;

      // Count by severity
      summary.by_severity[gap.severity] = (summary.by_severity[gap.severity] || 0) + 1;

      // Count blocking gaps
      if (gap.isBlocking()) {
        summary.blocking_gaps++;
      }

      // Sum remediation effort
      summary.total_remediation_effort += gap.estimateRemediationEffort();
    });

    return summary;
  }

  /**
   * Generate prioritized remediation plan
   * @returns {Object} Remediation plan
   */
  generateRemediationPlan() {
    const sortedGaps = [...this.gaps].sort((a, b) => {
      // Sort by blocking status first
      if (a.isBlocking() !== b.isBlocking()) {
        return a.isBlocking() ? -1 : 1;
      }

      // Then by severity
      const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) {
        return severityDiff;
      }

      // Then by effort (lower effort first for same severity)
      return a.estimateRemediationEffort() - b.estimateRemediationEffort();
    });

    return {
      total_gaps: sortedGaps.length,
      total_estimated_effort: sortedGaps.reduce((sum, g) => sum + g.estimateRemediationEffort(), 0),
      coverage_percentage: this.calculateOverallCoverage() * 100,
      prioritized_actions: sortedGaps.map(gap => {
        const remediation = gap.generateRemediationSuggestion();
        return {
          gap_id: gap.id,
          gap_type: gap.gap_type,
          severity: gap.severity,
          is_blocking: gap.isBlocking(),
          estimated_effort: gap.estimateRemediationEffort(),
          priority: gap.getPriorityFromSeverity(),
          remediation_plan: remediation
        };
      })
    };
  }

  /**
   * Export collection to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      gaps: this.gaps.map(g => g.toJSON()),
      summary: this.getCoverageSummary()
    };
  }

  /**
   * Import collection from JSON
   * @param {Object} data - JSON data
   * @returns {CoverageGapCollection} Collection instance
   */
  static fromJSON(data) {
    const collection = new CoverageGapCollection();

    if (data.gaps && Array.isArray(data.gaps)) {
      data.gaps.forEach(gapData => {
        const gap = CoverageGap.fromJSON(gapData);
        collection.add(gap);
      });
    }

    return collection;
  }
}