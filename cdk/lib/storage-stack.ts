// // storage-stack.ts
// import * as cdk from 'aws-cdk-lib';
// import { Construct } from 'constructs';
// import * as s3 from 'aws-cdk-lib/aws-s3';

// export interface StorageStackProps extends cdk.StackProps {
//   projectId: string;
// }

// /**
//  * STORAGE STACK
//  * ============
//  * 
//  * This stack creates an isolated S3 bucket for each tenant to store their files.
//  * The bucket is configured with:
//  * 
//  * 1. Tenant-specific naming to ensure global uniqueness
//  * 2. Security settings that block all public access
//  * 3. CORS configuration to allow direct browser access via the AWS SDK
//  * 4. Retention policy to prevent accidental deletion
//  * 
//  * Each tenant's data remains completely isolated from other tenants since
//  * they have their own dedicated bucket, and IAM permissions are scoped
//  * to allow access only to that tenant's bucket.
//  */
// export class StorageStack extends cdk.Stack {
//   public readonly bucket: s3.Bucket;

//   constructor(scope: Construct, id: string, props: StorageStackProps) {
//     super(scope, id, props);

//     // Create an S3 bucket that's dedicated to this specific tenant
//     this.bucket = new s3.Bucket(this, 'TenantBucket', {
//       // Use the tenant's project ID in the bucket name to ensure uniqueness
//       bucketName: `${props.projectId}-tenant-bucket`,
      
//       // Prevent accidental deletion of the bucket during stack updates
//       // This is a safety measure for production data
//       removalPolicy: cdk.RemovalPolicy.RETAIN,
      
//       // Don't automatically delete objects when the stack is deleted
//       autoDeleteObjects: false,
      
//       // Block all public access to this bucket for security
//       // All access must be authenticated through IAM
//       blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      
//       // Configure Cross-Origin Resource Sharing (CORS) to allow browser-based
//       // uploads directly to S3 from the tenant's web application
//       cors: [
//         {
//           // Allow any headers in requests
//           allowedHeaders: ['*'],
          
//           // Allow these HTTP methods for file operations:
//           // GET: Download files
//           // PUT: Upload files
//           // POST: Multi-part uploads
//           // DELETE: Remove files
//           // HEAD: Get metadata about files
//           allowedMethods: [
//             s3.HttpMethods.GET,
//             s3.HttpMethods.PUT,
//             s3.HttpMethods.POST,
//             s3.HttpMethods.DELETE,
//             s3.HttpMethods.HEAD,
//           ],
          
//           // Allow requests from any origin during development
//           // SECURITY NOTE: In production, this should be restricted to your specific domains
//           allowedOrigins: ['*'],
          
//           // Allow browsers to access these response headers from JavaScript
//           exposedHeaders: [
//             'ETag',                        // For checking file integrity
//             'x-amz-server-side-encryption', // For confirming encryption status
//             'x-amz-request-id',            // For troubleshooting
//             'x-amz-id-2'                  // For troubleshooting
//           ],
          
//           // Cache the CORS response for 50 minutes (3000 seconds)
//           // This reduces the number of preflight requests
//           maxAge: 3000
//         }
//       ]
//     });
//   }
// }

// storage-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface StorageStackProps extends cdk.StackProps {
  projectId: string;
}

/**
 * STORAGE STACK
 * ============
 * 
 * This stack creates an isolated S3 bucket for each tenant to store their files.
 * The bucket is configured with:
 * 
 * 1. Tenant-specific naming to ensure global uniqueness
 * 2. Security settings that block general public access, but allow public access to the 'public/' folder
 * 3. CORS configuration to allow direct browser access via the AWS SDK
 * 4. Retention policy to prevent accidental deletion
 * 5. A dedicated public folder for website images and other publicly accessible assets
 * 
 * Each tenant's data remains completely isolated from other tenants since
 * they have their own dedicated bucket, and IAM permissions are scoped
 * to allow access only to that tenant's bucket.
 */
export class StorageStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly publicFolderUrl: string;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    // Create an S3 bucket that's dedicated to this specific tenant
    this.bucket = new s3.Bucket(this, 'TenantBucket', {
      // Use the tenant's project ID in the bucket name to ensure uniqueness
      bucketName: `${props.projectId}-tenant-bucket`,
      
      // Prevent accidental deletion of the bucket during stack updates
      // This is a safety measure for production data
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      
      // Don't automatically delete objects when the stack is deleted
      autoDeleteObjects: false,
      
      // Configure block public access settings to allow public access via bucket policy
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false
      }),
      
      // Configure Cross-Origin Resource Sharing (CORS) to allow browser-based
      // uploads directly to S3 from the tenant's web application
      cors: [
        {
          // Allow any headers in requests
          allowedHeaders: ['*'],
          
          // Allow these HTTP methods for file operations:
          // GET: Download files
          // PUT: Upload files
          // POST: Multi-part uploads
          // DELETE: Remove files
          // HEAD: Get metadata about files
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          
          // Allow requests from any origin during development
          // SECURITY NOTE: In production, this should be restricted to your specific domains
          allowedOrigins: ['*'],
          
          // Allow browsers to access these response headers from JavaScript
          exposedHeaders: [
            'ETag',                        // For checking file integrity
            'x-amz-server-side-encryption', // For confirming encryption status
            'x-amz-request-id',            // For troubleshooting
            'x-amz-id-2'                  // For troubleshooting
          ],
          
          // Cache the CORS response for 50 minutes (3000 seconds)
          // This reduces the number of preflight requests
          maxAge: 3000
        }
      ]
    });

    // Create a bucket policy to allow public read access to the 'public/' folder
    const bucketPolicy = new s3.BucketPolicy(this, 'BucketPolicy', {
      bucket: this.bucket,
    });

    // Add policy statement that allows anyone to read objects in the 'public/' folder
    bucketPolicy.document.addStatements(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [`${this.bucket.bucketArn}/public/*`],
        principals: [new iam.AnyPrincipal()],
      })
    );

    // Save the public folder URL for easy reference
    this.publicFolderUrl = `https://${this.bucket.bucketRegionalDomainName}/public/`;

    // Export the bucket name and public folder URL as CloudFormation outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'The name of the S3 bucket',
    });

    new cdk.CfnOutput(this, 'PublicFolderUrl', {
      value: this.publicFolderUrl,
      description: 'Base URL for publicly accessible files',
    });
  }
}