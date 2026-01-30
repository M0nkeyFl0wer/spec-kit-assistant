/**
 * StreamingOutput
 * Handles progressive display of AI-generated responses.
 * Implements FR-013 (streaming with <5s initial output)
 * @see research.md for ANSI escape sequences and ora integration
 */

import ora from 'ora';

/**
 * ANSI escape sequences for terminal control
 */
const ANSI = {
  CLEAR_LINE: '\x1b[2K',
  MOVE_TO_START: '\x1b[1G',
  CURSOR_UP: '\x1b[1A',
  CURSOR_DOWN: '\x1b[1B',
  HIDE_CURSOR: '\x1b[?25l',
  SHOW_CURSOR: '\x1b[?25h'
};

export class StreamingOutput {
  /**
   * @param {Object} options
   * @param {boolean} [options.enabled=true] - Enable streaming
   * @param {string} [options.spinnerText='Thinking...'] - Initial spinner text
   * @param {string} [options.spinner='dots'] - Spinner style
   */
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.spinnerText = options.spinnerText ?? 'Thinking...';
    this.spinnerStyle = options.spinner ?? 'dots';

    this._spinner = null;
    this._buffer = '';
    this._lineCount = 0;
    this._isTTY = process.stdout.isTTY ?? false;
  }

  /**
   * Check if terminal supports streaming
   * @returns {boolean}
   */
  get isInteractive() {
    return this._isTTY && this.enabled;
  }

  /**
   * Start the thinking spinner
   */
  startSpinner() {
    if (!this.isInteractive) return;

    this._spinner = ora({
      text: this.spinnerText,
      spinner: this.spinnerStyle
    }).start();
  }

  /**
   * Stop the spinner
   */
  stopSpinner() {
    if (this._spinner) {
      this._spinner.stop();
      this._spinner = null;
    }
  }

  /**
   * Write a chunk of streaming output
   * @param {string} chunk - Text chunk to display
   */
  write(chunk) {
    if (!this.enabled) {
      this._buffer += chunk;
      return;
    }

    // Stop spinner on first content
    this.stopSpinner();

    if (this._isTTY) {
      process.stdout.write(chunk);
    }

    this._buffer += chunk;
    this._lineCount += (chunk.match(/\n/g) || []).length;
  }

  /**
   * Write a complete line
   * @param {string} line - Line to display
   */
  writeLine(line) {
    this.write(line + '\n');
  }

  /**
   * Update a line in place (for progress)
   * @param {string} text - New text for current line
   */
  updateLine(text) {
    if (!this.isInteractive) {
      return;
    }

    process.stdout.write(ANSI.CLEAR_LINE + ANSI.MOVE_TO_START + text);
  }

  /**
   * Complete streaming and return full buffer
   * @returns {string} Complete output text
   */
  finish() {
    this.stopSpinner();

    // Ensure we end on a new line
    if (this._buffer.length > 0 && !this._buffer.endsWith('\n')) {
      if (this.isInteractive) {
        process.stdout.write('\n');
      }
      this._buffer += '\n';
    }

    const result = this._buffer;
    this._buffer = '';
    this._lineCount = 0;

    return result;
  }

  /**
   * Get the current buffer content
   * @returns {string}
   */
  getBuffer() {
    return this._buffer;
  }

  /**
   * Clear the buffer
   */
  clearBuffer() {
    this._buffer = '';
    this._lineCount = 0;
  }

  /**
   * Stream from an async generator
   * @param {AsyncGenerator<string>} generator - Chunk generator
   * @returns {Promise<string>} Complete output
   */
  async streamFrom(generator) {
    this.startSpinner();

    try {
      for await (const chunk of generator) {
        this.write(chunk);
      }
    } finally {
      return this.finish();
    }
  }

  /**
   * Stream from an array of chunks with delay (for testing/demo)
   * @param {string[]} chunks - Text chunks
   * @param {number} [delayMs=50] - Delay between chunks
   * @returns {Promise<string>} Complete output
   */
  async streamChunks(chunks, delayMs = 50) {
    this.startSpinner();

    for (const chunk of chunks) {
      await this._delay(delayMs);
      this.write(chunk);
    }

    return this.finish();
  }

  /**
   * Display a message with typing effect
   * @param {string} message - Message to type
   * @param {number} [charDelayMs=20] - Delay per character
   * @returns {Promise<void>}
   */
  async typeMessage(message, charDelayMs = 20) {
    if (!this.isInteractive) {
      this.write(message);
      return;
    }

    for (const char of message) {
      process.stdout.write(char);
      this._buffer += char;
      await this._delay(charDelayMs);
    }
  }

  /**
   * Print immediately without streaming (for non-TTY)
   * @param {string} text - Text to print
   */
  print(text) {
    if (!this._isTTY) {
      console.log(text);
    } else {
      this.writeLine(text);
    }
    this._buffer += text + '\n';
  }

  /**
   * Create a streaming output for JSON mode (non-interactive)
   * @returns {StreamingOutput}
   */
  static forJSON() {
    return new StreamingOutput({ enabled: false });
  }

  /**
   * Create a streaming output for interactive mode
   * @param {Object} [options]
   * @returns {StreamingOutput}
   */
  static forInteractive(options = {}) {
    return new StreamingOutput({
      enabled: true,
      ...options
    });
  }

  /**
   * Internal delay helper
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
