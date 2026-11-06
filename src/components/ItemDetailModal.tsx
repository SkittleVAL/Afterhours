'use client';

import React, { useState, useEffect } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { ExperienceStatus } from '@/types';
import {
  X,
  ExternalLink,
  Heart,
  Star,
  Play,
  Pause,
  Trash2,
  Check,
  Folder,
  Music2,
  Gamepad2,
  Radio,
  Share2,
  Download,
  Laptop
} from 'lucide-react';

export function ItemDetailModal() {
  const {
    activeItemDetail,
    closeItemDetail,
    updateItem,
    deleteItem,
    toggleFavorite,
    collections,
    showToast,
    toggleTrack,
    activeAudioTrack,
    isPlayingAudio,
    launchGame,
    toggleGameInstalled
  } = useAfterhours();

  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ExperienceStatus>('want');
  const [rating, setRating] = useState<number>(5);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  useEffect(() => {
    if (activeItemDetail) {
      setNotes(activeItemDetail.personalNotes || '');
      setStatus(activeItemDetail.status || 'want');
      setRating(activeItemDetail.rating || 5);
      setSelectedCollections(activeItemDetail.collectionIds || []);
    }
  }, [activeItemDetail]);

  if (!activeItemDetail) return null;

  const isCurrentAudioPlaying = activeAudioTrack?.id === activeItemDetail.id && isPlayingAudio;
  const isGameInstalled = !!activeItemDetail.metadata?.isInstalled;

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    updateItem(activeItemDetail.id, { personalNotes: val });
  };

  const handleStatusChange = (newStatus: ExperienceStatus) => {
    setStatus(newStatus);
    updateItem(activeItemDetail.id, { status: newStatus });
  };

  const handleRatingChange = (stars: number) => {
    setRating(stars);
    updateItem(activeItemDetail.id, { rating: stars });
  };

  const toggleCollectionMembership = (colId: string) => {
    const updated = selectedCollections.includes(colId)
      ? selectedCollections.filter((id) => id !== colId)
      : [...selectedCollections, colId];
    setSelectedCollections(updated);
    updateItem(activeItemDetail.id, { collectionIds: updated });
  };

  const handleDelete = () => {
    if (confirm(`Opravdu chceš odebrat "${activeItemDetail.title}" ze svých položek?`)) {
      deleteItem(activeItemDetail.id);
      closeItemDetail();
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeItemDetail.externalUrl || window.location.href);
      showToast('Odkaz zkopírován do schránky', 'success');
    }
  };

  const spotifySearchUrl = activeItemDetail.externalUrl?.includes('spotify.com')
    ? activeItemDetail.externalUrl
    : `https://open.spotify.com/search/${encodeURIComponent(activeItemDetail.title + ' ' + activeItemDetail.subtitle)}`;

  const steamStoreUrl = activeItemDetail.metadata?.steamAppId
    ? `https://store.steampowered.com/app/${activeItemDetail.metadata.steamAppId}`
    : activeItemDetail.externalUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-nocturne-900 border border-nocturne-750 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Image */}
        <div className="relative h-60 w-full overflow-hidden bg-nocturne-950 flex-shrink-0">
          {activeItemDetail.artworkUrl ? (
            <img
              src={activeItemDetail.artworkUrl}
              alt={activeItemDetail.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${activeItemDetail.fallbackGradient || 'from-purple-950 to-black'}`} />
          )}

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-nocturne-900 via-nocturne-900/60 to-transparent" />

          {/* Top Floating Buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="text-xs px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 uppercase tracking-wider font-mono">
              {activeItemDetail.category}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-colors"
                title="Sdílet"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleFavorite(activeItemDetail.id)}
                className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-colors"
                title="Oblíbené"
              >
                <Heart className={`w-4 h-4 ${activeItemDetail.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={closeItemDetail}
                className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-colors"
                title="Zavřít"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Bottom Title Info */}
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {activeItemDetail.title}
            </h2>
            <p className="text-sm text-nocturne-300 font-medium mt-0.5">
              {activeItemDetail.subtitle}
            </p>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* 1. MUSIC & SPOTIFY SECTION */}
          {activeItemDetail.category === 'music' && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Spotify & Audio Přehrávač</span>
                </div>
                <span className="text-[11px] text-emerald-300 font-mono">
                  {activeItemDetail.metadata?.duration || '3:30'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => toggleTrack(activeItemDetail)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-md"
                >
                  {isCurrentAudioPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
                  <span>{isCurrentAudioPlaying ? 'Pozastavit náhled' : 'Přehrát v přehrávači'}</span>
                </button>

                <a
                  href={spotifySearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-white text-xs font-medium border border-nocturne-700 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Otevřít ve Spotify Web Playeru</span>
                </a>

                {activeItemDetail.metadata?.platformDeepLink && (
                  <a
                    href={activeItemDetail.metadata.platformDeepLink}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-nocturne-850 hover:bg-nocturne-800 text-nocturne-300 text-xs transition-all"
                  >
                    <span>Otevřít v aplikaci Spotify</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 2. STEAM & GAMING LAUNCHER SECTION */}
          {activeItemDetail.category === 'game' && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Steam Herní Launcher</span>
                </div>

                {/* Installed Status Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleGameInstalled(activeItemDetail.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                    isGameInstalled
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-nocturne-800 text-nocturne-400 border-nocturne-700 hover:text-white'
                  }`}
                  title="Klikni pro přepnutí, zda máš hru nainstalovanou na tomto PC"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>{isGameInstalled ? 'Nainstalováno na tomto PC' : 'Není staženo na tomto PC'}</span>
                </button>
              </div>

              {/* Launcher Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => launchGame(activeItemDetail)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-md shadow-cyan-950/40"
                  title="Spustí hru přes Steam klienta"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Spustit hru (Steam Launcher)</span>
                </button>

                {activeItemDetail.metadata?.steamAppId && (
                  <a
                    href={`steam://install/${activeItemDetail.metadata.steamAppId}`}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-200 hover:text-white text-xs font-medium border border-nocturne-700 transition-all"
                    title="Otevře instalátor ve Steam klientovi"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Instalovat přes Steam klienta</span>
                  </a>
                )}

                <a
                  href={steamStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-200 hover:text-white text-xs font-medium border border-nocturne-700 transition-all"
                  title="Vhodné pokud jsi na školním PC bez nainstalovaného Steamu"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Otevřít ve Steam Store (Web)</span>
                </a>
              </div>

              <p className="text-[11px] text-nocturne-400">
                💡 <em>Poznámka pro školní PC:</em> Pokud na tomto počítači nemáš nainstalovaný Steam klient, klikni na <strong>Otevřít ve Steam Store (Web)</strong>.
              </p>
            </div>
          )}

          {/* 3. MOVIES / TMDB SECTION */}
          {activeItemDetail.category === 'movie' && (
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2.5">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Filmová databáze TMDb (Styl ČSFD & IMDb)</span>
                {activeItemDetail.metadata?.ratingScore && (
                  <span className="text-[11px] text-purple-300 font-mono">
                    ★ {activeItemDetail.metadata.ratingScore}
                  </span>
                )}
              </div>
              <p className="text-xs text-nocturne-300">
                TMDb (The Movie Database) je otevřená mezinárodní filmová databáze podobná ČSFD či IMDb, která poskytuje plakáty, synopse, herce a streamovací dostupnost.
              </p>
              {activeItemDetail.externalUrl && (
                <div className="pt-1">
                  <a
                    href={activeItemDetail.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Zobrazit detail filmu / seriálu</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 4. PLACES / MAPS SECTION */}
          {activeItemDetail.category === 'place' && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-2.5">
              <div className="text-xs font-bold text-white">Google Maps & Navigace</div>
              <p className="text-xs text-nocturne-300">
                {activeItemDetail.metadata?.locationAddress || 'Adresa a trasa'}
              </p>
              {activeItemDetail.externalUrl && (
                <a
                  href={activeItemDetail.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Otevřít v Google Maps</span>
                </a>
              )}
            </div>
          )}

          {/* Experience Status & Rating Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Selector */}
            <div className="p-4 rounded-2xl bg-nocturne-850 border border-nocturne-750 space-y-2">
              <label className="text-xs font-semibold text-nocturne-400 uppercase tracking-wider block">
                Stav zážitku
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: 'want', label: 'Chci zažít' },
                  { key: 'currently_experiencing', label: 'Prožívám / Hraju' },
                  { key: 'completed', label: 'Dokončeno' },
                  { key: 'archived', label: 'Archivováno' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleStatusChange(s.key as ExperienceStatus)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      status === s.key
                        ? 'bg-purple-600 text-white'
                        : 'bg-nocturne-800 text-nocturne-300 hover:text-white hover:bg-nocturne-750'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Stars */}
            <div className="p-4 rounded-2xl bg-nocturne-850 border border-nocturne-750 space-y-2">
              <label className="text-xs font-semibold text-nocturne-400 uppercase tracking-wider block">
                Osobní hodnocení
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-nocturne-600 hover:text-nocturne-400'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-nocturne-400 ml-2 font-mono">
                  {rating}/5
                </span>
              </div>
            </div>
          </div>

          {/* Collections Selector */}
          <div className="p-4 rounded-2xl bg-nocturne-850 border border-nocturne-750 space-y-2.5">
            <label className="text-xs font-semibold text-nocturne-400 uppercase tracking-wider flex items-center justify-between">
              <span>Přiřazené kolekce</span>
              <span className="text-[11px] text-nocturne-400 font-normal">
                {selectedCollections.length} vybráno
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {collections.map((col) => {
                const isMember = selectedCollections.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleCollectionMembership(col.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isMember
                        ? 'bg-purple-600/25 border border-purple-500/60 text-purple-200'
                        : 'bg-nocturne-800 border border-nocturne-700/60 text-nocturne-400 hover:text-white'
                    }`}
                  >
                    <Folder className="w-3 h-3" />
                    <span>{col.title}</span>
                    {isMember && <Check className="w-3 h-3 text-purple-400 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personal Notes */}
          <div className="p-4 rounded-2xl bg-nocturne-850 border border-nocturne-750 space-y-2">
            <label className="text-xs font-semibold text-nocturne-400 uppercase tracking-wider block">
              Osobní poznámky a dojmy
            </label>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Napiš si soukromou poznámku (automaticky se ukládá)..."
              rows={3}
              className="w-full bg-nocturne-900 border border-nocturne-750 rounded-xl p-3 text-xs text-white placeholder-nocturne-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-nocturne-950 border-t border-nocturne-800 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Odebrat z AFTERHOURS</span>
          </button>

          <button
            onClick={closeItemDetail}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
          >
            Hotovo
          </button>
        </div>
      </div>
    </div>
  );
}
