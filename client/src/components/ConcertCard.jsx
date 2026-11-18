import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function ConcertCard({ concert, isSelected, onSelect, featured = false }) {
  const reduce = useReducedMotion();

  const formattedDate = new Date(concert.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const formatIDR = (num) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={() => onSelect(concert)}
      className={`group cursor-pointer ${featured ? 'md:col-span-2' : ''}`}
    >
      {/* Poster plate: edge-to-edge, no border, no fill */}
      <div
        className={`relative overflow-hidden rounded-lg bg-void-elevated ${
          featured ? 'aspect-[16/10]' : 'aspect-[3/4]'
        } ${isSelected ? 'ring-2 ring-iris' : ''}`}
      >
        <img
          src={concert.bannerUrl}
          alt={concert.title}
          loading="lazy"
          className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-iris/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        {concert.availableSeatsCount <= 40 && concert.availableSeatsCount > 0 && (
          <span className="absolute top-3 left-3 label-mono text-saffron bg-void/80 px-2 py-1 rounded">
            Selling fast
          </span>
        )}
      </div>

      {/* Under-image type block */}
      <div className="pt-4 space-y-2">
        <div className="relative inline-block">
          <h3
            className={`text-2xl tracking-tight text-bone ${
              featured ? 'sm:text-3xl' : ''
            }`}
            style={{ fontWeight: 500, letterSpacing: '-0.035em' }}
          >
            {concert.artist}
          </h3>
          <span className="block h-px w-0 bg-iris group-hover:w-full transition-[width] duration-300 ease-out" />
        </div>

        <p className="label-mono text-ash truncate">
          {formattedDate} · {concert.venue}
        </p>

        <div className="flex items-baseline justify-between pt-1">
          <span className="font-mono text-sm text-saffron">
            {concert.priceRange?.min ? formatIDR(concert.priceRange.min) : 'IDR —'}
          </span>
          <span className="label-mono text-ash group-hover:text-bone transition-colors">
            {isSelected ? 'On map' : 'Select'}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
