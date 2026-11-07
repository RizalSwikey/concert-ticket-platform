import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Clock, CreditCard, ShieldCheck, AlertCircle, QrCode, Building2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const PAYMENT_METHODS = [
  { id: 'MOCK_QRIS', name: 'Instant QRIS', subtext: 'GoPay, OVO, ShopeePay, Dana', icon: QrCode },
  { id: 'MOCK_VA', name: 'Virtual Account', subtext: 'BCA, Mandiri, BNI, BRI', icon: Building2 },
  { id: 'MOCK_CC', name: 'Credit / Debit Card', subtext: 'Visa, Mastercard, JCB', icon: CreditCard }
];

export default function CheckoutDrawer({
  isOpen,
  onClose,
  concert,
  lockedSeats,
  expiresInSeconds,
  onCheckoutSuccess
}) {
  const { user, openAuthModal, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [timeLeft, setTimeLeft] = useState(expiresInSeconds || 600);
  const [selectedPayment, setSelectedPayment] = useState('MOCK_QRIS');
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
  const adminFee = 0; // Waived in platform promotion
  const grandTotal = subtotal + adminFee;

  const handleConfirmPay = async () => {
    if (submitting) return;

    if (!isAuthenticated) {
      openAuthModal('signin', async () => {
        // Post sign in resume
      });
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.checkout(
        concert._id,
        lockedSeats.map((s) => s._id),
        selectedPayment
      );

      if (res.success && res.order) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#8052ff', '#15846e', '#ffb829']
        });

        addToast({
          type: 'success',
          title: 'Passes Issued Successfully',
          message: `Order #${res.order.orderNumber} confirmed! E-Ticket issued with QR code.`
        });

        onCheckoutSuccess(res.order);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed. Lock may have expired.');
      addToast({
        type: 'error',
        title: 'Checkout Failed',
        message: err.message || 'Seats lock expired.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-void/75 backdrop-blur-md transition-opacity"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-void-surface border-l border-void-border p-6 sm:p-8 rounded-l-3xl backdrop-blur-2xl shadow-2xl flex flex-col justify-between overflow-y-auto z-10"
          >
            {/* Top Bar: Header & Countdown */}
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
                    <span className="text-bone font-medium">Seats Held Exclusively</span>
                    <p className="text-[10px] text-silver font-light">
                      Time remaining to complete payment
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

              {/* Selected Seats Breakdown */}
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
              <div className="space-y-3 mb-6">
                <span className="text-[11px] font-mono uppercase text-ash tracking-wider block">
                  Select Payment Method
                </span>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = selectedPayment === pm.id;
                    return (
                      <div
                        key={pm.id}
                        onClick={() => setSelectedPayment(pm.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs font-mono ${
                          isSelected
                            ? 'bg-void-card border-iris shadow-sm text-bone'
                            : 'bg-void-card/50 border-void-border text-silver hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-iris/20 text-iris' : 'bg-white/5 text-ash'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-bone font-medium">{pm.name}</p>
                            <p className="text-[10px] text-zinc-500 font-light">{pm.subtext}</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? 'border-iris bg-iris text-white' : 'border-white/20'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Total & Primary Action Button */}
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
                  <span>Convenience Fee:</span>
                  <span className="text-verdant">IDR 0 (Waived)</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-bone pt-2 border-t border-white/5">
                  <span>Grand Total:</span>
                  <span className="text-iris font-mono">{formatIDR(grandTotal)}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmPay}
                disabled={submitting || timeLeft <= 0 || lockedSeats.length === 0}
                className="w-full py-4 rounded-full bg-iris hover:bg-iris-hover text-white text-xs font-semibold tracking-wide uppercase shadow-iris-glow hover:shadow-iris transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Processing Payment...'
                    : timeLeft <= 0
                    ? 'Lock Expired'
                    : `Confirm & Pay ${formatIDR(grandTotal)}`}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
