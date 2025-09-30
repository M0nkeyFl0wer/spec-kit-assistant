/**
 * ReconciliationEvent Model
 * Spec: Feature 788 - Data Model Entity 3
 *
 * Track pause-sync-resume cycles when context divergence is detected
 */

import { randomUUID } from 'crypto';
import semver from 'semver';

export class ReconciliationEvent {
  constructor(data = {}) {
    this.id = data.id || randomUUID();
    this.trigger = data.trigger || '';
    this.pauseTime = data.pauseTime || new Date();
    this.syncActions = data.syncActions || [];
    this.resumeTime = data.resumeTime || null;
    this.affectedTasks = data.affectedTasks || [];
    this.status = data.status || 'pending';
    this.beforeVersion = data.beforeVersion || '';
    this.afterVersion = data.afterVersion || '';

    this.validate();
  }

  validate() {
    // pauseTime must be valid
    if (!(this.pauseTime instanceof Date) || isNaN(this.pauseTime.getTime())) {
      throw new Error('pauseTime must be a valid Date');
    }

    // resumeTime validation if set
    if (this.resumeTime !== null) {
      if (!(this.resumeTime instanceof Date) || isNaN(this.resumeTime.getTime())) {
        throw new Error('resumeTime must be a valid Date or null');
      }

      // resumeTime must be greater than pauseTime
      if (this.resumeTime <= this.pauseTime) {
        throw new Error('resumeTime must be greater than pauseTime');
      }

      // Total reconciliation time must be <= 2000ms (NFR-002)
      const duration = this.resumeTime - this.pauseTime;
      if (duration > 2000) {
        console.warn(`Reconciliation took ${duration}ms, exceeds 2000ms budget (NFR-002)`);
      }
    }

    // status must be valid
    const validStatuses = ['pending', 'syncing', 'completed', 'failed'];
    if (!validStatuses.includes(this.status)) {
      throw new Error(`status must be one of: ${validStatuses.join(', ')}`);
    }

    // Version validation
    if (this.beforeVersion && !semver.valid(this.beforeVersion)) {
      throw new Error(`beforeVersion must be valid semver: ${this.beforeVersion}`);
    }

    if (this.afterVersion && !semver.valid(this.afterVersion)) {
      throw new Error(`afterVersion must be valid semver: ${this.afterVersion}`);
    }

    return true;
  }

  transitionState(newStatus, options = {}) {
    const validTransitions = {
      pending: ['syncing'],
      syncing: ['completed', 'failed'],
      completed: [],
      failed: []
    };

    if (!validTransitions[this.status]?.includes(newStatus)) {
      throw new Error(`Invalid status transition: ${this.status} -> ${newStatus}`);
    }

    this.status = newStatus;

    // Auto-set resumeTime when completing
    if (newStatus === 'completed' && !this.resumeTime) {
      this.resumeTime = new Date();
    }

    // Store error details if failed
    if (newStatus === 'failed' && options.error) {
      this.errorDetails = options.error;
    }

    this.validate();
    return this.status;
  }

  addSyncAction(action) {
    if (!action.action || !action.target) {
      throw new Error('Sync action must have action and target fields');
    }

    this.syncActions.push({
      action: action.action,
      target: action.target,
      result: action.result || 'pending',
      timestamp: new Date()
    });

    return this.syncActions;
  }

  getDuration() {
    if (!this.resumeTime) {
      return null;
    }

    return this.resumeTime - this.pauseTime;
  }

  isWithinBudget() {
    const duration = this.getDuration();
    return duration !== null && duration <= 2000;
  }

  toJSON() {
    return {
      id: this.id,
      trigger: this.trigger,
      pauseTime: this.pauseTime.toISOString(),
      syncActions: this.syncActions,
      resumeTime: this.resumeTime ? this.resumeTime.toISOString() : null,
      affectedTasks: this.affectedTasks,
      status: this.status,
      beforeVersion: this.beforeVersion,
      afterVersion: this.afterVersion,
      errorDetails: this.errorDetails
    };
  }

  static fromJSON(json) {
    return new ReconciliationEvent({
      ...json,
      pauseTime: new Date(json.pauseTime),
      resumeTime: json.resumeTime ? new Date(json.resumeTime) : null
    });
  }
}

export default ReconciliationEvent;