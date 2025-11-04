import { Toaster } from 'react-hot-toast';
import { ReactElement, ReactNode, useEffect } from 'react';

import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import useInitialization from '@/hooks/useInitialization';
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager';
import { walletKit } from '@/utils/WalletConnectUtil';
import { RELAYER_EVENTS } from '@walletconnect/core';
import { AppProps } from 'next/app';
import '../../public/main.css';
import { styledToast } from '@/utils/HelperUtil';
import Head from 'next/head';
import { NextPage } from 'next';
import { QueryProvider } from '../context/QueryProvider';
import { ParaProvider } from '../context/ParaProvider';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  useEffect(() => {
    if (location.href.includes('walletconnect.getpara.com')) {
      location.href = location.href.replace('walletconnect.getpara.com', 'connect.getpara.com');
    }
  }, []);
  // Step 1 - Initialize wallets and wallet connect client
  const initialized = useInitialization();

  // Step 2 - Once initialized, set up wallet connect event manager
  useWalletConnectEventsManager(initialized);
  useEffect(() => {
    if (!initialized) return;
    walletKit.core.relayer.on(RELAYER_EVENTS.connect, () => {
      styledToast('Network connection is restored!', 'success', 'network-connection-restored');
    });

    walletKit.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
      // no-op
    });
  }, [initialized]);

  const getLayout = Component.getLayout || ((page: ReactElement) => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {process.env.NEXT_PUBLIC_ENV === 'PROD' ? (
          <>
            {/* Primary Meta Tags */}
            <title>Para Connect – Use your universal wallet anywhere</title>
            <meta name="title" content="Para Connect – Use your universal wallet anywhere" />
            <meta
              name="description"
              content="Connect your Para universal wallet to Web3 applications using WalletConnect. Use your cross-app wallet across chains, applications, and ecosystems."
            />
            <meta
              name="keywords"
              content="Para wallet, crypto onboarding, universal embedded wallet, WalletConnect, web3 wallet, cross chain wallet"
            />
            <meta name="author" content="Para Team" />
            <meta name="robots" content="index,follow" />
            <meta name="language" content="English" />

            {/* Canonical URL */}
            <link rel="canonical" href="https://connect.getpara.com" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://connect.getpara.com" />
            <meta property="og:title" content="Para Connect – Use your universal wallet anywhere" />
            <meta
              property="og:description"
              content="Connect your Para universal wallet to Web3 applications using WalletConnect. Use your cross-app wallet across chains, applications, and ecosystems."
            />
            <meta property="og:image" content="https://connect.getpara.com/base-image.png" />
            <meta property="og:site_name" content="Para Portal" />
            <meta property="og:locale" content="en_US" />

            {/* Twitter Card */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content="https://connect.getpara.com" />
            <meta property="twitter:title" content="Para Connect – Use your universal wallet anywhere" />
            <meta
              property="twitter:description"
              content="Connect your Para universal wallet to Web3 applications using WalletConnect. Use your cross-app wallet across chains, applications, and ecosystems."
            />
            <meta property="twitter:image" content="https://connect.getpara.com/base-image.png" />
            <meta property="twitter:creator" content="@getpara" />
            <meta property="twitter:site" content="@getpara" />

            {/* Additional Meta Tags */}
            <meta name="theme-color" content="#6366f1" />
            <meta name="application-name" content="Para Portal" />
            <meta name="apple-mobile-web-app-title" content="Para Portal" />
            <meta name="apple-mobile-web-app-capable" content="yes" />

            {/* Structured Data */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'WebApplication',
                  'name': 'Para Connect – Use your universal wallet anywhere',
                  'description':
                    'Connect your Para universal wallet to Web3 applications using WalletConnect. Use your cross-app wallet across chains, applications, and ecosystems.',
                  'url': 'https://connect.getpara.com',
                  'applicationCategory': 'FinanceApplication',
                  'operatingSystem': 'Web Browser',
                  'offers': {
                    '@type': 'Offer',
                    'price': '0',
                    'priceCurrency': 'USD',
                  },
                  'author': {
                    '@type': 'Organization',
                    'name': 'Para',
                    'url': 'https://getpara.com',
                  },
                }),
              }}
            />
          </>
        ) : (
          <>
            {/* Non-Production Environment */}
            <title>Para Portal - Testing Environment</title>
            <meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex" />
            <meta name="description" content="Para Portal testing environment - not for production use" />
            <meta name="googlebot" content="noindex,nofollow,noarchive,nosnippet,noimageindex" />
            <meta name="bingbot" content="noindex,nofollow,noarchive,nosnippet,noimageindex" />
            <meta httpEquiv="cache-control" content="no-cache, no-store, must-revalidate" />
            <meta httpEquiv="pragma" content="no-cache" />
            <meta httpEquiv="expires" content="0" />
          </>
        )}

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />

        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="//getpara.com" />
        <link rel="dns-prefetch" href="//walletconnect.com" />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </Head>
      <style jsx global>{`
        body {
          margin: 0px;
          padding: 0px;
        }
      `}</style>
      <QueryProvider>
        <ParaProvider>
          <>
            <Layout initialized={initialized}>
              <Toaster
                toastOptions={{
                  style: {
                    fontFamily: 'Inter',
                  },
                }}
              />
              {getLayout(<Component {...pageProps} />)}
            </Layout>
            <Modal />
          </>
        </ParaProvider>
      </QueryProvider>
    </>
  );
}
