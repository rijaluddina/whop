import { useState } from 'react';

interface ConsoleLayoutProps {
  title: string;
  experienceId: string;
  children: React.ReactNode;
}

export const ConsoleLayout = ({ title, experienceId, children }: ConsoleLayoutProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="console-layout min-h-screen bg-[#020617] text-slate-200 selection:bg-amber-500/30">
      <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-10 px-6 py-3.5 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="font-semibold text-slate-100 tracking-tight uppercase text-xs">
              Whop · Owner Console
            </span>
          </div>
          <span className="text-sm text-slate-400">{title}</span>
          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_self"
              className="px-3 py-1.5 text-sm text-slate-300 hover:text-white border border-slate-600 rounded hover:bg-slate-800 transition"
              onClick={(e) => {
                e.preventDefault();
                setConfirmOpen(true);
              }}
            >
              Kembali ke situs
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>

      {/* Confirm leave console */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative bg-[#0f172a] border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-semibold text-slate-100 mb-2">Keluar dari konsol owner</h3>
            <p className="text-sm text-slate-400 mb-5">
              Anda akan kembali ke situs publik Apex Roofing.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2 border border-slate-700 rounded text-sm text-slate-300 hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  window.location.href = '/';
                }}
                className="flex-1 py-2 bg-amber-500 rounded text-sm font-bold text-[#020617] hover:bg-amber-400 transition"
              >
                Buka situs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
