/**
 * Contract Test: Character Persona
 * Tests the character persona interface and personality consistency
 * MUST FAIL until src/character/persona.js is implemented
 */
import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Character Persona Contract', () => {
  let CharacterPersona;

  test('character persona module exports class', async () => {
    try {
      const module = await import('../../src/character/persona.js');
      CharacterPersona = module.default || module.CharacterPersona;
      assert.ok(CharacterPersona, 'CharacterPersona class should be exported');
      assert.strictEqual(typeof CharacterPersona, 'function', 'CharacterPersona should be a constructor function');
    } catch (error) {
      assert.fail(`Expected failure until character persona is implemented: ${error.message}`);
    }
  });

  test('character persona can be instantiated', async () => {
    try {
      const persona = new CharacterPersona();
      assert.ok(persona, 'CharacterPersona should be instantiable');
    } catch (error) {
      assert.fail(`Expected failure until character persona is implemented: ${error.message}`);
    }
  });

  test('getResponse method returns personality-consistent responses', async () => {
    try {
      const persona = new CharacterPersona();
      assert.strictEqual(typeof persona.getResponse, 'function', 'getResponse method should exist');

      const response = persona.getResponse('welcome', { firstTime: true });
      assert.ok(typeof response === 'string', 'Should return string response');
      assert.ok(response.length > 0, 'Response should not be empty');

      // Check for personality traits: friendly, honest, fun, not cringe
      const lowercaseResponse = response.toLowerCase();
      assert.ok(!lowercaseResponse.includes('amazing') || !lowercaseResponse.includes('awesome'),
                'Should avoid overly effusive language');
    } catch (error) {
      assert.fail(`Expected failure until character persona is implemented: ${error.message}`);
    }
  });

  test('getVisualState method returns appropriate ASCII art', async () => {
    try {
      const persona = new CharacterPersona();
      assert.strictEqual(typeof persona.getVisualState, 'function', 'getVisualState method should exist');

      const happyState = persona.getVisualState('happy');
      assert.ok(typeof happyState === 'string', 'Should return string visual representation');
      assert.ok(happyState.includes('(') || happyState.includes('^'), 'Should contain ASCII art elements');

      const thinkingState = persona.getVisualState('thinking');
      assert.ok(typeof thinkingState === 'string', 'Should return thinking state visualization');
    } catch (error) {
      assert.fail(`Expected failure until character persona is implemented: ${error.message}`);
    }
  });

  test('validateResponse method enforces personality consistency', async () => {
    try {
      const persona = new CharacterPersona();
      assert.strictEqual(typeof persona.validateResponse, 'function', 'validateResponse method should exist');

      // Test friendly response
      const friendlyValid = persona.validateResponse('Hello! I\'m here to help you with your project.');
      assert.strictEqual(friendlyValid, true, 'Should accept friendly responses');

      // Test cringe response (should be rejected)
      const cringeInvalid = persona.validateResponse('OMG this is SOOO amazing and fantastic!!!');
      assert.strictEqual(cringeInvalid, false, 'Should reject overly effusive responses');

      // Test honest response
      const honestValid = persona.validateResponse('I don\'t know that, but I can help you find out.');
      assert.strictEqual(honestValid, true, 'Should accept honest responses');
    } catch (error) {
      assert.fail(`Expected failure until character persona is implemented: ${error.message}`);
    }
  });

  test('updateInteractionHistory method tracks context', async () => {
    try {
      const persona = new CharacterPersona();
      assert.strictEqual(typeof persona.updateInteractionHistory, 'function', 'updateInteractionHistory method should exist');

      persona.updateInteractionHistory('help me create a spec', 'Sure! Let\'s start with your project description.');

      // Check that context affects future responses
      const contextualResponse = persona.getResponse('continue', {});
      assert.ok(typeof contextualResponse === 'string', 'Should provide contextual responses');
    } catch (error) {
      assert.fail(`Expected failure until character persona is implemented: ${error.message}`);
    }
  });

  test('personality traits are consistently maintained', async () => {
    try {
      const persona = new CharacterPersona();

      // Test multiple interactions for consistency
      const responses = [
        persona.getResponse('error', { errorType: 'fileNotFound' }),
        persona.getResponse('success', { taskCompleted: 'specification' }),
        persona.getResponse('help', { topic: 'commands' })
      ];

      responses.forEach((response, index) => {
        assert.ok(typeof response === 'string', `Response ${index + 1} should be a string`);
        assert.ok(response.length > 0, `Response ${index + 1} should not be empty`);

        // Ensure all responses pass validation
        const isValid = persona.validateResponse(response);
        assert.strictEqual(isValid, true, `Response ${index + 1} should pass personality validation`);
      });
    } catch (error) {
      assert.fail(`Expected failure until character persona is implemented: ${error.message}`);
    }
  });
});