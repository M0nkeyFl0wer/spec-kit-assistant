import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const execAsync = promisify(exec);

/**
 * Warp Terminal Integration for Distributed Swarm Orchestration
 * Enables SSH tunneling, remote execution, and resource delegation
 */
export class WarpIntegration extends EventEmitter {
  constructor(orchestrator) {
    super();
    this.orchestrator = orchestrator;
    this.sshConnections = new Map();
    this.tunnelConfigs = new Map();
    this.remoteAgents = new Map();
    this.connectionPool = new Map();

    this.config = {
      maxConnections: 10,
      connectionTimeout: 30000,
      heartbeatInterval: 30000,
      maxRetries: 3,
      sshOptions: [
        '-o StrictHostKeyChecking=no',
        '-o ServerAliveInterval=60',
        '-o ServerAliveCountMax=3',
        '-o ConnectTimeout=10',
      ],
    };

    this.metrics = {
      connectionsEstablished: 0,
      tasksDelegated: 0,
      bytesTransferred: 0,
      errors: 0,
      averageLatency: 0,
    };
  }

  /**
   * Initialize Warp features and detect capabilities
   */
  async initialize() {
    console.log(chalk.blue('🌀 Initializing Warp integration...'));

    try {
      // Check if Warp is installed
      const warpAvailable = await this.checkWarpAvailability();

      if (warpAvailable) {
        console.log(chalk.green('✅ Warp terminal detected'));
        this.warpMode = true;
      } else {
        console.log(chalk.yellow('⚠️ Warp not detected, using standard SSH'));
        this.warpMode = false;
      }

      // Load SSH configurations
      await this.loadSSHConfigurations();

      // Start connection health monitoring
      this.startHealthMonitoring();

      console.log(chalk.green('✅ Warp integration ready'));
      this.emit('initialized', { warpMode: this.warpMode });
    } catch (error) {
      console.error(chalk.red('❌ Warp initialization failed:'), error);
      throw error;
    }
  }

  /**
   * Check if Warp terminal is available
   */
  async checkWarpAvailability() {
    try {
      const { stdout } = await execAsync('which warp');
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Load SSH configurations from ~/.ssh/config and environment
   */
  async loadSSHConfigurations() {
    const sshConfigPath = path.join(process.env.HOME, '.ssh', 'config');

    if (await fs.pathExists(sshConfigPath)) {
      const configContent = await fs.readFile(sshConfigPath, 'utf8');
      this.parseSSHConfig(configContent);
    }

    // Load from environment variables
    if (process.env.WARP_REMOTE_HOSTS) {
      const hosts = JSON.parse(process.env.WARP_REMOTE_HOSTS);
      hosts.forEach((host) => this.addRemoteHost(host));
    }
  }

  /**
   * Parse SSH config file
   */
  parseSSHConfig(configContent) {
    const lines = configContent.split('\n');
    let currentHost = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('Host ')) {
        currentHost = {
          name: trimmed.substring(5).trim(),
          config: {},
        };
      } else if (currentHost && trimmed) {
        const [key, ...valueParts] = trimmed.split(/\s+/);
        currentHost.config[key.toLowerCase()] = valueParts.join(' ');

        if (key.toLowerCase() === 'hostname') {
          this.tunnelConfigs.set(currentHost.name, currentHost.config);
        }
      }
    }
  }

  /**
   * Add a remote host configuration
   */
  addRemoteHost(config) {
    const {
      name,
      host,
      user,
      port = 22,
      keyPath,
      capabilities = {},
    } = config;

    this.tunnelConfigs.set(name, {
      hostname: host,
      user,
      port,
      identityfile: keyPath,
      capabilities,
    });

    console.log(chalk.green(`📍 Added remote host: ${name} (${user}@${host})`));
  }

