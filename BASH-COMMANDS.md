# 📝 Bash Commands Reference - Spec Kit Assistant

Quick reference for common operations. Keep this handy for when Claude Code is down or you want to work independently.

---

## 🚀 Getting Started

### Clone and Setup
```bash
# Clone the repository
git clone git@github.com:M0nkeyFl0wer/spec-kit-assistant.git
cd spec-kit-assistant

# Install dependencies
npm install

# Run the assistant
node spec-assistant.js
```

### First Time Setup
```bash
# Install uv package manager (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Spec Kit CLI
~/.local/bin/uv tool install specify-cli

# Verify installation
~/.local/bin/uv tool list | grep specify
```

---

## 📦 Package Management

### Install Dependencies
```bash
# Install all packages from package.json
npm install

# Install specific package
npm install <package-name>

# Install dev dependency
npm install --save-dev <package-name>

# Update all packages
npm update
```

### For Web3 Development
```bash
# Ethereum libraries
npm install ethers viem @wagmi/core

# Hardhat
npm install --save-dev hardhat @nomiclabs/hardhat-ethers

# Foundry (system-level)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## 🔧 Development Commands

### Running the Assistant
```bash
# Basic run
node spec-assistant.js

# Initialize a new project
node spec-assistant.js init my-project

# Check project status
node spec-assistant.js check

# Run a swarm
node spec-assistant.js run "task description"

# Deploy with swarm
node spec-assistant.js deploy "feature description"
```

### Testing (when implemented)
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/swarm.test.js

# Run with coverage
npm test -- --coverage

# Watch mode (runs tests on file change)
npm test -- --watch
```

---

## 📂 File Operations

### Search and Find
```bash
# Find files by name
find . -name "*.js" -type f

# Find files containing text
grep -r "search term" src/

# Find recently modified files
find . -type f -mtime -1

# Count lines of code
find src/ -name "*.js" -exec wc -l {} + | sort -n
```

### Read Files
```bash
# View entire file
cat filename.js

# View first 20 lines
head -n 20 filename.js

# View last 20 lines
tail -n 20 filename.js

# View with line numbers
cat -n filename.js

# Search within file
grep "pattern" filename.js
```

---

## 🌿 Git Operations

### Basic Workflow
```bash
# Check status
git status

# View changes
git diff

# Stage files
git add filename.js
git add .  # Stage all changes

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push origin branch-name
```

### Branch Management
```bash
# List branches
git branch -a

# Create new branch
git branch feature-name

# Switch to branch
git checkout feature-name

# Create and switch in one command
git checkout -b feature-name

# Merge branch into current
git merge feature-name

# Delete local branch
git branch -d feature-name
```

### View History
```bash
# View commit history
git log --oneline

# View last 10 commits
git log --oneline -10

# View changes in a specific file
git log --follow -- filename.js

# View who changed what
git blame filename.js
```

### Undo Changes
```bash
# Discard changes in working directory
git restore filename.js

# Unstage file (keep changes)
git restore --staged filename.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View what changed in last commit
git show
```

---

## 🐳 Docker Operations (if used)

### Basic Commands
```bash
# Build image
docker build -t spec-kit-assistant .

# Run container
docker run -it spec-kit-assistant

# List running containers
docker ps

# Stop container
docker stop container-id

# Remove container
docker rm container-id

# View logs
docker logs container-id
```

---

## 🔐 SSH to Remote-Server (Raspberry Pi)

### Connect to Remote-Server
```bash
# Basic connection
ssh REMOTE_USER@REMOTE_HOST -p 8888

# With key
ssh -i ~/.ssh/remote-server_key REMOTE_USER@REMOTE_HOST -p 8888

# Copy file to Remote-Server
scp -P 8888 file.js REMOTE_USER@REMOTE_HOST:/path/to/destination

# Copy file from Remote-Server
scp -P 8888 REMOTE_USER@REMOTE_HOST:/path/to/file.js ./local/path

# Copy entire directory
scp -r -P 8888 directory/ REMOTE_USER@REMOTE_HOST:/path/to/destination
```

### Monitor Remote-Server Resources
```bash
# Check CPU and memory
ssh REMOTE_USER@REMOTE_HOST -p 8888 'top -bn1 | head -20'

# Check temperature
ssh REMOTE_USER@REMOTE_HOST -p 8888 'vcgencmd measure_temp'

# Check disk space
ssh REMOTE_USER@REMOTE_HOST -p 8888 'df -h'

# Check running processes
ssh REMOTE_USER@REMOTE_HOST -p 8888 'ps aux | grep node'
```

---

## 🛠️ System Utilities

### Process Management
```bash
# List running Node processes
ps aux | grep node

# Kill process by PID
kill PID

# Kill all node processes (careful!)
pkill node

# Run in background
node spec-assistant.js &

# View background jobs
jobs

# Bring job to foreground
fg %1
```

### Disk and Memory
```bash
# Check disk space
df -h

# Check directory size
du -sh directory/

# Check memory usage
free -h

# Watch memory in real-time
watch -n 1 free -h
```

### Network
```bash
# Check if port is in use
lsof -i :3000

# Test connection
ping REMOTE_HOST

# Check open ports
netstat -tuln
```

---

