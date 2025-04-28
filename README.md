# Integreat Core

InteGreat is a comprehensive unified platform for application infrastructure management, API orchestration, and third-party service integration. It serves multiple applications including church management, events management, school lifecycle management, and pillars management, while providing centralized control over infrastructure, authentication, and data access.

## Architecture Overview

InteGreat employs a dual architecture approach: a development environment using Serverless Framework v3 for testing and a production environment leveraging AWS CDK for robust infrastructure provisioning. The platform utilizes a modern serverless architecture with AWS Lambda and API Gateway at its core, while maintaining the flexibility to run on traditional servers. The codebase follows a clean separation of concerns to ensure modularity, scalability, and maintainability.

## Features

-   **Centralized Infrastructure Management**: Provision and manage cloud resources via Infrastructure as Code (IaC)
-   **Multi-tenant Authentication**: Unified Cognito User Pool with app-specific user groups and IAM role restrictions
-   **Unified Storage Management**: Centralized S3 bucket with application-specific folders and access controls
-   **Database Multi-tenancy**: Isolated schema approach with app-specific access controls
-   **Third-Party API Integration**: Connect with external services for email (SES), SMS (PhilSMS), payment (Paymongo), and geolocation (Google Maps)
-   **Cross-Application Communication**: Enable secure data sharing between different systems
-   **Serverless Deployment**: Leverage AWS Lambda and API Gateway for automatic scaling and cost optimization
-   **Production-grade Monitoring**: Integrated CloudWatch for monitoring and alerting
-   **TypeScript Support**: Enhanced development experience with type safety


## Table of Contents 📚
- [Development Phase 🛠️](#development-phase-🛠️)
  - [Hosting 🌐](#hosting-🌐)
  - [Backend 🗄️](#backend-🗄️)
  - [API Testing 🧪](#api-testing-🧪)
  - [Serverless Framework Architecture 📂](#serverless-framework-architecture-📂)
- [Production Phase 🏗️](#production-phase-🏗️)
  - [Hosting 🌐](#hosting-🌐-1)
  - [Backend Infrastructure 🛡️](#backend-infrastructure-🛡️)
    - [Authentication 🔐](#authentication-🔐)
    - [Storage 📦](#storage-📦)
    - [Functions 🛠️](#functions-🛠️)
    - [API Gateway 🌉](#api-gateway-🌉)
  - [AWS CDK Architecture 🏗️](#aws-cdk-architecture-🏗️)
- [Additional Notes 📝](#additional-notes-📝)

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
- **AWS Amplify Hosting**: Applications are deployed under Integreat’s centralized AWS account for production.

### Backend Infrastructure 🛡️
Integreat provisions and manages the production infrastructure using **Infrastructure as Code (IaC)**, ensuring consistency and scalability.

#### Authentication 🔐
- Centralized authentication is managed via **AWS Cognito**.
- A single Cognito User Pool is used, with user groups representing individual apps (e.g., church, events, students).
- **IAM Roles** are assigned to each group to restrict access, ensuring users can only access resources relevant to their app.
- Integreat retains administrative access to all resources.

#### Storage 📦
- **Separate S3 buckets** are now used for each application (e.g., `church-storage`, `events-storage`, `student-storage`).
- This approach provides improved isolation, security, and performance optimization per application.
- **IAM Roles** are configured to restrict access so that applications can only interact with their designated buckets.
- Integreat maintains administrative access across all buckets for centralized management.

#### Functions 🛠️
- **Separate NeonDB instances** are now used for each application, providing dedicated databases (e.g., `church-db`, `events-db`, `student-db`).
- This approach offers improved cost-efficiency, performance isolation, and simplified management 
- **Database Connections**:
  - Applications connect only to their own dedicated database.
  - Integreat maintains connection capabilities to all databases for cross-application data coordination and management.

#### API Gateway 🌉
- All cross-app communication and third-party API integrations flow through Integreat’s centralized **API Gateway**.
- The API Gateway is protected by **IAM Roles** and authorization policies.
- Access to endpoints is restricted based on app and user group permissions.

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

## Additional Notes 📝
- The architecture leverages **AWS CDK** for provisioning and managing production infrastructure.
- This ensures scalability, security, and consistency across all applications hosted under Integreat.
