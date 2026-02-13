import { Server as SocketServer } from 'socket.io';
import { AuthSocket } from './index';
import { applyOp, getSnapshot } from '../services/sync.service';
import { assertAccess, assertEditAccess } from '../services/document.service';

const presenceMap = new Map<
    string,
    Map<string, { userId: string; displayName: string; cursor?: { line: number; ch: number } }>
>();

export function registerDocumentHandlers(io: SocketServer, socket: AuthSocket) {
    const userId = socket.userId!;
    const displayName = socket.displayName || 'Anonymous';

    socket.on('join-document', async (data: { documentId: string }) => {
        try {
            await assertAccess(data.documentId, userId);
        } catch {
            socket.emit('error', { message: 'Access denied' });
            return;
        }

        const room = `doc:${data.documentId}`;
        socket.join(room);

        if (!presenceMap.has(data.documentId)) {
            presenceMap.set(data.documentId, new Map());
        }
        presenceMap.get(data.documentId)!.set(socket.id, { userId, displayName });

        try {
            const snapshot = await getSnapshot(data.documentId);
            socket.emit('resync', snapshot);
        } catch {
            socket.emit('error', { message: 'Failed to load document' });
            return;
        }

        socket.to(room).emit('user-joined', { documentId: data.documentId, userId, displayName });

        const users = Array.from(presenceMap.get(data.documentId)!.values());
        socket.emit('presence-list', { documentId: data.documentId, users });
    });

    socket.on('leave-document', (data: { documentId: string }) => {
        const room = `doc:${data.documentId}`;
        socket.leave(room);

        presenceMap.get(data.documentId)?.delete(socket.id);
        socket.to(room).emit('user-left', { documentId: data.documentId, userId });
    });

    socket.on(
        'send-op',
        async (data: { documentId: string; baseVersion: number; content: string }) => {
            try {
                await assertEditAccess(data.documentId, userId);
            } catch {
                socket.emit('op-rejected', {
                    documentId: data.documentId,
                    reason: 'Insufficient permissions',
                });
                return;
            }

            try {
                const result = await applyOp({
                    documentId: data.documentId,
                    userId,
                    baseVersion: data.baseVersion,
                    content: data.content,
                });

                if (result.accepted) {
                    io.to(`doc:${data.documentId}`).emit('op-applied', {
                        documentId: data.documentId,
                        version: result.version,
                        content: result.content,
                        userId,
                    });
                } else {
                    socket.emit('resync', {
                        documentId: data.documentId,
                        version: result.version,
                        content: result.content,
                    });
                }
            } catch (err) {
                socket.emit('op-rejected', {
                    documentId: data.documentId,
                    reason: 'Failed to apply operation',
                });
            }
        }
    );

    socket.on('cursor-update', (data: { documentId: string; cursor: { line: number; ch: number } }) => {
        const room = `doc:${data.documentId}`;

        const docPresence = presenceMap.get(data.documentId);
        if (docPresence && docPresence.has(socket.id)) {
            const entry = docPresence.get(socket.id)!;
            entry.cursor = data.cursor;
        }

        socket.to(room).emit('cursor-moved', {
            documentId: data.documentId,
            userId,
            displayName,
            cursor: data.cursor,
        });
    });

    socket.on('presence-heartbeat', (data: { documentId: string }) => {
        const docPresence = presenceMap.get(data.documentId);
        if (docPresence && !docPresence.has(socket.id)) {
            docPresence.set(socket.id, { userId, displayName });
            const room = `doc:${data.documentId}`;
            socket.to(room).emit('user-joined', { documentId: data.documentId, userId, displayName });
        }
    });

    socket.on('disconnect', () => {
        for (const [documentId, docPresence] of presenceMap.entries()) {
            if (docPresence.has(socket.id)) {
                docPresence.delete(socket.id);
                io.to(`doc:${documentId}`).emit('user-left', { documentId, userId });

                if (docPresence.size === 0) {
                    presenceMap.delete(documentId);
                }
            }
        }
    });
}
