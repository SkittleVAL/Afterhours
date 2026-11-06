'use client';

import React from 'react';
import { SavedItem } from '@/types';
import {
  Music2,
  Gamepad2,
  Film,
  MapPin,
  Heart,
  ExternalLink,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Radio,
  Check
} from 'lucide-react';
import { useAfterhours } from '@/context/AfterhoursContext';

interface ItemCardProps {
  item: SavedItem;
  layout?: 'grid' | 'list';
}

export function ItemCard({ item, layout = 'grid' }: ItemCardProps) {
  const {
    toggleFavorite,
    openItemDetail,
    activeAudioTrack,
    isPlayingAudio,
    toggleTrack,
    toggleGameInstalled,
    launchGame,
  } = useAfterhours();

  const isCurrentAudioPlaying = activeAudioTrack?.id === item.id && isPlayingAudio;
  const isGameInstalled = !!item.metadata?.isInstalled;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'music': return Music2;
      case 'game': return Gamepad2;
      case 'movie': return Film;
      case 'place': return MapPin;
      default: return Sparkles;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'music': return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50';
      case 'game': return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/50';
      case 'movie': return 'text-purple-400 bg-purple-950/60 border-purple-800/50';
      case 'place': return 'text-amber-400 bg-amber-950/60 border-amber-800/50';
      default: return 'text-violet-400 bg-violet-950/60 border-violet-800/50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'currently_experiencing':
        return { label: 'In Progress', icon: Clock, className: 'text-amber-300 bg-amber-950/60 border-amber-800/50' };
      case 'completed':
        return { label: 'Completed', icon: CheckCircle2, className: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50' };
      default:
        return { label: 'Want', icon: Sparkles, className: 'text-purple-300 bg-purple-950/60 border-purple-800/50' };
    }
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTrack(item);
  };

  const handleLaunchGame = (e: React.MouseEvent) => {
    e.stopPropagation();
    launchGame(item);
  };

  const handleToggleInstalled = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleGameInstalled(item.id);
  };

  const Icon = getCategoryIcon(item.category);
  const statusInfo = getStatusBadge(item.status);

  if (layout === 'list') {
    return (
      <div
        onClick={() => openItemDetail(item)}
        className="group flex items-center justify-between p-3.5 rounded-2xl bg-nocturne-850 hover:bg-nocturne-800/90 border border-nocturne-750/70 hover:border-purple-500/40 transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Thumbnail */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-nocturne-900 border border-nocturne-700/60 flex-shrink-0">
            {item.artworkUrl ? (
              <img
                src={item.artworkUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${item.fallbackGradient || 'from-purple-900 to-zinc-900'} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white/50" />
              </div>
            )}
            {item.category === 'music' && (
              <button
                onClick={handlePlayAudio}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isCurrentAudioPlaying ? (
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
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)} font-medium capitalize`}>
                {item.category}
              </span>

              {item.category === 'game' && (
                <button
                  onClick={handleToggleInstalled}
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-mono transition-colors ${
                    isGameInstalled
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-nocturne-800 text-nocturne-400 hover:text-white border-nocturne-700'
                  }`}
                  title="Klikni pro změnu stavu instalace"
                >
                  {isGameInstalled ? '✓ Nainstalováno' : '+ Ke stažení'}
                </button>
              )}
            </div>
            <p className="text-xs text-nocturne-400 truncate mt-0.5">
              {item.subtitle}
              {item.metadata?.year && ` · ${item.metadata.year}`}
              {item.metadata?.city && ` · ${item.metadata.city}`}
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {item.category === 'game' && (
            <button
              onClick={handleLaunchGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-500 hover:text-black text-cyan-300 text-xs font-semibold transition-all border border-cyan-500/30"
              title="Spustit hru přes Steam"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Spustit</span>
            </button>
          )}

          {item.category === 'music' && (
            <button
              onClick={handlePlayAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 hover:text-black text-emerald-300 text-xs font-semibold transition-all border border-emerald-500/30"
              title="Přehrát skladbu"
            >
              {isCurrentAudioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isCurrentAudioPlaying ? 'Hraje' : 'Přehrát'}</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            className="p-2 rounded-xl hover:bg-nocturne-750 text-nocturne-400 hover:text-rose-400 transition-colors"
            title="Oblíbené"
          >
            <Heart className={`w-4 h-4 ${item.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>

          {item.externalUrl && (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-xl hover:bg-nocturne-750 text-nocturne-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
              title={`Otevřít na ${item.metadata?.originalPlatformName || item.externalProvider}`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => openItemDetail(item)}
      className="group flex flex-col rounded-2xl bg-nocturne-850 hover:bg-nocturne-800/90 border border-nocturne-750/70 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-950/20 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Artwork Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-nocturne-900">
        {item.artworkUrl ? (
          <img
            src={item.artworkUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${item.fallbackGradient || 'from-purple-950 to-neutral-950'} flex items-center justify-center`}>
            <Icon className="w-8 h-8 text-white/40" />
          </div>
        )}

        {/* Ambient Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border backdrop-blur-md font-medium uppercase tracking-wider ${getCategoryColor(item.category)}`}>
            {item.category}
          </span>

          <span className={`text-[10px] px-2 py-0.5 rounded-full border backdrop-blur-md flex items-center gap-1 font-medium ${statusInfo.className}`}>
            <statusInfo.icon className="w-3 h-3" />
            {statusInfo.label}
          </span>
        </div>

        {/* Steam Installed badge indicator on Artwork */}
        {item.category === 'game' && (
          <div className="absolute bottom-2.5 left-2.5">
            <button
              onClick={handleToggleInstalled}
              className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono backdrop-blur-md transition-all ${
                isGameInstalled
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80 shadow-sm'
                  : 'bg-black/70 text-nocturne-300 border-white/10 hover:text-white'
              }`}
            >
              {isGameInstalled ? '✓ Nainstalováno' : '📦 Ke stažení'}
            </button>
          </div>
        )}

        {/* Floating audio trigger for music */}
        {item.category === 'music' && (
          <button
            onClick={handlePlayAudio}
            className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-black/70 hover:bg-emerald-500 backdrop-blur-md text-white hover:text-black flex items-center justify-center transition-all shadow-md group/audio"
            title={isCurrentAudioPlaying ? 'Pozastavit' : 'Přehrát ve vestavěném přehrávači'}
          >
            {isCurrentAudioPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        )}

        {/* Floating launch trigger for games */}
        {item.category === 'game' && (
          <button
            onClick={handleLaunchGame}
            className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-cyan-600/80 hover:bg-cyan-500 backdrop-blur-md text-white hover:text-black flex items-center justify-center transition-all shadow-md"
            title="Spustit hru přes Steam"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        )}
      </div>

      {/* Metadata content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-nocturne-400 mt-1 line-clamp-1">
            {item.subtitle}
          </p>

          {item.personalNotes && (
            <p className="text-[11px] text-nocturne-300 italic mt-2.5 line-clamp-2 border-l-2 border-purple-500/40 pl-2">
              "{item.personalNotes}"
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-3 border-t border-nocturne-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-nocturne-400">
            {item.metadata?.year && <span>{item.metadata.year}</span>}
            {item.metadata?.duration && <span>· {item.metadata.duration}</span>}
            {item.metadata?.genre && <span>· {item.metadata.genre}</span>}
            {item.metadata?.city && <span>{item.metadata.city}</span>}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
              className="p-1.5 rounded-lg hover:bg-nocturne-750 text-nocturne-400 hover:text-rose-400 transition-colors"
              title="Oblíbené"
            >
              <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
            </button>

            {item.externalUrl && (
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-nocturne-750 text-nocturne-400 hover:text-white transition-colors"
                title={`Otevřít na ${item.metadata?.originalPlatformName || item.externalProvider}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
