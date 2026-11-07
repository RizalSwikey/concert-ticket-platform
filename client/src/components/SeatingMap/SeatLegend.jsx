import React from 'react';

export default function SeatLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4 px-6 rounded-2xl bg-void-card/60 border border-void-border backdrop-blur-md mb-8 text-xs font-mono">
      <div className="flex items-center space-x-2">
        <span className="w-4 h-4 rounded-md bg-zinc-800 border border-white/20 inline-block" />
        <span className="text-silver">Available</span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="w-4 h-4 rounded-md bg-iris border border-bone shadow-iris-glow inline-block" />
        <span className="text-bone font-medium">Selected by You</span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="w-4 h-4 rounded-md bg-saffron/20 border border-saffron/60 text-saffron animate-pulse inline-block" />
        <span className="text-saffron">Locked by Others (10-min TTL)</span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="w-4 h-4 rounded-md bg-zinc-900 border border-white/5 opacity-40 inline-block" />
        <span className="text-ash">Booked / Sold</span>
      </div>
    </div>
  );
}
