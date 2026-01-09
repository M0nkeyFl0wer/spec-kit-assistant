/**
 * GitHub Issues Module
 * Create, update, and close GitHub issues
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { getLabelsForTask, formatLabelsForCli } from './labels.js';

const execAsync = promisify(exec);

/**
 * Issue creation result
 * @typedef {Object} IssueResult
 * @property {number} number - Issue number
 * @property {string} url - Issue URL
 */

/**
 * Escape a string for use in shell commands
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeForShell(str) {
  // Replace double quotes and backticks, escape special chars
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

/**
 * Build issue body from task
 * @param {Object} task - Parsed task object
 * @param {string} featureName - Feature name for context
 * @returns {string} - Markdown body for issue
 */
function buildIssueBody(task, featureName) {
  const lines = [];

  lines.push(`## Task: ${task.id}`);
  lines.push('');
  lines.push(task.description);
  lines.push('');

  if (task.phase) {
    lines.push(`**Phase**: ${task.phase}`);
  }

  if (task.story) {
    lines.push(`**User Story**: ${task.story}`);
  }

  if (task.filePath) {
    lines.push(`**File**: \`${task.filePath}\``);
  }

  if (task.dependencies && task.dependencies.length > 0) {
    lines.push('');
    lines.push('### Dependencies');
    lines.push('');
    for (const dep of task.dependencies) {
      lines.push(`- Depends on ${dep}`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push(`*Created by [Spec Kit Assistant](https://github.com/M0nkeyFl0wer/spec-kit-assistant)*`);
  lines.push(`*Feature: ${featureName}*`);

  return lines.join('\n');
}

/**
 * Create a GitHub issue from a task
 * @param {Object} task - Parsed task object
 * @param {string} featureName - Feature name
 * @returns {Promise<IssueResult>}
 */
export async function createIssue(task, featureName) {
  const title = `[${task.id}] ${task.description.slice(0, 100)}`;
  const body = buildIssueBody(task, featureName);
  const labels = getLabelsForTask(task);
  const labelFlags = formatLabelsForCli(labels);

  const escapedTitle = escapeForShell(title);
  const escapedBody = escapeForShell(body);

  const command = `gh issue create --title "${escapedTitle}" --body "${escapedBody}" ${labelFlags} --json number,url`;

  try {
    const { stdout } = await execAsync(command);
    const result = JSON.parse(stdout);
    return {
      number: result.number,
      url: result.url
    };
  } catch (error) {
    throw new Error(`Failed to create issue for ${task.id}: ${error.message}`);
  }
}

/**
 * Update an existing GitHub issue
 * @param {number} issueNumber - Issue number to update
 * @param {Object} task - Updated task object
 * @param {string} featureName - Feature name
 * @returns {Promise<void>}
 */
export async function updateIssue(issueNumber, task, featureName) {
  const body = buildIssueBody(task, featureName);
  const escapedBody = escapeForShell(body);

  const command = `gh issue edit ${issueNumber} --body "${escapedBody}"`;

  try {
    await execAsync(command);
  } catch (error) {
    throw new Error(`Failed to update issue #${issueNumber}: ${error.message}`);
  }
}

/**
 * Close a GitHub issue
 * @param {number} issueNumber - Issue number to close
 * @param {string} [comment] - Optional closing comment
 * @returns {Promise<void>}
 */
export async function closeIssue(issueNumber, comment) {
  try {
    if (comment) {
      const escapedComment = escapeForShell(comment);
      await execAsync(`gh issue close ${issueNumber} --comment "${escapedComment}"`);
    } else {
      await execAsync(`gh issue close ${issueNumber}`);
    }
  } catch (error) {
    throw new Error(`Failed to close issue #${issueNumber}: ${error.message}`);
  }
}

/**
 * Reopen a GitHub issue
 * @param {number} issueNumber - Issue number to reopen
 * @returns {Promise<void>}
 */
export async function reopenIssue(issueNumber) {
  try {
    await execAsync(`gh issue reopen ${issueNumber}`);
  } catch (error) {
    throw new Error(`Failed to reopen issue #${issueNumber}: ${error.message}`);
  }
}

/**
 * Get issue details
 * @param {number} issueNumber - Issue number
 * @returns {Promise<Object | null>} - Issue details or null if not found
 */
export async function getIssue(issueNumber) {
  try {
    const { stdout } = await execAsync(
      `gh issue view ${issueNumber} --json number,title,body,state,labels,url`
    );
    return JSON.parse(stdout);
  } catch (error) {
    // Issue not found or other error
    return null;
  }
}

/**
 * List issues with spec-kit label
 * @param {Object} options - List options
 * @param {string} [options.state='all'] - Issue state: open, closed, all
 * @param {number} [options.limit=100] - Maximum issues to return
 * @returns {Promise<Object[]>}
 */
export async function listSpecKitIssues(options = {}) {
  const { state = 'all', limit = 100 } = options;

  try {
    const { stdout } = await execAsync(
      `gh issue list --label "spec-kit" --state ${state} --limit ${limit} --json number,title,state,labels`
    );
    return JSON.parse(stdout);
  } catch (error) {
    return [];
  }
}

/**
 * Add dependency links to issue body
 * @param {number} issueNumber - Issue to update
 * @param {Map<string, number>} taskToIssue - Map of task IDs to issue numbers
 * @param {string[]} dependencies - List of dependency task IDs
 * @returns {Promise<void>}
 */
export async function addDependencyLinks(issueNumber, taskToIssue, dependencies) {
  if (!dependencies || dependencies.length === 0) return;

  const depLinks = dependencies
    .filter(dep => taskToIssue.has(dep))
    .map(dep => `- Depends on #${taskToIssue.get(dep)}`)
    .join('\n');

  if (!depLinks) return;

  // Get current issue body
  const issue = await getIssue(issueNumber);
  if (!issue) return;

  // Update dependencies section
  let body = issue.body;
  const depSection = '### Dependencies\n\n';

  if (body.includes(depSection)) {
    // Replace existing dependencies section
    body = body.replace(
      /### Dependencies\n\n[\s\S]*?(?=\n---|\n###|$)/,
      `${depSection}${depLinks}\n`
    );
  } else {
    // Add dependencies section before footer
    body = body.replace(
      /\n---\n\*Created by/,
      `\n${depSection}${depLinks}\n\n---\n*Created by`
    );
  }

  await execAsync(`gh issue edit ${issueNumber} --body "${escapeForShell(body)}"`);
}
