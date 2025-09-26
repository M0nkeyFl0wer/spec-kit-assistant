#!/bin/bash

echo "🔍 Validating README claims..."

error_count=0

# Check all markdown file references exist
echo "📄 Checking file references..."
grep -o '\./[^)]*\.md' README.md | while read file; do
  if [[ ! -f "$file" ]]; then
    echo "❌ Missing file: $file"
    ((error_count++))
  fi
done

# Check for docs/ directory references
if grep -q 'docs/' README.md; then
  if [[ ! -d "docs" ]]; then
    echo "❌ README references docs/ directory that doesn't exist"
    ((error_count++))
  fi
fi

# Check npm scripts mentioned in README exist
echo "📦 Checking npm scripts..."
if command -v jq > /dev/null; then
  grep -o '`npm run [^`]*`' README.md | sed 's/`npm run //; s/`//' | while read script_name; do
    if ! jq -e ".scripts[\"$script_name\"]" package.json >/dev/null 2>&1; then
      echo "❌ Missing npm script: $script_name"
      ((error_count++))
    fi
  done
else
  echo "⚠️ jq not installed - skipping npm script validation"
fi

# Check for fabricated performance claims
echo "📊 Checking for unsubstantiated claims..."
if grep -q "3x faster\|90% fewer bugs\|40% cost savings" README.md; then
  echo "⚠️ Performance claims found - ensure these are backed by data"
fi

# Check for non-existent CLI commands
echo "⚡ Checking CLI commands..."
if grep -q "spec-assistant" README.md && ! grep -q "Currently in development" README.md; then
  echo "⚠️ CLI commands referenced - ensure they work"
fi

# Check for LICENSE file reference
if grep -q "LICENSE" README.md && [[ ! -f "LICENSE" ]]; then
  echo "❌ README references LICENSE file that doesn't exist"
  ((error_count++))
fi

echo ""
if [[ $error_count -eq 0 ]]; then
  echo "✅ README validation passed!"
  exit 0
else
  echo "❌ README validation failed with $error_count errors"
  exit 1
fi