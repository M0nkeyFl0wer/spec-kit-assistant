/**
 * Decision Entity
 * Records a single user decision for audit trail and learning.
 * @see data-model.md for specification
 */

import { v4 as uuidv4 } from 'uuid';

export class Decision {
  /**
   * @param {Object} data - Decision data
   * @param {string} [data.id] - Unique decision identifier
   * @param {string} data.phase - Which phase this decision was made in
   * @param {string} data.questionId - Identifier of the question asked
   * @param {string} data.question - Human-readable question text
   * @param {string} data.answer - User's selected/provided answer
   * @param {boolean} [data.wasDefault=false] - Whether user accepted a default
   * @param {number} [data.confidence] - Confidence of the default (0-1)
   * @param {string} [data.timestamp] - When decision was made
   */
  constructor(data = {}) {
    this.id = data.id || `dec-${uuidv4().slice(0, 8)}`;
    this.phase = data.phase;
    this.questionId = data.questionId;
    this.question = data.question;
    this.answer = data.answer;
    this.wasDefault = data.wasDefault ?? false;
    this.confidence = data.confidence ?? null;
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  /**
   * Validate the decision data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.phase) errors.push('phase is required');
    if (!this.questionId) errors.push('questionId is required');
    if (!this.question) errors.push('question is required');
    if (this.answer === undefined || this.answer === null) {
      errors.push('answer is required');
    }

    // Validate confidence range
    if (this.confidence !== null) {
      if (typeof this.confidence !== 'number' || this.confidence < 0 || this.confidence > 1) {
        errors.push('confidence must be a number between 0 and 1');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check if this decision was made using a smart default
   * @returns {boolean}
   */
  usedSmartDefault() {
    return this.wasDefault && this.confidence !== null;
  }

  /**
   * Get a human-readable summary
   * @returns {string}
   */
  getSummary() {
    const defaultNote = this.wasDefault ? ' (accepted default)' : '';
    return `${this.question} → ${this.answer}${defaultNote}`;
  }

  /**
   * Serialize to JSON
   * @returns {Object}
   */
  toJSON() {
    const json = {
      id: this.id,
      phase: this.phase,
      questionId: this.questionId,
      question: this.question,
      answer: this.answer,
      wasDefault: this.wasDefault,
      timestamp: this.timestamp
    };

    // Only include confidence if present
    if (this.confidence !== null) {
      json.confidence = this.confidence;
    }

    return json;
  }

  /**
   * Create Decision from JSON
   * @param {Object} json
   * @returns {Decision}
   */
  static fromJSON(json) {
    return new Decision(json);
  }
}
