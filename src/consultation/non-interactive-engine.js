import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';
import { SpecCharacter } from '../character/spec.js';
import { secureWriteFile } from '../utils/secure-path.js';

/**
 * Non-interactive consultation engine for CI/CD and automated environments
 * Provides guided spec creation without requiring terminal input
 */
export class NonInteractiveConsultationEngine {
  constructor(options = {}) {
    this.spec = new SpecCharacter();
    this.projectContext = {};
    this.autoAnswers = options.autoAnswers || {};
    this.projectTemplate = options.template || 'web-app';
    this.timeline = options.timeline || 'mvp';
    this.teamSize = options.teamSize || 'solo';
    this.experienceLevel = options.experienceLevel || 'intermediate';
    this.verbose = options.verbose !== false;
  }

  async startGuidedSetup(options = {}) {
    if (this.verbose) {
      console.log(chalk.cyan('🤖 Starting non-interactive spec generation...'));
      console.log(chalk.gray('Perfect for CI/CD and automated workflows!'));
    }

    // Use provided options or defaults
    this.projectContext = {
      vision: options.vision || this.autoAnswers.vision || 'Build an amazing software project',
      type: options.type || this.autoAnswers.type || this.projectTemplate,
      timeline: options.timeline || this.autoAnswers.timeline || this.timeline,
      teamSize: options.teamSize || this.autoAnswers.teamSize || this.teamSize,
      experienceLevel: options.experienceLevel || this.autoAnswers.experienceLevel || this.experienceLevel,
      ...options
    };

    try {
      if (this.verbose) {
        await this.displayProjectSummary();
      }

      await this.applyDefaults();
      const spec = await this.generateSpecification();

      if (this.verbose) {
        await this.displayResults(spec);
      }

      return spec;
    } catch (error) {
      console.error(chalk.red('❌ Non-interactive setup failed:'), error.message);
      throw error;
    }
  }

  async displayProjectSummary() {
    console.log(chalk.yellow('\n📋 Project Configuration:'));
    console.log(chalk.cyan(`   Vision: ${this.projectContext.vision}`));
    console.log(chalk.cyan(`   Type: ${this.projectContext.type}`));
    console.log(chalk.cyan(`   Timeline: ${this.projectContext.timeline}`));
    console.log(chalk.cyan(`   Team Size: ${this.projectContext.teamSize}`));
    console.log(chalk.cyan(`   Experience: ${this.projectContext.experienceLevel}`));
  }

  async applyDefaults() {
    // Apply intelligent defaults based on project type
    const defaults = this.getProjectDefaults(this.projectContext.type);

    Object.entries(defaults).forEach(([key, value]) => {
      if (!this.projectContext[key]) {
        this.projectContext[key] = value;
      }
    });

    if (this.verbose) {
      console.log(chalk.green('✅ Applied intelligent defaults'));
    }
  }

  getProjectDefaults(projectType) {
    const defaults = {
      'web-app': {
        'frontend-framework': { value: 'react' },
        'backend-api': { value: 'rest' },
        'database': { value: 'postgresql' },
        'authentication': { value: 'jwt' }
      },
      'mobile-app': {
        'platform': { value: 'react-native' },
        'backend-sync': { value: 'rest-api' },
        'offline-capability': { value: 'basic' },
        'authentication': { value: 'oauth' }
      },
      'api-service': {
        'rest-vs-graphql': { value: 'rest' },
        'database': { value: 'postgresql' },
        'rate-limiting': { value: 'redis' },
        'documentation': { value: 'openapi' }
      },
      'cli-tool': {
        'language': { value: 'node' },
        'package-manager': { value: 'npm' },
        'distribution': { value: 'npm-registry' },
        'config-format': { value: 'json' }
      },
      'data-pipeline': {
        'data-sources': { value: 'api-database' },
        'processing-frequency': { value: 'batch' },
        'storage': { value: 'data-warehouse' },
        'monitoring': { value: 'metrics-dashboard' }
      }
    };

    return defaults[projectType] || defaults['web-app'];
  }

