/**
 * ASCII Dog Art Collection
 * Delightful dog art for key moments throughout the Spec Kit experience.
 */

import chalk from 'chalk';

/**
 * Welcome / Greeting dog
 */
export const WELCOME = `
${chalk.cyan(`        /^ ^\\`)}
${chalk.cyan(`       / ${chalk.white('0 0')} \\`)}
${chalk.cyan(`       V\\ ${chalk.magenta('Y')} /V`)}
${chalk.cyan(`        / - \\`)}
${chalk.cyan(`       /    |`)}
${chalk.cyan(`      V__) ||`)}
`;

/**
 * Thinking / Analyzing dog
 */
export const THINKING = `
${chalk.yellow(`       __`)}
${chalk.yellow(`   __/  \\__`)}
${chalk.yellow(`  /  ${chalk.white('•')}    ${chalk.white('•')}  \\`)}
${chalk.yellow(`  \\    ${chalk.dim('?')}    /`)}    ${chalk.dim('Hmm, let me think...')}
${chalk.yellow(`   \\      /`)}
${chalk.yellow(`    \\____/`)}
`;

/**
 * Working / Building dog
 */
export const WORKING = `
${chalk.blue(`      /\\_/\\`)}
${chalk.blue(`     ( ${chalk.white('o.o')} )`)}
${chalk.blue(`      > ^ <`)}  ${chalk.dim('*tap tap tap*')}
${chalk.blue(`     /|   |\\`)}
${chalk.blue(`    (_|   |_)`)}
`;

/**
 * Excited / Success dog
 */
