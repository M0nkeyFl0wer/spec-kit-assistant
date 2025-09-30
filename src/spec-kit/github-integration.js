/**
 * T027: GitHub Spec Kit integration implementation
 * Provides spec.new compatibility and GitHub-standard documentation
 * Uses existing GitHubSpecKit class and extends functionality
 */

import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { GitHubSpecKitConfig } from '../core/github-spec-kit-config.js';

export class GitHubSpecKit {
  constructor() {
    this.config = new GitHubSpecKitConfig();
    this.specTemplate = {
      name: "",
      description: "",
      features: [],
      technologies: [],
      architecture: {},
      implementation: {
        phases: [],
        timeline: "",
        resources: []
      },
      testing: {
        strategy: "",
        coverage: "",
        types: []
      },
      deployment: {
        environment: "",
        ci_cd: "",
        monitoring: ""
      }
    };
  }

  /**
   * Initialize a new spec based on GitHub's Spec Kit
   * Following spec.new patterns and best practices
   */
  async initializeSpec(projectName, projectType = 'web-app') {
    console.log(chalk.cyan('🐕 Spec: "Initializing GitHub Spec Kit foundation..."'));

    // Initialize configuration
    this.config.initializeProject(projectName, projectType);

    const spec = {
      ...this.specTemplate,
      name: projectName,
      type: projectType,
      created: new Date().toISOString(),
      framework: 'github-spec-kit',
      version: '1.0.0'
    };

    // Add project-type specific defaults
    this.addProjectTypeDefaults(spec, projectType);

    return spec;
  }

  /**
   * Add project type specific defaults
   * @param {Object} spec - Specification object
   * @param {string} projectType - Project type
   */
  addProjectTypeDefaults(spec, projectType) {
    switch (projectType) {
      case 'web-app':
        spec.technologies = ['React', 'Node.js', 'Express'];
        spec.features = ['User Authentication', 'Responsive Design', 'API Integration'];
        break;
      case 'api':
        spec.technologies = ['Node.js', 'Express', 'PostgreSQL'];
        spec.features = ['RESTful API', 'Authentication', 'Rate Limiting'];
        break;
      case 'agent-swarm':
        spec.technologies = ['Node.js', 'WebSockets', 'AI APIs'];
        spec.features = ['Agent Orchestration', 'Task Distribution', 'Real-time Communication'];
        break;
      case 'mobile-app':
        spec.technologies = ['React Native', 'Expo'];
        spec.features = ['Cross-platform', 'Offline Support', 'Push Notifications'];
        break;
    }
  }

  /**
   * Generate spec.new compatible documentation
   */
  generateSpecNewFormat(spec) {
    return `# ${spec.name}

${spec.description}

## Features
${spec.features.map(f => `- ${f}`).join('\n')}

## Technology Stack
${spec.technologies.map(t => `- ${t}`).join('\n')}

## Architecture

### Overview
${spec.architecture.overview || 'TBD'}

### Components
${spec.architecture.components?.map(c => `- ${c}`).join('\n') || 'TBD'}

## Implementation Plan

### Phases
${spec.implementation.phases.map((phase, i) => `${i + 1}. ${phase}`).join('\n')}

### Timeline
${spec.implementation.timeline}

## Testing Strategy
${spec.testing.strategy}

## Deployment
- Environment: ${spec.deployment.environment}
- CI/CD: ${spec.deployment.ci_cd}
- Monitoring: ${spec.deployment.monitoring}

---
*Generated with GitHub Spec Kit integration via Spec the Golden Retriever 🐕*
`;
  }

  /**
   * Save spec in GitHub-compatible format
   */
  async saveSpec(spec, outputPath = './SPEC.md') {
    const content = this.generateSpecNewFormat(spec);

    try {
      await fs.writeFile(outputPath, content, 'utf8');
      console.log(chalk.green(`🐕 Spec: "Saved specification to ${outputPath}"`));
      return outputPath;
    } catch (error) {
      console.error(chalk.red(`Error saving spec: ${error.message}`));
      throw error;
    }
  }

  /**
   * Validate spec against GitHub Spec Kit standards
   */
  validateSpec(spec) {
    const validation = this.config.validate();
    const required = ['name', 'description', 'features', 'technologies'];
    const missing = required.filter(field => !spec[field] || spec[field].length === 0);

    if (missing.length > 0) {
      console.log(chalk.yellow(`🐕 Spec: "Missing required fields: ${missing.join(', ')}"`));
      return false;
    }

    if (!validation.valid) {
      console.log(chalk.yellow(`🐕 Spec: "Configuration issues: ${validation.issues.join(', ')}"`));
      return false;
    }

    console.log(chalk.green('🐕 Spec: "Specification is valid! ✅"'));
    return true;
  }

  /**
   * Generate GitHub repository structure based on spec
   */
  generateRepoStructure(spec) {
    const structure = {
      'README.md': this.generateReadme(spec),
      'SPEC.md': this.generateSpecNewFormat(spec),
      'package.json': this.generatePackageJson(spec),
      '.gitignore': this.generateGitignore(spec),
      'src/': {
        'index.js': this.generateMainFile(spec)
      },
      'tests/': {
        'README.md': '# Test Directory\n\nAdd your tests here.'
      },
      'docs/': {
        'README.md': '# Documentation\n\nProject documentation goes here.'
      }
    };

    // Add GitHub-specific folders if enabled
    if (this.config.repositoryConfig.includeGithubFolder) {
      structure['.github/'] = {
        'ISSUE_TEMPLATE/': this.generateIssueTemplateStructure(),
        'workflows/': this.generateWorkflowsStructure(spec),
        'PULL_REQUEST_TEMPLATE.md': this.generatePRTemplate()
      };
    }

    return structure;
  }

