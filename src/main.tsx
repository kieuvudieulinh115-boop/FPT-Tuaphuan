import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { techTouchManager } from './services/ui/TechTouchManager';

// Initialize futuristic cyber tactile touch & ripple system
techTouchManager.init();

// Intercept TensorFlow Lite / Emscripten WASM informational logs
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('TensorFlow Lite') ||
     args[0].includes('XNNPACK delegate') ||
     args[0].startsWith('INFO:'))
  ) {
    console.info(...args);
    return;
  }
  originalConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
