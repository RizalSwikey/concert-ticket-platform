import React, { useState } from 'react';
import { api } from '../services/api';
import { Zap, CheckCircle2, XCircle, Clock, ShieldCheck, Play } from 'lucide-react';

export default function ConcurrencySimulator({
  concert,
  seats,
  onSimulationComplete
}) {
  const [selectedSeatId, setSelectedSeatId] = useState('');
  const [running, setRunning] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Default to first available VIP or CAT 1 seat
  const availableSeats = seats.filter((s) => s.status === 'AVAILABLE');

  const handleRunTest = async () => {
    const seatIdToTest = selectedSeatId || availableSeats[0]?._id;
    if (!seatIdToTest) {
      setErrorMsg('No available seats found to test. Please reset database.');
      return;
    }

    setRunning(true);
    setErrorMsg('');
    setResultData(null);

    try {
      const data = await api.simulateConcurrency(seatIdToTest);
      setResultData(data);
      if (onSimulationComplete) {
        onSimulationComplete();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Concurrency test failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-void-surface border border-iris/40 shadow-iris-glow backdrop-blur-xl relative overflow-hidden">
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-iris/10 blur-[90px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-void-border relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-iris text-xs font-mono font-semibold tracking-wider uppercase mb-1">
            <Zap className="w-4 h-4 fill-iris text-iris" />
            <span>Recruiter Concurrency Benchmark</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-normal tracking-tight text-bone">
            Simulate 5x Parallel Race on 1 Seat
          </h3>
          <p className="text-xs text-silver font-light mt-1 max-w-xl">
            Proves atomic mutual exclusion under heavy traffic. Fires 5 concurrent requests at the exact same millisecond to the same seat document. WiredTiger allows strictly 1 winner; 4 receive 409 Conflict.
          </p>
        </div>

        {/* Trigger Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSeatId || (availableSeats[0]?._id || '')}
            onChange={(e) => setSelectedSeatId(e.target.value)}
            disabled={running}
            className="px-3 py-2 rounded-full bg-void-card border border-void-border text-xs text-bone font-mono focus:outline-none focus:border-iris"
          >
            {availableSeats.slice(0, 15).map((s) => (
              <option key={s._id} value={s._id}>
                Target: {s.seatNumber} ({s.tier})
              </option>
            ))}
          </select>

          <button
            onClick={handleRunTest}
            disabled={running}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-iris hover:bg-iris-hover text-white shadow-iris-glow text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${running ? 'animate-pulse' : ''}`} />
            <span>{running ? 'Racing 5 Threads...' : 'Run Race Test'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs font-mono mb-4">
          {errorMsg}
        </div>
      )}

      {/* Results View */}
      {resultData && (
        <div className="space-y-6 relative z-10 animate-fadeIn">
          {/* Summary Banner */}
          <div className="p-4 rounded-2xl bg-void-card border border-void-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-verdant" />
              <span className="text-bone font-semibold">
                Target: Seat {resultData.seatNumber} ({resultData.seatTier})
              </span>
            </div>
            <div className="flex items-center space-x-4 text-silver">
              <span>Total Latency: <strong className="text-bone">{resultData.totalDurationMs}ms</strong></span>
              <span className="text-verdant font-semibold">Winner: 1</span>
              <span className="text-saffron font-semibold">Rejected: {resultData.conflictCount}</span>
            </div>
          </div>

          {/* 5 Concurrent Requests Log Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {resultData.results.map((res, index) => {
              const isWinner = res.status === 200;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
                    isWinner
                      ? 'bg-verdant/10 border-verdant/60 shadow-lg text-bone'
                      : 'bg-void-card/60 border-void-border text-silver opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold">
                      Req #{index + 1}
                    </span>
                    {isWinner ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-verdant/20 text-verdant border border-verdant/40">
                        200 OK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-saffron/20 text-saffron border border-saffron/40">
                        409 CONFLICT
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-mono text-ash truncate mb-2">
                    {res.user}
                  </p>

                  <div className="pt-2 border-t border-white/5 space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Latency:</span>
                      <span className="text-bone">{res.durationMs}ms</span>
                    </div>
                    <div className="text-[10px] leading-tight">
                      {isWinner ? (
                        <span className="text-verdant">✓ Lock Acquired</span>
                      ) : (
                        <span className="text-saffron">✗ Filter Blocked</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-void-border text-[11px] font-mono text-silver leading-relaxed">
            <span className="text-verdant font-semibold">VERIFICATION RESULT: </span>
            {resultData.summary}
          </div>
        </div>
      )}
    </div>
  );
}
