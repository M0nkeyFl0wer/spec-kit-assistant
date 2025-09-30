/**
 * T024: Animation engine implementation
 * Provides ASCII animation playback with constitutional 500ms limits
 * Integrates with terminal detection and fallback modes
 */

import { AnimationSequence } from '../core/animation-sequence.js';
import { performance } from 'perf_hooks';

export class AnimationEngine {
  constructor() {
    this.sequences = new Map();
    this.terminalCapabilities = null;
    this.fallbackMode = false;
    this.isPlaying = false;
    this.currentSequence = null;
    this.frameTimer = null;
    this.performanceMetrics = {
      totalAnimations: 0,
      averageDuration: 0,
      maxDuration: 0,
      errors: 0
    };
  }

  /**
   * Detect terminal capabilities for animation support
   * @returns {Object} Terminal capabilities
   */
  async detectTerminalCapabilities() {
    const capabilities = {
      supportsColor: false,
      supportsAnimations: false,
      width: 80,
      height: 24,
      cursorControl: false,
      detected: true
    };

    try {
      // Check if running in a terminal
      if (process.stdout && process.stdout.isTTY) {
        capabilities.supportsColor = process.stdout.hasColors?.() || false;
        capabilities.width = process.stdout.columns || 80;
        capabilities.height = process.stdout.rows || 24;
        capabilities.cursorControl = true;

        // Test cursor control
        if (capabilities.width >= 60 && capabilities.supportsColor) {
          capabilities.supportsAnimations = true;
        }
      }

      // Check environment variables for override
      if (process.env.NO_COLOR || process.env.TERM === 'dumb') {
        capabilities.supportsColor = false;
        capabilities.supportsAnimations = false;
      }

      if (process.env.SPEC_FALLBACK_MODE === 'true') {
        capabilities.supportsAnimations = false;
      }

    } catch (error) {
      // Fallback to safe defaults
      capabilities.supportsAnimations = false;
      capabilities.supportsColor = false;
    }

    this.terminalCapabilities = capabilities;

    if (!capabilities.supportsAnimations) {
      this.enableFallbackMode();
    }

    return capabilities;
  }

  /**
   * Enable fallback mode for limited terminals
   */
  async enableFallbackMode() {
    this.fallbackMode = true;
    console.log('🐕 Animation fallback mode enabled for terminal compatibility');
  }

  /**
   * Register an animation sequence
   * @param {string} name - Sequence name
   * @param {AnimationSequence} sequence - Animation sequence
   */
  registerSequence(name, sequence) {
    if (!(sequence instanceof AnimationSequence)) {
      throw new Error('Must provide AnimationSequence instance');
    }

    const validation = sequence.validate();
    if (!validation.valid) {
      throw new Error(`Invalid animation sequence: ${validation.issues.join(', ')}`);
    }

    this.sequences.set(name, sequence);
  }

  /**
   * Play animation sequence
   * @param {string} sequenceName - Name of sequence to play
   * @param {Object} options - Playback options
   * @returns {Promise} Resolves when animation completes
   */
  async playSequence(sequenceName, options = {}) {
    const startTime = performance.now();

    try {
      // Get or create sequence
      let sequence = this.sequences.get(sequenceName);
      if (!sequence) {
        sequence = this.createDefaultSequence(sequenceName);
      }

      // Handle fallback mode
      if (this.fallbackMode || options.fallbackMode) {
        return this.playFallbackSequence(sequence);
      }

      // Ensure terminal capabilities are detected
      if (!this.terminalCapabilities) {
        await this.detectTerminalCapabilities();
      }

      // Play the animation
      this.currentSequence = sequence;
      this.isPlaying = true;
      sequence.start();

      await this.renderSequence(sequence, options);

      // Record performance metrics
      const duration = performance.now() - startTime;
      this.updatePerformanceMetrics(duration, true);

      return { success: true, duration };

    } catch (error) {
      const duration = performance.now() - startTime;
      this.updatePerformanceMetrics(duration, false);

      // Fallback on error
      console.log(`🐕 ${sequenceName}: ${this.sequences.get(sequenceName)?.fallbackText || 'Animation failed'}`);
      return { success: false, error: error.message, duration };
    } finally {
      this.isPlaying = false;
      this.currentSequence = null;
    }
  }

  /**
   * Render animation sequence to terminal
   * @param {AnimationSequence} sequence - Sequence to render
   * @param {Object} options - Render options
   */
  async renderSequence(sequence, options = {}) {
    const timeout = Math.min(options.timeout || sequence.timing, 500); // Constitutional limit
    const startTime = performance.now();

    return new Promise((resolve, reject) => {
      const renderFrame = () => {
        if (!this.isPlaying) {
          resolve();
          return;
        }

        const currentFrame = sequence.getCurrentFrame();

        // Check constitutional timing limit
        const elapsed = performance.now() - startTime;
        if (elapsed > timeout) {
          sequence.complete();
          resolve();
          return;
        }

        // Render frame
        if (this.terminalCapabilities.cursorControl) {
          this.clearScreen();
          process.stdout.write(currentFrame.content);
        } else {
          console.log(currentFrame.content);
        }

        // Move to next frame
        if (sequence.nextFrame()) {
          this.frameTimer = setTimeout(renderFrame, currentFrame.duration);
        } else {
          resolve();
        }
      };

      renderFrame();

      // Safety timeout
      setTimeout(() => {
        if (this.frameTimer) {
          clearTimeout(this.frameTimer);
        }
        resolve();
      }, timeout);
    });
  }

