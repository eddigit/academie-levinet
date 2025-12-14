import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'sonner';

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
