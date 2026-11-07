import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export default function SeatNode({
  seat,
  isSelected,
  onToggle,
  onConcurrencyTest
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const isAvailable = seat.status === 'AVAILABLE';
  const isLocked = seat.status === 'LOCKED';
  const isBooked = seat.status === 'BOOKED';
  const isLockedByMe = seat.isLockedByMe;

  // Visual styling calculation
  let stateClasses = 'bg-zinc-800/80 hover:bg-zinc-700 text-transparent border border-white/10 cursor-pointer';

  if (isSelected || isLockedByMe) {
    stateClasses = 'bg-iris text-white shadow-iris-glow scale-110 border-bone cursor-pointer z-10';
  } else if (isLocked) {
    stateClasses = 'bg-saffron/20 border border-saffron/50 text-saffron animate-pulse cursor-not-allowed';
  } else if (isBooked) {
    stateClasses = 'bg-zinc-900/60 border border-white/5 text-zinc-600 opacity-40 cursor-not-allowed';
  }

  const handleClick = (e) => {
    e.stopPropagation();
    if (isBooked || (isLocked && !isLockedByMe)) {
      return;
    }
    onToggle(seat);
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        disabled={isBooked || (isLocked && !isLockedByMe)}
        onClick={handleClick}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-[10px] font-mono font-medium transition-all ${stateClasses}`}
        aria-label={`Seat ${seat.seatNumber}`}
      >
        {isSelected || isLockedByMe ? (
          seat.number
        ) : isLocked ? (
          <Lock className="w-3 h-3 text-saffron" />
        ) : (
          <span className="opacity-0 hover:opacity-100 hover:text-white transition-opacity">
            {seat.number}
          </span>
        )}
      </button>

      {/* Floating Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-48 p-2.5 rounded-xl bg-void-card/95 border border-void-border backdrop-blur-xl shadow-2xl text-left space-y-1">
          <div className="flex items-center justify-between border-b border-void-border pb-1">
            <span className="font-mono text-xs font-semibold text-bone">
              {seat.seatNumber}
            </span>
            <span className="text-[10px] font-mono text-saffron px-1.5 py-0.5 rounded bg-saffron/10">
              {seat.tier}
            </span>
          </div>

          <div className="text-[11px] text-silver font-mono">
            {formatIDR(seat.price)}
          </div>

          <div className="text-[10px] font-mono flex items-center justify-between pt-0.5">
            <span className="text-ash">Status:</span>
            <span
              className={
                isSelected || isLockedByMe
                  ? 'text-iris font-semibold'
                  : isLocked
                  ? 'text-saffron font-semibold'
                  : isBooked
                  ? 'text-zinc-500'
                  : 'text-verdant font-semibold'
              }
            >
              {isSelected
                ? 'Selected'
                : isLockedByMe
                ? 'Locked by You'
                : isLocked
                ? `Locked (${seat.remainingSeconds || 600}s)`
                : isBooked
                ? 'Sold Out'
                : 'Available'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
