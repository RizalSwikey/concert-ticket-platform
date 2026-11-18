import React, { useMemo } from 'react';

// True isometric projection computed in math (rotateZ by yaw, then rotateX by pitch),
// not CSS 3D: the browser keeps SVG crisp at any zoom, while `transform: rotateX()`
// rasterizes the layer and blurs the seat numbers.
const TIERS = ['VIP', 'CAT 1', 'CAT 2'];
// Geometry shares one unit budget with the final viewBox (~1 unit ≈ 1 px).
const SX = 34;   // seat pitch (x)
const SY = 40;   // row pitch (y)
const GAP = 52;  // gap between tier blocks
const W = 12;    // seat half width
const D = 13;    // seat half depth
const AISLE_HALF = 22;
const BASE_Z = { VIP: 0, 'CAT 1': 14, 'CAT 2': 30 };
const RISE = { selected: 26, locked: 13, flat: 6 };
const YAW = (11 * Math.PI) / 180;

// 10 seats per block with pitch SX → centres span ±4.5·SX around the block centre.
const BLOCK_HALF = 4.5 * SX;
const SEAT_HALF_W = AISLE_HALF + 2 * BLOCK_HALF + W;
// The stage is deliberately narrower than the seating bowl so the bowl reads as an arc.
const STAGE_HALF = SEAT_HALF_W * 0.66;
// Kept short so the LED wall never occludes the VIP rows behind it.
const STAGE_H = 24;
const STAGE_BACK = -34;
const STAGE_FRONT = -12;

// Colours come from the shared tokens, so light/dark adapt with no JS branch.
const PALETTE = {
  free: { top: 'var(--bg-elevated)', front: 'var(--border-subtle)', stroke: 'var(--seat-available-border)' },
  selected: { top: 'var(--accent-iris)', front: 'var(--accent-iris)', stroke: 'var(--accent-iris)' },
  locked: { top: 'var(--accent-saffron)', front: 'var(--accent-saffron)', stroke: 'var(--accent-saffron)' },
  booked: { top: 'var(--bg-elevated)', front: 'var(--bg-elevated)', stroke: 'var(--seat-booked-border)' }
};

