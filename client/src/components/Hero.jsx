import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const LIVE_ATTENDEE_ACTIVITIES = [
  'Attendee in Jakarta just locked Seat VIP-A4 — 12ms latency',
  'Coldplay GBK Stadium: 2x CAT 1 Festival seats confirmed',
  'Digital pass issued for Order #ORD-89412',
  'Bruno Mars JIS: VIP Soundbooth Row B in high demand',
  'Seat CAT2-F8 lock expired — returned to available pool',
  'Attendee in Surabaya completed Instant QRIS payment'
];

const POSTER_IMAGE =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1400&q=85';

export default function Hero({ onExploreClick }) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_ATTENDEE_ACTIVITIES.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [reduce]);

  return (
    <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden bg-void">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        {/* Left: poster type stack */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="lg:col-span-7 space-y-7"
        >
          <span className="label-mono block text-ash">2026 / 2027 SEASON</span>

          <h1 className="display-xl text-bone">
            EXPERIENCE
            <br />
            LIVE MUSIC
            <br />
            WITHOUT LIMITS.
          </h1>

          <p className="text-base font-light text-silver max-w-[46ch] leading-relaxed">
            Official stadium allocation, VIP soundbooth access, and cryptographic digital
            passes. Atomic seat locking means no seat is ever sold twice.
          </p>

          <button
            type="button"
            onClick={onExploreClick}
            className="group inline-flex items-center space-x-3 rounded-full px-7 py-3.5 bg-iris hover:bg-iris-hover text-white text-[11px] font-mono uppercase tracking-[0.18em] font-semibold transition-colors cursor-pointer"
          >
            <span>Explore Shows</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Right: full-bleed artist plate */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: 'easeOut' }}
          className="lg:col-span-5 relative"
        >
          <div className="relative overflow-hidden rounded-lg aspect-[4/5] lg:aspect-[3/4] lg:-mr-8 xl:-mr-12">
            <img
              src={POSTER_IMAGE}
              alt="Crowd under stage light at a live stadium show"
              className="w-full h-full object-cover grayscale contrast-125 mix-blend-luminosity"
              loading="eager"
            />
            <div className="absolute inset-0 bg-iris/10" />
          </div>
        </motion.div>
      </div>

      {/* Live ticker: one mono line, blinking saffron dot */}
      <div className="border-t border-void-border px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 overflow-hidden">
        <span className="w-1.5 h-1.5 rounded-full bg-saffron animate-pulse shrink-0" />
        <div className="h-4 overflow-hidden relative flex-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={tickerIndex}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] font-mono text-silver truncate leading-none tracking-wide"
            >
              {LIVE_ATTENDEE_ACTIVITIES[tickerIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