  /**
   * Establish SSH connection to remote host
   */
  async establishConnection(hostName) {
    const config = this.tunnelConfigs.get(hostName);

    if (!config) {
      throw new Error(`Unknown host: ${hostName}`);
    }

    // Check if connection already exists in pool
    if (this.connectionPool.has(hostName)) {
      const existing = this.connectionPool.get(hostName);
      if (existing.status === 'connected') {
        return existing;
      }
    }

    console.log(chalk.blue(`🔗 Establishing connection to ${hostName}...`));

    const connection = {
      id: crypto.randomUUID(),
      hostName,
      config,
      status: 'connecting',
      establishedAt: null,
      lastActivity: new Date(),
      process: null,
    };

    try {
      // Build SSH command
      const sshCommand = this.buildSSHCommand(config);

      // Create control socket for connection multiplexing
      const controlPath = path.join('/tmp', `spec-ssh-${hostName}.sock`);
      sshCommand.push('-M', '-S', controlPath);

      // Spawn SSH process
      const sshProcess = this.warpMode
        ? spawn('warp', ['run', 'ssh', ...sshCommand])
        : spawn('ssh', sshCommand);

      connection.process = sshProcess;
      connection.controlPath = controlPath;

      // Handle SSH process events
      this.setupSSHProcessHandlers(sshProcess, connection);

      // Wait for connection to establish
      await this.waitForConnection(connection);

      connection.status = 'connected';
      connection.establishedAt = new Date();

      // Add to connection pool
      this.connectionPool.set(hostName, connection);
      this.sshConnections.set(connection.id, connection);

      this.metrics.connectionsEstablished++;

      console.log(chalk.green(`✅ Connected to ${hostName}`));
      this.emit('connection-established', connection);

      return connection;
    } catch (error) {
      connection.status = 'failed';
      this.metrics.errors++;

      console.error(chalk.red(`❌ Failed to connect to ${hostName}:`), error);
      throw error;
    }
  }

  /**
   * Build SSH command with options
   */
  buildSSHCommand(config) {
    const command = [];

    // Add SSH options
    command.push(...this.config.sshOptions);

    // Add identity file if specified
    if (config.identityfile) {
      command.push('-i', config.identityfile);
    }

    // Add port if not default
    if (config.port && config.port !== 22) {
      command.push('-p', config.port.toString());
    }

    // Add user@host
    const target = config.user
      ? `${config.user}@${config.hostname}`
      : config.hostname;
    command.push(target);

    return command;
  }

  /**
   * Setup SSH process event handlers
   */
  setupSSHProcessHandlers(process, connection) {
    process.stdout.on('data', (data) => {
      this.emit('ssh-output', connection, data.toString());
    });

    process.stderr.on('data', (data) => {
      this.emit('ssh-error', connection, data.toString());
    });

    process.on('close', (code) => {
      connection.status = 'closed';
      this.handleConnectionClosed(connection, code);
    });

    process.on('error', (error) => {
      connection.status = 'error';
      this.handleConnectionError(connection, error);
    });
  }

  /**
   * Wait for SSH connection to establish
   */
  async waitForConnection(connection, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, timeout);

