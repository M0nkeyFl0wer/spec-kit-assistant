import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { SpecCharacter } from '../character/spec.js';

export class OversightSystem {
  constructor() {
    this.spec = new SpecCharacter();
    this.mode = 'strategic'; // trust-verify | strategic | full-control
    this.config = {
      autoApprovalThreshold: 0.8,
      criticalDecisionPoints: [
        'architecture-changes',
        'security-configurations',
        'database-schema-changes',
        'api-breaking-changes',
        'deployment-configurations',
        'third-party-integrations',
        'data-handling-logic'
      ],
      trivialOperations: [
        'file-formatting',
        'comment-updates',
        'documentation-updates',
        'logging-statements',
        'variable-renaming',
        'code-style-fixes'
      ]
    };

    this.approvalQueue = [];
    this.executionHistory = [];
    this.riskAssessments = {};
  }

  async setMode(newMode) {
    const validModes = ['trust-verify', 'strategic', 'full-control'];

    if (!validModes.includes(newMode)) {
      await this.spec.show('concerned', `I don't recognize that oversight mode. Let me help you choose!`);
      return await this.configure();
    }

    this.mode = newMode;
    await this.explainMode(newMode);
    await this.saveConfiguration();
  }

  async explainMode(mode) {
    const explanations = {
      'trust-verify': {
        title: '🔄 Trust and Verify Mode',
        description: 'Agents work autonomously with spot-checks',
        details: [
          '✅ 90% of tasks run automatically',
          '🔍 Background agents monitor quality',
          '⚠️ Only interrupts for critical issues',
          '📊 Provides summary reports',
          '🚀 Fastest execution speed'
        ],
        when: 'Best for experienced developers on familiar projects'
      },
      'strategic': {
        title: '🎯 Strategic Checkpoints Mode',
        description: 'Smart check-ins at key decision points',
        details: [
          '🤝 Pauses at architecture decisions',
          '🛡️ Reviews security-sensitive changes',
          '📋 Confirms major milestones',
          '⚡ Automated for routine tasks',
          '⚖️ Balanced control and speed'
        ],
        when: 'Recommended for most projects and teams'
      },
      'full-control': {
        title: '🎮 Full Control Mode',
        description: 'Human approval for every task',
        details: [
          '👀 Review every change before execution',
          '📝 Detailed explanation for each step',
          '🎓 Great for learning new technologies',
          '🔒 Maximum control and oversight',
          '⏰ Slower but thorough execution'
        ],
        when: 'Perfect for learning or critical systems'
      }
    };

    const modeInfo = explanations[mode];

    await this.spec.show('happy', `Switching to ${modeInfo.title}!`);

    console.log(chalk.cyan(`\\n${modeInfo.description}`));
    console.log(chalk.yellow('\\nFeatures:'));

    modeInfo.details.forEach(detail => {
      console.log(chalk.gray(`  ${detail}`));
    });

    console.log(chalk.blue(`\\n💡 ${modeInfo.when}`));

    await this.spec.encourage();
  }

