#!/bin/bash

# ============================================================================
# Alhambra Bank & Trust - Enterprise AWS Deployment Script
# ============================================================================
# This script deploys the complete banking platform infrastructure on AWS
# with enterprise-grade security, monitoring, and compliance features.
# ============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="alhambra-banking-platform"
TEMPLATE_FILE="cloudformation-enterprise.yaml"
PARAMETERS_FILE="parameters.json"
REGION="us-east-1"
ENVIRONMENT="production"
DOMAIN_NAME="alhambrabank.ky"

# Function to print colored output
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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure'."
        exit 1
    fi
    
    # Check if template file exists
    if [ ! -f "$TEMPLATE_FILE" ]; then
        print_error "CloudFormation template file '$TEMPLATE_FILE' not found."
        exit 1
    fi
    
    print_success "Prerequisites check completed."
}

# Function to validate CloudFormation template
validate_template() {
    print_status "Validating CloudFormation template..."
    
    if aws cloudformation validate-template --template-body file://$TEMPLATE_FILE --region $REGION > /dev/null; then
        print_success "Template validation successful."
    else
        print_error "Template validation failed."
        exit 1
    fi
}

# Function to create parameters file if it doesn't exist
create_parameters_file() {
    if [ ! -f "$PARAMETERS_FILE" ]; then
        print_status "Creating parameters file..."
        
        # Get SSL certificate ARN (you need to create this manually in ACM)
        read -p "Enter SSL Certificate ARN (from AWS Certificate Manager): " CERT_ARN
        read -s -p "Enter Database Master Password (min 12 characters): " DB_PASSWORD
        echo
        
        cat > $PARAMETERS_FILE << EOF
[
  {
    "ParameterKey": "Environment",
    "ParameterValue": "$ENVIRONMENT"
  },
  {
    "ParameterKey": "DomainName",
    "ParameterValue": "$DOMAIN_NAME"
  },
  {
    "ParameterKey": "CertificateArn",
    "ParameterValue": "$CERT_ARN"
  },
  {
    "ParameterKey": "DatabasePassword",
    "ParameterValue": "$DB_PASSWORD"
  }
]
EOF
        print_success "Parameters file created."
    else
        print_status "Using existing parameters file."
    fi
}

# Function to deploy the stack
deploy_stack() {
    print_status "Deploying CloudFormation stack '$STACK_NAME'..."
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
        print_status "Stack exists. Updating..."
        OPERATION="update-stack"
    else
        print_status "Stack doesn't exist. Creating..."
        OPERATION="create-stack"
    fi
    
    # Deploy the stack
    aws cloudformation $OPERATION \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters file://$PARAMETERS_FILE \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION \
        --tags Key=Project,Value=AlhambraBanking Key=Environment,Value=$ENVIRONMENT
    
    print_status "Waiting for stack deployment to complete..."
    
    if [ "$OPERATION" = "create-stack" ]; then
        aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $REGION
    else
        aws cloudformation wait stack-update-complete --stack-name $STACK_NAME --region $REGION
    fi
    
    print_success "Stack deployment completed successfully!"
}

# Function to get stack outputs
get_stack_outputs() {
    print_status "Retrieving stack outputs..."
    
    OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs' \
        --output json)
    
    echo "$OUTPUTS" | jq -r '.[] | "\(.OutputKey): \(.OutputValue)"'
    
    # Save outputs to file
    echo "$OUTPUTS" > stack-outputs.json
    print_success "Stack outputs saved to stack-outputs.json"
}

# Function to deploy application code
deploy_application() {
    print_status "Deploying application code..."
    
    # Get S3 bucket name from stack outputs
    WEBSITE_BUCKET=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="WebsiteAssetsBucket") | .OutputValue')
    
    if [ "$WEBSITE_BUCKET" != "null" ] && [ -n "$WEBSITE_BUCKET" ]; then
        print_status "Uploading website assets to S3 bucket: $WEBSITE_BUCKET"
        
        # Build the React application
        if [ -f "package.json" ]; then
            print_status "Building React application..."
            npm install
            npm run build
            
            # Upload build files to S3
            aws s3 sync dist/ s3://$WEBSITE_BUCKET/ --delete --region $REGION
            print_success "Website assets uploaded successfully."
        else
            print_warning "No package.json found. Skipping application build."
        fi
    else
        print_warning "Website bucket not found in stack outputs."
    fi
}

