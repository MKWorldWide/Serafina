#!/bin/bash

# GameDin Discord Bot - GitHub Actions Deployment Script
# Handles deployment from GitHub Actions to AWS

set -e

# Configuration
ENVIRONMENT=${1:-staging}
REGION=${AWS_REGION:-us-east-1}
STACK_NAME="serafina-infrastructure-${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
validate_environment() {
    log_info "Validating deployment environment..."
    
    if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
        log_error "Invalid environment: $ENVIRONMENT"
        exit 1
    fi
    
    log_success "Deploying to: $ENVIRONMENT"
    log_success "AWS Region: $REGION"
}

# Check AWS credentials
check_aws_credentials() {
    log_info "Checking AWS credentials..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured"
        exit 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    log_success "AWS Account: $ACCOUNT_ID"
}

# Build and package application
build_application() {
    log_info "Building application..."
    
    # Install dependencies
    npm ci
    
    # Run tests
    npm run test:coverage
    
    # Build application
    npm run build:new
    
    log_success "Application built successfully"
}

# Create deployment package
create_deployment_package() {
    log_info "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p deployment
    
    # Copy necessary files
    cp -r dist deployment/
    cp package*.json deployment/
    cp aws/* deployment/
    cp Dockerfile deployment/
    cp docker-compose.yml deployment/
    
    # Create deployment archive
    tar -czf "gamedin-bot-${ENVIRONMENT}.tar.gz" -C deployment .
    
    log_success "Deployment package created: gamedin-bot-${ENVIRONMENT}.tar.gz"
}

# Deploy to AWS
deploy_to_aws() {
    log_info "Deploying to AWS..."
    
    # Get Discord credentials from GitHub secrets
    DISCORD_TOKEN=${DISCORD_TOKEN}
    CLIENT_ID=${CLIENT_ID}
    ALERT_EMAIL=${ALERT_EMAIL}
    DOMAIN=${DOMAIN}
    
    if [[ -z "$DISCORD_TOKEN" || -z "$CLIENT_ID" ]]; then
        log_error "Discord credentials not provided"
        exit 1
    fi
    
    # Deploy using CloudFormation
    aws cloudformation deploy \
        --template-file aws/serafina-infrastructure.yml \
        --stack-name "$STACK_NAME" \
        --parameter-overrides \
            Environment="$ENVIRONMENT" \
            DiscordToken="$DISCORD_TOKEN" \
            ClientId="$CLIENT_ID" \
            AlertEmail="$ALERT_EMAIL" \
            DomainName="$DOMAIN" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "$REGION" \
        --no-fail-on-empty-changeset
    
    log_success "AWS deployment completed"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Wait for stack to be ready
    aws cloudformation wait stack-update-complete \
        --stack-name "$STACK_NAME" \
        --region "$REGION"
    
    # Get stack outputs
    STACK_OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs' \
        --output json)
    
    # Extract important outputs
    BOT_URL=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="BotHealthUrl") | .OutputValue')
    
    if [[ "$BOT_URL" != "null" ]]; then
        log_success "Bot health endpoint: $BOT_URL"
        
        # Test health endpoint
        if curl -f "$BOT_URL/health" &> /dev/null; then
            log_success "Health check passed"
        else
            log_warning "Health check failed - bot may still be starting"
        fi
    else
        log_warning "Could not retrieve bot URL from stack outputs"
    fi
}

# Main deployment process
main() {
    log_info "Starting GameDin Discord Bot deployment..."
    
    validate_environment
    check_aws_credentials
    build_application
    create_deployment_package
    deploy_to_aws
    verify_deployment
    
    log_success "Deployment completed successfully!"
}

# Run main function
main "$@" 