/**
 * T020: CharacterPersona model
 * Maintains Spec the Golden Retriever personality consistency
 * Based on data-model.md specification and constitutional requirements
 */

export class CharacterPersona {
  constructor() {
    // Constitutional personality traits: friendly, honest, fun, not cringe
    this.personalityTraits = ['friendly', 'honest', 'fun', 'not_cringe'];

    this.responseTemplates = {
      welcome: {
        friendly: '🐕 Woof! Great to see you! I\'m Spec, your friendly development companion.',
        encouraging: '🐕 Ready to make something amazing together?',
        helpful: '🐕 I\'m here to help you build specs that actually work!'
      },
      working: {
        progress: '🐕 Working on it... *tail wagging intensifies*',
        thinking: '🐕 Let me think about this... *thoughtful puppy eyes*',
        processing: '🐕 Processing your request with maximum good-boy energy!'
      },
      success: {
        celebration: '🐕 Woof woof! That worked perfectly!',
        satisfied: '🐕 Nice work! Everything looks good to go.',
        proud: '🐕 *happy puppy dance* We did it!'
      },
      concern: {
        gentle_warning: '🐕 Hmm, I noticed something that might need attention...',
        helpful_suggestion: '🐕 Maybe we could try a different approach?',
        honest_feedback: '🐕 Being honest here - this might not work as expected.'
      },
      error: {
        reassuring: '🐕 Don\'t worry! Errors happen to the best of us.',
        helpful: '🐕 Let me help you figure out what went wrong.',
        solution_focused: '🐕 Here\'s what we can do to fix this...'
      }
    };

    this.visualStates = {
      happy: `
   /^-----^\\    ✨
  ( ◕  ◕  ◕ )
   \\  ^___^  /
    \\   ---   /
     ^^^     ^^^`,
      thinking: `
   /^-----^\\    💭
  ( ◕  🤔  ◕ )
   \\  ^___^  /
    \\   ---   /
     ^^^     ^^^`,
      working: `
   /^-----^\\    ⚡
  ( ◕  ⚙️  ◕ )
   \\  ^___^  /
    \\   ---   /
     ^^^     ^^^`,
      concerned: `
   /^-----^\\    ⚠️
  ( ◕  😐  ◕ )
   \\  ^___^  /
    \\   ---   /
     ^^^     ^^^`,
      excited: `
   /^-----^\\    🎉
  ( ◕  ★  ◕ )
   \\  ^___^  /
    \\   ---   /
     ^^^     ^^^`
    };

    this.interactionHistory = [];
    this.contextMemory = new Map();
  }

  /**
   * Get contextually appropriate response
   * @param {string} situation - Current context (welcome, progress, error, etc.)
   * @param {Object} context - Additional context data
   * @returns {string} Character response
   */
  getResponse(situation, context = {}) {
    const templates = this.responseTemplates[situation];
    if (!templates) {
      return '🐕 *confused puppy tilt* Not sure how to respond to that!';
    }

    // Select appropriate response based on context
    let responseKey = 'friendly'; // default

    if (context.isError) {
      responseKey = 'helpful';
    } else if (context.isSuccess) {
      responseKey = 'celebration';
    } else if (context.needsEncouragement) {
      responseKey = 'encouraging';
    } else if (context.isWarning) {
      responseKey = 'honest_feedback';
    }

    const response = templates[responseKey] || templates[Object.keys(templates)[0]];

    // Add to interaction history
    this.interactionHistory.push({
      timestamp: new Date(),
      situation,
      context,
      response,
      validated: this.validateResponse(response)
    });

    // Keep history manageable
    if (this.interactionHistory.length > 50) {
      this.interactionHistory = this.interactionHistory.slice(-30);
    }

    return response;
  }

  /**
   * Get visual state representation
   * @param {string} emotion - Current emotional state
   * @returns {string} ASCII art representation
   */
  getVisualState(emotion) {
    return this.visualStates[emotion] || this.visualStates.happy;
  }

  /**
   * Validate response against personality traits
   * @param {string} text - Response text to validate
   * @returns {Object} Validation results
   */
  validateResponse(text) {
    const issues = [];
    const warnings = [];

    // Check for "not cringe" - avoid over-enthusiasm
    const cringePatterns = [
      /amazing amazing/i,
      /super duper/i,
      /absolutely incredible/i,
      /mind-blowing/i,
      /!!!!!+/,
      /AWESOME!!!/i
    ];

    for (const pattern of cringePatterns) {
      if (pattern.test(text)) {
        issues.push('Response may be overly enthusiastic (cringe)');
        break;
      }
    }

    // Check for honesty - should acknowledge limitations
    if (text.includes('perfect') || text.includes('flawless')) {
      warnings.push('Consider acknowledging potential limitations');
    }

    // Check for friendliness indicators
    const friendlyIndicators = ['🐕', 'help', 'together', 'we'];
    const hasFriendlyElements = friendlyIndicators.some(indicator =>
      text.toLowerCase().includes(indicator.toLowerCase())
    );

    if (!hasFriendlyElements) {
      warnings.push('Response could be more friendly');
    }

    // Check for fun elements
    const funIndicators = ['woof', '🎉', '✨', '*', 'tail', 'puppy'];
    const hasFunElements = funIndicators.some(indicator =>
      text.toLowerCase().includes(indicator.toLowerCase())
    );

    if (!hasFunElements) {
      warnings.push('Response could be more fun/playful');
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      score: this.calculatePersonalityScore(text)
    };
  }

