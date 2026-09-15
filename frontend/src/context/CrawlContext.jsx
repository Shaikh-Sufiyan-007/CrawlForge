import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import crawlService from '../services/crawlService';

const CrawlContext = createContext();

export const CrawlProvider = ({ children }) => {

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('crawlforge_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });


  const [backendStatus, setBackendStatus] = useState('checking');

  // Current crawl state
  const [currentCrawl, setCurrentCrawl] = useState(null);
  const [crawlStatus, setCrawlStatus] = useState('IDLE');
  const [crawlProgress, setCrawlProgress] = useState({
    pagesCrawled: 0,
    pagesPending: 0,
    pagesFailed: 0,
    maxPages: 100,
    currentUrl: '',
  });

  // Data collections
  const [pages, setPages] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [history, setHistory] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'details', 'history'

  const pollingRef = useRef(null);

  // Apply theme to HTML root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('crawlforge_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Check backend health & connectivity
  const checkBackend = useCallback(async () => {
    const isHealthy = await crawlService.checkHealth();
    setBackendStatus(isHealthy ? 'connected' : 'offline');
    return isHealthy;
  }, []);

  // Load history of crawls
  const loadHistory = useCallback(async () => {
    try {
      const crawls = await crawlService.getAllCrawls();
      setHistory(crawls || []);
      setBackendStatus('connected');
    } catch (err) {
      console.warn('Failed to load history, backend might be offline:', err);
      setBackendStatus('offline');
    }
  }, []);

  // Load complete crawl details (crawl metadata, pages, graph)
  const loadCrawlDetails = useCallback(async (crawlId) => {
    if (!crawlId) return;
    setLoading(true);
    setError(null);
    try {
      const [crawl, progress, pagesData, graph] = await Promise.all([
        crawlService.getCrawl(crawlId),
        crawlService.getCrawlProgress(crawlId).catch(() => null),
        crawlService.getCrawlPages(crawlId).catch(() => []),
        crawlService.getCrawlGraph(crawlId).catch(() => ({ nodes: [], edges: [] })),
      ]);

      setCurrentCrawl(crawl);
      setCrawlStatus(crawl.status || 'COMPLETED');

      if (progress) {
        setCrawlProgress(progress);
      } else {
        setCrawlProgress({
          pagesCrawled: crawl.pagesCrawled || 0,
          pagesPending: 0,
          pagesFailed: crawl.pagesFailed || 0,
          maxPages: crawl.maxPages || 100,
          currentUrl: crawl.startUrl,
        });
      }
      setPages(pagesData || []);
      setGraphData(graph || { nodes: [], edges: [] });
      setBackendStatus('connected');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to load crawl details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start a new crawl
  const startCrawl = async (url, maxPages) => {
    setLoading(true);
    setError(null);
    try {
      const result = await crawlService.startCrawl(url, maxPages);
      const crawlId = result.crawlId || result.id;

      const initialCrawl = {
        id: crawlId,
        crawlId: crawlId,
        startUrl: url,
        maxPages: maxPages || 100,
        status: 'STARTED',
        pagesCrawled: 0,
        pagesFailed: 0,
        createdAt: new Date().toISOString(),
      };

      setCurrentCrawl(initialCrawl);
      setCrawlStatus('RUNNING');
      setCrawlProgress({
        pagesCrawled: 0,
        pagesPending: 1,
        pagesFailed: 0,
        maxPages: maxPages || 100,
        currentUrl: url,
      });
      setPages([]);
      setGraphData({ nodes: [], edges: [] });
      setBackendStatus('connected');

      // Refresh history list
      loadHistory();
      return crawlId;
    } catch (err) {
      let msg = 'Unable to start crawl.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        msg = 'Cannot connect to backend server. Make sure the Spring Boot backend is running on port 8080.';
        setBackendStatus('offline');
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Stop an active crawl
  const stopCrawl = async () => {
    const crawlId = currentCrawl?.id || currentCrawl?.crawlId;
    if (!crawlId) return;

    try {
      const updated = await crawlService.stopCrawl(crawlId);
      setCrawlStatus('STOPPED');
      if (updated) {
        setCurrentCrawl((prev) => ({ ...prev, ...updated, status: 'STOPPED' }));
      }
      loadHistory();
    } catch (err) {
      console.error('Failed to stop crawl:', err);
    }
  };

  // Live polling for running crawls
  useEffect(() => {
    const isRunning = crawlStatus === 'RUNNING' || crawlStatus === 'STARTED';
    const crawlId = currentCrawl?.id || currentCrawl?.crawlId;

    if (!isRunning || !crawlId) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    let failureCount = 0;

    const poll = async () => {
      try {
        const [progress, pagesData, graph] = await Promise.all([
          crawlService.getCrawlProgress(crawlId),
          crawlService.getCrawlPages(crawlId),
          crawlService.getCrawlGraph(crawlId),
        ]);

        failureCount = 0;
        setCrawlProgress(progress);
        setPages(pagesData || []);
        setGraphData(graph || { nodes: [], edges: [] });

        // Keep currentCrawl synchronized
        setCurrentCrawl((prev) =>
          prev
            ? {
              ...prev,
              pagesCrawled: progress.pagesCrawled,
              pagesFailed: progress.pagesFailed,
              status: progress.status || prev.status,
            }
            : prev
        );

        if (progress.status && progress.status !== crawlStatus) {
          setCrawlStatus(progress.status);
        }

        // If completed or stopped, fetch final record from DB and refresh history
        if (['COMPLETED', 'FAILED', 'STOPPED'].includes(progress.status)) {
          setCrawlStatus(progress.status);
          try {
            const finalCrawl = await crawlService.getCrawl(crawlId);
            if (finalCrawl) {
              setCurrentCrawl(finalCrawl);
            }
          } catch {
            // ignore
          }
          loadHistory();
        }
      } catch (err) {
        console.warn('Progress polling error:', err);
        failureCount += 1;
        if (failureCount >= 5) {
          console.error('Too many polling failures, stopping polling.');
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      }
    };

    // Initial poll
    poll();

    // Set polling interval every 1.5 seconds
    pollingRef.current = setInterval(poll, 1500);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [crawlStatus, currentCrawl?.id, currentCrawl?.crawlId, loadHistory]);

  // Load history & check backend on initial mount
  useEffect(() => {
    checkBackend();
    loadHistory();
  }, [checkBackend, loadHistory]);

  return (
    <CrawlContext.Provider
      value={{
        theme,
        toggleTheme,
        backendStatus,
        checkBackend,
        currentCrawl,
        crawlStatus,
        crawlProgress,
        pages,
        graphData,
        history,
        loading,
        error,
        setError,
        currentTab,
        setCurrentTab,
        startCrawl,
        stopCrawl,
        loadCrawlDetails,
        loadHistory,
      }}
    >
      {children}
    </CrawlContext.Provider>
  );
};

export const useCrawl = () => {
  const context = useContext(CrawlContext);
  if (!context) {
    throw new Error('useCrawl must be used within a CrawlProvider');
  }
  return context;
};

export default CrawlContext;

