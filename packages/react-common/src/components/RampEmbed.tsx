import { useEffect, useRef } from 'react';
import { RampInstantPurchase, RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { Network, OnRampAsset, OnRampProvider, getPortalBaseURL } from '@usecapsule/web-sdk';
import {
  getChainId,
  getContractAddressFromAsset,
  getCurrencyCodes,
  reverseCurrencyLookup,
  offRampSend,
} from '../utils/index.js';
import { Props } from '../types/index.js';

const TEST_MODE_FORBIDDEN = ['ETH_ETH', 'ETH_USDC'];

export const RampEmbed = ({
  capsule,
  appName,
  onRampConfig,
  onRampPurchase,
  isEmbedded,
  apiKey,
  onClose,
  setOnRampPurchase,
}: Props & { apiKey: string }) => {
  const { currencyCodes } = getCurrencyCodes(onRampConfig, {
    provider: OnRampProvider.RAMP,
    purchaseType: onRampPurchase.type,
    walletType: onRampPurchase.walletType,
  });

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      try {
        const widget = new RampInstantSDK({
          hostAppName: appName,
          swapAsset: currencyCodes.filter(code => !onRampPurchase.testMode || !TEST_MODE_FORBIDDEN.includes(code)).join(','),
          fiatValue: onRampPurchase.fiatQuantity,
          fiatCurrency: onRampPurchase.fiat,
          hostLogoUrl: `${getPortalBaseURL(capsule.ctx)}/wordmark_black.svg`,
          hostApiKey: apiKey,
          userAddress: onRampPurchase.address,
          userEmailAddress: capsule.getEmail(),
          url: onRampPurchase?.testMode ? 'https://app.demo.ramp.network' : 'https://app.ramp.network',
          enabledFlows: [onRampPurchase.type === 'BUY' ? 'ONRAMP' : 'OFFRAMP'],
          useSendCryptoCallback: true,
          variant: 'embedded-mobile',
          containerNode: document.getElementById('ramp-container'),
        })
          .on('PURCHASE_CREATED' as unknown as '*', async e => {
            const p = (e as { payload: { purchase: RampInstantPurchase } }).payload.purchase;

            const [network, asset] = onRampPurchase.testMode
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
                fiat: p.fiatCurrency,
                assetQuantity: p.cryptoAmount,
                asset,
                network,
              },
            });

            setOnRampPurchase(updated);
          })
          .on('WIDGET_CLOSE' as unknown as '*', async () => {
            onClose?.();

            if (!isEmbedded) {
              setTimeout(() => {
                window.close();
              }, 5000);
            }
          })
          .onSendCrypto(async (assetInfo, amount, address) => {
            try {
              const [network, asset] = reverseCurrencyLookup(onRampConfig.assetInfo, OnRampProvider.RAMP, assetInfo.symbol);
              const txHash = await offRampSend(capsule, onRampPurchase, setOnRampPurchase, {
                assetQuantity: amount,
                destinationAddress: address,
                contractAddress: getContractAddressFromAsset(network, asset),
                chainId: getChainId(network),
                testMode: onRampPurchase.testMode,
              });

              return { txHash };
            } catch (e) {
              console.error(e);
            }
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
