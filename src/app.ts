/**
 * Express Application Setup
 * 
 * This file contains the core Express application configuration that powers our API.
 * It sets up middleware, defines routes, and configures error handling.
 * 
 * Key Components:
 * - Middleware Configuration: CORS, JSON parsing, and request logging
 * - Route Definitions: API endpoints organized by feature
 * - Error Handling: Centralized 404 and error responses
 * 
 * This Express app is designed to work both:
 * - Locally with the Express server for development
 * - In AWS Lambda when wrapped with serverless-http
 * 
 * The application structure follows a modular approach where routes, controllers,
 * and services are separated for better maintainability and testing.
 */
import express from 'express';
import cors from 'cors';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is running',
  });
});

// TODO: Import your routes
// import { router as exampleRouter } from './routes/example';
// app.use('/api/example', exampleRouter);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
  });
});

export default app;