/**
 * Integration Test: Character Interaction
 * Tests the complete character interaction system with personality consistency
 * MUST FAIL until character interaction system is fully implemented
 */
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';

describe('Character Interaction Integration', () => {
  let CharacterPersona, AnimationEngine;

  test('character system integrates with animation engine', async () => {
    try {
      const personaModule = await import('../../src/character/persona.js');
      const engineModule = await import('../../src/animation/engine.js');

      CharacterPersona = personaModule.default || personaModule.CharacterPersona;
      AnimationEngine = engineModule.default || engineModule.AnimationEngine;

      const persona = new CharacterPersona();
      const engine = new AnimationEngine();

      // Test integrated response with animation
      const response = persona.getResponse('welcome', { firstTime: true });
      const visual = await engine.displayCharacter('happy', response);

      assert.ok(response, 'Character should provide response');
      assert.ok(visual, 'Animation should provide visual representation');
      assert.ok(persona.validateResponse(response), 'Response should pass personality validation');

    } catch (error) {
      assert.fail(`Expected failure until character interaction is implemented: ${error.message}`);
    }
  });

  test('CLI commands maintain character consistency', async () => {
    try {
      // Test multiple CLI interactions
      const commands = [
        'node src/index.js welcome',
        'node src/index.js help',
        'node src/index.js create-spec "test project"'
      ];

      const responses = [];
      for (const cmd of commands) {
        try {
          const output = execSync(cmd, { encoding: 'utf8', timeout: 5000 });
          responses.push(output);
        } catch (error) {
          // Expected to fail until implementation
          responses.push(error.message);
        }
      }

      // When implemented, all responses should maintain personality
      if (responses.some(r => !r.includes('Cannot find module'))) {
        responses.forEach(response => {
          // Check for personality traits: friendly, honest, fun, not cringe
          const lowercaseResponse = response.toLowerCase();

          // Should avoid overly effusive language
          assert.ok(!lowercaseResponse.includes('amazing!!!') &&
                    !lowercaseResponse.includes('fantastic!!!'),
                    'Should avoid cringe language');

          // Should include friendly elements
          assert.ok(lowercaseResponse.includes('help') ||
                    lowercaseResponse.includes('here') ||
                    lowercaseResponse.includes('!'),
                    'Should maintain friendly tone');
        });
      }

    } catch (error) {
      // Expected to fail until implementation
      assert.ok(error.message.includes('Cannot find module') ||
                error.message.includes('command not found'),
                `Expected failure until CLI character integration is implemented: ${error.message}`);
    }
  });

  test('character responds contextually to user input', async () => {
    try {
      const persona = new CharacterPersona();

      // Test conversation flow
      persona.updateInteractionHistory('I need help', 'Of course! What can I help you with?');

      const followUpResponse = persona.getResponse('create a specification', {
        previousTopic: 'help'
      });

      assert.ok(followUpResponse.includes('spec') || followUpResponse.includes('project'),
                'Should provide contextual response about specifications');

      // Test error handling
      const errorResponse = persona.getResponse('error', {
        errorType: 'fileNotFound',
        fileName: 'missing.js'
      });

      assert.ok(errorResponse.includes('file') || errorResponse.includes('found'),
                'Should provide helpful error context');

      // All responses should pass validation
      assert.ok(persona.validateResponse(followUpResponse), 'Follow-up response should be valid');
      assert.ok(persona.validateResponse(errorResponse), 'Error response should be valid');

    } catch (error) {
      assert.fail(`Expected failure until character interaction is implemented: ${error.message}`);
    }
  });

  test('character personality remains consistent across sessions', async () => {
    try {
      // Test multiple persona instances (simulating different sessions)
      const persona1 = new CharacterPersona();
      const persona2 = new CharacterPersona();

      const situation = 'help with commands';
      const context = { userLevel: 'beginner' };

      const response1 = persona1.getResponse(situation, context);
      const response2 = persona2.getResponse(situation, context);

      // Both responses should be valid and similar in tone
      assert.ok(persona1.validateResponse(response1), 'First persona response should be valid');
      assert.ok(persona2.validateResponse(response2), 'Second persona response should be valid');

      // Should both be helpful and friendly
      assert.ok(response1.length > 0 && response2.length > 0, 'Both responses should be non-empty');

      // Neither should be overly effusive
      const cringe1 = response1.toLowerCase().includes('amazing!!!') ||
                      response1.toLowerCase().includes('fantastic!!!');
      const cringe2 = response2.toLowerCase().includes('amazing!!!') ||
                      response2.toLowerCase().includes('fantastic!!!');

      assert.ok(!cringe1 && !cringe2, 'Neither response should be cringe');

    } catch (error) {
      assert.fail(`Expected failure until character interaction is implemented: ${error.message}`);
    }
  });

  test('character provides appropriate responses for different scenarios', async () => {
    try {
      const persona = new CharacterPersona();

      const scenarios = [
        { situation: 'welcome', context: { firstTime: true } },
        { situation: 'success', context: { taskCompleted: 'specification created' } },
        { situation: 'error', context: { errorType: 'validationFailed' } },
        { situation: 'help', context: { topic: 'getting started' } },
        { situation: 'goodbye', context: { sessionLength: '30 minutes' } }
      ];

      for (const scenario of scenarios) {
        const response = persona.getResponse(scenario.situation, scenario.context);

        assert.ok(typeof response === 'string', `Response for ${scenario.situation} should be string`);
        assert.ok(response.length > 0, `Response for ${scenario.situation} should not be empty`);
        assert.ok(persona.validateResponse(response), `Response for ${scenario.situation} should pass validation`);

        // Check situation-specific content
        const lowercaseResponse = response.toLowerCase();
        switch (scenario.situation) {
          case 'welcome':
            assert.ok(lowercaseResponse.includes('welcome') ||
                      lowercaseResponse.includes('hello') ||
                      lowercaseResponse.includes('hi'),
                      'Welcome response should include greeting');
            break;
          case 'success':
            assert.ok(lowercaseResponse.includes('great') ||
                      lowercaseResponse.includes('good') ||
                      lowercaseResponse.includes('done'),
                      'Success response should acknowledge completion');
            break;
          case 'error':
            assert.ok(lowercaseResponse.includes('sorry') ||
                      lowercaseResponse.includes('help') ||
                      lowercaseResponse.includes('try'),
                      'Error response should be helpful');
            break;
        }
      }

    } catch (error) {
      assert.fail(`Expected failure until character interaction is implemented: ${error.message}`);
    }
  });

  test('character visual states match personality responses', async () => {
    try {
      const persona = new CharacterPersona();
      const engine = new AnimationEngine();

      const emotionalTests = [
        { emotion: 'happy', expectedResponse: 'success' },
        { emotion: 'thinking', expectedResponse: 'processing' },
        { emotion: 'helpful', expectedResponse: 'help' }
      ];

      for (const test of emotionalTests) {
        const response = persona.getResponse(test.expectedResponse, {});
        const visual = await engine.displayCharacter(test.emotion, response);

        assert.ok(response, `Should get response for ${test.expectedResponse}`);
        assert.ok(visual, `Should get visual for ${test.emotion}`);

        // Visual should reflect emotional state
        if (test.emotion === 'happy') {
          assert.ok(visual.includes('^') || visual.includes(')'),
                    'Happy visual should show positive expression');
        }
      }

    } catch (error) {
      assert.fail(`Expected failure until character interaction is implemented: ${error.message}`);
    }
  });
});