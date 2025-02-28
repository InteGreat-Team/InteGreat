import express, { Request, Response } from 'express';
import { getEventDetails } from '../services/eventService';

const router = express.Router();

/**
 * API Route: Fetch Event Details
 * GET /events/:eventId
 */
router.get('/:eventId', async (req: Request<{ eventId: string }>, res: Response) => {
    const eventId = parseInt(req.params.eventId, 10);

    if (isNaN(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await getEventDetails(eventId);

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    return res.json(event);
});

export default router;
