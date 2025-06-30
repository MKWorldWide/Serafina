#!/bin/bash

# 🎮 GameDin Discord Bot - Environment Configuration Helper
# This script helps you configure your .env file

echo "🎮 GameDin Discord Bot - Environment Configuration"
echo "=================================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created!"
    echo ""
fi

echo "🔧 Configuration Steps:"
echo ""
echo "1. 📋 DISCORD BOT TOKEN"
echo "   • Go to: https://discord.com/developers/applications"
echo "   • Create/select your GameDin application"
echo "   • Go to 'Bot' section"
echo "   • Click 'Reset Token' and copy the token"
echo "   • Replace 'your_discord_bot_token_here' in .env"
echo ""
echo "2. 🆔 DISCORD CLIENT ID"
echo "   • In the same Discord Developer Portal"
echo "   • Go to 'General Information'"
echo "   • Copy the 'Application ID'"
echo "   • Replace 'your_discord_client_id_here' in .env"
echo ""
echo "3. 🏠 DISCORD SERVER ID"
echo "   • Create your Discord server (see Step 2 below)"
echo "   • Right-click server name → Copy Server ID"
echo "   • Replace 'your_discord_server_id_here' in .env"
echo ""

echo "📝 Current .env file contents:"
echo "=============================="
cat .env
echo ""
echo "=============================="
echo ""

echo "💡 Tips:"
echo "• Keep your bot token secret - never share it!"
echo "• The bot token is like a password for your bot"
echo "• You can regenerate the token if needed"
echo "• Make sure to save the .env file after editing"
echo ""

echo "🚀 Ready for the next step!"
echo "After configuring .env, proceed to create your Discord server." 