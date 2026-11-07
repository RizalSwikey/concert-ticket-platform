import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Clock, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutDrawer({
  isOpen,
  onClose,
  concert,
  lockedSeats,
  expiresInSeconds,
  onCheckoutSuccess
}) {
  const { user, loginAsRecruiter } = useAuth();
  const [timeLeft, setTimeLeft] = useState(expiresInSeconds || 600);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Countdown timer synced with lock duration
  useEffect(() => {
    setTimeLeft(expiresInSeconds || 600);
  }, [expiresInSeconds]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const subtotal = lockedSeats.reduce((sum, s) => sum + s.price, 0);
  const adminFee = 0; // Waived for portfolio reviewer
  const grandTotal = subtotal + adminFee;

  const handleConfirmPay = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      // If user not authenticated, auto demo-login
      if (!user) {
        await loginAsRecruiter('Portfolio Reviewer (Auto-Login)');
      }

      const res = await api.checkout(
        concert._id,
        lockedSeats.map((s) => s._id),
        'MOCK_QRIS'
      );

      if (res.success && res.order) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onCheckoutSuccess(res.order);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed. Lock may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-void/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-void-surface border-l border-void-border p-6 sm:p-8 rounded-l-3xl backdrop-blur-2xl shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slideLeft">
        {/* Top Sticky Bar: Header & 10-Minute Countdown */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-void-border">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-iris uppercase font-semibold">
                RESERVATION CHECKOUT
              </span>
              <h2 className="text-xl font-normal tracking-tight text-bone">
                Review & Confirm Seats
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800 text-silver hover:text-bone transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Saffron Countdown Alert */}
          <div className="my-6 p-4 rounded-2xl bg-saffron/10 border border-saffron/30 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Clock className="w-4 h-4 text-saffron animate-spin" />
              <div className="text-xs">
                <span className="text-bone font-medium">Atomic Lock Active</span>
                <p className="text-[10px] text-silver font-light">
                  Seats reserved exclusively for you
                </p>
              </div>
            </div>
            <span
              className={`font-mono text-base font-bold ${
                timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-saffron'
              }`}
            >
              {formatTimer(timeLeft)}
            </span>
          </div>

          {/* Concert Info */}
          <div className="space-y-1 mb-6">
            <h4 className="text-sm font-medium text-bone">{concert.title}</h4>
            <p className="text-xs text-silver font-light">{concert.venue}</p>
          </div>

          {/* Selected Seats Itemized Breakdown */}
          <div className="space-y-3 mb-6">
            <span className="text-[11px] font-mono uppercase text-ash tracking-wider">
              Allocated Seats ({lockedSeats.length})
            </span>
            <div className="space-y-2">
              {lockedSeats.map((seat) => (
                <div
                  key={seat._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-void-card/60 border border-void-border text-xs font-mono"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-iris" />
                    <span className="text-bone font-medium">{seat.seatNumber}</span>
                    <span className="text-silver text-[11px]">({seat.tier})</span>
                  </div>
                  <span className="text-bone">{formatIDR(seat.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-4 rounded-2xl bg-void-card/60 border border-void-border space-y-2 mb-6">
            <span className="text-[11px] font-mono uppercase text-ash tracking-wider">
              Payment Method
            </span>
            <div className="flex items-center justify-between text-xs font-mono text-bone">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-iris" />
                <span>Simulated QRIS / Mock Wallet</span>
              </div>
              <span className="text-[10px] text-verdant bg-verdant/10 px-2 py-0.5 rounded-full border border-verdant/30">
                Instant Mock
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Total & Primary CTA */}
        <div className="pt-6 border-t border-void-border space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-silver">
              <span>Subtotal:</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-silver">
              <span>Admin Fee:</span>
              <span className="text-verdant">IDR 0 (Waived)</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-bone pt-2 border-t border-white/5">
              <span>Grand Total:</span>
              <span className="text-iris font-mono">{formatIDR(grandTotal)}</span>
            </div>
          </div>

          {/* Single Primary Action Button */}
          <button
            onClick={handleConfirmPay}
            disabled={submitting || timeLeft <= 0 || lockedSeats.length === 0}
            className="w-full py-4 rounded-full bg-iris hover:bg-iris-hover text-white text-xs font-semibold tracking-wide uppercase shadow-iris-glow hover:shadow-iris transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {submitting
                ? 'Processing Atomic Write...'
                : timeLeft <= 0
                ? 'Lock Expired'
                : `Confirm & Pay ${formatIDR(grandTotal)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
