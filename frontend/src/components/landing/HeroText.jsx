import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronDown, Compass } from 'lucide-react';

export const HeroText = forwardRef(({ onNavigate, showScrollHint = false }, ref) => {
  return (
    <div
      ref={ref}
      id="hero-content-wrapper"
      className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center select-none pointer-events-none"
    >
      <div className="hero-badge-container overflow-hidden mb-4 sm:mb-6 pointer-events-auto">
        <div className="hero-badge inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-950/40 backdrop-blur-md text-[11px] sm:text-xs font-mono text-[#8CFF68] shadow-[0_0_20px_rgba(57,255,20,0.15)]">
          <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
          <span>ASYNCHRONOUS GRAPH CRAWLER</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">ACTIVE ENGINE</span>
        </div>
      </div>

      <div className="hero-line-1-container overflow-hidden w-full">
        <h1 className="hero-line-1 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white uppercase font-sans leading-[1.05]">
          Explore the Web.
        </h1>
      </div>

      <div className="hero-line-2-container overflow-hidden w-full mt-1 sm:mt-2">
        <h2 className="hero-line-2 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white uppercase font-sans leading-[1.05]">
          Reveal Its{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] via-[#8CFF68] to-emerald-400 drop-shadow-[0_0_35px_rgba(57,255,20,0.4)]">
            Structure.
          </span>
        </h2>
      </div>

      <div className="hero-subtext-container overflow-hidden mt-6 sm:mt-8 max-w-2xl">
        <p className="hero-subtext text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed">
          Discover pages, map connections, and visualize the hidden structure of any website with{' '}
          <span className="text-white font-medium">CrawlForge</span>.
        </p>
      </div>

      <div className="hero-cta-container mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(57, 255, 20, 0.55)' }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onNavigate('login')}
          id="hero-explore-cta"
          className="hero-cta-primary w-full sm:w-auto group flex items-center justify-center space-x-3 px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base text-black bg-[#39FF14] hover:bg-[#8CFF68] shadow-[0_0_20px_rgba(57,255,20,0.35)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Start exploring - Sign in to CrawlForge"
        >
          <span>Start Exploring</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.5] group-hover:translate-x-1 transition-transform duration-200" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, borderColor: 'rgba(57, 255, 20, 0.5)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('signup')}
          id="hero-signup-cta"
          className="hero-cta-secondary w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-slate-200 hover:text-white border border-slate-700/80 hover:border-[#39FF14]/50 bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]"
          aria-label="Create a new account on CrawlForge"
        >
          <Sparkles className="w-4 h-4 text-[#8CFF68]" />
          <span>Sign Up Free</span>
        </motion.button>
      </div>

      <div
        className={`hero-scroll-cue fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 pointer-events-none transition-opacity duration-500 ${showScrollHint ? 'opacity-90' : 'opacity-0'
          }`}
        aria-hidden="true"
      >
        <span className="text-[11px] uppercase tracking-widest text-slate-400 font-mono">
          Scroll to Dive
        </span>
        <div className="w-5 h-8 rounded-full border border-emerald-500/30 flex items-start justify-center p-1 bg-black/40 backdrop-blur-sm">
          <div className="w-1 h-2 rounded-full bg-[#39FF14] animate-bounce shadow-[0_0_8px_#39FF14]" />
        </div>
      </div>
    </div>
  );
});

HeroText.displayName = 'HeroText';

export default HeroText;
