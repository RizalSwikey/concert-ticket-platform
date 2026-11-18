import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { ChevronDown, Sun, Moon, Terminal } from 'lucide-react';

const TABS = [
  { id: 'discover', label: 'Shows' },
  { id: 'venues', label: 'Venues' },
  { id: 'tickets', label: 'My Tickets' }
];

export default function Navbar({ activeTab, onTabChange, myTicketsCount = 0, onOpenInspector }) {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { addToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const reduce = useReducedMotion();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    addToast({ type: 'info', title: 'Signed Out', message: 'You have been safely signed out.' });
  };

  const handleNavClick = (tab) => {
    if (tab === 'tickets' && !isAuthenticated) {
      openAuthModal('signin', () => onTabChange('tickets'));
      return;
    }
    onTabChange(tab);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-void border-b border-void-border">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Wordmark */}
          <button
            type="button"
            onClick={() => onTabChange('discover')}
            className="text-lg sm:text-xl tracking-tighter text-bone shrink-0"
            style={{ fontWeight: 500, letterSpacing: '-0.045em' }}
          >
            RESERVA
          </button>

          {/* Desktop nav: mono uppercase, underline on active */}
          <nav className="hidden md:flex items-center gap-7">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleNavClick(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative pb-1 label-mono transition-colors cursor-pointer ${
                    active ? 'text-bone' : 'text-ash hover:text-bone'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'tickets' && myTicketsCount > 0 && (
                    <span className="ml-1.5 text-iris">({myTicketsCount})</span>
                  )}
                  <span
                    className={`absolute left-0 -bottom-px h-px bg-iris transition-[width] duration-300 ${
                      active ? 'w-full' : 'w-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {onOpenInspector && (
              <button
                type="button"
                onClick={onOpenInspector}
                aria-label="Open engine inspector"
                className="hidden sm:flex p-2 text-ash hover:text-bone transition-colors cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              className="p-2 text-ash hover:text-bone transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 label-mono text-bone cursor-pointer"
                >
                  <span className="truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-ash" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 rounded-lg bg-void-surface border border-void-border p-4 space-y-3 text-xs font-mono"
                    >
                      <div className="space-y-0.5 pb-3 border-b border-void-border">
                        <p className="text-bone truncate">{user.name}</p>
                        <p className="text-[11px] text-ash truncate">{user.email}</p>
                        <p className="text-[11px] text-saffron pt-1">Balance: Rp 50,000,000</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          handleNavClick('tickets');
                        }}
                        className="block w-full text-left label-mono text-ash hover:text-bone transition-colors cursor-pointer"
                      >
                        Ticket Wallet
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left label-mono text-ash hover:text-saffron transition-colors cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="label-mono text-ash hover:text-bone transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="rounded-full px-5 py-2 bg-iris hover:bg-iris-hover text-white label-mono font-semibold transition-colors cursor-pointer"
                >
                  Join
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-void border-t border-void-border flex items-center justify-around px-2 py-2">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleNavClick(tab.id)}
              aria-current={active ? 'page' : undefined}
              className={`label-mono px-3 py-2 transition-colors cursor-pointer ${
                active ? 'text-bone' : 'text-ash'
              }`}
            >
              {tab.label}
              {tab.id === 'tickets' && myTicketsCount > 0 && (
                <span className="ml-1 text-iris">({myTicketsCount})</span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
