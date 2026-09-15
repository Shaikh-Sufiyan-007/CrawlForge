import React, { useState } from 'react';
import { useCrawl } from '../context/CrawlContext';
import { Play, Globe, Hash, AlertCircle, Sparkles } from 'lucide-react';

export const CrawlForm = () => {
  const { startCrawl, loading, crawlStatus, error, setError, setCurrentTab } = useCrawl();
  const [url, setUrl] = useState('https://books.toscrape.com');
  const [maxPages, setMaxPages] = useState(30);

  const isCrawling = crawlStatus === 'RUNNING' || crawlStatus === 'STARTED';

  const sampleUrls = [
    { label: 'Books To Scrape', url: 'https://books.toscrape.com', max: 25 },
    { label: 'Quotes To Scrape', url: 'https://quotes.toscrape.com', max: 20 },
    { label: 'Example Domain', url: 'https://example.com', max: 10 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    let trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError('Please enter a target website URL.');
      return;
    }

    // Automatically prepend https:// if protocol is missing
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      trimmedUrl = 'https://' + trimmedUrl;
      setUrl(trimmedUrl);
    }

    const pagesLimit = Math.max(1, Math.min(500, Number(maxPages) || 30));

    try {
      await startCrawl(trimmedUrl, pagesLimit);
      setCurrentTab('details');
    } catch {
      // Error message is already formatted in CrawlContext
    }
  };

  const handleSelectSample = (sample) => {
    setUrl(sample.url);
    setMaxPages(sample.max);
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Start a Web Crawl
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter a website URL to crawl internal links, check HTTP response codes, and map site architecture.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2 text-rose-700 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Notice: </span>
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-[11px] font-semibold hover:underline text-rose-800 dark:text-rose-300 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* URL Input */}
          <div className="md:col-span-8">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Website URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                disabled={isCrawling || loading}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-mono"
              />
            </div>
          </div>


          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Max Page Limit
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="1"
                max="500"
                required
                disabled={isCrawling || loading}
                value={maxPages}
                onChange={(e) => setMaxPages(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Quick Sample Chips & Submit Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap">Examples:</span>
            {sampleUrls.map((sample) => (
              <button
                key={sample.label}
                type="button"
                disabled={isCrawling || loading}
                onClick={() => handleSelectSample(sample)}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap text-[11px]"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isCrawling || loading}
            className="flex items-center justify-center space-x-1.5 px-5 py-2 rounded-lg font-medium text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Crawl</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrawlForm;

