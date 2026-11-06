'use client';

import React, { useState, useEffect } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { ItemCard } from '@/components/ItemCard';
import { ItemCategory, SavedItem } from '@/types';
import {
  Compass,
  Search,
  Music2,
  Gamepad2,
  Film,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Loader2,
  Radio,
  Flame,
  Check
} from 'lucide-react';

export default function DiscoverPage() {
  const { openItemDetail } = useAfterhours();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [results, setResults] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&category=${category}`);
        if (res.ok && isCurrent) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchCatalog, 200);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query, category]);

  const categories = [
    { key: 'all', label: 'Všechny objevy', icon: Sparkles },
    { key: 'game', label: 'Steam Hry (Živý katalog)', icon: Gamepad2, info: 'Steam Store & AppIDs' },
    { key: 'music', label: 'Hudba (Spotify / iTunes)', icon: Music2, info: 'iTunes Live + Spotify' },
    { key: 'movie', label: 'Filmy & Seriály (TMDb)', icon: Film, info: 'TMDb & Streaming' },
    { key: 'place', label: 'Místa & Noční zážitky', icon: MapPin, info: 'Maps & Nocturne' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-nocturne-850">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-purple-400 tracking-wider uppercase mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Univerzální katalog objevů</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Discover
          </h1>
          <p className="text-sm text-nocturne-400 mt-1">
            Vyhledávej jakoukoliv hru na Steamu, hudební tracky se Spotify přehrávačem, filmy a noční podniky.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-nocturne-850 border border-nocturne-750 flex items-center gap-1">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                layout === 'grid' ? 'bg-purple-600 text-white' : 'text-nocturne-400 hover:text-white'
              }`}
              title="Mřížka"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                layout === 'list' ? 'bg-purple-600 text-white' : 'text-nocturne-400 hover:text-white'
              }`}
              title="Seznam"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Input & Category Filter Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nocturne-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Napiš jakoukoliv hru na Steamu (např. Counter-Strike, Rust, Hades, Cyberpunk), track, film nebo město..."
            className="w-full bg-nocturne-900 border border-nocturne-750 focus:border-purple-500 rounded-2xl pl-11 pr-12 py-3.5 text-sm text-white placeholder-nocturne-400 focus:outline-none transition-all shadow-inner"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                    : 'bg-nocturne-850 text-nocturne-300 hover:text-white hover:bg-nocturne-800 border border-nocturne-750/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discovery Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-nocturne-400">
          <span>Found {results.length} items</span>
          <span className="font-mono">Live queries connected</span>
        </div>

        {results.length > 0 ? (
          <div
            className={
              layout === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-2.5'
            }
          >
            {results.map((item) => (
              <ItemCard key={item.id} item={item} layout={layout} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-nocturne-400 space-y-3">
            <Compass className="w-10 h-10 text-nocturne-500 mx-auto animate-pulse" />
            <h3 className="text-base font-semibold text-white">No items found</h3>
            <p className="text-xs text-nocturne-400 max-w-sm mx-auto">
              Try adjusting your query or category filter. We search across iTunes live music metadata and curated gaming, cinema, and nocturnal venues.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
