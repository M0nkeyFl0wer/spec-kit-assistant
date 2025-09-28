import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import sinon from 'sinon';
import request from 'supertest';
import WebSocket from 'ws';
import { ConsultationEngine } from '../../src/consultation/engine.js';
import { SwarmOrchestrator } from '../../src/swarm/orchestrator.js';
import { SpecCharacter } from '../../src/character/spec.js';

describe('System Integration Tests', () => {
  let consultationEngine;
  let swarmOrchestrator;
  let specCharacter;
  let app;
  let server;

  beforeAll(async () => {
    // Initialize system components
    consultationEngine = new ConsultationEngine();
    swarmOrchestrator = new SwarmOrchestrator();
    specCharacter = new SpecCharacter();

    // Set up integrations
    await specCharacter.integrateWithConsultation(consultationEngine);
    await specCharacter.integrateWithSwarm(swarmOrchestrator);

    // Start mock server
    const express = require('express');
    app = express();
    app.use(express.json());

    // Mock endpoints
    app.get('/health', (req, res) => res.json({ status: 'ok' }));
    app.post('/api/consultation', async (req, res) => {
      const result = await consultationEngine.startGuidedSetup(req.body);
      res.json(result);
    });
    app.post('/api/swarm/deploy', async (req, res) => {
      const result = await swarmOrchestrator.deploySwarm(req.body.scale);
      res.json({ success: true, agents: result });
    });

    server = app.listen(3001);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('End-to-End Consultation Flow', () => {
    it('should complete full consultation workflow', async () => {
      // Mock user inputs
      sinon.stub(consultationEngine.spec, 'askQuestion')
        .onCall(0).resolves('Building a web application')
        .onCall(1).resolves('web-app')
        .onCall(2).resolves('mvp')
        .onCall(3).resolves('small')
        .onCall(4).resolves('intermediate')
        .onCall(5).resolves(true); // Approve specification

      const spec = await consultationEngine.startGuidedSetup();

      expect(spec).toBeDefined();
      expect(spec.metadata).toBeDefined();
      expect(spec.metadata.type).toBe('web-app');
      expect(spec.vision).toBeDefined();
      expect(spec.technical).toBeDefined();
    });

    it('should handle consultation with swarm integration', async () => {
      const deployStub = sinon.stub(swarmOrchestrator, 'deploySwarm').resolves();

      await consultationEngine.startGuidedSetup({
        cloud: true,
        swarm: true
      });

      expect(consultationEngine.currentSession).toBeDefined();
      expect(consultationEngine.currentSession.options.swarm).toBe(true);

      deployStub.restore();
    });

    it('should recover from consultation errors', async () => {
      sinon.stub(consultationEngine.spec, 'askQuestion').rejects(new Error('User canceled'));
      sinon.stub(consultationEngine.spec, 'offerHelp').resolves();

      await consultationEngine.startGuidedSetup();

      expect(consultationEngine.spec.offerHelp.called).toBe(true);
    });
  });

  describe('Swarm Orchestration Integration', () => {
    it('should deploy and coordinate multiple agents', async () => {
      const agents = await swarmOrchestrator.deploySwarm(3);

      expect(swarmOrchestrator.agents.size).toBe(3);

      // Assign tasks to agents
      const tasks = [];
      for (let i = 0; i < 5; i++) {
        tasks.push(
          swarmOrchestrator.assignTask({
            type: 'test-task',
            priority: 'normal',
            payload: { index: i }
          })
        );
      }

      await Promise.all(tasks);

      expect(swarmOrchestrator.tasks.size).toBeGreaterThanOrEqual(5);
    });

    it('should handle agent failures and recovery', async () => {
      await swarmOrchestrator.deployAgent('quality-assurance');
      const agent = Array.from(swarmOrchestrator.agents.values())[0];

      // Simulate agent failure
      agent.status = 'failed';
      agent.healthy = false;

      await swarmOrchestrator.performHealthCheck();

      // Agent should be restarted
      const recoveredAgent = swarmOrchestrator.agents.get(agent.id);
      expect(recoveredAgent.status).toBe('active');
    });

    it('should auto-scale based on load', async () => {
      await swarmOrchestrator.deploySwarm(2);
      const initialCount = swarmOrchestrator.agents.size;

      // Simulate high load
      swarmOrchestrator.swarmMetrics.agentUtilization = 90;

      await swarmOrchestrator.checkAutoScale();

      expect(swarmOrchestrator.agents.size).toBeGreaterThan(initialCount);
    });
  });

  describe('Character Integration', () => {
    it('should coordinate between character and consultation', async () => {
      const showStub = sinon.stub(specCharacter, 'show').resolves();
      const thinkStub = sinon.stub(specCharacter, 'think').resolves();

      await consultationEngine.discoverProjectVision();

      expect(showStub.called).toBe(true);
      expect(thinkStub.called).toBe(true);

      showStub.restore();
      thinkStub.restore();
    });

    it('should trigger swarm through character interaction', async () => {
      const deployStub = sinon.stub(swarmOrchestrator, 'deploySwarm').resolves();

      const result = await specCharacter.triggerAutomation({ task: 'build' });

      expect(result.action).toBe('automate');
      expect(result.context.task).toBe('build');

      deployStub.restore();
    });
  });

  describe('API Integration', () => {
    it('should handle consultation API requests', async () => {
      const response = await request(app)
        .post('/api/consultation')
        .send({
          projectName: 'test-project',
          type: 'web-app'
        })
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should handle swarm deployment API requests', async () => {
      const response = await request(app)
        .post('/api/swarm/deploy')
        .send({ scale: 3 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should validate API input', async () => {
      await request(app)
        .post('/api/swarm/deploy')
        .send({ scale: 'invalid' })
        .expect(400);
    });

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests
      const requests = [];
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app).get('/health')
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);

      expect(rateLimited).toBe(true);
    });
  });

  describe('WebSocket Integration', () => {
    let wsServer;
    let wsClient;

    beforeEach(async () => {
      wsServer = await swarmOrchestrator.initializeSwarmInfrastructure();
    });

    afterEach(() => {
      if (wsClient) wsClient.close();
      if (wsServer) wsServer.close();
    });

    it('should establish WebSocket connection', (done) => {
      wsClient = new WebSocket('ws://localhost:8080');

      wsClient.on('open', () => {
        expect(wsClient.readyState).toBe(WebSocket.OPEN);
        done();
      });
    });

    it('should handle bidirectional communication', (done) => {
      wsClient = new WebSocket('ws://localhost:8080');

      wsClient.on('open', () => {
        wsClient.send(JSON.stringify({
          type: 'task-request',
          payload: { task: 'test' }
        }));
      });

      wsClient.on('message', (data) => {
        const message = JSON.parse(data);
        expect(message.type).toBeDefined();
        done();
      });
    });

    it('should broadcast to all connected agents', async () => {
      const clients = [];
      const messagePromises = [];

      // Connect multiple clients
      for (let i = 0; i < 3; i++) {
        const client = new WebSocket('ws://localhost:8080');
        clients.push(client);

        messagePromises.push(new Promise(resolve => {
          client.on('message', resolve);
        }));
      }

      // Wait for connections
      await new Promise(resolve => setTimeout(resolve, 100));

      // Broadcast message
      await swarmOrchestrator.broadcastToAgents({
        type: 'broadcast-test'
      });

      const messages = await Promise.all(messagePromises);
      expect(messages.length).toBe(3);

      clients.forEach(c => c.close());
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent consultations', async () => {
      const consultations = [];

      for (let i = 0; i < 10; i++) {
        consultations.push(
          consultationEngine.generateSpecification()
        );
      }

      const start = Date.now();
      await Promise.all(consultations);
      const duration = Date.now() - start;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000);
    });

    it('should efficiently manage large swarm', async () => {
      const start = Date.now();

      await swarmOrchestrator.deploySwarm(10);

      const deployTime = Date.now() - start;
      expect(deployTime).toBeLessThan(2000);

      // Verify all agents are functional
      const agents = Array.from(swarmOrchestrator.agents.values());
      agents.forEach(agent => {
        expect(agent.status).toBe('active');
      });
    });

    it('should maintain responsiveness under load', async () => {
      // Generate load
      const loadPromises = [];
      for (let i = 0; i < 50; i++) {
        loadPromises.push(
          swarmOrchestrator.assignTask({
            type: 'load-test',
            payload: { index: i }
          })
        );
      }

      // Check system responsiveness
      const healthStart = Date.now();
      await request(app).get('/health').expect(200);
      const healthDuration = Date.now() - healthStart;

      expect(healthDuration).toBeLessThan(100); // Should respond quickly

      await Promise.all(loadPromises);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consultation session consistency', async () => {
      await consultationEngine.startGuidedSetup();

      const session1 = consultationEngine.currentSession;

      // Make changes
      await consultationEngine.recordDecision('test', { data: 'test' });

      const session2 = consultationEngine.currentSession;

      expect(session1.id).toBe(session2.id);
      expect(session2.decisions.length).toBeGreaterThan(0);
    });

    it('should maintain swarm state consistency', async () => {
      await swarmOrchestrator.deploySwarm(3);

      const initialState = {
        agents: swarmOrchestrator.agents.size,
        tasks: swarmOrchestrator.tasks.size
      };

      // Perform operations
      await swarmOrchestrator.assignTask({ type: 'test' });

      const finalState = {
        agents: swarmOrchestrator.agents.size,
        tasks: swarmOrchestrator.tasks.size
      };

      expect(finalState.agents).toBe(initialState.agents);
      expect(finalState.tasks).toBeGreaterThan(initialState.tasks);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from consultation failures', async () => {
      sinon.stub(consultationEngine, 'generateSpecification')
        .onFirstCall().rejects(new Error('Generation failed'))
        .onSecondCall().resolves({ success: true });

      let error;
      let result;

      try {
        result = await consultationEngine.generateSpecification();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();

      // Retry
      result = await consultationEngine.generateSpecification();
      expect(result.success).toBe(true);
    });

    it('should recover from swarm failures', async () => {
      sinon.stub(swarmOrchestrator, 'deployAgent')
        .onFirstCall().rejects(new Error('Deploy failed'))
        .onSecondCall().resolves({ id: 'agent-1' });

      let deployed = false;

      for (let i = 0; i < 2; i++) {
        try {
          await swarmOrchestrator.deployAgent('test-agent');
          deployed = true;
          break;
        } catch (e) {
          // Retry on failure
        }
      }

      expect(deployed).toBe(true);
    });
  });

  describe('Security Integration', () => {
    it('should enforce authentication on API endpoints', async () => {
      // Protected endpoint without auth
      await request(app)
        .post('/api/admin/config')
        .expect(401);
    });

    it('should validate and sanitize all inputs', async () => {
      const maliciousInput = {
        projectName: '<script>alert("XSS")</script>',
        type: '../../etc/passwd'
      };

      const response = await request(app)
        .post('/api/consultation')
        .send(maliciousInput)
        .expect(400);

      expect(response.body.error).toContain('Invalid input');
    });

    it('should handle WebSocket security', (done) => {
      const maliciousClient = new WebSocket('ws://localhost:8080', {
        origin: 'http://evil.com'
      });

      maliciousClient.on('error', (error) => {
        expect(error).toBeDefined();
        done();
      });

      maliciousClient.on('open', () => {
        // Should not connect from unauthorized origin
        expect(false).toBe(true);
        done();
      });
    });
  });
});