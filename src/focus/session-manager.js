// Focus Management System - Session Manager
// Solves the "Claude gets lost" problem with persistent session tracking

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { secureWriteFile, secureReadFile, validatePath } from '../utils/secure-path.js';

/**
 * SessionManager maintains focus and context across Claude conversations
 * Prevents implementation drift and ensures spec completion
 */
export class SessionManager {
  constructor() {
    this.activeSession = null;
    this.focusState = 'ready'; // ready, implementing, drifted, recovering
    this.implementationProgress = [];
    this.sessionFile = '.spec-session.json';
    this.driftThreshold = 3; // Number of off-topic exchanges before intervention
    this.lastImplementationStep = null;
  }

  /**
   * Start a new implementation session with focus tracking
   */
  async startSession(specPath, options = {}) {
    try {
      console.log(chalk.cyan('🐕 Spec: "Starting focused implementation session!"'));

      const session = {
        id: this.generateSessionId(),
        specPath: specPath,
        startTime: new Date().toISOString(),
        status: 'active',
        focusState: 'implementing',
        progress: {
          totalSteps: options.totalSteps || 10,
          completedSteps: [],
          currentStep: options.startStep || 1,
          lastActivity: new Date().toISOString()
        },
        context: {
          lastImplementationTask: options.initialTask || 'Starting implementation',
          conversationHistory: [],
          checkpoints: []
        },
        metadata: {
          specTitle: options.specTitle || 'Implementation Session',
          priority: options.priority || 'normal',
          estimatedDuration: options.estimatedDuration || '1 hour'
        }
      };

      this.activeSession = session;
      await this.saveSession();

      console.log(chalk.green(`🐕 Spec: "Session ${session.id} started! Staying focused on: ${session.metadata.specTitle}"`));
      return session;
    } catch (error) {
      console.error(chalk.red(`🐕 Spec: "Session start failed: ${error.message}"`));
      throw error;
    }
  }

  /**
   * Track implementation progress and maintain focus
   */
  async trackProgress(step, description = '') {
    if (!this.activeSession) {
      console.warn(chalk.yellow('🐕 Spec: "No active session - starting default session"'));
      await this.startSession('default-spec.md');
    }

    const progressEntry = {
      step: step,
      description: description,
      timestamp: new Date().toISOString(),
      type: 'implementation'
    };

    this.activeSession.progress.completedSteps.push(progressEntry);
    this.activeSession.progress.currentStep = step + 1;
    this.activeSession.progress.lastActivity = new Date().toISOString();
    this.lastImplementationStep = progressEntry;
    this.focusState = 'implementing';

    await this.saveSession();

    console.log(chalk.green(`🐕 Spec: "Progress tracked! Completed step ${step}: ${description}"`));
    this.celebrateProgress(step);

    return progressEntry;
  }

  /**
   * Detect when conversation has drifted from implementation
   */
  async detectDrift(conversationEntry) {
    if (!this.activeSession) return false;

    // Add to conversation history
    this.activeSession.context.conversationHistory.push({
      ...conversationEntry,
      timestamp: new Date().toISOString()
    });

    // Keep only recent history (last 10 entries)
    if (this.activeSession.context.conversationHistory.length > 10) {
      this.activeSession.context.conversationHistory =
        this.activeSession.context.conversationHistory.slice(-10);
    }

    // Analyze recent conversation for implementation focus
    const recentEntries = this.activeSession.context.conversationHistory.slice(-this.driftThreshold);
    const implementationKeywords = [
      'implement', 'code', 'function', 'class', 'test', 'build', 'create',
      'spec', 'requirement', 'feature', 'step', 'progress', 'complete'
    ];

    let implementationCount = 0;
    recentEntries.forEach(entry => {
      const hasImplementationFocus = implementationKeywords.some(keyword =>
        entry.content.toLowerCase().includes(keyword)
      );
      if (hasImplementationFocus) implementationCount++;
    });

    const driftDetected = implementationCount < (recentEntries.length * 0.3); // Less than 30% implementation focus

    if (driftDetected && this.focusState !== 'drifted') {
      this.focusState = 'drifted';
      await this.saveSession();
      console.log(chalk.yellow('🐕 Spec: "Focus drift detected! Time to get back on track!"'));
      return true;
    }

    return false;
  }

  /**
   * Recover focus and restore implementation context
   */
  async recoverFocus(forceRecovery = false) {
    if (!this.activeSession) {
      console.warn(chalk.yellow('🐕 Spec: "No active session to recover"'));
      return null;
    }

    console.log(chalk.cyan('🐕 Spec: "Recovering focus and restoring implementation context..."'));

    const recoveryContext = {
      sessionId: this.activeSession.id,
      specTitle: this.activeSession.metadata.specTitle,
      currentStep: this.activeSession.progress.currentStep,
      lastImplementationTask: this.activeSession.context.lastImplementationTask,
      completedSteps: this.activeSession.progress.completedSteps.length,
      totalSteps: this.activeSession.progress.totalSteps,
      recoveryTime: new Date().toISOString()
    };

    // Create recovery checkpoint
    await this.createCheckpoint('focus_recovery');

    // Reset focus state
    this.focusState = 'implementing';
    this.activeSession.progress.lastActivity = new Date().toISOString();

    await this.saveSession();

    // Generate focus recovery message
    const recoveryMessage = this.generateRecoveryMessage(recoveryContext);
    console.log(chalk.green('🐕 Spec: "Focus recovered! Back to implementation!"'));

    return {
      context: recoveryContext,
      message: recoveryMessage,
      nextAction: this.suggestNextAction()
    };
  }

