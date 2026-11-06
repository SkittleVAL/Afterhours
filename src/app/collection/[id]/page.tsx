'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAfterhours } from '@/context/AfterhoursContext';
import { ItemCard } from '@/components/ItemCard';
import {
  Folder,
  ArrowLeft,
  Plus,
  Music2,
  Trash2,
  Lock,
  Globe,
  LayoutGrid,
  List,
  Sparkles,
  Share2,
  ExternalLink,
  Edit3
} from 'lucide-react';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    collections,
    items,
    deleteCollection,
    updateCollection,
    openSearch,
    playCollection,
    showToast
  } = useAfterhours();

  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const collection = collections.find((c) => c.id === id);

  if (!collection) {
    return (
      <div className="p-10 max-w-4xl mx-auto text-center py-24 space-y-4">
        <h2 className="text-xl font-bold text-white">Collection not found</h2>
        <p className="text-sm text-nocturne-400">The requested collection does not exist or was deleted.</p>
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collections</span>
        </Link>
      </div>
    );
  }

  const collectionItems = items.filter((item) => item.collectionIds.includes(collection.id));
  const hasMusicTracks = collectionItems.some((i) => i.category === 'music');

  const handleStartEdit = () => {
    setEditTitle(collection.title);
    setEditDesc(collection.description);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    updateCollection(collection.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${collection.title}"?`)) {
      deleteCollection(collection.id);
      router.push('/collection');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Collection link copied to clipboard', 'success');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Back Link */}
      <Link
        href="/collection"
        className="inline-flex items-center gap-1.5 text-xs text-nocturne-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to My Collection</span>
      </Link>

      {/* Hero Collection Header */}
      <div className="relative rounded-3xl overflow-hidden border border-nocturne-750 bg-nocturne-900 shadow-xl">
        <div className="relative h-64 md:h-72 w-full overflow-hidden">
          <img
            src={collection.coverImage}
            alt={collection.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-nocturne-950 via-nocturne-950/70 to-transparent" />
        </div>

        {/* Header Content */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 uppercase tracking-wider font-mono">
                {collection.category || 'mixed'}
              </span>
              {collection.isPrivate ? (
                <span className="flex items-center gap-1 text-[11px] text-nocturne-300">
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <Globe className="w-3 h-3" />
                  <span>Public</span>
                </span>
              )}
              <span className="text-nocturne-500">·</span>
              <span className="text-xs text-nocturne-300">{collectionItems.length} items</span>
            </div>

            {isEditing ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-nocturne-900 border border-purple-500 rounded-xl px-3 py-1.5 text-lg font-bold text-white focus:outline-none"
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-nocturne-900 border border-nocturne-700 rounded-xl px-3 py-1 text-xs text-white focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 rounded-lg bg-nocturne-800 text-nocturne-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {collection.title}
                </h1>
                <p className="text-xs md:text-sm text-nocturne-300 leading-relaxed">
                  {collection.description}
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasMusicTracks && (
              <button
                onClick={() => playCollection(collection.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-950/40"
              >
                <Music2 className="w-3.5 h-3.5" />
                <span>Přehrát playlist</span>
              </button>
            )}

            <button
              onClick={() => openSearch(collection.category === 'mixed' ? 'all' : collection.category)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-md shadow-purple-950/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Items</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-nocturne-850 hover:bg-nocturne-800 text-nocturne-300 hover:text-white border border-nocturne-750 transition-colors"
              title="Share collection"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleStartEdit}
              className="p-2 rounded-xl bg-nocturne-850 hover:bg-nocturne-800 text-nocturne-300 hover:text-white border border-nocturne-750 transition-colors"
              title="Edit info"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-nocturne-850 hover:bg-rose-950/40 text-nocturne-400 hover:text-rose-400 border border-nocturne-750 transition-colors"
              title="Delete collection"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Items Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <span>Items in this collection</span>
          <span className="text-xs font-mono text-nocturne-400">({collectionItems.length})</span>
        </h2>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-nocturne-850 border border-nocturne-750">
          <button
            onClick={() => setLayout('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              layout === 'grid' ? 'bg-purple-600 text-white' : 'text-nocturne-400'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              layout === 'list' ? 'bg-purple-600 text-white' : 'text-nocturne-400'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items Grid or Empty State */}
      {collectionItems.length > 0 ? (
        <div
          className={
            layout === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-2.5'
          }
        >
          {collectionItems.map((item) => (
            <ItemCard key={item.id} item={item} layout={layout} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-nocturne-400 space-y-4 rounded-3xl border border-dashed border-nocturne-750 bg-nocturne-900/40">
          <Sparkles className="w-10 h-10 text-nocturne-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">This collection is empty</h3>
            <p className="text-xs text-nocturne-400 max-w-sm mx-auto">
              Find tracks, games, films, or places to populate your "{collection.title}" collection.
            </p>
          </div>
          <button
            onClick={() => openSearch(collection.category === 'mixed' ? 'all' : collection.category)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-medium shadow-md shadow-purple-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Discover Items Now</span>
          </button>
        </div>
      )}
    </div>
  );
}
