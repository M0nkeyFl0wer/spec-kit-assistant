/**
 * T033: Character response validation implementation
 * Validates character responses for personality consistency and constitutional compliance
 * Ensures Spec the Golden Retriever maintains "friendly, honest, fun, not cringe" personality
 */

export class CharacterResponseValidator {
  constructor() {
    this.personalityRules = this.initializePersonalityRules();
    this.constitutionalRules = this.initializeConstitutionalRules();
    this.validationCache = new Map();
    this.validationMetrics = {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      averageScore: 0
    };
  }

  /**
   * Initialize personality validation rules
   */
  initializePersonalityRules() {
    return {
      friendly: {
        required: [
          /🐕/,  // Must include dog emoji
          /(hello|hi|hey|woof|good|great|nice|welcome)/i,
          /(you|we|us|together)/i
        ],
        forbidden: [
          /(hate|terrible|awful|stupid|idiot)/i,
          /[!]{3,}/,  // No excessive exclamation
          /(shut up|go away|leave me alone)/i
        ],
        weight: 0.3
      },

      honest: {
        required: [
          // Honest language patterns
          /(i think|maybe|possibly|might|could|seems|appears)/i,
          /(let me check|not sure|don't know|need to|should)/i
        ],
        forbidden: [
          /(definitely|absolutely|perfect|flawless|guaranteed)/i,
          /(always works|never fails|100% sure|impossible to)/i,
          /(trust me|believe me|obviously|clearly)/i
        ],
        hedging: [
          /(i think|maybe|possibly|might|could|seems)/i,
          /(probably|likely|should|would|may)/i
        ],
        weight: 0.3
      },

      fun: {
        required: [
          /(\*.*\*)|(\(.*\))/,  // Actions in asterisks or parentheses
          /(tail|wag|bark|paw|fetch|play|happy|excited)/i,
          /[!?]/  // Some punctuation for energy
        ],
        forbidden: [
          /(boring|dull|tedious|mundane)/i,
          /[.]{3,}/,  // No excessive dots
          /(serious business|formal|professional only)/i
        ],
        playful: [
          /(\*tail wagging\*|\*happy bark\*|\*excited\*)/i,
          /(woof|arf|yip|ruff)/i,
          /(fetch|play|fun|game|adventure)/i
        ],
        weight: 0.25
      },

      notCringe: {
        forbidden: [
          /(amazing amazing|super duper|absolutely incredible)/i,
          /(mind.blowing|life.changing|revolutionary)/i,
          /(bestie|fam|slay|periodt|no cap)/i,
          /[!]{4,}/,  // More than 3 exclamation marks
          /(uwu|owo|rawr|nya)/i,
          /(yass|queen|king|slay)/i
        ],
        cringe_patterns: [
          /(omg|oh my god).*amazing/i,
          /literally.*can't.*even/i,
          /this is.*everything/i,
          /(best|greatest).*ever.*ever/i
        ],
        weight: 0.15
      }
    };
  }

  /**
   * Initialize constitutional compliance rules
   */
  initializeConstitutionalRules() {
    return {
      length: {
        maxCharacters: 500,  // Reasonable response length
        maxWords: 100,
        recommendedRange: [10, 200]
      },

      timing: {
        maxProcessingTime: 100,  // 100ms validation limit
        recommended: 50
      },

      resource: {
        maxMemoryUsage: 1024 * 1024,  // 1MB for validation
        cpuIntensive: false
      },

      safety: {
        forbiddenTopics: [
          /(hack|exploit|crack|steal)/i,
          /(illegal|criminal|fraud|scam)/i,
          /(violence|harm|hurt|damage)/i
        ],
        personalInfo: [
          /(password|ssn|credit card)/i,
          /(address|phone number|email)/i
        ]
      }
    };
  }

  /**
   * Validate response against all rules
   * @param {string} response - Response text to validate
   * @param {Object} context - Response context
   * @returns {Object} Validation results
   */
  validate(response, context = {}) {
    const startTime = performance.now();

    // Quick cache check
    const cacheKey = this.generateCacheKey(response, context);
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey);
    }

    const validation = {
      valid: false,
      score: 0,
      issues: [],
      warnings: [],
      suggestions: [],
      breakdown: {},
      constitutional: true,
      processingTime: 0
    };

