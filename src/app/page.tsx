'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAfterhours } from '@/context/AfterhoursContext';
import { ItemCard } from '@/components/ItemCard';
import {
  Moon,
  Sparkles,
  ArrowUpRight,
  Plus,
  Compass,
  Play,
  Music2,
  Gamepad2,
  Film,
  MapPin,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const {
    items,
    collections,
    user,
    openSearch,
    openCreateCollectionModal,
    playCollection,
  } = useAfterhours();

  const [currentTime, setCurrentTime] = useState<string>('MONDAY, 10:42 PM');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      setCurrentTime(`${day}, ${time}`);
    };
    updateDate();
    const interval = setInterval(updateDate, 30000);
    return () => clearInterval(interval);
  }, []);

  const recentlySaved = items.slice(0, 4);
  const featuredCollections = collections.slice(0, 4);

  // Pick up where you left off item or collection
  const pickUpCollection = collections.find((c) => c.title.toLowerCase().includes('late') || c.category === 'music') || collections[0];
  const pickUpTracksCount = items.filter((i) => i.collectionIds.includes(pickUpCollection?.id || '')).length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in">
      {/* Nocturnal Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-nocturne-850">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-purple-400 tracking-wider uppercase mb-1">
            <span>{currentTime}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Your after hours.
          </h1>
          <p className="text-sm text-nocturne-400 mt-1">
            A little inspiration for tonight.
          </p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openSearch('all')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-nocturne-850 hover:bg-nocturne-800 border border-nocturne-750 text-xs font-medium text-nocturne-200 hover:text-white transition-all shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Discover</span>
          </button>

          <button
            onClick={openCreateCollectionModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-md shadow-purple-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* "Pick up where you left off" - Featured Highlight (Matches User Mockup Image 2) */}
      {pickUpCollection && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-nocturne-300">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Pick up where you left off</span>
            </span>
            <Link
              href={`/collection/${pickUpCollection.id}`}
              className="text-nocturne-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <span>Open</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div
            onClick={() => playCollection(pickUpCollection.id)}
            className="group relative p-4 md:p-5 rounded-2xl bg-gradient-to-r from-nocturne-850 to-nocturne-900 border border-nocturne-750 hover:border-purple-500/50 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-nocturne-950 border border-nocturne-700/80 flex-shrink-0">
                <img
                  src={pickUpCollection.coverImage}
                  alt={pickUpCollection.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-base md:text-lg font-bold text-white group-hover:text-purple-200 transition-colors truncate">
                  {pickUpCollection.title}
                </div>
                <div className="text-xs text-nocturne-400 mt-0.5">
                  {pickUpTracksCount || pickUpCollection.itemCount || 12} skladeb · Přehrávač AFTERHOURS
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Přehrát playlist
                  </span>
                  <span className="text-nocturne-600">·</span>
                  <span className="text-xs text-nocturne-400">Klikni pro spuštění ve vestavěném přehrávači</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white transition-all">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Your collections" Grid (Matches User Mockup Image 2) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Your collections</span>
            <span className="text-xs font-mono font-normal text-nocturne-400 bg-nocturne-850 px-2 py-0.5 rounded-full border border-nocturne-750">
              {collections.length}
            </span>
          </h2>
          <Link
            href="/collection"
            className="text-xs text-nocturne-400 hover:text-purple-300 flex items-center gap-1 transition-colors font-medium"
          >
            <span>View all</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredCollections.map((col) => {
            const itemCount = items.filter((i) => i.collectionIds.includes(col.id)).length;
            const getCategoryTag = (c: string | undefined) => {
              if (c === 'music') return 'Music · Spotify';
              if (c === 'game') return 'Steam · PC';
              if (c === 'movie') return 'Movies & TV';
              if (c === 'place') return 'Places · Experiences';
              return 'Curated';
            };

            return (
              <Link
                key={col.id}
                href={`/collection/${col.id}`}
                className="group relative flex flex-col rounded-2xl bg-nocturne-850 hover:bg-nocturne-800 border border-nocturne-750 hover:border-purple-500/40 overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-purple-950/20"
              >
                {/* Artwork */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-nocturne-900">
                  <img
                    src={col.coverImage}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-nocturne-900/90 via-nocturne-900/20 to-transparent" />
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors">
                      {col.title}
                    </h3>
                    <p className="text-xs text-nocturne-400 mt-1">
                      {getCategoryTag(col.category)} · {itemCount} items
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Category Discovery Hub Banners (User Concept 3) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Explore by Medium
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/music"
            className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-nocturne-850 border border-emerald-900/30 hover:border-emerald-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Music2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Music → Spotify
            </h3>
            <p className="text-xs text-nocturne-400 mt-1">
              Save tracks, albums or artists. Sync directly into customized playlists like "Songs for 2 AM".
            </p>
          </Link>

          <Link
            href="/games"
            className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-nocturne-850 border border-cyan-900/30 hover:border-cyan-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              Gaming → Steam
            </h3>
            <p className="text-xs text-nocturne-400 mt-1">
              Curate your "To Play" backlog, launch in the Steam desktop client, and track store specials.
            </p>
          </Link>

          <Link
            href="/movies"
            className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-nocturne-850 border border-purple-900/30 hover:border-purple-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Movies & TV Watchlist
            </h3>
            <p className="text-xs text-nocturne-400 mt-1">
              Save films for later, find available streaming services (Netflix, Max, Apple TV+), and track watched cinema.
            </p>
          </Link>

          <Link
            href="/places"
            className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-nocturne-850 border border-amber-900/30 hover:border-amber-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Places & Nocturne Spots
            </h3>
            <p className="text-xs text-nocturne-400 mt-1">
              Hidden vinyl cafes, late-night ramen, rooftop lookouts, and jazz bars saved directly with Google Maps routing.
            </p>
          </Link>
        </div>
      </div>

      {/* Recently Saved Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Recently saved in AFTERHOURS
          </h2>
          <button
            onClick={() => openSearch('all')}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            + Add something new
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentlySaved.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
