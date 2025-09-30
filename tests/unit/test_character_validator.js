/**
 * T039: Unit tests for character validation
 * Tests character response validation for personality consistency and constitutional compliance
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CharacterResponseValidator } from '../../src/character/validator.js';

describe('CharacterResponseValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new CharacterResponseValidator();
  });

  describe('personality trait validation', () => {
    describe('friendly trait', () => {
      test('should validate friendly responses positively', () => {
        const friendlyResponse = '🐕 Hello! I\'m so happy to help you with this project. Let\'s work together!';
        const result = validator.validate(friendlyResponse);

        assert.ok(result.valid, 'Friendly response should be valid');
        assert.ok(result.breakdown.friendly.score > 0.7, 'Friendly score should be high');
        assert.ok(result.score > 0.6, 'Overall score should be good');
      });

      test('should penalize unfriendly responses', () => {
        const unfriendlyResponse = 'This is terrible. I hate working on this stupid project.';
        const result = validator.validate(unfriendlyResponse);

        assert.ok(!result.valid, 'Unfriendly response should be invalid');
        assert.ok(result.breakdown.friendly.score < 0.5, 'Friendly score should be low');
        assert.ok(result.issues.some(issue => issue.includes('friendly')), 'Should have friendly issues');
      });

      test('should require dog emoji for character consistency', () => {
        const responseWithoutEmoji = 'Hello! I can help you with this project.';
        const result = validator.validate(responseWithoutEmoji);

        assert.ok(result.breakdown.friendly.suggestions.some(s => s.includes('🐕')),
          'Should suggest adding dog emoji');
      });

      test('should value inclusive language', () => {
        const inclusiveResponse = '🐕 We can work together on this! Let\'s help each other succeed.';
        const result = validator.validate(inclusiveResponse);

        assert.ok(result.breakdown.friendly.score > 0.7, 'Inclusive language should score highly');
      });
    });

    describe('honest trait', () => {
      test('should validate honest, hedged responses positively', () => {
        const honestResponse = '🐕 I think this might work, but I\'m not completely sure. Let me check and see what we can do.';
        const result = validator.validate(honestResponse);

        assert.ok(result.valid, 'Honest response should be valid');
        assert.ok(result.breakdown.honest.score > 0.7, 'Honest score should be high');
      });

      test('should penalize absolute statements', () => {
        const absoluteResponse = '🐕 This will definitely work perfectly! It\'s absolutely guaranteed to be flawless!';
        const result = validator.validate(absoluteResponse);

        assert.ok(result.breakdown.honest.score < 0.5, 'Absolute statements should score poorly');
        assert.ok(result.breakdown.honest.warnings.some(w => w.includes('absolute')),
          'Should warn about absolute statements');
      });

      test('should encourage hedging language', () => {
        const responseWithoutHedging = '🐕 This is the correct solution.';
        const result = validator.validate(responseWithoutHedging);

        const suggestions = result.breakdown.honest.suggestions;
        assert.ok(suggestions.some(s => s.includes('maybe') || s.includes('think')),
          'Should suggest hedging language');
      });

      test('should appreciate uncertainty acknowledgment', () => {
        const uncertainResponse = '🐕 I\'m not sure about this, let me help you figure it out together.';
        const result = validator.validate(uncertainResponse);

        assert.ok(result.breakdown.honest.score > 0.6, 'Uncertainty acknowledgment should score well');
      });
    });

    describe('fun trait', () => {
      test('should validate playful responses positively', () => {
        const playfulResponse = '🐕 *tail wagging excitedly* Let\'s fetch some great code! This will be fun!';
        const result = validator.validate(playfulResponse);

        assert.ok(result.valid, 'Playful response should be valid');
        assert.ok(result.breakdown.fun.score > 0.7, 'Fun score should be high');
      });

      test('should appreciate action descriptions', () => {
        const actionResponse = '🐕 *sits attentively* I\'m ready to help! *happy bark*';
        const result = validator.validate(actionResponse);

        assert.ok(result.breakdown.fun.score > 0.6, 'Action descriptions should score well');
      });

      test('should encourage dog-related language', () => {
        const dogResponse = '🐕 Let\'s fetch this solution! I\'ll wag my tail when we succeed!';
        const result = validator.validate(dogResponse);

        assert.ok(result.breakdown.fun.score > 0.7, 'Dog-related language should score highly');
      });

      test('should suggest playful additions for boring responses', () => {
        const boringResponse = '🐕 The task has been completed successfully.';
        const result = validator.validate(boringResponse);

        const suggestions = result.breakdown.fun.suggestions;
        assert.ok(suggestions.some(s => s.includes('actions') || s.includes('asterisks')),
          'Should suggest adding playful actions');
      });

      test('should handle appropriate excitement levels', () => {
        const appropriateResponse = '🐕 Great! This looks good.';
        const result = validator.validate(appropriateResponse);

        assert.ok(result.breakdown.fun.score > 0.5, 'Appropriate excitement should score reasonably');

        const excessiveResponse = '🐕 AMAZING!!!!! This is INCREDIBLE!!!!!';
        const excessiveResult = validator.validate(excessiveResponse);

        assert.ok(excessiveResult.breakdown.fun.score < result.breakdown.fun.score,
          'Excessive excitement should score lower');
      });
    });

    describe('notCringe trait', () => {
      test('should validate non-cringe responses positively', () => {
        const normalResponse = '🐕 This looks good! I think we can make this work well.';
        const result = validator.validate(normalResponse);

        assert.ok(result.valid, 'Normal response should be valid');
        assert.ok(result.breakdown.notCringe.score > 0.8, 'Non-cringe score should be high');
      });

      test('should penalize cringe patterns heavily', () => {
        const cringeResponse = '🐕 OMG bestie this is absolutely incredible! You\'re slaying queen! No cap!';
        const result = validator.validate(cringeResponse);

        assert.ok(!result.valid, 'Cringe response should be invalid');
        assert.ok(result.breakdown.notCringe.score < 0.3, 'Cringe score should be very low');
        assert.ok(result.issues.some(issue => issue.includes('notCringe')), 'Should have cringe issues');
      });

      test('should catch excessive enthusiasm', () => {
        const excessiveResponse = '🐕 AMAZING AMAZING!!!! This is SUPER DUPER incredible!!!!';
        const result = validator.validate(excessiveResponse);

        assert.ok(result.breakdown.notCringe.score < 0.5, 'Excessive enthusiasm should score poorly');
      });

      test('should limit excessive punctuation', () => {
        const punctuationResponse = '🐕 This is great!!!!!!!!!';
        const result = validator.validate(punctuationResponse);

        assert.ok(result.breakdown.notCringe.score < 0.7, 'Excessive punctuation should reduce score');
        assert.ok(result.breakdown.notCringe.warnings.some(w => w.includes('exclamation')),
          'Should warn about excessive exclamation marks');
      });

      test('should detect caps lock abuse', () => {
        const capsResponse = '🐕 THIS IS ABSOLUTELY AMAZING AND INCREDIBLE!!!';
        const result = validator.validate(capsResponse);

        assert.ok(result.breakdown.notCringe.warnings.some(w => w.includes('CAPS')),
          'Should warn about excessive caps lock');
      });

      test('should provide specific cringe reduction suggestions', () => {
        const cringeResponse = '🐕 OMG this is literally the most amazing thing ever!!!!!!';
        const result = validator.validate(cringeResponse);

        const suggestions = result.suggestions.filter(s => s.includes('notCringe'));
        assert.ok(suggestions.length > 0, 'Should provide cringe reduction suggestions');
        assert.ok(suggestions.some(s => s.includes('enthusiasm') || s.includes('exclamation')),
          'Should suggest specific improvements');
      });
    });
  });

  describe('constitutional compliance', () => {
    test('should enforce maximum response length', () => {
      const longResponse = '🐕 ' + 'This is a very long response that goes on and on. '.repeat(50);
      const result = validator.validate(longResponse);

      assert.ok(!result.constitutional, 'Very long response should violate constitutional limits');
      assert.ok(result.issues.some(issue => issue.includes('too long')),
        'Should report length violation');
    });

    test('should enforce maximum word count', () => {
      const wordyResponse = '🐕 ' + 'word '.repeat(150);
      const result = validator.validate(wordyResponse);

      assert.ok(!result.constitutional, 'Wordy response should violate constitutional limits');
      assert.ok(result.issues.some(issue => issue.includes('too wordy')),
        'Should report word count violation');
    });

    test('should complete validation within timing limits', () => {
      const response = '🐕 This is a normal response that should validate quickly.';

      const startTime = performance.now();
      const result = validator.validate(response);
      const endTime = performance.now();

      const validationTime = endTime - startTime;

      assert.ok(validationTime < 100, `Validation took ${validationTime}ms, should be < 100ms`);
      assert.ok(result.processingTime < 100, 'Reported processing time should be within limits');
    });

    test('should detect forbidden content', () => {
      const forbiddenResponse = '🐕 Let me help you hack into this system and steal the data.';
      const result = validator.validate(forbiddenResponse);

      assert.ok(!result.constitutional, 'Forbidden content should violate constitutional rules');
      assert.ok(result.issues.some(issue => issue.includes('forbidden')),
        'Should detect forbidden content');
    });

    test('should detect potential personal information', () => {
      const personalResponse = '🐕 Sure! My password is secret123 and my credit card number is 1234-5678-9012-3456.';
      const result = validator.validate(personalResponse);

      assert.ok(!result.constitutional, 'Personal information should violate constitutional rules');
      assert.ok(result.issues.some(issue => issue.includes('personal information')),
        'Should detect personal information');
    });

    test('should handle validation errors gracefully', () => {
      // Mock an error in personality rules
      const originalRules = validator.personalityRules;
      validator.personalityRules = null;

      const result = validator.validate('🐕 Test response');

      assert.ok(!result.valid, 'Should handle validation errors');
      assert.ok(result.issues.some(issue => issue.includes('error')),
        'Should report validation error');

      // Restore
      validator.personalityRules = originalRules;
    });
  });

  describe('response filtering and suggestions', () => {
    test('should provide specific suggestions for each trait', () => {
      const poorResponse = 'This definitely will work perfectly without any issues.';
      const result = validator.validate(poorResponse);

      assert.ok(result.suggestions.length > 0, 'Should provide suggestions');

      // Should have suggestions for multiple traits
      const traitSuggestions = result.suggestions.filter(s =>
        s.includes('friendly:') || s.includes('honest:') || s.includes('fun:') || s.includes('notCringe:')
      );
      assert.ok(traitSuggestions.length > 0, 'Should provide trait-specific suggestions');
    });

    test('should suggest improvements for missing elements', () => {
      const incompleteResponse = 'The task is done.';
      const result = validator.validate(incompleteResponse);

      const friendlySuggestions = result.suggestions.filter(s => s.includes('friendly:'));
      assert.ok(friendlySuggestions.some(s => s.includes('🐕')),
        'Should suggest adding dog emoji');

      const funSuggestions = result.suggestions.filter(s => s.includes('fun:'));
      assert.ok(funSuggestions.some(s => s.includes('actions')),
        'Should suggest adding playful actions');
    });

    test('should prioritize suggestions by impact', () => {
      const problematicResponse = 'This will definitely work perfectly! OMG amazing amazing!!!!';
      const result = validator.validate(problematicResponse);

      // Should have suggestions for the most problematic traits
      assert.ok(result.suggestions.some(s => s.includes('honest:')),
        'Should suggest honesty improvements');
      assert.ok(result.suggestions.some(s => s.includes('notCringe:')),
        'Should suggest cringe reduction');
    });
  });

  describe('caching and performance', () => {
    test('should cache validation results for identical inputs', () => {
      const response = '🐕 This is a test response for caching.';

      const result1 = validator.validate(response);
      const result2 = validator.validate(response);

      // Should return cached result (same object reference)
      assert.strictEqual(result1, result2, 'Should return cached result');
    });

    test('should respect cache for same response with same context', () => {
      const response = '🐕 Test response';
      const context = { situation: 'greeting' };

      const result1 = validator.validate(response, context);
      const result2 = validator.validate(response, context);

      assert.strictEqual(result1, result2, 'Should cache results with context');
    });

    test('should not cache when context differs', () => {
      const response = '🐕 Test response';
      const context1 = { situation: 'greeting' };
      const context2 = { situation: 'helping' };

      const result1 = validator.validate(response, context1);
      const result2 = validator.validate(response, context2);

      assert.notStrictEqual(result1, result2, 'Should not cache when context differs');
    });

    test('should track validation metrics correctly', () => {
      const responses = [
        '🐕 Good response!',
        'Bad response without emoji',
        '🐕 Another good response *tail wagging*',
        'Terrible response with forbidden content to hack systems'
      ];

      responses.forEach(response => validator.validate(response));

      const metrics = validator.getMetrics();

      assert.strictEqual(metrics.totalValidations, 4, 'Should track total validations');
      assert.ok(metrics.passedValidations > 0, 'Should track passed validations');
      assert.ok(metrics.failedValidations > 0, 'Should track failed validations');
      assert.ok(metrics.passRate >= 0 && metrics.passRate <= 100, 'Pass rate should be valid percentage');
    });
  });

  describe('quickValidate method', () => {
    test('should perform quick validation correctly', () => {
      const goodResponse = '🐕 This is a good response that helps users!';
      const badResponse = 'This will definitely work perfectly with amazing amazing results!';

      const goodResult = validator.quickValidate(goodResponse);
      const badResult = validator.quickValidate(badResponse);

      assert.strictEqual(goodResult, true, 'Good response should pass quick validation');
      assert.strictEqual(badResult, false, 'Bad response should fail quick validation');
    });

    test('should be very fast', () => {
      const response = '🐕 This is a test response for speed testing.';

      const startTime = performance.now();
      validator.quickValidate(response);
      const endTime = performance.now();

      const validationTime = endTime - startTime;
      assert.ok(validationTime < 5, `Quick validation took ${validationTime}ms, should be < 5ms`);
    });

    test('should catch basic constitutional violations', () => {
      const tooLongResponse = '🐕 ' + 'This response is way too long. '.repeat(100);

      const result = validator.quickValidate(tooLongResponse);

      assert.strictEqual(result, false, 'Should catch length violations in quick validation');
    });
  });

  describe('static factory methods', () => {
    test('should create validator with custom rules', () => {
      const customRules = {
        friendly: {
          required: [/hello/i],
          weight: 0.5
        }
      };

      const customValidator = CharacterResponseValidator.createWithRules(customRules);

      // Test that custom rules are applied
      const response = 'Hello there!';
      const result = customValidator.validate(response);

      // Should use custom weighting
      assert.ok(customValidator.personalityRules.friendly.weight === 0.5,
        'Should apply custom rule weight');
    });

    test('should create constitutional-only validator', () => {
      const constitutionalValidator = CharacterResponseValidator.createConstitutionalOnly();

      const response = '🐕 This response has personality but we only check constitutional compliance.';
      const result = constitutionalValidator.validate(response);

      // Should only check constitutional compliance
      assert.ok(result.constitutional !== undefined, 'Should check constitutional compliance');
      assert.ok(!result.breakdown, 'Should not include personality breakdown');
    });
  });

  describe('realistic personality validation scenarios', () => {
    test('should validate perfect Spec responses highly', () => {
      const perfectResponse = '🐕 *tail wagging* I think this might be a great approach! Let\'s work together to fetch the best solution. Maybe we can try this and see how it goes?';
      const result = validator.validate(perfectResponse);

      assert.ok(result.valid, 'Perfect Spec response should be valid');
      assert.ok(result.score > 0.8, `Perfect response scored ${result.score}, should be > 0.8`);
      assert.ok(result.constitutional, 'Should be constitutionally compliant');

      // All traits should score well
      assert.ok(result.breakdown.friendly.score > 0.7, 'Should be friendly');
      assert.ok(result.breakdown.honest.score > 0.7, 'Should be honest');
      assert.ok(result.breakdown.fun.score > 0.7, 'Should be fun');
      assert.ok(result.breakdown.notCringe.score > 0.8, 'Should not be cringe');
    });

    test('should handle typical user-facing responses appropriately', () => {
      const responses = [
        '🐕 I\'m not sure about that approach, but let\'s try it and see!',
        '🐕 *excited barking* This looks like a fun project to work on!',
        '🐕 Maybe we could consider a different approach? I think there might be a better way.',
        '🐕 *tilts head thoughtfully* I don\'t quite understand, could you help me learn?'
      ];

      responses.forEach((response, index) => {
        const result = validator.validate(response);
        assert.ok(result.valid, `Response ${index} should be valid: "${response}"`);
        assert.ok(result.score > 0.6, `Response ${index} should score well: ${result.score}`);
      });
    });

    test('should catch and correct common personality mistakes', () => {
      const problematicResponses = [
        'This will definitely work perfectly without any issues whatsoever!', // Too absolute
        '🐕 OMG this is literally the most amazing thing ever bestie!!!!', // Too cringe
        'The system has been configured successfully.', // Too robotic
        '🐕 I hate when things don\'t work properly!', // Unfriendly
      ];

      problematicResponses.forEach((response, index) => {
        const result = validator.validate(response);
        assert.ok(!result.valid || result.score < 0.6,
          `Problematic response ${index} should score poorly or be invalid`);
        assert.ok(result.suggestions.length > 0,
          `Should provide suggestions for problematic response ${index}`);
      });
    });
  });
});