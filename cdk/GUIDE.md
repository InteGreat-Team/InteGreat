# InteGreat CDK Production Guide 🏗️

This guide explains how to use the AWS Cloud Development Kit (CDK) for deploying InteGreat platform to production environments.

## Overview 📋

This repository contains the production infrastructure code for the InteGreat platform using AWS CDK. It provisions and manages all AWS resources required for production deployments through infrastructure as code (IaC).

## Getting Started 🚀

### Prerequisites

- Node.js (v18 or later)
- AWS Account with administrative permissions
- AWS CDK CLI (v2.x)
- AWS CLI configured with appropriate credentials

### Installation 📥

```bash
# Install AWS CDK CLI globally if not already installed
npm install -g aws-cdk

# Install project dependencies
npm install
```

### Configuration ⚙️

```bash
# Configure AWS profile for CDK (if not using default)
export AWS_PROFILE=integreat-admin

# Create and configure .env file in root with necessary environment variables
AWS_REGION=ap-southeast-1
COGNITO_USER_POOL_NAME=InteGreatUserPool
NEON_DB_CONNECTION_STRING_CHURCH=your_church_db_connection_string
NEON_DB_CONNECTION_STRING_EVENTS=your_events_db_connection_string
NEON_DB_CONNECTION_STRING_STUDENT=your_student_db_connection_string
# NOTE: Sensitive information should be stored in AWS Parameter Store
```

### CDK Initialization 🔧

For first-time setup in a new AWS environment:

```bash
# Bootstrap CDK in your AWS account/region
cdk bootstrap aws://ACCOUNT-NUMBER/REGION

# Synthesize CloudFormation templates to see what will be deployed
cdk synth
```

### Deployment 🚢

```bash
# Deploy all stacks to production
cdk deploy --all

# Deploy specific stacks only
cdk deploy AuthStack ApiStack StorageStack

# Deploy with approval disabled for CI/CD pipelines
cdk deploy --all --require-approval never
```

### Monitoring & Testing 👀

```bash
# Check status of deployed stacks
cdk list

# Test API endpoints locally with SAM CLI
sam local start-api
```

## CDK Project Structure 📁

```
/cdk
├── bin/
│   ├── cdk.ts              # Entry point for the CDK application
├── lib/
│   ├── auth-stack.ts       # Defines AWS Cognito configuration for authentication
│   ├── api-stack.ts        # Sets up API Gateway and Lambda integrations
│   ├── storage-stack.ts    # Provisions S3 buckets for storage
│   ├── iam-stack.ts        # Manages IAM Roles and policies
│   ├── db-stack.ts         # Provisions and configures database integration
│   ├── monitoring-stack.ts # Configures monitoring and alarms (e.g., CloudWatch)
├── functions/
│   ├── index.ts            # Main export file for all Lambda handlers
│   ├── handlers/           # Lambda handlers organized by domain
├── shared/
│   ├── services/           # Business logic used by multiple handlers
│   ├── config/             # Configuration files
│   ├── types/              # Type definitions
│   ├── utils/              # Shared utilities like logging
```

## Infrastructure Architecture 🏢

### Authentication 🔐

- **AWS Cognito** is provisioned with a unified User Pool and multiple app-specific User Groups
- IAM roles restrict access to resources based on the user's group
- JWT tokens are configured for authentication and authorization

### Storage 📦

- Separate **S3 buckets** are provisioned for each application with appropriate access policies
- Each application has a dedicated bucket (e.g., `church-storage`, `events-storage`, `student-storage`)
- Lifecycle policies are configured for cost optimization

### Database 🗄️

- Dedicated **NeonDB instances** are provisioned for each application
- Connection strings are stored securely in AWS Parameter Store
- Access is controlled through IAM roles

### API Gateway 🌉

- Centralized API Gateway provisions RESTful endpoints
- Routes are organized by domain and protected by appropriate authorization
- Cross-origin resource sharing (CORS) is configured for frontend access

### Monitoring 📊

- CloudWatch dashboards track key metrics
- Alarms are configured for important thresholds
- Log retention and filtering policies are applied

## Common Operations 🔄

### Adding a New Application

1. Update `lib/auth-stack.ts` to add new app-specific user group
2. Update `lib/storage-stack.ts` to provision new S3 bucket
3. Update `lib/db-stack.ts` to provision new database
4. Update `lib/api-stack.ts` to add relevant API endpoints
5. Update IAM policies in `lib/iam-stack.ts`

### Handling Infrastructure Changes

1. Make changes to appropriate CDK stack files
2. Run `cdk diff` to see what will change
3. Run `cdk deploy` to apply changes

### Destroying Infrastructure (Development Only)

```bash
# WARNING: Only use in development environments!
cdk destroy --all

# To destroy specific stacks
cdk destroy ApiStack StorageStack
```

## Useful Commands 🛠️

Here are some common commands you'll use during CDK development:

```bash
# Compile TypeScript to JavaScript
npm run build

# Watch for changes and compile automatically
npm run watch

# Perform Jest unit tests
npm run test

# Deploy stack to your default AWS account/region
npx cdk deploy

# Compare deployed stack with current state
npx cdk diff

# Emit the synthesized CloudFormation template
npx cdk synth
```

## Best Practices 📝

1. **Infrastructure as Code**: Always modify infrastructure through CDK, never manually in the AWS console
2. **Least Privilege**: Follow principle of least privilege when defining IAM roles
3. **Parameterize**: Use CDK context variables and AWS Parameter Store for environment-specific values
4. **Version Control**: Commit CDK changes with descriptive messages explaining the infrastructure changes
5. **Testing**: Test infrastructure changes in development before applying to production

## Troubleshooting 🔍

- **CloudFormation Errors**: Check CloudFormation in the AWS Console for detailed error messages
- **CDK Synth Issues**: Ensure TypeScript code compiles correctly with `npm run build`
- **Permission Problems**: Verify IAM permissions for the deploying user
- **API Gateway Errors**: Check CloudWatch Logs for Lambda function errors