  async configure() {
    await this.spec.show('thinking', 'Let me help you set up the perfect oversight mode...');

    // Ask about experience level
    const experience = await this.spec.askQuestion(
      'How would you describe your experience with this type of project?',
      {
        type: 'list',
        choices: [
          { name: '🌱 New to this - I want to learn and see everything', value: 'beginner' },
          { name: '📚 Some experience - I know the basics', value: 'intermediate' },
          { name: '🎯 Very experienced - I trust automation for most things', value: 'expert' }
        ]
      }
    );

    // Ask about project complexity
    const complexity = await this.spec.askQuestion(
      'How complex is your project?',
      {
        type: 'list',
        choices: [
          { name: '🎈 Simple - Quick prototype or small tool', value: 'simple' },
          { name: '🏗️ Medium - Standard web app or service', value: 'medium' },
          { name: '🏢 Complex - Enterprise system or critical infrastructure', value: 'complex' }
        ]
      }
    );

    // Ask about time preference
    const timePreference = await this.spec.askQuestion(
      'What's more important to you right now?',
      {
        type: 'list',
        choices: [
          { name: '⚡ Speed - Get things done quickly', value: 'speed' },
          { name: '⚖️ Balance - Mix of speed and control', value: 'balance' },
          { name: '🔍 Learning - I want to understand everything', value: 'learning' }
        ]
      }
    );

    // Intelligent recommendation
    const recommendedMode = this.recommendMode(experience, complexity, timePreference);

    await this.spec.show('celebrating', `Based on your preferences, I recommend ${recommendedMode.name}!`);

    console.log(chalk.green(`\\n✨ ${recommendedMode.reasoning}`));

    const useRecommendation = await this.spec.askQuestion(
      'Does this sound good to you?',
      { type: 'confirm', default: true }
    );

    if (useRecommendation) {
      await this.setMode(recommendedMode.mode);
    } else {
      // Let them choose manually
      const manualChoice = await this.spec.askQuestion(
        'Which mode would you prefer?',
        {
          type: 'list',
          choices: [
            { name: '🔄 Trust and Verify - Maximum automation', value: 'trust-verify' },
            { name: '🎯 Strategic Checkpoints - Balanced approach', value: 'strategic' },
            { name: '🎮 Full Control - Review everything', value: 'full-control' }
          ]
        }
      );

      await this.setMode(manualChoice);
    }

    // Configure additional settings
    await this.configureAdvancedSettings();
  }

  recommendMode(experience, complexity, timePreference) {
    const recommendations = {
      'beginner-simple-learning': {
        mode: 'strategic',
        name: 'Strategic Checkpoints',
        reasoning: 'Perfect for learning while still making good progress. You'll see key decisions without getting overwhelmed.'
      },
      'beginner-simple-speed': {
        mode: 'trust-verify',
        name: 'Trust and Verify',
        reasoning: 'Even simple projects can teach a lot. This mode will move quickly while keeping you informed.'
      },
      'beginner-medium-learning': {
        mode: 'full-control',
        name: 'Full Control',
        reasoning: 'Medium complexity projects are great learning opportunities. You'll understand every decision.'
      },
      'intermediate-medium-balance': {
        mode: 'strategic',
        name: 'Strategic Checkpoints',
        reasoning: 'This gives you control where it matters most while automating the routine tasks you already know.'
      },
      'expert-complex-speed': {
        mode: 'trust-verify',
        name: 'Trust and Verify',
        reasoning: 'Your experience can handle the automation, and spot-checks will catch any issues.'
      }
    };

    const key = `${experience}-${complexity}-${timePreference}`;

    // Return best match or default to strategic
    return recommendations[key] || {
      mode: 'strategic',
      name: 'Strategic Checkpoints',
      reasoning: 'This balanced approach works well for most situations and can be adjusted as needed.'
    };
  }

  async configureAdvancedSettings() {
    const wantAdvanced = await this.spec.askQuestion(
      'Would you like to customize any advanced settings?',
      { type: 'confirm', default: false }
    );

    if (!wantAdvanced) return;

    await this.spec.show('working', 'Setting up advanced configurations...');

    // Critical decision points
    const criticalPoints = await this.spec.askQuestion(
      'Which types of changes should always require your approval?',
      {
        type: 'checkbox',
        choices: [
          { name: '🏗️ Architecture Changes - Structural code changes', value: 'architecture-changes' },
          { name: '🔐 Security Configurations - Auth, permissions, keys', value: 'security-configurations' },
          { name: '🗄️ Database Schema Changes - Table/field modifications', value: 'database-schema-changes' },
          { name: '🔌 API Breaking Changes - Interface modifications', value: 'api-breaking-changes' },
          { name: '🚀 Deployment Configurations - Production settings', value: 'deployment-configurations' },
          { name: '🔗 Third-party Integrations - External service connections', value: 'third-party-integrations' },
          { name: '📊 Data Handling Logic - Data processing rules', value: 'data-handling-logic' }
        ],
        default: this.config.criticalDecisionPoints
      }
    );

    this.config.criticalDecisionPoints = criticalPoints;

    // Auto-approval threshold
    const threshold = await this.spec.askQuestion(
      'How confident should the AI be before proceeding automatically? (0-100%)',
      {
        type: 'input',
        default: '80',
        validate: (input) => {
          const num = parseInt(input);
          return (num >= 0 && num <= 100) || 'Please enter a number between 0 and 100';
        }
      }
    );

    this.config.autoApprovalThreshold = parseInt(threshold) / 100;

    await this.spec.celebrate('Advanced settings configured');
    await this.saveConfiguration();
  }

