/**
 * T023: GitHubSpecKitConfig model
 * Configuration for GitHub Spec Kit integration and spec.new compatibility
 * Based on data-model.md specification
 */

export class GitHubSpecKitConfig {
  constructor() {
    this.projectMetadata = {
      name: '',
      description: '',
      version: '1.0.0',
      framework: 'github-spec-kit',
      created: null,
      lastModified: null
    };

    this.specKitSettings = {
      templateVersion: '2024.1',
      complianceLevel: 'standard', // 'minimal', 'standard', 'comprehensive'
      includeAutomation: true,
      generateIssueTemplates: true,
      setupProjectBoard: true,
      enableMilestoneTracking: true
    };

    this.repositoryConfig = {
      generateReadme: true,
      generatePackageJson: true,
      generateGitignore: true,
      includeGithubFolder: true,
      defaultBranch: 'main',
      requirePullRequests: true
    };

    this.documentStructure = {
      problemFile: 'PROBLEM.md',
      solutionFile: 'SOLUTION.md',
      specificationFile: 'SPECIFICATION.md',
      implementationFile: 'IMPLEMENTATION.md',
      includeIndex: true
    };

    this.automationSettings = {
      cicdProvider: 'github-actions',
      testingFramework: 'auto-detect',
      deploymentTarget: 'auto-detect',
      codeQualityChecks: true,
      securityScanning: true
    };

    this.teamConfiguration = {
      roles: ['product-owner', 'developer', 'qa-engineer', 'devops-engineer'],
      assignmentRules: new Map(),
      notificationSettings: {
        onSpecUpdate: true,
        onImplementationStart: true,
        onMilestoneComplete: true
      }
    };

    this.integrationPoints = {
      specNewCompatible: true,
      supportedProjectTypes: ['web-app', 'api', 'mobile-app', 'library', 'agent-swarm'],
      externalServices: [],
      webhookEndpoints: []
    };
  }

  /**
   * Initialize configuration for a new project
   * @param {string} projectName - Project name
   * @param {string} projectType - Type of project
   * @param {Object} options - Additional configuration options
   */
  initializeProject(projectName, projectType = 'web-app', options = {}) {
    this.projectMetadata.name = projectName;
    this.projectMetadata.description = options.description || `${projectName} - A GitHub Spec Kit project`;
    this.projectMetadata.created = new Date();
    this.projectMetadata.lastModified = new Date();

    // Configure based on project type
    this.configureForProjectType(projectType);

    // Apply custom options
    if (options.complianceLevel) {
      this.specKitSettings.complianceLevel = options.complianceLevel;
    }

    if (options.teamSize) {
      this.configureTeamSettings(options.teamSize);
    }
  }

  /**
   * Configure settings based on project type
   * @param {string} projectType - Type of project
   */
  configureForProjectType(projectType) {
    switch (projectType) {
      case 'web-app':
        this.automationSettings.testingFramework = 'jest';
        this.automationSettings.deploymentTarget = 'vercel';
        this.repositoryConfig.generatePackageJson = true;
        break;

      case 'api':
        this.automationSettings.testingFramework = 'jest';
        this.automationSettings.deploymentTarget = 'docker';
        this.automationSettings.securityScanning = true;
        break;

      case 'mobile-app':
        this.automationSettings.testingFramework = 'detox';
        this.automationSettings.deploymentTarget = 'app-store';
        this.specKitSettings.complianceLevel = 'comprehensive';
        break;

      case 'library':
        this.automationSettings.testingFramework = 'jest';
        this.automationSettings.deploymentTarget = 'npm';
        this.repositoryConfig.requirePullRequests = true;
        break;

      case 'agent-swarm':
        this.automationSettings.testingFramework = 'custom';
        this.automationSettings.deploymentTarget = 'distributed';
        this.specKitSettings.includeAutomation = false; // Manual orchestration
        break;

      default:
        // Use standard configuration
        break;
    }
  }

