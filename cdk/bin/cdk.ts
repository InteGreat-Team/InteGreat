#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ApiStack } from '../lib/api-stack';

// Load environment variables from both .env files
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = new cdk.App();
new ApiStack(app, 'IntegreatStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-1',
  },
});