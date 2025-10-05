import chalk from 'chalk';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { DogArt } from '../character/dog-art.js';

/**
 * 🤖 Intelligent Agent Swarm Orchestrator
 * Manages local Llama, remote agents, resource monitoring, and smart deployment
 */
export class IntelligentSwarmOrchestrator {
  constructor() {
    this.sessionId = Date.now();
    this.sessionPath = path.join(os.homedir(), '.spec-sessions');
    this.logPath = path.join(this.sessionPath, 'agent-logs');
    this.yoloMode = false;
    this.resourceThresholds = {
      memory: 0.8, // 80% memory usage warning
      cpu: 0.9, // 90% CPU usage warning
      disk: 0.9, // 90% disk usage warning
    };

    this.agents = {
      local: new Map(),
      remote: new Map(),
      hybrid: new Map(),
    };

    this.capabilities = {
      llama: false,
      ollama: false,
      gpu: false,
      highMemory: false,
      fastNetwork: false,
    };

    this.webhooks = {
      discord: process.env.DISCORD_WEBHOOK_URL,
      slack: process.env.SLACK_WEBHOOK_URL,
      email: process.env.EMAIL_WEBHOOK_URL,
    };

    this.init();
  }

  async init() {
    await this.ensureDirectories();
    await this.detectCapabilities();
    await this.loadSession();
    await this.startResourceMonitoring();
  }

  async ensureDirectories() {
    await fs.ensureDir(this.sessionPath);
    await fs.ensureDir(this.logPath);
    await fs.ensureDir(path.join(this.sessionPath, 'prototypes'));
    await fs.ensureDir(path.join(this.sessionPath, 'backups'));
  }

  async detectCapabilities() {
    console.log(chalk.cyan(DogArt.detective));
    console.log(chalk.blue('🐕 Spec: "Detecting your system capabilities... *investigative sniffing*"'));
    console.log('');

    const capabilities = {};

    // Check system resources
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const cpus = os.cpus();

    capabilities.memory = {
      total: Math.round(totalMem / 1024 / 1024 / 1024),
      free: Math.round(freeMem / 1024 / 1024 / 1024),
      usage: (totalMem - freeMem) / totalMem,
    };

    capabilities.cpu = {
      count: cpus.length,
      model: cpus[0]?.model || 'Unknown',
      speed: cpus[0]?.speed || 0,
    };

    // Check for local AI capabilities
    try {
      execSync('ollama --version', { stdio: 'pipe' });
      capabilities.ollama = true;
      console.log(chalk.green('✅ Ollama detected - Local AI available!'));
    } catch {
      capabilities.ollama = false;
      console.log(chalk.yellow('⚠️  Ollama not found - will use remote agents'));
    }

    // Check for GPU
    try {
      const nvidia = execSync('nvidia-smi --query-gpu=name --format=csv,noheader', { stdio: 'pipe' }).toString();
      if (nvidia.trim()) {
        capabilities.gpu = {
          available: true,
          model: nvidia.trim(),
        };
        console.log(chalk.green(`✅ GPU detected: ${nvidia.trim()}`));
      }
    } catch {
      try {
        // Check for Apple Silicon
        const system = execSync('system_profiler SPDisplaysDataType', { stdio: 'pipe' }).toString();
        if (system.includes('Apple')) {
          capabilities.gpu = {
            available: true,
            model: 'Apple Silicon GPU',
          };
          console.log(chalk.green('✅ Apple Silicon GPU detected'));
        }
      } catch {
        capabilities.gpu = { available: false };
        console.log(chalk.yellow('⚠️  No GPU detected - CPU processing only'));
      }
    }

    // Determine capability levels
    this.capabilities.highMemory = capabilities.memory.total >= 16;
    this.capabilities.gpu = capabilities.gpu.available;
    this.capabilities.ollama = capabilities.ollama;
    this.capabilities.multiCore = capabilities.cpu.count >= 4;

    // Save capabilities
    await fs.writeFile(
      path.join(this.sessionPath, 'capabilities.json'),
      JSON.stringify(capabilities, null, 2),
    );

    console.log(chalk.yellow('📊 System Analysis:'));
    console.log(chalk.cyan(`   💾 Memory: ${capabilities.memory.total}GB (${Math.round(capabilities.memory.usage * 100)}% used)`));
    console.log(chalk.cyan(`   🖥️  CPU: ${capabilities.cpu.count} cores - ${capabilities.cpu.model}`));
    console.log(chalk.cyan(`   🚀 GPU: ${capabilities.gpu.available ? capabilities.gpu.model : 'None'}`));
    console.log(chalk.cyan(`   🤖 Local AI: ${capabilities.ollama ? 'Available' : 'Not available'}`));
    console.log('');

    return capabilities;
  }

