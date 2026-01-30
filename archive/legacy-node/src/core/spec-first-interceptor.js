// Enhanced Command Interception System
// Ensures all development workflows guide users toward spec-first development

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';
import { SpecCharacter } from '../character/spec.js';
import { SwarmOrchestrator } from '../swarm/orchestrator.js';
// Import existing swarm stack components
import { EnhancedSwarmOrchestrator } from '../../enhanced-swarm-orchestrator.js';
import { SessionManager } from '../focus/session-manager.js';
import { secureReadFile, secureWriteFile } from '../utils/secure-path.js';

/**
 * SpecFirstInterceptor ensures every command leads to proper specification creation
 * and maintains continuous spec-code alignment throughout development
 */
export class SpecFirstInterceptor {
  constructor() {
    this.spec = new SpecCharacter();
    this.swarmOrchestrator = new SwarmOrchestrator();
    this.enhancedSwarm = null; // Will load dynamically when needed
    this.productionSwarm = null; // Will load dynamically when needed
    this.sessionManager = new SessionManager();
    this.specDirectory = 'specs';
    this.activeSpecPath = null;
    this.lastSpecValidation = null;

    // Available swarm types based on your stack
    this.availableSwarms = {
      'data-science': {
        orchestrator: this.enhancedSwarm,
        agents: ['data-analyst', 'ml-engineer', 'viz-specialist', 'web-scraper'],
        description: 'Analytics, ML models, and data visualization',
      },
      'builder-ux': {
        orchestrator: this.enhancedSwarm,
        agents: ['frontend-builder', 'backend-builder'],
        description: 'Full-stack application development',
      },
      research: {
        orchestrator: this.enhancedSwarm,
        agents: ['osint-researcher', 'academic-researcher'],
        description: 'Research and intelligence gathering',
      },
      production: {
        orchestrator: 'production-script', // Run as script
        agents: ['test-engineer', 'qa-engineer', 'devops-engineer', 'security-specialist'],
        description: 'Production readiness and deployment',
      },
      security: {
        orchestrator: this.enhancedSwarm,
        agents: ['security-scanner', 'code-repair'],
        description: 'Security analysis and fixes',
      },
      'gemini-coordinated': {
        orchestrator: this.enhancedSwarm,
        agents: ['gemini-coordinator'],
        description: 'AI-coordinated multi-swarm tasks with free Gemini tokens',
      },
    };
  }

  /**
   * Main interception point for all commands
   * Validates spec status and guides user toward spec-first development
   */
  async interceptCommand(command, args, options = {}) {
    console.log(chalk.cyan('🐕 Spec: "Let me check our spec status first..."'));

    try {
      // Phase 1: Spec Detection and Validation
      const specStatus = await this.validateSpecFirst();

      // Phase 2: Handle based on spec status
      if (!specStatus.hasActiveSpec) {
        return await this.handleNoActiveSpec(command, args, options);
      }

      if (!specStatus.isCompliant) {
        return await this.handleNonCompliantSpec(specStatus, command, args);
      }

      if (!specStatus.isDeploymentReady) {
        return await this.handleDeploymentPreparation(specStatus, command, args);
      }

      // Phase 3: Execute with spec-aligned context
      return await this.executeWithSpecContext(command, args, options, specStatus);
    } catch (error) {
      console.error(chalk.red(`🐕 Spec: "Oops! Interception error: ${error.message}"`));
      throw error;
    }
  }

  /**
   * Validate current specification status and GitHub Spec Kit compliance
   */
  async validateSpecFirst() {
    const specStatus = {
      hasActiveSpec: false,
      isCompliant: false,
      isDeploymentReady: false,
      specPath: null,
      issues: [],
      swarmRecommendation: null,
    };

    try {
      // Check for active specification
      const activeSpec = await this.findActiveSpecification();

      if (!activeSpec) {
        specStatus.issues.push('No active specification found');
        return specStatus;
      }

      specStatus.hasActiveSpec = true;
      specStatus.specPath = activeSpec.path;
      this.activeSpecPath = activeSpec.path;

      // Validate GitHub Spec Kit compliance
      const complianceCheck = await this.validateGitHubSpecKitCompliance(activeSpec.path);
      specStatus.isCompliant = complianceCheck.isValid;
      specStatus.issues.push(...complianceCheck.issues);

      // Assess deployment readiness
      if (specStatus.isCompliant) {
        const deploymentAssessment = await this.assessDeploymentReadiness(activeSpec.path);
        specStatus.isDeploymentReady = deploymentAssessment.ready;
        specStatus.swarmRecommendation = deploymentAssessment.swarmConfig;
        specStatus.issues.push(...deploymentAssessment.issues);
      }

      this.lastSpecValidation = specStatus;
      return specStatus;
    } catch (error) {
      specStatus.issues.push(`Validation error: ${error.message}`);
      return specStatus;
    }
  }

