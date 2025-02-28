import { Request, Response, NextFunction } from 'express';
import { logTransaction } from '../services/logService';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Capture response body
    const originalJson = res.json;
    res.json = function (body) {
        res.locals.responseBody = body; // Store response body
        originalJson.call(this, body);
        return res;
    };

    res.on('finish', async () => {
        const executionTimeMs = Date.now() - startTime;
        await logTransaction(req, res, executionTimeMs);
    });

    next();
}
