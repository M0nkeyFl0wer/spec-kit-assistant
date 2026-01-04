/**
 * Agent Detector
 * Detects installed AI coding agents and their status.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

/**
 * Known AI coding agents
 */
export const AgentType = {
  CLAUDE_CODE: 'claude',
  GITHUB_COPILOT: 'copilot',
  GEMINI_CLI: 'gemini',
  CURSOR: 'cursor',
  UNKNOWN: 'unknown'
};

/**
 * Agent metadata
 */
const AGENTS = {
  [AgentType.CLAUDE_CODE]: {
    name: 'Claude Code',
    commands: ['claude'],
    configPaths: [
      join(homedir(), '.claude'),
      join(homedir(), '.config', 'claude')
    ],
    installCmd: 'npm install -g @anthropic-ai/claude-code',
    launchCmd: 'claude',
    docs: 'https://claude.ai/claude-code'
  },
  [AgentType.GITHUB_COPILOT]: {
    name: 'GitHub Copilot',
    commands: ['gh copilot'],
    configPaths: [
      join(homedir(), '.config', 'gh')
    ],
    installCmd: 'gh extension install github/gh-copilot',
    launchCmd: 'gh copilot',
    docs: 'https://github.com/features/copilot'
  },
  [AgentType.GEMINI_CLI]: {
    name: 'Gemini CLI',
    commands: ['gemini'],
    configPaths: [
      join(homedir(), '.config', 'gemini')
    ],
    installCmd: 'npm install -g @google/gemini-cli',
    launchCmd: 'gemini',
    docs: 'https://github.com/google-gemini/gemini-cli'
  },
  [AgentType.CURSOR]: {
    name: 'Cursor',
    commands: ['cursor'],
    configPaths: [
      join(homedir(), '.cursor')
    ],
    installCmd: 'Download from https://cursor.sh',
    launchCmd: 'cursor',
    docs: 'https://cursor.sh'
  }
};

/**
 * Check if a command exists
 */
function commandExists(cmd) {
  try {
    execSync(`which ${cmd.split(' ')[0]}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if running inside an agent session
 */
export function detectCurrentAgent() {
  // Check environment variables that agents set
  if (process.env.CLAUDE_CODE_SESSION || process.env.CLAUDE_CODE) {
    return AgentType.CLAUDE_CODE;
  }
  if (process.env.GITHUB_COPILOT_SESSION) {
    return AgentType.GITHUB_COPILOT;
  }
  if (process.env.GEMINI_SESSION) {
    return AgentType.GEMINI_CLI;
  }

  // Check if we're in a terminal spawned by an agent
  const termProgram = process.env.TERM_PROGRAM || '';
  if (termProgram.toLowerCase().includes('cursor')) {
    return AgentType.CURSOR;
  }

  return null;
}

/**
 * Detect all installed agents
 */
export function detectInstalledAgents() {
  const installed = [];

  for (const [type, meta] of Object.entries(AGENTS)) {
    const hasCommand = meta.commands.some(cmd => commandExists(cmd));
    const hasConfig = meta.configPaths.some(path => existsSync(path));

    if (hasCommand || hasConfig) {
      installed.push({
        type,
        ...meta,
        hasCommand,
        hasConfig,
        isConfigured: hasConfig
      });
    }
  }

  return installed;
}

/**
 * Get the preferred/primary agent
 * Preference: Claude > Copilot > Gemini > Cursor
 */
export function getPreferredAgent() {
  const installed = detectInstalledAgents();

  const preference = [
    AgentType.CLAUDE_CODE,
    AgentType.GITHUB_COPILOT,
    AgentType.GEMINI_CLI,
    AgentType.CURSOR
  ];

  for (const type of preference) {
    const agent = installed.find(a => a.type === type);
    if (agent) return agent;
  }

  return null;
}

/**
 * Get agent metadata by type
 */
export function getAgentMeta(type) {
  return AGENTS[type] || null;
}

/**
 * Get all supported agents (for display)
 */
export function getAllAgents() {
  return Object.entries(AGENTS).map(([type, meta]) => ({
    type,
    ...meta
  }));
}
