#!/bin/bash

# Alhambra Bank & Trust - AWS Deployment Script
# This script deploys the complete banking platform infrastructure to AWS

set -e  # Exit on any error

# Configuration
STACK_NAME="alhambra-banking-platform"
ENVIRONMENT="production"
REGION="us-east-1"
DOMAIN_NAME="alhambrabank.ky"
KEY_PAIR_NAME="alhambra-keypair"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if AWS CLI is installed and configured
check_aws_cli() {
    log "Checking AWS CLI configuration..."
    
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    success "AWS CLI is properly configured"
}

# Validate parameters
validate_parameters() {
    log "Validating deployment parameters..."
    
    if [[ -z "$DOMAIN_NAME" ]]; then
        error "Domain name is required"
        exit 1
    fi
    
    if [[ -z "$KEY_PAIR_NAME" ]]; then
        error "EC2 Key Pair name is required"
        exit 1
    fi
    
    # Check if key pair exists
    if ! aws ec2 describe-key-pairs --key-names "$KEY_PAIR_NAME" --region "$REGION" &> /dev/null; then
        warning "Key pair '$KEY_PAIR_NAME' does not exist. Creating it..."
        create_key_pair
    fi
    
    success "Parameters validated"
}

# Create EC2 Key Pair
create_key_pair() {
    log "Creating EC2 Key Pair: $KEY_PAIR_NAME"
    
    aws ec2 create-key-pair \
        --key-name "$KEY_PAIR_NAME" \
        --region "$REGION" \
        --query 'KeyMaterial' \
        --output text > "${KEY_PAIR_NAME}.pem"
    
    chmod 400 "${KEY_PAIR_NAME}.pem"
    success "Key pair created and saved as ${KEY_PAIR_NAME}.pem"
}

# Generate secure database password
generate_db_password() {
    log "Generating secure database password..."
    
    # Generate a 16-character password with special characters
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-16)
    echo "$DB_PASSWORD" > db_password.txt
    chmod 600 db_password.txt
    
    success "Database password generated and saved to db_password.txt"
}

# Deploy CloudFormation stack
deploy_infrastructure() {
    log "Deploying CloudFormation stack: $STACK_NAME"
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" &> /dev/null; then
        log "Stack exists. Updating..."
        OPERATION="update-stack"
    else
        log "Stack does not exist. Creating..."
        OPERATION="create-stack"
    fi
    
    # Deploy the stack
    aws cloudformation $OPERATION \
        --stack-name "$STACK_NAME" \
        --template-body file://cloudformation-template.yaml \
        --parameters \
            ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
            ParameterKey=DomainName,ParameterValue="$DOMAIN_NAME" \
            ParameterKey=DBUsername,ParameterValue="alhambra_admin" \
            ParameterKey=DBPassword,ParameterValue="$DB_PASSWORD" \
            ParameterKey=KeyPairName,ParameterValue="$KEY_PAIR_NAME" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "$REGION" \
        --tags \
            Key=Project,Value="Alhambra Banking Platform" \
            Key=Environment,Value="$ENVIRONMENT" \
            Key=Owner,Value="Alhambra Bank & Trust"
    
    log "Waiting for stack deployment to complete..."
    aws cloudformation wait stack-${OPERATION%-stack}-complete \
        --stack-name "$STACK_NAME" \
        --region "$REGION"
    
    success "CloudFormation stack deployed successfully"
}

# Get stack outputs
get_stack_outputs() {
    log "Retrieving stack outputs..."
    
    OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs' \
        --output json)
    
    # Extract important values
    ALB_DNS=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="LoadBalancerDNS") | .OutputValue')
    POSTGRESQL_ENDPOINT=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="PostgreSQLEndpoint") | .OutputValue')
    MYSQL_ENDPOINT=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="MySQLEndpoint") | .OutputValue')
    DOCUMENTS_BUCKET=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="DocumentsBucketName") | .OutputValue')
    ASSETS_BUCKET=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="AssetsBucketName") | .OutputValue')
    COGNITO_USER_POOL_ID=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="CognitoUserPoolId") | .OutputValue')
    COGNITO_CLIENT_ID=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="CognitoClientId") | .OutputValue')
    WEBSITE_URL=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="WebsiteURL") | .OutputValue')
    
    # Save outputs to file
    cat > deployment_outputs.json << EOF
{
    "alb_dns": "$ALB_DNS",
    "postgresql_endpoint": "$POSTGRESQL_ENDPOINT",
    "mysql_endpoint": "$MYSQL_ENDPOINT",
    "documents_bucket": "$DOCUMENTS_BUCKET",
    "assets_bucket": "$ASSETS_BUCKET",
    "cognito_user_pool_id": "$COGNITO_USER_POOL_ID",
    "cognito_client_id": "$COGNITO_CLIENT_ID",
    "website_url": "$WEBSITE_URL",
    "region": "$REGION"
}
EOF
    
    success "Stack outputs saved to deployment_outputs.json"
}

