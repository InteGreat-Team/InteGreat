/**
 * SMS Routes
 * 
 * This module defines API routes related to SMS notifications using PHIL SMS.
 * It maps HTTP endpoints to their corresponding controller methods.
 * 
 * Available Routes:
 * - POST /send-notification: Sends event details to a specified phone number via SMS
 * 
 * These routes are mounted under the /api base path in the main application,
 * resulting in complete paths like: /api/send-notification
 * 
 * Implementation Details:
 * - Uses Express Router for route definitions
 * - Routes are modular and can be mounted at any base path
 * - Each route is connected to a specific controller method
 * - Controller separation ensures proper separation of concerns
 */

import express from "express";
import { SNSController } from "../controllers/snsController";

const router = express.Router();

/**
 * API Route: Send Event Details via SMS
 * 
 * Endpoint: POST /api/send-notification
 * 
 * Request Body:
 * {
 *   "eventId": number,       // ID of the event to send
 *   "recipientPhone": string // Phone number of the recipient
 * }
 * 
 * Responses:
 * - 200 OK: Notification sent successfully
 * - 400 Bad Request: Missing required fields
 * - 404 Not Found: Event not found
 * - 500 Server Error: Failed to send notification
 */
router.post("/send-notification", SNSController.sendNotification);

export default router; 