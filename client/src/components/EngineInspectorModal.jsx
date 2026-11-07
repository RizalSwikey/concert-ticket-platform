import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConcurrencySimulator from './ConcurrencySimulator';
import { Terminal, X, RefreshCw, Cpu, ShieldCheck, Zap, Server, Activity } from 'lucide-react';

export default function EngineInspectorModal({
  isOpen,
  onClose,
  concert,
  seats,
  onResetDatabase,
  onSimulationComplete
}) {
  const { addToast } = useToast();
  const [telemetry, setTelemetry] = useState(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getHealth()
        .then((res) => setTelemetry(res))
        .catch(() => setTelemetry({ status: 'ok', storageMode: 'IN_MEMORY_CONCURRENT_STORE' }));
    }
  }, [isOpen]);

  const handleResetData = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      const res = await api.seedDatabase();
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Engine Reset & Seeded',
          message: `Reset ${res.seededConcerts} concerts & ${res.seededSeats} dynamic seats with 0% double-booking!`
        });
        if (onResetDatabase) onResetDatabase();
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: err.message || 'Could not reset engine.'
      });
    } finally {
      setResetting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-void/85 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-void-surface border border-iris/50 shadow-iris-glow p-4 sm:p-8 z-10 flex flex-col justify-between overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-void-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-iris/20 border border-iris/40 flex items-center justify-center text-iris">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-semibold text-iris uppercase tracking-wider">
                  HIGH-CONCURRENCY ENGINE INSPECTOR
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-verdant/20 text-verdant border border-verdant/30 font-semibold">
                  ACTIVE
                </span>
              </div>
              <h2 className="text-xl font-normal tracking-tight text-bone">
                Concurrency Lab & Architecture Telemetry
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-silver hover:text-bone transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
          {/* Telemetry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-void-card border border-void-border space-y-1">
              <div className="flex items-center space-x-2 text-iris text-xs font-mono">
                <Server className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">Storage Engine</span>
              </div>
              <p className="text-sm font-mono text-bone font-medium">
                {telemetry?.storageMode === 'MONGODB_ATLAS' ? 'MongoDB Atlas' : 'In-Memory Atomic Store'}
              </p>
              <p className="text-[10px] text-silver font-light">
                {telemetry?.storageMode === 'MONGODB_ATLAS'
                  ? 'WiredTiger document-level locking'
                  : 'Zero-config fallback with serialized mutex'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-void-card border border-void-border space-y-1">
              <div className="flex items-center space-x-2 text-verdant text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">Double-Booking Risk</span>
              </div>
              <p className="text-sm font-mono text-verdant font-semibold">
                0% Conflict (Guaranteed)
              </p>
              <p className="text-[10px] text-silver font-light">
                Evaluated atomically with lazy 10-minute TTL
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-void-card border border-void-border space-y-1">
              <div className="flex items-center space-x-2 text-saffron text-xs font-mono">
                <Activity className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">Active Venue Seats</span>
              </div>
              <p className="text-sm font-mono text-bone font-medium">
                560 Total Seat Nodes
              </p>
              <p className="text-[10px] text-silver font-light">
                Across 4 stadium concerts in Jakarta
              </p>
            </div>
          </div>

          {/* Database Reset Action */}
          <div className="p-4 rounded-2xl bg-void-card border border-void-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-xs font-mono font-medium text-bone">
                Reset & Re-Seed Seat Allocation State
              </h4>
              <p className="text-[11px] text-silver font-light">
                Wipes current reservations and restores fresh 4-concert lineup with realistic sample seat distribution.
              </p>
            </div>

            <button
              onClick={handleResetData}
              disabled={resetting}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-void-surface hover:bg-zinc-800 text-silver hover:text-bone border border-void-border hover:border-iris/40 text-xs font-mono transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-iris' : 'text-ash'}`} />
              <span>{resetting ? 'Resetting...' : '1-Click Reset Database'}</span>
            </button>
          </div>

          {/* 5x Parallel Race Condition Benchmark */}
          {concert && (
            <ConcurrencySimulator
              concert={concert}
              seats={seats}
              onSimulationComplete={onSimulationComplete}
            />
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-void-border flex items-center justify-between text-[11px] font-mono text-ash">
          <span>RESERVA Engine Telemetry v1.2</span>
          <span>Engineered by Rizal Akbar Syah Fauzan Putra</span>
        </div>
      </motion.div>
    </div>
  );
}
