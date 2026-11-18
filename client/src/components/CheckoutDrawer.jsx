import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  const { openAuthModal, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [timeLeft, setTimeLeft] = useState(expiresInSeconds || 600);
  const [selectedPayment, setSelectedPayment] = useState('MOCK_QRIS');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const reduce = useReducedMotion();

  useEffect(() => {
    setTimeLeft(expiresInSeconds || 600);
  }, [expiresInSeconds]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatIDR = (num) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);

  const subtotal = lockedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleConfirmPay = async () => {
    if (submitting) return;

    if (!isAuthenticated) {
      openAuthModal('signin', async () => {});
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
          colors: ['#8052ff', '#15846e', '#ffb829', '#ffffff']
        });

        addToast({
          type: 'success',
          title: 'Passes issued',
          message: `Order #${res.order.orderNumber} confirmed. E-ticket issued with QR code.`
        });

        onCheckoutSuccess(res.order);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed. Lock may have expired.');
      addToast({
        type: 'error',
        title: 'Checkout failed',
        message: err.message || 'Seat lock expired.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-stretch justify-center md:justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-void/85"
            onClick={onClose}
          />

          <motion.div
            initial={reduce ? false : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="dialog"
            aria-label="Checkout"
            className="relative w-full max-w-md bg-void border-t md:border-t-0 md:border-l border-void-border flex flex-col justify-between max-h-[90vh] md:max-h-full overflow-y-auto z-10"
          >
            <div className="p-5 sm:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="label-mono text-ash">Reservation checkout</span>
                  <h2 className="text-xl text-bone" style={{ fontWeight: 500, letterSpacing: '-0.03em' }}>
                    Review &amp; confirm
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close checkout"
                  className="p-1.5 text-ash hover:text-bone transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Countdown: one saffron line */}
              <div className="flex items-center justify-between border-y border-void-border py-3">
                <span className="label-mono text-ash flex items-center gap-2">
                  <Clock className={`w-3.5 h-3.5 ${reduce ? '' : 'animate-pulse'}`} />
                  Seats held
                </span>
                <span
                  className={`font-mono text-base tabular-nums ${
                    timeLeft < 60 ? 'text-saffron' : 'text-bone'
                  }`}
                >
                  {formatTimer(timeLeft)}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm text-bone">{concert.title}</h3>
                <p className="label-mono text-ash">{concert.venue}</p>
              </div>

              {/* Seats: mono chips */}
              <div className="space-y-2">
                <span className="label-mono text-ash">
                  Allocated seats ({lockedSeats.length})
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {lockedSeats.map((seat) => (
                    <div
                      key={seat._id}
                      className="flex items-center justify-between font-mono text-xs border-b border-void-border pb-2 last:border-0"
                    >
                      <span className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-iris text-white text-[11px]">
                          {seat.seatNumber}
                        </span>
                        <span className="text-ash">{seat.tier}</span>
                      </span>
                      <span className="text-bone">{formatIDR(seat.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment methods: hairline rows, no fill */}
              <div className="space-y-2">
                <span className="label-mono text-ash">Payment method</span>
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = selectedPayment === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPayment(pm.id)}
                      aria-pressed={isSelected}
                      className={`w-full flex items-center justify-between gap-3 py-3 px-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        isSelected ? 'border-iris' : 'border-void-border hover:border-iris/40'
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-iris' : 'text-ash'}`} />
                        <span className="min-w-0">
                          <span className="block font-mono text-xs text-bone">{pm.name}</span>
                          <span className="block text-[11px] font-light text-ash truncate">
                            {pm.subtext}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-iris bg-iris text-white' : 'border-void-border'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sticky summary band */}
            <div className="sticky bottom-0 bg-void border-t border-void-border p-5 sm:px-8 space-y-3">
              {errorMsg && (
                <p className="flex items-center gap-2 text-[11px] font-mono text-saffron">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errorMsg}
                </p>
              )}

              <div className="flex items-baseline justify-between">
                <span className="label-mono text-ash">Total</span>
                <span className="font-mono text-lg text-bone">{formatIDR(subtotal)}</span>
              </div>

              <button
                type="button"
                onClick={handleConfirmPay}
                disabled={submitting || timeLeft <= 0 || lockedSeats.length === 0}
                className="w-full py-3.5 rounded-full bg-iris hover:bg-iris-hover text-white label-mono font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Processing'
                    : timeLeft <= 0
                    ? 'Lock expired'
                    : `Pay ${formatIDR(subtotal)}`}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
