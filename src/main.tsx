// Dev-server entry ONLY. Production ships zero JS: scripts/prerender.tsx renders
// App to static HTML and strips every emitted JS chunk from dist/ (architecture section 1).
import { createRoot } from 'react-dom/client';

import { App } from './App';
import services from './content/services.json';
import './styles/tokens.css';

const root = document.getElementById('root');
if (root !== null) {
  createRoot(root).render(<App services={services} />);
}
