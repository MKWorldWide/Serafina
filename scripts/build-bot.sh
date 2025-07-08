#!/bin/bash

# 🎮 GameDin Discord Bot - Clean Bot-Only Build Script
# This script builds ONLY the Discord bot backend, excluding all web app and frontend files/services

set -e

echo "🎮 Building GameDin Discord Bot (Bot-Only)..."
echo "============================================="

# Clean previous build
rm -rf dist
mkdir -p dist

# Create a temporary build directory
rm -rf .temp-build
mkdir -p .temp-build/src

# Create utils directory for selective utility files
mkdir -p .temp-build/src/utils

# Copy only bot-relevant source files
cp -r src/bot-new.ts .temp-build/src/
cp -r src/commands .temp-build/src/
cp -r src/events .temp-build/src/
cp -r src/core .temp-build/src/
cp -r src/config .temp-build/src/
cp -r src/types .temp-build/src/
cp src/utils/logger.ts .temp-build/src/utils/
cp src/utils/debounce.ts .temp-build/src/utils/

# Remove problematic files from temp build
rm -f .temp-build/src/config/feature-flags.ts
rm -f .temp-build/src/commands/manage.ts

# Do NOT copy any of the following:
# - src/services/
# - src/utils/userMapper.ts, src/utils/metrics.ts, src/utils/errorTracking.ts (web/analytics)
# - src/constants/
# - src/pages/, src/lib/, src/store/, src/context/, src/graphql/, src/hooks/, src/components/, src/pages/, etc.
# - Any file referencing window, localStorage, navigator, aws-amplify, dexie, etc.

# Copy config files
cp tsconfig.json .temp-build/
cp package.json .temp-build/

# Build the bot
cd .temp-build
npx tsc --project tsconfig.json --outDir dist

if [ $? -eq 0 ]; then
    echo "✅ Bot-only build successful!"
    # Copy the built files back to dist
    cp -r dist/* ../dist/
    echo "📦 Bot files built successfully in dist/"
else
    echo "❌ Build failed!"
    exit 1
fi

# Clean up
cd ..
rm -rf .temp-build

echo "✨ Bot-only build complete!" 