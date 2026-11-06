'use client';

import React, { useState } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { Users2, Share2, Copy, Check, Globe, Shield, Sparkles, ExternalLink, Link2 } from 'lucide-react';

export default function FriendsPage() {
  const { user, collections, showToast } = useAfterhours();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const publicCollections = collections.filter((c) => !c.isPrivate);

  const copyShareLink = (colId: string) => {
    const url = `${window.location.origin}/collection/${colId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(colId);
      showToast('Collection share link copied!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const copyProfileLink = () => {
    const url = `${window.location.origin}/user/${user.username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Profile link copied!', 'success');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-nocturne-850">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-purple-400 tracking-wider uppercase mb-1">
            <Users2 className="w-3.5 h-3.5" />
            <span>Social & Shared Discovery</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Friends & Sharing
          </h1>
          <p className="text-sm text-nocturne-400 mt-1">
            Share your curated collections, discover friends' nocturnal taste, and manage public links.
          </p>
        </div>

        <button
          onClick={copyProfileLink}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-md shadow-purple-950/40"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Copy Public Profile Link</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-3xl bg-nocturne-850 border border-nocturne-750 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-lg">
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="w-20 h-20 rounded-2xl object-cover ring-2 ring-purple-500/40"
        />
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-white">{user.displayName}</h2>
            <span className="text-xs text-nocturne-400 font-mono">@{user.username}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono w-fit mx-auto sm:mx-0">
              Personal Vault
            </span>
          </div>
          <p className="text-xs text-nocturne-300 max-w-xl">
            {user.bio}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-4 pt-3 text-xs text-nocturne-400 font-mono">
            <span>{collections.length} Collections</span>
            <span>·</span>
            <span>{publicCollections.length} Public</span>
            <span>·</span>
            <span>Member since {user.joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Shareable Public Collections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Your Shareable Collections</span>
          </h2>
          <span className="text-xs text-nocturne-400">
            {publicCollections.length} available for public sharing
          </span>
        </div>

        {publicCollections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicCollections.map((col) => (
              <div
                key={col.id}
                className="p-4 rounded-2xl bg-nocturne-850 border border-nocturne-750 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={col.coverImage}
                    alt={col.title}
                    className="w-12 h-12 rounded-xl object-cover border border-nocturne-700"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white truncate">{col.title}</h3>
                    <p className="text-[11px] text-nocturne-400 line-clamp-1">{col.description}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-nocturne-800 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-mono">Public Link Active</span>
                  <button
                    onClick={() => copyShareLink(col.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-200 text-xs font-medium transition-colors"
                  >
                    {copiedId === col.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-nocturne-400 space-y-2 rounded-2xl border border-dashed border-nocturne-800 bg-nocturne-900/30 p-6">
            <p className="text-xs text-white">All your current collections are set to Private.</p>
            <p className="text-[11px] text-nocturne-400">
              You can toggle any collection to Public inside its detail view to generate a shareable link.
            </p>
          </div>
        )}
      </div>

      {/* Social Architecture Roadmap Notice */}
      <div className="p-5 rounded-2xl bg-nocturne-850/60 border border-nocturne-750 text-xs text-nocturne-300 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Social Architecture & Roadmap</span>
        </div>
        <p className="text-[11px] leading-relaxed text-nocturne-400">
          In adherence to the product guidelines, AFTERHOURS does not present mock users as real people. In Phase 2, Supabase collaborative collections will allow multiple users to build shared playlists and gaming backlogs with real cryptographic authentication.
        </p>
      </div>
    </div>
  );
}
