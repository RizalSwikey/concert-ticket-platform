import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, RefreshCw, UserCheck, LogOut, Sparkles, Zap } from 'lucide-react';

export default function Navbar({ onSeedComplete }) {
  const { user, loginAsRecruiter, logout } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [seedNotice, setSeedNotice] = useState('');

  const handleDemoLogin = async () => {
    setLoggingIn(true);
    try {
      await loginAsRecruiter('Recruiter / Portfolio Reviewer');
    } catch (err) {
      alert('Demo login failed: ' + err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSeed = async () => {
    if (seeding) return;
    setSeeding(true);
    setSeedNotice('');
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedNotice(`Seeded ${data.seededConcerts} concerts & ${data.seededSeats} seats!`);
        if (onSeedComplete) onSeedComplete();
        setTimeout(() => setSeedNotice(''), 5000);
      } else {
        alert('Seed failed: ' + data.message);
      }
    } catch (err) {
      alert('Seed failed: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-void/80 backdrop-blur-xl border-b border-void-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Signature */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-iris/10 border border-iris/40 flex items-center justify-center text-iris shadow-iris-glow">
            <Zap className="w-5 h-5 fill-iris text-iris" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans text-lg font-medium tracking-tight text-bone">
                RESERVA
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-iris/20 text-iris border border-iris/30 font-semibold tracking-wider">
                ATOMIC LOCK
              </span>
            </div>
            <p className="text-[10px] text-silver tracking-wide">
              Anti Double-Booking Engine
            </p>
          </div>
        </div>

        {/* Live System Indicator */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-void-surface border border-void-border text-[11px] text-silver font-mono">
          <span className="w-2 h-2 rounded-full bg-verdant animate-pulse" />
          <span>WiredTiger Mutex Active</span>
          <span className="text-ash">•</span>
          <span className="text-verdant font-semibold">0% Conflict Tolerance</span>
        </div>

        {/* Recruiter / Quick Actions */}
        <div className="flex items-center space-x-3">
          {seedNotice && (
            <span className="hidden sm:inline-block text-xs font-mono text-saffron animate-pulse">
              {seedNotice}
            </span>
          )}

          {/* 1-Click Reset / Seed DB */}
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-medium tracking-wide bg-void-surface hover:bg-zinc-800/80 text-silver hover:text-bone border border-void-border hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
            title="Reset concerts, orders, and 560+ seats with realistic sample distribution"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-iris' : 'text-ash'}`} />
            <span>{seeding ? 'Seeding...' : '1-Click Reset DB'}</span>
          </button>

          {/* Recruiter Login or User Badge */}
          {user ? (
            <div className="flex items-center space-x-2 bg-void-card border border-iris/30 rounded-full pl-3 pr-1 py-1">
              <div className="flex items-center space-x-1.5 text-xs text-bone">
                <UserCheck className="w-3.5 h-3.5 text-iris" />
                <span className="font-medium max-w-[120px] truncate">{user.name}</span>
                <span className="hidden sm:inline-block text-[11px] font-mono text-saffron bg-saffron/10 px-2 py-0.5 rounded-full border border-saffron/30">
                  Rp 50M
                </span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-ash hover:text-bone transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleDemoLogin}
              disabled={loggingIn}
              className="flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide bg-iris hover:bg-iris-hover text-white shadow-iris-glow hover:shadow-iris transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loggingIn ? 'Authenticating...' : '1-Click Demo Login'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
