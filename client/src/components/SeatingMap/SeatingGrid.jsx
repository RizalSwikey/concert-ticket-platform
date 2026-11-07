import React from 'react';
import SeatNode from './SeatNode';

export default function SeatingGrid({
  seats,
  selectedSeats,
  onToggleSeat,
  onTestConcurrency
}) {
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
    <div className="space-y-12">
      {tiers.map((tierName) => {
        const rows = seatsByTier[tierName] || {};
        const rowKeys = Object.keys(rows).sort();

        if (rowKeys.length === 0) return null;

        const tierColor =
          tierName === 'VIP'
            ? 'text-iris border-iris/30 bg-iris/5'
            : tierName === 'CAT 1'
            ? 'text-verdant border-verdant/30 bg-verdant/5'
            : 'text-saffron border-saffron/30 bg-saffron/5';

        return (
          <div
            key={tierName}
            className="p-6 sm:p-8 rounded-3xl bg-void-card/40 border border-void-border backdrop-blur-sm"
          >
            {/* Tier Section Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-void-border">
              <div className="flex items-center space-x-3">
                <span className={`text-xs font-mono font-semibold px-3 py-1 rounded-full border ${tierColor}`}>
                  {tierName} SECTION
                </span>
                <span className="text-xs text-silver font-light hidden sm:inline">
                  {tierName === 'VIP'
                    ? 'Front-row stage experience + Soundbooth'
                    : tierName === 'CAT 1'
                    ? 'Center arena prime acoustics'
                    : 'Grandstand elevated wide sightline'}
                </span>
              </div>
              <span className="text-xs font-mono text-ash">
                {rowKeys.length} Rows • {rowKeys.length * 20} Seats
              </span>
            </div>

            {/* Seat Rows Grid */}
            <div className="space-y-3 overflow-x-auto pb-2">
              {rowKeys.map((rowKey) => {
                const rowSeats = rows[rowKey].sort((a, b) => a.number - b.number);
                return (
                  <div
                    key={rowKey}
                    className="flex items-center justify-center space-x-2 sm:space-x-3 min-w-[640px]"
                  >
                    {/* Row Indicator Left */}
                    <span className="w-6 text-center font-mono text-xs text-silver font-medium">
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
                          onConcurrencyTest={onTestConcurrency}
                        />
                      ))}
                    </div>

                    {/* Center Walking Aisle Gap */}
                    <div className="w-4 sm:w-8 h-4 border-b border-dashed border-white/10 flex items-center justify-center">
                      <span className="text-[8px] font-mono text-zinc-600">AISLE</span>
                    </div>

                    {/* Right Aisle Group (seats 11-20) */}
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      {rowSeats.slice(10, 20).map((seat) => (
                        <SeatNode
                          key={seat._id}
                          seat={seat}
                          isSelected={selectedSeats.some((s) => s._id === seat._id)}
                          onToggle={onToggleSeat}
                          onConcurrencyTest={onTestConcurrency}
                        />
                      ))}
                    </div>

                    {/* Row Indicator Right */}
                    <span className="w-6 text-center font-mono text-xs text-silver font-medium">
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
  );
}
