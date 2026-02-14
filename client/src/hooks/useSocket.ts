import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '../socket/socket';

export function useSocket(): Socket | null {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('rtce_token');
        if (!token) return;

        socketRef.current = getSocket();

        return () => {
        };
    }, []);

    return socketRef.current;
}

export { disconnectSocket };
