#!/bin/bash

# 🌟 SeraFina AWS Deployment Script
# Deploy SeraFina to AWS for 24/7 operation

set -e

echo "🌟 SeraFina AWS Deployment"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check AWS CLI
check_aws_cli() {
    print_status "Checking AWS CLI installation..."
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        print_warning "Install with: curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip' && unzip awscliv2.zip && sudo ./aws/install"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS CLI configured"
}

# Build the application
build_app() {
    print_status "Building SeraFina..."
    npm run build
    print_success "Build completed"
}

# Create deployment package
create_package() {
    print_status "Creating deployment package..."
    
    # Create deployment directory
    rm -rf deployment
    mkdir -p deployment
    
    # Copy necessary files
    cp -r dist deployment/
    cp package.json deployment/
    cp .env deployment/
    cp ecosystem.config.js deployment/
    
    # Install production dependencies
    cd deployment
    npm install --production
    cd ..
    
    print_success "Deployment package created"
}

# Deploy to AWS
deploy_to_aws() {
    print_status "Deploying to AWS..."
    
    # Create S3 bucket if it doesn't exist
    BUCKET_NAME="serafina-discord-bot-$(date +%s)"
    print_status "Creating S3 bucket: $BUCKET_NAME"
    
    aws s3 mb s3://$BUCKET_NAME --region us-east-1
    
    # Upload deployment package
    print_status "Uploading deployment package..."
    aws s3 sync deployment/ s3://$BUCKET_NAME/
    
    # Create CloudFormation stack
    print_status "Creating CloudFormation stack..."
    aws cloudformation create-stack \
        --stack-name serafina-discord-bot \
        --template-body file://aws/cloudformation.yml \
        --parameters ParameterKey=S3BucketName,ParameterValue=$BUCKET_NAME \
        --capabilities CAPABILITY_IAM \
        --region us-east-1
    
    print_success "Deployment initiated"
    print_status "Check status with: aws cloudformation describe-stacks --stack-name serafina-discord-bot"
}

# Main deployment
main() {
    check_aws_cli
    build_app
    create_package
    deploy_to_aws
    
    print_success "SeraFina AWS deployment completed!"
    print_status "The bot will be available 24/7 on AWS"
}

main "$@" 