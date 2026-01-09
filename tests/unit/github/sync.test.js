/**
 * Unit tests for GitHub Sync Module
 * Tests: T020
 */

import { describe, it, before, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('GitHub Sync Module', () => {
  let syncModule;
  let tempDir;

  before(async () => {
    syncModule = await import('../../../src/github/sync.js');
  });

  beforeEach(async () => {
    // Create a temp directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-test-'));
  });

  afterEach(async () => {
    // Clean up temp directory
    if (tempDir) {
      await fs.remove(tempDir);
    }
  });

  describe('Module exports', () => {
    it('should export syncTasksToIssues function', () => {
      assert.strictEqual(typeof syncModule.syncTasksToIssues, 'function');
    });

    it('should export readSyncState function', () => {
      assert.strictEqual(typeof syncModule.readSyncState, 'function');
    });

    it('should export writeSyncState function', () => {
      assert.strictEqual(typeof syncModule.writeSyncState, 'function');
    });

    it('should export getSyncStatus function', () => {
      assert.strictEqual(typeof syncModule.getSyncStatus, 'function');
    });
  });

  describe('readSyncState', () => {
    it('should return empty state when file does not exist', async () => {
      const state = await syncModule.readSyncState(tempDir);

      assert.deepStrictEqual(state, {
        lastSync: null,
        tasks: {}
      });
    });

    it('should read existing state file', async () => {
      const stateDir = path.join(tempDir, '.speckit');
      await fs.ensureDir(stateDir);

      const existingState = {
        lastSync: '2024-01-01T00:00:00.000Z',
        tasks: {
          T001: {
            issueNumber: 42,
            contentHash: 'abc123',
            lastSynced: '2024-01-01T00:00:00.000Z',
            issueState: 'open'
          }
        }
      };

      await fs.writeJson(path.join(stateDir, 'sync-state.json'), existingState);

      const state = await syncModule.readSyncState(tempDir);
      assert.deepStrictEqual(state, existingState);
    });

    it('should handle corrupted state file gracefully', async () => {
      const stateDir = path.join(tempDir, '.speckit');
      await fs.ensureDir(stateDir);
      await fs.writeFile(path.join(stateDir, 'sync-state.json'), 'not valid json');

      const state = await syncModule.readSyncState(tempDir);
      assert.deepStrictEqual(state, {
        lastSync: null,
        tasks: {}
      });
    });
  });

  describe('writeSyncState', () => {
    it('should create .speckit directory if not exists', async () => {
      const state = {
        lastSync: new Date().toISOString(),
        tasks: {}
      };

      await syncModule.writeSyncState(tempDir, state);

      const stateDir = path.join(tempDir, '.speckit');
      assert.ok(await fs.pathExists(stateDir));
    });

    it('should write state to file', async () => {
      const state = {
        lastSync: '2024-01-01T00:00:00.000Z',
        tasks: {
          T001: {
            issueNumber: 1,
            contentHash: 'hash',
            lastSynced: '2024-01-01T00:00:00.000Z',
            issueState: 'open'
          }
        }
      };

      await syncModule.writeSyncState(tempDir, state);

      const writtenState = await fs.readJson(
        path.join(tempDir, '.speckit', 'sync-state.json')
      );
      assert.deepStrictEqual(writtenState, state);
    });

    it('should overwrite existing state', async () => {
      const oldState = { lastSync: 'old', tasks: {} };
      const newState = { lastSync: 'new', tasks: { T001: { issueNumber: 1 } } };

      await syncModule.writeSyncState(tempDir, oldState);
      await syncModule.writeSyncState(tempDir, newState);

      const writtenState = await fs.readJson(
        path.join(tempDir, '.speckit', 'sync-state.json')
      );
      assert.strictEqual(writtenState.lastSync, 'new');
    });
  });

  describe('syncTasksToIssues', () => {
    it('should return warnings when GitHub not available in dry run', async () => {
      // Create a mock tasks file
      const featureDir = path.join(tempDir, 'feature');
      await fs.ensureDir(featureDir);
      const tasksPath = path.join(featureDir, 'tasks.md');

      await fs.writeFile(tasksPath, `# Tasks: Test Feature

## Phase 1: Setup

- [ ] T001 First task
- [ ] T002 Second task
`);

      // Run in dry run mode - won't actually call GitHub
      const result = await syncModule.syncTasksToIssues(tasksPath, {
        dryRun: true
      });

      // Result should have the standard structure
      assert.ok(result.hasOwnProperty('created'));
      assert.ok(result.hasOwnProperty('updated'));
      assert.ok(result.hasOwnProperty('closed'));
      assert.ok(result.hasOwnProperty('unchanged'));
      assert.ok(result.hasOwnProperty('warnings'));
      assert.ok(result.hasOwnProperty('errors'));
    });

    it('should handle progress callback', async () => {
      const featureDir = path.join(tempDir, 'feature');
      await fs.ensureDir(featureDir);
      const tasksPath = path.join(featureDir, 'tasks.md');

      await fs.writeFile(tasksPath, `# Tasks: Test

- [ ] T001 Task
`);

      const progressCalls = [];
      const result = await syncModule.syncTasksToIssues(tasksPath, {
        dryRun: true,
        onProgress: (progress) => progressCalls.push(progress)
      });

      // In CI without GitHub auth, sync returns early before progress callbacks
      // When auth is available, we should have progress callbacks
      // When auth is not available, we should have a warning
      const hasGitHubAuth = !result.warnings.some(w => w.includes('GitHub not available'));

      if (hasGitHubAuth) {
        // Should have at least parse phase progress
        assert.ok(progressCalls.length > 0, 'Should have progress callbacks when GitHub is available');
      } else {
        // Without GitHub, we should get a warning about git-only mode
        assert.ok(result.warnings.length > 0, 'Should have warnings in git-only mode');
      }
    });

    it('should not create issues for completed tasks', async () => {
      const featureDir = path.join(tempDir, 'feature');
      await fs.ensureDir(featureDir);
      const tasksPath = path.join(featureDir, 'tasks.md');

      await fs.writeFile(tasksPath, `# Tasks: Test

- [x] T001 Already done
- [x] T002 Also done
`);

      const result = await syncModule.syncTasksToIssues(tasksPath, {
        dryRun: true
      });

      // Completed tasks should be unchanged, not created
      assert.strictEqual(result.created, 0);
    });
  });

  describe('getSyncStatus', () => {
    it('should report unsynced tasks', async () => {
      const featureDir = path.join(tempDir, 'feature');
      await fs.ensureDir(featureDir);
      const tasksPath = path.join(featureDir, 'tasks.md');

      await fs.writeFile(tasksPath, `# Tasks: Test

- [ ] T001 New task
- [ ] T002 Another new task
`);

      const status = await syncModule.getSyncStatus(tasksPath);

      assert.strictEqual(status.totalTasks, 2);
      assert.strictEqual(status.unsynced.length, 2);
      assert.strictEqual(status.synced.length, 0);
      assert.strictEqual(status.changed.length, 0);
    });

    it('should report synced tasks', async () => {
      const featureDir = path.join(tempDir, 'feature');
      await fs.ensureDir(featureDir);
      const tasksPath = path.join(featureDir, 'tasks.md');

      await fs.writeFile(tasksPath, `# Tasks: Test

- [ ] T001 Synced task
`);

      // Create sync state
      const parserModule = await import('../../../src/github/task-parser.js');
      const { tasks } = await parserModule.parseTasksFile(tasksPath);
      const hash = parserModule.hashTaskContent(tasks[0]);

      await syncModule.writeSyncState(tempDir, {
        lastSync: new Date().toISOString(),
        tasks: {
          T001: {
            issueNumber: 42,
            contentHash: hash,
            lastSynced: new Date().toISOString(),
            issueState: 'open'
          }
        }
      });

      const status = await syncModule.getSyncStatus(tasksPath);

      assert.strictEqual(status.synced.length, 1);
      assert.strictEqual(status.synced[0].taskId, 'T001');
      assert.strictEqual(status.synced[0].issueNumber, 42);
    });

    it('should report changed tasks', async () => {
      const featureDir = path.join(tempDir, 'feature');
      await fs.ensureDir(featureDir);
      const tasksPath = path.join(featureDir, 'tasks.md');

      await fs.writeFile(tasksPath, `# Tasks: Test

- [ ] T001 Updated description
`);

      // Create sync state with old hash
      await syncModule.writeSyncState(tempDir, {
        lastSync: new Date().toISOString(),
        tasks: {
          T001: {
            issueNumber: 42,
            contentHash: 'old-hash-that-wont-match',
            lastSynced: new Date().toISOString(),
            issueState: 'open'
          }
        }
      });

      const status = await syncModule.getSyncStatus(tasksPath);

      assert.strictEqual(status.changed.length, 1);
      assert.strictEqual(status.changed[0].taskId, 'T001');
    });
  });
});

describe('Sync edge cases', () => {
  let syncModule;
  let tempDir;

  before(async () => {
    syncModule = await import('../../../src/github/sync.js');
  });

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-edge-'));
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.remove(tempDir);
    }
  });

  it('should detect orphaned tasks in state', async () => {
    const featureDir = path.join(tempDir, 'feature');
    await fs.ensureDir(featureDir);
    const tasksPath = path.join(featureDir, 'tasks.md');

    // Tasks file with only T001
    await fs.writeFile(tasksPath, `# Tasks: Test

- [ ] T001 Only task
`);

    // State has T001 and T002 (T002 was deleted from file)
    await syncModule.writeSyncState(tempDir, {
      lastSync: new Date().toISOString(),
      tasks: {
        T001: { issueNumber: 1, contentHash: 'hash1', lastSynced: '', issueState: 'open' },
        T002: { issueNumber: 2, contentHash: 'hash2', lastSynced: '', issueState: 'open' }
      }
    });

    const result = await syncModule.syncTasksToIssues(tasksPath, { dryRun: true });

    // In CI without GitHub auth, sync returns early before orphan detection
    const hasGitHubAuth = !result.warnings.some(w => w.includes('GitHub not available'));

    if (hasGitHubAuth) {
      // Should have a warning about orphaned T002
      const orphanWarning = result.warnings.find(w => w.includes('T002'));
      assert.ok(orphanWarning, 'Should warn about orphaned task');
      assert.ok(orphanWarning.includes('#2'), 'Should mention the issue number');
    } else {
      // Without GitHub, orphan detection is skipped (sync returns early)
      // Verify we got the expected git-only mode warning
      assert.ok(
        result.warnings.some(w => w.includes('git-only mode')),
        'Should indicate git-only mode when GitHub unavailable'
      );
    }
  });

  it('should handle task with pre-existing issue number in file', async () => {
    const featureDir = path.join(tempDir, 'feature');
    await fs.ensureDir(featureDir);
    const tasksPath = path.join(featureDir, 'tasks.md');

    // Task already has issue number in the file
    await fs.writeFile(tasksPath, `# Tasks: Test

- [ ] T001 Task with issue [#99]
`);

    const result = await syncModule.syncTasksToIssues(tasksPath, { dryRun: true });

    // Should count as unchanged since it's already linked
    assert.strictEqual(result.created, 0);
  });
});
