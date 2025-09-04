import { useEffect, useRef } from 'react';
import { RampInstantPurchase, RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { TNetwork, TOnRampAsset, OnRampProvider } from '@getpara/web-sdk';
import { getChainId, getContractAddressFromAsset, getCurrencyCodes, reverseCurrencyLookup } from '../utils/index.js';
import { OnRampProps } from '../types/index.js';

const TEST_MODE_FORBIDDEN = ['ETH_ETH', 'ETH_USDC'];

export const RampEmbed = ({
  appName,
  email,
  onRampConfig,
  onRampPurchase,
  isEmbedded,
  apiKey,
  onClose,
  onUpdate,
  onDepositRequest,
}: OnRampProps & { apiKey: string }) => {
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
          hostLogoUrl: `${window.location.hostname}/wordmark_black.svg`,
          hostApiKey: apiKey,
          userAddress: onRampPurchase.address,
          userEmailAddress: email,
          url: onRampPurchase?.testMode ? 'https://app.demo.ramp.network' : 'https://app.ramp.network',
          enabledFlows: [onRampPurchase.type === 'BUY' ? 'ONRAMP' : 'OFFRAMP'],
          useSendCryptoCallback: true,
          variant: 'embedded-mobile',
          containerNode: document.getElementById('ramp-container'),
        })
          .on('PURCHASE_CREATED' as unknown as '*', async e => {
            const p = (e as { payload: { purchase: RampInstantPurchase } }).payload.purchase;

            const [network, asset] = onRampPurchase.testMode
              ? ['ETHEREUM' as TNetwork, 'ETHEREUM' as TOnRampAsset]
              : reverseCurrencyLookup(onRampConfig.assetInfo, OnRampProvider.RAMP, p.asset.symbol) || [];

            onUpdate({
              providerKey: p.id,
              fiatQuantity: p.fiatValue,
              fiat: p.fiatCurrency,
              assetQuantity: p.cryptoAmount,
              asset,
              network,
            });
          })
          .on('WIDGET_CLOSE' as unknown as '*', async () => {
            onClose?.();

            if (!isEmbedded) {
              setTimeout(() => {
                if (typeof window !== 'undefined') {
                  window.close();
                }
              }, 5000);
            }
          })
          .onSendCrypto(async (assetInfo, amount, address) => {
            try {
              const [network, asset] = reverseCurrencyLookup(onRampConfig.assetInfo, OnRampProvider.RAMP, assetInfo.symbol);

              const txHash = await onDepositRequest({
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
