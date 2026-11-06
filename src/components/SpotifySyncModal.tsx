'use client';

import React, { useState } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { Collection } from '@/types';
import {
  X,
  Music2,
  ExternalLink,
  CheckCircle2,
  ListPlus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Disc3
} from 'lucide-react';

interface SpotifySyncModalProps {
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
}

export function SpotifySyncModal({ collection, isOpen, onClose }: SpotifySyncModalProps) {
  const { items, showToast } = useAfterhours();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(2);
  const [playlistName, setPlaylistName] = useState(`AFTERHOURS: ${collection.title}`);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'unauthorized'>('idle');
  const [createdPlaylistUrl, setCreatedPlaylistUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const musicTracks = items.filter(
    (i) => i.category === 'music' && i.collectionIds.includes(collection.id)
  );

  const handleSyncToSpotify = async () => {
    setSyncStatus('syncing');

    try {
      const res = await fetch('/api/spotify/sync-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionTitle: collection.title,
          tracks: musicTracks,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSyncStatus('synced');
        setCreatedPlaylistUrl(data.playlistUrl);
        setCurrentStep(3);
        showToast('Playlist synced to Spotify!', 'success');
      } else {
        // If credentials are not configured or session expired, offer direct web fallback!
        setSyncStatus('unauthorized');
        showToast(data.message || 'Spotify account setup required', 'warning');
      }
    } catch (err: any) {
      setSyncStatus('unauthorized');
      showToast('Offline mode: Using direct Spotify Web Player links', 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-nocturne-900 border border-nocturne-750 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-nocturne-800 flex items-center justify-between bg-nocturne-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Music2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Spotify Integration Flow</h3>
              <p className="text-[11px] text-nocturne-400">Experience your collection directly in Spotify</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-nocturne-400 hover:text-white hover:bg-nocturne-750"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Step Visual Progress Stepper (As requested in User Concept) */}
        <div className="px-6 pt-5 pb-2">
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium">
            <div className={`p-2.5 rounded-xl border transition-all ${
              currentStep === 1
                ? 'bg-purple-950/40 border-purple-500/60 text-purple-200'
                : 'bg-nocturne-850 border-nocturne-750/70 text-nocturne-400'
            }`}>
              <span className="block text-nocturne-500 text-[9px] uppercase font-mono">Krok 1</span>
              <span>1. Objevíš song</span>
            </div>

            <div className={`p-2.5 rounded-xl border transition-all ${
              currentStep === 2
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                : 'bg-nocturne-850 border-nocturne-750/70 text-nocturne-400'
            }`}>
              <span className="block text-nocturne-500 text-[9px] uppercase font-mono">Krok 2</span>
              <span>2. Add to Playlist</span>
            </div>

            <div className={`p-2.5 rounded-xl border transition-all ${
              currentStep === 3
                ? 'bg-emerald-900/60 border-emerald-400 text-white font-semibold'
                : 'bg-nocturne-850 border-nocturne-750/70 text-nocturne-400'
            }`}>
              <span className="block text-nocturne-500 text-[9px] uppercase font-mono">Krok 3</span>
              <span>3. Open in Spotify</span>
            </div>
          </div>
        </div>

        {/* Body content based on step */}
        <div className="p-6 space-y-4">
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-nocturne-850 border border-nocturne-750 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Target Collection: {collection.title}</div>
                  <div className="text-[11px] text-nocturne-400 mt-0.5">
                    {musicTracks.length} tracks queued for synchronization
                  </div>
                </div>
                <Disc3 className="w-6 h-6 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
              </div>

              <div>
                <label className="text-xs font-semibold text-nocturne-300 block mb-1">
                  Spotify Playlist Name
                </label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {syncStatus === 'unauthorized' && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200/90 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Spotify API Setup Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-200/80">
                    To write playlists directly to your account, configure <code>SPOTIFY_CLIENT_ID</code> in <code>.env.local</code> or Settings. You can still open any saved song directly in Spotify right now!
                  </p>
                  <div className="pt-1 flex gap-2">
                    <a
                      href="/settings"
                      className="px-3 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-white text-[11px] font-medium"
                    >
                      Open Settings
                    </a>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-3 py-1.5 rounded-lg bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-200 text-[11px]"
                    >
                      Continue with Direct Links
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSyncToSpotify}
                  disabled={syncStatus === 'syncing'}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Syncing tracks with Spotify API...</span>
                    </>
                  ) : (
                    <>
                      <ListPlus className="w-4 h-4" />
                      <span>Create Playlist & Sync {musicTracks.length} Tracks</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Ready for Spotify!</h4>
                <p className="text-xs text-nocturne-300 mt-1 max-w-xs mx-auto">
                  {createdPlaylistUrl
                    ? 'Your playlist has been synchronized to your Spotify profile.'
                    : 'All tracks from this collection can now be opened directly in the Spotify app or web player.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {createdPlaylistUrl ? (
                  <a
                    href={createdPlaylistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Playlist in Spotify</span>
                  </a>
                ) : (
                  <a
                    href={`https://open.spotify.com/search/${encodeURIComponent(collection.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Spotify Web Player</span>
                  </a>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-300 text-xs font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
