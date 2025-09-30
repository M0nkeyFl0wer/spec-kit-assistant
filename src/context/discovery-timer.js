/**
 * DiscoveryTimer Service
 * Spec: Feature 788 - T031 (FR-017, FR-018, FR-019)
 *
 * 15-minute discovery protocol with GATE phase management
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { ElicitationPhase } from './models/elicitation-phase.js';

export class DiscoveryTimer extends EventEmitter {
  constructor() {
    super();
    this.session = null;
    this.phases = [];
    this.currentPhaseIndex = 0;
  }

  /**
   * Start discovery session with 15-minute budget
   * FR-017, FR-018
   */
  async startDiscovery() {
    const sessionId = randomUUID();

    // Allocate 900 seconds (15 minutes) across GATE phases
    const phaseAllocations = {
      Problem: 240,      // 4 minutes - most important
      Goal: 180,         // 3 minutes
      Approach: 180,     // 3 minutes
      Tradeoffs: 120,    // 2 minutes
      Execution: 180     // 3 minutes
    };

    this.session = {
      sessionId,
      startTime: new Date(),
      budgetMinutes: 15,
      phaseAllocations
    };

    // Initialize first phase (Problem)
    const problemPhase = new ElicitationPhase({
      phaseName: 'Problem',
      timeBudget: phaseAllocations.Problem * 1000 // Convert to ms
    });

    problemPhase.start();
    this.phases = [problemPhase];
    this.currentPhaseIndex = 0;

    // Emit event
    this.emit('discoveryStarted', {
      sessionId,
      startTime: this.session.startTime,
      budgetMinutes: 15
    });

    return {
      sessionId,
      startTime: this.session.startTime,
      budgetMinutes: 15,
      phaseAllocations,
      currentPhase: 'Problem'
    };
  }

  /**
   * Advance to next phase in GATE sequence
   * FR-018
   */
  async advancePhase() {
    if (!this.session) {
      throw new Error('No active discovery session');
    }

    const currentPhase = this.phases[this.currentPhaseIndex];

    // Complete current phase
    if (currentPhase && !currentPhase.endTime) {
      currentPhase.complete();
    }

    // Determine next phase
    const phaseSequence = ['Problem', 'Goal', 'Approach', 'Tradeoffs', 'Execution'];
    const currentPhaseName = currentPhase.phaseName;
    const currentIndex = phaseSequence.indexOf(currentPhaseName);

    if (currentIndex >= phaseSequence.length - 1) {
      // Last phase reached
      return {
        previousPhase: currentPhaseName,
        currentPhase: 'Execution',
        timeSpentInPhase: currentPhase.getDuration()
      };
    }

    const nextPhaseName = phaseSequence[currentIndex + 1];
    const nextPhaseAllocation = this.session.phaseAllocations[nextPhaseName];

    // Create and start next phase
    const nextPhase = new ElicitationPhase({
      phaseName: nextPhaseName,
      timeBudget: nextPhaseAllocation * 1000
    });

    nextPhase.start();
    this.phases.push(nextPhase);
    this.currentPhaseIndex++;

    // Check if previous phase exceeded budget
    if (currentPhase.isOverBudget()) {
      this.emit('phaseTimeWarning', {
        phase: currentPhaseName,
        timeSpent: currentPhase.getDuration(),
        budget: currentPhase.timeBudget
      });
    }

    // Emit event
    this.emit('phaseAdvanced', {
      fromPhase: currentPhaseName,
      toPhase: nextPhaseName,
      timeSpentInPreviousPhase: currentPhase.getDuration()
    });

    return {
      previousPhase: currentPhaseName,
      currentPhase: nextPhaseName,
      timeSpentInPhase: currentPhase.getDuration()
    };
  }

  /**
   * Check remaining time and progress
   * FR-018
   */
  async checkTimeRemaining() {
    if (!this.session) {
      throw new Error('No active discovery session');
    }

    const elapsed = Date.now() - this.session.startTime.getTime();
    const remainingMs = (this.session.budgetMinutes * 60 * 1000) - elapsed;
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

    const totalBudgetMs = this.session.budgetMinutes * 60 * 1000;
    const percentComplete = Math.min(100, (elapsed / totalBudgetMs) * 100);

    const currentPhase = this.phases[this.currentPhaseIndex];

    // Determine warning level
    let warningLevel = 'none';
    if (remainingSeconds < 120) {
      warningLevel = 'critical'; // < 2 minutes
    } else if (remainingSeconds < 300) {
      warningLevel = 'warning'; // < 5 minutes
    }

    return {
      remainingSeconds,
      percentComplete,
      currentPhase: currentPhase.phaseName,
      warningLevel
    };
  }

  /**
   * Enable fast-track mode (skip to Execution)
   * FR-019
   */
  async enableFastTrack() {
    if (!this.session) {
      throw new Error('No active discovery session');
    }

    const currentPhase = this.phases[this.currentPhaseIndex];

    // Complete current phase
    if (!currentPhase.endTime) {
      currentPhase.complete();
    }

    // Determine skipped phases
    const phaseSequence = ['Problem', 'Goal', 'Approach', 'Tradeoffs', 'Execution'];
    const currentIndex = phaseSequence.indexOf(currentPhase.phaseName);
    const skippedPhases = phaseSequence.slice(currentIndex + 1, -1); // Everything except Execution

    // Calculate remaining time for Execution
    const elapsed = Date.now() - this.session.startTime.getTime();
    const remainingMs = (this.session.budgetMinutes * 60 * 1000) - elapsed;
    const executionTimeMinutes = Math.max(1, Math.floor(remainingMs / (60 * 1000)));

    // Jump to Execution phase
    const executionPhase = new ElicitationPhase({
      phaseName: 'Execution',
      timeBudget: remainingMs
    });

    executionPhase.start();
    this.phases.push(executionPhase);
    this.currentPhaseIndex = this.phases.length - 1;

    // Emit event
    this.emit('fastTrackEnabled', {
      skippedPhases,
      executionTimeMinutes
    });

    return {
      fastTrackEnabled: true,
      currentPhase: 'Execution',
      skippedPhases,
      executionTimeMinutes
    };
  }

  /**
   * Complete discovery session
   * Validate: <= 15 minutes (NFR-003)
   */
  async completeDiscovery() {
    if (!this.session) {
      throw new Error('No active discovery session');
    }

    // Complete final phase
    const currentPhase = this.phases[this.currentPhaseIndex];
    if (!currentPhase.endTime) {
      currentPhase.complete();
    }

    const endTime = new Date();
    const totalTimeMs = endTime - this.session.startTime;
    const totalTimeSeconds = Math.floor(totalTimeMs / 1000);

    // Check 15-minute budget compliance (NFR-003)
    const withinBudget = totalTimeSeconds <= 900;

    // Generate phases summary
    const phasesSummary = this.phases.map(phase => ({
      phase: phase.phaseName,
      duration: phase.getDuration(),
      withinBudget: !phase.isOverBudget()
    }));

    // Emit event
    this.emit('discoveryCompleted', {
      sessionId: this.session.sessionId,
      totalTimeSeconds,
      withinBudget,
      phasesCompleted: this.phases.length
    });

    return {
      completed: true,
      totalTimeSeconds,
      withinBudget,
      phasesSummary
    };
  }
}

export default DiscoveryTimer;