# Function to configure CloudFront invalidation
invalidate_cloudfront() {
    print_status "Invalidating CloudFront cache..."
    
    # Get CloudFront distribution ID from stack outputs
    CLOUDFRONT_DOMAIN=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="CloudFrontDomain") | .OutputValue')
    
    if [ "$CLOUDFRONT_DOMAIN" != "null" ] && [ -n "$CLOUDFRONT_DOMAIN" ]; then
        # Get distribution ID
        DISTRIBUTION_ID=$(aws cloudfront list-distributions \
            --query "DistributionList.Items[?DomainName=='$CLOUDFRONT_DOMAIN'].Id" \
            --output text \
            --region $REGION)
        
        if [ -n "$DISTRIBUTION_ID" ]; then
            aws cloudfront create-invalidation \
                --distribution-id $DISTRIBUTION_ID \
                --paths "/*" \
                --region $REGION > /dev/null
            print_success "CloudFront cache invalidation initiated."
        fi
    fi
}

# Function to setup monitoring and alerts
setup_monitoring() {
    print_status "Setting up monitoring and alerts..."
    
    # Create SNS topic for alerts
    SNS_TOPIC_ARN=$(aws sns create-topic \
        --name "alhambra-banking-alerts" \
        --region $REGION \
        --query 'TopicArn' \
        --output text)
    
    print_status "Created SNS topic: $SNS_TOPIC_ARN"
    
    # Subscribe email to SNS topic (you can modify this)
    read -p "Enter email address for alerts: " ALERT_EMAIL
    aws sns subscribe \
        --topic-arn $SNS_TOPIC_ARN \
        --protocol email \
        --notification-endpoint $ALERT_EMAIL \
        --region $REGION > /dev/null
    
    print_success "Email subscription added to alerts topic."
    
    # Create CloudWatch alarms
    create_cloudwatch_alarms $SNS_TOPIC_ARN
}

# Function to create CloudWatch alarms
create_cloudwatch_alarms() {
    local SNS_TOPIC_ARN=$1
    
    print_status "Creating CloudWatch alarms..."
    
    # Get ALB name from stack outputs
    ALB_NAME=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="LoadBalancerDNS") | .OutputValue' | cut -d'-' -f1-3)
    
    # High response time alarm
    aws cloudwatch put-metric-alarm \
        --alarm-name "Alhambra-HighResponseTime" \
        --alarm-description "High response time detected" \
        --metric-name TargetResponseTime \
        --namespace AWS/ApplicationELB \
        --statistic Average \
        --period 300 \
        --threshold 2.0 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 2 \
        --alarm-actions $SNS_TOPIC_ARN \
        --dimensions Name=LoadBalancer,Value=$ALB_NAME \
        --region $REGION
    
    # High error rate alarm
    aws cloudwatch put-metric-alarm \
        --alarm-name "Alhambra-HighErrorRate" \
        --alarm-description "High error rate detected" \
        --metric-name HTTPCode_Target_5XX_Count \
        --namespace AWS/ApplicationELB \
        --statistic Sum \
        --period 300 \
        --threshold 10 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 2 \
        --alarm-actions $SNS_TOPIC_ARN \
        --dimensions Name=LoadBalancer,Value=$ALB_NAME \
        --region $REGION
    
    print_success "CloudWatch alarms created."
}

# Function to run security checks
run_security_checks() {
    print_status "Running security checks..."
    
    # Check S3 bucket policies
    DOCUMENT_BUCKET=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="DocumentStorageBucket") | .OutputValue')
    
    if [ "$DOCUMENT_BUCKET" != "null" ] && [ -n "$DOCUMENT_BUCKET" ]; then
        # Verify bucket encryption
        ENCRYPTION=$(aws s3api get-bucket-encryption --bucket $DOCUMENT_BUCKET --region $REGION 2>/dev/null || echo "No encryption")
        if [[ "$ENCRYPTION" == *"AES256"* ]] || [[ "$ENCRYPTION" == *"aws:kms"* ]]; then
            print_success "Document bucket encryption verified."
        else
            print_warning "Document bucket encryption not properly configured."
        fi
        
        # Verify public access is blocked
        PUBLIC_ACCESS=$(aws s3api get-public-access-block --bucket $DOCUMENT_BUCKET --region $REGION 2>/dev/null)
        if [[ "$PUBLIC_ACCESS" == *"true"* ]]; then
            print_success "Document bucket public access properly blocked."
        else
            print_warning "Document bucket public access not properly blocked."
        fi
    fi
    
    print_success "Security checks completed."
}

