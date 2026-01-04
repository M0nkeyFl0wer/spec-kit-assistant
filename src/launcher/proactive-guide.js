/**
 * Proactive Guide
 * Provides smart suggestions and nudges when users seem stuck or unclear.
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { analyzeProjectState, WorkflowStage } from './workflow-state.js';
import { getAvailableActions } from './project-runner.js';
import fs from 'fs-extra';
import { join } from 'path';

/**
 * Helpful prompts for each workflow stage
 */
const STAGE_PROMPTS = {
  [WorkflowStage.SPEC_INIT]: {
    question: "What would you like to build?",
    hints: [
      "Describe the feature in plain language",
      "Think about who will use it and why",
      "What problem does it solve?"
    ],
    examples: [
      "A user authentication system with OAuth",
      "A dashboard showing real-time metrics",
      "An API endpoint for processing payments",
      "A CLI tool for automating deployments"
    ],
    nextCommand: (answer) => `/specify "${answer}"`
  },

  [WorkflowStage.SPEC_CREATED]: {
    question: "Your spec is ready! Should we plan the implementation?",
    hints: [
      "Planning analyzes your codebase for patterns",
      "It identifies files that need changes",
      "Creates an architectural approach"
    ],
    examples: [],
    nextCommand: () => `/plan`
  },

  [WorkflowStage.PLAN_CREATED]: {
    question: "Plan is complete! Ready to break it into tasks?",
    hints: [
      "Tasks are small, actionable work items",
      "Each task can be completed independently",
      "They're ordered by dependencies"
    ],
    examples: [],
    nextCommand: () => `/tasks`
  },

  [WorkflowStage.TASKS_CREATED]: {
    question: "Tasks are ready! Want to start implementing?",
    hints: [
      "Implementation follows the task order",
      "Each task includes acceptance criteria",
      "Tests are written alongside code"
    ],
    examples: [],
    nextCommand: () => `/implement`
  },

  [WorkflowStage.IMPLEMENTING]: {
    question: "Implementation in progress. How can I help?",
    hints: [
      "I can run tests to check progress",
      "I can help debug issues",
      "I can review what's been done"
    ],
    examples: [
      "Run the tests",
      "Show me the current task",
      "What's left to do?",
      "Help me with this error"
    ],
    nextCommand: null
  },

  [WorkflowStage.COMPLETE]: {
    question: "This feature is complete! What's next?",
    hints: [
      "You could start a new feature",
      "Or improve what you've built",
      "Or take a well-deserved break!"
    ],
    examples: [
      "Start a new feature",
      "Add tests for edge cases",
      "Refactor for performance",
      "Deploy to production"
    ],
    nextCommand: null
  }
};

/**
 * Common user intents and how to handle them
 */
