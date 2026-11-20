import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure mobile participant devices never run an outdated Service Worker or cached HTML shell
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

  // Clean legacy navigation HTML caches when opening participant QR link
  if (window.location.search.includes('view=participant') && 'caches' in window) {
    caches
      .keys()
      .then((keys) => {
        keys.forEach((k) => {
          if (k.includes('html-navigation-cache')) {
            caches.delete(k).catch(() => {});
          }
        });
      })
      .catch(() => {});
  }
}

createRoot(document.getElementById('root')!).render(<App />);
