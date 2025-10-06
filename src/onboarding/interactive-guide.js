/**
 * Interactive Guide - Spec the dog leads users through constitution and spec creation
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const dogTalking = chalk.hex('#0099FF')(`
     ∧＿∧
    (｡･ω･｡)ﾉ  Let me ask you some questions!
    ⊂　　 ノ
     しーＪ
`);

const dogListening = chalk.cyan(`
     ∧＿∧
    (｡･ω･｡)  I'm listening...
    ⊂　　 ノ
     しーＪ
`);

const dogWriting = chalk.green(`
     ∧＿∧
    (｡･∀･｡)  Writing your constitution...
    ⊂　　 ノ
     しーＪ
`);

/**
 * Guide user through constitution creation
 */
export async function guideConstitution(projectPath) {
  console.log(dogTalking);
  console.log(chalk.hex('#0099FF').bold('First, let\'s create your project constitution!\n'));
  console.log(chalk.dim('This defines the principles and values for your project.\n'));

  const questions = [
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project called?',
      validate: (input) => input.length > 0 || 'Project name is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Describe your project in one sentence:',
      validate: (input) => input.length > 0 || 'Description is required'
    },
    {
      type: 'input',
      name: 'purpose',
      message: 'What problem does this project solve?'
    },
    {
      type: 'input',
      name: 'values',
      message: 'What are the core values? (e.g., simplicity, performance, user-friendly)',
      default: 'simplicity, quality, user-first'
    },
    {
      type: 'input',
      name: 'principles',
      message: 'Any key development principles? (e.g., test-driven, accessible, secure)',
      default: 'spec-driven, well-tested, maintainable'
    }
  ];

  const answers = await inquirer.prompt(questions);

  console.log(dogWriting);

  // Create constitution
  const constitution = `# ${answers.projectName} - Project Constitution

## Vision
${answers.description}

## Problem Statement
${answers.purpose}

## Core Values
${answers.values.split(',').map(v => `- ${v.trim()}`).join('\n')}

## Development Principles
${answers.principles.split(',').map(p => `- ${p.trim()}`).join('\n')}

## Success Criteria
- Clear specifications before implementation
- High code quality and test coverage
- User-centric design and experience
- Maintainable and well-documented code

---
*Created with Spec Kit Assistant 🐕*
`;

  const constitutionPath = join(projectPath, 'constitution.md');
  writeFileSync(constitutionPath, constitution);

  console.log(chalk.green(`\n✅ Constitution created at: ${constitutionPath}\n`));

  return answers;
}

/**
 * Guide user through spec creation
 */
export async function guideSpec(projectPath, constitutionAnswers) {
  console.log(dogTalking);
  console.log(chalk.hex('#0099FF').bold('Now let\'s create your first specification!\n'));
  console.log(chalk.dim('This describes WHAT to build (not how).\n'));

  const questions = [
    {
      type: 'input',
      name: 'featureName',
      message: 'What feature do you want to build?',
      validate: (input) => input.length > 0 || 'Feature name is required'
    },
    {
      type: 'input',
      name: 'userStory',
      message: 'As a [user], I want to [action], so that [benefit]:',
      validate: (input) => input.length > 0 || 'User story is required'
    },
    {
      type: 'input',
      name: 'requirements',
      message: 'What are the key requirements? (comma-separated)',
      validate: (input) => input.length > 0 || 'At least one requirement is needed'
    },
    {
      type: 'input',
      name: 'acceptance',
      message: 'How will you know it\'s done? (acceptance criteria, comma-separated)',
      validate: (input) => input.length > 0 || 'Acceptance criteria required'
    }
  ];

  const answers = await inquirer.prompt(questions);

  console.log(dogWriting);

  // Create specs directory if it doesn't exist
  const specsDir = join(projectPath, 'specs');
  if (!existsSync(specsDir)) {
    mkdirSync(specsDir);
  }

  // Create spec file
  const specFileName = answers.featureName.toLowerCase().replace(/\s+/g, '-');
  const spec = `# ${answers.featureName}

## User Story
${answers.userStory}

## Requirements
${answers.requirements.split(',').map(r => `- ${r.trim()}`).join('\n')}

## Acceptance Criteria
${answers.acceptance.split(',').map(a => `- [ ] ${a.trim()}`).join('\n')}

## Technical Considerations
_To be defined during implementation_

## Dependencies
_None identified yet_

---
*Spec created with Spec Kit Assistant 🐕*
`;

  const specPath = join(specsDir, `${specFileName}.md`);
  writeFileSync(specPath, spec);

  console.log(chalk.green(`\n✅ Spec created at: ${specPath}\n`));

  return { ...answers, specPath };
}

/**
 * Guide to next steps based on AI choice
 */
export async function guideNextSteps(agent, projectPath, specPath) {
  console.log(dogTalking);
  console.log(chalk.hex('#0099FF').bold('Perfect! Your project is ready to build!\n'));

  if (agent === 'claude') {
    console.log(chalk.white('🤖 Now let\'s launch Claude Code to implement this!\n'));
    console.log(chalk.cyan('I\'ll open your project in Claude Code and you can use:\n'));
    console.log(chalk.dim('  /implement - Start building the feature'));
    console.log(chalk.dim('  /review    - Review the code'));
    console.log(chalk.dim('  /test      - Generate tests\n'));

    // Try to open in VSCode/Claude Code
    try {
      const { spawnSync } = await import('child_process');
      spawnSync('code', [projectPath], { shell: false });
      console.log(chalk.green('✅ Opened in VSCode/Claude Code!\n'));
    } catch {
      console.log(chalk.yellow('💡 Manually open this folder in Claude Code:\n'));
      console.log(chalk.cyan(`   ${projectPath}\n`));
    }

  } else if (agent === 'opencode') {
    console.log(chalk.white('🤖 Now let\'s use DeepSeek to implement this!\n'));
    console.log(chalk.cyan('Option 1: Open WebUI (ChatGPT-like interface)'));
    console.log(chalk.dim(`  Open: http://localhost:3000`));
    console.log(chalk.dim(`  Share your spec with DeepSeek!\n`));

    console.log(chalk.cyan('Option 2: CLI (terminal interface)'));
    console.log(chalk.dim(`  Run: ollama run deepseek-coder:6.7b`));
    console.log(chalk.dim(`  Paste your spec and ask it to implement!\n`));

  } else {
    console.log(chalk.white('🤖 Next steps:\n'));
    console.log(chalk.dim('1. Open your project in your AI tool'));
    console.log(chalk.dim(`2. Share the spec: ${specPath}`));
    console.log(chalk.dim('3. Ask the AI to implement it!\n'));
  }

  console.log(chalk.green('🐕 Woof! I\'ll be here if you need help. Just run this tool again!\n'));
}
