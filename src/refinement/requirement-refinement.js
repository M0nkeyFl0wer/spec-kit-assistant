/**
 * Requirement Refinement Model
 * Represents refinement of ambiguous requirements into measurable, testable criteria
 * Supports the requirement refinement and validation framework
 */

/**
 * Represents a requirement refinement
 */
export class RequirementRefinement {
  constructor(options = {}) {
    this.id = options.id || this.generateId();
    this.requirement_id = options.requirement_id || '';
    this.original_text = options.original_text || '';
    this.refined_text = options.refined_text || '';
    this.refinement_needed = options.refinement_needed || false;
    this.refinement_type = options.refinement_type || []; // ambiguity, measurability, testability, character-consistency
    this.issues_identified = options.issues_identified || []; // vague_adjectives, missing_metrics, untestable_conditions
    this.clarification_rationale = options.clarification_rationale || '';
    this.testability_criteria = options.testability_criteria || [];
    this.measurability_validation = options.measurability_validation || {};
    this.character_consistency_check = options.character_consistency_check || {};
    this.approval_status = options.approval_status || 'draft'; // draft, approved, rejected
    this.refinement_timestamp = options.refinement_timestamp || new Date().toISOString();
    this.refinement_confidence = options.refinement_confidence || 0.8;
    this.constitutional_compliance = options.constitutional_compliance || {};
    this.metadata = options.metadata || {};
  }

