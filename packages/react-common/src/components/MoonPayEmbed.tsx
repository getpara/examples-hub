import { getNetworkPrefix, OnRampProvider, OnRampPurchaseStatus } from '@getpara/web-sdk';
import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { reverseCurrencyLookup, offRampSend, getCurrencyCode, safeStyled } from '../utils/index.js';
import { OnRampProps } from '../types/index.js';
import type { MoonPayBuyWidget, MoonPaySellWidget } from '@moonpay/moonpay-react';

const MOONPAY_PUBLISHABLE_KEY = 'pk_live_EQva4LydtNDE0Rwd9X7SG9w58wqOzbux';
const MOONPAY_PUBLISHABLE_KEY_TEST = 'pk_test_HYobzemmTBXxcSStVA4dSED6jT';

export const MoonPayEmbed = ({ para, isDark, isEmbedded, onRampConfig, onRampPurchase, setOnRampPurchase }: OnRampProps) => {
  const [LazyMoonPayBuyWidget, setLazyMoonPayBuyWidget] = useState<React.FC<Parameters<typeof MoonPayBuyWidget>[0]>>(null);
  const [LazyMoonPaySellWidget, setLazyMoonPaySellWidget] =
    useState<React.FC<Parameters<typeof MoonPaySellWidget>[0]>>(null);
  const [LazyMoonPayProvider, setLazyMoonPayProvider] = useState(null);

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

    setLazyMoonPayBuyWidget(_LazyMoonPayBuyWidget);
    setLazyMoonPaySellWidget(_LazyMoonPaySellWidget);
    setLazyMoonPayProvider(_LazyMoonPayProvider);
  }, []);

  const apiKey = onRampPurchase.testMode ? MOONPAY_PUBLISHABLE_KEY_TEST : MOONPAY_PUBLISHABLE_KEY;

  const onUrlSignatureRequested = useCallback(
    async (url: string): Promise<string> => {
      if (!para.getUserId() || !onRampPurchase.walletType) {
        throw new Error('missing required fields');
      }
      const res = await para.ctx.client.signMoonPayUrl(para.getUserId()!, {
        url,
        type: onRampPurchase.walletType,
        cosmosPrefix: getNetworkPrefix(onRampPurchase.network),
        testMode: onRampPurchase.testMode,
        walletId: onRampPurchase.walletId || undefined,
        externalWalletAddress: onRampPurchase.externalWalletAddress || undefined,
      });

      return res.data.signature;
    },
    [onRampPurchase.walletId, onRampPurchase.walletType, para.cosmosPrefix, onRampPurchase.testMode, para],
  );

  const onTransactionCompleted = useCallback<Parameters<typeof MoonPayBuyWidget>[0]['onTransactionCompleted']>(
    async payload => {
      try {
        const [network, asset] = reverseCurrencyLookup(
          onRampConfig.assetInfo,
          OnRampProvider.MOONPAY,
          payload.quoteCurrency.code,
        );
        const updated = await para.ctx.client.updateOnRampPurchase({
          userId: para.getUserId(),
          walletId: onRampPurchase.walletId,
          purchaseId: onRampPurchase.id,
          externalWalletAddress: onRampPurchase.externalWalletAddress,
          updates: {
            fiatQuantity: payload.baseCurrencyAmount.toString(),
            fiat: payload.baseCurrency.code,
            network,
            asset,
            assetQuantity: payload.quoteCurrencyAmount.toString(),
            status: OnRampPurchaseStatus.FINISHED,
          },
        });

        setOnRampPurchase(updated);
        if (!isEmbedded) {
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.close();
            }
          }, 5000);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [onRampPurchase.walletId, onRampPurchase.id, onRampPurchase.externalWalletAddress, isEmbedded],
  );

  const onInitiateDeposit = useCallback<Parameters<typeof MoonPaySellWidget>[0]['onInitiateDeposit']>(
    async payload => {
      const txHash = await offRampSend(para, onRampPurchase, setOnRampPurchase, {
        assetQuantity: payload.cryptoCurrencyAmount,
        fiatQuantity: payload.fiatCurrencyAmount || undefined,
        fiat: payload.fiatCurrency.code.toUpperCase(),
        destinationAddress: payload.depositWalletAddress,
        contractAddress: payload.cryptoCurrency.contractAddress,
        chainId: payload.cryptoCurrency.chainId,
      });

      return { depositId: txHash, cancelTransactionOnError: false };
    },
    [
      para,
      onRampPurchase.id,
      onRampPurchase.testMode,
      onRampPurchase.walletId,
      onRampPurchase.walletType,
      setOnRampPurchase,
    ],
  );

  const embed = useMemo(() => {
    if (!LazyMoonPayBuyWidget || !LazyMoonPaySellWidget) {
      return null;
    }

    const currencyCode = getCurrencyCode(onRampConfig, {
      network: onRampPurchase.network,
      asset: onRampPurchase.asset,
      provider: OnRampProvider.MOONPAY,
    });

    return onRampPurchase.type === 'BUY' ? (
      <LazyMoonPayBuyWidget
        variant="embedded"
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
        onUrlSignatureRequested={onUrlSignatureRequested}
      />
    ) : (
      <LazyMoonPaySellWidget
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
        baseCurrencyCode={currencyCode}
        refundWalletAddress={onRampPurchase.address}
        onInitiateDeposit={onInitiateDeposit}
        onTransactionCompleted={onTransactionCompleted}
        onUrlSignatureRequested={onUrlSignatureRequested}
      />
    );
  }, [
    onRampPurchase.type,
    onRampPurchase.address,
    onRampPurchase.walletId,
    onRampPurchase.walletType,
    onRampPurchase.asset,
    onInitiateDeposit,
    onTransactionCompleted,
    onUrlSignatureRequested,
    isDark,
    LazyMoonPayBuyWidget,
    LazyMoonPaySellWidget,
  ]);

  if (!LazyMoonPayProvider) {
    return null;
  }

  return (
    <Container isEmbedded={isEmbedded}>
      <LazyMoonPayProvider apiKey={apiKey} debug={onRampPurchase.testMode}>
        {embed}
      </LazyMoonPayProvider>
    </Container>
  );
};

export default MoonPayEmbed;

const Container = safeStyled.div<{ isEmbedded?: boolean }>`
  width: ${({ isEmbedded }) => (isEmbedded ? '100%' : '100vw')};
  height: ${({ isEmbedded }) => (isEmbedded ? '640px' : '100vh')};

  iframe {
    border: 0 !important;
  }
`;
