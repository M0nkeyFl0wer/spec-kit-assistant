/**
 * T026: Enhanced consultation engine implementation - Deployed to Seshat
 * Provides multi-phase project discovery with side quest handling
 * Integrates with ConsultationSession model and swarm orchestrator
 *
 * T033-T035: Context engineering integration (FR-021)
 */

import { ConsultationSession } from '../core/consultation-session.js';
import GATEElicitor from '../context/gate-elicitor.js';
import PersonaRotator from '../context/persona-rotator.js';
import SocraticRefiner from '../context/socratic-refiner.js';

export class EnhancedConsultationEngine {
  constructor() {
    this.session = null;
    this.spec = null; // Character reference
    this.conversationState = {
      active: false,
      phase: 'idle',
      currentQuestion: null,
      awaitingResponse: false
    };
    this.sideQuestCount = 0;
    this.currentFocus = 'main-mission';
    this.projectContext = new Map();
    this.swarmIntegration = null;

    // Context engineering integration (T033-T035)
    this.gateElicitor = new GATEElicitor();
    this.personaRotator = new PersonaRotator();
    this.socraticRefiner = new SocraticRefiner();
    this.contextEngineeringEnabled = true;
  }

  /**
   * Start project discovery session
   * @param {string} projectVision - Initial project vision
   * @param {Object} options - Discovery options
   * @returns {Object} First discovery question
   */
  async startProjectDiscovery(projectVision, options = {}) {
    this.session = new ConsultationSession();
    this.conversationState.active = true;
    this.conversationState.phase = 'discovery';

    // Initialize project context
    this.projectContext.set('vision', projectVision);
    this.projectContext.set('startTime', new Date());
    this.projectContext.set('options', options);

    return this.session.startProjectDiscovery(projectVision);
  }

  /**
   * Ask the first big question
   * @returns {Object} Project type exploration question
   */
  askTheFirstBigQuestion() {
    if (!this.session) {
      throw new Error('Must start project discovery first');
    }

    this.conversationState.currentQuestion = 'project_type';
    this.conversationState.awaitingResponse = true;

    return this.session.askTheFirstBigQuestion();
  }

  /**
   * Discover project magic through iterative questioning
   * @param {string} projectType - Selected project type
   * @returns {Object} Next discovery step
   */
  async discoverProjectMagic(projectType) {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    // Handle project type response
    const typeResult = this.session.handleProjectTypeResponse(projectType);
    this.projectContext.set('type', projectType);

    // Continue to special feature discovery
    this.conversationState.currentQuestion = 'special_feature';
    return typeResult;
  }

  /**
   * Handle side quest when user gets distracted or confused
   * @param {string} questType - Type of side quest
   * @param {Object} context - Side quest context
   * @returns {Object} Side quest handling response
   */
  handleSideQuest(questType, context = {}) {
    this.sideQuestCount++;
    
    const sideQuest = {
      id: this.sideQuestCount,
      type: questType,
      context,
      timestamp: new Date()
    };

    // Store current state before side quest
    const previousFocus = this.currentFocus;
    this.currentFocus = 'side-quest-' + questType;

    // Handle the specific side quest
    return this.session.handleSideQuest(questType, {
      ...context,
      previousFocus,
      questId: sideQuest.id
    });
  }

  /**
   * Handle uncertainty side quest
   * @param {Object} context - Uncertainty context
   * @returns {Object} Uncertainty support response
   */
  handleUncertainty(context = {}) {
    return this.handleSideQuest('uncertainty', {
      ...context,
      supportType: 'clarification',
      needsExamples: true
    });
  }

  /**
   * Help explore project types when user is confused
   * @returns {Object} Project type guidance
   */
  helpExploreProjectTypes() {
    return this.handleSideQuest('project_type_exploration', {
      needsGuidance: true,
      showExamples: true
    });
  }

  /**
   * Help with timeline confusion
   * @returns {Object} Timeline guidance
   */
  helpWithTimeline() {
    return this.handleSideQuest('timeline_confusion', {
      needsTimelineHelp: true,
      showTimelineExamples: true
    });
  }

  /**
   * Return to main mission from side quest
   * @returns {Object} Return to main status
   */
  returnToMainMission() {
    const result = this.session.returnToMainMission();
    this.currentFocus = 'main-mission';
    
    return {
      ...result,
      message: '🐕 Back to our main mission! Where were we?',
      currentQuestion: this.conversationState.currentQuestion
    };
  }

  /**
   * Ask about technical choices with reasoning capture
   * @returns {Object} Technical choices question
   */
  askTechnicalChoices() {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    this.conversationState.currentQuestion = 'technical_choices';
    return this.session.askTechnicalChoices();
  }

