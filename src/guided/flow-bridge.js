/**
 * FlowBridge
 * Bridges the new GuidedOnboarding system with the existing FlowController.
 * Implements T017: Integration with existing onboarding flow.
 */

import { FlowController } from '../onboarding/flow-controller.js';
import { GuidedOnboarding } from './flows/onboarding-flow.js';
import { GuidedSpecify } from './flows/specify-flow.js';
import { SessionManager } from './session-manager.js';
import { SmartDefaults } from './smart-defaults.js';
import { QuestionReducer } from './question-reducer.js';
import { QuestionPresenter } from './question-presenter.js';
import { StreamingOutput } from './streaming-output.js';

/**
 * Maps GuidedOnboarding phases to FlowController states
 */
const PHASE_TO_STATE = {
  onboarding: 'welcome',
  constitution: 'constitution',
  specification: 'specification',
  planning: 'plan',
  clarification: 'clarify',
  implementation: 'implementation',
  testing: 'testing',
  complete: 'complete'
};

export class FlowBridge {
  /**
   * @param {Object} options
   * @param {FlowController} [options.flowController] - Existing flow controller
   * @param {boolean} [options.useGuidedFlow=true] - Whether to use new guided flow
   * @param {boolean} [options.showAdvanced=false] - Show advanced options by default
   */
  constructor(options = {}) {
    this.flowController = options.flowController || new FlowController();
    this.useGuidedFlow = options.useGuidedFlow ?? true;
    this.showAdvanced = options.showAdvanced ?? false;

    // Guided components
    this.sessionManager = new SessionManager();
    this.smartDefaults = new SmartDefaults();
    this.questionReducer = new QuestionReducer();
    this.streamingOutput = new StreamingOutput();

    this._guidedOnboarding = null;
    this._guidedSpecify = null;
  }

  /**
   * Run the onboarding flow
   * Uses either new guided flow or falls back to existing flow
   * @param {string} projectPath - Path to project directory
   * @param {Object} [initialData] - Pre-populated data (e.g., from CLI args)
   * @returns {Promise<Object>} Onboarding result
   */
  async runOnboarding(projectPath, initialData = {}) {
    if (!this.useGuidedFlow) {
      // Fall back to existing flow controller behavior
      this.flowController.transition('welcome', 'Welcome to Spec Kit!');
      return { success: true, usedGuidedFlow: false };
    }

    // Use new guided onboarding
    this._guidedOnboarding = new GuidedOnboarding({
      sessionManager: this.sessionManager,
      smartDefaults: this.smartDefaults,
      questionReducer: this.questionReducer,
      streamingOutput: this.streamingOutput,
      showAdvanced: this.showAdvanced
    });

    // Sync with flow controller for compatibility
    this._syncFlowController('onboarding');

    const result = await this._guidedOnboarding.run(projectPath, initialData);

    if (result.success) {
      this._syncFlowController('complete');
    }

    return {
      ...result,
      usedGuidedFlow: true
    };
  }

  /**
   * Get the current session
   * @returns {Session|null}
   */
  getSession() {
    return this.sessionManager.session;
  }

  /**
   * Get the flow controller (for compatibility with existing code)
   * @returns {FlowController}
   */
  getFlowController() {
    return this.flowController;
  }

  /**
   * Run the specify flow
   * Uses either new guided flow or falls back to existing flow
   * @param {string} projectPath - Path to project directory
   * @param {string} featureDescription - Feature description
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>} Specify result
   */
  async runSpecify(projectPath, featureDescription, options = {}) {
    if (!this.useGuidedFlow) {
      // Fall back to existing flow controller behavior
      this.flowController.transition('specification', 'Creating specification...');
      return { success: true, usedGuidedFlow: false };
    }

    // Use new guided specify
    this._guidedSpecify = new GuidedSpecify({
      sessionManager: this.sessionManager,
      smartDefaults: this.smartDefaults,
      questionReducer: this.questionReducer,
      questionPresenter: new QuestionPresenter(),
      streamingOutput: this.streamingOutput,
      maxClarifications: options.maxClarifications ?? 3
    });

    // Sync with flow controller for compatibility
    this._syncFlowController('specification');

    const result = await this._guidedSpecify.run(projectPath, featureDescription, options);

    if (result.success) {
      this._syncFlowController('plan');
    }

    return {
      ...result,
      usedGuidedFlow: true
    };
  }

  /**
   * Check if we're using guided flow
   * @returns {boolean}
   */
  isGuidedFlowActive() {
    return this.useGuidedFlow && (this._guidedOnboarding !== null || this._guidedSpecify !== null);
  }

  /**
   * Sync the flow controller state with guided flow phase
   * @private
   */
  _syncFlowController(phase) {
    const state = PHASE_TO_STATE[phase] || phase;
    this.flowController.transition(state);
  }

  /**
   * Create a FlowBridge with guided flow enabled
   * @param {Object} [options]
   * @returns {FlowBridge}
   */
  static guided(options = {}) {
    return new FlowBridge({
      ...options,
      useGuidedFlow: true
    });
  }

  /**
   * Create a FlowBridge with legacy flow
   * @param {Object} [options]
   * @returns {FlowBridge}
   */
  static legacy(options = {}) {
    return new FlowBridge({
      ...options,
      useGuidedFlow: false
    });
  }
}
