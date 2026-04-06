import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ShieldProvider } from './context/ShieldContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ShieldProvider>
      <App />
    </ShieldProvider>
  </React.StrictMode>,
);
