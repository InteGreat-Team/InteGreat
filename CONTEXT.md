# Integreat Platform 🚀

## Table of Contents 📚
- [Overview](#overview-🌟)
- [Applications Supported](#applications-supported-📱)
- [Communication with Third-Party APIs](#communication-with-third-party-apis-🔗)
- [Technologies Used](#technologies-used-🛠️)
- [Production Strategy](#production-strategy-🏗️)
  - [Serverless Production with AWS Lambda & API Gateway](#serverless-production-with-aws-lambda--api-gateway-🌐)
  - [Infrastructure Provisioning with AWS CDK in Production](#infrastructure-provisioning-with-aws-cdk-in-production-🛡️)
  - [Multi-Tenant Architecture](#multi-tenant-architecture-🏢)
- [Note](#note-📝)

---

## Overview 🌟
Integreat is a unified platform for **API management**, **application infrastructure**, and **third-party API facilitation**. It supports seamless development and testing with **Serverless Framework v3** while provisioning production-grade architectures using **AWS CDK**. Integreat is designed to:

- Centralize API routing 🚦
- Enable cross-application communication 🔄
- Integrate with third-party APIs 🔗
- Manage robust, scalable application infrastructures via **Infrastructure as Code (IaC)** ⚙️
- Support multi-tenant applications with isolated resources 🏢

### Applications Supported 📱
- **EVNTgarde (Event Management)**
- **Pillars (Education Quality Assessor)**
- **Teleo (Church Management)**
- **Campus (Student Lifecycle Management)**

### Communication with Third-Party APIs 🔗
- **Email**: SES 📧
- **SMS**: PhilSMS 📱
- **Payment**: Paymongo 💰
- **Geolocation**: Gmaps API 🗺️
  - Places API
  - JavaScript Maps API
  - Geocoding API

## Technologies Used 🛠️
- **Backend Framework**: Node.js, Express 🖥️
- **Database**: NeonDB 🗄️
- **Authentication**: Firebase Auth with AWS Cognito Identity Pools 🔒
- **Cloud Services**:
  - **AWS Lambda** 🛠️
  - **AWS API Gateway** 🌐
  - **AWS Cognito**: For identity federation with Firebase Auth 🔑
  - **AWS S3 Bucket**: For tenant-isolated storage 📦
- **Analytics**: Power BI 📊
- **Development & Testing**: Serverless Framework v3 ⚙️
- **Production**: AWS CDK 🏗️

## Production Strategy 🏗️
To ensure scalability, efficiency, and high availability, Integreat employs a **serverless production strategy**, leveraging AWS Lambda and API Gateway as the backbone for its runtime architecture.

### Serverless Production with AWS Lambda & API Gateway 🌐
- **API Gateway** is configured as the primary entry point for all production traffic.
- Requests are processed by **AWS Lambda** functions, which execute the business and application logic.
- Key production benefits include:
  - **Automatic Scalability**: Seamlessly handles increased traffic during peak times 📈
  - **Cost-Effectiveness**: Costs are incurred only for actual usage, reducing unnecessary expenses 💵
  - **High Availability**: Ensures consistent uptime with a globally distributed and fault-tolerant architecture 🌎

This production strategy aligns with Integreat's vision of delivering a robust and centralized platform for API management and infrastructure.

### Infrastructure Provisioning with AWS CDK in Production 🛡️
For production environments, Integreat utilizes **AWS CDK** to provision and maintain critical cloud resources:
- **AWS Cognito Identity Pools**: Manages authentication and federation with Firebase Auth 🔒
- **IAM Roles**: Provides secure and granular access permissions for tenant-specific resources 🔑
- **S3 Buckets**: Isolated storage for each tenant with appropriate access controls 📂

AWS CDK ensures consistency, repeatability, and scalability in managing production infrastructure, reducing manual interventions and errors.

### Multi-Tenant Architecture 🏢

Integreat implements a robust multi-tenant architecture with complete isolation between tenants:

#### One Repo → One Firebase Project
Each application (EVNTgarde, Pillars, Teleo, Campus) lives in its own Git repo and its own Firebase project—so Auth, Firestore, Hosting, etc., are already siloed by design.

#### CDK Stacks Per Tenant
The CDK app loops over each projectId and deploys three stacks per tenant:

##### AuthStack
- Creates a Cognito Identity Pool named `<PROJECT_ID>-identity-pool`
- Tied to the Firebase OIDC issuer (securetoken.google.com/`<PROJECT_ID>`)
- No unauthenticated identities allowed

##### StorageStack
- Provisions an S3 bucket named `<PROJECT_ID>-tenant-bucket`
- Blocks all public access
- Enables CORS for browser-based SDK calls
- Retains bucket on stack deletion for data protection

##### IamStack
- Defines a TenantUserRole that trusts the Identity Pool
- Scopes permissions to allow operations only on the tenant's specific bucket
- Attaches the role to the Identity Pool for authenticated users

#### Frontend Integration
1. User authenticates with Firebase
2. Firebase JWT is exchanged for AWS credentials via Cognito Identity Federation
3. AWS SDK in the browser can directly perform S3 operations without a backend proxy

#### Benefits
- Complete tenant isolation at both the Firebase and AWS layers
- Direct-to-S3 access with temporary credentials
- Scalable pattern for adding new tenants

## Note 📝
Use this `context.md` file with GitHub Copilot for more relevant and accurate code suggestions for the multi-tenant Integreat platform.