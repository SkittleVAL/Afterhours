'use client';

import React, { useState } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { ItemCard } from '@/components/ItemCard';
import { MapPin, Search, Compass, ExternalLink, Navigation } from 'lucide-react';

export default function PlacesPage() {
  const { items, openSearch } = useAfterhours();
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const places = items.filter((i) => i.category === 'place');

  const cities = ['all', 'Tokyo', 'Prague', 'Berlin', 'London'];

  const filtered = places.filter((p) => {
    if (selectedCity === 'all') return true;
    return p.metadata?.city?.toLowerCase().includes(selectedCity.toLowerCase());
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-nocturne-850">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-amber-400 tracking-wider uppercase mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Nocturne City Spots & Venues</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Places & Night Experiences
          </h1>
          <p className="text-sm text-nocturne-400 mt-1">
            Curate 2 AM ramen counters, vinyl audio lounges, jazz basements, and misty lookouts.
          </p>
        </div>

        <button
          onClick={() => openSearch('place')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-md shadow-purple-950/40"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Discover Places</span>
        </button>
      </div>

      {/* City Filters */}
      <div className="flex items-center gap-2 border-b border-nocturne-800 pb-3 overflow-x-auto">
        {cities.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCity(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap ${
              selectedCity === c
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-nocturne-850 text-nocturne-400 hover:text-white'
            }`}
          >
            {c === 'all' ? `All Cities (${places.length})` : c}
          </button>
        ))}
      </div>

      {/* Places Grid */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((place) => (
              <ItemCard key={place.id} item={place} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-nocturne-400 space-y-3">
            <MapPin className="w-8 h-8 text-nocturne-500 mx-auto" />
            <p className="text-sm font-semibold text-white">No places saved for this city</p>
            <button
              onClick={() => openSearch('place')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              Search more night spots
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