    try {
      // Constitutional validation first (fail fast)
      const constitutionalResult = this.validateConstitutional(response);
      validation.constitutional = constitutionalResult.valid;
      if (!constitutionalResult.valid) {
        validation.issues.push(...constitutionalResult.issues);
        return this.finalizeValidation(validation, startTime, cacheKey);
      }

      // Personality validation
      const personalityResult = this.validatePersonality(response, context);
      validation.breakdown = personalityResult.breakdown;
      validation.score = personalityResult.score;
      validation.issues.push(...personalityResult.issues);
      validation.warnings.push(...personalityResult.warnings);
      validation.suggestions.push(...personalityResult.suggestions);

      // Determine overall validity
      validation.valid = validation.constitutional && validation.score >= 0.6;

      // Update metrics
      this.updateMetrics(validation);

    } catch (error) {
      validation.valid = false;
      validation.issues.push(`Validation error: ${error.message}`);
    }

    return this.finalizeValidation(validation, startTime, cacheKey);
  }

  /**
   * Validate constitutional compliance
   */
  validateConstitutional(response) {
    const result = { valid: true, issues: [] };
    const rules = this.constitutionalRules;

    // Length validation
    if (response.length > rules.length.maxCharacters) {
      result.valid = false;
      result.issues.push(`Response too long: ${response.length} > ${rules.length.maxCharacters} characters`);
    }

    const wordCount = response.split(/\s+/).length;
    if (wordCount > rules.length.maxWords) {
      result.valid = false;
      result.issues.push(`Response too wordy: ${wordCount} > ${rules.length.maxWords} words`);
    }

    // Safety validation
    for (const pattern of rules.safety.forbiddenTopics) {
      if (pattern.test(response)) {
        result.valid = false;
        result.issues.push('Response contains forbidden content');
      }
    }

    for (const pattern of rules.safety.personalInfo) {
      if (pattern.test(response)) {
        result.valid = false;
        result.issues.push('Response may contain personal information');
      }
    }

    return result;
  }

  /**
   * Validate personality traits
   */
  validatePersonality(response, context) {
    const result = {
      score: 0,
      breakdown: {},
      issues: [],
      warnings: [],
      suggestions: []
    };

    let totalWeight = 0;
    let weightedScore = 0;

    for (const [trait, rules] of Object.entries(this.personalityRules)) {
      const traitResult = this.validateTrait(response, trait, rules, context);
      result.breakdown[trait] = traitResult;

      weightedScore += traitResult.score * rules.weight;
      totalWeight += rules.weight;

      // Collect issues and suggestions
      if (traitResult.score < 0.5) {
        result.issues.push(`${trait} trait needs improvement (${(traitResult.score * 100).toFixed(0)}%)`);
      }

      if (traitResult.suggestions.length > 0) {
        result.suggestions.push(...traitResult.suggestions.map(s => `${trait}: ${s}`));
      }

      if (traitResult.warnings.length > 0) {
        result.warnings.push(...traitResult.warnings.map(w => `${trait}: ${w}`));
      }
    }

    result.score = totalWeight > 0 ? weightedScore / totalWeight : 0;

    return result;
  }

  /**
   * Validate specific personality trait
   */
  validateTrait(response, trait, rules, context) {
    const result = {
      score: 0.5, // Start neutral
      requiredScore: 0,
      forbiddenScore: 0,
      suggestions: [],
      warnings: []
    };

    // Check required patterns
    if (rules.required) {
      const requiredMatches = rules.required.filter(pattern => pattern.test(response));
      result.requiredScore = requiredMatches.length / rules.required.length;
    }

    // Check forbidden patterns
    if (rules.forbidden) {
      const forbiddenMatches = rules.forbidden.filter(pattern => pattern.test(response));
      result.forbiddenScore = forbiddenMatches.length > 0 ? -1 : 1;

      if (forbiddenMatches.length > 0) {
        result.warnings.push('Contains forbidden patterns');
      }
    }

    // Trait-specific validation
    switch (trait) {
      case 'friendly':
        result.score = this.validateFriendliness(response, rules, result);
        break;
      case 'honest':
        result.score = this.validateHonesty(response, rules, result);
        break;
      case 'fun':
        result.score = this.validateFun(response, rules, result);
        break;
      case 'notCringe':
        result.score = this.validateNotCringe(response, rules, result);
        break;
    }

    // Generate suggestions
    result.suggestions = this.generateTraitSuggestions(trait, result, response);

    return result;
  }

  /**
   * Validate friendliness
   */
  validateFriendliness(response, rules, result) {
    let score = 0.5;

    // Must have dog emoji for Spec character
    if (/🐕/.test(response)) {
      score += 0.3;
    } else {
      result.suggestions.push('Add 🐕 emoji for character consistency');
    }

    // Positive language
    if (/(good|great|nice|wonderful|awesome)/.test(response)) {
      score += 0.2;
    }

    // Inclusive language
    if (/(we|us|together|help|support)/.test(response)) {
      score += 0.2;
    }

    // Friendly forbidden patterns penalty
    if (result.forbiddenScore < 0) {
      score -= 0.5;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Validate honesty
   */
  validateHonesty(response, rules, result) {
    let score = 0.5;

    // Hedging language (shows uncertainty appropriately)
    const hedgingMatches = (rules.hedging || []).filter(pattern => pattern.test(response));
    if (hedgingMatches.length > 0) {
      score += 0.3;
    } else {
      result.suggestions.push('Add hedging language like "I think" or "maybe"');
    }

    // Avoid absolute statements
    if (result.forbiddenScore > 0) {
      score += 0.3;
    } else {
      score -= 0.4;
      result.warnings.push('Avoid absolute statements');
    }

    // Helpful qualification
    if (/(let me check|i'll help|let's see)/.test(response)) {
      score += 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Validate fun factor
   */
  validateFun(response, rules, result) {
    let score = 0.5;

    // Actions in asterisks (playful behavior)
    const actionMatches = response.match(/\*[^*]+\*/g) || [];
    if (actionMatches.length > 0) {
      score += 0.3;
    } else {
      result.suggestions.push('Add playful actions like *tail wagging*');
    }

    // Dog-related words
    if (/(tail|wag|bark|paw|fetch)/.test(response)) {
      score += 0.2;
    }

    // Appropriate energy
    const exclamationCount = (response.match(/!/g) || []).length;
    if (exclamationCount >= 1 && exclamationCount <= 2) {
      score += 0.2;
    } else if (exclamationCount > 3) {
      score -= 0.2;
      result.warnings.push('Too many exclamation marks');
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Validate not-cringe factor
   */
  validateNotCringe(response, rules, result) {
    let score = 1.0; // Start high, deduct for cringe

    // Check for cringe patterns
    const cringeMatches = rules.forbidden.filter(pattern => pattern.test(response));
    score -= cringeMatches.length * 0.3;

    // Check for special cringe patterns
    const specialCringe = (rules.cringe_patterns || []).filter(pattern => pattern.test(response));
    score -= specialCringe.length * 0.5;

    // Excessive punctuation
    const exclamationCount = (response.match(/!/g) || []).length;
    if (exclamationCount > 3) {
      score -= 0.3;
    }

    // Caps lock check
    const capsRatio = (response.match(/[A-Z]/g) || []).length / response.length;
    if (capsRatio > 0.3) {
      score -= 0.2;
      result.warnings.push('Too much CAPS LOCK');
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate suggestions for trait improvement
   */
  generateTraitSuggestions(trait, result, response) {
    const suggestions = [];

    switch (trait) {
      case 'friendly':
        if (result.score < 0.7) {
          if (!/🐕/.test(response)) suggestions.push('Add dog emoji 🐕');
          if (!/\b(good|great|nice)\b/.test(response)) suggestions.push('Use positive language');
          if (!/\b(we|us|together)\b/.test(response)) suggestions.push('Use inclusive language');
        }
        break;

      case 'honest':
        if (result.score < 0.7) {
          suggestions.push('Add hedging words like "I think" or "maybe"');
          suggestions.push('Avoid absolute statements');
          suggestions.push('Acknowledge uncertainty when appropriate');
        }
        break;

      case 'fun':
        if (result.score < 0.7) {
          suggestions.push('Add playful actions in *asterisks*');
          suggestions.push('Include dog-related words (tail, wag, bark)');
          suggestions.push('Use appropriate exclamation for energy');
        }
        break;

      case 'notCringe':
        if (result.score < 0.7) {
          suggestions.push('Reduce excessive enthusiasm');
          suggestions.push('Avoid overused internet slang');
          suggestions.push('Limit exclamation marks to 1-2');
        }
        break;
    }

    return suggestions;
  }

  /**
   * Generate cache key for validation results
   */
  generateCacheKey(response, context) {
    const contextString = JSON.stringify(context);
    return `${response.length}_${response.slice(0, 50)}_${contextString}`.replace(/\s/g, '');
  }

  /**
   * Finalize validation and cache results
   */
  finalizeValidation(validation, startTime, cacheKey) {
    validation.processingTime = performance.now() - startTime;

    // Constitutional timing compliance
    if (validation.processingTime > this.constitutionalRules.timing.maxProcessingTime) {
      validation.constitutional = false;
      validation.issues.push('Validation took too long (constitutional violation)');
    }

    // Cache result
    this.validationCache.set(cacheKey, validation);

    return validation;
  }

  /**
   * Update validation metrics
   */
  updateMetrics(validation) {
    this.validationMetrics.totalValidations++;

    if (validation.valid) {
      this.validationMetrics.passedValidations++;
    } else {
      this.validationMetrics.failedValidations++;
    }

    // Update rolling average
    const total = this.validationMetrics.totalValidations;
    const current = this.validationMetrics.averageScore;
    this.validationMetrics.averageScore = ((current * (total - 1)) + validation.score) / total;
  }

  /**
   * Get validation metrics report
   */
  getMetrics() {
    const total = this.validationMetrics.totalValidations;
    const passed = this.validationMetrics.passedValidations;

    return {
      ...this.validationMetrics,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      cacheSize: this.validationCache.size,
      constitutional: {
        averageProcessingTime: this.calculateAverageProcessingTime(),
        complianceRate: this.calculateComplianceRate()
      }
    };
  }

  /**
   * Calculate average processing time from cache
   */
  calculateAverageProcessingTime() {
    const times = Array.from(this.validationCache.values())
      .map(v => v.processingTime)
      .filter(t => t !== undefined);

    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  /**
   * Calculate constitutional compliance rate
   */
  calculateComplianceRate() {
    const validations = Array.from(this.validationCache.values());
    const compliant = validations.filter(v => v.constitutional).length;

    return validations.length > 0 ? (compliant / validations.length) * 100 : 100;
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.validationCache.clear();
  }

  /**
   * Quick validation for performance-critical contexts
   * @param {string} response - Response to validate
   * @returns {boolean} Quick validation result
   */
  quickValidate(response) {
    // Quick constitutional check
    if (response.length > this.constitutionalRules.length.maxCharacters) {
      return false;
    }

    // Quick personality check
    const hasDogEmoji = /🐕/.test(response);
    const hasPositiveLanguage = /(good|great|nice|help)/.test(response);
    const avoidsCringe = !/amazing amazing|super duper/.test(response);

    return hasDogEmoji && hasPositiveLanguage && avoidsCringe;
  }

  /**
   * Create validator with custom rules
   * @param {Object} customRules - Custom personality rules
   * @returns {CharacterResponseValidator} Configured validator
   */
  static createWithRules(customRules = {}) {
    const validator = new CharacterResponseValidator();

    // Merge custom rules
    for (const [trait, rules] of Object.entries(customRules)) {
      if (validator.personalityRules[trait]) {
        Object.assign(validator.personalityRules[trait], rules);
      }
    }

    return validator;
  }

  /**
   * Create validator for constitutional compliance only
   */
  static createConstitutionalOnly() {
    const validator = new CharacterResponseValidator();

    // Override to only do constitutional validation
    validator.validate = function(response, context = {}) {
      const constitutionalResult = this.validateConstitutional(response);
      return {
        valid: constitutionalResult.valid,
        constitutional: constitutionalResult.valid,
        issues: constitutionalResult.issues,
        score: constitutionalResult.valid ? 1 : 0,
        processingTime: 0
      };
    };

    return validator;
  }
}

export default CharacterResponseValidator;