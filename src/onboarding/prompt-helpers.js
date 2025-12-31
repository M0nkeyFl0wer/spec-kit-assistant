import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Shared prompt helper that captures side quests and keeps users focused.
 */
export async function promptWithGuard(question, state, context = {}) {
  const { flowController, sideQuestManager } = context;

  while (true) {
    if (flowController) {
      flowController.awaitInput(question.name, question.message);
    }

    const answers = await inquirer.prompt([question]);
    const value = answers[question.name];

    if (flowController) {
      flowController.completeInput();
    }

    const isSideQuest =
      typeof value === 'string'
      && sideQuestManager
      && typeof sideQuestManager.constructor?.isSideQuest === 'function'
      && sideQuestManager.constructor.isSideQuest(value);

    if (isSideQuest) {
      await sideQuestManager.recordSideQuest({
        question: question.message,
        input: value,
        state
      });
      console.log(chalk.white('\nLet\'s keep the main flow moving—mind giving a focused answer?'));
      continue;
    }

    return value;
  }
}
