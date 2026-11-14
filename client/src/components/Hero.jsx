import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Radio, Volume2, Ticket, CheckCircle2, Music } from 'lucide-react';

const LIVE_ATTENDEE_ACTIVITIES = [
  '⚡ Attendee in Jakarta just locked Seat VIP-A4 (12ms latency)',
  '🔒 Coldplay GBK Stadium: 2x CAT 1 Festival seats confirmed',
  '✓ Digital holographic pass issued for Order #ORD-89412',
  '⚡ Bruno Mars JIS: VIP Soundbooth Row B seats in high demand',
  '⏱️ Seat CAT2-F8 lock expired • Returned to available pool',
  '✓ Attendee in Surabaya completed Instant QRIS payment'
];

export default function Hero({ onExploreClick }) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [activeNodes, setActiveNodes] = useState([7, 14, 22, 29, 38]);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });

  // ponytail: smooth CSS cubic-bezier transition handles 60fps tilt; add rAF spring physics if WebGL requested
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (px - 0.5) * 22,
      y: -(py - 0.5) * 22,
      active: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, active: false });
  };

  const handleTouchMove = (e) => {
    if (!e.touches[0]) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.touches[0].clientX - rect.left) / rect.width;
    const py = (e.touches[0].clientY - rect.top) / rect.height;
    setTilt({
      x: Math.max(-1, Math.min(1, (px - 0.5) * 2)) * 16,
      y: -Math.max(-1, Math.min(1, (py - 0.5) * 2)) * 16,
      active: true
    });
  };

  const handleTouchEnd = () => {
    setTilt({ x: 0, y: 0, active: false });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_ATTENDEE_ACTIVITIES.length);
    }, 3400);
    return () => clearInterval(timer);
  }, []);

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
    }, 2000);
    return () => clearInterval(seatTimer);
  }, []);

  return (
    <section className="relative overflow-hidden pt-6 sm:pt-12 pb-16 sm:pb-24 border-b border-void-border">
      {/* Cyber Perspective Grid Background */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Dynamic Ambient Stage Spotlights */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.18, 0.3, 0.18],
          x: [-30, 25, -30],
          y: [-20, 20, -20]
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/3 w-[650px] h-[350px] bg-iris/25 blur-[140px] pointer-events-none rounded-full"
      />
      <motion.div
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.12, 0.24, 0.12],
          x: [20, -25, 20],
          y: [15, -20, 15]
        }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 right-12 w-[450px] h-[280px] bg-verdant/20 blur-[130px] pointer-events-none rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Monolithic Commercial Headline */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-void-surface/90 border border-void-border text-xs text-silver backdrop-blur-xl shadow-inner">
              <span className="w-2 h-2 rounded-full bg-verdant animate-pulse" />
              <span className="tracking-wide uppercase font-semibold text-[11px] text-bone">
                Official Headliner Lineup
              </span>
              <span className="text-ash">•</span>
              <span className="font-mono text-saffron text-[11px]">2026/2027 Stadium Season</span>
            </div>

            <h1
              style={{ fontSize: 'clamp(2.25rem, 7vw, 6.2rem)' }}
              className="font-normal tracking-[-0.04em] text-bone leading-[0.98]"
            >
              EXPERIENCE LIVE MUSIC <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bone via-iris to-emerald-400">
                WITHOUT LIMITS.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-light text-silver max-w-xl leading-relaxed">
              Official front-row stadium seats, exclusive VIP soundbooth access, and instant holographic digital passes with zero booking conflict.
            </p>

            {/* Signature CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onExploreClick}
                className="group inline-flex items-center space-x-3 rounded-full px-8 py-4 bg-iris hover:bg-iris-hover text-white shadow-iris-glow uppercase tracking-wide text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Explore Upcoming Shows</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
            </div>

            {/* Commercial Trust Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-void-border">
              <div className="p-3.5 rounded-2xl bg-void-card/70 border border-void-border backdrop-blur-md hover:border-iris/40 transition-colors">
                <div className="flex items-center space-x-2 text-iris text-xs font-semibold mb-1">
                  <Shield className="w-4 h-4" />
                  <span>100% Official Passes</span>
                </div>
                <p className="text-[11px] text-ash font-extralight leading-snug">
                  Direct venue allocation with unique cryptographically verified QR tickets.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-void-card/70 border border-void-border backdrop-blur-md hover:border-saffron/40 transition-colors">
                <div className="flex items-center space-x-2 text-saffron text-xs font-semibold mb-1">
                  <Music className="w-4 h-4" />
                  <span>Interactive Map</span>
                </div>
                <p className="text-[11px] text-ash font-extralight leading-snug">
                  Select exact seat rows in VIP, Festival, and Grandstand with real-time status.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-void-card/70 border border-void-border backdrop-blur-md hover:border-verdant/40 transition-colors">
                <div className="flex items-center space-x-2 text-verdant text-xs font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Instant Settlement</span>
                </div>
                <p className="text-[11px] text-ash font-extralight leading-snug">
                  Supports Simulated QRIS, Virtual Account, & Instant Wallet checkout.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive 3D Stage Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-5 relative flex items-center justify-center w-full perspective-1200 py-4"
          >
            {/* 3D Tilt Stage Card Wrapper */}
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                transform: tilt.active
                  ? `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(0px)`
                  : undefined,
                transition: tilt.active ? 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)' : 'transform 0.8s ease-out'
              }}
              className={`w-full max-w-sm sm:max-w-md mx-auto rounded-3xl bg-void-surface/90 border border-void-border p-5 sm:p-6 relative preserve-3d shadow-ambient-stage backdrop-blur-2xl ${
                !tilt.active ? 'animate-stage-float' : ''
              }`}
            >
              {/* Orbital Acoustic Wave Rings (translateZ: 18px & 35px) */}
              <div
                style={{ transform: 'translateZ(18px)' }}
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
              >
                <div className="absolute top-1/2 left-1/2 w-64 h-40 border border-iris/30 rounded-full animate-acoustic-pulse pointer-events-none" />
                <div
                  style={{ animationDelay: '-2.5s' }}
                  className="absolute top-1/2 left-1/2 w-80 h-52 border border-saffron/20 rounded-full animate-acoustic-pulse pointer-events-none"
                />
                <div
                  style={{ animationDelay: '-4s' }}
                  className="absolute top-1/2 left-1/2 w-96 h-60 border border-verdant/20 rounded-full animate-acoustic-pulse pointer-events-none"
                />
              </div>

              {/* Floating Stage Header & Equalizer (translateZ: 50px) */}
              <div
                style={{ transform: 'translateZ(50px)' }}
                className="relative pb-4 border-b border-void-border preserve-3d"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono tracking-widest uppercase text-silver">
                    <Radio className="w-3.5 h-3.5 text-iris animate-pulse" />
                    <span>3D ACOUSTIC STAGE SHOWCASE</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-iris/15 text-iris border border-iris/30 font-semibold">
                    {tilt.active ? 'TILT ROTATING' : '3D IDLE FLOATING'}
                  </span>
                </div>

                {/* Stage Equalizer Frequency Bars */}
                <div className="flex items-end justify-between h-5 pt-1 px-1">
                  <div className="flex items-end space-x-1.5 h-full">
                    <span className="w-1.5 bg-iris rounded-full animate-eq-1 shadow-iris-glow" />
                    <span className="w-1.5 bg-verdant rounded-full animate-eq-2" />
                    <span className="w-1.5 bg-saffron rounded-full animate-eq-3" />
                    <span className="w-1.5 bg-iris rounded-full animate-eq-4" />
                    <span className="w-1.5 bg-verdant rounded-full animate-eq-1" />
                    <span className="w-1.5 bg-saffron rounded-full animate-eq-3" />
                  </div>
                  <span className="text-[10px] font-mono text-silver">
                    120 FPS AUDIO SYNC
                  </span>
                </div>

                <div className="h-1.5 w-full bg-gradient-to-r from-iris via-verdant to-saffron rounded-full shadow-iris-glow mt-2" />
              </div>

              {/* 3D Equalizer Pillars Deck (translateZ: 35px) */}
              <div
                style={{ transform: 'translateZ(35px)' }}
                className="flex items-end justify-center space-x-2 pt-4 pb-2 preserve-3d"
              >
                {[
                  { h: 'h-7', delay: '0.1s', color: 'from-iris to-iris-hover' },
                  { h: 'h-10', delay: '0.3s', color: 'from-verdant to-emerald-400' },
                  { h: 'h-14', delay: '0.15s', color: 'from-saffron to-amber-300' },
                  { h: 'h-16', delay: '0.4s', color: 'from-iris to-purple-400' },
                  { h: 'h-12', delay: '0.2s', color: 'from-verdant to-teal-300' },
                  { h: 'h-8', delay: '0.35s', color: 'from-saffron to-amber-400' }
                ].map((pillar, idx) => (
                  <div
                    key={idx}
                    style={{
                      animationDelay: pillar.delay,
                      transform: `translateZ(${15 + idx * 4}px)`
                    }}
                    className={`w-3.5 ${pillar.h} rounded-t-sm bg-gradient-to-t ${pillar.color} shadow-lg border-t border-white/40 animate-pulse`}
                  />
                ))}
              </div>

              {/* Floating Multi-Layer Seat Nodes Grid (translateZ: 20px, 45px, 70px) */}
              <div className="grid grid-cols-8 gap-2 py-4 px-1 my-auto preserve-3d">
                {Array.from({ length: 48 }).map((_, i) => {
                  const rowIdx = Math.floor(i / 8); // 0 to 5
                  const isActive = activeNodes.includes(i);
                  const isSold = i % 7 === 0;
                  const isLocked = !isSold && (i === 11 || i === 23 || i === 35);

                  // Depth tiering: Back rows (CAT 2: 20px), Mid rows (CAT 1: 45px), Front rows (VIP: 70px)
                  const depthZ = rowIdx < 2 ? 20 : rowIdx < 4 ? 45 : 70;
                  const elevatedZ = isActive ? depthZ + 16 : depthZ;

                  let colorClass = 'bg-zinc-800/80 border-white/10 hover:bg-zinc-700 text-zinc-400';
                  let statusText = 'Available for Reservation';
                  let tierLabel = rowIdx < 2 ? 'CAT 2' : rowIdx < 4 ? 'CAT 1' : 'VIP';

                  if (isActive) {
                    colorClass = 'bg-iris border-bone shadow-iris-glow text-white scale-110';
                    statusText = 'Seat Selected (In Checkout)';
                  } else if (isLocked) {
                    colorClass = 'bg-saffron/30 border-saffron/80 text-saffron animate-pulse';
                    statusText = 'Reserved (10m Lock)';
                  } else if (isSold) {
                    colorClass = 'bg-zinc-900/90 border-white/5 opacity-35 text-zinc-600';
                    statusText = 'Booked / Sold Out';
                  }

                  return (
                    <div
                      key={i}
                      style={{
                        transform: `translateZ(${elevatedZ}px)`,
                        transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
                      }}
                      className={`h-4.5 rounded-sm border transition-all cursor-pointer relative group flex items-center justify-center ${colorClass}`}
                    >
                      <span className="text-[7px] font-mono opacity-60 pointer-events-none">
                        {tierLabel[0]}
                      </span>
                      <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded bg-void-card border border-void-border text-[9px] font-mono text-bone whitespace-nowrap shadow-2xl pointer-events-none">
                        {tierLabel} #{i + 1}: {statusText} (Z: {elevatedZ}px)
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating 3D VIP Pass Hologram Badge (translateZ: 85px) */}
              <div
                style={{ transform: 'translateZ(85px)' }}
                className="my-2 p-2.5 rounded-xl bg-gradient-to-r from-iris/20 via-verdant/20 to-saffron/20 border border-iris/40 backdrop-blur-md flex items-center justify-between shadow-iris-glow preserve-3d"
              >
                <div className="flex items-center space-x-2">
                  <Ticket className="w-3.5 h-3.5 text-iris" />
                  <span className="text-[10px] font-mono text-bone font-semibold tracking-wide">
                    VIP SOUNDBOOTH HOLOGRAPHIC PASS
                  </span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-verdant/20 text-verdant border border-verdant/30 font-semibold">
                  AUTHENTIC 3D NODE
                </span>
              </div>

              {/* Live Attendee Activity Ticker Bar (translateZ: 30px) */}
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="pt-3 border-t border-void-border space-y-1.5 preserve-3d"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-silver">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-verdant" />
                    <span>LIVE SHOW ACTIVITY</span>
                  </span>
                  <span className="text-iris font-semibold">140 VENUE NODES</span>
                </div>

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
                      {LIVE_ATTENDEE_ACTIVITIES[tickerIndex]}
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
