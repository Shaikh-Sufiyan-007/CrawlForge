import React, { useState } from 'react';
import { useCrawl } from '../context/CrawlContext';
import { History as HistoryIcon, ArrowRight, RefreshCw, CheckCircle2, Square, AlertTriangle, Search, Play } from 'lucide-react';

export const History = () => {
  const { history, loadHistory, loadCrawlDetails, setCurrentTab, startCrawl } = useCrawl();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleOpenDetails = (crawlId) => {
    loadCrawlDetails(crawlId);
    setCurrentTab('details');
  };

  const handleRerun = async (url, maxPages) => {
    try {
      await startCrawl(url, maxPages || 30);
      setCurrentTab('details');
    } catch {
      // Handled in context
    }
  };

  const filteredHistory = history.filter((item) =>
    (item.startUrl || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.status || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RUNNING':
      case 'STARTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block mr-0.5" />
            <span>Running</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Completed</span>
          </span>
        );
      case 'STOPPED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
            <Square className="w-3 h-3 fill-current text-amber-600" />
            <span>Stopped</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <HistoryIcon className="w-4 h-4 text-emerald-600" />
            <span>Crawl History</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log of previously completed and running web crawling tasks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by URL or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-2.5 px-3 w-14 text-center">ID</th>
                <th className="py-2.5 px-3 min-w-[260px]">Target URL</th>
                <th className="py-2.5 px-3 w-28 text-center">Status</th>
                <th className="py-2.5 px-3 w-28 text-center">Pages Crawled</th>
                <th className="py-2.5 px-3 min-w-[130px]">Started At</th>
                <th className="py-2.5 px-3 w-28 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                    {history.length === 0
                      ? 'No previous crawls recorded yet. Start your first crawl from the Dashboard.'
                      : 'No crawls match your search query.'}
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                      #{item.id}
                    </td>
                    <td className="py-2.5 px-3">
                      <div
                        onClick={() => handleOpenDetails(item.id)}
                        className="font-mono text-slate-900 dark:text-slate-100 font-medium truncate max-w-md cursor-pointer hover:text-emerald-600 transition-colors text-[11px]"
                      >
                        {item.startUrl}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-xs">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.pagesCrawled || 0}
                      </span>
                      <span className="text-slate-400 text-[11px] ml-1">
                        / {item.maxPages}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenDetails(item.id)}
                          className="px-2 py-1 rounded text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleRerun(item.startUrl, item.maxPages)}
                          title="Re-run Crawl"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;

