#!/bin/bash

# 🌟 Serafina AWS Infrastructure Upgrade & Deployment Script
# Upgrade Serafina Discord Bot to 24/7 AWS infrastructure with auto-scaling

set -e

echo "🌟 Serafina AWS Infrastructure Upgrade"
echo "======================================"
echo "Upgrading to 24/7 reliability with auto-scaling and traffic routing"
echo ""

# Configuration
STACK_NAME="serafina-infrastructure"
ENVIRONMENT=${1:-production}
REGION=${AWS_REGION:-us-east-1}
ALERT_EMAIL=${2:-admin@novasanctum.com}
DOMAIN=${3:-serafina.novasanctum.com}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging functions
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

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Validate environment
validate_environment() {
    print_step "Validating environment configuration..."
    
    if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
        print_error "Invalid environment. Must be development, staging, or production"
        exit 1
    fi
    
    print_success "Environment: $ENVIRONMENT"
    print_success "Region: $REGION"
    print_success "Alert Email: $ALERT_EMAIL"
    print_success "Domain: $DOMAIN"
}

# Check AWS CLI and credentials
check_aws_setup() {
    print_step "Checking AWS CLI and credentials..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        print_warning "Install with: curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip' && unzip awscliv2.zip && sudo ./aws/install"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_success "AWS CLI configured for account: $ACCOUNT_ID"
}

# Create S3 bucket for CloudFormation templates
create_s3_bucket() {
    print_step "Creating S3 bucket for CloudFormation templates..."
    
    BUCKET_NAME="serafina-cfn-templates-${ENVIRONMENT}-${ACCOUNT_ID}"
    
    # Create bucket if it doesn't exist
    if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
        if [ "$REGION" = "us-east-1" ]; then
            aws s3api create-bucket \
                --bucket "$BUCKET_NAME" \
                --region "$REGION"
        else
            aws s3api create-bucket \
                --bucket "$BUCKET_NAME" \
                --region "$REGION" \
                --create-bucket-configuration LocationConstraint="$REGION"
        fi
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
    aws s3 cp aws/serafina-infrastructure.yml "s3://${BUCKET_NAME}/infrastructure.yml"
    print_success "Uploaded CloudFormation template to S3"
}

# Create EC2 key pair
create_key_pair() {
    print_step "Creating EC2 key pair for Serafina instances..."
    
    KEY_NAME="serafina-key-${ENVIRONMENT}"
    
    # Check if key pair exists
    if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" &> /dev/null; then
        aws ec2 create-key-pair \
            --key-name "$KEY_NAME" \
            --query 'KeyMaterial' \
            --output text > "${KEY_NAME}.pem"
        
        chmod 400 "${KEY_NAME}.pem"
        print_success "Created key pair: $KEY_NAME"
        print_warning "Key file saved as: ${KEY_NAME}.pem (keep this secure!)"
    else
        print_success "Key pair already exists: $KEY_NAME"
    fi
}

# Deploy CloudFormation stack
deploy_infrastructure() {
    print_step "Deploying Serafina infrastructure stack..."
    
    # Get Discord bot credentials
    print_status "Please provide Discord bot credentials:"
    read -p "Discord Bot Token: " DISCORD_TOKEN
    read -p "Discord Client ID: " CLIENT_ID
    
    if [[ -z "$DISCORD_TOKEN" || -z "$CLIENT_ID" ]]; then
        print_error "Discord credentials are required"
        exit 1
    fi
    
    # Deploy the stack
    aws cloudformation deploy \
        --template-url "https://${BUCKET_NAME}.s3.amazonaws.com/infrastructure.yml" \
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
    
    print_success "Infrastructure deployment completed"
}

# Enable AWS services
enable_aws_services() {
    print_step "Enabling AWS services for monitoring and security..."
    
    # Enable AWS Shield Advanced if in production
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "Enabling AWS Shield Advanced..."
        aws shield subscribe || print_warning "AWS Shield Advanced subscription failed (may already be enabled)"
    fi
    
    # Enable GuardDuty
    print_status "Configuring GuardDuty..."
    aws guardduty create-detector \
        --enable \
        --finding-publishing-frequency FIFTEEN_MINUTES \
        --data-sources '{"S3Logs":{"Enable":true},"Kubernetes":{"AuditLogs":{"Enable":true}},"MalwareProtection":{"ScanEc2InstanceWithFindings":{"EbsVolumes":true}}}' \
        --region "$REGION" || print_warning "GuardDuty may already be enabled"
    
    # Enable Security Hub
    print_status "Configuring Security Hub..."
    aws securityhub enable-security-hub \
        --enable-default-standards \
        --control-finding-generator SECURITY_CONTROL \
        --region "$REGION" || print_warning "Security Hub may already be enabled"
    
    print_success "AWS services enabled"
}

