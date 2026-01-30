/**
 * CLI JSON Interface Router
 * Routes JSON-RPC requests to appropriate handlers.
 * Implements FR-010 for Little Helper integration
 */

import { JsonRpcParser, RPC_ERROR_CODES } from './json-rpc-parser.js';
import { JsonRpcResponse, StreamingResponse } from './json-rpc-response.js';
import { SessionManager } from '../guided/session-manager.js';
import { GuidedOnboarding } from '../guided/flows/onboarding-flow.js';
import { GuidedSpecify } from '../guided/flows/specify-flow.js';
import { SmartDefaults } from '../guided/smart-defaults.js';
import { PhaseType } from '../guided/entities/phase-state.js';

export class CliJsonInterface {
  /**
   * @param {Object} options
   * @param {string} [options.projectPath] - Project path (defaults to cwd)
   */
  constructor(options = {}) {
    this.projectPath = options.projectPath || process.cwd();
    this.parser = new JsonRpcParser();
    this.sessionManager = new SessionManager();
    this.smartDefaults = new SmartDefaults();

    // Pending questions for answer method
    this._pendingQuestions = new Map();
  }

  /**
   * Handle a JSON-RPC request
   * @param {string} input - Raw JSON input
   * @returns {Promise<void>} Writes response to stdout
   */
  async handleRequest(input) {
    const parseResult = this.parser.parse(input);

    if (!parseResult.valid) {
      JsonRpcResponse.write(
        JsonRpcResponse.error(null, parseResult.error.code, parseResult.error.message, parseResult.error.data)
      );
      return;
    }

    const { request } = parseResult;

    // Validate method-specific params
    const paramsValidation = this.parser.validateParams(request.method, request.params);
    if (!paramsValidation.valid) {
      JsonRpcResponse.write(
        JsonRpcResponse.error(request.id, paramsValidation.error.code, paramsValidation.error.message)
      );
      return;
    }

    // Route to handler
    try {
      const result = await this.routeMethod(request.method, request.params, request.id);
      JsonRpcResponse.write(JsonRpcResponse.success(request.id, result));
    } catch (error) {
      JsonRpcResponse.write(
        JsonRpcResponse.internalError(request.id, error.message)
      );
    }
  }

  /**
   * Route a method to its handler
   * @param {string} method - Method name
   * @param {Object} params - Request params
   * @param {*} id - Request ID
   * @returns {Promise<Object>} Result object
   */
  async routeMethod(method, params, id) {
    switch (method) {
      case 'init':
        return this.handleInit(params);

      case 'specify':
        return this.handleSpecify(params);

      case 'answer':
        return this.handleAnswer(params);

      case 'status':
        return this.handleStatus(params);

      case 'plan':
        return this.handlePlan(params);

      case 'tasks':
        return this.handleTasks(params);

      default:
        throw new Error(`Unhandled method: ${method}`);
    }
  }

