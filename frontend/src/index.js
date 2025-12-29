import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'sonner';
import BUILD_INFO from './buildInfo';

// Afficher les infos de build dans la console
console.log('%c═══════════════════════════════════════════════════', 'color: #C9A227');
console.log('%c   ACADÉMIE JACQUES LEVINET', 'color: #C9A227; font-weight: bold; font-size: 14px');
console.log('%c═══════════════════════════════════════════════════', 'color: #C9A227');
console.log(`%c   📅 Build Date: ${BUILD_INFO.date}`, 'color: #888');
console.log(`%c   🕐 Build Time: ${BUILD_INFO.time}`, 'color: #888');
console.log(`%c   🆔 Build ID: ${BUILD_INFO.buildId}`, 'color: #888');
console.log(`%c   📦 Version: ${BUILD_INFO.version}`, 'color: #888');
console.log('%c═══════════════════════════════════════════════════', 'color: #C9A227');

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-right"
      theme="dark"
      richColors
      toastOptions={{
        style: {
          background: '#1F2937',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#F3F4F6',
        },
      }}
    />
  </React.StrictMode>
);
