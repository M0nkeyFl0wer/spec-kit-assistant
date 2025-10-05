import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { DogArt } from '../character/dog-art.js';
import { GitHubSpecKitIntegration } from './github-spec-kit-integration.js';

/**
 * 🔧 Spec Kit Implementer
 * Creates actual GitHub Spec Kit files and implements their task tracking system
 */
export class SpecKitImplementer {
  constructor() {
    this.specKit = new GitHubSpecKitIntegration();
    this.specKitTemplatesUrl = 'https://github.com/github/spec-kit';
    this.workingDir = process.cwd();
    this.specDir = path.join(this.workingDir, 'specs');
    this.taskSystem = null;
  }

  async initializeSpecKit(projectContext) {
    console.log(chalk.cyan(DogArt.scientist));
    console.log(chalk.blue('🐕 Spec: "Setting up real GitHub Spec Kit implementation..."'));
    console.log('');

    try {
      // Download and setup spec kit templates
      await this.downloadSpecKitTemplates();

      // Generate spec files using templates
      const specFiles = await this.generateSpecKitFiles(projectContext);

      // Initialize GitHub Spec Kit task system
      await this.initializeTaskSystem(specFiles);

      // Create implementation tracking
      await this.setupImplementationTracking(projectContext);

      console.log(chalk.green('✅ GitHub Spec Kit fully implemented!'));
      return specFiles;
    } catch (error) {
      console.log(chalk.red('❌ Spec Kit setup failed:'), error.message);
      throw error;
    }
  }

  async downloadSpecKitTemplates() {
    console.log(chalk.yellow('📦 Downloading GitHub Spec Kit templates...'));

    const tempDir = path.join(this.workingDir, '.spec-kit-temp');

    try {
      // Clone the spec-kit repository
      execSync(`git clone --depth 1 ${this.specKitTemplatesUrl} ${tempDir}`, { stdio: 'pipe' });

      // Copy templates to our structure
      const templatesDir = path.join(tempDir, 'templates');
      if (await fs.pathExists(templatesDir)) {
        await fs.copy(templatesDir, path.join(this.workingDir, '.spec-templates'));
        console.log(chalk.green('✅ Templates downloaded'));
      } else {
        console.log(chalk.yellow('⚠️ Templates not found, using built-in versions'));
      }

      // Cleanup
      await fs.remove(tempDir);
    } catch (error) {
      console.log(chalk.yellow('⚠️ Could not download templates, using built-in versions'));
    }
  }

  async generateSpecKitFiles(projectContext) {
    console.log(chalk.cyan(DogArt.builder));
    console.log(chalk.blue('🐕 Spec: "Generating GitHub Spec Kit compliant files..."'));
    console.log('');

    await fs.ensureDir(this.specDir);

    // Load templates or use built-in ones
    const templates = await this.loadSpecKitTemplates();

    // Generate each required spec file
    const specFiles = {
      problem: await this.generateFromTemplate('PROBLEM.md', templates.problem, projectContext),
      solution: await this.generateFromTemplate('SOLUTION.md', templates.solution, projectContext),
      specification: await this.generateFromTemplate('SPECIFICATION.md', templates.specification, projectContext),
      implementation: await this.generateFromTemplate('IMPLEMENTATION.md', templates.implementation, projectContext),
    };

    // Generate the main spec index
    await this.generateSpecIndex(specFiles);

    // Create GitHub Issues templates
    await this.generateIssueTemplates(projectContext);

    console.log(chalk.green('✅ All Spec Kit files generated'));
    return specFiles;
  }

  async loadSpecKitTemplates() {
    const templatesDir = path.join(this.workingDir, '.spec-templates');

    const templates = {
      problem: await this.loadTemplate(templatesDir, 'PROBLEM.md') || this.getBuiltInProblemTemplate(),
      solution: await this.loadTemplate(templatesDir, 'SOLUTION.md') || this.getBuiltInSolutionTemplate(),
      specification: await this.loadTemplate(templatesDir, 'SPECIFICATION.md') || this.getBuiltInSpecificationTemplate(),
      implementation: await this.loadTemplate(templatesDir, 'IMPLEMENTATION.md') || this.getBuiltInImplementationTemplate(),
    };

    return templates;
  }

