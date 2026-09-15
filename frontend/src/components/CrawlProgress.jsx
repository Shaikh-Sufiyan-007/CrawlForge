import React from 'react';
import { useCrawl } from '../context/CrawlContext';
import { Square, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export const CrawlProgress = () => {
  const { currentCrawl, crawlStatus, crawlProgress, stopCrawl } = useCrawl();

  if (!currentCrawl) return null;

  const isRunning = crawlStatus === 'RUNNING' || crawlStatus === 'STARTED';
  const isCompleted = crawlStatus === 'COMPLETED';
  const isStopped = crawlStatus === 'STOPPED';
  const isFailed = crawlStatus === 'FAILED';

  const crawled = crawlProgress?.pagesCrawled ?? currentCrawl.pagesCrawled ?? 0;
  const pending = crawlProgress?.pagesPending ?? 0;
  const failed = crawlProgress?.pagesFailed ?? currentCrawl.pagesFailed ?? 0;
  const max = crawlProgress?.maxPages || currentCrawl.maxPages || 100;
  const percentage = max > 0 ? Math.min(100, Math.round((crawled / max) * 100)) : 0;

  const getStatusBadge = () => {
    switch (crawlStatus) {
      case 'STARTED':
      case 'RUNNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 inline-block mr-1" />
            <span>Running</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'STOPPED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Square className="w-3 h-3 fill-current" />
            <span>Stopped</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5 mb-0.5">
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
              Crawl #{currentCrawl.id || currentCrawl.crawlId}
            </h3>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-xl">
            {currentCrawl.startUrl}
          </p>
        </div>

        {isRunning && (
          <button
            onClick={stopCrawl}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 transition-colors self-start sm:self-auto"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop Crawl</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="my-4">
        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          <span>Progress: {percentage}%</span>
          <span>{crawled} / {max} pages</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCompleted
                ? 'bg-blue-600'
                : isStopped
                ? 'bg-amber-500'
                : isFailed
                ? 'bg-rose-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
            Crawled
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {crawled}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
            Queued
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {pending}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
            Errors / Skipped
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {failed}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
            Limit
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {max}
          </div>
        </div>
      </div>

      {/* Current URL indicator */}
      {isRunning && crawlProgress?.currentUrl && (
        <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0 text-emerald-600" />
          <span className="font-medium flex-shrink-0">Processing:</span>
          <span className="font-mono truncate">{crawlProgress.currentUrl}</span>
        </div>
      )}
    </div>
  );
};

export default CrawlProgress;

