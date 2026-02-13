import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import versionRoutes from './routes/version.routes';
import memberRoutes from './routes/member.routes';
import { setupSocketAuth, AuthSocket } from './socket/index';
import { registerDocumentHandlers } from './socket/documentHandler';

const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
    cors: {
        origin: env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
    },
});

setupSocketAuth(io);

io.on('connection', (socket) => {
    console.log(`Socket connected: ${(socket as AuthSocket).userId}`);
    registerDocumentHandlers(io, socket as AuthSocket);
});

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Too many requests, please try again later' },
});

const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/documents', generalLimiter, documentRoutes);
app.use('/api/documents/:id/versions', generalLimiter, versionRoutes);
app.use('/api/documents/:id/members', generalLimiter, memberRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = parseInt(env.PORT, 10);
server.listen(PORT, () => {
    console.log(`RTCE server running on port ${PORT}`);
});

export { app, server, io };
