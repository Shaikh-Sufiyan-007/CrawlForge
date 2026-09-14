import React from 'react';
import { CrawlProvider, useCrawl } from './context/CrawlContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CrawlDetails from './pages/CrawlDetails';
import History from './pages/History';

const MainContent = () => {
  const { currentTab } = useCrawl();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
      {currentTab === 'dashboard' && <Home />}
      {currentTab === 'details' && <CrawlDetails />}
      {currentTab === 'history' && <History />}
    </main>
  );
};

export const App = () => {
  return (
    <CrawlProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Navbar />
        <MainContent />
        <footer className="border-t border-slate-200 dark:border-slate-800 py-4 mt-auto bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px]">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">CrawlForge</span> — Web Crawler & Site Graph
            </div>
            <div>
              Spring Boot • Redis • React Flow
            </div>
          </div>
        </footer>
      </div>
    </CrawlProvider>
  );
};

export default App;

