/**
 * Requirement Refinement Engine
 * Analyzes and refines ambiguous requirements into measurable, testable criteria
 * Integrates with constitutional standards and character consistency validation
 */

import { RequirementRefinement, RequirementRefinementCollection } from './requirement-refinement.js';
import { ValidationCriteria, ValidationCriteriaCollection } from '../validation/validation-criteria.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Requirement Refinement Engine
 * Processes requirements to eliminate ambiguity and ensure measurability
 */
export class RefinementEngine {
  constructor(options = {}) {
    this.constitutionalStandards = null;
    this.characterProfile = options.characterProfile || { name: 'Spec Golden Retriever', traits: ['friendly', 'honest', 'fun', 'not-cringe'] };
    this.workspace = options.workspace || process.cwd();
    this.refinementCache = new Map();
    this.performanceMetrics = {
      refinement_start_time: null,
      refinement_duration: 0,
      requirements_processed: 0,
      refinements_generated: 0
    };
  }

  /**
   * Load constitutional standards for validation
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
   * Refine requirements for ambiguity and measurability
   * @param {Object} request - Refinement request
   * @returns {Object} Refinement results
   */
  async refineRequirements(request) {
    this.performanceMetrics.refinement_start_time = performance.now();

    try {
      // Validate request
      this.validateRefinementRequest(request);

      // Load constitutional standards
      const standards = await this.getConstitutionalStandards();

      // Initialize refinement collection
      const refinements = new RequirementRefinementCollection();

      // Process each requirement
      for (const requirement of request.requirements) {
        const refinement = await this.refineRequirement(requirement, request.refinement_options || {}, standards);
        refinements.add(refinement);
      }

      // Calculate refinement duration
      this.performanceMetrics.refinement_duration = performance.now() - this.performanceMetrics.refinement_start_time;
      this.performanceMetrics.requirements_processed = request.requirements.length;
      this.performanceMetrics.refinements_generated = refinements.getNeedingRefinement().length;

      // Validate timing compliance (constitutional limit: 500ms)
      if (this.performanceMetrics.refinement_duration > 500) {
        console.warn(`Requirement refinement took ${this.performanceMetrics.refinement_duration}ms, exceeds 500ms limit`);
      }

      // Generate refinement session results
      return {
        refinement_session_id: this.generateSessionId(),
        processed_requirements: refinements.refinements.map(r => this.formatProcessedRequirement(r)),
        summary: {
          total_requirements: refinements.refinements.length,
          refinements_needed: refinements.getNeedingRefinement().length,
          ambiguity_issues_found: this.countIssuesOfType(refinements, 'vague_adjectives'),
          measurability_improvements: this.countMeasurabilityImprovements(refinements),
          character_consistency_issues: this.countCharacterIssues(refinements),
          refinement_duration_ms: this.performanceMetrics.refinement_duration
        }
      };
    } catch (error) {
      throw new Error(`Requirement refinement failed: ${error.message}`);
    }
  }

  /**
   * Validate criteria for refined requirements
   * @param {Object} request - Validation request
   * @returns {Object} Validation results
   */
  async validateCriteria(request) {
    const validationResults = [];
    let overallValidation = true;

    for (const refinedRequirement of request.refined_requirements) {
      const validation = await this.validateSingleCriteria(refinedRequirement, request.validation_standards || {});
      validationResults.push(validation);

      if (validation.validation_status === 'invalid') {
        overallValidation = false;
      }
    }

    return {
      validation_results: validationResults,
      overall_validation: overallValidation
    };
  }

  /**
   * Generate validation criteria for refined requirements
   * @param {Object} request - Generation request
   * @returns {Object} Generated validation criteria
   */
  async generateValidation(request) {
    const validationCriteriaCollection = new ValidationCriteriaCollection();

    for (const requirement of request.requirements) {
      const criteria = await this.generateRequirementValidation(requirement, request.validation_preferences || {});
      validationCriteriaCollection.add(criteria);
    }

    return {
      validation_criteria: validationCriteriaCollection.criteria.map(c => this.formatValidationCriteria(c))
    };
  }

