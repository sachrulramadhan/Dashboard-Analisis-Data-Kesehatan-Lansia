import React, { useState, useEffect, useRef } from 'react';
import { Lock, X } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const AdminLoginModal: React.FC = () => {
  const { adminLoginOpen, setAdminLoginOpen, loginAdmin } = useDashboard();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adminLoginOpen) {
      setPassword('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [adminLoginOpen]);

  if (!adminLoginOpen) return null;

  const submit = async () => {
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    const err = await loginAdmin(password);
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 id="admin-login-title" className="text-sm font-bold text-slate-900">
                Masuk sebagai admin
              </h3>
              <p className="text-xs text-slate-500">Hanya admin yang dapat mengubah data.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAdminLoginOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Password admin
        </label>
        <input
          id="admin-password"
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          autoComplete="current-password"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {error && (
          <p className="mt-2 text-xs text-rose-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={() => setAdminLoginOpen(false)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!password || busy}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
          >
            {busy ? 'Memeriksa…' : 'Masuk'}
          </button>
        </div>
      </div>
    </div>
  );
};