  async generateSpecification() {
    if (this.verbose) {
      console.log(chalk.cyan('🔧 Generating specification...'));
    }

    const spec = {
      metadata: {
        name: this.generateProjectName(),
        version: '1.0.0',
        created: new Date(),
        type: this.projectContext.type,
        timeline: this.projectContext.timeline,
        generated_mode: 'non-interactive'
      },
      vision: {
        description: this.projectContext.vision,
        goals: this.extractGoals(),
        success_metrics: this.generateSuccessMetrics()
      },
      technical: this.generateTechnicalSpec(),
      implementation: {
        phases: this.generateImplementationPhases(),
        team_structure: this.projectContext.teamSize,
        experience_level: this.projectContext.experienceLevel
      },
      resources: {
        cloud_integration: this.shouldRecommendCloud(),
        agent_swarm: this.shouldRecommendAgents(),
        multimedia_support: true
      },
      next_steps: this.generateNextSteps()
    };

    // Save specification securely
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `spec-${timestamp}.yaml`;

      const specPath = await secureWriteFile(filename, yaml.stringify(spec, { indent: 2 }), 'workspace', {
        allowedExtensions: ['.yaml', '.yml'],
        maxSize: 1024 * 1024, // 1MB max
        preventOverwrite: false
      });

      if (this.verbose) {
        console.log(chalk.green(`✅ Specification saved to: ${path.basename(specPath)}`));
      }

      spec._metadata = { savedPath: specPath };
      return spec;
    } catch (error) {
      console.error(chalk.red(`Failed to save specification: ${error.message}`));
      throw new Error(`Specification save failed: ${error.message}`);
    }
  }

  async displayResults(spec) {
    console.log(chalk.yellow('\n🎯 Generated Specification:'));
    console.log(chalk.cyan(`   Project: ${spec.metadata.name}`));
    console.log(chalk.cyan(`   Type: ${spec.metadata.type}`));
    console.log(chalk.cyan(`   Timeline: ${spec.metadata.timeline}`));

    console.log(chalk.yellow('\n📅 Implementation Phases:'));
    spec.implementation.phases.forEach((phase, index) => {
      console.log(chalk.cyan(`   ${index + 1}. ${phase.name} (${phase.duration})`));
    });

    console.log(chalk.yellow('\n🚀 Next Steps:'));
    spec.next_steps.forEach((step, index) => {
      console.log(chalk.cyan(`   ${index + 1}. ${step}`));
    });

    if (spec.resources.cloud_integration) {
      console.log(chalk.blue('\n☁️ Cloud deployment recommended for this project type'));
    }

    if (spec.resources.agent_swarm) {
      console.log(chalk.blue('🤖 Agent swarm recommended for parallel development'));
    }
  }

  // Utility methods (similar to interactive version but simplified)
  generateProjectName() {
    const vision = this.projectContext.vision.toLowerCase();
    const words = vision.split(' ').filter(word => word.length > 3);
    const name = words.slice(0, 3).join('-');
    return name || 'generated-project';
  }

  extractGoals() {
    const typeGoals = {
      'web-app': [
        'Create responsive user interface',
        'Implement secure user authentication',
        'Build scalable backend API',
        'Ensure cross-browser compatibility'
      ],
      'mobile-app': [
        'Develop native mobile experience',
        'Implement offline functionality',
        'Optimize for mobile performance',
        'Follow platform design guidelines'
      ],
      'api-service': [
        'Design RESTful API endpoints',
        'Implement proper error handling',
        'Add comprehensive documentation',
        'Ensure high availability'
      ],
      'cli-tool': [
        'Create intuitive command interface',
        'Provide helpful error messages',
        'Support configuration files',
        'Enable easy installation'
      ],
      'data-pipeline': [
        'Process data efficiently',
        'Ensure data quality',
        'Monitor pipeline health',
        'Scale with data volume'
      ]
    };

    return typeGoals[this.projectContext.type] || [
      'Solve the identified problem effectively',
      'Deliver within the specified timeline',
      'Maintain high code quality',
      'Ensure scalable architecture'
    ];
  }

  generateSuccessMetrics() {
    return {
      functionality: 'All core features implemented and tested',
      performance: 'Meets performance requirements for project type',
      user_satisfaction: 'Positive user feedback and adoption',
      maintenance: 'Easy to maintain and extend',
      deployment: 'Smooth deployment and operational stability'
    };
  }

  generateTechnicalSpec() {
    const technical = {};

    Object.entries(this.projectContext).forEach(([key, value]) => {
      if (typeof value === 'object' && value.value) {
        technical[key] = value.value;
      } else if (typeof value === 'string' && ['type', 'timeline', 'teamSize'].includes(key)) {
        technical[key] = value;
      }
    });

    return technical;
  }

  generateImplementationPhases() {
    const basePhases = [
      {
        name: 'Project Setup',
        description: 'Initialize project structure, configure development environment, set up CI/CD',
        duration: '1 week',
        tasks: ['Repository setup', 'Environment configuration', 'Initial documentation']
      },
      {
        name: 'Core Development',
        description: 'Implement main features and functionality',
        duration: '60% of timeline',
        tasks: ['Feature implementation', 'Unit testing', 'Code reviews']
      },
      {
        name: 'Integration & Testing',
        description: 'System integration, comprehensive testing, and bug fixes',
        duration: '25% of timeline',
        tasks: ['Integration testing', 'Performance testing', 'Bug fixes']
      },
      {
        name: 'Deployment & Launch',
        description: 'Production deployment, monitoring setup, and go-live',
        duration: '15% of timeline',
        tasks: ['Production deployment', 'Monitoring setup', 'Launch activities']
      }
    ];

    // Customize phases based on project type
    if (this.projectContext.type === 'cli-tool') {
      basePhases[3].tasks.push('Package distribution setup');
    } else if (this.projectContext.type === 'mobile-app') {
      basePhases[3].tasks.push('App store submission');
    }

    return basePhases;
  }

  generateNextSteps() {
    const steps = [
      'Review and customize the generated specification',
      'Set up development environment based on technical choices',
      'Create initial project structure and repository',
      'Begin implementation following the defined phases'
    ];

    if (this.shouldRecommendCloud()) {
      steps.push('Configure cloud infrastructure and deployment pipeline');
    }

    if (this.shouldRecommendAgents()) {
      steps.push('Set up agent swarm for parallel development tasks');
    }

    steps.push('Start with Phase 1: Project Setup');

    return steps;
  }

  shouldRecommendCloud() {
    const cloudProjects = ['web-app', 'mobile-app', 'api-service', 'data-pipeline'];
    return cloudProjects.includes(this.projectContext.type);
  }

  shouldRecommendAgents() {
    const complexityThreshold = ['mvp', 'full', 'long-term'];
    return complexityThreshold.includes(this.projectContext.timeline);
  }

  // Static method for easy CLI integration
  static async quickGenerate(options = {}) {
    const engine = new NonInteractiveConsultationEngine(options);
    return await engine.startGuidedSetup(options);
  }
}

export default NonInteractiveConsultationEngine;