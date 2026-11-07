import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, CheckCircle, Ticket, Calendar, MapPin, User, Download } from 'lucide-react';

export default function TicketModal({ order, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (order?.qrTicketCode) {
      QRCode.toDataURL(order.qrTicketCode, {
        width: 220,
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

  if (!order) return null;

  const formattedDate = new Date(order.concertDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-void/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Ticket Pass Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-void-surface border border-void-border shadow-2xl p-6 sm:p-8 z-10 space-y-6 overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-iris via-verdant to-saffron rounded-full" />

        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-void-border">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-full bg-verdant/20 border border-verdant/40 flex items-center justify-center text-verdant">
              <CheckCircle className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono tracking-wider text-verdant uppercase font-semibold">
                PAYMENT CONFIRMED
              </span>
              <h3 className="text-lg font-medium text-bone">Official E-Ticket Pass</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-silver hover:text-bone transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Digital Boarding Pass Ticket Body */}
        <div className="p-6 rounded-2xl bg-void-card border border-void-border space-y-6 relative overflow-hidden">
          {/* Concert Details */}
          <div>
            <span className="text-xs font-mono text-saffron uppercase tracking-wider font-semibold">
              {order.concertArtist}
            </span>
            <h2 className="text-xl font-normal tracking-tight text-bone mt-1">
              {order.concertTitle}
            </h2>
            <div className="flex items-center space-x-4 text-xs text-silver mt-2">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-ash" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-ash" />
                <span className="truncate">{order.concertVenue}</span>
              </div>
            </div>
          </div>

          {/* Seat Badges */}
          <div className="p-4 rounded-xl bg-void-surface border border-void-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-ash uppercase">
                Reserved Seats
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
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
              <span className="text-[10px] font-mono text-ash uppercase">
                Total Paid
              </span>
              <p className="text-sm font-mono font-semibold text-bone">
                {formatIDR(order.totalAmount)}
              </p>
            </div>
          </div>

          {/* QR Code Pass Centerpiece */}
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <div className="p-3 bg-white rounded-2xl shadow-lg border border-white/20">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Official E-Ticket QR Code"
                  className="w-40 h-40 object-contain rounded-lg"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs font-mono text-zinc-500">
                  Generating QR...
                </div>
              )}
            </div>
            <span className="font-mono text-[11px] text-silver tracking-widest uppercase">
              {order.qrTicketCode}
            </span>
          </div>

          {/* Verification Hash & Buyer */}
          <div className="pt-3 border-t border-void-border flex items-center justify-between text-[10px] font-mono text-ash">
            <span>Order #{order.orderNumber}</span>
            <span>Attendee: {order.userName}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-full bg-void-surface hover:bg-zinc-800 text-silver hover:text-bone border border-void-border text-xs font-semibold tracking-wide uppercase transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save / Print Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full bg-iris hover:bg-iris-hover text-white text-xs font-semibold tracking-wide uppercase shadow-iris-glow transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
