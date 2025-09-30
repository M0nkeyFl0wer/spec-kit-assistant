/**
 * Validation Criteria Model
 * Represents measurable validation criteria for refined requirements
 * Supports the validation and testing framework
 */

/**
 * Represents validation criteria for a requirement
 */
export class ValidationCriteria {
  constructor(options = {}) {
    this.id = options.id || this.generateId();
    this.criteria_id = options.criteria_id || this.id;
    this.requirement_reference = options.requirement_reference || '';
    this.criterion = options.criterion || '';
    this.measurement_method = options.measurement_method || '';
    this.success_threshold = options.success_threshold || '';
    this.validation_method = options.validation_method || 'automated'; // automated, manual, hybrid
    this.automation_level = options.automation_level || 'full'; // full, partial, none
    this.estimated_effort = options.estimated_effort || 1;
    this.priority = options.priority || 'MEDIUM'; // CRITICAL, HIGH, MEDIUM, LOW
    this.success_criteria = options.success_criteria || [];
    this.test_scenarios = options.test_scenarios || [];
    this.acceptance_criteria = options.acceptance_criteria || [];
    this.validation_tools = options.validation_tools || [];
    this.constitutional_compliance = options.constitutional_compliance || {};
    this.character_validation = options.character_validation || {};
    this.performance_criteria = options.performance_criteria || {};
    this.metadata = options.metadata || {};
    this.created_at = options.created_at || new Date().toISOString();
    this.updated_at = options.updated_at || new Date().toISOString();
  }

