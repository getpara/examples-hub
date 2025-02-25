import './clients/sentry';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { defineCustomElements } from '@getpara/react-components';
import { RouterProvider } from 'react-router-dom';
import { StatsigProvider } from 'statsig-react';
import { router } from './router';
import { ENV_VARS, LINKEDIN_URL, SUPPORT_URL, TWITTER_URL } from './utils/constants';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './clients/queryClient';
import './index.css';
import '@getpara/react-components/css/capsule-core.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from './components/Toast/ToastContainer';
import { Environment, OAuthMethod, ParaProvider } from '@getpara/react-sdk';
import { paraLogo } from './assets/paraLogo';

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
        <ParaProvider
          paraClientConfig={{
            env: ENV_VARS.environment as Environment,
            apiKey: ENV_VARS.paraApiKey,
            opts: {
              xUrl: TWITTER_URL,
              linkedinUrl: LINKEDIN_URL,
              supportUrl: SUPPORT_URL,
            },
          }}
          config={{
            appName: 'Para Developer Portal',
            disableEmbeddedModal: true,
          }}
          paraModalConfig={{
            oAuthMethods: [OAuthMethod.GOOGLE],
            disablePhoneLogin: true,
            logo: paraLogo,
            bareModal: true,
            isOpen: true,
          }}
        >
          <RouterProvider router={router} />
          <ToastContainer />
        </ParaProvider>
      </StatsigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
