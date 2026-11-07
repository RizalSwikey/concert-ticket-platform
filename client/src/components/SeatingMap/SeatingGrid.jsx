import React, { useState } from 'react';
import SeatNode from './SeatNode';
import { ZoomIn, ZoomOut, RotateCcw, MoveHorizontal } from 'lucide-react';

export default function SeatingGrid({
  seats,
  selectedSeats,
  onToggleSeat
}) {
  const [zoomLevel, setZoomLevel] = useState(1);

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

  return (
    <div className="space-y-8">
      {/* Viewport Toolbar: Zoom Controls & Mobile Swipe Hint */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:px-6 rounded-2xl bg-void-card border border-void-border backdrop-blur-md">
        {/* Mobile Swipe Hint */}
        <div className="flex items-center space-x-2 text-xs font-mono text-silver">
          <MoveHorizontal className="w-4 h-4 text-iris animate-pulse" />
          <span>Swipe horizontally or use zoom controls to navigate the stadium</span>
        </div>

        {/* Zoom Controls */}
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

      {/* Scalable & Scrollable Stage Container */}
      <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-iris/40">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
          }}
          className="space-y-10 min-w-[780px] sm:min-w-[860px] mx-auto py-2"
        >
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
                className="p-5 sm:p-7 rounded-3xl bg-void-card border border-void-border backdrop-blur-sm"
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
                <div className="space-y-3">
                  {rowKeys.map((rowKey) => {
                    const rowSeats = rows[rowKey].sort((a, b) => a.number - b.number);
                    return (
                      <div
                        key={rowKey}
                        className="flex items-center justify-center space-x-2 sm:space-x-3"
                      >
                        {/* Row Indicator Left */}
                        <span className="w-7 text-center font-mono text-xs text-silver font-semibold">
                          {rowKey}
                        </span>

                        {/* Left Aisle Group (seats 1-10) */}
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                          {rowSeats.slice(0, 10).map((seat) => (
                            <SeatNode
                              key={seat._id}
                              seat={seat}
                              isSelected={selectedSeats.some((s) => s._id === seat._id)}
                              onToggle={onToggleSeat}
                            />
                          ))}
                        </div>

                        {/* Center Walking Aisle Gap */}
                        <div className="w-6 sm:w-10 h-6 border-b border-dashed border-void-border flex items-center justify-center">
                          <span className="text-[8px] font-mono text-silver">AISLE</span>
                        </div>

                        {/* Right Aisle Group (seats 11-20) */}
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                          {rowSeats.slice(10, 20).map((seat) => (
                            <SeatNode
                              key={seat._id}
                              seat={seat}
                              isSelected={selectedSeats.some((s) => s._id === seat._id)}
                              onToggle={onToggleSeat}
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
