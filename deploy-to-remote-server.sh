#!/bin/bash
# Deploy Scaffold-ETH Integration Work to Remote-Server
# Runs multiple agent swarms in parallel on the Pi for faster development

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔗 Deploying Scaffold-ETH Integration to Remote-Server Server${NC}\n"

# Check if Remote-Server server is reachable
echo -e "${YELLOW}📡 Checking Remote-Server server connection...${NC}"
if ! ssh -o ConnectTimeout=5 -p 8888 REMOTE_USER@REMOTE_HOST "echo 'Connected'" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Cannot reach Remote-Server server. Will work locally.${NC}"
    LOCAL_MODE=true
else
    echo -e "${GREEN}✅ Remote-Server server is reachable${NC}\n"

    # Check server resources
    echo -e "${BLUE}📊 Checking server resources...${NC}"
    ssh -p 8888 REMOTE_USER@REMOTE_HOST "free -h | grep Mem && echo 'CPU cores:' && nproc"
    echo ""

    LOCAL_MODE=false
fi

# Create remote directory
if [ "$LOCAL_MODE" = false ]; then
    echo -e "${BLUE}📁 Setting up remote workspace...${NC}"
    ssh -p 8888 REMOTE_USER@REMOTE_HOST "mkdir -p ~/spec-kit-assistant-work/scaffold-eth-integration"

    # Sync files to Remote-Server
    echo -e "${BLUE}📤 Syncing files to Remote-Server...${NC}"
    rsync -avz -e "ssh -p 8888" \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '*.log' \
        ./ REMOTE_USER@REMOTE_HOST:~/spec-kit-assistant-work/scaffold-eth-integration/

    echo -e "${GREEN}✅ Files synced to Remote-Server${NC}\n"
fi

# Define swarm tasks
declare -a TASKS=(
    "Generate comprehensive ERC-721 NFT contract with royalties"
    "Create staking contract with reward distribution"
    "Build NFT marketplace with listing and bidding"
    "Generate DAO governance contracts"
)

# Run swarms
echo -e "${BLUE}🤖 Deploying ${#TASKS[@]} parallel swarms...${NC}\n"

if [ "$LOCAL_MODE" = false ]; then
    # Run on Remote-Server in background
    for i in "${!TASKS[@]}"; do
        TASK="${TASKS[$i]}"
        echo -e "${YELLOW}   Swarm $((i+1)): ${TASK}${NC}"

        ssh -p 8888 REMOTE_USER@REMOTE_HOST \
            "cd ~/spec-kit-assistant-work/scaffold-eth-integration && nohup node deploy-web3-scaffold-eth-swarm.js '${TASK}' > logs/swarm-$i.log 2>&1 &"
    done

    echo -e "${GREEN}\n✅ All swarms deployed to Remote-Server!${NC}"
    echo -e "${BLUE}📊 Monitor progress: ssh -p 8888 REMOTE_USER@REMOTE_HOST 'tail -f ~/spec-kit-assistant-work/scaffold-eth-integration/logs/*.log'${NC}\n"
else
    # Run locally
    mkdir -p logs
    for i in "${!TASKS[@]}"; do
        TASK="${TASKS[$i]}"
        echo -e "${YELLOW}   Swarm $((i+1)): ${TASK}${NC}"
        node deploy-web3-scaffold-eth-swarm.js "${TASK}" > "logs/swarm-$i.log" 2>&1 &
    done

    echo -e "${GREEN}\n✅ All swarms running locally!${NC}"
    echo -e "${BLUE}📊 Monitor: tail -f logs/*.log${NC}\n"
fi

# Wait for completion
echo -e "${BLUE}⏳ Swarms are running in background...${NC}"
echo -e "${YELLOW}💡 Tip: This will take 5-10 minutes. Check logs for progress.${NC}\n"

# Provide monitoring commands
echo -e "${BLUE}📖 Useful commands:${NC}"
if [ "$LOCAL_MODE" = false ]; then
    echo -e "   ${NC}Check server resources: ssh -p 8888 REMOTE_USER@REMOTE_HOST 'htop'${NC}"
    echo -e "   ${NC}View logs: ssh -p 8888 REMOTE_USER@REMOTE_HOST 'cat ~/spec-kit-assistant-work/scaffold-eth-integration/logs/swarm-0.log'${NC}"
    echo -e "   ${NC}Sync results back: rsync -avz -e 'ssh -p 8888' REMOTE_USER@REMOTE_HOST:~/spec-kit-assistant-work/scaffold-eth-integration/ ./remote-server-results/${NC}"
    echo -e "   ${NC}Server status: ssh -p 8888 REMOTE_USER@REMOTE_HOST 'ps aux | grep node'${NC}"
else
    echo -e "   ${NC}View logs: tail -f logs/*.log${NC}"
    echo -e "   ${NC}Check processes: ps aux | grep 'deploy-web3'${NC}"
fi

echo -e "\n${GREEN}🐕 Spec says: Swarms deployed to Remote-Server server! They'll work in parallel while you focus on the grant! 🚀${NC}\n"
