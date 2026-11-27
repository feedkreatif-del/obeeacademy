import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __OBEE_MOUNTED__?: boolean;
  }
}

async function clearAppCachesAndReload() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
    }
  } catch {
    // ignore
  }
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
    }
  } catch {
    // ignore
  }
  window.location.reload();
}

interface BoundaryProps {
  children: ReactNode;
}

interface BoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Terjadi kendala saat menampilkan halaman.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught app render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF7EC] text-[#1F3A5F] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#1F3A5F]/15 rounded-3xl p-7 text-center shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1F3A5F] text-[#F28C28] font-display font-extrabold text-xl flex items-center justify-center mx-auto">
              !
            </div>
            <h2 className="font-display text-xl font-extrabold text-[#1F3A5F]">
              Tampilan Mengalami Gangguan
            </h2>
            <p className="text-sm text-[#1F3A5F]/75 leading-relaxed">
              Kemungkinan terdapat cache lama atau data sementara yang tidak cocok setelah pembaruan aplikasi.
            </p>
            <button
              type="button"
              onClick={() => {
                void clearAppCachesAndReload();
              }}
              className="w-full py-3 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white font-display font-bold text-sm cursor-pointer transition-colors"
            >
              Bersihkan Cache &amp; Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Recover cleanly if Vite reports a stale dynamic chunk after redeploy
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    try {
      const flagKey = 'obee_preload_recover_ts';
      const last = Number(window.sessionStorage.getItem(flagKey) || '0');
      if (Date.now() - last < 15000) return;
      window.sessionStorage.setItem(flagKey, String(Date.now()));
    } catch {
      // ignore
    }
    void clearAppCachesAndReload();
  });
}

// Ensure desktop & mobile PWA devices never stay on an outdated Service Worker or cached HTML shell
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    try {
      const flagKey = 'partnerup_sw_reloaded_ts';
      const last = Number(window.sessionStorage.getItem(flagKey) || '0');
      if (Date.now() - last < 10000) return;
      window.sessionStorage.setItem(flagKey, String(Date.now()));
    } catch {
      // ignore sessionStorage errors
    }
    refreshing = true;
    window.location.reload();
  });

  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      registrations.forEach((reg) => {
        reg.update().catch(() => {});
      });
    })
    .catch(() => {});

  // Clean legacy navigation HTML caches across all views (Participant, Remote HP/Tablet, and Installed PWA)
  if ('caches' in window) {
    caches
      .keys()
      .then((keys) => {
        keys.forEach((k) => {
          if (k === 'html-navigation-cache') {
            caches.delete(k).catch(() => {});
          }
        });
      })
      .catch(() => {});
  }
}

window.__OBEE_MOUNTED__ = true;

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
