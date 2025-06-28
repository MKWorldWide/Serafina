#!/bin/bash

# 🌟 Upload SeraFina to EC2 Instance
# Upload the built application to the running EC2 instance

set -e

echo "🌟 Uploading SeraFina to EC2"
echo "============================"

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

# Check if instance info exists
if [ ! -f aws-instance-info ]; then
    print_error "Instance info not found. Please run aws/ec2-deploy.sh first."
    exit 1
fi

# Load instance info
source aws-instance-info

# Check if key file exists
if [ ! -f serafina-key.pem ]; then
    print_error "SSH key file not found. Please run aws/ec2-deploy.sh first."
    exit 1
fi

# Build the application
print_status "Building SeraFina..."
npm run build
print_success "Build completed"

# Create deployment package
print_status "Creating deployment package..."
rm -rf deployment
mkdir -p deployment
cp -r dist deployment/
cp package.json deployment/
cp .env deployment/
cp ecosystem.config.js deployment/

# Upload to EC2
print_status "Uploading to EC2 instance ($PUBLIC_IP)..."
scp -i serafina-key.pem -r deployment/* ubuntu@$PUBLIC_IP:/opt/serafina/

# Install dependencies and start
print_status "Installing dependencies and starting SeraFina..."
ssh -i serafina-key.pem ubuntu@$PUBLIC_IP << 'EOF'
cd /opt/serafina
npm install --production
pm2 restart serafina || pm2 start ecosystem.config.js --name serafina
pm2 save
echo "SeraFina is now running!"
EOF

print_success "SeraFina uploaded and started successfully!"
print_status "Check status: ssh -i serafina-key.pem ubuntu@$PUBLIC_IP 'pm2 status'"
print_status "View logs: ssh -i serafina-key.pem ubuntu@$PUBLIC_IP 'pm2 logs serafina'" 