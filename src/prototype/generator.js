import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { DogArt } from '../character/dog-art.js';
import { execSync } from 'child_process';

/**
 * 🚀 Prototype Generator - From Spec to Working Code!
 * Takes your specification and generates a working prototype
 */
export class PrototypeGenerator {
  constructor() {
    this.templates = {
      'web-app': this.generateWebApp.bind(this),
      'mobile-app': this.generateMobileApp.bind(this),
      'api-service': this.generateAPIService.bind(this),
      'cli-tool': this.generateCLITool.bind(this),
      'data-project': this.generateDataProject.bind(this),
      'game': this.generateGame.bind(this)
    };
  }

  async specToPrototype(spec = null) {
    console.log(chalk.cyan(DogArt.builder));
    console.log(chalk.green('🐕 Spec: "Time to turn your vision into reality! Building prototype..."'));
    console.log('');

    // If no spec provided, try to find one
    if (!spec) {
      spec = await this.findOrCreateSpec();
    }

    if (!spec) {
      console.log(chalk.red('❌ No specification found. Let\'s create one first!'));
      return null;
    }

    const projectType = spec.type || spec.metadata?.type || 'web-app';
    const projectName = this.sanitizeProjectName(spec.name || spec.metadata?.name || 'awesome-project');

    console.log(chalk.yellow(`🎯 Building ${projectType} prototype: ${projectName}`));
    console.log('');

    try {
      // Create project directory
      const projectPath = await this.createProjectStructure(projectName);

      // Generate code based on project type
      const generator = this.templates[projectType];
      if (generator) {
        await generator(spec, projectPath);
      } else {
        await this.generateGenericProject(spec, projectPath);
      }

      await this.finalizeProject(projectPath, spec);

      console.log(chalk.cyan(DogArt.celebrating));
      console.log(chalk.green('🎉 Prototype complete! Your vision is now reality!'));
      console.log(chalk.yellow(`📁 Project location: ${projectPath}`));
      console.log('');

      await this.showNextSteps(projectPath, projectType);

      return projectPath;

    } catch (error) {
      console.error(chalk.red('❌ Prototype generation failed:'), error.message);
      console.log(chalk.yellow('🐕 Spec: "Don\'t worry! Let\'s try a simpler approach..."'));
      await this.generateMinimalPrototype(spec);
    }
  }

  async findOrCreateSpec() {
    // Look for existing spec files
    const specFiles = ['spec.yaml', 'spec.yml', 'spec.json', 'specification.yaml'];

    for (const filename of specFiles) {
      if (await fs.pathExists(filename)) {
        console.log(chalk.green(`✅ Found specification: ${filename}`));
        const content = await fs.readFile(filename, 'utf8');

        try {
          if (filename.endsWith('.json')) {
            return JSON.parse(content);
          } else {
            // Simple YAML parsing for basic specs
            const lines = content.split('\n');
            const spec = {};
            for (const line of lines) {
              const [key, ...values] = line.split(':');
              if (key && values.length > 0) {
                spec[key.trim()] = values.join(':').trim();
              }
            }
            return spec;
          }
        } catch (error) {
          console.log(chalk.yellow(`⚠️ Could not parse ${filename}, will create new spec`));
        }
      }
    }

    return null;
  }

  sanitizeProjectName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  async createProjectStructure(projectName) {
    const projectPath = path.join(process.cwd(), projectName);

    if (await fs.pathExists(projectPath)) {
      console.log(chalk.yellow(`📁 Directory ${projectName} exists, creating with timestamp...`));
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const newPath = path.join(process.cwd(), `${projectName}-${timestamp}`);
      await fs.ensureDir(newPath);
      return newPath;
    }

    await fs.ensureDir(projectPath);
    console.log(chalk.green(`✅ Created project directory: ${projectName}`));
    return projectPath;
  }

