import { mkdir, appendFile } from 'fs/promises';
import { dirname, join } from 'path';
import chalk from 'chalk';

const DEFAULT_FILENAME = 'notes/side-quests.md';

const SUGGESTIONS = {
  agentDetection: 'Capture this idea in your AI tooling backlog after setup.',
  projectInit: 'Add this request to your project TODO once scaffolding finishes.',
  agentLaunch: 'Jot this down and revisit once you are back in the AI workspace.',
  constitution: 'Consider updating your constitution values to reflect this later.',
  specification: 'Create a follow-up spec card once the current feature is ready.',
  plan: 'Incorporate this into the implementation plan details.',
  clarify: 'Log this clarification to revisit before coding.',
  implementation: 'Queue this item for the dog pack during implementation.',
  testing: 'Add this as a test scenario to verify later.',
  feedback: 'Capture this for the next iteration review.',
  nextSteps: 'Schedule this as a follow-up action item.'
};

/**
 * SideQuestManager captures out-of-scope ideas so users feel heard
 * while keeping the main flow focused.
 */
export class SideQuestManager {
  constructor(baseDir = process.cwd(), filePath = DEFAULT_FILENAME) {
    this.baseDir = baseDir;
    this.filePath = join(baseDir, filePath);
  }

  static isSideQuest(value) {
    if (typeof value !== 'string') {
      return false;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return false;
    }

    const indicators = ['?', 'maybe', 'later', 'idea', 'side quest', 'sidetrack', 'another'];
    return indicators.some(token => trimmed.toLowerCase().includes(token)) && trimmed.length > 20;
  }

  async recordSideQuest({ question, input, state }) {
    const folder = dirname(this.filePath);
    await mkdir(folder, { recursive: true });

    const timestamp = new Date().toISOString();
    const suggestion = SUGGESTIONS[state] || 'Review this side quest after the guided flow.';

    const entry = [
      `## ${timestamp}`,
      `**Context:** ${state}`,
      `**Prompt:** ${question}`,
      `**Side quest:** ${input}`,
      '',
      '### Suggested Follow-up',
      `- [ ] ${suggestion}`,
      '',
      '---',
      ''
    ].join('\n');

    await appendFile(this.filePath, entry, 'utf8');

    console.log(chalk.yellow('\n🐕 I saved that idea as a side quest so nothing gets lost.'));
    console.log(chalk.dim(`   Logged in ${this.filePath}`));
  }
}
