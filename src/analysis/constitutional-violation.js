/**
 * Constitutional Violation Model
 * Represents violations of constitutional principles detected during analysis
 * Supports the constitutional compliance analysis framework
 */

/**
 * Represents a violation of constitutional principles
 */
export class ConstitutionalViolation {
  constructor(options = {}) {
    this.id = options.id || this.generateId();
    this.type = options.type || null; // swarm-first, spec-driven, test-first, character-ux, production-ready, complexity
    this.severity = options.severity || 'MEDIUM'; // CRITICAL, HIGH, MEDIUM, LOW
    this.principle = options.principle || null;
    this.location = options.location || null;
    this.description = options.description || '';
    this.detected_at = options.detected_at || new Date().toISOString();
    this.remediation_suggestion = options.remediation_suggestion || '';
    this.violation_evidence = options.violation_evidence || {};
    this.constitutional_reference = options.constitutional_reference || {};
    this.impact_assessment = options.impact_assessment || {};
    this.compliance_status = options.compliance_status || 'violation'; // violation, warning, compliant
  }

  /**
   * Generate unique violation ID
   * @returns {string} Violation ID
   */
  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CV-${timestamp}-${random}`;
  }

  /**
   * Validate violation data structure
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!this.type) {
      errors.push('Violation type is required');
    } else if (!this.isValidType(this.type)) {
      errors.push(`Invalid violation type: ${this.type}`);
    }

    if (!this.severity) {
      errors.push('Severity level is required');
    } else if (!this.isValidSeverity(this.severity)) {
      errors.push(`Invalid severity level: ${this.severity}`);
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!this.location) {
      warnings.push('Location information missing - may hinder remediation');
    }

    if (!this.remediation_suggestion || this.remediation_suggestion.trim().length === 0) {
      warnings.push('Missing remediation suggestion - should provide actionable guidance');
    }

    // Constitutional compliance validation
    if (this.type && !this.constitutional_reference.principle) {
      warnings.push('Missing constitutional principle reference');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if violation type is valid
   * @param {string} type - Violation type
   * @returns {boolean} True if valid
   */
  isValidType(type) {
    const validTypes = [
      'swarm-first',
      'spec-driven',
      'test-first',
      'character-ux',
      'production-ready',
      'complexity'
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
   * Set violation evidence with validation
   * @param {Object} evidence - Evidence data
   */
  setEvidence(evidence) {
    if (!evidence || typeof evidence !== 'object') {
      throw new Error('Evidence must be a valid object');
    }

    this.violation_evidence = {
      source_file: evidence.source_file || null,
      line_number: evidence.line_number || null,
      code_snippet: evidence.code_snippet || '',
      violation_pattern: evidence.violation_pattern || '',
      context: evidence.context || {},
      confidence_score: evidence.confidence_score || 0.8,
      detected_by: evidence.detected_by || 'constitutional-analyzer'
    };
  }

  /**
   * Set constitutional reference information
   * @param {Object} reference - Constitutional reference
   */
  setConstitutionalReference(reference) {
    if (!reference || typeof reference !== 'object') {
      throw new Error('Constitutional reference must be a valid object');
    }

    this.constitutional_reference = {
      principle: reference.principle || this.type,
      section: reference.section || null,
      requirement: reference.requirement || '',
      enforcement_level: reference.enforcement_level || 'MANDATORY',
      version: reference.version || '1.0.0'
    };
  }

  /**
   * Set impact assessment
   * @param {Object} impact - Impact assessment data
   */
  setImpactAssessment(impact) {
    if (!impact || typeof impact !== 'object') {
      throw new Error('Impact assessment must be a valid object');
    }

    this.impact_assessment = {
      blocking_severity: impact.blocking_severity || this.severity,
      affects_implementation: impact.affects_implementation || false,
      affects_testing: impact.affects_testing || false,
      affects_user_experience: impact.affects_user_experience || false,
      affects_performance: impact.affects_performance || false,
      remediation_effort: impact.remediation_effort || 'MEDIUM', // LOW, MEDIUM, HIGH, CRITICAL
      business_impact: impact.business_impact || 'MEDIUM'
    };
  }

  /**
   * Generate remediation plan based on violation type
   * @returns {Object} Remediation plan
   */
  generateRemediationPlan() {
    const plan = {
      violation_id: this.id,
      priority: this.getPriorityFromSeverity(),
      estimated_effort_hours: this.estimateEffort(),
      steps: [],
      resources_needed: [],
      constitutional_guidance: ''
    };

    switch (this.type) {
      case 'swarm-first':
        plan.steps = [
          'Replace custom coordinators with enhanced-swarm-orchestrator.js',
          'Update task coordination to use existing swarm patterns',
          'Test swarm integration with existing workflows',
          'Validate swarm-first compliance'
        ];
        plan.resources_needed = ['enhanced-swarm-orchestrator.js', 'swarm documentation'];
        plan.constitutional_guidance = 'Use existing swarm infrastructure - no custom coordinators allowed';
        break;

      case 'test-first':
        plan.steps = [
          'Write contract tests for all components',
          'Ensure tests fail before implementation',
          'Follow Red-Green-Refactor cycle',
          'Validate TDD compliance'
        ];
        plan.resources_needed = ['test framework', 'contract definitions'];
        plan.constitutional_guidance = 'Tests must be written and fail before any implementation';
        break;

      case 'character-ux':
        plan.steps = [
          'Review Spec the Golden Retriever personality guidelines',
          'Update user-facing messages to be friendly and encouraging',
          'Remove harsh technical language',
          'Test character consistency'
        ];
        plan.resources_needed = ['character personality guide', 'UX review'];
        plan.constitutional_guidance = 'Maintain friendly, honest, fun (not cringe) Golden Retriever personality';
        break;

      case 'production-ready':
        plan.steps = [
          'Implement comprehensive error handling',
          'Add security scanning and validation',
          'Establish performance monitoring',
          'Validate production readiness'
        ];
        plan.resources_needed = ['monitoring tools', 'security scanners'];
        plan.constitutional_guidance = 'All code must meet enterprise standards for security and reliability';
        break;

      case 'complexity':
        plan.steps = [
          'Document simpler alternatives considered',
          'Justify complexity with concrete benefits',
          'Integrate with existing components where possible',
          'Validate complexity justification'
        ];
        plan.resources_needed = ['architecture documentation', 'alternatives analysis'];
        plan.constitutional_guidance = 'Start simple and justify complexity with documented alternatives';
        break;

      case 'spec-driven':
        plan.steps = [
          'Complete specification documentation',
          'Resolve NEEDS CLARIFICATION markers',
          'Get specification approval',
          'Validate spec-driven compliance'
        ];
        plan.resources_needed = ['specification templates', 'review process'];
        plan.constitutional_guidance = 'All features must begin with complete specification';
        break;

      default:
        plan.steps = ['Analyze violation context', 'Consult constitutional standards', 'Implement appropriate remediation'];
        plan.constitutional_guidance = 'Follow constitutional principles for all development';
    }

    return plan;
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
   * Estimate remediation effort in hours
   * @returns {number} Estimated hours
   */
  estimateEffort() {
    const baseEffort = {
      'swarm-first': 4,
      'test-first': 6,
      'character-ux': 2,
      'production-ready': 8,
      'complexity': 3,
      'spec-driven': 4
    };

    const severityMultiplier = {
      'CRITICAL': 2.0,
      'HIGH': 1.5,
      'MEDIUM': 1.0,
      'LOW': 0.5
    };

    const base = baseEffort[this.type] || 4;
    const multiplier = severityMultiplier[this.severity] || 1.0;

    return Math.ceil(base * multiplier);
  }

  /**
   * Check if violation blocks implementation
   * @returns {boolean} True if blocking
   */
  isBlocking() {
    if (this.severity === 'CRITICAL') {
      return true;
    }

    if (this.type === 'swarm-first' || this.type === 'test-first') {
      return this.severity === 'HIGH' || this.severity === 'CRITICAL';
    }

    return false;
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      severity: this.severity,
      principle: this.principle,
      location: this.location,
      description: this.description,
      detected_at: this.detected_at,
      remediation_suggestion: this.remediation_suggestion,
      violation_evidence: this.violation_evidence,
      constitutional_reference: this.constitutional_reference,
      impact_assessment: this.impact_assessment,
      compliance_status: this.compliance_status
    };
  }

  /**
   * Create violation from JSON data
   * @param {Object} data - JSON data
   * @returns {ConstitutionalViolation} Violation instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for ConstitutionalViolation');
    }

    return new ConstitutionalViolation(data);
  }

  /**
   * Create swarm-first violation
   * @param {Object} options - Violation options
   * @returns {ConstitutionalViolation} Swarm-first violation
   */
  static createSwarmFirstViolation(options = {}) {
    return new ConstitutionalViolation({
      ...options,
      type: 'swarm-first',
      severity: options.severity || 'CRITICAL',
      constitutional_reference: {
        principle: 'swarm-first',
        enforcement_level: 'NON-NEGOTIABLE',
        requirement: 'Use enhanced-swarm-orchestrator.js for task coordination'
      }
    });
  }

  /**
   * Create test-first violation
   * @param {Object} options - Violation options
   * @returns {ConstitutionalViolation} Test-first violation
   */
  static createTestFirstViolation(options = {}) {
    return new ConstitutionalViolation({
      ...options,
      type: 'test-first',
      severity: options.severity || 'CRITICAL',
      constitutional_reference: {
        principle: 'test-first',
        enforcement_level: 'NON-NEGOTIABLE',
        requirement: 'Tests written → User approved → Tests fail → Then implement'
      }
    });
  }

  /**
   * Create character-ux violation
   * @param {Object} options - Violation options
   * @returns {ConstitutionalViolation} Character UX violation
   */
  static createCharacterUxViolation(options = {}) {
    return new ConstitutionalViolation({
      ...options,
      type: 'character-ux',
      severity: options.severity || 'HIGH',
      constitutional_reference: {
        principle: 'character-ux',
        enforcement_level: 'MANDATORY',
        requirement: 'Spec the Golden Retriever personality must be consistent across all user interactions'
      }
    });
  }
}

/**
 * Constitutional Violation Collection
 * Manages collections of violations with analysis capabilities
 */
export class ConstitutionalViolationCollection {
  constructor() {
    this.violations = [];
  }

  /**
   * Add violation to collection
   * @param {ConstitutionalViolation} violation - Violation to add
   */
  add(violation) {
    if (!(violation instanceof ConstitutionalViolation)) {
      throw new Error('Must be a ConstitutionalViolation instance');
    }

    this.violations.push(violation);
  }

  /**
   * Remove violation by ID
   * @param {string} violationId - Violation ID
   * @returns {boolean} True if removed
   */
  remove(violationId) {
    const index = this.violations.findIndex(v => v.id === violationId);
    if (index >= 0) {
      this.violations.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get violations by type
   * @param {string} type - Violation type
   * @returns {ConstitutionalViolation[]} Filtered violations
   */
  getByType(type) {
    return this.violations.filter(v => v.type === type);
  }

  /**
   * Get violations by severity
   * @param {string} severity - Severity level
   * @returns {ConstitutionalViolation[]} Filtered violations
   */
  getBySeverity(severity) {
    return this.violations.filter(v => v.severity === severity);
  }

  /**
   * Get blocking violations
   * @returns {ConstitutionalViolation[]} Blocking violations
   */
  getBlocking() {
    return this.violations.filter(v => v.isBlocking());
  }

  /**
   * Get violations summary
   * @returns {Object} Summary statistics
   */
  getSummary() {
    const summary = {
      total_violations: this.violations.length,
      by_severity: {},
      by_type: {},
      blocking_count: 0,
      remediation_effort_total: 0
    };

    this.violations.forEach(violation => {
      // Count by severity
      summary.by_severity[violation.severity] = (summary.by_severity[violation.severity] || 0) + 1;

      // Count by type
      summary.by_type[violation.type] = (summary.by_type[violation.type] || 0) + 1;

      // Count blocking violations
      if (violation.isBlocking()) {
        summary.blocking_count++;
      }

      // Sum remediation effort
      summary.remediation_effort_total += violation.estimateEffort();
    });

    return summary;
  }

  /**
   * Generate prioritized remediation plan
   * @returns {Object} Remediation plan
   */
  generateRemediationPlan() {
    const violations = [...this.violations].sort((a, b) => {
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

      // Then by effort (lower effort first for equal severity)
      return a.estimateEffort() - b.estimateEffort();
    });

    return {
      total_violations: violations.length,
      total_estimated_effort: violations.reduce((sum, v) => sum + v.estimateEffort(), 0),
      prioritized_violations: violations.map(v => ({
        violation_id: v.id,
        type: v.type,
        severity: v.severity,
        is_blocking: v.isBlocking(),
        estimated_effort: v.estimateEffort(),
        remediation_plan: v.generateRemediationPlan()
      }))
    };
  }

  /**
   * Export collection to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      violations: this.violations.map(v => v.toJSON()),
      summary: this.getSummary()
    };
  }

  /**
   * Import collection from JSON
   * @param {Object} data - JSON data
   * @returns {ConstitutionalViolationCollection} Collection instance
   */
  static fromJSON(data) {
    const collection = new ConstitutionalViolationCollection();

    if (data.violations && Array.isArray(data.violations)) {
      data.violations.forEach(violationData => {
        const violation = ConstitutionalViolation.fromJSON(violationData);
        collection.add(violation);
      });
    }

    return collection;
  }
}