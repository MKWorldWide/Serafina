#!/bin/bash

# 🎮 GameDin Discord Server Setup Script
# This script helps you set up your Discord server and bot

echo "🎮 Welcome to GameDin Discord Server Setup!"
echo "=============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created!"
    echo "⚠️  Please edit .env file with your Discord bot credentials"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
    echo ""
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "🔨 Building the bot..."
    npm run build
    echo "✅ Bot built successfully!"
    echo ""
fi

echo "🚀 Setup Steps Remaining:"
echo "1. Edit .env file with your Discord bot token and server ID"
echo "2. Create a Discord server (see DISCORD_SERVER_SETUP.md)"
echo "3. Invite your bot to the server"
echo "4. Run: npm run deploy-commands"
echo "5. Run: npm run dev"
echo "6. Use /setup command in your Discord server"
echo ""
echo "📖 For detailed instructions, see DISCORD_SERVER_SETUP.md"
echo ""
echo "🎯 Ready to build your GameDin community!" 