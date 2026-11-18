import React from 'react';

export default function StageCurve() {
  return (
    <div className="w-full max-w-3xl mx-auto text-center space-y-2">
      <svg
        className="w-full h-10 sm:h-12"
        viewBox="0 0 800 120"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 50 110 Q 400 12 750 110"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-bone"
          opacity="0.55"
        />
      </svg>

      <p className="label-mono text-ash">MAIN STAGE — LIVE SOUNDBOOTH</p>
    </div>
  );
}
