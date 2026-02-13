import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface AuthSocket extends Socket {
    userId?: string;
    userEmail?: string;
    displayName?: string;
}

export function setupSocketAuth(io: SocketServer) {
    io.use(async (socket: AuthSocket, next) => {
        const token = socket.handshake.auth.token as string | undefined;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const payload = jwt.verify(token, env.JWT_SECRET) as {
                userId: string;
                email: string;
            };
            socket.userId = payload.userId;
            socket.userEmail = payload.email;


            const db = (await import('../config/db')).default;
            const user = await db('users').where({ id: payload.userId }).first();
            socket.displayName = user?.display_name || payload.email;

            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });
}

export type { AuthSocket };
