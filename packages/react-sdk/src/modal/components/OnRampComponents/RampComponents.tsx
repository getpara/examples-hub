import { useEffect, useRef } from 'react';
import { RampInstantPurchase, RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { Network, OnRampAsset, OnRampProvider, getPortalBaseURL } from '@usecapsule/web-sdk';
import { useCapsuleStore, useModalStore, useThemeStore } from '../../stores/index.js';
import { useGoBack } from '../../hooks/useGoBack.js';
import { getCurrencyCodes, reverseCurrencyLookup } from '../../utils/onRamps.js';

const TEST_MODE_FORBIDDEN = ['ETH_ETH', 'ETH_USDC'];

export const RampEmbed = ({ hostApiKey }: { hostApiKey: string }) => {
  const appName = useThemeStore(state => state.appName);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const onRampPurchase = useModalStore(state => state.onRampPurchase);
  const setOnRampPurchase = useModalStore(state => state.setOnRampPurchase);
  const capsule = useCapsuleStore(state => state.capsule);
  const goBack = useGoBack();
  const { currencyCodes } = getCurrencyCodes(onRampConfig, {
    provider: OnRampProvider.RAMP,
    walletType: onRampPurchase.walletType,
  });

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      try {
        const widget = new RampInstantSDK({
          hostAppName: appName,
          swapAsset: currencyCodes.filter(code => !onRampConfig.testMode || !TEST_MODE_FORBIDDEN.includes(code)).join(','),
          fiatValue: onRampPurchase.fiatQuantity,
          fiatCurrency: onRampPurchase.fiatCurrency,
          hostLogoUrl: `${getPortalBaseURL(capsule.ctx)}/wordmark_black.svg`,
          hostApiKey,
          userAddress: onRampPurchase.address,
          userEmailAddress: capsule.getEmail(),
          url: onRampConfig?.testMode ? 'https://app.demo.ramp.network' : 'https://app.ramp.network',
          enabledFlows: ['ONRAMP'],
          variant: 'embedded-mobile',
          containerNode: document.getElementById('ramp-container'),
        })
          .on('PURCHASE_CREATED' as unknown as '*', async e => {
            const p = (e as { payload: { purchase: RampInstantPurchase } }).payload.purchase;

            const [network, asset] = onRampConfig.testMode
              ? [Network.ETHEREUM, OnRampAsset.ETHEREUM]
              : reverseCurrencyLookup(onRampConfig.assetInfo, OnRampProvider.RAMP, p.asset.symbol) || [];

            const updated = await capsule.ctx.capsuleClient.updateOnRampPurchase({
              userId: capsule.getUserId(),
              walletId: onRampPurchase.walletId,
              externalWalletAddress: onRampPurchase.externalWalletAddress,
              purchaseId: onRampPurchase.id,
              updates: {
                providerKey: p.id,
                fiatQuantity: p.fiatValue,
                fiatCurrency: p.fiatCurrency,
                assetQuantity: p.cryptoAmount,
                asset,
                network,
              },
            });

            setOnRampPurchase(updated);
          })
          .on('WIDGET_CLOSE' as unknown as '*', async () => {
            goBack();
          });

        widget.show();
        isMounted.current = true;
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return <div id="ramp-container" style={{ minWidth: '320px', width: '100%', height: '767px' }} />;
};
