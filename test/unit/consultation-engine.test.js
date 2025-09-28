import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import sinon from 'sinon';
import inquirer from 'inquirer';
import { ConsultationEngine } from '../../src/consultation/engine.js';

describe('ConsultationEngine', () => {
  let engine;
  let inquirerStub;
  let consoleStub;
  let fsStub;

  beforeEach(() => {
    engine = new ConsultationEngine();
    inquirerStub = sinon.stub(inquirer, 'prompt');
    consoleStub = {
      log: sinon.stub(console, 'log'),
      error: sinon.stub(console, 'error')
    };
    fsStub = {};
  });

  afterEach(() => {
    inquirerStub.restore();
    consoleStub.log.restore();
    consoleStub.error.restore();
    Object.values(fsStub).forEach(stub => stub?.restore?.());
  });

  describe('Constructor', () => {
    it('should initialize with correct properties', () => {
      expect(engine.spec).toBeDefined();
      expect(engine.multimedia).toBeDefined();
      expect(engine.conversationHistory).toEqual([]);
      expect(engine.projectContext).toEqual({});
      expect(engine.userPreferences).toEqual({});
      expect(engine.currentSession).toBeNull();
    });

    it('should have knowledge base initialized', () => {
      expect(engine.knowledgeBase).toBeDefined();
      expect(engine.knowledgeBase.projectTypes).toBeDefined();
      expect(engine.knowledgeBase.questionFlows).toBeDefined();
    });

    it('should have all project types defined', () => {
      const expectedTypes = ['web-app', 'mobile-app', 'api-service', 'cli-tool', 'data-pipeline'];
      expectedTypes.forEach(type => {
        expect(engine.knowledgeBase.projectTypes[type]).toBeDefined();
        expect(engine.knowledgeBase.projectTypes[type].questions).toBeInstanceOf(Array);
        expect(engine.knowledgeBase.projectTypes[type].complexity).toBeDefined();
      });
    });
  });

  describe('startGuidedSetup()', () => {
    beforeEach(() => {
      sinon.stub(engine.spec, 'greet').resolves();
      sinon.stub(engine, 'discoverProjectVision').resolves();
      sinon.stub(engine, 'exploreRequirements').resolves();
      sinon.stub(engine, 'reviewAndRefine').resolves();
      sinon.stub(engine, 'generateSpecification').resolves();
      sinon.stub(engine, 'setupAdvancedFeatures').resolves();
    });

    it('should complete all phases successfully', async () => {
      await engine.startGuidedSetup();

      expect(engine.spec.greet.called).toBe(true);
      expect(engine.discoverProjectVision.called).toBe(true);
      expect(engine.exploreRequirements.called).toBe(true);
      expect(engine.reviewAndRefine.called).toBe(true);
      expect(engine.generateSpecification.called).toBe(true);
    });

    it('should create session with correct structure', async () => {
      const options = { cloud: true, swarm: true };
      await engine.startGuidedSetup(options);

      expect(engine.currentSession).toBeDefined();
      expect(engine.currentSession.id).toBeDefined();
      expect(engine.currentSession.startTime).toBeInstanceOf(Date);
      expect(engine.currentSession.options).toEqual(options);
      expect(engine.currentSession.responses).toEqual({});
      expect(engine.currentSession.decisions).toBeInstanceOf(Array);
    });

    it('should setup advanced features when requested', async () => {
      await engine.startGuidedSetup({ cloud: true, swarm: true });
      expect(engine.setupAdvancedFeatures.called).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      engine.discoverProjectVision.rejects(new Error('Test error'));
      sinon.stub(engine.spec, 'offerHelp').resolves();

      await engine.startGuidedSetup();

      expect(engine.spec.offerHelp.called).toBe(true);
      expect(consoleStub.error.called).toBe(true);
    });
  });

  describe('discoverProjectVision()', () => {
    beforeEach(() => {
      sinon.stub(engine.spec, 'show').resolves();
      sinon.stub(engine.spec, 'askQuestion').resolves('Test project description');
      sinon.stub(engine.spec, 'celebrate').resolves();
      sinon.stub(engine, 'recordDecision').resolves();
    });

    it('should gather project vision information', async () => {
      engine.spec.askQuestion
        .onFirstCall().resolves('Building a test application')
        .onSecondCall().resolves('web-app')
        .onThirdCall().resolves('mvp');

      await engine.discoverProjectVision();

      expect(engine.projectContext.vision).toBe('Building a test application');
      expect(engine.projectContext.type).toBe('web-app');
      expect(engine.projectContext.timeline).toBe('mvp');
    });

    it('should provide guidance when user needs help with project type', async () => {
      engine.spec.askQuestion
        .onFirstCall().resolves('Test vision')
        .onSecondCall().resolves('help');

      sinon.stub(engine, 'providProjectTypeGuidance').resolves();

      await engine.discoverProjectVision();

      expect(engine.providProjectTypeGuidance.called).toBe(true);
    });

    it('should validate vision input length', async () => {
      const askQuestionCall = engine.spec.askQuestion.getCall(0);

      // Test that validation is properly set up
      await engine.discoverProjectVision();

      // Check that validation was included in the first question
      const firstCallArgs = engine.spec.askQuestion.firstCall.args;
      expect(firstCallArgs[1]).toBeDefined();
      expect(firstCallArgs[1].validate).toBeDefined();
    });
  });

  describe('exploreRequirements()', () => {
    beforeEach(() => {
      engine.projectContext.type = 'web-app';
      sinon.stub(engine.spec, 'show').resolves();
      sinon.stub(engine.spec, 'askQuestion').resolves('small');
      sinon.stub(engine, 'askIntelligentQuestion').resolves({ value: 'react' });
      sinon.stub(engine, 'recordDecision').resolves();
    });

    it('should gather technical requirements', async () => {
      await engine.exploreRequirements();

      expect(engine.projectContext.teamSize).toBeDefined();
      expect(engine.projectContext.experienceLevel).toBeDefined();
    });

    it('should ask project-specific questions', async () => {
      const projectConfig = engine.knowledgeBase.projectTypes['web-app'];
      await engine.exploreRequirements();

      // Verify that questions were asked for each required topic
      expect(engine.askIntelligentQuestion.callCount).toBeGreaterThan(0);
    });

    it('should handle follow-up questions', async () => {
      engine.askIntelligentQuestion.resolves({
        value: 'help',
        followUp: 'framework-recommendation'
      });

      sinon.stub(engine, 'handleFollowUp').resolves();

      await engine.exploreRequirements();

      expect(engine.handleFollowUp.called).toBe(true);
    });
  });

  describe('reviewAndRefine()', () => {
    beforeEach(() => {
      engine.projectContext = {
        vision: 'Test project',
        type: 'web-app',
        timeline: 'mvp',
        teamSize: 'small'
      };

      sinon.stub(engine.spec, 'show').resolves();
      sinon.stub(engine.spec, 'askQuestion').resolves(true);
      sinon.stub(engine.spec, 'celebrate').resolves();
      sinon.stub(engine, 'recordDecision').resolves();
    });

    it('should display project summary', async () => {
      await engine.reviewAndRefine();

      const summaryLogged = consoleStub.log.getCalls().some(call =>
        call.args[0]?.includes?.('Project Summary')
      );

      expect(summaryLogged).toBe(true);
    });

    it('should allow refinement when user is not happy', async () => {
      engine.spec.askQuestion.resolves(false);
      sinon.stub(engine, 'refineChoices').resolves();

      await engine.reviewAndRefine();

      expect(engine.refineChoices.called).toBe(true);
      expect(engine.spec.celebrate.called).toBe(false);
    });

    it('should celebrate when user approves', async () => {
      engine.spec.askQuestion.resolves(true);

      await engine.reviewAndRefine();

      expect(engine.spec.celebrate.called).toBe(true);
    });
  });

  describe('generateSpecification()', () => {
    beforeEach(() => {
      engine.projectContext = {
        vision: 'Test project for development',
        type: 'web-app',
        timeline: 'mvp',
        teamSize: 'small',
        experienceLevel: 'intermediate'
      };

      sinon.stub(engine.spec, 'work').resolves();
      sinon.stub(engine.spec, 'askQuestion').resolves(false);
      sinon.stub(engine, 'recordDecision').resolves();
    });

    it('should generate correct specification structure', async () => {
      const spec = await engine.generateSpecification();

      expect(spec).toBeDefined();
      expect(spec.metadata).toBeDefined();
      expect(spec.vision).toBeDefined();
      expect(spec.technical).toBeDefined();
      expect(spec.implementation).toBeDefined();
      expect(spec.resources).toBeDefined();
    });

    it('should include correct metadata', async () => {
      const spec = await engine.generateSpecification();

      expect(spec.metadata.name).toBeDefined();
      expect(spec.metadata.version).toBe('1.0.0');
      expect(spec.metadata.created).toBeInstanceOf(Date);
      expect(spec.metadata.type).toBe('web-app');
      expect(spec.metadata.timeline).toBe('mvp');
    });

    it('should generate implementation phases', async () => {
      const spec = await engine.generateSpecification();

      expect(spec.implementation.phases).toBeInstanceOf(Array);
      expect(spec.implementation.phases.length).toBeGreaterThan(0);

      spec.implementation.phases.forEach(phase => {
        expect(phase.name).toBeDefined();
        expect(phase.description).toBeDefined();
        expect(phase.duration).toBeDefined();
      });
    });

    it('should recommend cloud for appropriate projects', async () => {
      engine.projectContext.type = 'web-app';
      const spec = await engine.generateSpecification();

      expect(spec.resources.cloud_integration).toBe(true);
    });

    it('should recommend agents for complex projects', async () => {
      engine.projectContext.timeline = 'full';
      const spec = await engine.generateSpecification();

      expect(spec.resources.agent_swarm).toBe(true);
    });

    it('should present specification when requested', async () => {
      engine.spec.askQuestion.resolves(true);
      sinon.stub(engine, 'presentSpecification').resolves();

      await engine.generateSpecification();

      expect(engine.presentSpecification.called).toBe(true);
    });
  });

  describe('Framework recommendation', () => {
    beforeEach(() => {
      sinon.stub(engine.spec, 'show').resolves();
      sinon.stub(engine.spec, 'askQuestion').resolves(['performance', 'community']);
    });

    it('should generate framework recommendation based on priorities', async () => {
      const recommendation = await engine.provideFrameworkRecommendation();

      expect(recommendation).toBeDefined();
      expect(recommendation.name).toBeDefined();
      expect(recommendation.explanation).toBeDefined();
    });

    it('should calculate correct scores for frameworks', () => {
      const priorities = ['performance', 'learning-curve'];
      const recommendation = engine.generateFrameworkRecommendation(priorities);

      expect(recommendation).toBeDefined();
      expect(['React', 'Vue.js', 'Svelte']).toContain(recommendation.name);
    });

    it('should offer demo when available', async () => {
      engine.spec.askQuestion
        .onFirstCall().resolves(['performance'])
        .onSecondCall().resolves(true);

      sinon.stub(engine.multimedia, 'generateDemo').resolves();

      await engine.provideFrameworkRecommendation();

      expect(engine.multimedia.generateDemo.called).toBe(true);
    });
  });

  describe('Project analysis', () => {
    beforeEach(() => {
      sinon.stub(engine.spec, 'askQuestion').resolves(process.cwd());
      sinon.stub(engine.spec, 'show').resolves();
      sinon.stub(engine.spec, 'work').resolves();
    });

    it('should analyze existing Node.js project', async () => {
      fsStub.pathExists = sinon.stub().resolves(true);
      fsStub.readFile = sinon.stub().resolves(JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        dependencies: { express: '^4.0.0' }
      }));

      await engine.analyzeProject('/test/path');

      expect(engine.spec.show.calledWith('happy')).toBe(true);
    });

    it('should handle non-Node.js projects', async () => {
      fsStub.pathExists = sinon.stub().resolves(false);

      await engine.analyzeProject('/test/path');

      expect(engine.spec.show.calledWith('thinking')).toBe(true);
    });

    it('should reject oversized package.json files', async () => {
      fsStub.pathExists = sinon.stub().resolves(true);
      fsStub.readFile = sinon.stub().resolves('x'.repeat(1024 * 1024 + 1));

      await engine.analyzeProject('/test/path');

      expect(engine.spec.show.calledWith('concerned')).toBe(true);
    });

    it('should offer to create specification for existing project', async () => {
      fsStub.pathExists = sinon.stub().resolves(true);
      fsStub.readFile = sinon.stub().resolves('{"name": "test"}');

      engine.spec.askQuestion
        .onSecondCall().resolves(true);

      sinon.stub(engine, 'startGuidedSetup').resolves();

      await engine.analyzeProject('/test/path');

      expect(engine.startGuidedSetup.called).toBe(true);
    });
  });

  describe('Chat mode', () => {
    beforeEach(() => {
      sinon.stub(engine.spec, 'show').resolves();
      sinon.stub(engine.spec, 'think').resolves();
    });

    it('should handle chat questions', async () => {
      engine.spec.askQuestion = sinon.stub()
        .onFirstCall().resolves('What is a spec?')
        .onSecondCall().resolves('exit');

      await engine.startChatMode();

      expect(engine.spec.show.called).toBe(true);
    });

    it('should provide keyword-based responses', async () => {
      sinon.stub(engine, 'provideChatResponse').resolves();

      await engine.provideChatResponse('Tell me about cloud');

      expect(engine.spec.think.called).toBe(true);
      expect(engine.spec.show.called).toBe(true);
    });

    it('should handle unknown questions gracefully', async () => {
      await engine.provideChatResponse('Random unknown question');

      const thinkingCall = engine.spec.show.getCalls().find(call =>
        call.args[0] === 'thinking'
      );

      expect(thinkingCall).toBeDefined();
    });
  });

  describe('Decision recording', () => {
    it('should record decisions with correct structure', async () => {
      engine.currentSession = {
        decisions: []
      };

      const phase = 'test-phase';
      const data = { test: 'data' };

      await engine.recordDecision(phase, data);

      expect(engine.currentSession.decisions.length).toBe(1);
      expect(engine.currentSession.decisions[0].phase).toBe(phase);
      expect(engine.currentSession.decisions[0].timestamp).toBeInstanceOf(Date);
      expect(engine.currentSession.decisions[0].data).toEqual(data);
    });
  });

  describe('Utility methods', () => {
    beforeEach(() => {
      engine.projectContext = {
        vision: 'Build awesome web application platform',
        type: 'web-app',
        timeline: 'mvp'
      };
    });

    it('should generate project name from vision', () => {
      const name = engine.generateProjectName();
      expect(name).toBe('build-awesome-application-project');
    });

    it('should extract goals correctly', () => {
      const goals = engine.extractGoals();
      expect(goals).toBeInstanceOf(Array);
      expect(goals.length).toBeGreaterThan(0);
    });

    it('should generate success metrics', () => {
      const metrics = engine.generateSuccessMetrics();
      expect(metrics.functionality).toBeDefined();
      expect(metrics.performance).toBeDefined();
      expect(metrics.user_satisfaction).toBeDefined();
      expect(metrics.maintenance).toBeDefined();
    });

    it('should correctly determine cloud recommendation', () => {
      engine.projectContext.type = 'web-app';
      expect(engine.shouldRecommendCloud()).toBe(true);

      engine.projectContext.type = 'cli-tool';
      expect(engine.shouldRecommendCloud()).toBe(false);
    });

    it('should correctly determine agent recommendation', () => {
      engine.projectContext.timeline = 'mvp';
      expect(engine.shouldRecommendAgents()).toBe(true);

      engine.projectContext.timeline = 'prototype';
      expect(engine.shouldRecommendAgents()).toBe(false);
    });
  });
});

export default ConsultationEngine;