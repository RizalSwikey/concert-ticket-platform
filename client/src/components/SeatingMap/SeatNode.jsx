import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Lock, Clock } from 'lucide-react';

export default function SeatNode({ seat, isSelected, onToggle, onHover }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const reduce = useReducedMotion();

  const formatIDR = (num) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);

  const isLocked = seat.status === 'LOCKED';
  const isBooked = seat.status === 'BOOKED';
  const isMine = isSelected || seat.isLockedByMe;
  const blocked = isBooked || (isLocked && !seat.isLockedByMe);

  // State reads from tokens, so light/dark stay in sync automatically.
  let stateClasses = 'border-[var(--seat-available-border)] text-[var(--seat-available-text)]';
  if (isMine) {
    stateClasses = 'bg-iris border-iris text-white ring-2 ring-iris/40 z-10';
  } else if (isLocked) {
    stateClasses =
      'bg-[var(--seat-locked-bg)] border-dashed border-[var(--seat-locked-border)] text-[var(--seat-locked-text)] cursor-not-allowed';
  } else if (isBooked) {
    stateClasses =
      'bg-[var(--seat-booked-bg)] border-[var(--seat-booked-border)] text-[var(--seat-booked-text)] opacity-40 cursor-not-allowed';
  } else {
    stateClasses += ' hover:border-iris hover:text-bone cursor-pointer';
  }

  const handleClick = (e) => {
    e.stopPropagation();
    if (blocked) return;
    onToggle(seat);
  };

  return (
    <div
      className="relative flex items-center justify-center w-full"
      onMouseEnter={() => {
        setShowTooltip(true);
        onHover?.(seat);
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button
        type="button"
        disabled={blocked}
        onClick={handleClick}
        whileHover={blocked || reduce ? undefined : { scale: 1.08 }}
        whileTap={blocked || reduce ? undefined : { scale: 0.94 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        className={`w-full aspect-square rounded-full border flex items-center justify-center text-[10px] sm:text-xs font-mono font-semibold select-none transition-colors ${stateClasses}`}
        aria-label={`Seat ${seat.seatNumber}, ${seat.tier}, ${
          isMine ? 'selected' : isLocked ? 'held' : isBooked ? 'sold' : 'available'
        }`}
        aria-pressed={isMine}
      >
        {isLocked && !seat.isLockedByMe ? (
          <Lock className="w-3 h-3" />
        ) : isBooked ? (
          <span aria-hidden="true">×</span>
        ) : (
          <span>{seat.number}</span>
        )}
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-48 p-3 rounded-lg bg-void-surface border border-void-border text-left space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-bone">{seat.seatNumber}</span>
              <span className="label-mono text-saffron">{seat.tier}</span>
            </div>
            <p className="font-mono text-[11px] text-ash">{formatIDR(seat.price)}</p>
            <p className="font-mono text-[10px] flex items-center justify-between">
              <span className="text-ash">Status</span>
              <span
                className={
                  isMine
                    ? 'text-iris'
                    : isLocked
                    ? 'text-saffron'
                    : isBooked
                    ? 'text-ash'
                    : 'text-bone'
                }
              >
                {isSelected ? (
                  'Selected'
                ) : seat.isLockedByMe ? (
                  'Held by you'
                ) : isLocked ? (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {seat.remainingSeconds || 600}s
                  </span>
                ) : isBooked ? (
                  'Sold'
                ) : (
                  'Available'
                )}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