  /**
   * Play fallback sequence (text only)
   * @param {AnimationSequence} sequence - Sequence to play
   */
  async playFallbackSequence(sequence) {
    console.log(sequence.fallbackText);
    return new Promise(resolve => {
      setTimeout(resolve, 50); // Instant for fallback
    });
  }

  /**
   * Show progress indicator
   * @param {string} message - Progress message
   * @param {number} duration - Expected duration
   */
  async showProgress(message, duration) {
    if (this.fallbackMode) {
      console.log(`${message} ⚡`);
      return;
    }

    const progressSequence = AnimationSequence.createProgressAnimation(message);
    this.registerSequence('progress', progressSequence);

    return this.playSequence('progress', { timeout: Math.min(duration, 500) });
  }

  /**
   * Display character with message
   * @param {string} state - Character emotional state
   * @param {string} message - Message to display
   */
  async displayCharacter(state, message) {
    if (this.fallbackMode) {
      console.log(`🐕 ${message}`);
      return;
    }

    // Import character persona for visual state
    try {
      const { CharacterPersona } = await import('../core/character-persona.js');
      const persona = new CharacterPersona();
      const visualState = persona.getVisualState(state);

      if (this.terminalCapabilities.cursorControl) {
        this.clearScreen();
        console.log(visualState);
        console.log(`🐕 ${message}`);
      } else {
        console.log(`🐕 ${message}`);
      }
    } catch (error) {
      console.log(`🐕 ${message}`);
    }
  }

  /**
   * Clear screen for animation
   */
  clearScreen() {
    if (this.terminalCapabilities.cursorControl) {
      process.stdout.write('\x1B[2J\x1B[0f');
    }
  }

  /**
   * Create default sequence for unknown names
   * @param {string} name - Sequence name
   * @returns {AnimationSequence} Default sequence
   */
  createDefaultSequence(name) {
    const sequence = new AnimationSequence(name, {
      timing: 300,
      fallbackText: `🐕 ${name} ⚡`
    });

    sequence.addFrame('🐕 Working...');
    return sequence;
  }

  /**
   * Update performance metrics
   * @param {number} duration - Animation duration
   * @param {boolean} success - Whether animation succeeded
   */
  updatePerformanceMetrics(duration, success) {
    this.performanceMetrics.totalAnimations++;

    if (success) {
      this.performanceMetrics.averageDuration =
        (this.performanceMetrics.averageDuration + duration) / 2;
      this.performanceMetrics.maxDuration =
        Math.max(this.performanceMetrics.maxDuration, duration);
    } else {
      this.performanceMetrics.errors++;
    }
  }

  /**
   * Get performance report
   * @returns {Object} Performance metrics
   */
  getPerformanceReport() {
    return {
      ...this.performanceMetrics,
      constitutionalCompliance: {
        averageWithinLimit: this.performanceMetrics.averageDuration <= 500,
        maxWithinLimit: this.performanceMetrics.maxDuration <= 500,
        errorRate: this.performanceMetrics.errors /
                  Math.max(this.performanceMetrics.totalAnimations, 1)
      }
    };
  }

  /**
   * Initialize engine with default sequences
   */
  async initialize() {
    await this.detectTerminalCapabilities();

    // Register default sequences
    this.registerSequence('welcome', AnimationSequence.createWelcomeAnimation());
    this.registerSequence('working', AnimationSequence.createWorkingAnimation());

    // Create additional sequences
    const thinking = new AnimationSequence('thinking', {
      timing: 400,
      fallbackText: '🐕 Thinking... 💭'
    });
    thinking.addFrames([
      '🐕 Thinking...',
      '🐕 Thinking... 💭',
      '🐕 Got it! ✨'
    ]);
    this.registerSequence('thinking', thinking);

    const celebrating = new AnimationSequence('celebrating', {
      timing: 350,
      fallbackText: '🐕 Success! 🎉'
    });
    celebrating.addFrames([
      '🐕 Success!',
      '🐕 Success! 🎉',
      '🐕 Woof woof! 🎉✨'
    ]);
    this.registerSequence('celebrating', celebrating);
  }

  /**
   * Create engine with default configuration
   * @returns {AnimationEngine} Initialized engine
   */
  static async create() {
    const engine = new AnimationEngine();
    await engine.initialize();
    return engine;
  }
}

export default AnimationEngine;