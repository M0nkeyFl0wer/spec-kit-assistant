/**
 * PersonaContext Model
 * Spec: Feature 788 - Data Model Entity 4
 *
 * Store context extracted by each persona during multi-perspective discovery
 */

export class PersonaContext {
  constructor(data = {}) {
    this.personaType = data.personaType;
    this.questionsAsked = data.questionsAsked || [];
    this.contextExtracted = data.contextExtracted || [];
    this.uniqueInsights = data.uniqueInsights || [];
    this.timestamp = data.timestamp || new Date();

    this.validate();
  }

  validate() {
    // personaType must be valid
    const validPersonas = ['Security', 'UX', 'Architecture', 'QA'];
    if (!validPersonas.includes(this.personaType)) {
      throw new Error(`personaType must be one of: ${validPersonas.join(', ')}`);
    }

    // Arrays must be arrays
    if (!Array.isArray(this.questionsAsked)) {
      throw new Error('questionsAsked must be an array');
    }

    if (!Array.isArray(this.contextExtracted)) {
      throw new Error('contextExtracted must be an array');
    }

    if (!Array.isArray(this.uniqueInsights)) {
      throw new Error('uniqueInsights must be an array');
    }

    // uniqueInsights must have minimum 2 items (per FR-012)
    if (this.uniqueInsights.length > 0 && this.uniqueInsights.length < 2) {
      console.warn(`PersonaContext ${this.personaType}: uniqueInsights should have >= 2 items (FR-012)`);
    }

    // contextExtracted must be non-empty for completed persona
    if (this.contextExtracted.length === 0 && this.timestamp) {
      console.warn(`PersonaContext ${this.personaType}: contextExtracted is empty`);
    }

    // timestamp must be valid
    if (!(this.timestamp instanceof Date) || isNaN(this.timestamp.getTime())) {
      throw new Error('timestamp must be a valid Date');
    }

    return true;
  }

  addQuestion(question) {
    if (typeof question !== 'string' || question.length === 0) {
      throw new Error('question must be a non-empty string');
    }

    this.questionsAsked.push(question);
    return this.questionsAsked;
  }

  addContext(extracted) {
    if (!extracted.question || !extracted.response) {
      throw new Error('Extracted context must have question and response');
    }

    this.contextExtracted.push({
      question: extracted.question,
      response: extracted.response,
      extracted: extracted.extracted || {},
      timestamp: new Date()
    });

    return this.contextExtracted;
  }

  addUniqueInsight(insight) {
    if (typeof insight !== 'string' || insight.length === 0) {
      throw new Error('insight must be a non-empty string');
    }

    this.uniqueInsights.push(insight);
    return this.uniqueInsights;
  }

  finalize() {
    this.timestamp = new Date();
    this.validate();
    return this;
  }

  toJSON() {
    return {
      personaType: this.personaType,
      questionsAsked: this.questionsAsked,
      contextExtracted: this.contextExtracted,
      uniqueInsights: this.uniqueInsights,
      timestamp: this.timestamp.toISOString()
    };
  }

  static fromJSON(json) {
    return new PersonaContext({
      ...json,
      timestamp: new Date(json.timestamp)
    });
  }
}

export default PersonaContext;