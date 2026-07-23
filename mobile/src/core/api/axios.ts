import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppConstants from '../../shared/constants/app';

const api = axios.create({
  baseURL: AppConstants.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Every authenticated API request automatically gets the JWT token.
 */
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

/**
 * Common response error handler.
 */
api.interceptors.response.use(
  response => response,
  error => {
    console.log(
      'API Error:',
      error.response?.data ?? error.message,
    );

    return Promise.reject(error);
  },
);

export default api;