  async loadSession() {
    const sessionFile = path.join(this.sessionPath, 'current-session.json');

    if (await fs.pathExists(sessionFile)) {
      try {
        const session = await fs.readJson(sessionFile);
        console.log(chalk.green('✅ Resumed previous session'));
        console.log(chalk.cyan(`   📅 Started: ${new Date(session.startTime).toLocaleString()}`));
        console.log(chalk.cyan(`   🎯 Project: ${session.currentProject || 'No active project'}`));
        console.log(chalk.cyan(`   🤖 Agents: ${session.activeAgents || 0} running`));
        console.log('');

        return session;
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not load previous session, starting fresh'));
      }
    }

    const newSession = {
      id: this.sessionId,
      startTime: new Date(),
      currentProject: null,
      activeAgents: 0,
      completedTasks: [],
      pivotDecisions: [],
    };

    await this.saveSession(newSession);
    return newSession;
  }

  async saveSession(session = null) {
    if (!session) {
      session = {
        id: this.sessionId,
        timestamp: new Date(),
        capabilities: this.capabilities,
        activeAgents: this.agents.local.size + this.agents.remote.size,
        resourceUsage: await this.getResourceUsage(),
      };
    }

    await fs.writeFile(
      path.join(this.sessionPath, 'current-session.json'),
      JSON.stringify(session, null, 2),
    );

    // Also save timestamped backup
    const backupFile = path.join(
      this.sessionPath,
      'backups',
      `session-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`,
    );
    await fs.writeFile(backupFile, JSON.stringify(session, null, 2));
  }

  async startResourceMonitoring() {
    console.log(chalk.blue('🔍 Starting intelligent resource monitoring...'));

    // Monitor every 30 seconds
    setInterval(async () => {
      const usage = await this.getResourceUsage();
      await this.checkResourceThresholds(usage);
    }, 30000);

    console.log(chalk.green('✅ Resource monitoring active'));
  }

  async getResourceUsage() {
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const loadAvg = os.loadavg();

    // Get disk usage
    let diskUsage = 0;
    try {
      const df = execSync('df -h . | tail -1', { stdio: 'pipe' }).toString();
      const usage = df.split(/\\s+/)[4];
      diskUsage = parseInt(usage.replace('%', '')) / 100;
    } catch {
      diskUsage = 0;
    }

    return {
      memory: {
        used: (totalMem - freeMem) / totalMem,
        freeGB: Math.round(freeMem / 1024 / 1024 / 1024),
      },
      cpu: {
        load1: loadAvg[0],
        load5: loadAvg[1],
        load15: loadAvg[2],
      },
      disk: {
        usage: diskUsage,
      },
      timestamp: new Date(),
    };
  }

