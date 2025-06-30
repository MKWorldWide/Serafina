#!/bin/bash

# 🎮 GameDin Discord Bot - Build Script
# This script builds only the Discord bot files, excluding web app files

echo "🎮 Building GameDin Discord Bot..."
echo "=================================="

# Create dist directory if it doesn't exist
mkdir -p dist

# Copy only the Discord bot files to a temporary directory
echo "📁 Preparing bot files..."

# Create a temporary build directory
rm -rf .temp-build
mkdir -p .temp-build/src

# Copy only the Discord bot source files
cp -r src/index.ts .temp-build/src/
cp -r src/commands .temp-build/src/
cp -r src/events .temp-build/src/
cp -r src/services .temp-build/src/
cp -r src/utils .temp-build/src/
cp -r src/config .temp-build/src/
cp -r src/types .temp-build/src/
cp -r src/deploy-commands.ts .temp-build/src/

# Copy configuration files
cp tsconfig.json .temp-build/
cp package.json .temp-build/

# Build the bot
echo "🔨 Compiling TypeScript..."
cd .temp-build

# Use tsc to compile only the bot files
npx tsc --project tsconfig.json

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Copy the built files back to dist
    cp -r dist/* ../dist/
    
    echo "📦 Bot files built successfully in dist/"
    echo "🚀 Ready to run: npm run dev"
else
    echo "❌ Build failed!"
    exit 1
fi

# Clean up
cd ..
rm -rf .temp-build

echo "�� Build complete!" 