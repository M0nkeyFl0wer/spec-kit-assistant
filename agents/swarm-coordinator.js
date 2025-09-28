#!/usr/bin/env node
/**
 * Real Swarm Coordinator - Actually manages distributed agents
 * Deploys agents to remote systems and coordinates tasks
 */

import WebSocket, { WebSocketServer } from 'ws';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class SwarmCoordinator {
  constructor(config = {}) {
    this.port = config.port || 8000;
    this.agents = new Map();
    this.tasks = new Map();
    this.wss = null;
    this.remoteHosts = config.remoteHosts || [];
    this.localAgents = [];

    console.log(chalk.blue(`👑 Swarm Coordinator starting on port ${this.port}...`));
  }

  async start() {
    // Start WebSocket server for agent communication
    this.wss = new WebSocketServer({ port: this.port, host: '0.0.0.0' });

    this.wss.on('connection', (ws) => {
      console.log(chalk.green('🔌 Agent connected'));

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleAgentMessage(ws, message);
        } catch (error) {
          console.error(chalk.red(`Message parsing error: ${error.message}`));
        }
      });

      ws.on('close', () => {
        // Find and remove disconnected agent
        for (const [agentId, agent] of this.agents.entries()) {
          if (agent.ws === ws) {
            console.log(chalk.yellow(`🔌 Agent ${agentId} disconnected`));
            this.agents.delete(agentId);
            break;
          }
        }
      });
    });

    console.log(chalk.green(`✅ Swarm Coordinator listening on ws://localhost:${this.port}`));
  }

  handleAgentMessage(ws, message) {
    switch (message.type) {
      case 'agent-registration':
        this.registerAgent(ws, message);
        break;
      case 'task-completed':
        this.handleTaskCompletion(message);
        break;
      case 'task-failed':
        this.handleTaskFailure(message);
        break;
      case 'heartbeat':
        this.handleHeartbeat(message);
        break;
    }
  }

  registerAgent(ws, registration) {
    const agent = {
      id: registration.agentId,
      type: registration.agentType,
      capabilities: registration.capabilities,
      status: registration.status,
      ws: ws,
      registeredAt: new Date(),
      lastHeartbeat: new Date()
    };

    this.agents.set(agent.id, agent);
    console.log(chalk.green(`✅ Agent registered: ${agent.id} (${agent.type})`));
    console.log(chalk.gray(`   Capabilities: ${agent.capabilities.join(', ')}`));
  }

  async deployLocalAgents(agentTypes = ['test-engineer']) {
    console.log(chalk.blue(`🚀 Deploying ${agentTypes.length} local agents...`));

    for (const agentType of agentTypes) {
      try {
        await this.deployLocalAgent(agentType);
      } catch (error) {
        console.error(chalk.red(`Failed to deploy ${agentType}: ${error.message}`));
      }
    }

    // Wait for agents to register
    await this.waitForAgents(agentTypes.length);
  }

  async deployLocalAgent(agentType) {
    const agentMap = {
      'test-engineer': './agents/test-agent.js',
      'qa-engineer': './agents/qa-agent.js',
      'security-specialist': './agents/security-agent.js'
    };

    const agentScript = agentMap[agentType];
    if (!agentScript) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Check if agent script exists
    try {
      await fs.access(agentScript);
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Agent script ${agentScript} not found, using test-agent.js`));
      // Use test agent as fallback
      agentScript = './agents/test-agent.js';
    }

    const agentId = `${agentType}-${Date.now()}`;
    const port = 8001 + this.localAgents.length;

    console.log(chalk.blue(`   Spawning ${agentType} (${agentId}) on port ${port}...`));

    const agentProcess = spawn('node', [
      agentScript,
      agentId,
      `ws://localhost:${this.port}`,
      process.cwd(),
      port.toString()
    ], {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Capture agent output
    agentProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(chalk.gray(`   [${agentId}] ${output}`));
      }
    });

    agentProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(chalk.yellow(`   [${agentId}] ${output}`));
      }
    });

    agentProcess.on('exit', (code) => {
      console.log(chalk.yellow(`   [${agentId}] Process exited with code ${code}`));
      this.localAgents = this.localAgents.filter(a => a.id !== agentId);
    });

    this.localAgents.push({
      id: agentId,
      type: agentType,
      process: agentProcess,
      port: port
    });

    // Give agent time to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async waitForAgents(expectedCount, timeout = 30000) {
    console.log(chalk.blue(`⏳ Waiting for ${expectedCount} agents to register...`));

    const startTime = Date.now();
    while (this.agents.size < expectedCount && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      process.stdout.write(chalk.gray('.'));
    }
    console.log(''); // New line

    if (this.agents.size >= expectedCount) {
      console.log(chalk.green(`✅ ${this.agents.size} agents registered and ready`));
    } else {
      console.log(chalk.yellow(`⚠️  Only ${this.agents.size}/${expectedCount} agents registered`));
    }
  }

  async deployRemoteAgent(hostConfig, agentType) {
    const { host, user, key } = hostConfig;
    console.log(chalk.blue(`🌐 Deploying ${agentType} to ${user}@${host}...`));

    try {
      // Copy agent script to remote host
      const sshKey = key ? `-i ${key}` : '';
      const agentScript = './agents/test-agent.js';

      await execAsync(`scp ${sshKey} ${agentScript} ${user}@${host}:~/agent.js`);

      // Install dependencies on remote host
      await execAsync(`ssh ${sshKey} ${user}@${host} "npm install ws chalk"`);

      // Start agent on remote host
      const agentId = `remote-${agentType}-${Date.now()}`;
      const startCommand = `ssh ${sshKey} ${user}@${host} "nohup node ~/agent.js ${agentId} ws://${this.getLocalIP()}:${this.port} ~/ 8001 > ~/agent.log 2>&1 &"`;

      await execAsync(startCommand);

      console.log(chalk.green(`✅ Remote agent ${agentId} deployed to ${host}`));

      return agentId;

    } catch (error) {
      console.error(chalk.red(`❌ Remote deployment failed: ${error.message}`));
      throw error;
    }
  }

  getLocalIP() {
    // Get local IP for remote agents to connect back
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return 'localhost';
  }

  async assignTask(taskConfig) {
    const task = {
      id: `task-${Date.now()}`,
      type: taskConfig.type,
      description: taskConfig.description,
      requiredCapabilities: taskConfig.requiredCapabilities || [],
      assignedAt: new Date(),
      status: 'pending'
    };

    // Find suitable agent
    const suitableAgent = this.findSuitableAgent(task);

    if (!suitableAgent) {
      console.log(chalk.yellow(`⚠️  No suitable agent found for task: ${task.type}`));
      return null;
    }

    // Assign task to agent
    task.assignedAgent = suitableAgent.id;
    task.status = 'assigned';
    this.tasks.set(task.id, task);

    console.log(chalk.blue(`📋 Assigning task ${task.id} to ${suitableAgent.id}`));

    // Send task to agent
    const message = {
      type: 'task-assignment',
      targetAgent: suitableAgent.id,
      task: task
    };

    suitableAgent.ws.send(JSON.stringify(message));

    return task.id;
  }

  findSuitableAgent(task) {
    const availableAgents = Array.from(this.agents.values()).filter(
      agent => agent.status === 'ready'
    );

    if (task.requiredCapabilities.length === 0) {
      return availableAgents[0];
    }

    // Find agent with matching capabilities
    return availableAgents.find(agent =>
      task.requiredCapabilities.some(cap =>
        agent.capabilities.includes(cap)
      )
    );
  }

  handleTaskCompletion(message) {
    const task = this.tasks.get(message.taskId);
    if (task) {
      task.status = 'completed';
      task.result = message.result;
      task.completedAt = new Date();

      console.log(chalk.green(`✅ Task ${message.taskId} completed by ${message.agentId}`));
      console.log(chalk.gray(`   Result: ${JSON.stringify(message.result, null, 2)}`));
    }
  }

  handleTaskFailure(message) {
    const task = this.tasks.get(message.taskId);
    if (task) {
      task.status = 'failed';
      task.error = message.error;
      task.failedAt = new Date();

      console.log(chalk.red(`❌ Task ${message.taskId} failed: ${message.error}`));
    }
  }

  handleHeartbeat(message) {
    const agent = this.agents.get(message.agentId);
    if (agent) {
      agent.lastHeartbeat = new Date();
    }
  }

  getStatus() {
    return {
      agents: Array.from(this.agents.values()).map(agent => ({
        id: agent.id,
        type: agent.type,
        capabilities: agent.capabilities,
        status: agent.status,
        lastHeartbeat: agent.lastHeartbeat
      })),
      tasks: Array.from(this.tasks.values()),
      localAgents: this.localAgents.length,
      totalConnections: this.wss?.clients.size || 0
    };
  }

  async shutdown() {
    console.log(chalk.yellow('🛑 Shutting down swarm coordinator...'));

    // Shutdown local agents
    for (const agent of this.localAgents) {
      agent.process.kill('SIGTERM');
    }

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }

    console.log(chalk.green('✅ Swarm coordinator shutdown complete'));
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const coordinator = new SwarmCoordinator({
    port: parseInt(process.argv[2]) || 8000
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await coordinator.shutdown();
    process.exit(0);
  });

  async function runDemo() {
    await coordinator.start();

    // Deploy some local agents
    await coordinator.deployLocalAgents(['test-engineer']);

    // Assign a test task
    setTimeout(async () => {
      console.log(chalk.cyan('\\n🎯 Assigning test task...'));

      const taskId = await coordinator.assignTask({
        type: 'unit-test',
        description: 'Run unit tests for the project',
        requiredCapabilities: ['unit-testing']
      });

      if (taskId) {
        console.log(chalk.blue(`📋 Task ${taskId} assigned`));
      }
    }, 5000);

    // Show status every 10 seconds
    setInterval(() => {
      const status = coordinator.getStatus();
      console.log(chalk.cyan(`\\n📊 Status: ${status.agents.length} agents, ${status.tasks.length} tasks`));
    }, 10000);
  }

  runDemo().catch(console.error);
}

export { SwarmCoordinator };