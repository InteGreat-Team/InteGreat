# Dependencies Overview

## Core Dependencies
| Package | Purpose |
|---------|---------|
| 🏗️ express | Web framework for building the API. |
| 🔁 serverless-http | Wraps Express apps for Serverless deployment. |
| 🛢️ @supabase/supabase-js | Supabase client for database interactions. |
| 🔐 dotenv | Loads environment variables from .env. |
| ✅ envalid | Validates environment variables. |

### Installation
```bash
npm install express
npm install serverless-http
npm install @supabase/supabase-js
npm install dotenv
npm install envalid
```

## Development Dependencies
| Package | Purpose |
|---------|---------|
| ⚡ typescript | TypeScript compiler. |
| 📦 @types/node | TypeScript definitions for Node.js. |
| 🏗️ @types/express | TypeScript definitions for Express. |
| ☁️ @types/aws-lambda | TypeScript definitions for AWS Lambda. |
| 🔁 @types/serverless-http | TypeScript definitions for serverless-http. |
| 🚀 serverless | Serverless Framework CLI. |
| 📝 serverless-ts | Enables TypeScript support for Serverless configurations. |
| 🛠️ serverless-webpack | Bundles your Lambda functions with Webpack. |
| 🏠 serverless-offline | Simulates API Gateway locally for testing. |
| 🔐 serverless-dotenv-plugin | Loads .env variables during Serverless deployment. |
| 📦 webpack | Module bundler for JavaScript and TypeScript. |
| 🚫 webpack-node-externals | Excludes node_modules from Webpack bundles. |
| ⚙️ ts-loader | Webpack loader for TypeScript files. |

### Installation
```bash
npm install --save-dev typescript
npm install --save-dev @types/node
npm install --save-dev @types/express
npm install --save-dev @types/aws-lambda
npm install --save-dev @types/serverless-http
npm install --save-dev serverless
npm install --save-dev serverless-ts
npm install --save-dev serverless-webpack
npm install --save-dev serverless-offline
npm install --save-dev serverless-dotenv-plugin
npm install --save-dev webpack
npm install --save-dev webpack-node-externals
npm install --save-dev ts-loader
```

## Optional Utilities
| Package | Purpose |
|---------|---------|
| 🌐 axios | For making HTTP requests to 3rd party APIs. |
| 🔓 cors | Enables CORS in your Express app. |
| 🛡️ helmet | Secures your Express app by setting HTTP headers. |
| 📜 morgan | Logs HTTP requests for debugging. |

### Installation
```bash
npm install axios
npm install cors
npm install helmet
npm install morgan
```

