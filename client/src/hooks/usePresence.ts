import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { PresenceUser, CursorData } from '../types';

interface UsePresenceOptions {
    socket: Socket | null;
    documentId: string;
}

interface UsePresenceReturn {
    users: PresenceUser[];
    cursors: Map<string, CursorData>;
    sendCursorUpdate: (cursor: { line: number; ch: number }) => void;
}

export function usePresence({ socket, documentId }: UsePresenceOptions): UsePresenceReturn {
    const [users, setUsers] = useState<PresenceUser[]>([]);
    const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
    const throttleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!socket) return;

        const handlePresenceList = (data: { documentId: string; users: PresenceUser[] }) => {
            if (data.documentId === documentId) {
                setUsers(data.users);
            }
        };

        const handleUserJoined = (data: { documentId: string; userId: string; displayName: string }) => {
            if (data.documentId === documentId) {
                setUsers((prev) => {
                    if (prev.some((u) => u.userId === data.userId)) return prev;
                    return [...prev, { userId: data.userId, displayName: data.displayName }];
                });
            }
        };

        const handleUserLeft = (data: { documentId: string; userId: string }) => {
            if (data.documentId === documentId) {
                setUsers((prev) => prev.filter((u) => u.userId !== data.userId));
                setCursors((prev) => {
                    const next = new Map(prev);
                    next.delete(data.userId);
                    return next;
                });
            }
        };

        const handleCursorMoved = (data: CursorData) => {
            if (data.documentId === documentId) {
                setCursors((prev) => {
                    const next = new Map(prev);
                    next.set(data.userId, data);
                    return next;
                });
            }
        };

        socket.on('presence-list', handlePresenceList);
        socket.on('user-joined', handleUserJoined);
        socket.on('user-left', handleUserLeft);
        socket.on('cursor-moved', handleCursorMoved);

        heartbeatInterval.current = setInterval(() => {
            socket.emit('presence-heartbeat', { documentId });
        }, 10000);

        return () => {
            socket.off('presence-list', handlePresenceList);
            socket.off('user-joined', handleUserJoined);
            socket.off('user-left', handleUserLeft);
            socket.off('cursor-moved', handleCursorMoved);

            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
            }
            if (throttleTimer.current) {
                clearTimeout(throttleTimer.current);
            }
        };
    }, [socket, documentId]);

    const sendCursorUpdate = useCallback(
        (cursor: { line: number; ch: number }) => {
            if (throttleTimer.current) return;

            throttleTimer.current = setTimeout(() => {
                throttleTimer.current = null;
            }, 200);

            if (socket && socket.connected) {
                socket.emit('cursor-update', { documentId, cursor });
            }
        },
        [socket, documentId]
    );

    return { users, cursors, sendCursorUpdate };
}
