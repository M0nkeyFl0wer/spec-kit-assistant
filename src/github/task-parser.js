/**
 * Task Parser Module
 * Parses tasks.md files into structured task objects
 */

import fs from 'fs-extra';
import { createHash } from 'node:crypto';

/**
 * Parsed task
 * @typedef {Object} Task
 * @property {string} id - Task ID (e.g., "T001")
 * @property {string} description - Task description
 * @property {'pending' | 'complete'} status - Task status
 * @property {string} [phase] - Phase/section name
 * @property {boolean} parallel - Whether task can run in parallel [P]
 * @property {string} [story] - User story label (e.g., "US1")
 * @property {string[]} dependencies - Task IDs this depends on
 * @property {number} [issueNumber] - Linked GitHub Issue number
 * @property {string} [filePath] - File path mentioned in description
 * @property {string} rawLine - Original markdown line
 * @property {number} lineNumber - Line number in file
 */

/**
 * Parse result
 * @typedef {Object} ParseResult
 * @property {Task[]} tasks - Parsed tasks
 * @property {string[]} phases - Phase names in order
 * @property {Object} metadata - File metadata
 * @property {string[]} warnings - Parse warnings
 */

// Regex patterns for parsing task lines
const TASK_PATTERNS = {
  // Match checkbox: - [ ] or - [x] or - [X]
  checkbox: /^-\s*\[([ xX])\]\s*/,
  // Match task ID: T001, T002, etc.
  taskId: /\b(T\d{3})\b/,
  // Match parallel marker: [P]
  parallel: /\[P\]/,
  // Match story label: [US1], [US2], etc.
  story: /\[US(\d+)\]/,
  // Match issue number: [#42]
  issueNumber: /\[#(\d+)\]/,
  // Match dependency: (depends: T001) or (depends: T001, T002)
  dependency: /\(depends?:\s*([^)]+)\)/i,
  // Match file path: common patterns
  filePath: /(?:in\s+|at\s+)?([a-zA-Z0-9_\-./]+\.(js|ts|py|md|json|yml|yaml))\b/
};

/**
 * Parse a single task line
 * @param {string} line - The markdown line
 * @param {number} lineNumber - Line number in file
 * @param {string} currentPhase - Current phase name
 * @returns {Task | null} - Parsed task or null if not a valid task line
 */
export function parseTaskLine(line, lineNumber, currentPhase = '') {
  // Must start with checkbox
  const checkboxMatch = line.match(TASK_PATTERNS.checkbox);
  if (!checkboxMatch) {
    return null;
  }

  const isComplete = checkboxMatch[1].toLowerCase() === 'x';
  const restOfLine = line.slice(checkboxMatch[0].length);

  // Must have task ID
  const taskIdMatch = restOfLine.match(TASK_PATTERNS.taskId);
  if (!taskIdMatch) {
    return null; // No valid task ID
  }

  const task = {
    id: taskIdMatch[1],
    description: '',
    status: isComplete ? 'complete' : 'pending',
    phase: currentPhase,
    parallel: TASK_PATTERNS.parallel.test(restOfLine),
    story: null,
    dependencies: [],
    issueNumber: null,
    filePath: null,
    rawLine: line,
    lineNumber
  };

  // Extract story label
  const storyMatch = restOfLine.match(TASK_PATTERNS.story);
  if (storyMatch) {
    task.story = `US${storyMatch[1]}`;
  }

  // Extract issue number
  const issueMatch = restOfLine.match(TASK_PATTERNS.issueNumber);
  if (issueMatch) {
    task.issueNumber = parseInt(issueMatch[1], 10);
  }

  // Extract dependencies
  const depMatch = restOfLine.match(TASK_PATTERNS.dependency);
  if (depMatch) {
    task.dependencies = depMatch[1]
      .split(/[,\s]+/)
      .filter(d => /^T\d{3}$/.test(d.trim()))
      .map(d => d.trim());
  }

  // Extract file path
  const filePathMatch = restOfLine.match(TASK_PATTERNS.filePath);
  if (filePathMatch) {
    task.filePath = filePathMatch[1];
  }

  // Build clean description (remove markers)
  let description = restOfLine
    .replace(TASK_PATTERNS.taskId, '')
    .replace(TASK_PATTERNS.parallel, '')
    .replace(TASK_PATTERNS.story, '')
    .replace(TASK_PATTERNS.issueNumber, '')
    .replace(TASK_PATTERNS.dependency, '')
    .trim();

  task.description = description;

  return task;
}

