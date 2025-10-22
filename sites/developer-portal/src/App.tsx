import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { StatsigProvider } from 'statsig-react';
import { router } from './router';
import { ENV_VARS, LINKEDIN_URL, SUPPORT_URL, TWITTER_URL } from './utils/constants';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './clients/queryClient';
import { Environment, ParaProvider } from '@getpara/react-sdk';
import { paraLogo } from './assets/paraLogo';
import { Toaster } from '@getpara/react-component-library';
import { CircleCheck } from 'lucide-react';

export const App = () => {
  return (
    <Suspense fallback={null}>
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
              oAuthMethods: ['GOOGLE'],
              disablePhoneLogin: true,
              logo: paraLogo,
              bareModal: true,
              isOpen: true,
            }}
            externalWalletConfig={{ wallets: [] }}
          >
            <RouterProvider router={router} />
            <Toaster
              theme="light"
              icons={{
                success: <CircleCheck className="para:stroke-background para:fill-green-600 para:size-5" />,
              }}
            />
          </ParaProvider>
        </StatsigProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