  async loadTemplate(templatesDir, filename) {
    try {
      const templatePath = path.join(templatesDir, filename);
      if (await fs.pathExists(templatePath)) {
        return await fs.readFile(templatePath, 'utf8');
      }
    } catch (error) {
      console.log(chalk.gray(`Could not load template ${filename}, using built-in`));
    }
    return null;
  }

  async generateFromTemplate(filename, template, context) {
    console.log(chalk.yellow(`📝 Generating ${filename}...`));

    // Replace template variables with actual content
    let content = template;

    // Basic variable replacements
    const replacements = {
      '{{PROJECT_NAME}}': context.vision || 'Project Name',
      '{{PROJECT_TYPE}}': context.type || 'web-app',
      '{{TIMELINE}}': context.timeline || 'mvp',
      '{{TEAM_SIZE}}': context.teamSize || 'solo',
      '{{PROBLEM_STATEMENT}}': context.deepContext?.problem || 'Problem description needed',
      '{{TARGET_AUDIENCE}}': context.deepContext?.audience || 'Target audience definition needed',
      '{{USER_EMOTION}}': context.deepContext?.emotion || 'User satisfaction',
      '{{SPECIAL_FEATURE}}': this.formatSpecialFeature(context.specialFeature),
      '{{TECHNICAL_CHOICES}}': this.formatTechnicalChoices(context),
      '{{IMPLEMENTATION_TASKS}}': this.generateImplementationTasks(context),
      '{{SUCCESS_METRICS}}': this.generateSuccessMetrics(context),
    };

    // Apply all replacements
    for (const [variable, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(variable, 'g'), value);
    }

    // Save the generated file
    const filepath = path.join(this.specDir, filename);
    await fs.writeFile(filepath, content);

    console.log(chalk.green(`✅ ${filename} generated`));
    return { filename, filepath, content };
  }

  formatSpecialFeature(specialFeature) {
    if (!specialFeature) return 'Core functionality to be defined';

    if (typeof specialFeature === 'string') {
      return specialFeature;
    }

    return `${specialFeature.description}\n\n**How it works:** ${specialFeature.mechanics || 'Implementation details needed'}\n\n**Why it matters:** ${specialFeature.importance || 'Business value to be defined'}`;
  }

  formatTechnicalChoices(context) {
    const choices = [];

    // Extract technical decisions with reasoning
    Object.keys(context).forEach((key) => {
      if (key.endsWith('_reasoning')) {
        const choice = context[key];
        choices.push(`- **${key.replace('_reasoning', '')}**: ${choice.choice} - ${choice.reasoning}`);
      } else if (key.includes('frontend') || key.includes('backend') || key.includes('database')) {
        choices.push(`- **${key}**: ${context[key]}`);
      }
    });

    return choices.length > 0 ? choices.join('\n') : 'Technical decisions to be documented';
  }

  generateImplementationTasks(context) {
    const tasks = [
      '## Phase 1: Foundation',
      '- [ ] Set up development environment',
      '- [ ] Initialize project repository',
      '- [ ] Configure CI/CD pipeline',
      '- [ ] Set up monitoring and logging',
      '',
      '## Phase 2: Core Development',
      '- [ ] Implement user authentication',
      '- [ ] Build main application logic',
      '- [ ] Create data persistence layer',
      '- [ ] Develop API endpoints',
      '',
      '## Phase 3: Integration',
      '- [ ] Frontend-backend integration',
      '- [ ] Third-party service integration',
      '- [ ] Error handling implementation',
      '- [ ] Security hardening',
      '',
      '## Phase 4: Testing & Deployment',
      '- [ ] Unit test implementation',
      '- [ ] Integration test suite',
      '- [ ] End-to-end testing',
      '- [ ] Production deployment',
    ];

    // Add special feature tasks
    if (context.specialFeature) {
      tasks.splice(8, 0, `- [ ] Implement special feature: ${context.specialFeature.description || context.specialFeature}`);
    }

    return tasks.join('\n');
  }

