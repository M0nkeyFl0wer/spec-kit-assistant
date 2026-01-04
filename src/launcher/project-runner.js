/**
 * Project Runner Detector
 * Detects how to run, test, and serve a project based on its structure.
 */

import fs from 'fs-extra';
import { join } from 'path';

/**
 * Action types
 */
export const ActionType = {
  TEST: 'test',
  DEV: 'dev',
  BUILD: 'build',
  START: 'start',
  SERVE: 'serve',
  DEPLOY: 'deploy',
  LINT: 'lint',
  FORMAT: 'format'
};

/**
 * Detect available run commands for a project
 */
export async function detectProjectCommands(projectPath) {
  const commands = {
    test: null,
    dev: null,
    build: null,
    start: null,
    serve: null,
    deploy: null,
    lint: null,
    format: null,
    custom: []
  };

  // Check for package.json (Node.js)
  const packageJsonPath = join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    try {
      const pkg = await fs.readJson(packageJsonPath);
      const scripts = pkg.scripts || {};

      // Map common script names
      if (scripts.test) commands.test = { cmd: 'npm test', type: 'npm', script: 'test' };
      if (scripts.dev) commands.dev = { cmd: 'npm run dev', type: 'npm', script: 'dev' };
      if (scripts.start) commands.start = { cmd: 'npm start', type: 'npm', script: 'start' };
      if (scripts.build) commands.build = { cmd: 'npm run build', type: 'npm', script: 'build' };
      if (scripts.serve) commands.serve = { cmd: 'npm run serve', type: 'npm', script: 'serve' };
      if (scripts.deploy) commands.deploy = { cmd: 'npm run deploy', type: 'npm', script: 'deploy' };
      if (scripts.lint) commands.lint = { cmd: 'npm run lint', type: 'npm', script: 'lint' };
      if (scripts.format) commands.format = { cmd: 'npm run format', type: 'npm', script: 'format' };

      // Check for common alternatives
      if (!commands.dev && scripts['dev:start']) commands.dev = { cmd: 'npm run dev:start', type: 'npm', script: 'dev:start' };
      if (!commands.dev && scripts.develop) commands.dev = { cmd: 'npm run develop', type: 'npm', script: 'develop' };
      if (!commands.dev && scripts.watch) commands.dev = { cmd: 'npm run watch', type: 'npm', script: 'watch' };

      // Add interesting custom scripts
      const skipScripts = ['test', 'dev', 'start', 'build', 'serve', 'deploy', 'lint', 'format',
                          'pretest', 'posttest', 'prebuild', 'postbuild', 'prepare', 'prepublish'];
      for (const [name, script] of Object.entries(scripts)) {
        if (!skipScripts.includes(name) && !name.startsWith('pre') && !name.startsWith('post')) {
          commands.custom.push({
            name,
            cmd: `npm run ${name}`,
            type: 'npm',
            script: name,
            description: typeof script === 'string' ? script.slice(0, 50) : ''
          });
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check for pyproject.toml or setup.py (Python)
  const pyprojectPath = join(projectPath, 'pyproject.toml');
  const setupPyPath = join(projectPath, 'setup.py');
  const hasPython = await fs.pathExists(pyprojectPath) || await fs.pathExists(setupPyPath);

  if (hasPython) {
    // Check for common Python test frameworks
    if (!commands.test) {
      if (await fs.pathExists(join(projectPath, 'pytest.ini')) ||
          await fs.pathExists(join(projectPath, 'tests'))) {
        commands.test = { cmd: 'pytest', type: 'python', tool: 'pytest' };
      } else {
        commands.test = { cmd: 'python -m pytest', type: 'python', tool: 'pytest' };
      }
    }

    // Check for main.py or app.py
    if (!commands.start) {
      if (await fs.pathExists(join(projectPath, 'main.py'))) {
        commands.start = { cmd: 'python main.py', type: 'python', file: 'main.py' };
      } else if (await fs.pathExists(join(projectPath, 'app.py'))) {
        commands.start = { cmd: 'python app.py', type: 'python', file: 'app.py' };
      }
    }

    // Check for Flask/FastAPI
    if (!commands.dev) {
      if (await fs.pathExists(join(projectPath, 'app.py'))) {
        commands.dev = { cmd: 'flask run --reload', type: 'python', tool: 'flask' };
      }
    }
  }

  // Check for Makefile
  const makefilePath = join(projectPath, 'Makefile');
  if (await fs.pathExists(makefilePath)) {
    try {
      const makefile = await fs.readFile(makefilePath, 'utf8');
      const targets = makefile.match(/^([a-zA-Z_-]+):/gm);

      if (targets) {
        const targetNames = targets.map(t => t.replace(':', ''));

        if (targetNames.includes('test') && !commands.test) {
          commands.test = { cmd: 'make test', type: 'make', target: 'test' };
        }
        if (targetNames.includes('dev') && !commands.dev) {
          commands.dev = { cmd: 'make dev', type: 'make', target: 'dev' };
        }
        if (targetNames.includes('build') && !commands.build) {
          commands.build = { cmd: 'make build', type: 'make', target: 'build' };
        }
        if (targetNames.includes('run') && !commands.start) {
          commands.start = { cmd: 'make run', type: 'make', target: 'run' };
        }
        if (targetNames.includes('deploy') && !commands.deploy) {
          commands.deploy = { cmd: 'make deploy', type: 'make', target: 'deploy' };
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  // Check for Cargo.toml (Rust)
  if (await fs.pathExists(join(projectPath, 'Cargo.toml'))) {
    if (!commands.test) commands.test = { cmd: 'cargo test', type: 'cargo', action: 'test' };
    if (!commands.build) commands.build = { cmd: 'cargo build', type: 'cargo', action: 'build' };
    if (!commands.start) commands.start = { cmd: 'cargo run', type: 'cargo', action: 'run' };
  }

  // Check for go.mod (Go)
  if (await fs.pathExists(join(projectPath, 'go.mod'))) {
    if (!commands.test) commands.test = { cmd: 'go test ./...', type: 'go', action: 'test' };
    if (!commands.build) commands.build = { cmd: 'go build', type: 'go', action: 'build' };
    if (!commands.start) commands.start = { cmd: 'go run .', type: 'go', action: 'run' };
  }

  // Check for docker-compose.yml
  if (await fs.pathExists(join(projectPath, 'docker-compose.yml')) ||
      await fs.pathExists(join(projectPath, 'docker-compose.yaml'))) {
    if (!commands.dev) {
      commands.dev = { cmd: 'docker-compose up', type: 'docker', action: 'up' };
    }
    commands.custom.push({
      name: 'docker-up',
      cmd: 'docker-compose up -d',
      type: 'docker',
      description: 'Start containers in background'
    });
  }

  return commands;
}

/**
 * Get display-friendly action list
 */
export async function getAvailableActions(projectPath) {
  const commands = await detectProjectCommands(projectPath);
  const actions = [];

  if (commands.test) {
    actions.push({
      type: ActionType.TEST,
      label: 'Run tests',
      description: commands.test.cmd,
      command: commands.test
    });
  }

  if (commands.dev) {
    actions.push({
      type: ActionType.DEV,
      label: 'Start dev server',
      description: commands.dev.cmd,
      command: commands.dev
    });
  }

  if (commands.build) {
    actions.push({
      type: ActionType.BUILD,
      label: 'Build project',
      description: commands.build.cmd,
      command: commands.build
    });
  }

  if (commands.start) {
    actions.push({
      type: ActionType.START,
      label: 'Run/Start',
      description: commands.start.cmd,
      command: commands.start
    });
  }

  if (commands.lint) {
    actions.push({
      type: ActionType.LINT,
      label: 'Lint code',
      description: commands.lint.cmd,
      command: commands.lint
    });
  }

  if (commands.deploy) {
    actions.push({
      type: ActionType.DEPLOY,
      label: 'Deploy',
      description: commands.deploy.cmd,
      command: commands.deploy
    });
  }

  return { actions, custom: commands.custom };
}

/**
 * Detect project type for display
 */
export async function detectProjectType(projectPath) {
  const types = [];

  if (await fs.pathExists(join(projectPath, 'package.json'))) {
    const pkg = await fs.readJson(join(projectPath, 'package.json')).catch(() => ({}));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps.react) types.push('React');
    else if (deps.vue) types.push('Vue');
    else if (deps.svelte) types.push('Svelte');
    else if (deps.next) types.push('Next.js');
    else if (deps.express) types.push('Express');
    else if (deps.fastify) types.push('Fastify');
    else types.push('Node.js');

    if (deps.typescript) types.push('TypeScript');
  }

  if (await fs.pathExists(join(projectPath, 'pyproject.toml'))) types.push('Python');
  if (await fs.pathExists(join(projectPath, 'Cargo.toml'))) types.push('Rust');
  if (await fs.pathExists(join(projectPath, 'go.mod'))) types.push('Go');
  if (await fs.pathExists(join(projectPath, 'Gemfile'))) types.push('Ruby');

  return types.length > 0 ? types : ['Unknown'];
}