  /**
   * Validate refinement request
   * @param {Object} request - Request to validate
   */
  validateRefinementRequest(request) {
    if (!request || typeof request !== 'object') {
      throw new Error('Refinement request must be a valid object');
    }

    if (!request.requirements || !Array.isArray(request.requirements)) {
      throw new Error('Refinement request must include requirements array');
    }

    if (request.requirements.length === 0) {
      throw new Error('Refinement request must include at least one requirement');
    }

    // Validate each requirement
    request.requirements.forEach((requirement, index) => {
      if (!requirement.id || !requirement.text) {
        throw new Error(`Requirement ${index} missing required fields (id, text)`);
      }
    });
  }

  /**
   * Refine a single requirement
   * @param {Object} requirement - Requirement to refine
   * @param {Object} options - Refinement options
   * @param {Object} standards - Constitutional standards
   * @returns {RequirementRefinement} Refined requirement
   */
  async refineRequirement(requirement, options, standards) {
    // Create refinement instance
    const refinement = RequirementRefinement.createForAmbiguousRequirement(
      requirement.id,
      requirement.text,
      {
        refinement_options: options,
        constitutional_standards: standards
      }
    );

    // Apply constitutional compliance if needed
    if (options.include_constitutional_compliance) {
      this.applyConstitutionalCompliance(refinement, standards);
    }

    // Apply character consistency validation
    if (options.include_character_consistency) {
      refinement.validateCharacterConsistency(this.characterProfile);
    }

    // Generate validation criteria if requested
    if (options.include_validation_criteria) {
      refinement.generateTestabilityCriteria();
    }

    // Validate measurability
    refinement.validateMeasurability();

    return refinement;
  }

  /**
   * Apply constitutional compliance to refinement
   * @param {RequirementRefinement} refinement - Refinement to update
   * @param {Object} standards - Constitutional standards
   */
  applyConstitutionalCompliance(refinement, standards) {
    const text = refinement.original_text.toLowerCase();
    const compliance = {
      principles_applied: [],
      performance_limits: {},
      swarm_coordination_required: false,
      test_first_required: false,
      character_consistency_required: false,
      compliance_score: 1.0
    };

    // Check for swarm coordination requirements
    if (text.includes('coordinate') || text.includes('orchestrate') || text.includes('manage tasks')) {
      compliance.swarm_coordination_required = true;
      compliance.principles_applied.push('swarm-first');
    }

    // Check for test-first requirements
    if (text.includes('implement') || text.includes('develop') || text.includes('build')) {
      compliance.test_first_required = true;
      compliance.principles_applied.push('test-first');
    }

    // Check for character consistency requirements
    if (text.includes('user') || text.includes('feedback') || text.includes('message') || text.includes('interface')) {
      compliance.character_consistency_required = true;
      compliance.principles_applied.push('character-ux');
    }

    // Apply performance limits from constitutional standards
    const performanceStandards = standards.performanceStandards || {};

    if (text.includes('animation')) {
      compliance.performance_limits.animation_duration = {
        limit: performanceStandards.animation?.maxDuration || 500,
        unit: 'ms'
      };
    }

    if (text.includes('analysis')) {
      compliance.performance_limits.analysis_time = {
        limit: performanceStandards.analysisTime?.maxDuration || 100,
        unit: 'ms'
      };
    }

    if (text.includes('memory')) {
      compliance.performance_limits.memory_usage = {
        limit: performanceStandards.memoryUsage?.maxUsage || 50 * 1024 * 1024,
        unit: 'bytes'
      };
    }

    refinement.setConstitutionalCompliance(compliance);
  }