  /**
   * Probe technical choice reasoning
   * @param {string} choice - Technical choice made
   * @param {string} reasoning - User's reasoning
   * @returns {Object} Reasoning capture result
   */
  probeTehnicalChoice(choice, reasoning) {
    this.projectContext.set('technicalChoice_' + choice, {
      choice,
      reasoning,
      timestamp: new Date(),
      validated: this.validateTechnicalChoice(choice, reasoning)
    });

    return {
      choiceCaptured: choice,
      reasoning,
      needsMoreDetail: reasoning.length < 50,
      suggestedProbe: this.suggestTechnicalProbe(choice, reasoning)
    };
  }

  /**
   * Validate technical choice for consistency
   * @param {string} choice - Technical choice
   * @param {string} reasoning - Reasoning provided
   * @returns {Object} Validation results
   */
  validateTechnicalChoice(choice, reasoning) {
    const projectType = this.projectContext.get('type');
    const timeline = this.projectContext.get('timeline');

    const validation = {
      consistent: true,
      concerns: [],
      suggestions: []
    };

    // Basic consistency checks
    if (projectType === 'mobile-app' && choice.includes('React') && !choice.includes('Native')) {
      validation.concerns.push('Consider React Native for mobile development');
    }

    if (timeline === 'mvp' && choice.includes('microservices')) {
      validation.concerns.push('Microservices might be complex for MVP timeline');
    }

    return validation;
  }

  /**
   * Suggest follow-up probe for technical choice
   * @param {string} choice - Technical choice
   * @param {string} reasoning - Current reasoning
   * @returns {string} Suggested probe question
   */
  suggestTechnicalProbe(choice, reasoning) {
    if (reasoning.length < 30) {
      return '🐕 Can you tell me a bit more about why that choice feels right?';
    }

    if (choice.includes('database')) {
      return '🐕 What kind of data will you be storing? How much growth do you expect?';
    }

    if (choice.includes('framework')) {
      return '🐕 What\'s your team\'s experience level with that framework?';
    }

    return '🐕 Are there any specific requirements that influenced this choice?';
  }

  /**
   * Deploy debug swarm for technical issues
   * @param {Object} technicalIssue - Issue description
   * @returns {Object} Swarm deployment result
   */
  async deployDebugSwarm(technicalIssue) {
    if (!this.swarmIntegration) {
      return {
        error: 'Swarm integration not available',
        fallback: '🐕 Let me help you troubleshoot this step by step.'
      };
    }

    try {
      const swarmResult = await this.swarmIntegration.deployDebugSwarm({
        issue: technicalIssue,
        context: Object.fromEntries(this.projectContext),
        sessionId: this.session?.sessionId
      });

      return {
        swarmDeployed: true,
        swarmId: swarmResult.swarmId,
        message: '🐕 I\'ve deployed a debug swarm to help investigate this!',
        nextSteps: swarmResult.recommendations
      };

    } catch (error) {
      return {
        swarmDeployError: error.message,
        fallback: '🐕 Swarm deployment failed, but let me help you directly.'
      };
    }
  }

  /**
   * Handle technical issues with swarm integration
   * @param {Object} issue - Technical issue details
   * @returns {Object} Issue handling response
   */
  async handleTechnicalIssue(issue) {
    const debugChoice = {
      swarm: 'Deploy debug swarm to investigate',
      log: 'Log the error and continue',
      retry: 'Try a different approach',
      skip: 'Skip this step for now'
    };

    // Automatically deploy swarm for complex issues
    if (issue.complexity === 'high' || issue.type === 'architecture') {
      return this.deployDebugSwarm(issue);
    }

    return {
      issue,
      choices: debugChoice,
      recommendation: this.recommendTechnicalAction(issue)
    };
  }

  /**
   * Recommend technical action based on issue type
   * @param {Object} issue - Issue details
   * @returns {string} Recommended action
   */
  recommendTechnicalAction(issue) {
    if (issue.type === 'performance') {
      return 'swarm'; // Performance issues benefit from swarm analysis
    }

    if (issue.type === 'integration') {
      return 'swarm'; // Complex integrations benefit from swarm
    }

    if (issue.type === 'simple_config') {
      return 'retry'; // Simple issues can be retried
    }

    return 'log'; // Default to logging and continuing
  }

  /**
   * Generate awesome specification from discovery
   * @returns {Object} Generated specification
   */
  async generateAwesomeSpec() {
    if (!this.session) {
      throw new Error('No active session');
    }

    const spec = this.session.generateAwesomeSpec();

    if (spec.error) {
      return {
        error: spec.error,
        suggestion: '🐕 Let\'s finish the discovery process first!',
        missing: spec.missing
      };
    }

    // Enhance spec with consultation insights
    const enhancedSpec = {
      ...spec,
      consultation_quality: this.assessConsultationQuality(),
      recommendations: this.generateRecommendations(),
      next_steps: this.generateNextSteps(spec)
    };

    this.conversationState.phase = 'completed';
    return enhancedSpec;
  }

