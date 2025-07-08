#!/bin/bash

# 🌟 Serafina Bot Deployment Script
# Deploy the compiled Discord bot to AWS

set -e

echo "🌟 Serafina Bot Deployment"
echo "=========================="

# Configuration
DISCORD_TOKEN="MTM0MTkzNzY1NTA1MDY3MDA4MA.GmMo4x.npcIS0rjKjlHdxYk-zOXZahmAFnEfypwz9FnVY"
REGION="us-east-1"
STACK_NAME="serafina-infrastructure-production"

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

# Check if CloudFormation stack exists
print_status "Checking AWS infrastructure..."
if ! aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" >/dev/null 2>&1; then
    print_warning "CloudFormation stack not found. Please run the infrastructure deployment first."
    exit 1
fi

# Get stack outputs
print_status "Getting infrastructure details..."
OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs' \
    --output json \
    --region "$REGION")

# Extract values from outputs
LOAD_BALANCER_DNS=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="LoadBalancerDNS") | .OutputValue')
AUTO_SCALING_GROUP=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="AutoScalingGroupName") | .OutputValue')
SECRETS_ARN=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="SecretsARN") | .OutputValue')

if [ "$LOAD_BALANCER_DNS" = "null" ] || [ -z "$LOAD_BALANCER_DNS" ]; then
    print_warning "Could not get load balancer DNS. Stack may still be deploying."
    print_status "Waiting for stack to complete..."
    aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" --region "$REGION" || \
    aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" --region "$REGION"
    
    # Get outputs again
    OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --query 'Stacks[0].Outputs' \
        --output json \
        --region "$REGION")
    
    LOAD_BALANCER_DNS=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="LoadBalancerDNS") | .OutputValue')
    AUTO_SCALING_GROUP=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="AutoScalingGroupName") | .OutputValue')
    SECRETS_ARN=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="SecretsARN") | .OutputValue')
fi

print_success "Infrastructure ready!"
print_status "Load Balancer DNS: $LOAD_BALANCER_DNS"
print_status "Auto Scaling Group: $AUTO_SCALING_GROUP"

# Store Discord token in AWS Secrets Manager
print_status "Storing Discord token in AWS Secrets Manager..."
aws secretsmanager update-secret \
    --secret-id "$SECRETS_ARN" \
    --secret-string "{\"DISCORD_TOKEN\":\"$DISCORD_TOKEN\"}" \
    --region "$REGION" >/dev/null 2>&1 || \
aws secretsmanager create-secret \
    --name "serafina-discord-token" \
    --description "Discord bot token for Serafina" \
    --secret-string "{\"DISCORD_TOKEN\":\"$DISCORD_TOKEN\"}" \
    --region "$REGION" >/dev/null

print_success "Discord token stored securely"

# Create a simple package.json for the bot
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

# Copy health server to dist
cp src/health-server.js dist/ 2>/dev/null || echo "Health server not found, will create one"

# Create health server if it doesn't exist
if [ ! -f "dist/health-server.js" ]; then
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
fi

# Create a deployment script for the bot
print_status "Creating bot deployment script..."
cat > dist/deploy.sh << 'EOF'
#!/bin/bash

# Install dependencies
npm install

# Start the bot
echo "Starting Serafina Discord Bot..."
node bot-new.js
EOF

chmod +x dist/deploy.sh

# Create a simple startup script
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

print_success "Bot deployment package created in dist/"

# Test the bot locally first
print_status "Testing bot compilation..."
cd dist
if node -c bot-new.js; then
    print_success "Bot compilation test passed"
else
    print_warning "Bot compilation test failed"
    exit 1
fi
cd ..

# Final status
echo ""
echo "🌟 Serafina Bot Deployment - READY!"
echo "==================================="
echo ""
echo "Bot files created in dist/:"
echo "- bot-new.js (compiled bot)"
echo "- health-server.js (health check server)"
echo "- package.json (dependencies)"
echo "- deploy.sh (deployment script)"
echo "- start.sh (startup script)"
echo ""
echo "Infrastructure Details:"
echo "======================"
echo "Load Balancer: $LOAD_BALANCER_DNS"
echo "Auto Scaling Group: $AUTO_SCALING_GROUP"
echo "Secrets ARN: $SECRETS_ARN"
echo ""
echo "Next Steps:"
echo "==========="
echo "1. The AWS infrastructure is ready"
echo "2. Bot files are compiled and packaged"
echo "3. Discord token is stored securely"
echo "4. Ready to deploy to AWS instances"
echo ""
print_success "Serafina bot is ready for deployment!" 