  /**
   * Handle init method
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async handleInit(params) {
    const { projectName, projectPath, agent } = params;
    const targetPath = projectPath || process.cwd();

    try {
      // Load or create session
      await this.sessionManager.load(targetPath);
      await this.sessionManager.enterPhase(PhaseType.ONBOARDING);

      // Store project info
      this.sessionManager.session.projectId = projectName;
      this.sessionManager.session.projectPath = targetPath;
      await this.sessionManager.save();

      return {
        status: 'success',
        projectPath: targetPath,
        sessionId: this.sessionManager.session.id
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Handle specify method
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async handleSpecify(params) {
    const { description, acceptDefaults } = params;

    try {
      // Load session
      await this.sessionManager.load(this.projectPath);

      // Analyze feature description
      const analysis = this.smartDefaults.analyzeFeature(description);

      // If acceptDefaults is true, skip questions
      if (acceptDefaults) {
        return {
          status: 'success',
          specPath: `.speckit/features/${this._slugify(description)}/spec.md`,
          questions: []
        };
      }

      // Build questions from analysis
      const questions = analysis.suggestedQuestions.slice(0, 3).map(qId => ({
        id: qId,
        question: this._getQuestionText(qId),
        type: 'single',
        options: this._getQuestionOptions(qId),
        default: analysis.defaults.find(d => d.questionId === qId)
          ? {
              value: analysis.defaults.find(d => d.questionId === qId).value,
              confidence: analysis.defaults.find(d => d.questionId === qId).confidence,
              reasoning: analysis.defaults.find(d => d.questionId === qId).reasoning
            }
          : null,
        required: true,
        expandable: false
      }));

      // Store pending questions for answer method
      this._pendingQuestions.set('current', {
        description,
        questions,
        currentIndex: 0,
        answers: {}
      });

      return {
        status: questions.length > 0 ? 'needs_input' : 'success',
        specPath: `.speckit/features/${this._slugify(description)}/spec.md`,
        questions
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Handle answer method
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async handleAnswer(params) {
    const { questionId, answer } = params;
    const pending = this._pendingQuestions.get('current');

    if (!pending) {
      return {
        status: 'error',
        message: 'No pending questions'
      };
    }

    // Store answer
    pending.answers[questionId] = answer;
    pending.currentIndex++;

    // Check if more questions
    if (pending.currentIndex < pending.questions.length) {
      return {
        status: 'needs_more',
        nextQuestion: pending.questions[pending.currentIndex]
      };
    }

    // All questions answered
    this._pendingQuestions.delete('current');

    return {
      status: 'complete',
      answers: pending.answers
    };
  }

  /**
   * Handle status method
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async handleStatus(params) {
    const targetPath = params.projectPath || this.projectPath;

    try {
      await this.sessionManager.load(targetPath);
      const session = this.sessionManager.session;

      const phases = {};
      for (const [phaseType, phaseState] of session.phases) {
        phases[phaseType] = {
          status: phaseState.status,
          artifacts: phaseState.artifacts
        };
      }

      return {
        currentPhase: session.currentPhase,
        phases,
        nextAction: this._getNextAction(session.currentPhase)
      };
    } catch (error) {
      return {
        currentPhase: null,
        phases: {},
        nextAction: 'init',
        message: 'No session found'
      };
    }
  }

  /**
   * Handle plan method
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async handlePlan(params) {
    try {
      await this.sessionManager.load(this.projectPath);

      // Check if spec phase is complete
      const specPhase = this.sessionManager.session.phases.get(PhaseType.SPECIFY);
      if (!specPhase || specPhase.status !== 'complete') {
        return {
          status: 'error',
          message: 'Specification phase must be completed first'
        };
      }

      return {
        status: 'success',
        planPath: '.speckit/plan.md',
        researchPath: '.speckit/research.md'
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Handle tasks method
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async handleTasks(params) {
    try {
      await this.sessionManager.load(this.projectPath);

      // Check if plan phase is complete
      const planPhase = this.sessionManager.session.phases.get(PhaseType.PLAN);
      if (!planPhase || planPhase.status !== 'complete') {
        return {
          status: 'error',
          message: 'Planning phase must be completed first'
        };
      }

      return {
        status: 'success',
        tasksPath: '.speckit/tasks.md',
        taskCount: 0 // Would be populated by actual implementation
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Start listening for NDJSON input from stdin
   */
  startListening() {
    let buffer = '';

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      buffer += chunk;

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          this.handleRequest(line).catch(error => {
            JsonRpcResponse.write(
              JsonRpcResponse.internalError(null, error.message)
            );
          });
        }
      }
    });

    process.stdin.on('end', () => {
      // Process any remaining data
      if (buffer.trim()) {
        this.handleRequest(buffer).catch(error => {
          JsonRpcResponse.write(
            JsonRpcResponse.internalError(null, error.message)
          );
        });
      }
    });
  }

  /**
   * Get question text for a question ID
   * @private
   */
  _getQuestionText(questionId) {
    const texts = {
      userType: 'Who is the primary user of this feature?',
      scope: 'What is the scope of this feature?',
      priority: 'What is the priority of this feature?',
      integration: 'How should this feature integrate with existing code?'
    };
    return texts[questionId] || questionId;
  }

  /**
   * Get options for a question ID
   * @private
   */
  _getQuestionOptions(questionId) {
    const options = {
      userType: [
        { value: 'end-user', label: 'End User', description: 'Optimize for simplicity' },
        { value: 'developer', label: 'Developer', description: 'Optimize for flexibility' },
        { value: 'admin', label: 'Administrator', description: 'Optimize for power' },
        { value: 'both', label: 'Both', description: 'Balance all needs' }
      ],
      scope: [
        { value: 'minimal', label: 'Minimal', description: 'Core functionality only' },
        { value: 'standard', label: 'Standard', description: 'Common use cases' },
        { value: 'comprehensive', label: 'Comprehensive', description: 'Full functionality' }
      ],
      priority: [
        { value: 'P1', label: 'P1 Critical', description: 'Core to product' },
        { value: 'P2', label: 'P2 Important', description: 'Significant value' },
        { value: 'P3', label: 'P3 Nice to Have', description: 'Convenience feature' }
      ]
    };
    return options[questionId] || [];
  }

  /**
   * Get next action based on current phase
   * @private
   */
  _getNextAction(currentPhase) {
    const actions = {
      [PhaseType.ONBOARDING]: 'specify',
      [PhaseType.SPECIFY]: 'plan',
      [PhaseType.PLAN]: 'tasks',
      [PhaseType.IMPLEMENT]: 'test',
      [PhaseType.TEST]: 'complete'
    };
    return actions[currentPhase] || 'init';
  }

  /**
   * Slugify a string
   * @private
   */
  _slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
  }
}
