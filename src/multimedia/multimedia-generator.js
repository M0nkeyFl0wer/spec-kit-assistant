import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import sharp from 'sharp';
import puppeteer from 'puppeteer';
import GIFEncoder from 'gifencoder';
import { Canvas, createCanvas, loadImage } from 'canvas';

export class MultimediaGenerator {
  constructor() {
    this.assetsPath = path.join(process.cwd(), 'assets');
    this.outputPath = path.join(this.assetsPath, 'generated');
    this.templates = {
      character: path.join(this.assetsPath, 'templates', 'character'),
      demos: path.join(this.assetsPath, 'templates', 'demos'),
      animations: path.join(this.assetsPath, 'templates', 'animations')
    };

    this.initializeDirectories();
  }

  async initializeDirectories() {
    await fs.ensureDir(this.outputPath);
    await fs.ensureDir(this.templates.character);
    await fs.ensureDir(this.templates.demos);
    await fs.ensureDir(this.templates.animations);
  }

  async generateCharacterArt(mood = 'happy', style = 'ascii') {
    console.log(chalk.blue('🎨 Generating Spec character art...'));

    if (style === 'ascii') {
      return this.generateASCIIArt(mood);
    } else if (style === 'canvas') {
      return await this.generateCanvasArt(mood);
    } else if (style === 'ai') {
      return await this.generateAIArt(mood);
    }
  }

  generateASCIIArt(mood) {
    const artTemplates = {
      happy: {
        face: `
${chalk.yellow('      /^-----^')}\\
     ${chalk.yellow('( ◕     ◕ )')}
      ${chalk.yellow('\\  ^___^  /')}
       ${chalk.brown('\\   ---   /')}
        ${chalk.brown('^^^     ^^^')}
        `,
        tail: '~~~',
        message: 'Ready to help!'
      },

      excited: {
        face: `
${chalk.yellow('      /^-----^')}\\
     ${chalk.yellow('( ★     ★ )')}
      ${chalk.yellow('\\   ∪∪∪   /')}
       ${chalk.brown('\\   ---   /')}
        ${chalk.brown('^^^  ^^^  ^^^')}
        `,
        tail: '~~~wagging~~~',
        message: 'This is going to be awesome!'
      },

      thinking: {
        face: `
${chalk.yellow('      /^-----^')}\\
     ${chalk.yellow('( •     • )')}
      ${chalk.yellow('\\    ?    /')}
       ${chalk.brown('\\   ---   /')}
        ${chalk.brown('^^^     ^^^')}
        `,
        tail: '...',
        message: 'Let me think about that...'
      },

      working: {
        face: `
${chalk.yellow('      /^-----^')}\\
     ${chalk.yellow('( ◔     ◔ )')}
      ${chalk.yellow('\\  ≡≡≡≡≡  /')}
       ${chalk.brown('\\   ---   /')}
        ${chalk.brown('^^^     ^^^')}
        `,
        tail: '~~~busy~~~',
        message: 'Working on it!'
      }
    };

    return artTemplates[mood] || artTemplates.happy;
  }

