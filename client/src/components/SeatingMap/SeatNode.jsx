import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Lock, Clock } from 'lucide-react';

export default function SeatNode({
  seat,
  isSelected,
  onToggle,
  onHover
}) {
  const { isDark } = useTheme();
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

  // Exact dual-theme high-contrast seat states
  let stateClasses = '';

  if (isSelected || isLockedByMe) {
    stateClasses = isDark
      ? 'bg-[#8052FF] text-white border-white shadow-iris-glow border z-10'
      : 'bg-[#6328FF] text-white border-[#4B15E0] shadow-md border z-10';
  } else if (isLocked) {
    stateClasses = isDark
      ? 'bg-[#FFB829]/20 border border-[#FFB829] text-[#FFB829] cursor-not-allowed'
      : 'bg-[#FEF3C7] border border-[#F59E0B] text-[#B45309] font-semibold cursor-not-allowed';
  } else if (isBooked) {
    stateClasses = isDark
      ? 'bg-[#15846E]/25 border border-[#15846E] text-[#15846E] cursor-not-allowed'
      : 'bg-[#D1FAE5] border border-[#10B981] text-[#065F46] font-semibold cursor-not-allowed';
  } else {
    // Available
    stateClasses = isDark
      ? 'bg-[#18181B] border border-[#27272A] text-zinc-400 hover:border-[#8052FF] hover:text-white cursor-pointer'
      : 'bg-[#FFFFFF] border border-[#D4D4D8] text-[#3F3F46] hover:border-[#6328FF] hover:bg-[#F3EEFF] cursor-pointer';
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
      onMouseEnter={() => {
        setShowTooltip(true);
        onHover?.(seat);
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button
        type="button"
        disabled={isBooked || (isLocked && !isLockedByMe)}
        onClick={handleClick}
        whileHover={!isBooked && (!isLocked || isLockedByMe) ? { scale: 1.12 } : {}}
        whileTap={!isBooked && (!isLocked || isLockedByMe) ? { scale: 0.92 } : {}}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs font-mono font-semibold transition-colors relative select-none shrink-0 ${stateClasses}`}
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
            animate={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: 0.9, repeat: Infinity }}
            className="absolute inset-0 rounded-md border-2 border-iris pointer-events-none"
          />
        )}

        {isSelected || isLockedByMe ? (
          <span className="font-bold">{seat.number}</span>
        ) : isLocked ? (
          <Lock className="w-3.5 h-3.5 animate-pulse" />
        ) : isBooked ? (
          <span className="text-[9px] opacity-70">✕</span>
        ) : (
          <span>{seat.number}</span>
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
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-52 p-3 rounded-2xl bg-void-surface border border-void-border backdrop-blur-2xl shadow-2xl text-left space-y-1.5"
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
              <span className="text-silver">Status:</span>
              <span
                className={
                  isSelected || isLockedByMe
                    ? 'text-iris font-semibold'
                    : isLocked
                    ? 'text-saffron font-semibold flex items-center space-x-1'
                    : isBooked
                    ? 'text-verdant font-semibold'
                    : 'text-bone font-medium'
                }
              >
                {isSelected ? (
                  'Selected'
                ) : isLockedByMe ? (
                  'Held by You'
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
