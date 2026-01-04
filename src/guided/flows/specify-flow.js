/**
 * GuidedSpecify Flow Controller
 * Manages the guided specification creation experience.
 * Implements FR-002, FR-003, FR-011
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { SessionManager } from '../session-manager.js';
import { SmartDefaults } from '../smart-defaults.js';
import { QuestionReducer } from '../question-reducer.js';
import { QuestionPresenter } from '../question-presenter.js';
import { StreamingOutput } from '../streaming-output.js';
import { ClarificationQuestion } from '../entities/clarification-question.js';
import { Option } from '../entities/option.js';
import { PhaseType } from '../entities/phase-state.js';

/**
 * Standard clarification question templates
 */
const QUESTION_TEMPLATES = {
  userType: {
    question: 'Who is the primary user of this feature?',
    context: 'Understanding the user helps tailor the implementation.',
    optionGroups: {
      'end-user': 'End User — Optimize for simplicity and discoverability',
      'developer': 'Developer — Optimize for flexibility and extensibility',
      'admin': 'Administrator — Optimize for power and control',
      'both': 'Both Users and Developers — Balance simplicity with flexibility'
    }
  },
  scope: {
    question: 'What is the scope of this feature?',
    context: 'Scope affects implementation complexity and testing needs.',
    optionGroups: {
      'minimal': 'Minimal — Core functionality only, ship fast',
      'standard': 'Standard — Common use cases covered',
      'comprehensive': 'Comprehensive — Full functionality with edge cases'
    }
  },
  integration: {
    question: 'How should this feature integrate with existing code?',
    context: 'Integration approach affects architecture and testing.',
    optionGroups: {
      'standalone': 'Standalone — Independent module, minimal dependencies',
      'extend': 'Extend Existing — Build on current patterns and components',
      'replace': 'Replace — Supersede existing implementation'
    }
  },
  priority: {
    question: 'What is the priority of this feature?',
    context: 'Priority affects implementation depth and polish.',
    optionGroups: {
      'P1': 'P1 Critical — Core to product, implement thoroughly',
      'P2': 'P2 Important — Significant value, standard implementation',
      'P3': 'P3 Nice to Have — Convenience feature, minimal scope'
    }
  }
};

export class GuidedSpecify {
  /**
   * @param {Object} options
   * @param {SessionManager} [options.sessionManager] - Session manager instance
   * @param {SmartDefaults} [options.smartDefaults] - Smart defaults analyzer
   * @param {QuestionReducer} [options.questionReducer] - Question reducer
   * @param {QuestionPresenter} [options.questionPresenter] - Question presenter
   * @param {StreamingOutput} [options.streamingOutput] - Streaming output handler
   * @param {number} [options.maxClarifications=3] - Maximum clarification questions
   */
  constructor(options = {}) {
    this.sessionManager = options.sessionManager || new SessionManager();
    this.smartDefaults = options.smartDefaults || new SmartDefaults();
    this.questionReducer = options.questionReducer || new QuestionReducer();
    this.questionPresenter = options.questionPresenter || new QuestionPresenter();
    this.streamingOutput = options.streamingOutput || new StreamingOutput();
    this.maxClarifications = options.maxClarifications ?? 3;

    this._featureData = null;
    this._clarifications = [];
  }

