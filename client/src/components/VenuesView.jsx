import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Users, Radio, ArrowRight } from 'lucide-react';

const VENUES_DATA = [
  {
    name: 'Gelora Bung Karno Stadium',
    location: 'Senayan, Central Jakarta',
    capacity: '78,000',
    acoustics: 'Stadium surround array · dual delay towers',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
    currentHeadliner: 'Coldplay — Music of the Spheres'
  },
  {
    name: 'Jakarta International Stadium',
    location: 'Tanjung Priok, North Jakarta',
    capacity: '82,000',
    acoustics: 'Retractable roof · Bose Professional',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    currentHeadliner: 'Bruno Mars — The 24K Tour'
  },
  {
    name: 'National Stadium, Jakarta',
    location: 'Kompleks Gelora, Jakarta',
    capacity: '55,000',
    acoustics: 'L-Acoustics K1/K2 · 360° delay clusters',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    currentHeadliner: 'Taylor Swift — Eras Tour Encore'
  },
  {
    name: 'Indonesia Arena',
    location: 'GBK Sports Complex, Jakarta',
    capacity: '16,500',
    acoustics: 'Indoor dispersion · JBL VTX A12',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    currentHeadliner: 'Billie Eilish — Hit Me Hard and Soft'
  }
];

export default function VenuesView({ onSelectVenueShow }) {
  const reduce = useReducedMotion();

  return (
    <div className="space-y-12 pb-8">
      <div className="space-y-3 border-b border-void-border pb-6">
        <span className="label-mono text-ash">Venue directory</span>
        <h2 className="display-lg text-bone">
          WORLD-CLASS
          <br />
          ARENAS
        </h2>
        <p className="text-sm font-light text-ash max-w-[46ch] leading-relaxed">
          Certified soundbooths, high-fidelity acoustics, and panoramic sightlines across
          Jakarta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12">
        {VENUES_DATA.map((venue, idx) => (
          <motion.article
            key={venue.name}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(idx, 3) * 0.06, ease: 'easeOut' }}
            className="group cursor-pointer"
            onClick={onSelectVenueShow}
          >
            <div className="relative overflow-hidden rounded-lg aspect-[16/10] bg-void-elevated">
              <img
                src={venue.image}
                alt={venue.name}
                loading="lazy"
                className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
              <span className="absolute top-3 left-3 label-mono text-bone bg-void/80 px-2 py-1 rounded flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                {venue.capacity}
              </span>
            </div>

            <div className="pt-4 space-y-2">
              <h3
                className="text-2xl text-bone"
                style={{ fontWeight: 500, letterSpacing: '-0.035em' }}
              >
                {venue.name}
              </h3>

              <p className="label-mono text-ash flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {venue.location}
              </p>

              <p className="label-mono text-ash flex items-center gap-1.5 truncate">
                <Radio className="w-3 h-3" />
                {venue.acoustics}
              </p>

              <div className="flex items-end justify-between gap-3 pt-3 border-t border-void-border">
                <span className="font-mono text-[11px] text-saffron truncate">
                  {venue.currentHeadliner}
                </span>
                <span className="label-mono text-ash group-hover:text-bone transition-colors flex items-center gap-1 shrink-0">
                  Shows
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
