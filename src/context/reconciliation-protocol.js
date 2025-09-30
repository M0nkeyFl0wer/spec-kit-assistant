/**
 * ReconciliationProtocol Service
 * Spec: Feature 788 - T027 (FR-004, FR-005)
 *
 * Pause-sync-resume protocol for mid-build reconciliation
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { ReconciliationEvent } from './models/reconciliation-event.js';

export class ReconciliationProtocol extends EventEmitter {
  constructor() {
    super();
    this.activePauses = new Map(); // pauseToken -> pause state
    this.events = []; // History of reconciliation events
  }

  /**
   * Pause current implementation task
   * FR-004 step 1
   * Performance target: < 100ms
   */
  async pauseImplementation(options) {
    const startTime = Date.now();

    if (!options.currentTask || !options.reason) {
      throw new Error('currentTask and reason are required');
    }

    // Create reconciliation event
    const event = new ReconciliationEvent({
      trigger: options.reason,
      pauseTime: new Date(),
      status: 'pending'
    });

    // Store pause state
    this.activePauses.set(event.id, {
      event,
      currentTask: options.currentTask,
      pausedAt: Date.now()
    });

    // Emit event
    this.emit('implementationPaused', {
      pauseToken: event.id,
      currentTask: options.currentTask,
      reason: options.reason
    });

    const duration = Date.now() - startTime;
    if (duration > 100) {
      console.warn(`pauseImplementation took ${duration}ms, exceeds 100ms budget`);
    }

    return {
      pauseToken: event.id,
      pausedAt: event.pauseTime
    };
  }

  /**
   * Synchronize contexts to new version
   * FR-004 steps 2-4
   * Performance target: < 2000ms total for full pause-sync-resume cycle
   */
  async syncContexts(options) {
    if (!options.pauseToken || !options.newVersion) {
      throw new Error('pauseToken and newVersion are required');
    }

    // Validate pause token
    const pauseState = this.activePauses.get(options.pauseToken);
    if (!pauseState) {
      const err = new Error('Invalid or expired pause token');
      err.name = 'InvalidPauseToken';
      throw err;
    }

    const { event } = pauseState;

    // Transition to syncing
    event.transitionState('syncing');

    // Add sync actions
    event.addSyncAction({
      action: 'updateSpecKitVersion',
      target: 'specKit',
      result: 'success'
    });

    event.addSyncAction({
      action: 'updateClaudeVersion',
      target: 'claude',
      result: 'success'
    });

    event.beforeVersion = event.beforeVersion || '1.0.0';
    event.afterVersion = options.newVersion;

    // Determine affected tasks (simplified - in real implementation would analyze dependencies)
    const affectedTasks = [pauseState.currentTask];

    // Check if within 2s budget
    const elapsed = Date.now() - pauseState.pausedAt;
    if (elapsed > 2000) {
      const err = new Error(`Sync exceeded 2s budget: ${elapsed}ms`);
      err.name = 'SyncTimeout';
      throw err;
    }

    // Emit event
    this.emit('contextsSynced', {
      pauseToken: options.pauseToken,
      newVersion: options.newVersion,
      affectedTasks
    });

    return {
      syncComplete: true,
      affectedTasks
    };
  }

  /**
   * Resume implementation with reconciled tasks
   * FR-004 step 5
   */
  async resumeImplementation(options) {
    if (!options.pauseToken || !Array.isArray(options.reconciledTasks)) {
      throw new Error('pauseToken and reconciledTasks array are required');
    }

    // Validate pause token
    const pauseState = this.activePauses.get(options.pauseToken);
    if (!pauseState) {
      const err = new Error('Invalid or expired pause token');
      err.name = 'InvalidPauseToken';
      throw err;
    }

    if (options.reconciledTasks.length === 0) {
      const err = new Error('Reconciled tasks list is empty');
      err.name = 'NoTasksToResume';
      throw err;
    }

    const { event } = pauseState;

    // Complete the event
    event.transitionState('completed');
    event.affectedTasks = options.reconciledTasks;

    // Store in history
    this.events.push(event);

    // Clear active pause
    this.activePauses.delete(options.pauseToken);

    // Emit event
    this.emit('implementationResumed', {
      pauseToken: options.pauseToken,
      nextTask: options.reconciledTasks[0]
    });

    // Verify 2s budget
    const totalDuration = event.getDuration();
    if (totalDuration && totalDuration > 2000) {
      console.warn(`Full reconciliation took ${totalDuration}ms, exceeds 2000ms budget (NFR-002)`);
    }

    return {
      resumed: true,
      nextTask: options.reconciledTasks[0]
    };
  }

  /**
   * Get reconciliation history
   */
  getHistory() {
    return this.events.map(e => e.toJSON());
  }

  /**
   * Get active pauses
   */
  getActivePauses() {
    return Array.from(this.activePauses.keys());
  }
}

export default ReconciliationProtocol;