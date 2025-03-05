/**
 * Serverless Framework TypeScript Configuration
 * 
 * This file defines the infrastructure as code for deploying our application
 * to AWS Lambda and API Gateway using the Serverless Framework.
 * 
 * Key Components:
 * - Service Definition: Names and identifies our serverless application
 * - Provider Configuration: Specifies AWS as our target provider with Node.js runtime
 * - Function Definitions: Maps our Lambda handler to API Gateway endpoints
 * - Plugin Configuration: Enhances Serverless Framework with additional capabilities
 * 
 * Features:
 * - TypeScript Support: Integrates with webpack for TypeScript compilation
 * - Environment Variables: Securely passes environment variables to Lambda functions
 * - API Gateway Integration: Creates RESTful API endpoints that trigger Lambda functions
 * - Local Development: Supports offline development and testing via serverless-offline
 * 
 * This configuration enables continuous deployment of our Express application
 * to AWS Lambda with minimal configuration and maintenance overhead.
 */

import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'integreat',
  frameworkVersion: '4',
  plugins: [
    'serverless-webpack',
    'serverless-offline',
    'serverless-plugin-dotenv',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'ap-southeast-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      SUPABASE_URL: '${env:SUPABASE_URL}',
      SUPABASE_KEY: '${env:SUPABASE_KEY}',
    },
  },
  functions: {
    api: {
      handler: 'src/lambda.handler',
      events: [
        {
          http: {
            method: 'any',
            path: '/',
          },
        },
        {
          http: {
            method: 'any',
            path: '{proxy+}',
          },
        },
      ],
    },
  },
  package: {
    individually: true,
  },
  custom: {
    webpack: {
      webpackConfig: 'webpack.config.ts',
      includeModules: true,
      packager: 'npm',
      excludeFiles: '**/*.test.ts',
    },
  },
};

module.exports = serverlessConfiguration;