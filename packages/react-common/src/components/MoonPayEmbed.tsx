import { OnRampProvider, OnRampPurchaseStatus, WalletType } from '@usecapsule/web-sdk';
import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrencyCodes, reverseCurrencyLookup, offRampSend } from '../utils';
import styled from 'styled-components';
import { Props } from '../types';
import type { MoonPayBuyWidget, MoonPaySellWidget } from '@moonpay/moonpay-react';

const MOONPAY_PUBLISHABLE_KEY = 'pk_live_EQva4LydtNDE0Rwd9X7SG9w58wqOzbux';
const MOONPAY_PUBLISHABLE_KEY_TEST = 'pk_test_HYobzemmTBXxcSStVA4dSED6jT';

const addressKeys = {
  [WalletType.EVM]: 'eth',
  [WalletType.SOLANA]: 'sol',
};

export const MoonPayEmbed = ({ capsule, isDark, isEmbedded, onRampConfig, onRampPurchase, setOnRampPurchase }: Props) => {
  const [LazyMoonPayBuyWidget, setLazyMoonPayBuyWidget] = useState(null);
  const [LazyMoonPaySellWidget, setLazyMoonPaySellWidget] = useState(null);
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
      if (!capsule.getUserId() || !onRampPurchase.walletType) {
        throw new Error('missing required fields');
      }
      const res = await capsule.ctx.capsuleClient.signMoonPayUrl(capsule.getUserId()!, {
        url,
        type: onRampPurchase.walletType,
        cosmosPrefix: capsule.cosmosPrefix,
        testMode: onRampPurchase.testMode,
        walletId: onRampPurchase.walletId || undefined,
        externalWalletAddress: onRampPurchase.externalWalletAddress || undefined,
      });

      return res.data.signature;
    },
    [onRampPurchase.walletId, onRampPurchase.walletType, capsule.cosmosPrefix, onRampPurchase.testMode, capsule],
  );

  const { currencyCodes, defaultCurrencyCode } = useMemo(
    () =>
      getCurrencyCodes(onRampConfig, {
        provider: OnRampProvider.MOONPAY,
        walletType: onRampPurchase.walletType,
        purchaseType: onRampPurchase.type,
      }),
    [onRampPurchase.walletType, onRampPurchase.type, onRampConfig.assetInfo, onRampConfig?.allowedAssets],
  );

  const onTransactionCompleted = useCallback<Parameters<typeof MoonPayBuyWidget>[0]['onTransactionCompleted']>(
    async payload => {
      try {
        const [network, asset] = reverseCurrencyLookup(
          onRampConfig.assetInfo,
          OnRampProvider.MOONPAY,
          payload.quoteCurrency.code,
        );
        const updated = await capsule.ctx.capsuleClient.updateOnRampPurchase({
          userId: capsule.getUserId(),
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
            window.close();
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
      const txHash = await offRampSend(capsule, onRampPurchase, setOnRampPurchase, {
        assetQuantity: payload.cryptoCurrencyAmount,
        fiatQuantity: payload.fiatCurrencyAmount || undefined,
        fiat: payload.fiatCurrency.code.toUpperCase(),
        testMode: onRampPurchase.testMode,
        walletType: onRampPurchase.walletType!,
        destinationAddress: payload.depositWalletAddress,
        contractAddress: payload.cryptoCurrency.contractAddress,
        chainId: payload.cryptoCurrency.chainId,
      });

      return { depositId: txHash };
    },
    [
      capsule,
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

    return onRampPurchase.type === 'BUY' ? (
      <LazyMoonPayBuyWidget
        variant="embedded"
        baseCurrencyCode={onRampPurchase.fiat}
        baseCurrencyAmount={onRampPurchase.fiatQuantity}
        showOnlyCurrencies={currencyCodes.join(',')}
        defaultCurrencyCode={defaultCurrencyCode}
        walletAddresses={JSON.stringify({ [addressKeys[onRampPurchase.walletType]]: onRampPurchase.address })}
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
        refundWalletAddresses={JSON.stringify({ [addressKeys[onRampPurchase.walletType]]: onRampPurchase.address })}
        visible
        theme={isDark ? 'dark' : 'light'}
        style={{
          height: '100%',
          width: '100%',
          border: 'none',
          borderRadius: 0,
          margin: 0,
        }}
        showOnlyCurrencies={currencyCodes.join(',')}
        defaultCurrencyCode={currencyCodes[0]}
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
    currencyCodes,
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

const Container = styled.div<{ isEmbedded?: boolean }>`
  width: ${({ isEmbedded }) => (isEmbedded ? '100%' : '100vw')};
  height: ${({ isEmbedded }) => (isEmbedded ? '640px' : '100vh')};

  iframe {
    border: 0 !important;
  }
`;
