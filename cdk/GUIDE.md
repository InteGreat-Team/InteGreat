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
- Firebase projects created for each tenant application

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
# List of tenant project IDs for multi-tenant deployment
TENANT_IDS=evntgarde-event-management,pillars-edu-quality-assessor,teleo-church-application,campus-student-lifecycle
```

### Firebase OIDC Provider Setup 🔑

Before deploying CDK stacks, you must create an OIDC provider in AWS IAM for each Firebase project:

```bash
# For each Firebase project, create an OIDC provider
aws iam create-open-id-connect-provider \
  --url https://securetoken.google.com/YOUR_FIREBASE_PROJECT_ID \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list "a031c46782e6e6c662c2c87c76da9aa62ccabd8e"
```

> **Note**: The thumbprint is for Google's issuer. Verify it's current by checking Google's documentation.

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

# Deploy only specific tenant stacks
cdk deploy "evntgarde-event-management-*"

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
│   ├── cdk.ts              # Entry point for the CDK application with tenant loop
├── lib/
│   ├── auth-stack.ts       # Creates Cognito Identity Pools connected to Firebase
│   ├── storage-stack.ts    # Provisions tenant-isolated S3 buckets with CORS
│   ├── iam-stack.ts        # Sets up IAM roles with tenant-specific permissions
│   ├── api-stack.ts        # Sets up API Gateway and Lambda integrations
│   ├── db-stack.ts         # Configures database integration
│   ├── monitoring-stack.ts # Configures monitoring and alarms
├── functions/
│   ├── index.ts            # Main export file for all Lambda handlers
│   ├── handlers/           # Lambda handlers organized by domain
├── shared/
│   ├── services/           # Business logic used by multiple handlers
│   ├── config/             # Configuration files
│   ├── types/              # Type definitions
│   ├── utils/              # Shared utilities like logging
```

## Multi-Tenant Architecture 🏢

InteGreat implements a strong multi-tenant separation with complete isolation between tenants. Each tenant gets its own set of AWS resources:

```
Firebase Project A                    AWS Account (InteGreat)
┌──────────────────┐                 ┌───────────────────────────────┐
│  Authentication  │                 │        AuthStack A            │
│  Firestore       │                 │  ┌─────────────────────────┐  │
│  Hosting         │ ──── OIDC ────► │  │ Cognito Identity Pool A │  │
└──────────────────┘                 │  └─────────────────────────┘  │
                                     │                               │
                                     │        StorageStack A         │
                                     │  ┌─────────────────────────┐  │
                                     │  │     S3 Bucket A         │  │
                                     │  │  (with CORS enabled)    │  │
                                     │  └─────────────────────────┘  │
                                     │                               │
Firebase Project B                   │        IamStack A             │
┌──────────────────┐                 │  ┌─────────────────────────┐  │
│  Authentication  │                 │  │   TenantUserRole A      │  │
│  Firestore       │                 │  └─────────────────────────┘  │
│  Hosting         │ ──── OIDC ────► │                               │
└──────────────────┘                 │        AuthStack B            │
                                     │  ┌─────────────────────────┐  │
                                     │  │ Cognito Identity Pool B │  │
                                     │  └─────────────────────────┘  │
                                     │                               │
                                     │        StorageStack B         │
                                     │  ┌─────────────────────────┐  │
                                     │  │     S3 Bucket B         │  │
                                     │  │  (with CORS enabled)    │  │
                                     │  └─────────────────────────┘  │
                                     │                               │
                                     │        IamStack B             │
                                     │  ┌─────────────────────────┐  │
                                     │  │   TenantUserRole B      │  │
                                     │  └─────────────────────────┘  │
                                     └───────────────────────────────┘
```

### Key Components:

1. **Tenant Identification**: Each application is identified by its Firebase project ID
2. **AuthStack**: Creates a dedicated Cognito Identity Pool that trusts only that tenant's Firebase OIDC provider
3. **StorageStack**: Creates a tenant-specific S3 bucket with appropriate CORS configuration
4. **IamStack**: Sets up IAM roles specific to each tenant with proper permissions

### Authentication Flow:

1. User signs in to the tenant application using Firebase Auth
2. Frontend obtains Firebase JWT token
3. JWT token is passed to AWS Cognito Identity Pool via AWS SDK
4. Cognito validates the token and issues temporary AWS credentials
5. AWS SDK uses these credentials to access S3 directly from the browser

## Infrastructure Architecture 🏙️

### Authentication 🔐