/**
 * Parse a tasks.md file
 * @param {string} filePath - Path to tasks.md file
 * @returns {Promise<ParseResult>}
 */
export async function parseTasksFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return parseTasksContent(content);
}

/**
 * Parse tasks.md content
 * @param {string} content - File content
 * @returns {ParseResult}
 */
export function parseTasksContent(content) {
  const lines = content.split('\n');
  const tasks = [];
  const phases = [];
  const warnings = [];

  let currentPhase = '';
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;

    // Check for phase header (## Phase N: ...)
    const phaseMatch = line.match(/^##\s+Phase\s+\d+:\s*(.+)/i);
    if (phaseMatch) {
      currentPhase = phaseMatch[1].trim();
      if (!phases.includes(currentPhase)) {
        phases.push(currentPhase);
      }
      continue;
    }

    // Also catch "### Tests for" or "### Implementation for" subsections
    const subsectionMatch = line.match(/^###\s+(Tests|Implementation)\s+for\s+(.+)/i);
    if (subsectionMatch) {
      // Keep the parent phase, but note the subsection type
      continue;
    }

    // Try to parse as task
    const task = parseTaskLine(line, lineNumber, currentPhase);
    if (task) {
      tasks.push(task);
    } else if (line.match(/^-\s*\[[ xX]\]/)) {
      // Looks like a task but failed to parse
      warnings.push(`Line ${lineNumber}: Task-like line but missing ID: ${line.slice(0, 50)}...`);
    }
  }

  // Extract metadata from file header
  const metadata = {
    featureName: extractFeatureName(content),
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'complete').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length
  };

  return { tasks, phases, metadata, warnings };
}

/**
 * Extract feature name from tasks.md header
 * @param {string} content - File content
 * @returns {string}
 */
function extractFeatureName(content) {
  const match = content.match(/^#\s+Tasks:\s*(.+)/m);
  return match ? match[1].trim() : 'Unknown Feature';
}

/**
 * Generate a content hash for change detection
 * @param {Task} task - Task to hash
 * @returns {string} - SHA256 hash of task content
 */
export function hashTaskContent(task) {
  const content = `${task.id}|${task.description}|${task.status}|${task.story || ''}`;
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/**
 * Update a task line with a new issue number
 * @param {string} line - Original line
 * @param {number} issueNumber - Issue number to add/update
 * @returns {string} - Updated line
 */
export function updateTaskLineWithIssue(line, issueNumber) {
  // Remove existing issue reference if present
  let updated = line.replace(/\s*\[#\d+\]\s*$/, '');

  // Add new issue reference at end
  return `${updated} [#${issueNumber}]`;
}

/**
 * Update tasks.md file with issue numbers
 * @param {string} filePath - Path to tasks.md
 * @param {Map<string, number>} taskToIssue - Map of task ID to issue number
 * @returns {Promise<void>}
 */
export async function updateTasksFileWithIssues(filePath, taskToIssue) {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');

  const updatedLines = lines.map(line => {
    const taskMatch = line.match(/\b(T\d{3})\b/);
    if (taskMatch && taskToIssue.has(taskMatch[1])) {
      const issueNumber = taskToIssue.get(taskMatch[1]);
      return updateTaskLineWithIssue(line, issueNumber);
    }
    return line;
  });

  await fs.writeFile(filePath, updatedLines.join('\n'));
}
