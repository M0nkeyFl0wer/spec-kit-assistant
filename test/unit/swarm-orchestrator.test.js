import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import sinon from 'sinon';
import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { SwarmOrchestrator } from '../../src/swarm/orchestrator.js';

describe('SwarmOrchestrator', () => {
  let orchestrator;
  let consoleStub;
  let wsServerStub;
  let clock;

  beforeEach(() => {
    orchestrator = new SwarmOrchestrator();
    consoleStub = {
      log: sinon.stub(console, 'log'),
      error: sinon.stub(console, 'error')
    };
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    consoleStub.log.restore();
    consoleStub.error.restore();
    clock.restore();
    if (wsServerStub) {
      wsServerStub.close?.();
    }
  });

  describe('Constructor', () => {
    it('should extend EventEmitter', () => {
      expect(orchestrator instanceof EventEmitter).toBe(true);
    });

    it('should initialize with correct properties', () => {
      expect(orchestrator.spec).toBeDefined();
      expect(orchestrator.agents).toBeInstanceOf(Map);
      expect(orchestrator.tasks).toBeInstanceOf(Map);
      expect(orchestrator.connections).toBeInstanceOf(Map);
      expect(orchestrator.swarmConfig).toBeDefined();
    });

    it('should have correct swarm configuration', () => {
      expect(orchestrator.swarmConfig.maxAgents).toBe(10);
      expect(orchestrator.swarmConfig.autoScale).toBe(true);
      expect(orchestrator.swarmConfig.healthCheckInterval).toBe(30000);
      expect(orchestrator.swarmConfig.taskTimeout).toBe(300000);
      expect(orchestrator.swarmConfig.retryAttempts).toBe(3);
    });

    it('should have all agent types defined', () => {
      const expectedAgents = [
        'quality-assurance',
        'security-scanner',
        'performance-monitor',
        'code-repair',
        'documentation',
        'deployment'
      ];

      expectedAgents.forEach(agentType => {
        expect(orchestrator.agentTypes[agentType]).toBeDefined();
        expect(orchestrator.agentTypes[agentType].name).toBeDefined();
        expect(orchestrator.agentTypes[agentType].emoji).toBeDefined();
        expect(orchestrator.agentTypes[agentType].skills).toBeInstanceOf(Array);
        expect(orchestrator.agentTypes[agentType].resourceRequirements).toBeDefined();
      });
    });

    it('should initialize swarm metrics', () => {
      expect(orchestrator.swarmMetrics).toBeDefined();
      expect(orchestrator.swarmMetrics.tasksCompleted).toBe(0);
      expect(orchestrator.swarmMetrics.tasksInProgress).toBe(0);
      expect(orchestrator.swarmMetrics.tasksFailed).toBe(0);
      expect(orchestrator.swarmMetrics.averageCompletionTime).toBe(0);
      expect(orchestrator.swarmMetrics.agentUtilization).toBe(0);
      expect(orchestrator.swarmMetrics.costSavings).toBe(0);
    });
  });

  describe('deploySwarm()', () => {
    beforeEach(() => {
      sinon.stub(orchestrator.spec, 'show').resolves();
      sinon.stub(orchestrator.spec, 'work').resolves();
      sinon.stub(orchestrator.spec, 'celebrate').resolves();
      sinon.stub(orchestrator, 'initializeSwarmInfrastructure').resolves();
      sinon.stub(orchestrator, 'deployAgent').resolves();
      sinon.stub(orchestrator, 'startHealthMonitoring').resolves();
    });

    it('should deploy specified number of agents', async () => {
      await orchestrator.deploySwarm(3);

      expect(orchestrator.deployAgent.callCount).toBe(3);
    });

    it('should deploy core agents in order', async () => {
      await orchestrator.deploySwarm(2);

      const deployedAgents = orchestrator.deployAgent.getCalls().map(call => call.args[0]);
      expect(deployedAgents[0]).toBe('quality-assurance');
      expect(deployedAgents[1]).toBe('security-scanner');
    });

    it('should initialize infrastructure before deploying agents', async () => {
      await orchestrator.deploySwarm(1);

      expect(orchestrator.initializeSwarmInfrastructure.calledBefore(orchestrator.deployAgent)).toBe(true);
    });

    it('should start health monitoring after deployment', async () => {
      await orchestrator.deploySwarm(1);

      expect(orchestrator.startHealthMonitoring.called).toBe(true);
    });

    it('should celebrate successful deployment', async () => {
      await orchestrator.deploySwarm(3);

      expect(orchestrator.spec.celebrate.called).toBe(true);
    });

    it('should handle deployment errors gracefully', async () => {
      orchestrator.deployAgent.rejects(new Error('Deployment failed'));
      sinon.stub(orchestrator.spec, 'offerHelp').resolves();

      await orchestrator.deploySwarm(1);

      expect(orchestrator.spec.offerHelp.called).toBe(true);
    });
  });

  describe('deployAgent()', () => {
    beforeEach(() => {
      sinon.stub(orchestrator.spec, 'show').resolves();
    });

    it('should create agent with correct properties', async () => {
      const agentType = 'quality-assurance';
      const agent = await orchestrator.deployAgent(agentType);

      expect(agent).toBeDefined();
      expect(agent.id).toBeDefined();
      expect(agent.type).toBe(agentType);
      expect(agent.status).toBe('active');
      expect(agent.startTime).toBeInstanceOf(Date);
    });

    it('should add agent to agents map', async () => {
      const agentType = 'security-scanner';
      const agent = await orchestrator.deployAgent(agentType);

      expect(orchestrator.agents.has(agent.id)).toBe(true);
      expect(orchestrator.agents.get(agent.id)).toBe(agent);
    });

    it('should emit agent-deployed event', async () => {
      const eventSpy = sinon.spy();
      orchestrator.on('agent-deployed', eventSpy);

      await orchestrator.deployAgent('documentation');

      expect(eventSpy.called).toBe(true);
      expect(eventSpy.firstCall.args[0].type).toBe('documentation');
    });

    it('should track resource allocation', async () => {
      const agent = await orchestrator.deployAgent('performance-monitor');

      expect(agent.resources).toBeDefined();
      expect(agent.resources.cpu).toBe(2);
      expect(agent.resources.memory).toBe('1GB');
    });
  });

  describe('assignTask()', () => {
    let testAgent;

    beforeEach(async () => {
      sinon.stub(orchestrator.spec, 'show').resolves();
      testAgent = await orchestrator.deployAgent('quality-assurance');
    });

    it('should create task with correct structure', async () => {
      const taskData = {
        type: 'test-suite',
        priority: 'high',
        payload: { test: 'data' }
      };

      const task = await orchestrator.assignTask(taskData, testAgent.id);

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.type).toBe('test-suite');
      expect(task.priority).toBe('high');
      expect(task.assignedTo).toBe(testAgent.id);
      expect(task.status).toBe('pending');
    });

    it('should add task to tasks map', async () => {
      const task = await orchestrator.assignTask({ type: 'test' }, testAgent.id);

      expect(orchestrator.tasks.has(task.id)).toBe(true);
      expect(orchestrator.tasks.get(task.id)).toBe(task);
    });

    it('should find available agent if not specified', async () => {
      sinon.stub(orchestrator, 'findAvailableAgent').returns(testAgent);

      const task = await orchestrator.assignTask({ type: 'test' });

      expect(orchestrator.findAvailableAgent.called).toBe(true);
      expect(task.assignedTo).toBe(testAgent.id);
    });

    it('should queue task if no agent available', async () => {
      sinon.stub(orchestrator, 'findAvailableAgent').returns(null);
      sinon.stub(orchestrator, 'queueTask').resolves();

      await orchestrator.assignTask({ type: 'test' });

      expect(orchestrator.queueTask.called).toBe(true);
    });

    it('should emit task-assigned event', async () => {
      const eventSpy = sinon.spy();
      orchestrator.on('task-assigned', eventSpy);

      await orchestrator.assignTask({ type: 'test' }, testAgent.id);

      expect(eventSpy.called).toBe(true);
    });

    it('should handle task timeout', async () => {
      const task = await orchestrator.assignTask({ type: 'test' }, testAgent.id);

      // Fast forward past timeout
      clock.tick(orchestrator.swarmConfig.taskTimeout + 1000);

      // Task should be marked as failed
      expect(orchestrator.tasks.get(task.id)?.status).toBe('timeout');
    });
  });

  describe('executeTask()', () => {
    let testAgent;
    let testTask;

    beforeEach(async () => {
      sinon.stub(orchestrator.spec, 'show').resolves();
      testAgent = await orchestrator.deployAgent('quality-assurance');
      testTask = await orchestrator.assignTask({ type: 'test' }, testAgent.id);
    });

    it('should execute task successfully', async () => {
      const result = await orchestrator.executeTask(testTask.id);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.taskId).toBe(testTask.id);
    });

    it('should update task status during execution', async () => {
      const executePromise = orchestrator.executeTask(testTask.id);

      // Check status is in-progress
      expect(orchestrator.tasks.get(testTask.id).status).toBe('in-progress');

      await executePromise;

      // Check status is completed
      expect(orchestrator.tasks.get(testTask.id).status).toBe('completed');
    });

    it('should update metrics on completion', async () => {
      const initialCompleted = orchestrator.swarmMetrics.tasksCompleted;

      await orchestrator.executeTask(testTask.id);

      expect(orchestrator.swarmMetrics.tasksCompleted).toBe(initialCompleted + 1);
    });

    it('should handle task failure with retry', async () => {
      sinon.stub(orchestrator, 'performTask').onFirstCall().rejects(new Error('Failed'))
        .onSecondCall().resolves({ success: true });

      const result = await orchestrator.executeTask(testTask.id);

      expect(result.success).toBe(true);
      expect(orchestrator.performTask.callCount).toBe(2);
    });

    it('should emit task-completed event', async () => {
      const eventSpy = sinon.spy();
      orchestrator.on('task-completed', eventSpy);

      await orchestrator.executeTask(testTask.id);

      expect(eventSpy.called).toBe(true);
      expect(eventSpy.firstCall.args[0].taskId).toBe(testTask.id);
    });
  });

  describe('monitorSwarm()', () => {
    beforeEach(() => {
      sinon.stub(orchestrator.spec, 'show').resolves();
      sinon.stub(orchestrator, 'collectMetrics').resolves();
      sinon.stub(orchestrator, 'displayDashboard').resolves();
    });

    it('should start monitoring interval', async () => {
      await orchestrator.monitorSwarm();

      expect(orchestrator.monitoringInterval).toBeDefined();
    });

    it('should collect and display metrics periodically', async () => {
      await orchestrator.monitorSwarm();

      // Fast forward through multiple intervals
      clock.tick(5000);
      expect(orchestrator.collectMetrics.callCount).toBe(1);

      clock.tick(5000);
      expect(orchestrator.collectMetrics.callCount).toBe(2);
    });

    it('should stop monitoring on request', async () => {
      await orchestrator.monitorSwarm();
      orchestrator.stopMonitoring();

      expect(orchestrator.monitoringInterval).toBeNull();
    });

    it('should handle monitoring errors gracefully', async () => {
      orchestrator.collectMetrics.rejects(new Error('Metrics error'));

      // Should not throw
      await expect(orchestrator.monitorSwarm()).resolves.not.toThrow();
    });
  });

  describe('Health monitoring', () => {
    beforeEach(async () => {
      sinon.stub(orchestrator.spec, 'show').resolves();
      await orchestrator.deployAgent('quality-assurance');
      await orchestrator.deployAgent('security-scanner');
    });

    it('should check agent health periodically', async () => {
      sinon.stub(orchestrator, 'checkAgentHealth').resolves();

      await orchestrator.startHealthMonitoring();

      clock.tick(orchestrator.swarmConfig.healthCheckInterval);

      expect(orchestrator.checkAgentHealth.callCount).toBe(2); // One for each agent
    });

    it('should restart unhealthy agents', async () => {
      const unhealthyAgent = Array.from(orchestrator.agents.values())[0];
      unhealthyAgent.healthy = false;

      sinon.stub(orchestrator, 'restartAgent').resolves();

      await orchestrator.performHealthCheck();

      expect(orchestrator.restartAgent.calledWith(unhealthyAgent.id)).toBe(true);
    });

    it('should emit health-check event', async () => {
      const eventSpy = sinon.spy();
      orchestrator.on('health-check', eventSpy);

      await orchestrator.performHealthCheck();

      expect(eventSpy.called).toBe(true);
    });

    it('should track health metrics', async () => {
      await orchestrator.performHealthCheck();

      expect(orchestrator.swarmMetrics.lastHealthCheck).toBeInstanceOf(Date);
    });
  });

  describe('Auto-scaling', () => {
    beforeEach(() => {
      sinon.stub(orchestrator.spec, 'show').resolves();
      sinon.stub(orchestrator, 'deployAgent').resolves();
      orchestrator.swarmConfig.autoScale = true;
    });

    it('should scale up when utilization is high', async () => {
      orchestrator.swarmMetrics.agentUtilization = 90; // 90% utilization

      await orchestrator.checkAutoScale();

      expect(orchestrator.deployAgent.called).toBe(true);
    });

    it('should not exceed max agents limit', async () => {
      // Deploy max agents
      for (let i = 0; i < orchestrator.swarmConfig.maxAgents; i++) {
        orchestrator.agents.set(`agent-${i}`, { id: `agent-${i}` });
      }

      orchestrator.swarmMetrics.agentUtilization = 95;

      await orchestrator.checkAutoScale();

      expect(orchestrator.deployAgent.called).toBe(false);
    });

    it('should scale down when utilization is low', async () => {
      // Deploy some agents
      for (let i = 0; i < 5; i++) {
        orchestrator.agents.set(`agent-${i}`, {
          id: `agent-${i}`,
          status: 'idle',
          idleTime: 600000 // 10 minutes idle
        });
      }

      orchestrator.swarmMetrics.agentUtilization = 20; // 20% utilization

      sinon.stub(orchestrator, 'terminateAgent').resolves();

      await orchestrator.checkAutoScale();

      expect(orchestrator.terminateAgent.called).toBe(true);
    });

    it('should emit scaling event', async () => {
      const eventSpy = sinon.spy();
      orchestrator.on('swarm-scaling', eventSpy);

      orchestrator.swarmMetrics.agentUtilization = 90;
      await orchestrator.checkAutoScale();

      expect(eventSpy.called).toBe(true);
    });
  });

  describe('WebSocket communication', () => {
    it('should initialize secure WebSocket server', async () => {
      await orchestrator.initializeSwarmInfrastructure();

      expect(orchestrator.wsServer).toBeDefined();
      expect(orchestrator.wsServer.port).toBe(8080);
    });

    it('should handle agent connections', async () => {
      await orchestrator.initializeSwarmInfrastructure();

      const mockConnection = new EventEmitter();
      mockConnection.id = 'test-connection';
      mockConnection.send = sinon.stub();

      orchestrator.handleAgentConnection(mockConnection);

      expect(orchestrator.connections.has(mockConnection.id)).toBe(true);
    });

    it('should broadcast messages to all agents', async () => {
      await orchestrator.initializeSwarmInfrastructure();

      const connections = [];
      for (let i = 0; i < 3; i++) {
        const conn = new EventEmitter();
        conn.id = `conn-${i}`;
        conn.send = sinon.stub();
        conn.readyState = WebSocket.OPEN;
        orchestrator.connections.set(conn.id, conn);
        connections.push(conn);
      }

      await orchestrator.broadcastToAgents({ type: 'test-message' });

      connections.forEach(conn => {
        expect(conn.send.called).toBe(true);
      });
    });

    it('should handle connection errors', async () => {
      await orchestrator.initializeSwarmInfrastructure();

      const mockConnection = new EventEmitter();
      mockConnection.id = 'test-connection';
      mockConnection.send = sinon.stub();

      orchestrator.handleAgentConnection(mockConnection);
      mockConnection.emit('error', new Error('Connection error'));

      expect(orchestrator.connections.has(mockConnection.id)).toBe(false);
    });
  });

  describe('Metrics and reporting', () => {
    beforeEach(async () => {
      sinon.stub(orchestrator.spec, 'show').resolves();

      // Deploy some agents and complete some tasks
      for (let i = 0; i < 3; i++) {
        await orchestrator.deployAgent('quality-assurance');
      }
    });

    it('should calculate agent utilization', () => {
      // Set agent statuses
      const agents = Array.from(orchestrator.agents.values());
      agents[0].status = 'busy';
      agents[1].status = 'busy';
      agents[2].status = 'idle';

      const utilization = orchestrator.calculateAgentUtilization();

      expect(utilization).toBeCloseTo(66.67, 1);
    });

    it('should track average completion time', async () => {
      orchestrator.swarmMetrics.tasksCompleted = 3;
      orchestrator.swarmMetrics.totalCompletionTime = 15000; // 15 seconds total

      orchestrator.updateAverageCompletionTime();

      expect(orchestrator.swarmMetrics.averageCompletionTime).toBe(5000);
    });

    it('should calculate cost savings', () => {
      orchestrator.swarmMetrics.tasksCompleted = 100;
      orchestrator.swarmMetrics.averageCompletionTime = 3000; // 3 seconds per task

      const savings = orchestrator.calculateCostSavings();

      expect(savings).toBeGreaterThan(0);
    });

    it('should generate performance report', async () => {
      const report = await orchestrator.generatePerformanceReport();

      expect(report).toBeDefined();
      expect(report.totalAgents).toBe(3);
      expect(report.tasksCompleted).toBeDefined();
      expect(report.averageCompletionTime).toBeDefined();
      expect(report.utilization).toBeDefined();
    });
  });

  describe('Error handling and recovery', () => {
    beforeEach(() => {
      sinon.stub(orchestrator.spec, 'show').resolves();
      sinon.stub(orchestrator.spec, 'offerHelp').resolves();
    });

    it('should handle agent crashes', async () => {
      const agent = await orchestrator.deployAgent('quality-assurance');

      sinon.stub(orchestrator, 'restartAgent').resolves();

      await orchestrator.handleAgentCrash(agent.id);

      expect(orchestrator.restartAgent.calledWith(agent.id)).toBe(true);
    });

    it('should retry failed tasks', async () => {
      const task = {
        id: 'test-task',
        type: 'test',
        retryCount: 0,
        status: 'failed'
      };

      orchestrator.tasks.set(task.id, task);

      await orchestrator.retryFailedTask(task.id);

      expect(orchestrator.tasks.get(task.id).retryCount).toBe(1);
      expect(orchestrator.tasks.get(task.id).status).toBe('pending');
    });

    it('should not retry beyond max attempts', async () => {
      const task = {
        id: 'test-task',
        type: 'test',
        retryCount: orchestrator.swarmConfig.retryAttempts,
        status: 'failed'
      };

      orchestrator.tasks.set(task.id, task);

      await orchestrator.retryFailedTask(task.id);

      expect(orchestrator.tasks.get(task.id).status).toBe('failed-permanent');
    });

    it('should gracefully shutdown swarm', async () => {
      await orchestrator.deployAgent('quality-assurance');
      await orchestrator.deployAgent('security-scanner');

      sinon.stub(orchestrator, 'terminateAgent').resolves();

      await orchestrator.shutdownSwarm();

      expect(orchestrator.terminateAgent.callCount).toBe(2);
      expect(orchestrator.agents.size).toBe(0);
    });
  });
});

export default SwarmOrchestrator;