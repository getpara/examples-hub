import React from 'react';
import ReactDOM from 'react-dom/client';
import { defineCustomElements } from '@usecapsule/react-components';
import { RouterProvider } from 'react-router-dom';
import { StatsigProvider } from 'statsig-react';
import { router } from './router';
import { ENV_VARS } from './utils/constants';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './clients/queryClient';
import './index.css';
import '@usecapsule/react-components/css/capsule-core.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from './components/Toast/ToastContainer';

defineCustomElements();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StatsigProvider
        user={{}}
        sdkKey={ENV_VARS.statsigClientKey}
        waitForInitialization={true}
        options={{
          environment: { tier: ENV_VARS.statsigEnv },
        }}
      >
        <RouterProvider router={router} />
        <ToastContainer />
      </StatsigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
