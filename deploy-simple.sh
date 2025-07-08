#!/bin/bash

# 🌟 Serafina Simple Bot Deployment
# Quick deployment to get the bot running

set -e

echo "🌟 Serafina Simple Bot Deployment"
echo "================================="

# Configuration
DISCORD_TOKEN="MTM0MTkzNzY1NTA1MDY3MDA4MA.GmMo4x.npcIS0rjKjlHdxYk-zOXZahmAFnEfypwz9FnVY"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Compile the bot
print_status "Compiling Discord bot..."
npx tsc src/bot-new.ts --outDir dist --target es2020 --module commonjs --esModuleInterop --skipLibCheck

if [ $? -eq 0 ]; then
    print_success "Bot compiled successfully"
else
    print_warning "Bot compilation failed"
    exit 1
fi

# Create package.json for the bot
print_status "Creating bot package.json..."
cat > dist/package.json << EOF
{
  "name": "serafina-bot",
  "version": "1.0.0",
  "description": "Serafina Discord Bot",
  "main": "bot-new.js",
  "scripts": {
    "start": "node bot-new.js",
    "health": "node health-server.js"
  },
  "dependencies": {
    "discord.js": "^14.21.0",
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create health server
print_status "Creating health server..."
cat > dist/health-server.js << 'EOF'
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'serafina-bot',
        version: '1.0.0'
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
    res.json({
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`Health server running on port ${port}`);
});

module.exports = app;
EOF

# Create startup script
print_status "Creating startup script..."
cat > dist/start.sh << 'EOF'
#!/bin/bash

# Start health server in background
node health-server.js &
HEALTH_PID=$!

# Start the bot
echo "Starting Serafina Discord Bot..."
node bot-new.js

# If bot exits, kill health server
kill $HEALTH_PID
EOF

chmod +x dist/start.sh

# Test the bot
print_status "Testing bot compilation..."
cd dist
if node -c bot-new.js; then
    print_success "Bot compilation test passed"
else
    print_warning "Bot compilation test failed"
    exit 1
fi
cd ..

# Install dependencies in dist
print_status "Installing bot dependencies..."
cd dist
npm install
cd ..

print_success "Bot deployment package created!"

# Final status
echo ""
echo "🌟 Serafina Bot - READY TO START!"
echo "================================="
echo ""
echo "Bot files created in dist/:"
echo "- bot-new.js (compiled bot)"
echo "- health-server.js (health check server)"
echo "- package.json (dependencies)"
echo "- start.sh (startup script)"
echo ""
echo "To start the bot:"
echo "================="
echo "cd dist && ./start.sh"
echo ""
echo "Or start manually:"
echo "================="
echo "cd dist"
echo "node bot-new.js"
echo ""
print_success "Serafina bot is ready to run!" 