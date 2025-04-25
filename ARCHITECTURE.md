# Integreat Architecture 🚀

This document outlines the architecture of Integreat, detailing both the development and production phases of the platform.

## Table of Contents 📚
- [Development Phase](#development-phase-🛠️)
  - [Hosting](#hosting)
  - [Backend](#backend)
  - [API Testing](#api-testing)
- [Production Phase](#production-phase-🏗️)
  - [Hosting](#hosting-1)
  - [Backend Infrastructure](#backend-infrastructure)
    - [Authentication](#authentication)
    - [Storage](#storage)
    - [Functions](#functions)
    - [API Gateway](#api-gateway)
- [Additional Notes](#additional-notes-📝)

---

## Development Phase 🛠️

### Hosting
- **AWS Amplify Hosting**: Used for hosting the frontend of each application during the development phase.

### Backend
- **AWS Amplify Backend Gen 2**:
  - **Authentication**: Managed through AWS Cognito.
  - **Storage**: AWS S3 is used for file and asset storage.
  - **Functions**: AWS Lambda handles serverless functions.
  - **Database**: Neon DB is used as the primary database.

### API Testing
- During the development phase, APIs are temporarily deployed using **Serverless Framework v3** and run on AWS Lambda.
- This approach allows early-stage integration and routing tests without requiring the full production infrastructure.

> **Note**: Each app is developed and hosted under its own AWS account. This setup allows teams to configure their backend independently during development. These configurations are later used as blueprints for provisioning the production infrastructure.

---

## Production Phase 🏗️

### Hosting
- **AWS Amplify Hosting**: Applications are deployed under Integreat’s centralized AWS account for production.

### Backend Infrastructure
Integreat provisions and manages the production infrastructure using **Infrastructure as Code (IaC)**, ensuring consistency and scalability.

#### Authentication
- Centralized authentication is managed via **AWS Cognito**.
- A single Cognito User Pool is used, with user groups representing individual apps (e.g., church, events, students).
- **IAM Roles** are assigned to each group to restrict access, ensuring users can only access resources relevant to their app.
- Integreat retains administrative access to all resources.

#### Storage
- A centralized **S3 bucket** is used for all apps (individual buckets are also supported for cost efficiency).
- Each app is allocated its own folder within the bucket (e.g., `/church/`, `/events/`, `/student/`).
- **IAM Roles** restrict access so that apps can only interact with their designated folders, while Integreat has full access to all folders.

#### Functions
- A unified **NeonDB** instance is used, implementing multi-tenancy through schemas.
- Each app has its own isolated schema (e.g., `church_schema`, `events_schema`, `student_schema`).
- **Access Controls**:
  - Apps can only access their respective schemas.
  - Integreat has full access to all schemas, enabling centralized data management and cross-app communication.

#### API Gateway
- All cross-app communication and third-party API integrations flow through Integreat’s centralized **API Gateway**.
- The API Gateway is protected by **IAM Roles** and authorization policies.
- Access to endpoints is restricted based on app and user group permissions.

---

## Additional Notes 📝
- The architecture leverages **AWS CDK** for provisioning and managing production infrastructure.
- This ensures scalability, security, and consistency across all applications hosted under Integreat.
