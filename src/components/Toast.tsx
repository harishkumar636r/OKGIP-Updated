import React from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`p-3.5 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md text-xs transition-all animate-slide-in ${
            t.type === 'success'
              ? 'bg-white border-emerald-300 text-emerald-900 shadow-emerald-500/10'
              : t.type === 'error'
              ? 'bg-white border-rose-300 text-rose-900 shadow-rose-500/10'
              : 'bg-white border-violet-300 text-violet-900 shadow-violet-500/10'
          }`}
        >
          {t.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
          {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />}

          <div className="flex-1">
            <p className="font-bold text-slate-900">{t.title}</p>
            {t.message && <p className="text-slate-600 text-[11px] mt-0.5 leading-tight">{t.message}</p>}
          </div>

          <button onClick={() => onClose(t.id)} className="text-slate-400 hover:text-slate-700 p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
