# Integreat API Gateway

## Overview
Integreat is an API Gateway designed to facilitate communication between systems and third-party APIs (e.g., email and SMS services—these are just examples; specific services will be determined later). It follows the REST architecture, supporting HTTP methods like GET, POST, PUT, and DELETE.

## Technologies Used
- **Backend Framework**: Node.js, Express
- **Database**: PostgreSQL, MongoDB (undecided)
- **Cloud Services**: AWS Lambda, AWS API Gateway, AWS ECS
- **Deployment Tool**: Serverless Framework
- **Networking**: Ngrok (for temporary external access)

## File Structure
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

## Deployment Strategy
The tribe is currently deciding between two deployment options:

1. **Hosting the Express App on AWS ECS with API Gateway**:
   - Deploy the Express server as a containerized application on **AWS ECS (Elastic Container Service)**.
   - API Gateway will be used as the main entry point, routing requests to the ECS service.
   - Suitable for maintaining long-running connections, WebSockets, or session-based applications.
   - Requires configuring ECS tasks, load balancing, auto-scaling, and networking.
   
2. **Using AWS Lambda & API Gateway**:
   - The API Gateway routes requests to AWS Lambda functions.
   - Fully serverless, eliminating the need for server maintenance.
   - Scales automatically based on traffic demand.
   - Reduces costs by only charging for actual usage.

### Flexibility with Serverless Framework
To keep deployment options flexible, Integreat uses the **Serverless Framework** along with `serverless-http`, allowing the API to run in both environments seamlessly. The architecture enables:
- **Serverless Deployment:** Direct deployment to AWS Lambda.
- **Containerized Deployment:** Running the Express server as a containerized service on AWS ECS while keeping API Gateway as the entry point.
- **Hybrid Approach:** If needed, a mix of both options can be implemented for different API routes.

## Local Development & Testing
- **Serverless-offline** is used for local testing.
- **AWS SDK** is used when Integreat is deployed locally.
- **Ngrok** is used to expose local instances to external systems when needed.

## Installed Modules
```plaintext
integreat@1.0.0
├── @aws-sdk/client-ses@3.758.0
├── @aws-sdk/client-sns@3.758.0
├── @googlemaps/google-maps-services-js@3.4.0
├── @serverless/typescript@3.38.0
├── @supabase/supabase-js@2.49.1
├── @types/aws-lambda@8.10.147
├── @types/axios@0.9.36
├── @types/cors@2.8.17
├── @types/express@5.0.0
├── @types/node@22.13.5
├── @types/webpack-node-externals@3.0.4
├── @types/webpack@5.28.5
├── axios@1.8.1
├── cors@2.8.5
├── dotenv@16.4.7
├── envalid@8.0.0
├── express@4.21.2
├── serverless-http@3.2.0
├── serverless-offline@13.9.0
├── serverless-plugin-dotenv@1.0.0
├── serverless-prune-versions@1.0.4
├── serverless-webpack@5.15.0
├── ts-loader@9.5.2
├── ts-node@10.9.2
├── typescript@5.7.3
├── webpack-node-externals@3.0.0
└── webpack@5.98.0
```

## Note
Use this `context.md` file with GitHub Copilot for more relevant and accurate code suggestions.
