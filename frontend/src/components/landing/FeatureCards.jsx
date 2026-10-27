import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Compass,
  Activity,
  GitFork,
  Database,
  ArrowRight,
  UserPlus,
  MapPin,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const CARD_DATA = [
  {
    id: 'crawl-any-website',
    index: '01',
    nodeLabel: 'NODE // SEED_ORIGIN',
    title: 'Crawl Any Website',
    badge: 'ASYNC ENGINE',
    badgeColor: 'text-[#8CFF68] border-[#39FF14]/30 bg-[#39FF14]/10',
    icon: Globe,
    body: 'Enter a URL and a page limit. The crawl starts instantly and runs in the background, so you never wait on a blocking screen.',
    highlight: 'Non-blocking @Async execution',
  },
  {
    id: 'discover-every-page',
    index: '02',
    nodeLabel: 'NODE // CRAWL_ROUTER',
    title: 'Discover Every Page',
    badge: 'DOMAIN FILTERED',
    badgeColor: 'text-[#8CFF68] border-[#39FF14]/30 bg-[#39FF14]/10',
    secondaryTag: {
      text: '404/500 RESILIENT',
      color: 'text-[#FF3B3B] border-[#FF3B3B]/30 bg-[#FF3B3B]/10',
    },
    icon: Compass,
    body: 'CrawlForge follows internal links, normalizes URLs, stays within your target domain, and skips static files like images, PDFs, CSS and JS. Timeouts and errors are handled gracefully.',
    highlight: 'Strict domain boundaries & asset stripping',
  },
  {
    id: 'watch-it-live',
    index: '03',
    nodeLabel: 'NODE // LIVE_STREAM',
    title: 'Watch It Live',
    badge: 'REAL-TIME QUEUE',
    badgeColor: 'text-[#8CFF68] border-[#39FF14]/30 bg-[#39FF14]/10',
    icon: Activity,
    body: 'Follow progress in real time: pages crawled, pending and failed, plus the URL currently being fetched. Stop a crawl whenever you want.',
    highlight: 'Sub-millisecond state via Redis',
  },
  {
    id: 'see-the-structure',
    index: '04',
    nodeLabel: 'NODE // GRAPH_TOPOLOGY',
    title: 'See the Structure',
    badge: 'INTERACTIVE VISUALIZER',
    badgeColor: 'text-[#8CFF68] border-[#39FF14]/30 bg-[#39FF14]/10',
    icon: GitFork,
    body: 'Every page becomes a node and every hyperlink an edge, color-coded by crawl depth and HTTP status. Pan, zoom, drag nodes, use the minimap, and click any node to inspect it.',
    highlight: 'Dynamic React Flow graph with depth hierarchy',
  },
  {
    id: 'revisit-and-export',
    index: '05',
    nodeLabel: 'NODE // PERSISTENCE',
    title: 'Revisit and Export',
    badge: 'REPOSITORIES & EXPORT',
    badgeColor: 'text-[#8CFF68] border-[#39FF14]/30 bg-[#39FF14]/10',
    icon: Database,
    body: 'Every crawl is saved. Browse your history, search and filter pages, and export results as CSV or JSON.',
    highlight: 'PostgreSQL storage & instant structured downloads',
  },
  {
    id: 'final-cta-node',
    index: '06',
    nodeLabel: 'NODE // DESTINATION',
    title: 'Map Your First Website',
    badge: 'READY TO EXPLORE',
    badgeColor: 'text-[#39FF14] border-[#39FF14]/50 bg-[#39FF14]/20',
    icon: Sparkles,
    isCta: true,
    body: 'Uncover the hidden structure, crawl depth, and connectivity of any domain in minutes.',
    highlight: 'Instant access with your free account',
  },
];

export const FeatureCards = ({
  cardsState = [],
  onNavigate,
  activeIndex = 0,
}) => {
  return (
    <div
      id="cards-overlay-container"
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
      aria-live="polite"
    >
      {CARD_DATA.map((card, idx) => {
        const state = cardsState[idx] || {
          opacity: 0,
          scale: 0.9,
          x: 0,
          y: 0,
          active: false,
          inFocus: false,
        };

        const isCurrentlyActive = state.inFocus && state.opacity > 0.3;
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            id={`card-${card.id}`}
            tabIndex={isCurrentlyActive ? 0 : -1}
            aria-hidden={!isCurrentlyActive}
            style={{
              opacity: state.opacity,
              transform: `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`,
              pointerEvents: isCurrentlyActive ? 'auto' : 'none',
              transition: 'opacity 0.12s ease-out, transform 0.12s ease-out',
            }}
            className="absolute left-0 top-0 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md md:max-w-lg select-text focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14] rounded-2xl"
          >
            <div
              className={`relative p-5 sm:p-7 rounded-2xl bg-[#050706]/94 border transition-all duration-300 backdrop-blur-xl ${state.inFocus
                ? 'border-[#39FF14]/40 shadow-[0_0_35px_rgba(57,255,20,0.18)]'
                : 'border-slate-800/80 shadow-lg'
                }`}
            >
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#39FF14] rounded-tl-sm pointer-events-none" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#39FF14] rounded-tr-sm pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#39FF14] rounded-bl-sm pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#39FF14] rounded-br-sm pointer-events-none" />

              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-mono text-xs font-semibold tracking-wider text-[#8CFF68]">
                    {card.nodeLabel}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {card.secondaryTag && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${card.secondaryTag.color}`}
                    >
                      {card.secondaryTag.text}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center text-[#39FF14] flex-shrink-0 shadow-inner">
                  <Icon className="w-5 h-5 text-[#39FF14]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                    {card.title}
                  </h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
                      {card.highlight}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                {card.body}
              </p>

              {card.isCta ? (
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(57, 255, 20, 0.45)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate('login')}
                    id="card-cta-login"
                    tabIndex={isCurrentlyActive ? 0 : -1}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-black bg-[#39FF14] hover:bg-[#8CFF68] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                  >
                    <span>Start Exploring</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03, borderColor: 'rgba(57, 255, 20, 0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate('signup')}
                    id="card-cta-signup"
                    tabIndex={isCurrentlyActive ? 0 : -1}
                    className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-300 hover:text-white border border-slate-700 bg-slate-900/60 hover:bg-slate-800 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </motion.button>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>CRAWLFORGE ARCHITECTURE</span>
                  <span className="text-[#8CFF68]">
                    STEP {card.index} OF 06
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureCards;
