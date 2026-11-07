import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Zap, Ticket, Compass, MapPin, User, LogOut, ChevronDown, Sparkles, Sun, Moon, Terminal } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, myTicketsCount = 0, onOpenInspector }) {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { addToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been safely signed out.'
    });
  };

  const handleNavClick = (tab) => {
    if (tab === 'tickets' && !isAuthenticated) {
      openAuthModal('signin', () => {
        onTabChange('tickets');
      });
      return;
    }
    onTabChange(tab);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-void-surface/90 border-b border-void-border backdrop-blur-2xl transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => onTabChange('discover')}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-iris/10 border border-iris/40 flex items-center justify-center text-iris shadow-iris-glow relative shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-iris text-iris transition-transform group-hover:scale-110" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-verdant border-2 border-void animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-sans text-lg sm:text-xl font-medium tracking-tight text-bone group-hover:text-iris transition-colors">
                  RESERVA
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-iris/15 text-iris border border-iris/30 font-semibold tracking-wider uppercase">
                  LIVE
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-silver tracking-wide font-mono">
                Official Concert & Seat Platform
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 p-1 rounded-full bg-void-card border border-void-border backdrop-blur-md">
            <button
              onClick={() => handleNavClick('discover')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'discover'
                  ? 'bg-void-surface text-bone shadow-sm border border-void-border font-semibold'
                  : 'text-silver hover:text-bone hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-iris" />
              <span>Discover Shows</span>
            </button>

            <button
              onClick={() => handleNavClick('venues')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'venues'
                  ? 'bg-void-surface text-bone shadow-sm border border-void-border font-semibold'
                  : 'text-silver hover:text-bone hover:bg-white/5'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-verdant" />
              <span>Venues</span>
            </button>

            <button
              onClick={() => handleNavClick('tickets')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer relative ${
                activeTab === 'tickets'
                  ? 'bg-void-surface text-bone shadow-sm border border-void-border font-semibold'
                  : 'text-silver hover:text-bone hover:bg-white/5'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-saffron" />
              <span>My Tickets</span>
              {myTicketsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-iris text-white text-[9px] font-bold flex items-center justify-center">
                  {myTicketsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Controls: Theme Toggle + User Account */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle (Sun/Moon) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-void-card hover:bg-void-elevated border border-void-border flex items-center justify-center text-silver hover:text-bone transition-colors cursor-pointer"
              title={`Switch to ${isDark ? 'Archival Light Mode' : 'Dark Void Mode'}`}
              aria-label="Toggle visual theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-saffron transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-iris transition-transform hover:-rotate-12" />
              )}
            </motion.button>

            {/* Auth / Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-void-card hover:bg-void-surface border border-void-border hover:border-iris/40 rounded-full pl-1.5 sm:pl-2 pr-2.5 sm:pr-3 py-1 sm:py-1.5 transition-all text-xs text-bone font-mono cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-iris/20 border border-iris/40 flex items-center justify-center text-iris font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-silver" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-void-surface border border-void-border shadow-2xl p-2 z-50 text-xs font-mono backdrop-blur-2xl"
                    >
                      <div className="p-3 border-b border-void-border space-y-0.5">
                        <p className="text-bone font-medium truncate">{user.name}</p>
                        <p className="text-[11px] text-silver truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] text-saffron bg-saffron/10 px-2 py-0.5 rounded-full border border-saffron/20">
                          Balance: Rp 50,000,000
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onTabChange('tickets');
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-silver hover:text-bone hover:bg-void-card transition-colors text-left"
                        >
                          <Ticket className="w-3.5 h-3.5 text-saffron" />
                          <span>My Ticket Wallet</span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-void-border">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-mono text-silver hover:text-bone hover:bg-void-card transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide bg-iris hover:bg-iris-hover text-white shadow-iris-glow transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Join</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-void-surface/95 border-t border-void-border backdrop-blur-2xl px-2 py-2 flex items-center justify-around text-[10px] font-mono">
        <button
          onClick={() => handleNavClick('discover')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'discover' ? 'text-iris font-semibold' : 'text-silver hover:text-bone'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Shows</span>
        </button>

        <button
          onClick={() => handleNavClick('venues')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'venues' ? 'text-verdant font-semibold' : 'text-silver hover:text-bone'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Venues</span>
        </button>

        <button
          onClick={() => handleNavClick('tickets')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-colors relative cursor-pointer ${
            activeTab === 'tickets' ? 'text-saffron font-semibold' : 'text-silver hover:text-bone'
          }`}
        >
          <div className="relative">
            <Ticket className="w-4 h-4" />
            {myTicketsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 rounded-full bg-iris text-white text-[8px] font-bold flex items-center justify-center">
                {myTicketsCount}
              </span>
            )}
          </div>
          <span>Tickets</span>
        </button>

        {onOpenInspector && (
          <button
            onClick={onOpenInspector}
            className="flex flex-col items-center space-y-1 py-1 px-3 rounded-xl text-silver hover:text-bone transition-colors cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-iris" />
            <span>&lt;/&gt; Lab</span>
          </button>
        )}
      </div>
    </>
  );
}
