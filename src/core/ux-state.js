/**
 * T021: UXState model
 * Tracks current user context and interface state
 * Based on data-model.md specification
 */

export class UXState {
  constructor() {
    this.currentWorkflow = null;
    this.terminalCapabilities = {
      supportsColor: false,
      supportsAnimations: false,
      width: 80,
      height: 24,
      detected: false
    };
    this.userPreferences = {
      animationsEnabled: true,
      verboseOutput: false,
      fallbackMode: false,
      characterEnabled: true
    };
    this.sessionContext = {
      commandHistory: [],
      currentOperation: null,
      operationStartTime: null,
      lastResult: null,
      errors: []
    };
    this.focusState = {
      currentTask: null,
      depth: 0,
      sideQuests: [],
      mainMission: null
    };
  }

  /**
   * Set current workflow/operation
   * @param {string} workflow - Workflow identifier
   * @param {Object} metadata - Additional workflow data
   */
  setCurrentWorkflow(workflow, metadata = {}) {
    this.currentWorkflow = {
      name: workflow,
      startTime: new Date(),
      metadata,
      steps: [],
      progress: 0
    };

    this.sessionContext.currentOperation = workflow;
    this.sessionContext.operationStartTime = new Date();

    // Update focus state
    if (!this.focusState.mainMission) {
      this.focusState.mainMission = workflow;
    }
    this.focusState.currentTask = workflow;
  }

  /**
   * Update workflow progress
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} step - Current step description
   */
  updateProgress(progress, step = null) {
    if (this.currentWorkflow) {
      this.currentWorkflow.progress = Math.min(100, Math.max(0, progress));

      if (step) {
        this.currentWorkflow.steps.push({
          step,
          timestamp: new Date(),
          progress
        });
      }
    }
  }

  /**
   * Complete current workflow
   * @param {*} result - Workflow result
   */
  completeWorkflow(result = null) {
    if (this.currentWorkflow) {
      this.currentWorkflow.endTime = new Date();
      this.currentWorkflow.duration =
        this.currentWorkflow.endTime - this.currentWorkflow.startTime;
      this.currentWorkflow.result = result;
      this.currentWorkflow.completed = true;

      // Store in session context
      this.sessionContext.lastResult = result;
      this.sessionContext.currentOperation = null;

      // Return to main mission if this was a side quest
      if (this.focusState.sideQuests.length > 0) {
        this.focusState.currentTask = this.focusState.mainMission;
      }
    }
  }

  /**
   * Detect terminal capabilities
   * @param {Object} terminalInfo - Terminal information
   */
  detectTerminalCapabilities(terminalInfo = {}) {
    // Auto-detect from environment if available
    if (process?.stdout) {
      this.terminalCapabilities.supportsColor = process.stdout.hasColors?.() || false;
      this.terminalCapabilities.width = process.stdout.columns || 80;
      this.terminalCapabilities.height = process.stdout.rows || 24;
    }

    // Override with provided info
    Object.assign(this.terminalCapabilities, terminalInfo);

    // Determine animation support based on capabilities
    this.terminalCapabilities.supportsAnimations =
      this.terminalCapabilities.supportsColor &&
      this.terminalCapabilities.width >= 60;

    this.terminalCapabilities.detected = true;

    // Auto-enable fallback mode if needed
    if (!this.terminalCapabilities.supportsAnimations) {
      this.userPreferences.fallbackMode = true;
      this.userPreferences.animationsEnabled = false;
    }
  }

