import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = header.split(' ')[1];

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
        req.userId = payload.userId;
        req.userEmail = payload.email;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