# Get stack outputs
get_stack_outputs() {
    print_step "Getting infrastructure outputs..."
    
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
    ALERT_TOPIC_ARN=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="AlertTopicARN") | .OutputValue')
    VPC_ID=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="VPCId") | .OutputValue')
    
    print_success "Infrastructure outputs retrieved"
}

# Validate infrastructure
validate_infrastructure() {
    print_step "Validating infrastructure deployment..."
    
    # Test load balancer
    print_status "Testing load balancer..."
    if curl -I "$LOAD_BALANCER_URL" &> /dev/null; then
        print_success "Load balancer is responding"
    else
        print_warning "Load balancer may not be ready yet (instances still starting)"
    fi
    
    # Check Auto Scaling Group
    print_status "Checking Auto Scaling Group..."
    ASG_STATUS=$(aws autoscaling describe-auto-scaling-groups \
        --auto-scaling-group-names "$AUTO_SCALING_GROUP" \
        --query 'AutoScalingGroups[0].Instances[].LifecycleState' \
        --output text)
    
    print_success "Auto Scaling Group status: $ASG_STATUS"
    
    # Check CloudWatch alarms
    print_status "Checking CloudWatch alarms..."
    aws cloudwatch describe-alarms \
        --alarm-names "serafina-cpu-alarm-${ENVIRONMENT}" "serafina-health-alarm-${ENVIRONMENT}" \
        --query 'MetricAlarms[].{Name:AlarmName,State:StateValue}' \
        --output table
    
    print_success "Infrastructure validation completed"
}

# Create CloudWatch dashboard
create_dashboard() {
    print_step "Creating CloudWatch dashboard for monitoring..."
    
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
}

# Setup monitoring and alerts
setup_monitoring() {
    print_step "Setting up monitoring and alerting..."
    
    # Create additional CloudWatch alarms
    aws cloudwatch put-metric-alarm \
        --alarm-name "serafina-memory-alarm-${ENVIRONMENT}" \
        --alarm-description "Memory utilization alarm for Serafina" \
        --metric-name MemoryUtilization \
        --namespace AWS/EC2 \
        --statistic Average \
        --period 300 \
        --evaluation-periods 2 \
        --threshold 80 \
        --comparison-operator GreaterThanThreshold \
        --dimensions Name=AutoScalingGroupName,Value="$AUTO_SCALING_GROUP" \
        --region "$REGION"
    
    # Create SNS topic for Discord notifications
    DISCORD_WEBHOOK_TOPIC=$(aws sns create-topic \
        --name "serafina-discord-alerts-${ENVIRONMENT}" \
        --region "$REGION" \
        --query 'TopicArn' \
        --output text)
    
    print_success "Monitoring and alerting configured"
}

# Final status report
generate_status_report() {
    print_header "Serafina AWS Infrastructure Upgrade - COMPLETED"
    echo ""
    echo "Infrastructure Details:"
    echo "======================"
    echo "Environment: $ENVIRONMENT"
    echo "Region: $REGION"
    echo "Load Balancer DNS: $LOAD_BALANCER_DNS"
    echo "Load Balancer URL: $LOAD_BALANCER_URL"
    echo "Auto Scaling Group: $AUTO_SCALING_GROUP"
    echo "VPC ID: $VPC_ID"
    echo "Secrets ARN: $SECRETS_ARN"
    echo "Alert Topic ARN: $ALERT_TOPIC_ARN"
    echo ""
    echo "Monitoring:"
    echo "==========="
    echo "CloudWatch Dashboard: Serafina-${ENVIRONMENT}"
    echo "CloudWatch Alarms: serafina-cpu-alarm-${ENVIRONMENT}, serafina-health-alarm-${ENVIRONMENT}"
    echo ""
    echo "Next Steps:"
    echo "==========="
    echo "1. Monitor the CloudWatch dashboard for system health"
    echo "2. Test Serafina bot responsiveness"
    echo "3. Configure DNS if using custom domain"
    echo "4. Set up additional monitoring as needed"
    echo ""
    print_success "Serafina is now running on 24/7 AWS infrastructure with auto-scaling!"
}

# Main deployment function
main() {
    print_header "Starting Serafina AWS Infrastructure Upgrade"
    echo ""
    
    validate_environment
    check_aws_setup
    create_s3_bucket
    create_key_pair
    deploy_infrastructure
    enable_aws_services
    get_stack_outputs
    validate_infrastructure
    create_dashboard
    setup_monitoring
    generate_status_report
    
    print_success "Serafina AWS infrastructure upgrade completed successfully!"
}

# Run main function
main "$@" 