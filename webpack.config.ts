/**
 * Webpack Configuration for Serverless TypeScript Project
 * 
 * This file configures webpack to bundle our TypeScript application for AWS Lambda deployment.
 * It works in conjunction with the Serverless Framework to optimize the deployment package.
 *
 * Key Features:
 * - Transpiles TypeScript to JavaScript
 * - Generates source maps for easier debugging in production
 * - Excludes node_modules from the bundle to reduce size (uses externals)
 * - Sets proper target for Node.js environment
 * - Configures different modes for development and production
 *
 * The configuration supports:
 * - Local development through serverless-offline plugin
 * - Production deployment to AWS Lambda
 * - Source maps for debugging in both environments
 * 
 * This webpack setup keeps Lambda deployment packages small and efficient
 * while preserving a good developer experience with source maps and quick builds.
 */

import path from 'path';
import webpack from 'webpack';
import slsw from 'serverless-webpack';
import nodeExternals from 'webpack-node-externals';

const config: webpack.Configuration = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  externals: [nodeExternals()],
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};

export default config;