export default function Arena3DView({ seats, selectedSeats, onToggleSeat, tilt = 38 }) {
  const pitch = (tilt * Math.PI) / 180;
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const cosY = Math.cos(YAW);
  const sinY = Math.sin(YAW);

  // yaw rotates the floor plan in-plane, pitch tips it toward the viewer.
  const project = (x, y, z) => {
    const xr = x * cosY + y * sinY;
    const yr = -x * sinY + y * cosY;
    return [xr, yr * cosP - z * sinP];
  };
  const depth = (x, y) => -x * sinY + y * cosY;

  const { blocks, viewBox } = useMemo(() => {
    const rowsByTier = {};
    seats.forEach((seat) => {
      const tier = seat.tier || 'CAT 1';
      (rowsByTier[tier] ||= {});
      (rowsByTier[tier][seat.row] ||= []).push(seat);
    });

    const list = [];
    let cursor = 26;

    TIERS.forEach((tier) => {
      const rows = rowsByTier[tier];
      if (!rows) return;
      const keys = Object.keys(rows).sort();
      const baseZ = BASE_Z[tier] ?? 0;

      keys.forEach((key, ri) => {
        const y = cursor + ri * SY;
        rows[key].forEach((seat) => {
          const isLeft = seat.number <= 10;
          const blockCenter = isLeft ? -(AISLE_HALF + BLOCK_HALF) : AISLE_HALF + BLOCK_HALF;
          const mid = isLeft ? 5.5 : 15.5;
          list.push({ seat, x: blockCenter + (seat.number - mid) * SX, y, z: baseZ, row: key, tier });
        });
      });

      cursor += keys.length * SY + GAP;
    });

    // Painter's algorithm: farthest (smallest depth) first, nearest overlays.
    list.sort((a, b) => depth(a.x, a.y) - depth(b.x, b.y));

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const track = (x, y, z) => {
      const [px, py] = project(x, y, z);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    };
    list.forEach(({ x, y, z }) => {
      track(x - W, y - D, z + RISE.selected);
      track(x + W, y + D, z + RISE.selected);
      track(x - W, y + D, z);
    });
    track(-STAGE_HALF, STAGE_BACK, STAGE_H);
    track(STAGE_HALF, STAGE_BACK, STAGE_H);
    track(-STAGE_HALF, STAGE_FRONT, 0);
    track(STAGE_HALF, STAGE_FRONT, 0);

    const pad = 16;
    return {
      blocks: list,
      // Left labels and right tier badges live outside the seat extents.
      viewBox: `${minX - pad - 26} ${minY - pad} ${maxX - minX + pad * 2 + 96} ${maxY - minY + pad * 2}`
    };
  }, [seats, cosP, sinP, cosY, sinY]);

  const pt = (x, y, z) => project(x, y, z).join(',');
  const quad = (a, b, c, d) => [a, b, c, d].join(' ');

  const rowLines = useMemo(() => {
    const seen = new Map();
    blocks.forEach(({ y, row, z, tier }) => {
      if (!seen.has(y)) seen.set(y, { y, row, z, tier });
    });
    const list = [...seen.values()];
    let prev = null;
    return list.map((item) => {
      const isTierStart = item.tier !== prev;
      prev = item.tier;
      return { ...item, isTierStart };
    });
  }, [blocks]);

  const labelPos = project(0, STAGE_FRONT, STAGE_H * 0.45);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <svg
        viewBox={viewBox}
        role="group"
        aria-label="3D isometric arena seating view"
        className="w-full h-auto min-w-[520px]"
      >
        {/* Row guide lines painted on the arena floor, with row letter at both ends */}
        {rowLines.map(({ y, row, z, tier, isTierStart }) => {
          const a = project(-SEAT_HALF_W, y, z);
          const b = project(SEAT_HALF_W, y, z);
          return (
            <g key={`row-${y}`}>
              <line
                x1={a[0]}
                y1={a[1]}
                x2={b[0]}
                y2={b[1]}
                stroke="var(--grid-line)"
                strokeWidth="1"
              />
              <text
                x={a[0] - 14}
                y={a[1] + 4}
                textAnchor="middle"
                className="select-none pointer-events-none"
                fill="var(--text-tertiary)"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
              >
                {row}
              </text>
              <text
                x={b[0] + 14}
                y={b[1] + 4}
                textAnchor="middle"
                className="select-none pointer-events-none"
                fill="var(--text-tertiary)"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
              >
                {row}
              </text>
              {isTierStart && (
                <text
                  x={b[0] + 44}
                  y={b[1] + 4}
                  textAnchor="start"
                  className="select-none pointer-events-none"
                  fill="var(--accent-iris)"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  letterSpacing="1.5"
                >
                  {tier.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}

        {/* Stage floor plate, then the standing LED wall */}
        <polygon
          points={quad(
            pt(-STAGE_HALF, STAGE_BACK, 0),
            pt(STAGE_HALF, STAGE_BACK, 0),
            pt(STAGE_HALF, STAGE_FRONT, 0),
            pt(-STAGE_HALF, STAGE_FRONT, 0)
          )}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />
        <polygon
          points={quad(
            pt(-STAGE_HALF, STAGE_FRONT, 0),
            pt(STAGE_HALF, STAGE_FRONT, 0),
            pt(STAGE_HALF, STAGE_FRONT, STAGE_H),
            pt(-STAGE_HALF, STAGE_FRONT, STAGE_H)
          )}
          fill="var(--bg-elevated)"
          stroke="var(--border-medium)"
          strokeWidth="1.2"
        />
        <text
          x={labelPos[0]}
          y={labelPos[1] + 4}
          textAnchor="middle"
          className="select-none pointer-events-none"
          fill="var(--text-primary)"
          fontSize="14"
          fontFamily="ui-monospace, monospace"
          letterSpacing="3"
        >
          MAIN STAGE
        </text>

        {/* Seat prisms */}
        {blocks.map(({ seat, x, y, z }) => {
          const isSelected = selectedSeats.some((s) => s._id === seat._id);
          const isLocked = seat.status === 'LOCKED';
          const isBooked = seat.status === 'BOOKED';
          const isHeldByMe = seat.isLockedByMe;

          const key =
            isSelected || isHeldByMe
              ? 'selected'
              : isLocked
              ? 'locked'
              : isBooked
              ? 'booked'
              : 'free';
          const col = PALETTE[key];
          const height =
            key === 'selected' ? RISE.selected : key === 'locked' ? RISE.locked : RISE.flat;
          const topZ = z + height;
          const blocked = isBooked || (isLocked && !isHeldByMe);

          const topFace = quad(
            pt(x - W, y - D, topZ),
            pt(x + W, y - D, topZ),
            pt(x + W, y + D, topZ),
            pt(x - W, y + D, topZ)
          );
          const frontFace = quad(
            pt(x - W, y + D, z),
            pt(x + W, y + D, z),
            pt(x + W, y + D, topZ),
            pt(x - W, y + D, topZ)
          );
          const sideFace = quad(
            pt(x + W, y - D, z),
            pt(x + W, y + D, z),
            pt(x + W, y + D, topZ),
            pt(x + W, y - D, topZ)
          );

          return (
            <g
              key={seat._id}
              role={blocked ? undefined : 'button'}
              tabIndex={blocked ? undefined : 0}
              aria-label={`Seat ${seat.seatNumber}, ${seat.status}`}
              onClick={() => !blocked && onToggleSeat(seat)}
              onKeyDown={(e) => {
                if (blocked) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleSeat(seat);
                }
              }}
              className={
                blocked ? '' : 'cursor-pointer outline-none focus-visible:opacity-80 hover:opacity-85'
              }
              opacity={key === 'booked' ? 0.4 : 1}
            >
              <title>{`${seat.seatNumber} · ${seat.tier} · ${seat.status}`}</title>
              {key === 'selected' && (
                <polygon
                  points={quad(
                    pt(x - W * 2.2, y - D * 2.2, z),
                    pt(x + W * 2.2, y - D * 2.2, z),
                    pt(x + W * 2.2, y + D * 2.2, z),
                    pt(x - W * 2.2, y + D * 2.2, z)
                  )}
                  fill="none"
                  stroke="var(--accent-iris)"
                  strokeWidth="1.5"
                />
              )}
              <polygon points={sideFace} fill={col.front} fillOpacity="0.55" />
              <polygon
                points={frontFace}
                fill={col.front}
                fillOpacity={key === 'free' ? 0.35 : 0.85}
              />
              <polygon points={topFace} fill={col.top} stroke={col.stroke} strokeWidth="1" />
              <text
                x={project(x, y, topZ)[0]}
                y={project(x, y, topZ)[1] + 4}
                textAnchor="middle"
                className="select-none pointer-events-none"
                fill={
                  key === 'free'
                    ? 'var(--seat-available-text)'
                    : key === 'booked'
                    ? 'var(--seat-booked-text)'
                    : '#ffffff'
                }
                fontSize="12"
                fontFamily="ui-monospace, monospace"
              >
                {seat.number}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
