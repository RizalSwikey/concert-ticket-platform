import React from 'react';

const LINKS = [
  { label: 'Shows', tab: 'discover' },
  { label: 'Venues', tab: 'venues' },
  { label: 'My Tickets', tab: 'tickets' }
];

export default function Footer({ onNavigate }) {
  return (
    <footer className="w-full bg-void border-t border-void-border pt-16 pb-28 md:pb-12">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <p
            className="text-bone leading-[0.84]"
            style={{
              fontWeight: 500,
              letterSpacing: '-0.05em',
              fontSize: 'clamp(2.5rem, 8vw, 6rem)'
            }}
          >
            RESERVA
          </p>

          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {LINKS.map((l) => (
              <button
                key={l.label}
                type="button"
                onClick={() => onNavigate?.(l.tab)}
                className="label-mono text-ash hover:text-bone transition-colors cursor-pointer"
              >
                {l.label}
              </button>
            ))}
            <a
              href="https://github.com/RizalSwikey"
              target="_blank"
              rel="noopener noreferrer"
              className="label-mono text-ash hover:text-bone transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-void-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[11px] font-mono text-tertiary">
            © 2026 Rizal Akbar Syah Fauzan Putra · @RizalSwikey
          </p>
          <p className="text-[11px] font-mono text-tertiary">
            Zero race condition — verified via WiredTiger single-doc mutex
          </p>
        </div>
      </div>
    </footer>
  );
}
