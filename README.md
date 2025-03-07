# InteGreat API Engine

InteGreat is a flexible API Engine that serves as a centralized gateway for multiple applications such as church management, events management, and school lifecycle management. It provides third-party API integration capabilities and facilitates inter-application communication.

## Architecture Overview

InteGreat uses a modern serverless architecture with AWS Lambda and API Gateway, while maintaining flexibility to run on traditional servers. The codebase is designed with a clean separation of concerns to support modularity and scalability.

## Features

-   **Centralized API Management**: Single point of access for multiple applications
-   **Third-Party API Integration**: Connect with external services seamlessly
-   **Inter-Application Communication**: Enable data sharing between different systems
-   **Serverless Deployment**: Leverage AWS Lambda for scaling and cost optimization
-   **Flexible Deployment Options**: Seamlessly transition to traditional servers when needed
-   **TypeScript Support**: Enhanced development experience with type safety

## Dependencies

### Core Dependencies

| Package | Version | Description |
|---------|---------|-------------|
| express | 4.21.2 | Web framework for handling HTTP requests and routing |
| @supabase/supabase-js | 2.49.1 | Supabase client for database operations |
| @aws-sdk/client-ses | 3.521.0 | AWS SDK v3 client for Simple Email Service (SES) |
| axios | 1.8.1 | HTTP client for making API requests |
| cors | 2.8.5 | Middleware to enable CORS (Cross-Origin Resource Sharing) |
| dotenv | 16.4.7 | Loads environment variables from .env files |
| envalid | 8.0.0 | Environment variable validation |
| serverless-http | 3.2.0 | Adapter to run Express apps on AWS Lambda |

### Serverless Framework

| Package | Version | Description |
|---------|---------|-------------|
| serverless | 3.40.0 | Serverless Framework CLI |
| serverless-offline | 14.4.0 | Local development environment for Serverless |
| serverless-webpack | 5.15.0 | Webpack integration for Serverless |
| serverless-plugin-dotenv | 1.0.0 | Loads .env files during Serverless deployment |
| @serverless/typescript | 3.38.0 | TypeScript support for Serverless |

### TypeScript & Build Tools

| Package | Version | Description |
|---------|---------|-------------|
| typescript | 5.7.3 | TypeScript language and compiler |
| ts-loader | 9.5.2 | TypeScript loader for webpack |
| webpack | 5.98.0 | Module bundler for JavaScript applications |
| webpack-node-externals | 3.0.0 | Excludes node_modules from webpack bundles |
| ts-node | 10.9.1 | TypeScript execution environment for Node.js |

### Type Definitions

| Package                       | Version  | Description                                       |
| ----------------------------- | -------- | ------------------------------------------------- |
| @types/node                   | 22.13.5  | TypeScript definitions for Node.js                |
| @types/express                | 5.0.0    | TypeScript definitions for Express                |
| @types/aws-lambda             | 8.10.147 | TypeScript definitions for AWS Lambda             |
| @types/cors                   | 2.8.17   | TypeScript definitions for cors                   |
| @types/axios                  | 0.9.36   | TypeScript definitions for axios                  |
| @types/webpack                | 5.28.5   | TypeScript definitions for webpack                |
| @types/webpack-node-externals | 3.0.4    | TypeScript definitions for webpack-node-externals |

## Getting Started

### Installation

```bash
npm install
```

### Local Development

```bash
# Start serverless offline for local development
npm run dev

# Or use the serverless CLI directly
serverless offline start
```

### Deployment

```bash
# Deploy to AWS
npm run deploy

# Or use the serverless CLI directly
serverless deploy
```