  async assessTask(task, context = {}) {
    const risk = this.calculateRisk(task, context);
    const confidence = this.calculateConfidence(task, context);

    const assessment = {
      taskId: task.id || Date.now(),
      task: task,
      context: context,
      risk: risk,
      confidence: confidence,
      requiresApproval: this.requiresApproval(task, risk, confidence),
      timestamp: new Date()
    };

    this.riskAssessments[assessment.taskId] = assessment;

    return assessment;
  }

  calculateRisk(task, context) {
    let riskScore = 0.3; // Base risk

    // Check if task involves critical decision points
    const isCritical = this.config.criticalDecisionPoints.some(point =>
      task.type?.includes(point) || task.description?.toLowerCase().includes(point.replace('-', ' '))
    );

    if (isCritical) riskScore += 0.4;

    // Assess based on task complexity
    const complexityIndicators = ['migration', 'refactor', 'security', 'database', 'deployment'];
    const hasComplexity = complexityIndicators.some(indicator =>
      task.description?.toLowerCase().includes(indicator)
    );

    if (hasComplexity) riskScore += 0.2;

    // Consider context factors
    if (context.filesAffected > 5) riskScore += 0.1;
    if (context.hasTests === false) riskScore += 0.2;
    if (context.isProduction) riskScore += 0.3;

    return Math.min(riskScore, 1.0);
  }

