/**
 * GitHub Sync Module
 * Orchestrates bidirectional sync between tasks.md and GitHub Issues
 */

import fs from 'fs-extra';
import path from 'path';
import { checkGitHubAuth, validateGitHubAccess } from './auth.js';
import { parseTasksFile, hashTaskContent, updateTasksFileWithIssues } from './task-parser.js';
import { ensureDefaultLabels } from './labels.js';
import { createIssue, updateIssue, closeIssue, getIssue, addDependencyLinks } from './issues.js';

/**
 * Sync state stored in .speckit/sync-state.json
 * @typedef {Object} SyncState
 * @property {string} lastSync - ISO timestamp of last sync
 * @property {Object.<string, TaskSyncRecord>} tasks - Map of task ID to sync record
 */

/**
 * Individual task sync record
 * @typedef {Object} TaskSyncRecord
 * @property {number} issueNumber - GitHub Issue number
 * @property {string} contentHash - Hash of task content at last sync
 * @property {string} lastSynced - ISO timestamp
 * @property {'open' | 'closed'} issueState - Current issue state
 */

/**
 * Sync result
 * @typedef {Object} SyncResult
 * @property {number} created - Number of issues created
 * @property {number} updated - Number of issues updated
 * @property {number} closed - Number of issues closed
 * @property {number} unchanged - Number of unchanged tasks
 * @property {string[]} warnings - Warning messages
 * @property {string[]} errors - Error messages
 */

const SYNC_STATE_DIR = '.speckit';
const SYNC_STATE_FILE = 'sync-state.json';

/**
 * Get path to sync state file
 * @param {string} projectRoot - Project root directory
 * @returns {string}
 */
function getSyncStatePath(projectRoot) {
  return path.join(projectRoot, SYNC_STATE_DIR, SYNC_STATE_FILE);
}

/**
 * Read sync state from disk
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<SyncState>}
 */
export async function readSyncState(projectRoot) {
  const statePath = getSyncStatePath(projectRoot);

  try {
    if (await fs.pathExists(statePath)) {
      return await fs.readJson(statePath);
    }
  } catch (error) {
    // Corrupted state file, start fresh
  }

  return {
    lastSync: null,
    tasks: {}
  };
}

/**
 * Write sync state to disk
 * @param {string} projectRoot - Project root directory
 * @param {SyncState} state - State to write
 * @returns {Promise<void>}
 */
export async function writeSyncState(projectRoot, state) {
  const statePath = getSyncStatePath(projectRoot);
  await fs.ensureDir(path.dirname(statePath));
  await fs.writeJson(statePath, state, { spaces: 2 });
}

/**
 * Sync tasks from tasks.md to GitHub Issues
 * @param {string} tasksFilePath - Path to tasks.md file
 * @param {Object} options - Sync options
 * @param {boolean} [options.dryRun=false] - If true, don't actually create/update issues
 * @param {boolean} [options.force=false] - If true, sync even if content unchanged
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<SyncResult>}
 */
