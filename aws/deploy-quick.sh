#!/bin/bash

# 🌟 Serafina Quick AWS Deployment
# Deploy Serafina to AWS with provided Discord token

set -e

echo "🌟 Serafina Quick AWS Deployment"
echo "================================"

# Configuration
STACK_NAME="serafina-infrastructure"
ENVIRONMENT="production"
REGION="us-east-1"
ALERT_EMAIL="admin@novasanctum.com"
DOMAIN="serafina.novasanctum.com"

# Discord credentials (provided by user)
DISCORD_TOKEN="MTM0MTkzNzY1NTA1MDY3MDA4MA.GmMo4x.npcIS0rjKjlHdxYk-zOXZahmAFnEfypwz9FnVY"
CLIENT_ID="1341937650506700800"  # Extracted from token

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

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="serafina-cfn-templates-${ENVIRONMENT}-${ACCOUNT_ID}"

print_status "Starting Serafina deployment to AWS..."
print_status "Account ID: $ACCOUNT_ID"
print_status "Region: $REGION"
print_status "Stack Name: $STACK_NAME-$ENVIRONMENT"

# Create S3 bucket if it doesn't exist
print_status "Setting up S3 bucket for CloudFormation templates..."
if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
    print_success "Created S3 bucket: $BUCKET_NAME"
else
    print_success "S3 bucket already exists: $BUCKET_NAME"
fi

# Enable bucket encryption
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'

# Enable bucket versioning
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled

# Upload CloudFormation template
print_status "Uploading CloudFormation template..."
aws s3 cp aws/serafina-infrastructure.yml "s3://${BUCKET_NAME}/infrastructure.yml"
print_success "Template uploaded to S3"

# Deploy CloudFormation stack
print_status "Deploying Serafina infrastructure stack..."
aws cloudformation deploy \
    --template-file aws/serafina-infrastructure.yml \
    --stack-name "$STACK_NAME-${ENVIRONMENT}" \
    --parameter-overrides \
        Environment="$ENVIRONMENT" \
        DiscordToken="$DISCORD_TOKEN" \
        ClientId="$CLIENT_ID" \
        AlertEmail="$ALERT_EMAIL" \
        DomainName="$DOMAIN" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "$REGION" \
    --no-fail-on-empty-changeset

print_success "CloudFormation stack deployment initiated"

# Wait for stack to complete
print_status "Waiting for stack deployment to complete..."
aws cloudformation wait stack-create-complete \
    --stack-name "$STACK_NAME-${ENVIRONMENT}" \
    --region "$REGION" || \
aws cloudformation wait stack-update-complete \
    --stack-name "$STACK_NAME-${ENVIRONMENT}" \
    --region "$REGION"

print_success "Stack deployment completed!"

# Get stack outputs
print_status "Getting infrastructure details..."
OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME-${ENVIRONMENT}" \
    --query 'Stacks[0].Outputs' \
    --output json \
    --region "$REGION")

# Extract values from outputs
LOAD_BALANCER_DNS=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="LoadBalancerDNS") | .OutputValue')
LOAD_BALANCER_URL=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="LoadBalancerURL") | .OutputValue')
AUTO_SCALING_GROUP=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="AutoScalingGroupName") | .OutputValue')
SECRETS_ARN=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="SecretsARN") | .OutputValue')

# Enable AWS services
print_status "Enabling AWS monitoring services..."

# Enable GuardDuty
aws guardduty create-detector \
    --enable \
    --finding-publishing-frequency FIFTEEN_MINUTES \
    --data-sources '{"S3Logs":{"Enable":true},"Kubernetes":{"AuditLogs":{"Enable":true}},"MalwareProtection":{"ScanEc2InstanceWithFindings":{"EbsVolumes":true}}}' \
    --region "$REGION" 2>/dev/null || print_warning "GuardDuty may already be enabled"

# Enable Security Hub
aws securityhub enable-security-hub \
    --enable-default-standards \
    --control-finding-generator SECURITY_CONTROL \
    --region "$REGION" 2>/dev/null || print_warning "Security Hub may already be enabled"

# Create CloudWatch dashboard
print_status "Creating CloudWatch dashboard..."
DASHBOARD_BODY=$(cat << EOF
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", "$AUTO_SCALING_GROUP"],
                    [".", "NetworkIn", ".", "."],
                    [".", "NetworkOut", ".", "."]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Serafina EC2 Metrics",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "$LOAD_BALANCER_DNS"],
                    [".", "TargetResponseTime", ".", "."],
                    [".", "HealthyHostCount", "TargetGroup", "serafina-tg-${ENVIRONMENT}"]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Serafina Load Balancer Metrics",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 6,
            "width": 24,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/AutoScaling", "GroupInServiceInstances", "AutoScalingGroupName", "$AUTO_SCALING_GROUP"],
                    [".", "GroupDesiredCapacity", ".", "."],
                    [".", "GroupMaxSize", ".", "."]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Serafina Auto Scaling Group",
                "period": 300
            }
        }
    ]
}
EOF
)

aws cloudwatch put-dashboard \
    --dashboard-name "Serafina-${ENVIRONMENT}" \
    --dashboard-body "$DASHBOARD_BODY" \
    --region "$REGION"

print_success "CloudWatch dashboard created"

# Final status report
echo ""
echo "🌟 Serafina AWS Deployment - COMPLETED!"
echo "========================================"
echo ""
echo "Infrastructure Details:"
echo "======================"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo "Load Balancer DNS: $LOAD_BALANCER_DNS"
echo "Load Balancer URL: $LOAD_BALANCER_URL"
echo "Auto Scaling Group: $AUTO_SCALING_GROUP"
echo "Secrets ARN: $SECRETS_ARN"
echo ""
echo "Monitoring:"
echo "==========="
echo "CloudWatch Dashboard: Serafina-${ENVIRONMENT}"
echo "Health Check: $LOAD_BALANCER_URL/health"
echo "Status Check: $LOAD_BALANCER_URL/status"
echo ""
echo "Next Steps:"
echo "==========="
echo "1. Monitor the CloudWatch dashboard for system health"
echo "2. Test Serafina bot responsiveness"
echo "3. Configure DNS if using custom domain"
echo "4. Set up additional monitoring as needed"
echo ""
print_success "Serafina is now running on 24/7 AWS infrastructure with auto-scaling!" 