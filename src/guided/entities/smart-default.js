/**
 * SmartDefault Entity
 * A pre-computed suggestion based on context analysis.
 * @see data-model.md for specification
 */

/**
 * Sources for smart defaults
 */
export const DefaultSource = {
  ARCHETYPE: 'archetype',  // Derived from project type patterns
  HISTORY: 'history',      // Based on user's previous decisions
  PATTERN: 'pattern'       // Common industry patterns
};

export class SmartDefault {
  /**
   * @param {Object} data - SmartDefault data
   * @param {string} data.questionId - Which question this default answers
   * @param {*} data.value - The suggested default value
   * @param {number} data.confidence - How confident we are (0-1)
   * @param {string} data.reasoning - Human-readable explanation
   * @param {string} data.source - Where this default came from
   */
  constructor(data = {}) {
    this.questionId = data.questionId;
    this.value = data.value;
    this.confidence = data.confidence ?? 0.5;
    this.reasoning = data.reasoning || '';
    this.source = data.source || DefaultSource.PATTERN;
  }

  /**
   * Validate the smart default data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.questionId) errors.push('questionId is required');
    if (this.value === undefined) errors.push('value is required');

    // Validate confidence range
    if (typeof this.confidence !== 'number' || this.confidence < 0 || this.confidence > 1) {
      errors.push('confidence must be a number between 0 and 1');
    }

    // Validate source
    if (!Object.values(DefaultSource).includes(this.source)) {
      errors.push(`source must be one of: ${Object.values(DefaultSource).join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check if confidence meets threshold for presentation
   * @param {number} [threshold=0.5] - Minimum confidence to show default
   * @returns {boolean}
   */
  meetsThreshold(threshold = 0.5) {
    return this.confidence >= threshold;
  }

  /**
   * Check if confidence is high enough to auto-apply
   * @param {number} [threshold=0.9] - Threshold for auto-apply
   * @returns {boolean}
   */
  canAutoApply(threshold = 0.9) {
    return this.confidence >= threshold;
  }

  /**
   * Get confidence as percentage string
   * @returns {string}
   */
  getConfidencePercent() {
    return `${Math.round(this.confidence * 100)}%`;
  }

  /**
   * Get a human-readable description
   * @returns {string}
   */
  getDescription() {
    return `${this.reasoning} (${this.getConfidencePercent()} confident)`;
  }

  /**
   * Serialize to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      questionId: this.questionId,
      value: this.value,
      confidence: this.confidence,
      reasoning: this.reasoning,
      source: this.source
    };
  }

  /**
   * Create SmartDefault from JSON
   * @param {Object} json
   * @returns {SmartDefault}
   */
  static fromJSON(json) {
    return new SmartDefault(json);
  }

  /**
   * Create a high-confidence default
   * @param {string} questionId
   * @param {*} value
   * @param {string} reasoning
   * @param {string} [source]
   * @returns {SmartDefault}
   */
  static highConfidence(questionId, value, reasoning, source = DefaultSource.PATTERN) {
    return new SmartDefault({
      questionId,
      value,
      confidence: 0.9,
      reasoning,
      source
    });
  }

  /**
   * Create a medium-confidence default
   * @param {string} questionId
   * @param {*} value
   * @param {string} reasoning
   * @param {string} [source]
   * @returns {SmartDefault}
   */
  static mediumConfidence(questionId, value, reasoning, source = DefaultSource.PATTERN) {
    return new SmartDefault({
      questionId,
      value,
      confidence: 0.7,
      reasoning,
      source
    });
  }

  /**
   * Create a low-confidence default (still meets threshold)
   * @param {string} questionId
   * @param {*} value
   * @param {string} reasoning
   * @param {string} [source]
   * @returns {SmartDefault}
   */
  static lowConfidence(questionId, value, reasoning, source = DefaultSource.PATTERN) {
    return new SmartDefault({
      questionId,
      value,
      confidence: 0.5,
      reasoning,
      source
    });
  }
}
