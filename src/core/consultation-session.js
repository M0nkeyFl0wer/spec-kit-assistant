/**
 * T022: ConsultationSession model - Deployed to Seshat for CPU management
 * Manages multi-phase consultation with enhanced discovery and side quest handling
 * Based on data-model.md specification and constitutional requirements
 */

export class ConsultationSession {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
    this.currentPhase = 'initialization';
    this.conversationState = {
      mainMission: null,
      currentFocus: null,
      depth: 0,
      completed: false
    };
    
    this.projectContext = {
      vision: '',
      type: null,
      timeline: null,
      specialFeature: null,
      deepContext: {
        problem: null,
        audience: null,
        emotion: null
      },
      technicalChoices: new Map(),
      risks: []
    };

    this.sideQuests = [];
    this.sideQuestCount = 0;
    this.discoveryProgress = {
      projectType: false,
      specialFeature: false,
      timeline: false,
      deepDive: false,
      technicalChoices: false
    };

    this.consultationHistory = [];
    this.currentFocus = 'main-mission';
  }

  generateSessionId() {
    return 'consultation-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  startProjectDiscovery(initialVision) {
    this.projectContext.vision = initialVision;
    this.currentPhase = 'discovery';
    this.conversationState.mainMission = 'Discover project magic and create awesome spec';
    this.conversationState.currentFocus = 'project-discovery';
    
    this.addToHistory('project_discovery_start', { vision: initialVision });
    return this.askTheFirstBigQuestion();
  }

  askTheFirstBigQuestion() {
    const question = {
      type: 'project_exploration',
      question: '🐕 What kind of project magic are we creating?',
      options: {
        'web-app': 'A web application (frontend + backend)',
        'mobile-app': 'A mobile app',
        'api': 'An API or backend service', 
        'library': 'A library or package',
        'agent-swarm': 'An AI agent swarm system',
        'other': 'Something else entirely'
      },
      followUp: 'Tell me more about what makes this special!'
    };

    this.addToHistory('first_big_question', question);
    return question;
  }

  handleProjectTypeResponse(response) {
    this.projectContext.type = response;
    this.discoveryProgress.projectType = true;
    
    this.addToHistory('project_type_selected', { type: response });
    return this.askWhatMakesItSpecial();
  }

  askWhatMakesItSpecial() {
    const question = {
      type: 'special_feature_discovery',
      question: '🐕 What makes this project special? What\'s the one thing that will make users go "wow"?',
      guidance: 'Think about the core feature that sets this apart from everything else.',
      examples: [
        'Real-time collaboration that feels magical',
        'AI that actually understands context',
        'Performance that\'s 10x faster than anything else',
        'UX so intuitive it feels like mind-reading'
      ]
    };

    this.addToHistory('special_feature_question', question);
    return question;
  }

  handleSpecialFeatureResponse(response) {
    this.projectContext.specialFeature = response;
    this.discoveryProgress.specialFeature = true;
    
    this.addToHistory('special_feature_captured', { feature: response });
    return this.probeDeeper();
  }

  probeDeeper() {
    const deeperQuestions = {
      type: 'deep_dive',
      questions: [
        {
          id: 'problem',
          question: '🐕 What problem does this solve that keeps people up at night?',
          purpose: 'Understand the core problem'
        },
        {
          id: 'audience', 
          question: '🐕 Who are we building this for? Paint me a picture of your ideal user.',
          purpose: 'Define target audience'
        },
        {
          id: 'emotion',
          question: '🐕 How do you want users to FEEL when they use this?',
          purpose: 'Capture emotional goal'
        }
      ]
    };

    this.addToHistory('deep_dive_start', deeperQuestions);
    return deeperQuestions;
  }

  handleDeepDiveResponse(questionId, response) {
    this.projectContext.deepContext[questionId] = response;
    
    this.addToHistory('deep_dive_response', { questionId, response });
    
    // Check if deep dive is complete
    const deepContextComplete = Object.values(this.projectContext.deepContext)
      .every(value => value !== null);
      
    if (deepContextComplete) {
      this.discoveryProgress.deepDive = true;
      return this.askTimeline();
    }
    
    return { needsMoreDeepDive: true };
  }

  askTimeline() {
    const question = {
      type: 'timeline_exploration',
      question: '🐕 What\'s the timeline? Are we building an MVP, a full product, or something in between?',
      options: {
        'mvp': 'MVP - Get something working quickly (2-4 weeks)',
        'beta': 'Beta version - Solid foundation with key features (2-3 months)', 
        'v1': 'Version 1.0 - Production-ready with full feature set (3-6 months)',
        'enterprise': 'Enterprise-grade - Comprehensive solution (6+ months)'
      }
    };

    this.addToHistory('timeline_question', question);
    return question;
  }

  handleTimelineResponse(response) {
    this.projectContext.timeline = response;
    this.discoveryProgress.timeline = true;
    
    this.addToHistory('timeline_selected', { timeline: response });
    return this.askTechnicalChoices();
  }

  askTechnicalChoices() {
    const question = {
      type: 'technical_reasoning',
      question: '🐕 Any technical preferences or constraints I should know about?',
      areas: [
        'Programming language preferences',
        'Database requirements', 
        'Hosting/deployment constraints',
        'Performance requirements',
        'Integration needs',
        'Team skill preferences'
      ],
      note: 'Don\'t worry if you\'re not sure - we can figure this out together!'
    };

    this.addToHistory('technical_choices_question', question);
    return question;
  }

  handleTechnicalChoicesResponse(choices) {
    this.projectContext.technicalChoices.set('preferences', choices);
    this.discoveryProgress.technicalChoices = true;
    
    this.addToHistory('technical_choices_captured', { choices });
    return this.generateAwesomeSpec();
  }

  // Side quest handling methods
  handleSideQuest(questType, context) {
    this.sideQuestCount++;
    const sideQuest = {
      id: this.sideQuestCount,
      type: questType,
      context,
      startTime: new Date(),
      completed: false,
      result: null
    };

    this.sideQuests.push(sideQuest);
    this.conversationState.depth++;
    
    this.addToHistory('side_quest_start', sideQuest);
    
    return this.handleSpecificSideQuest(questType, context);
  }

  handleSpecificSideQuest(questType, context) {
    switch (questType) {
      case 'uncertainty':
        return this.handleUncertainty(context);
      case 'project_type_exploration':
        return this.helpExploreProjectTypes();
      case 'timeline_confusion':
        return this.helpWithTimeline();
      case 'technical_overwhelm':
        return this.simplifyTechnicalChoices();
      default:
        return this.genericSideQuestHelp(questType, context);
    }
  }

  handleUncertainty(context) {
    return {
      type: 'uncertainty_support',
      message: '🐕 No worries! Uncertainty is totally normal. Let\'s break this down into smaller pieces.',
      options: {
        'break_down': 'Help me break this down step by step',
        'examples': 'Show me some examples',
        'skip_for_now': 'Skip this for now, come back later',
        'get_help': 'I need more help understanding this'
      }
    };
  }

  helpExploreProjectTypes() {
    return {
      type: 'project_type_help',
      message: '🐕 Let me help you figure out what type of project this is!',
      guidance: {
        'web-app': 'Users interact through a browser, has both frontend and backend',
        'mobile-app': 'Users download and install on their phone/tablet',
        'api': 'Other applications connect to it, no direct user interface',
        'library': 'Developers use it in their own projects',
        'agent-swarm': 'AI agents work together to accomplish complex tasks'
      },
      followUp: 'Which one sounds closest to what you\'re thinking?'
    };
  }

  returnToMainMission() {
    if (this.sideQuests.length > 0) {
      const currentSideQuest = this.sideQuests[this.sideQuests.length - 1];
      currentSideQuest.completed = true;
      currentSideQuest.endTime = new Date();
      
      this.conversationState.depth--;
      this.addToHistory('side_quest_completed', currentSideQuest);
    }

    this.conversationState.currentFocus = this.conversationState.mainMission;
    return { returnedToMain: true, currentFocus: this.conversationState.currentFocus };
  }

  generateAwesomeSpec() {
    const allDiscoveryComplete = Object.values(this.discoveryProgress)
      .every(progress => progress === true);

    if (!allDiscoveryComplete) {
      return { error: 'Discovery not complete', missing: this.getMissingDiscovery() };
    }

    const spec = {
      project: this.projectContext.vision,
      type: this.projectContext.type,
      timeline: this.projectContext.timeline,
      special_feature: this.projectContext.specialFeature,
      deep_context: this.projectContext.deepContext,
      technical_choices: Object.fromEntries(this.projectContext.technicalChoices),
      side_quests_completed: this.sideQuestCount,
      discovery_quality: this.calculateDiscoveryQuality()
    };

    this.conversationState.completed = true;
    this.addToHistory('spec_generated', spec);
    
    return spec;
  }

  calculateDiscoveryQuality() {
    let score = 0;
    
    // Base discovery completion
    if (this.discoveryProgress.projectType) score += 20;
    if (this.discoveryProgress.specialFeature) score += 25;
    if (this.discoveryProgress.deepDive) score += 30;
    if (this.discoveryProgress.timeline) score += 15;
    if (this.discoveryProgress.technicalChoices) score += 10;
    
    return score;
  }

  getMissingDiscovery() {
    return Object.entries(this.discoveryProgress)
      .filter(([key, completed]) => !completed)
      .map(([key]) => key);
  }

  addToHistory(action, data) {
    this.consultationHistory.push({
      timestamp: new Date(),
      action,
      data,
      phase: this.currentPhase,
      sideQuestActive: this.conversationState.depth > 0
    });
  }

  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      duration: new Date() - this.startTime,
      phase: this.currentPhase,
      completed: this.conversationState.completed,
      sideQuestsHandled: this.sideQuestCount,
      discoveryProgress: this.discoveryProgress,
      historyLength: this.consultationHistory.length
    };
  }
}

export default ConsultationSession;
