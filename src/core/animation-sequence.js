/**
 * T019: AnimationSequence model
 * Defines visual feedback and character animations
 * Based on data-model.md specification with 500ms constitutional limit
 */

export class AnimationSequence {
  constructor(name, options = {}) {
    this.name = name;
    this.frames = [];
    this.timing = Math.min(options.timing || 300, 500); // Constitutional 500ms limit
    this.fallbackText = options.fallbackText || '⚡ Processing...';
    this.triggerEvents = options.triggerEvents || [];
    this.state = 'IDLE';
    this.currentFrame = 0;
    this.loop = options.loop || false;
    this.frameDelay = this.timing / Math.max(this.frames.length, 1);
  }

  /**
   * Add animation frame to sequence
   * @param {string} frame - ASCII art frame
   * @param {number} duration - Frame duration in ms (optional)
   */
  addFrame(frame, duration = null) {
    this.frames.push({
      content: frame,
      duration: duration || this.frameDelay
    });

    // Recalculate frame timing to stay within constitutional limits
    this.frameDelay = this.timing / this.frames.length;
  }

  /**
   * Add multiple frames from array
   * @param {Array<string>} frames - Array of ASCII frames
   */
  addFrames(frames) {
    frames.forEach(frame => this.addFrame(frame));
  }

  /**
   * Set fallback text for limited terminals
   * @param {string} text - Plain text with symbols
   */
  setFallbackText(text) {
    this.fallbackText = text;
  }

  /**
   * Add trigger event that starts this animation
   * @param {string} event - Event name
   */
  addTriggerEvent(event) {
    if (!this.triggerEvents.includes(event)) {
      this.triggerEvents.push(event);
    }
  }

  /**
   * Validate animation meets constitutional requirements
   * @returns {Object} Validation results
   */
  validate() {
    const issues = [];

    // Constitutional 500ms limit
    if (this.timing > 500) {
      issues.push(`Animation timing ${this.timing}ms exceeds constitutional 500ms limit`);
    }

    // Must have fallback text
    if (!this.fallbackText || this.fallbackText.length === 0) {
      issues.push('Animation must provide fallback text for limited terminals');
    }

    // Must have at least one frame or fallback
    if (this.frames.length === 0 && !this.fallbackText) {
      issues.push('Animation must have frames or fallback text');
    }

    // Validate ASCII characters in frames
    for (let i = 0; i < this.frames.length; i++) {
      const frame = this.frames[i];
      if (!/^[\x00-\x7F]*$/.test(frame.content)) {
        issues.push(`Frame ${i} contains non-ASCII characters`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      timing: this.timing,
      frameCount: this.frames.length
    };
  }

  /**
   * Get current frame for animation playback
   * @returns {Object} Current frame data
   */
  getCurrentFrame() {
    if (this.frames.length === 0) {
      return {
        content: this.fallbackText,
        duration: this.timing,
        isLastFrame: true
      };
    }

    const frame = this.frames[this.currentFrame];
    return {
      content: frame.content,
      duration: frame.duration,
      frameNumber: this.currentFrame + 1,
      totalFrames: this.frames.length,
      isLastFrame: this.currentFrame === this.frames.length - 1
    };
  }

  /**
   * Advance to next frame
   * @returns {boolean} true if more frames available
   */
  nextFrame() {
    if (this.frames.length === 0) return false;

    this.currentFrame++;

    if (this.currentFrame >= this.frames.length) {
      if (this.loop) {
        this.currentFrame = 0;
        return true;
      } else {
        this.currentFrame = this.frames.length - 1;
        this.state = 'COMPLETE';
        return false;
      }
    }

    return true;
  }

  /**
   * Reset animation to beginning
   */
  reset() {
    this.currentFrame = 0;
    this.state = 'IDLE';
  }

  /**
   * Start animation sequence
   */
  start() {
    this.reset();
    this.state = 'ANIMATING';
  }

  /**
   * Stop animation sequence
   */
  stop() {
    this.state = 'IDLE';
  }

  /**
   * Complete animation sequence
   */
  complete() {
    this.state = 'COMPLETE';
  }

  /**
   * Handle error during animation
   */
  error() {
    this.state = 'ERROR';
  }

  /**
   * Get animation metadata
   * @returns {Object} Animation information
   */
  getMetadata() {
    return {
      name: this.name,
      frameCount: this.frames.length,
      totalTiming: this.timing,
      frameDelay: this.frameDelay,
      triggerEvents: this.triggerEvents,
      state: this.state,
      loop: this.loop,
      fallbackText: this.fallbackText
    };
  }

  /**
   * Create a Spec the Golden Retriever welcome animation
   * @returns {AnimationSequence} Welcome animation
   */
  static createWelcomeAnimation() {
    const animation = new AnimationSequence('welcome', {
      timing: 400,
      fallbackText: '🐕 Woof! Spec is here to help!',
      triggerEvents: ['app_start', 'welcome_command']
    });

    animation.addFrames([
      `
   /^-----^\\
  ( ◕     ◕ )
   \\  ^___^  /
    \\   ---   /
     ^^^     ^^^
`,
      `
   /^-----^\\    ✨
  ( ◕  ◕  ◕ )
   \\  ^___^  /
    \\   ---   /
     ^^^     ^^^
`,
      `
   /^-----^\\    🎉
  ( ◕  ★  ◕ )
   \\  ^___^  /
    \\   ---   /
     ^^^     ^^^
`
    ]);

    return animation;
  }

  /**
   * Create a working/thinking animation
   * @returns {AnimationSequence} Working animation
   */
  static createWorkingAnimation() {
    const animation = new AnimationSequence('working', {
      timing: 500,
      loop: true,
      fallbackText: '🐕 Working... ⚡',
      triggerEvents: ['task_start', 'processing']
    });

    animation.addFrames([
      `
   /^-----^\\
  ( ◕  ⚙️  ◕ )
   \\  ^___^  /
    \\   ---   /
     ^^^     ^^^
`,
      `
   /^-----^\\    ⚡
  ( ◕  🔧  ◕ )
   \\  ^___^  /
    \\   ---   /
     ^^^     ^^^
`,
      `
   /^-----^\\    💭
  ( ◕  ⚗️  ◕ )
   \\  ^___^  /
    \\   ---   /
     ^^^     ^^^
`
    ]);

    return animation;
  }

  /**
   * Create a progress indicator animation
   * @param {string} message - Progress message
   * @returns {AnimationSequence} Progress animation
   */
  static createProgressAnimation(message = 'Progress') {
    const animation = new AnimationSequence('progress', {
      timing: 300,
      fallbackText: `${message} ▓▓▓░░`,
      triggerEvents: ['progress_update']
    });

    animation.addFrames([
      `${message} ▓░░░░`,
      `${message} ▓▓░░░`,
      `${message} ▓▓▓░░`,
      `${message} ▓▓▓▓░`,
      `${message} ▓▓▓▓▓`
    ]);

    return animation;
  }
}

export default AnimationSequence;