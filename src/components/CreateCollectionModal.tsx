'use client';

import React, { useState } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { ItemCategory } from '@/types';
import { X, FolderPlus, Sparkles, Image as ImageIcon, Lock, Globe } from 'lucide-react';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
];

export function CreateCollectionModal() {
  const { activeCollectionModal, closeCreateCollectionModal, createCollection } = useAfterhours();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory | 'mixed'>('mixed');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0]);
  const [isPrivate, setIsPrivate] = useState(true);

  if (!activeCollectionModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createCollection({
      title: title.trim(),
      description: description.trim() || 'A curated collection of nocturnal discoveries.',
      category,
      coverImage,
      isFavorite: false,
      isPrivate,
    });

    setTitle('');
    setDescription('');
    closeCreateCollectionModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={closeCreateCollectionModal}
    >
      <div
        className="relative w-full max-w-lg bg-nocturne-900 border border-nocturne-750 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-nocturne-800 flex items-center justify-between bg-nocturne-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create New Collection</h3>
              <p className="text-[11px] text-nocturne-400">Curate tracks, games, films or places into a themed set</p>
            </div>
          </div>
          <button
            onClick={closeCreateCollectionModal}
            className="p-1.5 rounded-lg text-nocturne-400 hover:text-white hover:bg-nocturne-750"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-nocturne-300 block mb-1">
              Collection Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Songs for 2 AM, Weekend Watchlist, Tokyo Nightspots..."
              className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-nocturne-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-nocturne-300 block mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A few words on the mood, purpose, or theme..."
              rows={2}
              className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl px-3.5 py-2 text-xs text-white placeholder-nocturne-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-nocturne-300 block mb-1.5">
              Category Focus
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { key: 'mixed', label: 'Mixed' },
                { key: 'music', label: 'Music' },
                { key: 'game', label: 'Games' },
                { key: 'movie', label: 'Movies' },
                { key: 'place', label: 'Places' },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium capitalize transition-all ${
                    category === c.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-nocturne-800 text-nocturne-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Artwork Selector */}
          <div>
            <label className="text-xs font-semibold text-nocturne-300 block mb-1.5">
              Cover Artwork
            </label>
            <div className="grid grid-cols-6 gap-2 mb-2">
              {PRESET_COVERS.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(img)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    coverImage === img ? 'border-purple-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="cover preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Or paste custom image URL..."
              className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl px-3 py-2 text-xs text-nocturne-300 placeholder-nocturne-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-nocturne-850 border border-nocturne-800">
            <div className="flex items-center gap-2.5">
              {isPrivate ? (
                <Lock className="w-4 h-4 text-purple-400" />
              ) : (
                <Globe className="w-4 h-4 text-emerald-400" />
              )}
              <div>
                <div className="text-xs font-medium text-white">
                  {isPrivate ? 'Private Collection' : 'Public Collection'}
                </div>
                <div className="text-[10px] text-nocturne-400">
                  {isPrivate ? 'Only visible to you' : 'Shareable with friends'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                isPrivate
                  ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50'
                  : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
              }`}
            >
              Toggle
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeCreateCollectionModal}
              className="px-4 py-2 rounded-xl text-xs text-nocturne-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-md shadow-purple-950/40"
            >
              Create Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