  /**
   * Configure team settings based on team size
   * @param {string} teamSize - 'solo', 'small', 'medium', 'large'
   */
  configureTeamSettings(teamSize) {
    switch (teamSize) {
      case 'solo':
        this.teamConfiguration.roles = ['developer'];
        this.repositoryConfig.requirePullRequests = false;
        this.teamConfiguration.notificationSettings.onSpecUpdate = false;
        break;

      case 'small':
        this.teamConfiguration.roles = ['product-owner', 'developer'];
        this.repositoryConfig.requirePullRequests = true;
        break;

      case 'medium':
        this.teamConfiguration.roles = ['product-owner', 'developer', 'qa-engineer'];
        this.specKitSettings.complianceLevel = 'comprehensive';
        break;

      case 'large':
        this.teamConfiguration.roles = ['product-owner', 'developer', 'qa-engineer', 'devops-engineer', 'designer'];
        this.specKitSettings.complianceLevel = 'comprehensive';
        this.automationSettings.codeQualityChecks = true;
        break;
    }

    this.setupAssignmentRules();
  }

  /**
   * Setup automatic task assignment rules
   */
  setupAssignmentRules() {
    this.teamConfiguration.assignmentRules.clear();

    // Define assignment patterns based on task prefixes
    this.teamConfiguration.assignmentRules.set('spec-', 'product-owner');
    this.teamConfiguration.assignmentRules.set('found-', 'devops-engineer');
    this.teamConfiguration.assignmentRules.set('dev-', 'developer');
    this.teamConfiguration.assignmentRules.set('test-', 'qa-engineer');
    this.teamConfiguration.assignmentRules.set('deploy-', 'devops-engineer');
    this.teamConfiguration.assignmentRules.set('design-', 'designer');
  }

  /**
   * Generate GitHub issue templates based on configuration
   * @returns {Array} Array of issue template configurations
   */
  generateIssueTemplates() {
    const templates = [];

    if (this.specKitSettings.generateIssueTemplates) {
      templates.push({
        name: 'Specification Review',
        about: 'Review and validate project specifications',
        labels: ['spec-review', 'documentation'],
        assignees: this.getAssigneeForPattern('spec-')
      });

      templates.push({
        name: 'Feature Implementation',
        about: 'Implement a new feature based on specifications',
        labels: ['enhancement', 'implementation'],
        assignees: this.getAssigneeForPattern('dev-')
      });

      templates.push({
        name: 'Bug Report',
        about: 'Report a bug or issue',
        labels: ['bug', 'needs-investigation'],
        assignees: this.getAssigneeForPattern('dev-')
      });

      if (this.teamConfiguration.roles.includes('qa-engineer')) {
        templates.push({
          name: 'Testing Request',
          about: 'Request testing for implemented features',
          labels: ['testing', 'qa'],
          assignees: this.getAssigneeForPattern('test-')
        });
      }

      if (this.automationSettings.deploymentTarget !== 'manual') {
        templates.push({
          name: 'Deployment Request',
          about: 'Request deployment of changes',
          labels: ['deployment', 'devops'],
          assignees: this.getAssigneeForPattern('deploy-')
        });
      }
    }

    return templates;
  }

  /**
   * Get assignee for task pattern
   * @param {string} pattern - Task pattern (e.g., 'spec-', 'dev-')
   * @returns {string} Assigned role
   */
  getAssigneeForPattern(pattern) {
    return this.teamConfiguration.assignmentRules.get(pattern) || 'developer';
  }