  /**
   * Create simple spec as fallback
   * @returns {Object} Simple specification
   */
  createSimpleSpec() {
    const vision = this.projectContext.get('vision') || 'Untitled Project';
    const type = this.projectContext.get('type') || 'web-app';

    return {
      project: vision,
      type,
      timeline: 'mvp',
      special_feature: 'To be determined',
      consultation_method: 'simplified',
      note: '🐕 This is a simplified spec. We can enhance it anytime!'
    };
  }

  /**
   * Assess consultation quality
   * @returns {Object} Quality assessment
   */
  assessConsultationQuality() {
    const sessionSummary = this.session?.getSessionSummary() || {};

    return {
      completeness: sessionSummary.discoveryProgress ? 
        Object.values(sessionSummary.discoveryProgress).filter(Boolean).length : 0,
      depth: this.projectContext.size,
      sideQuestHandling: this.sideQuestCount,
      timeSpent: sessionSummary.duration || 0,
      rating: this.calculateQualityRating()
    };
  }

  /**
   * Calculate overall consultation quality rating
   * @returns {string} Quality rating
   */
  calculateQualityRating() {
    const contextSize = this.projectContext.size;
    const sideQuestRatio = this.sideQuestCount / Math.max(contextSize, 1);

    if (contextSize >= 8 && sideQuestRatio < 0.5) {
      return 'excellent';
    } else if (contextSize >= 5 && sideQuestRatio < 0.8) {
      return 'good';
    } else if (contextSize >= 3) {
      return 'adequate';
    } else {
      return 'needs_improvement';
    }
  }

  /**
   * Generate recommendations based on consultation
   * @returns {Array} Recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const projectType = this.projectContext.get('type');
    const timeline = this.projectContext.get('timeline');

    if (timeline === 'mvp') {
      recommendations.push('Focus on core features first');
      recommendations.push('Plan for iterative development');
    }

    if (this.sideQuestCount > 3) {
      recommendations.push('Consider breaking down complex requirements');
    }

    return recommendations;
  }

  /**
   * Generate next steps for implementation
   * @param {Object} spec - Generated specification
   * @returns {Array} Next steps
   */
  generateNextSteps(spec) {
    return [
      'Review and validate the specification',
      'Set up development environment',
      'Create initial project structure',
      'Begin implementation of core features'
    ];
  }

  /**
   * Set swarm integration for debug deployment
   * @param {Object} swarmIntegration - Swarm integration instance
   */
  setSwarmIntegration(swarmIntegration) {
    this.swarmIntegration = swarmIntegration;
  }

  /**
   * Get session summary and metrics
   * @returns {Object} Session summary
   */
  getSessionSummary() {
    return {
      session: this.session?.getSessionSummary(),
      consultation: {
        sideQuestCount: this.sideQuestCount,
        currentFocus: this.currentFocus,
        conversationState: this.conversationState,
        projectContextSize: this.projectContext.size
      }
    };
  }

  /**
   * Start GATE-based discovery (T033: FR-021, FR-007)
   * Problem-first approach replaces feature-first
   */
  async startGATEDiscovery(projectVision) {
    if (!this.contextEngineeringEnabled) {
      return this.startProjectDiscovery(projectVision);
    }

    // Use GATE elicitor for problem-first discovery
    const gateResult = await this.gateElicitor.startProblemDiscovery({
      userVision: projectVision
    });

    this.conversationState.phase = 'gate-problem';
    this.projectContext.set('gatePhase', 'Problem');

    return {
      questions: gateResult.problemQuestions,
      phase: gateResult.phase,
      message: 'Starting GATE problem-first discovery'
    };
  }

  /**
   * Enrich context with multi-persona perspectives (T034: FR-021, FR-011)
   */
  async enrichWithPersonas(context) {
    if (!this.contextEngineeringEnabled) {
      return context;
    }

    let enrichedContext = context;

    // Rotate through 4 personas for comprehensive coverage
    for (let i = 0; i < 4; i++) {
      const persona = await this.personaRotator.getNextPersona();
      const enrichment = await this.personaRotator.enrichContext({
        context: enrichedContext,
        persona
      });

      enrichedContext = enrichment.enrichedContext;

      console.log(`Enriched with ${persona.role} perspective (+${enrichment.addedInsights.length} insights)`);
    }

    return enrichedContext;
  }

  /**
   * Refine requirements with Socratic questioning (T035: FR-021, FR-014)
   */
  async refineWithSocratic(requirements) {
    if (!this.contextEngineeringEnabled) {
      return requirements;
    }

    // Detect assumptions
    const detected = await this.socraticRefiner.detectAssumptions({ requirements });

    const refinedRequirements = [];

    // Refine each assumption
    for (const assumption of detected.assumptions) {
      const question = await this.socraticRefiner.generateProbingQuestion({ assumption });

      // In real usage, would prompt user. For now, simulate refinement
      const refinement = await this.socraticRefiner.refineAssumption({
        assumption,
        userResponse: 'User would provide specific criteria here'
      });

      refinedRequirements.push(refinement.explicitRequirement);
    }

    return refinedRequirements;
  }
}
