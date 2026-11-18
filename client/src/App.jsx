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
import { ShoppingCart, RefreshCw, Search, Terminal, Clock, ArrowRight } from 'lucide-react';

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
      <main className="flex-1 w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        {activeTab === 'discover' && (
          <div className="space-y-24">
            {/* Commercial Hero */}
            <Hero onExploreClick={scrollToShows} />

            {/* Concerts Discovery Header, Search & Category Filters */}
            <section ref={showsSectionRef} className="space-y-8 pt-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <h2 className="display-lg text-bone">
                  FEATURED
                  <br />
                  STADIUM SHOWS
                </h2>

                {/* Flat bottom-bordered search line */}
                <div className="flex items-center gap-2 w-full md:w-80 border-b border-void-border focus-within:border-iris transition-colors pb-2">
                  <Search className="w-4 h-4 text-ash shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search artist, tour, or venue"
                    aria-label="Search concerts"
                    className="w-full bg-transparent text-sm text-bone placeholder:text-tertiary focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Category tabs: plain mono text + underline */}
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-void-border">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      aria-pressed={active}
                      className={`relative label-mono pb-3 whitespace-nowrap transition-colors cursor-pointer ${
                        active ? 'text-bone' : 'text-ash hover:text-bone'
                      }`}
                    >
                      {cat}
                      <span
                        className={`absolute left-0 bottom-0 h-px bg-iris transition-[width] duration-300 ${
                          active ? 'w-full' : 'w-0'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Concert Cards Grid */}
              {loadingConcerts ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="aspect-[3/4] rounded-lg bg-void-elevated animate-pulse" />
                  ))}
                </div>
              ) : filteredConcerts.length === 0 ? (
                <div className="py-16 text-center label-mono text-ash">
                  No shows match “{searchQuery}”
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredConcerts.map((concert, idx) => (
                    <ConcertCard
                      key={concert._id}
                      concert={concert}
                      featured={idx === 0}
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
              <section ref={seatingSectionRef} className="space-y-8 pt-12 border-t border-void-border">
                <div className="space-y-3">
                  <span className="label-mono text-ash">INTERACTIVE SEATING</span>
                  <h2 className="display-lg text-bone">{selectedConcert.title}</h2>
                  <p className="text-sm font-light text-ash max-w-[46ch] leading-relaxed">
                    Click any available seat to hold it for 10 minutes. Maximum 4 seats per
                    reservation.
                  </p>
                </div>

                {/* Hairline boarding-pass panel: stage arc, legend, grid */}
                <div className="hairline-panel p-4 sm:p-6 space-y-6">
                  <StageCurve />
                  <SeatLegend />

                  {loadingSeats && seats.length === 0 ? (
                    <div className="h-96 border border-void-border flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-iris animate-spin" />
                    </div>
                  ) : (
                    <SeatingGrid
                      seats={seats}
                      selectedSeats={selectedSeats}
                      onToggleSeat={handleToggleSeat}
                      onTestConcurrency={() => setIsInspectorOpen(true)}
                    />
                  )}
                </div>
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            aria-label="Reservation Summary Bar"
            className="fixed bottom-14 md:bottom-0 left-0 right-0 z-50 bg-void border-t border-void-border"
          >
            <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
                <span className="label-mono text-ash flex items-center gap-2">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''}
                </span>

                <div className="flex flex-wrap gap-1">
                  {selectedSeats.map((s) => (
                    <span
                      key={s._id}
                      className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-iris text-white"
                    >
                      {s.seatNumber}
                    </span>
                  ))}
                </div>

                <span className="font-mono text-[11px] text-saffron flex items-center gap-1.5">
                  <Clock className="w-3 h-3 animate-pulse" />
                  {formatLockTimer(lockTimeLeft)}
                </span>

                <span className="font-mono text-[11px] text-bone">
                  {formatIDR(selectedSeats.reduce((sum, s) => sum + s.price, 0))}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-iris hover:bg-iris-hover text-white label-mono font-semibold transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* FLOATING DEVELOPER INSPECTOR BUTTON (Desktop Only) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-30">
        <button
          type="button"
          onClick={() => setIsInspectorOpen(true)}
          className="flex items-center gap-2 label-mono text-ash hover:text-bone transition-colors cursor-pointer"
          title="Open concurrency lab and architecture telemetry"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Engine Inspector</span>
        </button>
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
      <Footer onNavigate={setActiveTab} />
    </div>
  );
}