  /**
   * Validate single criteria against validation standards
   * @param {Object} refinedRequirement - Refined requirement to validate
   * @param {Object} standards - Validation standards
   * @returns {Object} Validation result
   */
  async validateSingleCriteria(refinedRequirement, standards) {
    const validation = {
      requirement_id: refinedRequirement.requirement_id,
      validation_status: 'valid',
      validation_score: 1.0,
      measurability_assessment: {
        has_quantifiable_metrics: false,
        has_testable_conditions: false,
        has_success_criteria: false,
        clarity_score: 0
      },
      issues_found: [],
      suggestions: []
    };

    const text = refinedRequirement.refined_text;

    // Check for quantifiable metrics
    const hasMetrics = /\d+\s*(ms|milliseconds|seconds|minutes|mb|gb|%|percent|users|requests)/.test(text);
    validation.measurability_assessment.has_quantifiable_metrics = hasMetrics;

    // Check for testable conditions
    const hasTestableConditions = /\b(must|shall|will|verify|validate|measure|check)\b/i.test(text);
    validation.measurability_assessment.has_testable_conditions = hasTestableConditions;

    // Check for success criteria
    const hasSuccessCriteria = /\b(within|below|above|exactly|at least|no more than|less than|greater than)\b/i.test(text);
    validation.measurability_assessment.has_success_criteria = hasSuccessCriteria;

    // Calculate clarity score
    let clarityScore = 0;
    if (hasMetrics) clarityScore += 0.4;
    if (hasTestableConditions) clarityScore += 0.3;
    if (hasSuccessCriteria) clarityScore += 0.3;
    validation.measurability_assessment.clarity_score = clarityScore;

    // Determine validation status
    if (clarityScore < 0.5) {
      validation.validation_status = 'invalid';
      validation.validation_score = clarityScore;
      validation.issues_found.push('insufficient_measurability');
      validation.suggestions.push('Add specific, quantifiable metrics and success criteria');
    } else if (clarityScore < 0.8) {
      validation.validation_status = 'needs_improvement';
      validation.validation_score = clarityScore;
      validation.suggestions.push('Consider adding more specific measurement criteria');
    }

    // Check against validation standards
    if (standards.require_quantifiable_metrics && !hasMetrics) {
      validation.validation_status = 'invalid';
      validation.issues_found.push('missing_quantifiable_metrics');
      validation.suggestions.push('Add specific numeric values and units');
    }

    if (standards.require_testable_conditions && !hasTestableConditions) {
      validation.validation_status = 'invalid';
      validation.issues_found.push('missing_testable_conditions');
      validation.suggestions.push('Add clear pass/fail conditions');
    }

    return validation;
  }

  /**
   * Generate validation criteria for a requirement
   * @param {Object} requirement - Requirement
   * @param {Object} preferences - Validation preferences
   * @returns {ValidationCriteria} Generated criteria
   */
  async generateRequirementValidation(requirement, preferences) {
    const criteria = new ValidationCriteria({
      requirement_reference: requirement.requirement_id,
      criterion: `Validation for ${requirement.requirement_id}`,
      measurement_method: this.determineMeasurementMethod(requirement, preferences),
      validation_method: this.determineValidationMethod(preferences.automation_preference),
      automation_level: this.determineAutomationLevel(preferences.automation_preference),
      estimated_effort: this.estimateValidationEffort(requirement, preferences)
    });

    // Add success criteria based on requirement content
    this.generateSuccessCriteria(criteria, requirement, preferences);

    // Add performance criteria if requested
    if (preferences.include_performance_criteria) {
      this.addPerformanceCriteria(criteria, requirement);
    }

    // Add character consistency criteria if needed
    if (this.requiresCharacterValidation(requirement)) {
      criteria.setCharacterValidation({
        personality_consistency: true,
        tone_requirements: ['friendly', 'honest', 'fun'],
        forbidden_language: ['cringe', 'overly-effusive']
      });
    }

    return criteria;
  }

