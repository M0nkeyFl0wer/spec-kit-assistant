/**
 * QuestionPresenter
 * Formats and presents clarification questions with implications.
 * Implements FR-002 (each question shows 2-4 suggested answers with implications)
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { ClarificationQuestion } from './entities/clarification-question.js';

export class QuestionPresenter {
  /**
   * @param {Object} options
   * @param {boolean} [options.showContext=true] - Show question context
   * @param {boolean} [options.showImplications=true] - Show option implications
   * @param {boolean} [options.highlightRecommended=true] - Highlight recommended options
   * @param {boolean} [options.compactMode=false] - Use compact display
   */
  constructor(options = {}) {
    this.showContext = options.showContext ?? true;
    this.showImplications = options.showImplications ?? true;
    this.highlightRecommended = options.highlightRecommended ?? true;
    this.compactMode = options.compactMode ?? false;
  }

  /**
   * Present a single clarification question
   * @param {ClarificationQuestion} question
   * @returns {Promise<*>} The user's answer
   */
  async present(question) {
    // Show context if available
    if (this.showContext && question.context) {
      console.log(chalk.dim(`\n${question.context}\n`));
    }

    // Build choices for inquirer
    const choices = this._buildChoices(question);

    // Add default if smart default exists
    const defaultOption = question.getDefaultOption();
    const defaultValue = defaultOption?.value;

    const prompt = {
      type: 'list',
      name: 'answer',
      message: question.question,
      choices,
      default: defaultValue,
      pageSize: 10
    };

    const { answer } = await inquirer.prompt([prompt]);

    // Handle "Other" option
    if (answer === '__other__') {
      const { customAnswer } = await inquirer.prompt([{
        type: 'input',
        name: 'customAnswer',
        message: 'Please specify:',
        validate: input => input.trim().length > 0 || 'Please enter a value'
      }]);

      question.setAnswer(customAnswer, true);
      return customAnswer;
    }

    question.setAnswer(answer, false);
    return answer;
  }

  /**
   * Present multiple questions in sequence
   * @param {ClarificationQuestion[]} questions
   * @param {Object} [options]
   * @param {number} [options.maxQuestions] - Maximum questions to ask
   * @returns {Promise<Object>} Map of questionId -> answer
   */
  async presentAll(questions, options = {}) {
    const maxQuestions = options.maxQuestions ?? questions.length;
    const answers = {};

    const toAsk = questions.slice(0, maxQuestions);

    for (let i = 0; i < toAsk.length; i++) {
      const question = toAsk[i];

      // Show progress for multiple questions
      if (toAsk.length > 1) {
        console.log(chalk.dim(`\nQuestion ${i + 1} of ${toAsk.length}`));
      }

      const answer = await this.present(question);
      answers[question.id] = answer;
    }

    return answers;
  }

  /**
   * Build inquirer choices from question options
   * @private
   */
  _buildChoices(question) {
    const choices = [];
    const defaultOption = question.getDefaultOption();

    for (const option of question.options) {
      let name = option.label;

      // Add implications if enabled
      if (this.showImplications && option.implications && !this.compactMode) {
        name += chalk.dim(` — ${option.implications}`);
      }

      // Highlight recommended
      if (this.highlightRecommended && option.isRecommended) {
        name = chalk.hex('#10B981')(name) + chalk.hex('#10B981')(' ✓');
      } else if (option === defaultOption) {
        name = chalk.cyan(name) + chalk.dim(' (default)');
      }

      choices.push({
        name,
        value: option.value,
        short: option.label
      });
    }

    // Add separator before "Other" if allowed
    if (question.allowOther) {
      choices.push(new inquirer.Separator());
      choices.push({
        name: chalk.dim('Other (enter your own)'),
        value: '__other__',
        short: 'Other'
      });
    }

    return choices;
  }

  /**
   * Present a confirmation question
   * @param {string} message - The confirmation message
   * @param {boolean} [defaultValue=true] - Default answer
   * @returns {Promise<boolean>}
   */
  async confirm(message, defaultValue = true) {
    const { confirmed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue
    }]);

    return confirmed;
  }

  /**
   * Present a simple text input
   * @param {string} message - The prompt message
   * @param {Object} [options]
   * @returns {Promise<string>}
   */
  async input(message, options = {}) {
    const { answer } = await inquirer.prompt([{
      type: 'input',
      name: 'answer',
      message,
      default: options.default,
      validate: options.validate || (input => input.trim().length > 0 || 'Please enter a value')
    }]);

    return answer;
  }

  /**
   * Display a summary of answered questions
   * @param {ClarificationQuestion[]} questions
   */
  displaySummary(questions) {
    const answered = questions.filter(q => q.isAnswered());

    if (answered.length === 0) {
      return;
    }

    console.log(chalk.bold('\n📋 Your choices:\n'));

    for (const question of answered) {
      const answer = question.getAnswer();
      const displayValue = answer.wasOther
        ? `${answer.value} (custom)`
        : answer.value;

      console.log(`  ${chalk.cyan(question.id)}: ${displayValue}`);
    }

    console.log();
  }

  /**
   * Create a presenter for compact question display
   * @returns {QuestionPresenter}
   */
  static compact() {
    return new QuestionPresenter({
      showContext: false,
      showImplications: false,
      compactMode: true
    });
  }

  /**
   * Create a presenter with full details
   * @returns {QuestionPresenter}
   */
  static detailed() {
    return new QuestionPresenter({
      showContext: true,
      showImplications: true,
      highlightRecommended: true,
      compactMode: false
    });
  }
}
