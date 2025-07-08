#!/bin/bash

# 🌟 Serafina Discord Bot Startup Script
# Start both the Discord bot and health server

set -e

echo "🌟 Starting Serafina Discord Bot"
echo "================================"

# Configuration
DISCORD_TOKEN="MTM0MTkzNzY1NTA1MDY3MDA4MA.GmMo4x.npcIS0rjKjlHdxYk-zOXZahmAFnEfypwz9FnVY"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "dist/bot-new.js" ]; then
    print_error "Bot files not found. Please run the deployment script first."
    exit 1
fi

# Kill any existing processes
print_status "Stopping any existing bot processes..."
pkill -f "bot-new.js" 2>/dev/null || true
pkill -f "health-server.js" 2>/dev/null || true

# Start health server
print_status "Starting health server..."
cd dist
node health-server.js &
HEALTH_PID=$!
cd ..

# Wait a moment for health server to start
sleep 2

# Test health server
if curl -s http://localhost:3000/health >/dev/null; then
    print_success "Health server started successfully"
else
    print_warning "Health server may not be responding"
fi

# Start Discord bot
print_status "Starting Discord bot..."
cd dist
DISCORD_TOKEN="$DISCORD_TOKEN" node bot-new.js &
BOT_PID=$!
cd ..

# Wait for bot to initialize
sleep 5

# Check if bot is running
if ps -p $BOT_PID > /dev/null; then
    print_success "Discord bot started successfully"
else
    print_error "Discord bot failed to start"
    exit 1
fi

# Final status
echo ""
echo "🌟 Serafina Discord Bot - RUNNING!"
echo "==================================="
echo ""
echo "Process IDs:"
echo "- Health Server: $HEALTH_PID"
echo "- Discord Bot: $BOT_PID"
echo ""
echo "Health Check:"
echo "- Health: http://localhost:3000/health"
echo "- Status: http://localhost:3000/status"
echo "- Metrics: http://localhost:3000/metrics"
echo ""
echo "To stop the bot:"
echo "pkill -f 'bot-new.js' && pkill -f 'health-server.js'"
echo ""
print_success "Serafina is now online and ready to respond!" 