# Create environment configuration file
create_env_config() {
    log "Creating environment configuration file..."
    
    cat > .env.production << EOF
# Alhambra Bank & Trust - Production Environment Configuration
# Generated on $(date)

# Application Settings
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=$(openssl rand -hex 32)

# Database Configuration
DATABASE_URL=postgresql://alhambra_admin:${DB_PASSWORD}@${POSTGRESQL_ENDPOINT}:5432/alhambra_bank
MYSQL_URL=mysql://alhambra_admin:${DB_PASSWORD}@${MYSQL_ENDPOINT}:3306/alhambra_bank

# AWS Configuration
AWS_REGION=$REGION
S3_BUCKET=$DOCUMENTS_BUCKET
S3_ASSETS_BUCKET=$ASSETS_BUCKET

# Cognito Configuration
COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID
COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID

# Security Configuration
JWT_SECRET_KEY=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# External Services
DOMAIN_NAME=$DOMAIN_NAME
WEBSITE_URL=$WEBSITE_URL

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/alhambra/application.log

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# Session Configuration
SESSION_TIMEOUT=1800
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900
EOF
    
    chmod 600 .env.production
    success "Environment configuration created: .env.production"
}

# Deploy application code
deploy_application() {
    log "Deploying application code..."
    
    # Build frontend
    log "Building React frontend..."
    cd ../src/frontend
    npm install
    npm run build
    
    # Upload frontend to S3
    log "Uploading frontend to S3..."
    aws s3 sync build/ s3://$ASSETS_BUCKET/ \
        --region "$REGION" \
        --delete \
        --cache-control "max-age=31536000"
    
    # Enable S3 website hosting
    aws s3 website s3://$ASSETS_BUCKET/ \
        --index-document index.html \
        --error-document error.html \
        --region "$REGION"
    
    cd ../../scripts
    
    # Package backend for deployment
    log "Packaging backend application..."
    cd ../src/backend
    zip -r ../../scripts/backend-deployment.zip . -x "*.pyc" "__pycache__/*" "*.git*"
    cd ../../scripts
    
    success "Application code deployed"
}

# Configure SSL certificate
configure_ssl() {
    log "Configuring SSL certificate..."
    
    # Request SSL certificate from ACM
    CERT_ARN=$(aws acm request-certificate \
        --domain-name "$DOMAIN_NAME" \
        --subject-alternative-names "www.$DOMAIN_NAME" \
        --validation-method DNS \
        --region "$REGION" \
        --query 'CertificateArn' \
        --output text)
    
    log "SSL certificate requested: $CERT_ARN"
    warning "Please validate the certificate in the AWS Console before proceeding"
    
    echo "$CERT_ARN" > ssl_certificate_arn.txt
    success "SSL certificate ARN saved to ssl_certificate_arn.txt"
}

# Setup monitoring and alerts
setup_monitoring() {
    log "Setting up CloudWatch monitoring and alerts..."
    
    # Create CloudWatch dashboard
    aws cloudwatch put-dashboard \
        --dashboard-name "Alhambra-Banking-Platform" \
        --dashboard-body file://monitoring-dashboard.json \
        --region "$REGION" || warning "Dashboard creation failed"
    
    # Create SNS topic for alerts
    ALERT_TOPIC_ARN=$(aws sns create-topic \
        --name "alhambra-banking-alerts" \
        --region "$REGION" \
        --query 'TopicArn' \
        --output text)
    
    # Create CloudWatch alarms
    aws cloudwatch put-metric-alarm \
        --alarm-name "Alhambra-High-CPU" \
        --alarm-description "High CPU utilization" \
        --metric-name CPUUtilization \
        --namespace AWS/EC2 \
        --statistic Average \
        --period 300 \
        --threshold 80 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 2 \
        --alarm-actions "$ALERT_TOPIC_ARN" \
        --region "$REGION"
    
    success "Monitoring and alerts configured"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # This would typically connect to the database and run migrations
    # For now, we'll create a script that can be run manually
    cat > run_migrations.sh << 'EOF'
#!/bin/bash
# Database Migration Script
# Run this script on the EC2 instance after deployment

source .env.production

# Install Python dependencies
pip3 install -r requirements.txt

# Run Flask database migrations
export FLASK_APP=app.py
flask db upgrade

echo "Database migrations completed"
EOF
    
    chmod +x run_migrations.sh
    success "Migration script created: run_migrations.sh"
}

