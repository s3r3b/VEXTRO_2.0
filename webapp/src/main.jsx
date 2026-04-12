import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App.jsx';
import { ShieldProvider } from './context/ShieldContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

// Vite polyfills
window.Buffer = window.Buffer || Buffer;
window.global = window.global || window;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ShieldProvider>
        <App />
      </ShieldProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
