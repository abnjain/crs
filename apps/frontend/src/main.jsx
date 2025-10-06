// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { RootProviders } from './providers/RootProviders';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import CustomToaster from "@/components/shared/CustomToaster";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <RootProviders>
          <CustomToaster />
          <App />
        </RootProviders>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);