'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Compass,
  Library,
  Music2,
  Gamepad2,
  Film,
  MapPin,
  Settings,
  Search,
  Plus,
  Moon
} from 'lucide-react';
import { useAfterhours } from '@/context/AfterhoursContext';

export function MobileNav() {
  const pathname = usePathname();
  const { openSearch, openCreateCollectionModal } = useAfterhours();

  const mobileTabs = [
    { name: 'Home', href: '/', icon: Sparkles },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'Collections', href: '/collection', icon: Library },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-nocturne-900/95 backdrop-blur-md border-b border-nocturne-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <Moon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-wider text-white font-mono">
            AFTERHOURS
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openSearch('all')}
            className="p-2 rounded-xl bg-nocturne-800 text-nocturne-300 hover:text-white border border-nocturne-750"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateCollectionModal}
            className="p-2 rounded-xl bg-purple-600 text-white"
            title="Create Collection"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-nocturne-950/95 backdrop-blur-lg border-t border-nocturne-800 px-3 py-1 flex items-center justify-around">
        {mobileTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center py-2 px-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-purple-400' : 'text-nocturne-400 hover:text-nocturne-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
