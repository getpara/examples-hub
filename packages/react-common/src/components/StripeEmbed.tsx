import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { OnrampSession, OnrampSessionResult, StripeOnramp, loadStripeOnramp } from '@stripe/crypto';
import { Network, OnRampAsset, OnRampProvider, OnRampPurchaseStatus } from '@getpara/web-sdk';
import { CpslSpinner } from '@getpara/react-components';
import { SpinnerContainer } from './common.js';
import styled from 'styled-components';
import { Props } from '../types/index.js';

export const STRIPE_PUBLISHABLE_KEY =
  'pk_live_51MvquNGrzDeP5yP9EgVSMBPQbrbg0oHDjPIIXypePd0jzOFjbadyfO7wBKLHhUtbKIUiEUVC3YYcTJyAmJ8xA7JE00T2UDfYKz';
export const STRIPE_PUBLISHABLE_KEY_TEST =
  'pk_test_51MvquNGrzDeP5yP98WgPaAUgQ50I3OpfPhVfiLO47FBHepJnZRPO62IzZY2uxT5ovhSS10RwcTcnaVil1mcJOzIi00dHapODdS';

const AssetCodes = {
  eth: OnRampAsset.ETHEREUM,
  matic: OnRampAsset.POLYGON,
  sol: OnRampAsset.SOLANA,
  usdc: OnRampAsset.USDC,
};

const NetworkCodes = {
  base: Network.BASE,
  ethereum: Network.ETHEREUM,
  polygon: Network.POLYGON,
  solana: Network.SOLANA,
};

const CryptoElementsContext = React.createContext(null);
CryptoElementsContext.displayName = 'CryptoElementsContext';
const useOnrampSessionListener = (type, session, callback) => {
  React.useEffect(() => {
    if (session && callback) {
      const listener = e => callback(e.payload);
      session.addEventListener(type, listener);
      return () => {
        session.removeEventListener(type, listener);
      };
    }
    return () => {};
  }, [session, callback, type]);
};

export const StripeEmbed = ({ para, isDark, isEmbedded, onRampPurchase, setOnRampPurchase }: Props) => {
  const [isReady, setIsReady] = useState(false);

  const isStripeEmbed = useMemo(() => onRampPurchase.provider === OnRampProvider.STRIPE, [onRampPurchase]);
  const clientSecret = useMemo(
    () => (onRampPurchase?.provider === OnRampProvider.STRIPE ? onRampPurchase?.providerKey : undefined),
    [onRampPurchase?.provider, onRampPurchase?.providerKey],
  );

  const [stripeOnRamp, setStripeOnRamp] = useState<StripeOnramp | undefined>();

  const onrampElementRef = React.useRef(null);
  const [session, setSession] = React.useState<OnrampSession | undefined>();

  useEffect(() => {
    const containerRef = onrampElementRef.current;
    if (containerRef) {
      // NB: ideally we want to be able to hot swap/update onramp iframe
      // This currently results a flash if one needs to mint a new session when they need to udpate fixed transaction details
      containerRef.innerHTML = '';

      if (clientSecret && stripeOnRamp) {
        setSession(
          stripeOnRamp
            .createSession({
              clientSecret,
              appearance: { theme: isDark ? 'dark' : 'light' },
            })
            .mount(containerRef),
        );
      }
    }
  }, [clientSecret, stripeOnRamp]);

  useEffect(() => {
    loadStripeOnramp(onRampPurchase?.testMode ? STRIPE_PUBLISHABLE_KEY_TEST : STRIPE_PUBLISHABLE_KEY).then(setStripeOnRamp);
  }, []);

  const onReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const onSessionChange = useCallback(
    async ({ session }: { session: OnrampSessionResult }) => {
      if (!isStripeEmbed) {
        return;
      }

      switch (session.status) {
        case 'fulfillment_processing':
        case 'fulfillment_complete':
          const updatedPurchase = await para.ctx.client.updateOnRampPurchase({
            userId: para.getUserId(),
            walletId: onRampPurchase.walletId,
            externalWalletAddress: onRampPurchase.externalWalletAddress,
            purchaseId: onRampPurchase.id,
            updates: {
              status: OnRampPurchaseStatus.FINISHED,
              fiatQuantity: session.quote.source_amount,
              fiat: session.quote.source_currency.asset_code,
              network: NetworkCodes[session.quote.destination_currency.currency_network],
              asset: AssetCodes[session.quote.destination_currency.asset_code],
              assetQuantity: session.quote.destination_amount,
              providerKey: null,
            },
          });

          setOnRampPurchase(updatedPurchase);
          if (!isEmbedded) {
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                window.close();
              }
            }, 5000);
          }
          break;

        default:
          break;
      }
    },
    [isStripeEmbed],
  );

  useOnrampSessionListener('onramp_ui_loaded', session, onReady);
  useOnrampSessionListener('onramp_session_updated', session, onSessionChange);

  return (
    <OuterContainer>
      <Container isReady={isReady} ref={onrampElementRef} />
      {!isReady && (
        <SpinnerContainer style={{ width: '100%', height: '100%', flex: 1 }}>
          <CpslSpinner size={100} />
        </SpinnerContainer>
      )}
    </OuterContainer>
  );
};

const OuterContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div<{ isReady: boolean }>`
  height: 100%;
  width: 100%;
  display: ${({ isReady }) => (isReady ? 'flex' : 'none')};
  justify-content: center;

  & > iframe {
    height: 100%;
  }
`;
