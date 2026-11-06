'use client';

import React, { useState } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ExternalLink,
  Volume2,
  VolumeX,
  X,
  Music2,
  Radio,
  Share2,
  ListMusic,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export function AudioPlayerBar() {
  const {
    activeAudioTrack,
    isPlayingAudio,
    toggleTrack,
    pauseTrack,
    playlistQueue,
    currentTrackIndex,
    playNextTrack,
    playPrevTrack,
    currentTime,
    duration,
    seekAudio,
    volume,
    setAudioVolume,
    isQueueOpen,
    toggleQueue,
    playTrack,
    showToast,
  } = useAfterhours();

  const [prevVolume, setPrevVolume] = useState(0.85);

  if (!activeAudioTrack) return null;

  // Format time mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const handleToggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setAudioVolume(0);
    } else {
      setAudioVolume(prevVolume || 0.85);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeAudioTrack.externalUrl || window.location.href);
      showToast('Odkaz na skladbu zkopírován!', 'success');
    }
  };

  const externalSearchUrl = activeAudioTrack.externalUrl || `https://open.spotify.com/search/${encodeURIComponent(activeAudioTrack.title + ' ' + activeAudioTrack.subtitle)}`;

  return (
    <div className="fixed bottom-0 md:bottom-0 left-0 right-0 z-50 animate-slide-up">
      {/* Playlist Queue Drawer */}
      {isQueueOpen && (
        <div className="bg-nocturne-900/98 backdrop-blur-2xl border-t border-nocturne-750 p-4 max-w-2xl mx-auto rounded-t-3xl shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-nocturne-800">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Fronta skladeb ({playlistQueue.length})
              </span>
            </div>
            <button
              onClick={toggleQueue}
              className="p-1 rounded-lg text-nocturne-400 hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {playlistQueue.map((track, idx) => {
              const isCurrent = idx === currentTrackIndex && track.id === activeAudioTrack.id;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track, playlistQueue)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-purple-950/70 border border-purple-500/40 text-white'
                      : 'hover:bg-nocturne-800/80 text-nocturne-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-nocturne-950 flex-shrink-0">
                      <img
                        src={track.artworkUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      {isCurrent && isPlayingAudio && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                        <span>{track.title}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-900 text-purple-300 font-mono">
                            Hraje
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-nocturne-400 truncate">
                        {track.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-nocturne-500 font-mono flex items-center gap-2">
                    <span>{track.metadata?.duration || '0:30'}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track, playlistQueue);
                      }}
                      className="p-1 rounded-lg hover:bg-nocturne-700 text-nocturne-300 hover:text-white"
                    >
                      {isCurrent && isPlayingAudio ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3 fill-current" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Persistent Bottom Player Bar */}
      <div className="bg-nocturne-900/95 backdrop-blur-xl border-t border-nocturne-750 px-4 md:px-8 py-3 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        {/* Left: Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-nocturne-950 border border-nocturne-700/80 flex-shrink-0">
            <img
              src={activeAudioTrack.artworkUrl}
              alt={activeAudioTrack.title}
              className="w-full h-full object-cover"
            />
            {isPlayingAudio && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
            )}
          </div>
          <div className="min-w-0 max-w-[180px] sm:max-w-xs">
            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>{activeAudioTrack.title}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                Audio
              </span>
            </div>
            <p className="text-[11px] text-nocturne-400 truncate">
              {activeAudioTrack.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Controls & Audio Scrubber */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5 mx-auto w-full">
          {/* Controls Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={playPrevTrack}
              className="p-1.5 rounded-full text-nocturne-400 hover:text-white transition-colors"
              title="Předchozí skladba"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleTrack(activeAudioTrack)}
              className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all shadow-md shadow-purple-950/50"
              title={isPlayingAudio ? 'Pozastavit' : 'Přehrát'}
            >
              {isPlayingAudio ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={playNextTrack}
              className="p-1.5 rounded-full text-nocturne-400 hover:text-white transition-colors"
              title="Další skladba"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time & Progress Scrubber */}
          <div className="w-full flex items-center gap-2.5">
            <span className="text-[10px] text-nocturne-400 font-mono w-8 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 30}
                step={0.1}
                value={currentTime}
                onChange={(e) => seekAudio(parseFloat(e.target.value))}
                className="w-full h-1 bg-nocturne-750 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <span className="text-[10px] text-nocturne-500 font-mono w-8">
              {formatTime(duration || 30)}
            </span>
          </div>
        </div>

        {/* Right: Volume, Queue & External Link */}
        <div className="flex items-center justify-end gap-2 flex-shrink-0">
          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-nocturne-800">
            <button
              onClick={handleToggleMute}
              className="p-1 rounded-lg text-nocturne-400 hover:text-white"
              title={volume === 0 ? 'Zapnout zvuk' : 'Ztlumit'}
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-nocturne-750 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Queue toggle */}
          <button
            onClick={toggleQueue}
            className={`p-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
              isQueueOpen
                ? 'bg-purple-950 text-purple-300 border-purple-700'
                : 'bg-nocturne-850 hover:bg-nocturne-800 text-nocturne-300 hover:text-white border-nocturne-750'
            }`}
            title="Zobrazit frontu skladeb"
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono">{playlistQueue.length}</span>
          </button>

          {/* Direct external platform link */}
          <a
            href={externalSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl bg-nocturne-850 hover:bg-nocturne-800 text-nocturne-300 hover:text-white border border-nocturne-750 transition-colors"
            title="Otevřít celou skladbu na Spotify / Apple Music"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl hover:bg-nocturne-800 text-nocturne-400 hover:text-white transition-colors"
            title="Kopírovat odkaz"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={pauseTrack}
            className="p-1.5 rounded-xl text-nocturne-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors ml-1"
            title="Zavřít přehrávač"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
