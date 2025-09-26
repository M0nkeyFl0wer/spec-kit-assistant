import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
import { secureConfig } from '../utils/secure-config.js';
import { secureWriteFile, secureEnsureDir } from '../utils/secure-path.js';

export class VoiceSynthesis {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (!this.initialized) {
      await this.initializeSecurely();
      this.initialized = true;
    }
    return this;
  }

  async initializeSecurely() {
    // Load secure configuration
    await secureConfig.loadConfig();
    const voiceConfig = secureConfig.getVoiceConfig();

    this.enabled = voiceConfig.enabled;
    this.apiKey = voiceConfig.apiKey;
    this.voiceId = voiceConfig.voiceId; // No hardcoded fallback
    this.maxMessageLength = voiceConfig.maxMessageLength;
    this.timeout = voiceConfig.timeout;
    this.apiUrl = 'https://api.elevenlabs.io/v1/text-to-speech';

    // Validate configuration
    if (this.enabled && !this.apiKey) {
      console.warn(chalk.yellow('⚠️ Voice synthesis enabled but no API key provided'));
      console.warn(chalk.gray('Set ELEVENLABS_API_KEY environment variable to enable voice'));
      this.enabled = false;
    }

    if (this.enabled && !this.voiceId) {
      console.warn(chalk.yellow('⚠️ Voice synthesis enabled but no voice ID provided'));
      console.warn(chalk.gray('Set SPEC_VOICE_ID environment variable for custom voice'));
      this.enabled = false;
    }

    // Initialize secure audio directory
    await this.initializeAudioDirectory();

    // Voice characteristics for Spec the Golden Retriever
    this.voiceSettings = {
      stability: 0.75,
      similarity_boost: 0.85,
      style: 0.3, // Slightly playful but professional
      use_speaker_boost: true
    };

    // Personality-based speech patterns
    this.speechPatterns = {
      excited: {
        pace: 'medium-fast',
        pitch: 'slightly-high',
        emphasis: ['amazing', 'awesome', 'fantastic', 'perfect'],
        pauses: { short: 0.3, medium: 0.6 }
      },
      helpful: {
        pace: 'medium',
        pitch: 'warm',
        emphasis: ['help', 'guide', 'together', 'step'],
        pauses: { short: 0.4, medium: 0.8 }
      },
      encouraging: {
        pace: 'medium-slow',
        pitch: 'warm-low',
        emphasis: ['great', 'excellent', 'perfect', 'well done'],
        pauses: { short: 0.5, medium: 1.0 }
      },
      thinking: {
        pace: 'slow',
        pitch: 'thoughtful',
        emphasis: ['hmm', 'let me', 'think', 'consider'],
        pauses: { short: 0.6, medium: 1.2 }
      }
    };

  }

  async initializeAudioDirectory() {
    try {
      await secureEnsureDir('audio', 'output');
      console.log(chalk.green('✅ Secure audio directory initialized'));
    } catch (error) {
      console.error(chalk.red(`Failed to initialize audio directory: ${error.message}`));
      this.enabled = false;
    }
  }

  async checkSetup() {
    if (!this.apiKey) {
      console.log(chalk.yellow('⚠️  ElevenLabs API key not found. Voice synthesis disabled.'));
      console.log(chalk.gray('   Set ELEVENLABS_API_KEY environment variable to enable voice.'));
      return false;
    }

    try {
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': this.apiKey }
      });

      if (response.status === 200) {
        console.log(chalk.green('✅ ElevenLabs API connected successfully'));
        this.enabled = true;
        return true;
      }
    } catch (error) {
      console.log(chalk.red('❌ ElevenLabs API connection failed:', error.message));
      return false;
    }

    return false;
  }

  async speak(text, mood = 'helpful', options = {}) {
    if (!this.enabled) {
      // Fallback to text display if voice is not available
      this.displayTextFallback(text, mood);
      return;
    }

    try {
      console.log(chalk.blue(`🎵 Spec says: "${text}"`));

      // Apply speech patterns based on mood
      const processedText = this.applyPersonality(text, mood);

      const audioData = await this.synthesizeText(processedText, mood, options);

      if (audioData) {
        const audioFile = await this.saveAudio(audioData, text);
        await this.playAudio(audioFile);
      }

    } catch (error) {
      console.error(chalk.red('Voice synthesis error:'), error.message);
      this.displayTextFallback(text, mood);
    }
  }

  applyPersonality(text, mood) {
    const pattern = this.speechPatterns[mood] || this.speechPatterns.helpful;

    let processedText = text;

    // Add emphasis to key words
    if (pattern.emphasis) {
      pattern.emphasis.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        processedText = processedText.replace(regex, `<emphasis>${word}</emphasis>`);
      });
    }

    // Add natural pauses
    processedText = processedText.replace(/[.!?]/g, match => match + '<break time="0.5s"/>');
    processedText = processedText.replace(/[,;]/g, match => match + '<break time="0.3s"/>');

    // Add personality-specific interjections
    switch (mood) {
      case 'excited':
        processedText = this.addExcitedInterjections(processedText);
        break;
      case 'thinking':
        processedText = this.addThinkingInterjections(processedText);
        break;
      case 'encouraging':
        processedText = this.addEncouragingTone(processedText);
        break;
    }

    // Wrap in SSML for better control
    return `<speak>${processedText}</speak>`;
  }

  addExcitedInterjections(text) {
    const interjections = ['Woof!', 'Oh boy!', 'This is great!'];
    const randomInterjection = interjections[Math.floor(Math.random() * interjections.length)];

    if (Math.random() < 0.3) { // 30% chance to add interjection
      return `${randomInterjection} <break time="0.4s"/> ${text}`;
    }
    return text;
  }

  addThinkingInterjections(text) {
    const thinkingSounds = ['Hmm...', 'Let me see...', 'Well...'];
    const randomSound = thinkingSounds[Math.floor(Math.random() * thinkingSounds.length)];

    return `${randomSound} <break time="0.8s"/> ${text}`;
  }

  addEncouragingTone(text) {
    // Add a warm, encouraging prefix occasionally
    const encouragingStarts = ['You know what?', 'I have to say,', 'Between you and me,'];

    if (Math.random() < 0.4) { // 40% chance
      const randomStart = encouragingStarts[Math.floor(Math.random() * encouragingStarts.length)];
      return `${randomStart} <break time="0.5s"/> ${text}`;
    }
    return text;
  }

  async synthesizeText(text, mood, options = {}) {
    const voiceSettings = {
      ...this.voiceSettings,
      ...options.voiceSettings
    };

    // Adjust voice settings based on mood
    switch (mood) {
      case 'excited':
        voiceSettings.stability = 0.6; // More variation
        voiceSettings.style = 0.6; // More expressive
        break;
      case 'thinking':
        voiceSettings.stability = 0.85; // More stable
        voiceSettings.style = 0.1; // Less expressive
        break;
      case 'encouraging':
        voiceSettings.stability = 0.8; // Warm and stable
        voiceSettings.style = 0.4; // Moderately expressive
        break;
    }

    const payload = {
      text: text,
      voice_settings: voiceSettings,
      model_id: options.model || 'eleven_monolingual_v1'
    };

    const response = await axios.post(
      `${this.apiUrl}/${this.voiceId}`,
      payload,
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        responseType: 'arraybuffer'
      }
    );

    return response.data;
  }

  async saveAudio(audioData, originalText) {
    const timestamp = Date.now();
    const filename = `spec-speech-${timestamp}.mp3`;
    const filepath = path.join(this.audioPath, filename);

    await fs.writeFile(filepath, Buffer.from(audioData));

    // Save metadata
    const metadata = {
      timestamp,
      text: originalText,
      file: filename,
      duration: null // Could be calculated with audio analysis
    };

    const metadataPath = path.join(this.audioPath, `${filename}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return filepath;
  }

  async playAudio(audioFile) {
    // This would integrate with a system audio player
    // For now, just indicate that audio would be played
    console.log(chalk.green(`🔊 Playing audio: ${path.basename(audioFile)}`));

    // On actual implementation, this might use:
    // - node-speaker for direct audio playback
    // - child_process to call system audio players
    // - Web Audio API in browser environments

    return new Promise(resolve => {
      // Simulate audio playback duration
      setTimeout(resolve, 2000);
    });
  }

  displayTextFallback(text, mood) {
    const moodColors = {
      excited: chalk.yellow.bold,
      helpful: chalk.cyan,
      encouraging: chalk.green,
      thinking: chalk.blue,
      default: chalk.white
    };

    const colorFunction = moodColors[mood] || moodColors.default;

    const moodEmojis = {
      excited: '🎉',
      helpful: '🐕‍🦺',
      encouraging: '💪',
      thinking: '🤔',
      default: '🐕'
    };

    const emoji = moodEmojis[mood] || moodEmojis.default;

    console.log(colorFunction(`${emoji} Spec says: "${text}"`));
  }

  async generateSpecVoiceProfile() {
    if (!this.enabled) {
      console.log(chalk.yellow('Voice synthesis not available for profile generation'));
      return;
    }

    console.log(chalk.blue('🎤 Generating Spec\'s voice profile...'));

    // Test different moods and phrases
    const testPhrases = [
      { text: "Woof! I'm Spec, your friendly golden retriever guide!", mood: 'excited' },
      { text: "Let me help you understand this step by step.", mood: 'helpful' },
      { text: "You're doing fantastic! Keep going!", mood: 'encouraging' },
      { text: "Hmm, let me think about the best approach for this.", mood: 'thinking' }
    ];

    const profile = {
      voiceId: this.voiceId,
      characteristics: {
        personality: 'friendly-golden-retriever',
        tone: 'warm-encouraging',
        pace: 'conversational',
        technical_expertise: 'high'
      },
      samples: []
    };

    for (const phrase of testPhrases) {
      console.log(chalk.gray(`Testing ${phrase.mood} mood...`));

      try {
        await this.speak(phrase.text, phrase.mood);
        profile.samples.push({
          text: phrase.text,
          mood: phrase.mood,
          status: 'success'
        });
      } catch (error) {
        profile.samples.push({
          text: phrase.text,
          mood: phrase.mood,
          status: 'error',
          error: error.message
        });
      }
    }

    // Save voice profile
    const profilePath = path.join(this.audioPath, 'spec-voice-profile.json');
    await fs.writeFile(profilePath, JSON.stringify(profile, null, 2));

    console.log(chalk.green('✅ Voice profile generated and saved'));
    return profile;
  }

  async createVoiceDemo() {
    console.log(chalk.blue('🎵 Creating voice demonstration...'));

    const demoScript = [
      {
        text: "Hi there! I'm Spec, your golden retriever assistant for Spec-Driven Development!",
        mood: 'excited',
        pause: 1000
      },
      {
        text: "I'm here to guide you through creating amazing software specifications.",
        mood: 'helpful',
        pause: 800
      },
      {
        text: "Don't worry if this seems complex at first - we'll tackle it together, step by step.",
        mood: 'encouraging',
        pause: 1200
      },
      {
        text: "Let me think about the best way to get you started...",
        mood: 'thinking',
        pause: 1500
      },
      {
        text: "Perfect! I know exactly how we can make this both fun and productive!",
        mood: 'excited',
        pause: 500
      }
    ];

    for (const line of demoScript) {
      await this.speak(line.text, line.mood);
      if (line.pause) {
        await new Promise(resolve => setTimeout(resolve, line.pause));
      }
    }

    console.log(chalk.green('🎭 Voice demo completed!'));
  }

  async setVoiceEnabled(enabled) {
    this.enabled = enabled;

    if (enabled) {
      const isSetup = await this.checkSetup();
      if (isSetup) {
        await this.speak("Voice mode enabled! Now I can really talk to you!", 'excited');
      }
    } else {
      console.log(chalk.yellow('🔇 Voice mode disabled'));
    }
  }

  // Utility methods for integration with other components
  async announceProgress(current, total, task = 'Working') {
    if (current === total) {
      await this.speak(`Fantastic! We've completed ${task}!`, 'excited');
    } else {
      const percentage = Math.round((current / total) * 100);
      await this.speak(`We're ${percentage}% done with ${task}. Great progress!`, 'encouraging');
    }
  }

  async provideFeedback(type, message) {
    const moodMap = {
      success: 'excited',
      info: 'helpful',
      warning: 'thinking',
      error: 'helpful' // Still helpful even for errors
    };

    const mood = moodMap[type] || 'helpful';
    await this.speak(message, mood);
  }

  async askQuestion(question) {
    await this.speak(question, 'thinking');
  }
}

export default VoiceSynthesis;