  /**
   * Find active specification in the project
   */
  async findActiveSpecification() {
    try {
      // Look for specifications in order of preference
      const specPatterns = [
        `${this.specDirectory}/**/spec.md`,
        `${this.specDirectory}/**/*.md`,
        'SPEC.md',
        'spec.md',
        'README.md',
      ];

      for (const pattern of specPatterns) {
        const matches = await glob(pattern, { ignore: ['node_modules/**'] });

        if (matches.length > 0) {
          // Prefer most recently modified spec
          const specFiles = await Promise.all(
            matches.map(async (file) => {
              const stats = await fs.stat(file);
              return { path: file, modified: stats.mtime };
            }),
          );

          specFiles.sort((a, b) => b.modified - a.modified);

          // Validate it contains spec content
          const content = await secureReadFile(specFiles[0].path, 'workspace');
          if (this.isValidSpecContent(content)) {
            return specFiles[0];
          }
        }
      }

      return null;
    } catch (error) {
      console.error(chalk.yellow(`🐕 Spec: "Trouble finding specs: ${error.message}"`));
      return null;
    }
  }

  /**
   * Check if content appears to be a valid specification
   */
  isValidSpecContent(content) {
    const specIndicators = [
      'Feature Specification',
      'Requirements',
      'User Story',
      'Acceptance Criteria',
      'Functional Requirements',
      '## Requirements',
      '## User Scenarios',
    ];

    return specIndicators.some((indicator) => content.toLowerCase().includes(indicator.toLowerCase()));
  }

