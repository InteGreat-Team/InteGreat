/**
 * AWS SDK Configuration
 * 
 * This file configures AWS SDK v3 clients for various AWS services.
 * 
 * Implementation Status:
 * - Current Sprint: Implementing SES for email services
 * - Future Sprint: Will add additional AWS services as needed
 * 
 * AWS Services Integration:
 * - SES for email services (implemented)
 * - S3 for file storage (future)
 * - CloudWatch for logging (future)
 * - DynamoDB for additional data storage (future)
 * - SNS/SQS for messaging (future)
 */

// Import AWS SDK v3 clients
import { SES } from "@aws-sdk/client-ses";
import { env } from './env';

// AWS configuration using validated environment variables
export const awsConfig = {
  region: env.AWS_REGION,
};

// Initialize and export SES client
export const sesClient = new SES({
  region: awsConfig.region,
  // AWS Lambda automatically uses credentials from the function's execution role
  // If running locally, credentials will be loaded from ~/.aws/credentials or environment variables
});

// Export all AWS services in a single object for easier imports elsewhere
export const awsServices = {
  ses: sesClient,
  // These will be initialized in future sprints
  // s3: null,
  // cloudWatch: null,
};