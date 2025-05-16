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
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from env.json file
const envPath = path.join(__dirname, '../env.json');
const envConfig = JSON.parse(fs.readFileSync(envPath, 'utf8'));

// Define environment variables with defaults
const env = {
  NEON_DB_URL: envConfig.Parameters.NEON_DB_URL || '',
  PHIL_SMS_API_URL: envConfig.Parameters.PHIL_SMS_API_URL || '',
  PHIL_SMS_API_KEY: envConfig.Parameters.PHIL_SMS_API_KEY || '',
  SES_SENDER_EMAIL: envConfig.Parameters.SES_SENDER_EMAIL || '',
  GOOGLE_MAPS_API_KEY: envConfig.Parameters.GOOGLE_MAPS_API_KEY || '',
  PAYMONGO_SECRET_KEY: envConfig.Parameters.PAYMONGO_SECRET_KEY || ''
};

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the Lambda functions
    const smsFunction = new lambda.Function(this, 'SmsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../.aws-sam/build/SmsFunction')),
      environment: {
        NODE_ENV: 'production',
        PHIL_SMS_API_URL: env.PHIL_SMS_API_URL,
        PHIL_SMS_API_KEY: env.PHIL_SMS_API_KEY,
        NEON_DB_URL: env.NEON_DB_URL,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      memorySize: 512, 
      timeout: cdk.Duration.seconds(30),
      retryAttempts: 2,
    });

    const emailFunction = new lambda.Function(this, 'EmailFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../.aws-sam/build/EmailFunction')),
      environment: {
        NODE_ENV: 'production',
        SES_SENDER_EMAIL: env.SES_SENDER_EMAIL,
        NEON_DB_URL: env.NEON_DB_URL,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      memorySize: 512, 
      timeout: cdk.Duration.seconds(30),
      retryAttempts: 2, 
    });

    const routesFunction = new lambda.Function(this, 'RoutesFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../.aws-sam/build/RoutesFunction')),
      environment: {
        NODE_ENV: 'production',
        GOOGLE_MAPS_API_KEY: env.GOOGLE_MAPS_API_KEY,
        NEON_DB_URL: env.NEON_DB_URL,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      memorySize: 512, 
      timeout: cdk.Duration.seconds(30),
      retryAttempts: 2,
    });

    const geocodeFunction = new lambda.Function(this, 'GeocodeFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../.aws-sam/build/GeolocationFunction')),
      environment: {
        NODE_ENV: 'production',
        GOOGLE_MAPS_API_KEY: env.GOOGLE_MAPS_API_KEY,
        NEON_DB_URL: env.NEON_DB_URL,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      memorySize: 256,
      timeout: cdk.Duration.seconds(15),
      retryAttempts: 2,
    });

    const reverseGeocodeFunction = new lambda.Function(this, 'ReverseGeocodeFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../.aws-sam/build/ReverseGeocodeFunction')),
      environment: {
        NODE_ENV: 'production',
        GOOGLE_MAPS_API_KEY: env.GOOGLE_MAPS_API_KEY,
        NEON_DB_URL: env.NEON_DB_URL,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      memorySize: 256,
      timeout: cdk.Duration.seconds(15),
      retryAttempts: 2,
    });

    const placesFunction = new lambda.Function(this, 'PlacesFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../.aws-sam/build/PlacesFunction')),
      environment: {
        NODE_ENV: 'production',
        GOOGLE_MAPS_API_KEY: env.GOOGLE_MAPS_API_KEY,
        NEON_DB_URL: env.NEON_DB_URL,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      retryAttempts: 2,
    });

    const paymentFunction = new lambda.Function(this, 'PaymentFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../.aws-sam/build/PaymentFunction')),
      environment: {
        NODE_ENV: 'production',
        NEON_DB_URL: env.NEON_DB_URL,
        PAYMONGO_SECRET_KEY: env.PAYMONGO_SECRET_KEY,
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

    // Create CloudWatch logging role for API Gateway
    const apiGatewayLoggingRole = new iam.Role(this, 'ApiGatewayCloudWatchRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')
      ]
    });

    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'ApiGateway', {
      restApiName: 'Integreat API',
      description: 'API Gateway for Integreat application',
      deployOptions: {
        stageName: 'prod',
        metricsEnabled: true,
        throttlingBurstLimit: 100,
        throttlingRateLimit: 100
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent'
        ],
        allowCredentials: true,
        maxAge: cdk.Duration.days(1)
      },
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.NONE,
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Credentials': true
            }
          },
          {
            statusCode: '400',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Credentials': true
            }
          },
          {
            statusCode: '500',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Credentials': true
            }
          }
        ]
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
    const geolocation = api.root.addResource('geolocation');
    const geocode = geolocation.addResource('geocode');
    geocode.addMethod('GET', new apigateway.LambdaIntegration(geocodeFunction), {
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

    // 2. Reverse Geocode endpoint
    const reverseGeocode = geolocation.addResource('reverse-geocode');
    reverseGeocode.addMethod('GET', new apigateway.LambdaIntegration(reverseGeocodeFunction), {
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

    // 3. Routes endpoint
    const routes = geolocation.addResource('routes');
    routes.addMethod('GET', new apigateway.LambdaIntegration(routesFunction), {
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

    // 4. Places endpoint
    const places = geolocation.addResource('places');
    places.addMethod('POST', new apigateway.LambdaIntegration(placesFunction), {
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

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'ApiDistribution', {
      defaultBehavior: {
        origin: new origins.RestApiOrigin(api),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe edge locations
      enableLogging: true,
      logIncludesCookies: true,
      geoRestriction: cloudfront.GeoRestriction.allowlist('US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'JP', 'AU', 'SG', 'PH'),
    });

    // Output the CloudFront distribution URL
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'The domain name of the CloudFront distribution',
    });

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'The URL of the API Gateway',
    });
  }
}