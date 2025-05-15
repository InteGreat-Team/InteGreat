# Integreat Core 🔄

InteGreat is a comprehensive unified platform for application infrastructure management, API orchestration, and third-party service integration. It serves multiple applications including church management, events management, school lifecycle management, and pillars management, while providing centralized control over infrastructure, authentication, and data access.

## Architecture Overview 🏗️

InteGreat employs a dual architecture approach: a development environment using Serverless Framework v3 for testing and a production environment leveraging AWS CDK for robust infrastructure provisioning. The platform utilizes a modern serverless architecture with AWS Lambda and API Gateway at its core, while maintaining the flexibility to run on traditional servers. The codebase follows a clean separation of concerns to ensure modularity, scalability, and maintainability.

## Features ✨

-   **Centralized Infrastructure Management** 🛠️: Provision and manage cloud resources via Infrastructure as Code (IaC)
-   **Multi-tenant Authentication** 🔐: Firebase authentication with AWS Cognito Identity Pools for secure, isolated tenant access
-   **Storage Management** 📦: Separate S3 buckets for each tenant with appropriate CORS and access controls
-   **Database Strategy** 🗄️: Dedicated database instances for each application ensuring optimal performance
-   **Third-Party API Integration** 🔌: Connect with external services for email (SES), SMS (PhilSMS), payment (Paymongo), and geolocation (Google Maps)
-   **Cross-Application Communication** 🔄: Enable secure data sharing between different systems
-   **Serverless Deployment** ⚡: Leverage AWS Lambda and API Gateway for automatic scaling and cost optimization
-   **Production-grade Monitoring** 📊: Integrated CloudWatch for monitoring and alerting
-   **TypeScript Support** 📘: Enhanced development experience with type safety

