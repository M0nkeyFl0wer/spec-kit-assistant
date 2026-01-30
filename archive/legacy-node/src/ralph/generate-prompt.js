/**
 * Generate Prompt Module
 * Combines spec artifacts into PROMPT.md for Ralph context
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * Artifact source paths
 * @typedef {Object} ArtifactPaths
 * @property {string} [constitution] - Path to constitution.md
 * @property {string} [spec] - Path to spec.md
 * @property {string} [plan] - Path to plan.md
 * @property {string} [claudeMd] - Path to CLAUDE.md
 */

/**
 * Default artifact search locations relative to project root
 */
const ARTIFACT_LOCATIONS = {
  constitution: [
    'CONSTITUTION.md',
    'constitution.md',
    'specs/constitution.md',
    '.speckit/constitution.md'
  ],
  spec: [
    'SPEC.md',
    'spec.md',
    'specs/spec.md',
    '.speckit/spec.md'
  ],
  plan: [
    'PLAN.md',
    'plan.md',
    'specs/plan.md',
    '.speckit/plan.md'
  ],
  claudeMd: [
    'CLAUDE.md'
  ]
};

/**
 * Find artifact file in common locations
 * @param {string} projectDir - Project root directory
 * @param {string} artifactType - Type of artifact (constitution, spec, plan, claudeMd)
 * @returns {Promise<string | null>} - Path to artifact or null
 */
export async function findArtifact(projectDir, artifactType) {
  const locations = ARTIFACT_LOCATIONS[artifactType] || [];

  for (const location of locations) {
    const fullPath = path.join(projectDir, location);
    if (await fs.pathExists(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

/**
 * Find all spec artifacts in a project
 * @param {string} projectDir - Project root directory
 * @returns {Promise<ArtifactPaths>}
 */
export async function findAllArtifacts(projectDir) {
  const artifacts = {};

  for (const type of Object.keys(ARTIFACT_LOCATIONS)) {
    const found = await findArtifact(projectDir, type);
    if (found) {
      artifacts[type] = found;
    }
  }

  return artifacts;
}

/**
 * Read and truncate artifact content
 * @param {string} filePath - Path to artifact
 * @param {number} maxWords - Maximum words to include
 * @returns {Promise<string>} - Truncated content
 */
async function readArtifact(filePath, maxWords = 500) {
  const content = await fs.readFile(filePath, 'utf8');
  const words = content.split(/\s+/);

  if (words.length <= maxWords) {
    return content;
  }

  // Truncate and add indicator
  return words.slice(0, maxWords).join(' ') + '\n\n[... truncated for context efficiency ...]';
}

/**
 * Extract key sections from an artifact
 * @param {string} content - Artifact content
 * @param {string[]} sections - Section headers to extract
 * @returns {string} - Extracted sections
 */
function extractSections(content, sections) {
  const lines = content.split('\n');
  const extracted = [];
  let capturing = false;
  let currentDepth = 0;

  for (const line of lines) {
    // Check for header
    const headerMatch = line.match(/^(#+)\s+(.+)/);
    if (headerMatch) {
      const depth = headerMatch[1].length;
      const title = headerMatch[2].toLowerCase();

      // Check if this is a section we want
      const isTargetSection = sections.some(s => title.includes(s.toLowerCase()));

      if (isTargetSection) {
        capturing = true;
        currentDepth = depth;
        extracted.push(line);
      } else if (capturing && depth <= currentDepth) {
        // New section at same or higher level, stop capturing
        capturing = false;
      } else if (capturing) {
        extracted.push(line);
      }
    } else if (capturing) {
      extracted.push(line);
    }
  }

  return extracted.join('\n');
}

/**
 * Generate PROMPT.md content
 * @param {ArtifactPaths} artifacts - Paths to artifacts
 * @param {Object} options - Generation options
 * @param {string} options.featureName - Feature name
 * @param {number} [options.maxTotalWords=2000] - Maximum total words
 * @returns {Promise<string>} - PROMPT.md content
 */
export async function generatePromptContent(artifacts, options = {}) {
  const { featureName = 'Feature Implementation', maxTotalWords = 2000 } = options;
  const sections = [];

  // Header
  sections.push(`# ${featureName}`);
  sections.push('');
  sections.push('## Project Context');
  sections.push('');

  // Calculate word budget per section
  const artifactCount = Object.keys(artifacts).filter(k => artifacts[k]).length;
  const wordsPerArtifact = Math.floor(maxTotalWords / Math.max(artifactCount, 1));

  // Constitution - focus on principles
  if (artifacts.constitution) {
    const content = await readArtifact(artifacts.constitution, wordsPerArtifact);
    const principles = extractSections(content, ['principles', 'guidelines', 'rules']);
    sections.push('### Constitution Principles');
    sections.push('');
    sections.push(principles || content.slice(0, 500));
    sections.push('');
  }

  // Spec - focus on requirements
  if (artifacts.spec) {
    const content = await readArtifact(artifacts.spec, wordsPerArtifact);
    const requirements = extractSections(content, ['requirements', 'features', 'overview', 'goals']);
    sections.push('### Specification');
    sections.push('');
    sections.push(requirements || content);
    sections.push('');
  }

  // Plan - include full if short enough
  if (artifacts.plan) {
    const content = await readArtifact(artifacts.plan, wordsPerArtifact);
    sections.push('### Implementation Plan');
    sections.push('');
    sections.push(content);
    sections.push('');
  }

  // CLAUDE.md - extract relevant sections
  if (artifacts.claudeMd) {
    const content = await fs.readFile(artifacts.claudeMd, 'utf8');
    const devNotes = extractSections(content, ['development', 'architecture', 'key files', 'commands']);
    if (devNotes) {
      sections.push('### Development Context');
      sections.push('');
      sections.push(devNotes.slice(0, 300));
      sections.push('');
    }
  }

  // Task tracking reference
  sections.push('## Task Tracking');
  sections.push('');
  sections.push('Progress is tracked in `@fix_plan.md`. Mark tasks complete as you finish them:');
  sections.push('- Change `- [ ]` to `- [x]` when task is done');
  sections.push('- Commit after each task completion');
  sections.push('');

  // Success criteria
  sections.push('## Success Criteria');
  sections.push('');
  sections.push('1. All tasks in @fix_plan.md are checked');
  sections.push('2. Tests pass (run command in @AGENT.md)');
  sections.push('3. Code follows existing patterns');
  sections.push('');

  return sections.join('\n');
}

/**
 * Generate PROMPT.md file
 * @param {string} projectDir - Project root directory
 * @param {string} outputPath - Path to write PROMPT.md
 * @param {Object} options - Generation options
 * @returns {Promise<{success: boolean, artifactsUsed: string[], error?: string}>}
 */
export async function generatePromptFile(projectDir, outputPath, options = {}) {
  try {
    // Find all artifacts
    const artifacts = await findAllArtifacts(projectDir);
    const artifactsUsed = Object.keys(artifacts);

    if (artifactsUsed.length === 0) {
      return {
        success: false,
        artifactsUsed: [],
        error: 'No spec artifacts found (constitution.md, spec.md, plan.md)'
      };
    }

    // Generate content
    const content = await generatePromptContent(artifacts, options);

    // Write file
    await fs.writeFile(outputPath, content);

    return {
      success: true,
      artifactsUsed
    };
  } catch (error) {
    return {
      success: false,
      artifactsUsed: [],
      error: error.message
    };
  }
}
