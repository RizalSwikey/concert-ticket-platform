import React, { useState } from 'react';
import SeatNode from './SeatNode';
import Arena3DView from './Arena3DView';
import { ZoomIn, ZoomOut, RotateCcw, Eye } from 'lucide-react';

export default function SeatingGrid({ seats, selectedSeats, onToggleSeat }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [is3D, setIs3D] = useState(true);
  const [tilt, setTilt] = useState(38);

  const tiers = ['VIP', 'CAT 1', 'CAT 2'];

  const seatsByTier = { VIP: {}, 'CAT 1': {}, 'CAT 2': {} };
  seats.forEach((seat) => {
    const tier = seat.tier || 'CAT 1';
    if (!seatsByTier[tier]) seatsByTier[tier] = {};
    (seatsByTier[tier][seat.row] ||= []).push(seat);
  });

  // Sightline POV: distance by row, angle by left/right offset.
  const activeSeat =
    hoveredSeat || (selectedSeats.length > 0 ? selectedSeats[selectedSeats.length - 1] : null);

  const rowDistances = { A: 8, B: 14, C: 22, D: 30, E: 38, F: 46 };
  const seatDist = activeSeat ? rowDistances[activeSeat.row] || 20 : null;
  const seatAngle = activeSeat ? Math.round(((activeSeat.number - 10.5) / 9.5) * 28) : 0;

  let zoneLabel = 'Dead center';
  if (activeSeat) {
    if (seatAngle <= -16) zoneLabel = `Stage left wing (${seatAngle}°)`;
    else if (seatAngle < -5) zoneLabel = `Center-left (${seatAngle}°)`;
    else if (seatAngle <= 5) zoneLabel = 'Dead center (0°)';
    else if (seatAngle < 16) zoneLabel = `Center-right (+${seatAngle}°)`;
    else zoneLabel = `Stage right wing (+${seatAngle}°)`;
  }

  return (
    <div className="space-y-6">
      {/* Sightline POV */}
      <div className="border border-void-border rounded-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="label-mono text-bone flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            Stage sightline POV
          </span>
          <span className="label-mono text-ash">
            {activeSeat
              ? `${activeSeat.tier} · Row ${activeSeat.row} · Seat ${activeSeat.number}`
              : 'Hover or select a seat'}
          </span>
        </div>

        {activeSeat && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Mini stage viewport, scaled and rotated by the sightline */}
            <div className="md:col-span-5 h-36 rounded-lg border border-void-border relative overflow-hidden flex flex-col justify-between p-3 bg-void-surface">
              <div className="w-full flex justify-center pt-2">
                <div
                  style={{
                    transform: `scale(${Math.max(
                      0.65,
                      1.4 - (seatDist / 46) * 0.75
                    )}) rotateY(${-seatAngle * 0.7}deg)`,
                    transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)'
                  }}
                  className="w-40 py-2 px-3 rounded border border-iris text-center"
                >
                  <span className="block label-mono text-bone">MAIN STAGE</span>
                  <span className="block text-[9px] font-mono text-ash">LIVE</span>
                </div>
              </div>

              <svg className="w-full h-12" viewBox="0 0 200 60" aria-hidden="true">
                <line
                  x1="100"
                  y1="5"
                  x2={100 + (seatAngle / 28) * 75}
                  y2="55"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  className="text-iris"
                />
                <circle cx="100" cy="5" r="3" fill="currentColor" className="text-bone" />
                <circle
                  cx={100 + (seatAngle / 28) * 75}
                  cy="55"
                  r="3.5"
                  fill="currentColor"
                  className="text-iris"
                />
              </svg>

              <div className="flex items-center justify-between label-mono text-ash">
                <span>Your POV</span>
                <span className="text-bone">{zoneLabel}</span>
              </div>
            </div>

            {/* Meters */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="label-mono text-ash block mb-1">Distance</span>
                <span className="font-mono text-xl text-bone">{seatDist}m</span>
                <div className="w-full bg-void-elevated h-px mt-2">
                  <div
                    style={{ width: `${Math.max(15, 100 - (seatDist / 50) * 100)}%` }}
                    className="h-px bg-iris"
                  />
                </div>
                <span className="block label-mono text-ash mt-2">
                  {seatDist <= 14
                    ? 'Front row'
                    : seatDist <= 30
                    ? 'Prime field'
                    : 'Elevated'}
                </span>
              </div>

              <div>
                <span className="label-mono text-ash block mb-1">Angle</span>
                <span className="font-mono text-xl text-bone">
                  {seatAngle > 0 ? `+${seatAngle}°` : `${seatAngle}°`}
                </span>
                <div className="flex items-center justify-between label-mono text-ash mt-2">
                  <span>-28°</span>
                  <span className="text-bone">0°</span>
                  <span>+28°</span>
                </div>
                <span className="block label-mono text-ash mt-2 truncate">{zoneLabel}</span>
              </div>

              <div>
                <span className="label-mono text-ash block mb-1">Clarity</span>
                <span className="font-mono text-xl text-bone">
                  {seatDist <= 14 ? '100%' : seatDist <= 30 ? '96%' : '90%'}
                </span>
                <div className="w-full bg-void-elevated h-px mt-2">
                  <div
                    style={{ width: `${seatDist <= 14 ? 100 : seatDist <= 30 ? 96 : 90}%` }}
                    className="h-px bg-bone"
                  />
                </div>
                <span className="block label-mono text-ash mt-2">Unobstructed</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-void-border pb-3">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setIs3D(true)}
            aria-pressed={is3D}
            className={`relative label-mono pb-1 cursor-pointer transition-colors ${
              is3D ? 'text-bone' : 'text-ash hover:text-bone'
            }`}
          >
            3D Arena
            <span
              className={`absolute left-0 -bottom-px h-px bg-iris transition-[width] duration-300 ${
                is3D ? 'w-full' : 'w-0'
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => setIs3D(false)}
            aria-pressed={!is3D}
            className={`relative label-mono pb-1 cursor-pointer transition-colors ${
              !is3D ? 'text-bone' : 'text-ash hover:text-bone'
            }`}
          >
            2D Flat
            <span
              className={`absolute left-0 -bottom-px h-px bg-iris transition-[width] duration-300 ${
                !is3D ? 'w-full' : 'w-0'
              }`}
            />
          </button>
        </div>

        {is3D ? (
          <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
            <span className="label-mono text-ash whitespace-nowrap">Tilt {tilt}°</span>
            <input
              type="range"
              min="18"
              max="62"
              step="1"
              value={tilt}
              onChange={(e) => setTilt(Number(e.target.value))}
              aria-label="Camera tilt angle"
              className="w-full h-1 appearance-none rounded-full bg-void-elevated accent-[var(--accent-iris)] cursor-pointer"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 label-mono text-ash">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.8))}
              aria-label="Zoom out"
              className="p-1 hover:text-bone transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums text-bone">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.35))}
              aria-label="Zoom in"
              className="p-1 hover:text-bone transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              aria-label="Reset zoom"
              className="p-1 hover:text-bone transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {is3D ? (
        <Arena3DView
          seats={seats}
          selectedSeats={selectedSeats}
          onToggleSeat={onToggleSeat}
          tilt={tilt}
        />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
            }}
            className="space-y-8 min-w-[760px] sm:min-w-[840px] max-w-5xl mx-auto py-2"
          >
            {tiers.map((tierName) => {
              const rows = seatsByTier[tierName] || {};
              const rowKeys = Object.keys(rows).sort();
              if (rowKeys.length === 0) return null;

              return (
                <div key={tierName}>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-void-border">
                    <span className="label-mono text-bone">{tierName}</span>
                    <span className="label-mono text-ash">
                      {rowKeys.length} rows · {rowKeys.length * 20} seats
                    </span>
                  </div>

                  <div className="space-y-2">
                    {rowKeys.map((rowKey) => {
                      const rowSeats = rows[rowKey].sort((a, b) => a.number - b.number);
                      const renderSeat = (seat) => (
                        <SeatNode
                          key={seat._id}
                          seat={seat}
                          isSelected={selectedSeats.some((s) => s._id === seat._id)}
                          onToggle={onToggleSeat}
                          onHover={setHoveredSeat}
                        />
                      );

                      return (
                        <div
                          key={rowKey}
                          className="grid items-center gap-1 sm:gap-1.5"
                          style={{
                            gridTemplateColumns:
                              '1rem repeat(10, minmax(0, 1fr)) 2.5rem repeat(10, minmax(0, 1fr)) 1rem'
                          }}
                        >
                          <span className="text-center font-mono text-[10px] text-ash leading-none">
                            {rowKey}
                          </span>

                          {rowSeats.slice(0, 10).map(renderSeat)}

                          <div className="flex items-center justify-center">
                            <span className="label-mono text-tertiary" style={{ letterSpacing: 0 }}>
                              ·
                            </span>
                          </div>

                          {rowSeats.slice(10, 20).map(renderSeat)}

                          <span className="text-center font-mono text-[10px] text-ash leading-none">
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
      )}
    </div>
  );
}