      const checkInterval = setInterval(async () => {
        try {
          // Test connection with a simple command
          const result = await this.executeRemoteCommand(
            connection,
            'echo "CONNECTION_TEST"',
            { timeout: 5000 },
          );

          if (result.includes('CONNECTION_TEST')) {
            clearInterval(checkInterval);
            clearTimeout(timer);
            resolve();
          }
        } catch {
          // Connection not ready yet
        }
      }, 1000);
    });
  }

  /**
   * Execute command on remote host
   */
  async executeRemoteCommand(connection, command, options = {}) {
    const {
      timeout = 60000,
      stream = false,
    } = options;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Command timeout'));
      }, timeout);

      let output = '';
      let errorOutput = '';

      // Use control socket for multiplexed connection
      const sshCommand = [
        'ssh',
        '-S', connection.controlPath,
        `${connection.config.user}@${connection.config.hostname}`,
        command,
      ];

      const proc = spawn(sshCommand[0], sshCommand.slice(1));

      proc.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;

        if (stream) {
          this.emit('remote-output', connection, chunk);
        }
      });

      proc.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      proc.on('close', (code) => {
        clearTimeout(timer);

        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed: ${errorOutput}`));
        }
      });

      connection.lastActivity = new Date();
    });
  }

  /**
   * Deploy agent to remote host
   */
  async deployRemoteAgent(hostName, agentType, agentConfig) {
    console.log(chalk.blue(`🤖 Deploying ${agentType} agent to ${hostName}...`));

    try {
      // Establish connection
      const connection = await this.establishConnection(hostName);

      // Generate agent ID
      const agentId = `${agentType}-${hostName}-${Date.now()}`;

      // Create agent deployment package
      const deploymentPackage = this.createAgentDeploymentPackage(
        agentId,
        agentType,
        agentConfig,
      );

      // Transfer agent code to remote host
      await this.transferAgentCode(connection, deploymentPackage);

      // Start agent on remote host
      const startCommand = this.buildAgentStartCommand(agentId, agentType);
      await this.executeRemoteCommand(connection, startCommand);

      // Register remote agent
      const remoteAgent = {
        id: agentId,
        type: agentType,
        hostName,
        connection,
        status: 'running',
        deployedAt: new Date(),
        config: agentConfig,
      };

      this.remoteAgents.set(agentId, remoteAgent);

      console.log(chalk.green(`✅ Remote ${agentType} agent deployed: ${agentId}`));
      this.emit('remote-agent-deployed', remoteAgent);

      return remoteAgent;
    } catch (error) {
      console.error(chalk.red('❌ Failed to deploy remote agent:'), error);
      throw error;
    }
  }

  /**
   * Create agent deployment package
   */
  createAgentDeploymentPackage(agentId, agentType, config) {
    return {
      id: agentId,
      type: agentType,
      config,
      script: this.generateRemoteAgentScript(agentId, agentType, config),
      dependencies: this.getAgentDependencies(agentType),
    };
  }

  /**
   * Generate remote agent execution script
   */
  generateRemoteAgentScript(agentId, agentType, config) {
    return `#!/bin/bash
# Remote Agent: ${agentId}
# Type: ${agentType}

set -euo pipefail

# Setup environment
export AGENT_ID="${agentId}"
export AGENT_TYPE="${agentType}"
export SPEC_KIT_REMOTE=true

# Create working directory
WORK_DIR="/tmp/spec-agent-${agentId}"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# Resource limits
ulimit -t ${config.cpuLimit || 300}
ulimit -m ${config.memoryLimit || 1048576}

# Agent implementation
cat > agent.js << 'EOF'
const agentConfig = ${JSON.stringify(config, null, 2)};

class RemoteAgent {
  constructor() {
    this.id = process.env.AGENT_ID;
    this.type = process.env.AGENT_TYPE;
    this.config = agentConfig;
  }

  async processTask(task) {
    console.log(\`Processing task: \${task.id}\`);

    // Agent-specific processing
    const result = await this.executeTask(task);

    return {
      agentId: this.id,
      taskId: task.id,
      result,
      timestamp: new Date()
    };
  }

  async executeTask(task) {
    // Implementation based on agent type
    switch(this.type) {
      case 'compute':
        return this.executeComputeTask(task);
      case 'analysis':
        return this.executeAnalysisTask(task);
      default:
        return { status: 'completed', data: task };
    }
  }

  async executeComputeTask(task) {
    // Heavy computation logic
    return {
      status: 'completed',
      computation: 'result',
      metrics: {
        duration: Date.now() - task.startTime,
        cpuUsage: process.cpuUsage()
      }
    };
  }

  async executeAnalysisTask(task) {
    // Analysis logic
    return {
      status: 'completed',
      analysis: 'result',
      insights: []
    };
  }
}

// Start agent
const agent = new RemoteAgent();

// Listen for tasks via stdin
process.stdin.on('data', async (data) => {
  try {
    const task = JSON.parse(data.toString());
    const result = await agent.processTask(task);
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(JSON.stringify({
      error: error.message,
      agentId: agent.id
    }));
  }
});

console.log(\`Agent \${agent.id} ready\`);
EOF

# Start agent
node agent.js
`;
  }

  /**
   * Get agent dependencies based on type
   */
  getAgentDependencies(agentType) {
    const baseDeps = ['node', 'npm'];

    const typeDeps = {
      compute: ['python3', 'numpy'],
      analysis: ['python3', 'pandas'],
      gpu: ['cuda', 'tensorflow'],
      build: ['gcc', 'make'],
    };

    return [...baseDeps, ...(typeDeps[agentType] || [])];
  }

  /**
   * Transfer agent code to remote host
   */
  async transferAgentCode(connection, deploymentPackage) {
    const remotePath = `/tmp/spec-agent-${deploymentPackage.id}`;

    // Create remote directory
    await this.executeRemoteCommand(
      connection,
      `mkdir -p ${remotePath}`,
    );

    // Write agent script
    const scriptPath = `${remotePath}/start.sh`;
    const scriptContent = Buffer.from(deploymentPackage.script).toString('base64');

    await this.executeRemoteCommand(
      connection,
      `echo "${scriptContent}" | base64 -d > ${scriptPath} && chmod +x ${scriptPath}`,
    );

    console.log(chalk.green(`📦 Agent code transferred to ${connection.hostName}`));
  }

  /**
   * Build command to start remote agent
   */
  buildAgentStartCommand(agentId, agentType) {
    const scriptPath = `/tmp/spec-agent-${agentId}/start.sh`;
    return `nohup ${scriptPath} > /tmp/spec-agent-${agentId}.log 2>&1 & echo $!`;
  }

  /**
   * Delegate task to remote host
   */
  async delegateTask(task, hostName) {
    console.log(chalk.blue(`📤 Delegating task ${task.id} to ${hostName}...`));

    try {
      const startTime = Date.now();

      // Get or establish connection
      const connection = await this.establishConnection(hostName);

      // Find available remote agent
      const agent = await this.findAvailableRemoteAgent(hostName, task.type);

      if (!agent) {
        // Deploy new agent if none available
        await this.deployRemoteAgent(hostName, task.type, {
          cpuLimit: task.cpuLimit,
          memoryLimit: task.memoryLimit,
        });
      }

      // Serialize task
      const serializedTask = this.serializeTask(task);

      // Execute task remotely
      const result = await this.executeRemoteTask(connection, serializedTask);

      // Update metrics
      const duration = Date.now() - startTime;
      this.updateMetrics(duration, serializedTask.length);

      console.log(chalk.green(`✅ Task ${task.id} completed on ${hostName}`));
      this.emit('task-completed', {
        task, result, hostName, duration,
      });

      return result;
    } catch (error) {
      this.metrics.errors++;
      console.error(chalk.red('❌ Task delegation failed:'), error);

      // Attempt fallback
      return await this.handleTaskFailure(task, hostName, error);
    }
  }

  /**
   * Find available remote agent on host
   */
  async findAvailableRemoteAgent(hostName, agentType) {
    for (const [id, agent] of this.remoteAgents) {
      if (agent.hostName === hostName
          && agent.type === agentType
          && agent.status === 'running') {
        return agent;
      }
    }
    return null;
  }

  /**
   * Serialize task for remote execution
   */
  serializeTask(task) {
    // Remove non-serializable properties
    const serializable = {
      id: task.id,
      type: task.type,
      data: task.data,
      config: task.config,
      startTime: Date.now(),
    };

    // Sign task for integrity
    const signature = this.signTask(serializable);
    serializable.signature = signature;

    return JSON.stringify(serializable);
  }

  /**
   * Sign task with HMAC for integrity
   */
  signTask(task) {
    const secret = process.env.SPEC_KIT_SECRET || 'spec-kit-secret';
    return crypto.createHmac('sha256', secret)
      .update(JSON.stringify(task))
      .digest('hex');
  }

  /**
   * Execute task on remote host
   */
  async executeRemoteTask(connection, serializedTask) {
    // Create temporary file for task
    const taskFile = `/tmp/task-${Date.now()}.json`;

    // Transfer task to remote
    const taskContent = Buffer.from(serializedTask).toString('base64');
    await this.executeRemoteCommand(
      connection,
      `echo "${taskContent}" | base64 -d > ${taskFile}`,
    );

    // Execute task and get result
    const command = `cat ${taskFile} | node /tmp/spec-agent-*/agent.js`;
    const output = await this.executeRemoteCommand(connection, command, {
      timeout: 300000, // 5 minutes
    });

    // Clean up task file
    await this.executeRemoteCommand(connection, `rm -f ${taskFile}`);

    // Parse result
    try {
      return JSON.parse(output);
    } catch (error) {
      throw new Error(`Invalid task result: ${output}`);
    }
  }

  /**
   * Handle task execution failure
   */
  async handleTaskFailure(task, hostName, error) {
    console.log(chalk.yellow(`⚠️ Handling task failure for ${task.id}`));

    // Try alternative hosts
    const alternatives = await this.findAlternativeHosts(task);

    if (alternatives.length > 0) {
      console.log(chalk.blue(`🔄 Trying alternative host: ${alternatives[0]}`));
      return await this.delegateTask(task, alternatives[0]);
    }

    // Fall back to local execution if possible
    if (this.canExecuteLocally(task)) {
      console.log(chalk.blue('🏠 Falling back to local execution'));
      return await this.orchestrator.assignTask(task);
    }

    throw new Error(`Task execution failed: ${error.message}`);
  }

  /**
   * Find alternative hosts for task
   */
  async findAlternativeHosts(task) {
    const alternatives = [];

    for (const [name, config] of this.tunnelConfigs) {
      if (config.capabilities && this.matchesTaskRequirements(task, config.capabilities)) {
        alternatives.push(name);
      }
    }

    return alternatives;
  }

  /**
   * Check if task can be executed locally
   */
  canExecuteLocally(task) {
    // Check local resource availability
    const localResources = this.orchestrator.getResourceUsage();

    return (
      localResources.memory.free > (task.memoryLimit || 512)
      && localResources.cpu.usage < 0.8
    );
  }

  /**
   * Match task requirements with host capabilities
   */
  matchesTaskRequirements(task, capabilities) {
    if (task.requiresGPU && !capabilities.gpu) {
      return false;
    }

    if (task.minMemory && capabilities.memory < task.minMemory) {
      return false;
    }

    if (task.minCPU && capabilities.cpu < task.minCPU) {
      return false;
    }

    return true;
  }

  /**
   * Update metrics after task execution
   */
  updateMetrics(duration, dataSize) {
    this.metrics.tasksDelegated++;
    this.metrics.bytesTransferred += dataSize;

    // Update average latency
    const currentAvg = this.metrics.averageLatency;
    const newAvg = (currentAvg * (this.metrics.tasksDelegated - 1) + duration)
                   / this.metrics.tasksDelegated;
    this.metrics.averageLatency = newAvg;
  }

  /**
   * Handle connection closed
   */
  handleConnectionClosed(connection, code) {
    console.log(chalk.yellow(`🔌 Connection to ${connection.hostName} closed (code: ${code})`));

    // Remove from pools
    this.connectionPool.delete(connection.hostName);
    this.sshConnections.delete(connection.id);

    // Update remote agents status
    for (const [id, agent] of this.remoteAgents) {
      if (agent.connection.id === connection.id) {
        agent.status = 'disconnected';
      }
    }

    this.emit('connection-closed', connection, code);
  }

  /**
   * Handle connection error
   */
  handleConnectionError(connection, error) {
    console.error(chalk.red(`❌ Connection error for ${connection.hostName}:`), error);

    connection.status = 'error';
    this.metrics.errors++;

    this.emit('connection-error', connection, error);
  }

  /**
   * Start health monitoring for connections
   */
  startHealthMonitoring() {
    setInterval(() => {
      this.checkConnectionHealth();
    }, this.config.heartbeatInterval);
  }

  /**
   * Check health of all connections
   */
  async checkConnectionHealth() {
    for (const [hostName, connection] of this.connectionPool) {
      if (connection.status !== 'connected') continue;

      try {
        // Send heartbeat
        await this.executeRemoteCommand(
          connection,
          'echo "HEARTBEAT"',
          { timeout: 5000 },
        );

        connection.lastActivity = new Date();
      } catch (error) {
        console.log(chalk.yellow(`⚠️ Heartbeat failed for ${hostName}`));

        // Try to reconnect
        await this.reconnect(hostName);
      }
    }
  }

  /**
   * Reconnect to host
   */
  async reconnect(hostName) {
    console.log(chalk.blue(`🔄 Reconnecting to ${hostName}...`));

    try {
      // Close existing connection
      const existing = this.connectionPool.get(hostName);
      if (existing && existing.process) {
        existing.process.kill();
      }

      // Establish new connection
      await this.establishConnection(hostName);

      console.log(chalk.green(`✅ Reconnected to ${hostName}`));
    } catch (error) {
      console.error(chalk.red('❌ Reconnection failed:'), error);
    }
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      warpMode: this.warpMode,
      connections: {
        total: this.connectionPool.size,
        active: Array.from(this.connectionPool.values())
          .filter((c) => c.status === 'connected').length,
      },
      remoteAgents: {
        total: this.remoteAgents.size,
        running: Array.from(this.remoteAgents.values())
          .filter((a) => a.status === 'running').length,
      },
      metrics: this.metrics,
      hosts: Array.from(this.tunnelConfigs.keys()),
    };
  }

  /**
   * Shutdown all connections and agents
   */
  async shutdown() {
    console.log(chalk.yellow('🛑 Shutting down Warp integration...'));

    // Stop all remote agents
    for (const [id, agent] of this.remoteAgents) {
      try {
        await this.executeRemoteCommand(
          agent.connection,
          `kill $(cat /tmp/spec-agent-${id}.pid) 2>/dev/null || true`,
        );
      } catch {
        // Agent already stopped
      }
    }

    // Close all connections
    for (const [id, connection] of this.sshConnections) {
      if (connection.process) {
        connection.process.kill();
      }
    }

    // Clear pools
    this.connectionPool.clear();
    this.sshConnections.clear();
    this.remoteAgents.clear();

    console.log(chalk.green('✅ Warp integration shutdown complete'));
  }
}

export default WarpIntegration;