  /**
   * Create implementation checkpoint for easy resumption
   */
  async createCheckpoint(reason = 'manual') {
    if (!this.activeSession) return null;

    const checkpoint = {
      id: this.generateSessionId(),
      reason: reason,
      timestamp: new Date().toISOString(),
      progress: { ...this.activeSession.progress },
      context: {
        lastImplementationTask: this.activeSession.context.lastImplementationTask,
        conversationHistory: [...this.activeSession.context.conversationHistory]
        // Don't include checkpoints to avoid circular reference
      },
      focusState: this.focusState
    };

    this.activeSession.context.checkpoints.push(checkpoint);
    await this.saveSession();

    console.log(chalk.blue(`🐕 Spec: "Checkpoint created: ${reason}"`));
    return checkpoint;
  }

  /**
   * Get current session status for user visibility
   */
  getStatus() {
    if (!this.activeSession) {
      return {
        hasActiveSession: false,
        message: '🐕 Spec: "No active implementation session"'
      };
    }

    const progressPercent = Math.round(
      (this.activeSession.progress.completedSteps.length / this.activeSession.progress.totalSteps) * 100
    );

    return {
      hasActiveSession: true,
      sessionId: this.activeSession.id,
      specTitle: this.activeSession.metadata.specTitle,
      progress: {
        percent: progressPercent,
        current: this.activeSession.progress.currentStep,
        total: this.activeSession.progress.totalSteps,
        completed: this.activeSession.progress.completedSteps.length
      },
      focusState: this.focusState,
      lastActivity: this.activeSession.progress.lastActivity,
      nextAction: this.suggestNextAction(),
      message: `🐕 Spec: "${this.activeSession.metadata.specTitle}" - ${progressPercent}% complete (Step ${this.activeSession.progress.currentStep}/${this.activeSession.progress.totalSteps})`
    };
  }

  /**
   * Suggest next implementation action based on current state
   */
  suggestNextAction() {
    if (!this.activeSession) {
      return 'Start a new implementation session with `node src/index.js focus --start`';
    }

    if (this.focusState === 'drifted') {
      return 'Use `node src/index.js focus --refocus` to restore implementation context';
    }

    const currentStep = this.activeSession.progress.currentStep;
    const totalSteps = this.activeSession.progress.totalSteps;

    if (currentStep > totalSteps) {
      return 'Implementation complete! Use `node src/index.js focus --summary` to review';
    }

    return `Continue with implementation step ${currentStep}: ${this.activeSession.context.lastImplementationTask}`;
  }

  /**
   * Generate context recovery message for Claude
   */
  generateRecoveryMessage(context) {
    return `
🐕 **FOCUS RECOVERY - IMPLEMENTATION CONTEXT RESTORED**

**Current Implementation Session**: ${context.specTitle}
**Progress**: Step ${context.currentStep}/${context.totalSteps} (${context.completedSteps} steps completed)
**Last Task**: ${context.lastImplementationTask}

**PRIORITY**: Continue implementation from where we left off. Stay focused on completing this specification.

**Next Action**: ${this.suggestNextAction()}

Let's get back to building! 🎯
`;
  }

  /**
   * Celebrate implementation progress with encouraging messages
   */
  celebrateProgress(step) {
    const celebrations = [
      "Pawsome progress! 🎉",
      "You're crushing it! 🚀",
      "Keep up the great work! ⭐",
      "Implementation excellence! 🏆",
      "Spec-tacular progress! 🌟"
    ];

    const celebration = celebrations[step % celebrations.length];
    console.log(chalk.magenta(`🐕 Spec: "${celebration}"`));
  }

  /**
   * Save session state to persistent storage
   */
  async saveSession() {
    if (!this.activeSession) return;

    try {
      const sessionData = JSON.stringify(this.activeSession, null, 2);
      await secureWriteFile(this.sessionFile, sessionData, 'workspace');
    } catch (error) {
      console.error(chalk.red(`🐕 Spec: "Failed to save session: ${error.message}"`));
    }
  }

  /**
   * Load existing session from storage
   */
  async loadSession() {
    try {
      const sessionData = await secureReadFile(this.sessionFile, 'workspace');
      this.activeSession = JSON.parse(sessionData);
      this.focusState = this.activeSession.focusState || 'implementing';
      console.log(chalk.green(`🐕 Spec: "Session restored: ${this.activeSession.metadata.specTitle}"`));
      return this.activeSession;
    } catch (error) {
      // No existing session or corrupted session
      return null;
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * End current session
   */
  async endSession(reason = 'completed') {
    if (!this.activeSession) return;

    await this.createCheckpoint(`session_end_${reason}`);

    const completionRate = Math.round(
      (this.activeSession.progress.completedSteps.length / this.activeSession.progress.totalSteps) * 100
    );

    console.log(chalk.green(`🐕 Spec: "Session completed! ${completionRate}% of implementation finished."`));

    this.activeSession = null;
    this.focusState = 'ready';

    try {
      await fs.unlink(validatePath(this.sessionFile, 'workspace'));
    } catch (error) {
      // File might not exist, that's okay
    }
  }
}

export default SessionManager;