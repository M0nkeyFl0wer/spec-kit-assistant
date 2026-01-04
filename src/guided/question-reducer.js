/**
 * QuestionReducer
 * Enforces question limits and prioritizes which questions to ask.
 * Implements FR-001 (max 1 primary + expansion) and FR-011 (max 3 clarifications)
 */

export class QuestionReducer {
  /**
   * @param {Object} options
   * @param {number} [options.maxPrimaryQuestions=1] - Max primary questions per phase
   * @param {number} [options.maxFollowUpQuestions=2] - Max follow-up questions
   * @param {number} [options.maxClarifications=3] - Max total clarifications
   * @param {number} [options.confidenceThreshold=0.7] - Skip question if default confidence >= this
   */
  constructor(options = {}) {
    this.maxPrimaryQuestions = options.maxPrimaryQuestions ?? 1;
    this.maxFollowUpQuestions = options.maxFollowUpQuestions ?? 2;
    this.maxClarifications = options.maxClarifications ?? 3;
    this.confidenceThreshold = options.confidenceThreshold ?? 0.7;
  }

  /**
   * Reduce a list of potential questions to the essential ones
   * @param {Object[]} questions - All possible questions
   * @param {Object[]} defaults - Available smart defaults
   * @returns {Object} { primary: Question|null, followUp: Question[], expandable: Question[] }
   */
  reduce(questions, defaults = []) {
    // Create a map of defaults by questionId
    const defaultsMap = new Map(
      defaults.map(d => [d.questionId, d])
    );

    // Categorize questions
    const primary = [];
    const standard = [];
    const expandable = [];

    for (const q of questions) {
      const hasDefault = defaultsMap.has(q.id);
      const defaultConfidence = hasDefault ? defaultsMap.get(q.id).confidence : 0;

      // Skip if high-confidence default exists
      if (defaultConfidence >= this.confidenceThreshold) {
        // Move to expandable (advanced options)
        expandable.push({ ...q, hasDefault: true, defaultConfidence });
        continue;
      }

      // Categorize by priority
      if (q.primary || q.priority === 'critical') {
        primary.push(q);
      } else if (q.expandable === true) {
        expandable.push(q);
      } else {
        standard.push(q);
      }
    }

    // Sort by priority/importance
    primary.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    standard.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Select questions within limits
    const selectedPrimary = primary.slice(0, this.maxPrimaryQuestions)[0] || null;
    const selectedFollowUp = standard.slice(0, this.maxFollowUpQuestions);

    return {
      primary: selectedPrimary,
      followUp: selectedFollowUp,
      expandable,
      skippedCount: questions.length - (selectedPrimary ? 1 : 0) - selectedFollowUp.length,
      stats: {
        total: questions.length,
        asked: (selectedPrimary ? 1 : 0) + selectedFollowUp.length,
        skipped: expandable.length,
        withDefaults: defaults.length
      }
    };
  }

  /**
   * Reduce clarification questions for specify workflow
   * @param {Object[]} questions - Clarification questions
   * @param {Object[]} defaults - Available smart defaults
   * @returns {Object[]} Reduced question list (max 3)
   */
  reduceClarifications(questions, defaults = []) {
    const defaultsMap = new Map(
      defaults.map(d => [d.questionId, d])
    );

    // Filter out high-confidence defaults
    const needsClarification = questions.filter(q => {
      const hasDefault = defaultsMap.has(q.id);
      if (!hasDefault) return true;

      const defaultConfidence = defaultsMap.get(q.id).confidence;
      return defaultConfidence < this.confidenceThreshold;
    });

    // Sort by importance (lower default confidence = more important to ask)
    needsClarification.sort((a, b) => {
      const aConf = defaultsMap.get(a.id)?.confidence || 0;
      const bConf = defaultsMap.get(b.id)?.confidence || 0;
      return aConf - bConf;
    });

    // Return max allowed clarifications
    return needsClarification.slice(0, this.maxClarifications);
  }

  /**
   * Check if a question can be skipped due to high-confidence default
   * @param {string} questionId
   * @param {Object[]} defaults
   * @returns {boolean}
   */
  canSkip(questionId, defaults) {
    const def = defaults.find(d => d.questionId === questionId);
    return def && def.confidence >= this.confidenceThreshold;
  }

  /**
   * Get the default value for a question if it can be auto-applied
   * @param {string} questionId
   * @param {Object[]} defaults
   * @returns {Object|null} { value, confidence, reasoning } or null
   */
  getAutoValue(questionId, defaults) {
    const def = defaults.find(d => d.questionId === questionId);
    if (def && def.confidence >= 0.9) {
      return {
        value: def.value,
        confidence: def.confidence,
        reasoning: def.reasoning
      };
    }
    return null;
  }

  /**
   * Calculate how many questions would be asked vs skipped
   * @param {Object[]} questions
   * @param {Object[]} defaults
   * @returns {Object} { asked: number, skipped: number, total: number }
   */
  preview(questions, defaults = []) {
    const result = this.reduce(questions, defaults);
    return result.stats;
  }

  /**
   * Create a reducer with strict limits (for quick mode)
   * @returns {QuestionReducer}
   */
  static strict() {
    return new QuestionReducer({
      maxPrimaryQuestions: 1,
      maxFollowUpQuestions: 0,
      maxClarifications: 1,
      confidenceThreshold: 0.5
    });
  }

  /**
   * Create a reducer with relaxed limits (for detailed mode)
   * @returns {QuestionReducer}
   */
  static relaxed() {
    return new QuestionReducer({
      maxPrimaryQuestions: 1,
      maxFollowUpQuestions: 5,
      maxClarifications: 5,
      confidenceThreshold: 0.9
    });
  }

  /**
   * Create a reducer with default limits
   * @returns {QuestionReducer}
   */
  static default() {
    return new QuestionReducer();
  }
}
