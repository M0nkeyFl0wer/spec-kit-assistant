import chalk from 'chalk';
import { join, dirname, basename } from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { promptWithGuard } from './prompt-helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function ensureDir(path) {
  await fs.mkdir(path, { recursive: true });
}

function formatList(values = []) {
  return values.map(value => `- ${value}`).join('\n');
}

async function guidePlan(projectPath, specResult, context = {}) {
  const { flowController } = context;
  flowController?.transition('plan', 'Designing the implementation plan.');

  const planDir = specResult.featureDir || dirname(specResult.specPath);
  await ensureDir(planDir);
  const planPath = join(planDir, 'plan.md');

  const planSummary = await promptWithGuard({
    type: 'input',
    name: 'planSummary',
    message: 'Summarize the planned implementation for this feature:',
    default: specResult.requirements
      ? `Focus on: ${specResult.requirements}`
      : `Implement ${specResult.featureName}`
  }, 'plan', context);

  const language = await promptWithGuard({
    type: 'input',
    name: 'language',
    message: 'Primary language / framework:',
    default: 'NEEDS CLARIFICATION'
  }, 'plan', context);

  const dependencies = await promptWithGuard({
    type: 'input',
    name: 'dependencies',
    message: 'Primary dependencies (comma-separated):',
    default: 'NEEDS CLARIFICATION'
  }, 'plan', context);

  const testing = await promptWithGuard({
    type: 'input',
    name: 'testing',
    message: 'Testing approach:',
    default: 'NEEDS CLARIFICATION'
  }, 'plan', context);

  const constraints = await promptWithGuard({
    type: 'input',
    name: 'constraints',
    message: 'Key constraints to respect (performance, scale, etc):',
    default: 'NEEDS CLARIFICATION'
  }, 'plan', context);

  const structureNotes = await promptWithGuard({
    type: 'input',
    name: 'structureNotes',
    message: 'Describe the project structure or modules you expect to touch:',
    default: 'Document structure decisions here.'
  }, 'plan', context);

  const planContent = `# Implementation Plan: ${specResult.featureName}

**Spec**: ./spec.md
**Date**: ${new Date().toISOString().split('T')[0]}

## Summary
${planSummary}

## Technical Context
- Language/Framework: ${language}
- Dependencies: ${dependencies}
- Testing Strategy: ${testing}
- Constraints: ${constraints}

## Constitution Check
- Review constitution.md to ensure values and principles are respected.
- Capture any variances in the Clarification Log.

## Project Structure Notes
${structureNotes}

## Next Steps
- Prepare clarification questions (if any).
- Confirm required dependencies are available.
- Coordinate with Big Pickle or your AI agent before coding.
`;

  await fs.writeFile(planPath, planContent, 'utf8');
  console.log(chalk.green(`\n✅ Plan created at: ${planPath}\n`));

  return { planPath, planSummary };
}

async function guideClarify(projectPath, specResult, context = {}) {
  const { flowController } = context;
  flowController?.transition('clarify', 'Collecting clarifications and assumptions.');

  const featureDir = specResult.featureDir || dirname(specResult.specPath);
  await ensureDir(featureDir);
  const clarifyPath = join(featureDir, 'clarify.md');

  const questions = [];
  let addMore = true;

  while (addMore) {
    const question = await promptWithGuard({
      type: 'input',
      name: 'clarifyQuestion',
      message: 'Add a clarification question or assumption (leave blank to stop):',
      default: ''
    }, 'clarify', context);

    const trimmed = (question || '').trim();
    if (trimmed) {
      questions.push(trimmed);
    }

    addMore = await promptWithGuard({
      type: 'confirm',
      name: 'addMoreClarify',
      message: 'Add another clarification item?',
      default: false
    }, 'clarify', context);
  }

  const clarifyContent = questions.length
    ? `# Clarification Log\n\n${formatList(questions)}\n`
    : '# Clarification Log\n\n- No blocking clarifications at this time.\n';

  await fs.writeFile(clarifyPath, clarifyContent, 'utf8');
  console.log(chalk.green(`\n✅ Clarifications captured at: ${clarifyPath}\n`));

  return { clarifyPath, questions };
}

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

