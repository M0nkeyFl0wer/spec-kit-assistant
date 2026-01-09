/**
 * Ralph Integration Module
 * Bridges Spec Kit structured planning to Ralph autonomous execution
 *
 * @module ralph
 */

// Parse tasks
export {
  parseTaskLine,
  parsePhaseHeader,
  parseTasksContent,
  parseTasksFile,
  convertToFixPlan,
  generateFixPlan,
  findTasksFile
} from './parse-tasks.js';

// Generate PROMPT.md
export {
  findArtifact,
  findAllArtifacts,
  generatePromptContent,
  generatePromptFile
} from './generate-prompt.js';

// Generate @AGENT.md
export {
  detectPackageManager,
  extractFromPackageJson,
  extractFromClaudeMd,
  detectCommands,
  generateAgentContent,
  generateAgentFile
} from './generate-agent.js';

// Init command
export {
  initRalphProject,
  cli as initCli
} from './init.js';

// Start command
export {
  checkRalphInstalled,
  verifyRequiredFiles,
  startRalph,
  cli as startCli
} from './start.js';

// Status command
export {
  parseFixPlan,
  getProgress,
  displayProgress,
  getStatusJson,
  cli as statusCli
} from './status.js';

// Remote execution
export {
  getRemoteConfig,
  validateConfig,
  buildSshTarget,
  testConnection,
  syncToRemote,
  execRemote,
  startRemoteRalph,
  getRemoteProgress,
  syncFromRemote,
  deployAndRun,
  cli as remoteCli
} from './remote.js';
