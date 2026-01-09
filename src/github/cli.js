#!/usr/bin/env node
/**
 * GitHub Tasks to Issues CLI
 * Command-line interface for syncing tasks.md to GitHub Issues
 */

import fs from 'fs-extra';
import path from 'path';
import { checkGitHubAuth, getAuthStatusMessage, getRepoInfo } from './auth.js';
import { syncTasksToIssues, getSyncStatus } from './sync.js';
import { parseTasksFile } from './task-parser.js';

/**
 * Print colored output
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Find tasks.md file in current feature directory
 * @returns {Promise<string|null>}
 */
async function findTasksFile() {
  // Check current directory
  const currentTasks = path.join(process.cwd(), 'tasks.md');
  if (await fs.pathExists(currentTasks)) {
    return currentTasks;
  }

  // Check specs directory
  const specsDir = path.join(process.cwd(), 'specs');
  if (await fs.pathExists(specsDir)) {
    const features = await fs.readdir(specsDir);
    for (const feature of features.reverse()) { // Most recent first
      const tasksPath = path.join(specsDir, feature, 'tasks.md');
      if (await fs.pathExists(tasksPath)) {
        return tasksPath;
      }
    }
  }

  return null;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
GitHub Tasks to Issues Sync

Usage: node src/github/cli.js [command] [options]

Commands:
  sync [file]     Sync tasks.md to GitHub Issues (default)
  status [file]   Show sync status without making changes
  auth            Check GitHub authentication status

Options:
  --dry-run       Show what would be done without making changes
  --force         Sync all tasks, even if unchanged
  --help, -h      Show this help message

Examples:
  node src/github/cli.js sync
  node src/github/cli.js sync specs/002-quality-automation/tasks.md
  node src/github/cli.js status --dry-run
  node src/github/cli.js auth
`);
}

/**
 * Show authentication status
 */
async function showAuthStatus() {
  log('\nChecking GitHub authentication...', 'cyan');

  const auth = await checkGitHubAuth();
  log(getAuthStatusMessage(auth));

  const repoInfo = await getRepoInfo();
  if (repoInfo) {
    log(`\nRepository: ${repoInfo.owner}/${repoInfo.repo}`, 'dim');
  } else {
    log('\nNo GitHub repository detected', 'yellow');
  }

  return auth.available;
}

/**
 * Show sync status
 */
async function showSyncStatus(tasksFile) {
  if (!tasksFile) {
    tasksFile = await findTasksFile();
    if (!tasksFile) {
      log('No tasks.md file found', 'red');
      return;
    }
  }

  log(`\nSync status for: ${tasksFile}`, 'cyan');

  const status = await getSyncStatus(tasksFile);

  log(`\nTotal tasks: ${status.totalTasks}`);
  log(`Synced: ${status.synced.length}`, 'green');
  log(`Unsynced: ${status.unsynced.length}`, 'yellow');
  log(`Changed: ${status.changed.length}`, 'cyan');

  if (status.lastSync) {
    log(`\nLast sync: ${new Date(status.lastSync).toLocaleString()}`, 'dim');
  } else {
    log('\nNever synced', 'dim');
  }

  if (status.unsynced.length > 0) {
    log('\nUnsynced tasks:', 'yellow');
    for (const taskId of status.unsynced.slice(0, 10)) {
      log(`  - ${taskId}`);
    }
    if (status.unsynced.length > 10) {
      log(`  ... and ${status.unsynced.length - 10} more`);
    }
  }

  if (status.changed.length > 0) {
    log('\nChanged tasks:', 'cyan');
    for (const { taskId, issueNumber } of status.changed.slice(0, 10)) {
      log(`  - ${taskId} → #${issueNumber}`);
    }
  }
}

/**
 * Sync tasks to issues
 */
async function runSync(tasksFile, options = {}) {
  if (!tasksFile) {
    tasksFile = await findTasksFile();
    if (!tasksFile) {
      log('No tasks.md file found', 'red');
      log('Specify a path or run from a feature directory', 'dim');
      return;
    }
  }

  // Check auth first
  const auth = await checkGitHubAuth();
  if (!auth.available) {
    log('\n' + getAuthStatusMessage(auth), 'yellow');
    log('\nSync will run in preview mode only.', 'dim');
    options.dryRun = true;
  }

  log(`\nSyncing: ${tasksFile}`, 'cyan');
  if (options.dryRun) {
    log('(dry run - no changes will be made)', 'yellow');
  }

  const result = await syncTasksToIssues(tasksFile, {
    dryRun: options.dryRun,
    force: options.force,
    onProgress: (progress) => {
      switch (progress.phase) {
        case 'labels':
          log('  Setting up labels...', 'dim');
          break;
        case 'parse':
          log('  Parsing tasks...', 'dim');
          break;
        case 'sync':
          log(progress.message, 'dim');
          break;
        case 'create':
          log(`  Created: ${progress.taskId} → #${progress.issueNumber}`, 'green');
          break;
        case 'update':
          log(`  Updated: ${progress.taskId} → #${progress.issueNumber}`, 'cyan');
          break;
        case 'close':
          log(`  Closed: ${progress.taskId} → #${progress.issueNumber}`, 'dim');
          break;
        case 'dependencies':
          log('  Adding dependency links...', 'dim');
          break;
        case 'update-file':
          log('  Updating tasks.md...', 'dim');
          break;
      }
    }
  });

  // Summary
  log('\n--- Summary ---', 'cyan');
  log(`Created: ${result.created}`, 'green');
  log(`Updated: ${result.updated}`, 'cyan');
  log(`Closed: ${result.closed}`, 'dim');
  log(`Unchanged: ${result.unchanged}`);

  if (result.warnings.length > 0) {
    log('\nWarnings:', 'yellow');
    for (const warning of result.warnings) {
      log(`  ⚠ ${warning}`, 'yellow');
    }
  }

  if (result.errors.length > 0) {
    log('\nErrors:', 'red');
    for (const error of result.errors) {
      log(`  ✗ ${error}`, 'red');
    }
  }
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse options
  const options = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    help: args.includes('--help') || args.includes('-h')
  };

  // Remove options from args
  const positionalArgs = args.filter(a => !a.startsWith('--') && a !== '-h');
  const command = positionalArgs[0] || 'sync';
  const file = positionalArgs[1];

  if (options.help) {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case 'auth':
        await showAuthStatus();
        break;

      case 'status':
        await showSyncStatus(file);
        break;

      case 'sync':
        await runSync(file, options);
        break;

      default:
        // Treat unknown command as file path
        await runSync(command, options);
        break;
    }
  } catch (error) {
    log(`\nError: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
