/**
 * Express Application Setup
 * 
 * This is the main Express application configuration file that sets up middleware,
 * routes, and error handling for the API Gateway. It serves as the central point
 * for assembling all components of the application.
 * 
 * Key Components:
 * - Middleware Configuration: Applies global middleware for all requests
 * - Route Registration: Mounts all API routes under their respective paths
 * - Root Endpoint: Provides a simple health check endpoint
 * - Error Handling: Manages 404 responses for undefined routes
 * 
 * Features:
 * - CORS Support: Enables cross-origin resource sharing
 * - JSON Parsing: Automatically parses JSON request bodies
 * - Request Logging: Logs all requests using the custom logger middleware
 * - Modular Routes: Separates routes by functionality domain
 * 
 * This file is imported by lambda.ts for AWS Lambda deployment and can also
 * be used directly for local development with a traditional server.
 */

import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger';
import snsRoutes from './routes/snsRoutes';
import emailRoutes from './routes/emailRoutes';
import eventRoutes from './routes/eventRoutes';
import mapRoutes from './routes/mapRoutes'; // Add import for map routes

// Initialize Express application
const app = express();

// Apply global middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(requestLogger); // Log all requests

// Define root endpoint for health checks
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// Mount domain-specific route modules
app.use('/api', emailRoutes);
app.use('/api', snsRoutes);
app.use('/api', eventRoutes);
app.use('/api/maps', mapRoutes); // Mount map routes under /api/maps

// Handle 404 errors for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;