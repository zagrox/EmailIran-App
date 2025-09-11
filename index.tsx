import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';

// Bridge the gap between the hosting environment's variables (e.g., from Vite) 
// and the Gemini SDK's requirement to read the key from `process.env.API_KEY`.
// This code runs when the app starts, before any AI services are called.
// FIX: Cast `import.meta` to `any` to resolve TypeScript error about missing `env` property.
if ((import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) {
  // Create a mock `process.env` object on the window if it doesn't exist.
  if (typeof window.process === 'undefined') {
    window.process = { env: {} } as any;
  }
  // Assign the API key from the environment variable provided by the hosting service.
  // FIX: Cast `import.meta` to `any` to resolve TypeScript error about missing `env` property.
  (window.process.env as any).API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);