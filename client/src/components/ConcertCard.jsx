import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ChevronRight, Radio } from 'lucide-react';

export default function ConcertCard({ concert, isSelected, onSelect }) {
  const formattedDate = new Date(concert.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onClick={() => onSelect(concert)}
      className={`group relative rounded-3xl overflow-hidden transition-all cursor-pointer border flex flex-col justify-between backdrop-blur-xl ${
        isSelected
          ? 'bg-void-surface border-iris shadow-iris-glow'
          : 'bg-void-card/70 border-void-border hover:border-iris/50 hover:bg-void-surface/90 shadow-lg'
      }`}
    >
      {/* Concert Poster Banner with Gradient Overlay */}
      <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
        <img
          src={concert.bannerUrl}
          alt={concert.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-90"
          loading="lazy"
        />
        {/* Dark stage gradient feathering */}
        <div className="absolute inset-0 bg-gradient-to-t from-void-card via-void-card/40 to-transparent" />

        {/* Live Audio Wave Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-void/80 border border-white/10 backdrop-blur-md text-[10px] font-mono text-saffron">
          <div className="flex items-end space-x-0.5 h-3">
            <span className="w-0.5 bg-saffron rounded-full animate-eq-1" />
            <span className="w-0.5 bg-saffron rounded-full animate-eq-2" />
            <span className="w-0.5 bg-saffron rounded-full animate-eq-3" />
          </div>
          <span className="uppercase tracking-wider font-semibold">{concert.artist}</span>
        </div>

        {/* Remaining Seats Pill */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-void/80 border border-white/10 backdrop-blur-md text-bone">
          <span className="w-1.5 h-1.5 rounded-full bg-verdant animate-pulse" />
          <span>{concert.availableSeatsCount ?? '...'} Seats Left</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-medium tracking-tight text-bone group-hover:text-iris transition-colors line-clamp-1">
            {concert.title}
          </h3>

          <div className="space-y-1.5 text-xs text-silver font-light">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-ash shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-ash shrink-0" />
              <span className="truncate">{concert.venue}</span>
            </div>
          </div>
        </div>

        {/* Price & Action CTA */}
        <div className="pt-4 border-t border-void-border flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-mono tracking-wider text-ash">
              Starting From
            </span>
            <span className="text-sm font-mono font-medium text-bone">
              {concert.priceRange?.min ? formatIDR(concert.priceRange.min) : 'IDR -'}
            </span>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-iris text-white shadow-iris-glow'
                : 'bg-void-surface text-silver group-hover:text-bone group-hover:bg-zinc-800 border border-void-border'
            }`}
          >
            <span>{isSelected ? 'Viewing Map' : 'Select'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
