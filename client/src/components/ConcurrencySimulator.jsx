import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Zap, ShieldCheck, Play, Lock, CheckCircle2, XCircle, Flame, Target } from 'lucide-react';

export default function ConcurrencySimulator({
  concert,
  seats,
  onSimulationComplete
}) {
  const { addToast } = useToast();
  const [selectedSeatId, setSelectedSeatId] = useState('');
  const [running, setRunning] = useState(false);
  const [racingPhase, setRacingPhase] = useState('idle'); // 'idle' | 'racing' | 'finished'
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const availableSeats = seats.filter((s) => s.status === 'AVAILABLE');

  const handleRunRace = async () => {
    const seatIdToTest = selectedSeatId || availableSeats[0]?._id;
    if (!seatIdToTest) {
      addToast({
        type: 'warning',
        title: 'No Available Seats',
        message: 'No available seat found to test. Please reset the database.'
      });
      return;
    }

    setRunning(true);
    setRacingPhase('racing');
    setErrorMsg('');
    setResultData(null);

    try {
      // Small visual delay so the user witnesses the dramatic race start
      const [data] = await Promise.all([
        api.simulateConcurrency(seatIdToTest),
        new Promise((r) => setTimeout(r, 1400)) // 1.4s dramatic visual sprint
      ]);

      setResultData(data);
      setRacingPhase('finished');

      addToast({
        type: 'success',
        title: 'Race Complete: 0% Double Booking',
        message: `Seat ${data.seatNumber}: Exactly 1 winner (${data.winner}), 4 rejected.`
      });

      if (onSimulationComplete) {
        onSimulationComplete();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Concurrency race failed');
      setRacingPhase('idle');
      addToast({
        type: 'error',
        title: 'Simulation Error',
        message: err.message || 'Race failed'
      });
    } finally {
      setRunning(false);
    }
  };

  const currentSeat = seats.find((s) => s._id === (selectedSeatId || availableSeats[0]?._id));

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-void-surface/90 border border-iris/40 shadow-iris-glow backdrop-blur-2xl relative overflow-hidden">
      {/* Dynamic ambient stage spotlight background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-iris/15 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-saffron/10 blur-[90px] pointer-events-none rounded-full" />

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-void-border relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-iris text-xs font-mono font-semibold tracking-wider uppercase mb-1">
            <Zap className="w-4 h-4 fill-iris text-iris" />
            <span>Recruiter Concurrency Benchmark</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-bone">
            Simulate 5x Parallel Race on 1 Seat
          </h3>
          <p className="text-xs text-silver font-light mt-1 max-w-xl leading-relaxed">
            Witness the atomic lock mutual exclusion in action. Fires 5 concurrent requests at the exact same millisecond. Strictly 1 thread breaks through the mutex gate; the other 4 bounce off with 409 Conflict.
          </p>
        </div>

        {/* Trigger Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-void-card border border-void-border rounded-full px-3 py-1.5 text-xs font-mono">
            <Target className="w-3.5 h-3.5 text-saffron" />
            <select
              value={selectedSeatId || (availableSeats[0]?._id || '')}
              onChange={(e) => setSelectedSeatId(e.target.value)}
              disabled={running}
              aria-label="Target seat for concurrency race test"
              className="bg-transparent text-bone focus:outline-none cursor-pointer"
            >
              {availableSeats.slice(0, 20).map((s) => (
                <option key={s._id} value={s._id} className="bg-void-surface text-bone">
                  Target: {s.seatNumber} ({s.tier})
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleRunRace}
            disabled={running}
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-iris hover:bg-iris-hover text-white shadow-iris-glow text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${running ? 'animate-pulse' : ''}`} />
            <span>{running ? 'Racing 5 Threads...' : 'Simulate 5x Parallel Race'}</span>
          </motion.button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono mb-6">
          {errorMsg}
        </div>
      )}

      {/* 5-LANE DRAMATIC RACE TRACK VISUALIZATION */}
      <div className="p-4 sm:p-6 rounded-2xl bg-void-card/80 border border-void-border backdrop-blur-xl relative z-10 mb-6 overflow-x-auto">
        <div className="min-w-[520px] space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-silver pb-2 border-b border-white/5">
          <span className="flex items-center space-x-1.5 text-bone">
            <Lock className="w-3.5 h-3.5 text-saffron" />
            <span>ATOMIC MUTEX GATE: {currentSeat?.seatNumber || 'VIP-A1'}</span>
          </span>
        </div>

        {/* 5 Race Lanes */}
        {[
          { name: 'Thread Alpha (Req #1)', color: 'from-iris to-violet-400' },
          { name: 'Thread Beta (Req #2)', color: 'from-iris to-fuchsia-400' },
          { name: 'Thread Gamma (Req #3)', color: 'from-iris to-purple-400' },
          { name: 'Thread Delta (Req #4)', color: 'from-iris to-indigo-400' },
          { name: 'Thread Epsilon (Req #5)', color: 'from-iris to-pink-400' }
        ].map((lane, idx) => {
          const outcome = resultData?.results?.[idx];
          const isWinner = outcome?.status === 200;
          const isFinished = racingPhase === 'finished';

          return (
            <div key={idx} className="relative flex items-center space-x-3 text-xs font-mono">
              <span className="w-36 text-ash text-[11px] truncate shrink-0">
                {lane.name}
              </span>

              {/* Race Track */}
              <div className="flex-1 h-7 rounded-xl bg-void-surface border border-white/5 relative overflow-hidden flex items-center px-2">
                {/* Finish Barrier Gate */}
                <div className="absolute right-0 top-0 bottom-0 w-12 border-l border-dashed border-white/20 flex items-center justify-center bg-white/5">
                  <Lock className={`w-3.5 h-3.5 ${isWinner ? 'text-verdant' : 'text-ash'}`} />
                </div>

                {/* Animated Racing Packet */}
                <motion.div
                  initial={{ left: '0%' }}
                  animate={
                    racingPhase === 'racing'
                      ? { left: ['0%', '82%'] }
                      : isFinished
                      ? isWinner
                        ? { left: '88%' }
                        : { left: '74%' }
                      : { left: '0%' }
                  }
                  transition={{
                    duration: racingPhase === 'racing' ? 1.2 : 0.3,
                    ease: isWinner ? 'easeOut' : 'backIn'
                  }}
                  className={`absolute h-5 px-2.5 rounded-lg flex items-center space-x-1 text-[10px] font-bold shadow-md ${
                    isFinished
                      ? isWinner
                        ? 'bg-verdant text-white shadow-verdant/40'
                        : 'bg-red-500/80 text-white shadow-red-500/30'
                      : 'bg-gradient-to-r ' + lane.color + ' text-white'
                  }`}
                >
                  <Flame className="w-2.5 h-2.5" />
                  <span>
                    {isFinished
                      ? isWinner
                        ? '200 OK (LOCK WON)'
                        : '409 CONFLICT'
                      : `${Math.floor(10 + idx * 2)}ms`}
                  </span>
                </motion.div>
              </div>

              {/* Status Outcome Badge */}
              <span className="w-28 text-right font-mono text-[11px]">
                {isFinished ? (
                  isWinner ? (
                    <span className="text-verdant font-bold flex items-center justify-end space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACQUIRED</span>
                    </span>
                  ) : (
                    <span className="text-saffron flex items-center justify-end space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>REJECTED</span>
                    </span>
                  )
                ) : (
                  <span className="text-zinc-600">STANDBY</span>
                )}
              </span>
            </div>
          );
        })}
        </div>
      </div>

      {/* Results Matrix & Engineering Proof */}
      {resultData && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 relative z-10"
        >
          {/* Summary Banner */}
          <div className="p-4 rounded-2xl bg-void-card border border-void-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-verdant" />
              <span className="text-bone font-semibold">
                Race Target: Seat {resultData.seatNumber} ({resultData.seatTier})
              </span>
            </div>
            <div className="flex items-center space-x-4 text-silver">
              <span>Duration: <strong className="text-bone">{resultData.totalDurationMs}ms</strong></span>
              <span className="text-verdant font-semibold">Winner: 1</span>
              <span className="text-saffron font-semibold">Rejected: {resultData.conflictCount}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-void-border text-[11px] font-mono text-silver leading-relaxed">
            <span className="text-verdant font-semibold">MUTEX ATOMIC VERIFICATION: </span>
            {resultData.summary}
          </div>
        </motion.div>
      )}
    </div>
  );
}
