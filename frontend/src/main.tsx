import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { SettingsProvider } from './contexts/SettingsContext.tsx';
import { OnlineStatusProvider } from './contexts/OnlineStatusContext.tsx';

// Register the service worker for PWA capabilities.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

/**
 * The entry point of the React application.
 * It renders the main App component within a StrictMode, BrowserRouter, and SettingsProvider.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode> {/* Enables strict checks for potential problems in an application. */}
    <BrowserRouter> {/* Provides routing capabilities to the application. */}
      <SettingsProvider>
        <OnlineStatusProvider>
          <App />
        </OnlineStatusProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>
);