/**
 * ClarificationQuestion Entity
 * A question asked to clarify feature requirements.
 * Implements FR-002 (2-4 options with implications) and FR-011 (max 3 clarifications)
 * @see data-model.md for specification
 */

import { Option } from './option.js';

export class ClarificationQuestion {
  /**
   * @param {Object} data - ClarificationQuestion data
   * @param {string} data.id - Unique question identifier
   * @param {string} data.question - The question text
   * @param {string} data.context - Why this question matters
   * @param {Option[]} data.options - 2-4 suggested answers
   * @param {Object} [data.smartDefault] - SmartDefault if applicable
   * @param {boolean} [data.allowOther=true] - Allow free-text "Other" option
   * @param {number} [data.priority=0] - Higher = more important to ask
   */
  constructor(data = {}) {
    this.id = data.id;
    this.question = data.question;
    this.context = data.context || '';
    this.options = this._initOptions(data.options);
    this.smartDefault = data.smartDefault || null;
    this.allowOther = data.allowOther ?? true;
    this.priority = data.priority ?? 0;

    // Track user's answer
    this._answer = null;
    this._answeredAt = null;
  }

  /**
   * Initialize options from data
   * @private
   */
  _initOptions(optionsData = []) {
    if (!optionsData || optionsData.length === 0) {
      return [];
    }

    return optionsData.map(opt => {
      if (opt instanceof Option) return opt;
      return new Option(opt);
    });
  }

  /**
   * Validate the clarification question
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.id) errors.push('id is required');
    if (!this.question) errors.push('question text is required');

    // Validate option count (2-4 per FR-002)
    if (this.options.length < 2) {
      errors.push('minimum 2 options required');
    }
    if (this.options.length > 4) {
      errors.push('maximum 4 options allowed');
    }

    // Validate each option
    for (const opt of this.options) {
      const optValidation = opt.validate();
      if (!optValidation.valid) {
        errors.push(...optValidation.errors.map(e => `Option: ${e}`));
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get the default option if a smart default exists
   * @returns {Option|null}
   */
  getDefaultOption() {
    if (!this.smartDefault) return null;

    return this.options.find(opt =>
      opt.value === this.smartDefault.value ||
      opt.label === this.smartDefault.value
    ) || null;
  }

  /**
   * Check if this question has a high-confidence default that could be skipped
   * @param {number} [threshold=0.9] - Confidence threshold
   * @returns {boolean}
   */
  canAutoAnswer(threshold = 0.9) {
    return this.smartDefault && this.smartDefault.confidence >= threshold;
  }

  /**
   * Record the user's answer
   * @param {*} answer - The answer value (option value or free text)
   * @param {boolean} [wasOther=false] - Whether user chose "Other"
   */
  setAnswer(answer, wasOther = false) {
    this._answer = answer;
    this._answeredAt = new Date();
    this._wasOther = wasOther;
  }

  /**
   * Get the recorded answer
   * @returns {Object|null} { value, wasOther, answeredAt } or null if unanswered
   */
  getAnswer() {
    if (this._answer === null) return null;

    return {
      value: this._answer,
      wasOther: this._wasOther || false,
      answeredAt: this._answeredAt
    };
  }

  /**
   * Check if this question has been answered
   * @returns {boolean}
   */
  isAnswered() {
    return this._answer !== null;
  }

  /**
   * Get options formatted for inquirer prompt
   * @returns {Object[]}
   */
  getInquirerChoices() {
    const choices = this.options.map(opt => ({
      name: opt.getDisplayText(),
      value: opt.value,
      short: opt.label
    }));

    // Add "Other" option if allowed
    if (this.allowOther) {
      choices.push({
        name: 'Other (enter your own)',
        value: '__other__',
        short: 'Other'
      });
    }

    return choices;
  }

  /**
   * Serialize to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      question: this.question,
      context: this.context,
      options: this.options.map(opt => opt.toJSON()),
      smartDefault: this.smartDefault,
      allowOther: this.allowOther,
      priority: this.priority,
      answer: this.getAnswer()
    };
  }

  /**
   * Create ClarificationQuestion from JSON
   * @param {Object} json
   * @returns {ClarificationQuestion}
   */
  static fromJSON(json) {
    const question = new ClarificationQuestion({
      ...json,
      options: json.options?.map(opt => Option.fromJSON(opt))
    });

    if (json.answer) {
      question.setAnswer(json.answer.value, json.answer.wasOther);
    }

    return question;
  }

  /**
   * Create a simple yes/no question
   * @param {string} id - Question ID
   * @param {string} question - Question text
   * @param {Object} [options] - Additional options
   * @returns {ClarificationQuestion}
   */
  static yesNo(id, question, options = {}) {
    return new ClarificationQuestion({
      id,
      question,
      context: options.context,
      allowOther: false,
      options: [
        new Option({ value: true, label: 'Yes', implications: options.yesImplication }),
        new Option({ value: false, label: 'No', implications: options.noImplication })
      ],
      smartDefault: options.smartDefault,
      priority: options.priority
    });
  }

  /**
   * Create a multi-choice question
   * @param {string} id - Question ID
   * @param {string} question - Question text
   * @param {Object[]} choices - Array of { value, label, implications }
   * @param {Object} [options] - Additional options
   * @returns {ClarificationQuestion}
   */
  static multiChoice(id, question, choices, options = {}) {
    return new ClarificationQuestion({
      id,
      question,
      context: options.context,
      allowOther: options.allowOther ?? true,
      options: choices.slice(0, 4).map(c => new Option(c)),
      smartDefault: options.smartDefault,
      priority: options.priority
    });
  }
}