  /**
   * Add command to history
   * @param {string} command - Command executed
   * @param {*} result - Command result
   * @param {Error} error - Error if command failed
   */
  addCommandToHistory(command, result = null, error = null) {
    const entry = {
      command,
      timestamp: new Date(),
      result,
      error: error?.message || null,
      success: !error
    };

    this.sessionContext.commandHistory.push(entry);

    // Keep history manageable
    if (this.sessionContext.commandHistory.length > 100) {
      this.sessionContext.commandHistory =
        this.sessionContext.commandHistory.slice(-50);
    }

    // Track errors
    if (error) {
      this.sessionContext.errors.push({
        command,
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  /**
   * Update user preferences
   * @param {Object} preferences - New preference values
   */
  updatePreferences(preferences) {
    Object.assign(this.userPreferences, preferences);

    // Validate preferences against capabilities
    if (!this.terminalCapabilities.supportsAnimations) {
      this.userPreferences.animationsEnabled = false;
      this.userPreferences.fallbackMode = true;
    }
  }

  /**
   * Start a side quest (maintaining focus management)
   * @param {string} sideQuest - Side quest description
   * @param {Object} context - Side quest context
   */
  startSideQuest(sideQuest, context = {}) {
    this.focusState.sideQuests.push({
      description: sideQuest,
      startTime: new Date(),
      context,
      completed: false
    });

    this.focusState.currentTask = sideQuest;
    this.focusState.depth++;
  }

  /**
   * Complete current side quest
   * @param {*} result - Side quest result
   */
  completeSideQuest(result = null) {
    if (this.focusState.sideQuests.length > 0) {
      const currentSideQuest = this.focusState.sideQuests[this.focusState.sideQuests.length - 1];
      currentSideQuest.completed = true;
      currentSideQuest.endTime = new Date();
      currentSideQuest.result = result;

      this.focusState.depth--;

      // Return to previous task or main mission
      if (this.focusState.sideQuests.length > 1) {
        const previousSideQuest = this.focusState.sideQuests[this.focusState.sideQuests.length - 2];
        this.focusState.currentTask = previousSideQuest.description;
      } else {
        this.focusState.currentTask = this.focusState.mainMission;
      }
    }
  }

  /**
   * Get current UX configuration for rendering
   * @returns {Object} Current UX configuration
   */
  getCurrentUXConfig() {
    return {
      useAnimations: this.userPreferences.animationsEnabled &&
                    this.terminalCapabilities.supportsAnimations &&
                    !this.userPreferences.fallbackMode,
      useColors: this.terminalCapabilities.supportsColor &&
                !this.userPreferences.fallbackMode,
      showCharacter: this.userPreferences.characterEnabled,
      verbose: this.userPreferences.verboseOutput,
      terminalWidth: this.terminalCapabilities.width,
      terminalHeight: this.terminalCapabilities.height
    };
  }

  /**
   * Get session statistics
   * @returns {Object} Session statistics
   */
  getSessionStats() {
    const now = new Date();
    const sessionStart = this.sessionContext.commandHistory[0]?.timestamp || now;
    const sessionDuration = now - sessionStart;

    return {
      sessionDuration: Math.round(sessionDuration / 1000), // seconds
      commandsExecuted: this.sessionContext.commandHistory.length,
      errorsEncountered: this.sessionContext.errors.length,
      currentFocus: this.focusState.currentTask,
      sideQuestsActive: this.focusState.sideQuests.filter(sq => !sq.completed).length,
      sideQuestsCompleted: this.focusState.sideQuests.filter(sq => sq.completed).length,
      workflowActive: !!this.currentWorkflow && !this.currentWorkflow.completed
    };
  }

  /**
   * Check if user might be losing focus (too many side quests)
   * @returns {boolean} true if focus management needed
   */
  needsFocusManagement() {
    return this.focusState.depth > 3 ||
           this.focusState.sideQuests.filter(sq => !sq.completed).length > 2;
  }

  /**
   * Get focus management suggestion
   * @returns {string} Suggestion for maintaining focus
   */
  getFocusManagementSuggestion() {
    if (this.needsFocusManagement()) {
      return `🐕 Hey! We've got ${this.focusState.depth} tasks going. Want to focus on "${this.focusState.mainMission}" first?`;
    }
    return null;
  }

  /**
   * Reset session (while preserving preferences)
   */
  resetSession() {
    this.currentWorkflow = null;
    this.sessionContext = {
      commandHistory: [],
      currentOperation: null,
      operationStartTime: null,
      lastResult: null,
      errors: []
    };
    this.focusState = {
      currentTask: null,
      depth: 0,
      sideQuests: [],
      mainMission: null
    };
  }

  /**
   * Export state for persistence
   * @returns {Object} Serializable state
   */
  exportState() {
    return {
      terminalCapabilities: this.terminalCapabilities,
      userPreferences: this.userPreferences,
      sessionStats: this.getSessionStats(),
      currentFocus: this.focusState.currentTask
    };
  }

  /**
   * Create default UX state with terminal detection
   * @returns {UXState} Configured UX state
   */
  static createDefault() {
    const uxState = new UXState();
    uxState.detectTerminalCapabilities();
    return uxState;
  }
}

export default UXState;