  /**
   * Generate unique criteria ID
   * @returns {string} Criteria ID
   */
  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `VC-${timestamp}-${random}`;
  }

  /**
   * Validate criteria data structure
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!this.requirement_reference || this.requirement_reference.trim().length === 0) {
      errors.push('Requirement reference is required');
    }

    if (!this.criterion || this.criterion.trim().length === 0) {
      errors.push('Criterion description is required');
    }

    if (!this.measurement_method || this.measurement_method.trim().length === 0) {
      errors.push('Measurement method is required');
    }

    if (!this.success_threshold || this.success_threshold.trim().length === 0) {
      warnings.push('Success threshold not defined - may lead to ambiguous validation');
    }

    // Validation method validation
    if (!this.isValidValidationMethod(this.validation_method)) {
      errors.push(`Invalid validation method: ${this.validation_method}`);
    }

    // Automation level validation
    if (!this.isValidAutomationLevel(this.automation_level)) {
      errors.push(`Invalid automation level: ${this.automation_level}`);
    }

    // Priority validation
    if (!this.isValidPriority(this.priority)) {
      errors.push(`Invalid priority: ${this.priority}`);
    }

    // Estimated effort validation
    if (typeof this.estimated_effort !== 'number' || this.estimated_effort <= 0) {
      warnings.push('Estimated effort should be a positive number');
    }

    // Success criteria validation
    if (this.success_criteria.length === 0) {
      warnings.push('No success criteria defined - validation may be incomplete');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if validation method is valid
   * @param {string} method - Validation method
   * @returns {boolean} True if valid
   */
  isValidValidationMethod(method) {
    const validMethods = ['automated', 'manual', 'hybrid'];
    return validMethods.includes(method);
  }

  /**
   * Check if automation level is valid
   * @param {string} level - Automation level
   * @returns {boolean} True if valid
   */
  isValidAutomationLevel(level) {
    const validLevels = ['full', 'partial', 'none'];
    return validLevels.includes(level);
  }

  /**
   * Check if priority is valid
   * @param {string} priority - Priority level
   * @returns {boolean} True if valid
   */
  isValidPriority(priority) {
    const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    return validPriorities.includes(priority);
  }

  /**
   * Add success criterion
   * @param {Object} criterion - Success criterion
   */
  addSuccessCriterion(criterion) {
    if (!criterion || typeof criterion !== 'object') {
      throw new Error('Success criterion must be a valid object');
    }

    const successCriterion = {
      id: criterion.id || this.generateSuccessCriterionId(),
      criterion: criterion.criterion || '',
      measurement: criterion.measurement || '',
      threshold: criterion.threshold || '',
      pass_condition: criterion.pass_condition || '',
      failure_condition: criterion.failure_condition || '',
      measurement_unit: criterion.measurement_unit || '',
      tolerance: criterion.tolerance || null
    };

    this.success_criteria.push(successCriterion);
  }

  /**
   * Generate success criterion ID
   * @returns {string} Success criterion ID
   */
  generateSuccessCriterionId() {
    return `SC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  }

  /**
   * Add test scenario
   * @param {Object} scenario - Test scenario
   */
  addTestScenario(scenario) {
    if (!scenario || typeof scenario !== 'object') {
      throw new Error('Test scenario must be a valid object');
    }

    const testScenario = {
      id: scenario.id || this.generateTestScenarioId(),
      name: scenario.name || '',
      description: scenario.description || '',
      preconditions: scenario.preconditions || [],
      steps: scenario.steps || [],
      expected_result: scenario.expected_result || '',
      test_data: scenario.test_data || {},
      automation_feasible: scenario.automation_feasible !== false,
      estimated_execution_time: scenario.estimated_execution_time || 1
    };

    this.test_scenarios.push(testScenario);
  }

  /**
   * Generate test scenario ID
   * @returns {string} Test scenario ID
   */
  generateTestScenarioId() {
    return `TS-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  }

  /**
   * Set constitutional compliance criteria
   * @param {Object} compliance - Constitutional compliance criteria
   */
  setConstitutionalCompliance(compliance) {
    this.constitutional_compliance = {
      timing_limits: compliance.timing_limits || {},
      performance_standards: compliance.performance_standards || {},
      swarm_coordination_required: compliance.swarm_coordination_required || false,
      test_first_validation: compliance.test_first_validation || false,
      character_consistency_required: compliance.character_consistency_required || false,
      principles_to_validate: compliance.principles_to_validate || [],
      compliance_thresholds: compliance.compliance_thresholds || {}
    };

    // Add constitutional success criteria
    if (compliance.timing_limits) {
      Object.keys(compliance.timing_limits).forEach(metric => {
        const limit = compliance.timing_limits[metric];
        this.addSuccessCriterion({
          criterion: `${metric} constitutional compliance`,
          measurement: `Measure ${metric} execution time`,
          threshold: `<= ${limit.value}${limit.unit}`,
          pass_condition: `${metric} completes within ${limit.value}${limit.unit}`,
          failure_condition: `${metric} exceeds ${limit.value}${limit.unit}`,
          measurement_unit: limit.unit
        });
      });
    }
  }

  /**
   * Set character validation criteria
   * @param {Object} validation - Character validation criteria
   */
  setCharacterValidation(validation) {
    this.character_validation = {
      personality_consistency: validation.personality_consistency || true,
      tone_requirements: validation.tone_requirements || ['friendly', 'honest', 'fun'],
      forbidden_language: validation.forbidden_language || ['cringe', 'overly-effusive'],
      encouragement_level: validation.encouragement_level || 0.8,
      authenticity_threshold: validation.authenticity_threshold || 0.7,
      user_experience_impact: validation.user_experience_impact || true
    };

    // Add character-specific success criteria
    this.addSuccessCriterion({
      criterion: 'Character consistency validation',
      measurement: 'Analyze user-facing content for personality compliance',
      threshold: '>= 80% consistency score',
      pass_condition: 'Content maintains Spec Golden Retriever personality',
      failure_condition: 'Content contains harsh, technical, or cringe language'
    });

    if (validation.personality_consistency) {
      this.addTestScenario({
        name: 'Character personality validation',
        description: 'Validate that all user interactions maintain character consistency',
        steps: [
          'Review all user-facing messages and feedback',
          'Check for friendly, encouraging language',
          'Verify absence of harsh technical terms',
          'Validate authenticity (not cringe or overly effusive)'
        ],
        expected_result: 'All content aligns with Spec Golden Retriever personality',
        automation_feasible: true
      });
    }
  }

  /**
   * Set performance criteria
   * @param {Object} criteria - Performance criteria
   */
  setPerformanceCriteria(criteria) {
    this.performance_criteria = {
      timing_requirements: criteria.timing_requirements || {},
      resource_limits: criteria.resource_limits || {},
      scalability_requirements: criteria.scalability_requirements || {},
      reliability_requirements: criteria.reliability_requirements || {},
      measurement_precision: criteria.measurement_precision || 1
    };

    // Add performance-specific success criteria
    if (criteria.timing_requirements) {
      Object.keys(criteria.timing_requirements).forEach(operation => {
        const requirement = criteria.timing_requirements[operation];
        this.addSuccessCriterion({
          criterion: `${operation} performance`,
          measurement: `Measure ${operation} execution time using performance.now()`,
          threshold: `<= ${requirement.limit}${requirement.unit}`,
          pass_condition: `${operation} completes within ${requirement.limit}${requirement.unit}`,
          failure_condition: `${operation} exceeds ${requirement.limit}${requirement.unit}`,
          measurement_unit: requirement.unit,
          tolerance: requirement.tolerance || 0.1
        });
      });
    }
  }

  /**
   * Generate automated test code
   * @param {Object} options - Code generation options
   * @returns {string} Test code
   */
  generateAutomatedTestCode(options = {}) {
    const { framework = 'node-test', language = 'javascript' } = options;

    if (this.automation_level === 'none') {
      return '// Manual validation required - no automated test code generated';
    }

    let testCode = '';

    // Test file header
    testCode += `// Automated validation test for ${this.requirement_reference}\n`;
    testCode += `// Generated from validation criteria: ${this.criteria_id}\n\n`;

    if (framework === 'node-test') {
      testCode += `import { test, describe } from 'node:test';\n`;
      testCode += `import assert from 'node:assert';\n`;
      testCode += `import { performance } from 'node:perf_hooks';\n\n`;

      testCode += `describe('${this.requirement_reference} Validation', () => {\n`;

      // Generate test for each success criterion
      this.success_criteria.forEach(criterion => {
        testCode += this.generateCriterionTest(criterion, framework);
      });

      // Generate test scenarios
      this.test_scenarios.forEach(scenario => {
        if (scenario.automation_feasible) {
          testCode += this.generateScenarioTest(scenario, framework);
        }
      });

      testCode += `});\n`;
    }

    return testCode;
  }

  /**
   * Generate test for a specific criterion
   * @param {Object} criterion - Success criterion
   * @param {string} framework - Test framework
   * @returns {string} Test code
   */
  generateCriterionTest(criterion, framework) {
    let testCode = '';

    testCode += `  test('${criterion.criterion}', async () => {\n`;
    testCode += `    // ${criterion.measurement}\n`;

    // Performance measurement for timing criteria
    if (criterion.measurement_unit === 'ms' || criterion.measurement_unit === 'milliseconds') {
      testCode += `    const startTime = performance.now();\n`;
      testCode += `    \n`;
      testCode += `    // TODO: Execute the operation being measured\n`;
      testCode += `    // const result = await operationUnderTest();\n`;
      testCode += `    \n`;
      testCode += `    const duration = performance.now() - startTime;\n`;
      testCode += `    \n`;

      // Extract threshold value
      const thresholdMatch = criterion.threshold.match(/<=?\s*(\d+)/);
      if (thresholdMatch) {
        const thresholdValue = thresholdMatch[1];
        testCode += `    assert.ok(duration <= ${thresholdValue}, \`Operation took \${duration}ms, should be <= ${thresholdValue}ms\`);\n`;
      }
    } else {
      testCode += `    // TODO: Implement measurement for ${criterion.measurement}\n`;
      testCode += `    // const actualValue = await measureActualValue();\n`;
      testCode += `    // assert.ok(actualValue meets threshold: ${criterion.threshold});\n`;
    }

    testCode += `  });\n\n`;

    return testCode;
  }

  /**
   * Generate test for a test scenario
   * @param {Object} scenario - Test scenario
   * @param {string} framework - Test framework
   * @returns {string} Test code
   */
  generateScenarioTest(scenario, framework) {
    let testCode = '';

    testCode += `  test('${scenario.name}', async () => {\n`;
    testCode += `    // ${scenario.description}\n`;
    testCode += `    \n`;

    // Preconditions
    if (scenario.preconditions.length > 0) {
      testCode += `    // Preconditions:\n`;
      scenario.preconditions.forEach(precondition => {
        testCode += `    // - ${precondition}\n`;
      });
      testCode += `    \n`;
    }

    // Test steps
    if (scenario.steps.length > 0) {
      testCode += `    // Test steps:\n`;
      scenario.steps.forEach((step, index) => {
        testCode += `    // Step ${index + 1}: ${step}\n`;
        testCode += `    // TODO: Implement step ${index + 1}\n`;
      });
      testCode += `    \n`;
    }

    testCode += `    // Expected result: ${scenario.expected_result}\n`;
    testCode += `    // TODO: Validate expected result\n`;
    testCode += `    // assert.ok(actualResult matches expected result);\n`;

    testCode += `  });\n\n`;

    return testCode;
  }

  /**
   * Calculate automation feasibility score
   * @returns {number} Automation feasibility score (0-1)
   */
  calculateAutomationFeasibility() {
    let score = 0;

    // Base score from automation level
    switch (this.automation_level) {
      case 'full':
        score += 0.5;
        break;
      case 'partial':
        score += 0.3;
        break;
      case 'none':
        return 0;
    }

    // Bonus for measurable criteria
    const measurableCount = this.success_criteria.filter(criterion =>
      criterion.measurement_unit && criterion.threshold
    ).length;
    score += (measurableCount / Math.max(this.success_criteria.length, 1)) * 0.3;

    // Bonus for automatable test scenarios
    const automatableScenarios = this.test_scenarios.filter(scenario =>
      scenario.automation_feasible
    ).length;
    if (this.test_scenarios.length > 0) {
      score += (automatableScenarios / this.test_scenarios.length) * 0.2;
    }

    return Math.min(1.0, score);
  }

  /**
   * Estimate validation effort
   * @returns {Object} Effort estimation
   */
  estimateValidationEffort() {
    const baseEffort = this.estimated_effort;
    let totalEffort = baseEffort;

    // Additional effort for manual validation
    if (this.validation_method === 'manual') {
      totalEffort *= 2;
    } else if (this.validation_method === 'hybrid') {
      totalEffort *= 1.5;
    }

    // Additional effort for complex criteria
    const complexCriteria = this.success_criteria.filter(criterion =>
      !criterion.measurement_unit || criterion.measurement.includes('complex')
    ).length;
    totalEffort += complexCriteria * 0.5;

    // Additional effort for character validation
    if (this.character_validation.personality_consistency) {
      totalEffort += 1;
    }

    // Additional effort for performance criteria
    if (Object.keys(this.performance_criteria.timing_requirements || {}).length > 0) {
      totalEffort += 2;
    }

    return {
      estimated_hours: Math.ceil(totalEffort),
      automation_savings: this.calculateAutomationFeasibility() * baseEffort * 0.7,
      manual_effort_hours: this.validation_method === 'manual' ? totalEffort : totalEffort * 0.3,
      automated_effort_hours: this.validation_method === 'automated' ? totalEffort * 0.3 : totalEffort * 0.7
    };
  }

  /**
   * Update timestamp
   */
  touch() {
    this.updated_at = new Date().toISOString();
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      criteria_id: this.criteria_id,
      requirement_reference: this.requirement_reference,
      criterion: this.criterion,
      measurement_method: this.measurement_method,
      success_threshold: this.success_threshold,
      validation_method: this.validation_method,
      automation_level: this.automation_level,
      estimated_effort: this.estimated_effort,
      priority: this.priority,
      success_criteria: this.success_criteria,
      test_scenarios: this.test_scenarios,
      acceptance_criteria: this.acceptance_criteria,
      validation_tools: this.validation_tools,
      constitutional_compliance: this.constitutional_compliance,
      character_validation: this.character_validation,
      performance_criteria: this.performance_criteria,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Create criteria from JSON data
   * @param {Object} data - JSON data
   * @returns {ValidationCriteria} Criteria instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for ValidationCriteria');
    }

    return new ValidationCriteria(data);
  }

  /**
   * Create performance validation criteria
   * @param {string} requirementId - Requirement ID
   * @param {Object} performanceRequirements - Performance requirements
   * @param {Object} options - Creation options
   * @returns {ValidationCriteria} Performance criteria
   */
  static createPerformanceValidationCriteria(requirementId, performanceRequirements, options = {}) {
    const criteria = new ValidationCriteria({
      requirement_reference: requirementId,
      criterion: `Performance validation for ${requirementId}`,
      measurement_method: 'Automated performance measurement using performance.now()',
      validation_method: 'automated',
      automation_level: 'full',
      priority: 'HIGH',
      ...options
    });

    criteria.setPerformanceCriteria({
      timing_requirements: performanceRequirements
    });

    // Add constitutional timing limits if applicable
    if (performanceRequirements.animation_duration) {
      criteria.setConstitutionalCompliance({
        timing_limits: {
          animation: { value: 500, unit: 'ms' }
        }
      });
    }

    return criteria;
  }

  /**
   * Create character consistency validation criteria
   * @param {string} requirementId - Requirement ID
   * @param {Object} characterRequirements - Character requirements
   * @param {Object} options - Creation options
   * @returns {ValidationCriteria} Character criteria
   */
  static createCharacterValidationCriteria(requirementId, characterRequirements, options = {}) {
    const criteria = new ValidationCriteria({
      requirement_reference: requirementId,
      criterion: `Character consistency validation for ${requirementId}`,
      measurement_method: 'Automated content analysis and manual review',
      validation_method: 'hybrid',
      automation_level: 'partial',
      priority: 'MEDIUM',
      ...options
    });

    criteria.setCharacterValidation(characterRequirements);

    return criteria;
  }

  /**
   * Create constitutional compliance validation criteria
   * @param {string} requirementId - Requirement ID
   * @param {Object} constitutionalRequirements - Constitutional requirements
   * @param {Object} options - Creation options
   * @returns {ValidationCriteria} Constitutional criteria
   */
  static createConstitutionalValidationCriteria(requirementId, constitutionalRequirements, options = {}) {
    const criteria = new ValidationCriteria({
      requirement_reference: requirementId,
      criterion: `Constitutional compliance validation for ${requirementId}`,
      measurement_method: 'Automated compliance checking against constitutional standards',
      validation_method: 'automated',
      automation_level: 'full',
      priority: 'CRITICAL',
      ...options
    });

    criteria.setConstitutionalCompliance(constitutionalRequirements);

    return criteria;
  }
}

