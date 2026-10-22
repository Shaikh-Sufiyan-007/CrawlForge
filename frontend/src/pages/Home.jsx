import React from 'react';
import { useCrawl } from '../context/CrawlContext';
import CrawlForm from '../components/CrawlForm';
import CrawlProgress from '../components/CrawlProgress';
import { ArrowRight, Clock, RefreshCw, AlertCircle } from 'lucide-react';

export const Home = () => {
  const { currentCrawl, history, loadCrawlDetails, setCurrentTab, backendStatus, wakingMeta, startCrawl } = useCrawl();

  const handleInspect = (crawlId) => {
    loadCrawlDetails(crawlId);
    setCurrentTab('details');
  };

  const handleRerun = async (url, maxPages) => {
    try {
      await startCrawl(url, maxPages);
      setCurrentTab('details');
    } catch {
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {backendStatus === 'waking' && (
        <div className="p-3.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center space-x-3 text-sky-800 dark:text-sky-300 text-xs">
          <RefreshCw className="w-4 h-4 flex-shrink-0 text-sky-600 dark:text-sky-400 animate-spin" />
          <div className="flex-1">
            <span className="font-semibold">Server is waking up, please wait... </span>
            Connecting to cloud host (attempt {wakingMeta?.attempt || 1} of {wakingMeta?.maxRetries || 3}). Cold start in progress, will automatically connect without manual refreshes.
          </div>
        </div>
      )}

      {backendStatus === 'offline' && (
        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start space-x-2.5 text-amber-800 dark:text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 break-words">
            <span className="font-semibold">Backend Server Offline: </span>
            The Spring Boot backend is currently unreachable after retrying. Please verify that the cloud container has started.
          </div>
        </div>
      )}

      <CrawlForm />

      {currentCrawl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Crawl
            </h2>
            <button
              onClick={() => setCurrentTab('details')}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>View Site Graph & Pages</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <CrawlProgress />
        </div>
      )}

      {history && history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent Crawls
            </h3>
            <button
              onClick={() => setCurrentTab('history')}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View all ({history.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div
                  onClick={() => handleInspect(item.id)}
                  className="flex items-start space-x-2.5 overflow-hidden cursor-pointer flex-1 min-w-0"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100 truncate block hover:text-emerald-600">
                      {item.startUrl}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {item.pagesCrawled} pages crawled • Limit {item.maxPages}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto pl-6 sm:pl-0 flex-shrink-0">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded font-mono ${item.status === 'COMPLETED'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : item.status === 'RUNNING'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                  >
                    {item.status}
                  </span>

                  <button
                    onClick={() => handleInspect(item.id)}
                    className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium"
                  >
                    Inspect
                  </button>

                  <button
                    onClick={() => handleRerun(item.startUrl, item.maxPages)}
                    title="Re-run Crawl"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
