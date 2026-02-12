import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { registerUser, loginUser, getUserById } from '../services/auth.service';

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await loginUser(req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const user = await getUserById(req.userId!);
        res.json(user);
    } catch (err) {
        next(err);
    }
}
