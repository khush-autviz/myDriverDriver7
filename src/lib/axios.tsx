// lib/axios.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const instance = axios.create({
  timeout: 10000,
  withCredentials: true,
});

// Middleware-style import for Zustand (not reactive)
let token = null;
const authStore = useAuthStore.getState();
token = authStore.token?.access_token;

instance.interceptors.request.use((config) => {
  config.baseURL = 'https://t1wfswdh-3000.inc1.devtunnels.ms'; // change this to your IP address
  // config.baseURL = 'http://3.110.180.116:3000'; // change this to your IP address

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default instance;




// // lib/axios.js
// import axios from 'axios';
// import { useAuthStore } from '../store/authStore';



// const instance = axios.create({
//   timeout: 10000,
//   withCredentials: true,
//   baseURL: 'https://t1wfswdh-3000.inc1.devtunnels.ms/',
// });

// // Middleware-style import for Zustand (not reactive)
// let token = null;
// const authStore = useAuthStore.getState();
// token = authStore.token?.access_token;

// // Add a request interceptor
// instance.interceptors.request.use((config) => {
//   // Get the latest token before each request
//   const currentToken = useAuthStore.getState().token?.access_token;
  
//   if (currentToken) {
//     config.headers.Authorization = `Bearer ${currentToken}`;
//   }
  
//   return config;
// });

// // Add a response interceptor to handle token refresh
// instance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     // If the error is due to an expired token (401) and we haven't tried to refresh yet
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       try {
//         // Get the refresh token
//         const refreshToken = useAuthStore.getState().token?.refresh_token;

//         console.log("refresh token", refreshToken);
        
        
//         if (!refreshToken) {
//           // No refresh token available, redirect to login
//           useAuthStore.getState().logout();
//           return Promise.reject(error);
//         }
        
//         // Call your refresh token endpoint
//         const response = await axios.post(
//           'https://t1wfswdh-3000.inc1.devtunnels.ms/auth/refresh-token',
//           { refreshToken: refreshToken }
//         );
        
//         // Update the tokens in the store
//         if (response.data && response.data.data) {
//           const newTokens = {
//             access_token: response.data.data.access_token,
//             refresh_token: response.data.data.refresh_token || refreshToken
//           };
          
//           useAuthStore.getState().setToken(newTokens);
          
//           // Update the Authorization header with the new token
//           originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          
//           // Retry the original request with the new token
//           return instance(originalRequest);
//         }
//       } catch (refreshError) {
//         console.error('Token refresh failed:', refreshError);
//         // If refresh fails, log the user out
//         useAuthStore.getState().logout();
//         return Promise.reject(refreshError);
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default instance;