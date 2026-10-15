import axios from 'axios';

// Use /api by default which Vite dev server proxies to http://localhost:8080/api,
// or use environment variable if explicitly configured.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crawlforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: dispatch session expiration event on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(
        new CustomEvent('crawlforge:session-expired', {
          detail: error.response?.data?.error || 'Your session has expired. Please log in again.',
        })
      );
    }
    return Promise.reject(error);
  }
);

export const crawlService = {
  // Check backend health/connectivity
  checkHealth: async () => {
    try {
      await api.get('/auth/status', { timeout: 3000 });
      return true;
    } catch (err) {
      if (err.response) return true;
      return false;
    }
  },

  // Start a new crawl job
  startCrawl: async (url, maxPages) => {
    const response = await api.post('/crawls', { url, maxPages });
    return response.data;
  },

  // Get previous crawls
  getAllCrawls: async () => {
    const response = await api.get('/crawls');
    return response.data;
  },

  // Get single crawl details
  getCrawl: async (id) => {
    const response = await api.get(`/crawls/${id}`);
    return response.data;
  },

  // Get live crawl progress from Redis
  getCrawlProgress: async (id) => {
    const response = await api.get(`/crawls/${id}/progress`);
    return response.data;
  },

  // Stop an active crawl
  stopCrawl: async (id) => {
    const response = await api.post(`/crawls/${id}/stop`);
    return response.data;
  },

  // Get crawled pages for a crawl
  getCrawlPages: async (id) => {
    const response = await api.get(`/crawls/${id}/pages`);
    return response.data;
  },

  // Get site graph nodes and edges
  getCrawlGraph: async (id) => {
    const response = await api.get(`/crawls/${id}/graph`);
    return response.data;
  },
};

export default crawlService;