  /**
   * Determine measurement method for requirement
   * @param {Object} requirement - Requirement
   * @param {Object} preferences - Preferences
   * @returns {string} Measurement method
   */
  determineMeasurementMethod(requirement, preferences) {
    const text = requirement.refined_text || requirement.original_text || '';

    if (text.includes('time') || text.includes('duration') || text.includes('speed')) {
      return 'Performance timing measurement using performance.now()';
    }

    if (text.includes('memory') || text.includes('resource')) {
      return 'Resource usage monitoring';
    }

    if (text.includes('user') || text.includes('interface')) {
      return 'User interaction testing and validation';
    }

    if (text.includes('animation') || text.includes('visual')) {
      return 'Visual validation and timing measurement';
    }

    return 'Functional testing and verification';
  }

  /**
   * Determine validation method based on automation preference
   * @param {string} automationPreference - Automation preference
   * @returns {string} Validation method
   */
  determineValidationMethod(automationPreference) {
    switch (automationPreference) {
      case 'full':
        return 'automated';
      case 'partial':
        return 'hybrid';
      case 'none':
        return 'manual';
      default:
        return 'hybrid';
    }
  }

  /**
   * Determine automation level
   * @param {string} automationPreference - Automation preference
   * @returns {string} Automation level
   */
  determineAutomationLevel(automationPreference) {
    switch (automationPreference) {
      case 'full':
        return 'full';
      case 'partial':
        return 'partial';
      case 'none':
        return 'none';
      default:
        return 'partial';
    }
  }

  /**
   * Estimate validation effort
   * @param {Object} requirement - Requirement
   * @param {Object} preferences - Preferences
   * @returns {number} Estimated effort in hours
   */
  estimateValidationEffort(requirement, preferences) {
    let effort = 2; // Base effort

    const text = (requirement.refined_text || requirement.original_text || '').toLowerCase();

    // Increase effort for complex requirements
    if (text.includes('performance') || text.includes('timing')) {
      effort += 2;
    }

    if (text.includes('security') || text.includes('authentication')) {
      effort += 3;
    }

    if (text.includes('integration') || text.includes('coordinate')) {
      effort += 2;
    }

    // Adjust for automation preference
    if (preferences.automation_preference === 'full') {
      effort *= 0.7; // Automation reduces effort
    } else if (preferences.automation_preference === 'none') {
      effort *= 1.5; // Manual testing increases effort
    }

    return Math.max(1, Math.ceil(effort));
  }

  /**
   * Generate success criteria for validation
   * @param {ValidationCriteria} criteria - Criteria instance
   * @param {Object} requirement - Requirement
   * @param {Object} preferences - Preferences
   */
  generateSuccessCriteria(criteria, requirement, preferences) {
    const text = requirement.refined_text || requirement.original_text || '';

    // Extract numeric values and create criteria
    const metrics = text.match(/\d+\s*(ms|milliseconds|seconds|minutes|mb|gb|%|percent)/gi);
    if (metrics) {
      metrics.forEach(metric => {
        const parts = metric.match(/(\d+)\s*(.+)/);
        if (parts) {
          criteria.addSuccessCriterion({
            criterion: `Performance measurement validation`,
            measurement: `Measure actual performance against specified ${metric}`,
            threshold: `<= ${parts[1]}${parts[2]}`,
            pass_condition: `Operation completes within ${metric}`,
            failure_condition: `Operation exceeds ${metric}`,
            measurement_unit: parts[2]
          });
        }
      });
    }

    // Add functional success criteria
    const mustStatements = text.split(/\bmust\b/i).slice(1);
    mustStatements.forEach((statement, index) => {
      const cleanStatement = statement.trim().split(/[.;]/)[0];
      if (cleanStatement.length > 5) {
        criteria.addSuccessCriterion({
          criterion: `Functional requirement ${index + 1}`,
          measurement: `Verify system ${cleanStatement.toLowerCase()}`,
          threshold: 'Boolean pass/fail',
          pass_condition: `System successfully ${cleanStatement.toLowerCase()}`,
          failure_condition: `System fails to ${cleanStatement.toLowerCase()}`
        });
      }
    });
  }

