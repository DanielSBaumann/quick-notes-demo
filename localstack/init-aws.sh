#!/bin/bash

set -e

echo "Initializing LocalStack DynamoDB..."

# Wait for LocalStack to be ready
sleep 2

# Create DynamoDB table
awslocal dynamodb create-table \
  --table-name quick-notes \
  --attribute-definitions \
    AttributeName=sessionId,AttributeType=S \
    AttributeName=noteId,AttributeType=S \
  --key-schema \
    AttributeName=sessionId,KeyType=HASH \
    AttributeName=noteId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

echo "DynamoDB table created: quick-notes"
