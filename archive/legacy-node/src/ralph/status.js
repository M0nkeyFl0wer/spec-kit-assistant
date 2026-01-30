/**
 * Ralph Status Module
 * Shows progress by parsing @fix_plan.md checkboxes
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

/**
 * Task status from fix_plan
 * @typedef {Object} TaskStatus
 * @property {string} description - Task description
 * @property {boolean} completed - Whether task is completed
 * @property {number} lineNumber - Line number in file
 */

/**
 * Progress summary
 * @typedef {Object} ProgressSummary
 * @property {number} total - Total tasks
 * @property {number} completed - Completed tasks
 * @property {number} pending - Pending tasks
 * @property {number} percentComplete - Completion percentage
 * @property {TaskStatus[]} tasks - All tasks
 * @property {string[]} phases - Phase names
 */

/**
 * Parse @fix_plan.md and extract task statuses
 * @param {string} content - File content
 * @returns {ProgressSummary}
 */
export function parseFixPlan(content) {
  const lines = content.split('\n');
  const tasks = [];
  const phases = [];
  let currentPhase = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Check for phase header
    const phaseMatch = line.match(/^##\s+(.+)/);
    if (phaseMatch) {
      currentPhase = phaseMatch[1].trim();
      if (!phases.includes(currentPhase)) {
        phases.push(currentPhase);
      }
      continue;
    }

    // Check for checkbox task
    const taskMatch = line.match(/^-\s*\[([ xX])\]\s*(.+)/);
    if (taskMatch) {
      tasks.push({
        description: taskMatch[2].trim(),
        completed: taskMatch[1].toLowerCase() === 'x',
        lineNumber,
        phase: currentPhase
      });
    }
  }

  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;

  return {
    total,
    completed,
    pending: total - completed,
    percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
    tasks,
    phases
  };
}

/**
 * Read and parse @fix_plan.md
 * @param {string} projectDir - Project root directory
 * @returns {Promise<{success: boolean, summary?: ProgressSummary, error?: string}>}
 */
export async function getProgress(projectDir) {
  const fixPlanPath = path.join(projectDir, '@fix_plan.md');

  if (!await fs.pathExists(fixPlanPath)) {
    return {
      success: false,
      error: '@fix_plan.md not found. Run /speckit.ralph init first.'
    };
  }

  try {
    const content = await fs.readFile(fixPlanPath, 'utf8');
    const summary = parseFixPlan(content);

    return {
      success: true,
      summary
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read @fix_plan.md: ${error.message}`
    };
  }
}

/**
 * Generate progress bar
 * @param {number} percent - Completion percentage (0-100)
 * @param {number} width - Bar width in characters
 * @returns {string} - Progress bar string
 */
function progressBar(percent, width = 30) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  const filledChar = '█';
  const emptyChar = '░';

  return filledChar.repeat(filled) + emptyChar.repeat(empty);
}

/**
 * Display progress to console
 * @param {ProgressSummary} summary - Progress summary
 * @param {Object} options - Display options
 * @param {boolean} [options.verbose=false] - Show task details
 */
export function displayProgress(summary, options = {}) {
  const { verbose = false } = options;

  console.log('');
  console.log(chalk.cyan('📊 Ralph Progress'));
  console.log('');

  // Progress bar
  const bar = progressBar(summary.percentComplete);
  const color = summary.percentComplete === 100 ? chalk.green :
    summary.percentComplete >= 50 ? chalk.yellow : chalk.red;

  console.log(`   ${color(bar)} ${summary.percentComplete}%`);
  console.log('');

  // Stats
  console.log(`   ${chalk.green('✓')} Completed: ${summary.completed}`);
  console.log(`   ${chalk.yellow('○')} Pending:   ${summary.pending}`);
  console.log(`   ${chalk.blue('Σ')} Total:     ${summary.total}`);
  console.log('');

  // Verbose task list
  if (verbose && summary.tasks.length > 0) {
    console.log(chalk.cyan('Tasks:'));
    console.log('');

    let currentPhase = '';
    for (const task of summary.tasks) {
      // Show phase header
      if (task.phase && task.phase !== currentPhase) {
        console.log(chalk.blue(`   ## ${task.phase}`));
        currentPhase = task.phase;
      }

      // Show task
      const icon = task.completed ? chalk.green('✓') : chalk.yellow('○');
      const text = task.completed ?
        chalk.gray(task.description) :
        chalk.white(task.description);

      console.log(`   ${icon} ${text}`);
    }
    console.log('');
  }

  // Status message
  if (summary.percentComplete === 100) {
    console.log(chalk.green('🎉 All tasks complete!'));
  } else if (summary.pending === 1) {
    console.log(chalk.yellow(`📝 1 task remaining`));
  } else {
    console.log(chalk.yellow(`📝 ${summary.pending} tasks remaining`));
  }
  console.log('');
}

/**
 * Get status as JSON
 * @param {string} projectDir - Project root directory
 * @returns {Promise<Object>} - Status object
 */
export async function getStatusJson(projectDir) {
  const result = await getProgress(projectDir);

  if (!result.success) {
    return {
      success: false,
      error: result.error
    };
  }

  return {
    success: true,
    progress: {
      total: result.summary.total,
      completed: result.summary.completed,
      pending: result.summary.pending,
      percentComplete: result.summary.percentComplete
    },
    tasks: result.summary.tasks.map(t => ({
      description: t.description,
      completed: t.completed,
      phase: t.phase
    }))
  };
}

/**
 * CLI entry point
 * @param {string[]} args - Command line arguments
 */
export async function cli(args = []) {
  const projectDir = process.cwd();
  const verbose = args.includes('--verbose') || args.includes('-v');
  const json = args.includes('--json');

  try {
    if (json) {
      const status = await getStatusJson(projectDir);
      console.log(JSON.stringify(status, null, 2));
      process.exit(status.success ? 0 : 1);
    }

    const result = await getProgress(projectDir);

    if (!result.success) {
      console.error(chalk.red(`\n❌ ${result.error}`));
      process.exit(1);
    }

    displayProgress(result.summary, { verbose });
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}

// Run CLI if executed directly
const isMain = process.argv[1]?.endsWith('status.js') || process.argv[1]?.endsWith('ralph/status');
if (isMain) {
  cli(process.argv.slice(2));
}