  /**
   * Add performance criteria to validation
   * @param {ValidationCriteria} criteria - Criteria instance
   * @param {Object} requirement - Requirement
   */
  addPerformanceCriteria(criteria, requirement) {
    const text = (requirement.refined_text || requirement.original_text || '').toLowerCase();

    const performanceCriteria = {};

    if (text.includes('animation')) {
      performanceCriteria.animation_timing = {
        limit: 500,
        unit: 'ms',
        tolerance: 0.1
      };
    }

    if (text.includes('analysis')) {
      performanceCriteria.analysis_timing = {
        limit: 100,
        unit: 'ms',
        tolerance: 0.1
      };
    }

    if (text.includes('response')) {
      performanceCriteria.response_timing = {
        limit: 1000,
        unit: 'ms',
        tolerance: 0.1
      };
    }

    if (Object.keys(performanceCriteria).length > 0) {
      criteria.setPerformanceCriteria({
        timing_requirements: performanceCriteria
      });
    }
  }

  /**
   * Check if requirement requires character validation
   * @param {Object} requirement - Requirement
   * @returns {boolean} True if character validation needed
   */
  requiresCharacterValidation(requirement) {
    const text = (requirement.refined_text || requirement.original_text || '').toLowerCase();
    return text.includes('user') || text.includes('feedback') || text.includes('message') ||
           text.includes('interface') || text.includes('experience');
  }

  /**
   * Format processed requirement for response
   * @param {RequirementRefinement} refinement - Refinement instance
   * @returns {Object} Formatted requirement
   */
  formatProcessedRequirement(refinement) {
    return {
      requirement_id: refinement.requirement_id,
      original_text: refinement.original_text,
      refined_text: refinement.refined_text,
      refinement_needed: refinement.refinement_needed,
      issues_identified: refinement.issues_identified,
      clarification_rationale: refinement.clarification_rationale,
      testability_criteria: refinement.testability_criteria,
      measurability_validation: refinement.measurability_validation,
      approval_status: refinement.approval_status
    };
  }

  /**
   * Format validation criteria for response
   * @param {ValidationCriteria} criteria - Criteria instance
   * @returns {Object} Formatted criteria
   */
  formatValidationCriteria(criteria) {
    return {
      criteria_id: criteria.criteria_id,
      requirement_reference: criteria.requirement_reference,
      validation_method: criteria.validation_method,
      success_criteria: criteria.success_criteria,
      automation_level: criteria.automation_level,
      estimated_effort: criteria.estimated_effort
    };
  }

  /**
   * Count issues of specific type
   * @param {RequirementRefinementCollection} refinements - Refinements
   * @param {string} issueType - Issue type
   * @returns {number} Count
   */
  countIssuesOfType(refinements, issueType) {
    return refinements.refinements.filter(r =>
      r.issues_identified.includes(issueType)
    ).length;
  }

  /**
   * Count measurability improvements
   * @param {RequirementRefinementCollection} refinements - Refinements
   * @returns {number} Count
   */
  countMeasurabilityImprovements(refinements) {
    return refinements.refinements.filter(r =>
      r.measurability_validation && r.measurability_validation.clarity_score > 0.7
    ).length;
  }

  /**
   * Count character consistency issues
   * @param {RequirementRefinementCollection} refinements - Refinements
   * @returns {number} Count
   */
  countCharacterIssues(refinements) {
    return refinements.refinements.filter(r =>
      r.character_consistency_check && r.character_consistency_check.issues_found &&
      r.character_consistency_check.issues_found.length > 0
    ).length;
  }

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `RE-${timestamp}-${random}`;
  }
}