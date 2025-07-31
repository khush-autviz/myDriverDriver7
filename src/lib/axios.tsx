

// lib/axios.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const instance = axios.create({
  timeout: 10000,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token?.access_token;

  // config.baseURL = 'https://t1wfswdh-3000.inc1.devtunnels.ms';
  config.baseURL = 'http://3.110.180.116:3000';


  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(token, 'token in interceptor');

  return config;
});

export default instance;
