import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { motion, useReducedMotion } from 'framer-motion';
import { X, CheckCircle, Calendar, MapPin, Download, RotateCw, Navigation, Hash } from 'lucide-react';


export default function TicketModal({ order, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (order?.qrTicketCode) {
      QRCode.toDataURL(order.qrTicketCode, {
        width: 240,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      })
        .then(setQrDataUrl)
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, [order, reduce]);

  // ponytail: clamp to ±18° and sweep the glare opposite the tilt; rAF spring only if WebGL is ever added
  const handlePointer = (clientX, clientY, limit = 18) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = Math.max(-limit, Math.min(limit, ((clientY - rect.top - centerY) / centerY) * -limit));
    const rotateY = Math.max(-limit, Math.min(limit, ((clientX - rect.left - centerX) / centerX) * limit));

    setRotate({ x: rotateX, y: rotateY });
    setGlarePos({ x: 50 - (rotateY / limit) * 40, y: 50 - (rotateX / limit) * 40 });
  };

  const handleMouseMove = (e) => handlePointer(e.clientX, e.clientY);
  const handleTouchMove = (e) => {
    if (e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY, 16);
  };
  const handleReset = () => {
    setRotate({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  if (!order) return null;

  const formattedDate = new Date(order.concertDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formatIDR = (num) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);

  const orderNumber = order.orderNumber || order.id || '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-void/90"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm perspective-1200 z-10 my-auto py-2">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full"
        >
          {/* Rotation lives on a plain node: framer-motion owns `transform` on
              its own elements and would overwrite the tilt. */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleReset}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleReset}
            style={{
              transform: `rotateY(${isFlipped ? 180 + rotate.y : rotate.y}deg) rotateX(${
                isFlipped ? -rotate.x : rotate.x
              }deg)`,
              transition: isFlipped
                ? 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
                : 'transform 0.12s ease-out'
            }}
            className="w-full relative preserve-3d"
          >
          {/* ============ FRONT ============ */}
          <div
            className="relative w-full rounded-lg bg-void-surface border border-void-border preserve-3d"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            {/* Holographic foil glare — moves opposite the tilt */}
            <div
              className="absolute inset-0 pointer-events-none rounded-lg z-30"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.16) 0%, rgba(128,82,255,0.14) 40%, transparent 75%)`,
                transform: 'translateZ(10px)'
              }}
            />

            <div className="p-6 space-y-5">
              <div
                className="flex items-start justify-between gap-4"
                style={{ transform: 'translateZ(30px)' }}
              >
                <div className="space-y-1">
                  <span className="label-mono text-saffron">{order.concertArtist}</span>
                  <h2
                    className="text-xl text-bone leading-tight"
                    style={{ fontWeight: 500, letterSpacing: '-0.03em' }}
                  >
                    {order.concertTitle}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close ticket"
                  className="p-1 text-ash hover:text-bone transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                className="space-y-1.5 font-mono text-[11px] text-ash"
                style={{ transform: 'translateZ(30px)' }}
              >
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{order.concertVenue}</span>
                </p>
                <p className="flex items-center gap-2 text-bone">
                  <Hash className="w-3.5 h-3.5" />
                  {orderNumber}
                </p>
              </div>

              <div
                className="flex items-end justify-between gap-3"
                style={{ transform: 'translateZ(30px)' }}
              >
                <div className="flex flex-wrap gap-1.5">
                  {order.seats.map((seatNum, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-iris text-white font-mono text-[11px] font-semibold"
                    >
                      {seatNum}
                    </span>
                  ))}
                </div>
                <span className="font-mono text-xs text-saffron shrink-0">
                  {formatIDR(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Perforated divider with notch cutouts at the canvas edge */}
            <div className="relative">
              <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-void z-20" />
              <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-void z-20" />
              <div className="border-t border-dashed border-void-border mx-6" />
            </div>

            {/* QR stub, floating above the card face */}
            <div className="p-6 pt-5" style={{ transform: 'translateZ(45px)' }}>
              <div className="flex justify-center">
                <div className="p-2 bg-white rounded">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="E-ticket QR code"
                      className="w-36 h-36 object-contain"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center text-[11px] font-mono text-zinc-500">
                      Generating…
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-3 text-center font-mono text-[10px] text-ash tracking-widest uppercase break-all">
                {order.qrTicketCode}
              </p>

              <p className="mt-2 flex items-center justify-center gap-1.5 label-mono text-ash">
                <CheckCircle className="w-3 h-3" />
                Verified admission
              </p>
            </div>

            <div className="flex items-center gap-2 px-6 pb-6" style={{ transform: 'translateZ(30px)' }}>
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="flex-1 py-2.5 rounded-full bg-iris hover:bg-iris-hover text-white label-mono font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Flip
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-full border border-void-border text-ash hover:text-bone label-mono transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="sr-only">Print ticket</span>
              </button>
            </div>
          </div>

          {/* ============ BACK ============ */}
          <div
            className="absolute inset-0 w-full h-full rounded-lg bg-void-surface border border-void-border p-6 flex flex-col justify-between gap-4 overflow-hidden preserve-3d"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div className="flex items-start justify-between gap-4" style={{ transform: 'translateZ(30px)' }}>
              <div className="space-y-1">
                <span className="label-mono text-ash flex items-center gap-1.5">
                  <Navigation className="w-3 h-3" />
                  Venue map &amp; entry
                </span>
                <h3 className="text-sm text-bone">Gate instructions</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close ticket"
                className="p-1 text-ash hover:text-bone transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 my-auto py-3" style={{ transform: 'translateZ(30px)' }}>
              <div className="space-y-2">
                <div className="flex items-center justify-between label-mono text-ash">
                  <span>Gate navigation</span>
                  <span className="text-bone">East entrance</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                  <div className="border border-iris rounded p-2 text-bone">
                    <span className="block">Gate A · VIP</span>
                    <span className="block text-ash">Fast-track soundbooth</span>
                  </div>
                  <div className="border border-void-border rounded p-2 text-bone">
                    <span className="block">Gate B · General</span>
                    <span className="block text-ash">CAT 1 &amp; CAT 2</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="label-mono text-saffron">Gate protocol</span>
                <ul className="font-mono text-[10px] text-ash space-y-1 list-disc list-inside leading-relaxed">
                  <li>Display QR at the digital turnstile reader.</li>
                  <li>Government ID matching the booking name.</li>
                  <li>Anti-passback active: single scan only.</li>
                </ul>
              </div>

              <div className="space-y-1">
                <span className="label-mono text-ash">Order hash</span>
                <p className="font-mono text-[9px] text-ash break-all select-all border border-void-border rounded p-1.5">
                  sha256:{order._id || order.id || 'reserva_atomic_lock_pass'}_verified_0x8f4c2e
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2" style={{ transform: 'translateZ(30px)' }}>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="flex-1 py-2.5 rounded-full bg-iris hover:bg-iris-hover text-white label-mono font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Back to QR
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-void-border text-ash hover:text-bone label-mono transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
        </motion.div>
      </div>
    </div>
  );
}
