import chalk from 'chalk';

const STATE_LABELS = {
  idle: 'Idle',
  welcome: 'Welcome Experience',
  agentDetection: 'AI Agent Setup',
  projectInit: 'Project Scaffolding',
  agentLaunch: 'Agent Workspace',
  constitution: 'Constitution Builder',
  specification: 'Specification Builder',
  plan: 'Implementation Planning',
  clarify: 'Clarification Review',
  implementation: 'Implementation Launch',
  testing: 'Testing & Validation',
  feedback: 'Feature Feedback',
  nextSteps: 'Next Steps',
  complete: 'Completed'
};

/**
 * FlowController keeps the onboarding flow moving forward, providing
 * user-facing status updates so there are no silent gaps between steps.
 */
export class FlowController {
  constructor() {
    this.currentState = 'idle';
    this.stateHistory = [];
    this.awaiting = null;
  }

  transition(nextState, message) {
    this.currentState = nextState;
    this.stateHistory.push({ state: nextState, at: new Date().toISOString() });

    if (message) {
      console.log(chalk.hex('#0099FF')(`\n🐕 ${message}\n`));
    } else if (STATE_LABELS[nextState]) {
      console.log(chalk.hex('#0099FF')(`\n🐕 Moving into ${STATE_LABELS[nextState]}...\n`));
    }
  }

  awaitInput(promptName, promptMessage) {
    this.awaiting = { promptName, at: Date.now() };
    if (promptMessage) {
      console.log(chalk.dim(`…waiting for input: ${promptMessage}`));
    }
  }

  completeInput() {
    this.awaiting = null;
  }

  resumeReminder() {
    if (this.awaiting) {
      console.log(chalk.yellow('\n🐕 Just a nudge—once you answer the last question we can keep going!'));
    }
  }
}
