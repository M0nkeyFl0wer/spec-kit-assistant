/**
 * ElicitationPhase Model
 * Spec: Feature 788 - Data Model Entity 5
 *
 * Track time-bounded discovery phases with progress and outputs
 */

import { randomUUID } from 'crypto';

export class ElicitationPhase {
  constructor(data = {}) {
    this.phaseName = data.phaseName;
    this.timeBudget = data.timeBudget || 0;
    this.completionStatus = data.completionStatus || false;
    this.contextGathered = data.contextGathered || {};
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.phaseToken = data.phaseToken || randomUUID();

    // Relationships
    this.personaContexts = data.personaContexts || []; // PersonaContext[] for Perspective phase

    this.validate();
  }

  validate() {
    // phaseName must be valid
    const validPhases = ['Problem', 'Perspective', 'Constitution', 'Specification', 'Goal', 'Approach', 'Tradeoffs', 'Execution'];
    if (!validPhases.includes(this.phaseName)) {
      throw new Error(`phaseName must be one of: ${validPhases.join(', ')}`);
    }

    // timeBudget must be positive
    if (this.timeBudget < 0) {
      throw new Error('timeBudget must be non-negative');
    }

    // startTime validation if set
    if (this.startTime !== null && (!(this.startTime instanceof Date) || isNaN(this.startTime.getTime()))) {
      throw new Error('startTime must be a valid Date or null');
    }

    // endTime validation if set
    if (this.endTime !== null && (!(this.endTime instanceof Date) || isNaN(this.endTime.getTime()))) {
      throw new Error('endTime must be a valid Date or null');
    }

    // endTime - startTime must be <= timeBudget for successful completion
    if (this.startTime && this.endTime && this.completionStatus) {
      const duration = this.endTime - this.startTime;
      if (duration > this.timeBudget) {
        console.warn(`Phase ${this.phaseName} exceeded budget: ${duration}ms > ${this.timeBudget}ms`);
      }
    }

    // completionStatus true only if endTime exists
    if (this.completionStatus && !this.endTime) {
      throw new Error('completionStatus cannot be true without endTime');
    }

    return true;
  }

  start() {
    if (this.startTime) {
      throw new Error('Phase already started');
    }

    this.startTime = new Date();
    return this.startTime;
  }

  complete(contextGathered = {}) {
    if (!this.startTime) {
      throw new Error('Phase not started');
    }

    if (this.endTime) {
      throw new Error('Phase already completed');
    }

    this.endTime = new Date();
    this.contextGathered = { ...this.contextGathered, ...contextGathered };

    const duration = this.endTime - this.startTime;

    if (duration <= this.timeBudget) {
      this.completionStatus = true;
    } else {
      this.completionStatus = false;
      console.warn(`Phase ${this.phaseName} overran budget`);
    }

    this.validate();
    return {
      completed: this.completionStatus,
      duration,
      withinBudget: duration <= this.timeBudget
    };
  }

  getDuration() {
    if (!this.startTime) {
      return 0;
    }

    const end = this.endTime || new Date();
    return end - this.startTime;
  }

  getTimeRemaining() {
    const elapsed = this.getDuration();
    return Math.max(0, this.timeBudget - elapsed);
  }

  isOverBudget() {
    return this.getDuration() > this.timeBudget;
  }

  addPersonaContext(personaContext) {
    if (this.phaseName !== 'Perspective') {
      throw new Error('PersonaContext can only be added to Perspective phase');
    }

    this.personaContexts.push(personaContext);
    return this.personaContexts;
  }

  toJSON() {
    return {
      phaseName: this.phaseName,
      timeBudget: this.timeBudget,
      completionStatus: this.completionStatus,
      contextGathered: this.contextGathered,
      startTime: this.startTime ? this.startTime.toISOString() : null,
      endTime: this.endTime ? this.endTime.toISOString() : null,
      phaseToken: this.phaseToken,
      personaContexts: this.personaContexts.map(pc => pc.toJSON ? pc.toJSON() : pc)
    };
  }

  static fromJSON(json) {
    return new ElicitationPhase({
      ...json,
      startTime: json.startTime ? new Date(json.startTime) : null,
      endTime: json.endTime ? new Date(json.endTime) : null
    });
  }
}

export default ElicitationPhase;