async function runDogPack(projectRoot, description) {
  console.log(chalk.hex('#EC4899')('\n🐕 Deploying the dog assistant pack (Claude Flow style)...\n'));
  await runCommand('node', ['enhanced-swarm-orchestrator.js', 'deploy', description], {
    cwd: projectRoot
  });
}

async function runTestPack(projectRoot) {
  console.log(chalk.hex('#EC4899')('\n🧪 Summoning the red-team test pack...\n'));
  await runCommand('node', ['red-team-unit-test-swarm.js'], {
    cwd: projectRoot
  });
}

async function guideImplementation(projectPath, specResult, context = {}) {
  const { flowController } = context;
  flowController?.transition('implementation', 'Kicking off implementation with the dog pack.');

  const rootDir = join(__dirname, '..', '..'); // repo root where spec-assistant.js lives
  const projectRoot = projectPath;

  const installDeps = await promptWithGuard({
    type: 'confirm',
    name: 'installDeps',
    message: 'Install project dependencies before implementation?',
    default: false
  }, 'implementation', context);

  if (installDeps) {
    const installCommand = await promptWithGuard({
      type: 'input',
      name: 'installCommand',
      message: 'Enter the install command to run (e.g., npm install, pip install -r requirements.txt):',
      default: 'npm install'
    }, 'implementation', context);

    const [command, ...args] = installCommand.split(' ');
    try {
      await runCommand(command, args, { cwd: projectRoot });
      console.log(chalk.green('\n✅ Dependencies installed.\n'));
    } catch (error) {
      console.log(chalk.red(`\n❌ Failed to install dependencies: ${error.message}\n`));
    }
  }

  const runPack = await promptWithGuard({
    type: 'confirm',
    name: 'runDogPack',
    message: 'Launch the dog assistant pack (Claude Flow methodology) to start implementation?',
    default: true
  }, 'implementation', context);

  if (runPack) {
    try {
      await runDogPack(rootDir, `Implement feature: ${specResult.featureName}`);
    } catch (error) {
      console.log(chalk.red(`\n❌ Dog pack deployment encountered an issue: ${error.message}\n`));
    }
  }

  flowController?.transition('testing', 'Time to validate the build with automated checks.');
  const runTests = await promptWithGuard({
    type: 'confirm',
    name: 'runTests',
    message: 'Run the red-team test pack now?',
    default: false
  }, 'testing', context);

  if (runTests) {
    try {
      await runTestPack(rootDir);
    } catch (error) {
      console.log(chalk.red(`\n❌ Test pack run failed: ${error.message}\n`));
    }
  }

  flowController?.transition('feedback', 'Gathering feedback or preparing for the next iteration.');
}

export async function runSpecKitGuidedFlow(projectPath, agent, context = {}) {
  const { flowController } = context;
  const guidedResults = {
    constitution: null,
    features: []
  };

  const { guideConstitution, guideSpec, guideNextSteps } = await import('./interactive-guide.js');

  flowController?.transition('constitution', 'Let’s capture your project principles.');
  const constitutionAnswers = await guideConstitution(projectPath, context);
  guidedResults.constitution = constitutionAnswers;

  let continueLoop = true;
  while (continueLoop) {
    flowController?.transition('specification', 'Defining the next specification.');
    const specResult = await guideSpec(projectPath, constitutionAnswers, context);

    const planResult = await guidePlan(projectPath, specResult, context);
    const clarifyResult = await guideClarify(projectPath, specResult, context);
    await guideImplementation(projectPath, specResult, context);

    guidedResults.features.push({
      spec: specResult,
      plan: planResult,
      clarify: clarifyResult
    });

    continueLoop = await promptWithGuard({
      type: 'confirm',
      name: 'addAnotherFeature',
      message: 'Would you like to add another feature?',
      default: false
    }, 'feedback', context);
  }

  const lastSpec = guidedResults.features.at(-1)?.spec;
  flowController?.transition('nextSteps', 'Wrapping up with next steps.');
  await guideNextSteps(agent, projectPath, lastSpec?.specPath, context);

  flowController?.transition('complete', 'All set! You’re ready to build with Spec Kit.');
  return guidedResults;
}
