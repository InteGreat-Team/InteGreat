# InteGreat Serverless Development Guide 🛠️

This guide explains how to use the serverless development environment for InteGreat platform.

## Overview 📋

This repository contains the development version of InteGreat using Serverless Framework v3. It's designed for local development and testing before deploying to production using AWS CDK.

## Getting Started 🚀

### Prerequisites

- Node.js (v18 or later)
- AWS Account with appropriate permissions
- Serverless Framework CLI (v3.40.0)

### Installation 📥

```bash
# Install serverless globally
npm install -g serverless@3.40.0

# Install project dependencies
npm install
```

### Configuration ⚙️

```bash
# Configure AWS Credentials for Serverless
serverless config credentials --provider aws --key YOUR_AWS_ACCESS_KEY_ID --secret YOUR_AWS_SECRET_ACCESS_KEY
# NOTE: Access keys can be found in the integreat-deployer_accessKeys.csv in InteGreat's Google Drive

# Create and configure .env file in root
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
AWS_REGION=ap-southeast-1
SES_SENDER_EMAIL=your_verified_email@example.com
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# NOTE: Environment values can be found in the .env file in InteGreat's Google Drive
```

### Local Development 💻

```bash
# Start serverless offline for local development
npm run dev

# Or use the serverless CLI directly
serverless offline start
```

### Deployment 🚢

```bash
# Deploy to AWS (Development only)
npm run deploy

# Or use the serverless CLI directly
serverless deploy
```

## Project Structure 📁

- `src/`: Source code for the application
  - `app.ts`: Express application entry point
  - `lambda.ts`: AWS Lambda handler
  - `config/`: Configuration files for external services
  - `controllers/`: Business logic for handling requests
  - `middleware/`: Express middleware (authentication, logging, etc.)
  - `routes/`: API route definitions
  - `services/`: Service layer for external APIs and databases
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions and helpers

## Dependencies 📦

### Core Dependencies

| Package | Version | Description |
|---------|---------|-------------|
| express | 4.21.2 | Web framework for handling HTTP requests and routing |
| @supabase/supabase-js | 2.49.1 | Supabase client for database operations |
| @aws-sdk/client-ses | 3.758.0 | AWS SDK v3 client for Simple Email Service (SES) |
| @googlemaps/google-maps-services-js | ^3.3.36 | Google Maps services client for Node.js |
| axios | 1.8.1 | HTTP client for making API requests |
| cors | 2.8.5 | Middleware to enable CORS (Cross-Origin Resource Sharing) |
| dotenv | 16.4.7 | Loads environment variables from .env files |
| envalid | 8.0.0 | Environment variable validation |
| serverless-http | 3.2.0 | Adapter to run Express apps on AWS Lambda |

### Serverless Framework

| Package | Version | Description |
|---------|---------|-------------|
| serverless | 3.40.0 | Serverless Framework CLI |
| serverless-offline | 13.9.0 | Local development environment for Serverless |
| serverless-webpack | 5.15.0 | Webpack integration for Serverless |
| serverless-prune-versions | 1.0.4 | Automatically prunes older Lambda function versions |
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