export const EXCITED = `
${chalk.green(`    ∩＿∩`)}
${chalk.green(`   ( ${chalk.white('＾▽＾')} )  ${chalk.yellow('✨')}`)}
${chalk.green(`  ＿(つ/ ￣￣￣/＿`)}
${chalk.green(`   ＼/  ${chalk.bold('WOOF!')} /`)}
`;

/**
 * Celebration / Complete dog
 */
export const CELEBRATION = `
${chalk.magenta(`      ${chalk.yellow('★')}    ${chalk.yellow('★')}`)}
${chalk.green(`    \\  ^  ^  /`)}
${chalk.green(`     (  ${chalk.white('◕‿◕')}  )  ${chalk.yellow('🎉')}`)}
${chalk.green(`    <)      (>`)}
${chalk.green(`     \\\\    //`)}
${chalk.green(`      \\\\__//`)}
`;

/**
 * Sleeping / Waiting dog
 */
export const SLEEPING = `
${chalk.dim(`       __`)}
${chalk.dim(`   ___( o)>`)}
${chalk.dim(`   \\ <_. )`)}   ${chalk.blue('z')}${chalk.cyan('Z')}${chalk.blue('z')}
${chalk.dim(`    \`---'`)}
`;

/**
 * Alert / Ready dog
 */
export const ALERT = `
${chalk.yellow(`       /\\___/\\`)}
${chalk.yellow(`      (  ${chalk.white('o o')}  )`)}
${chalk.yellow(`      (  ${chalk.red('=^=')}  )`)}    ${chalk.bold('Ready!')}
${chalk.yellow(`       )     (`)}
${chalk.yellow(`      (       )`)}
${chalk.yellow(`     ( (  )  ) )`)}
${chalk.yellow(`    (__(__)__))`)}
`;

/**
 * Sad / Error dog
 */
export const SAD = `
${chalk.red(`       /\\_/\\`)}
${chalk.red(`      ( ${chalk.white('o')}${chalk.dim('.')}${chalk.white('o')} )`)}
${chalk.red(`       > ${chalk.dim('n')} <`)}    ${chalk.dim('Uh oh...')}
${chalk.red(`      /|   |\\`)}
${chalk.red(`     (_|   |_)`)}
`;

/**
 * Curious / Question dog
 */
export const CURIOUS = `
${chalk.cyan(`      /^ ^\\`)}
${chalk.cyan(`     ( ${chalk.white('◕')} ${chalk.white('◕')} )`)}
${chalk.cyan(`      \\  ${chalk.yellow('?')}  /`)}
${chalk.cyan(`       \\   /`)}
${chalk.cyan(`        \\_/`)}
`;

/**
 * Running / Fast dog
 */
export const RUNNING = `
${chalk.cyan(`    ${chalk.dim('~')} /\\_/\\  ${chalk.dim('~')}`)}
${chalk.cyan(`   ${chalk.dim('~')} ( ${chalk.white('>')}${chalk.white('<')} ) ${chalk.dim('~')}`)}    ${chalk.dim('Zooming!')}
${chalk.cyan(`  ${chalk.dim('≈')}   > ^ <   ${chalk.dim('≈')}`)}
${chalk.cyan(`      /|   |\\`)}
${chalk.cyan(`     ~ ~   ~ ~`)}
`;

/**
 * Cool / Sunglasses dog
 */
export const COOL = `
${chalk.magenta(`       /\\_/\\`)}
${chalk.magenta(`      ( ${chalk.white('⌐■')}${chalk.white('■')} )`)}
${chalk.magenta(`       > ^ <`)}    ${chalk.dim("That's how we do it.")}
${chalk.magenta(`      /|   |\\`)}
${chalk.magenta(`     (_|   |_)`)}
`;

/**
 * Love / Happy dog
 */
export const LOVE = `
${chalk.magenta(`     ${chalk.red('♥')}     ${chalk.red('♥')}`)}
${chalk.magenta(`       /\\_/\\`)}
${chalk.magenta(`      ( ${chalk.white('^.^')} )`)}
${chalk.magenta(`       > ${chalk.red('♥')} <`)}
${chalk.magenta(`      /|   |\\`)}
`;

/**
 * Pixel dog (the OG logo)
 */
export const PIXEL = `
${chalk.magenta(`                                     ██████          ██████`)}
${chalk.magenta(`                                   ██`)}${chalk.white(`▓▓▓▓▓▓`)}${chalk.magenta(`██████████`)}${chalk.white(`▓▓▓▓▓▓`)}${chalk.magenta(`██`)}
${chalk.magenta(`                                   ██`)}${chalk.white(`▓▓▓▓`)}${chalk.magenta(`██          ██`)}${chalk.white(`▓▓▓▓`)}${chalk.magenta(`██`)}
${chalk.magenta(`                                   ██`)}${chalk.white(`▓▓`)}${chalk.magenta(`████    `)}${chalk.white(`▓▓▓▓▓▓`)}${chalk.magenta(`████`)}${chalk.white(`▓▓`)}${chalk.magenta(`██`)}
${chalk.green(`   ███████╗`)}${chalk.magenta(`██████╗`)} ${chalk.green(`███████╗`)} ${chalk.magenta(`██████╗`)}${chalk.magenta(`    ██  ██  ██`)}${chalk.white(`▓▓`)}${chalk.magenta(`██`)}${chalk.white(`▓▓`)}${chalk.magenta(`██  ██`)}
${chalk.green(`   ██╔════╝`)}${chalk.magenta(`██╔══██╗`)}${chalk.green(`██╔════╝`)}${chalk.magenta(`██╔════╝`)}${chalk.magenta(`        ██    `)}${chalk.white(`▓▓▓▓▓▓`)}${chalk.magenta(`██`)}
${chalk.green(`   ███████╗`)}${chalk.magenta(`██████╔╝`)}${chalk.green(`█████╗  `)}${chalk.magenta(`██║    `)}${chalk.magenta(`        ██              ██`)}
${chalk.green(`   ╚════██║`)}${chalk.magenta(`██╔═══╝ `)}${chalk.green(`██╔══╝  `)}${chalk.magenta(`██║    `)}${chalk.magenta(`        ██    ██████    ██`)}
${chalk.green(`   ███████║`)}${chalk.magenta(`██║     `)}${chalk.green(`███████╗`)}${chalk.magenta(`╚██████╗`)}${chalk.magenta(`       ██    ██████    ██`)}
${chalk.green(`   ╚══════╝`)}${chalk.magenta(`╚═╝     `)}${chalk.green(`╚══════╝`)}${chalk.magenta(` ╚═════╝`)}${chalk.magenta(`       ██              ██`)}
${chalk.magenta(`                                            ██    ██    ██`)}
${chalk.magenta(`                                               ████░░████`)}
${chalk.magenta(`                                                 ██░░██`)}
${chalk.magenta(`                                                 ██░░██`)}
${chalk.magenta(`                                                   ████`)}
`;

/**
 * Mini inline dogs for messages
 */
export const MINI = {
  happy: '(ᵔᴥᵔ)',
  sad: '(◞‸◟)',
  excited: '(ノ◕ヮ◕)ノ*:・゚✧',
  thinking: '(◔_◔)',
  love: '(♥ω♥)',
  cool: '( •_•)>⌐■-■',
  wink: '(^_~)',
  run: '─=≡Σ((( つ◕ل͜◕)つ'
};

/**
 * Get a random celebration dog
 */
export function getRandomCelebration() {
  const celebrations = [EXCITED, CELEBRATION, COOL, LOVE];
  return celebrations[Math.floor(Math.random() * celebrations.length)];
}

/**
 * Get dog for a specific mood/moment
 */
export function getDog(mood) {
  const dogs = {
    welcome: WELCOME,
    thinking: THINKING,
    working: WORKING,
    excited: EXCITED,
    celebration: CELEBRATION,
    sleeping: SLEEPING,
    alert: ALERT,
    sad: SAD,
    curious: CURIOUS,
    running: RUNNING,
    cool: COOL,
    love: LOVE,
    pixel: PIXEL
  };
  return dogs[mood] || WELCOME;
}

/**
 * Print a dog with a message
 */
export function printDog(mood, message = '') {
  console.log(getDog(mood));
  if (message) {
    console.log(chalk.bold(message));
    console.log('');
  }
}

export default {
  WELCOME,
  THINKING,
  WORKING,
  EXCITED,
  CELEBRATION,
  SLEEPING,
  ALERT,
  SAD,
  CURIOUS,
  RUNNING,
  COOL,
  LOVE,
  PIXEL,
  MINI,
  getRandomCelebration,
  getDog,
  printDog
};
