/**
 * API Stack
 * 
 * This stack defines the core API infrastructure for the InteGreat platform.
 * It sets up the API Gateway and Lambda functions for handling various services.
 * 
 * Key Components:
 * - API Gateway: Provides RESTful endpoints for the platform
 * - Lambda Functions: Handle business logic for different services
 * - IAM Roles: Manage permissions for AWS services
 * 
 * Features:
 * - Email Service: Handles email notifications via AWS SES
 * - SMS Service: Manages SMS notifications via PHIL SMS API
 * - Environment Configuration: Sets up necessary environment variables
 * - Security: Implements proper IAM roles and permissions
 * 
 * This stack serves as the main entry point for API requests,
 * routing them to appropriate Lambda functions for processing.
 */

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the Lambda functions
    const smsFunction = new lambda.Function(this, 'SmsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'functions/handlers/smsHandler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: {
        NODE_ENV: 'production',
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_KEY: process.env.SUPABASE_KEY || '',
        PHIL_SMS_API_URL: process.env.PHIL_SMS_API_URL || '',
        PHIL_SMS_API_KEY: process.env.PHIL_SMS_API_KEY || '',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      },
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
    });

    const emailFunction = new lambda.Function(this, 'EmailFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'functions/handlers/emailHandler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: {
        NODE_ENV: 'production',
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_KEY: process.env.SUPABASE_KEY || '',
        SES_SENDER_EMAIL: process.env.SES_SENDER_EMAIL || '',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      },
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
    });

    const geolocationFunction = new lambda.Function(this, 'GeolocationFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'functions/handlers/geolocationHandler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: {
        NODE_ENV: 'production',
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_KEY: process.env.SUPABASE_KEY || '',
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      },
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
    });

    const paymentFunction = new lambda.Function(this, 'PaymentFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'functions/handlers/paymentHandler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: {
        NODE_ENV: 'production',
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_KEY: process.env.SUPABASE_KEY || '',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      },
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
    });

    // Add SES permissions to the email function
    emailFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ses:SendEmail',
        'ses:SendRawEmail'
      ],
      resources: ['*']
    }));

    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'ApiGateway', {
      restApiName: 'Integreat API',
      description: 'API Gateway for Integreat application',
      deployOptions: {
        stageName: 'prod',
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.OFF,
        dataTraceEnabled: false,
        throttlingBurstLimit: 100,
        throttlingRateLimit: 100
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.NONE
      }
    });

    // Add the email endpoint
    const email = api.root.addResource('email');
    const emailSend = email.addResource('send');
    emailSend.addMethod('POST', new apigateway.LambdaIntegration(emailFunction), {
      authorizationType: apigateway.AuthorizationType.NONE,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        }
      ]
    });

    // Add the SMS endpoint
    const sms = api.root.addResource('sms');
    const smsSend = sms.addResource('send');
    smsSend.addMethod('POST', new apigateway.LambdaIntegration(smsFunction), {
      authorizationType: apigateway.AuthorizationType.NONE,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        }
      ]
    });

    // Add the geolocation endpoint
    const maps = api.root.addResource('maps');
    const geocode = maps.addResource('geocode');
    geocode.addMethod('GET', new apigateway.LambdaIntegration(geolocationFunction), {
      authorizationType: apigateway.AuthorizationType.NONE,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        }
      ]
    });

    // Add the payment endpoint
    const payment = api.root.addResource('payment');
    const createPayment = payment.addResource('create');
    createPayment.addMethod('POST', new apigateway.LambdaIntegration(paymentFunction), {
      authorizationType: apigateway.AuthorizationType.NONE,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
          }
        }
      ]
    });

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'The URL of the API Gateway',
    });
  }
}