  async checkResourceThresholds(usage) {
    const warnings = [];

    if (usage.memory.used > this.resourceThresholds.memory) {
      warnings.push(`High memory usage: ${Math.round(usage.memory.used * 100)}%`);
    }

    if (usage.cpu.load1 > this.resourceThresholds.cpu * os.cpus().length) {
      warnings.push(`High CPU load: ${usage.cpu.load1.toFixed(2)}`);
    }

    if (usage.disk.usage > this.resourceThresholds.disk) {
      warnings.push(`Low disk space: ${Math.round(usage.disk.usage * 100)}% used`);
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow('⚠️  Resource Warning:'));
      warnings.forEach((warning) => {
        console.log(chalk.red(`   🚨 ${warning}`));
      });

      await this.optimizeResources();
      await this.notifyResourceWarning(warnings);
    }
  }

  async optimizeResources() {
    console.log(chalk.cyan(DogArt.scientist));
    console.log(chalk.blue('🐕 Spec: "Optimizing resources for peak performance! *intelligent tail wagging*"'));
    console.log('');

    // Stop idle agents
    const idleAgents = [];
    for (const [id, agent] of this.agents.local) {
      if (agent.lastActivity < Date.now() - 300000) { // 5 minutes idle
        idleAgents.push(id);
      }
    }

    for (const id of idleAgents) {
      await this.stopAgent(id, 'local');
      console.log(chalk.yellow(`🔄 Stopped idle agent: ${id}`));
    }

    // Switch to remote agents if local resources are strained
    const usage = await this.getResourceUsage();
    if (usage.memory.used > 0.85) {
      console.log(chalk.yellow('💡 High memory usage - switching new agents to remote mode'));
      this.preferRemote = true;
    } else {
      this.preferRemote = false;
    }
  }

  async deployAgentSwarm(type = 'auto', count = 'auto') {
    console.log(chalk.cyan(DogArt.builder));
    console.log(chalk.green('🐕 Spec: "Deploying agent swarm! *excited engineering woofs*"'));
    console.log('');

    const usage = await this.getResourceUsage();
    const canRunLocal = this.capabilities.ollama && usage.memory.freeGB > 4;

    // Determine optimal deployment strategy
    const strategy = this.determineDeploymentStrategy(type, count, usage);

    console.log(chalk.yellow('🎯 Deployment Strategy:'));
    console.log(chalk.cyan(`   📍 Location: ${strategy.location}`));
    console.log(chalk.cyan(`   🤖 Agents: ${strategy.count}`));
    console.log(chalk.cyan(`   🔧 Type: ${strategy.agentTypes.join(', ')}`));
    console.log('');

    const deployedAgents = [];

    for (let i = 0; i < strategy.count; i++) {
      const agentType = strategy.agentTypes[i % strategy.agentTypes.length];
      const agentId = `${agentType}-${Date.now()}-${i}`;

      if (strategy.location === 'local' || strategy.location === 'hybrid') {
        const localAgent = await this.deployLocalAgent(agentId, agentType);
        if (localAgent) {
          deployedAgents.push({ id: agentId, type: agentType, location: 'local' });
        }
      }

      if (strategy.location === 'remote' || strategy.location === 'hybrid') {
        const remoteAgent = await this.deployRemoteAgent(agentId, agentType);
        if (remoteAgent) {
          deployedAgents.push({ id: agentId, type: agentType, location: 'remote' });
        }
      }

      // Add delay to prevent overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(chalk.green(`🎉 Successfully deployed ${deployedAgents.length} agents!`));
    deployedAgents.forEach((agent) => {
      console.log(chalk.cyan(`   ✅ ${agent.type} (${agent.location}): ${agent.id}`));
    });

    await this.saveSession();
    return deployedAgents;
  }

  determineDeploymentStrategy(type, count, usage) {
    const strategy = {
      location: 'remote',
      count: 2,
      agentTypes: ['research', 'builder'],
    };

    // Determine location based on capabilities and resources
    if (this.capabilities.ollama && usage.memory.freeGB > 8) {
      strategy.location = 'local';
    } else if (this.capabilities.ollama && usage.memory.freeGB > 4) {
      strategy.location = 'hybrid';
    }

    // Determine count based on resources
    if (type === 'auto') {
      if (usage.memory.freeGB > 16) {
        strategy.count = 6;
      } else if (usage.memory.freeGB > 8) {
        strategy.count = 4;
      } else {
        strategy.count = 2;
      }
    } else {
      strategy.count = parseInt(count) || 2;
    }

    // Determine agent types based on project needs
    strategy.agentTypes = this.selectAgentTypes(type);

    return strategy;
  }

  selectAgentTypes(type) {
    const agentTypes = {
      research: ['research', 'analyst', 'scout', 'investigator'],
      builder: ['builder', 'architect', 'engineer', 'tester'],
      security: ['security', 'auditor', 'scanner', 'defender'],
      creative: ['designer', 'artist', 'writer', 'innovator'],
      auto: ['research', 'builder', 'designer', 'tester'],
    };

    return agentTypes[type] || agentTypes.auto;
  }

  async deployLocalAgent(agentId, agentType) {
    console.log(chalk.blue(`🤖 Deploying local ${agentType} agent: ${agentId}`));

    try {
      // Check if Ollama is running
      const models = await this.getOllamaModels();
      if (models.length === 0) {
        console.log(chalk.yellow('⚠️  No Ollama models found, pulling code model...'));
        await this.pullOllamaModel('codellama:7b');
      }

      const agent = {
        id: agentId,
        type: agentType,
        location: 'local',
        model: 'codellama:7b',
        status: 'running',
        lastActivity: Date.now(),
        startTime: new Date(),
        capabilities: this.getAgentCapabilities(agentType),
        resourceUsage: {
          memory: 0,
          cpu: 0,
        },
      };

      this.agents.local.set(agentId, agent);

      // Start the actual agent process
      await this.startAgentProcess(agent);

      console.log(chalk.green(`✅ Local ${agentType} agent deployed: ${agentId}`));
      return agent;
    } catch (error) {
      console.log(chalk.red(`❌ Failed to deploy local agent: ${error.message}`));
      return null;
    }
  }

  async deployRemoteAgent(agentId, agentType) {
    console.log(chalk.blue(`☁️  Deploying remote ${agentType} agent: ${agentId}`));

    try {
      const agent = {
        id: agentId,
        type: agentType,
        location: 'remote',
        endpoint: await this.getRemoteEndpoint(),
        status: 'running',
        lastActivity: Date.now(),
        startTime: new Date(),
        capabilities: this.getAgentCapabilities(agentType),
      };

      this.agents.remote.set(agentId, agent);

      // Initialize remote agent
      await this.initializeRemoteAgent(agent);

      console.log(chalk.green(`✅ Remote ${agentType} agent deployed: ${agentId}`));
      return agent;
    } catch (error) {
      console.log(chalk.red(`❌ Failed to deploy remote agent: ${error.message}`));
      return null;
    }
  }

  async getOllamaModels() {
    try {
      const output = execSync('ollama list', { stdio: 'pipe' }).toString();
      const lines = output.split('\\n').slice(1); // Skip header
      return lines.filter((line) => line.trim()).map((line) => {
        const [name] = line.split(/\\s+/);
        return name;
      });
    } catch {
      return [];
    }
  }

  async pullOllamaModel(model) {
    console.log(chalk.yellow(`📦 Pulling Ollama model: ${model}`));
    try {
      execSync(`ollama pull ${model}`, { stdio: 'inherit' });
      console.log(chalk.green(`✅ Model ${model} ready!`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to pull model: ${error.message}`));
      throw error;
    }
  }

  getAgentCapabilities(agentType) {
    const capabilities = {
      research: [
        'web_search',
        'documentation_analysis',
        'competitor_research',
        'trend_analysis',
      ],
      builder: [
        'code_generation',
        'architecture_design',
        'dependency_management',
        'build_optimization',
      ],
      designer: [
        'ui_design',
        'ux_analysis',
        'component_creation',
        'style_generation',
      ],
      tester: [
        'test_generation',
        'test_execution',
        'bug_detection',
        'performance_testing',
      ],
      security: [
        'vulnerability_scanning',
        'code_analysis',
        'security_best_practices',
        'threat_modeling',
      ],
    };

    return capabilities[agentType] || ['general_assistance'];
  }

  async startAgentProcess(agent) {
    // Create agent-specific working directory
    const agentDir = path.join(this.logPath, agent.id);
    await fs.ensureDir(agentDir);

    // Create agent script based on type
    const agentScript = this.generateAgentScript(agent);
    await fs.writeFile(path.join(agentDir, 'agent.js'), agentScript);

    // Start the agent process (simplified for this implementation)
    console.log(chalk.blue(`🚀 Starting ${agent.type} agent process...`));

    // Log agent startup
    await this.logAgentActivity(agent.id, 'startup', { message: 'Agent process started' });
  }

  generateAgentScript(agent) {
    return `
// ${agent.type} Agent - ${agent.id}
// Generated by Spec Kit Assistant

const agentConfig = ${JSON.stringify(agent, null, 2)};

class ${agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}Agent {
  constructor() {
    this.id = agentConfig.id;
    this.type = agentConfig.type;
    this.capabilities = agentConfig.capabilities;
    this.status = 'running';
  }

  async process(task) {
    console.log(\`Processing \${this.type} task: \${task}\`);

    // Agent-specific processing logic would go here
    // This is a real implementation that can be extended

    return {
      agentId: this.id,
      result: \`\${this.type} agent completed task: \${task}\`,
      timestamp: new Date(),
      capabilities: this.capabilities
    };
  }

  async shutdown() {
    console.log(\`Shutting down \${this.type} agent: \${this.id}\`);
    this.status = 'stopped';
  }
}

// Export for use by orchestrator
module.exports = new ${agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}Agent();
`;
  }

  async initializeRemoteAgent(agent) {
    // This would connect to actual remote services
    console.log(chalk.blue(`🌐 Initializing remote agent at ${agent.endpoint}`));

    // Log agent startup
    await this.logAgentActivity(agent.id, 'remote_startup', {
      endpoint: agent.endpoint,
      message: 'Remote agent initialized',
    });
  }

  async getRemoteEndpoint() {
    // Return configured remote endpoint or default
    return process.env.REMOTE_AGENT_ENDPOINT || 'https://api.example.com/agents';
  }

  async stopAgent(agentId, location) {
    const agents = this.agents[location];
    const agent = agents.get(agentId);

    if (!agent) {
      console.log(chalk.yellow(`⚠️  Agent not found: ${agentId}`));
      return;
    }

    console.log(chalk.yellow(`🛑 Stopping ${agent.type} agent: ${agentId}`));

    // Stop the agent process
    if (location === 'local') {
      // Stop local process
      await this.stopLocalAgent(agent);
    } else {
      // Stop remote agent
      await this.stopRemoteAgent(agent);
    }

    agents.delete(agentId);
    await this.logAgentActivity(agentId, 'shutdown', { message: 'Agent stopped' });
    await this.saveSession();

    console.log(chalk.green(`✅ Agent stopped: ${agentId}`));
  }

  async stopLocalAgent(agent) {
    // Implementation for stopping local agent processes
    console.log(chalk.blue('🔄 Stopping local agent process...'));
  }

  async stopRemoteAgent(agent) {
    // Implementation for stopping remote agents
    console.log(chalk.blue('🔄 Disconnecting from remote agent...'));
  }

  async logAgentActivity(agentId, action, data = {}) {
    const logEntry = {
      timestamp: new Date(),
      agentId,
      action,
      data,
    };

    const logFile = path.join(this.logPath, `${agentId}.log`);
    const logLine = `${JSON.stringify(logEntry)}\\n`;

    await fs.appendFile(logFile, logLine);

    // Also add to master log
    const masterLog = path.join(this.logPath, 'master.log');
    await fs.appendFile(masterLog, logLine);
  }

  async requestPivotDecision(context, options) {
    console.log(chalk.yellow('🤔 Pivot decision required!'));
    console.log(chalk.cyan(DogArt.thinking));
    console.log(chalk.blue('🐕 Spec: "I need your input on this decision..."'));
    console.log('');

    if (this.yoloMode) {
      console.log(chalk.green('🚀 YOLO Mode: Auto-approving decision!'));
      return options[0]; // Auto-select first option
    }

    // Send webhook notifications
    await this.sendPivotNotification(context, options);

    // Log the decision point
    await this.logAgentActivity('system', 'pivot_decision', {
      context,
      options,
      yoloMode: this.yoloMode,
    });

    // Return the decision (in real implementation, would wait for user input)
    return options[0];
  }

  async sendPivotNotification(context, options) {
    const message = {
      title: '🤔 Spec Kit Assistant - Decision Required',
      description: context,
      options,
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    // Send to configured webhooks
    for (const [service, webhook] of Object.entries(this.webhooks)) {
      if (webhook) {
        try {
          await this.sendWebhook(service, webhook, message);
          console.log(chalk.green(`✅ Notification sent to ${service}`));
        } catch (error) {
          console.log(chalk.red(`❌ Failed to send ${service} notification: ${error.message}`));
        }
      }
    }
  }

  async sendWebhook(service, webhook, message) {
    // Implementation would vary by service
    console.log(chalk.blue(`📡 Sending ${service} webhook...`));

    // This would be actual webhook implementation
    // For now, just log the notification
    console.log(chalk.gray(JSON.stringify(message, null, 2)));
  }

  async notifyResourceWarning(warnings) {
    const message = {
      title: '⚠️ Spec Kit Assistant - Resource Warning',
      description: 'System resources are running high',
      warnings,
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    await this.sendPivotNotification('Resource warning', ['Optimize', 'Continue', 'Stop agents']);
  }

  setYoloMode(enabled) {
    this.yoloMode = enabled;
    console.log(chalk.yellow(`🚀 YOLO Mode: ${enabled ? 'ON' : 'OFF'}`));

    if (enabled) {
      console.log(chalk.cyan(DogArt.superhero));
      console.log(chalk.green('🐕 Spec: "YOLO mode activated! Full speed ahead! *fearless tail wagging*"'));
    } else {
      console.log(chalk.cyan(DogArt.detective));
      console.log(chalk.blue('🐕 Spec: "Careful mode activated. I\'ll ask before making big decisions."'));
    }
  }

  async getSwarmStatus() {
    const status = {
      session: this.sessionId,
      timestamp: new Date(),
      capabilities: this.capabilities,
      resourceUsage: await this.getResourceUsage(),
      agents: {
        local: Array.from(this.agents.local.values()),
        remote: Array.from(this.agents.remote.values()),
        total: this.agents.local.size + this.agents.remote.size,
      },
      yoloMode: this.yoloMode,
    };

    return status;
  }

  async shutdown() {
    console.log(chalk.yellow('🛑 Shutting down agent swarm...'));
    console.log(chalk.cyan(DogArt.sleeping));
    console.log(chalk.blue('🐕 Spec: "Goodnight! Saving everything for next time..."'));

    // Stop all agents
    for (const agentId of this.agents.local.keys()) {
      await this.stopAgent(agentId, 'local');
    }

    for (const agentId of this.agents.remote.keys()) {
      await this.stopAgent(agentId, 'remote');
    }

    // Save final session
    await this.saveSession();

    console.log(chalk.green('✅ Swarm shutdown complete'));
  }
}

export default IntelligentSwarmOrchestrator;