  generateSuccessMetrics(context) {
    return `## Functional Success
- All core features working as specified
- User authentication and authorization working
- Data persistence and retrieval working
- API endpoints responding correctly

## Performance Success
- Page load times < 2 seconds
- API response times < 200ms
- System handles expected load
- No critical performance bottlenecks

## Quality Success
- Code coverage > 80%
- No critical security vulnerabilities
- All tests passing
- Code review standards met

## User Success
- ${context.deepContext?.emotion || 'Positive user experience'}
- Core user workflows completed successfully
- Error handling provides clear feedback
- Documentation is complete and helpful`;
  }

  async initializeTaskSystem(specFiles) {
    console.log(chalk.cyan(DogArt.detective));
    console.log(chalk.blue('🐕 Spec: "Setting up GitHub Spec Kit task tracking system..."'));
    console.log('');

    // Create GitHub Issues for spec implementation
    await this.createSpecImplementationIssues();

    // Set up project board
    await this.setupProjectBoard();

    // Initialize milestone tracking
    await this.setupMilestoneTracking();

    console.log(chalk.green('✅ Task tracking system initialized'));
  }

  async createSpecImplementationIssues() {
    console.log(chalk.yellow('📋 Creating implementation issues...'));

    const issueTemplates = {
      'spec-review': {
        title: '📋 Review Generated Specifications',
        body: `## Specification Review

Please review the generated specification files:

- [ ] PROBLEM.md - Problem statement and scope
- [ ] SOLUTION.md - High-level solution approach
- [ ] SPECIFICATION.md - Technical specification
- [ ] IMPLEMENTATION.md - Implementation plan

## Review Checklist

- [ ] Problem statement is clear and complete
- [ ] Solution addresses the stated problem
- [ ] Technical specification is detailed and feasible
- [ ] Implementation plan is realistic and achievable
- [ ] All dependencies are identified
- [ ] Success criteria are measurable

## Next Steps

After review, create implementation issues for each major component.`,
        labels: ['spec-review', 'documentation'],
      },

      'implementation-setup': {
        title: '🚀 Set Up Implementation Environment',
        body: `## Implementation Setup

Set up the development environment based on the technical specification.

### Tasks

- [ ] Initialize project repository
- [ ] Set up development environment
- [ ] Configure build tools and dependencies
- [ ] Set up testing framework
- [ ] Configure CI/CD pipeline
- [ ] Set up monitoring and logging

### Acceptance Criteria

- Development environment is fully functional
- All team members can run the project locally
- CI/CD pipeline is working
- Basic project structure follows specification

### Dependencies

- Specification review must be complete
- Technical decisions must be finalized`,
        labels: ['setup', 'infrastructure'],
      },
    };

    // Generate issue files
    const issuesDir = path.join(this.specDir, '.github', 'ISSUE_TEMPLATE');
    await fs.ensureDir(issuesDir);

    for (const [key, issue] of Object.entries(issueTemplates)) {
      const issueFile = path.join(issuesDir, `${key}.md`);
      const issueContent = `---
name: ${issue.title}
about: ${issue.body.split('\n')[0]}
title: '${issue.title}'
labels: ${issue.labels.join(', ')}
assignees: ''
---

${issue.body}
`;

      await fs.writeFile(issueFile, issueContent);
    }

    console.log(chalk.green('✅ GitHub issue templates created'));
  }

  async setupProjectBoard() {
    console.log(chalk.yellow('📊 Setting up project board configuration...'));

    const projectConfig = {
      name: 'Spec Implementation',
      description: 'Track implementation progress based on generated specification',
      columns: [
        { name: 'Specification Review', purpose: 'Review and validate specs' },
        { name: 'Ready for Development', purpose: 'Approved and ready to implement' },
        { name: 'In Progress', purpose: 'Currently being worked on' },
        { name: 'Testing', purpose: 'Implementation complete, testing in progress' },
        { name: 'Done', purpose: 'Complete and deployed' },
      ],
    };

    // Save project board configuration
    const configPath = path.join(this.specDir, '.github', 'project-board.json');
    await fs.ensureDir(path.dirname(configPath));
    await fs.writeFile(configPath, JSON.stringify(projectConfig, null, 2));

    console.log(chalk.green('✅ Project board configuration saved'));
  }

