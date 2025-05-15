
import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

// Custom hook to use socket
export const useSocket = (): SocketContextType => useContext(SocketContext);

// Props for provider
interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);
  const accessToken = token?.access_token;

  useEffect(() => {
    // Skip if no accessToken is available
    if (!accessToken) {
      console.log('No accessToken available, skipping socket connection');
      return;
    }

    // Connect to socket server with access_token in headers
    socketRef.current = io('https://t1wfswdh-3001.inc1.devtunnels.ms/', {
      auth: {
        access_token: accessToken, // Use auth object for cleaner token passing
      },
      transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
    });

    console.log('Socket initialized with access_token');

    const socket = socketRef.current;

    // Setup event listeners
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    // Cleanup on unmount or when accessToken changes
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log('Socket disconnected and cleaned up');
      }
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};