  /**
   * Generate issue template structure
   */
  generateIssueTemplateStructure() {
    const templates = this.config.generateIssueTemplates();
    const structure = {};

    templates.forEach(template => {
      const filename = `${template.name.toLowerCase().replace(/\s+/g, '_')}.md`;
      structure[filename] = this.generateIssueTemplate(template);
    });

    return structure;
  }

  /**
   * Generate individual issue template
   */
  generateIssueTemplate(template) {
    return `---
name: ${template.name}
about: ${template.about}
title: '[${template.name.toUpperCase()}] '
labels: ${template.labels.join(', ')}
assignees: ${template.assignees}
---

## Description
Provide a clear and concise description.

## Steps to Reproduce (if applicable)
1.
2.
3.

## Expected Behavior
What should happen?

## Actual Behavior
What actually happened?

## Additional Context
Add any other context about the issue here.
`;
  }

  /**
   * Generate GitHub workflows structure
   */
  generateWorkflowsStructure(spec) {
    const workflows = {};

    // CI workflow
    workflows['ci.yml'] = this.generateCIWorkflow(spec);

    // Deployment workflow if applicable
    if (this.config.automationSettings.deploymentTarget !== 'manual') {
      workflows['deploy.yml'] = this.generateDeployWorkflow(spec);
    }

    // Code quality workflow
    if (this.config.automationSettings.codeQualityChecks) {
      workflows['code-quality.yml'] = this.generateCodeQualityWorkflow(spec);
    }

    return workflows;
  }

  /**
   * Generate CI workflow
   */
  generateCIWorkflow(spec) {
    return `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'

    - run: npm ci
    - run: npm run test
    - run: npm run lint

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      if: matrix.node-version == '18.x'
`;
  }

  /**
   * Generate deployment workflow
   */
  generateDeployWorkflow(spec) {
    return `name: Deploy

on:
  push:
    branches: [ main ]
  release:
    types: [ published ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - run: npm ci
    - run: npm run build
    - run: npm run test

    - name: Deploy to ${this.config.automationSettings.deploymentTarget}
      run: npm run deploy
      env:
        DEPLOY_TOKEN: \${{ secrets.DEPLOY_TOKEN }}
`;
  }

  /**
   * Generate code quality workflow
   */
  generateCodeQualityWorkflow(spec) {
    return `name: Code Quality

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - run: npm ci

    - name: Run ESLint
      run: npm run lint

    - name: Run Prettier
      run: npm run format:check

    - name: Run type check
      run: npm run type-check
      if: hashFiles('tsconfig.json') != ''

    - name: Security audit
      run: npm audit --audit-level moderate
`;
  }

  /**
   * Generate PR template
   */
  generatePRTemplate() {
    return `## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Updated documentation if needed

## Checklist
- [ ] Code follows the project's style guidelines
- [ ] Self-review of the code completed
- [ ] Changes generate no new warnings
- [ ] New and existing unit tests pass locally
`;
  }

  generateReadme(spec) {
    return `# ${spec.name}

${spec.description}

## Quick Start

\`\`\`bash
npm install
npm start
\`\`\`

## Features

${spec.features.map(f => `- ${f}`).join('\n')}

## Technology Stack

${spec.technologies.map(t => `- ${t}`).join('\n')}

## Contributing

Please read [SPEC.md](./SPEC.md) for project specifications.

---
Built with 🐕 Spec Kit Assistant
`;
  }

  generatePackageJson(spec) {
    return JSON.stringify({
      name: spec.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: spec.description,
      main: 'src/index.js',
      scripts: {
        start: 'node src/index.js',
        test: 'npm test',
        dev: 'node --watch src/index.js',
        lint: 'eslint src/',
        "lint:fix": 'eslint src/ --fix',
        build: 'echo "Build script needed"',
        deploy: 'echo "Deploy script needed"'
      },
      keywords: spec.technologies.map(t => t.toLowerCase()),
      author: process.env.GIT_USER_NAME || 'Developer',
      license: 'MIT',
      devDependencies: {
        eslint: '^8.0.0'
      }
    }, null, 2);
  }

  generateGitignore(spec) {
    return `node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
coverage/
.nyc_output/
.vscode/
.idea/
*.swp
*.swo
`;
  }

  generateMainFile(spec) {
    return `// ${spec.name}
// Generated by Spec Kit Assistant

console.log('🐕 ${spec.name} starting up!');

// TODO: Implement your application based on the SPEC.md
`;
  }

  /**
   * Create GitHub repository files on disk
   * @param {Object} spec - Specification
   * @param {string} outputDir - Output directory
   */
  async createRepositoryFiles(spec, outputDir = './') {
    const structure = this.generateRepoStructure(spec);

    async function createStructure(obj, basePath) {
      for (const [name, content] of Object.entries(obj)) {
        const fullPath = path.join(basePath, name);

        if (typeof content === 'object' && !Buffer.isBuffer(content)) {
          // Directory
          await fs.mkdir(fullPath, { recursive: true });
          await createStructure(content, fullPath);
        } else {
          // File
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, content, 'utf8');
        }
      }
    }

    await createStructure(structure, outputDir);
    console.log(chalk.green(`🐕 Spec: "Repository structure created in ${outputDir}"`));
  }

  /**
   * Set configuration
   * @param {GitHubSpecKitConfig} config - Configuration instance
   */
  setConfig(config) {
    this.config = config;
  }

  /**
   * Get current configuration
   * @returns {GitHubSpecKitConfig} Current configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Export configuration for GitHub setup
   * @returns {Object} GitHub setup configuration
   */
  exportForGitHub() {
    return this.config.exportForGitHub();
  }
}

export default GitHubSpecKit;