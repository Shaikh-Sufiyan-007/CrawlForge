import React from 'react';

export const StepIndicator = ({ activeIndex = 0, total = 6, visible = false }) => {
  if (!visible) return null;

  const currentFormatted = String(activeIndex + 1).padStart(2, '0');
  const totalFormatted = String(total).padStart(2, '0');

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex items-center space-x-3 px-3.5 py-2 rounded-full border border-emerald-500/20 bg-[#050706]/85 backdrop-blur-md shadow-[0_0_20px_rgba(57,255,20,0.1)] pointer-events-none transition-opacity duration-300"
      aria-label={`Step ${activeIndex + 1} of ${total}`}
    >
      <div className="flex items-center space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
        <span className="font-mono text-xs font-semibold text-[#8CFF68]">
          {currentFormatted}
        </span>
      </div>
      <span className="font-mono text-[10px] text-slate-500">/</span>
      <span className="font-mono text-xs text-slate-400">
        {totalFormatted}
      </span>
      <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex
                ? 'w-4 bg-[#39FF14] shadow-[0_0_6px_#39FF14]'
                : i < activeIndex
                  ? 'w-1.5 bg-emerald-600/70'
                  : 'w-1.5 bg-slate-700/60'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
