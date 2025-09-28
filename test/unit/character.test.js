import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import sinon from 'sinon';
import { SpecCharacter } from '../../src/character/spec.js';

describe('SpecCharacter', () => {
  let spec;
  let consoleStub;
  let clock;

  beforeEach(() => {
    spec = new SpecCharacter();
    consoleStub = sinon.stub(console, 'log');
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    consoleStub.restore();
    clock.restore();
  });

  describe('Constructor', () => {
    it('should initialize with correct properties', () => {
      expect(spec.name).toBe('Spec');
      expect(spec.personality).toBe('friendly-helpful-encouraging');
      expect(spec.currentMood).toBe('excited');
      expect(spec.voiceEnabled).toBe(false);
      expect(spec.multimedia).toBeDefined();
      expect(spec.voice).toBeDefined();
    });

    it('should have all required mood art', () => {
      const requiredMoods = [
        'happy', 'thinking', 'celebrating', 'concerned',
        'working', 'greeting', 'matrix', 'cyber', 'love',
        'graduate', 'detective', 'pixel', 'realistic',
        'chibi', 'mini', 'sleeping'
      ];

      requiredMoods.forEach(mood => {
        expect(spec.art[mood]).toBeDefined();
        expect(typeof spec.art[mood]).toBe('string');
      });
    });

    it('should have personality responses', () => {
      expect(spec.responses.greetings).toBeInstanceOf(Array);
      expect(spec.responses.encouragement).toBeInstanceOf(Array);
      expect(spec.responses.help).toBeInstanceOf(Array);
      expect(spec.responses.celebration).toBeInstanceOf(Array);

      // Check each has at least one response
      Object.values(spec.responses).forEach(responses => {
        expect(responses.length).toBeGreaterThan(0);
      });
    });
  });

  describe('greet()', () => {
    it('should display happy art and greeting message', async () => {
      await spec.greet();

      // Advance timers to complete the pause
      clock.tick(800);

      expect(consoleStub.calledWith(spec.art.happy)).toBe(true);

      // Check that a greeting was displayed
      const greetingCalls = consoleStub.getCalls().filter(call => {
        const arg = call.args[0];
        return typeof arg === 'string' && (
          arg.includes('Woof') ||
          arg.includes('Hello') ||
          arg.includes('Paws')
        );
      });

      expect(greetingCalls.length).toBeGreaterThan(0);
    });

    it('should use voice if enabled', async () => {
      spec.voiceEnabled = true;
      const voiceStub = sinon.stub(spec.voice, 'speak').resolves();

      await spec.greet();
      clock.tick(800);

      expect(voiceStub.called).toBe(true);
      voiceStub.restore();
    });
  });

  describe('show()', () => {
    it('should display the correct mood art', async () => {
      await spec.show('thinking');
      expect(consoleStub.calledWith(spec.art.thinking)).toBe(true);
      expect(spec.currentMood).toBe('thinking');
    });

    it('should display message if provided', async () => {
      const message = 'Test message';
      await spec.show('happy', message);

      const messageCalls = consoleStub.getCalls().filter(call => {
        const arg = call.args[0];
        return typeof arg === 'string' && arg.includes(message);
      });

      expect(messageCalls.length).toBeGreaterThan(0);
    });

    it('should fallback to happy mood for unknown moods', async () => {
      await spec.show('unknown-mood');
      expect(consoleStub.calledWith(spec.art.happy)).toBe(true);
    });

    it('should speak message if voice enabled', async () => {
      spec.voiceEnabled = true;
      const voiceStub = sinon.stub(spec.voice, 'speak').resolves();
      const message = 'Voice test message';

      await spec.show('happy', message);

      expect(voiceStub.calledWith(message)).toBe(true);
      voiceStub.restore();
    });
  });

  describe('celebrate()', () => {
    it('should show celebrating mood and celebration message', async () => {
      const achievement = 'Test completed';
      const multimediaStub = sinon.stub(spec.multimedia, 'showCelebration').resolves();

      await spec.celebrate(achievement);
      clock.tick(1200);

      expect(consoleStub.calledWith(spec.art.celebrating)).toBe(true);

      const celebrationCalls = consoleStub.getCalls().filter(call => {
        const arg = call.args[0];
        return typeof arg === 'string' && arg.includes(achievement);
      });

      expect(celebrationCalls.length).toBeGreaterThan(0);
      expect(multimediaStub.called).toBe(true);

      multimediaStub.restore();
    });
  });

  describe('encourage()', () => {
    it('should show happy mood and encouragement message', async () => {
      await spec.encourage();

      expect(consoleStub.calledWith(spec.art.happy)).toBe(true);

      const encouragementCalls = consoleStub.getCalls().filter(call => {
        const arg = call.args[0];
        return typeof arg === 'string' && spec.responses.encouragement.some(msg =>
          arg.includes(msg)
        );
      });

      expect(encouragementCalls.length).toBeGreaterThan(0);
    });
  });

  describe('think()', () => {
    it('should show thinking mood and display spinner', async () => {
      const oraStub = {
        start: sinon.stub().returnsThis(),
        stop: sinon.stub()
      };

      // Mock ora module
      const originalOra = global.ora;
      global.ora = () => oraStub;

      await spec.think(1000);
      clock.tick(1000);

      expect(consoleStub.calledWith(spec.art.thinking)).toBe(true);
      expect(oraStub.start.called).toBe(true);
      expect(oraStub.stop.called).toBe(true);

      global.ora = originalOra;
    });

    it('should use default duration if not specified', async () => {
      const startTime = Date.now();
      const thinkPromise = spec.think();

      clock.tick(2000); // Default duration
      await thinkPromise;

      expect(consoleStub.calledWith(spec.art.thinking)).toBe(true);
    });
  });

  describe('work()', () => {
    it('should show working mood and display progress', async () => {
      const task = 'Building project';
      const oraStub = {
        start: sinon.stub().returnsThis(),
        succeed: sinon.stub()
      };

      global.ora = () => oraStub;

      await spec.work(task, 1000);
      clock.tick(1000);

      const workingCalls = consoleStub.getCalls().filter(call => {
        const arg = call.args[0];
        return typeof arg === 'string' && arg.includes(task);
      });

      expect(workingCalls.length).toBeGreaterThan(0);
      expect(oraStub.succeed.called).toBe(true);
    });
  });

  describe('showProgress()', () => {
    it('should display progress bar correctly', async () => {
      await spec.showProgress(5, 10, 'Testing');

      const progressCalls = consoleStub.getCalls().filter(call => {
        const arg = call.args[0];
        return typeof arg === 'string' && arg.includes('50%');
      });

      expect(progressCalls.length).toBeGreaterThan(0);
    });

    it('should celebrate when reaching 100%', async () => {
      const celebrateStub = sinon.stub(spec, 'celebrate').resolves();

      await spec.showProgress(10, 10, 'Complete');

      expect(celebrateStub.calledWith('Task completed')).toBe(true);
      celebrateStub.restore();
    });
  });

  describe('Voice control', () => {
    it('should enable voice correctly', async () => {
      await spec.enableVoice();
      expect(spec.voiceEnabled).toBe(true);
    });

    it('should disable voice correctly', async () => {
      spec.voiceEnabled = true;
      await spec.disableVoice();
      expect(spec.voiceEnabled).toBe(false);
    });
  });

  describe('Integration methods', () => {
    it('should integrate with swarm manager', async () => {
      const mockSwarmManager = { id: 'swarm-test' };
      await spec.integrateWithSwarm(mockSwarmManager);

      expect(spec.swarmManager).toBe(mockSwarmManager);
    });

    it('should integrate with consultation engine', async () => {
      const mockConsultationEngine = { id: 'consultation-test' };
      await spec.integrateWithConsultation(mockConsultationEngine);

      expect(spec.consultationEngine).toBe(mockConsultationEngine);
    });

    it('should integrate with cloud manager', async () => {
      const mockCloudManager = { id: 'cloud-test' };
      await spec.integrateWithCloud(mockCloudManager);

      expect(spec.cloudManager).toBe(mockCloudManager);
    });
  });

  describe('getPersonalityResponse()', () => {
    it('should return appropriate response for situation', () => {
      const situations = ['success', 'help', 'encourage', 'greet'];

      situations.forEach(situation => {
        const response = spec.getPersonalityResponse(situation);
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(0);
      });
    });

    it('should default to help responses for unknown situations', () => {
      const response = spec.getPersonalityResponse('unknown-situation');
      expect(spec.responses.help).toContain(response);
    });
  });

  describe('Error handling', () => {
    it('should handle voice synthesis errors gracefully', async () => {
      spec.voiceEnabled = true;
      const voiceStub = sinon.stub(spec.voice, 'speak').rejects(new Error('Voice error'));

      // Should not throw
      await expect(spec.greet()).resolves.not.toThrow();

      voiceStub.restore();
    });

    it('should handle multimedia errors gracefully', async () => {
      const multimediaStub = sinon.stub(spec.multimedia, 'showCelebration')
        .rejects(new Error('Multimedia error'));

      // Should not throw
      await expect(spec.celebrate('Test')).resolves.not.toThrow();

      multimediaStub.restore();
    });
  });
});

export default SpecCharacter;