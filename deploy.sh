#!/bin/bash

# GameDin Discord Bot Deployment Script
# This script handles the deployment process for the GameDin Discord bot

# Exit on error
set -e

echo "🚀 Starting GameDin Discord Bot deployment..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with the following variables:"
    echo "DISCORD_TOKEN=your_discord_bot_token"
    echo "MONGODB_URI=your_mongodb_uri"
    echo "OPENAI_API_KEY=your_openai_api_key"
    echo "NODE_ENV=production"
    exit 1
fi

# Start/Restart the bot with PM2
echo "🚀 Starting GameDin bot with PM2..."
pm2 startOrRestart ecosystem.config.js --env production

echo "✅ Deployment complete! Check status with: pm2 status"
echo "📝 View logs with: pm2 logs gamedin-bot" 