  async generateCanvasArt(mood) {
    const canvas = createCanvas(300, 200);
    const ctx = canvas.getContext('2d');

    // Golden retriever colors
    const goldenColor = '#FFD700';
    const darkGolden = '#B8860B';
    const black = '#000000';

    // Clear background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 300, 200);

    // Draw face
    ctx.fillStyle = goldenColor;
    ctx.beginPath();
    ctx.ellipse(150, 100, 80, 60, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Draw ears
    ctx.fillStyle = darkGolden;
    ctx.beginPath();
    ctx.ellipse(110, 80, 20, 30, -Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(190, 80, 20, 30, Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();

    // Draw eyes based on mood
    ctx.fillStyle = black;
    const eyePositions = { left: { x: 130, y: 90 }, right: { x: 170, y: 90 } };

    switch (mood) {
      case 'happy':
      case 'excited':
        // Happy eyes
        ctx.beginPath();
        ctx.ellipse(eyePositions.left.x, eyePositions.left.y, 8, 8, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(eyePositions.right.x, eyePositions.right.y, 8, 8, 0, 0, 2 * Math.PI);
        ctx.fill();
        break;

      case 'thinking':
        // Thoughtful eyes
        ctx.beginPath();
        ctx.ellipse(eyePositions.left.x, eyePositions.left.y, 6, 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(eyePositions.right.x, eyePositions.right.y, 6, 6, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Question mark
        ctx.font = '20px Arial';
        ctx.fillText('?', 145, 75);
        break;

      case 'working':
        // Focused eyes
        ctx.fillRect(eyePositions.left.x - 8, eyePositions.left.y - 2, 16, 4);
        ctx.fillRect(eyePositions.right.x - 8, eyePositions.right.y - 2, 16, 4);
        break;
    }

    // Draw nose
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.ellipse(150, 105, 4, 3, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Draw mouth based on mood
    ctx.strokeStyle = black;
    ctx.lineWidth = 2;
    ctx.beginPath();

    switch (mood) {
      case 'happy':
      case 'excited':
        // Smile
        ctx.arc(150, 110, 15, 0, Math.PI, false);
        break;
      case 'thinking':
        // Neutral
        ctx.moveTo(135, 115);
        ctx.lineTo(165, 115);
        break;
      case 'working':
        // Determined
        ctx.moveTo(140, 115);
        ctx.lineTo(160, 115);
        break;
    }
    ctx.stroke();

    // Save to file
    const fileName = `spec-${mood}-${Date.now()}.png`;
    const filePath = path.join(this.outputPath, fileName);
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(filePath, buffer);

    return {
      type: 'canvas',
      path: filePath,
      mood: mood,
      dimensions: { width: 300, height: 200 }
    };
  }

  async generateAIArt(mood, prompt = null) {
    // Placeholder for AI art generation using Stable Diffusion
    // This would integrate with an AI art API
    console.log(chalk.blue('🤖 Generating AI art for Spec...'));

    const basePrompt = `golden retriever character, friendly cartoon style,
                       clean simple design, mascot style, ${mood} expression`;

    const fullPrompt = prompt || basePrompt;

    console.log(chalk.gray(`Prompt: ${fullPrompt}`));

    // For now, return a placeholder
    return {
      type: 'ai-generated',
      prompt: fullPrompt,
      mood: mood,
      status: 'placeholder - would integrate with Stable Diffusion API'
    };
  }

  async generateDemo(topic, steps = []) {
    console.log(chalk.blue(`🎬 Generating demo for: ${topic}`));

    const demoName = topic.toLowerCase().replace(/\\s+/g, '-');
    const outputPath = path.join(this.outputPath, `${demoName}-demo.gif`);

    try {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });
      const page = await browser.newPage();

      // Set up demo page
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
              color: white;
            }
            .demo-container {
              max-width: 800px;
              margin: 0 auto;
              background: rgba(255,255,255,0.1);
              border-radius: 15px;
              padding: 30px;
              backdrop-filter: blur(10px);
            }
            .step {
              background: rgba(255,255,255,0.2);
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              transform: translateY(20px);
              opacity: 0;
              transition: all 0.5s ease;
            }
            .step.active {
              transform: translateY(0);
              opacity: 1;
            }
            .step-number {
              background: #4CAF50;
              color: white;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
            }
            .spec-character {
              font-size: 2em;
              text-align: center;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="demo-container">
            <div class="spec-character">🐕 Spec's ${topic} Demo</div>
            <div id="steps-container"></div>
          </div>
        </body>
        </html>
      `);

      // Generate frames
      const frames = [];
      const defaultSteps = [
        { title: 'Getting Started', description: 'Spec introduces the topic' },
        { title: 'Key Concepts', description: 'Understanding the fundamentals' },
        { title: 'Hands-on Example', description: 'Seeing it in action' },
        { title: 'Next Steps', description: 'What to do next' }
      ];

      const demoSteps = steps.length > 0 ? steps : defaultSteps;

      for (let i = 0; i < demoSteps.length; i++) {
        await page.evaluate((stepIndex, step) => {
          const container = document.getElementById('steps-container');
          const stepElement = document.createElement('div');
          stepElement.className = 'step active';
          stepElement.innerHTML = `
            <span class="step-number">${stepIndex + 1}</span>
            <strong>${step.title}</strong><br>
            <span style="color: #ddd;">${step.description}</span>
          `;
          container.appendChild(stepElement);
        }, i, demoSteps[i]);

        // Take screenshot
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: true
        });
        frames.push(screenshot);

        await page.waitForTimeout(1000);
      }

      await browser.close();

      // Create GIF from frames
      await this.createGIF(frames, outputPath);

      return {
        type: 'demo-gif',
        topic: topic,
        path: outputPath,
        frames: frames.length
      };

    } catch (error) {
      console.error(chalk.red('Error generating demo:'), error);
      return {
        type: 'demo-error',
        error: error.message
      };
    }
  }

  async createGIF(frames, outputPath) {
    const firstFrame = await sharp(frames[0]).metadata();
    const encoder = new GIFEncoder(firstFrame.width, firstFrame.height);

    const writeStream = fs.createWriteStream(outputPath);
    encoder.createReadStream().pipe(writeStream);

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(1000);
    encoder.setQuality(10);

    for (const frame of frames) {
      const { data, info } = await sharp(frame)
        .resize(800, 600)
        .raw()
        .toBuffer({ resolveWithObject: true });

      encoder.addFrame(data);
    }

    encoder.finish();

    return new Promise((resolve) => {
      writeStream.on('finish', resolve);
    });
  }

  async generateStepByStepGIF(process, steps) {
    console.log(chalk.blue(`📹 Creating step-by-step GIF for: ${process}`));

    // This would create an animated GIF showing each step
    const frames = [];

    for (let i = 0; i < steps.length; i++) {
      const frame = await this.createStepFrame(steps[i], i + 1, steps.length);
      frames.push(frame);
    }

    const outputPath = path.join(this.outputPath, `${process}-steps.gif`);
    await this.createGIF(frames, outputPath);

    return {
      type: 'step-by-step-gif',
      process: process,
      path: outputPath,
      steps: steps.length
    };
  }

  async createStepFrame(step, stepNumber, totalSteps) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, 800, 400);

    // Step indicator
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Step ${stepNumber} of ${totalSteps}`, 50, 50);

    // Step content
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '20px Arial';
    ctx.fillText(step.title, 50, 100);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#bdc3c7';

    const words = step.description.split(' ');
    let line = '';
    let y = 140;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > 700 && n > 0) {
        ctx.fillText(line, 50, y);
        line = words[n] + ' ';
        y += 25;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 50, y);

    // Progress bar
    const progressWidth = (stepNumber / totalSteps) * 700;
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(50, 350, 700, 10);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(50, 350, progressWidth, 10);

    return canvas.toBuffer('image/png');
  }

  async showCelebration() {
    // Show celebration animation
    const celebrations = [
      '🎉✨🐕✨🎉',
      '🌟🎊🐾🎊🌟',
      '⭐🎈🦴🎈⭐'
    ];

    for (const celebration of celebrations) {
      console.log(chalk.yellow.bold(`\n    ${celebration}\n`));
      await this.delay(300);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateInteractiveDemo(topic) {
    console.log(chalk.blue(`🎮 Creating interactive demo for: ${topic}`));

    // This would create an interactive HTML demo that users can follow along with
    const demoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spec's ${topic} Interactive Demo</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
          }
          .demo-header {
            text-align: center;
            margin-bottom: 40px;
          }
          .spec-avatar {
            font-size: 4em;
            margin-bottom: 20px;
          }
          .interactive-step {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 30px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
          }
          .step-button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
            transition: all 0.3s ease;
          }
          .step-button:hover {
            background: #45a049;
            transform: translateY(-2px);
          }
          .code-example {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            margin: 15px 0;
            overflow-x: auto;
          }
          .progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            margin: 20px 0;
          }
          .progress-fill {
            height: 100%;
            background: #2ecc71;
            border-radius: 4px;
            transition: width 0.3s ease;
          }
        </style>
      </head>
      <body>
        <div class="demo-header">
          <div class="spec-avatar">🐕</div>
          <h1>Spec's ${topic} Interactive Demo</h1>
          <p>Follow along with Spec as we explore ${topic} together!</p>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" id="progress" style="width: 0%"></div>
        </div>

        <div id="demo-content">
          <!-- Dynamic content will be loaded here -->
        </div>

        <script>
          // Interactive demo logic would go here
          let currentStep = 0;
          const totalSteps = 5;

          function nextStep() {
            currentStep++;
            updateProgress();
            loadStep(currentStep);
          }

          function updateProgress() {
            const progress = (currentStep / totalSteps) * 100;
            document.getElementById('progress').style.width = progress + '%';
          }

          function loadStep(stepNumber) {
            // Load step content dynamically
            console.log('Loading step:', stepNumber);
          }

          // Initialize first step
          loadStep(0);
        </script>
      </body>
      </html>
    `;

    const outputPath = path.join(this.outputPath, `${topic}-interactive-demo.html`);
    await fs.writeFile(outputPath, demoHTML);

    return {
      type: 'interactive-demo',
      topic: topic,
      path: outputPath,
      url: `file://${outputPath}`
    };
  }
}

export default MultimediaGenerator;