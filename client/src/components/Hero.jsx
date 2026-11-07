import React from 'react';
import { ArrowRight, ShieldCheck, Timer, Cpu } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 border-b border-void-border">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-iris/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[200px] bg-saffron/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Monolithic Display Headline */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-void-surface border border-void-border text-xs text-silver">
              <span className="w-1.5 h-1.5 rounded-full bg-iris" />
              <span className="tracking-wide uppercase font-semibold text-[11px] text-bone">
                High-Concurrency Engine
              </span>
              <span className="text-ash">•</span>
              <span className="font-mono text-ash text-[11px]">Vercel Serverless Ready</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tighter text-bone leading-[0.95]">
              TICKET WAR. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bone via-iris to-silver">
                ZERO RACE.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-extralight text-silver max-w-xl leading-relaxed">
              Ultra-reliable concert ticket reservation system utilizing MongoDB atomic document locks (`findOneAndUpdate`) with lazy TTL expiration. Prevents double-booking during massive traffic surges with zero cron overhead.
            </p>

            {/* Signature Primary CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onExploreClick}
                className="group inline-flex items-center space-x-3 rounded-full px-8 py-4 bg-iris hover:bg-iris-hover text-white shadow-iris-glow uppercase tracking-wide text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Select Concert & Reserve Seat</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Architecture Invariants Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-void-border">
              <div className="p-3 rounded-2xl bg-void-card/60 border border-void-border">
                <div className="flex items-center space-x-2 text-iris text-xs font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Atomic Lock</span>
                </div>
                <p className="text-[11px] text-ash font-extralight leading-snug">
                  WiredTiger single-doc mutex serializes writes with 0% race condition.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-void-card/60 border border-void-border">
                <div className="flex items-center space-x-2 text-saffron text-xs font-semibold mb-1">
                  <Timer className="w-4 h-4" />
                  <span>Lazy 10-Min TTL</span>
                </div>
                <p className="text-[11px] text-ash font-extralight leading-snug">
                  Zero cron servers. Lock expiration is evaluated on-the-fly per query.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-void-card/60 border border-void-border">
                <div className="flex items-center space-x-2 text-verdant text-xs font-semibold mb-1">
                  <Cpu className="w-4 h-4" />
                  <span>Referenced Seat</span>
                </div>
                <p className="text-[11px] text-ash font-extralight leading-snug">
                  Avoids 16MB document cap and array lock bottlenecks under 10k users.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Stage Ambience & Constellation Canvas */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-md aspect-square rounded-3xl bg-void-surface border border-void-border p-6 relative overflow-hidden flex flex-col justify-between shadow-ambient-stage">
              {/* Stage Visual Indicator */}
              <div className="text-center">
                <div className="h-1.5 w-3/4 mx-auto bg-gradient-to-r from-transparent via-iris to-transparent rounded-full shadow-iris-glow mb-2" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-ash">
                  MAIN STAGE // SOUNDBOOTH CONSTELLATION
                </span>
              </div>

              {/* Dynamic Seat Grid Constellation Simulation */}
              <div className="grid grid-cols-8 gap-2 py-6 px-2 my-auto">
                {Array.from({ length: 48 }).map((_, i) => {
                  let colorClass = 'bg-zinc-800/80 border-white/5';
                  let statusLabel = 'Available';

                  if (i === 11 || i === 22 || i === 31) {
                    colorClass = 'bg-iris border-bone shadow-iris-glow animate-pulse';
                    statusLabel = 'Selected';
                  } else if (i === 7 || i === 18 || i === 29 || i === 42) {
                    colorClass = 'bg-saffron/30 border-saffron/60 text-saffron';
                    statusLabel = 'Locked';
                  } else if (i % 6 === 0) {
                    colorClass = 'bg-zinc-900 border-white/5 opacity-40';
                    statusLabel = 'Sold';
                  }

                  return (
                    <div
                      key={i}
                      className={`h-4 rounded-sm border transition-all ${colorClass}`}
                      title={`Simulated Node #${i + 1} (${statusLabel})`}
                    />
                  );
                })}
              </div>

              {/* Live Status Bar */}
              <div className="pt-4 border-t border-void-border flex items-center justify-between text-[11px] font-mono">
                <span className="text-silver">STAGE DENSITY</span>
                <span className="text-iris font-semibold">140 REAL-TIME NODES</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
