/**
 * ProgressBar UI Component
 * Visual progress indicator for workflow phases.
 * Implements FR-005 (progress visibility)
 */

import chalk from 'chalk';

/**
 * Spec Kit theme colors
 */
const COLORS = {
  purple: '#8B5CF6',
  pink: '#EC4899',
  green: '#10B981',
  dim: '#6B7280'
};

export class ProgressBar {
  /**
   * @param {Object} options
   * @param {string[]} options.phases - List of phase names
   * @param {number} [options.currentPhase=0] - Current phase index
   * @param {number} [options.width=40] - Bar width in characters
   * @param {boolean} [options.showLabels=true] - Show phase labels
   * @param {boolean} [options.showPercentage=true] - Show percentage
   */
  constructor(options = {}) {
    this.phases = options.phases || [];
    this.currentPhase = options.currentPhase ?? 0;
    this.width = options.width ?? 40;
    this.showLabels = options.showLabels ?? true;
    this.showPercentage = options.showPercentage ?? true;

    this._completedPhases = new Set();
  }

  /**
   * Mark a phase as complete
   * @param {number} phaseIndex
   */
  completePhase(phaseIndex) {
    this._completedPhases.add(phaseIndex);
    if (phaseIndex === this.currentPhase && this.currentPhase < this.phases.length - 1) {
      this.currentPhase++;
    }
  }

  /**
   * Move to a specific phase
   * @param {number} phaseIndex
   */
  setPhase(phaseIndex) {
    this.currentPhase = Math.max(0, Math.min(phaseIndex, this.phases.length - 1));
  }

  /**
   * Get current progress as percentage
   * @returns {number}
   */
  getPercentage() {
    if (this.phases.length === 0) return 0;
    return Math.round((this._completedPhases.size / this.phases.length) * 100);
  }

  /**
   * Render the progress bar as a string
   * @returns {string}
   */
  render() {
    const lines = [];

    // Phase labels (if enabled)
    if (this.showLabels && this.phases.length > 0) {
      const labelLine = this.phases.map((phase, i) => {
        const isCompleted = this._completedPhases.has(i);
        const isCurrent = i === this.currentPhase;

        if (isCompleted) {
          return chalk.hex(COLORS.green)('✓ ' + phase);
        } else if (isCurrent) {
          return chalk.hex(COLORS.purple)('● ' + phase);
        } else {
          return chalk.hex(COLORS.dim)('○ ' + phase);
        }
      }).join(chalk.dim(' → '));

      lines.push(labelLine);
    }

    // Progress bar
    const percentage = this.getPercentage();
    const filled = Math.round((percentage / 100) * this.width);
    const empty = this.width - filled;

    const bar = chalk.hex(COLORS.green)('█'.repeat(filled)) +
                chalk.hex(COLORS.dim)('░'.repeat(empty));

    let barLine = `[${bar}]`;

    if (this.showPercentage) {
      barLine += chalk.dim(` ${percentage}%`);
    }

    lines.push(barLine);

    return lines.join('\n');
  }

  /**
   * Render a compact single-line progress indicator
   * @returns {string}
   */
  renderCompact() {
    const percentage = this.getPercentage();
    const currentPhaseName = this.phases[this.currentPhase] || 'Unknown';

    const dots = this.phases.map((_, i) => {
      const isCompleted = this._completedPhases.has(i);
      const isCurrent = i === this.currentPhase;

      if (isCompleted) {
        return chalk.hex(COLORS.green)('●');
      } else if (isCurrent) {
        return chalk.hex(COLORS.purple)('●');
      } else {
        return chalk.hex(COLORS.dim)('○');
      }
    }).join(' ');

    return `${dots} ${chalk.dim(`${currentPhaseName} (${percentage}%)`)}`;
  }

  /**
   * Render as step indicator (Step X of Y)
   * @returns {string}
   */
  renderSteps() {
    const currentStep = this._completedPhases.size + 1;
    const totalSteps = this.phases.length;
    const currentPhaseName = this.phases[this.currentPhase] || 'Unknown';

    return chalk.dim(`Step ${currentStep} of ${totalSteps}: `) +
           chalk.hex(COLORS.purple)(currentPhaseName);
  }

  /**
   * Display the progress bar to console
   */
  display() {
    console.log(this.render());
  }

  /**
   * Create a progress bar for the standard spec-kit workflow
   * @returns {ProgressBar}
   */
  static specKitWorkflow() {
    return new ProgressBar({
      phases: ['Setup', 'Spec', 'Plan', 'Clarify', 'Implement', 'Test'],
      currentPhase: 0
    });
  }

  /**
   * Create a progress bar for onboarding only
   * @returns {ProgressBar}
   */
  static onboarding() {
    return new ProgressBar({
      phases: ['Welcome', 'Project Info', 'Configuration', 'Summary'],
      currentPhase: 0
    });
  }

  /**
   * Create a progress bar for the specify workflow
   * @returns {ProgressBar}
   */
  static specify() {
    return new ProgressBar({
      phases: ['Description', 'Clarify', 'Generate', 'Review'],
      currentPhase: 0
    });
  }
}

/**
 * Animated progress for async operations
 */
export class AnimatedProgress {
  /**
   * @param {Object} options
   * @param {string} [options.message='Loading...'] - Message to display
   * @param {string[]} [options.frames] - Animation frames
   * @param {number} [options.interval=80] - Frame interval in ms
   */
  constructor(options = {}) {
    this.message = options.message || 'Loading...';
    this.frames = options.frames || ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.interval = options.interval ?? 80;

    this._timer = null;
    this._frameIndex = 0;
  }

  /**
   * Start the animation
   */
  start() {
    if (this._timer) return;

    this._timer = setInterval(() => {
      process.stdout.write(`\r${chalk.hex(COLORS.purple)(this.frames[this._frameIndex])} ${this.message}`);
      this._frameIndex = (this._frameIndex + 1) % this.frames.length;
    }, this.interval);
  }

  /**
   * Stop the animation
   * @param {string} [finalMessage] - Message to show when stopped
   */
  stop(finalMessage) {
    if (!this._timer) return;

    clearInterval(this._timer);
    this._timer = null;

    // Clear the line and show final message
    process.stdout.write('\r' + ' '.repeat(this.message.length + 5) + '\r');
    if (finalMessage) {
      console.log(finalMessage);
    }
  }

  /**
   * Update the message while running
   * @param {string} message
   */
  updateMessage(message) {
    this.message = message;
  }
}