  async setupMilestoneTracking() {
    console.log(chalk.yellow('🎯 Setting up milestone tracking...'));

    const milestones = [
      {
        title: 'Specification Complete',
        description: 'All specification documents reviewed and approved',
        due_date: this.calculateDueDate(7), // 1 week from now
        state: 'open',
      },
      {
        title: 'Foundation Phase Complete',
        description: 'Development environment and basic infrastructure ready',
        due_date: this.calculateDueDate(14), // 2 weeks from now
        state: 'open',
      },
      {
        title: 'Core Development Complete',
        description: 'Main features implemented and tested',
        due_date: this.calculateDueDate(42), // 6 weeks from now
        state: 'open',
      },
      {
        title: 'Production Ready',
        description: 'Application deployed and ready for users',
        due_date: this.calculateDueDate(56), // 8 weeks from now
        state: 'open',
      },
    ];

    // Save milestone configuration
    const milestonesPath = path.join(this.specDir, '.github', 'milestones.json');
    await fs.writeFile(milestonesPath, JSON.stringify(milestones, null, 2));

    console.log(chalk.green('✅ Milestone tracking configured'));
  }

  calculateDueDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  async setupImplementationTracking(projectContext) {
    console.log(chalk.cyan(DogArt.graduate));
    console.log(chalk.blue('🐕 Spec: "Setting up implementation progress tracking..."'));
    console.log('');

    // Create implementation checklist
    const checklist = await this.generateImplementationChecklist(projectContext);

    // Set up progress tracking
    await this.initializeProgressTracking(checklist);

    // Create task assignment system
    await this.setupTaskAssignment();

    console.log(chalk.green('✅ Implementation tracking ready'));
  }

  async generateImplementationChecklist(projectContext) {
    const checklist = {
      metadata: {
        projectName: projectContext.vision || 'Project',
        projectType: projectContext.type || 'web-app',
        generated: new Date().toISOString(),
        totalTasks: 0,
        completedTasks: 0,
      },
      phases: [
        {
          name: 'Specification Phase',
          description: 'Review and finalize specifications',
          tasks: [
            {
              id: 'spec-001', title: 'Review problem statement', completed: false, assignee: null,
            },
            {
              id: 'spec-002', title: 'Validate solution approach', completed: false, assignee: null,
            },
            {
              id: 'spec-003', title: 'Approve technical specification', completed: false, assignee: null,
            },
            {
              id: 'spec-004', title: 'Finalize implementation plan', completed: false, assignee: null,
            },
          ],
        },
        {
          name: 'Foundation Phase',
          description: 'Set up development infrastructure',
          tasks: [
            {
              id: 'found-001', title: 'Initialize project repository', completed: false, assignee: null,
            },
            {
              id: 'found-002', title: 'Set up development environment', completed: false, assignee: null,
            },
            {
              id: 'found-003', title: 'Configure build pipeline', completed: false, assignee: null,
            },
            {
              id: 'found-004', title: 'Set up testing framework', completed: false, assignee: null,
            },
          ],
        },
        {
          name: 'Development Phase',
          description: 'Implement core features',
          tasks: this.generateDevelopmentTasks(projectContext),
        },
        {
          name: 'Integration Phase',
          description: 'Integrate components and test',
          tasks: [
            {
              id: 'integ-001', title: 'Frontend-backend integration', completed: false, assignee: null,
            },
            {
              id: 'integ-002', title: 'Database integration', completed: false, assignee: null,
            },
            {
              id: 'integ-003', title: 'Third-party service integration', completed: false, assignee: null,
            },
            {
              id: 'integ-004', title: 'End-to-end testing', completed: false, assignee: null,
            },
          ],
        },
        {
          name: 'Deployment Phase',
          description: 'Deploy to production',
          tasks: [
            {
              id: 'deploy-001', title: 'Production environment setup', completed: false, assignee: null,
            },
            {
              id: 'deploy-002', title: 'Security configuration', completed: false, assignee: null,
            },
            {
              id: 'deploy-003', title: 'Monitoring setup', completed: false, assignee: null,
            },
            {
              id: 'deploy-004', title: 'Go-live deployment', completed: false, assignee: null,
            },
          ],
        },
      ],
    };

    // Calculate total tasks
    checklist.metadata.totalTasks = checklist.phases.reduce((total, phase) => total + phase.tasks.length, 0);

    // Save checklist
    const checklistPath = path.join(this.specDir, 'implementation-checklist.json');
    await fs.writeFile(checklistPath, JSON.stringify(checklist, null, 2));

    console.log(chalk.green(`✅ Implementation checklist created (${checklist.metadata.totalTasks} tasks)`));
    return checklist;
  }

