import type { Request, Response, NextFunction } from 'express';

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
    const secret = process.env.API_KEY;
    if (!secret) {
        // Fail open only if the env var was never set (local dev without config).
        next();
        return;
    }
    const provided = req.headers['x-api-key'];
    if (provided !== secret) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
}
