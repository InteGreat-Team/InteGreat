import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export interface AuthStackProps extends cdk.StackProps {
  projectId: string;
}

/**
 * AUTHENTICATION STACK
 * ===================
 * 
 * This stack creates a Cognito Identity Pool that serves as a bridge between
 * Firebase Authentication and AWS IAM.
 * 
 * How the authentication flow works:
 * 
 * 1. Users sign in through Firebase Authentication in the frontend application
 * 2. The app requests a JWT token from Firebase
 * 3. This token is passed to Cognito Identity Pool via AWS SDK
 * 4. Cognito verifies the token with the Firebase OIDC provider
 * 5. If valid, Cognito issues temporary AWS credentials
 * 6. These credentials allow the frontend to directly access the tenant's S3 bucket
 * 
 * This enables secure, direct-to-S3 operations without a custom backend.
 */
export class AuthStack extends cdk.Stack {
  public readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    // Create a Cognito Identity Pool for this specific tenant
    // This identity pool will only trust tokens from this tenant's Firebase project
    this.identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      // Each tenant gets their own named identity pool
      identityPoolName: `${props.projectId}-identity-pool`,
      
      // We don't allow unauthenticated access - users must be signed in
      allowUnauthenticatedIdentities: false,
      
      // Connect to Firebase Auth as an OpenID Connect provider
      // The ARN references a pre-created IAM OIDC provider that trusts
      // Firebase's secure token service for this specific project
      openIdConnectProviderArns: [
        `arn:aws:iam::${this.account}:oidc-provider/securetoken.google.com/${props.projectId}`
      ],
      
      // We don't use any social login providers directly through Cognito
      // All authentication happens through Firebase
      supportedLoginProviders: {}
    });
  }
}