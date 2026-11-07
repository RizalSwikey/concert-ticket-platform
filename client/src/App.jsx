import React, { useState, useEffect, useRef } from 'react';
import { api } from './services/api';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ConcertCard from './components/ConcertCard';
import StageCurve from './components/SeatingMap/StageCurve';
import SeatLegend from './components/SeatingMap/SeatLegend';
import SeatingGrid from './components/SeatingMap/SeatingGrid';
import ConcurrencySimulator from './components/ConcurrencySimulator';
import CheckoutDrawer from './components/CheckoutDrawer';
import TicketModal from './components/TicketModal';
import Footer from './components/Footer';
import { Sparkles, AlertCircle, ShoppingCart, RefreshCw, Zap } from 'lucide-react';

export default function App() {
  const [concerts, setConcerts] = useState([]);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockExpiresIn, setLockExpiresIn] = useState(600);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTicketOrder, setActiveTicketOrder] = useState(null);
  const [loadingConcerts, setLoadingConcerts] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [notification, setNotification] = useState(null);

  const seatingSectionRef = useRef(null);

  // Load concerts
  const loadConcerts = async (keepSelected = false) => {
    try {
      setLoadingConcerts(true);
      const res = await api.getConcerts();
      if (res.success && res.data) {
        setConcerts(res.data);
        if (!keepSelected && res.data.length > 0) {
          setSelectedConcert(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load concerts:', err);
      showNotice('error', 'Failed to load concerts: ' + err.message);
    } finally {
      setLoadingConcerts(false);
    }
  };

  // Load seats for selected concert
  const loadSeats = async (concertId) => {
    if (!concertId) return;
    try {
      setLoadingSeats(true);
      const res = await api.getConcertSeats(concertId);
      if (res.success && res.data) {
        setSeats(res.data);
      }
    } catch (err) {
      console.error('Failed to load seating map:', err);
      showNotice('error', 'Failed to load seats: ' + err.message);
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    loadConcerts();
  }, []);

  useEffect(() => {
    if (selectedConcert) {
      setSelectedSeats([]);
      loadSeats(selectedConcert._id);
    }
  }, [selectedConcert?._id]);

  // Polling to keep seat status dynamic
  useEffect(() => {
    if (!selectedConcert) return;
    const interval = setInterval(() => {
      loadSeats(selectedConcert._id);
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedConcert?._id]);

  const showNotice = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Toggle seat selection with atomic locking
  const handleToggleSeat = async (seat) => {
    const isAlreadySelected = selectedSeats.some((s) => s._id === seat._id);

    if (isAlreadySelected) {
      // User deselects: unlock seat
      const nextSelected = selectedSeats.filter((s) => s._id !== seat._id);
      setSelectedSeats(nextSelected);
      try {
        await api.unlockSeats([seat._id]);
        loadSeats(selectedConcert._id);
      } catch (err) {
        console.warn('Unlock error:', err);
      }
      return;
    }

    // Adding seat: limit to 4 seats
    if (selectedSeats.length >= 4) {
      showNotice('warning', 'Maximum 4 seats can be reserved in one transaction.');
      return;
    }

    // Call atomic lock backend
    const targetSeatIds = [...selectedSeats.map((s) => s._id), seat._id];
    try {
      const lockRes = await api.lockSeats(selectedConcert._id, targetSeatIds);
      if (lockRes.success) {
        setSelectedSeats([...selectedSeats, seat]);
        setLockExpiresIn(lockRes.expiresInSeconds || 600);
        showNotice('success', `Seat ${seat.seatNumber} atomically locked for 10 minutes!`);
        loadSeats(selectedConcert._id);
      }
    } catch (err) {
      if (err.status === 409) {
        showNotice(
          'error',
          `Seat conflict: ${seat.seatNumber} was just claimed by another user. Please choose another seat.`
        );
      } else {
        showNotice('error', err.message || 'Failed to lock seat');
      }
      loadSeats(selectedConcert._id);
    }
  };

  const handleCheckoutSuccess = (order) => {
    setIsDrawerOpen(false);
    setSelectedSeats([]);
    setActiveTicketOrder(order);
    loadSeats(selectedConcert._id);
    loadConcerts(true);
  };

  const scrollToSeating = () => {
    seatingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-void text-bone flex flex-col selection:bg-iris selection:text-white">
      {/* Navbar with 1-Click Recruiter Demo & Reset DB */}
      <Navbar
        onSeedComplete={() => {
          loadConcerts();
          showNotice('success', 'Database re-seeded with realistic seat distributions.');
        }}
      />

      {/* Floating System Notifications */}
      {notification && (
        <div className="fixed top-24 right-4 z-50 animate-slideLeft">
          <div
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-xl text-xs font-mono ${
              notification.type === 'success'
                ? 'bg-verdant/20 border-verdant/60 text-emerald-200'
                : notification.type === 'warning'
                ? 'bg-saffron/20 border-saffron/60 text-amber-200'
                : 'bg-red-950/80 border-red-500/60 text-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <Sparkles className="w-4 h-4 text-verdant shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Hero onExploreClick={scrollToSeating} />

      {/* Main Interactive Stage Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 w-full">
        {/* Concert Selection Carousel */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-iris font-semibold">
                FEATURED LINEUP
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-bone mt-1">
                Upcoming Stadium Concerts
              </h2>
            </div>
            <span className="text-xs font-mono text-silver">
              Showing {concerts.length} Active Events
            </span>
          </div>

          {loadingConcerts ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-3xl bg-void-card/40 border border-void-border animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {concerts.map((concert) => (
                <ConcertCard
                  key={concert._id}
                  concert={concert}
                  isSelected={selectedConcert?._id === concert._id}
                  onSelect={(c) => setSelectedConcert(c)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recruiter Concurrency Test Benchmark */}
        {selectedConcert && (
          <section>
            <ConcurrencySimulator
              concert={selectedConcert}
              seats={seats}
              onSimulationComplete={() => loadSeats(selectedConcert._id)}
            />
          </section>
        )}

        {/* Visual Seating Map Section */}
        {selectedConcert && (
          <section ref={seatingSectionRef} className="space-y-8 pt-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-saffron font-semibold">
                INTERACTIVE VENUE MAP
              </span>
              <h2 className="text-3xl sm:text-5xl font-normal tracking-tighter text-bone">
                {selectedConcert.title}
              </h2>
              <p className="text-xs sm:text-sm font-extralight text-silver max-w-lg mx-auto">
                Click any available seat to acquire a 10-minute atomic lock. Maximum 4 seats per order.
              </p>
            </div>

            {/* Glowing Curved Stage Arc */}
            <StageCurve />

            {/* Visual Legend */}
            <SeatLegend />

            {/* Interactive Seating Grid */}
            {loadingSeats && seats.length === 0 ? (
              <div className="h-96 rounded-3xl bg-void-card/40 border border-void-border flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-iris animate-spin" />
              </div>
            ) : (
              <SeatingGrid
                seats={seats}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
                onTestConcurrency={(seat) => {}}
              />
            )}
          </section>
        )}
      </main>

      {/* Floating Bottom Action Bar (When Seats are Selected) */}
      {selectedSeats.length > 0 && selectedConcert && (
        <aside
          aria-label="Reservation Summary Bar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-void-surface/95 border border-iris/50 rounded-full p-3 sm:px-6 backdrop-blur-2xl shadow-iris-glow flex items-center justify-between animate-slideUp"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-iris/20 border border-iris/40 flex items-center justify-center text-iris">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-semibold text-bone">
                  {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} Locked
                </span>
                <span className="text-[10px] font-mono text-saffron bg-saffron/10 px-2 py-0.5 rounded-full border border-saffron/20">
                  10m TTL
                </span>
              </div>
              <p className="text-[11px] font-mono text-silver">
                Total:{' '}
                <strong className="text-bone">
                  {formatIDR(selectedSeats.reduce((sum, s) => sum + s.price, 0))}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-6 py-2.5 rounded-full bg-iris hover:bg-iris-hover text-white text-xs font-semibold tracking-wide uppercase shadow-iris-glow transition-all cursor-pointer"
          >
            Review & Pay
          </button>
        </aside>
      )}

      {/* Checkout Slide-Over Drawer */}
      {selectedConcert && (
        <CheckoutDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          concert={selectedConcert}
          lockedSeats={selectedSeats}
          expiresInSeconds={lockExpiresIn}
          onCheckoutSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Ticket QR Modal */}
      {activeTicketOrder && (
        <TicketModal
          order={activeTicketOrder}
          onClose={() => setActiveTicketOrder(null)}
        />
      )}

      {/* Professional Engineering Footer */}
      <Footer />
    </div>
  );
}
