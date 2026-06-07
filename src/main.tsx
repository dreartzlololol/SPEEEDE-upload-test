import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'leaflet/dist/leaflet.css'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register PWA service worker
registerSW({ immediate: true });

// Capture PWA install prompt globally
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPrompt = e;
  // Dispatch a custom event to notify listeners (e.g. Settings page)
  window.dispatchEvent(new CustomEvent('pwa-installable'));
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
