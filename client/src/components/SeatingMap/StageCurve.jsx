import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Radio } from 'lucide-react';

export default function StageCurve() {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 text-center relative">
      {/* Ambient Moving Stage Spotlights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -top-8 h-36">
        <div className="absolute top-0 left-1/4 w-24 h-32 bg-gradient-to-b from-iris/35 to-transparent blur-2xl animate-laser-sweep-1" />
        <div className="absolute top-0 right-1/4 w-24 h-32 bg-gradient-to-b from-emerald-400/30 to-transparent blur-2xl animate-laser-sweep-2" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-iris/30 blur-3xl rounded-full" />
      </div>

      {/* Majestic Curved Stage Arc (Smooth Vector SVG) */}
      <div className="relative py-2">
        <svg
          className="w-full h-16 sm:h-20 drop-shadow-[0_8px_24px_rgba(128,82,255,0.35)]"
          viewBox="0 0 800 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="stageGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8052ff" stopOpacity="0.15" />
              <stop offset="25%" stopColor="#8052ff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#15846e" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#15846e" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="stageFillGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#8052ff" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#8052ff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Stage Area Fill */}
          <path
            d="M 50 110 Q 400 10 750 110 L 720 118 Q 400 28 80 118 Z"
            fill="url(#stageFillGrad)"
          />

          {/* Crisp Neon Stage Edge Line */}
          <path
            d="M 50 110 Q 400 10 750 110"
            stroke="url(#stageGlowGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Subtle Outer Neon Halo */}
          <path
            d="M 50 110 Q 400 10 750 110"
            stroke="#8052ff"
            strokeWidth="8"
            strokeOpacity="0.25"
            strokeLinecap="round"
            className="blur-sm"
          />
        </svg>

        {/* Stage Audio Apex Indicators */}
        <div className="flex items-center justify-center space-x-2 text-xs font-mono tracking-widest uppercase text-silver pt-1">
          <Radio className="w-3.5 h-3.5 text-iris animate-pulse" />
          <span className="font-semibold text-bone">MAIN STAGE // LIVE SOUNDBOOTH & ACOUSTIC APEX</span>
          <Sparkles className="w-3.5 h-3.5 text-saffron" />
        </div>
      </div>
    </div>
  );
}
