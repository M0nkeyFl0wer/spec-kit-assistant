# 🌱 Spec Kit Assistant - Technical Specification

**Version**: 1.0.0
**Date**: 2025-10-04
**Status**: Active Development
**Branch**: `main`

## 📋 Executive Summary

Spec Kit Assistant is a friendly wrapper and enhancement layer for GitHub's official Spec Kit, adding:
1. Accessible UX with dog assistant character
2. Optional swarm orchestration for implementation
3. SSH deployment capabilities to Remote-Server server
4. Progressive feature disclosure

**Key Constraint**: Must be a TRUE FORK that wraps the real `specify` CLI, not reimplementation.

## 🎯 Requirements

### Functional Requirements

#### FR1: Wrapper Functionality
- **FR1.1**: Display friendly logo on startup with official Spec Kit colors
- **FR1.2**: Show helpful commands when run without arguments
- **FR1.3**: Pass all commands transparently to official `specify` CLI
- **FR1.4**: Preserve all stdout/stderr from underlying Spec Kit
- **FR1.5**: Exit with same code as underlying `specify` command

#### FR2: UX Enhancements
- **FR2.1**: Clear terminal-first startup (not Claude Code UI)
- **FR2.2**: Fast load time (< 500ms for wrapper overhead)
- **FR2.3**: Friendly error messages with suggestions
- **FR2.4**: Progressive command discovery (simple → advanced)
- **FR2.5**: Dog assistant character consistency throughout

#### FR3: Swarm Integration (Optional)
- **FR3.1**: Swarms only initialize when explicitly requested
- **FR3.2**: Gemini Queen Coordinator loads lazily
- **FR3.3**: Support existing swarm types: data-science, builder-ux, red-team, production
- **FR3.4**: Clear swarm status and progress indicators
- **FR3.5**: Graceful degradation if swarm dependencies missing

#### FR4: Remote-Server SSH Deployment
- **FR4.1**: Secure SSH connection to REMOTE_HOST:REMOTE_PORT
- **FR4.2**: Use system keyring for credentials (never hardcode)
- **FR4.3**: Deploy swarm operations to remote Remote-Server server
- **FR4.4**: Monitor remote execution status
- **FR4.5**: Retrieve results from remote execution

### Non-Functional Requirements

#### NFR1: Performance
- **NFR1.1**: Wrapper startup < 500ms
- **NFR1.2**: SSH connection establishment < 2s
- **NFR1.3**: No performance degradation vs raw `specify` CLI
- **NFR1.4**: Swarm lazy-loading adds < 100ms when triggered

#### NFR2: Security
- **NFR2.1**: No hardcoded credentials anywhere in codebase
- **NFR2.2**: Secure SSH key management via system keyring
- **NFR2.3**: File operations validated against path traversal
- **NFR2.4**: No arbitrary code execution from user input
- **NFR2.5**: Audit logging for remote operations

#### NFR3: Maintainability
- **NFR3.1**: Clear separation: wrapper vs official Spec Kit
- **NFR3.2**: Comprehensive inline documentation
- **NFR3.3**: Unit tests for wrapper logic (> 80% coverage)
- **NFR3.4**: Integration tests with real `specify` CLI
- **NFR3.5**: Clear upgrade path when Spec Kit updates

#### NFR4: Compatibility
- **NFR4.1**: Support Node.js >= 18.x
- **NFR4.2**: Support Python >= 3.11 (for Spec Kit)
- **NFR4.3**: Compatible with official Spec Kit v0.0.17+
- **NFR4.4**: Works on Linux, macOS, Windows (WSL)

## 🏗️ Architecture

