import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Timer, Cpu, Activity, Radio, Volume2 } from 'lucide-react';

const LIVE_TICKER_MESSAGES = [
  '⚡ User_89a baru saja mengunci kursi VIP-A4 (12ms) • Atomic Lock Verified',
  '🔒 User_beta berhasil lock CAT1-C12 • 0% Conflict Tolerance',
  '✓ Order ORD-8931 confirmed • 2x VIP Front Stage seats BOOKED',
  '⚡ 5x concurrent requests race to VIP-B1 • 1 granted, 4 rejected (409 Conflict)',
  '⏱️ Lazy TTL expired on CAT2-F8 • Seat released atomically to available pool',
  '✓ Recruiter demo wallet simulated 1x QRIS checkout (Rp 5,000,000)'
];

export default function Hero({ onExploreClick }) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [activeNodes, setActiveNodes] = useState([7, 14, 22, 29, 38]);

  // Cycle live ticket war ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_TICKER_MESSAGES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // Simulate active ticket war seat flickering on the right stage
  useEffect(() => {
    const seatTimer = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * 48);
      setActiveNodes((prev) => {
        if (prev.includes(randomIdx)) {
          return prev.filter((i) => i !== randomIdx);
        } else {
          return [...prev.slice(-6), randomIdx];
        }
      });
    }, 1800);
    return () => clearInterval(seatTimer);
  }, []);

  return (
    <section className="relative overflow-hidden pt-12 pb-24 border-b border-void-border">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-cyber-grid opacity-35 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Dynamic Ambient Stage Beams (Violet & Verdant) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.28, 0.15],
          x: [-30, 20, -30],
          y: [-20, 25, -20]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/3 w-[650px] h-[350px] bg-iris/25 blur-[140px] pointer-events-none rounded-full"
      />
      <motion.div
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.12, 0.22, 0.12],
          x: [20, -25, 20],
          y: [15, -20, 15]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 right-12 w-[450px] h-[280px] bg-verdant/20 blur-[130px] pointer-events-none rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Monolithic Display Headline */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-void-surface/90 border border-void-border text-xs text-silver backdrop-blur-xl shadow-inner">
              <span className="w-2 h-2 rounded-full bg-iris animate-pulse shadow-sm shadow-iris" />
              <span className="tracking-wide uppercase font-semibold text-[11px] text-bone">
                High-Concurrency Engine
              </span>
              <span className="text-ash">•</span>
              <span className="font-mono text-ash text-[11px]">Vercel Serverless Ready</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tighter text-bone leading-[0.93]">
              TICKET WAR. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bone via-iris to-emerald-400">
                ZERO RACE.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-light text-silver max-w-xl leading-relaxed">
              Ultra-reliable concert seat reservation system powered by MongoDB document-level atomic mutex (`findOneAndUpdate`) and lazy TTL evaluation. Guarantees 0% double-booking during massive traffic war without cron servers.
            </p>

            {/* Signature Primary CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onExploreClick}
                className="group inline-flex items-center space-x-3 rounded-full px-8 py-4 bg-iris hover:bg-iris-hover text-white shadow-iris-glow uppercase tracking-wide text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Select Concert & Reserve Seat</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
            </div>

            {/* Invariants Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-void-border">
              <div className="p-3.5 rounded-2xl bg-void-card/70 border border-void-border backdrop-blur-md hover:border-iris/40 transition-colors">
                <div className="flex items-center space-x-2 text-iris text-xs font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Atomic Lock</span>
                </div>
                <p className="text-[11px] text-ash font-extralight leading-snug">
                  WiredTiger single-doc mutex serializes writes with 0% race condition.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-void-card/70 border border-void-border backdrop-blur-md hover:border-saffron/40 transition-colors">
                <div className="flex items-center space-x-2 text-saffron text-xs font-semibold mb-1">
                  <Timer className="w-4 h-4" />
                  <span>Lazy 10-Min TTL</span>
                </div>
                <p className="text-[11px] text-ash font-extralight leading-snug">
                  Zero cron servers. Lock expiration is evaluated on-the-fly per query.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-void-card/70 border border-void-border backdrop-blur-md hover:border-verdant/40 transition-colors">
                <div className="flex items-center space-x-2 text-verdant text-xs font-semibold mb-1">
                  <Cpu className="w-4 h-4" />
                  <span>Smart Fallback</span>
                </div>
                <p className="text-[11px] text-ash font-extralight leading-snug">
                  Auto in-memory engine fallback if DB is offline. 0% downtime on Vercel.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Live Interactive Stage Constellation Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            <div className="w-full max-w-md rounded-3xl bg-void-surface/90 border border-void-border p-6 relative overflow-hidden flex flex-col justify-between shadow-ambient-stage backdrop-blur-2xl">
              {/* Stage Top Arc with Live Equalizer Bars */}
              <div className="relative pb-4 border-b border-void-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono tracking-widest uppercase text-silver">
                    <Radio className="w-3.5 h-3.5 text-iris animate-pulse" />
                    <span>MAIN STAGE LIVE SOUNDBOOTH</span>
                  </div>
                  {/* Real-time Frequency Equalizer */}
                  <div className="flex items-end space-x-1 h-4">
                    <span className="w-1 bg-iris rounded-full animate-eq-1" />
                    <span className="w-1 bg-verdant rounded-full animate-eq-2" />
                    <span className="w-1 bg-saffron rounded-full animate-eq-3" />
                    <span className="w-1 bg-iris rounded-full animate-eq-4" />
                    <span className="w-1 bg-verdant rounded-full animate-eq-1" />
                  </div>
                </div>

                <div className="h-1.5 w-full bg-gradient-to-r from-iris via-verdant to-saffron rounded-full shadow-iris-glow" />
              </div>

              {/* Dynamic Simulated Seat Grid Constellation */}
              <div className="grid grid-cols-8 gap-2 py-6 px-1 my-auto">
                {Array.from({ length: 48 }).map((_, i) => {
                  const isActive = activeNodes.includes(i);
                  const isSold = i % 7 === 0;
                  const isLocked = !isSold && (i === 11 || i === 23 || i === 35);

                  let colorClass = 'bg-zinc-800/80 border-white/5 hover:bg-zinc-700';
                  let statusText = 'Available';

                  if (isActive) {
                    colorClass = 'bg-iris border-bone shadow-iris-glow scale-105';
                    statusText = 'Active Contention (Locked)';
                  } else if (isLocked) {
                    colorClass = 'bg-saffron/30 border-saffron/70 text-saffron animate-pulse';
                    statusText = 'Locked (10m TTL)';
                  } else if (isSold) {
                    colorClass = 'bg-zinc-900 border-white/5 opacity-35';
                    statusText = 'Booked';
                  }

                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.25, zIndex: 20 }}
                      className={`h-4 rounded-sm border transition-all cursor-pointer relative group ${colorClass}`}
                    >
                      <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded bg-void-card border border-void-border text-[9px] font-mono text-bone whitespace-nowrap shadow-xl">
                        Node #{i + 1}: {statusText}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Live Activity Ticker Bar */}
              <div className="pt-4 border-t border-void-border space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-silver">
                  <span className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-verdant" />
                    <span>LIVE TICKER</span>
                  </span>
                  <span className="text-iris font-semibold">140 REAL-TIME NODES</span>
                </div>

                {/* Animated cycling text */}
                <div className="h-6 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={tickerIndex}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.3 }}
                      className="text-[11px] font-mono text-bone/90 truncate leading-tight"
                    >
                      {LIVE_TICKER_MESSAGES[tickerIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
