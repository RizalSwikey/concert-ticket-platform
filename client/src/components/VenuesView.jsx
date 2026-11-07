import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Radio, ChevronRight, Music } from 'lucide-react';

const VENUES_DATA = [
  {
    name: 'Gelora Bung Karno Stadium (GBK)',
    location: 'Senayan, Central Jakarta',
    capacity: '78,000 Attendees',
    acoustics: 'Stadium Surround Array • Dual Delay Towers',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
    currentHeadliner: 'Coldplay — Music of the Spheres World Tour'
  },
  {
    name: 'Jakarta International Stadium (JIS)',
    location: 'Tanjung Priok, North Jakarta',
    capacity: '82,000 Attendees',
    acoustics: 'Retractable Roof Sound Isolation • Bose Professional Audio',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    currentHeadliner: 'Bruno Mars — Live on Stage: The 24K Tour'
  },
  {
    name: 'National Stadium, Jakarta Arena',
    location: 'Kompleks Gelora, Jakarta',
    capacity: '55,000 Attendees',
    acoustics: 'L-Acoustics K1/K2 Line Source • 360° Delay Clusters',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    currentHeadliner: 'Taylor Swift — The Eras Tour Special Encore'
  },
  {
    name: 'Indonesia Arena',
    location: 'GBK Sports Complex, Jakarta',
    capacity: '16,500 Attendees',
    acoustics: 'Indoor Acoustic Dispersion • JBL VTX A12 Arena Sound',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    currentHeadliner: 'Billie Eilish — Hit Me Hard and Soft Tour'
  }
];

export default function VenuesView({ onSelectVenueShow }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pb-6 border-b border-void-border">
        <span className="text-xs font-mono uppercase tracking-widest text-verdant font-semibold">
          STADIUM & ARENA DIRECTORY
        </span>
        <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-bone mt-1">
          World-Class Entertainment Venues
        </h2>
        <p className="text-xs text-silver font-light mt-1 max-w-xl">
          Discover certified soundbooths, high-fidelity acoustic arenas, and panoramic stadium sightlines across Jakarta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VENUES_DATA.map((venue, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-void-surface border border-void-border hover:border-iris/40 shadow-xl overflow-hidden flex flex-col justify-between transition-all group backdrop-blur-xl"
          >
            {/* Image Banner */}
            <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void-surface via-void-surface/30 to-transparent" />

              <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-void/80 border border-white/10 text-[10px] font-mono text-bone backdrop-blur-md">
                <Users className="w-3 h-3 text-iris" />
                <span>{venue.capacity}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-normal tracking-tight text-bone group-hover:text-iris transition-colors">
                  {venue.name}
                </h3>

                <div className="flex items-center space-x-2 text-xs text-silver">
                  <MapPin className="w-3.5 h-3.5 text-ash shrink-0" />
                  <span>{venue.location}</span>
                </div>

                <div className="flex items-center space-x-2 text-[11px] font-mono text-ash pt-1">
                  <Radio className="w-3.5 h-3.5 text-verdant shrink-0" />
                  <span className="truncate">{venue.acoustics}</span>
                </div>
              </div>

              {/* Headliner Badge & CTA */}
              <div className="pt-4 border-t border-void-border flex items-center justify-between gap-3">
                <div className="space-y-0.5 max-w-[220px]">
                  <span className="text-[9px] font-mono uppercase text-ash tracking-wider">
                    Featured Headliner
                  </span>
                  <p className="text-xs font-mono text-saffron truncate">
                    {venue.currentHeadliner}
                  </p>
                </div>

                <button
                  onClick={onSelectVenueShow}
                  className="flex items-center space-x-1 px-4 py-2 rounded-full bg-void-card hover:bg-iris text-silver hover:text-white border border-void-border hover:border-iris transition-all text-xs font-mono cursor-pointer shrink-0"
                >
                  <span>View Shows</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
