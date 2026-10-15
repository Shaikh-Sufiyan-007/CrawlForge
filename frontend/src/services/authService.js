import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const authService = {

  login: async (username, password) => {
    const response = await authApi.post('/auth/login', { username, password });
    return response.data;
  },


  signup: async (username, email, password) => {
    const response = await authApi.post('/auth/signup', { username, email, password });
    return response.data;
  },


  logout: async (token) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await authApi.post('/auth/logout', {}, { headers });
    } catch (err) {
      console.warn('Backend logout call failed or backend unreachable:', err);
    }
  },


  getCurrentUser: async (token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await authApi.get('/auth/me', { headers });
    return response.data;
  },


  checkStatus: async (token) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await authApi.get('/auth/status', { headers });
      return response.data;
    } catch {
      return { authenticated: false };
    }
  },
};

export default authService;
