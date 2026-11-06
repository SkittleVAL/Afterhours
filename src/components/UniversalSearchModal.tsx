'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { ItemCategory, SavedItem } from '@/types';
import {
  Search,
  X,
  Music2,
  Gamepad2,
  Film,
  MapPin,
  Sparkles,
  ExternalLink,
  Plus,
  Check,
  Loader2,
  Play,
  Pause
} from 'lucide-react';

export function UniversalSearchModal() {
  const {
    isSearchOpen,
    closeSearch,
    searchCategory,
    saveItem,
    collections,
    openItemDetail,
    items: existingItems,
    toggleTrack,
    activeAudioTrack,
    isPlayingAudio,
  } = useAfterhours();

  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<ItemCategory | 'all'>('all');
  const [results, setResults] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setSelectedCat(searchCategory);
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchResults('', searchCategory);
    }
  }, [isSearchOpen, searchCategory]);

  const fetchResults = async (q: string, cat: ItemCategory | 'all') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&category=${cat}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (e) {
      console.error('Failed to search', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search on query or category change
  useEffect(() => {
    if (!isSearchOpen) return;
    const timer = setTimeout(() => {
      fetchResults(query, selectedCat);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, selectedCat, isSearchOpen]);

  if (!isSearchOpen) return null;

  const handleAudioPlay = (item: SavedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTrack(item);
  };

  const isSavedInCollection = (item: SavedItem) => {
    return existingItems.some(
      (i) =>
        (item.externalUrl && i.externalUrl === item.externalUrl) ||
        (item.externalId && i.externalId === item.externalId) ||
        (i.title.toLowerCase() === item.title.toLowerCase() && i.category === item.category)
    );
  };

  const handleQuickSave = (item: SavedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    saveItem({
      title: item.title,
      subtitle: item.subtitle,
      category: item.category,
      artworkUrl: item.artworkUrl,
      fallbackGradient: item.fallbackGradient,
      externalProvider: item.externalProvider,
      externalUrl: item.externalUrl,
      externalId: item.externalId,
      status: 'want',
      tags: item.tags,
      collectionIds: collections.length > 0 ? [collections[0].id] : [],
      metadata: item.metadata,
    });
  };

  const categories = [
    { key: 'all', label: 'Všechny kategorie', icon: Sparkles },
    { key: 'game', label: 'Hry (Steam Live)', icon: Gamepad2 },
    { key: 'music', label: 'Hudba (Spotify / iTunes)', icon: Music2 },
    { key: 'movie', label: 'Filmy & Seriály (TMDb)', icon: Film },
    { key: 'place', label: 'Místa & Zážitky', icon: MapPin },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={closeSearch}
    >
      <div
        className="relative w-full max-w-3xl max-h-[82vh] bg-nocturne-900 border border-nocturne-750 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-nocturne-800 flex items-center gap-3 bg-nocturne-850">
          <Search className="w-5 h-5 text-nocturne-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledej jakoukoliv hru na Steamu (např. Counter-Strike, Rust, Cyberpunk), track, film..."
            className="flex-1 bg-transparent text-sm text-white placeholder-nocturne-400 focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-nocturne-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeSearch}
            className="px-2.5 py-1 rounded-lg text-xs bg-nocturne-750 text-nocturne-300 hover:text-white border border-nocturne-700"
          >
            Esc
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2.5 border-b border-nocturne-800/70 bg-nocturne-900/90 flex items-center gap-1.5 overflow-x-auto">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelectedCat(c.key as ItemCategory | 'all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-nocturne-800 text-nocturne-300 hover:text-white hover:bg-nocturne-750'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {results.length > 0 ? (
            results.map((item) => {
              const saved = isSavedInCollection(item);
              const isPlaying = activeAudioTrack?.id === item.id && isPlayingAudio;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    closeSearch();
                    openItemDetail(item);
                  }}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-nocturne-850 hover:bg-nocturne-800 border border-nocturne-750/70 hover:border-purple-500/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Artwork */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-nocturne-900 border border-nocturne-700/60 flex-shrink-0">
                      {item.artworkUrl ? (
                        <img
                          src={item.artworkUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900 to-black" />
                      )}

                      {item.category === 'music' && (
                        <button
                          onClick={(e) => handleAudioPlay(item, e)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Přehrát skladbu"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Play className="w-4 h-4 text-white fill-white" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-nocturne-750 text-nocturne-300 font-mono capitalize">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-nocturne-400 truncate mt-0.5">
                        {item.subtitle}
                        {item.metadata?.genre && ` · ${item.metadata.genre}`}
                        {item.metadata?.city && ` · ${item.metadata.city}`}
                        {item.metadata?.year && ` · ${item.metadata.year}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {item.externalUrl && (
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl hover:bg-nocturne-700 text-nocturne-400 hover:text-white transition-colors"
                        title={`Otevřít na ${item.metadata?.originalPlatformName || item.externalProvider}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={(e) => handleQuickSave(item, e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        saved
                          ? 'bg-nocturne-750 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                      }`}
                    >
                      {saved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Uloženo</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Uložit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-nocturne-400 space-y-2">
              <Sparkles className="w-8 h-8 text-nocturne-500 mx-auto" />
              <p className="text-sm font-medium text-white">Žádné výsledky</p>
              <p className="text-xs text-nocturne-400 max-w-sm mx-auto">
                Zkus vyhledat jakoukoliv hru na Steamu (např. "Counter-Strike", "Cyberpunk", "Rust"), track ze Spotify jako "Nights", nebo film jako "Drive".
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-nocturne-950 border-t border-nocturne-800 text-[11px] text-nocturne-400 flex items-center justify-between">
          <span>Živé vyhledávání prohledává Steam Store API &amp; Spotify / iTunes databázi</span>
          <span className="font-mono">Stiskni Esc pro zavření</span>
        </div>
      </div>
    </div>
  );
}
