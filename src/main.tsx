import { createRoot } from 'react-dom/client';
import App from './App';
import { PlasmaBackground } from './components/ui';
import './styles/index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

createRoot(container).render(
  <>
    {/* Plasma is mounted separately so it persists across tab changes */}
    <PlasmaBackground />
    <App />
  </>
);
