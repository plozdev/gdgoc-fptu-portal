import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Remove obsolete development caches and MSW registrations left by older builds.
for (const key of ['gdgoc_tasks_v2', 'gdgoc_members_directory_v1', 'gdgoc_landing_content_v2', 'gdgoc_generation_config_v2']) localStorage.removeItem(key);
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      if ([registration.active, registration.waiting, registration.installing].some((worker) => worker?.scriptURL.endsWith('/mockServiceWorker.js'))) void registration.unregister();
    }
  }).catch(console.error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
