'use client';

import React from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useAfterhours();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            case 'error':
              return <AlertCircle className="w-4 h-4 text-rose-400" />;
            case 'warning':
              return <AlertTriangle className="w-4 h-4 text-amber-400" />;
            default:
              return <Info className="w-4 h-4 text-purple-400" />;
          }
        };

        const getBorderColor = () => {
          switch (toast.type) {
            case 'success': return 'border-emerald-500/40';
            case 'error': return 'border-rose-500/40';
            case 'warning': return 'border-amber-500/40';
            default: return 'border-purple-500/40';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl bg-nocturne-900/95 backdrop-blur-md border ${getBorderColor()} text-white shadow-xl shadow-black/50 animate-slide-up`}
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              {getIcon()}
              <span className="text-xs font-medium text-nocturne-100 line-clamp-2">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-nocturne-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
