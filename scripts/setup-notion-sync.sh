#!/bin/bash

# Notion Sync Setup Script
# This script automates the setup of Notion-GitHub documentation integration

set -e

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate Notion token format
validate_notion_token() {
    local token=$1
    if [[ $token =~ ^ntn_[a-zA-Z0-9]{32}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to get user input with validation
get_user_input() {
    local prompt=$1
    local validation_func=$2
    local input
    
    while true; do
        read -p "$prompt: " input
        if $validation_func "$input"; then
            echo "$input"
            break
        else
            print_error "Invalid input. Please try again."
        fi
    done
}

# Function to create .env file
create_env_file() {
    local notion_token=$1
    
    cat > .env << EOF
# Notion Integration Configuration
NOTION_TOKEN=$notion_token
NODE_ENV=development

# GitHub Configuration
GITHUB_REPO=GameDinDiscord

# Sync Configuration
SYNC_INTERVAL=300000
BIDIRECTIONAL=true
EOF
    
    print_success "Created .env file"
}

# Function to update configuration
update_config() {
    local notion_token=$1
    local page_ids=$2
    
    # Create backup of existing config
    if [ -f "config/notion-sync.config.ts" ]; then
        cp config/notion-sync.config.ts config/notion-sync.config.ts.backup
        print_status "Backed up existing configuration"
    fi
    
    # Update the page IDs in config
    if [ -n "$page_ids" ]; then
        # This is a simplified update - in practice, you'd want to use a more robust method
        sed -i.bak "s/pageIds: \[.*\]/pageIds: [$page_ids]/" config/notion-sync.config.ts
        print_success "Updated page IDs in configuration"
    fi
}

# Function to setup GitHub secrets (instructions)
setup_github_secrets() {
    print_status "Setting up GitHub Secrets..."
    echo
    echo "To complete the setup, you need to add the following secret to your GitHub repository:"
    echo
    echo "1. Go to your GitHub repository"
    echo "2. Navigate to Settings → Secrets and variables → Actions"
    echo "3. Click 'New repository secret'"
    echo "4. Add the following secret:"
    echo "   Name: NOTION_TOKEN"
    echo "   Value: $NOTION_TOKEN"
    echo
    echo "This will enable the GitHub Actions workflow to sync documentation automatically."
    echo
}

# Function to test the setup
test_setup() {
    print_status "Testing the setup..."
    
    # Test Node.js and npm
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Test Notion API connection
    print_status "Testing Notion API connection..."
    if npm run notion-sync:validate > /dev/null 2>&1; then
        print_success "Notion API connection successful"
    else
        print_warning "Notion API connection failed. Please check your token and try again."
    fi
}

# Function to show next steps
show_next_steps() {
    echo
    print_success "Setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Add your Notion page IDs to config/notion-sync.config.ts"
    echo "2. Run: npm run notion-sync:init"
    echo "3. Run: npm run notion-sync:sync"
    echo "4. Set up GitHub Secrets (see instructions above)"
    echo
    echo "Available commands:"
    echo "  npm run notion-sync:init    - Initialize the sync service"
    echo "  npm run notion-sync:sync    - Perform manual sync"
    echo "  npm run notion-sync:status  - Show sync status"
    echo "  npm run notion-sync:watch   - Start auto-sync mode"
    echo "  npm run notion-sync:validate - Validate configuration"
    echo
    echo "Documentation: docs/NOTION_INTEGRATION.md"
    echo
}

# Main setup function
main() {
    echo "🚀 Notion-GitHub Documentation Integration Setup"
    echo "================================================"
    echo
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is required but not installed."
        print_error "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is required but not installed."
        print_error "Please install npm from https://www.npmjs.com/"
        exit 1
    fi
    
    if ! command_exists git; then
        print_error "Git is required but not installed."
        print_error "Please install Git from https://git-scm.com/"
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
    
    # Get Notion token
    echo
    print_status "Notion API Token Configuration"
    echo "You need a Notion API token to enable the integration."
    echo "To get a token:"
    echo "1. Go to https://www.notion.so/my-integrations"
    echo "2. Create a new integration"
    echo "3. Copy the token (starts with 'ntn_')"
    echo
    
    NOTION_TOKEN=$(get_user_input "Enter your Notion API token" validate_notion_token)
    
    # Get page IDs (optional)
    echo
    print_status "Notion Page IDs (Optional)"
    echo "You can add Notion page IDs now or later in the configuration file."
    echo "Page IDs can be found in the URL when viewing a Notion page."
    echo "Example: https://notion.so/My-Page-1234567890abcdef"
    echo "The page ID would be: 1234567890abcdef"
    echo
    
    read -p "Enter Notion page IDs (comma-separated, or press Enter to skip): " PAGE_IDS
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Create .env file
    print_status "Creating environment configuration..."
    create_env_file "$NOTION_TOKEN"
    
    # Update configuration
    if [ -n "$PAGE_IDS" ]; then
        print_status "Updating configuration..."
        update_config "$NOTION_TOKEN" "$PAGE_IDS"
    fi
    
    # Setup GitHub secrets instructions
    setup_github_secrets
    
    # Test setup
    test_setup
    
    # Show next steps
    show_next_steps
}

# Function to show help
show_help() {
    echo "Notion Sync Setup Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -t, --token    Pre-configure with Notion token"
    echo "  -p, --pages    Pre-configure with page IDs"
    echo
    echo "Examples:"
    echo "  $0                    # Interactive setup"
    echo "  $0 -t ntn_abc123...   # Use provided token"
    echo
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -t|--token)
            NOTION_TOKEN="$2"
            shift 2
            ;;
        -p|--pages)
            PAGE_IDS="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main setup
main 