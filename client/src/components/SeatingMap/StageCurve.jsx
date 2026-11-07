import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Radio } from 'lucide-react';

export default function StageCurve() {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10 text-center relative">
      {/* Radial Neon Halo Glow behind stage */}
      <motion.div
        animate={{
          opacity: [0.35, 0.65, 0.35],
          scale: [0.98, 1.05, 0.98]
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-iris/30 blur-2xl rounded-full pointer-events-none"
      />

      <div className="relative py-4">
        {/* Curved Glowing Neon Stage Boundary */}
        <div className="h-8 w-full border-t-2 border-iris rounded-t-[140px] shadow-ambient-stage relative overflow-hidden bg-gradient-to-b from-iris/25 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        </div>

        <div className="flex items-center justify-center space-x-2 text-[11px] font-mono tracking-widest uppercase text-silver pt-2">
          <Radio className="w-3.5 h-3.5 text-iris animate-pulse" />
          <span>STAGE // LIVE SOUNDBOOTH & ACOUSTIC APEX</span>
          <Sparkles className="w-3.5 h-3.5 text-saffron" />
        </div>
      </div>
    </div>
  );
}
