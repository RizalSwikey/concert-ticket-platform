import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, Calendar, MapPin, QrCode, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import TicketModal from './TicketModal';

const formatIDR = (num) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

function TicketStub({ order, seatList, onOpen }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative rounded-lg border border-void-border overflow-hidden"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span className="label-mono text-saffron">{order.concertArtist}</span>
            <h3 className="text-lg text-bone truncate" style={{ fontWeight: 500 }}>
              {order.concertTitle}
            </h3>
          </div>
          <ShieldCheck className="w-4 h-4 text-ash shrink-0" />
        </div>

        <div className="space-y-1 font-mono text-[11px] text-ash">
          <p className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(order.concertDate)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{order.concertVenue}</span>
          </p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {seatList.map((seatNum, idx) => (
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

      {/* Perforated stub line with canvas-coloured notches */}
      <div className="relative">
        <span className="absolute -left-2.5 -top-2.5 w-5 h-5 rounded-full bg-void z-10" />
        <span className="absolute -right-2.5 -top-2.5 w-5 h-5 rounded-full bg-void z-10" />
        <div className="border-t border-dashed border-void-border mx-5" />
      </div>

      <div className="px-5 py-3 flex items-center justify-between gap-3">
        <span className="label-mono text-ash truncate">#{order.orderNumber}</span>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-iris hover:bg-iris-hover text-white label-mono font-semibold transition-colors cursor-pointer shrink-0"
        >
          <QrCode className="w-3 h-3" />
          Pass
        </button>
      </div>
    </motion.div>
  );
}

export default function MyTicketsView({ onExploreClick }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const reduce = useReducedMotion();

  const fetchOrders = async () => {
    setLoading(true);
    let localList = [];
    try {
      const raw = localStorage.getItem('reserva_orders');
      if (raw) localList = JSON.parse(raw);
    } catch (e) {
      /* local orders are best-effort only */
    }

    let backendList = [];
    if (isAuthenticated) {
      try {
        const res = await api.getMyOrders();
        if (res.success && Array.isArray(res.data)) backendList = res.data;
      } catch (err) {
        console.warn('Could not fetch user orders:', err);
      }
    }

    const orderMap = new Map();
    localList.forEach((o) => orderMap.set(o.orderNumber || o.id || o._id, o));
    backendList.forEach((o) => orderMap.set(o.orderNumber || o.id || o._id, o));
    setOrders(Array.from(orderMap.values()));
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated && orders.length === 0 && !loading) {
    return (
      <div className="py-24 max-w-sm space-y-6">
        <Ticket className="w-6 h-6 text-ash" />
        <div className="space-y-2">
          <h2 className="display-lg text-bone">WALLET LOCKED</h2>
          <p className="text-sm font-light text-ash leading-relaxed">
            Sign in to see the passes issued to your account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAuthModal('signin')}
          className="px-7 py-3 rounded-full bg-iris hover:bg-iris-hover text-white label-mono font-semibold transition-colors cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-void-border pb-6">
        <div className="space-y-3">
          <span className="label-mono text-ash">Digital ticket wallet</span>
          <h2 className="display-lg text-bone">
            MY
            <br />
            PASSES
          </h2>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="flex items-center gap-2 label-mono text-ash hover:text-bone transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loading && !reduce ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 rounded-lg bg-void-elevated animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 space-y-5">
          <Ticket className="w-6 h-6 text-ash" />
          <h3 className="text-xl text-bone" style={{ fontWeight: 500 }}>
            No passes yet
          </h3>
          <p className="text-sm font-light text-ash max-w-[46ch] leading-relaxed">
            Reserve seats from the interactive map, then check out to issue a digital pass.
          </p>
          <button
            type="button"
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-iris hover:bg-iris-hover text-white label-mono font-semibold transition-colors cursor-pointer"
          >
            Browse shows
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => {
            const concertTitle = order.concertTitle || order.concertId?.title || 'Stadium Concert';
            const concertArtist = order.concertArtist || order.concertId?.artist || 'Headliner';
            const concertVenue = order.concertVenue || order.concertId?.venue || 'Stadium Arena';
            const concertDate = order.concertDate || order.concertId?.date || new Date().toISOString();
            const seatList = Array.isArray(order.seats)
              ? order.seats.map((s) => (typeof s === 'string' ? s : s.seatNumber))
              : [];

            const normalised = {
              ...order,
              concertTitle,
              concertArtist,
              concertVenue,
              concertDate,
              seats: seatList
            };

            return (
              <TicketStub
                key={order._id || order.id}
                order={normalised}
                seatList={seatList}
                onOpen={() => setSelectedTicket(normalised)}
              />
            );
          })}
        </div>
      )}

      {selectedTicket && (
        <TicketModal order={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </div>
  );
}
