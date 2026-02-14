import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';

interface UseDocumentOptions {
    socket: Socket | null;
    documentId: string;
}

interface UseDocumentReturn {
    content: string;
    version: number;
    setLocalContent: (content: string) => void;
    connected: boolean;
}

export function useDocument({ socket, documentId }: UseDocumentOptions): UseDocumentReturn {
    const [content, setContent] = useState('');
    const [version, setVersion] = useState(0);
    const [connected, setConnected] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestContent = useRef('');
    const latestVersion = useRef(0);

    useEffect(() => {
        if (!socket) return;

        socket.emit('join-document', { documentId });
        setConnected(true);

        const handleResync = (data: { documentId: string; version: number; content: string }) => {
            if (data.documentId === documentId) {
                setContent(data.content);
                setVersion(data.version);
                latestContent.current = data.content;
                latestVersion.current = data.version;
            }
        };

        const handleOpApplied = (data: {
            documentId: string;
            version: number;
            content: string;
            userId: string;
        }) => {
            if (data.documentId === documentId) {
                setContent(data.content);
                setVersion(data.version);
                latestContent.current = data.content;
                latestVersion.current = data.version;
            }
        };

        const handleOpRejected = (data: { documentId: string; reason: string }) => {
            console.warn('Op rejected:', data.reason);
        };

        socket.on('resync', handleResync);
        socket.on('op-applied', handleOpApplied);
        socket.on('op-rejected', handleOpRejected);

        const handleReconnect = () => {
            socket.emit('join-document', { documentId });
        };
        socket.on('connect', handleReconnect);

        return () => {
            socket.emit('leave-document', { documentId });
            socket.off('resync', handleResync);
            socket.off('op-applied', handleOpApplied);
            socket.off('op-rejected', handleOpRejected);
            socket.off('connect', handleReconnect);
            setConnected(false);

            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [socket, documentId]);

    const setLocalContent = useCallback(
        (newContent: string) => {
            setContent(newContent);
            latestContent.current = newContent;

            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            debounceTimer.current = setTimeout(() => {
                if (socket && socket.connected) {
                    socket.emit('send-op', {
                        documentId,
                        baseVersion: latestVersion.current,
                        content: latestContent.current,
                    });
                }
            }, 300);
        },
        [socket, documentId]
    );

    return { content, version, setLocalContent, connected };
}
