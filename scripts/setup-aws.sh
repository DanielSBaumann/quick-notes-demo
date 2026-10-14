#!/bin/bash

set -e

# Quick Notes AWS Setup Script
# This script sets up the AWS environment for GitHub Actions deployment

echo "🚀 Quick Notes - AWS Setup"
echo "========================="
echo ""

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Configuration
GITHUB_ORG="${GITHUB_ORG:-dr4wone}"
GITHUB_REPO="${GITHUB_REPO:-quick-notes-demo}"
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="sandbox"

echo "📋 Configuration:"
echo "  GitHub Org: $GITHUB_ORG"
echo "  GitHub Repo: $GITHUB_REPO"
echo "  AWS Region: $AWS_REGION"
echo ""

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✓ AWS Account: $AWS_ACCOUNT_ID"
echo ""

# Step 1: Create OIDC Provider
echo "1️⃣  Setting up GitHub OIDC Provider..."
PROVIDER_ARN=$(aws iam list-open-id-connect-providers \
  --query "OpenIDConnectProviderList[?contains(Arn, 'token.actions.githubusercontent.com')].Arn" \
  --output text 2>/dev/null || echo "")

if [ -z "$PROVIDER_ARN" ]; then
  echo "   Creating OIDC provider..."
  aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
    --region $AWS_REGION > /dev/null
  PROVIDER_ARN="arn:aws:iam::$AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
  echo "   ✓ OIDC provider created"
else
  echo "   ✓ OIDC provider already exists: $PROVIDER_ARN"
fi
echo ""

# Step 2: Create IAM Role
echo "2️⃣  Setting up IAM Role for GitHub Actions..."
ROLE_NAME="github-actions-quick-notes-sandbox"

if aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
  echo "   ✓ Role already exists: $ROLE_NAME"
else
  echo "   Creating role..."

  TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_ORG}/${GITHUB_REPO}:*"
        }
      }
    }
  ]
}
EOF
)

  aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document "$TRUST_POLICY" > /dev/null

  echo "   ✓ Role created: $ROLE_NAME"
fi

ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query Role.Arn --output text)
echo "   Role ARN: $ROLE_ARN"
echo ""

# Step 3: Attach Policies
echo "3️⃣  Attaching permissions to role..."
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess > /dev/null
echo "   ✓ Permissions attached"
echo ""

# Step 4: Create S3 Bucket
echo "4️⃣  Setting up S3 bucket for frontend..."
BUCKET_NAME="quick-notes-${ENVIRONMENT}-frontend"

if aws s3api head-bucket --bucket $BUCKET_NAME --region $AWS_REGION 2>/dev/null; then
  echo "   ✓ Bucket already exists: $BUCKET_NAME"
else
  echo "   Creating bucket..."
  aws s3api create-bucket \
    --bucket $BUCKET_NAME \
    --region $AWS_REGION \
    $([ "$AWS_REGION" != "us-east-1" ] && echo "--create-bucket-configuration LocationConstraint=$AWS_REGION") \
    > /dev/null
  echo "   ✓ Bucket created: $BUCKET_NAME"
fi

# Enable static website hosting
aws s3api put-bucket-website \
  --bucket $BUCKET_NAME \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }' > /dev/null
echo "   ✓ Static website hosting enabled"
echo ""

# Step 5: Display Summary
echo "✅ AWS Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Add GitHub secret:"
echo "   Go to: https://github.com/$GITHUB_ORG/$GITHUB_REPO/settings/secrets/actions"
echo "   Secret: AWS_SANDBOX_ROLE_ARN"
echo "   Value:  $ROLE_ARN"
echo ""
echo "2. Push code to GitHub:"
echo "   git remote add origin https://github.com/$GITHUB_ORG/$GITHUB_REPO.git"
echo "   git push -u origin main"
echo ""
echo "3. Watch GitHub Actions:"
echo "   https://github.com/$GITHUB_ORG/$GITHUB_REPO/actions"
echo ""
echo "4. Get API endpoint after deployment:"
echo "   aws apigateway get-rest-apis \\"
echo "     --region $AWS_REGION \\"
echo "     --query \"items[?name=='quick-notes-api-sandbox'].id\" \\"
echo "     --output text"
echo ""
