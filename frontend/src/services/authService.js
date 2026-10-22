import apiClient from './apiClient';

export const authService = {
  login: async (username, password, options = {}) => {
    const response = await apiClient.post('/auth/login', { username, password }, {
      signal: options.signal,
    });
    return response.data;
  },

  signup: async (username, email, password, options = {}) => {
    const response = await apiClient.post('/auth/signup', { username, email, password }, {
      signal: options.signal,
    });
    return response.data;
  },

  logout: async (token, options = {}) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await apiClient.post('/auth/logout', {}, { headers, signal: options.signal });
    } catch (err) {
      console.warn('Backend logout call failed or backend unreachable:', err);
    }
  },

  getCurrentUser: async (token, options = {}) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await apiClient.get('/auth/me', { headers, signal: options.signal });
    return response.data;
  },

  checkStatus: async (token, options = {}) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.get('/auth/status', {
        headers,
        signal: options.signal,
        __maxRetries: 2,
      });
      return response.data;
    } catch {
      return { authenticated: false };
    }
  },
};

export default authService;
