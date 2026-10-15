import React, { useState } from 'react';
import { useCrawl } from '../context/CrawlContext';
import { useAuth } from '../context/AuthContext';
import {
  Sun,
  Moon,
  Compass,
  History,
  LayoutDashboard,
  Eye,
  LogOut,
  User,
  Menu,
  X,
  Activity,
} from 'lucide-react';

export const Navbar = () => {
  const { theme, toggleTheme, currentTab, setCurrentTab, crawlStatus, currentCrawl, backendStatus } = useCrawl();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCrawling = crawlStatus === 'RUNNING' || crawlStatus === 'STARTED';

  const handleNavClick = (tab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer select-none"
          onClick={() => handleNavClick('dashboard')}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                Crawl<span className="text-emerald-600 dark:text-emerald-400">Forge</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden xs:block leading-none">
              Web Crawler & Site Graph
            </p>
          </div>
        </div>

        {/* Desktop Navigation & Controls (Visible on md+) */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm sm:text-md font-medium transition-colors ${currentTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            {currentCrawl && (
              <button
                onClick={() => handleNavClick('details')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm sm:text-md font-medium transition-colors ${currentTab === 'details'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
              >
                <Eye className="w-5 h-5" />
                <span>Inspection</span>
                {isCrawling && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                )}
              </button>
            )}

            <button
              onClick={() => handleNavClick('history')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm sm:text-md font-medium transition-colors ${currentTab === 'history'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </nav>
        )}

        <div className="flex items-center space-x-1 sm:space-x-2.5">
          <div
            className={`hidden lg:flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-full border ${backendStatus === 'connected'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
              : backendStatus === 'offline'
                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            title={backendStatus === 'connected' ? 'Connected to Spring Boot API' : 'Backend is not reachable'}
          >
            <span
              className={`w-2 h-2 rounded-full ${backendStatus === 'connected'
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
            className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* User Profile & Logout (Desktop) */}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center space-x-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[100px]">
                  {user?.username || 'User'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Log out"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${currentTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
            >
              <LayoutDashboard className="w-5 h-5 text-emerald-600" />
              <span>Dashboard</span>
            </button>

            {currentCrawl && (
              <button
                onClick={() => handleNavClick('details')}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${currentTab === 'details'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Inspection</span>
                </div>
                {isCrawling && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            )}

            <button
              onClick={() => handleNavClick('history')}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${currentTab === 'history'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
            >
              <History className="w-5 h-5 text-emerald-600" />
              <span>History</span>
            </button>
          </nav>

          {/* User profile & Logout in Mobile Menu */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {user?.username || 'User'}
                </p>
                <p className="text-sm text-slate-400">
                  {user?.role || 'Authenticated'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
