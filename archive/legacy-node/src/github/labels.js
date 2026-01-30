/**
 * GitHub Label Management Module
 * Handles creating and applying labels to issues
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Label definition
 * @typedef {Object} Label
 * @property {string} name - Label name
 * @property {string} color - Hex color (without #)
 * @property {string} description - Label description
 */

/**
 * Default labels for spec-kit tasks
 * @type {Label[]}
 */
export const DEFAULT_LABELS = [
  { name: 'spec-kit', color: '8B5CF6', description: 'Created by Spec Kit Assistant' },
  { name: 'priority:p1', color: 'FF0000', description: 'Priority 1 - Critical' },
  { name: 'priority:p2', color: 'FFA500', description: 'Priority 2 - Important' },
  { name: 'priority:p3', color: 'FFFF00', description: 'Priority 3 - Normal' },
  { name: 'phase:setup', color: '0E8A16', description: 'Setup phase task' },
  { name: 'phase:foundation', color: '1D76DB', description: 'Foundational task' },
  { name: 'phase:polish', color: 'D4C5F9', description: 'Polish phase task' },
  { name: 'parallel', color: '5319E7', description: 'Can be executed in parallel' },
  { name: 'blocked', color: 'B60205', description: 'Blocked by dependencies' }
];

/**
 * Get labels from existing repository
 * @returns {Promise<string[]>} - List of existing label names
 */
export async function getExistingLabels() {
  try {
    const { stdout } = await execAsync('gh label list --json name');
    const labels = JSON.parse(stdout);
    return labels.map(l => l.name);
  } catch (error) {
    // If labels can't be fetched, return empty array
    return [];
  }
}

/**
 * Create a label if it doesn't exist
 * @param {Label} label - Label to create
 * @returns {Promise<boolean>} - True if created, false if already exists
 */
export async function createLabelIfNotExists(label) {
  try {
    const existingLabels = await getExistingLabels();

    if (existingLabels.includes(label.name)) {
      return false; // Already exists
    }

    await execAsync(
      `gh label create "${label.name}" --color "${label.color}" --description "${label.description}"`
    );

    return true;
  } catch (error) {
    // Label might already exist or we don't have permission
    return false;
  }
}

/**
 * Ensure all default labels exist in the repository
 * @returns {Promise<{created: string[], existing: string[], failed: string[]}>}
 */
export async function ensureDefaultLabels() {
  const created = [];
  const existing = [];
  const failed = [];

  for (const label of DEFAULT_LABELS) {
    try {
      const wasCreated = await createLabelIfNotExists(label);
      if (wasCreated) {
        created.push(label.name);
      } else {
        existing.push(label.name);
      }
    } catch (error) {
      failed.push(label.name);
    }
  }

  return { created, existing, failed };
}

/**
 * Get labels for a task based on its properties
 * @param {Object} task - Parsed task object
 * @returns {string[]} - List of label names to apply
 */
export function getLabelsForTask(task) {
  const labels = ['spec-kit'];

  // Add story/priority label
  if (task.story) {
    const storyNum = task.story.replace('US', '');
    // Assume US1-2 are P1, US3-4 are P2, rest are P3
    if (parseInt(storyNum) <= 2) {
      labels.push('priority:p1');
    } else if (parseInt(storyNum) <= 4) {
      labels.push('priority:p2');
    } else {
      labels.push('priority:p3');
    }
  }

  // Add phase label
  if (task.phase) {
    const phaseLower = task.phase.toLowerCase();
    if (phaseLower.includes('setup')) {
      labels.push('phase:setup');
    } else if (phaseLower.includes('foundation')) {
      labels.push('phase:foundation');
    } else if (phaseLower.includes('polish')) {
      labels.push('phase:polish');
    }
  }

  // Add parallel marker
  if (task.parallel) {
    labels.push('parallel');
  }

  // Add blocked if has unmet dependencies
  if (task.dependencies && task.dependencies.length > 0) {
    labels.push('blocked');
  }

  return labels;
}

/**
 * Format labels for gh CLI command
 * @param {string[]} labels - List of label names
 * @returns {string} - Formatted string for --label flag
 */
export function formatLabelsForCli(labels) {
  return labels.map(l => `--label "${l}"`).join(' ');
}
