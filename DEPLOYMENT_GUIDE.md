# 🚀 GameDin Discord Bot - Deployment Guide

## Overview

This guide covers deploying the GameDin Discord bot to AWS infrastructure with GitHub Actions CI/CD pipeline.

## 📋 Prerequisites

### AWS Setup
- AWS CLI installed and configured
- AWS account with appropriate permissions
- Domain name (optional, for custom endpoints)

### GitHub Setup
- GitHub repository with the bot code
- GitHub Actions enabled
- GitHub Secrets configured

### Discord Setup
- Discord bot token
- Discord client ID
- Bot permissions configured

## 🔧 AWS Deployment

### 1. Manual AWS Deployment

```bash
# Deploy to development
./aws/deploy-serafina.sh development your-email@domain.com dev.yourdomain.com

# Deploy to staging
./aws/deploy-serafina.sh staging your-email@domain.com staging.yourdomain.com

# Deploy to production
./aws/deploy-serafina.sh production your-email@domain.com yourdomain.com
```

### 2. AWS Infrastructure Components

The deployment creates:
- **EC2 Instances**: Auto-scaling group for bot instances
- **Load Balancer**: Application Load Balancer for traffic distribution
- **RDS Database**: PostgreSQL database for bot data
- **ElastiCache**: Redis for caching and session management
- **CloudWatch**: Monitoring and logging
- **S3 Bucket**: Static assets and backups
- **Route 53**: DNS management (if domain provided)

### 3. Environment Variables

Required environment variables:
```bash
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
OPENAI_API_KEY=your_openai_api_key
MISTRAL_API_KEY=your_mistral_api_key
NODE_ENV=production
AWS_REGION=us-east-1
```

## 🔄 GitHub Actions CI/CD

### 1. Repository Setup

1. **Fork/Clone the repository**
2. **Enable GitHub Actions**
3. **Configure GitHub Secrets**

### 2. Required GitHub Secrets

Add these secrets in your GitHub repository settings:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Discord Credentials
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id

# Notification Settings
ALERT_EMAIL=your-email@domain.com

# Domain Configuration
DEV_DOMAIN=dev.yourdomain.com
STAGING_DOMAIN=staging.yourdomain.com
PROD_DOMAIN=yourdomain.com

# Security (Optional)
SNYK_TOKEN=your_snyk_token
```

### 3. CI/CD Pipeline

The pipeline includes:
- **Testing**: Linting, type checking, unit tests
- **Security**: Vulnerability scanning with Snyk
- **Building**: TypeScript compilation
- **Deployment**: AWS CloudFormation deployment
- **Health Checks**: Post-deployment verification

### 4. Deployment Triggers

- **Automatic**: Push to `main` → Deploy to staging
- **Automatic**: Push to `develop` → Deploy to development
- **Manual**: Workflow dispatch for production

## 🐳 Docker Deployment

### 1. Local Docker Development

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f gamedin-bot

# Stop services
docker-compose down
```

### 2. Production Docker Deployment

```bash
# Build production image
docker build -t gamedin-bot:latest .

# Run container
docker run -d \
  --name gamedin-bot \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  gamedin-bot:latest
```

## 📊 Monitoring and Health Checks

### 1. Health Endpoints

- **Health Check**: `GET /health`
- **Status**: `GET /status`
- **Metrics**: `GET /metrics`

### 2. CloudWatch Monitoring

- CPU utilization
- Memory usage
- Network traffic
- Application logs
- Custom metrics

### 3. Alerts

Configured alerts for:
- High CPU usage (>80%)
- High memory usage (>85%)
- Bot disconnection
- Health check failures

## 🔒 Security Considerations

### 1. AWS Security

- IAM roles with minimal permissions
- Security groups with restricted access
- VPC with private subnets
- WAF protection (production)
- SSL/TLS encryption

### 2. Application Security

- Environment variable encryption
- Secrets management
- Input validation
- Rate limiting
- CORS configuration

### 3. Discord Security

- Bot token rotation
- Permission scoping
- Webhook validation
- Message sanitization

## 🚨 Troubleshooting

### Common Issues

1. **Bot Not Starting**
   - Check environment variables
   - Verify Discord token
   - Check AWS credentials

2. **Deployment Failures**
   - Review CloudFormation logs
   - Check IAM permissions
   - Verify resource limits

3. **Health Check Failures**
   - Check application logs
   - Verify port configuration
   - Check security groups

### Debug Commands

```bash
# Check bot status
curl http://localhost:3000/status

# View application logs
docker-compose logs gamedin-bot

# Check AWS stack status
aws cloudformation describe-stacks --stack-name serafina-infrastructure-staging

# Test Discord connection
node -e "console.log('Testing Discord connection...')"
```

## 📈 Scaling

### Auto-scaling Configuration

- **Minimum instances**: 1
- **Maximum instances**: 10
- **Scale up**: CPU > 70% for 5 minutes
- **Scale down**: CPU < 30% for 10 minutes

### Performance Optimization

- Redis caching
- Database connection pooling
- CDN for static assets
- Load balancer optimization

## 🔄 Rollback Procedures

### 1. Quick Rollback

```bash
# Rollback CloudFormation stack
aws cloudformation rollback-stack --stack-name serafina-infrastructure-staging

# Or deploy previous version
git checkout HEAD~1
./scripts/deploy-github.sh staging
```

### 2. Database Rollback

```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier gamedin-bot-restored \
  --db-snapshot-identifier your-snapshot-id
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review CloudWatch logs
3. Contact the development team
4. Create a GitHub issue

## 📝 Changelog

- **v1.0.0**: Initial deployment setup
- **v1.1.0**: Added GitHub Actions CI/CD
- **v1.2.0**: Enhanced monitoring and alerts
- **v1.3.0**: Multi-environment support 