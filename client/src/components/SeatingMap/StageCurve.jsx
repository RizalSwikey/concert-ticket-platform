import React from 'react';

export default function StageCurve() {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10 text-center">
      <div className="relative py-4">
        {/* Curved Glowing Stage Boundary */}
        <div className="h-6 w-full border-t-2 border-iris/80 rounded-t-[100px] shadow-ambient-stage relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-iris/20 to-transparent" />
        </div>
        <div className="text-[11px] font-mono tracking-widest uppercase text-silver pt-1">
          STAGE // LIVE SOUNDBOOTH & PERFORMANCE PLATFORM
        </div>
      </div>
    </div>
  );
}
