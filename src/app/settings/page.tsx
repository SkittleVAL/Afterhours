'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAfterhours } from '@/context/AfterhoursContext';
import { storage } from '@/lib/storage';
import {
  Settings,
  User,
  Palette,
  Key,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Laptop,
  Check,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUserProfile, providers, updateProvider, showToast } = useAfterhours();

  // Profile Form State
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [bio, setBio] = useState(user.bio);
  const [theme, setTheme] = useState(user.theme);

  // Setup modal for provider
  const [activeSetupProvider, setActiveSetupProvider] = useState<any>(null);

  // PWA install prompt holder
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      displayName,
      username,
      avatarUrl,
      bio,
      theme,
    });
  };

  const handleExportBackup = () => {
    const backupJson = storage.exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afterhours-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Vault backup exported successfully!', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storage.importBackup(content);
      if (res.success) {
        showToast('Vault restored from backup!', 'success');
        window.location.reload();
      } else {
        showToast(res.error || 'Failed to restore backup', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handlePwaInstall = async () => {
    if (!deferredPrompt) {
      showToast('To install, use browser menu "Install AFTERHOURS" or Add to Home Screen', 'info');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPwaInstalled(true);
      showToast('AFTERHOURS installed as Web App!', 'success');
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 animate-fade-in">
      {/* Header */}
      <div className="pb-2 border-b border-nocturne-850">
        <div className="flex items-center gap-2 text-xs font-mono font-medium text-purple-400 tracking-wider uppercase mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>System Preferences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Settings & Integrations
        </h1>
        <p className="text-sm text-nocturne-400 mt-1">
          Manage your account profile, nocturnal theme, provider API connections, and data persistence.
        </p>
      </div>

      {/* Profile Settings */}
      <div className="p-6 rounded-3xl bg-nocturne-900 border border-nocturne-750 shadow-lg space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-nocturne-800">
          <User className="w-4 h-4 text-purple-400" />
          <h2 className="text-base font-bold text-white">Profile Details</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-nocturne-300 block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-nocturne-300 block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-nocturne-300 block mb-2">Profilový avatar (Nahrát obrázek z PC)</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-nocturne-950 border border-nocturne-800">
              <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500/50 flex-shrink-0">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-md">
                    <span>Vybrat fotku z počítače</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 3 * 1024 * 1024) {
                          showToast('Obrázek je příliš velký (max 3 MB)', 'warning');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result as string;
                          setAvatarUrl(dataUrl);
                          updateUserProfile({ avatarUrl: dataUrl });
                          showToast('Profilová fotka nahrána!', 'success');
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                      setAvatarUrl(defaultAvatar);
                      updateUserProfile({ avatarUrl: defaultAvatar });
                      showToast('Nastaven výchozí avatar', 'info');
                    }}
                    className="px-3 py-2 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-300 hover:text-white text-xs transition-colors"
                  >
                    Resetovat
                  </button>
                </div>
                <p className="text-[11px] text-nocturne-400">
                  Podporuje JPG, PNG, WebP nebo GIF. Obrázek se uloží lokálně přímo v prohlížeči.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-nocturne-300 block mb-1">Bio / Curator Statement</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-md shadow-purple-950/40"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Connected Services & OAuth Integrations */}
      <div className="p-6 rounded-3xl bg-nocturne-900 border border-nocturne-750 shadow-lg space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-nocturne-800">
          <Key className="w-4 h-4 text-purple-400" />
          <h2 className="text-base font-bold text-white">Third-Party Integrations & APIs</h2>
        </div>

        <p className="text-xs text-nocturne-400">
          AFTERHOURS integrates with official developer platforms. When credentials are not yet configured, safe client fallbacks are provided.
        </p>

        <div className="space-y-4">
          {providers.map((p) => (
            <div
              key={p.provider}
              className="p-4 rounded-2xl bg-nocturne-850 border border-nocturne-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                  {p.isConnected ? (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                      <Check className="w-2.5 h-2.5" />
                      Connected ({p.accountName || 'Active'})
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-nocturne-750 text-nocturne-400 border border-nocturne-700 font-mono">
                      Setup Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-nocturne-400">{p.tagline}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.supportedFeatures.slice(0, 2).map((feat, idx) => (
                    <span key={idx} className="text-[10px] text-nocturne-400 bg-nocturne-800 px-2 py-0.5 rounded-md">
                      • {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setActiveSetupProvider(p)}
                  className="px-3.5 py-1.5 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 border border-nocturne-700 text-nocturne-200 text-xs font-medium transition-colors"
                >
                  Setup Guide
                </button>

                {p.provider === 'spotify' && (
                  <div className="flex items-center gap-1.5">
                    <a
                      href="/api/auth/spotify"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-all shadow-md"
                    >
                      Propojit Spotify
                    </a>
                    <Link
                      href="/music"
                      className="px-3 py-1.5 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-nocturne-300 hover:text-white border border-nocturne-700 text-xs font-medium transition-all"
                    >
                      Music Hub
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Download & PWA Section */}
      <div className="p-6 rounded-3xl bg-nocturne-900 border border-nocturne-750 shadow-lg space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-nocturne-800">
          <Laptop className="w-4 h-4 text-purple-400" />
          <h2 className="text-base font-bold text-white">Desktop Application & PWA Installation</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Progressive Web App */}
          <div className="p-5 rounded-2xl bg-nocturne-850 border border-nocturne-750 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Web Application (PWA)</span>
              {isPwaInstalled && (
                <span className="text-[10px] text-emerald-400 font-mono">Installed</span>
              )}
            </h3>
            <p className="text-xs text-nocturne-400 leading-relaxed">
              Install AFTERHOURS directly from your browser as an offline-capable standalone window with dedicated icon and notifications.
            </p>
            <button
              onClick={handlePwaInstall}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-md shadow-purple-950/40"
            >
              {isPwaInstalled ? 'PWA Already Installed' : 'Install Web App'}
            </button>
          </div>

          {/* Tauri 2 Desktop Wrapper */}
          <div className="p-5 rounded-2xl bg-nocturne-850 border border-nocturne-750 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Tauri 2 Native Desktop</span>
              <span className="text-[10px] text-purple-300 font-mono">Windows · macOS</span>
            </h3>
            <p className="text-xs text-nocturne-400 leading-relaxed">
              Native Rust/Tauri 2 wrapper configured in <code>src-tauri/</code>. Runs natively on Windows 11 with custom titlebar and native notification hooks.
            </p>
            <div className="text-[11px] font-mono text-nocturne-400 bg-nocturne-900 p-2 rounded-lg border border-nocturne-800">
              <code>npm run tauri build</code>
            </div>
          </div>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="p-6 rounded-3xl bg-nocturne-900 border border-nocturne-750 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-nocturne-800">
          <Database className="w-4 h-4 text-purple-400" />
          <h2 className="text-base font-bold text-white">Vault Backup & Data Portability</h2>
        </div>

        <p className="text-xs text-nocturne-400">
          Your collections belong to you. Download a complete JSON snapshot of all your saved tracks, games, films, notes, and collections.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-nocturne-850 hover:bg-nocturne-800 border border-nocturne-700 text-xs font-medium text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export Backup (.JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-nocturne-850 hover:bg-nocturne-800 border border-nocturne-700 text-xs font-medium text-white transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restore from Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('Reset AFTERHOURS to curated sample data?')) {
                storage.resetAll();
                window.location.reload();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors ml-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Seed Data</span>
          </button>
        </div>
      </div>

      {/* Provider Setup Guide Modal */}
      {activeSetupProvider && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveSetupProvider(null)}
        >
          <div
            className="relative w-full max-w-lg bg-nocturne-900 border border-nocturne-750 rounded-3xl p-6 overflow-hidden shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-nocturne-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{activeSetupProvider.name} Setup Guide</span>
              </h3>
              <button
                onClick={() => setActiveSetupProvider(null)}
                className="text-nocturne-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-nocturne-300">
              <p className="font-medium text-white">{activeSetupProvider.tagline}</p>
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-nocturne-400 block font-mono">
                  Configuration Steps:
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-nocturne-300">
                  {activeSetupProvider.setupGuide.steps.map((step: string, i: number) => (
                    <li key={i} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>

              {activeSetupProvider.setupGuide.envKeyExample && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-nocturne-400 block font-mono">
                    Environment Variables (.env.local):
                  </span>
                  <pre className="p-3 rounded-xl bg-nocturne-950 border border-nocturne-800 text-[11px] font-mono text-purple-300 overflow-x-auto">
                    {activeSetupProvider.setupGuide.envKeyExample}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-nocturne-800 flex items-center justify-between">
              <a
                href={activeSetupProvider.setupGuide.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Official Documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setActiveSetupProvider(null)}
                className="px-4 py-1.5 rounded-xl bg-nocturne-800 hover:bg-nocturne-750 text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
