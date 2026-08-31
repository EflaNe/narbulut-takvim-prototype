import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/primitives.css';
import './styles/overlay.css';
import './styles/shell.css';
import './styles/calendar.css';
import './styles/drawer.css';
import './styles/admin.css';
import './styles/requests.css';
import './styles/mobile.css';
import { App } from './App';
import { StoreProvider } from './lib/state/StoreContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