  async generateWebApp(spec, projectPath) {
    console.log(chalk.cyan(DogArt.cyber));
    console.log(chalk.blue('🐕 Spec: "Building a beautiful web app! *excited coding*"'));
    console.log('');

    const frontend = spec.frontend || spec['frontend-framework']?.value || 'react';

    // Create package.json
    const packageJson = {
      name: path.basename(projectPath),
      version: '1.0.0',
      description: spec.vision || spec.description || 'An amazing web application',
      scripts: {
        start: frontend === 'react' ? 'npm run dev' : 'npx http-server .',
        dev: frontend === 'react' ? 'vite' : 'npx http-server . -p 3000',
        build: frontend === 'react' ? 'vite build' : 'echo "No build process for vanilla JS"',
        preview: frontend === 'react' ? 'vite preview' : 'npm run dev'
      },
      dependencies: {},
      devDependencies: {}
    };

    if (frontend === 'react') {
      packageJson.dependencies = {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      };
      packageJson.devDependencies = {
        '@vitejs/plugin-react': '^4.0.0',
        'vite': '^4.4.0'
      };
    }

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    if (frontend === 'react') {
      await this.generateReactApp(spec, projectPath);
    } else {
      await this.generateVanillaWebApp(spec, projectPath);
    }

    // Create README
    await this.generateREADME(spec, projectPath);

    console.log(chalk.green('✅ Web app structure created!'));
  }

  async generateReactApp(spec, projectPath) {
    // Create Vite config
    const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
`;
    await fs.writeFile(path.join(projectPath, 'vite.config.js'), viteConfig.trim());

    // Create index.html
    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${spec.name || 'Amazing App'}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
    await fs.writeFile(path.join(projectPath, 'index.html'), indexHtml.trim());

    // Create src directory and files
    const srcPath = path.join(projectPath, 'src');
    await fs.ensureDir(srcPath);

    // Main app component
    const appComponent = `
import React, { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎉 ${spec.name || 'Your Amazing App'}</h1>
        <p>${spec.vision || spec.description || 'Welcome to your new application!'}</p>

        <div className="feature-showcase">
          <h2>✨ Special Feature</h2>
          <p>${spec.specialFeature || spec.special_feature || 'This app is going to be incredible!'}</p>
        </div>

        <div className="counter-demo">
          <button onClick={() => setCount(count + 1)}>
            Count: {count} 🎯
          </button>
          <p>Click the button to see React in action!</p>
        </div>

        <div className="next-steps">
          <h3>🚀 Next Steps:</h3>
          <ul>
            <li>Customize this component in src/App.jsx</li>
            <li>Add your amazing features</li>
            <li>Style with CSS or your favorite UI library</li>
            <li>Deploy when ready!</li>
          </ul>
        </div>
      </header>
    </div>
  )
}

export default App
`;
    await fs.writeFile(path.join(srcPath, 'App.jsx'), appComponent.trim());

    // App CSS
    const appCSS = `
.App {
  text-align: center;
  color: white;
}

.App-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  margin: 2rem auto;
  max-width: 800px;
}

.feature-showcase {
  background: rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  border-radius: 15px;
  margin: 1.5rem 0;
}

.counter-demo button {
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
  border: none;
  color: white;
  padding: 15px 30px;
  font-size: 18px;
  border-radius: 25px;
  cursor: pointer;
  transition: transform 0.2s;
}

.counter-demo button:hover {
  transform: scale(1.05);
}

.next-steps {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 15px;
  margin: 1.5rem 0;
}

