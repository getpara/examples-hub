import { OnRampProvider } from '@getpara/web-sdk';
import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { reverseCurrencyLookup, getCurrencyCode, safeStyled } from '../utils/index.js';
import { OnRampProps } from '../types/index.js';
import type { MoonPayProvider, MoonPayBuyWidget, MoonPaySellWidget } from '@moonpay/moonpay-react';

const MOONPAY_PUBLISHABLE_KEY = 'pk_live_EQva4LydtNDE0Rwd9X7SG9w58wqOzbux';
const MOONPAY_PUBLISHABLE_KEY_TEST = 'pk_test_HYobzemmTBXxcSStVA4dSED6jT';

type Components = {
  MoonPayBuyWidget: React.FC<Parameters<typeof MoonPayBuyWidget>[0]>;
  MoonPaySellWidget: React.FC<Parameters<typeof MoonPaySellWidget>[0]>;
  MoonPayProvider: React.FC<Parameters<typeof MoonPayProvider>[0]>;
};

export const MoonPayEmbed = ({
  email,
  isDark,
  isEmbedded,
  onRampConfig,
  onRampPurchase,
  onSuccess,
  onDepositRequest,
  onUrlSignatureRequest,
}: OnRampProps & {
  onUrlSignatureRequest: (url: string) => Promise<string>;
}) => {
  const [components, setComponents] = useState<Components | null>(null);

  useEffect(() => {
    const _LazyMoonPayBuyWidget = lazy(() =>
      import('@moonpay/moonpay-react').then(mod => ({ default: mod.MoonPayBuyWidget })),
    );
    const _LazyMoonPaySellWidget = lazy(() =>
      import('@moonpay/moonpay-react').then(mod => ({ default: mod.MoonPaySellWidget })),
    );
    const _LazyMoonPayProvider = lazy(() =>
      import('@moonpay/moonpay-react').then(mod => ({ default: mod.MoonPayProvider })),
    );

    setComponents({
      MoonPayBuyWidget: _LazyMoonPayBuyWidget,
      MoonPaySellWidget: _LazyMoonPaySellWidget,
      MoonPayProvider: _LazyMoonPayProvider,
    });
  }, []);

  const apiKey = onRampPurchase.testMode ? MOONPAY_PUBLISHABLE_KEY_TEST : MOONPAY_PUBLISHABLE_KEY;

  const onTransactionCompleted = useCallback(
    async (payload: Parameters<Parameters<typeof MoonPayBuyWidget>[0]['onTransactionCompleted']>[0]) => {
      try {
        const [network, asset] = reverseCurrencyLookup(
          onRampConfig.assetInfo,
          OnRampProvider.MOONPAY,
          payload.quoteCurrency.code,
        );

        onSuccess({
          fiatQuantity: payload.baseCurrencyAmount.toString(),
          fiat: payload.baseCurrency.code,
          network,
          asset,
          assetQuantity: payload.quoteCurrencyAmount.toString(),
        });
      } catch (e) {
        throw e instanceof Error ? e : new Error(e);
      }
    },
    [onRampConfig],
  );

  const onInitiateDeposit = useCallback(
    async (payload: Parameters<Parameters<typeof MoonPaySellWidget>[0]['onInitiateDeposit']>[0]) => {
      try {
        const txHash = await onDepositRequest({
          assetQuantity: payload.cryptoCurrencyAmount,
          fiatQuantity: payload.fiatCurrencyAmount || undefined,
          fiat: payload.fiatCurrency.code.toUpperCase(),
          destinationAddress: payload.depositWalletAddress,
          contractAddress: payload.cryptoCurrency.contractAddress,
          chainId: payload.cryptoCurrency.chainId,
        });

        return { depositId: txHash, cancelTransactionOnError: false };
      } catch (e) {
        throw e instanceof Error ? e : new Error(e);
      }
    },
    [],
  );

  const embed = useMemo(() => {
    if (!components) {
      return null;
    }

    const currencyCode = getCurrencyCode(onRampConfig, {
      network: onRampPurchase.network,
      asset: onRampPurchase.asset,
      provider: OnRampProvider.MOONPAY,
    });

    return (
      <components.MoonPayProvider apiKey={apiKey} debug={onRampPurchase.testMode}>
        {onRampPurchase.type === 'BUY' ? (
          <components.MoonPayBuyWidget
            variant="embedded"
            email={email}
            baseCurrencyCode={onRampPurchase.fiat}
            baseCurrencyAmount={onRampPurchase.fiatQuantity}
            currencyCode={currencyCode}
            walletAddress={onRampPurchase.address}
            visible
            theme={isDark ? 'dark' : 'light'}
            style={{
              height: '100%',
              width: '100%',
              border: 'none',
              borderRadius: 0,
              margin: 0,
            }}
            onTransactionCompleted={onTransactionCompleted}
            onUrlSignatureRequested={onUrlSignatureRequest}
          />
        ) : (
          <components.MoonPaySellWidget
            variant="embedded"
            visible
            theme={isDark ? 'dark' : 'light'}
            style={{
              height: '100%',
              width: '100%',
              border: 'none',
              borderRadius: 0,
              margin: 0,
            }}
            email={email}
            baseCurrencyCode={currencyCode}
            quoteCurrencyAmount={onRampPurchase.fiatQuantity}
            refundWalletAddress={onRampPurchase.address}
            onInitiateDeposit={onInitiateDeposit}
            onTransactionCompleted={onTransactionCompleted}
            onUrlSignatureRequested={onUrlSignatureRequest}
          />
        )}
      </components.MoonPayProvider>
    );
  }, [
    apiKey,
    email,
    onRampPurchase.type,
    onRampPurchase.address,
    onRampPurchase.walletId,
    onRampPurchase.walletType,
    onRampPurchase.asset,
    onRampPurchase.testMode,
    onTransactionCompleted,
    isDark,
    components,
  ]);

  return <Container isEmbedded={isEmbedded}>{embed}</Container>;
};

export default MoonPayEmbed;

const Container = safeStyled.div<{ isEmbedded?: boolean }>`
  width: ${({ isEmbedded }) => (isEmbedded ? '100%' : '100vw')};
  height: ${({ isEmbedded }) => (isEmbedded ? '640px' : '100vh')};

  iframe {
    border: 0 !important;
  }
`;
