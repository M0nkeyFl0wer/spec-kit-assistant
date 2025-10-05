#!/bin/bash
# Security Fix Application Script for spec-kit-assistant
# Run with: bash apply-security-fixes.sh

set -e

echo "🔒 Security Fix Application Script"
echo "=================================="
echo ""
echo "⚠️  WARNING: This will modify your source files!"
echo "⚠️  Make sure to commit your changes first!"
echo ""
read -p "Continue with security fixes? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted."
    exit 1
fi

echo ""
echo "📝 Creating backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="security_backup_$timestamp"
mkdir -p "$backup_dir"
cp -r src "$backup_dir/"
cp *.js "$backup_dir/" 2>/dev/null || true
echo "✅ Backup created in $backup_dir/"
echo ""

echo "🔧 Applying critical fixes..."
echo ""

# Fix 1: gemini-coordinator-agent.js - Command injection in Gemini CLI
echo "Fixing: gemini-coordinator-agent.js (line 46-47)..."
if [ -f "gemini-coordinator-agent.js" ]; then
    # This would need proper sed/awk commands to replace the vulnerable code
    echo "  ⚠️  Manual fix required for gemini-coordinator-agent.js"
    echo "  Replace execSync with spawnSync for Gemini CLI calls"
fi

# Fix 2: intelligent-orchestrator.js - Command injection in ollama
echo "Fixing: src/swarm/intelligent-orchestrator.js (line 476)..."
if [ -f "src/swarm/intelligent-orchestrator.js" ]; then
    echo "  ⚠️  Manual fix required for intelligent-orchestrator.js"
    echo "  Replace execSync with spawnSync for ollama pull"
fi

echo ""
echo "📋 Manual fixes required for:"
echo "  1. gemini-coordinator-agent.js:46-47 - Use spawnSync instead of execSync"
echo "  2. gemini-coordinator-agent.js:177 - Validate branch names"
echo "  3. src/swarm/intelligent-orchestrator.js:476 - Use spawnSync for ollama"
echo "  4. src/swarm/warp-integration.js:672 - Remove hardcoded secret fallback"
echo "  5. src/utils/secure-websocket.js:327 - Use env var for HMAC secret"
echo ""

echo "🔐 Setting up environment variables..."
if [ ! -f ".env" ]; then
    echo "Creating .env file with secure secrets..."
    cat > .env << EOF
# Security Secrets - Generated on $timestamp
# IMPORTANT: Never commit this file to version control!

# Generate these with: openssl rand -hex 32
SPEC_KIT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "CHANGE_ME_TO_RANDOM_SECRET")
WEBSOCKET_AUTH_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "CHANGE_ME_TO_RANDOM_SECRET")

# Development mode (set to 'production' in prod)
NODE_ENV=development
EOF
    echo "✅ Created .env file with random secrets"
else
    echo "⚠️  .env file already exists - please add SPEC_KIT_SECRET and WEBSOCKET_AUTH_SECRET manually"
fi

echo ""
echo "🔍 Checking for remaining vulnerabilities..."
echo ""

# Check for remaining execSync usage with user input
echo "Scanning for unsafe execSync usage..."
grep -n "execSync.*\${" *.js src/**/*.js 2>/dev/null | grep -v "node_modules" || echo "✅ No obvious command injection patterns found"

echo ""
echo "Scanning for hardcoded secrets..."
grep -n "secret.*=.*['\"].*['\"]" *.js src/**/*.js 2>/dev/null | grep -v "node_modules" | grep -v ".env" || echo "✅ No obvious hardcoded secrets found"

echo ""
echo "📊 Security Fix Summary:"
echo "========================"
echo "✅ Backup created in $backup_dir/"
echo "✅ Environment template created (if needed)"
echo "⚠️  Manual fixes still required (see above)"
echo ""
echo "📖 Next steps:"
echo "1. Review the detailed fixes in SECURITY_AUDIT_REPORT.md"
echo "2. Apply manual fixes to the 5 vulnerable locations"
echo "3. Update .env with secure random secrets"
echo "4. Run: npm audit fix"
echo "5. Test thoroughly before deploying"
echo ""
echo "🔒 Security patch instructions complete!"