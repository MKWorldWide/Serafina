#!/bin/bash

# 🌟 GameDin Discord Bot - Automated Deployment Script
# This script will deploy the bot to your server and set up all necessary configurations

set -e  # Exit on any error

echo "🌟 GameDin Discord Bot - Automated Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Build the project
build_project() {
    print_status "Building the project..."
    npm run build
    print_success "Project built successfully"
}

# Check environment variables
check_env() {
    print_status "Checking environment configuration..."
    
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating template..."
        cat > .env << EOF
# GameDin Discord Bot Configuration
# Replace with your actual Discord bot token
DISCORD_TOKEN=your_discord_bot_token_here

# Optional: Logging level (debug, info, warn, error)
LOG_LEVEL=info

# Optional: Database configuration (if using external database)
# DATABASE_URL=your_database_url_here
EOF
        print_warning "Please edit .env file and add your Discord bot token"
        print_warning "You can get your bot token from: https://discord.com/developers/applications"
        exit 1
    fi
    
    # Check if DISCORD_TOKEN is set
    if ! grep -q "DISCORD_TOKEN=" .env || grep -q "DISCORD_TOKEN=your_discord_bot_token_here" .env; then
        print_error "DISCORD_TOKEN not set in .env file"
        print_warning "Please edit .env file and add your Discord bot token"
        exit 1
    fi
    
    print_success "Environment configuration is valid"
}

# Deploy slash commands
deploy_commands() {
    print_status "Deploying slash commands to Discord..."
    npm run deploy-commands
    print_success "Slash commands deployed successfully"
}

# Start the bot
start_bot() {
    print_status "Starting GameDin Discord Bot..."
    
    # Check if PM2 is installed
    if command -v pm2 &> /dev/null; then
        print_status "Using PM2 for process management..."
        
        # Stop existing process if running
        pm2 stop gamedin-bot 2>/dev/null || true
        pm2 delete gamedin-bot 2>/dev/null || true
        
        # Start with PM2
        pm2 start ecosystem.config.js --name gamedin-bot
        pm2 save
        pm2 startup
        
        print_success "Bot started with PM2"
        print_status "Use 'pm2 logs gamedin-bot' to view logs"
        print_status "Use 'pm2 restart gamedin-bot' to restart"
        print_status "Use 'pm2 stop gamedin-bot' to stop"
        
    else
        print_warning "PM2 not found. Starting bot directly..."
        print_warning "Install PM2 with: npm install -g pm2"
        npm start
    fi
}

# Setup instructions
show_setup_instructions() {
    echo ""
    echo "🎉 GameDin Bot Setup Complete!"
    echo "=============================="
    echo ""
    echo "Next steps:"
    echo "1. Invite the bot to your Discord server:"
    echo "   https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=8&scope=bot%20applications.commands"
    echo ""
    echo "2. The bot will automatically:"
    echo "   - Create all necessary channels and categories"
    echo "   - Set up roles and permissions"
    echo "   - Configure auto-moderation"
    echo "   - Initialize the XP system"
    echo ""
    echo "3. Use /manage setup in your server to initialize everything"
    echo ""
    echo "4. Monitor the bot logs for any issues"
    echo ""
    echo "🌟 Welcome to the GameDin community!"
}

# Main deployment function
main() {
    echo "Starting deployment process..."
    echo ""
    
    check_node
    check_npm
    install_dependencies
    build_project
    check_env
    deploy_commands
    
    echo ""
    print_status "Deployment completed successfully!"
    echo ""
    
    # Ask if user wants to start the bot
    read -p "Do you want to start the bot now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_bot
    else
        print_status "To start the bot later, run: npm start"
    fi
    
    show_setup_instructions
}

# Run main function
main "$@" 