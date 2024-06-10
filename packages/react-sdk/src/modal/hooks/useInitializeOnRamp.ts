import {
  OnRampAssetProp,
  OnRampConfigProvider,
  OnRampProvider,
  RampConfig,
  StripeConfig,
  getPortalBaseURL,
  getProvider,
  getProviderAsset,
  getProviderAssetInverse,
} from '@usecapsule/web-sdk';
import { useCapsuleStore, useModalStore, useThemeStore } from '../stores/index.js';
import { RampInstantPurchase, RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { ModalStep } from '../utils/steps.js';
import { useGoBack } from './useGoBack.js';

const isRamp = (provider: OnRampConfigProvider): provider is RampConfig => {
  return getProvider(provider.id) === OnRampProvider.RAMP;
};

const isStripe = (provider: OnRampConfigProvider): provider is StripeConfig => {
  return getProvider(provider.id) === OnRampProvider.STRIPE;
};

// const isDecent = (config: OnRampConfig): config is DecentConfig => {
//   return config.provider === OnRampProvider.DECENT;
// }

export function useInitializeOnRamp(provider: OnRampConfigProvider, assetProp: OnRampAssetProp, testMode = false) {
  const goBack = useGoBack();
  const capsule = useCapsuleStore((state) => state.capsule);
  const appName = useThemeStore((state) => state.appName);
  const setStep = useModalStore((state) => state.setStep);
  const setOnRampPurchase = useModalStore((state) => state.setOnRampPurchase);
  const setRampWidget = useModalStore((state) => state.setRampWidget);

  return async () => {
    const [newOnRampPurchase, address] = await capsule.createOnRampPurchase(provider.id, assetProp, testMode);
    setOnRampPurchase(newOnRampPurchase);

    if (isRamp(provider)) {
      // Ramp
      const { hostApiKey } = provider;

      const widget = new RampInstantSDK({
        hostAppName: appName,
        defaultAsset: getProviderAsset(provider.id, assetProp, testMode),
        hostLogoUrl: `${getPortalBaseURL(capsule.ctx)}/wordmark_black.svg`,
        hostApiKey,
        userAddress: address,
        userEmailAddress: capsule.getEmail(),
        url: testMode ? 'https://app.demo.ramp.network' : 'https://app.ramp.network',
        enabledFlows: ['ONRAMP'],
      })
        .on('PURCHASE_CREATED' as unknown as '*', async (e) => {
          const p = (e as { payload: { purchase: RampInstantPurchase } }).payload.purchase;

          const updated = await capsule.updateOnRampPurchase(newOnRampPurchase.id, {
            providerKey: p.id,
            fiatQuantity: p.fiatValue,
            fiatCurrency: p.fiatCurrency,
            asset: getProviderAssetInverse('RAMP', p.asset.symbol, testMode),
            assetQuantity: p.cryptoAmount,
          });

          setOnRampPurchase(updated);
        })
        .on('WIDGET_CLOSE' as unknown as '*', async () => {
          goBack();
        });

      setRampWidget(widget);
      widget.show();

      widget.domNodes.overlay.style.zIndex = '2147483647';
      widget.domNodes.overlay.style.height = 'calc(100vh - 48px)';
    } else if (isStripe(provider)) {
      // Stripe
    } else {
      // Decent
      //   const popupWidth = 600;
      //   const popupHeight = 600;
      //   const left = (window.innerWidth - popupWidth) / 2;
      //   const top = (window.innerHeight - popupHeight) / 2;
      //   const decent = window.open(
      //     `https://checkout.decent.xyz?wallet=${address}&app=onramp`,
      //     'DecentCheckout',
      //     `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
      //   );
      //   const interval = window.setInterval(function () {
      //     try {
      //       if (decent == null || decent.closed) {
      //         window.clearInterval(interval);
      //         setStep(ModalStep.ADD_FUNDS);
      //       }
      //     } catch (e) {}
      //   }, 1000);
    }

    setStep(ModalStep.ADD_FUNDS_AWAITING);
  };
}
