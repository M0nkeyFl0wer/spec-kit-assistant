/**
 * GuidedOnboarding Flow Controller
 * Manages the guided onboarding experience for new projects.
 * Implements FR-001, FR-003, FR-004, FR-006, FR-007
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { SessionManager } from '../session-manager.js';
import { SmartDefaults } from '../smart-defaults.js';
import { QuestionReducer } from '../question-reducer.js';
import { StreamingOutput } from '../streaming-output.js';
import { PhaseType } from '../entities/phase-state.js';
import { ExpandableSection } from '../ui/expandable-section.js';

export class GuidedOnboarding {
  /**
   * @param {Object} options
   * @param {SessionManager} [options.sessionManager] - Session manager instance
   * @param {SmartDefaults} [options.smartDefaults] - Smart defaults analyzer
   * @param {QuestionReducer} [options.questionReducer] - Question reducer
   * @param {StreamingOutput} [options.streamingOutput] - Streaming output handler
   * @param {boolean} [options.showAdvanced=false] - Show advanced options by default
   */
  constructor(options = {}) {
    this.sessionManager = options.sessionManager || new SessionManager();
    this.smartDefaults = options.smartDefaults || new SmartDefaults();
    this.questionReducer = options.questionReducer || new QuestionReducer();
    this.streamingOutput = options.streamingOutput || new StreamingOutput();
    this.showAdvanced = options.showAdvanced ?? false;

    this._projectData = null;
    this._expandedSections = new Set();
  }

  /**
   * Run the guided onboarding flow
   * @param {string} projectPath - Path to project directory
   * @param {Object} [initialData] - Pre-populated data
   * @returns {Promise<Object>} Onboarding result
   */
  async run(projectPath, initialData = {}) {
    console.log(chalk.cyan('\n🐕 Welcome to Spec Kit! Let\'s set up your project.\n'));

    // Load or create session
    await this.sessionManager.load(projectPath);
    await this.sessionManager.enterPhase(PhaseType.ONBOARDING);

    this._projectData = { ...initialData };

    try {
      // Step 1: Get project description (primary question)
      const description = await this._askPrimaryQuestion();

      // Step 2: Analyze and generate defaults
      const analysis = this.smartDefaults.analyzeProject(description);
      this._projectData.archetype = analysis.archetype;

      // Display detected archetype
      this._displayArchetypeDetection(analysis);

      // Step 3: Apply high-confidence defaults automatically
      const autoApplied = this._applyAutoDefaults(analysis.defaults);

      // Step 4: Ask follow-up questions (max 2)
      if (analysis.suggestedQuestions.length > 0) {
        await this._askFollowUpQuestions(analysis.suggestedQuestions, analysis.defaults);
      }

      // Step 5: Offer advanced customization
      const wantsAdvanced = await this._offerCustomization();
      if (wantsAdvanced) {
        await this._showAdvancedOptions(analysis.defaults);
      }

      // Step 6: Confirm and finalize
      const confirmed = await this._confirmSetup();
      if (!confirmed) {
        console.log(chalk.yellow('\nSetup cancelled. You can run this again anytime.\n'));
        return { success: false, cancelled: true };
      }

      // Complete onboarding phase
      await this.sessionManager.completeCurrentPhase(['.speckit/session.json']);

      // Record all decisions
      for (const [key, value] of Object.entries(this._projectData)) {
        if (key !== 'archetype') {
          const wasDefault = autoApplied.includes(key);
          await this.sessionManager.recordDecision({
            phase: PhaseType.ONBOARDING,
            questionId: key,
            question: this._getQuestionText(key),
            answer: String(value),
            wasDefault,
            confidence: wasDefault ? this._getDefaultConfidence(analysis.defaults, key) : undefined
          });
        }
      }

      console.log(chalk.green('\n✨ Project setup complete! You\'re ready to start specifying features.\n'));

      return {
        success: true,
        projectData: this._projectData,
        archetype: analysis.archetype,
        session: this.sessionManager.session
      };

    } catch (error) {
      console.error(chalk.red('\n❌ Error during onboarding:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ask the primary question (project description)
   * @private
   */
  async _askPrimaryQuestion() {
    const { description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: chalk.bold('Describe your project in a few words:'),
        validate: input => input.trim().length > 0 || 'Please enter a description'
      }
    ]);

    this._projectData.description = description;
    return description;
  }

  /**
   * Display archetype detection results
   * @private
   */
  _displayArchetypeDetection(analysis) {
    const { archetype } = analysis;

    if (archetype.confidence >= 0.7) {
      console.log(chalk.dim(`\nDetected: ${chalk.white(archetype.name)} `) +
        chalk.dim(`(${Math.round(archetype.confidence * 100)}% confident)`));

      if (archetype.matchedKeywords.length > 0) {
        console.log(chalk.dim(`Keywords: ${archetype.matchedKeywords.slice(0, 3).join(', ')}`));
      }
    }
  }

  /**
   * Apply defaults that can be auto-applied
   * @private
   * @returns {string[]} List of auto-applied question IDs
   */
  _applyAutoDefaults(defaults) {
    const autoApplied = [];

    for (const def of defaults) {
      if (def.canAutoApply()) {
        this._projectData[def.questionId] = def.value;
        autoApplied.push(def.questionId);
      }
    }

    return autoApplied;
  }

  /**
   * Ask follow-up questions (max 2)
   * @private
   */
  async _askFollowUpQuestions(suggestedQuestions, defaults) {
    const questions = suggestedQuestions.slice(0, 2); // Enforce max 2 follow-up

    for (const questionId of questions) {
      const def = defaults.find(d => d.questionId === questionId);
      const answer = await this._askQuestion(questionId, def);
      this._projectData[questionId] = answer;
    }
  }

  /**
   * Ask a single question with optional default
   * @private
   */
  async _askQuestion(questionId, smartDefault = null) {
    const questionConfig = this._getQuestionConfig(questionId);

    if (!questionConfig) {
      // Fallback to simple input
      const { answer } = await inquirer.prompt([{
        type: 'input',
        name: 'answer',
        message: `${questionId}:`,
        default: smartDefault?.value
      }]);
      return answer;
    }

    // Add default hint if available
    let message = questionConfig.message;
    if (smartDefault && smartDefault.meetsThreshold()) {
      message += chalk.dim(` (recommended: ${smartDefault.value})`);
    }

    const prompt = {
      ...questionConfig,
      message,
      default: smartDefault?.value ?? questionConfig.default
    };

    const result = await inquirer.prompt([prompt]);
    return result[questionConfig.name];
  }

  /**
   * Offer advanced customization option using ExpandableSection
   * @private
   */
  async _offerCustomization() {
    if (this.showAdvanced) return true;

    // Use ExpandableSection for progressive disclosure (FR-007)
    const customizeSection = ExpandableSection.customize('advanced-options', async () => {
      return true; // Signal that user wants to see advanced options
    });

    console.log(chalk.dim('\n' + '─'.repeat(40)));

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: chalk.dim('Ready to continue?'),
      choices: [
        {
          name: chalk.green('Continue with defaults →'),
          value: 'continue',
          short: 'Continue'
        },
        {
          name: chalk.hex('#8B5CF6')('Customize...') + chalk.dim(' — Adjust advanced settings'),
          value: 'customize',
          short: 'Customize'
        }
      ],
      default: 'continue'
    }]);

    console.log(chalk.dim('─'.repeat(40) + '\n'));

    return action === 'customize';
  }

  /**
   * Show advanced options (expandable section)
   * @private
   */
  async _showAdvancedOptions(defaults) {
    console.log(chalk.dim('\n─── Advanced Options ───\n'));

    // Show options that were auto-applied, allowing override
    for (const def of defaults) {
      if (def.canAutoApply() && this._projectData[def.questionId] !== undefined) {
        const { override } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'override',
            message: `${def.questionId}: ${this._projectData[def.questionId]} ` +
              chalk.dim(`(${def.reasoning})`),
            default: false
          }
        ]);

        if (override) {
          const newValue = await this._askQuestion(def.questionId);
          this._projectData[def.questionId] = newValue;
        }
      }
    }

    console.log(chalk.dim('\n────────────────────────\n'));
  }

  /**
   * Confirm setup before finalizing
   * @private
   */
  async _confirmSetup() {
    console.log(chalk.bold('\n📋 Project Summary:\n'));

    // Display key settings
    for (const [key, value] of Object.entries(this._projectData)) {
      if (key !== 'archetype' && value !== undefined && value !== null) {
        console.log(`  ${chalk.cyan(key)}: ${value}`);
      }
    }

    if (this._projectData.archetype) {
      console.log(`  ${chalk.cyan('type')}: ${this._projectData.archetype.name}`);
    }

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.bold('\nLooks good?'),
        default: true
      }
    ]);

    return confirm;
  }

  /**
   * Get question configuration by ID
   * @private
   */
  _getQuestionConfig(questionId) {
    const configs = {
      projectName: {
        type: 'input',
        name: 'projectName',
        message: 'Project name:'
      },
      hasUI: {
        type: 'confirm',
        name: 'hasUI',
        message: 'Does this project have a user interface?'
      },
      hasBackend: {
        type: 'confirm',
        name: 'hasBackend',
        message: 'Does this project need a backend/server?'
      },
      hasDatabase: {
        type: 'confirm',
        name: 'hasDatabase',
        message: 'Will this project use a database?'
      },
      authNeeded: {
        type: 'confirm',
        name: 'authNeeded',
        message: 'Does this project need user authentication?'
      },
      framework: {
        type: 'list',
        name: 'framework',
        message: 'Preferred framework:',
        choices: ['react', 'vue', 'angular', 'svelte', 'none', 'other']
      }
    };

    return configs[questionId];
  }

  /**
   * Get question text for logging
   * @private
   */
  _getQuestionText(questionId) {
    const config = this._getQuestionConfig(questionId);
    return config?.message || questionId;
  }

  /**
   * Get default confidence for a question
   * @private
   */
  _getDefaultConfidence(defaults, questionId) {
    const def = defaults.find(d => d.questionId === questionId);
    return def?.confidence;
  }

  /**
   * Toggle expansion of a section
   * @param {string} sectionId
   */
  toggleSection(sectionId) {
    if (this._expandedSections.has(sectionId)) {
      this._expandedSections.delete(sectionId);
    } else {
      this._expandedSections.add(sectionId);
    }
  }

  /**
   * Check if a section is expanded
   * @param {string} sectionId
   * @returns {boolean}
   */
  isSectionExpanded(sectionId) {
    return this._expandedSections.has(sectionId);
  }
}
