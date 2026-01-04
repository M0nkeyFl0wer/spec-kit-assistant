/**
 * ProgressTracker
 * Combines progress visibility with micro-celebrations.
 * Implements FR-005 (progress visibility) and FR-008 (micro-celebrations)
 */

import { ProgressBar } from './ui/progress-bar.js';
import { MicroCelebrations } from './micro-celebrations.js';

export class ProgressTracker {
  /**
   * @param {Object} options
   * @param {string[]} [options.phases] - Phase names
   * @param {boolean} [options.celebrationsEnabled=true] - Enable celebrations
   * @param {boolean} [options.showProgress=true] - Show progress bar
   */
  constructor(options = {}) {
    this.progressBar = new ProgressBar({
      phases: options.phases || [],
      currentPhase: 0
    });

    this.celebrations = new MicroCelebrations({
      enabled: options.celebrationsEnabled ?? true
    });

    this.showProgress = options.showProgress ?? true;
    this._phaseStartTime = null;
  }

  /**
   * Start tracking a phase
   * @param {number} phaseIndex - Phase index to start
   */
  startPhase(phaseIndex) {
    this.progressBar.setPhase(phaseIndex);
    this._phaseStartTime = Date.now();

    if (this.showProgress) {
      console.log('\n' + this.progressBar.renderSteps() + '\n');
    }
  }

  /**
   * Complete the current phase
   * @param {Object} [options]
   * @param {boolean} [options.celebrate=true] - Show celebration
   * @returns {Promise<void>}
   */
  async completePhase(options = {}) {
    const celebrate = options.celebrate ?? true;
    const currentPhase = this.progressBar.currentPhase;
    const phaseName = this.progressBar.phases[currentPhase];

    this.progressBar.completePhase(currentPhase);

    if (this.showProgress) {
      console.log('\n' + this.progressBar.renderCompact());
    }

    if (celebrate) {
      await this.celebrations.phaseComplete(phaseName);
    }

    this._phaseStartTime = null;
  }

  /**
   * Move to next phase
   * @param {Object} [options]
   * @returns {Promise<void>}
   */
  async nextPhase(options = {}) {
    await this.completePhase(options);

    const nextIndex = this.progressBar.currentPhase;
    if (nextIndex < this.progressBar.phases.length) {
      this.startPhase(nextIndex);
    }
  }

  /**
   * Get elapsed time for current phase
   * @returns {number} Milliseconds
   */
  getPhaseElapsed() {
    if (!this._phaseStartTime) return 0;
    return Date.now() - this._phaseStartTime;
  }

  /**
   * Display current progress
   */
  displayProgress() {
    if (this.showProgress) {
      console.log(this.progressBar.render());
    }
  }

  /**
   * Display compact progress
   */
  displayCompact() {
    if (this.showProgress) {
      console.log(this.progressBar.renderCompact());
    }
  }

  /**
   * Celebrate onboarding completion
   * @returns {Promise<void>}
   */
  async celebrateOnboardingComplete() {
    await this.celebrations.onboardingComplete();
  }

  /**
   * Celebrate specification completion
   * @returns {Promise<void>}
   */
  async celebrateSpecificationComplete() {
    await this.celebrations.specificationComplete();
  }

  /**
   * Celebrate implementation completion
   * @returns {Promise<void>}
   */
  async celebrateImplementationComplete() {
    await this.celebrations.implementationComplete();
  }

  /**
   * Celebrate tests passing
   * @returns {Promise<void>}
   */
  async celebrateTestsPassing() {
    await this.celebrations.testsPassing();
  }

  /**
   * Show encouragement
   * @returns {Promise<void>}
   */
  async encourage() {
    await this.celebrations.encourage();
  }

  /**
   * Get overall progress percentage
   * @returns {number}
   */
  getPercentage() {
    return this.progressBar.getPercentage();
  }

  /**
   * Check if all phases are complete
   * @returns {boolean}
   */
  isComplete() {
    return this.getPercentage() === 100;
  }

  /**
   * Create a tracker for the full spec-kit workflow
   * @param {Object} [options]
   * @returns {ProgressTracker}
   */
  static specKitWorkflow(options = {}) {
    return new ProgressTracker({
      phases: ['Setup', 'Spec', 'Plan', 'Clarify', 'Implement', 'Test'],
      ...options
    });
  }

  /**
   * Create a tracker for onboarding only
   * @param {Object} [options]
   * @returns {ProgressTracker}
   */
  static onboarding(options = {}) {
    return new ProgressTracker({
      phases: ['Welcome', 'Project Info', 'Configuration', 'Summary'],
      ...options
    });
  }

  /**
   * Create a tracker for specify workflow
   * @param {Object} [options]
   * @returns {ProgressTracker}
   */
  static specify(options = {}) {
    return new ProgressTracker({
      phases: ['Description', 'Clarify', 'Generate', 'Review'],
      ...options
    });
  }
}
