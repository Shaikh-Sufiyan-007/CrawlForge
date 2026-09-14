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

export const crawlService = {
  // Check backend health/connectivity
  checkHealth: async () => {
    try {
      await api.get('/crawls', { timeout: 3000 });
      return true;
    } catch {
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

