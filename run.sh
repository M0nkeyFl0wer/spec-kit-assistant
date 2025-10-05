#!/bin/bash
# One-click launcher for Spec Kit Assistant
# Just run: ./run.sh

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --ignore-scripts --silent
fi

# Run the app with any arguments passed
node spec-assistant.js "$@"
