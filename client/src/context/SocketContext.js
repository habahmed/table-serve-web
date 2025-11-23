import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

// -----------------------------------------------------------------------------
// IMPORTANT: Replace this with the IP and port of your backend server (3001)
// -----------------------------------------------------------------------------
// The backend is running on http://10.44.233.46:3001
const SOCKET_SERVER_URL = 'http://10.44.233.46:3001'; 

// 1. Create the Socket Context
const SocketContext = createContext();

// Hook for accessing the socket
export const useSocket = () => useContext(SocketContext);

// Initialize the socket outside of the component to prevent re-initialization
// The client will automatically attempt to reconnect if the connection is lost.
const socket = io(SOCKET_SERVER_URL, {
    // Optional: add transport options if needed, but default is fine
    transports: ['websocket', 'polling'] 
});


// 2. Create the Socket Provider Component
export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        // --- Connection Handlers ---
        socket.on('connect', () => {
            setIsConnected(true);
            console.log('[Socket.IO] Connected to server.');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('[Socket.IO] Disconnected from server.');
        });
        
        // --- Central Real-Time Listeners (Example) ---
        // Any general, app-wide events can be handled here.
        // For component-specific listeners (like KOT status), use the useSocket() hook in that component.
        
        socket.on('serverMessage', (message) => {
            console.log('[Socket.IO Server Message]:', message);
        });

        // Cleanup function
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('serverMessage');
        };
    }, []);

    const value = {
        socket,
        isConnected,
        // You can add functions here to emit events easily
        emit: (event, data) => socket.emit(event, data),
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};