  calculateConfidence(task, context) {
    let confidence = 0.7; // Base confidence

    // Higher confidence for routine tasks
    const isRoutine = this.config.trivialOperations.some(op =>
      task.type?.includes(op) || task.description?.toLowerCase().includes(op.replace('-', ' '))
    );

    if (isRoutine) confidence += 0.2;

    // Consider historical success
    if (context.similarTasksSuccess > 0.8) confidence += 0.1;

    // Test coverage boosts confidence
    if (context.hasTests) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  requiresApproval(task, risk, confidence) {
    switch (this.mode) {
      case 'full-control':
        return true;

      case 'trust-verify':
        return risk > 0.7 || confidence < 0.5;

      case 'strategic':
      default:
        return risk > 0.5 || confidence < this.config.autoApprovalThreshold;
    }
  }

  async requestApproval(assessment) {
    await this.spec.show('thinking', `I need your input on this task...`);

    // Display task information
    console.log(chalk.yellow('\\n📋 Task Approval Request'));
    console.log(chalk.cyan(`Task: ${assessment.task.description}`));
    console.log(chalk.cyan(`Type: ${assessment.task.type || 'general'}`));

    // Risk indicators
    const riskColor = assessment.risk > 0.7 ? chalk.red : assessment.risk > 0.4 ? chalk.yellow : chalk.green;
    console.log(riskColor(`Risk Level: ${Math.round(assessment.risk * 100)}%`));

    const confidenceColor = assessment.confidence > 0.8 ? chalk.green : assessment.confidence > 0.5 ? chalk.yellow : chalk.red;
    console.log(confidenceColor(`Confidence: ${Math.round(assessment.confidence * 100)}%`));

    // Show what will happen
    if (assessment.task.changes) {
      console.log(chalk.blue('\\nProposed Changes:'));
      assessment.task.changes.forEach(change => {
        console.log(chalk.gray(`  • ${change}`));
      });
    }

    // Get approval
    const decision = await this.spec.askQuestion(
      'How would you like to proceed?',
      {
        type: 'list',
        choices: [
          { name: '✅ Approve - Go ahead with this task', value: 'approve' },
          { name: '🔧 Modify - I want to change something first', value: 'modify' },
          { name: '📖 Explain - Tell me more about this', value: 'explain' },
          { name: '⏸️ Pause - Skip this for now', value: 'skip' },
          { name: '❌ Reject - Don't do this task', value: 'reject' }
        ]
      }
    );

    const approvalResult = {
      taskId: assessment.taskId,
      decision: decision,
      timestamp: new Date(),
      reasoning: null
    };

    switch (decision) {
      case 'approve':
        await this.spec.celebrate('Task approved');
        break;

      case 'modify':
        approvalResult.modifications = await this.requestModifications(assessment);
        break;

      case 'explain':
        await this.explainTask(assessment);
        return await this.requestApproval(assessment); // Ask again after explanation

      case 'skip':
        await this.spec.show('happy', 'No problem! We'll come back to this later.');
        break;

      case 'reject':
        const reason = await this.spec.askQuestion(
          'Could you tell me why? This helps me learn for next time.',
          { type: 'input' }
        );
        approvalResult.reasoning = reason;
        break;
    }

    // Record the decision
    this.executionHistory.push(approvalResult);

    return approvalResult;
  }

  async requestModifications(assessment) {
    await this.spec.show('thinking', 'What modifications would you like to make?');

    const modifications = await this.spec.askQuestion(
      'Please describe the changes you'd like:',
      { type: 'input' }
    );

    const modifiedTask = {
      ...assessment.task,
      originalTask: assessment.task,
      modifications: modifications,
      modifiedBy: 'human',
      modifiedAt: new Date()
    };

    await this.spec.show('happy', 'Got it! I'll apply those modifications.');

    return modifiedTask;
  }

  async explainTask(assessment) {
    await this.spec.show('helpful', 'Let me explain this task in detail...');

    console.log(chalk.blue('\\n🔍 Detailed Task Analysis'));

    // Explain the task purpose
    console.log(chalk.yellow('Purpose:'));
    console.log(chalk.gray(`This task aims to ${assessment.task.description}`));

    // Explain why it's needed
    if (assessment.task.reasoning) {
      console.log(chalk.yellow('\\nReasoning:'));
      console.log(chalk.gray(assessment.task.reasoning));
    }

    // Explain the approach
    if (assessment.task.approach) {
      console.log(chalk.yellow('\\nApproach:'));
      assessment.task.approach.forEach(step => {
        console.log(chalk.gray(`  ${step}`));
      });
    }

    // Explain risks and mitigations
    if (assessment.risk > 0.5) {
      console.log(chalk.yellow('\\nPotential Risks:'));
      const risks = this.identifyRisks(assessment);
      risks.forEach(risk => {
        console.log(chalk.red(`  ⚠️ ${risk.description}`));
        if (risk.mitigation) {
          console.log(chalk.green(`     → Mitigation: ${risk.mitigation}`));
        }
      });
    }

    // Show alternatives if available
    if (assessment.task.alternatives) {
      console.log(chalk.yellow('\\nAlternative Approaches:'));
      assessment.task.alternatives.forEach((alt, index) => {
        console.log(chalk.cyan(`  ${index + 1}. ${alt.name}: ${alt.description}`));
      });
    }

    await this.spec.show('helpful', 'Does this help clarify the task?');
  }

  identifyRisks(assessment) {
    const risks = [];

    if (assessment.task.type?.includes('database')) {
      risks.push({
        description: 'Database changes could affect data integrity',
        mitigation: 'Create backup and test on staging environment first'
      });
    }

    if (assessment.task.type?.includes('security')) {
      risks.push({
        description: 'Security changes could create vulnerabilities',
        mitigation: 'Review security implications and run security tests'
      });
    }

    if (assessment.context.isProduction) {
      risks.push({
        description: 'Production changes could affect live users',
        mitigation: 'Deploy during low-traffic hours with rollback plan'
      });
    }

    return risks;
  }

  async executeWithOversight(taskQueue, options = {}) {
    await this.spec.show('working', 'Starting execution with smart oversight...');

    const results = [];
    let approvedTasks = 0;
    let skippedTasks = 0;
    let rejectedTasks = 0;

    for (let i = 0; i < taskQueue.length; i++) {
      const task = taskQueue[i];

      // Show progress
      await this.spec.showProgress(i + 1, taskQueue.length, 'Processing tasks');

      // Assess the task
      const assessment = await this.assessTask(task, {
        position: i + 1,
        total: taskQueue.length,
        ...options
      });

      let result = { task, assessment, executed: false };

      if (assessment.requiresApproval) {
        // Request human approval
        const approval = await this.requestApproval(assessment);

        switch (approval.decision) {
          case 'approve':
            result.executed = true;
            result.approval = approval;
            approvedTasks++;
            break;

          case 'modify':
            // Execute with modifications
            result.executed = true;
            result.modifiedTask = approval.modifications;
            result.approval = approval;
            approvedTasks++;
            break;

          case 'skip':
            result.skipped = true;
            skippedTasks++;
            break;

          case 'reject':
            result.rejected = true;
            result.reasoning = approval.reasoning;
            rejectedTasks++;
            break;
        }
      } else {
        // Auto-approve based on mode and assessment
        result.executed = true;
        result.autoApproved = true;
        approvedTasks++;

        // Still log for Trust and Verify mode
        if (this.mode === 'trust-verify') {
          console.log(chalk.green(`✓ Auto-approved: ${task.description}`));
        }
      }

      results.push(result);
    }

    // Show execution summary
    await this.showExecutionSummary(results, {
      approved: approvedTasks,
      skipped: skippedTasks,
      rejected: rejectedTasks
    });

    return results;
  }

  async showExecutionSummary(results, stats) {
    await this.spec.show('celebrating', 'Execution complete! Here's what we accomplished:');

    console.log(chalk.yellow('\\n📊 Execution Summary'));
    console.log(chalk.green(`✅ Approved: ${stats.approved} tasks`));
    console.log(chalk.blue(`⏸️ Skipped: ${stats.skipped} tasks`));
    console.log(chalk.red(`❌ Rejected: ${stats.rejected} tasks`));

    // Show mode-specific insights
    const autoApproved = results.filter(r => r.autoApproved).length;
    if (autoApproved > 0) {
      console.log(chalk.cyan(`🤖 Auto-approved: ${autoApproved} tasks`));
    }

    // Offer to adjust mode based on results
    const totalRequiredApproval = results.filter(r => r.assessment.requiresApproval).length;
    const approvalRate = totalRequiredApproval / results.length;

    if (approvalRate > 0.8 && this.mode !== 'full-control') {
      await this.spec.show('thinking', 'I noticed most tasks required approval. Would you like me to be more autonomous next time?');
    } else if (approvalRate < 0.2 && this.mode !== 'trust-verify') {
      await this.spec.show('thinking', 'Most tasks were handled automatically. Want to enable more automation?');
    }

    // Save execution log
    await this.saveExecutionLog(results, stats);
  }

  async saveConfiguration() {
    const configPath = path.join(process.cwd(), '.spec-assistant', 'oversight-config.json');
    await fs.ensureDir(path.dirname(configPath));

    const config = {
      mode: this.mode,
      config: this.config,
      lastUpdated: new Date()
    };

    await fs.writeJson(configPath, config, { spaces: 2 });
    console.log(chalk.gray(`Configuration saved to ${configPath}`));
  }

  async loadConfiguration() {
    const configPath = path.join(process.cwd(), '.spec-assistant', 'oversight-config.json');

    try {
      if (await fs.pathExists(configPath)) {
        const saved = await fs.readJson(configPath);
        this.mode = saved.mode || 'strategic';
        this.config = { ...this.config, ...saved.config };
        return true;
      }
    } catch (error) {
      console.log(chalk.yellow('Using default oversight configuration'));
    }

    return false;
  }

  async saveExecutionLog(results, stats) {
    const logPath = path.join(process.cwd(), '.spec-assistant', 'execution-logs');
    await fs.ensureDir(logPath);

    const logFile = path.join(logPath, `execution-${Date.now()}.json`);
    const log = {
      timestamp: new Date(),
      mode: this.mode,
      stats: stats,
      results: results,
      config: this.config
    };

    await fs.writeJson(logFile, log, { spaces: 2 });
  }

  // Integration methods
  async integrateWithSpec(specCharacter) {
    this.spec = specCharacter;
    await this.spec.integrateWithOversight(this);
  }

  async integrateWithSwarm(swarmManager) {
    this.swarmManager = swarmManager;
    // Setup callbacks for swarm oversight
    swarmManager.on('taskAssessment', (task) => this.assessTask(task));
    swarmManager.on('approvalRequired', (assessment) => this.requestApproval(assessment));
  }

  // Utility methods for external systems
  isTaskApproved(taskId) {
    const history = this.executionHistory.find(h => h.taskId === taskId);
    return history?.decision === 'approve' || history?.decision === 'modify';
  }

  getApprovalHistory() {
    return this.executionHistory;
  }

  getRiskAssessment(taskId) {
    return this.riskAssessments[taskId];
  }

  async generateOversightReport() {
    const report = {
      mode: this.mode,
      totalAssessments: Object.keys(this.riskAssessments).length,
      approvalRate: this.calculateApprovalRate(),
      averageRisk: this.calculateAverageRisk(),
      criticalDecisions: this.countCriticalDecisions(),
      recommendations: this.generateModeRecommendations()
    };

    console.log(chalk.blue('\\n📈 Oversight Report'));
    console.log(chalk.cyan(`Current Mode: ${this.mode}`));
    console.log(chalk.cyan(`Total Tasks Assessed: ${report.totalAssessments}`));
    console.log(chalk.cyan(`Approval Rate: ${Math.round(report.approvalRate * 100)}%`));
    console.log(chalk.cyan(`Average Risk Level: ${Math.round(report.averageRisk * 100)}%`));

    return report;
  }

  calculateApprovalRate() {
    const approvals = this.executionHistory.filter(h =>
      h.decision === 'approve' || h.decision === 'modify'
    ).length;
    return this.executionHistory.length > 0 ? approvals / this.executionHistory.length : 0;
  }

  calculateAverageRisk() {
    const risks = Object.values(this.riskAssessments).map(a => a.risk);
    return risks.length > 0 ? risks.reduce((sum, risk) => sum + risk, 0) / risks.length : 0;
  }

  countCriticalDecisions() {
    return Object.values(this.riskAssessments).filter(a => a.risk > 0.7).length;
  }

  generateModeRecommendations() {
    const approvalRate = this.calculateApprovalRate();
    const averageRisk = this.calculateAverageRisk();

    if (approvalRate < 0.3 && this.mode === 'full-control') {
      return ['Consider switching to Strategic Checkpoints for better efficiency'];
    }

    if (averageRisk < 0.3 && approvalRate > 0.9 && this.mode === 'strategic') {
      return ['Your project seems low-risk. Trust and Verify mode might work well'];
    }

    return ['Current oversight mode seems well-suited for your project'];
  }
}

export default OversightSystem;