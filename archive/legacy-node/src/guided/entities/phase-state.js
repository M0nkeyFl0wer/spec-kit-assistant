/**
 * PhaseState Entity
 * Tracks the status of a single workflow phase.
 * @see data-model.md for specification
 */

/**
 * Workflow phase types
 */
export const PhaseType = {
  ONBOARDING: 'onboarding',
  SPECIFY: 'specify',
  CLARIFY: 'clarify',
  PLAN: 'plan',
  TASKS: 'tasks',
  IMPLEMENT: 'implement',
  TEST: 'test'
};

/**
 * Phase status values
 */
export const PhaseStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
  SKIPPED: 'skipped'
};

export class PhaseState {
  /**
   * @param {Object} data - Phase state data
   * @param {string} [data.status='pending'] - Phase status
   * @param {string|null} [data.startedAt] - When phase started
   * @param {string|null} [data.completedAt] - When phase completed
   * @param {string[]} [data.artifacts] - Generated artifact paths
   * @param {string[]} [data.errors] - Any errors encountered
   */
  constructor(data = {}) {
    this.status = data.status || PhaseStatus.PENDING;
    this.startedAt = data.startedAt || null;
    this.completedAt = data.completedAt || null;
    this.artifacts = data.artifacts || [];
    this.errors = data.errors || [];
  }

  /**
   * Start the phase
   */
  start() {
    if (this.status === PhaseStatus.PENDING) {
      this.status = PhaseStatus.IN_PROGRESS;
      this.startedAt = new Date().toISOString();
    }
  }

  /**
   * Complete the phase
   * @param {string[]} [artifacts] - Paths to generated artifacts
   */
  complete(artifacts = []) {
    if (this.status === PhaseStatus.IN_PROGRESS) {
      this.status = PhaseStatus.COMPLETE;
      this.completedAt = new Date().toISOString();
      if (artifacts.length > 0) {
        this.artifacts.push(...artifacts);
      }
    }
  }

  /**
   * Skip the phase
   */
  skip() {
    if (this.status === PhaseStatus.PENDING) {
      this.status = PhaseStatus.SKIPPED;
    }
  }

  /**
   * Reset phase to pending (for going back)
   */
  reset() {
    if (this.status === PhaseStatus.IN_PROGRESS) {
      this.status = PhaseStatus.PENDING;
      this.startedAt = null;
    }
  }

  /**
   * Record an error
   * @param {string} error - Error message
   */
  addError(error) {
    this.errors.push(error);
  }

  /**
   * Add an artifact path
   * @param {string} artifactPath - Path to artifact
   */
  addArtifact(artifactPath) {
    this.artifacts.push(artifactPath);
  }

  /**
   * Check if phase is actionable
   * @returns {boolean}
   */
  isActionable() {
    return this.status === PhaseStatus.PENDING || this.status === PhaseStatus.IN_PROGRESS;
  }

  /**
   * Check if phase is complete
   * @returns {boolean}
   */
  isComplete() {
    return this.status === PhaseStatus.COMPLETE;
  }

  /**
   * Get duration in milliseconds (if started and completed)
   * @returns {number|null}
   */
  getDuration() {
    if (this.startedAt && this.completedAt) {
      return new Date(this.completedAt) - new Date(this.startedAt);
    }
    return null;
  }

  /**
   * Serialize to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      status: this.status,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      artifacts: this.artifacts,
      errors: this.errors
    };
  }

  /**
   * Create PhaseState from JSON
   * @param {Object} json
   * @returns {PhaseState}
   */
  static fromJSON(json) {
    return new PhaseState(json);
  }
}
