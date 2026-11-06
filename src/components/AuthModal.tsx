'use client';

import React, { useState } from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import {
  X,
  User,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const { login, register } = useAfterhours();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form fields
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(identifier, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Přihlášení se nezdařilo');
        }
      } else {
        const res = await register(username, email, password, displayName);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Registrace se nezdařila');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Nastala neočekávaná chyba.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-nocturne-900 border border-nocturne-750/90 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl shadow-purple-950/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient light */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-nocturne-800 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {mode === 'login' ? 'Přihlášení do AFTERHOURS' : 'Vytvořit nový účet'}
              </h2>
              <p className="text-[11px] text-nocturne-400">
                {mode === 'login'
                  ? 'Přístup k tvé osobní databázi a playlistům'
                  : 'Vlastní profil, neomezená databáze na serveru'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-nocturne-800 text-nocturne-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-center gap-2.5 text-xs text-rose-300 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Switch Tabs */}
        <div className="flex rounded-xl bg-nocturne-950 p-1 border border-nocturne-800 mt-4 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-nocturne-400 hover:text-white'
            }`}
          >
            Přihlásit se
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-nocturne-400 hover:text-white'
            }`}
          >
            Zaregistrovat se
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {mode === 'login' ? (
            <>
              <div>
                <label className="text-xs font-medium text-nocturne-300 block mb-1">
                  Uživatelské jméno nebo E-mail
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-nocturne-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="napr. alex_nocturne"
                    className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-nocturne-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-nocturne-300 block mb-1">
                  Heslo
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-nocturne-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-nocturne-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-nocturne-300 block mb-1">
                    Uživatelské jméno
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-nocturne-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="alex_night"
                      className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-nocturne-600 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-nocturne-300 block mb-1">
                    Zobrazované jméno
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Novak"
                    className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl px-3 py-2.5 text-xs text-white placeholder-nocturne-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-nocturne-300 block mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-nocturne-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-nocturne-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-nocturne-300 block mb-1">
                  Heslo (min. 6 znaků)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-nocturne-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-nocturne-950 border border-nocturne-750 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-nocturne-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-950/50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-nocturne-800/80 flex items-center justify-between text-[11px] text-nocturne-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bezpečné šifrování scrypt</span>
          </span>
          <span>AFTERHOURS Multi-User DB</span>
        </div>
      </div>
    </div>
  );
}
