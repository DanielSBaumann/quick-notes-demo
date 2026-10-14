# Deployment Guide — Quick Notes

This document describes how to deploy Quick Notes to AWS Lambda using GitHub Actions.

## Architecture

```
┌─────────────────┐
│  GitHub Repo    │
│   (main branch) │
└────────┬────────┘
         │ Push
         ▼
┌─────────────────────────────────┐
│  GitHub Actions                 │
├─────────────────────────────────┤
│ 1. Build backend + frontend     │
│ 2. Run tests                    │
│ 3. Deploy to AWS Lambda         │
│ 4. Run smoke tests              │
│ 5. Post summary                 │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  AWS (Sandbox Environment)      │
├─────────────────────────────────┤
│ • Lambda (quick-notes-api)      │
│ • DynamoDB (quick-notes-sandbox)│
│ • API Gateway                   │
│ • S3 + CloudFront (frontend)    │
└─────────────────────────────────┘
```

## Setup Steps

### 1. Create GitHub Repository

```bash
# Initialize local git (if not done)
cd /home/danielbaumann/workspace/platform/projects/quick-notes

# Add GitHub remote
git remote add origin https://github.com/dr4wone/quick-notes-demo.git
git branch -M main
git push -u origin main
```

### 2. Set Up AWS Credentials (GitHub OIDC)

Instead of storing AWS credentials as secrets, use GitHub OIDC for secure, credential-free auth.

**Create IAM role for GitHub Actions:**

```bash
# Set variables
GITHUB_ORG="dr4wone"
GITHUB_REPO="quick-notes-demo"

# Create OIDC provider (run once per AWS account)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
  --region us-east-1

# Create GitHub Actions IAM role
aws iam create-role \
  --role-name github-actions-quick-notes-sandbox \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "StringLike": {
            "token.actions.githubusercontent.com:sub": "repo:'"$GITHUB_ORG"'/'"$GITHUB_REPO"':*"
          }
        }
      }
    ]
  }'

# Attach policies
aws iam attach-role-policy \
  --role-name github-actions-quick-notes-sandbox \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

**Add GitHub repository secret:**

Go to GitHub repo → Settings → Secrets and variables → Actions → New repository secret

```
Name: AWS_SANDBOX_ROLE_ARN
Value: arn:aws:iam::ACCOUNT_ID:role/github-actions-quick-notes-sandbox
```

### 3. Create S3 Bucket for Frontend

```bash
# Create bucket
aws s3 mb s3://quick-notes-sandbox-frontend \
  --region us-east-1

# Enable static website hosting
aws s3 website s3://quick-notes-sandbox-frontend \
  --index-document index.html \
  --error-document index.html
```

### 4. Create CloudFront Distribution (Optional)

```bash
# CloudFront ensures edge-cached delivery of the frontend
# Configure via AWS Console or Terraform/SAM template
```

## Deployment Workflows

### Build and Test (Every push)

**Trigger:** Any push to `main` or `develop`

**Steps:**
1. Checkout code
2. Setup Node.js 24
3. Backend: install → build → lint → test
4. Frontend: install → build → lint → test
5. Post quality summary

**Result:** ✅ All checks pass → Ready for deployment

### Deploy to Sandbox (Push to main only)

**Trigger:** Push to `main` branch OR manual trigger (workflow_dispatch)

**Steps:**
1. Build backend (dist/)
2. Build frontend (dist/)
3. Auth with AWS (GitHub OIDC)
4. SAM build + deploy Lambda
5. Sync frontend to S3
6. Invalidate CloudFront cache
7. Run smoke tests
8. Post deployment summary

**Result:** Lambda + Frontend live, ready for testing

## Manual Deployment (Without GitHub)

If you want to deploy locally without GitHub Actions:

```bash
# 1. Install AWS CLI + SAM CLI
curl https://aws-cli.amazonaws.com/AWSCLIV2/latest/awscli-exe-linux-x86_64.zip
unzip awscliv2.zip && sudo ./aws/install

# 2. Configure AWS credentials
aws configure sso

# 3. Build
cd backend && npm run build
cd ../frontend && npm run build

# 4. Deploy with SAM
cd ../infrastructure
sam build --template-file template.yaml
sam deploy \
  --stack-name quick-notes-sandbox \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=sandbox

# 5. Get API endpoint
aws cloudformation describe-stacks \
  --stack-name quick-notes-sandbox \
  --query 'Stacks[0].Outputs' \
  --region us-east-1

# 6. Run smoke tests
API_ENDPOINT=<endpoint-from-step-5> node scripts/smoke-tests.js
```

## Environment Variables

### Lambda Function

Set via CloudFormation Parameters:

```yaml
NOTES_TABLE: quick-notes-sandbox
AWS_REGION: us-east-1
ENVIRONMENT: sandbox
```

### Frontend

Configure API endpoint in `frontend/src/api.ts`:

```typescript
const API_BASE = process.env.VITE_API_BASE || '/api';
```

Build-time:

```bash
VITE_API_BASE=https://api.example.com npm run build
```

## Monitoring & Logs

### Lambda Logs

```bash
aws logs tail /aws/lambda/quick-notes-api-sandbox --follow
```

### API Gateway Metrics

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=quick-notes-api-sandbox
```

## Cleanup

To delete the sandbox environment:

```bash
# Delete CloudFormation stack
aws cloudformation delete-stack \
  --stack-name quick-notes-sandbox \
  --region us-east-1

# Delete S3 bucket
aws s3 rb s3://quick-notes-sandbox-frontend --force

# Check status
aws cloudformation describe-stacks \
  --stack-name quick-notes-sandbox \
  --region us-east-1
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `InvalidAction` error in GitHub Actions | Check IAM role trust policy includes GitHub ORG and REPO |
| Lambda timeout | Increase timeout in CloudFormation template |
| 502 Bad Gateway from API | Check Lambda logs: `aws logs tail /aws/lambda/...` |
| Frontend 404 on page refresh | Configure S3 website to route all requests to index.html |

## Next Steps

1. ✅ Push code to GitHub
2. ✅ GitHub Actions builds and tests
3. ✅ GitHub Actions deploys to Lambda + S3
4. ✅ Smoke tests verify deployment
5. → Phase 5: E2E tests + verify in browser
6. → Phase 6: Production gate
7. → Phase 7: Delivery report
