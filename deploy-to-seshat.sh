#!/bin/bash
# Deploy and run swarms on Seshat for building spec-kit-assistant

echo "🚀 Deploying to Seshat for swarm-based development..."

# Deploy swarm to build wrapper integration
ssh -p 8888 m0nkey-fl0wer@seshat.noosworx.com "cd spec-kit-assistant && node enhanced-swarm-orchestrator.js deploy 'Build spec-assistant.js wrapper that properly calls official Spec Kit CLI (uv tool run specify) and adds swarm commands for run/test functionality. Integrate dog personality for phase guidance.'"

echo "✅ Swarm deployment initiated on Seshat"
