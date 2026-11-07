import React from 'react';
import { Calendar, MapPin, Ticket, ChevronRight } from 'lucide-react';

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
    <div
      onClick={() => onSelect(concert)}
      className={`group relative rounded-3xl p-6 transition-all cursor-pointer border backdrop-blur-md flex flex-col justify-between ${
        isSelected
          ? 'bg-void-surface border-iris shadow-iris-glow'
          : 'bg-void-card/60 border-void-border hover:border-iris/40 hover:bg-void-surface/80'
      }`}
    >
      {/* Top Banner Tag & Availability Badge */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="text-xs font-semibold tracking-wide text-saffron uppercase px-2.5 py-1 rounded-full bg-saffron/10 border border-saffron/20">
          {concert.artist}
        </span>
        <div className="flex items-center space-x-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-void-surface border border-void-border">
          <span className="w-1.5 h-1.5 rounded-full bg-verdant" />
          <span className="text-silver">
            {concert.availableSeatsCount ?? '...'} Seats Left
          </span>
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xl font-medium tracking-tight text-bone group-hover:text-iris transition-colors">
          {concert.title}
        </h3>

        <div className="space-y-1.5 text-xs text-silver font-light">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-ash" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-ash" />
            <span className="truncate">{concert.venue}</span>
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-4 border-t border-void-border flex items-center justify-between">
        <div>
          <span className="block text-[10px] uppercase font-mono tracking-wider text-ash">
            Starting From
          </span>
          <span className="text-sm font-mono font-medium text-bone">
            {concert.priceRange?.min ? formatIDR(concert.priceRange.min) : 'IDR -'}
          </span>
        </div>

        <button
          type="button"
          className={`flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            isSelected
              ? 'bg-iris text-white shadow-iris-glow'
              : 'bg-void-surface text-silver group-hover:text-bone group-hover:bg-zinc-800 border border-void-border'
          }`}
        >
          <span>{isSelected ? 'Viewing Map' : 'Select'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
