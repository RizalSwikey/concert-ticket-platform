import React, { useState } from 'react';
import SeatNode from './SeatNode';
import { ZoomIn, ZoomOut, RotateCcw, MoveHorizontal, Box, LayoutGrid, Eye, Compass, Sparkles, Radio } from 'lucide-react';

export default function SeatingGrid({
  seats,
  selectedSeats,
  onToggleSeat
}) {
  const [viewMode, setViewMode] = useState('3D'); // '3D' | '2D'
  const [tiltAngle, setTiltAngle] = useState(38); // 20deg to 55deg
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const is3D = viewMode === '3D';

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.15, 1.45));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.15, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  // Group seats by Tier, then Row
  const tiers = ['VIP', 'CAT 1', 'CAT 2'];

  const seatsByTier = {
    VIP: {},
    'CAT 1': {},
    'CAT 2': {}
  };

  seats.forEach((seat) => {
    const tier = seat.tier || 'CAT 1';
    if (!seatsByTier[tier]) seatsByTier[tier] = {};
    if (!seatsByTier[tier][seat.row]) seatsByTier[tier][seat.row] = [];
    seatsByTier[tier][seat.row].push(seat);
  });

  // Sightline POV Calculation: Stage Distance & Viewing Angle
  const activeSeat = hoveredSeat || (selectedSeats.length > 0 ? selectedSeats[selectedSeats.length - 1] : null);

  const rowDistances = { A: 8, B: 14, C: 22, D: 30, E: 38, F: 46 };
  const seatDist = activeSeat ? (rowDistances[activeSeat.row] || 20) : null;
  const seatAngle = activeSeat ? Math.round(((activeSeat.number - 10.5) / 9.5) * 28) : 0;

  let zoneLabel = '0° Acoustic Sweetspot (Dead Center)';
  if (activeSeat) {
    if (seatAngle <= -16) zoneLabel = `Stage Left Wing (-${Math.abs(seatAngle)}°)`;
    else if (seatAngle < -5) zoneLabel = `Center-Left Sweetspot (-${Math.abs(seatAngle)}°)`;
    else if (seatAngle <= 5) zoneLabel = `0° Acoustic Sweetspot (Dead Center)`;
    else if (seatAngle < 16) zoneLabel = `Center-Right Sweetspot (+${seatAngle}°)`;
    else zoneLabel = `Stage Right Wing (+${seatAngle}°)`;
  }
  return (
    <div className="space-y-8">
      {/* 3D Stage Sightline Preview (Sudut Pandang Penonton ke Panggung) */}
      <div className="rounded-3xl bg-void-card/90 border border-void-border p-4 sm:p-6 backdrop-blur-xl shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-void-border">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-iris animate-pulse" />
            <span className="text-xs font-mono font-semibold text-bone uppercase tracking-wider">
              3D STAGE SIGHTLINE POV & VIEWING ANGLE METER
            </span>
          </div>
          {activeSeat ? (
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-iris/20 text-iris border border-iris/40 font-semibold self-start sm:self-auto">
              Target: {activeSeat.tier} Row {activeSeat.row} • Seat #{activeSeat.number}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-silver">
              Hover or select a seat to preview Stage POV
            </span>
          )}
        </div>

        {activeSeat ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Left: Perspective Mini Stage Viewport */}
            <div className="md:col-span-5 h-40 rounded-2xl bg-zinc-950 border border-white/10 relative overflow-hidden flex flex-col justify-between p-3 perspective-1000">
              {/* Ambient Moving Stage Lasers */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
                <div className="absolute top-0 left-1/3 w-8 h-32 bg-gradient-to-b from-iris/60 to-transparent animate-laser-sweep-1" />
                <div className="absolute top-0 right-1/3 w-8 h-32 bg-gradient-to-b from-emerald-400/50 to-transparent animate-laser-sweep-2" />
              </div>

              {/* Mini Stage Screen scaled by distance and rotated by sightline angle */}
              <div className="w-full flex justify-center pt-2 relative z-10 preserve-3d">
                <div
                  style={{
                    transform: `scale(${Math.max(0.65, 1.4 - (seatDist / 46) * 0.75)}) rotateY(${-seatAngle * 0.7}deg)`,
                    transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)'
                  }}
                  className="w-44 py-2 px-3 rounded-lg border border-iris bg-gradient-to-b from-iris/30 to-zinc-900 text-center shadow-iris-glow preserve-3d"
                >
                  <span className="text-[9px] font-mono text-white font-bold block">
                    MAIN STAGE CENTER
                  </span>
                  <span className="text-[7px] font-mono text-emerald-400">
                    LIVE DOLBY ATMOS
                  </span>
                </div>
              </div>

              {/* Sightline Angle Ray connecting Viewer to Stage */}
              <div className="relative w-full h-12 flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 200 60">
                  <line
                    x1="100"
                    y1="5"
                    x2={100 + (seatAngle / 28) * 75}
                    y2="55"
                    stroke="var(--accent-iris, #8052ff)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <circle cx="100" cy="5" r="3.5" fill="#10b981" />
                  <circle
                    cx={100 + (seatAngle / 28) * 75}
                    cy="55"
                    r="4"
                    fill="#8052ff"
                    className="animate-pulse"
                  />
                </svg>
              </div>

              {/* Viewer Node Position Indicator */}
              <div className="flex items-center justify-between text-[9px] font-mono text-silver z-10 border-t border-white/5 pt-1">
                <span>YOUR SIGHTLINE POV</span>
                <span className="text-iris font-semibold">{zoneLabel}</span>
              </div>
            </div>

            {/* Right: Metrics Panel (Distance & Viewing Angle Gauges) */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Distance Meter */}
              <div className="p-3.5 rounded-2xl bg-void-surface border border-void-border">
                <span className="text-[10px] font-mono text-silver uppercase block mb-1">
                  Stage Distance
                </span>
                <div className="text-xl font-mono font-bold text-bone">
                  {seatDist}m
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(15, 100 - (seatDist / 50) * 100)}%` }}
                    className="h-full bg-iris rounded-full"
                  />
                </div>
                <span className="text-[9px] font-mono text-silver block mt-1">
                  {seatDist <= 14 ? 'Apex Front Row' : seatDist <= 30 ? 'Prime Soundfield' : 'Elevated Overview'}
                </span>
              </div>

              {/* Viewing Angle Meter */}
              <div className="p-3.5 rounded-2xl bg-void-surface border border-void-border">
                <span className="text-[10px] font-mono text-silver uppercase block mb-1">
                  Sightline Angle
                </span>
                <div className="text-xl font-mono font-bold text-bone">
                  {seatAngle > 0 ? `+${seatAngle}°` : `${seatAngle}°`}
                </div>
                <div className="flex items-center justify-between text-[8px] font-mono text-ash mt-2">
                  <span>-28° (L)</span>
                  <span className="text-iris font-bold">0°</span>
                  <span>+28° (R)</span>
                </div>
                <span className="text-[9px] font-mono text-silver block mt-1 truncate">
                  {zoneLabel}
                </span>
              </div>

              {/* Acoustic Field Assessment */}
              <div className="p-3.5 rounded-2xl bg-void-surface border border-void-border">
                <span className="text-[10px] font-mono text-silver uppercase block mb-1">
                  Sightline Clarity
                </span>
                <div className="text-xl font-mono font-bold text-verdant">
                  {seatDist <= 14 ? '100%' : seatDist <= 30 ? '96%' : '90%'}
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    style={{ width: `${seatDist <= 14 ? 100 : seatDist <= 30 ? 96 : 90}%` }}
                    className="h-full bg-verdant rounded-full"
                  />
                </div>
                <span className="text-[9px] font-mono text-silver block mt-1">
                  Direct Unobstructed Ray
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-1">
            <p className="text-xs font-mono text-silver">
              Click or hover any seat on the arena map below to inspect live Stage Distance, Viewing Angle Meter, and direct Sightline POV.
            </p>
          </div>
        )}
      </div>

      {/* Viewport Toolbar: 2D/3D Switcher, Camera Tilt Angle Slider & Zoom Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 sm:px-6 rounded-2xl bg-void-card border border-void-border backdrop-blur-md">
        {/* Left: View Mode Toggle (3D Arena View vs 2D Flat View) */}
        <div className="flex items-center space-x-2 bg-void-surface border border-void-border rounded-full p-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => setViewMode('3D')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === '3D'
                ? 'bg-iris text-white shadow-iris-glow font-semibold'
                : 'text-silver hover:text-bone hover:bg-void-card'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Arena View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('2D')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === '2D'
                ? 'bg-iris text-white shadow-iris-glow font-semibold'
                : 'text-silver hover:text-bone hover:bg-void-card'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>2D Flat View</span>
          </button>
        </div>

        {/* Center: Camera Tilt Angle Slider (Only visible in 3D Mode) */}
        {is3D && (
          <div className="flex items-center space-x-3 bg-void-surface border border-void-border rounded-full px-4 py-1.5 text-xs font-mono">
            <span className="text-silver whitespace-nowrap flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-iris" />
              <span>Camera Tilt:</span>
            </span>
            <input
              type="range"
              min="20"
              max="55"
              value={tiltAngle}
              onChange={(e) => setTiltAngle(Number(e.target.value))}
              className="w-24 sm:w-32 accent-iris cursor-pointer"
              aria-label="Camera Tilt Angle"
            />
            <span className="text-bone font-semibold w-8 text-right">
              {tiltAngle}°
            </span>

            {/* Tilt Angle Presets */}
            <div className="hidden sm:flex items-center space-x-1 pl-1 border-l border-void-border">
              {[
                { label: '28°', val: 28 },
                { label: '38°', val: 38 },
                { label: '48°', val: 48 }
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setTiltAngle(p.val)}
                  className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                    tiltAngle === p.val
                      ? 'bg-iris/25 text-iris font-bold'
                      : 'text-silver hover:text-bone'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right: Zoom Controls */}
        <div className="flex items-center space-x-2 bg-void-surface border border-void-border rounded-full p-1 text-xs font-mono">
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-full flex items-center justify-center text-silver hover:text-bone hover:bg-void-card transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-0.5 rounded-md text-[11px] text-bone hover:bg-void-card transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-full flex items-center justify-center text-silver hover:text-bone hover:bg-void-card transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="w-7 h-7 rounded-full flex items-center justify-center text-silver hover:text-bone hover:bg-void-card transition-colors cursor-pointer"
            title="Reset to 100%"
            aria-label="Reset zoom level"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Perspective Stage Container */}
      <div className={`overflow-x-auto pb-10 scrollbar-thin scrollbar-thumb-iris/40 ${is3D ? 'perspective-1200' : ''}`}>
        <div
          style={{
            transform: is3D
              ? `perspective(1200px) rotateX(${tiltAngle}deg) scale(${zoomLevel})`
              : `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.35s cubic-bezier(0.2, 0, 0, 1)'
          }}
          className={`space-y-10 min-w-[780px] sm:min-w-[860px] mx-auto py-4 ${is3D ? 'preserve-3d' : ''}`}
        >
          {/* 3D Main Stage Wall inside 3D arena standing upright (rotateX: -70deg) */}
          {is3D && (
            <div
              style={{
                transform: 'rotateX(-70deg) translateZ(20px)',
                transformOrigin: 'bottom center'
              }}
              className="w-full max-w-2xl mx-auto mb-6 text-center preserve-3d"
            >
              <div className="h-20 w-full rounded-2xl border-2 border-iris/80 bg-gradient-to-b from-void-surface via-zinc-900 to-void-card shadow-ambient-stage relative overflow-hidden flex flex-col items-center justify-center p-3 backdrop-blur-xl">
                {/* Moving Spotlights Visualization */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-1/4 w-12 h-36 bg-gradient-to-b from-iris/60 to-transparent animate-laser-sweep-1" />
                  <div className="absolute top-0 right-1/4 w-12 h-36 bg-gradient-to-b from-emerald-400/50 to-transparent animate-laser-sweep-2" />
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-bone z-10 font-bold">
                  <Radio className="w-3.5 h-3.5 text-iris animate-pulse" />
                  <span>3D ARENA MAIN STAGE • DIRECT ACOUSTIC APEX</span>
                  <Sparkles className="w-3.5 h-3.5 text-saffron" />
                </div>
                <span className="text-[10px] font-mono text-silver tracking-wider uppercase mt-1 z-10">
                  Camera Isometric Frustum Tilt: {tiltAngle}°
                </span>
              </div>
            </div>
          )}

          {tiers.map((tierName) => {
            const rows = seatsByTier[tierName] || {};
            const rowKeys = Object.keys(rows).sort();

            if (rowKeys.length === 0) return null;

            const tierColor =
              tierName === 'VIP'
                ? 'text-iris border-iris/40 bg-iris/10'
                : tierName === 'CAT 1'
                ? 'text-verdant border-verdant/40 bg-verdant/10'
                : 'text-saffron border-saffron/40 bg-saffron/10';

            return (
              <div
                key={tierName}
                className={`p-5 sm:p-7 rounded-3xl bg-void-card border border-void-border backdrop-blur-sm ${
                  is3D ? 'preserve-3d shadow-xl' : ''
                }`}
              >
                {/* Tier Section Header */}
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-void-border">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-mono font-semibold px-3 py-1 rounded-full border ${tierColor}`}>
                      {tierName} SECTION
                    </span>
                    <span className="text-xs text-silver font-light hidden sm:inline">
                      {tierName === 'VIP'
                        ? 'Front-row stage experience + Soundbooth apex'
                        : tierName === 'CAT 1'
                        ? 'Center arena prime acoustics'
                        : 'Grandstand elevated wide sightline'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-silver">
                    {rowKeys.length} Rows • {rowKeys.length * 20} Seats
                  </span>
                </div>

                {/* Seat Rows Grid */}
                <div className={`space-y-3 ${is3D ? 'preserve-3d' : ''}`}>
                  {rowKeys.map((rowKey) => {
                    const rowSeats = rows[rowKey].sort((a, b) => a.number - b.number);
                    return (
                      <div
                        key={rowKey}
                        className={`flex items-center justify-center space-x-2 sm:space-x-3 ${
                          is3D ? 'preserve-3d' : ''
                        }`}
                      >
                        {/* Row Indicator Left */}
                        <span className="w-7 text-center font-mono text-xs text-silver font-semibold">
                          {rowKey}
                        </span>

                        {/* Left Aisle Group (seats 1-10) */}
                        <div className={`flex items-center space-x-1.5 sm:space-x-2 ${is3D ? 'preserve-3d' : ''}`}>
                          {rowSeats.slice(0, 10).map((seat) => (
                            <SeatNode
                              key={seat._id}
                              seat={seat}
                              isSelected={selectedSeats.some((s) => s._id === seat._id)}
                              onToggle={onToggleSeat}
                              is3D={is3D}
                              onHover={setHoveredSeat}
                            />
                          ))}
                        </div>

                        {/* Center Walking Aisle Gap */}
                        <div className="w-6 sm:w-10 h-6 border-b border-dashed border-void-border flex items-center justify-center">
                          <span className="text-[8px] font-mono text-silver">AISLE</span>
                        </div>

                        {/* Right Aisle Group (seats 11-20) */}
                        <div className={`flex items-center space-x-1.5 sm:space-x-2 ${is3D ? 'preserve-3d' : ''}`}>
                          {rowSeats.slice(10, 20).map((seat) => (
                            <SeatNode
                              key={seat._id}
                              seat={seat}
                              isSelected={selectedSeats.some((s) => s._id === seat._id)}
                              onToggle={onToggleSeat}
                              is3D={is3D}
                              onHover={setHoveredSeat}
                            />
                          ))}
                        </div>

                        {/* Row Indicator Right */}
                        <span className="w-7 text-center font-mono text-xs text-silver font-semibold">
                          {rowKey}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
