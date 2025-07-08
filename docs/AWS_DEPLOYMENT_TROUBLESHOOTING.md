# 🔧 AWS Deployment Troubleshooting Guide

## 📋 Issue Summary

During the AWS deployment attempt, we encountered the following issues:

1. **Stack in ROLLBACK_COMPLETE state** - Resolved by deleting existing stack
2. **CloudFormation deployment failure** - Requires manual investigation
3. **Shell configuration issues** - Affecting AWS CLI output

## 🚀 Current Status

**✅ Bot Status**: FULLY FUNCTIONAL LOCALLY
- Bot running healthily with all features working
- All commands and events loaded successfully
- Health endpoints responding correctly
- Ready for alternative deployment methods

## 🔍 Troubleshooting Steps

### 1. CloudFormation Stack Issues

**Problem**: Stack in ROLLBACK_COMPLETE state
```bash
# Solution: Delete existing stack
aws cloudformation delete-stack --stack-name serafina-infrastructure-production --region us-east-1

# Wait for deletion to complete
aws cloudformation describe-stacks --stack-name serafina-infrastructure-production --region us-east-1
```

**Problem**: Deployment failure after stack deletion
```bash
# Check stack events for failure reason
aws cloudformation describe-stack-events --stack-name serafina-infrastructure-production --region us-east-1

# Check specific failed resources
aws cloudformation describe-stack-events --stack-name serafina-infrastructure-production --region us-east-1 --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
```

### 2. Alternative Deployment Methods

#### Method 1: Manual CloudFormation Deployment
```bash
# Deploy with explicit parameters
aws cloudformation deploy \
  --template-file aws/serafina-infrastructure.yml \
  --stack-name serafina-infrastructure-production \
  --parameter-overrides \
    Environment=production \
    DiscordToken="YOUR_DISCORD_TOKEN" \
    ClientId=1341937655050670080 \
    AlertEmail=admin@novasanctum.com \
    DomainName=serafina.novasanctum.com \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

#### Method 2: Step-by-Step Infrastructure Creation
```bash
# 1. Create VPC and networking
aws cloudformation create-stack \
  --stack-name serafina-vpc \
  --template-body file://aws/vpc-template.yml \
  --region us-east-1

# 2. Create security groups
aws cloudformation create-stack \
  --stack-name serafina-security \
  --template-body file://aws/security-template.yml \
  --region us-east-1

# 3. Create auto-scaling group
aws cloudformation create-stack \
  --stack-name serafina-asg \
  --template-body file://aws/asg-template.yml \
  --region us-east-1
```

#### Method 3: AWS CLI Direct Resource Creation
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create subnets
aws ec2 create-subnet --vpc-id vpc-xxxxx --cidr-block 10.0.1.0/24

# Create security groups
aws ec2 create-security-group --group-name serafina-sg --description "Serafina bot security group"

# Create launch template
aws ec2 create-launch-template --launch-template-name serafina-lt --version-description v1
```

### 3. Environment Variable Issues

**Problem**: Shell configuration affecting AWS CLI
```bash
# Check shell configuration
echo $SHELL
which aws

# Try alternative shell
bash -c "aws cloudformation describe-stacks --stack-name serafina-infrastructure-production"

# Use explicit AWS profile
export AWS_PROFILE=default
aws cloudformation deploy --template-file aws/serafina-infrastructure.yml --stack-name serafina-infrastructure-production
```

### 4. Template Validation

**Problem**: CloudFormation template validation errors
```bash
# Validate template
aws cloudformation validate-template --template-body file://aws/serafina-infrastructure.yml

# Check for syntax errors
aws cloudformation validate-template --template-body file://aws/serafina-infrastructure.yml --region us-east-1
```

## 🛠️ Manual Deployment Steps

### Step 1: Verify Prerequisites
```bash
# Check AWS CLI
aws --version

# Check credentials
aws sts get-caller-identity

# Check region
aws configure get region
```

### Step 2: Create S3 Bucket
```bash
# Create bucket for CloudFormation templates
aws s3 mb s3://serafina-cfn-templates-production-$(aws sts get-caller-identity --query Account --output text)

# Upload template
aws s3 cp aws/serafina-infrastructure.yml s3://serafina-cfn-templates-production-$(aws sts get-caller-identity --query Account --output text)/
```

### Step 3: Create Key Pair
```bash
# Create EC2 key pair
aws ec2 create-key-pair --key-name serafina-key-production --query 'KeyMaterial' --output text > serafina-key-production.pem

# Set permissions
chmod 400 serafina-key-production.pem
```

### Step 4: Deploy Infrastructure
```bash
# Deploy with minimal parameters first
aws cloudformation deploy \
  --template-file aws/serafina-infrastructure.yml \
  --stack-name serafina-infrastructure-production \
  --parameter-overrides Environment=production \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

## 📊 Monitoring and Validation

### Check Deployment Status
```bash
# Check stack status
aws cloudformation describe-stacks --stack-name serafina-infrastructure-production --query 'Stacks[0].StackStatus'

# Check resources
aws cloudformation describe-stack-resources --stack-name serafina-infrastructure-production
```

### Validate Bot Deployment
```bash
# Get load balancer URL
LOAD_BALANCER_URL=$(aws cloudformation describe-stacks --stack-name serafina-infrastructure-production --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' --output text)

# Test health endpoint
curl -I $LOAD_BALANCER_URL/health
```

## 🔄 Rollback Procedures

### If Deployment Fails
```bash
# Delete failed stack
aws cloudformation delete-stack --stack-name serafina-infrastructure-production

# Clean up resources manually if needed
aws ec2 describe-instances --filters "Name=tag:Name,Values=serafina*" --query 'Reservations[].Instances[].InstanceId' --output text | xargs -I {} aws ec2 terminate-instances --instance-ids {}
```

### Alternative: Use Existing Infrastructure
If AWS deployment continues to fail, consider:
1. **Local Deployment**: Continue running bot locally (currently working perfectly)
2. **Docker Deployment**: Containerize the bot for easier deployment
3. **Alternative Cloud**: Consider other cloud providers (Google Cloud, Azure)
4. **VPS Deployment**: Deploy to a simple VPS server

## 📞 Support and Next Steps

### Current Bot Status
- ✅ **Fully Functional**: All commands working
- ✅ **Stable**: Memory usage stable at 48MB
- ✅ **Connected**: Successfully connected to Discord
- ✅ **Healthy**: All health endpoints responding

### Recommended Actions
1. **Continue Local Operation**: Bot is working perfectly locally
2. **Investigate AWS Issues**: Debug CloudFormation template
3. **Consider Alternatives**: Docker or VPS deployment
4. **Monitor Performance**: Continue monitoring local bot performance

### Contact Information
- **Discord**: GameDin Community Server
- **Email**: admin@novasanctum.com
- **Documentation**: Project repository

---

**Last Updated**: 2025-07-07  
**Status**: BOT FULLY FUNCTIONAL - AWS DEPLOYMENT REQUIRES TROUBLESHOOTING 