  /**
   * Generate unique refinement ID
   * @returns {string} Refinement ID
   */
  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `RR-${timestamp}-${random}`;
  }

  /**
   * Validate refinement data structure
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!this.requirement_id || this.requirement_id.trim().length === 0) {
      errors.push('Requirement ID is required');
    }

    if (!this.original_text || this.original_text.trim().length === 0) {
      errors.push('Original requirement text is required');
    }

    if (this.refinement_needed && (!this.refined_text || this.refined_text.trim().length === 0)) {
      errors.push('Refined text is required when refinement is needed');
    }

    if (this.refinement_needed && this.original_text === this.refined_text) {
      warnings.push('Refined text is identical to original text');
    }

    // Refinement confidence validation
    if (this.refinement_confidence < 0 || this.refinement_confidence > 1) {
      errors.push('Refinement confidence must be between 0 and 1');
    }

    // Approval status validation
    if (!this.isValidApprovalStatus(this.approval_status)) {
      errors.push(`Invalid approval status: ${this.approval_status}`);
    }

    // Testability criteria validation
    if (this.refinement_needed && this.testability_criteria.length === 0) {
      warnings.push('Refined requirements should include testability criteria');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if approval status is valid
   * @param {string} status - Approval status
   * @returns {boolean} True if valid
   */
  isValidApprovalStatus(status) {
    const validStatuses = ['draft', 'approved', 'rejected'];
    return validStatuses.includes(status);
  }

  /**
   * Analyze original requirement for ambiguity issues
   * @param {Object} options - Analysis options
   * @returns {Object} Ambiguity analysis
   */
  analyzeAmbiguity(options = {}) {
    const text = this.original_text.toLowerCase();
    const analysis = {
      ambiguity_score: 0,
      issues_found: [],
      vague_terms: [],
      missing_context: [],
      recommendations: []
    };

    // Check for vague adjectives
    const vagueTems = [
      'good', 'bad', 'fast', 'slow', 'large', 'small', 'many', 'few', 'high', 'low',
      'efficient', 'scalable', 'user-friendly', 'intuitive', 'responsive', 'reliable',
      'secure', 'robust', 'flexible', 'maintainable', 'performant', 'optimized'
    ];

    vagueTems.forEach(term => {
      if (text.includes(term)) {
        analysis.vague_terms.push(term);
        analysis.issues_found.push('vague_adjectives');
      }
    });

    // Check for missing quantitative metrics
    const hasNumbers = /\d+/.test(text);
    const hasUnits = /(ms|seconds|minutes|hours|bytes|mb|gb|%|percent)/.test(text);

    if (!hasNumbers && !hasUnits) {
      analysis.issues_found.push('missing_metrics');
      analysis.missing_context.push('quantitative measurements');
    }

    // Check for untestable conditions
    const untestableTerms = ['should', 'might', 'could', 'probably', 'generally', 'usually'];
    untestableTerms.forEach(term => {
      if (text.includes(term)) {
        analysis.issues_found.push('untestable_conditions');
      }
    });

    // Check for missing success criteria
    const hasSuccessCriteria = text.includes('must') || text.includes('shall') || text.includes('will');
    if (!hasSuccessCriteria) {
      analysis.issues_found.push('weak_requirements_language');
      analysis.missing_context.push('clear success criteria');
    }

    // Calculate ambiguity score (0-1, higher = more ambiguous)
    analysis.ambiguity_score = Math.min(1.0,
      (analysis.vague_terms.length * 0.2) +
      (analysis.issues_found.includes('missing_metrics') ? 0.3 : 0) +
      (analysis.issues_found.includes('untestable_conditions') ? 0.2 : 0) +
      (analysis.issues_found.includes('weak_requirements_language') ? 0.3 : 0)
    );

    // Set refinement needed based on ambiguity score
    this.refinement_needed = analysis.ambiguity_score > 0.3;
    this.issues_identified = [...new Set(analysis.issues_found)];

    return analysis;
  }

  /**
   * Generate refined requirement text
   * @param {Object} options - Refinement options
   * @returns {string} Refined requirement text
   */
  generateRefinedText(options = {}) {
    if (!this.refinement_needed) {
      return this.original_text;
    }

    const {
      preserveIntent = true,
      includeMetrics = true,
      enforceCharacterConsistency = true,
      constitutionalCompliance = true
    } = options;

    let refined = this.original_text;

    // Replace vague adjectives with specific metrics
    const replacements = {
      'fast': 'within 500ms',
      'quickly': 'within 500ms',
      'responsive': 'with <200ms response time',
      'efficient': 'using <50MB memory and <10% CPU',
      'scalable': 'supporting 1000+ concurrent users',
      'user-friendly': 'with clear, helpful feedback',
      'intuitive': 'requiring <3 clicks for common tasks',
      'reliable': 'with 99.9% uptime',
      'secure': 'using encrypted connections and validated inputs',
      'good performance': 'meeting constitutional timing limits',
      'acceptable': 'within constitutional performance standards'
    };

    Object.keys(replacements).forEach(vague => {
      const regex = new RegExp(`\\b${vague}\\b`, 'gi');
      refined = refined.replace(regex, replacements[vague]);
    });

    // Strengthen requirement language
    refined = refined.replace(/should/gi, 'MUST');
    refined = refined.replace(/could/gi, 'MAY');
    refined = refined.replace(/might/gi, 'SHALL');

    // Add character consistency if needed
    if (enforceCharacterConsistency && this.issues_identified.includes('character_inconsistency')) {
      refined = this.addCharacterConsistency(refined);
    }

    // Add constitutional compliance if needed
    if (constitutionalCompliance && this.requiresConstitutionalGuidance()) {
      refined = this.addConstitutionalCompliance(refined);
    }

    this.refined_text = refined;
    return refined;
  }

  /**
   * Add character consistency to refined text
   * @param {string} text - Text to modify
   * @returns {string} Character-consistent text
   */
  addCharacterConsistency(text) {
    // Replace harsh technical language with character-friendly alternatives
    const characterFriendlyReplacements = {
      'error': 'issue that needs attention',
      'failure': 'something that needs a quick fix',
      'invalid': 'needs to be updated',
      'denied': 'not available right now',
      'forbidden': 'not accessible',
      'unauthorized': 'requires proper access',
      'timeout': 'taking longer than expected',
      'crash': 'unexpected stop',
      'fatal': 'needs immediate attention'
    };

    let characterText = text;

    Object.keys(characterFriendlyReplacements).forEach(harsh => {
      const regex = new RegExp(`\\b${harsh}\\b`, 'gi');
      characterText = characterText.replace(regex, characterFriendlyReplacements[harsh]);
    });

    // Add encouraging language where appropriate
    if (text.toLowerCase().includes('feedback') || text.toLowerCase().includes('message')) {
      characterText += ' with friendly, helpful guidance';
    }

    return characterText;
  }

  /**
   * Add constitutional compliance guidance
   * @param {string} text - Text to modify
   * @returns {string} Constitutionally compliant text
   */
  addConstitutionalCompliance(text) {
    let compliantText = text;

    // Add swarm-first guidance for coordination tasks
    if (text.toLowerCase().includes('coordinate') || text.toLowerCase().includes('orchestrate')) {
      compliantText += ' using enhanced-swarm-orchestrator.js';
    }

    // Add test-first guidance for implementation tasks
    if (text.toLowerCase().includes('implement') || text.toLowerCase().includes('develop')) {
      compliantText += ' following test-first development approach';
    }

    // Add performance standards for timing requirements
    if (text.toLowerCase().includes('animation') && !text.includes('500ms')) {
      compliantText = compliantText.replace(/animation/gi, 'animation (within 500ms constitutional limit)');
    }

    if (text.toLowerCase().includes('analysis') && !text.includes('100ms')) {
      compliantText = compliantText.replace(/analysis/gi, 'analysis (within 100ms constitutional limit)');
    }

    return compliantText;
  }

  /**
   * Check if refinement requires constitutional guidance
   * @returns {boolean} True if constitutional guidance needed
   */
  requiresConstitutionalGuidance() {
    const text = this.original_text.toLowerCase();
    const constitutionalKeywords = [
      'coordinate', 'orchestrate', 'implement', 'develop', 'animation', 'analysis',
      'test', 'character', 'feedback', 'performance', 'timing'
    ];

    return constitutionalKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Generate testability criteria
   * @param {Object} options - Generation options
   * @returns {string[]} Testability criteria
   */
  generateTestabilityCriteria(options = {}) {
    const criteria = [];
    const text = this.refined_text || this.original_text;

    // Extract metrics for measurement criteria
    const metrics = text.match(/\d+\s*(ms|milliseconds|seconds|minutes|mb|gb|bytes|%|percent)/gi);
    if (metrics) {
      metrics.forEach(metric => {
        criteria.push(`Measure and verify ${metric} requirement is met`);
      });
    }

    // Add functional verification criteria
    if (text.toLowerCase().includes('must')) {
      const requirements = text.split(/must|shall/i).slice(1);
      requirements.forEach((req, index) => {
        const cleanReq = req.trim().split(/[.;]/)[0];
        if (cleanReq.length > 5) {
          criteria.push(`Verify that system ${cleanReq.toLowerCase()}`);
        }
      });
    }

    // Add user experience criteria for character consistency
    if (this.character_consistency_check.requires_validation) {
      criteria.push('Validate user messages maintain Spec Golden Retriever personality');
      criteria.push('Verify language is friendly and encouraging, not harsh or technical');
    }

    // Add performance criteria for constitutional compliance
    if (this.constitutional_compliance.performance_limits) {
      Object.keys(this.constitutional_compliance.performance_limits).forEach(metric => {
        const limit = this.constitutional_compliance.performance_limits[metric];
        criteria.push(`Validate ${metric} remains within ${limit} constitutional limit`);
      });
    }

    // Add integration criteria for swarm coordination
    if (text.toLowerCase().includes('swarm') || text.toLowerCase().includes('orchestrat')) {
      criteria.push('Verify integration with enhanced-swarm-orchestrator.js');
      criteria.push('Test swarm coordination under various load conditions');
    }

    this.testability_criteria = criteria;
    return criteria;
  }

  /**
   * Validate measurability of refined requirement
   * @returns {Object} Measurability validation
   */
  validateMeasurability() {
    const text = this.refined_text || this.original_text;
    const validation = {
      has_quantifiable_metrics: false,
      has_testable_conditions: false,
      has_success_criteria: false,
      clarity_score: 0,
      measurements_identified: [],
      improvements_needed: []
    };

    // Check for quantifiable metrics
    const quantifiablePatterns = [
      /\d+\s*(ms|milliseconds|seconds|minutes|hours)/gi,
      /\d+\s*(mb|gb|kb|bytes)/gi,
      /\d+\s*(%|percent)/gi,
      /\d+\s*(users?|requests?|transactions?)/gi,
      /<\s*\d+/gi, // less than X
      />\s*\d+/gi  // greater than X
    ];

    quantifiablePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        validation.has_quantifiable_metrics = true;
        validation.measurements_identified.push(...matches);
      }
    });

    // Check for testable conditions
    const testableKeywords = ['must', 'shall', 'will', 'verify', 'validate', 'measure', 'check'];
    validation.has_testable_conditions = testableKeywords.some(keyword =>
      text.toLowerCase().includes(keyword)
    );

    // Check for success criteria
    const successIndicators = ['within', 'below', 'above', 'exactly', 'at least', 'no more than'];
    validation.has_success_criteria = successIndicators.some(indicator =>
      text.toLowerCase().includes(indicator)
    );

    // Calculate clarity score
    let score = 0;
    if (validation.has_quantifiable_metrics) score += 0.4;
    if (validation.has_testable_conditions) score += 0.3;
    if (validation.has_success_criteria) score += 0.3;

    validation.clarity_score = score;

    // Identify improvements needed
    if (!validation.has_quantifiable_metrics) {
      validation.improvements_needed.push('Add specific, measurable metrics');
    }
    if (!validation.has_testable_conditions) {
      validation.improvements_needed.push('Include testable conditions with clear pass/fail criteria');
    }
    if (!validation.has_success_criteria) {
      validation.improvements_needed.push('Define explicit success criteria');
    }

    this.measurability_validation = validation;
    return validation;
  }

  /**
   * Validate character consistency
   * @param {Object} characterProfile - Character profile to validate against
   * @returns {Object} Character consistency validation
   */
  validateCharacterConsistency(characterProfile = { name: 'Spec Golden Retriever', traits: ['friendly', 'honest', 'fun', 'not-cringe'] }) {
    const text = (this.refined_text || this.original_text).toLowerCase();
    const validation = {
      personality_compliance: true,
      issues_found: [],
      character_score: 1.0,
      recommendations: []
    };

    // Check for harsh technical language
    const harshTerms = ['error', 'failure', 'invalid', 'denied', 'forbidden', 'fatal', 'crash'];
    const foundHarsh = harshTerms.filter(term => text.includes(term));

    if (foundHarsh.length > 0) {
      validation.personality_compliance = false;
      validation.issues_found.push('harsh_technical_language');
      validation.recommendations.push('Replace harsh technical terms with friendly alternatives');
      validation.character_score -= foundHarsh.length * 0.1;
    }

    // Check for encouraging language
    const encouragingTerms = ['helpful', 'friendly', 'clear', 'supportive', 'guidance', 'assistance'];
    const hasEncouraging = encouragingTerms.some(term => text.includes(term));

    if (!hasEncouraging && text.includes('feedback')) {
      validation.issues_found.push('missing_encouraging_language');
      validation.recommendations.push('Add friendly, encouraging language for user interactions');
      validation.character_score -= 0.2;
    }

    // Check for cringe language
    const cringeTerms = ['amazing', 'awesome', 'fantastic', 'incredible', 'super duper', 'wow'];
    const foundCringe = cringeTerms.filter(term => text.includes(term));

    if (foundCringe.length > 0) {
      validation.issues_found.push('overly_effusive_language');
      validation.recommendations.push('Tone down overly effusive language to maintain authenticity');
      validation.character_score -= foundCringe.length * 0.15;
    }

    validation.character_score = Math.max(0, validation.character_score);
    this.character_consistency_check = validation;

    return validation;
  }

  /**
   * Set constitutional compliance requirements
   * @param {Object} compliance - Compliance requirements
   */
  setConstitutionalCompliance(compliance) {
    this.constitutional_compliance = {
      principles_applied: compliance.principles_applied || [],
      performance_limits: compliance.performance_limits || {},
      swarm_coordination_required: compliance.swarm_coordination_required || false,
      test_first_required: compliance.test_first_required || false,
      character_consistency_required: compliance.character_consistency_required || false,
      compliance_score: compliance.compliance_score || 1.0
    };
  }

  /**
   * Approve refinement
   * @param {string} approver - Approver identifier
   * @param {string} notes - Approval notes
   */
  approve(approver, notes = '') {
    this.approval_status = 'approved';
    this.metadata.approval_info = {
      approver,
      approval_timestamp: new Date().toISOString(),
      approval_notes: notes
    };
  }

  /**
   * Reject refinement
   * @param {string} rejector - Rejector identifier
   * @param {string} reason - Rejection reason
   */
  reject(rejector, reason = '') {
    this.approval_status = 'rejected';
    this.metadata.rejection_info = {
      rejector,
      rejection_timestamp: new Date().toISOString(),
      rejection_reason: reason
    };
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      requirement_id: this.requirement_id,
      original_text: this.original_text,
      refined_text: this.refined_text,
      refinement_needed: this.refinement_needed,
      refinement_type: this.refinement_type,
      issues_identified: this.issues_identified,
      clarification_rationale: this.clarification_rationale,
      testability_criteria: this.testability_criteria,
      measurability_validation: this.measurability_validation,
      character_consistency_check: this.character_consistency_check,
      approval_status: this.approval_status,
      refinement_timestamp: this.refinement_timestamp,
      refinement_confidence: this.refinement_confidence,
      constitutional_compliance: this.constitutional_compliance,
      metadata: this.metadata
    };
  }

  /**
   * Create refinement from JSON data
   * @param {Object} data - JSON data
   * @returns {RequirementRefinement} Refinement instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for RequirementRefinement');
    }

    return new RequirementRefinement(data);
  }

  /**
   * Create refinement for ambiguous requirement
   * @param {string} requirementId - Requirement ID
   * @param {string} originalText - Original requirement text
   * @param {Object} options - Refinement options
   * @returns {RequirementRefinement} Refinement instance
   */
  static createForAmbiguousRequirement(requirementId, originalText, options = {}) {
    const refinement = new RequirementRefinement({
      requirement_id: requirementId,
      original_text: originalText,
      ...options
    });

    // Analyze ambiguity and generate refinement
    refinement.analyzeAmbiguity();

    if (refinement.refinement_needed) {
      refinement.generateRefinedText(options);
      refinement.generateTestabilityCriteria();
      refinement.validateMeasurability();
      refinement.validateCharacterConsistency();
    }

    return refinement;
  }
}

