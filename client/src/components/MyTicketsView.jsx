import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TicketModal from './TicketModal';
import { Ticket, Calendar, MapPin, QrCode, Download, ArrowRight, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';

function MyTicketCardItem({ order, formattedDate, seatList, formatIDR, onOpenModal }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (x - 0.5) * 14,
      y: -(y - 0.5) * 14,
      active: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, active: false });
  };

  return (
    <div className="perspective-1000 py-1">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: tilt.active
            ? `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(0px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transition: tilt.active ? 'transform 0.12s ease-out' : 'transform 0.4s ease-out'
        }}
        className="rounded-3xl bg-void-surface border border-void-border hover:border-iris/50 shadow-lg p-6 space-y-5 flex flex-col justify-between preserve-3d backdrop-blur-xl relative overflow-hidden group"
      >
        {/* Holographic Iridescent Light Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-iris/10 via-transparent to-verdant/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />

        <div style={{ transform: 'translateZ(20px)' }} className="preserve-3d space-y-3">
          {/* Status Banner */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-saffron px-2.5 py-0.5 rounded-full bg-saffron/10 border border-saffron/20 font-semibold">
              {order.concertArtist}
            </span>
            <div className="flex items-center space-x-1 text-[10px] font-mono text-verdant bg-verdant/10 px-2.5 py-0.5 rounded-full border border-verdant/30 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>OFFICIAL 3D PASS</span>
            </div>
          </div>

          {/* Concert Info */}
          <h3 className="text-xl font-normal tracking-tight text-bone">
            {order.concertTitle}
          </h3>

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
          <div className="pt-3 mt-3 border-t border-void-border flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-ash uppercase block mb-1">
                Allocated Seats ({seatList.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {seatList.map((seatNum, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-iris/20 text-iris border border-iris/40 shadow-sm"
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

        {/* Footer Actions */}
        <div
          style={{ transform: 'translateZ(25px)' }}
          className="pt-3 border-t border-void-border flex items-center justify-between z-10"
        >
          <span className="text-[10px] font-mono text-ash">
            Order #{order.orderNumber}
          </span>

          <button
            onClick={onOpenModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-iris hover:bg-iris-hover text-white transition-all text-xs font-mono font-semibold cursor-pointer shadow-iris-glow"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>View 3D Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyTicketsView({ onExploreClick }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getMyOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated, user?.id]);

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-iris/10 border border-iris/40 flex items-center justify-center text-iris mx-auto shadow-iris-glow">
          <Ticket className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-normal tracking-tight text-bone">
            Sign In to Access Your Wallet
          </h2>
          <p className="text-xs text-silver font-light leading-relaxed">
            Your purchased tickets and digital holographic passes are securely linked to your RESERVA account.
          </p>
        </div>
        <button
          onClick={() => openAuthModal('signin')}
          className="px-8 py-3.5 rounded-full bg-iris hover:bg-iris-hover text-white text-xs font-semibold uppercase tracking-wide shadow-iris-glow transition-all cursor-pointer"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-void-border">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-iris font-semibold">
            DIGITAL TICKET WALLET
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-bone mt-1">
            My Purchased Passes
          </h2>
          <p className="text-xs text-silver font-light mt-1">
            Official cryptographically verified e-tickets for upcoming stadium shows.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-void-card border border-void-border text-xs font-mono text-silver hover:text-bone transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-iris' : ''}`} />
          <span>Refresh Passes</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-void-card/40 border border-void-border animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center space-y-5 rounded-3xl bg-void-card/40 border border-void-border p-8">
          <div className="w-12 h-12 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center text-ash mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-bone">No tickets purchased yet</h3>
            <p className="text-xs text-silver font-light max-w-sm mx-auto">
              Select your favorite concert, reserve seats via the interactive seating map, and checkout to issue digital passes.
            </p>
          </div>
          <button
            onClick={onExploreClick}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-iris hover:bg-iris-hover text-white text-xs font-semibold uppercase tracking-wide shadow-iris-glow transition-all cursor-pointer"
          >
            <span>Browse Upcoming Concerts</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => {
            const concertTitle = order.concertTitle || order.concertId?.title || 'Stadium Concert';
            const concertArtist = order.concertArtist || order.concertId?.artist || 'Headliner Artist';
            const concertVenue = order.concertVenue || order.concertId?.venue || 'Stadium Arena';
            const concertDate = order.concertDate || order.concertId?.date || new Date().toISOString();

            const formattedDate = new Date(concertDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            const seatList = Array.isArray(order.seats)
              ? order.seats.map((s) => (typeof s === 'string' ? s : s.seatNumber))
              : [];

            return (
              <MyTicketCardItem
                key={order._id || order.id}
                order={{
                  ...order,
                  concertTitle,
                  concertArtist,
                  concertVenue,
                  concertDate,
                  seats: seatList
                }}
                formattedDate={formattedDate}
                seatList={seatList}
                formatIDR={formatIDR}
                onOpenModal={() =>
                  setSelectedTicket({
                    ...order,
                    concertTitle,
                    concertArtist,
                    concertVenue,
                    concertDate,
                    seats: seatList
                  })
                }
              />
            );
          })}
        </div>
      )}

      {/* Ticket QR Modal */}
      {selectedTicket && (
        <TicketModal
          order={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
