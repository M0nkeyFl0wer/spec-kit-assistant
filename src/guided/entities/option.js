/**
 * Option Entity
 * A suggested answer option for a clarification question.
 * Implements FR-002 requirement for options with implications.
 * @see data-model.md for specification
 */

export class Option {
  /**
   * @param {Object} data - Option data
   * @param {*} data.value - The option's value (what gets stored)
   * @param {string} data.label - Display text for the option
   * @param {string} [data.implications] - What choosing this means for the project
   * @param {boolean} [data.isRecommended=false] - Whether this is the recommended choice
   */
  constructor(data = {}) {
    this.value = data.value;
    this.label = data.label || String(data.value);
    this.implications = data.implications || '';
    this.isRecommended = data.isRecommended ?? false;
  }

  /**
   * Validate the option
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (this.value === undefined) {
      errors.push('value is required');
    }
    if (!this.label) {
      errors.push('label is required');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get display text for prompts (label + implications if present)
   * @returns {string}
   */
  getDisplayText() {
    let text = this.label;

    if (this.isRecommended) {
      text += ' (recommended)';
    }

    if (this.implications) {
      text += ` — ${this.implications}`;
    }

    return text;
  }

  /**
   * Get short display text (just the label)
   * @returns {string}
   */
  getShortText() {
    return this.isRecommended ? `${this.label} ✓` : this.label;
  }

  /**
   * Mark this option as recommended
   * @returns {Option} this (for chaining)
   */
  markRecommended() {
    this.isRecommended = true;
    return this;
  }

  /**
   * Serialize to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      value: this.value,
      label: this.label,
      implications: this.implications,
      isRecommended: this.isRecommended
    };
  }

  /**
   * Create Option from JSON
   * @param {Object} json
   * @returns {Option}
   */
  static fromJSON(json) {
    return new Option(json);
  }

  /**
   * Create a simple option from a value
   * @param {*} value
   * @returns {Option}
   */
  static simple(value) {
    return new Option({ value, label: String(value) });
  }

  /**
   * Create options from an array of values
   * @param {*[]} values
   * @returns {Option[]}
   */
  static fromValues(values) {
    return values.map(v => Option.simple(v));
  }

  /**
   * Create options from an enum-like object
   * @param {Object} enumObj - Object with key-value pairs
   * @param {Object} [implications] - Optional implications for each key
   * @returns {Option[]}
   */
  static fromEnum(enumObj, implications = {}) {
    return Object.entries(enumObj).map(([key, value]) => {
      return new Option({
        value,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        implications: implications[key] || implications[value]
      });
    });
  }
}
