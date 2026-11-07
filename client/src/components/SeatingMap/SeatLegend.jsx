import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function SeatLegend() {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl bg-void-card border border-void-border backdrop-blur-md mb-6 sm:mb-8 text-xs font-mono">
      <div className="flex items-center space-x-2">
        <span
          className={`w-4 h-4 rounded-md inline-block border ${
            isDark ? 'bg-[#18181B] border-[#27272A]' : 'bg-[#FFFFFF] border-[#D4D4D8]'
          }`}
        />
        <span className="text-silver">Available</span>
      </div>

      <div className="flex items-center space-x-2">
        <span
          className={`w-4 h-4 rounded-md inline-block border ${
            isDark ? 'bg-[#8052FF] border-white shadow-iris-glow' : 'bg-[#6328FF] border-[#4B15E0]'
          }`}
        />
        <span className="text-bone font-medium">Selected by You</span>
      </div>

      <div className="flex items-center space-x-2">
        <span
          className={`w-4 h-4 rounded-md inline-block border animate-pulse ${
            isDark
              ? 'bg-[#FFB829]/20 border-[#FFB829]'
              : 'bg-[#FEF3C7] border-[#F59E0B]'
          }`}
        />
        <span className="text-saffron font-medium">Held (10m TTL)</span>
      </div>

      <div className="flex items-center space-x-2">
        <span
          className={`w-4 h-4 rounded-md inline-block border ${
            isDark
              ? 'bg-[#15846E]/25 border-[#15846E]'
              : 'bg-[#D1FAE5] border-[#10B981]'
          }`}
        />
        <span className="text-verdant font-medium">Booked / Sold</span>
      </div>
    </div>
  );
}
