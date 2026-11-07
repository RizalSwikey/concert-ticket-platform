import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Lock, Mail, User, Sparkles, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab, signIn, signUp, loginDemo } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (authModalTab === 'signin') {
        if (!email.trim() || !password) {
          addToast({
            type: 'warning',
            title: 'Required Fields',
            message: 'Please provide both your email and password.'
          });
          setSubmitting(false);
          return;
        }

        const user = await signIn(email, password);
        addToast({
          type: 'success',
          title: 'Welcome Back',
          message: `Signed in as ${user.name}. Ready to reserve seats!`
        });
      } else {
        if (!name.trim() || !email.trim() || !password) {
          addToast({
            type: 'warning',
            title: 'Required Fields',
            message: 'Please fill in all registration fields.'
          });
          setSubmitting(false);
          return;
        }

        if (password.length < 6) {
          addToast({
            type: 'warning',
            title: 'Weak Password',
            message: 'Password must be at least 6 characters.'
          });
          setSubmitting(false);
          return;
        }

        const user = await signUp(name, email, password);
        addToast({
          type: 'success',
          title: 'Account Created',
          message: `Welcome to RESERVA, ${user.name}! Your account is active.`
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: authModalTab === 'signin' ? 'Sign In Failed' : 'Registration Failed',
        message: err.message || 'An unexpected error occurred.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setSubmitting(true);
    try {
      setEmail('vip@reserva.live');
      setPassword('reserva2026');
      const u = await loginDemo('VIP Buyer (Demo Pass)');
      addToast({
        type: 'success',
        title: 'VIP Pass Activated',
        message: `Instant Demo active as ${u.name}. Rp 50,000,000 wallet pre-loaded!`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Instant Demo Error',
        message: err.message || 'Could not authenticate demo pass.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-void/80 backdrop-blur-xl"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-void-surface border border-void-border shadow-2xl p-5 sm:p-8 z-10 space-y-5 sm:space-y-6"
      >
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1.5 bg-gradient-to-r from-iris via-verdant to-saffron rounded-full" />

        {/* Header & Close */}
        <div className="flex items-center justify-between pb-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-iris font-semibold">
                RESERVA MEMBER ACCESS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-normal tracking-tight text-bone mt-0.5">
              {authModalTab === 'signin' ? 'Sign in to reserve' : 'Create an account'}
            </h2>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-full hover:bg-zinc-800 text-silver hover:text-bone transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-void-card border border-void-border text-xs font-mono">
          <button
            type="button"
            onClick={() => setAuthModalTab('signin')}
            className={`py-2 rounded-xl transition-all cursor-pointer font-medium ${
              authModalTab === 'signin'
                ? 'bg-void-surface text-bone shadow-sm border border-white/10'
                : 'text-silver hover:text-bone'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalTab('signup')}
            className={`py-2 rounded-xl transition-all cursor-pointer font-medium ${
              authModalTab === 'signup'
                ? 'bg-void-surface text-bone shadow-sm border border-white/10'
                : 'text-silver hover:text-bone'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalTab === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-silver uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-ash absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-void-card border border-void-border rounded-2xl pl-10 pr-4 py-3 text-xs text-bone placeholder:text-zinc-600 focus:outline-none focus:border-iris transition-colors font-sans"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-silver uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-ash absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-void-card border border-void-border rounded-2xl pl-10 pr-4 py-3 text-xs text-bone placeholder:text-zinc-600 focus:outline-none focus:border-iris transition-colors font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-silver uppercase tracking-wider block">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-ash absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-void-card border border-void-border rounded-2xl pl-10 pr-4 py-3 text-xs text-bone placeholder:text-zinc-600 focus:outline-none focus:border-iris transition-colors font-sans"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full bg-iris hover:bg-iris-hover text-white text-xs font-semibold tracking-wide uppercase shadow-iris-glow transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
          >
            <span>{submitting ? 'Authenticating...' : authModalTab === 'signin' ? 'Sign In & Continue' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        {/* Recruiter / Quick Testing Option (Commercial & Practical) */}
        <div className="pt-4 border-t border-void-border text-center space-y-2">
          <p className="text-[11px] text-ash">
            Testing the platform?
          </p>
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-2xl bg-void-card hover:bg-zinc-800 border border-void-border hover:border-iris/40 text-silver hover:text-bone text-xs font-mono transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-saffron" />
            <span>Use Instant Demo Account (VIP Buyer)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