- **Firebase Authentication** serves as the primary identity provider for each tenant
- **AWS Cognito Identity Pools** are configured as OIDC identity providers
- Each Identity Pool is bound to a specific Firebase project
- IAM roles restrict access to tenant-specific resources

### Storage 📦

- Each tenant gets its own isolated S3 bucket
- Buckets follow a naming pattern `<project-id>-tenant-bucket`
- All public access is blocked for security
- CORS is configured to allow direct browser access via the AWS SDK
- Lifecycle policies can be added for cost optimization

### API Gateway 🌉

- For complex operations beyond direct S3 access, a shared API Gateway can be configured
- Routes are organized by domain and protected by appropriate authorization
- Lambda functions handle business logic and additional processing

## Common Operations 🔄

### Adding a New Tenant

To add a new tenant to the infrastructure:

1. Create a new Firebase project for the tenant
2. Configure the Firebase project with proper authentication settings
3. Create an OIDC provider in AWS IAM for the Firebase project
4. Add the tenant's Firebase project ID to the `tenants` array in `cdk/bin/cdk.ts`
5. Deploy the infrastructure with `cdk deploy --all`

### Updating CORS Settings

When you're ready to lock down CORS to specific domains:

1. Update `storage-stack.ts` to replace the wildcard `*` with your specific domains:
```typescript
allowedOrigins: ['https://yourdomain.com', 'https://www.yourdomain.com'],
```
2. Deploy the updated stack with `cdk deploy "*-storage"`

### Handling Infrastructure Changes

1. Make changes to appropriate CDK stack files
2. Run `cdk diff` to see what will change
3. Run `cdk deploy` to apply changes

### Destroying Infrastructure (Development Only)

```bash
# WARNING: Only use in development environments!
cdk destroy --all

# To destroy specific tenant stacks
cdk destroy "evntgarde-event-management-*"
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

## Frontend Integration 🌐

To integrate the frontend application with the AWS resources:

```typescript
// Example React hook for AWS authentication with Firebase
import { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import AWS from 'aws-sdk/global';

// Your tenant's Firebase project ID
const projectId = 'evntgarde-event-management';

export function useAwsAuth() {
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setupAwsCredentials = async () => {
      try {
        // Get the current Firebase user
        const currentUser = firebase.auth().currentUser;
        
        if (!currentUser) {
          setLoading(false);
          return;
        }
        
        // Get a fresh Firebase ID token
        const idToken = await currentUser.getIdToken();
        
        // Configure AWS credentials
        AWS.config.region = 'ap-southeast-1'; // Your AWS region
        const credentials = new AWS.CognitoIdentityCredentials({
          Logins: {
            [`securetoken.google.com/${projectId}`]: idToken
          },
          IdentityPoolId: `ap-southeast-1:${projectId}-identity-pool`
        });
        
        // Refresh the credentials
        await credentials.getPromise();
        
        setCredentials(credentials);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    
    setupAwsCredentials();
  }, []);
  
  return { credentials, loading, error };
}
```

Example S3 upload with these credentials:

```typescript
import AWS from 'aws-sdk';
import { useAwsAuth } from './useAwsAuth';

function FileUploader() {
  const { credentials, loading, error } = useAwsAuth();
  
  const uploadFile = async (file) => {
    if (!credentials) return;
    
    // Create S3 service object with temporary credentials
    const s3 = new AWS.S3({
      credentials: credentials
    });
    
    const params = {
      Bucket: 'evntgarde-event-management-tenant-bucket',
      Key: `uploads/${file.name}`,
      Body: file,
      ContentType: file.type
    };
    
    try {
      const result = await s3.upload(params).promise();
      console.log('Successfully uploaded file:', result);
      return result.Location;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  };
  
  // Component implementation...
}
```

## Best Practices 📝

1. **Infrastructure as Code**: Always modify infrastructure through CDK, never manually in the AWS console
2. **Tenant Isolation**: Maintain strict separation between tenants' resources
3. **Least Privilege**: Follow principle of least privilege when defining IAM roles
4. **Parameterize**: Use CDK context variables and AWS Parameter Store for environment-specific values
5. **Version Control**: Commit CDK changes with descriptive messages explaining the infrastructure changes
6. **Security**: Always use HTTPS and configure CORS to restrict access to trusted domains in production

## Troubleshooting 🔍

- **CloudFormation Errors**: Check CloudFormation in the AWS Console for detailed error messages
- **CORS Issues**: Verify that your S3 bucket CORS configuration allows requests from your frontend domain
- **Authentication Problems**: Check Firebase configuration and ensure the OIDC provider is correctly set up
- **Permission Denied Errors**: Verify IAM roles have the correct permissions for the required actions
