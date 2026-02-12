import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
    console.error('Unhandled error:', err.message);

    const statusCode = (err as Error & { statusCode?: number }).statusCode || 500;
    const message = statusCode === 500 ? 'Internal server error' : err.message;

    res.status(statusCode).json({ error: message });
}