export async function syncTasksToIssues(tasksFilePath, options = {}) {
  const { dryRun = false, force = false, onProgress = () => {} } = options;

  const result = {
    created: 0,
    updated: 0,
    closed: 0,
    unchanged: 0,
    warnings: [],
    errors: []
  };

  // Check GitHub authentication
  const auth = await checkGitHubAuth();
  if (!auth.available) {
    result.warnings.push('GitHub not available. Running in git-only mode.');
    return result;
  }

  // Validate access
  const validation = await validateGitHubAccess();
  if (!validation.valid) {
    result.errors.push(validation.error);
    return result;
  }

  // Ensure labels exist
  if (!dryRun) {
    onProgress({ phase: 'labels', message: 'Ensuring labels exist...' });
    await ensureDefaultLabels();
  }

  // Parse tasks file
  onProgress({ phase: 'parse', message: 'Parsing tasks.md...' });
  const { tasks, metadata, warnings: parseWarnings } = await parseTasksFile(tasksFilePath);
  result.warnings.push(...parseWarnings);

  const featureName = metadata.featureName;
  const projectRoot = path.dirname(path.dirname(tasksFilePath));

  // Read existing sync state
  const state = await readSyncState(projectRoot);
  const taskToIssue = new Map();

  // Process each task
  onProgress({ phase: 'sync', message: `Processing ${tasks.length} tasks...` });

  for (const task of tasks) {
    try {
      const currentHash = hashTaskContent(task);
      const existingRecord = state.tasks[task.id];

      // Check if task already has an issue linked in the file
      if (task.issueNumber && !existingRecord) {
        // Task was linked outside of our sync, record it
        state.tasks[task.id] = {
          issueNumber: task.issueNumber,
          contentHash: currentHash,
          lastSynced: new Date().toISOString(),
          issueState: task.status === 'complete' ? 'closed' : 'open'
        };
        taskToIssue.set(task.id, task.issueNumber);
        result.unchanged++;
        continue;
      }

      if (existingRecord) {
        // Task was previously synced
        taskToIssue.set(task.id, existingRecord.issueNumber);

        const contentChanged = currentHash !== existingRecord.contentHash;
        const statusChanged = (task.status === 'complete') !== (existingRecord.issueState === 'closed');

        if (!contentChanged && !statusChanged && !force) {
          result.unchanged++;
          continue;
        }

        if (!dryRun) {
          // Update issue if content changed
          if (contentChanged) {
            await updateIssue(existingRecord.issueNumber, task, featureName);
            onProgress({ phase: 'update', taskId: task.id, issueNumber: existingRecord.issueNumber });
            result.updated++;
          }

          // Close issue if task completed
          if (statusChanged && task.status === 'complete') {
            await closeIssue(existingRecord.issueNumber, 'Task marked complete in tasks.md');
            state.tasks[task.id].issueState = 'closed';
            onProgress({ phase: 'close', taskId: task.id, issueNumber: existingRecord.issueNumber });
            result.closed++;
          }

          // Update state
          state.tasks[task.id].contentHash = currentHash;
          state.tasks[task.id].lastSynced = new Date().toISOString();
        } else {
          if (contentChanged) result.updated++;
          if (statusChanged && task.status === 'complete') result.closed++;
        }
      } else {
        // New task - create issue
        if (task.status === 'complete') {
          // Don't create issues for already-completed tasks
          result.unchanged++;
          continue;
        }

        if (!dryRun) {
          const issueResult = await createIssue(task, featureName);
          taskToIssue.set(task.id, issueResult.number);

          state.tasks[task.id] = {
            issueNumber: issueResult.number,
            contentHash: currentHash,
            lastSynced: new Date().toISOString(),
            issueState: 'open'
          };

          onProgress({ phase: 'create', taskId: task.id, issueNumber: issueResult.number, url: issueResult.url });
        }
        result.created++;
      }
    } catch (error) {
      result.errors.push(`Failed to sync ${task.id}: ${error.message}`);
    }
  }

  // Add dependency links (second pass)
  if (!dryRun && taskToIssue.size > 0) {
    onProgress({ phase: 'dependencies', message: 'Adding dependency links...' });

    for (const task of tasks) {
      if (task.dependencies && task.dependencies.length > 0 && taskToIssue.has(task.id)) {
        try {
          await addDependencyLinks(taskToIssue.get(task.id), taskToIssue, task.dependencies);
        } catch (error) {
          result.warnings.push(`Failed to add dependency links for ${task.id}: ${error.message}`);
        }
      }
    }
  }

  // Check for orphaned tasks (in state but not in file)
  const currentTaskIds = new Set(tasks.map(t => t.id));
  for (const taskId of Object.keys(state.tasks)) {
    if (!currentTaskIds.has(taskId)) {
      result.warnings.push(
        `Task ${taskId} was deleted from tasks.md but issue #${state.tasks[taskId].issueNumber} still exists. ` +
        `Consider closing it manually.`
      );
    }
  }

  // Update tasks.md with issue numbers
  if (!dryRun && taskToIssue.size > 0) {
    onProgress({ phase: 'update-file', message: 'Updating tasks.md with issue numbers...' });
    await updateTasksFileWithIssues(tasksFilePath, taskToIssue);
  }

  // Save state
  if (!dryRun) {
    state.lastSync = new Date().toISOString();
    await writeSyncState(projectRoot, state);
  }

  return result;
}

/**
 * Get sync status for a tasks file
 * @param {string} tasksFilePath - Path to tasks.md
 * @returns {Promise<Object>}
 */
export async function getSyncStatus(tasksFilePath) {
  const projectRoot = path.dirname(path.dirname(tasksFilePath));
  const state = await readSyncState(projectRoot);
  const { tasks } = await parseTasksFile(tasksFilePath);

  const synced = [];
  const unsynced = [];
  const changed = [];

  for (const task of tasks) {
    const record = state.tasks[task.id];

    if (!record) {
      if (task.status !== 'complete') {
        unsynced.push(task.id);
      }
    } else {
      const currentHash = hashTaskContent(task);
      if (currentHash !== record.contentHash) {
        changed.push({ taskId: task.id, issueNumber: record.issueNumber });
      } else {
        synced.push({ taskId: task.id, issueNumber: record.issueNumber });
      }
    }
  }

  return {
    lastSync: state.lastSync,
    totalTasks: tasks.length,
    synced,
    unsynced,
    changed
  };
}
