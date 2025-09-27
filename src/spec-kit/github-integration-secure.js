import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import SecuritySanitizer from '../security/sanitizer.js';

/**
 * GitHub Spec Kit Integration - SECURITY HARDENED
 * Provides the foundation for spec.new functionality with security patches
 */
export class GitHubSpecKit {
  constructor() {
    this.sanitizer = new SecuritySanitizer();
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
   * Initialize a new spec with security validation
   */
  async initializeSpec(projectName, projectType = 'web-app') {
    console.log(chalk.cyan('🐕 Spec: "Initializing GitHub Spec Kit foundation..."'));

    // SECURITY: Sanitize inputs
    const sanitizedName = this.sanitizer.sanitizeProjectName(projectName);
    const sanitizedType = this.sanitizer.sanitizeProjectType(projectType);

    const spec = {
      ...this.specTemplate,
      name: sanitizedName,
      type: sanitizedType,
      created: new Date().toISOString(),
      framework: 'github-spec-kit',
      version: '1.0.0'
    };

    // Add project-type specific defaults
    switch (sanitizedType) {
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
   * Save spec with path validation
   */
  async saveSpec(spec, outputPath = './SPEC.md') {
    // SECURITY: Validate and sanitize file path
    const sanitizedPath = this.sanitizer.sanitizeFilePath(outputPath);

    // SECURITY: Handle circular references
    const safeSpec = this.sanitizer.detectCircularReferences(spec);

    const content = this.generateSpecNewFormat(safeSpec);

    try {
      // SECURITY: Ensure directory exists safely
      const dir = path.dirname(sanitizedPath);
      if (dir !== '.' && !dir.startsWith('./')) {
        throw new Error('Directory path not allowed');
      }

      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(sanitizedPath, content, 'utf8');
      console.log(chalk.green(`🐕 Spec: "Saved specification to ${sanitizedPath}"`));
      return sanitizedPath;
    } catch (error) {
      console.error(chalk.red(`Error saving spec: ${error.message}`));
      throw error;
    }
  }

  // ... rest of the methods remain the same
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
}

export default GitHubSpecKit;