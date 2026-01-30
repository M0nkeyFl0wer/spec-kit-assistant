#!/bin/bash
# One-click launcher for Spec Kit Assistant
# Just run: ./run.sh
#
# This handles EVERYTHING automatically:
# - Node.js dependencies
# - Official GitHub Spec Kit installation
# - Python uv package manager (if needed)

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install --ignore-scripts --silent
fi

# Run the app (it handles Spec Kit installation automatically)
node spec-assistant.js "$@"