const INTENT_HANDLERS = {
  greeting: {
    patterns: [/^(hi|hello|hey|yo|sup)/i, /^good (morning|afternoon|evening)/i],
    response: async (projectPath) => {
      const stage = await analyzeProjectState(projectPath);
      const prompt = STAGE_PROMPTS[stage] || STAGE_PROMPTS[WorkflowStage.SPEC_INIT];

      return {
        message: `🐕 Woof! Good to see you!\n\n${prompt.question}`,
        suggestions: prompt.examples.slice(0, 3),
        nextCommand: prompt.nextCommand
      };
    }
  },

  confused: {
    patterns: [/^(i don'?t know|not sure|confused|help|what do i do|stuck)/i, /^\?+$/],
    response: async (projectPath) => {
      const stage = await analyzeProjectState(projectPath);
      const prompt = STAGE_PROMPTS[stage] || STAGE_PROMPTS[WorkflowStage.SPEC_INIT];

      return {
        message: `🐕 No worries! Let me help.\n\n${prompt.hints.map(h => `• ${h}`).join('\n')}`,
        suggestions: prompt.examples,
        nextCommand: prompt.nextCommand
      };
    }
  },

  whatNext: {
    patterns: [/^(what'?s? next|now what|what should i do|next step)/i],
    response: async (projectPath) => {
      const stage = await analyzeProjectState(projectPath);
      const prompt = STAGE_PROMPTS[stage] || STAGE_PROMPTS[WorkflowStage.SPEC_INIT];

      return {
        message: `🐕 Here's what's next:\n\n${prompt.question}`,
        suggestions: prompt.examples,
        nextCommand: prompt.nextCommand
      };
    }
  },

  status: {
    patterns: [/^(status|where am i|progress|how far)/i],
    response: async (projectPath) => {
      const stage = await analyzeProjectState(projectPath);
      const stageLabels = {
        [WorkflowStage.SPEC_INIT]: 'Ready to create specification',
        [WorkflowStage.SPEC_CREATED]: 'Spec complete, ready to plan',
        [WorkflowStage.PLAN_CREATED]: 'Plan complete, ready for tasks',
        [WorkflowStage.TASKS_CREATED]: 'Tasks ready, time to implement!',
        [WorkflowStage.IMPLEMENTING]: 'Implementation in progress',
        [WorkflowStage.COMPLETE]: 'Feature complete! 🎉'
      };

      return {
        message: `🐕 Current status: ${stageLabels[stage] || stage}`,
        suggestions: [],
        nextCommand: STAGE_PROMPTS[stage]?.nextCommand
      };
    }
  }
};

/**
 * Analyze user input and provide guidance
 */
export async function analyzeAndGuide(userInput, projectPath) {
  const input = (userInput || '').trim();

  // Check for known intents
  for (const [intent, handler] of Object.entries(INTENT_HANDLERS)) {
    for (const pattern of handler.patterns) {
      if (pattern.test(input)) {
        return handler.response(projectPath);
      }
    }
  }

  // No clear intent - provide contextual help
  return getContextualHelp(projectPath);
}

/**
 * Get contextual help based on project state
 */
export async function getContextualHelp(projectPath) {
  const stage = await analyzeProjectState(projectPath);
  const prompt = STAGE_PROMPTS[stage] || STAGE_PROMPTS[WorkflowStage.SPEC_INIT];

  return {
    message: prompt.question,
    hints: prompt.hints,
    suggestions: prompt.examples,
    nextCommand: prompt.nextCommand
  };
}

/**
 * Interactive guided prompt - asks the right question based on state
 */
export async function runGuidedPrompt(projectPath, options = {}) {
  const stage = await analyzeProjectState(projectPath);
  const prompt = STAGE_PROMPTS[stage] || STAGE_PROMPTS[WorkflowStage.SPEC_INIT];

  console.log(chalk.cyan(`\n🐕 ${prompt.question}\n`));

  if (prompt.hints.length > 0) {
    console.log(chalk.dim(prompt.hints.map(h => `   💡 ${h}`).join('\n')));
    console.log('');
  }

  // For stages that need user input
  if (stage === WorkflowStage.SPEC_INIT) {
    // Show examples
    if (prompt.examples.length > 0) {
      console.log(chalk.dim('Examples:'));
      prompt.examples.forEach((ex, i) => {
        console.log(chalk.dim(`   ${i + 1}. "${ex}"`));
      });
      console.log('');
    }

    const { description } = await inquirer.prompt([{
      type: 'input',
      name: 'description',
      message: 'Describe your feature:',
      validate: input => input.trim().length > 0 || 'Please describe what you want to build'
    }]);

    const command = prompt.nextCommand(description);
    console.log(chalk.green(`\n✨ Great! Run this to get started:\n`));
    console.log(chalk.bold(`   ${command}\n`));

    return { stage, command, description };
  }

  // For stages that just need confirmation
  if (prompt.nextCommand) {
    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: 'Ready to proceed?',
      default: true
    }]);

    if (proceed) {
      const command = typeof prompt.nextCommand === 'function'
        ? prompt.nextCommand()
        : prompt.nextCommand;

      console.log(chalk.green(`\n✨ Running: ${command}\n`));
      return { stage, command, proceed: true };
    }
  }

  return { stage, proceed: false };
}

/**
 * Generate a helpful nudge message
 */
export function getNudge(stage) {
  const nudges = {
    [WorkflowStage.SPEC_INIT]: [
      "🐕 What are we building today?",
      "🐕 Ready when you are! Just tell me what you need.",
      "🐕 Got an idea? Let's turn it into a spec!",
      "🐕 Describe your feature and I'll help you plan it."
    ],
    [WorkflowStage.SPEC_CREATED]: [
      "🐕 Your spec looks good! Time to plan?",
      "🐕 Ready to figure out how to build this?",
      "🐕 Want me to analyze your codebase and create a plan?"
    ],
    [WorkflowStage.PLAN_CREATED]: [
      "🐕 Plan's ready! Let's break it into tasks?",
      "🐕 Time to create actionable tasks!",
      "🐕 Ready to get specific about what needs to be done?"
    ],
    [WorkflowStage.TASKS_CREATED]: [
      "🐕 Tasks are lined up! Ready to start coding?",
      "🐕 Everything's planned out. Time to build!",
      "🐕 Let's start implementing!"
    ],
    [WorkflowStage.IMPLEMENTING]: [
      "🐕 How's it going? Need any help?",
      "🐕 Making progress! Want me to run the tests?",
      "🐕 Keep going! You've got this!"
    ],
    [WorkflowStage.COMPLETE]: [
      "🐕 Woof! Great job! What's next?",
      "🐕 Feature done! Ready for another adventure?",
      "🐕 Nice work! Take a break or start something new?"
    ]
  };

  const stageNudges = nudges[stage] || nudges[WorkflowStage.SPEC_INIT];
  return stageNudges[Math.floor(Math.random() * stageNudges.length)];
}

/**
 * Check if user input seems unclear or needs guidance
 */
export function needsGuidance(input) {
  const unclear = [
    /^\.{2,}$/,           // Just dots
    /^\s*$/,              // Empty or whitespace
    /^(um+|uh+|er+|hmm+)/i, // Hesitation
    /^idk$/i,             // I don't know
    /^\?+$/,              // Just question marks
    /^(help|stuck|confused)/i
  ];

  return unclear.some(pattern => pattern.test(input?.trim() || ''));
}

/**
 * Format suggestions as a nice list
 */
export function formatSuggestions(suggestions, prefix = '💡') {
  if (!suggestions || suggestions.length === 0) return '';

  return suggestions
    .map((s, i) => `   ${prefix} ${s}`)
    .join('\n');
}
