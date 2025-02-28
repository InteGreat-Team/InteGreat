import express, { Request, Response } from 'express';
import { getEventDetails } from '../services/eventService';
import { sendEventEmail } from '../services/emailService';

const router = express.Router();

/**
 * API Route: Send Event Details via Email
 * POST /send-email
 */
router.post('/', async (req: Request, res: Response) => {
    const { eventId, recipientEmail } = req.body;

    if (!eventId || !recipientEmail) {
        return res.status(400).json({ error: 'eventId and recipientEmail are required' });
    }

    const event = await getEventDetails(eventId);

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    const emailSent = await sendEventEmail(event, recipientEmail);

    if (!emailSent) {
        return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.json({ message: 'Email sent successfully' });
});

export default router;