/**
 * Requirement Refinement Collection
 * Manages collections of requirement refinements with analysis capabilities
 */
export class RequirementRefinementCollection {
  constructor() {
    this.refinements = [];
  }

  /**
   * Add refinement to collection
   * @param {RequirementRefinement} refinement - Refinement to add
   */
  add(refinement) {
    if (!(refinement instanceof RequirementRefinement)) {
      throw new Error('Must be a RequirementRefinement instance');
    }

    this.refinements.push(refinement);
  }

  /**
   * Remove refinement by ID
   * @param {string} refinementId - Refinement ID
   * @returns {boolean} True if removed
   */
  remove(refinementId) {
    const index = this.refinements.findIndex(r => r.id === refinementId);
    if (index >= 0) {
      this.refinements.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get refinements by requirement ID
   * @param {string} requirementId - Requirement ID
   * @returns {RequirementRefinement[]} Filtered refinements
   */
  getByRequirementId(requirementId) {
    return this.refinements.filter(r => r.requirement_id === requirementId);
  }

  /**
   * Get refinements that need refinement
   * @returns {RequirementRefinement[]} Refinements needing work
   */
  getNeedingRefinement() {
    return this.refinements.filter(r => r.refinement_needed);
  }

  /**
   * Get approved refinements
   * @returns {RequirementRefinement[]} Approved refinements
   */
  getApproved() {
    return this.refinements.filter(r => r.approval_status === 'approved');
  }

  /**
   * Get refinement summary
   * @returns {Object} Summary statistics
   */
  getRefinementSummary() {
    const summary = {
      total_requirements: this.refinements.length,
      needing_refinement: this.refinements.filter(r => r.refinement_needed).length,
      approved: this.refinements.filter(r => r.approval_status === 'approved').length,
      rejected: this.refinements.filter(r => r.approval_status === 'rejected').length,
      draft: this.refinements.filter(r => r.approval_status === 'draft').length,
      average_confidence: 0,
      common_issues: {},
      character_consistency_issues: 0,
      constitutional_compliance_issues: 0
    };

    if (this.refinements.length > 0) {
      summary.average_confidence = this.refinements.reduce((sum, r) => sum + r.refinement_confidence, 0) / this.refinements.length;
    }

    // Count common issues
    this.refinements.forEach(refinement => {
      refinement.issues_identified.forEach(issue => {
        summary.common_issues[issue] = (summary.common_issues[issue] || 0) + 1;
      });

      if (refinement.character_consistency_check.issues_found && refinement.character_consistency_check.issues_found.length > 0) {
        summary.character_consistency_issues++;
      }

      if (refinement.constitutional_compliance.compliance_score < 0.8) {
        summary.constitutional_compliance_issues++;
      }
    });

    return summary;
  }

  /**
   * Generate bulk refinement report
   * @returns {Object} Bulk refinement report
   */
  generateBulkRefinementReport() {
    const report = {
      summary: this.getRefinementSummary(),
      priority_refinements: [],
      constitutional_compliance_status: {},
      character_consistency_status: {},
      measurability_status: {}
    };

    // Identify priority refinements (low confidence, many issues)
    const priorityRefinements = this.refinements
      .filter(r => r.refinement_needed)
      .sort((a, b) => {
        const aScore = a.refinement_confidence - (a.issues_identified.length * 0.1);
        const bScore = b.refinement_confidence - (b.issues_identified.length * 0.1);
        return aScore - bScore;
      })
      .slice(0, 10);

    report.priority_refinements = priorityRefinements.map(r => ({
      requirement_id: r.requirement_id,
      confidence: r.refinement_confidence,
      issues_count: r.issues_identified.length,
      character_score: r.character_consistency_check.character_score || 1.0,
      measurability_score: r.measurability_validation.clarity_score || 0.0
    }));

    // Constitutional compliance analysis
    const constitutionalRefinements = this.refinements.filter(r =>
      r.constitutional_compliance.principles_applied && r.constitutional_compliance.principles_applied.length > 0
    );

    report.constitutional_compliance_status = {
      total_with_compliance: constitutionalRefinements.length,
      average_compliance_score: constitutionalRefinements.length > 0
        ? constitutionalRefinements.reduce((sum, r) => sum + r.constitutional_compliance.compliance_score, 0) / constitutionalRefinements.length
        : 1.0,
      swarm_coordination_required: constitutionalRefinements.filter(r => r.constitutional_compliance.swarm_coordination_required).length,
      test_first_required: constitutionalRefinements.filter(r => r.constitutional_compliance.test_first_required).length
    };

    return report;
  }

  /**
   * Export collection to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      refinements: this.refinements.map(r => r.toJSON()),
      summary: this.getRefinementSummary()
    };
  }

  /**
   * Import collection from JSON
   * @param {Object} data - JSON data
   * @returns {RequirementRefinementCollection} Collection instance
   */
  static fromJSON(data) {
    const collection = new RequirementRefinementCollection();

    if (data.refinements && Array.isArray(data.refinements)) {
      data.refinements.forEach(refinementData => {
        const refinement = RequirementRefinement.fromJSON(refinementData);
        collection.add(refinement);
      });
    }

    return collection;
  }
}