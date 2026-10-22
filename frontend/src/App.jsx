import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CrawlProvider, useCrawl } from './context/CrawlContext';
import Navbar from './components/Navbar';

const Home = lazy(() => import('./pages/Home'));
const CrawlDetails = lazy(() => import('./pages/CrawlDetails'));
const History = lazy(() => import('./pages/History'));
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[40vh]">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-7 h-7 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        Loading module...
      </p>
    </div>
  </div>
);

const MainContent = () => {
  const { currentTab } = useCrawl();
  const { isAuthenticated, authLoading } = useAuth();
  const [authView, setAuthView] = useState('login');

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex items-center justify-center">
        <Suspense fallback={<PageLoader />}>
          {authView === 'login' ? (
            <Login onSwitchToSignup={() => setAuthView('signup')} />
          ) : (
            <Signup onSwitchToLogin={() => setAuthView('login')} />
          )}
        </Suspense>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full">
      <Suspense fallback={<PageLoader />}>
        {currentTab === 'dashboard' && <Home />}
        {currentTab === 'details' && <CrawlDetails />}
        {currentTab === 'history' && <History />}
      </Suspense>
    </main>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <CrawlProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
          <Navbar />
          <MainContent />
          <footer className="border-t border-slate-200 dark:border-slate-800 py-3 sm:py-4 mt-auto bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-center sm:text-left">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">CrawlForge</span> — Web Crawler & Site Graph
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400">
                Spring Boot • Redis • PostgreSQL • React Flow
              </div>
            </div>
          </footer>
        </div>
      </CrawlProvider>
    </AuthProvider>
  );
};

export default App;
