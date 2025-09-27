import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

/**
 * GitHub Spec Kit Integration
 * Provides the foundation for spec.new functionality
 */
export class GitHubSpecKit {
  constructor() {
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

    const spec = {
      ...this.specTemplate,
      name: projectName,
      type: projectType,
      created: new Date().toISOString(),
      framework: 'github-spec-kit',
      version: '1.0.0'
    };

    // Add project-type specific defaults
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

    return spec;
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
      await fs.promises.writeFile(outputPath, content, 'utf8');
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
    const required = ['name', 'description', 'features', 'technologies'];
    const missing = required.filter(field => !spec[field] || spec[field].length === 0);

    if (missing.length > 0) {
      console.log(chalk.yellow(`🐕 Spec: "Missing required fields: ${missing.join(', ')}"`));
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

    return structure;
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
        dev: 'node --watch src/index.js'
      },
      keywords: spec.technologies.map(t => t.toLowerCase()),
      author: process.env.GIT_USER_NAME || 'Developer',
      license: 'MIT'
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
`;
  }

  generateMainFile(spec) {
    return `// ${spec.name}
// Generated by Spec Kit Assistant

console.log('🐕 ${spec.name} starting up!');

// TODO: Implement your application based on the SPEC.md
`;
  }
}

export default GitHubSpecKit;