## 🧪 Web3 Development Commands

### Hardhat
```bash
# Initialize Hardhat project
npx hardhat init

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js

# Deploy to specific network
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network mainnet CONTRACT_ADDRESS
```

### Foundry
```bash
# Initialize Foundry project
forge init

# Install dependencies
forge install openzeppelin/openzeppelin-contracts

# Compile contracts
forge build

# Run tests
forge test

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test testMinting

# Fuzz testing
forge test --fuzz-runs 10000

# Deploy contract
forge create src/MyContract.sol:MyContract \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### Scaffold-ETH Commands
```bash
# Create new Scaffold-ETH project
npx create-eth@latest my-dapp

# In the project directory
cd my-dapp

# Install dependencies
yarn install

# Start local blockchain
yarn chain

# Deploy contracts (in another terminal)
yarn deploy

# Start frontend (in another terminal)
yarn start

# Run tests
yarn test
```

---

## 📝 Useful Aliases (Add to ~/.bashrc)

```bash
# Navigation
alias ..='cd ..'
alias ...='cd ../..'
alias ll='ls -lah'

# Git shortcuts
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline'

# Spec Kit Assistant
alias spec='node ~/spec-kit-assistant/spec-assistant.js'
alias spec-run='node ~/spec-kit-assistant/spec-assistant.js run'
alias spec-deploy='node ~/spec-kit-assistant/spec-assistant.js deploy'

# Remote-Server shortcuts
alias remote-server='ssh REMOTE_USER@REMOTE_HOST -p 8888'
alias remote-server-temp='ssh REMOTE_USER@REMOTE_HOST -p 8888 "vcgencmd measure_temp"'
alias remote-server-top='ssh REMOTE_USER@REMOTE_HOST -p 8888 "top -bn1 | head -20"'

# Apply aliases
source ~/.bashrc
```

---

## 🔍 Debugging Tips

### View Logs
```bash
# Real-time log following
tail -f logfile.log

# Search logs
grep "ERROR" logfile.log

# Last 100 lines
tail -n 100 logfile.log

# View logs with context
grep -C 3 "ERROR" logfile.log  # 3 lines before/after
```

### Debug Node.js
```bash
# Run with debugging
node --inspect spec-assistant.js

# Run with breakpoint
node --inspect-brk spec-assistant.js

# Verbose logging
NODE_ENV=development node spec-assistant.js
```

---

## 📚 Learning Commands

### Learn Python (for Spec Kit CLI)
```bash
# Check Python version
python --version
python3 --version

# Install package
pip install pandas

# Run Python script
python script.py

# Interactive Python shell
python3
```

### Learn Bash
```bash
# Create simple script
cat > script.sh << 'EOF'
#!/bin/bash
echo "Hello from script"
EOF

# Make executable
chmod +x script.sh

# Run script
./script.sh

# Variables
NAME="flower"
echo "Hello $NAME"

# Loops
for i in {1..5}; do
  echo "Number $i"
done

# Conditionals
if [ -f "file.txt" ]; then
  echo "File exists"
fi
```

---

## 🎯 Project-Specific Commands

### Roadmap Development
```bash
# View current roadmap
cat ROADMAP.md

# Search roadmap for specific stage
grep -A 10 "Stage 1" ROADMAP.md

# Count unchecked items
grep -c "\[ \]" ROADMAP.md

# Stage roadmap for commit
git add ROADMAP.md ROADMAP-SUMMARY.md BASH-COMMANDS.md
```

### Swarm Operations
```bash
# List swarm files
ls -lh *swarm*.js

# Check swarm orchestrator
cat enhanced-swarm-orchestrator.js | head -50

# Run specific swarm
node deploy-data-science-swarm.js
node red-team-unit-test-swarm.js
```

---

## 🚨 Emergency Commands

### Fix Broken Dependencies
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

### Disk Space Issues
```bash
# Find large files
find . -type f -size +100M

# Clean npm cache
npm cache clean --force

# Remove old logs
find . -name "*.log" -mtime +7 -delete
```

### Git Issues
```bash
# Discard all local changes
git reset --hard HEAD

# Clean untracked files
git clean -fd

# Fix detached HEAD
git checkout main

# Abort merge
git merge --abort
```

---

## 📖 Help and Documentation

```bash
# Command help
man <command>        # Manual page
<command> --help     # Quick help
<command> -h         # Short help

# Examples
man git
npm --help
node --help

# Search manual
apropos "search term"
```

---

## 💡 Tips & Tricks

### Pipe Commands Together
```bash
# Count JavaScript files
find . -name "*.js" | wc -l

# Find and sort by size
find . -name "*.js" -exec du -h {} + | sort -h

# Search and highlight
grep --color=auto "ERROR" logfile.log
```

### Use History
```bash
# View command history
history

# Search history
history | grep git

# Rerun last command
!!

# Rerun command by number
!123

# Search and execute
Ctrl+R (then type to search)
```

### Background Jobs
```bash
# Run in background
command &

# Move running job to background
Ctrl+Z
bg

# List jobs
jobs

# Bring to foreground
fg %1
```

---

**Keep this file handy!** Bookmark it or print it out. These commands will help you work independently even when Claude Code is down.

🌱 **Happy coding!**
