import React, { useState } from 'react';
import { useCrawl } from '../context/CrawlContext';
import CrawlProgress from '../components/CrawlProgress';
import PageTable from '../components/PageTable';
import GraphView from '../components/GraphView';
import { Network, Table, Info, RefreshCw, ArrowLeft, ExternalLink, Play } from 'lucide-react';

export const CrawlDetails = () => {
  const { currentCrawl, pages, graphData, loadCrawlDetails, loading, setCurrentTab, startCrawl } = useCrawl();
  const [activeSubTab, setActiveSubTab] = useState('graph'); // 'graph', 'pages', 'info'

  if (!currentCrawl) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No Crawl Selected
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Select a crawl job from History or start a new crawl from the Dashboard.
        </p>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const crawlId = currentCrawl.id || currentCrawl.crawlId;

  const handleRerun = async () => {
    if (!currentCrawl?.startUrl) return;
    try {
      await startCrawl(currentCrawl.startUrl, currentCrawl.maxPages || 30);
    } catch {
      // Handled in context
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRerun}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Re-run Crawl</span>
          </button>

          <button
            onClick={() => loadCrawlDetails(crawlId)}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Live Status & Metric Card */}
      <CrawlProgress />

      {/* Sub-Tabs Selector */}
      <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('graph')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeSubTab === 'graph'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Site Graph</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
            {graphData?.nodes?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('pages')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeSubTab === 'pages'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Pages List</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
            {pages?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('info')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeSubTab === 'info'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Job Details</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeSubTab === 'graph' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {graphData?.nodes?.length || 0} nodes discovered • {graphData?.edges?.length || 0} link connections
            </span>
            <span className="text-[11px] hidden sm:inline">Use mouse scroll to zoom, click & drag canvas to navigate</span>
          </div>
          <GraphView graphData={graphData} />
        </div>
      )}

      {activeSubTab === 'pages' && (
        <div>
          <PageTable pages={pages} />
        </div>
      )}

      {activeSubTab === 'info' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Job Metadata
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium uppercase text-[10px]">
                Target URL
              </span>
              <a
                href={currentCrawl.startUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 break-all"
              >
                <span>{currentCrawl.startUrl}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium uppercase text-[10px]">
                Job ID
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                #{crawlId}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium uppercase text-[10px]">
                Date Started
              </span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {currentCrawl.createdAt ? new Date(currentCrawl.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium uppercase text-[10px]">
                Date Completed
              </span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {currentCrawl.completedAt ? new Date(currentCrawl.completedAt).toLocaleString() : 'In Progress / Not Finished'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrawlDetails;