## Table of Contents 📚
- [Development Phase 🛠️](#development-phase-)
  - [Hosting 🌐](#hosting-)
  - [Backend 🗄️](#backend-)
  - [API Testing 🧪](#api-testing-)
  - [Serverless Framework Architecture 📂](#serverless-framework-architecture-)
- [Production Phase 🏗️](#production-phase-)
  - [Hosting 🌐](#hosting--1)
  - [Backend Infrastructure 🛡️](#backend-infrastructure-)
    - [Authentication 🔐](#authentication-)
    - [Storage 📦](#storage-)
    - [Functions 🛠️](#functions-)
    - [API Gateway 🌉](#api-gateway-)
  - [AWS CDK Architecture 🏗️](#aws-cdk-architecture-)
- [Multi-Tenant Architecture 🏢](#multi-tenant-architecture-)
- [Additional Notes 📝](#additional-notes-)

---

## Development Phase 🛠️

### Hosting 🌐
- **AWS Amplify Hosting**: Used for hosting the frontend of each application during the development phase.

### Backend 🗄️
- **AWS Amplify Backend Gen 2**:
  - **Authentication 🔐**: Managed through AWS Cognito.
  - **Storage 📦**: AWS S3 is used for file and asset storage.
  - **Functions 🛠️**: AWS Lambda handles serverless functions.
  - **Database 🗃️**: Neon DB is used as the primary database.

### API Testing 🧪
- During the development phase, APIs are temporarily deployed using **Serverless Framework v3** and run on AWS Lambda.
- This approach allows early-stage integration and routing tests without requiring the full production infrastructure.

> **Note**: Each app is developed and hosted under its own AWS account. This setup allows teams to configure their backend independently during development. These configurations are later used as blueprints for provisioning the production infrastructure.

---

### Serverless Framework Architecture 📂
The following file structure represents the architecture used with the **Serverless Framework**. This architecture is designed to simplify local development and testing while enabling seamless deployment to AWS Lambda and API Gateway.

```
/integreat
├── src/
│   ├── config/             # Configuration files (e.g., environment variables, database settings)
│   ├── controllers/        # Business logic for handling requests
│   ├── middleware/         # Express middleware (e.g., authentication, logging, validation)
│   ├── routes/             # Route definitions for API endpoints
│   ├── services/           # Service layer for interacting with external APIs and databases
│   ├── types/              # Type definitions (for TypeScript support)
│   ├── utils/              # Utility functions and helpers
│   ├── app.ts              # Express app entry point
│   ├── lambda.ts           # Lambda function entry point
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── CONTEXT.md              # Project context file
├── LICENSE                 # License file
├── package-lock.json       # NPM lock file
├── package.json            # Project metadata and dependencies
├── README.md               # Documentation
├── serverless.ts           # Serverless Framework configuration file
├── tsconfig.json           # TypeScript compiler options
└── webpack.config.ts       # Webpack configuration for bundling
```

This structure is optimized for serverless deployment, providing a clear separation of concerns for configuration, business logic, middleware, and utilities.

---

## Production Phase 🏗️

### Hosting 🌐
- **AWS Amplify Hosting**: Applications are deployed under Integreat's centralized AWS account for production.

### Backend Infrastructure 🛡️
Integreat provisions and manages the production infrastructure using **Infrastructure as Code (IaC)**, ensuring consistency and scalability.

#### Authentication 🔐
- Each tenant (application) uses **Firebase Authentication** as the primary authentication provider
- **AWS Cognito Identity Pools** are provisioned for each tenant to enable secure access to AWS resources
- Firebase JWT tokens are exchanged for temporary AWS credentials via Cognito Identity Federation
- OIDC integration between Firebase and AWS ensures secure token validation

#### Storage 📦
- **Separate S3 buckets** are created for each tenant (e.g., `evntgarde-event-management-tenant-bucket`)
- Each bucket is configured with:
  - Tenant-specific naming to ensure global uniqueness
  - Complete public access blocking for security
  - CORS configuration to allow direct browser access via the AWS SDK
  - Retention policy to prevent accidental deletion
- Two access methods are supported:
  1. **Direct frontend access** via AWS SDK:
     - Uses Firebase Authentication with Cognito Identity Pools
     - Temporary AWS credentials are generated based on Firebase JWT tokens
     - No API Gateway required for basic S3 operations
     - Access permissions controlled by IAM policies linked to the tenant's identity pool
  2. **Backend access** via Lambda functions:
     - For complex operations requiring server-side processing
     - Accessed through API Gateway endpoints when needed

#### Functions 🛠️
- **Separate NeonDB instances** are used for each application, providing dedicated databases
- This approach offers improved cost-efficiency, performance isolation, and simplified management 
- **Database Connections**:
  - Applications connect only to their own dedicated database
  - Integreat maintains connection capabilities to all databases for cross-application data coordination and management

#### API Gateway 🌉
- All cross-app communication and third-party API integrations flow through Integreat's centralized **API Gateway**
- The API Gateway is protected by **IAM Roles** and authorization policies
- Access to endpoints is restricted based on app and user group permissions

---

### AWS CDK Architecture 🏗️
The following architecture is designed for production-grade deployments using **AWS CDK** (Cloud Development Kit). It focuses on Infrastructure as Code (IaC) to provision and manage cloud resources efficiently.

```
/cdk
├── bin/
│   ├── cdk.ts              # Entry point for the CDK application
├── lib/
│   ├── auth-stack.ts       # Defines AWS Cognito configuration for authentication
│   ├── api-stack.ts        # Sets up API Gateway and Lambda integrations
│   ├── storage-stack.ts    # Provisions S3 buckets for storage
│   ├── iam-stack.ts        # Manages IAM Roles and policies
│   ├── db-stack.ts         # Provisions and configures the NeonDB or database integration
│   ├── monitoring-stack.ts # Configures monitoring and alarms (e.g., CloudWatch)
├── functions/
│   ├── index.ts            # Main export file for all Lambda handlers
│   ├── handlers/           # Lambda handlers organized by domain replaced controllers
├── shared/
│   ├── services/           # Business logic used by multiple handlers
│   ├── config/             # Configuration files
│   ├── types/              # Type definitions
│   ├── utils/              # Shared utilities like logging
│   │   ├── logger.ts       # Logging utility (adapted from middleware)
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── cdk.context.json        # CDK-specific context configuration
├── cdk.json                # CDK application metadata
├── package-lock.json       # NPM lock file
├── package.json            # Project metadata and dependencies
├── README.md               # Documentation
├── tsconfig.json           # TypeScript compiler options
```

### Highlights of the AWS CDK Architecture 🏗️
1. **Stacks**: Each stack represents a specific domain in the application, such as authentication (`auth-stack.ts`), API management (`api-stack.ts`), storage (`storage-stack.ts`), and IAM roles (`iam-stack.ts`).
2. **Infrastructure as Code (IaC)**: AWS CDK automates the provisioning and management of AWS resources, ensuring consistency and scalability.
3. **Testing 🧪**: Validate infrastructure and API endpoints locally using the **AWS SAM CLI** (`sam local start-api`).
4. **Monitoring 👀**: Integrates CloudWatch for monitoring and alerting in production environments.

This architecture ensures a robust, scalable, and maintainable production environment.

---

## Multi-Tenant Architecture 🏢

InteGreat implements a robust multi-tenant architecture with complete isolation between tenants:

### One Repo → One Firebase Project
Each application (EVNTgarde, Pillars, Teleo, Campus) lives in its own Git repo and its own Firebase project—so Auth, Firestore, Hosting, etc., are already siloed.

### CDK Stacks Per Tenant
The CDK app loops over each projectId and deploys three stacks per tenant:

#### AuthStack
- Creates a Cognito Identity Pool named `<PROJECT_ID>-identity-pool`
- Tied to the Firebase OIDC issuer (securetoken.google.com/`<PROJECT_ID>`)
- No unauthenticated identities allowed

#### StorageStack
- Provisions an S3 bucket named `<PROJECT_ID>-tenant-bucket`
- Blocks all public access
- Enables CORS for browser-based SDK calls (GET, PUT, HEAD, POST, DELETE)
- Retains bucket on stack deletion for data protection

#### IamStack
- Defines a TenantUserRole that trusts the Identity Pool via sts:AssumeRoleWithWebIdentity
- Scopes that role to allow s3:PutObject, s3:GetObject, s3:DeleteObject, and s3:ListBucket on that tenant's bucket
- Attaches the TenantUserRole as the authenticated role on the Identity Pool

### Frontend Integration
1. AuthContext calls firebase.auth().currentUser.getIdToken() to obtain a fresh Firebase JWT
2. JWT is passed to AWS.CognitoIdentityCredentials (Logins map), which exchanges it for short-lived AWS credentials under the TenantUserRole
3. With those credentials, the AWS SDK in the browser can call S3 operations directly against the tenant's bucket—CORS-enabled and locked down by IAM

### Benefits
- Full per-tenant isolation at both the Firebase and AWS layers
- Zero back-end proxy for S3: front end talks straight to S3 with temporary credentials
- Clear, repeatable CDK pattern for adding more tenants in the future (just add another projectId)

---

## Additional Notes 📝
- The architecture leverages **AWS CDK** for provisioning and managing production infrastructure
- This ensures scalability, security, and consistency across all applications hosted under Integreat
- When adding new tenants, simply add their Firebase project ID to the tenant list in the CDK app
