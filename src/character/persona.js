/**
 * T025: Character system implementation
 * Implements Spec the Golden Retriever personality with context awareness
 * Integrates with CharacterPersona model and animation engine
 */

import { CharacterPersona } from '../core/character-persona.js';

export class SpecCharacterSystem {
  constructor() {
    this.persona = CharacterPersona.createSpecPersona();
    this.currentState = 'happy';
    this.contextMemory = new Map();
    this.animationEngine = null;
    this.responseFilters = new Map();

    // Initialize response filters for personality consistency
    this.initializeResponseFilters();
  }

  /**
   * Initialize response filters to maintain personality
   */
  initializeResponseFilters() {
    // Filter for "not cringe" - tone down over-enthusiasm
    this.responseFilters.set('anti_cringe', (text) => {
      return text
        .replace(/!!!+/g, '!')
        .replace(/AMAZING AMAZING/gi, 'really great')
        .replace(/SUPER DUPER/gi, 'really')
        .replace(/ABSOLUTELY INCREDIBLE/gi, 'excellent')
        .replace(/MIND-BLOWING/gi, 'impressive');
    });

    // Filter for honesty - add appropriate hedging
    this.responseFilters.set('honesty', (text) => {
      if (text.includes('perfect') || text.includes('flawless')) {
        return text.replace(/perfect/gi, 'really good')
                  .replace(/flawless/gi, 'well-designed');
      }
      return text;
    });

    // Filter for friendliness - ensure friendly elements
    this.responseFilters.set('friendliness', (text) => {
      if (!text.includes('🐕') && !text.toLowerCase().includes('woof')) {
        return '🐕 ' + text;
      }
      return text;
    });
  }

  /**
   * Set animation engine for visual integration
   * @param {AnimationEngine} engine - Animation engine instance
   */
  setAnimationEngine(engine) {
    this.animationEngine = engine;
  }

  /**
   * Get contextual response with personality validation
   * @param {string} situation - Current situation
   * @param {Object} context - Additional context
   * @returns {Object} Response with validation results
   */
  async getResponse(situation, context = {}) {
    // Enhance context with current system state
    const enhancedContext = {
      ...context,
      currentState: this.currentState,
      sessionLength: this.persona.interactionHistory.length,
      memoryContext: Object.fromEntries(this.contextMemory)
    };

    // Get base response from persona
    let response = this.persona.getContextualResponse(situation, enhancedContext);

    // Apply personality filters
    response = this.applyResponseFilters(response);

    // Update character state based on situation
    this.updateCharacterState(situation, context);

    // Show character animation if available
    if (this.animationEngine && !this.animationEngine.fallbackMode) {
      try {
        await this.animationEngine.displayCharacter(this.currentState, response);
      } catch (error) {
        // Fallback to text only
        console.log(response);
      }
    } else {
      console.log(response);
    }

    // Validate response and return results
    const validation = this.persona.validateResponse(response);

    return {
      response,
      validation,
      characterState: this.currentState,
      personalityScore: validation.score
    };
  }

  /**
   * Apply response filters for personality consistency
   * @param {string} text - Original response
   * @returns {string} Filtered response
   */
  applyResponseFilters(text) {
    let filteredText = text;

    for (const [filterName, filterFunction] of this.responseFilters) {
      try {
        filteredText = filterFunction(filteredText);
      } catch (error) {
        console.warn(`Response filter ${filterName} failed:`, error.message);
      }
    }

    return filteredText;
  }

  /**
   * Update character emotional state based on context
   * @param {string} situation - Current situation
   * @param {Object} context - Situation context
   */
  updateCharacterState(situation, context) {
    const previousState = this.currentState;

    if (context.isError || context.isWarning) {
      this.currentState = 'concerned';
    } else if (context.isSuccess || context.celebration) {
      this.currentState = 'excited';
    } else if (situation === 'working' || situation === 'processing') {
      this.currentState = 'working';
    } else if (situation === 'thinking' || context.needsThinking) {
      this.currentState = 'thinking';
    } else {
      this.currentState = 'happy';
    }

    // Store state change in memory
    if (previousState !== this.currentState) {
      this.contextMemory.set('lastStateChange', {
        from: previousState,
        to: this.currentState,
        timestamp: new Date(),
        trigger: situation
      });
    }
  }

  /**
   * Handle interactive conversation flow
   * @param {string} userInput - User's input
   * @param {string} expectedResponseType - Expected response type
   * @returns {Object} Conversation response
   */
  async handleConversation(userInput, expectedResponseType = 'general') {
    // Store user input in context
    this.contextMemory.set('lastUserInput', userInput);
    this.contextMemory.set('conversationTurn',
      (this.contextMemory.get('conversationTurn') || 0) + 1);

    // Analyze user input for emotional cues
    const userEmotion = this.analyzeUserEmotion(userInput);
    const responseContext = {
      userEmotion,
      expectedType: expectedResponseType,
      conversationFlow: true
    };

    // Generate appropriate response
    const result = await this.getResponse(expectedResponseType, responseContext);

    // Update interaction history
    this.persona.updateInteractionHistory(userInput, result.response);

    return {
      ...result,
      userEmotion,
      conversationTurn: this.contextMemory.get('conversationTurn')
    };
  }

