import React from 'react';

const STATES = [
  {
    label: 'Available',
    className:
      'border-[var(--seat-available-border)] bg-[var(--seat-available-bg)]'
  },
  {
    label: 'Selected',
    className: 'border-iris bg-iris ring-2 ring-iris/40'
  },
  {
    label: 'Held',
    className:
      'border-dashed border-[var(--seat-locked-border)] bg-[var(--seat-locked-bg)]'
  },
  {
    label: 'Sold',
    className:
      'border-[var(--seat-booked-border)] bg-[var(--seat-booked-bg)] opacity-40'
  }
];

export default function SeatLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {STATES.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <span className={`w-3.5 h-3.5 rounded-full border ${s.className}`} />
          <span className="label-mono text-ash">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
