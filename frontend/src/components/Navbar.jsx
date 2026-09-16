import React from 'react';
import { useCrawl } from '../context/CrawlContext';
import { Sun, Moon, Compass, History, LayoutDashboard, Eye, Activity } from 'lucide-react';

export const Navbar = () => {
  const { theme, toggleTheme, currentTab, setCurrentTab, crawlStatus, currentCrawl, backendStatus } = useCrawl();
  const isCrawling = crawlStatus === 'RUNNING' || crawlStatus === 'STARTED';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer select-none"
          onClick={() => setCurrentTab('dashboard')}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                Crawl<span className="text-emerald-600 dark:text-emerald-400">Forge</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block leading-none">
              Web Crawler & Site Graph
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Tabs */}
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {currentCrawl && (
              <button
                onClick={() => setCurrentTab('details')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  currentTab === 'details'
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Inspection</span>
                {isCrawling && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                )}
              </button>
            )}

            <button
              onClick={() => setCurrentTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentTab === 'history'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </nav>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Backend Status Pill */}
          <div
            className={`hidden md:flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-full border ${
              backendStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
                : backendStatus === 'offline'
                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
            title={backendStatus === 'connected' ? 'Connected to Spring Boot API' : 'Backend is not reachable on port 8080'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendStatus === 'connected'
                  ? 'bg-emerald-500'
                  : backendStatus === 'offline'
                  ? 'bg-rose-500'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span>{backendStatus === 'connected' ? 'API Online' : backendStatus === 'offline' ? 'API Offline' : 'Checking...'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

