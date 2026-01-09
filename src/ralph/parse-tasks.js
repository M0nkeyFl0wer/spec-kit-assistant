/**
 * Parse Tasks Module
 * Converts tasks.md to @fix_plan.md checkbox format for Ralph
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * Task item in fix_plan format
 * @typedef {Object} FixPlanTask
 * @property {string} id - Task identifier (e.g., "1.1" or "T001")
 * @property {string} description - Task description
 * @property {boolean} completed - Whether task is completed
 * @property {string} phase - Phase/section name
 * @property {number} lineNumber - Line number in source file
 */

/**
 * Parse result from tasks.md
 * @typedef {Object} TasksParseResult
 * @property {FixPlanTask[]} tasks - Parsed tasks
 * @property {string[]} phases - Phase names in order
 * @property {string} featureName - Feature name from header
 */

// Regex patterns for different task formats
const PATTERNS = {
  // Spec Kit format: - [ ] T001 Description or - Task 1.1: Description
  specKitCheckbox: /^-\s*\[([ xX])\]\s*(?:T\d{3}|Task\s+(\d+\.\d+):?)\s*(.+)/,
  // Simple task: - Task 1.1: Description
  simpleTask: /^-\s*Task\s+(\d+\.\d+):?\s*(.+)/,
  // Phase header: ## Phase 1: Name or ## Phase 1 - Name
  phaseHeader: /^##\s*Phase\s*\d+[:\-\s]+(.+)/i,
  // Generic header: ## Something
  genericHeader: /^##\s+(.+)/
};

/**
 * Parse a single line from tasks.md
 * @param {string} line - The line to parse
 * @param {number} lineNumber - Line number in file
 * @param {string} currentPhase - Current phase name
 * @returns {FixPlanTask | null} - Parsed task or null
 */
export function parseTaskLine(line, lineNumber, currentPhase = '') {
  const trimmed = line.trim();

  // Try Spec Kit checkbox format first
  const checkboxMatch = trimmed.match(PATTERNS.specKitCheckbox);
  if (checkboxMatch) {
    const isComplete = checkboxMatch[1].toLowerCase() === 'x';
    const taskNum = checkboxMatch[2] || '';
    const description = checkboxMatch[3].trim();

    return {
      id: taskNum || `line-${lineNumber}`,
      description,
      completed: isComplete,
      phase: currentPhase,
      lineNumber
    };
  }

  // Try simple task format (no checkbox)
  const simpleMatch = trimmed.match(PATTERNS.simpleTask);
  if (simpleMatch) {
    return {
      id: simpleMatch[1],
      description: simpleMatch[2].trim(),
      completed: false,
      phase: currentPhase,
      lineNumber
    };
  }

  return null;
}

/**
 * Parse phase header
 * @param {string} line - The line to check
 * @returns {string | null} - Phase name or null
 */
export function parsePhaseHeader(line) {
  const trimmed = line.trim();

  // Try specific phase format
  const phaseMatch = trimmed.match(PATTERNS.phaseHeader);
  if (phaseMatch) {
    return phaseMatch[1].trim();
  }

  // Try generic header format
  const headerMatch = trimmed.match(PATTERNS.genericHeader);
  if (headerMatch) {
    return headerMatch[1].trim();
  }

  return null;
}

/**
 * Parse tasks.md content
 * @param {string} content - File content
 * @returns {TasksParseResult}
 */
export function parseTasksContent(content) {
  const lines = content.split('\n');
  const tasks = [];
  const phases = [];
  let currentPhase = '';
  let featureName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Check for feature name in title
    const titleMatch = line.match(/^#\s+(?:Tasks:?\s*)?(.+)/);
    if (titleMatch && !featureName) {
      featureName = titleMatch[1].trim();
      continue;
    }

    // Check for phase header
    const phase = parsePhaseHeader(line);
    if (phase) {
      currentPhase = phase;
      if (!phases.includes(phase)) {
        phases.push(phase);
      }
      continue;
    }

    // Try to parse as task
    const task = parseTaskLine(line, lineNumber, currentPhase);
    if (task) {
      tasks.push(task);
    }
  }

  return {
    tasks,
    phases,
    featureName: featureName || 'Unknown Feature'
  };
}

/**
 * Parse tasks.md file
 * @param {string} filePath - Path to tasks.md
 * @returns {Promise<TasksParseResult>}
 */
export async function parseTasksFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return parseTasksContent(content);
}

/**
 * Convert tasks to @fix_plan.md format
 * @param {TasksParseResult} parsed - Parsed tasks result
 * @returns {string} - @fix_plan.md content
 */
export function convertToFixPlan(parsed) {
  const lines = [];

  // Header
  lines.push(`# ${parsed.featureName}`);
  lines.push('');

  let currentPhase = '';

  for (const task of parsed.tasks) {
    // Add phase header if changed
    if (task.phase && task.phase !== currentPhase) {
      if (currentPhase) {
        lines.push(''); // Blank line between phases
      }
      lines.push(`## ${task.phase}`);
      lines.push('');
      currentPhase = task.phase;
    }

    // Format task as checkbox
    const checkbox = task.completed ? '[x]' : '[ ]';
    const taskId = task.id.match(/^\d+\.\d+$/) ? `Task ${task.id}:` : '';
    lines.push(`- ${checkbox} ${taskId} ${task.description}`.trim());
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Read tasks.md and write @fix_plan.md
 * @param {string} tasksPath - Path to tasks.md
 * @param {string} outputPath - Path to write @fix_plan.md
 * @returns {Promise<{success: boolean, tasksCount: number, error?: string}>}
 */
export async function generateFixPlan(tasksPath, outputPath) {
  try {
    // Check if tasks file exists
    const exists = await fs.pathExists(tasksPath);
    if (!exists) {
      return {
        success: false,
        tasksCount: 0,
        error: `Tasks file not found: ${tasksPath}`
      };
    }

    // Parse and convert
    const parsed = await parseTasksFile(tasksPath);
    const fixPlanContent = convertToFixPlan(parsed);

    // Write output
    await fs.writeFile(outputPath, fixPlanContent);

    return {
      success: true,
      tasksCount: parsed.tasks.length
    };
  } catch (error) {
    return {
      success: false,
      tasksCount: 0,
      error: error.message
    };
  }
}

/**
 * Find tasks.md in common locations
 * @param {string} projectDir - Project root directory
 * @returns {Promise<string | null>} - Path to tasks.md or null
 */
export async function findTasksFile(projectDir) {
  const searchPaths = [
    path.join(projectDir, 'specs', 'tasks.md'),
    path.join(projectDir, '.speckit', 'tasks.md'),
    path.join(projectDir, 'tasks.md')
  ];

  for (const searchPath of searchPaths) {
    if (await fs.pathExists(searchPath)) {
      return searchPath;
    }
  }

  return null;
}
