'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Library,
  Music2,
  Gamepad2,
  Film,
  MapPin,
  Users2,
  Settings,
  Search,
  Sparkles,
  Moon,
  Plus,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-react';
import { useAfterhours } from '@/context/AfterhoursContext';

export function Sidebar() {
  const pathname = usePathname();
  const {
    user,
    isAuthenticated,
    openAuthModal,
    logout,
    openSearch,
    openCreateCollectionModal
  } = useAfterhours();

  const navLinks = [
    { name: 'Home', href: '/', icon: Sparkles },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'My Collection', href: '/collection', icon: Library },
    { name: 'Music', href: '/music', icon: Music2, badge: 'Launcher' },
    { name: 'Games', href: '/games', icon: Gamepad2, badge: 'Steam' },
    { name: 'Movies & TV', href: '/movies', icon: Film },
    { name: 'Places', href: '/places', icon: MapPin },
    { name: 'Friends', href: '/friends', icon: Users2 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-nocturne-900 border-r border-nocturne-750/80 z-40 select-none">
      {/* Branding */}
      <div className="p-5 pb-4 flex items-center justify-between border-b border-nocturne-800/60">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-950/50 group-hover:scale-105 transition-transform duration-200">
            <Moon className="w-4 h-4 text-white fill-purple-200/30" />
          </div>
          <div>
            <span className="text-base font-bold tracking-wider text-white font-mono flex items-center gap-1.5">
              AFTERHOURS
            </span>
            <span className="text-[10px] tracking-widest uppercase text-nocturne-400 block -mt-0.5">
              Discovery Hub
            </span>
          </div>
        </Link>
      </div>

      {/* Global Quick Action & Search Button */}
      <div className="p-3 space-y-2">
        <button
          onClick={() => openSearch('all')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-nocturne-850 hover:bg-nocturne-800 border border-nocturne-750/70 text-nocturne-300 hover:text-white transition-all text-xs group"
          title="Hledat cokoliv (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-nocturne-400 group-hover:text-purple-400 transition-colors" />
            <span>Hledat cokoliv...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-nocturne-750 text-nocturne-400 border border-nocturne-700 font-mono">
            Ctrl+K
          </kbd>
        </button>

        <button
          onClick={openCreateCollectionModal}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-200 hover:text-white transition-all text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5 text-purple-400" />
          <span>Nová kolekce / Playlist</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-nocturne-500 px-3 py-1">
          Navigace
        </div>
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-nocturne-800 text-white font-semibold border border-purple-500/30 shadow-sm'
                  : 'text-nocturne-300 hover:text-white hover:bg-nocturne-850'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-purple-400' : 'text-nocturne-400 group-hover:text-purple-300'
                  }`}
                />
                <span>{link.name}</span>
              </div>
              {link.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-nocturne-750 text-nocturne-400 border border-nocturne-700/60 font-mono">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile & Auth Control */}
      <div className="p-3 border-t border-nocturne-800/80 bg-nocturne-900/80">
        {isAuthenticated ? (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-nocturne-850 border border-nocturne-800">
            <Link
              href="/settings"
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
            >
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-purple-500/50"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-nocturne-900" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {user.displayName}
                </div>
                <div className="text-[10px] text-purple-300/80 truncate font-mono">
                  @{user.username}
                </div>
              </div>
            </Link>

            <button
              onClick={() => logout()}
              className="p-1.5 rounded-xl hover:bg-rose-950/40 text-nocturne-400 hover:text-rose-400 transition-colors ml-1"
              title="Odhlásit se z účtu"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5 p-1">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-950/40"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Přihlásit se</span>
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="w-full py-1.5 px-3 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-300 hover:text-white border border-nocturne-700/70 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3 h-3 text-purple-400" />
              <span>Vytvořit účet</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