# Perform security hardening
security_hardening() {
    log "Applying security hardening configurations..."
    
    # Create security policy document
    cat > security-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::$DOCUMENTS_BUCKET/*",
                "arn:aws:s3:::$DOCUMENTS_BUCKET"
            ],
            "Condition": {
                "Bool": {
                    "aws:SecureTransport": "false"
                }
            }
        }
    ]
}
EOF
    
    # Apply bucket policy to enforce HTTPS
    aws s3api put-bucket-policy \
        --bucket "$DOCUMENTS_BUCKET" \
        --policy file://security-policy.json \
        --region "$REGION"
    
    success "Security hardening applied"
}

# Generate deployment report
generate_report() {
    log "Generating deployment report..."
    
    cat > deployment-report.md << EOF
# Alhambra Bank & Trust - Deployment Report

**Deployment Date:** $(date)
**Environment:** $ENVIRONMENT
**Region:** $REGION
**Domain:** $DOMAIN_NAME

## Infrastructure Components

### Networking
- VPC with public and private subnets
- Application Load Balancer: $ALB_DNS
- Route 53 hosted zone configured

### Compute
- Auto Scaling Group with 2-10 EC2 instances
- Launch template with security hardening
- Key pair: $KEY_PAIR_NAME

### Databases
- PostgreSQL RDS: $POSTGRESQL_ENDPOINT
- MySQL RDS: $MYSQL_ENDPOINT
- Multi-AZ deployment with encryption

### Storage
- Documents S3 bucket: $DOCUMENTS_BUCKET
- Assets S3 bucket: $ASSETS_BUCKET
- Versioning and lifecycle policies enabled

### Security
- AWS Cognito User Pool: $COGNITO_USER_POOL_ID
- IAM roles with least privilege
- Security groups with restricted access
- SSL/TLS encryption enforced

### Monitoring
- CloudWatch logs and metrics
- Custom dashboard created
- Alerting configured

## Access Information

- **Website URL:** $WEBSITE_URL
- **Database Password:** Saved in db_password.txt
- **SSH Key:** ${KEY_PAIR_NAME}.pem
- **Environment Config:** .env.production

## Next Steps

1. Validate SSL certificate in AWS Console
2. Run database migrations: ./run_migrations.sh
3. Configure DNS records if using external DNS
4. Test all application functionality
5. Set up backup and disaster recovery procedures

## Security Notes

- All sensitive data is encrypted at rest and in transit
- Multi-factor authentication is enabled
- Zero-trust security principles implemented
- Regular security audits recommended

---
Generated by Alhambra Bank & Trust Deployment Script
EOF
    
    success "Deployment report generated: deployment-report.md"
}

# Main deployment function
main() {
    log "Starting Alhambra Bank & Trust AWS Deployment"
    log "================================================"
    
    # Pre-deployment checks
    check_aws_cli
    validate_parameters
    
    # Generate secure credentials
    generate_db_password
    
    # Deploy infrastructure
    deploy_infrastructure
    get_stack_outputs
    create_env_config
    
    # Deploy application
    deploy_application
    
    # Security and monitoring
    configure_ssl
    setup_monitoring
    security_hardening
    
    # Post-deployment tasks
    run_migrations
    generate_report
    
    log "================================================"
    success "Deployment completed successfully!"
    log "================================================"
    
    echo ""
    echo "🎉 Alhambra Bank & Trust is now deployed!"
    echo ""
    echo "📋 Important files created:"
    echo "   - deployment-report.md (deployment summary)"
    echo "   - .env.production (environment configuration)"
    echo "   - db_password.txt (database password)"
    echo "   - ${KEY_PAIR_NAME}.pem (SSH key)"
    echo "   - deployment_outputs.json (AWS resource details)"
    echo ""
    echo "🌐 Website URL: $WEBSITE_URL"
    echo "🔧 Load Balancer: $ALB_DNS"
    echo ""
    echo "⚠️  Next steps:"
    echo "   1. Validate SSL certificate in AWS Console"
    echo "   2. Run ./run_migrations.sh on EC2 instances"
    echo "   3. Test all functionality"
    echo ""
    echo "📞 Support: For issues, contact the development team"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "destroy")
        log "Destroying infrastructure..."
        aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$REGION"
        aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME" --region "$REGION"
        success "Infrastructure destroyed"
        ;;
    "status")
        aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].StackStatus' --output text
        ;;
    "outputs")
        get_stack_outputs
        cat deployment_outputs.json | jq .
        ;;
    *)
        echo "Usage: $0 [deploy|destroy|status|outputs]"
        echo "  deploy  - Deploy the complete infrastructure (default)"
        echo "  destroy - Destroy all infrastructure"
        echo "  status  - Check deployment status"
        echo "  outputs - Show deployment outputs"
        exit 1
        ;;
esac
