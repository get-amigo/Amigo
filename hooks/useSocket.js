import { API_URL } from '@env';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (eventName, listener) => {
    const socket = useRef(null);

    useEffect(() => {
        socket.current = io(API_URL, {
            transports: ['websocket'],
        });

        socket.current.on('error', (err) => {
            console.error('SOCKET ERROR: ', err);
        });

        const eventListener = (data) => {
            if (listener && typeof listener === 'function') {
                listener(data);
            }
        };

        if (eventName) {
            socket.current.on(eventName, eventListener);
        }

        return () => {
            if (socket.current) {
                socket.current.off(eventName, eventListener);
                socket.current.disconnect();
            }
        };
    }, []);

    return socket;
};

export default useSocket;
