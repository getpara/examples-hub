import { OnRampProvider, OnRampPurchaseStatus, WalletType } from '@usecapsule/web-sdk';
import { useCapsuleStore, useModalStore, useThemeStore } from '../../stores/index.js';
import { MoonPayBuyWidget, MoonPayProvider } from '@moonpay/moonpay-react';
import { useCallback, useMemo } from 'react';
import { getCurrencyCodes, reverseCurrencyLookup } from '../../utils/onRamps.js';

const MOONPAY_PUBLISHABLE_KEY = 'pk_live_EQva4LydtNDE0Rwd9X7SG9w58wqOzbux';
const MOONPAY_PUBLISHABLE_KEY_TEST = 'pk_test_HYobzemmTBXxcSStVA4dSED6jT';

const addressKeys = {
  [WalletType.EVM]: 'eth',
  [WalletType.SOLANA]: 'sol',
};

export const MoonPayEmbed = () => {
  const isDark = useThemeStore(state => state.isDark);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const onRampPurchase = useModalStore(state => state.onRampPurchase);
  const setOnRampPurchase = useModalStore(state => state.setOnRampPurchase);
  const capsule = useCapsuleStore(state => state.capsule);
  const apiKey = onRampConfig.testMode ? MOONPAY_PUBLISHABLE_KEY_TEST : MOONPAY_PUBLISHABLE_KEY;

  const onUrlSignatureRequested = useCallback(
    async (url: string): Promise<string> => {
      const res = await capsule.ctx.capsuleClient.signMoonPayUrl(capsule.getUserId(), {
        url,
        type: onRampPurchase.walletType,
        cosmosPrefix: capsule.cosmosPrefix,
        testMode: onRampConfig.testMode,
        walletId: onRampPurchase.walletId,
        externalWalletAddress: onRampPurchase.externalWalletAddress,
      });

      return res.data.signature;
    },
    [onRampPurchase.walletId, onRampPurchase.walletType, capsule.cosmosPrefix, onRampConfig.testMode, capsule],
  );

  const { currencyCodes, defaultCurrencyCode } = useMemo(
    () =>
      getCurrencyCodes(onRampConfig, {
        provider: OnRampProvider.MOONPAY,
        walletType: onRampPurchase.walletType,
      }),
    [onRampPurchase.walletType, onRampConfig.assetInfo, onRampConfig?.allowedAssets],
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
            fiatCurrency: payload.baseCurrency.code,
            network,
            asset,
            assetQuantity: payload.quoteCurrencyAmount.toString(),
            status: OnRampPurchaseStatus.FINISHED,
          },
        });

        setOnRampPurchase(updated);
      } catch (e) {
        console.error(e);
      }
    },
    [onRampPurchase.walletId, onRampPurchase.id, onRampPurchase.externalWalletAddress],
  );

  const embed = useMemo(() => {
    return (
      <MoonPayBuyWidget
        variant="embedded"
        baseCurrencyCode={onRampPurchase.fiatCurrency}
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
    );
  }, [onRampPurchase.address, onRampPurchase.walletId, onRampPurchase.walletType, onTransactionCompleted, isDark]);

  return (
    <div style={{ height: '640px', width: '100%' }}>
      <MoonPayProvider apiKey={apiKey} debug={onRampConfig.testMode}>
        {embed}
      </MoonPayProvider>
    </div>
  );
};

export default MoonPayEmbed;
