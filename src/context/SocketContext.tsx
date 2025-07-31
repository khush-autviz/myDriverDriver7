// import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useAuthStore } from '../store/authStore';
// import axios from 'axios';

// type SocketContextType = Socket | null;

// const SocketContext = createContext<SocketContextType>(null);

// export const useSocket = (): SocketContextType => useContext(SocketContext);

// interface SocketProviderProps {
//   children: ReactNode;
// }

// export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
//   const [socket, setSocket] = useState<SocketContextType>(null);
//   const {token, setToken} = useAuthStore()
//   const accessToken = token?.access_token;

//   const refreshingToken = async () => {
//     console.log('refreshing token', token?.refresh_token);

//     try {
      
//     const response = await axios.post(
//       'https://t1wfswdh-3000.inc1.devtunnels.ms/auth/refresh-token',
//       { refresh_token: token?.refresh_token }
//     );

//     console.log('refreshing token', response);
    

//     if (response.data) {
//       console.log('jo2');
      
//       setToken(response.data.token)
//       const newSocket = io('https://t1wfswdh-3000.inc1.devtunnels.ms/', {
//         auth: {
//           access_token: response.data.token.access_token,
//         },
//         transports: ['websocket', 'polling'],
//       });

//       setSocket(newSocket);
//     }
//   } catch (error) {
//    console.log('error',error);
      
//   }
//   };

//   useEffect(() => {
//     if (!accessToken) {
//       console.log('No accessToken available, skipping socket connection');
//       return;
//     }

//     const newSocket = io('https://t1wfswdh-3000.inc1.devtunnels.ms/', {
//       auth: {
//         access_token: accessToken,
//       },
//       transports: ['websocket', 'polling'],
//     });

//     setSocket(newSocket);

//     newSocket.on('connect', () => {
//       console.log('Socket connected with ID:', newSocket.id);
//     });

//     newSocket.on('connect_error', (error) => {
//       console.error('Socket connection error:', error.message);

//       if (error.message.includes('Authentication invalid')) {
//         console.log('Token appears to be expired, attempting to refresh');
//         // refreshingToken()
//         // Implement token refresh logic here
//       }

//     });

//     newSocket.on('error', (error) => {
//       console.error('Socket error:', error);
//     });

//     newSocket.on('disconnect', (reason) => {
//       console.log('Socket disconnected:', reason);
//     });

//     return () => {
//       newSocket.disconnect();
//       setSocket(null);
//       console.log('Socket disconnected and cleaned up');
//     };
//   }, [accessToken]);

//   return (
//     <SocketContext.Provider value={socket}>
//       {children}
//     </SocketContext.Provider>
//   );
// };




import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

export const useSocket = (): SocketContextType => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<SocketContextType>(null);
  const token = useAuthStore((state) => state.token);
  const accessToken = token?.access_token;
  const Driver = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!accessToken) {
      console.log('No accessToken available, skipping socket connection');
      return;
    }

    const newSocket = io('https://api.mydriversa.co.za', {
      auth: {
        access_token: accessToken,
      },
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected with ID:', newSocket.id);
    });


    newSocket.on(`driver_${Driver?.id}`, (error) => {
      console.error('Driver Id error', error.message);
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      console.log('Socket disconnected and cleaned up');
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};