  /**
   * Analyze user emotional state from input
   * @param {string} input - User input text
   * @returns {string} Detected emotion
   */
  analyzeUserEmotion(input) {
    const lowerInput = input.toLowerCase();

    // Frustration indicators
    if (lowerInput.includes('error') || lowerInput.includes('problem') ||
        lowerInput.includes('broken') || lowerInput.includes('help')) {
      return 'frustrated';
    }

    // Excitement indicators
    if (lowerInput.includes('awesome') || lowerInput.includes('great') ||
        lowerInput.includes('love') || lowerInput.includes('amazing')) {
      return 'excited';
    }

    // Confusion indicators
    if (lowerInput.includes('confused') || lowerInput.includes('understand') ||
        lowerInput.includes('what') || lowerInput.includes('how')) {
      return 'confused';
    }

    // Satisfaction indicators
    if (lowerInput.includes('thanks') || lowerInput.includes('good') ||
        lowerInput.includes('works') || lowerInput.includes('perfect')) {
      return 'satisfied';
    }

    return 'neutral';
  }

  /**
   * Get character visual representation for current state
   * @returns {string} ASCII art for current state
   */
  getVisualRepresentation() {
    return this.persona.getVisualState(this.currentState);
  }

  /**
   * Provide encouragement when user seems stuck
   * @param {Object} context - Current context
   * @returns {Object} Encouragement response
   */
  async provideEncouragement(context = {}) {
    const encouragementContext = {
      ...context,
      needsEncouragement: true,
      supportive: true
    };

    const encouragementPhrases = [
      "You're doing great! Every developer faces challenges.",
      "Don't worry, we'll figure this out together!",
      "Hey, debugging is just problem-solving in disguise.",
      "Take a breath - you've got this!",
      "Remember, every expert was once a beginner."
    ];

    const randomPhrase = encouragementPhrases[
      Math.floor(Math.random() * encouragementPhrases.length)
    ];

    return this.getResponse('encouragement', {
      ...encouragementContext,
      customMessage: randomPhrase
    });
  }

  /**
   * Handle side quest scenarios with focus management
   * @param {string} sideQuestType - Type of side quest
   * @param {Object} context - Side quest context
   * @returns {Object} Side quest response
   */
  async handleSideQuest(sideQuestType, context = {}) {
    // Check if too many side quests are active
    const focusWarning = this.checkFocusManagement();

    const sideQuestContext = {
      ...context,
      sideQuest: true,
      questType: sideQuestType,
      focusWarning
    };

    if (focusWarning) {
      return this.getResponse('focus_management', sideQuestContext);
    }

    return this.getResponse('side_quest', sideQuestContext);
  }

  /**
   * Check if focus management is needed
   * @returns {boolean} true if focus management needed
   */
  checkFocusManagement() {
    const recentSideQuests = this.persona.interactionHistory
      .slice(-10)
      .filter(interaction => interaction.context?.sideQuest);

    return recentSideQuests.length > 3;
  }

  /**
   * Generate personality consistency report
   * @returns {Object} Personality report
   */
  generatePersonalityReport() {
    const baseReport = this.persona.generatePersonalityReport();

    return {
      ...baseReport,
      currentState: this.currentState,
      contextMemorySize: this.contextMemory.size,
      responseFiltersActive: Array.from(this.responseFilters.keys()),
      stateChanges: this.getRecentStateChanges()
    };
  }

  /**
   * Get recent character state changes
   * @returns {Array} Recent state changes
   */
  getRecentStateChanges() {
    const stateChanges = [];
    const lastStateChange = this.contextMemory.get('lastStateChange');

    if (lastStateChange) {
      stateChanges.push(lastStateChange);
    }

    return stateChanges;
  }

  /**
   * Reset character system (preserve personality)
   */
  reset() {
    this.currentState = 'happy';
    this.contextMemory.clear();
    // Don't reset persona - preserve interaction history for learning
  }

  /**
   * Handle special situations with appropriate responses
   * @param {string} specialSituation - Special situation type
   * @param {Object} context - Situation context
   * @returns {Object} Special response
   */
  async handleSpecialSituation(specialSituation, context = {}) {
    const specialResponses = {
      first_time_user: {
        message: "🐕 Hey there! Welcome to the pack! I'm Spec, and I'm here to help you create amazing specifications.",
        state: 'excited'
      },
      technical_error: {
        message: "🐕 Looks like we hit a technical snag. No worries - I've seen this before!",
        state: 'concerned'
      },
      great_success: {
        message: "🐕 Woof woof! That worked perfectly! *happy tail wagging*",
        state: 'excited'
      },
      long_session: {
        message: "🐕 We've been working hard! Want to take a quick break?",
        state: 'concerned'
      }
    };

    const special = specialResponses[specialSituation];
    if (special) {
      this.currentState = special.state;

      if (this.animationEngine) {
        await this.animationEngine.displayCharacter(special.state, special.message);
      } else {
        console.log(special.message);
      }

      return {
        response: special.message,
        characterState: special.state,
        specialSituation: true
      };
    }

    // Default to regular response handling
    return this.getResponse(specialSituation, context);
  }

  /**
   * Create character system with animation integration
   * @param {AnimationEngine} animationEngine - Animation engine
   * @returns {SpecCharacterSystem} Character system
   */
  static async createWithAnimation(animationEngine = null) {
    const characterSystem = new SpecCharacterSystem();

    if (animationEngine) {
      characterSystem.setAnimationEngine(animationEngine);
    }

    return characterSystem;
  }
}

export default SpecCharacterSystem;