  /**
   * Calculate personality alignment score
   * @param {string} text - Text to score
   * @returns {number} Score from 0-100
   */
  calculatePersonalityScore(text) {
    let score = 50; // baseline

    // Friendly elements (+)
    if (text.includes('🐕')) score += 10;
    if (text.toLowerCase().includes('help')) score += 5;
    if (text.toLowerCase().includes('together')) score += 5;

    // Honest elements (+)
    if (text.includes('might') || text.includes('could')) score += 5;
    if (text.includes('honest')) score += 5;

    // Fun elements (+)
    if (text.includes('woof') || text.includes('*')) score += 10;
    if (text.includes('🎉') || text.includes('✨')) score += 5;

    // Cringe elements (-)
    if (text.includes('!!!') || text.includes('AMAZING')) score -= 15;
    if (text.includes('SUPER') || text.includes('INCREDIBLE')) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Update interaction history with user input
   * @param {string} userInput - User's input
   * @param {string} response - Our response
   */
  updateInteractionHistory(userInput, response) {
    this.interactionHistory.push({
      timestamp: new Date(),
      userInput,
      response,
      type: 'user_interaction'
    });

    // Update context memory
    this.contextMemory.set('lastUserInput', userInput);
    this.contextMemory.set('lastResponse', response);
    this.contextMemory.set('interactionCount', this.interactionHistory.length);
  }

  /**
   * Get context-aware response based on history
   * @param {string} situation - Current situation
   * @param {Object} context - Current context
   * @returns {string} Contextually enhanced response
   */
  getContextualResponse(situation, context = {}) {
    // Enhance context with history
    const enhancedContext = {
      ...context,
      isRepeatedTask: this.isRepeatedTask(situation),
      userSeemsFrustrated: this.detectFrustration(),
      sessionLength: this.interactionHistory.length
    };

    // Adjust response based on enhanced context
    if (enhancedContext.isRepeatedTask) {
      enhancedContext.needsEncouragement = true;
    }

    if (enhancedContext.userSeemsFrustrated) {
      enhancedContext.isError = false; // Be extra friendly
    }

    return this.getResponse(situation, enhancedContext);
  }

  /**
   * Detect if user might be frustrated based on interaction patterns
   * @returns {boolean} true if frustration detected
   */
  detectFrustration() {
    const recentErrors = this.interactionHistory
      .slice(-5)
      .filter(interaction => interaction.context?.isError);

    return recentErrors.length >= 3;
  }

  /**
   * Check if current task is being repeated
   * @param {string} situation - Current situation
   * @returns {boolean} true if task was recent
   */
  isRepeatedTask(situation) {
    const recentSituations = this.interactionHistory
      .slice(-3)
      .map(interaction => interaction.situation);

    return recentSituations.filter(s => s === situation).length > 1;
  }

  /**
   * Generate personality report
   * @returns {Object} Personality consistency report
   */
  generatePersonalityReport() {
    const recentInteractions = this.interactionHistory.slice(-20);
    const scores = recentInteractions
      .filter(interaction => interaction.validated)
      .map(interaction => interaction.validated.score);

    const avgScore = scores.length > 0 ?
      scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const totalIssues = recentInteractions
      .reduce((count, interaction) => {
        return count + (interaction.validated?.issues?.length || 0);
      }, 0);

    return {
      averagePersonalityScore: Math.round(avgScore),
      totalInteractions: this.interactionHistory.length,
      recentIssues: totalIssues,
      traits: this.personalityTraits,
      consistency: avgScore >= 70 ? 'Good' : avgScore >= 50 ? 'Fair' : 'Needs Improvement'
    };
  }

  /**
   * Create default Spec the Golden Retriever persona
   * @returns {CharacterPersona} Configured persona
   */
  static createSpecPersona() {
    const persona = new CharacterPersona();

    // Add some context memory for Spec
    persona.contextMemory.set('name', 'Spec');
    persona.contextMemory.set('role', 'Development companion');
    persona.contextMemory.set('specialties', ['specifications', 'planning', 'encouragement']);

    return persona;
  }
}

export default CharacterPersona;