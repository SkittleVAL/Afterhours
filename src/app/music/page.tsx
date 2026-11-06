'use client';

import React, { useState, useEffect } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { ItemCard } from '@/components/ItemCard';
import { SavedItem, Collection } from '@/types';
import {
  Music2,
  Play,
  Pause,
  Plus,
  Search,
  ListMusic,
  Disc3,
  Sparkles,
  ExternalLink,
  Check,
  FolderPlus,
  Radio,
  Clock,
  Trash2,
  Share2,
  Link as LinkIcon,
  Copy,
  CheckCheck,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';

export default function MusicPage() {
  const {
    items,
    collections,
    createCollection,
    deleteCollection,
    saveItem,
    playTrack,
    playCollection,
    activeAudioTrack,
    isPlayingAudio,
    toggleTrack,
    showToast,
  } = useAfterhours();

  // Live search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Playlist creation state
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Add to playlist modal/dropdown
  const [targetTrackForPlaylist, setTargetTrackForPlaylist] = useState<SavedItem | any | null>(null);

  // Spotify integration status
  const [spotifyStatus, setSpotifyStatus] = useState<{
    connected: boolean;
    isConfigured: boolean;
    redirectUri: string;
    userName?: string;
  } | null>(null);
  const [isSyncingSpotify, setIsSyncingSpotify] = useState<string | null>(null);
  const [copiedUri, setCopiedUri] = useState(false);
  const [showSpotifyHelp, setShowSpotifyHelp] = useState(false);

  const musicItems = items.filter((i) => i.category === 'music');
  const musicPlaylists = collections.filter(
    (c) => c.category === 'music' || c.title.toLowerCase().includes('song') || c.title.toLowerCase().includes('night') || c.title.toLowerCase().includes('playlist')
  );

  // Check Spotify status on load
  const checkSpotifyStatus = async () => {
    try {
      const res = await fetch('/api/spotify/status');
      if (res.ok) {
        const data = await res.json();
        setSpotifyStatus(data);
      }
    } catch (e) {
      console.warn('Could not check spotify status:', e);
    }
  };

  const handleDisconnectSpotify = async () => {
    try {
      await fetch('/api/spotify/connect-instant', { method: 'DELETE' });
      setSpotifyStatus(prev => prev ? { ...prev, connected: false } : null);
      showToast('Spotify odpojeno', 'info');
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    checkSpotifyStatus();
    if (typeof window !== 'undefined' && window.location.search.includes('spotify_connected=true')) {
      showToast('Spotify účet byl úspěšně propojen!', 'success');
      // Clean query string without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [showToast]);

  // Live Music Search via Multi-Provider API (Deezer + iTunes CZ + Global)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&category=music`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error('Music search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;

    createCollection({
      title: newPlaylistTitle.trim(),
      description: 'Osobní hudební playlist v AFTERHOURS Launcher.',
      category: 'music',
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      isFavorite: false,
      isPrivate: true,
    });

    setNewPlaylistTitle('');
    setIsCreatingPlaylist(false);
  };

  const handleAddTrackToPlaylist = (track: any, playlistId: string) => {
    const playlist = collections.find((c) => c.id === playlistId);
    
    saveItem({
      title: track.title,
      subtitle: track.subtitle || track.artist || 'Neznámý interpret',
      category: 'music',
      artworkUrl: track.artworkUrl,
      externalProvider: 'spotify',
      externalUrl: track.externalUrl,
      externalId: track.externalId || `track_${Date.now()}`,
      status: 'want',
      tags: ['music', 'launcher'],
      collectionIds: [playlistId],
      metadata: {
        previewAudioUrl: track.metadata?.previewAudioUrl || track.previewAudioUrl,
        year: track.metadata?.year || track.year,
        genre: track.metadata?.genre || track.genre,
        duration: track.metadata?.duration || track.duration,
      },
    });

    setTargetTrackForPlaylist(null);
    showToast(`Skladba přidána do playlistu "${playlist?.title}"`, 'success');
  };

  const handleSyncToSpotify = async (playlist: Collection) => {
    const playlistTracks = items.filter(
      (i) => i.collectionIds.includes(playlist.id) && i.category === 'music'
    );

    if (playlistTracks.length === 0) {
      showToast('Tento playlist nemá žádné skladby k synchronizaci', 'warning');
      return;
    }

    setIsSyncingSpotify(playlist.id);
    try {
      const res = await fetch('/api/spotify/sync-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionTitle: playlist.title,
          tracks: playlistTracks,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Playlist "${playlist.title}" byl synchronizován do tvého Spotify!`, 'success');
        if (data.playlistUrl) {
          window.open(data.playlistUrl, '_blank');
        }
      } else if (data.requiresAuth) {
        showToast('Pro synchronizaci nejprve propoj Spotify účet níže', 'warning');
      } else {
        showToast(data.message || 'Synchronizace do Spotify selhala', 'error');
      }
    } catch (err: any) {
      showToast('Chyba při komunikaci se serverem', 'error');
    } finally {
      setIsSyncingSpotify(null);
    }
  };

  const copyRedirectUri = () => {
    if (!spotifyStatus?.redirectUri) return;
    navigator.clipboard.writeText(spotifyStatus.redirectUri);
    setCopiedUri(true);
    showToast('Redirect URI zkopírováno!', 'success');
    setTimeout(() => setCopiedUri(false), 3000);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-9 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nocturne-850">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-purple-400 tracking-wider uppercase mb-1">
            <Music2 className="w-4 h-4" />
            <span>Music Launcher & Spotify Sync</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Noční Hudební Hub
          </h1>
          <p className="text-sm text-nocturne-400 mt-1 max-w-2xl">
            Vyhledávej jakoukoliv skladbu na světě (českou i zahraniční), vytvářej si vlastní playlisty v přehrávači a propoj svůj Spotify účet pro export na webu.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingPlaylist(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-lg shadow-purple-950/40"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Vytvořit Playlist</span>
        </button>
      </div>

      {/* Spotify Connection & Web Deployment Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/30 via-nocturne-900 to-nocturne-850 border border-emerald-900/40 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Disc3 className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white">Spotify Integrace na Webu</h3>
                {spotifyStatus?.connected ? (
                  <span className="flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                    <Check className="w-3 h-3" />
                    Propojeno ({spotifyStatus.userName})
                  </span>
                ) : (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-nocturne-800 text-nocturne-400 border border-nocturne-700 font-mono">
                    Připraveno pro propojení
                  </span>
                )}
              </div>
              <p className="text-xs text-nocturne-300 mt-0.5">
                {spotifyStatus?.connected
                  ? 'Tvůj Spotify účet je aktivní! Můžeš jedním kliknutím exportovat libovolný playlist z AFTERHOURS přímo do své Spotify knihovny.'
                  : 'Po nahrání na web stačí propojit účet a tvoje vytvořené playlisty se synchronizují do Spotify.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!spotifyStatus?.connected ? (
              <a
                href="/api/auth/spotify"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-all shadow-md"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Propojit Spotify účet</span>
              </a>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => checkSpotifyStatus()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-300 hover:text-white border border-nocturne-700 text-xs transition-colors"
                  title="Obnovit stav propojení"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Aktualizovat</span>
                </button>
                <button
                  onClick={handleDisconnectSpotify}
                  className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-medium transition-colors"
                  title="Odpojit účet"
                >
                  Odpojit
                </button>
              </div>
            )}

            <button
              onClick={() => setShowSpotifyHelp(!showSpotifyHelp)}
              className="p-2 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-400 hover:text-white border border-nocturne-700 transition-colors"
              title="Zobrazit instrukce pro webové nasazení"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Web Deployment & Redirect URI Helper */}
        {showSpotifyHelp && spotifyStatus && (
          <div className="pt-3 border-t border-nocturne-800/80 text-xs text-nocturne-300 space-y-2 animate-fade-in">
            <p className="font-semibold text-white">Jak propojit Spotify na webu (Vercel / Vlastní doména):</p>
            <ol className="list-decimal list-inside space-y-1 text-nocturne-400">
              <li>Jdi do svého <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">Spotify Developer Dashboardu</a> a otevři svoji aplikaci.</li>
              <li>V <strong>Settings</strong> přidej následující Redirect URI:</li>
            </ol>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-nocturne-950 border border-nocturne-800 font-mono text-[11px] text-emerald-300 break-all">
              <span className="flex-1">{spotifyStatus.redirectUri}</span>
              <button
                onClick={copyRedirectUri}
                className="p-1.5 rounded-lg bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-300 hover:text-white transition-colors flex items-center gap-1 flex-shrink-0"
              >
                {copiedUri ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{copiedUri ? 'Zkopírováno' : 'Kopírovat'}</span>
              </button>
            </div>
            <p className="text-[11px] text-nocturne-500">
              Na webovém hostingu (např. Vercel) nastav environment proměnné <code>SPOTIFY_CLIENT_ID</code> a <code>SPOTIFY_CLIENT_SECRET</code>.
            </p>
          </div>
        )}
      </div>

      {/* Live Search Engine in Launcher */}
      <div className="p-6 rounded-3xl bg-nocturne-900 border border-nocturne-750/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Search className="w-4 h-4 text-purple-400" />
            <span>Univerzální Vyhledávač Skladeb (CZ & Globální)</span>
          </div>
          <span className="text-[11px] text-nocturne-400 font-mono">
            {isSearching ? 'Hledám ve všech databázích...' : 'Deezer + Apple Music + Spotify'}
          </span>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-nocturne-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Napiš jakoukoliv písničku nebo interpreta (např. Calin, Viktor Sheen, The Weeknd, Hans Zimmer, Travis Scott)..."
            className="w-full bg-nocturne-950 border border-nocturne-750/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-nocturne-500 focus:outline-none focus:border-purple-500 shadow-inner"
          />
        </div>

        {/* Live Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 pt-2 animate-fade-in">
            <div className="text-[11px] font-semibold text-nocturne-400 uppercase tracking-wider font-mono">
              Nalezené skladby ({searchResults.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((result, idx) => {
                const isCurrentPlaying = activeAudioTrack?.title === result.title && isPlayingAudio;
                return (
                  <div
                    key={result.id || idx}
                    className="p-3 rounded-2xl bg-nocturne-850 hover:bg-nocturne-800 border border-nocturne-750 flex items-center justify-between gap-3 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-nocturne-950 flex-shrink-0 border border-nocturne-700/60">
                        <img
                          src={result.artworkUrl}
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => playTrack(result)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {isCurrentPlaying ? (
                            <Pause className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Play className="w-4 h-4 fill-white text-white" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                          {result.title}
                        </h4>
                        <p className="text-[11px] text-nocturne-400 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => playTrack(result)}
                        className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition-all text-xs"
                        title="Přehrát ukázku"
                      >
                        {isCurrentPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>

                      <button
                        onClick={() => setTargetTrackForPlaylist(result)}
                        className="p-2 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-300 hover:text-white border border-nocturne-700 transition-all text-xs"
                        title="Přidat do mého playlistu"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={result.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl hover:bg-nocturne-700 text-nocturne-500 hover:text-emerald-400 transition-colors"
                        title="Otevřít ve Spotify"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Inline Playlist Creator Form */}
      {isCreatingPlaylist && (
        <form
          onSubmit={handleCreatePlaylist}
          className="p-5 rounded-3xl bg-nocturne-900 border border-purple-500/40 shadow-xl space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-purple-400" />
              <span>Vytvořit nový hudební playlist</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingPlaylist(false)}
              className="text-xs text-nocturne-400 hover:text-white"
            >
              Zrušit
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              autoFocus
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              placeholder="Název nového playlistu (např. Noční jízda městem, Cyberpunk Beats, Lofi Study)..."
              className="flex-1 bg-nocturne-950 border border-nocturne-750 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md"
            >
              Uložit Playlist
            </button>
          </div>
        </form>
      )}

      {/* User Playlists Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-purple-400" />
            <span>Moje Playlisty</span>
            <span className="text-xs text-nocturne-400 font-normal">({musicPlaylists.length})</span>
          </h2>
        </div>

        {musicPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {musicPlaylists.map((playlist) => {
              const playlistTracks = items.filter(
                (i) => i.collectionIds.includes(playlist.id) && i.category === 'music'
              );
              const isSelected = selectedPlaylistId === playlist.id;
              const isSyncing = isSyncingSpotify === playlist.id;

              return (
                <div
                  key={playlist.id}
                  className={`p-4 rounded-3xl bg-nocturne-900 border transition-all ${
                    isSelected
                      ? 'border-purple-500 shadow-lg shadow-purple-950/30'
                      : 'border-nocturne-750/80 hover:border-nocturne-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 pb-3 border-b border-nocturne-800">
                    <img
                      src={playlist.coverImage}
                      alt={playlist.title}
                      className="w-14 h-14 rounded-2xl object-cover border border-nocturne-700 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white truncate">
                        {playlist.title}
                      </h3>
                      <p className="text-xs text-nocturne-400 truncate mt-0.5">
                        {playlistTracks.length} skladeb
                      </p>
                    </div>

                    <button
                      onClick={() => deleteCollection(playlist.id)}
                      className="p-1.5 rounded-lg text-nocturne-500 hover:text-rose-400 transition-colors"
                      title="Smazat playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => playCollection(playlist.id)}
                      disabled={playlistTracks.length === 0}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 disabled:opacity-40 text-purple-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-purple-500/30"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Přehrát</span>
                    </button>

                    <button
                      onClick={() => handleSyncToSpotify(playlist)}
                      disabled={isSyncing || playlistTracks.length === 0}
                      className="py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-600 hover:text-black text-emerald-300 border border-emerald-800/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                      title="Exportovat playlist do tvého Spotify účtu"
                    >
                      {isSyncing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Disc3 className="w-3.5 h-3.5" />
                      )}
                      <span>Spotify Sync</span>
                    </button>

                    <button
                      onClick={() => setSelectedPlaylistId(isSelected ? null : playlist.id)}
                      className="py-2 px-3 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-300 hover:text-white text-xs font-medium transition-colors border border-nocturne-700"
                    >
                      {isSelected ? 'Skrýt' : 'Skladby'}
                    </button>
                  </div>

                  {/* Playlist Expanded Tracks */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-nocturne-800 space-y-1.5 max-h-48 overflow-y-auto pr-1 animate-fade-in">
                      {playlistTracks.length > 0 ? (
                        playlistTracks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => playTrack(t, playlistTracks)}
                            className="p-2 rounded-xl bg-nocturne-850 hover:bg-nocturne-800 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={t.artworkUrl}
                                alt={t.title}
                                className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-white truncate">
                                  {t.title}
                                </div>
                                <div className="text-[10px] text-nocturne-400 truncate">
                                  {t.subtitle}
                                </div>
                              </div>
                            </div>
                            <Play className="w-3 h-3 text-purple-400 flex-shrink-0" />
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-nocturne-500 py-2 text-center">
                          V tomto playlistu zatím nejsou žádné skladby. Vyhledej je nahoře a přidej pomocí (+).
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-nocturne-900 border border-nocturne-750 text-center space-y-3">
            <Disc3 className="w-8 h-8 text-nocturne-500 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Zatím nemáš vytvořený žádný hudební playlist</h3>
            <p className="text-xs text-nocturne-400 max-w-md mx-auto">
              Klikni na "Vytvořit Playlist" nahoře a začni si skládat vlastní noční soundtracky.
            </p>
          </div>
        )}
      </div>

      {/* All Saved Music Tracks */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Disc3 className="w-4 h-4 text-purple-400" />
          <span>Všechny Uložené Skladby</span>
          <span className="text-xs text-nocturne-400 font-normal">({musicItems.length})</span>
        </h2>

        {musicItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {musicItems.map((track) => (
              <ItemCard key={track.id} item={track} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-nocturne-400 space-y-3">
            <Disc3 className="w-8 h-8 text-nocturne-500 mx-auto" />
            <p className="text-sm font-semibold text-white">Žádné uložené skladby v knihovně</p>
            <p className="text-xs text-nocturne-400">
              Použij vyhledávač výše nebo univerzální vyhledávání (Ctrl+K) pro nalezení skladeb.
            </p>
          </div>
        )}
      </div>

      {/* Add To Playlist Modal */}
      {targetTrackForPlaylist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setTargetTrackForPlaylist(null)}
        >
          <div
            className="w-full max-w-sm bg-nocturne-900 border border-nocturne-750 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-nocturne-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Přidat do playlistu</span>
              </h3>
              <button
                onClick={() => setTargetTrackForPlaylist(null)}
                className="text-xs text-nocturne-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-nocturne-950 border border-nocturne-800">
              <img
                src={targetTrackForPlaylist.artworkUrl}
                alt={targetTrackForPlaylist.title}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {targetTrackForPlaylist.title}
                </div>
                <div className="text-[11px] text-nocturne-400 truncate">
                  {targetTrackForPlaylist.subtitle}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-nocturne-300">
                Vyber playlist:
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {musicPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => handleAddTrackToPlaylist(targetTrackForPlaylist, pl.id)}
                    className="w-full p-2.5 rounded-xl bg-nocturne-850 hover:bg-purple-600 hover:text-white text-nocturne-200 text-xs font-medium text-left flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{pl.title}</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