### Component Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    User Terminal                          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│         Spec Kit Assistant (Node.js Wrapper)             │
│  ┌────────────────────────────────────────────────────┐  │
│  │  spec-assistant.js (Entry Point)                   │  │
│  │  - Show logo                                       │  │
│  │  - Parse commands                                  │  │
│  │  - Route to handler                                │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │                                           │
│  ┌────────────▼──────────┬──────────────┬──────────────┐ │
│  │                       │              │              │ │
│  │ Logo Display         │ Command      │ Swarm        │ │
│  │ (spec-logo.js)       │ Passthrough  │ Manager      │ │
│  │                       │              │ (lazy)       │ │
│  └──────────────────────┴──────────────┴──────────────┘ │
└────────────────────┬─────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│ Official Spec Kit│    │ Remote-Server SSH Deployer  │
│ (specify CLI)    │    │ (Remote Execution)   │
│ - Python/uv      │    │ - SSH keyring        │
│ - Templates      │    │ - Remote swarms      │
└──────────────────┘    └──────────────────────┘
```

### File Structure

```
spec-kit-assistant/
├── CONSTITUTION.md              # Project principles
├── SPEC.md                      # This document
├── TODO.md                      # Implementation checklist
├── README.md                    # User-facing docs
├── package.json                 # Node.js config
├── spec-assistant.js            # Main entry point
│
├── src/
│   ├── character/
│   │   └── spec-logo.js        # Logo display with official colors
│   │
│   ├── swarm/                   # Swarm orchestration (lazy-loaded)
│   │   ├── orchestrator.js
│   │   └── remote-deployer.js  # SSH deployment
│   │
│   └── specify_cli/             # Official Spec Kit (upstream)
│       └── ...                  # Python CLI code
│
├── templates/                   # Official Spec Kit templates (upstream)
├── docs/                        # Official Spec Kit docs (upstream)
└── media/                       # Official Spec Kit media (upstream)
```

## 🔧 Implementation Details

### Phase 1: Core Wrapper (Current Sprint)

#### 1.1 Entry Point (`spec-assistant.js`)

```javascript
#!/usr/bin/env node
import { SpecLogo } from './src/character/spec-logo.js';
import chalk from 'chalk';
import { execSync } from 'child_process';

// Show logo
console.log(SpecLogo.pixelDog);

// Parse args
const args = process.argv.slice(2);

if (args.length === 0) {
  // Show friendly help
  displayHelp();
  process.exit(0);
}

// Pass to real specify CLI
try {
  execSync(`~/.local/bin/uv tool run --from . specify ${args.join(' ')}`, {
    stdio: 'inherit'
  });
} catch (error) {
  console.error(chalk.red('❌ Command failed'));
  process.exit(error.status || 1);
}
```

#### 1.2 Logo Display (`src/character/spec-logo.js`)

**Requirements:**
- Use official Spec Kit colors: Purple, Pink, Green, Brown
- Dog + SPEC text inline
- Emoji: 🌱 (seedling, not 🐕)
- Fast rendering (< 50ms)

#### 1.3 Help Display

**Content:**
```
🌱 GitHub Spec Kit Assistant

Quick start:
  node spec-assistant.js init <PROJECT>    # Create new project
  node spec-assistant.js check             # Check project status

Advanced (with swarms):
  node spec-assistant.js deploy <FEATURE>  # Deploy with swarms

Official Spec Kit: https://github.com/github/spec-kit
```

### Phase 2: Swarm Integration

#### 2.1 Lazy Loading Pattern

```javascript
// Only load when needed
let swarmOrchestrator = null;

async function deployWithSwarm(task) {
  if (!swarmOrchestrator) {
    console.log(chalk.yellow('🔄 Initializing swarm orchestrator...'));
    const { SwarmOrchestrator } = await import('./src/swarm/orchestrator.js');
    swarmOrchestrator = new SwarmOrchestrator();
  }

  return await swarmOrchestrator.deploy(task);
}
```

#### 2.2 Swarm Commands

New commands added by wrapper (not passed to official Spec Kit):

- `deploy <description>` - Deploy swarm for implementation
- `swarm status` - Show active swarms
- `swarm list` - Show available swarm types
- `swarm stop` - Stop all swarms

#### 2.3 Gemini Queen Coordinator

**Initialization:**
- Only when swarm operations start
- Check for `gemini` CLI availability
- Graceful fallback if unavailable

### Phase 3: Remote-Server SSH Deployment

#### 3.1 SSH Connection

```javascript
import { Client } from 'ssh2';
import keytar from 'keytar';
import dotenv from 'dotenv';

dotenv.config();

