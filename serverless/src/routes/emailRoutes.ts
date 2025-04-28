/**
 * Email Routes
 * 
 * This module defines API routes related to email functionality.
 * It maps HTTP endpoints to their corresponding controller methods.
 * 
 * Available Routes:
 * - POST /send-email: Sends event details to a specified email address
 * 
 * These routes are mounted under the /api base path in the main application,
 * resulting in complete paths like: /api/send-email
 * 
 * Implementation Details:
 * - Uses Express Router for route definitions
 * - Routes are modular and can be mounted at any base path
 * - Each route is connected to a specific controller method
 * - Controller separation ensures proper separation of concerns
 */

import express from 'express';
import { EmailController } from '../controllers/emailController';

const router = express.Router();

/**
 * API Route: Send Event Details via Email
 * 
 * Endpoint: POST /api/send-email
 * 
 * Request Body:
 * {
 *   "eventId": number,      // ID of the event to send
 *   "recipientEmail": string // Email address of the recipient
 * }
 * 
 * Responses:
 * - 200 OK: Email sent successfully
 * - 400 Bad Request: Missing required fields
 * - 404 Not Found: Event not found
 * - 500 Server Error: Failed to send email
 */
router.post('/send-email', EmailController.sendEmail);

export default router;