import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './mobile.css'

// Initialize Capacitor for mobile
import { Capacitor } from '@capacitor/core';

// Check if running on mobile
if (Capacitor.isNativePlatform()) {
  // Mobile-specific initialization
  import('@capacitor/status-bar').then(({ StatusBar }) => {
    StatusBar.setStyle({ style: 'DARK' as any });
  });
  
  import('@capacitor/splash-screen').then(({ SplashScreen }) => {
    SplashScreen.hide();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
