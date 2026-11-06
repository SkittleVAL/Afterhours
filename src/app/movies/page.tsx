'use client';

import React, { useState } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { ItemCard } from '@/components/ItemCard';
import { Film, Search, Sparkles, Tv, Clapperboard, CheckCircle2 } from 'lucide-react';

export default function MoviesPage() {
  const { items, openSearch } = useAfterhours();
  const [statusFilter, setStatusFilter] = useState('all');

  const movies = items.filter((i) => i.category === 'movie');
  const filtered = movies.filter((m) => statusFilter === 'all' || m.status === statusFilter);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-nocturne-850">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-purple-400 tracking-wider uppercase mb-1">
            <Film className="w-3.5 h-3.5" />
            <span>Cinema & Streaming Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Movies & TV Watchlist
          </h1>
          <p className="text-sm text-nocturne-400 mt-1">
            Curate neo-noir cinema, slow-burn sci-fi, and TV seasons for projector screen nights.
          </p>
        </div>

        <button
          onClick={() => openSearch('movie')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-md shadow-purple-950/40"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Discover Cinema & Shows</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-nocturne-800 pb-3">
        {[
          { key: 'all', label: `All Cinema (${movies.length})` },
          { key: 'want', label: 'Watchlist' },
          { key: 'currently_experiencing', label: 'Bingeing' },
          { key: 'completed', label: 'Watched' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              statusFilter === s.key
                ? 'bg-purple-600 text-white'
                : 'bg-nocturne-850 text-nocturne-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Movies Grid */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((movie) => (
              <ItemCard key={movie.id} item={movie} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-nocturne-400 space-y-3">
            <Film className="w-8 h-8 text-nocturne-500 mx-auto" />
            <p className="text-sm font-semibold text-white">No films saved in this view</p>
            <button
              onClick={() => openSearch('movie')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              Search movies & TV series
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
