import { useEffect } from 'react';
import { AddingFunds } from './AddingFunds.js';
import { RampInstantPurchase, RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import {
  OnRampProvider,
  getPortalBaseURL,
  getProviderAssetInverse,
  getProviderNetworkAndAssetCode,
} from '@usecapsule/web-sdk';
import { useCapsuleStore, useModalStore, useThemeStore } from '../../stores/index.js';
import { useGoBack } from '../../hooks/useGoBack.js';
import { useActiveWallet } from '../../hooks/useActiveWallet.js';

export const RampEmbed = ({ hostApiKey }: { hostApiKey: string }) => {
  const appName = useThemeStore(state => state.appName);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const onRampPurchase = useModalStore(state => state.onRampPurchase);
  const setOnRampPurchase = useModalStore(state => state.setOnRampPurchase);
  const capsule = useCapsuleStore(state => state.capsule);
  const goBack = useGoBack();
  const activeWallet = useActiveWallet();

  useEffect(() => {
    const defaultAsset = getProviderNetworkAndAssetCode(
      onRampConfig.network,
      onRampConfig.asset,
      OnRampProvider.RAMP,
      onRampConfig.testMode,
    )[0];

    const widget = new RampInstantSDK({
      hostAppName: appName,
      defaultAsset,
      hostLogoUrl: `${getPortalBaseURL(capsule.ctx)}/wordmark_black.svg`,
      hostApiKey,
      userAddress: capsule.getDisplayAddress(activeWallet.id, { addressType: activeWallet.type }),
      userEmailAddress: capsule.getEmail(),
      url: onRampConfig?.testMode ? 'https://app.demo.ramp.network' : 'https://app.ramp.network',
      enabledFlows: ['ONRAMP'],
    })
      .on('PURCHASE_CREATED' as unknown as '*', async e => {
        const p = (e as { payload: { purchase: RampInstantPurchase } }).payload.purchase;

        const updated = await capsule.updateOnRampPurchase({
          walletId: onRampPurchase.walletId,
          externalWalletAddress: onRampPurchase.externalWalletAddress,
          purchaseId: onRampPurchase.id,
          updates: {
            providerKey: p.id,
            fiatQuantity: p.fiatValue,
            fiatCurrency: p.fiatCurrency,
            asset: getProviderAssetInverse(OnRampProvider.RAMP, p.asset.symbol),
            assetQuantity: p.cryptoAmount,
          },
        });

        setOnRampPurchase(updated);
      })
      .on('WIDGET_CLOSE' as unknown as '*', async () => {
        goBack();
      });

    widget.show();

    widget.domNodes.overlay.style.zIndex = '2147483647';
  }, []);

  return <AddingFunds />;
};