  /**
   * Validate GitHub Spec Kit format compliance
   */
  async validateGitHubSpecKitCompliance(specPath) {
    const result = {
      isValid: true,
      issues: [],
    };

    try {
      const content = await secureReadFile(specPath, 'workspace');

      // Required sections for GitHub Spec Kit compliance
      const requiredSections = [
        '## User Scenarios & Testing',
        '## Requirements',
        '## Review & Acceptance Checklist',
      ];

      const missingRequired = requiredSections.filter((section) => !content.includes(section));

      if (missingRequired.length > 0) {
        result.isValid = false;
        result.issues.push(`Missing required sections: ${missingRequired.join(', ')}`);
      }

      // Check for implementation details (should be avoided)
      const implementationKeywords = [
        'React', 'Node.js', 'database', 'API endpoint', 'function', 'class',
        'import', 'export', 'const', 'let', 'var',
      ];

      const foundImplementationDetails = implementationKeywords.filter((keyword) => content.toLowerCase().includes(keyword.toLowerCase()));

      if (foundImplementationDetails.length > 0) {
        result.issues.push(`Contains implementation details: ${foundImplementationDetails.join(', ')}`);
      }

      // Check for unclear requirements markers
      const clarificationMarkers = content.match(/\[NEEDS CLARIFICATION:.*?\]/g);
      if (clarificationMarkers && clarificationMarkers.length > 0) {
        result.isValid = false;
        result.issues.push(`Has ${clarificationMarkers.length} items needing clarification`);
      }

      return result;
    } catch (error) {
      result.isValid = false;
      result.issues.push(`Compliance check failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Assess if specification is ready for deployment
   */
  async assessDeploymentReadiness(specPath) {
    const assessment = {
      ready: false,
      swarmConfig: null,
      issues: [],
    };

    try {
      const content = await secureReadFile(specPath, 'workspace');

      // Analyze specification for complexity and deployment needs
      const complexity = this.analyzeSpecComplexity(content);

      // Generate swarm recommendation based on spec analysis
      assessment.swarmConfig = this.generateSwarmRecommendation(complexity);

      // Check readiness criteria
      if (complexity.hasTestableRequirements
          && complexity.hasClearAcceptanceCriteria
          && !complexity.hasAmbiguities) {
        assessment.ready = true;
      } else {
        if (!complexity.hasTestableRequirements) {
          assessment.issues.push('Requirements are not testable enough for deployment');
        }
        if (!complexity.hasClearAcceptanceCriteria) {
          assessment.issues.push('Acceptance criteria need more detail');
        }
        if (complexity.hasAmbiguities) {
          assessment.issues.push('Specification has ambiguities that need resolution');
        }
      }

      return assessment;
    } catch (error) {
      assessment.issues.push(`Assessment failed: ${error.message}`);
      return assessment;
    }
  }

  /**
   * Analyze specification complexity for optimal swarm deployment
   */
  analyzeSpecComplexity(content) {
    const analysis = {
      projectType: 'unknown',
      complexity: 'medium',
      hasTestableRequirements: false,
      hasClearAcceptanceCriteria: false,
      hasAmbiguities: false,
      estimatedDuration: '2 hours',
      requiredSkills: [],
    };

    // Detect project type
    if (content.toLowerCase().includes('web app') || content.toLowerCase().includes('website')) {
      analysis.projectType = 'webApp';
      analysis.requiredSkills.push('build-automation', 'testing', 'deployment');
    } else if (content.toLowerCase().includes('data') || content.toLowerCase().includes('analytics')) {
      analysis.projectType = 'dataScience';
      analysis.requiredSkills.push('data-analysis', 'visualization', 'model-training');
    } else if (content.toLowerCase().includes('security') || content.toLowerCase().includes('auth')) {
      analysis.projectType = 'security';
      analysis.requiredSkills.push('security-audit', 'vulnerability-scanning', 'compliance');
    } else {
      analysis.projectType = 'general';
      analysis.requiredSkills.push('testing', 'code-review', 'documentation');
    }

    // Check for testable requirements
    const requirementLines = content.split('\\n').filter((line) => line.includes('MUST') || line.includes('SHALL') || line.includes('FR-'));
    analysis.hasTestableRequirements = requirementLines.length > 0;

    // Check for clear acceptance criteria
    analysis.hasClearAcceptanceCriteria = content.includes('Given')
                                          && content.includes('When')
                                          && content.includes('Then');

    // Check for ambiguities
    analysis.hasAmbiguities = content.includes('[NEEDS CLARIFICATION')
                              || content.includes('TODO')
                              || content.includes('TBD');

    // Estimate complexity
    const functionalRequirements = (content.match(/FR-\\d+/g) || []).length;
    if (functionalRequirements > 10) {
      analysis.complexity = 'high';
      analysis.estimatedDuration = '4+ hours';
    } else if (functionalRequirements > 5) {
      analysis.complexity = 'medium';
      analysis.estimatedDuration = '2-4 hours';
    } else {
      analysis.complexity = 'low';
      analysis.estimatedDuration = '1-2 hours';
    }

    return analysis;
  }

  /**
   * Generate optimal swarm configuration based on spec analysis using existing swarm stack
   */
  generateSwarmRecommendation(complexity) {
    const swarmConfigs = {
      webApp: {
        primarySwarm: 'builder-ux',
        supportSwarms: ['production', 'security'],
        description: 'Full-stack development with production readiness',
      },
      dataScience: {
        primarySwarm: 'data-science',
        supportSwarms: ['research', 'production'],
        description: 'Data analysis, ML models, and research integration',
      },
      security: {
        primarySwarm: 'security',
        supportSwarms: ['production'],
        description: 'Security analysis with production deployment',
      },
      research: {
        primarySwarm: 'research',
        supportSwarms: ['data-science'],
        description: 'Research with data analysis capabilities',
      },
      general: {
        primarySwarm: 'production',
        supportSwarms: ['security'],
        description: 'Production-ready development with security',
      },
    };

    const config = swarmConfigs[complexity.projectType] || swarmConfigs.general;

    // For high complexity, use Gemini coordinator
    if (complexity.complexity === 'high') {
      config.coordinator = 'gemini-coordinated';
      config.description = `AI-coordinated multi-swarm: ${config.description}`;
    }

    return {
      primarySwarm: config.primarySwarm,
      supportSwarms: config.supportSwarms,
      coordinator: config.coordinator,
      description: config.description,
      estimatedDuration: complexity.estimatedDuration,
      deploymentStrategy: complexity.complexity === 'high' ? 'gemini-coordinated' : 'enhanced-swarm',
      tokenEfficiency: 'Optimized for free Gemini token usage',
    };
  }

  /**
   * Calculate resource requirements for swarm deployment
   */
  calculateResourceRequirements(agents) {
    const agentResources = {
      'quality-assurance': { cpu: 1, memory: '512MB' },
      'security-scanner': { cpu: 1, memory: '256MB' },
      'performance-monitor': { cpu: 2, memory: '1GB' },
      'code-repair': { cpu: 1, memory: '512MB' },
      documentation: { cpu: 1, memory: '256MB' },
      deployment: { cpu: 2, memory: '1GB' },
    };

    return agents.reduce((total, agent) => {
      const resources = agentResources[agent] || { cpu: 1, memory: '256MB' };
      return {
        cpu: total.cpu + resources.cpu,
        memory: total.memory + parseInt(resources.memory),
      };
    }, { cpu: 0, memory: 0 });
  }

  /**
   * Handle commands when no active specification exists
   */
  async handleNoActiveSpec(command, args, options) {
    console.log(chalk.yellow('🐕 Spec: "Woof! I notice we don\'t have an active specification..."'));
    console.log(chalk.blue('💡 Pro tip: Let\'s start with a proper GitHub Spec Kit specification!'));

    // Gentle nudge toward spec creation
    if (command === 'spec') {
      console.log(chalk.green('🐕 Spec: "Perfect! You\'re already on the right track!"'));
      return { proceed: true, context: 'spec-creation' };
    }

    // For implementation commands, guide to spec first
    const implementationCommands = ['build', 'test', 'deploy', 'start', 'dev', 'run'];
    if (implementationCommands.includes(command)) {
      console.log(chalk.yellow('🐕 Spec: "Hold on there, friend! Let\'s create a spec first!"'));
      console.log(chalk.cyan('   Try: node src/index.js spec <your-feature-name>'));

      const shouldCreateSpec = await this.spec.askQuestion(
        'Would you like me to help you create a specification first?',
        { type: 'confirm', default: true },
      );

      if (shouldCreateSpec) {
        const featureName = await this.spec.askQuestion(
          'What feature are you working on?',
          { type: 'input', required: true },
        );

        return {
          proceed: false,
          redirect: 'spec',
          args: [featureName],
          reason: 'spec-first-required',
        };
      }
    }

    // For cute commands, provide gentle guidance
    const cuteCommands = ['woof-woof', 'come-here', 'good-boy', 'sit', 'speak', 'stay'];
    if (cuteCommands.includes(command)) {
      console.log(chalk.magenta('🐕 Spec: "Thanks for the cute command! But first..."'));
      console.log(chalk.cyan('💡 "Let\'s make sure we have a proper spec to guide our work!"'));
    }

    return { proceed: true, context: 'no-spec-guidance' };
  }

  /**
   * Handle commands when specification is not compliant
   */
  async handleNonCompliantSpec(specStatus, command, args) {
    console.log(chalk.yellow('🐕 Spec: "Great! We have a spec, but it needs some enhancement..."'));
    console.log(chalk.blue('💡 GitHub Spec Kit works best with complete specifications!'));

    // Show specific issues
    console.log(chalk.cyan('\\n🔍 Issues to address:'));
    specStatus.issues.forEach((issue) => {
      console.log(chalk.gray(`   • ${issue}`));
    });

    const shouldEnhanceSpec = await this.spec.askQuestion(
      'Would you like me to help enhance the specification?',
      { type: 'confirm', default: true },
    );

    if (shouldEnhanceSpec) {
      return await this.guideSpecEnhancement(specStatus.specPath, specStatus.issues);
    }

    console.log(chalk.yellow('🐕 Spec: "Okay, but remember: better specs lead to better implementations!"'));
    return { proceed: true, context: 'non-compliant-spec', issues: specStatus.issues };
  }

  /**
   * Guide user through specification enhancement
   */
  async guideSpecEnhancement(specPath, issues) {
    console.log(chalk.cyan('🐕 Spec: "Let me help you enhance this specification!"'));

    // Provide specific guidance for each issue
    for (const issue of issues) {
      if (issue.includes('Missing required sections')) {
        console.log(chalk.blue('📋 Adding missing GitHub Spec Kit sections...'));
        await this.addMissingSpecSections(specPath);
      }

      if (issue.includes('implementation details')) {
        console.log(chalk.yellow('⚠️  Found implementation details that should be removed'));
        console.log(chalk.gray('   Specs should focus on WHAT, not HOW'));
      }

      if (issue.includes('clarification')) {
        console.log(chalk.red('❓ Found items needing clarification'));
        console.log(chalk.gray('   Please review and clarify ambiguous requirements'));
      }
    }

    return {
      proceed: false,
      redirect: 'spec-enhancement',
      specPath,
      reason: 'compliance-required',
    };
  }

  /**
   * Add missing sections to specification
   */
  async addMissingSpecSections(specPath) {
    try {
      const content = await secureReadFile(specPath, 'workspace');
      let enhancedContent = content;

      // Add missing sections with templates
      if (!content.includes('## Technical Requirements')) {
        enhancedContent += `\\n\\n## Technical Requirements
- **TR-001**: System MUST [technical capability]
- **TR-002**: System MUST [performance requirement]
- **TR-003**: System MUST [security requirement]`;
      }

      if (!content.includes('## Review & Acceptance Checklist')) {
        enhancedContent += `\\n\\n## Review & Acceptance Checklist
### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders

### Requirement Completeness
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Dependencies and assumptions identified`;
      }

      await secureWriteFile(specPath, enhancedContent, 'workspace');
      console.log(chalk.green('✅ Enhanced specification with missing sections'));
    } catch (error) {
      console.error(chalk.red(`🐕 Spec: "Trouble enhancing spec: ${error.message}"`));
    }
  }

  /**
   * Handle deployment preparation when spec is ready
   */
  async handleDeploymentPreparation(specStatus, command, args) {
    console.log(chalk.green('🐕 Spec: "Excellent spec! Let\'s prepare for efficient deployment!"'));

    if (specStatus.swarmRecommendation) {
      console.log(chalk.cyan('🤖 Recommended swarm configuration:'));
      console.log(chalk.gray(`   Agents: ${specStatus.swarmRecommendation.agents.join(', ')}`));
      console.log(chalk.gray(`   Scale: ${specStatus.swarmRecommendation.scale} agents`));
      console.log(chalk.gray(`   Duration: ${specStatus.swarmRecommendation.estimatedDuration}`));
      console.log(chalk.gray(`   Strategy: ${specStatus.swarmRecommendation.deploymentStrategy}`));

      const shouldDeploySwarm = await this.spec.askQuestion(
        'Ready to deploy the recommended swarm for this specification?',
        { type: 'confirm', default: true },
      );

      if (shouldDeploySwarm) {
        return await this.deploySpecOptimizedSwarm(specStatus.swarmRecommendation);
      }
    }

    return { proceed: true, context: 'deployment-ready', swarmConfig: specStatus.swarmRecommendation };
  }

  /**
   * Deploy swarm optimized for current specification using existing swarm stack
   */
  async deploySpecOptimizedSwarm(swarmConfig) {
    console.log(chalk.blue('🚀 Deploying spec-optimized swarm stack...'));
    console.log(chalk.cyan(`📋 Strategy: ${swarmConfig.deploymentStrategy}`));
    console.log(chalk.gray(`💡 ${swarmConfig.description}`));

    try {
      let deploymentResult;

      if (swarmConfig.coordinator === 'gemini-coordinated') {
        // Use Gemini coordinator for complex tasks
        console.log(chalk.magenta('👑 Deploying with Gemini Queen Coordinator...'));
        const task = `Implement specification: ${this.activeSpecPath}`;
        deploymentResult = await this.enhancedSwarm.deployIntelligentSwarm(task, {
          primarySwarm: swarmConfig.primarySwarm,
          supportSwarms: swarmConfig.supportSwarms,
          specPath: this.activeSpecPath,
        });
      } else {
        // Deploy primary swarm
        const primarySwarmConfig = this.availableSwarms[swarmConfig.primarySwarm];
        if (primarySwarmConfig) {
          console.log(chalk.blue(`🎯 Deploying primary swarm: ${swarmConfig.primarySwarm}`));

          if (swarmConfig.primarySwarm === 'production') {
            deploymentResult = await this.runProductionSwarm();
          } else {
            deploymentResult = await primarySwarmConfig.orchestrator.deploySwarm(
              primarySwarmConfig.agents.length,
            );
          }

          // Deploy support swarms
          for (const supportSwarm of swarmConfig.supportSwarms || []) {
            console.log(chalk.gray(`🔧 Adding support swarm: ${supportSwarm}`));
            const supportConfig = this.availableSwarms[supportSwarm];
            if (supportConfig && supportSwarm !== swarmConfig.primarySwarm) {
              await supportConfig.orchestrator.deploySwarm(2); // Reduced scale for support
            }
          }
        }
      }

      // Start focus session linked to spec
      if (this.activeSpecPath) {
        await this.sessionManager.startSession(this.activeSpecPath, {
          totalSteps: 10, // Estimate based on swarm complexity
          specTitle: path.basename(this.activeSpecPath, '.md'),
          estimatedDuration: swarmConfig.estimatedDuration,
          swarmStrategy: swarmConfig.deploymentStrategy,
        });
      }

      console.log(chalk.green('✅ Spec-optimized swarm stack deployed successfully!'));
      console.log(chalk.blue(`📊 Token efficiency: ${swarmConfig.tokenEfficiency}`));

      return {
        proceed: true,
        context: 'swarm-stack-deployed',
        swarmConfig,
        sessionStarted: true,
        deploymentResult,
      };
    } catch (error) {
      console.error(chalk.red(`🐕 Spec: "Swarm stack deployment failed: ${error.message}"`));
      return { proceed: false, error: error.message };
    }
  }

  /**
   * Execute command with full spec-aligned context
   */
  async executeWithSpecContext(command, args, options, specStatus) {
    console.log(chalk.green('🐕 Spec: "Perfect! Executing with full spec alignment!"'));

    // Track command execution in focus session
    if (this.sessionManager.activeSession) {
      await this.sessionManager.trackProgress(
        this.sessionManager.activeSession.progress.currentStep,
        `Executing ${command} with spec alignment`,
      );
    }

    // Provide spec context to command execution
    const context = {
      specPath: specStatus.specPath,
      specCompliant: specStatus.isCompliant,
      deploymentReady: specStatus.isDeploymentReady,
      swarmRecommendation: specStatus.swarmRecommendation,
      activeSession: this.sessionManager.activeSession,
    };

    return {
      proceed: true,
      context: 'spec-aligned-execution',
      specContext: context,
    };
  }

  /**
   * Monitor continuous spec-code alignment
   */
  async monitorSpecAlignment() {
    if (!this.activeSpecPath) return;

    // This would be called periodically to check alignment
    setInterval(async () => {
      try {
        const currentStatus = await this.validateSpecFirst();

        if (!currentStatus.isCompliant && this.lastSpecValidation?.isCompliant) {
          console.log(chalk.yellow('🐕 Spec: "Warning: Specification compliance has changed!"'));
          await this.handleComplianceChange();
        }
      } catch (error) {
        console.error(chalk.red(`Alignment monitoring error: ${error.message}`));
      }
    }, 300000); // Check every 5 minutes
  }

  /**
   * Handle changes in specification compliance
   */
  async handleComplianceChange() {
    console.log(chalk.cyan('🐕 Spec: "Let me help get us back on track..."'));

    // Gentle nudge to check spec status
    console.log(chalk.blue('💡 Try: node src/index.js focus --refocus'));
    console.log(chalk.blue('💡 Or: node src/index.js spec --validate'));
  }

  /**
   * Run production readiness swarm as external script
   */
  async runProductionSwarm() {
    try {
      console.log(chalk.blue('🚀 Running production readiness swarm...'));

      // Import and run the production swarm script
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const productionScript = './production-readiness-swarm.js';
      const { stdout, stderr } = await execAsync(`node ${productionScript}`);

      if (stderr) {
        console.log(chalk.yellow('Production swarm warnings:', stderr));
      }

      console.log(chalk.green('✅ Production swarm completed successfully'));
      return { success: true, output: stdout };
    } catch (error) {
      console.error(chalk.red(`Production swarm failed: ${error.message}`));
      return { success: false, error: error.message };
    }
  }

  /**
   * Integration point for todo system
   */
  async createSpecAlignedTodo(task, specSection = null) {
    const todo = {
      content: task,
      specReference: specSection || 'General implementation',
      specPath: this.activeSpecPath,
      validationCriteria: await this.extractSpecCriteria(specSection),
      createdAt: new Date().toISOString(),
    };

    return todo;
  }

  /**
   * Extract validation criteria from spec section
   */
  async extractSpecCriteria(specSection) {
    if (!this.activeSpecPath || !specSection) return [];

    try {
      const content = await secureReadFile(this.activeSpecPath, 'workspace');

      // Extract relevant requirements for the section
      const lines = content.split('\\n');
      const criteria = lines
        .filter((line) => line.includes('MUST') || line.includes('SHALL'))
        .filter((line) => line.toLowerCase().includes(specSection.toLowerCase()))
        .map((line) => line.trim());

      return criteria;
    } catch (error) {
      return [];
    }
  }
}

export default SpecFirstInterceptor;