/**
 * Validation Criteria Collection
 * Manages collections of validation criteria with generation capabilities
 */
export class ValidationCriteriaCollection {
  constructor() {
    this.criteria = [];
  }

  /**
   * Add criteria to collection
   * @param {ValidationCriteria} criterion - Criteria to add
   */
  add(criterion) {
    if (!(criterion instanceof ValidationCriteria)) {
      throw new Error('Must be a ValidationCriteria instance');
    }

    this.criteria.push(criterion);
  }

  /**
   * Remove criteria by ID
   * @param {string} criteriaId - Criteria ID
   * @returns {boolean} True if removed
   */
  remove(criteriaId) {
    const index = this.criteria.findIndex(c => c.id === criteriaId);
    if (index >= 0) {
      this.criteria.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get criteria by requirement ID
   * @param {string} requirementId - Requirement ID
   * @returns {ValidationCriteria[]} Filtered criteria
   */
  getByRequirement(requirementId) {
    return this.criteria.filter(c => c.requirement_reference === requirementId);
  }

  /**
   * Get criteria by validation method
   * @param {string} method - Validation method
   * @returns {ValidationCriteria[]} Filtered criteria
   */
  getByValidationMethod(method) {
    return this.criteria.filter(c => c.validation_method === method);
  }

  /**
   * Get automatable criteria
   * @returns {ValidationCriteria[]} Automatable criteria
   */
  getAutomatable() {
    return this.criteria.filter(c =>
      c.automation_level === 'full' || c.automation_level === 'partial'
    );
  }

  /**
   * Generate validation test suite
   * @param {Object} options - Generation options
   * @returns {string} Test suite code
   */
  generateValidationTestSuite(options = {}) {
    const { framework = 'node-test', includeManual = false } = options;

    let testSuite = '';

    // Test suite header
    testSuite += `// Validation Test Suite\n`;
    testSuite += `// Generated from ${this.criteria.length} validation criteria\n`;
    testSuite += `// Framework: ${framework}\n\n`;

    if (framework === 'node-test') {
      testSuite += `import { test, describe } from 'node:test';\n`;
      testSuite += `import assert from 'node:assert';\n`;
      testSuite += `import { performance } from 'node:perf_hooks';\n\n`;

      testSuite += `describe('Validation Test Suite', () => {\n`;

      // Group by requirement
      const byRequirement = {};
      this.criteria.forEach(criterion => {
        if (!byRequirement[criterion.requirement_reference]) {
          byRequirement[criterion.requirement_reference] = [];
        }
        byRequirement[criterion.requirement_reference].push(criterion);
      });

      Object.keys(byRequirement).forEach(requirementId => {
        testSuite += `\n  describe('${requirementId} Validation', () => {\n`;

        byRequirement[requirementId].forEach(criterion => {
          if (criterion.automation_level !== 'none' || includeManual) {
            const criterionTests = criterion.generateAutomatedTestCode({ framework });
            // Indent the generated tests
            const indentedTests = criterionTests
              .split('\n')
              .map(line => line.startsWith('describe') || line.startsWith('import') ? '' : `  ${line}`)
              .filter(line => line.length > 0)
              .join('\n');

            testSuite += indentedTests;
          }
        });

        testSuite += `  });\n`;
      });

      testSuite += `});\n`;
    }

    return testSuite;
  }

  /**
   * Calculate validation effort summary
   * @returns {Object} Effort summary
   */
  calculateValidationEffortSummary() {
    const summary = {
      total_criteria: this.criteria.length,
      total_estimated_hours: 0,
      automation_savings_hours: 0,
      manual_effort_hours: 0,
      automated_effort_hours: 0,
      by_priority: {},
      by_validation_method: {},
      automation_feasibility: 0
    };

    this.criteria.forEach(criterion => {
      const effort = criterion.estimateValidationEffort();

      summary.total_estimated_hours += effort.estimated_hours;
      summary.automation_savings_hours += effort.automation_savings;
      summary.manual_effort_hours += effort.manual_effort_hours;
      summary.automated_effort_hours += effort.automated_effort_hours;

      // Count by priority
      summary.by_priority[criterion.priority] = (summary.by_priority[criterion.priority] || 0) + 1;

      // Count by validation method
      summary.by_validation_method[criterion.validation_method] = (summary.by_validation_method[criterion.validation_method] || 0) + 1;
    });

    // Calculate overall automation feasibility
    if (this.criteria.length > 0) {
      summary.automation_feasibility = this.criteria.reduce((sum, criterion) =>
        sum + criterion.calculateAutomationFeasibility(), 0
      ) / this.criteria.length;
    }

    return summary;
  }

  /**
   * Export collection to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      criteria: this.criteria.map(c => c.toJSON()),
      summary: this.calculateValidationEffortSummary()
    };
  }

  /**
   * Import collection from JSON
   * @param {Object} data - JSON data
   * @returns {ValidationCriteriaCollection} Collection instance
   */
  static fromJSON(data) {
    const collection = new ValidationCriteriaCollection();

    if (data.criteria && Array.isArray(data.criteria)) {
      data.criteria.forEach(criteriaData => {
        const criterion = ValidationCriteria.fromJSON(criteriaData);
        collection.add(criterion);
      });
    }

    return collection;
  }
}