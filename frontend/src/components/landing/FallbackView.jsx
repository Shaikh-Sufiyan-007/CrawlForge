import React from 'react';
import { motion } from 'framer-motion';
import { CARD_DATA } from './FeatureCards';
import { ArrowRight, Compass, Sparkles, UserPlus, MapPin, CheckCircle2 } from 'lucide-react';

export const FallbackView = ({ onNavigate, reason = 'webgl-disabled' }) => {
  return (
    <div className="w-full min-h-screen bg-[#050706] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-20">
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 mx-auto mb-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#39FF14]/30 animate-[spin_12s_linear_infinite]" />
          <div className="absolute -inset-4 rounded-full border border-dashed border-[#8CFF68]/20 animate-[spin_20s_linear_infinite_reverse]" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#39FF14]/20 via-[#103515] to-black blur-sm" />
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-[#103515] via-[#22c55e]/40 to-[#39FF14] shadow-[0_0_60px_rgba(57,255,20,0.4)] flex items-center justify-center">
            <Compass className="w-12 h-12 text-white animate-pulse" />
          </div>
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-950/40 text-xs font-mono text-[#8CFF68] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
          <span>ACCESSIBLE OVERVIEW</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight uppercase leading-tight mb-4">
          Explore the Web.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-[#8CFF68]">
            Reveal Its Structure.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Discover pages, map connections, and visualize the hidden structure of any website with CrawlForge.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-black bg-[#39FF14] hover:bg-[#8CFF68] shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all"
          >
            <span>Start Exploring</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl font-semibold text-slate-200 border border-slate-700 bg-slate-900/60 hover:bg-slate-800 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#8CFF68]" />
            <span>Sign Up Free</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#39FF14] via-emerald-600 to-[#39FF14]/20 hidden sm:block pointer-events-none" />

        <div className="space-y-8">
          {CARD_DATA.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={card.id} className="relative sm:pl-16">
                <div className="absolute left-4 top-6 -translate-x-1/2 w-5 h-5 rounded-full bg-[#050706] border-2 border-[#39FF14] hidden sm:flex items-center justify-center shadow-[0_0_10px_#39FF14]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8CFF68]" />
                </div>

                <div className="relative p-6 rounded-2xl bg-[#080d0a] border border-emerald-500/20 hover:border-[#39FF14]/40 shadow-xl transition-colors">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <span className="font-mono text-xs font-semibold text-[#8CFF68]">
                      {card.nodeLabel}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-[#39FF14] flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{card.title}</h3>
                      <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-[#39FF14]" />
                        {card.highlight}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {card.body}
                  </p>

                  {card.isCta ? (
                    <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => onNavigate('login')}
                        className="flex-1 flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-black bg-[#39FF14] hover:bg-[#8CFF68] transition-all"
                      >
                        <span>Start Exploring</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onNavigate('signup')}
                        className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl font-medium text-xs text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Sign Up</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FallbackView;
