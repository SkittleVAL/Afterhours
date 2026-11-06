'use client';

import React, { useState } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { ItemCard } from '@/components/ItemCard';
import {
  Gamepad2,
  ExternalLink,
  Search,
  Laptop,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
  Download,
  Info
} from 'lucide-react';

export default function GamesPage() {
  const { items, openSearch, providers } = useAfterhours();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const games = items.filter((i) => i.category === 'game');
  const steamProvider = providers.find((p) => p.provider === 'steam');

  const installedGames = games.filter((g) => !!g.metadata?.isInstalled);

  const filteredGames = games.filter((g) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'installed') return !!g.metadata?.isInstalled;
    if (filterStatus === 'not_installed') return !g.metadata?.isInstalled;
    return g.status === filterStatus;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-nocturne-850">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-cyan-400 tracking-wider uppercase mb-1">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Steam & PC Herní Launcher</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Herní Knihovna & Backlog
          </h1>
          <p className="text-sm text-nocturne-400 mt-1">
            Spouštěj nainstalované hry, organizuj svůj backlog na Steamu a vyhledávej jakoukoliv hru v živém Steam katalogu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openSearch('game')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-md shadow-purple-950/40"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Vyhledat hry na Steamu (Živý katalog)</span>
          </button>
        </div>
      </div>

      {/* Steam Launcher Status Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-nocturne-850 to-nocturne-900 border border-cyan-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Steam Client & Web Launcher</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                {installedGames.length} her nainstalováno na tomto PC
              </span>
            </div>
            <p className="text-xs text-nocturne-300 max-w-xl leading-relaxed">
              Tlačítko <strong>Spustit</strong> volá <code>steam://run/{'{appid}'}</code>. Pokud jsi na školním PC bez nainstalovaného Steamu, stačí kliknout na <strong>Steam Store (Web)</strong> pro zobrazení hry v prohlížeči.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://store.steampowered.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Steam Web Store</span>
          </a>
        </div>
      </div>

      {/* Backlog & Installed Filters */}
      <div className="flex items-center gap-2 border-b border-nocturne-800 pb-3 overflow-x-auto">
        {[
          { key: 'all', label: `Všechny hry (${games.length})` },
          { key: 'installed', label: `Nainstalováno na PC (${installedGames.length})` },
          { key: 'not_installed', label: `Ke stažení (${games.length - installedGames.length})` },
          { key: 'currently_experiencing', label: 'Právě hraju' },
          { key: 'completed', label: 'Dohráno' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilterStatus(s.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              filterStatus === s.key
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-nocturne-850 text-nocturne-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="space-y-4">
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGames.map((game) => (
              <ItemCard key={game.id} item={game} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-nocturne-400 space-y-3">
            <Gamepad2 className="w-8 h-8 text-nocturne-500 mx-auto" />
            <p className="text-sm font-semibold text-white">Žádné hry neodpovídají vybranému filtru</p>
            <button
              onClick={() => openSearch('game')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              Vyhledat hry v živém Steam katalogu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