async function connectToRemoteServer() {
  // Get credentials from system keyring and environment
  const password = await keytar.getPassword('remote-server', process.env.REMOTE_USER);

  const conn = new Client();
  return new Promise((resolve, reject) => {
    conn.on('ready', () => resolve(conn))
        .connect({
          host: process.env.REMOTE_HOST,
          port: parseInt(process.env.REMOTE_PORT),
          username: process.env.REMOTE_USER,
          password: password
        });
  });
}
```

#### 3.2 Remote Execution

```javascript
async function deployToRemote-Server(task) {
  const conn = await connectToRemote-Server();

  // Upload task spec
  await uploadSpec(conn, task);

  // Execute swarm remotely
  const result = await executeRemote(conn, 'node enhanced-swarm-orchestrator.js deploy');

  // Retrieve results
  return await downloadResults(conn);
}
```

#### 3.3 Credential Management

**Security Requirements:**
- Use system keyring (keytar/keychain)
- Never log credentials
- Support SSH keys as alternative
- Environment variable fallback for CI

## 📊 Testing Strategy

### Unit Tests

```javascript
// tests/wrapper.test.js
describe('Spec Assistant Wrapper', () => {
  it('displays logo on startup', () => {
    // Test logo display
  });

  it('passes commands to specify CLI', () => {
    // Mock execSync, verify passthrough
  });

  it('handles specify CLI errors gracefully', () => {
    // Test error handling
  });
});
```

### Integration Tests

```javascript
// tests/integration.test.js
describe('Spec Kit Integration', () => {
  it('runs real specify init command', () => {
    // Test with actual specify CLI
  });

  it('preserves specify output', () => {
    // Verify stdout/stderr passthrough
  });
});
```

### SSH Tests (Mocked)

```javascript
// tests/remote-deploy.test.js
describe('Remote SSH Deployment', () => {
  it('connects with keyring credentials', () => {
    // Mock ssh2, test connection
  });

  it('handles connection failures', () => {
    // Test error handling
  });
});
```

## 🚀 Deployment

### Installation

```bash
# Clone fork
git clone https://github.com/YOUR_USERNAME/spec-kit-assistant.git
cd spec-kit-assistant

# Install dependencies
npm install

# Install official Spec Kit
uv tool install .

# Run assistant
node spec-assistant.js
```

### Configuration

**Environment Variables (configure in .env file):**
```bash
# Remote server configuration
REMOTE_HOST=your-server.example.com
REMOTE_PORT=22
REMOTE_USER=your-username

# Optional: Disable swarms
SPEC_ASSISTANT_NO_SWARMS=1
```

**Keyring Setup:**
```bash
# Store remote server password securely
node -e "const keytar = require('keytar'); keytar.setPassword('remote-server', process.env.REMOTE_USER, 'YOUR_PASSWORD');"
```

## 📈 Success Criteria

### Acceptance Tests

1. **Wrapper Functions**
   - [ ] Displays logo with correct colors
   - [ ] Shows help when run without args
   - [ ] Passes `init` command to specify
   - [ ] Passes `check` command to specify
   - [ ] Preserves all specify output
   - [ ] Returns correct exit codes

2. **Swarm Integration**
   - [ ] Swarms don't load on startup
   - [ ] `deploy` command triggers swarm load
   - [ ] Gemini coordinator initializes correctly
   - [ ] Multiple swarm types available

3. **Remote-Server Deployment**
   - [ ] Connects via SSH using keyring
   - [ ] Deploys swarm tasks remotely
   - [ ] Retrieves results successfully
   - [ ] Handles connection failures gracefully

### Performance Benchmarks

- Wrapper overhead: < 500ms
- SSH connection: < 2s
- Swarm lazy-load: < 100ms
- Total deploy time: < 5min for standard feature

## 🔄 Future Enhancements

### v1.1 - Enhanced UX
- Interactive prompts for common commands
- Progress bars for long-running operations
- Colored diff output for spec changes

### v1.2 - Advanced Swarms
- Custom swarm configurations
- Parallel swarm execution
- Swarm result caching

### v1.3 - Enterprise Features
- Team collaboration
- Audit logging dashboard
- Custom template repositories

---

**Next Steps**: See TODO.md for implementation checklist

🌱 **Spec-Driven Development Made Delightful**