# Function to generate deployment report
generate_deployment_report() {
    print_status "Generating deployment report..."
    
    REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > $REPORT_FILE << EOF
# Alhambra Bank & Trust - Deployment Report

**Deployment Date:** $(date)
**Environment:** $ENVIRONMENT
**Region:** $REGION
**Stack Name:** $STACK_NAME

## Infrastructure Components

### Networking
- VPC with public and private subnets across multiple AZs
- Internet Gateway and NAT Gateways for secure internet access
- Security Groups with Zero Trust principles

### Compute
- Auto Scaling Group with Application Load Balancer
- EC2 instances with CloudWatch monitoring
- Lambda functions for serverless processing

### Storage
- S3 buckets for website assets and document storage
- KMS encryption for sensitive data
- RDS PostgreSQL and MySQL databases

### Security
- SSL/TLS certificates for HTTPS
- KMS encryption keys
- IAM roles with least privilege access
- Security groups with restrictive rules

### Monitoring
- CloudWatch dashboards and alarms
- SNS notifications for alerts
- Application and infrastructure logging

## Stack Outputs

EOF
    
    echo "$OUTPUTS" | jq -r '.[] | "- **\(.OutputKey):** \(.OutputValue)"' >> $REPORT_FILE
    
    cat >> $REPORT_FILE << EOF

## Next Steps

1. **DNS Configuration:** Update your domain's DNS settings to point to the CloudFront distribution
2. **SSL Certificate:** Ensure SSL certificate is properly configured in ACM
3. **Database Setup:** Run database migrations and seed data
4. **Application Configuration:** Update application configuration with stack outputs
5. **Testing:** Perform comprehensive testing of all features
6. **Monitoring:** Configure additional monitoring and alerting as needed

## Security Recommendations

1. **Access Control:** Implement proper IAM policies and roles
2. **Network Security:** Configure VPC Flow Logs and AWS Config
3. **Data Protection:** Enable AWS CloudTrail for audit logging
4. **Compliance:** Implement additional compliance controls as required
5. **Backup Strategy:** Configure automated backups for databases and critical data

## Support

For technical support and maintenance, refer to the operations runbook and contact the DevOps team.

---
*Generated by Alhambra Bank & Trust Deployment Script*
EOF
    
    print_success "Deployment report generated: $REPORT_FILE"
}

# Function to cleanup on failure
cleanup_on_failure() {
    print_error "Deployment failed. Cleaning up..."
    
    # Optionally delete the stack if creation failed
    read -p "Do you want to delete the failed stack? (y/N): " DELETE_STACK
    if [[ $DELETE_STACK =~ ^[Yy]$ ]]; then
        aws cloudformation delete-stack --stack-name $STACK_NAME --region $REGION
        print_status "Stack deletion initiated."
    fi
}

# Main deployment function
main() {
    print_status "Starting Alhambra Bank & Trust Enterprise Deployment"
    print_status "=================================================="
    
    # Trap errors and cleanup
    trap cleanup_on_failure ERR
    
    # Run deployment steps
    check_prerequisites
    validate_template
    create_parameters_file
    deploy_stack
    get_stack_outputs
    deploy_application
    invalidate_cloudfront
    setup_monitoring
    run_security_checks
    generate_deployment_report
    
    print_success "=================================================="
    print_success "Deployment completed successfully!"
    print_success "=================================================="
    
    # Display important information
    echo
    print_status "Important Information:"
    echo "- Website URL: https://$DOMAIN_NAME"
    echo "- CloudFront Domain: $(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="CloudFrontDomain") | .OutputValue')"
    echo "- API Gateway URL: $(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="APIGatewayURL") | .OutputValue')"
    echo "- Deployment Report: $REPORT_FILE"
    echo
    print_status "Please review the deployment report for detailed information."
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -e, --environment    Deployment environment (default: production)"
    echo "  -r, --region         AWS region (default: us-east-1)"
    echo "  -d, --domain         Domain name (default: alhambrabank.ky)"
    echo "  -h, --help           Show this help message"
    echo
    echo "Example:"
    echo "  $0 --environment staging --region us-west-2"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run main function
main "$@"
