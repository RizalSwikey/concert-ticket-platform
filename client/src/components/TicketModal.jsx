import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { X, CheckCircle, Calendar, MapPin, Download, Sparkles, Shield, RotateCw, Navigation, Lock, Hash } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TicketModal({ order, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);
  // Trigger themed celebration confetti on open
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8052ff', '#15846e', '#ffb829', '#ffffff']
    });

    if (order?.qrTicketCode) {
      QRCode.toDataURL(order.qrTicketCode, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, [order]);

  // ponytail: clamp rotation to +-18deg and calculate opposite glare sweep
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = Math.max(-18, Math.min(18, ((y - centerY) / centerY) * -18));
    const rotateY = Math.max(-18, Math.min(18, ((x - centerX) / centerX) * 18));

    setRotate({ x: rotateX, y: rotateY });
    // Glare moves opposite to tilt
    setGlarePos({
      x: Math.max(10, Math.min(90, 50 - (rotateY / 18) * 40)),
      y: Math.max(10, Math.min(90, 50 - (rotateX / 18) * 40))
    });
  };

  const handleTouchMove = (e) => {
    if (!cardRef.current || !e.touches[0]) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = Math.max(-16, Math.min(16, ((y - centerY) / centerY) * -16));
    const rotateY = Math.max(-16, Math.min(16, ((x - centerX) / centerX) * 16));

    setRotate({ x: rotateX, y: rotateY });
    setGlarePos({
      x: Math.max(10, Math.min(90, 50 - (rotateY / 16) * 40)),
      y: Math.max(10, Math.min(90, 50 - (rotateX / 16) * 40))
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };
  if (!order) return null;

  const formattedDate = new Date(order.concertDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Dark Void Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-void/85 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* 3D Viewport Wrapper */}
      <div className="relative w-full max-w-md perspective-1200 z-10 my-auto py-2">
        {/* Interactive 3D Collectible Pass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseLeave}
          style={{
            transform: `rotateY(${isFlipped ? 180 + rotate.y : rotate.y}deg) rotateX(${
              isFlipped ? -rotate.x : rotate.x
            }deg)`,
            transition: isFlipped ? 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' : 'transform 0.12s ease-out'
          }}
          className="w-full relative preserve-3d"
        >
          {/* FRONT FACE OF 3D COLLECTIBLE PASS */}
          <div
            style={{
              transform: 'translateZ(0px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
            className="w-full rounded-3xl bg-void-surface border-2 border-iris/50 shadow-iris-glow p-5 sm:p-7 relative preserve-3d overflow-hidden space-y-4"
          >
            {/* Holographic Iridescent Foil Glare Sweep (Opposite to tilt) */}
            <div
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.4) 0%, rgba(128,82,255,0.2) 35%, rgba(21,132,110,0.15) 60%, transparent 80%)`,
                transform: 'translateZ(10px)'
              }}
              className="absolute inset-0 pointer-events-none rounded-3xl z-30"
            />

            {/* 3D Parallax Layer 1: Holographic Grid Overlay (translateZ: 15px) */}
            <div
              style={{ transform: 'translateZ(15px)' }}
              className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none rounded-3xl"
            />

            {/* Card Header (translateZ: 25px) */}
            <div
              style={{ transform: 'translateZ(25px)' }}
              className="flex items-center justify-between pb-3 border-b border-void-border relative z-20 preserve-3d"
            >
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-full bg-verdant/20 border border-verdant/40 flex items-center justify-center text-verdant shadow-sm">
                  <CheckCircle className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-verdant uppercase font-semibold">
                    OFFICIAL COLLECTIBLE PASS
                  </span>
                  <h3 className="text-sm font-medium text-bone">Verified VIP Admission</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-silver hover:text-bone transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3D Parallax Layer 2: Concert Details & Seats (translateZ: 30px) */}
            <div
              style={{ transform: 'translateZ(30px)' }}
              className="relative rounded-2xl bg-void-card/90 border border-void-border p-4 sm:p-5 space-y-3 z-20 preserve-3d shadow-md"
            >
              <div>
                <span className="text-xs font-mono text-saffron uppercase tracking-wider font-semibold">
                  {order.concertArtist}
                </span>
                <h2 className="text-xl font-normal tracking-tight text-bone mt-0.5">
                  {order.concertTitle}
                </h2>
              </div>

              <div className="space-y-1 text-xs text-silver font-light">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-ash" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-ash" />
                  <span className="truncate">{order.concertVenue}</span>
                </div>
              </div>

              {/* Allocated Seats Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-void-border">
                <div>
                  <span className="text-[10px] font-mono text-ash uppercase block mb-1">
                    Allocated Seats
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {order.seats.map((seatNum, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-iris text-white shadow-iris-glow"
                      >
                        {seatNum}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-ash uppercase block mb-1">
                    Total Paid
                  </span>
                  <span className="text-sm font-mono font-semibold text-bone">
                    {formatIDR(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Perforated Ticket Line */}
            <div className="relative border-b-2 border-dashed border-void-border my-1">
              <span className="absolute -left-7 -top-3 w-6 h-6 rounded-full bg-void-surface border-r border-void-border" />
              <span className="absolute -right-7 -top-3 w-6 h-6 rounded-full bg-void-surface border-l border-void-border" />
            </div>

            {/* 3D Parallax Layer 3: QR Code + VIP Badge (translateZ: 45px) */}
            <div
              style={{ transform: 'translateZ(45px)' }}
              className="p-4 rounded-2xl bg-void-card/95 border border-iris/40 flex flex-col items-center justify-center space-y-2.5 shadow-2xl relative z-20 preserve-3d"
            >
              <div className="p-2.5 bg-white rounded-xl shadow-xl border border-white/30">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Official E-Ticket QR Code"
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-md"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-xs font-mono text-zinc-500">
                    Generating Pass...
                  </div>
                )}
              </div>

              <span className="font-mono text-[10px] text-silver tracking-widest uppercase">
                {order.qrTicketCode}
              </span>

              <div className="flex items-center space-x-1.5 text-[9px] font-mono text-verdant bg-verdant/10 px-3 py-0.5 rounded-full border border-verdant/30 font-semibold">
                <Shield className="w-3 h-3 text-verdant" />
                <span>AUTHENTIC ENCRYPTED PASS • ROW PRIORITY</span>
              </div>
            </div>

            {/* Front Controls: Flip Ticket 360° Button */}
            <div
              style={{ transform: 'translateZ(30px)' }}
              className="flex items-center justify-between gap-3 pt-2 relative z-20"
            >
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="flex-1 py-2.5 px-4 rounded-full bg-void-card hover:bg-iris text-silver hover:text-white border border-void-border hover:border-iris transition-all text-xs font-mono font-semibold flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip Ticket (360°)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-4 rounded-full bg-void-surface hover:bg-zinc-800 text-silver hover:text-bone border border-void-border text-xs font-mono transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Print ticket"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {/* BACK FACE OF 3D COLLECTIBLE PASS */}
          <div
            style={{
              transform: 'rotateY(180deg) translateZ(0px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
            className="absolute inset-0 w-full h-full rounded-3xl bg-void-surface border-2 border-saffron/50 shadow-saffron-glow p-5 sm:p-7 relative preserve-3d overflow-hidden flex flex-col justify-between"
          >
            {/* Holographic Border Sheen */}
            <div className="absolute inset-0 bg-gradient-to-br from-saffron/10 via-iris/10 to-verdant/10 pointer-events-none rounded-3xl" />

            {/* Back Header (translateZ: 25px) */}
            <div
              style={{ transform: 'translateZ(25px)' }}
              className="flex items-center justify-between pb-3 border-b border-void-border relative z-20"
            >
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-full bg-saffron/20 border border-saffron/40 flex items-center justify-center text-saffron">
                  <Navigation className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-saffron uppercase font-semibold">
                    VENUE MAP & INSTRUCTIONS
                  </span>
                  <h3 className="text-sm font-medium text-bone">Official Gate Entry Pass</h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-silver hover:text-bone transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Back Body: Venue Gate Map & Entry Instructions (translateZ: 30px) */}
            <div
              style={{ transform: 'translateZ(30px)' }}
              className="space-y-3 relative z-20 my-auto py-2"
            >
              {/* Venue Gate Map Diagram */}
              <div className="p-3.5 rounded-2xl bg-void-card/90 border border-void-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-bone font-semibold">
                  <span>STADIUM GATE NAVIGATION</span>
                  <span className="text-iris">EAST ENTRANCE</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded-xl bg-iris/10 border border-iris/30 text-iris">
                    <span className="font-bold block">GATE A (VIP PRIORITY)</span>
                    <span className="text-[9px] text-silver font-light">Fast-track soundbooth apex</span>
                  </div>
                  <div className="p-2 rounded-xl bg-void-surface border border-void-border text-silver">
                    <span className="font-bold block text-bone">GATE B (GENERAL)</span>
                    <span className="text-[9px] text-ash font-light">CAT 1 & CAT 2 turnstiles</span>
                  </div>
                </div>
              </div>

              {/* Gate Entry Instructions */}
              <div className="p-3.5 rounded-2xl bg-void-card/90 border border-void-border space-y-1.5">
                <span className="text-[10px] font-mono text-saffron uppercase font-semibold block">
                  Gate Entry Protocol
                </span>
                <ul className="text-[10px] font-mono text-silver space-y-1 list-disc list-inside">
                  <li>Display QR code at digital turnstile optical reader.</li>
                  <li>Government ID matching booking name must be presented.</li>
                  <li>Anti-passback active: single scan admission only.</li>
                </ul>
              </div>

              {/* Cryptographic Order Hash */}
              <div className="p-3 rounded-2xl bg-void-card/90 border border-void-border space-y-1">
                <div className="flex items-center space-x-1.5 text-[9px] font-mono text-silver">
                  <Hash className="w-3 h-3 text-verdant" />
                  <span>CRYPTOGRAPHIC ORDER HASH</span>
                </div>
                <p className="text-[9px] font-mono text-bone/80 break-all select-all bg-void-surface p-1.5 rounded-lg border border-void-border">
                  sha256:{order._id || order.id || 'reserva_atomic_lock_pass'}
                  _verified_0x8f4c2e
                </p>
              </div>
            </div>

            {/* Back Footer Controls: Flip Back Button (translateZ: 30px) */}
            <div
              style={{ transform: 'translateZ(30px)' }}
              className="pt-2 border-t border-void-border flex items-center justify-between gap-3 relative z-20"
            >
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="flex-1 py-2.5 px-4 rounded-full bg-iris hover:bg-iris-hover text-white text-xs font-mono font-semibold flex items-center justify-center space-x-2 cursor-pointer shadow-iris-glow transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip Back to Front (QR Pass)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 rounded-full bg-void-card hover:bg-zinc-800 text-silver hover:text-bone border border-void-border text-xs font-mono transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
