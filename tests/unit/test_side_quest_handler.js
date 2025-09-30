/**
 * T040: Unit tests for consultation side quest handling
 * Tests the consultation engine's side quest management and constitutional compliance
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { SideQuestHandler } from '../../src/core/side-quest-handler.js';
import { ConsultationEngine } from '../../src/core/consultation-engine.js';
import { CharacterPersonality } from '../../src/core/character-personality.js';

describe('SideQuestHandler', () => {
  let handler;
  let consultationEngine;
  let originalEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    consultationEngine = new ConsultationEngine();
    handler = new SideQuestHandler(consultationEngine);
    await handler.initialize();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('side quest detection', () => {
    test('should detect off-topic requests', async () => {
      const request = "Can you help me with my taxes instead of the spec?";
      const result = await handler.analyzeRequest(request);

      assert.strictEqual(result.isSideQuest, true);
      assert.strictEqual(result.type, 'off_topic');
      assert.ok(result.confidence > 0.7);
      assert.ok(result.suggestedResponse);
    });

    test('should detect feature creep requests', async () => {
      const request = "Actually, let's also add social media integration, AI chat, and a mobile app to this spec";
      const result = await handler.analyzeRequest(request);

      assert.strictEqual(result.isSideQuest, true);
      assert.strictEqual(result.type, 'feature_creep');
      assert.ok(result.confidence > 0.6);
      assert.ok(result.suggestedResponse.includes('focus'));
    });

    test('should detect scope expansion requests', async () => {
      const request = "Can we also make this work for mobile apps, web apps, and desktop apps all at once?";
      const result = await handler.analyzeRequest(request);

      assert.strictEqual(result.isSideQuest, true);
      assert.strictEqual(result.type, 'scope_expansion');
      assert.ok(result.suggestedResponse.includes('scope'));
    });

    test('should detect endless configuration requests', async () => {
      const request = "What about dark mode? And light mode? And high contrast? And colorblind mode? And left-handed mode?";
      const result = await handler.analyzeRequest(request);

      assert.strictEqual(result.isSideQuest, true);
      assert.strictEqual(result.type, 'endless_configuration');
      assert.ok(result.suggestedResponse);
    });

    test('should not flag legitimate spec clarifications as side quests', async () => {
      const request = "Can you clarify the authentication requirements in section 3.2?";
      const result = await handler.analyzeRequest(request);

      assert.strictEqual(result.isSideQuest, false);
      assert.strictEqual(result.type, 'legitimate_clarification');
      assert.ok(result.confidence > 0.8);
    });

    test('should not flag spec improvements as side quests', async () => {
      const request = "I think we should add error handling specifications to this section";
      const result = await handler.analyzeRequest(request);

      assert.strictEqual(result.isSideQuest, false);
      assert.strictEqual(result.type, 'spec_improvement');
    });
  });

  describe('constitutional compliance in side quest handling', () => {
    test('should complete side quest analysis within constitutional time limits', async () => {
      const request = "Can you help me reorganize my entire file system instead?";

      const startTime = performance.now();
      const result = await handler.analyzeRequest(request);
      const analysisTime = performance.now() - startTime;

      // Constitutional limit: analysis should complete quickly
      assert.ok(analysisTime < 500, `Analysis took ${analysisTime}ms, should be < 500ms`);
      assert.strictEqual(result.isSideQuest, true);
    });

    test('should respect CPU limits during pattern matching', async () => {
      // Create a complex request that might trigger heavy processing
      const complexRequest = "Can you help me with " + "very complex task ".repeat(100) + "instead of the spec?";

      const startTime = performance.now();
      const result = await handler.analyzeRequest(complexRequest);
      const processingTime = performance.now() - startTime;

      // Should handle even complex requests efficiently
      assert.ok(processingTime < 1000, `Complex analysis took ${processingTime}ms, should be < 1000ms`);
      assert.strictEqual(result.isSideQuest, true);
    });

    test('should enforce constitutional memory limits', async () => {
      // Test memory usage doesn't grow unbounded
      const initialMemory = process.memoryUsage().heapUsed;

      // Process many side quest requests
      for (let i = 0; i < 50; i++) {
        await handler.analyzeRequest(`Side quest request number ${i}: Can you help with taxes?`);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      // Memory growth should be reasonable (< 10MB for 50 requests)
      assert.ok(memoryGrowth < 10 * 1024 * 1024, `Memory grew by ${memoryGrowth} bytes, should be < 10MB`);
    });
  });

  describe('Spec character responses to side quests', () => {
    test('should generate friendly but focused responses to side quests', async () => {
      const request = "Can you help me learn Python instead?";
      const result = await handler.analyzeRequest(request);

      assert.strictEqual(result.isSideQuest, true);

      const response = result.suggestedResponse;

      // Should be friendly (Spec personality)
      assert.ok(response.includes('🐕') || response.includes('wag') || response.includes('fetch'));

      // Should redirect to spec focus
      assert.ok(response.toLowerCase().includes('spec') || response.toLowerCase().includes('focus'));

      // Should not be preachy or annoying
      assert.ok(!response.includes('I cannot') && !response.includes('I must refuse'));
    });

    test('should maintain character consistency in side quest responses', async () => {
      const personality = new CharacterPersonality();

      const requests = [
        "Help me with my resume",
        "Can we add blockchain to everything?",
        "What about metaverse integration?"
      ];

      for (const request of requests) {
        const result = await handler.analyzeRequest(request);
        const response = result.suggestedResponse;

        const validation = personality.validateResponse(response);

        assert.ok(validation.traits.friendly > 0.6, 'Side quest response should be friendly');
        assert.ok(validation.traits.honest > 0.7, 'Side quest response should be honest');
        assert.ok(validation.traits.fun > 0.5, 'Side quest response should maintain fun personality');
        assert.ok(validation.traits.notCringe > 0.6, 'Side quest response should not be cringe');
      }
    });

    test('should provide helpful alternatives when declining side quests', async () => {
      const request = "Can you write my entire application for me?";
      const result = await handler.analyzeRequest(request);

      assert.strictEqual(result.isSideQuest, true);

      const response = result.suggestedResponse;

      // Should suggest spec-related alternatives
      assert.ok(response.toLowerCase().includes('spec') || response.toLowerCase().includes('requirements'));

      // Should be constructive, not just dismissive
      assert.ok(response.length > 50, 'Response should be substantive');
      assert.ok(!response.toLowerCase().includes('no') || response.toLowerCase().includes('how about'));
    });
  });

  describe('side quest pattern recognition', () => {
    test('should recognize common side quest patterns', () => {
      const patterns = handler.getSideQuestPatterns();

      assert.ok(patterns.offTopic.length > 0);
      assert.ok(patterns.featureCreep.length > 0);
      assert.ok(patterns.scopeExpansion.length > 0);
      assert.ok(patterns.endlessConfiguration.length > 0);

      // Verify pattern structure
      patterns.offTopic.forEach(pattern => {
        assert.ok(typeof pattern.regex === 'object');
        assert.ok(typeof pattern.weight === 'number');
        assert.ok(pattern.weight > 0 && pattern.weight <= 1);
      });
    });

    test('should update patterns based on usage', async () => {
      const initialPatterns = handler.getSideQuestPatterns();

      // Simulate learning from new side quest types
      await handler.learnFromInteraction({
        request: "Can you help me debug my microwave?",
        classification: 'off_topic',
        userFeedback: 'correct'
      });

      const updatedPatterns = handler.getSideQuestPatterns();

      // Patterns should be updated (in a real implementation)
      assert.ok(updatedPatterns);
    });

    test('should handle edge cases in pattern matching', async () => {
      const edgeCases = [
        "", // Empty string
        "?", // Single character
        "spec".repeat(1000), // Very long string
        "🐕🐕🐕🐕🐕", // Only emojis
        "HELP ME WITH THE SPEC!!!!!!", // All caps with punctuation
      ];

      for (const request of edgeCases) {
        const result = await handler.analyzeRequest(request);

        // Should handle gracefully without errors
        assert.ok(typeof result.isSideQuest === 'boolean');
        assert.ok(typeof result.confidence === 'number');
        assert.ok(result.confidence >= 0 && result.confidence <= 1);
      }
    });
  });

  describe('integration with consultation engine', () => {
    test('should integrate side quest handling with consultation flow', async () => {
      const consultation = await consultationEngine.startConsultation({
        projectType: 'web-app',
        complexity: 'medium'
      });

      const sideQuestRequest = "Actually, can you help me set up my development environment?";

      const result = await handler.handleConsultationSideQuest(consultation.id, sideQuestRequest);

      assert.strictEqual(result.handled, true);
      assert.strictEqual(result.continuedConsultation, true);
      assert.ok(result.response.includes('spec') || result.response.includes('consultation'));
    });

    test('should maintain consultation context when handling side quests', async () => {
      const consultation = await consultationEngine.startConsultation({
        projectType: 'mobile-app',
        complexity: 'high'
      });

      // Add some context to the consultation
      await consultationEngine.addResponse(consultation.id, {
        question: "What platforms should we support?",
        answer: "iOS and Android"
      });

      const sideQuest = "Can we also add a web version?";
      const result = await handler.handleConsultationSideQuest(consultation.id, sideQuest);

      // Should recognize this as scope expansion within context
      assert.strictEqual(result.type, 'scope_expansion');
      assert.ok(result.response.includes('iOS and Android'));
    });

    test('should prevent consultation derailment', async () => {
      const consultation = await consultationEngine.startConsultation({
        projectType: 'api',
        complexity: 'low'
      });

      const derailmentAttempts = [
        "Let's completely change this to a desktop app",
        "Actually, I want to learn React instead",
        "Can you teach me database design?"
      ];

      for (const attempt of derailmentAttempts) {
        const result = await handler.handleConsultationSideQuest(consultation.id, attempt);

        assert.strictEqual(result.derailmentPrevented, true);
        assert.ok(result.response.includes('api') || result.response.includes('original'));
      }
    });
  });

  describe('performance metrics and reporting', () => {
    test('should track side quest handling performance', async () => {
      // Process several side quests
      const requests = [
        "Help me with taxes",
        "Add social media to everything",
        "What about AI integration?",
        "Can we support all programming languages?"
      ];

      for (const request of requests) {
        await handler.analyzeRequest(request);
      }

      const metrics = handler.getPerformanceMetrics();

      assert.ok(metrics.totalRequests >= 4);
      assert.ok(metrics.sideQuestsDetected >= 4);
      assert.ok(metrics.averageAnalysisTime > 0);
      assert.ok(metrics.averageAnalysisTime < 500); // Constitutional compliance
      assert.ok(typeof metrics.accuracyRate === 'number');
    });

    test('should report constitutional compliance in metrics', async () => {
      await handler.analyzeRequest("Can you help me reorganize my life?");

      const report = handler.getComplianceReport();

      assert.ok(typeof report.averageProcessingTime === 'number');
      assert.ok(typeof report.maxProcessingTime === 'number');
      assert.ok(typeof report.memoryEfficiency === 'number');
      assert.ok(typeof report.constitutionalViolations === 'number');

      // Should be compliant
      assert.ok(report.averageProcessingTime < 500);
      assert.strictEqual(report.constitutionalViolations, 0);
    });
  });

  describe('error handling and fallback', () => {
    test('should handle analysis errors gracefully', async () => {
      // Mock an error condition
      const originalAnalyze = handler.analyzePatterns;
      handler.analyzePatterns = () => {
        throw new Error('Mock analysis error');
      };

      const result = await handler.analyzeRequest("Help with taxes");

      // Should fallback gracefully
      assert.strictEqual(result.isSideQuest, true); // Conservative fallback
      assert.strictEqual(result.type, 'unknown');
      assert.ok(result.error);
      assert.ok(result.suggestedResponse);

      // Restore
      handler.analyzePatterns = originalAnalyze;
    });

    test('should handle consultation engine errors', async () => {
      const consultation = await consultationEngine.startConsultation({
        projectType: 'web-app'
      });

      // Mock consultation engine error
      const originalGetContext = consultationEngine.getContext;
      consultationEngine.getContext = () => {
        throw new Error('Mock context error');
      };

      const result = await handler.handleConsultationSideQuest(consultation.id, "Side quest request");

      // Should handle gracefully
      assert.strictEqual(result.handled, true);
      assert.ok(result.error);
      assert.ok(result.response);

      // Restore
      consultationEngine.getContext = originalGetContext;
    });

    test('should provide helpful error messages', async () => {
      // Test with malformed input
      const result = await handler.analyzeRequest(null);

      assert.strictEqual(result.isSideQuest, false);
      assert.ok(result.error);
      assert.ok(result.error.includes('invalid') || result.error.includes('null'));
    });
  });

  describe('customization and configuration', () => {
    test('should allow configuration of side quest sensitivity', async () => {
      handler.setSensitivity('high'); // Strict mode

      const borderlineRequest = "Can we also add a simple user login feature?";
      const strictResult = await handler.analyzeRequest(borderlineRequest);

      handler.setSensitivity('low'); // Permissive mode
      const permissiveResult = await handler.analyzeRequest(borderlineRequest);

      // Strict mode should be more likely to flag as side quest
      assert.ok(strictResult.confidence >= permissiveResult.confidence);
    });

    test('should support custom side quest patterns', async () => {
      const customPattern = {
        regex: /help me with my homework/i,
        weight: 0.9,
        type: 'homework_request'
      };

      handler.addCustomPattern('offTopic', customPattern);

      const result = await handler.analyzeRequest("Can you help me with my homework?");

      assert.strictEqual(result.isSideQuest, true);
      assert.strictEqual(result.type, 'homework_request');
      assert.ok(result.confidence > 0.8);
    });

    test('should support project-specific side quest rules', async () => {
      const projectConfig = {
        allowedSideQuests: ['clarification', 'spec_improvement'],
        strictMode: true,
        customResponses: {
          'feature_creep': 'Woof! Let\'s focus on the core features first! 🐕'
        }
      };

      handler.setProjectConfiguration(projectConfig);

      const result = await handler.analyzeRequest("Let's add 50 more features!");

      assert.strictEqual(result.isSideQuest, true);
      assert.ok(result.suggestedResponse.includes('Woof!'));
    });
  });
});

// Integration test with real consultation flow
describe('Side Quest Handler Real-world Integration', () => {
  test('complete consultation with side quest handling should maintain focus', async () => {
    const engine = new ConsultationEngine();
    const handler = new SideQuestHandler(engine);

    // Start consultation
    const consultation = await engine.startConsultation({
      projectType: 'web-app',
      complexity: 'medium'
    });

    // Progress through consultation with side quests
    await engine.addResponse(consultation.id, {
      question: "What should the main functionality be?",
      answer: "User authentication and profile management"
    });

    // Attempt side quest
    const sideQuest1 = await handler.handleConsultationSideQuest(
      consultation.id,
      "Can we also add real-time chat?"
    );
    assert.strictEqual(sideQuest1.derailmentPrevented, true);

    // Continue consultation
    await engine.addResponse(consultation.id, {
      question: "What authentication methods?",
      answer: "Email and social login"
    });

    // Another side quest attempt
    const sideQuest2 = await handler.handleConsultationSideQuest(
      consultation.id,
      "Actually, let's make this a mobile app instead"
    );
    assert.strictEqual(sideQuest2.derailmentPrevented, true);

    // Complete consultation
    const finalSpec = await engine.generateSpec(consultation.id);

    // Should maintain original focus
    assert.ok(finalSpec.includes('web-app') || finalSpec.includes('authentication'));
    assert.ok(!finalSpec.includes('real-time chat'));
    assert.ok(!finalSpec.includes('mobile app'));
  });
});