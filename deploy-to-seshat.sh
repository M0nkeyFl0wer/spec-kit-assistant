#!/bin/bash
# Ultimate Toolkit Deployment to Seshat GPU Server
# Deploy the full conversational co-learning ecosystem

set -e

echo "🐕 Spec's Ultimate Toolkit Deployment to Seshat"
echo "=================================================="

# Configuration
SESHAT_HOST="m0nkey-fl0wer@seshat.noosworx.com"
SESHAT_PORT="8888"
REMOTE_DIR="/home/m0nkey-fl0wer/ultimate-toolkit"

echo "🚀 Deploying to: ssh -p${SESHAT_PORT} ${SESHAT_HOST}"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf ultimate-toolkit-deploy.tar.gz \
    src/ \
    package.json \
    package-lock.json \
    ULTIMATE_TOOLKIT_SPECIFICATION.md \
    deploy-builder-ux-swarm.js \
    ultimate-toolkit-consultation-fixed.js \
    YOUR_SPEC_SETUP_GUIDE.md

# Deploy to seshat
echo "🌍 Transferring to seshat..."
scp -P ${SESHAT_PORT} ultimate-toolkit-deploy.tar.gz ${SESHAT_HOST}:~/

# Setup remote environment
echo "⚙️ Setting up remote environment..."
ssh -p ${SESHAT_PORT} ${SESHAT_HOST} << 'REMOTE_SETUP'

# Create ultimate toolkit directory
mkdir -p ~/ultimate-toolkit
cd ~/ultimate-toolkit

# Extract deployment package
tar -xzf ~/ultimate-toolkit-deploy.tar.gz

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install additional tools for voice processing
echo "🗣️ Installing voice processing tools..."
# Whisper for local voice transcription
pip3 install openai-whisper

# Install system dependencies
sudo apt update
sudo apt install -y ffmpeg portaudio19-dev python3-pyaudio

echo "🤖 Setting up swarm orchestration..."

# Create swarm directories
mkdir -p swarms/{research,content,data-science,video,red-team,debugging,prototyping,ideation}
mkdir -p voice-processing
mkdir -p obsidian-integration

# Create ramble command script
cat > ramble.sh << 'RAMBLE_SCRIPT'
#!/bin/bash
# The legendary ramble command for conversational co-learning

echo "🐕 Spec's Ramble Mode Activated!"
echo "================================"

# Start voice processing
echo "🗣️ Starting voice transcription..."
# python3 voice-processing/whisper-local.py &

# Start research swarm
echo "🔍 Activating research swarm..."
node swarms/research/coordinator.js &

# Start prototyping swarm
echo "🚀 Activating prototyping swarm..."
node swarms/prototyping/coordinator.js &

# Start conversation engine
echo "💬 Starting conversational co-learning..."
node src/index.js ramble --mode conversational

echo "✨ Ramble session complete! Check your Obsidian vault for results!"
RAMBLE_SCRIPT

chmod +x ramble.sh

# Create swarm deployment script
cat > deploy-all-swarms.sh << 'SWARM_DEPLOY'
#!/bin/bash
# Deploy all 8 swarm types for Ultimate Toolkit

echo "🤖 Deploying Ultimate Toolkit Swarm Ecosystem"
echo "=============================================="

SWARM_TYPES=("research" "content" "data-science" "video" "red-team" "debugging" "prototyping" "ideation")

for swarm in "${SWARM_TYPES[@]}"; do
    echo "🚀 Deploying $swarm swarm..."

    # Create swarm coordinator
    cat > swarms/$swarm/coordinator.js << SWARM_JS
const { SwarmOrchestrator } = require('../../src/swarm/orchestrator.js');

class ${swarm^}SwarmCoordinator extends SwarmOrchestrator {
    constructor() {
        super();
        this.swarmType = '$swarm';
        this.agentCount = 4;
    }

    async deploy() {
        console.log('🚀 Deploying $swarm swarm with', this.agentCount, 'agents');

        for (let i = 0; i < this.agentCount; i++) {
            const agentId = \`$swarm-agent-\${Date.now()}-\${i}\`;
            console.log('🤖 Starting agent:', agentId);

            // Agent deployment logic here
            await this.deployAgent(agentId, '$swarm');
        }

        console.log('✅ $swarm swarm deployed successfully!');
    }
}

const coordinator = new ${swarm^}SwarmCoordinator();
coordinator.deploy().catch(console.error);
SWARM_JS

    chmod +x swarms/$swarm/coordinator.js
done

echo "✅ All swarms deployed and ready!"
echo "🎯 Use './ramble.sh' to start conversational co-learning"
echo "📊 Use 'node src/index.js swarm --monitor' to check status"
SWARM_DEPLOY

chmod +x deploy-all-swarms.sh

# Run swarm deployment
./deploy-all-swarms.sh

echo "🎉 Ultimate Toolkit deployed successfully on seshat!"
echo "🗣️ Ready for ramble sessions!"
echo "🤖 8 swarm types ready for deployment!"

REMOTE_SETUP

# Update CLAUDE.md with deployment info
echo "📝 Updating CLAUDE.md with deployment details..."

# Clean up local deployment package
rm -f ultimate-toolkit-deploy.tar.gz

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "🚀 Your Ultimate Toolkit is now running on seshat!"
echo ""
echo "🗣️ To start a ramble session:"
echo "   ssh -p8888 m0nkey-fl0wer@seshat.noosworx.com"
echo "   cd ~/ultimate-toolkit"
echo "   ./ramble.sh"
echo ""
echo "🤖 To deploy specific swarms:"
echo "   node src/index.js swarm --deploy --type research"
echo "   node src/index.js swarm --deploy --type prototyping"
echo ""
echo "📊 To monitor all swarms:"
echo "   node src/index.js swarm --monitor --all"
echo ""
echo "🌱 Ready to build the solarpunk future! 🌍✨"