  generateDevelopmentTasks(projectContext) {
    const baseTasks = [
      {
        id: 'dev-001', title: 'User authentication system', completed: false, assignee: null,
      },
      {
        id: 'dev-002', title: 'Database models and migrations', completed: false, assignee: null,
      },
      {
        id: 'dev-003', title: 'API endpoint implementation', completed: false, assignee: null,
      },
      {
        id: 'dev-004', title: 'Frontend component development', completed: false, assignee: null,
      },
    ];

    // Add special feature task
    if (projectContext.specialFeature) {
      const featureDescription = typeof projectContext.specialFeature === 'string'
        ? projectContext.specialFeature
        : projectContext.specialFeature.description;

      baseTasks.push({
        id: 'dev-005',
        title: `Special feature: ${featureDescription}`,
        completed: false,
        assignee: null,
      });
    }

    return baseTasks;
  }

  async initializeProgressTracking(checklist) {
    console.log(chalk.yellow('📈 Initializing progress tracking...'));

    const progressTracker = {
      startDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      overallProgress: 0,
      phaseProgress: checklist.phases.map((phase) => ({
        name: phase.name,
        progress: 0,
        completedTasks: 0,
        totalTasks: phase.tasks.length,
      })),
      recentActivity: [],
      blockers: [],
      risks: [],
    };

    // Save progress tracker
    const progressPath = path.join(this.specDir, 'progress-tracking.json');
    await fs.writeFile(progressPath, JSON.stringify(progressTracker, null, 2));

    console.log(chalk.green('✅ Progress tracking initialized'));
  }

  async setupTaskAssignment() {
    console.log(chalk.yellow('👥 Setting up task assignment system...'));

    const assignmentConfig = {
      assignmentRules: {
        'spec-*': 'product-owner',
        'found-*': 'devops-engineer',
        'dev-*': 'developer',
        'integ-*': 'qa-engineer',
        'deploy-*': 'devops-engineer',
      },
      teamRoles: {
        'product-owner': 'Specification and requirements',
        developer: 'Feature implementation',
        'qa-engineer': 'Testing and quality assurance',
        'devops-engineer': 'Infrastructure and deployment',
      },
      notificationSettings: {
        taskAssigned: true,
        taskCompleted: true,
        phaseCompleted: true,
        blockerReported: true,
      },
    };

    // Save assignment configuration
    const assignmentPath = path.join(this.specDir, 'task-assignment.json');
    await fs.writeFile(assignmentPath, JSON.stringify(assignmentConfig, null, 2));

    console.log(chalk.green('✅ Task assignment system configured'));
  }

  async generateSpecIndex(specFiles) {
    const indexContent = `# Project Specification

Generated by Spec Kit Assistant following [GitHub Spec Kit](https://github.com/github/spec-kit) standards.

## 📋 Specification Documents

- [📋 Problem Statement](./PROBLEM.md) - What problem we're solving and why
- [💡 Solution Overview](./SOLUTION.md) - High-level approach and architecture
- [🔧 Technical Specification](./SPECIFICATION.md) - Detailed technical design
- [🚀 Implementation Plan](./IMPLEMENTATION.md) - Development roadmap and tasks

## 📊 Implementation Tracking

- [✅ Implementation Checklist](./implementation-checklist.json) - Detailed task tracking
- [📈 Progress Tracking](./progress-tracking.json) - Real-time progress monitoring
- [👥 Task Assignment](./task-assignment.json) - Team role assignments

## 🎯 GitHub Integration

- [📋 Issue Templates](./.github/ISSUE_TEMPLATE/) - Pre-configured issue templates
- [📊 Project Board](./.github/project-board.json) - Project board configuration
- [🎯 Milestones](./.github/milestones.json) - Milestone tracking setup

## 🐕 Generated with Love

This specification was created through conversational consultation with Spec, your loyal dog assistant, ensuring both human insight and technical rigor while following GitHub Spec Kit best practices.

---
*Specification compliant with GitHub Spec Kit standards*
*Implementation tracking ready for team collaboration*
`;

    await fs.writeFile(path.join(this.specDir, 'README.md'), indexContent);
    console.log(chalk.green('✅ Specification index created'));
  }

