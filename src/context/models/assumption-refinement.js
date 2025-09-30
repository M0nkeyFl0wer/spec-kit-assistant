/**
 * AssumptionRefinement Model
 * Spec: Feature 788 - Data Model Entity 6
 *
 * Track Socratic refinement loop iterations as vague requirements are refined
 */

export class AssumptionRefinement {
  constructor(data = {}) {
    this.vagueInput = data.vagueInput || '';
    this.assumptionIdentified = data.assumptionIdentified || '';
    this.userConfirmation = data.userConfirmation || false;
    this.refinedContext = data.refinedContext || '';
    this.iterationNumber = data.iterationNumber || 1;
    this.isTestable = data.isTestable || false;
    this.probeQuestion = data.probeQuestion || '';

    // State tracking
    this.state = data.state || 'identified'; // identified, confirmed/rejected, refined

    this.validate();
  }

  validate() {
    // iterationNumber must be <= 3 (per NFR-007)
    if (this.iterationNumber < 1 || this.iterationNumber > 3) {
      throw new Error('iterationNumber must be between 1 and 3 (NFR-007)');
    }

    // refinedContext should have numeric or verifiable criteria when isTestable is true
    if (this.isTestable && this.refinedContext) {
      const hasNumericCriteria = /\d+/.test(this.refinedContext);
      const hasVerifiableCriteria = /(<|>|<=|>=|=|must|should|will|within|under|over)/i.test(this.refinedContext);

      if (!hasNumericCriteria && !hasVerifiableCriteria) {
        console.warn('Testable refinedContext should contain numeric or verifiable criteria');
      }
    }

    // State validation
    const validStates = ['identified', 'confirmed', 'rejected', 'refined'];
    if (!validStates.includes(this.state)) {
      throw new Error(`state must be one of: ${validStates.join(', ')}`);
    }

    return true;
  }

  confirm(userResponse) {
    if (this.state !== 'identified') {
      throw new Error('Can only confirm assumptions in identified state');
    }

    this.userConfirmation = true;
    this.state = 'confirmed';

    return this;
  }

  reject() {
    if (this.state !== 'identified') {
      throw new Error('Can only reject assumptions in identified state');
    }

    this.userConfirmation = false;
    this.state = 'rejected';

    return this;
  }

  refine(refinedContext) {
    if (this.state !== 'confirmed' && this.state !== 'identified') {
      throw new Error('Can only refine confirmed or identified assumptions');
    }

    this.refinedContext = refinedContext;
    this.state = 'refined';

    // Auto-detect if testable
    this.isTestable = this.checkTestability(refinedContext);

    this.validate();
    return this;
  }

  checkTestability(context) {
    // Criteria for testability:
    // 1. Contains numeric values
    // 2. Contains comparison operators
    // 3. Contains measurable terms
    const hasNumeric = /\d+/.test(context);
    const hasComparison = /(<|>|<=|>=|=)/.test(context);
    const hasMeasurable = /(under|over|within|between|at least|at most|exactly|must|should)/i.test(context);

    return hasNumeric || (hasComparison && hasMeasurable);
  }

  incrementIteration(newProbeQuestion) {
    if (this.iterationNumber >= 3) {
      throw new Error('Maximum iterations (3) reached per NFR-007');
    }

    this.iterationNumber++;
    if (newProbeQuestion) {
      this.probeQuestion = newProbeQuestion;
    }

    this.validate();
    return this.iterationNumber;
  }

  isMaxIterations() {
    return this.iterationNumber >= 3;
  }

  toJSON() {
    return {
      vagueInput: this.vagueInput,
      assumptionIdentified: this.assumptionIdentified,
      userConfirmation: this.userConfirmation,
      refinedContext: this.refinedContext,
      iterationNumber: this.iterationNumber,
      isTestable: this.isTestable,
      probeQuestion: this.probeQuestion,
      state: this.state
    };
  }

  static fromJSON(json) {
    return new AssumptionRefinement(json);
  }
}

export default AssumptionRefinement;