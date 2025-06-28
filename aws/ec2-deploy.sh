#!/bin/bash

# 🌟 SeraFina EC2 Deployment Script
# Deploy SeraFina to AWS EC2 for 24/7 operation

set -e

echo "🌟 SeraFina EC2 Deployment"
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
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS CLI configured"
}

# Create EC2 instance
create_ec2_instance() {
    print_status "Creating EC2 instance for SeraFina..."
    
    # Create security group
    SG_ID=$(aws ec2 create-security-group \
        --group-name serafina-sg \
        --description "Security group for SeraFina Discord Bot" \
        --query 'GroupId' --output text 2>/dev/null || \
        aws ec2 describe-security-groups \
        --group-names serafina-sg \
        --query 'SecurityGroups[0].GroupId' --output text)
    
    # Allow SSH and HTTP
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0 2>/dev/null || true
    
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 2>/dev/null || true
    
    # Create key pair
    aws ec2 create-key-pair \
        --key-name serafina-key \
        --query 'KeyMaterial' \
        --output text > serafina-key.pem 2>/dev/null || true
    
    chmod 400 serafina-key.pem
    
    # Launch EC2 instance
    INSTANCE_ID=$(aws ec2 run-instances \
        --image-id ami-0c02fb55956c7d316 \
        --count 1 \
        --instance-type t3.micro \
        --key-name serafina-key \
        --security-group-ids $SG_ID \
        --user-data file://aws/user-data.sh \
        --query 'Instances[0].InstanceId' \
        --output text)
    
    print_success "EC2 instance created: $INSTANCE_ID"
    
    # Wait for instance to be running
    print_status "Waiting for instance to be ready..."
    aws ec2 wait instance-running --instance-ids $INSTANCE_ID
    
    # Get public IP
    PUBLIC_IP=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text)
    
    print_success "SeraFina is running at: $PUBLIC_IP"
    print_status "SSH access: ssh -i serafina-key.pem ubuntu@$PUBLIC_IP"
    
    # Save instance info
    echo "INSTANCE_ID=$INSTANCE_ID" > aws-instance-info
    echo "PUBLIC_IP=$PUBLIC_IP" >> aws-instance-info
    echo "SG_ID=$SG_ID" >> aws-instance-info
}

# Create user data script
create_user_data() {
    print_status "Creating user data script..."
    
    cat > aws/user-data.sh << 'EOF'
#!/bin/bash
# SeraFina Discord Bot EC2 Setup

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Create app directory
mkdir -p /opt/serafina
cd /opt/serafina

# Download application (you'll need to upload this)
# For now, we'll create a placeholder
cat > package.json << 'PACKAGE_EOF'
{
  "name": "serafina-discord-bot",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "dotenv": "^16.4.1"
  }
}
PACKAGE_EOF

# Create environment file
cat > .env << 'ENV_EOF'
DISCORD_TOKEN=MTM0MTkzNzY1NTA1MDY3MDA4MA.Gkph2_.Pdw5ZY3URWy21eZur43hkyyVKIcN2q-xU3qnKw
CLIENT_ID=1341937655050670080
NODE_ENV=production
ENV_EOF

# Install dependencies
npm install

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'ECOSYSTEM_EOF'
module.exports = {
  apps: [{
    name: 'serafina',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
ECOSYSTEM_EOF

# Setup PM2 startup
pm2 startup
pm2 save

echo "SeraFina setup completed!"
EOF

    chmod +x aws/user-data.sh
    print_success "User data script created"
}

# Main deployment
main() {
    check_aws_cli
    create_user_data
    create_ec2_instance
    
    print_success "SeraFina EC2 deployment completed!"
    print_status "The bot will be available 24/7 on AWS EC2"
    print_warning "You'll need to upload your application files to the EC2 instance"
    print_status "Use: scp -i serafina-key.pem -r dist/ ubuntu@\$PUBLIC_IP:/opt/serafina/"
}

main "$@" 