  /**
   * Generate project board configuration
   * @returns {Object} Project board configuration
   */
  generateProjectBoardConfig() {
    if (!this.specKitSettings.setupProjectBoard) return null;

    const columns = [
      { name: 'Specification Review', purpose: 'Review and validate specs' },
      { name: 'Ready for Development', purpose: 'Approved and ready' },
      { name: 'In Progress', purpose: 'Currently being worked on' },
      { name: 'Testing', purpose: 'Implementation complete, testing' },
      { name: 'Done', purpose: 'Complete and deployed' }
    ];

    // Add additional columns based on team configuration
    if (this.teamConfiguration.roles.includes('designer')) {
      columns.splice(1, 0, { name: 'Design Review', purpose: 'Design validation needed' });
    }

    if (this.automationSettings.securityScanning) {
      columns.splice(-1, 0, { name: 'Security Review', purpose: 'Security validation' });
    }

    return {
      name: `${this.projectMetadata.name} Implementation`,
      description: 'Track implementation progress using GitHub Spec Kit methodology',
      columns,
      automation: this.specKitSettings.includeAutomation
    };
  }

  /**
   * Generate milestone configuration
   * @returns {Array} Milestone configurations
   */
  generateMilestones() {
    if (!this.specKitSettings.enableMilestoneTracking) return [];

    const milestones = [
      {
        title: 'Specification Complete',
        description: 'All specifications reviewed and approved',
        dueDate: this.calculateMilestoneDate(2) // 2 weeks
      },
      {
        title: 'Foundation Phase Complete',
        description: 'Core infrastructure and setup complete',
        dueDate: this.calculateMilestoneDate(4) // 4 weeks
      },
      {
        title: 'Core Development Complete',
        description: 'Main features implemented and tested',
        dueDate: this.calculateMilestoneDate(8) // 8 weeks
      },
      {
        title: 'Production Ready',
        description: 'Ready for production deployment',
        dueDate: this.calculateMilestoneDate(12) // 12 weeks
      }
    ];

    return milestones;
  }

  /**
   * Calculate milestone due date
   * @param {number} weeksFromNow - Weeks from current date
   * @returns {Date} Due date
   */
  calculateMilestoneDate(weeksFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + (weeksFromNow * 7));
    return date;
  }

  /**
   * Validate configuration
   * @returns {Object} Validation results
   */
  validate() {
    const issues = [];
    const warnings = [];

    // Required fields
    if (!this.projectMetadata.name) {
      issues.push('Project name is required');
    }

    // Project type validation
    if (!this.integrationPoints.supportedProjectTypes.includes(this.projectMetadata.type)) {
      issues.push(`Unsupported project type: ${this.projectMetadata.type}`);
    }

    // Team configuration validation
    if (this.teamConfiguration.roles.length === 0) {
      issues.push('At least one team role must be defined');
    }

    // Compliance level warnings
    if (this.specKitSettings.complianceLevel === 'minimal') {
      warnings.push('Minimal compliance may not meet enterprise requirements');
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      configuredFor: this.projectMetadata.type || 'unknown'
    };
  }

  /**
   * Export configuration for GitHub repository setup
   * @returns {Object} Repository setup configuration
   */
  exportForGitHub() {
    return {
      repository: this.repositoryConfig,
      issueTemplates: this.generateIssueTemplates(),
      projectBoard: this.generateProjectBoardConfig(),
      milestones: this.generateMilestones(),
      automation: this.automationSettings,
      team: {
        roles: this.teamConfiguration.roles,
        assignments: Object.fromEntries(this.teamConfiguration.assignmentRules)
      }
    };
  }

  /**
   * Create configuration for specific GitHub Spec Kit compliance
   * @param {string} complianceLevel - Compliance level required
   * @returns {GitHubSpecKitConfig} Configured instance
   */
  static createForCompliance(complianceLevel = 'standard') {
    const config = new GitHubSpecKitConfig();
    config.specKitSettings.complianceLevel = complianceLevel;

    if (complianceLevel === 'comprehensive') {
      config.specKitSettings.includeAutomation = true;
      config.automationSettings.codeQualityChecks = true;
      config.automationSettings.securityScanning = true;
      config.repositoryConfig.requirePullRequests = true;
    }

    return config;
  }
}

export default GitHubSpecKitConfig;