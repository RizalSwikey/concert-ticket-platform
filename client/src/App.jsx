import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './services/api';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ConcertCard from './components/ConcertCard';
import StageCurve from './components/SeatingMap/StageCurve';
import SeatLegend from './components/SeatingMap/SeatLegend';
import SeatingGrid from './components/SeatingMap/SeatingGrid';
import CheckoutDrawer from './components/CheckoutDrawer';
import TicketModal from './components/TicketModal';
import MyTicketsView from './components/MyTicketsView';
import VenuesView from './components/VenuesView';
import AuthModal from './components/AuthModal';
import EngineInspectorModal from './components/EngineInspectorModal';
import Footer from './components/Footer';
import { ShoppingCart, RefreshCw, Search, Sparkles, Terminal, SlidersHorizontal, Clock, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  'All Events',
  'World Tour',
  'Pop & Rock',
  'Nightlife / DJ',
  'Indie & Acoustic'
];

export default function App() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'venues' | 'tickets'
  const [concerts, setConcerts] = useState([]);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockExpiresIn, setLockExpiresIn] = useState(600);
  const [lockTimeLeft, setLockTimeLeft] = useState(600);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTicketOrder, setActiveTicketOrder] = useState(null);
  const [loadingConcerts, setLoadingConcerts] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [myTicketsCount, setMyTicketsCount] = useState(0);

  // Live countdown timer for selected seats
  useEffect(() => {
    if (selectedSeats.length === 0) {
      setLockTimeLeft(600);
      return;
    }
    const timer = setInterval(() => {
      setLockTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedSeats.length]);

  const formatLockTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Events');

  // Floating Developer Inspector
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const seatingSectionRef = useRef(null);
  const showsSectionRef = useRef(null);

  // Load concerts
  const loadConcerts = async (keepSelected = false) => {
    try {
      setLoadingConcerts(true);
      const res = await api.getConcerts(searchQuery);
      if (res.success && res.data) {
        setConcerts(res.data);
        if (!keepSelected && res.data.length > 0) {
          setSelectedConcert(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load concerts:', err);
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to load concerts: ' + err.message
      });
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
      addToast({
        type: 'error',
        title: 'Seating Map Error',
        message: 'Failed to load seats: ' + err.message
      });
    } finally {
      setLoadingSeats(false);
    }
  };

  // Load user tickets count
  // Load user tickets count (combines localStorage and backend store)
  const loadUserTicketsCount = async () => {
    let count = 0;
    try {
      const rawLocal = localStorage.getItem('reserva_orders');
      const localOrders = rawLocal ? JSON.parse(rawLocal) : [];
      count = localOrders.length;
    } catch {}

    if (isAuthenticated) {
      try {
        const res = await api.getMyOrders();
        if (res.success && Array.isArray(res.data)) {
          const rawLocal = localStorage.getItem('reserva_orders');
          const localOrders = rawLocal ? JSON.parse(rawLocal) : [];
          const map = new Map();
          localOrders.forEach((o) => map.set(o.orderNumber || o.id || o._id, o));
          res.data.forEach((o) => map.set(o.orderNumber || o.id || o._id, o));
          count = map.size;
        }
      } catch {}
    }
    setMyTicketsCount(count);
  };

  useEffect(() => {
    loadConcerts();
  }, [searchQuery]);

  useEffect(() => {
    loadUserTicketsCount();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (selectedConcert) {
      setSelectedSeats([]);
      loadSeats(selectedConcert._id);
    }
  }, [selectedConcert?._id]);

  // Polling to keep seat status real-time
  useEffect(() => {
    if (!selectedConcert || activeTab !== 'discover') return;
    const interval = setInterval(() => {
      loadSeats(selectedConcert._id);
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedConcert?._id, activeTab]);

  // Toggle seat selection with auth requirement
  // Seamless seat selection with auto-auth resume
  const handleToggleSeat = async (seat, authenticatedUser = null) => {
    const activeUser = authenticatedUser || user;
    const token = localStorage.getItem('reserva_token');

    if (!activeUser && !token) {
      addToast({
        type: 'info',
        title: 'Sign In to Reserve',
        message: `Use Instant Demo Login to auto-lock Seat ${seat.seatNumber} immediately.`
      });
      openAuthModal('signin', async (loggedInUser) => {
        await executeSeatToggle(seat, loggedInUser);
      });
      return;
    }

    await executeSeatToggle(seat, activeUser);
  };

  const executeSeatToggle = async (seat) => {
    const isAlreadySelected = selectedSeats.some((s) => s._id === seat._id);

    if (isAlreadySelected) {
      // Instant UI response: unselect seat
      const nextSelected = selectedSeats.filter((s) => s._id !== seat._id);
      setSelectedSeats(nextSelected);
      try {
        await api.unlockSeats([seat._id]);
        addToast({
          type: 'info',
          title: 'Seat Released',
          message: `Seat ${seat.seatNumber} unlocked back to venue pool.`
        });
      } catch (err) {
        console.warn('Unlock error:', err);
      } finally {
        loadSeats(selectedConcert._id);
      }
      return;
    }

    if (selectedSeats.length >= 4) {
      addToast({
        type: 'warning',
        title: 'Seat Limit',
        message: 'Maximum 4 seats can be reserved in one transaction.'
      });
      return;
    }

    // Instant optimistic response: turn seat purple immediately
    const optimisticSelected = [...selectedSeats, { ...seat, isLockedByMe: true }];
    setSelectedSeats(optimisticSelected);

    try {
      const lockRes = await api.lockSeats(selectedConcert._id, [seat._id]);
      if (lockRes.success) {
        setLockExpiresIn(lockRes.expiresInSeconds || 600);
        setLockTimeLeft(lockRes.expiresInSeconds || 600);
        addToast({
          type: 'success',
          title: 'Seat Held (10-Min TTL)',
          message: `Seat ${seat.seatNumber} is now held exclusively for you.`
        });
      }
    } catch (err) {
      // Revert optimistic selection on failure
      setSelectedSeats((prev) => prev.filter((s) => s._id !== seat._id));
      if (err.status === 409) {
        addToast({
          type: 'warning',
          title: 'Seat Just Taken (409 Conflict)',
          message: `Seat ${seat.seatNumber} was claimed by another attendee.`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Reservation Error',
          message: err.message || 'Failed to acquire seat lock.'
        });
      }
    } finally {
      loadSeats(selectedConcert._id);
    }
  };

  const handleCheckoutSuccess = (order) => {
    setIsDrawerOpen(false);
    setSelectedSeats([]);
    setActiveTicketOrder(order);

    // Store order in localStorage to persist across serverless restarts
    try {
      const rawLocal = localStorage.getItem('reserva_orders');
      const localOrders = rawLocal ? JSON.parse(rawLocal) : [];
      const exists = localOrders.some((o) => (o.orderNumber || o._id) === (order.orderNumber || order._id));
      if (!exists) {
        localStorage.setItem('reserva_orders', JSON.stringify([order, ...localOrders]));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    loadSeats(selectedConcert._id);
    loadConcerts(true);
    loadUserTicketsCount();
  };

  const scrollToSeating = () => {
    seatingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToShows = () => {
    setActiveTab('discover');
    setTimeout(() => {
      showsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Filtered concerts
  const filteredConcerts = concerts.filter((c) => {
    if (selectedCategory === 'All Events') return true;
    if (selectedCategory === 'World Tour') {
      return c.title.toLowerCase().includes('tour') || c.title.toLowerCase().includes('world');
    }
    if (selectedCategory === 'Pop & Rock') {
      return c.artist.includes('Coldplay') || c.artist.includes('Taylor') || c.artist.includes('Bruno');
    }
    if (selectedCategory === 'Nightlife / DJ') {
      return c.artist.includes('Bruno') || c.description.toLowerCase().includes('funk');
    }
    if (selectedCategory === 'Indie & Acoustic') {
      return c.artist.includes('Billie') || c.description.toLowerCase().includes('acoustic');
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-void text-bone flex flex-col selection:bg-iris selection:text-white relative">
      {/* Commercial Navbar with Theme Toggle & Mobile Nav */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        myTicketsCount={myTicketsCount}
        onOpenInspector={() => setIsInspectorOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8 w-full">
        {activeTab === 'discover' && (
          <div className="space-y-16">
            {/* Commercial Hero */}
            <Hero onExploreClick={scrollToShows} />

            {/* Concerts Discovery Header, Search & Category Filters */}
            <section ref={showsSectionRef} className="space-y-6 pt-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-iris font-semibold">
                    DISCOVER CONCERTS
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-bone mt-1">
                    Featured Stadium Shows
                  </h2>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80 flex items-center">
                  <Search className="w-4 h-4 text-ash absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search artist, tour, or venue..."
                    className="w-full bg-void-surface border border-void-border rounded-full pl-10 pr-4 py-2.5 text-xs text-bone placeholder:text-zinc-600 focus:outline-none focus:border-iris transition-all font-sans"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-iris text-white shadow-iris-glow font-medium'
                        : 'bg-void-card hover:bg-zinc-800 text-silver hover:text-bone border border-void-border'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Concert Cards Grid */}
              {loadingConcerts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-80 rounded-3xl bg-void-card/40 border border-void-border animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredConcerts.length === 0 ? (
                <div className="py-12 text-center text-silver text-xs font-mono">
                  No shows found matching "{searchQuery}". Try searching for Coldplay, Bruno Mars, or Taylor Swift.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredConcerts.map((concert) => (
                    <ConcertCard
                      key={concert._id}
                      concert={concert}
                      isSelected={selectedConcert?._id === concert._id}
                      onSelect={(c) => {
                        setSelectedConcert(c);
                        scrollToSeating();
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Interactive Visual Seating Map */}
            {selectedConcert && (
              <section ref={seatingSectionRef} className="space-y-8 pt-10 border-t border-void-border">
                <div className="text-center space-y-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-saffron font-semibold">
                    INTERACTIVE STAGE SEATING
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-normal tracking-tighter text-bone">
                    {selectedConcert.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-light text-silver max-w-lg mx-auto">
                    Click any available seat to hold it for 10 minutes. Maximum 4 seats per reservation.
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
                    onTestConcurrency={() => setIsInspectorOpen(true)}
                  />
                )}
              </section>
            )}
          </div>
        )}

        {/* Venues View */}
        {activeTab === 'venues' && (
          <VenuesView onSelectVenueShow={scrollToShows} />
        )}

        {/* My Tickets Wallet */}
        {activeTab === 'tickets' && (
          <MyTicketsView onExploreClick={scrollToShows} />
        )}
      </main>

      {/* Sticky Bottom Reservation Summary Bar (When Seats are Selected) */}
      <AnimatePresence>
        {selectedSeats.length > 0 && selectedConcert && activeTab === 'discover' && (
          <motion.aside
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            aria-label="Reservation Summary Bar"
            className="fixed bottom-14 md:bottom-6 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-11/12 max-w-3xl z-50 bg-void-surface/95 border-2 border-iris/60 rounded-2xl sm:rounded-full p-3 sm:px-6 backdrop-blur-2xl shadow-[0_10px_40px_rgba(128,82,255,0.4)] flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-full bg-iris/20 border border-iris/40 flex items-center justify-center text-iris shrink-0 shadow-sm">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-bone">
                    {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} Selected:
                  </span>
                  {/* Selected Seat Badges */}
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map((s) => (
                      <span
                        key={s._id}
                        className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-iris text-white shadow-sm"
                      >
                        {s.tier}-{s.seatNumber}
                      </span>
                    ))}
                  </div>
                  {/* 10-Minute Countdown Timer */}
                  <span className="text-[10px] font-mono text-saffron bg-saffron/15 px-2 py-0.5 rounded-full border border-saffron/30 font-semibold flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-saffron animate-pulse" />
                    <span>{formatLockTimer(lockTimeLeft)} Left</span>
                  </span>
                </div>
                <p className="text-xs font-mono text-silver mt-1">
                  Total:{' '}
                  <strong className="text-bone text-sm">
                    {formatIDR(selectedSeats.reduce((sum, s) => sum + s.price, 0))}
                  </strong>
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsDrawerOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-iris hover:bg-iris-hover text-white text-xs font-mono font-bold tracking-wide uppercase shadow-iris-glow transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <span>Checkout &amp; Issue Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* FLOATING DEVELOPER INSPECTOR BUTTON (Desktop Only) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-30">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsInspectorOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-void-surface/90 hover:bg-zinc-900 border border-iris/40 hover:border-iris shadow-lg shadow-black/80 backdrop-blur-xl text-silver hover:text-bone text-xs font-mono transition-all cursor-pointer"
          title="Open Concurrency Lab & Architecture Telemetry"
        >
          <Terminal className="w-3.5 h-3.5 text-iris" />
          <span>&lt;/&gt; Engine Inspector</span>
        </motion.button>
      </div>

      {/* Engine Inspector Drawer Modal */}
      <EngineInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        concert={selectedConcert}
        seats={seats}
        onResetDatabase={() => {
          loadConcerts();
          if (selectedConcert) loadSeats(selectedConcert._id);
        }}
        onSimulationComplete={() => {
          if (selectedConcert) loadSeats(selectedConcert._id);
        }}
      />

      {/* Global Auth Modal */}
      <AuthModal />

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

      {/* Professional Commercial Footer */}
      <Footer />
    </div>
  );
}
