'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAfterhours } from '@/context/AfterhoursContext';
import { ItemCard } from '@/components/ItemCard';
import { ItemCategory, ExperienceStatus } from '@/types';
import {
  Library,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Folder,
  Lock,
  Globe,
  Heart,
  Sparkles,
  Music2,
  Gamepad2,
  Film,
  MapPin,
  Trash2,
  Edit2
} from 'lucide-react';

export default function CollectionsPage() {
  const {
    collections,
    items,
    openCreateCollectionModal,
    deleteCollection,
    openSearch
  } = useAfterhours();

  const [activeTab, setActiveTab] = useState<'collections' | 'all_items'>('collections');
  const [filterCategory, setFilterCategory] = useState<ItemCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ExperienceStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dateAdded' | 'title' | 'rating'>('dateAdded');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  // Filter items
  const filteredItems = items
    .filter((item) => {
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-nocturne-850">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-purple-400 tracking-wider uppercase mb-1">
            <Library className="w-3.5 h-3.5" />
            <span>Personal Archive & Vault</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Collection
          </h1>
          <p className="text-sm text-nocturne-400 mt-1">
            Manage your curated collections, backlog, and saved discoveries.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openSearch('all')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-nocturne-850 hover:bg-nocturne-800 border border-nocturne-750 text-xs font-medium text-nocturne-300 hover:text-white transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Catalog</span>
          </button>

          <button
            onClick={openCreateCollectionModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-md shadow-purple-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Switcher: Curated Collections vs All Saved Items */}
      <div className="flex items-center justify-between border-b border-nocturne-800">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('collections')}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === 'collections'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-nocturne-400 hover:text-nocturne-200'
            }`}
          >
            <span>Collections ({collections.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('all_items')}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === 'all_items'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-nocturne-400 hover:text-nocturne-200'
            }`}
          >
            <span>All Saved Items ({items.length})</span>
          </button>
        </div>

        {activeTab === 'all_items' && (
          <div className="flex items-center gap-1 pb-2">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-lg ${layout === 'grid' ? 'bg-purple-600 text-white' : 'text-nocturne-400'}`}
              title="Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded-lg ${layout === 'list' ? 'bg-purple-600 text-white' : 'text-nocturne-400'}`}
              title="List"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* COLLECTIONS VIEW */}
      {activeTab === 'collections' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => {
              const colItems = items.filter((i) => i.collectionIds.includes(col.id));
              return (
                <div
                  key={col.id}
                  className="group relative flex flex-col rounded-3xl bg-nocturne-850 hover:bg-nocturne-800 border border-nocturne-750/80 hover:border-purple-500/40 overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-950/20"
                >
                  {/* Artwork Banner */}
                  <Link href={`/collection/${col.id}`} className="relative aspect-[16/9] w-full overflow-hidden bg-nocturne-900 block">
                    <img
                      src={col.coverImage}
                      alt={col.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-nocturne-900 via-nocturne-900/30 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 font-mono capitalize">
                        {col.category || 'mixed'}
                      </span>
                      {col.isPrivate ? (
                        <span className="p-1 rounded-full bg-black/60 backdrop-blur-md text-nocturne-300">
                          <Lock className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="p-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-400">
                          <Globe className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 text-xs text-nocturne-300 font-medium">
                      {colItems.length} items
                    </div>
                  </Link>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/collection/${col.id}`}>
                        <h3 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors">
                          {col.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-nocturne-400 mt-1.5 line-clamp-2">
                        {col.description}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-5 pt-3 border-t border-nocturne-800 flex items-center justify-between text-xs">
                      <Link
                        href={`/collection/${col.id}`}
                        className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                      >
                        <span>Open Collection</span>
                        <span>→</span>
                      </Link>

                      <button
                        onClick={() => {
                          if (confirm(`Delete collection "${col.title}"?`)) {
                            deleteCollection(col.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-nocturne-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete collection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ALL SAVED ITEMS VIEW */}
      {activeTab === 'all_items' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-nocturne-850 border border-nocturne-750">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nocturne-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter saved items..."
                className="w-full bg-nocturne-900 border border-nocturne-750 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-nocturne-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {/* Category */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="bg-nocturne-900 border border-nocturne-750 rounded-xl px-3 py-1.5 text-xs text-nocturne-200 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="music">Music</option>
                <option value="game">Games</option>
                <option value="movie">Movies & TV</option>
                <option value="place">Places</option>
              </select>

              {/* Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-nocturne-900 border border-nocturne-750 rounded-xl px-3 py-1.5 text-xs text-nocturne-200 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="want">Want</option>
                <option value="currently_experiencing">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-nocturne-900 border border-nocturne-750 rounded-xl px-3 py-1.5 text-xs text-nocturne-200 focus:outline-none"
              >
                <option value="dateAdded">Recently Added</option>
                <option value="title">Title (A-Z)</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div
              className={
                layout === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                  : 'space-y-2.5'
              }
            >
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} layout={layout} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-nocturne-400 space-y-3">
              <Sparkles className="w-8 h-8 text-nocturne-500 mx-auto" />
              <p className="text-sm font-semibold text-white">No items match your filter</p>
              <button
                onClick={() => {
                  setFilterCategory('all');
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
