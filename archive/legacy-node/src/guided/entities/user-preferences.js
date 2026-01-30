/**
 * UserPreferences Entity
 * User's UI/UX preferences.
 * @see data-model.md for specification
 */

export class UserPreferences {
  /**
   * @param {Object} data - Preferences data
   * @param {boolean} [data.showAdvancedOptions=false] - Expand all options by default
   * @param {boolean} [data.celebrationsEnabled=true] - Show micro-celebrations
   * @param {boolean} [data.streamingEnabled=true] - Stream AI output
   * @param {boolean} [data.soundEnabled=false] - Play sounds on events
   */
  constructor(data = {}) {
    this.showAdvancedOptions = data.showAdvancedOptions ?? false;
    this.celebrationsEnabled = data.celebrationsEnabled ?? true;
    this.streamingEnabled = data.streamingEnabled ?? true;
    this.soundEnabled = data.soundEnabled ?? false;
  }

  /**
   * Toggle advanced options visibility
   */
  toggleAdvancedOptions() {
    this.showAdvancedOptions = !this.showAdvancedOptions;
  }

  /**
   * Toggle celebrations
   */
  toggleCelebrations() {
    this.celebrationsEnabled = !this.celebrationsEnabled;
  }

  /**
   * Toggle streaming output
   */
  toggleStreaming() {
    this.streamingEnabled = !this.streamingEnabled;
  }

  /**
   * Toggle sound effects
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
  }

  /**
   * Update multiple preferences at once
   * @param {Object} updates - Key-value pairs to update
   */
  update(updates = {}) {
    if (updates.showAdvancedOptions !== undefined) {
      this.showAdvancedOptions = Boolean(updates.showAdvancedOptions);
    }
    if (updates.celebrationsEnabled !== undefined) {
      this.celebrationsEnabled = Boolean(updates.celebrationsEnabled);
    }
    if (updates.streamingEnabled !== undefined) {
      this.streamingEnabled = Boolean(updates.streamingEnabled);
    }
    if (updates.soundEnabled !== undefined) {
      this.soundEnabled = Boolean(updates.soundEnabled);
    }
  }

  /**
   * Reset all preferences to defaults
   */
  reset() {
    this.showAdvancedOptions = false;
    this.celebrationsEnabled = true;
    this.streamingEnabled = true;
    this.soundEnabled = false;
  }

  /**
   * Serialize to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      showAdvancedOptions: this.showAdvancedOptions,
      celebrationsEnabled: this.celebrationsEnabled,
      streamingEnabled: this.streamingEnabled,
      soundEnabled: this.soundEnabled
    };
  }

  /**
   * Create UserPreferences from JSON
   * @param {Object} json
   * @returns {UserPreferences}
   */
  static fromJSON(json) {
    return new UserPreferences(json);
  }

  /**
   * Get default preferences
   * @returns {UserPreferences}
   */
  static defaults() {
    return new UserPreferences();
  }
}
