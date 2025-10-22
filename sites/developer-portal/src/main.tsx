import './clients/sentry';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@getpara/react-sdk/styles.css';
import './i18n';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