.next-steps ul {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.next-steps li {
  margin: 0.5rem 0;
}
`;
    await fs.writeFile(path.join(srcPath, 'App.css'), appCSS.trim());

    // Main entry point
    const mainJsx = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
    await fs.writeFile(path.join(srcPath, 'main.jsx'), mainJsx.trim());
  }

  async generateVanillaWebApp(spec, projectPath) {
    // Create index.html
    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${spec.name || 'Amazing App'}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>🎉 ${spec.name || 'Your Amazing App'}</h1>
        <p>${spec.vision || spec.description || 'Welcome to your new application!'}</p>
    </header>

    <main>
        <section class="feature-showcase">
            <h2>✨ Special Feature</h2>
            <p>${spec.specialFeature || spec.special_feature || 'This app is going to be incredible!'}</p>
        </section>

        <section class="interactive-demo">
            <h3>🎯 Interactive Demo</h3>
            <button id="demo-button">Click me!</button>
            <p id="demo-output">JavaScript is working!</p>
        </section>

        <section class="next-steps">
            <h3>🚀 Next Steps:</h3>
            <ul>
                <li>Customize the HTML structure</li>
                <li>Style with CSS in style.css</li>
                <li>Add JavaScript functionality in script.js</li>
                <li>Deploy to your favorite hosting service</li>
            </ul>
        </section>
    </main>

    <script src="script.js"></script>
</body>
</html>
`;
    await fs.writeFile(path.join(projectPath, 'index.html'), indexHtml.trim());

    // Create CSS
    const css = `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: white;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

header {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 2rem;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    margin-bottom: 2rem;
}

main {
    max-width: 800px;
    margin: 0 auto;
}

section {
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 15px;
    margin: 1.5rem 0;
    backdrop-filter: blur(10px);
}

.interactive-demo button {
    background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
    border: none;
    color: white;
    padding: 15px 30px;
    font-size: 18px;
    border-radius: 25px;
    cursor: pointer;
    transition: transform 0.2s;
}

.interactive-demo button:hover {
    transform: scale(1.05);
}

.next-steps ul {
    padding-left: 1.5rem;
}

.next-steps li {
    margin: 0.5rem 0;
}

h1, h2, h3 {
    margin-bottom: 1rem;
}

#demo-output {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
}
`;
    await fs.writeFile(path.join(projectPath, 'style.css'), css.trim());

    // Create JavaScript
    const js = `
// Welcome to your amazing app's JavaScript!

document.addEventListener('DOMContentLoaded', function() {
    const demoButton = document.getElementById('demo-button');
    const demoOutput = document.getElementById('demo-output');
    let clickCount = 0;

    demoButton.addEventListener('click', function() {
        clickCount++;

        const messages = [
            '🎉 Awesome! Your app is working!',
            '🚀 You clicked me again! So interactive!',
            '⭐ This is going to be amazing!',
            '🎯 Keep building awesome features!',
            '💫 The possibilities are endless!'
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        demoOutput.innerHTML = \`
            <strong>Click #\${clickCount}:</strong><br>
            \${randomMessage}
        \`;

        // Add some visual flair
        demoOutput.style.transform = 'scale(1.05)';
        setTimeout(() => {
            demoOutput.style.transform = 'scale(1)';
        }, 200);
    });

    // Add welcome message
    console.log('🎉 Welcome to your amazing app! Ready to build something incredible?');
});
`;
    await fs.writeFile(path.join(projectPath, 'script.js'), js.trim());
  }

  async generateREADME(spec, projectPath) {
    const projectName = path.basename(projectPath);
    const readme = `
# ${spec.name || projectName}

${spec.vision || spec.description || 'An amazing application built with spec-driven development!'}

## ✨ Special Features

${spec.specialFeature || spec.special_feature || 'This project has incredible potential!'}

## 🚀 Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open your browser to see the magic! 🎉

## 🏗️ Project Structure

\`\`\`
${projectName}/
├── src/                 # Source code
├── package.json         # Dependencies and scripts
├── README.md           # This file
└── ...                 # Other project files
\`\`\`

## 🎯 Next Steps

- [ ] Customize the design and layout
- [ ] Add your core features
- [ ] Implement user interactions
- [ ] Add tests for reliability
- [ ] Deploy to production

## 🐕 Built with Spec

This project was generated using Spec Kit Assistant - your friendly Golden Retriever guide to spec-driven development!

*"Woof! Every great app starts with a great specification!"* - Spec 🐕

---

Happy coding! 🎉
`;
    await fs.writeFile(path.join(projectPath, 'README.md'), readme.trim());
  }

  async generateMobileApp(spec, projectPath) {
    console.log(chalk.cyan(DogArt.space));
    console.log(chalk.blue('🐕 Spec: "Building a mobile app! Ready for the app stores!"'));
    console.log('');

    // For now, create a React Native template structure
    const packageJson = {
      name: path.basename(projectPath),
      version: '1.0.0',
      description: spec.vision || 'An amazing mobile application',
      scripts: {
        start: 'npx react-native start',
        android: 'npx react-native run-android',
        ios: 'npx react-native run-ios'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-native': '^0.72.0'
      }
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create a simple React Native template
    const appJs = `
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎉 ${spec.name || 'Your Amazing App'}</Text>
        <Text style={styles.description}>
          ${spec.vision || spec.description || 'Welcome to your new mobile application!'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Special Feature</Text>
        <Text style={styles.sectionText}>
          ${spec.specialFeature || spec.special_feature || 'This app is going to be incredible!'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Interactive Demo</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>Tap Count: {count}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Next Steps</Text>
        <Text style={styles.listItem}>• Customize this component</Text>
        <Text style={styles.listItem}>• Add navigation between screens</Text>
        <Text style={styles.listItem}>• Implement your core features</Text>
        <Text style={styles.listItem}>• Test on real devices</Text>
        <Text style={styles.listItem}>• Submit to app stores!</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 20,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: 'white',
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listItem: {
    fontSize: 14,
    color: 'white',
    marginBottom: 5,
  },
});

export default App;
`;
    await fs.writeFile(path.join(projectPath, 'App.js'), appJs.trim());

    await this.generateREADME(spec, projectPath);
    console.log(chalk.green('✅ Mobile app structure created!'));
  }

  async generateAPIService(spec, projectPath) {
    console.log(chalk.cyan(DogArt.builder));
    console.log(chalk.blue('🐕 Spec: "Building a powerful API service! Backend magic incoming!"'));
    console.log('');

    const packageJson = {
      name: path.basename(projectPath),
      version: '1.0.0',
      description: spec.vision || 'An amazing API service',
      main: 'server.js',
      scripts: {
        start: 'node server.js',
        dev: 'nodemon server.js',
        test: 'echo "Add your tests here"'
      },
      dependencies: {
        'express': '^4.18.0',
        'cors': '^2.8.5',
        'dotenv': '^16.0.0'
      },
      devDependencies: {
        'nodemon': '^2.0.20'
      }
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create server.js
    const serverJs = `
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: '🎉 ${spec.name || 'Your Amazing API'} is running!',
    description: '${spec.vision || 'An incredible API service'}',
    version: '1.0.0',
    endpoints: {
      '/': 'This welcome message',
      '/api/health': 'Health check',
      '/api/features': 'List of amazing features'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Features endpoint
app.get('/api/features', (req, res) => {
  res.json({
    features: [
      {
        name: 'Amazing Feature',
        description: '${spec.specialFeature || spec.special_feature || 'This API has incredible capabilities!'}',
        status: 'active'
      },
      {
        name: 'Spec-Driven Development',
        description: 'Built with careful planning and specification',
        status: 'active'
      }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`🎯 Visit http://localhost:\${PORT} to see your API\`);
});
`;
    await fs.writeFile(path.join(projectPath, 'server.js'), serverJs.trim());

    // Create .env file
    const envFile = `
PORT=3000
NODE_ENV=development

# Add your environment variables here
# DATABASE_URL=
# API_SECRET=
`;
    await fs.writeFile(path.join(projectPath, '.env'), envFile.trim());

    await this.generateREADME(spec, projectPath);
    console.log(chalk.green('✅ API service structure created!'));
  }

  async generateCLITool(spec, projectPath) {
    console.log(chalk.cyan(DogArt.ninja));
    console.log(chalk.blue('🐕 Spec: "Building a CLI tool! Command-line magic!"'));
    console.log('');

    const packageJson = {
      name: path.basename(projectPath),
      version: '1.0.0',
      description: spec.vision || 'An amazing CLI tool',
      main: 'cli.js',
      bin: {
        [path.basename(projectPath)]: './cli.js'
      },
      scripts: {
        start: 'node cli.js',
        test: 'echo "Add your tests here"'
      },
      dependencies: {
        'commander': '^9.4.0',
        'chalk': '^5.0.0'
      }
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create CLI
    const cliJs = `
#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');

const program = new Command();

program
  .name('${path.basename(projectPath)}')
  .description('${spec.vision || 'An amazing CLI tool'}')
  .version('1.0.0');

program
  .command('hello')
  .description('Say hello')
  .argument('[name]', 'name to greet', 'World')
  .action((name) => {
    console.log(chalk.green(\`🎉 Hello \${name}! Welcome to your CLI tool!\`));
    console.log(chalk.blue('✨ Special feature: ${spec.specialFeature || 'This tool is amazing!'}'));
  });

program
  .command('features')
  .description('Show available features')
  .action(() => {
    console.log(chalk.yellow('🚀 Available Features:'));
    console.log(chalk.cyan('  • Interactive commands'));
    console.log(chalk.cyan('  • Beautiful colored output'));
    console.log(chalk.cyan('  • Easy to extend and customize'));
    console.log(chalk.cyan('  • ${spec.specialFeature || 'Your amazing feature here!'}'));
  });

program.parse();
`;
    await fs.writeFile(path.join(projectPath, 'cli.js'), cliJs.trim());

    // Make CLI executable
    await fs.chmod(path.join(projectPath, 'cli.js'), 0o755);

    await this.generateREADME(spec, projectPath);
    console.log(chalk.green('✅ CLI tool structure created!'));
  }

  async generateDataProject(spec, projectPath) {
    console.log(chalk.cyan(DogArt.scientist));
    console.log(chalk.blue('🐕 Spec: "Building a data project! Science incoming!"'));
    console.log('');

    // Python data project
    const requirementsTxt = `
pandas>=1.3.0
numpy>=1.21.0
matplotlib>=3.4.0
jupyter>=1.0.0
`;
    await fs.writeFile(path.join(projectPath, 'requirements.txt'), requirementsTxt.trim());

    const mainPy = `
#!/usr/bin/env python3
"""
${spec.name || 'Amazing Data Project'}
${spec.vision || 'A powerful data processing and analysis tool'}
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def main():
    print("🎉 Welcome to your data project!")
    print("✨ Special feature: ${spec.specialFeature || 'Advanced data insights!'}")

    # Sample data generation
    data = {
        'values': np.random.randn(100),
        'categories': np.random.choice(['A', 'B', 'C'], 100),
        'timestamps': pd.date_range('2023-01-01', periods=100, freq='D')
    }

    df = pd.DataFrame(data)
    print(f"📊 Generated sample dataset with {len(df)} rows")

    # Basic analysis
    print("\\n📈 Basic Statistics:")
    print(df['values'].describe())

    # Simple visualization
    plt.figure(figsize=(10, 6))
    df.groupby('categories')['values'].mean().plot(kind='bar')
    plt.title('Average Values by Category')
    plt.ylabel('Average Value')
    plt.savefig('analysis_results.png')
    print("📊 Saved visualization to 'analysis_results.png'")

if __name__ == "__main__":
    main()
`;
    await fs.writeFile(path.join(projectPath, 'main.py'), mainPy.trim());

    await this.generateREADME(spec, projectPath);
    console.log(chalk.green('✅ Data project structure created!'));
  }

  async generateGame(spec, projectPath) {
    console.log(chalk.cyan(DogArt.gaming));
    console.log(chalk.blue('🐕 Spec: "Building a game! Fun times ahead!"'));
    console.log('');

    // Simple HTML5 Canvas game
    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${spec.name || 'Amazing Game'}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
            color: white;
        }

        .game-container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }

        canvas {
            border: 2px solid white;
            border-radius: 10px;
            background: #1a1a2e;
        }

        .controls {
            margin-top: 1rem;
        }

        button {
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            border: none;
            color: white;
            padding: 10px 20px;
            margin: 0 5px;
            border-radius: 15px;
            cursor: pointer;
            font-size: 16px;
        }

        button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="game-container">
        <h1>🎮 ${spec.name || 'Your Amazing Game'}</h1>
        <p>${spec.vision || 'An incredible gaming experience!'}</p>

        <canvas id="gameCanvas" width="800" height="400"></canvas>

        <div class="controls">
            <button onclick="startGame()">Start Game</button>
            <button onclick="pauseGame()">Pause</button>
            <button onclick="resetGame()">Reset</button>
        </div>

        <p>✨ Special Feature: ${spec.specialFeature || 'Amazing gameplay mechanics!'}</p>
        <p>Use arrow keys or WASD to play!</p>
    </div>

    <script src="game.js"></script>
</body>
</html>
`;
    await fs.writeFile(path.join(projectPath, 'index.html'), indexHtml.trim());

    const gameJs = `
// ${spec.name || 'Amazing Game'} - Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let animationId;

// Player object
const player = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    speed: 5,
    color: '#FF6B6B'
};

// Game objects
const objects = [];
let score = 0;

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Game functions
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameLoop();
    }
}

function pauseGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
}

function resetGame() {
    pauseGame();
    player.x = 50;
    player.y = canvas.height / 2;
    objects.length = 0;
    score = 0;
}

function update() {
    if (!gameRunning) return;

    // Player movement
    if (keys['arrowup'] || keys['w']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['arrowdown'] || keys['s']) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }
    if (keys['arrowleft'] || keys['a']) {
        player.x = Math.max(0, player.x - player.speed);
    }
    if (keys['arrowright'] || keys['d']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }

    // Spawn objects randomly
    if (Math.random() < 0.02) {
        objects.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 20),
            width: 20,
            height: 20,
            speed: 3,
            color: '#4ECDC4'
        });
    }

    // Update objects
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        obj.x -= obj.speed;

        // Remove objects that are off-screen
        if (obj.x + obj.width < 0) {
            objects.splice(i, 1);
            score += 10;
        }

        // Simple collision detection
        if (player.x < obj.x + obj.width &&
            player.x + player.width > obj.x &&
            player.y < obj.y + obj.height &&
            player.y + player.height > obj.y) {
            // Collision! For now, just score points
            objects.splice(i, 1);
            score += 50;
        }
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw objects
    objects.forEach(obj => {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    });

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(\`Score: \${score}\`, 10, 30);

    // Draw instructions if not started
    if (!gameRunning && score === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click Start Game to begin!', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Use arrow keys or WASD to move', canvas.width / 2, canvas.height / 2 + 30);
        ctx.textAlign = 'left';
    }
}

function gameLoop() {
    update();
    draw();

    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Initial draw
draw();

// Welcome message
console.log('🎮 Welcome to your amazing game!');
console.log('✨ Special feature: ${spec.specialFeature || 'Incredible gameplay!'}');
`;
    await fs.writeFile(path.join(projectPath, 'game.js'), gameJs.trim());

    await this.generateREADME(spec, projectPath);
    console.log(chalk.green('✅ Game structure created!'));
  }

  async generateGenericProject(spec, projectPath) {
    console.log(chalk.cyan(DogArt.wizard));
    console.log(chalk.blue('🐕 Spec: "Creating a custom project structure! Magic happening!"'));
    console.log('');

    // Create a basic project structure
    const packageJson = {
      name: path.basename(projectPath),
      version: '1.0.0',
      description: spec.vision || spec.description || 'An amazing project',
      main: 'index.js',
      scripts: {
        start: 'node index.js',
        test: 'echo "Add your tests here"'
      }
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const indexJs = `
// ${spec.name || 'Amazing Project'}
// ${spec.vision || 'Built with spec-driven development'}

console.log('🎉 Welcome to your amazing project!');
console.log('✨ Special feature: ${spec.specialFeature || 'This project is incredible!'}');

// Your awesome code goes here!
function main() {
    console.log('🚀 Project is running successfully!');
    console.log('🎯 Time to add your amazing features!');
}

main();
`;
    await fs.writeFile(path.join(projectPath, 'index.js'), indexJs.trim());

    await this.generateREADME(spec, projectPath);
    console.log(chalk.green('✅ Generic project structure created!'));
  }

  async finalizeProject(projectPath, spec) {
    // Create .gitignore
    const gitignore = `
node_modules/
.env
.DS_Store
*.log
dist/
build/
coverage/
.nyc_output/
`;
    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore.trim());

    // Try to install dependencies if package.json exists
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      console.log(chalk.yellow('📦 Installing dependencies...'));
      try {
        execSync('npm install', { cwd: projectPath, stdio: 'pipe' });
        console.log(chalk.green('✅ Dependencies installed!'));
      } catch (error) {
        console.log(chalk.yellow('⚠️ Dependencies will need to be installed manually'));
        console.log(chalk.gray('Run: cd ' + path.basename(projectPath) + ' && npm install'));
      }
    }
  }

  async generateMinimalPrototype(spec) {
    console.log(chalk.cyan(DogArt.chibi));
    console.log(chalk.blue('🐕 Spec: "Creating a simple prototype! Sometimes simple is best!"'));
    console.log('');

    const projectName = this.sanitizeProjectName(spec.name || 'simple-prototype');
    const projectPath = await this.createProjectStructure(projectName);

    // Create a single HTML file with everything
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${spec.name || 'Simple Prototype'}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        button {
            background: #FF6B6B;
            border: none;
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        button:hover {
            background: #ff5252;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 ${spec.name || 'Your Simple Prototype'}</h1>
        <p>${spec.vision || spec.description || 'A simple but powerful prototype!'}</p>

        <h2>✨ Special Feature</h2>
        <p>${spec.specialFeature || spec.special_feature || 'This prototype is amazing!'}</p>

        <h3>🎯 Interactive Demo</h3>
        <button onclick="demo()">Click me!</button>
        <p id="output">Ready for interaction!</p>

        <h3>🚀 Next Steps</h3>
        <ul>
            <li>Open this file in your browser</li>
            <li>Customize the content and styling</li>
            <li>Add more features and interactions</li>
            <li>Expand into a full application</li>
        </ul>
    </div>

    <script>
        let clickCount = 0;
        function demo() {
            clickCount++;
            document.getElementById('output').innerHTML =
                \`🎉 Clicked \${clickCount} times! Your prototype is working perfectly!\`;
        }

        console.log('🎊 Simple prototype loaded! Built with Spec Kit Assistant!');
    </script>
</body>
</html>
`;

    await fs.writeFile(path.join(projectPath, 'index.html'), htmlContent.trim());

    console.log(chalk.green('🎊 Simple prototype complete!'));
    console.log(chalk.yellow(`📁 Open ${projectPath}/index.html in your browser!`));

    return projectPath;
  }

  async showNextSteps(projectPath, projectType) {
    console.log(chalk.yellow('🚀 Next Steps:'));
    console.log(chalk.cyan(`   1. cd ${path.basename(projectPath)}`));

    switch (projectType) {
      case 'web-app':
        console.log(chalk.cyan('   2. npm install'));
        console.log(chalk.cyan('   3. npm run dev'));
        console.log(chalk.cyan('   4. Open http://localhost:3000'));
        break;
      case 'api-service':
        console.log(chalk.cyan('   2. npm install'));
        console.log(chalk.cyan('   3. npm start'));
        console.log(chalk.cyan('   4. Visit http://localhost:3000'));
        break;
      case 'cli-tool':
        console.log(chalk.cyan('   2. npm install'));
        console.log(chalk.cyan('   3. node cli.js hello'));
        break;
      case 'game':
        console.log(chalk.cyan('   2. Open index.html in your browser'));
        console.log(chalk.cyan('   3. Click "Start Game" and play!'));
        break;
      default:
        console.log(chalk.cyan('   2. Follow the README instructions'));
        console.log(chalk.cyan('   3. Start building your amazing features!'));
    }

    console.log('');
    console.log(chalk.green('🐕 Spec: "Your prototype is ready! Time to build something amazing!" 🎉'));
  }

  async generateFromCurrentSpec() {
    return await this.specToPrototype();
  }

  async generateFromSpec(spec) {
    return await this.specToPrototype(spec);
  }
}

export default PrototypeGenerator;