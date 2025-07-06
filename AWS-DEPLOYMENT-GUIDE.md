# 🌟 Serafina AWS Infrastructure Upgrade & Deployment Guide

## 🎯 Overview

This guide provides comprehensive instructions for upgrading Serafina Discord Bot to run on AWS infrastructure with 24/7 reliability, auto-scaling, and traffic routing through AWS.

## 🚀 Quick Start

### Prerequisites

1. **AWS CLI Installed**
   ```bash
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```

2. **AWS Credentials Configured**
   ```bash
   aws configure
   ```

3. **Node.js 18+ and npm**
   ```bash
   node --version
   npm --version
   ```

4. **Discord Bot Token and Client ID**
   - Get from [Discord Developer Portal](https://discord.com/developers/applications)

### One-Command Deployment

```bash
# Deploy to production
npm run aws:deploy:prod

# Deploy to staging
npm run aws:deploy:staging

# Deploy to development
npm run aws:deploy:dev
```

## 🏗️ Infrastructure Components

### 1. **VPC and Networking**
- **VPC**: Custom VPC with public and private subnets
- **Internet Gateway**: For public subnet access
- **NAT Gateway**: For private subnet internet access
- **Route Tables**: Proper routing configuration
- **Security Groups**: Firewall rules for bot instances

### 2. **Auto Scaling Group**
- **Minimum Instances**: 2 (for high availability)
- **Maximum Instances**: 10 (for scalability)
- **Desired Capacity**: 2 (initial deployment)
- **Health Checks**: ELB health checks every 30 seconds
- **Scaling Policies**: CPU-based auto-scaling (70% scale up, 30% scale down)

### 3. **Load Balancer**
- **Application Load Balancer**: Distributes traffic across instances
- **Target Group**: Health checks on port 3000
- **Health Check Path**: `/health` endpoint
- **Sticky Sessions**: Enabled for consistent user experience

### 4. **Monitoring and Alerting**
- **CloudWatch Dashboard**: Real-time metrics visualization
- **CloudWatch Alarms**: CPU, memory, and health monitoring
- **SNS Topics**: Email and Discord notifications
- **GuardDuty**: Security threat detection
- **Security Hub**: Security compliance monitoring

### 5. **Security Features**
- **Secrets Manager**: Secure storage of Discord tokens and API keys
- **IAM Roles**: Least privilege access for instances
- **WAF Rules**: Web application firewall protection
- **Encryption**: All data encrypted at rest and in transit

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Infrastructure                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Route53   │    │ CloudFront  │    │     WAF     │     │
│  │   (DNS)     │    │   (CDN)     │    │ (Firewall)  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                   │                   │           │
│         └───────────────────┼───────────────────┘           │
│                             │                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Application Load Balancer                  │ │
│  │              (Traffic Distribution)                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                             │                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Auto Scaling Group                   │ │
│  │              (2-10 Serafina Instances)                  │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │ Instance 1  │  │ Instance 2  │  │ Instance N  │     │ │
│  │  │ (Serafina)  │  │ (Serafina)  │  │ (Serafina)  │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Monitoring                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │CloudWatch   │  │   GuardDuty │  │Security Hub │     │ │
│  │  │(Metrics)    │  │ (Threats)   │  │(Compliance) │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Deployment Process

### Step 1: Environment Setup

```bash
# Clone the repository
git clone https://github.com/NovaSanctum/GameDinDiscord.git
cd GameDinDiscord

# Install dependencies
npm install

# Build the application
npm run build:new
```

### Step 2: AWS Configuration

```bash
# Configure AWS credentials
aws configure

# Verify AWS access
aws sts get-caller-identity
```

### Step 3: Deploy Infrastructure

```bash
# Deploy to production
npm run aws:deploy:prod

# The script will prompt for:
# - Discord Bot Token
# - Discord Client ID
# - Alert Email Address
```

### Step 4: Verify Deployment

```bash
# Check CloudFormation stack status
aws cloudformation describe-stacks \
  --stack-name serafina-infrastructure-production

# Check Auto Scaling Group
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names serafina-asg-production

# Check Load Balancer health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>
```

## 📈 Monitoring and Maintenance

### CloudWatch Dashboard

Access the CloudWatch dashboard to monitor:
- **EC2 Metrics**: CPU, memory, network usage
- **Load Balancer Metrics**: Request count, response time, healthy hosts
- **Auto Scaling Metrics**: Instance count, scaling events

### Health Checks

The bot provides health check endpoints:
- **Basic Health**: `http://<load-balancer>/health`
- **Detailed Status**: `http://<load-balancer>/status`
- **Metrics**: `http://<load-balancer>/metrics`

### Alerts and Notifications

Configured alerts for:
- **High CPU Usage**: >80% for 5 minutes
- **Low Healthy Hosts**: <1 healthy instance
- **High Memory Usage**: >80% for 5 minutes
- **Security Threats**: GuardDuty findings

## 🔄 Auto-Scaling Behavior

### Scale Up Triggers
- **CPU Utilization**: >70% for 2 minutes
- **Memory Usage**: >80% for 2 minutes
- **Request Count**: High traffic volume

### Scale Down Triggers
- **CPU Utilization**: <30% for 10 minutes
- **Memory Usage**: <50% for 10 minutes
- **Low Traffic**: Sustained low request count

### Scaling Limits
- **Minimum Instances**: 2 (ensures high availability)
- **Maximum Instances**: 10 (cost control)
- **Cooldown Period**: 5 minutes between scaling events

## 🛡️ Security Features

### Network Security
- **VPC Isolation**: Private subnets for bot instances
- **Security Groups**: Restrictive firewall rules
- **NAT Gateway**: Controlled internet access
- **WAF Protection**: Web application firewall

### Data Security
- **Secrets Manager**: Encrypted storage of sensitive data
- **IAM Roles**: Least privilege access
- **Encryption**: AES-256 encryption at rest
- **TLS**: HTTPS for all communications

### Monitoring Security
- **GuardDuty**: Threat detection
- **Security Hub**: Compliance monitoring
- **CloudTrail**: API call logging
- **VPC Flow Logs**: Network traffic monitoring

## 💰 Cost Optimization

### Instance Types
- **Development**: t3.micro (2 vCPU, 1 GB RAM)
- **Staging**: t3.small (2 vCPU, 2 GB RAM)
- **Production**: t3.medium (2 vCPU, 4 GB RAM)

### Cost Control
- **Auto Scaling**: Scale down during low usage
- **Reserved Instances**: For predictable workloads
- **Spot Instances**: For non-critical workloads
- **Cost Alerts**: Monitor spending

### Estimated Monthly Costs (Production)
- **EC2 Instances**: $50-150 (depending on usage)
- **Load Balancer**: $20-30
- **NAT Gateway**: $45
- **CloudWatch**: $10-20
- **Total**: $125-245/month

## 🚨 Troubleshooting

### Common Issues

#### 1. Bot Not Responding
```bash
# Check instance health
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names serafina-asg-production

# Check load balancer health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>

# Check CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix serafina
```

#### 2. High CPU Usage
```bash
# Check scaling policies
aws autoscaling describe-policies \
  --auto-scaling-group-name serafina-asg-production

# Check CloudWatch alarms
aws cloudwatch describe-alarms \
  --alarm-names serafina-cpu-alarm-production
```

#### 3. Security Issues
```bash
# Check GuardDuty findings
aws guardduty list-findings --detector-id <detector-id>

# Check Security Hub findings
aws securityhub get-findings --filters '{"RecordState":[{"Value":"ACTIVE","Comparison":"EQUALS"}]}'
```

### Recovery Procedures

#### 1. Instance Failure
- Auto Scaling Group automatically replaces failed instances
- Health checks ensure only healthy instances receive traffic
- CloudWatch alarms notify of issues

#### 2. Load Balancer Issues
- Check target group health
- Verify security group rules
- Review CloudWatch metrics

#### 3. Scaling Issues
- Check Auto Scaling Group configuration
- Verify CloudWatch alarms
- Review scaling policies

## 📞 Support and Maintenance

### Regular Maintenance
- **Weekly**: Review CloudWatch metrics and logs
- **Monthly**: Update security patches and dependencies
- **Quarterly**: Review and optimize costs
- **Annually**: Security audit and compliance review

### Emergency Contacts
- **AWS Support**: For infrastructure issues
- **Discord Developer Support**: For bot-specific issues
- **Development Team**: For code and configuration issues

### Documentation
- **Infrastructure**: AWS CloudFormation templates
- **Application**: Source code and README
- **Monitoring**: CloudWatch dashboards and alarms
- **Security**: GuardDuty and Security Hub findings

## 🎯 Success Metrics

### Performance Targets
- **Uptime**: 99.9% availability
- **Response Time**: <2 seconds for Discord commands
- **Auto Scaling**: Respond within 5 minutes to traffic changes
- **Error Rate**: <1% of requests

### Monitoring KPIs
- **CPU Utilization**: Average <50%
- **Memory Usage**: Average <70%
- **Request Latency**: P95 <1 second
- **Error Rate**: <0.1%

### Cost Targets
- **Monthly Cost**: <$250 for production
- **Cost per Request**: <$0.001
- **Scaling Efficiency**: 80%+ resource utilization

---

## 🚀 Next Steps

1. **Deploy the infrastructure** using the provided scripts
2. **Monitor the deployment** through CloudWatch
3. **Test the bot** in your Discord server
4. **Configure alerts** for critical issues
5. **Optimize costs** based on usage patterns
6. **Scale as needed** for your community size

For additional support or questions, refer to the project documentation or contact the development team.

---

*Last Updated: 2024-12-19*
*Version: 1.0.0* 