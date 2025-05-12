import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { AuthStack } from './auth-stack';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export interface IamStackProps extends cdk.StackProps {
  authStack: AuthStack;
  projectId: string;
  bucketArn: string;
}

/**
 * IAM STACK
 * ========
 * 
 * This stack creates the IAM role and permissions that authenticated users will assume.
 * It connects the authentication system (Cognito Identity Pool) to the permissions
 * needed to access S3.
 * 
 * The key security principles implemented here:
 * 
 * 1. Least privilege: Users only get the minimum permissions they need
 * 2. Resource isolation: Permissions are scoped to only the tenant's own bucket
 * 3. Temporary credentials: No long-lived access keys, only short-term tokens
 * 4. Trust relationship: Only the tenant's identity pool can assume this role
 * 
 * This ensures that even if a user is authenticated, they can only access
 * their own tenant's resources and not those of other tenants.
 */
export class IamStack extends cdk.Stack {
  public readonly tenantUserRole: iam.Role;

  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);

    // Create an IAM role that authenticated users from this tenant will assume
    this.tenantUserRole = new iam.Role(this, 'TenantUserRole', {
      // Configure the trust policy to only allow this tenant's identity pool
      // to assume this role using web identity federation
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          // Restrict to only this tenant's identity pool
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': props.authStack.identityPool.ref
          },
          // Only allow authenticated users (not guest/anonymous)
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated'
          }
        },
        // The action that Cognito is allowed to perform
        'sts:AssumeRoleWithWebIdentity'
      ),
      // Use a consistent naming scheme for the role
      roleName: `${props.projectId}-TenantUserRole`,
    });

    // Define what actions authenticated users can perform on their tenant's bucket
    this.tenantUserRole.addToPolicy(new iam.PolicyStatement({
      // Allow users to:
      // - Upload files (PutObject)
      // - Download files (GetObject)
      // - Delete their own files (DeleteObject)
      // - List the contents of the bucket (ListBucket)
      actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject', 's3:ListBucket'],
      
      // Restrict these permissions to only apply to:
      // 1. The tenant's bucket itself (for ListBucket operations)
      // 2. Objects within that bucket (for object operations)
      resources: [props.bucketArn, `${props.bucketArn}/*`]
    }));

    // Connect this role to the Cognito Identity Pool
    // This tells Cognito to issue credentials for this role when users authenticate
    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      // Link to the tenant's identity pool
      identityPoolId: props.authStack.identityPool.ref,
      
      // Map authenticated users to the tenant user role
      roles: {
        authenticated: this.tenantUserRole.roleArn
      }
      // We're using a simplified role structure with just one role for all users
      // More complex applications could use role mapping to assign different
      // roles based on user claims from Firebase
    });
  }
}