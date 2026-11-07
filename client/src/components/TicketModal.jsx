import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { X, CheckCircle, Calendar, MapPin, Download, Sparkles, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TicketModal({ order, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
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

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Void Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-void/85 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Holographic 3D Pass Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: 'transform 0.15s ease-out'
        }}
        className="relative w-full max-w-md rounded-3xl bg-void-surface border border-iris/50 shadow-iris-glow p-6 sm:p-8 z-10 space-y-6 overflow-hidden"
      >
        {/* Holographic Shimmer Sheen Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-iris/15 via-white/5 to-emerald-400/15 pointer-events-none rounded-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-void-border relative z-10">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-full bg-verdant/20 border border-verdant/40 flex items-center justify-center text-verdant shadow-sm shadow-verdant/20">
              <CheckCircle className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono tracking-wider text-verdant uppercase font-semibold">
                PAYMENT CONFIRMED
              </span>
              <h3 className="text-base font-medium text-bone">Official Digital Pass</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-silver hover:text-bone transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Holographic Concert Boarding Pass */}
        <div className="relative rounded-2xl bg-void-card/90 border border-void-border overflow-hidden z-10">
          {/* Top Half: Event Details */}
          <div className="p-6 space-y-4">
            <div>
              <span className="text-xs font-mono text-saffron uppercase tracking-wider font-semibold">
                {order.concertArtist}
              </span>
              <h2 className="text-xl font-normal tracking-tight text-bone mt-1">
                {order.concertTitle}
              </h2>
            </div>

            <div className="space-y-1.5 text-xs text-silver font-light">
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
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-ash uppercase block mb-1">
                  Reserved Seats
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

          {/* PERFORATED TICKET TEAR-LINE WITH CIRCULAR NOTCHES */}
          <div className="relative border-b-2 border-dashed border-void-border my-1">
            <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-void-surface border-r border-void-border" />
            <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-void-surface border-l border-void-border" />
          </div>

          {/* Bottom Half: Holographic QR Pass */}
          <div className="p-6 flex flex-col items-center justify-center space-y-3 bg-void-card/60">
            <div className="p-3 bg-white rounded-2xl shadow-xl border border-white/20">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Official E-Ticket QR Code"
                  className="w-36 h-36 object-contain rounded-lg"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-xs font-mono text-zinc-500">
                  Generating QR...
                </div>
              )}
            </div>

            <span className="font-mono text-[10px] text-silver tracking-widest uppercase">
              {order.qrTicketCode}
            </span>

            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-verdant bg-verdant/10 px-3 py-1 rounded-full border border-verdant/30">
              <Shield className="w-3 h-3 text-verdant" />
              <span>OFFICIALLY VERIFIED • AUTHENTIC TICKET PASS</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-full bg-void-surface hover:bg-zinc-800 text-silver hover:text-bone border border-void-border text-xs font-semibold tracking-wide uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save / Print Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full bg-iris hover:bg-iris-hover text-white text-xs font-semibold tracking-wide uppercase shadow-iris-glow transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
