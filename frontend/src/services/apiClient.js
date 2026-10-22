import axios from 'axios';

const RAW_API_URL = import.meta.env.VITE_API_URL || '/api';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crawlforge_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to determine if an error is a cold-start / transient network failure
const isTransientNetworkError = (error) => {
  if (!error) return false;
  if (!error.response) {
    // Network error, connection refused, or timeout
    return true;
  }
  const status = error.response.status;
  // 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout, 408 Request Timeout
  return [502, 503, 504, 408].includes(status);
};

// Response interceptor with automatic retry and exponential backoff
apiClient.interceptors.response.use(
  (response) => {
    window.dispatchEvent(new CustomEvent('crawlforge:server-state', {
      detail: { status: 'online' }
    }));
    return response;
  },
  async (error) => {
    const config = error.config;

    // Handle 401 Session Expiration
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(
        new CustomEvent('crawlforge:session-expired', {
          detail: error.response?.data?.error || 'Your session has expired. Please log in again.',
        })
      );
      return Promise.reject(error);
    }

    // Check if request is retryable and hasn't exceeded 3 attempts
    if (config && isTransientNetworkError(error)) {
      config.__retryCount = config.__retryCount || 0;
      const MAX_RETRIES = config.__maxRetries !== undefined ? config.__maxRetries : 3;

      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        const attempt = config.__retryCount;

        // Exponential backoff with jitter: 1.5s, 3s, 6s...
        const backoffDelay = Math.min(1500 * Math.pow(2, attempt - 1) + Math.random() * 500, 8000);

        // Notify UI that the backend is cold-starting / waking up
        window.dispatchEvent(
          new CustomEvent('crawlforge:server-state', {
            detail: {
              status: 'waking',
              attempt,
              maxRetries: MAX_RETRIES,
              delayMs: backoffDelay,
            },
          })
        );

        // Wait for the backoff duration
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));

        // Re-execute request
        return apiClient(config);
      } else {
        // All retries exhausted
        window.dispatchEvent(
          new CustomEvent('crawlforge:server-state', {
            detail: {
              status: 'offline',
              error: 'Server is currently offline or unreachable after multiple attempts.',
            },
          })
        );
      }
    }

    return Promise.reject(error);
  }
);


export const checkHealth = async (signal) => {
  // Derive actuator or auth health endpoint
  const healthUrl = API_BASE_URL.endsWith('/api')
    ? `${API_BASE_URL.slice(0, -4)}/actuator/health`
    : `${API_BASE_URL}/actuator/health`;

  try {
    const res = await axios.get(healthUrl, {
      timeout: 12000,
      signal,
    });
    return {
      online: res.status >= 200 && res.status < 300,
      status: res.data?.status || 'UP',
    };
  } catch {
    // Fall back to /api/auth/status
    try {
      const fallbackRes = await apiClient.get('/auth/status', {
        timeout: 10000,
        signal,
        __maxRetries: 1,
      });
      return {
        online: true,
        status: 'UP',
        auth: fallbackRes.data,
      };
    } catch (err) {
      return {
        online: false,
        status: 'DOWN',
        error: err.message,
      };
    }
  }
};

export default apiClient;