  /**
   * Run the guided specify flow
   * @param {string} projectPath - Path to project directory
   * @param {string} featureDescription - Natural language feature description
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>} Specification result
   */
  async run(projectPath, featureDescription, options = {}) {
    console.log(chalk.cyan('\n🐕 Let\'s create a specification for your feature.\n'));

    // Load session
    await this.sessionManager.load(projectPath);
    await this.sessionManager.enterPhase(PhaseType.SPECIFY);

    this._featureData = {
      description: featureDescription,
      ...options.initialData
    };

    try {
      // Step 1: Analyze feature description
      console.log(chalk.dim('Analyzing your feature description...\n'));
      const analysis = this.smartDefaults.analyzeFeature(featureDescription);

      // Step 2: Apply high-confidence defaults
      const autoApplied = this._applyAutoDefaults(analysis.defaults);

      // Step 3: Generate clarification questions
      const questions = this._generateClarificationQuestions(
        featureDescription,
        analysis.defaults,
        analysis.suggestedQuestions
      );

      // Step 4: Reduce to max allowed questions
      const reducedQuestions = this.questionReducer.reduceClarifications(
        questions,
        analysis.defaults
      );

      // Step 5: Ask clarification questions (max 3)
      if (reducedQuestions.length > 0) {
        console.log(chalk.dim(`I have ${reducedQuestions.length} clarification question${reducedQuestions.length === 1 ? '' : 's'}...\n`));

        for (const question of reducedQuestions) {
          const answer = await this.questionPresenter.present(question);
          this._featureData[question.id] = answer;
          this._clarifications.push({
            question: question.question,
            answer,
            wasOther: question.getAnswer()?.wasOther
          });
        }
      } else {
        console.log(chalk.dim('No additional clarification needed - your description was clear!\n'));
      }

      // Step 6: Confirm specification parameters
      const confirmed = await this._confirmSpecification();
      if (!confirmed) {
        console.log(chalk.yellow('\nSpecification cancelled. Run again when ready.\n'));
        return { success: false, cancelled: true };
      }

      // Step 7: Generate specification (streaming output)
      console.log(chalk.dim('\nGenerating specification...\n'));
      await this._showSpecificationPreview();

      // Complete phase
      await this.sessionManager.completeCurrentPhase(['.speckit/spec.md']);

      // Record decisions
      for (const clarification of this._clarifications) {
        await this.sessionManager.recordDecision({
          phase: PhaseType.SPECIFY,
          questionId: clarification.question.replace(/\s+/g, '_').toLowerCase(),
          question: clarification.question,
          answer: String(clarification.answer),
          wasDefault: false
        });
      }

      console.log(chalk.green('\n✨ Specification created! Ready for planning.\n'));

      return {
        success: true,
        featureData: this._featureData,
        clarifications: this._clarifications,
        session: this.sessionManager.session
      };

    } catch (error) {
      console.error(chalk.red('\n❌ Error during specification:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply high-confidence defaults automatically
   * @private
   */
  _applyAutoDefaults(defaults) {
    const autoApplied = [];

    for (const def of defaults) {
      if (def.canAutoApply()) {
        this._featureData[def.questionId] = def.value;
        autoApplied.push(def.questionId);
      }
    }

    return autoApplied;
  }

  /**
   * Generate clarification questions based on analysis
   * @private
   */
  _generateClarificationQuestions(description, defaults, suggestedQuestionIds) {
    const questions = [];

    // Add questions for suggested IDs
    for (const questionId of suggestedQuestionIds) {
      const template = QUESTION_TEMPLATES[questionId];
      if (template) {
        const smartDefault = defaults.find(d => d.questionId === questionId);
        questions.push(this._createQuestion(questionId, template, smartDefault));
      }
    }

    // Add default questions if we have room
    const defaultQuestions = ['userType', 'scope'];
    for (const qId of defaultQuestions) {
      if (!questions.find(q => q.id === qId) && questions.length < this.maxClarifications) {
        const template = QUESTION_TEMPLATES[qId];
        const smartDefault = defaults.find(d => d.questionId === qId);
        if (template) {
          questions.push(this._createQuestion(qId, template, smartDefault));
        }
      }
    }

    return questions;
  }

  /**
   * Create a ClarificationQuestion from template
   * @private
   */
  _createQuestion(id, template, smartDefault = null) {
    const options = Object.entries(template.optionGroups).map(([value, label]) => {
      const [displayLabel, implications] = label.split(' — ');
      return new Option({
        value,
        label: displayLabel,
        implications,
        isRecommended: smartDefault?.value === value
      });
    });

    return new ClarificationQuestion({
      id,
      question: template.question,
      context: template.context,
      options,
      smartDefault,
      allowOther: true
    });
  }

  /**
   * Confirm specification parameters before generating
   * @private
   */
  async _confirmSpecification() {
    console.log(chalk.bold('\n📋 Specification Summary:\n'));

    // Display feature description
    console.log(`  ${chalk.cyan('Feature')}: ${this._featureData.description}`);

    // Display collected data
    for (const [key, value] of Object.entries(this._featureData)) {
      if (key !== 'description' && value !== undefined && value !== null) {
        console.log(`  ${chalk.cyan(key)}: ${value}`);
      }
    }

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: chalk.bold('\nProceed with specification?'),
      default: true
    }]);

    return confirm;
  }

  /**
   * Show a preview of the specification being generated
   * @private
   */
  async _showSpecificationPreview() {
    // Simulate streaming output for the specification
    const sections = [
      '## Feature Overview',
      `${this._featureData.description}`,
      '',
      '## User Stories',
      `- As a ${this._featureData.userType || 'user'}, I want this feature...`,
      '',
      '## Scope',
      `Scope: ${this._featureData.scope || 'standard'}`,
      '',
      '## Requirements',
      '- [Generated based on your inputs]',
      '',
      '## Success Criteria',
      '- Feature works as described',
      '- Tests pass',
      ''
    ];

    for (const line of sections) {
      await this.streamingOutput.write(chalk.dim(line) + '\n');
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(chalk.dim('─'.repeat(40)));
  }

  /**
   * Get the current feature data
   * @returns {Object|null}
   */
  getFeatureData() {
    return this._featureData;
  }

  /**
   * Get the clarifications that were asked
   * @returns {Array}
   */
  getClarifications() {
    return this._clarifications;
  }
}
