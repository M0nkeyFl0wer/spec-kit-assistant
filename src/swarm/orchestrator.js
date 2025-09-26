import chalk from 'chalk';
import { EventEmitter } from 'events';
import WebSocket from 'ws';
import fs from 'fs-extra';
import path from 'path';
import { SpecCharacter } from '../character/spec.js';
import { SecureWebSocketServer } from '../utils/secure-websocket.js';
import { secureWriteFile, secureEnsureDir } from '../utils/secure-path.js';

export class SwarmOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.spec = new SpecCharacter();
    this.agents = new Map();
    this.tasks = new Map();
    this.connections = new Map();
    this.swarmConfig = {
      maxAgents: 10,
      autoScale: true,
      healthCheckInterval: 30000,
      taskTimeout: 300000, // 5 minutes
      retryAttempts: 3
    };

    // Agent types and their specializations
    this.agentTypes = {
      'quality-assurance': {
        name: 'Quality Assurance Agent',
        emoji: '🔍',
        skills: ['testing', 'code-review', 'quality-metrics', 'bug-detection'],
        description: 'Monitors code quality and runs automated tests',
        resourceRequirements: { cpu: 1, memory: '512MB' }
      },
      'security-scanner': {
        name: 'Security Scanner Agent',
        emoji: '🛡️',
        skills: ['vulnerability-scanning', 'dependency-check', 'security-audit'],
        description: 'Identifies security issues and vulnerabilities',
        resourceRequirements: { cpu: 1, memory: '256MB' }
      },
      'performance-monitor': {
        name: 'Performance Monitor Agent',
        emoji: '📊',
        skills: ['performance-testing', 'profiling', 'optimization'],
        description: 'Tracks performance metrics and suggests optimizations',
        resourceRequirements: { cpu: 2, memory: '1GB' }
      },
      'code-repair': {
        name: 'Code Repair Agent',
        emoji: '🔧',
        skills: ['bug-fixing', 'refactoring', 'code-improvement'],
        description: 'Automatically fixes common issues and improves code',
        resourceRequirements: { cpu: 1, memory: '512MB' }
      },
      'documentation': {
        name: 'Documentation Agent',
        emoji: '📚',
        skills: ['documentation-generation', 'readme-updates', 'api-docs'],
        description: 'Maintains and generates project documentation',
        resourceRequirements: { cpu: 1, memory: '256MB' }
      },
      'deployment': {
        name: 'Deployment Agent',
        emoji: '🚀',
        skills: ['build-automation', 'deployment', 'environment-management'],
        description: 'Handles build processes and deployments',
        resourceRequirements: { cpu: 2, memory: '1GB' }
      }
    };

    this.swarmMetrics = {
      tasksCompleted: 0,
      tasksInProgress: 0,
      tasksFailed: 0,
      averageCompletionTime: 0,
      agentUtilization: 0,
      costSavings: 0
    };
  }

  async handleCommand(options) {
    if (options.deploy) {
      await this.deploySwarm(parseInt(options.scale) || 3);
    } else if (options.monitor) {
      await this.monitorSwarm();
    } else {
      await this.showSwarmStatus();
    }
  }

  async deploySwarm(scale = 3) {
    await this.spec.show('working', `Deploying agent swarm with ${scale} agents...`);

    try {
      // Initialize swarm infrastructure
      await this.initializeSwarmInfrastructure();

      // Deploy core agents
      const coreAgents = ['quality-assurance', 'security-scanner', 'performance-monitor'];
      const selectedAgents = coreAgents.slice(0, scale);

      // Deploy additional specialized agents based on scale
      if (scale > 3) {
        selectedAgents.push('code-repair');
      }
      if (scale > 4) {
        selectedAgents.push('documentation', 'deployment');
      }

      for (const agentType of selectedAgents) {
        await this.deployAgent(agentType);
        await this.spec.showProgress(selectedAgents.indexOf(agentType) + 1, selectedAgents.length, 'Deploying agents');
      }

      await this.spec.celebrate('Agent swarm deployed successfully');

      // Show deployment summary
      await this.showDeploymentSummary(selectedAgents);

      // Start health monitoring
      this.startHealthMonitoring();

    } catch (error) {
      await this.spec.show('concerned', `Swarm deployment failed: ${error.message}`);
      console.error(chalk.red('Deployment error:'), error);
    }
  }

  async initializeSwarmInfrastructure() {
    await this.spec.show('working', 'Setting up swarm infrastructure...');

    // Create communication channels
    this.setupCommunicationChannels();

    // Initialize shared resources
    await this.initializeSharedResources();

    // Setup monitoring dashboard
    await this.setupMonitoringDashboard();

    await this.spec.show('happy', 'Swarm infrastructure ready!');
  }

  async setupCommunicationChannels() {
    try {
      // Initialize secure WebSocket server
      this.wsServer = new SecureWebSocketServer({
        port: 8080 + Math.floor(Math.random() * 1000),
        authRequired: true,
        maxConnections: this.swarmConfig.maxAgents,
        messageRateLimit: 10, // 10 messages per second per agent
        maxMessageSize: 64 * 1024, // 64KB max message size
        heartbeatInterval: 30000 // 30 second heartbeat
      });

      // Set up secure event handlers
      this.wsServer.on('agent-authenticated', (connectionId, agentId, agentType) => {
        this.connections.set(agentId, connectionId);
        console.log(chalk.green(`🔒 Agent ${agentId} authenticated securely`));
      });

      this.wsServer.on('message', (connectionId, message, connectionInfo) => {
        if (connectionInfo.authenticated && connectionInfo.agentId) {
          this.handleAgentMessage(connectionInfo.agentId, message);
        }
      });

      this.wsServer.on('disconnection', (connectionId, connectionInfo) => {
        if (connectionInfo.agentId) {
          this.connections.delete(connectionInfo.agentId);
          this.handleAgentDisconnection(connectionInfo.agentId);
        }
      });

      this.wsServer.on('error', (error) => {
        console.error(chalk.red('Secure WebSocket server error:'), error);
      });

      // Start the secure server
      await this.wsServer.start();

      console.log(chalk.blue(`🔒 Secure agent communication server running on port ${this.wsServer.options.port}`));

    } catch (error) {
      console.error(chalk.red('Failed to setup secure communication channels:'), error);
      throw error;
    }
  }

  async initializeSharedResources() {
    try {
      // Create secure shared workspace
      await secureEnsureDir('swarm-workspace', 'workspace');

      // Create shared task queue with secure file operations
      await secureWriteFile('task-queue.json', JSON.stringify({
        tasks: [],
        completedTasks: []
      }, null, 2), 'workspace', {
        allowedExtensions: ['.json']
      });

      // Create shared knowledge base
      await secureWriteFile('knowledge-base.json', JSON.stringify({
        projectContext: {},
        learnings: [],
        bestPractices: []
      }, null, 2), 'workspace', {
        allowedExtensions: ['.json']
      });

      console.log(chalk.green('✅ Secure swarm workspace initialized'));

    } catch (error) {
      console.error(chalk.red('Failed to initialize shared resources:'), error);
      throw error;
    }
  }

  async setupMonitoringDashboard() {
    // This would set up a web dashboard for monitoring
    const dashboardPort = 3001;
    console.log(chalk.cyan(`📊 Monitoring dashboard will be available at http://localhost:${dashboardPort}`));

    // In a real implementation, this would start an Express server
    // serving a real-time dashboard with agent status, task progress, etc.
  }

  async deployAgent(agentType) {
    const agentConfig = this.agentTypes[agentType];

    if (!agentConfig) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    const agentId = `${agentType}-${Date.now()}`;

    await this.spec.show('working', `Deploying ${agentConfig.name}...`);

    // Simulate agent deployment
    const agent = {
      id: agentId,
      type: agentType,
      config: agentConfig,
      status: 'initializing',
      deployedAt: new Date(),
      tasksAssigned: 0,
      tasksCompleted: 0,
      lastHeartbeat: new Date(),
      resources: {
        allocated: agentConfig.resourceRequirements,
        used: { cpu: 0, memory: '0MB' }
      }
    };

    this.agents.set(agentId, agent);

    // Simulate initialization process
    await this.simulateAgentInitialization(agent);

    agent.status = 'ready';
    agent.initializedAt = new Date();

    console.log(chalk.green(`${agentConfig.emoji} ${agentConfig.name} (${agentId}) deployed and ready`));

    return agent;
  }

  async simulateAgentInitialization(agent) {
    const steps = [
      'Loading agent configuration',
      'Establishing communication channels',
      'Initializing skill modules',
      'Connecting to shared resources',
      'Running self-diagnostics'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      // In real implementation, would show actual initialization progress
    }
  }

  async showDeploymentSummary(deployedAgents) {
    console.log(chalk.yellow('\\n🚀 Swarm Deployment Summary'));
    console.log(chalk.cyan(`Agents Deployed: ${deployedAgents.length}`));

    deployedAgents.forEach(agentType => {
      const config = this.agentTypes[agentType];
      console.log(chalk.gray(`  ${config.emoji} ${config.name}`));
      console.log(chalk.gray(`     Skills: ${config.skills.join(', ')}`));
    });

    console.log(chalk.blue(`\\nCommunication: WebSocket on port ${this.wsServer.options.port}`));
    console.log(chalk.blue(`Workspace: ${this.workspacePath}`));
    console.log(chalk.blue(`Monitoring: Real-time dashboard available`));

    // Show next steps
    console.log(chalk.yellow('\\n📋 Next Steps:'));
    console.log(chalk.gray('  • Agents will automatically monitor your project'));
    console.log(chalk.gray('  • Use `monitor` command to see real-time status'));
    console.log(chalk.gray('  • Agents will report issues and improvements'));
    console.log(chalk.gray('  • Configure oversight mode for approval workflows'));
  }

  async monitorSwarm() {
    await this.spec.show('thinking', 'Opening swarm monitoring dashboard...');

    if (this.agents.size === 0) {
      await this.spec.show('concerned', 'No agents deployed yet. Deploy a swarm first!');
      return;
    }

    // Real-time monitoring loop
    console.log(chalk.blue('🔍 Real-time Agent Swarm Monitor'));
    console.log(chalk.gray('Press Ctrl+C to exit\\n'));

    const monitoringInterval = setInterval(async () => {
      await this.displaySwarmStatus();
    }, 5000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(monitoringInterval);
      console.log(chalk.yellow('\\n👋 Monitoring stopped'));
      process.exit(0);
    });

    // Initial display
    await this.displaySwarmStatus();
  }

  async displaySwarmStatus() {
    // Clear screen and move cursor to top
    console.clear();

    console.log(chalk.blue.bold('🤖 Agent Swarm Status Dashboard'));
    console.log(chalk.gray(`Last updated: ${new Date().toLocaleTimeString()}\\n`));

    // Overall metrics
    console.log(chalk.yellow('📊 Overall Metrics'));
    console.log(chalk.cyan(`Active Agents: ${this.agents.size}`));
    console.log(chalk.cyan(`Tasks Completed: ${this.swarmMetrics.tasksCompleted}`));
    console.log(chalk.cyan(`Tasks In Progress: ${this.swarmMetrics.tasksInProgress}`));
    console.log(chalk.cyan(`Tasks Failed: ${this.swarmMetrics.tasksFailed}`));

    // Agent status
    console.log(chalk.yellow('\\n🤖 Agent Status'));

    for (const [agentId, agent] of this.agents) {
      const config = this.agentTypes[agent.type];
      const statusColor = this.getStatusColor(agent.status);
      const uptime = this.calculateUptime(agent.deployedAt);

      console.log(statusColor(`${config.emoji} ${config.name}`));
      console.log(chalk.gray(`   Status: ${agent.status} | Uptime: ${uptime}`));
      console.log(chalk.gray(`   Tasks: ${agent.tasksCompleted} completed, ${agent.tasksAssigned - agent.tasksCompleted} pending`));

      // Show recent activity
      if (agent.lastActivity) {
        const timeSinceActivity = Date.now() - agent.lastActivity.getTime();
        if (timeSinceActivity < 60000) { // Within last minute
          console.log(chalk.green(`   🔄 ${agent.lastActivityDescription}`));
        }
      }
    }

    // Active tasks
    console.log(chalk.yellow('\\n📋 Active Tasks'));
    if (this.tasks.size === 0) {
      console.log(chalk.gray('   No active tasks'));
    } else {
      for (const [taskId, task] of this.tasks) {
        const progress = Math.round((task.completedSteps / task.totalSteps) * 100);
        const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));

        console.log(chalk.cyan(`   ${task.type}: ${task.description}`));
        console.log(chalk.gray(`   [${progressBar}] ${progress}% | Agent: ${task.assignedAgent}`));
      }
    }

    // Recent alerts
    if (this.recentAlerts && this.recentAlerts.length > 0) {
      console.log(chalk.yellow('\\n⚠️ Recent Alerts'));
      this.recentAlerts.slice(0, 3).forEach(alert => {
        const alertColor = alert.severity === 'critical' ? chalk.red : alert.severity === 'warning' ? chalk.yellow : chalk.blue;
        console.log(alertColor(`   ${alert.type}: ${alert.message}`));
      });
    }

    // Cost tracking
    console.log(chalk.yellow('\\n💰 Resource Usage'));
    const totalCpu = Array.from(this.agents.values()).reduce((sum, agent) => sum + (agent.resources.used.cpu || 0), 0);
    console.log(chalk.cyan(`   CPU Usage: ${totalCpu.toFixed(2)} cores`));
    console.log(chalk.cyan(`   Estimated Cost: $${this.calculateEstimatedCost().toFixed(4)}/hour`));
    console.log(chalk.green(`   Savings vs Manual: $${this.swarmMetrics.costSavings.toFixed(2)}`));
  }

  getStatusColor(status) {
    const colors = {
      'ready': chalk.green,
      'working': chalk.blue,
      'error': chalk.red,
      'initializing': chalk.yellow,
      'idle': chalk.gray
    };
    return colors[status] || chalk.white;
  }

  calculateUptime(deployedAt) {
    const uptimeMs = Date.now() - deployedAt.getTime();
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  calculateEstimatedCost() {
    // Simplified cost calculation
    const baseCostPerAgent = 0.001; // $0.001 per hour per agent
    return this.agents.size * baseCostPerAgent;
  }

  startHealthMonitoring() {
    setInterval(() => {
      this.performHealthChecks();
    }, this.swarmConfig.healthCheckInterval);
  }

  async performHealthChecks() {
    for (const [agentId, agent] of this.agents) {
      // Check if agent is responsive
      const timeSinceHeartbeat = Date.now() - agent.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > this.swarmConfig.healthCheckInterval * 2) {
        await this.handleUnresponsiveAgent(agentId);
      }

      // Check resource usage
      if (agent.resources.used.cpu > 0.9) {
        await this.handleHighResourceUsage(agentId);
      }
    }
  }

  async handleUnresponsiveAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    console.log(chalk.red(`⚠️ Agent ${agentId} is unresponsive`));

    // Attempt to restart agent
    agent.status = 'restarting';

    try {
      await this.restartAgent(agentId);
      console.log(chalk.green(`✅ Agent ${agentId} restarted successfully`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to restart agent ${agentId}: ${error.message}`));
      agent.status = 'error';
    }
  }

  async handleHighResourceUsage(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    console.log(chalk.yellow(`⚠️ High resource usage detected for agent ${agentId}`));

    // Implement resource optimization or scaling
    if (this.swarmConfig.autoScale && this.agents.size < this.swarmConfig.maxAgents) {
      await this.scaleOutSwarm();
    }
  }

  async scaleOutSwarm() {
    console.log(chalk.blue('🔄 Auto-scaling swarm due to high load...'));

    // Deploy additional performance monitor or code repair agent
    const scaleOptions = ['performance-monitor', 'code-repair'];
    const agentType = scaleOptions[Math.floor(Math.random() * scaleOptions.length)];

    await this.deployAgent(agentType);
    console.log(chalk.green(`✅ Deployed additional ${agentType} agent`));
  }

  async restartAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Simulate restart process
    await new Promise(resolve => setTimeout(resolve, 2000));

    agent.status = 'ready';
    agent.lastHeartbeat = new Date();
    agent.restartCount = (agent.restartCount || 0) + 1;
  }

  async assignTask(task, preferredAgentType = null) {
    // Find suitable agent
    const suitableAgent = this.findSuitableAgent(task, preferredAgentType);

    if (!suitableAgent) {
      // No suitable agent available, queue task or deploy new agent
      return await this.queueOrScaleForTask(task);
    }

    // Assign task to agent
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const taskObject = {
      id: taskId,
      ...task,
      assignedAgent: suitableAgent.id,
      assignedAt: new Date(),
      status: 'assigned',
      completedSteps: 0,
      totalSteps: task.steps?.length || 1
    };

    this.tasks.set(taskId, taskObject);
    suitableAgent.tasksAssigned++;

    // Send task to agent
    await this.sendTaskToAgent(suitableAgent.id, taskObject);

    return taskId;
  }

  findSuitableAgent(task, preferredAgentType) {
    const availableAgents = Array.from(this.agents.values()).filter(agent =>
      agent.status === 'ready' || agent.status === 'idle'
    );

    if (preferredAgentType) {
      const preferredAgent = availableAgents.find(agent => agent.type === preferredAgentType);
      if (preferredAgent) return preferredAgent;
    }

    // Find agent with matching skills
    const suitableAgent = availableAgents.find(agent => {
      const agentSkills = this.agentTypes[agent.type].skills;
      return task.requiredSkills?.some(skill => agentSkills.includes(skill));
    });

    // Fallback to any available agent
    return suitableAgent || availableAgents[0];
  }

  async queueOrScaleForTask(task) {
    console.log(chalk.yellow('⏳ No suitable agent available, queuing task...'));

    // Add to task queue
    const taskQueuePath = path.join(this.workspacePath, 'task-queue.json');
    const queue = await fs.readJson(taskQueuePath);
    queue.tasks.push({ ...task, queuedAt: new Date() });
    await fs.writeJson(taskQueuePath, queue);

    // Consider scaling if auto-scale is enabled
    if (this.swarmConfig.autoScale && this.agents.size < this.swarmConfig.maxAgents) {
      const neededAgentType = this.determineNeededAgentType(task);
      if (neededAgentType) {
        await this.deployAgent(neededAgentType);

        // Try assigning the task again
        return await this.assignTask(task);
      }
    }

    return null;
  }

  determineNeededAgentType(task) {
    if (task.requiredSkills) {
      for (const [agentType, config] of Object.entries(this.agentTypes)) {
        if (task.requiredSkills.some(skill => config.skills.includes(skill))) {
          return agentType;
        }
      }
    }

    // Default to quality assurance for general tasks
    return 'quality-assurance';
  }

  async sendTaskToAgent(agentId, task) {
    const connection = this.connections.get(agentId);

    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify({
        type: 'task-assignment',
        task: task
      }));
    } else {
      console.log(chalk.yellow(`⚠️ Agent ${agentId} not connected, queuing task locally`));
      // Handle offline agent scenario
    }
  }

  handleAgentMessage(agentId, message) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    switch (message.type) {
      case 'heartbeat':
        agent.lastHeartbeat = new Date();
        agent.resources.used = message.resourceUsage || agent.resources.used;
        break;

      case 'task-progress':
        this.handleTaskProgress(message.taskId, message.progress);
        break;

      case 'task-completed':
        this.handleTaskCompletion(message.taskId, message.result);
        break;

      case 'task-failed':
        this.handleTaskFailure(message.taskId, message.error);
        break;

      case 'agent-alert':
        this.handleAgentAlert(agentId, message.alert);
        break;
    }
  }

  handleTaskProgress(taskId, progress) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.completedSteps = progress.completedSteps || 0;
      task.status = 'in-progress';
      task.lastUpdate = new Date();

      this.swarmMetrics.tasksInProgress = Array.from(this.tasks.values())
        .filter(t => t.status === 'in-progress').length;
    }
  }

  handleTaskCompletion(taskId, result) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.completedAt = new Date();
    task.result = result;

    const agent = this.agents.get(task.assignedAgent);
    if (agent) {
      agent.tasksCompleted++;
      agent.status = 'ready';
      agent.lastActivity = new Date();
      agent.lastActivityDescription = `Completed ${task.type}`;
    }

    this.swarmMetrics.tasksCompleted++;
    this.swarmMetrics.tasksInProgress--;

    // Calculate cost savings
    const manualTimeHours = task.estimatedManualTime || 1;
    const agentTimeHours = (task.completedAt - task.assignedAt) / (1000 * 60 * 60);
    const hourlySavings = manualTimeHours - agentTimeHours;
    this.swarmMetrics.costSavings += Math.max(0, hourlySavings * 50); // $50/hour saved

    console.log(chalk.green(`✅ Task ${taskId} completed by ${agent.type}`));

    // Move to completed tasks
    this.tasks.delete(taskId);
  }

  handleTaskFailure(taskId, error) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'failed';
    task.error = error;
    task.failedAt = new Date();

    const agent = this.agents.get(task.assignedAgent);
    if (agent) {
      agent.status = 'ready';
    }

    this.swarmMetrics.tasksFailed++;
    this.swarmMetrics.tasksInProgress--;

    console.log(chalk.red(`❌ Task ${taskId} failed: ${error.message}`));

    // Attempt retry if within retry limits
    if (task.retryAttempts < this.swarmConfig.retryAttempts) {
      task.retryAttempts = (task.retryAttempts || 0) + 1;
      setTimeout(() => {
        this.assignTask(task);
      }, 5000 * task.retryAttempts); // Exponential backoff
    }
  }

  handleAgentAlert(agentId, alert) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    this.recentAlerts = this.recentAlerts || [];
    this.recentAlerts.unshift({
      agentId,
      agentType: agent.type,
      ...alert,
      timestamp: new Date()
    });

    // Keep only recent alerts
    this.recentAlerts = this.recentAlerts.slice(0, 10);

    const alertColor = alert.severity === 'critical' ? chalk.red :
                      alert.severity === 'warning' ? chalk.yellow : chalk.blue;

    console.log(alertColor(`🚨 ${agent.type}: ${alert.message}`));
  }

  handleAgentDisconnection(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    console.log(chalk.yellow(`⚠️ Agent ${agentId} disconnected`));
    agent.status = 'disconnected';
    agent.disconnectedAt = new Date();

    // Reassign any tasks assigned to this agent
    const assignedTasks = Array.from(this.tasks.values()).filter(task =>
      task.assignedAgent === agentId && task.status !== 'completed'
    );

    assignedTasks.forEach(task => {
      console.log(chalk.blue(`🔄 Reassigning task ${task.id}`));
      this.assignTask(task);
    });
  }

  async showSwarmStatus() {
    if (this.agents.size === 0) {
      await this.spec.show('thinking', 'No agent swarm deployed yet.');

      const deployNow = await this.spec.askQuestion(
        'Would you like to deploy an agent swarm?',
        { type: 'confirm', default: true }
      );

      if (deployNow) {
        await this.deploySwarm();
      }
      return;
    }

    await this.spec.show('happy', 'Here\\'s your current swarm status!');

    console.log(chalk.yellow('\\n🤖 Agent Swarm Overview'));
    console.log(chalk.cyan(`Total Agents: ${this.agents.size}`));
    console.log(chalk.cyan(`Active Tasks: ${this.tasks.size}`));
    console.log(chalk.cyan(`Tasks Completed: ${this.swarmMetrics.tasksCompleted}`));

    // Show individual agents
    console.log(chalk.yellow('\\n👥 Deployed Agents'));
    for (const [agentId, agent] of this.agents) {
      const config = this.agentTypes[agent.type];
      const statusColor = this.getStatusColor(agent.status);

      console.log(statusColor(`  ${config.emoji} ${config.name} (${agent.status})`));
      console.log(chalk.gray(`     Completed: ${agent.tasksCompleted} tasks`));
    }

    // Offer monitoring
    const startMonitoring = await this.spec.askQuestion(
      'Would you like to start real-time monitoring?',
      { type: 'confirm', default: false }
    );

    if (startMonitoring) {
      await this.monitorSwarm();
    }
  }

  async configureOversight(options) {
    // Integration with oversight system
    await this.spec.show('working', 'Configuring agent swarm oversight...');

    const oversightMode = options.mode || await this.spec.askQuestion(
      'How much oversight do you want over the agent swarm?',
      {
        type: 'list',
        choices: [
          { name: '🔄 Trust agents - Minimal oversight', value: 'minimal' },
          { name: '🎯 Strategic oversight - Key decisions only', value: 'strategic' },
          { name: '🎮 Full oversight - Approve all actions', value: 'full' }
        ]
      }
    );

    this.oversightMode = oversightMode;

    const oversightConfig = {
      minimal: {
        approvalRequired: ['critical-security', 'data-destruction'],
        autoApprove: ['testing', 'documentation', 'code-style']
      },
      strategic: {
        approvalRequired: ['architecture-changes', 'security-configs', 'deployments'],
        autoApprove: ['testing', 'documentation', 'minor-fixes']
      },
      full: {
        approvalRequired: ['*'], // All tasks
        autoApprove: []
      }
    };

    this.oversightConfig = oversightConfig[oversightMode];

    await this.spec.celebrate('Oversight configured for agent swarm');
  }

  // Integration methods
  async integrateWithCloud(cloudManager) {
    this.cloudManager = cloudManager;
    console.log(chalk.green('☁️ Agent swarm connected to cloud resources'));
  }

  async integrateWithOversight(oversightSystem) {
    this.oversightSystem = oversightSystem;
    console.log(chalk.green('🛡️ Agent swarm connected to oversight system'));

    // Setup oversight callbacks
    this.on('taskAssignment', (task) => {
      if (this.requiresOversight(task)) {
        oversightSystem.assessTask(task);
      }
    });
  }

  requiresOversight(task) {
    if (!this.oversightConfig) return false;

    return this.oversightConfig.approvalRequired.includes('*') ||
           this.oversightConfig.approvalRequired.some(type =>
             task.type?.includes(type) || task.description?.toLowerCase().includes(type)
           );
  }

  // Utility methods
  getSwarmMetrics() {
    return this.swarmMetrics;
  }

  getAgentStatus(agentId) {
    return this.agents.get(agentId);
  }

  getTaskStatus(taskId) {
    return this.tasks.get(taskId);
  }

  async shutdownSwarm() {
    await this.spec.show('working', 'Shutting down agent swarm...');

    // Gracefully shutdown all agents
    for (const [agentId, agent] of this.agents) {
      const connection = this.connections.get(agentId);
      if (connection) {
        connection.send(JSON.stringify({ type: 'shutdown' }));
      }
    }

    // Close WebSocket server
    if (this.wsServer) {
      this.wsServer.close();
    }

    // Clear all data
    this.agents.clear();
    this.tasks.clear();
    this.connections.clear();

    await this.spec.show('happy', 'Agent swarm shutdown complete');
  }
}

export default SwarmOrchestrator;