  // Built-in templates (fallbacks if GitHub templates unavailable)
  getBuiltInProblemTemplate() {
    return `# Problem Statement

## What problem are we solving?

{{PROBLEM_STATEMENT}}

## Who has this problem?

{{TARGET_AUDIENCE}}

## Why is this problem worth solving?

This problem is significant because it affects our target users in the following ways:
- User frustration and inefficiency
- Time and resource waste
- Missed opportunities for value creation

## How do we know this is a real problem?

Evidence supporting this problem:
- User feedback and complaints
- Market research data
- Competitive analysis
- Direct observation

## Success criteria

When this problem is solved, users will experience:
- {{USER_EMOTION}}
- Improved efficiency and satisfaction
- Measurable value delivery

## Out of scope

The following are explicitly not part of this solution:
- Features planned for future releases
- Integration with systems not specified
- Performance beyond stated requirements

---
*Generated by Spec Kit Assistant - GitHub Spec Kit Compliant*
`;
  }

  getBuiltInSolutionTemplate() {
    return `# Solution Overview

## High-level approach

{{SPECIAL_FEATURE}}

## Key features

The solution will include:
- Core functionality addressing the main problem
- User interface for easy interaction
- Data management and persistence
- Integration capabilities where needed

## User experience

Users will interact with the solution through:
1. Initial setup and configuration
2. Primary workflow completion
3. Result review and action

## Technical approach

- **Project type**: {{PROJECT_TYPE}}
- **Timeline**: {{TIMELINE}}
- **Team size**: {{TEAM_SIZE}}

## Architecture overview

{{TECHNICAL_CHOICES}}

## Alternative solutions considered

We evaluated these alternatives:
- Existing solutions and their limitations
- Build vs buy decisions
- Technology trade-offs

## Success metrics

{{SUCCESS_METRICS}}

---
*Generated by Spec Kit Assistant - GitHub Spec Kit Compliant*
`;
  }

  getBuiltInSpecificationTemplate() {
    return `# Technical Specification

## System architecture

### High-level components
- Frontend application
- Backend API services
- Database layer
- External integrations

### Technology stack
{{TECHNICAL_CHOICES}}

## Data models

### Core entities
- User: Authentication and profile
- Project: Main business entity
- Session: Interaction tracking

### Relationships
- User has many Projects
- Project belongs to User

## API design

### Authentication
- JWT-based authentication
- Role-based authorization
- Session management

### Core endpoints
- POST /auth/login - User authentication
- GET /api/projects - List projects
- POST /api/projects - Create project
- GET /api/projects/:id - Get project details

## Frontend specification

### Component architecture
- React-based component structure
- State management with Context/Redux
- Responsive design for all devices

### User interface
- Clean, intuitive design
- Accessibility compliance
- Performance optimization

## Security considerations

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF token implementation

## Performance requirements

- Page load time < 2 seconds
- API response time < 200ms
- Support for concurrent users
- Database query optimization

---
*Generated by Spec Kit Assistant - GitHub Spec Kit Compliant*
`;
  }

  getBuiltInImplementationTemplate() {
    return `# Implementation Plan

## Development phases

### Phase 1: Foundation (Week 1)
{{IMPLEMENTATION_TASKS}}

## Technical tasks breakdown

### Backend development
- Database schema design and implementation
- API endpoint development
- Authentication and authorization
- Data validation and error handling

### Frontend development
- Component development and styling
- State management implementation
- API integration
- User experience optimization

### Testing strategy
- Unit tests for all components
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Performance and security testing

## Deployment strategy

### Environment setup
- Development environment configuration
- Staging environment for testing
- Production environment preparation

### Deployment process
1. Code review and approval
2. Automated testing pipeline
3. Staging deployment and validation
4. Production deployment
5. Post-deployment monitoring

## Risk mitigation

### Technical risks
- Performance bottlenecks
- Integration complexity
- Security vulnerabilities

### Project risks
- Timeline delays
- Resource constraints
- Scope creep

## Success criteria

{{SUCCESS_METRICS}}

---
*Generated by Spec Kit Assistant - GitHub Spec Kit Compliant*
`;
  }
}

export default SpecKitImplementer;
