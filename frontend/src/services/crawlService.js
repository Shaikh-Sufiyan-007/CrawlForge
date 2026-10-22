import apiClient, { checkHealth as probeHealth } from './apiClient';

export const crawlService = {
  checkHealth: async (signal) => {
    try {
      const result = await probeHealth(signal);
      return result.online;
    } catch {
      return false;
    }
  },

  startCrawl: async (url, maxPages, options = {}) => {
    const response = await apiClient.post(
      '/crawls',
      { url, maxPages },
      { signal: options.signal }
    );
    return response.data;
  },

  getAllCrawls: async (params = {}, options = {}) => {
    const config = {
      params,
      signal: options.signal,
    };
    const response = await apiClient.get('/crawls', config);
    return response.data;
  },

  getCrawl: async (id, options = {}) => {
    const response = await apiClient.get(`/crawls/${id}`, {
      signal: options.signal,
    });
    return response.data;
  },

  getCrawlProgress: async (id, options = {}) => {
    const response = await apiClient.get(`/crawls/${id}/progress`, {
      signal: options.signal,
    });
    return response.data;
  },

  stopCrawl: async (id, options = {}) => {
    const response = await apiClient.post(`/crawls/${id}/stop`, {}, {
      signal: options.signal,
    });
    return response.data;
  },

  getCrawlPages: async (id, params = {}, options = {}) => {
    const config = {
      params,
      signal: options.signal,
    };
    const response = await apiClient.get(`/crawls/${id}/pages`, config);
    return response.data;
  },

  getCrawlGraph: async (id, options = {}) => {
    const response = await apiClient.get(`/crawls/${id}/graph`, {
      signal: options.signal,
    });
    return response.data;
  },
};

export default crawlService;
