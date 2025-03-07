/**
 * Event Routes
 * 
 * This module defines API routes related to event management functionality.
 * It maps HTTP endpoints to their corresponding controller methods.
 * 
 * Available Routes:
 * - GET /events/:eventId: Retrieves details for a specific event
 * 
 * These routes are mounted under the /api base path in the main application,
 * resulting in complete paths like: /api/events/123
 * 
 * Implementation Details:
 * - Uses Express Router for route definitions
 * - Routes are modular and can be mounted at any base path
 * - Each route is connected to a specific controller method
 * - Controller separation ensures proper separation of concerns
 */

import express from 'express';
import { EventController } from '../controllers/eventController';

const router = express.Router();

/**
 * API Route: Get Event Details
 * 
 * Endpoint: GET /api/events/:eventId
 * 
 * Path Parameters:
 * - eventId: The numeric identifier of the event to retrieve
 * 
 * Responses:
 * - 200 OK: Returns the event details
 * - 400 Bad Request: Invalid event ID format
 * - 404 Not Found: Event not found
 * - 500 Server Error: Unexpected server error
 */
router.get('/events/:eventId', EventController.getEvent);

export default router;