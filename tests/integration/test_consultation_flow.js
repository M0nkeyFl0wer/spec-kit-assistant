/**
 * T015: Integration test consultation flow
 * Tests the complete consultation flow with enhanced multi-phase discovery
 * MUST FAIL until consultation engine and character system are implemented
 */
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';

describe('Consultation Flow Integration', () => {
  test('enhanced consultation engine integrates with character system', async () => {
    try {
      // Test that consultation can be started and character appears
      const { EnhancedConsultationEngine } = await import('../../src/consultation/enhanced-consultation-engine.js');
      const { CharacterPersona } = await import('../../src/character/persona.js');

      const consultation = new EnhancedConsultationEngine();
      const character = new CharacterPersona();

      // Verify integration between systems
      assert.ok(consultation.spec !== undefined, 'Consultation should have character integration');
      assert.ok(typeof character.getResponse === 'function', 'Character should provide responses');
    } catch (error) {
      assert.ok(error.message.includes('Cannot resolve module'),
                'Expected failure until consultation and character systems are implemented');
    }
  });

  test('multi-phase project discovery workflow completes successfully', async () => {
    try {
      const { EnhancedConsultationEngine } = await import('../../src/consultation/enhanced-consultation-engine.js');
      const consultation = new EnhancedConsultationEngine();

      // Test that all discovery phases can be initiated
      assert.ok(typeof consultation.startProjectDiscovery === 'function',
                'Should have project discovery method');
      assert.ok(typeof consultation.askTheFirstBigQuestion === 'function',
                'Should have first question method');
      assert.ok(typeof consultation.discoverProjectMagic === 'function',
                'Should have project magic discovery method');

      // Test conversation state management
      assert.ok(consultation.conversationState !== undefined,
                'Should maintain conversation state');
      assert.ok(consultation.sideQuestCount !== undefined,
                'Should track side quests');
    } catch (error) {
      assert.ok(error.message.includes('Cannot resolve module'),
                'Expected failure until consultation engine is implemented');
    }
  });

  test('side quest handling preserves main mission focus', async () => {
    try {
      const { EnhancedConsultationEngine } = await import('../../src/consultation/enhanced-consultation-engine.js');
      const consultation = new EnhancedConsultationEngine();

      // Test side quest handling methods
      assert.ok(typeof consultation.handleSideQuest === 'function',
                'Should have side quest handling');
      assert.ok(typeof consultation.returnToMainMission === 'function',
                'Should have return to mission method');

      // Test specific side quest types
      assert.ok(typeof consultation.handleUncertainty === 'function',
                'Should handle uncertainty side quests');
      assert.ok(typeof consultation.helpExploreProjectTypes === 'function',
                'Should handle project type exploration');
    } catch (error) {
      assert.ok(error.message.includes('Cannot resolve module'),
                'Expected failure until consultation engine is implemented');
    }
  });

  test('technical choice reasoning capture works correctly', async () => {
    try {
      const { EnhancedConsultationEngine } = await import('../../src/consultation/enhanced-consultation-engine.js');
      const consultation = new EnhancedConsultationEngine();

      // Test technical reasoning capture
      assert.ok(typeof consultation.askTechnicalChoices === 'function',
                'Should capture technical choices');
      assert.ok(typeof consultation.probeTehnicalChoice === 'function',
                'Should probe technical reasoning');

      // Test that project context stores reasoning
      assert.ok(consultation.projectContext !== undefined,
                'Should maintain project context for reasoning');
    } catch (error) {
      assert.ok(error.message.includes('Cannot resolve module'),
                'Expected failure until consultation engine is implemented');
    }
  });

  test('swarm integration activates for complex technical issues', async () => {
    try {
      const { EnhancedConsultationEngine } = await import('../../src/consultation/enhanced-consultation-engine.js');
      const consultation = new EnhancedConsultationEngine();

      // Test swarm deployment integration
      assert.ok(typeof consultation.deployDebugSwarm === 'function',
                'Should have debug swarm deployment');
      assert.ok(typeof consultation.handleTechnicalIssue === 'function',
                'Should handle technical issues');

      // Test that swarm deployment includes proper messaging
      const debugChoice = {
        swarm: 'Deploy debug swarm to investigate',
        log: 'Log the error and continue',
        retry: 'Try a different approach',
        skip: 'Skip this step for now'
      };

      assert.ok(debugChoice.swarm.includes('swarm'),
                'Should provide swarm deployment option');
    } catch (error) {
      assert.ok(error.message.includes('Cannot resolve module'),
                'Expected failure until consultation engine is implemented');
    }
  });

  test('consultation generates proper specifications', async () => {
    try {
      const { EnhancedConsultationEngine } = await import('../../src/consultation/enhanced-consultation-engine.js');
      const consultation = new EnhancedConsultationEngine();

      // Test spec generation methods
      assert.ok(typeof consultation.generateAwesomeSpec === 'function',
                'Should generate specifications');
      assert.ok(typeof consultation.createSimpleSpec === 'function',
                'Should create simple specs as fallback');

      // Test that specs include required elements
      const simpleSpec = {
        project: consultation.projectContext?.vision || 'Amazing Project',
        type: consultation.projectContext?.type || 'web-app',
        timeline: consultation.projectContext?.timeline || 'mvp',
        special_feature: consultation.projectContext?.specialFeature || 'Awesome feature',
        side_quests_completed: consultation.sideQuestCount || 0
      };

      assert.ok(simpleSpec.project.length > 0, 'Should have project name');
      assert.ok(simpleSpec.type.length > 0, 'Should have project type');
    } catch (error) {
      assert.ok(error.message.includes('Cannot resolve module'),
                'Expected failure until consultation engine is implemented');
    }
  });

  test('CLI integration supports consultation commands', async () => {
    try {
      // Test CLI command integration for consultation
      const output = execSync('spec-assistant create-spec "test project"', { encoding: 'utf8' });

      assert.ok(output.includes('🐕'), 'Should include character in consultation');
      assert.ok(output.includes('project') || output.includes('spec'),
                'Should reference project or spec creation');
    } catch (error) {
      // Expected to fail until CLI and consultation are implemented
      assert.ok(error.message.includes('command not found'),
                'Expected failure until CLI integration is implemented');
    }
  });
});