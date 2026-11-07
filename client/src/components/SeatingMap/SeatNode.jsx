import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Clock } from 'lucide-react';

export default function SeatNode({
  seat,
  isSelected,
  onToggle
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

  let stateClasses = 'bg-zinc-800/80 hover:bg-zinc-700 text-transparent border border-white/10 cursor-pointer';

  if (isSelected || isLockedByMe) {
    stateClasses = 'bg-iris text-white shadow-iris-glow border-bone cursor-pointer z-10';
  } else if (isLocked) {
    stateClasses = 'bg-saffron/20 border border-saffron/60 text-saffron cursor-not-allowed';
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
      <motion.button
        type="button"
        disabled={isBooked || (isLocked && !isLockedByMe)}
        onClick={handleClick}
        whileHover={!isBooked && (!isLocked || isLockedByMe) ? { scale: 1.18 } : {}}
        whileTap={!isBooked && (!isLocked || isLockedByMe) ? { scale: 0.85 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-[10px] font-mono font-medium transition-colors relative ${stateClasses}`}
        aria-label={`Seat ${seat.seatNumber}`}
      >
        {/* Breathing pulse ring for locked seats */}
        {isLocked && !isLockedByMe && (
          <motion.span
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.6, 0.1, 0.6]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-md border border-saffron pointer-events-none"
          />
        )}

        {/* Selected ripple ring */}
        {(isSelected || isLockedByMe) && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute inset-0 rounded-md border-2 border-iris pointer-events-none"
          />
        )}

        {isSelected || isLockedByMe ? (
          seat.number
        ) : isLocked ? (
          <Lock className="w-3 h-3 text-saffron animate-pulse" />
        ) : (
          <span className="opacity-0 hover:opacity-100 hover:text-white transition-opacity">
            {seat.number}
          </span>
        )}
      </motion.button>

      {/* Floating Animated Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-52 p-3 rounded-2xl bg-void-card/95 border border-void-border backdrop-blur-2xl shadow-2xl text-left space-y-1.5"
          >
            <div className="flex items-center justify-between border-b border-void-border pb-1.5">
              <span className="font-mono text-xs font-semibold text-bone">
                {seat.seatNumber}
              </span>
              <span className="text-[10px] font-mono text-saffron px-1.5 py-0.5 rounded-full bg-saffron/10 border border-saffron/20 font-semibold">
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
                    ? 'text-saffron font-semibold flex items-center space-x-1'
                    : isBooked
                    ? 'text-zinc-500'
                    : 'text-verdant font-semibold'
                }
              >
                {isSelected ? (
                  'Selected'
                ) : isLockedByMe ? (
                  'Locked by You'
                ) : isLocked ? (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-saffron" />
                    <span>Locked ({seat.remainingSeconds || 600}s)</span>
                  </span>
                ) : isBooked ? (
                  'Sold Out'
                ) : (
                  'Available'
                )}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
