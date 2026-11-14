import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Radio } from 'lucide-react';

export default function StageCurve({ is3D = false }) {
  return (
    <div className={`w-full max-w-2xl mx-auto mb-8 text-center relative ${is3D ? 'preserve-3d' : ''}`}>
      {/* Radial Neon Halo Glow behind stage */}
      <motion.div
        animate={{
          opacity: [0.35, 0.7, 0.35],
          scale: [0.98, 1.06, 0.98]
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-iris/30 blur-2xl rounded-full pointer-events-none"
      />

      {is3D ? (
        /* 3D Main Stage Wall Standing Upright (rotateX: -70deg) */
        <div
          style={{
            transform: 'rotateX(-70deg) translateZ(12px)',
            transformOrigin: 'bottom center'
          }}
          className="relative py-4 preserve-3d"
        >
          {/* Sweeping Moving Stage Laser / Spotlight Beams */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none h-28 -top-12">
            <div className="absolute bottom-0 left-1/4 w-12 h-32 bg-gradient-to-t from-iris/60 via-purple-500/20 to-transparent blur-md animate-laser-sweep-1" />
            <div className="absolute bottom-0 right-1/4 w-12 h-32 bg-gradient-to-t from-emerald-400/50 via-teal-400/20 to-transparent blur-md animate-laser-sweep-2" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-36 bg-gradient-to-t from-saffron/40 via-amber-300/15 to-transparent blur-lg" />
          </div>

          {/* Upright Monolithic Stage Screen Wall */}
          <div className="h-16 w-full rounded-2xl border-2 border-iris/70 bg-gradient-to-b from-void-surface via-zinc-900 to-void-card shadow-ambient-stage relative overflow-hidden flex flex-col items-center justify-center p-3 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-iris/30 via-transparent to-transparent pointer-events-none" />
            
            {/* Stage Acoustic Status */}
            <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest uppercase text-bone z-10 font-bold">
              <span className="w-2 h-2 rounded-full bg-verdant animate-ping" />
              <span>MAIN ACOUSTIC STAGE • DOLBY ATMOS 3D</span>
              <Sparkles className="w-3.5 h-3.5 text-saffron" />
            </div>
            <span className="text-[9px] font-mono text-silver tracking-wider uppercase mt-0.5">
              Front-Row Direct Line-Of-Sight Apex (Viewing Distance: 8m)
            </span>
          </div>
        </div>
      ) : (
        /* 2D Flat Curved Neon Stage Arc */
        <div className="relative py-4">
          <div className="h-8 w-full border-t-2 border-iris rounded-t-[140px] shadow-ambient-stage relative overflow-hidden bg-gradient-to-b from-iris/25 to-transparent">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
          </div>

          <div className="flex items-center justify-center space-x-2 text-[11px] font-mono tracking-widest uppercase text-silver pt-2">
            <Radio className="w-3.5 h-3.5 text-iris animate-pulse" />
            <span>STAGE // LIVE SOUNDBOOTH & ACOUSTIC APEX</span>
            <Sparkles className="w-3.5 h-3.5 text-saffron" />
          </div>
        </div>
      )}
    </div>
  );
}
