import React from 'react';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, UserPlus } from 'lucide-react';

export const LandingNav = ({ onNavigate }) => {
  const handleLogoClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      id="landing-header"
      className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-500/15 bg-[#050706]/80 backdrop-blur-lg transition-colors duration-300"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a
          href="#top"
          onClick={handleLogoClick}
          className="flex items-center space-x-3 group cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14] rounded-lg p-1"
          aria-label="CrawlForge - Home"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-[#103515] p-[1px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-400/30 transition-all duration-300">
            <div className="w-full h-full bg-[#050706] rounded-[11px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#39FF14] group-hover:rotate-45 transition-transform duration-500 ease-out" />
            </div>
            <span className="absolute inset-0 rounded-xl bg-[#39FF14]/20 animate-ping opacity-25 pointer-events-none" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                Crawl<span className="text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">Forge</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-[#39FF14]/30 text-[#8CFF68] bg-[#39FF14]/10 hidden sm:inline-block">
                3D Engine
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider hidden sm:block">
              REVEAL THE WEB
            </span>
          </div>
        </a>

        <nav className="flex items-center space-x-3 sm:space-x-4" aria-label="Main Navigation">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('login')}
            id="nav-login-btn"
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white rounded-lg border border-slate-700/60 hover:border-[#39FF14]/40 bg-slate-900/60 hover:bg-slate-800/80 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]"
            aria-label="Log in to existing account"
          >
            Sign In
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(57, 255, 20, 0.45)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigate('signup')}
            id="nav-signup-btn"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-black bg-[#39FF14] hover:bg-[#8CFF68] rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Create a new account"
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[2.5]" />
            <span>Sign Up</span>
          </motion.button>
        </nav>
      </div>
    </header>
  );
};

export default LandingNav;
