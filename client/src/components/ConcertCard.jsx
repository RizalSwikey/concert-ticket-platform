import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ChevronRight, Radio } from 'lucide-react';

export default function ConcertCard({ concert, isSelected, onSelect }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });
  const cardRef = useRef(null);

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

  // ponytail: subtle 8deg tilt with 20px-35px parallax Z depth; 60fps on desktop and mobile
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: Math.max(-8, Math.min(8, (px - 0.5) * 16)),
      y: Math.max(-8, Math.min(8, -(py - 0.5) * 16)),
      active: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, active: false });
  };
  return (
    <div className="perspective-1000 w-full touch-pan-y py-1">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onSelect(concert)}
        style={{
          transform: tilt.active
            ? `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(0px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transition: tilt.active ? 'transform 0.12s ease-out' : 'transform 0.35s ease-out'
        }}
        className={`group relative rounded-3xl overflow-hidden cursor-pointer border flex flex-col justify-between backdrop-blur-xl preserve-3d transition-colors duration-200 ${
          isSelected
            ? 'bg-void-surface border-iris shadow-iris-glow'
            : 'bg-void-card/70 border-void-border hover:border-iris/50 hover:bg-void-surface/90 shadow-lg'
        }`}
      >
        {/* Subtle Interactive Light Glare Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-iris/10 via-transparent to-verdant/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl z-30" />

        {/* Concert Poster Banner with 3D Parallax Image */}
        <div
          style={{ transform: 'translateZ(20px)' }}
          className="relative h-44 w-full overflow-hidden bg-zinc-950 preserve-3d"
        >
          <img
            src={concert.bannerUrl}
            alt={concert.title}
            style={{
              transform: tilt.active ? 'scale(1.08) translateZ(5px)' : 'scale(1)',
              transition: tilt.active ? 'transform 0.15s ease-out' : 'transform 0.6s ease-out'
            }}
            className="w-full h-full object-cover object-center opacity-75 group-hover:opacity-95"
            loading="lazy"
          />
          {/* Dark stage gradient feathering */}
          <div className="absolute inset-0 bg-gradient-to-t from-void-card via-void-card/40 to-transparent" />

          {/* Live Audio Wave Badge (translateZ: 35px) */}
          <div
            style={{ transform: 'translateZ(35px)' }}
            className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-void/85 border border-white/10 backdrop-blur-md text-[10px] font-mono text-saffron shadow-lg preserve-3d"
          >
            <div className="flex items-end space-x-0.5 h-3">
              <span className="w-0.5 bg-saffron rounded-full animate-eq-1" />
              <span className="w-0.5 bg-saffron rounded-full animate-eq-2" />
              <span className="w-0.5 bg-saffron rounded-full animate-eq-3" />
            </div>
            <span className="uppercase tracking-wider font-semibold">{concert.artist}</span>
          </div>

          {/* Remaining Seats Pill (translateZ: 35px) */}
          <div
            style={{ transform: 'translateZ(35px)' }}
            className="absolute top-3 right-3 flex items-center space-x-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-void/85 border border-white/10 backdrop-blur-md text-bone shadow-lg preserve-3d"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-verdant animate-pulse" />
            <span>{concert.availableSeatsCount ?? '...'} Seats Left</span>
          </div>
        </div>

        {/* Content Body with 3D Parallax Depth */}
        <div
          style={{ transform: 'translateZ(18px)' }}
          className="p-6 space-y-4 flex-1 flex flex-col justify-between preserve-3d"
        >
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

          {/* Price & Action CTA (translateZ: 30px) */}
          <div
            style={{ transform: 'translateZ(30px)' }}
            className="pt-4 border-t border-void-border flex items-center justify-between preserve-3d"
          >
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
              className={`flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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
      </div>
    </div>
  );
}
