#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ApiStack } from '../lib/api-stack';
import { AuthStack } from '../lib/auth-stack';
import { StorageStack } from '../lib/storage-stack';
import { IamStack } from '../lib/iam-stack';

// Load environment variables from both .env files
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = new cdk.App();

// Set environment configuration with ap-southeast-1 region
const env = { 
  region: 'ap-southeast-1',
  account: process.env.CDK_DEFAULT_ACCOUNT
};

// Deploy the API stack
new ApiStack(app, 'IntegreatStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-1',
  },
});

/**
 * MULTI-TENANT ARCHITECTURE OVERVIEW
 * ==================================
 * 
 * This CDK app creates a complete multi-tenant infrastructure where each tenant/project
 * has its own isolated stack of AWS resources:
 * 
 * 1. Each tenant gets its own Cognito Identity Pool connected to Firebase Auth
 * 2. Each tenant gets its own S3 bucket for storing files
 * 3. Each tenant gets its own IAM role with permissions scoped only to their bucket
 * 
 * This approach ensures complete isolation between tenants while using a consistent
 * infrastructure pattern that can scale to any number of tenants.
 */

// List of tenant project IDs - each represents a separate Firebase project
// and will receive its own isolated AWS resources
const tenants = [
  'evntgarde-event-management',
  'pillars-edu-quality-assessor',
  'teleo-church-application',
  'campus-student-lifecycle',
  'integreat-core'
];

// For each tenant, create a complete set of infrastructure resources
for (const projectId of tenants) {
  // Authentication Stack (Cognito Identity Pool)
  const auth = new AuthStack(app, `${projectId}-auth`, { 
    projectId,
    env,
  });

  // Storage Stack (S3 Bucket)
  const storage = new StorageStack(app, `${projectId}-storage`, {
    projectId,
    env,
  });

  // IAM Stack (Roles and Permissions)
  new IamStack(app, `${projectId}-iam`, {
    authStack: auth,
    projectId,
    bucketArn: storage.bucket.bucketArn,
    env,
  });
}