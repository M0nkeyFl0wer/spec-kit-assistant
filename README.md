# 🌱 Spec Kit Assistant + Scaffold-ETH-2

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Scaffold-ETH](https://img.shields.io/badge/Scaffold--ETH--2-Integrated-purple)](https://github.com/scaffold-eth/scaffold-eth-2)
[![GitHub](https://img.shields.io/badge/GitHub-Spec_Kit-blue?logo=github)](https://github.com/github/spec-kit)

```
                                         ██████          ██████
                                       ██▓▓▓▓▓▓██████████▓▓▓▓▓▓██
                                       ██▓▓▓▓██          ██▓▓▓▓██
                                       ██▓▓████    ▓▓▓▓▓▓████▓▓██
   ███████╗██████╗ ███████╗ ██████╗    ██  ██  ██▓▓██▓▓██  ██
   ██╔════╝██╔══██╗██╔════╝██╔════╝        ██    ▓▓▓▓▓▓██
   ███████╗██████╔╝█████╗  ██║            ██              ██
   ╚════██║██╔═══╝ ██╔══╝  ██║            ██    ██████    ██
   ███████║██║     ███████╗╚██████╗       ██    ██████    ██
   ╚══════╝╚═╝     ╚══════╝ ╚═════╝       ██              ██
                                            ██    ██    ██
                                               ████░░████
                                                 ██░░██
                                                 ██░░██
                                                   ████

          🌱 Spec Kit Assistant + 🔗 Scaffold-ETH-2 Integration
        AI-Powered dApp Development | Spec-Driven | Production-Ready
```

> **AI-powered wrapper for [GitHub Spec Kit](https://github.com/github/spec-kit) with deep [Scaffold-ETH-2](https://github.com/scaffold-eth/scaffold-eth-2) integration**
>
> Generate production-ready Ethereum dApps in minutes with AI agent swarms

---

## Why This Exists

I've been using [GitHub Spec Kit](https://github.com/github/spec-kit) and really like it. While using it, I had some UX ideas I wanted to explore - mainly around making the onboarding less intimidating for beginners.

This wrapper is:
- **Experimental** - testing some UX improvements
- **Unofficial** - not affiliated with the Spec Kit team
- **For discussion** - sharing my experience and inviting feedback

All core functionality comes from the official Spec Kit. I just added:
- Friendly onboarding wizard
- Claude Code defaults
- Some dog ASCII art (because why not)

**Want the real thing?** Use https://github.com/github/spec-kit

---

## Quick Start

### One-Liner Install & Launch

```bash
curl -fsSL https://raw.githubusercontent.com/M0nkeyFl0wer/spec-kit-assistant/main/install.sh | bash
```

**That's it!** Installs, sets up, and launches automatically with your pixel dog logo.

### Alternative: Manual Install

```bash
git clone https://github.com/M0nkeyFl0wer/spec-kit-assistant.git
cd spec-kit-assistant
./run.sh
```

The run script automatically:
- Installs dependencies if needed (no prompts)
- Launches the app
- Shows you available commands

### Optional: Setup Wizard

Want to configure package manager preferences and AI models?

```bash
npm run setup
```

---

## The Journey

```
    "Woof! Let me tell you how I came to be..."

         |\__/,|   (`\
       _.|o o  |_   ) )
     -(((---(((--------
```

### The Problem
I was using GitHub Spec Kit and loved it, but thought:
- **"This could be even MORE delightful!"**
- **"What if it had AI swarm orchestration?"**
- **"What if a friendly dog guided you through everything?"**

### The Meta Solution
Instead of building from scratch, I used **Spec Kit itself** to design and build this enhanced fork!

```
    Spec Kit → Spec Kit Constitution → Enhanced Spec Kit

    🐕 "I helped build myself! How cool is that?"
```

### What Makes This Special

1. **True Fork** - Wraps the real `specify` CLI, doesn't replace it
2. **AI Swarms** - Deploy specialized agent swarms for implementation
3. **Dog Personality** - Spec the loyal dog makes development fun
4. **Official Colors** - Purple (#8B5CF6), Pink (#EC4899), Green (#10B981)

---

## 🎮 Commands

### Official Spec Kit Commands (Pass-through)

```bash
spec-assistant init        # Initialize new spec
spec-assistant check       # Check spec validity
spec-assistant constitution # Show constitution
```

```
    "These commands go straight to the official Spec Kit!"

         ___
        /o o\
       ( =^= )
        )   (
       /|   |\
      (_) (_)
```

### Enhanced Swarm Commands

```bash
spec-assistant run "implement feature X"   # Deploy builder swarm
spec-assistant test                        # Run test swarms
spec-assistant deploy                      # Production deployment
spec-assistant swarm                       # Swarm management
```

```
    "These are MY special commands! I call in my swarm friends!"

       ,--._______,-.
      ( )   (  \_O/( )
       |\    \  / '|
       | \  .~  / |
        \  \   /  /
        |    ~   |
        |  (\/) |

         >> Builder Swarm
         >> Red-Team Swarm
         >> Data Science Swarm
         >> Production Swarm
         >> Security Swarm
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│  🐕 Spec Kit Assistant (Node.js Wrapper)   │
│                                             │
│  ┌─────────────┐      ┌─────────────────┐ │
│  │   Friendly   │      │   AI Swarm      │ │
│  │   Dog UX     │      │  Orchestration  │ │
│  └─────────────┘      └─────────────────┘ │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Official GitHub Spec Kit (Python)  │   │
│  │  uv tool run specify <command>      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### How It Works

1. **You run**: `spec-assistant init "My Cool App"`
2. **Spec shows** the logo and friendly message
3. **Wrapper routes** to official Spec Kit if it's a core command
4. **OR deploys swarm** if it's an enhanced command
5. **Official Spec Kit** does the heavy lifting
6. **Spec celebrates** when done!

```
    "I'm just here to make everything friendlier!"

       / \__
      (    @\___
      /         O
     /   (_____/
    /_____/   U
```

---

## 🔧 Development Setup

### Prerequisites
- Node.js 16+
- Python 3.8+ (for official Spec Kit)
- Git

### Local Development

```bash
# Clone the repo
git clone https://github.com/M0nkeyFl0wer/spec-kit-assistant
cd spec-kit-assistant

# Install Node dependencies
npm install

# Run wrapper locally
node spec-assistant.js init "Test Project"
```

### Remote Deployment

```bash
# Deploy to remote server (configure SSH in your local setup)
ssh your-server
cd spec-kit-assistant
node spec-assistant.js deploy
```

```
    "I can run on servers too! SSH is my friend!"

         __
    (___()'`;
    /,    /`
    \\"--\\

    "Deploying remotely..."
```

---

## 🧪 Testing

### Red-Team Security Audit

```bash
node spec-assistant.js run "Red-team security audit"
```

**Latest Results**: ✅ **SECURE** rating
- Directory traversal prevention: PASS
- Memory exhaustion protection: PASS
- Command injection prevention: PASS
- Race condition handling: PASS

```
    "I take security seriously!"

      /^ ^\
     / 0 0 \
     V\ Y /V
      / - \
     /    |
    V__) ||

       |\      _,,,---,,_
 ZZZzz /,`.-'`'    -.  ;-;;,_
      |,4-  ) )-,_. ,\ (  `'-'
     '---''(_/--'  `-'\_)
```

### Unit Tests

```bash
npm test
```

All tests passing on:
- Edge cases (empty/null/Unicode inputs)
- Boundary testing (file system limits)
- Stress testing (100 concurrent operations)
- Security vulnerabilities

---

## 🌟 Use Cases

### 1. New Project Spec

```bash
spec-assistant init "E-commerce Platform"

🐕 "Let's create a great spec together!"
```

### 2. Implement with Swarms

```bash
spec-assistant run "Build authentication system"

🐕 "Calling in my builder swarm friends!"
    🤖 Deploying 4 agents...
    ✨ Implementation complete!
```

### 3. Security Audit

```bash
spec-assistant run "Security audit"

🐕 "Time for red-team mode! 🛡️"
    🔒 Testing vulnerabilities...
    ✅ All secure!
```

---

## 🎯 Philosophy

### Why a Dog Assistant?

```
    "Because development should be FUN!"

       /\_/\
      ( o.o )
       > ^ <

    Dogs are:
    > Loyal - Always here to help
    > Friendly - Make everything less scary
    > Playful - Coding should be joyful
    > Focused - But also keep YOU focused
```

### Why Wrap, Not Replace?

The official GitHub Spec Kit is **amazing**. This project:
- ✅ Preserves all original functionality
- ✅ Adds delightful UX layer
- ✅ Extends with AI swarms
- ✅ Stays true to Spec Kit philosophy

### Meta Development

This project **used Spec Kit to build itself**:

1. Created `CONSTITUTION.md` with Spec Kit
2. Wrote `SPEC.md` following Spec Kit format
3. Generated `TODO.md` with Spec Kit
4. Built implementation guided by the spec
5. Tested with AI swarms deployed via Spec Kit

```
    "I'm a spec-driven dog! Woof!"

         __
    (___()'`;
    /,    /`
    \\"--\\    [SPEC.md]
```

---

## 📚 Documentation

- [📜 Constitution](CONSTITUTION.md) - Project principles
- [📋 Spec](SPEC.md) - Technical specification
- [✅ TODO](TODO.md) - Implementation checklist
- [🎨 Branding](BRANDING.md) - Official colors & style

---

## 🤝 Contributing

```
    "Want to help? I'd love that!"

       ,--._______,-.
      ( )   (  \_O/( )
       |\    \  / '|
       | \  .~  / |
        \  \   /  /

    Pull requests welcome!
```

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-thing`
3. Write spec using Spec Kit: `spec-assistant init "Amazing Thing"`
4. Implement following spec
5. Test thoroughly: `npm test`
6. Submit PR with dog ASCII art in description 🐕

---

## 📜 License

MIT License - See [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- **GitHub Spec Kit Team** - For the amazing original tool
- **The Swarm** - All the AI agents that helped build this
- **Seshat Server** - For hosting our swarm deployments
- **You** - For reading this far! Have a treat! 🦴

```
                    _
                   / )
                  / /
    |\         _.'  '.
    ) \___---'         )
    |                 /
     \     ...:::::::_/
      \   :::::::::::'
       '._:::::::::'
          '::::::' hjw
            ||||
           (:::)
            \(

    "Thanks for using Spec Kit Assistant!"
    "Woof woof! Happy spec-driven development!"
```

---

<p align="center">
  Made with ❤️ and 🦴 by a loyal dog who loves specs
  <br>
  <strong>Spec Kit Assistant - Because specs should be fun!</strong>
</p>
