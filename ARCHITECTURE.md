# Integreat Architecture 🚀

This document outlines the architecture of Integreat, detailing both the development and production phases of the platform.

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
- A centralized **S3 bucket** is used for all apps (individual buckets are also supported for cost efficiency).
- Each app is allocated its own folder within the bucket (e.g., `/church/`, `/events/`, `/student/`).
- **IAM Roles** restrict access so that apps can only interact with their designated folders, while Integreat has full access to all folders.

#### Functions 🛠️
- A unified **NeonDB** instance is used, implementing multi-tenancy through schemas.
- Each app has its own isolated schema (e.g., `church_schema`, `events_schema`, `student_schema`).
- **Access Controls**:
  - Apps can only access their respective schemas.
  - Integreat has full access to all schemas, enabling centralized data management and cross-app communication.

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
│   ├── monitoring-stack.ts # Configures monitoring and alarms (e.g., CloudWatch)
├── test/
│   ├── auth-stack.test.ts  # Unit tests for the auth stack
│   ├── api-stack.test.ts   # Unit tests for the API stack
│   ├── storage-stack.test.ts # Unit tests for the storage stack
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── cdk.context.json        # CDK-specific context configuration
├── cdk.json                # CDK application metadata
├── package-lock.json       # NPM lock file
├── package.json            # Project metadata and dependencies
├── README.md               # Documentation
├── tsconfig.json           # TypeScript compiler options
└── jest.config.js          # Jest configuration for testing
```

### Highlights of the AWS CDK Architecture 🏗️
1. **Stacks**: Each stack represents a specific domain in the application, such as authentication (`auth-stack.ts`), API management (`api-stack.ts`), storage (`storage-stack.ts`), and IAM roles (`iam-stack.ts`).
2. **Infrastructure as Code (IaC)**: AWS CDK automates the provisioning and management of AWS resources, ensuring consistency and scalability.
3. **Testing 🧪**: Includes unit tests for each stack to validate infrastructure configurations before deployment.
4. **Monitoring 👀**: Integrates CloudWatch for monitoring and alerting in production environments.

This architecture ensures a robust, scalable, and maintainable production environment.

---

## Additional Notes 📝
- The architecture leverages **AWS CDK** for provisioning and managing production infrastructure.
- This ensures scalability, security, and consistency across all applications hosted under Integreat.
